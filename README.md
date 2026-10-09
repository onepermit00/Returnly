# Returnly

Track purchases, return deadlines and refunds. Scan a receipt, tap what you're returning, and Returnly reminds you until the money is back.

## Run locally

Requires Node.js 22 or newer.

```sh
npm install
npm start
```

Open http://127.0.0.1:4174/. Without `DATABASE_URL`, accounts are saved to `data/dev-store.json` (git-ignored) so sign up and sign in work locally. Set `PORT` to use another port.

```sh
npm test
```

## Accounts

- `server.js` serves the app and a JSON API under `/api`: `signup`, `login`, `logout`, `me`, `data` (GET/PUT) and `account` (DELETE, needs the password).
- Passwords are hashed with scrypt. Sessions are random tokens in an HttpOnly, SameSite=Lax cookie (Secure in production); only a SHA-256 of each token is stored. Sessions last 30 days.
- Each account's purchases, reminders and profile are one JSON document in Postgres (`user_data`). The app keeps a copy in the browser and uploads changes in the background; the last write wins. Signing in on another device downloads that copy.
- Sign-in is rate limited per IP, and an email is locked for 15 minutes after 10 wrong passwords. Writes must be same-origin JSON.
- Not built yet: password reset by email (needs an email service), sign-in with Google or Apple, and photo storage outside the database (photos are saved inside the account's JSON, up to 12 MB per save).

## Deploy on Render

`render.yaml` is a Blueprint for a Node web service plus a Postgres database. In Render choose **New → Blueprint**, pick this repository and apply. `DATABASE_URL` is wired from the database automatically and the server refuses to start in production without it. Render's free Postgres expires after 30 days; move it to a paid plan before real users rely on it.

## Project layout

- `index.html`, `landing.css`: home page with Sign in / Sign up.
- `signin.html`, `signup.html`, `auth.js`: account pages.
- `account.js`: sign-in gate for the app and background sync.
- `app.html` and its scripts: `app.js`, `features.js`, `klarna.js`, `precision.js`, `guided.js` (four-step return journey), `menu.js` (side menu, History, Settings, Support).
- `core.js`: date, eligibility and calendar logic.
- `server.js`, `server/`: account API, database access and static file server. Only top-level app files and `assets/` are publicly served.
- `tests/`: automated tests (`npm test`).
- `docs/`: product and design notes.

## Current limits

Receipt reading (OCR), automatic return-policy research, SMS and background push are not connected. Deadlines are estimates until the user confirms the retailer's policy. The Terms of service page is a draft and needs review before launch.
