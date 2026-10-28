const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function entry(mode,{fail,providers={google:false,apple:false},search=''}={}){
  const listeners={},store=new Map(),calls=[];
  const values={name:'Alex',email:'alex@example.com',password:'password123',time:'10:30'};
  const el=k=>({get value(){return values[k]},set value(v){values[k]=v}});
  const form={elements:{name:el('name'),email:el('email'),password:el('password'),time:el('time'),daily:{checked:true}},addEventListener(n,fn){listeners[n]=fn},querySelector:()=>({disabled:false,textContent:''})};
  const stage={innerHTML:'',querySelector:s=>stage.innerHTML.includes('href="/api/auth/')?{}:null,insertAdjacentHTML(w,h){stage.innerHTML+=h}},error={textContent:''},location={href:'',search,replace(u){this.href=u}};
  const Account={user:()=>null,api:async()=>({}),clearLocal(){},
    async signIn(x){calls.push(['signIn',x]);if(fail)throw new Error(fail)},
    async signUp(x){calls.push(['signUp',x]);if(fail)throw new Error(fail)},
    async flush(){calls.push(['flush'])},
    async adoptSession(){calls.push(['adoptSession'])}};
  const context={Account,document:{body:{dataset:{mode}},querySelector:s=>s==='#local-entry'?form:s==='#auth-content'?stage:error,addEventListener(){}},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},location,URLSearchParams,fetch:async()=>({json:async()=>providers})};
  vm.runInNewContext(fs.readFileSync('auth.js','utf8'),context);
  return {values,calls,stage,error,location,store,submit:()=>listeners.submit({preventDefault(){}})};
}
test('sign in sends email and password, then opens the dashboard',async()=>{const x=entry('signin');await x.submit();assert.deepEqual(JSON.parse(JSON.stringify(x.calls[0])),['signIn',{email:'alex@example.com',password:'password123'}]);assert.equal(x.location.href,'app.html')});
test('sign up asks for a name, then email and password, creates the account and opens the app',async()=>{const x=entry('signup');assert.match(x.stage.innerHTML,/call you/);await x.submit();assert.equal(x.calls.length,0);assert.match(x.stage.innerHTML,/2 of 2/);await x.submit();assert.deepEqual(JSON.parse(JSON.stringify(x.calls[0])),['signUp',{name:'Alex',email:'alex@example.com',password:'password123'}]);assert.deepEqual(JSON.parse(JSON.stringify(x.calls[1])),['flush']);assert.equal(x.location.href,'app.html')});
test('short passwords are caught before contacting the server',async()=>{const x=entry('signup');x.values.password='short';await x.submit();await x.submit();assert.equal(x.calls.length,0);assert.match(x.error.textContent,/8 characters/)});
test('server errors are shown to the user',async()=>{const x=entry('signin',{fail:'Email or password is incorrect.'});await x.submit();assert.equal(x.error.textContent,'Email or password is incorrect.');assert.equal(x.location.href,'')});
test('Apple and Google show only when the server has them set up',async()=>{const none=entry('signin');await new Promise(r=>setTimeout(r));assert.doesNotMatch(none.stage.innerHTML,/api\/auth/);const x=entry('signin',{providers:{google:true,apple:true}});await new Promise(r=>setTimeout(r));const h=x.stage.innerHTML;assert.match(h,/href="\/api\/auth\/google\/start">Google/);assert.match(h,/href="\/api\/auth\/apple\/start">Apple/);const up=entry('signup',{providers:{google:true,apple:false}});await new Promise(r=>setTimeout(r));await up.submit();assert.match(up.stage.innerHTML,/api\/auth\/google/);assert.doesNotMatch(up.stage.innerHTML,/api\/auth\/apple/)});
test('coming back from Google or Apple loads the account, and a failed sign-in says why',async()=>{const x=entry('signin',{search:'?signed-in=google'});await new Promise(r=>setTimeout(r));assert.deepEqual(x.calls.map(c=>c[0]),['adoptSession']);assert.equal(x.location.href,'app.html');const y=entry('signin',{search:'?error=email'});assert.match(y.error.textContent,/verified email/)});
