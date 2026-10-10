/* Account storage. Postgres when DATABASE_URL is set (production on Render); a JSON file for local development. */
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const SCHEMA = `
create table if not exists users (
  id uuid primary key,
  email text not null unique,
  name text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);
create table if not exists sessions (
  token_hash text primary key,
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null
);
create index if not exists sessions_user_idx on sessions(user_id);
create table if not exists user_data (
  user_id uuid primary key references users(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);`;

function pgStore(connectionString) {
  const { Pool } = require('pg');
  // Render's internal connection string needs no TLS; its external one (*.render.com) does.
  const ssl = /\.render\.com/.test(connectionString) ? { rejectUnauthorized: false } : false;
  const pool = new Pool({ connectionString, ssl, max: 5 });
  const one = async (sql, params) => (await pool.query(sql, params)).rows[0] || null;
  return {
    async init() { await pool.query(SCHEMA); },
    async createUser({ email, name, passwordHash }) {
      const id = crypto.randomUUID();
      try {
        return await one('insert into users (id, email, name, password_hash) values ($1,$2,$3,$4) returning id, email, name', [id, email, name, passwordHash]);
      } catch (err) {
        if (err.code === '23505') throw Object.assign(new Error('exists'), { code: 'EXISTS' });
        throw err;
      }
    },
    findUserByEmail: email => one('select id, email, name, password_hash as "passwordHash" from users where email=$1', [email]),
    findUserById: id => one('select id, email, name from users where id=$1', [id]),
    async createSession(userId, tokenHash, expiresAt) { await pool.query('insert into sessions (token_hash, user_id, expires_at) values ($1,$2,$3)', [tokenHash, userId, expiresAt]); },
    findSession: tokenHash => one('select user_id as "userId", expires_at as "expiresAt" from sessions where token_hash=$1', [tokenHash]),
    async deleteSession(tokenHash) { await pool.query('delete from sessions where token_hash=$1', [tokenHash]); },
    async getData(userId) {
      const row = await one('select payload, updated_at as "updatedAt" from user_data where user_id=$1', [userId]);
      return row ? { ...row.payload, updatedAt: new Date(row.updatedAt).toISOString() } : null;
    },
    async putData(userId, payload) {
      const row = await one(`insert into user_data (user_id, payload, updated_at) values ($1,$2,now())
        on conflict (user_id) do update set payload=excluded.payload, updated_at=now() returning updated_at as "updatedAt"`, [userId, payload]);
      return new Date(row.updatedAt).toISOString();
    },
    async deleteUser(userId) { await pool.query('delete from users where id=$1', [userId]); },
    async close() { await pool.end(); }
  };
}

function fileStore(file) {
  let db = null, queue = Promise.resolve();
  const load = async () => {
    if (db) return db;
    try { db = JSON.parse(await fs.readFile(file, 'utf8')); } catch { db = { users: {}, sessions: {}, data: {} }; }
    return db;
  };
  // Serialise writes so concurrent requests can't interleave partial files.
  const persist = () => (queue = queue.then(async () => {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file + '.tmp', JSON.stringify(db));
    await fs.rename(file + '.tmp', file);
  }));
  const publicUser = u => u && { id: u.id, email: u.email, name: u.name };
  return {
    async init() { await load(); },
    async createUser({ email, name, passwordHash }) {
      await load();
      if (Object.values(db.users).some(u => u.email === email)) throw Object.assign(new Error('exists'), { code: 'EXISTS' });
      const user = { id: crypto.randomUUID(), email, name, passwordHash, createdAt: new Date().toISOString() };
      db.users[user.id] = user; await persist();
      return publicUser(user);
    },
    async findUserByEmail(email) { await load(); return Object.values(db.users).find(u => u.email === email) || null; },
    async findUserById(id) { await load(); return publicUser(db.users[id]) || null; },
    async createSession(userId, tokenHash, expiresAt) { await load(); db.sessions[tokenHash] = { userId, expiresAt: expiresAt.toISOString() }; await persist(); },
    async findSession(tokenHash) { await load(); const s = db.sessions[tokenHash]; return s ? { userId: s.userId, expiresAt: new Date(s.expiresAt) } : null; },
    async deleteSession(tokenHash) { await load(); delete db.sessions[tokenHash]; await persist(); },
    async getData(userId) { await load(); return db.data[userId] ? { ...db.data[userId] } : null; },
    async putData(userId, payload) { await load(); const updatedAt = new Date().toISOString(); db.data[userId] = { ...payload, updatedAt }; await persist(); return updatedAt; },
    async deleteUser(userId) {
      await load();
      delete db.users[userId]; delete db.data[userId];
      for (const [k, s] of Object.entries(db.sessions)) if (s.userId === userId) delete db.sessions[k];
      await persist();
    },
    async close() { await queue; }
  };
}

function createStore({ databaseUrl, file }) {
  return databaseUrl ? pgStore(databaseUrl) : fileStore(file);
}

module.exports = { createStore };
