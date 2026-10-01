const cfg=window.NIGAR_CONFIG||{};
let supabaseClient=null, session=null, currentCustomer=null;
const $=id=>document.getElementById(id);
const main=$("main");

function toast(t){const x=$("toast");x.textContent=t;x.style.display="block";setTimeout(()=>x.style.display="none",2500)}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function money(v){return "₹"+Number(v||0).toLocaleString("en-IN")}

async function init(){
  if(!cfg.SUPABASE_URL||cfg.SUPABASE_URL.includes("YOUR-PROJECT")) return;
  supabaseClient=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
  const r=await supabaseClient.auth.getSession(); session=r.data.session;
  if(session) showApp(); else showLogin();
  supabaseClient.auth.onAuthStateChange((_e,s)=>{session=s;s?showApp():showLogin()});
}
function showLogin(){$("loginView").classList.remove("hidden");$("appView").classList.add("hidden");$("logoutBtn").classList.add("hidden")}
function showApp(){$("loginView").classList.add("hidden");$("appView").classList.remove("hidden");$("logoutBtn").classList.remove("hidden");loadPage("dashboard")}
async function login(){
  if(!supabaseClient){$("loginMsg").textContent="First set Supabase URL and publishable key in config.js.";return}
  const {error}=await supabaseClient.auth.signInWithPassword({email:$("email").value,password:$("password").value});
  $("loginMsg").textContent=error?error.message:"";
}
$("loginBtn").onclick=login;
$("logoutBtn").onclick=()=>supabaseClient.auth.signOut();
$("menuBtn").onclick=()=>$("sidebar").classList.toggle("open");
document.querySelectorAll(".sidebar button").forEach(b=>b.onclick=()=>{loadPage(b.dataset.page);$("sidebar").classList.remove("open")});

async function loadPage(page){
  document.querySelectorAll(".sidebar button").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  const pages={dashboard,customers,nominee,idproof,address,payments,passbook,receipts,whatsapp,ledger,reports,staff};
  main.innerHTML="<div class='card'>Loading…</div>";
  try{await pages[page]()}catch(e){main.innerHTML=`<div class="card"><b>Error:</b> ${esc(e.message)}</div>`}
}

async function dashboard(){
  let customers=0,payments=0;
  if(supabaseClient){
    const a=await supabaseClient.from("customers").select("*",{count:"exact",head:true});
    customers=a.count||0;
    const b=await supabaseClient.from("payments").select("amount");
    if(!b.error) payments=(b.data||[]).reduce((s,x)=>s+Number(x.amount||0),0);
  }
  main.innerHTML=`<div class="page-title"><h1>Dashboard</h1><span class="badge">${esc(session?.user?.email||"Staff")}</span></div>
  <div class="grid"><div class="stat">👤 Customers<b>${customers}</b></div><div class="stat">💰 Total Payments<b>${money(payments)}</b></div>
  <div class="stat">📖 Passbooks<b>Ready</b></div><div class="stat">📊 Reports<b>Ready</b></div></div>
  <div class="section card"><h3>NIGAR Gems & Jewellers</h3><p>Gold Savings Business System. Existing Supabase data is not deleted by this interface.</p></div>`;
}

async function customers(){
  main.innerHTML=`<div class="page-title"><h1>👤 Customer Profile</h1><button class="primary" onclick="newCustomer()">+ Add Customer</button></div>
  <div class="card"><input id="custSearch" class="search" placeholder="Search name / phone" oninput="renderCustomers()"></div><div id="custTable"></div>`;
  await renderCustomers();
}
async function renderCustomers(){
  const r=await supabaseClient.from("customers").select("*").order("created_at",{ascending:false}).limit(100);
  if(r.error){$("custTable").innerHTML=`<div class="card">${esc(r.error.message)}</div>`;return}
  const q=($("custSearch")?.value||"").toLowerCase();
  const rows=(r.data||[]).filter(x=>`${x.name||x.full_name||""} ${x.phone||x.mobile||""}`.toLowerCase().includes(q));
  $("custTable").innerHTML=`<div class="table-wrap"><table class="table"><tr><th>Name</th><th>Phone</th><th>Nominee</th><th>ID</th><th>Action</th></tr>
  ${rows.map(x=>`<tr><td>${esc(x.name||x.full_name)}</td><td>${esc(x.phone||x.mobile)}</td><td>${esc(x.nominee_name)}</td><td>${esc(x.id_proof_number)}</td><td><button class="secondary" onclick='selectCustomer(${JSON.stringify(x).replace(/'/g,"&#39;")})'>Open</button></td></tr>`).join("")}</table></div>`;
}
window.selectCustomer=x=>{currentCustomer=x;loadPage("passbook")};
window.newCustomer=()=>{main.innerHTML=`<div class="page-title"><h1>New Customer</h1></div><div class="card form">
<input id="n_name" placeholder="Customer name"><input id="n_phone" placeholder="Mobile number"><input id="n_nominee" placeholder="Nominee name"><input id="n_relation" placeholder="Nominee relation"><input id="n_id" placeholder="ID proof number"><textarea id="n_address" class="full" placeholder="Address"></textarea><button class="primary full" onclick="saveCustomer()">Save Customer</button></div>`};
window.saveCustomer=async()=>{const payload={name:$("n_name").value,phone:$("n_phone").value,nominee_name:$("n_nominee").value,nominee_relation:$("n_relation").value,id_proof_number:$("n_id").value,address:$("n_address").value};const r=await supabaseClient.from("customers").insert(payload).select().single();if(r.error)toast(r.error.message);else{toast("Customer saved");currentCustomer=r.data;loadPage("customers")}};

async function nominee(){main.innerHTML=`<div class="card"><h1>👨‍👩‍👧 Nominee</h1><p>Nominee details are maintained inside the customer profile.</p><button class="primary" onclick="loadPage('customers')">Open Customers</button></div>`}
async function idproof(){main.innerHTML=`<div class="card"><h1>🪪 ID Proof</h1><p>ID proof number and notes are stored with the customer profile. Document upload can be added after your storage bucket is configured.</p></div>`}
async function address(){main.innerHTML=`<div class="card"><h1>🏠 Address</h1><p>Customer address is stored with the customer profile.</p></div>`}

async function payments(){
  main.innerHTML=`<div class="page-title"><h1>💰 Add Payment</h1></div><div class="card form">
<input id="p_customer" placeholder="Customer ID"><input id="p_amount" type="number" placeholder="Amount ₹"><input id="p_scheme" placeholder="Scheme name"><input id="p_receipt" placeholder="Receipt number"><input id="p_date" type="date" value="${new Date().toISOString().slice(0,10)}"><input id="p_mode" placeholder="Payment mode (Cash/UPI/etc.)"><button class="primary full" onclick="savePayment()">Save Payment</button></div>`;
}
window.savePayment=async()=>{const payload={customer_id:$("p_customer").value,amount:Number($("p_amount").value),scheme_name:$("p_scheme").value,receipt_no:$("p_receipt").value,payment_date:$("p_date").value,payment_mode:$("p_mode").value};const r=await supabaseClient.from("payments").insert(payload);if(r.error)toast(r.error.message);else toast("Payment recorded successfully")};

async function passbook(){
  if(!currentCustomer){main.innerHTML=`<div class="card"><h1>📖 Customer Passbook</h1><p>Select a customer from Customers first.</p><button class="primary" onclick="loadPage('customers')">Select Customer</button></div>`;return}
  const id=currentCustomer.id;const r=await supabaseClient.from("payments").select("*").eq("customer_id",id).order("payment_date",{ascending:true});
  const rows=r.error?[]:(r.data||[]);const total=rows.reduce((s,x)=>s+Number(x.amount||0),0);
  main.innerHTML=`<div class="page-title"><h1>📖 Passbook</h1><button class="secondary" onclick="window.print()">🖨 Print / PDF</button></div>
  <div class="card"><h2>${esc(currentCustomer.name||currentCustomer.full_name)}</h2><p>Phone: ${esc(currentCustomer.phone||currentCustomer.mobile)}</p><p>Nominee: ${esc(currentCustomer.nominee_name)} | ID: ${esc(currentCustomer.id_proof_number)}</p><h3>Total Paid: ${money(total)}</h3></div>
  <div class="table-wrap"><table class="table"><tr><th>Date</th><th>Scheme</th><th>Receipt</th><th>Mode</th><th>Amount</th></tr>${rows.map(x=>`<tr><td>${esc(x.payment_date)}</td><td>${esc(x.scheme_name)}</td><td>${esc(x.receipt_no)}</td><td>${esc(x.payment_mode)}</td><td>${money(x.amount)}</td></tr>`).join("")}</table></div>`;
}
async function receipts(){main.innerHTML=`<div class="card"><h1>🧾 Receipt / Print / PDF</h1><p>Open a customer's passbook and use <b>Print / PDF</b> to save the receipt/passbook as PDF from your phone or computer.</p></div>`}
async function whatsapp(){main.innerHTML=`<div class="card"><h1>📱 WhatsApp</h1><p>WhatsApp sharing can use the customer's saved phone number. The app currently prepares the message; automatic WhatsApp API sending should be configured separately so credentials remain server-side.</p><button class="primary" onclick="shareWhatsApp()">Open WhatsApp</button></div>`}
window.shareWhatsApp=()=>{const phone=(currentCustomer?.phone||"").replace(/\D/g,"");const msg=`NIGAR Gems & Jewellers\\nPayment/Passbook update for ${currentCustomer?.name||"Customer"}`;window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,"_blank")};
async function ledger(){main.innerHTML=`<div class="card"><h1>📚 Ledger</h1><p>Ledger view is based on payment records. Use Reports for totals and transaction summaries.</p><button class="primary" onclick="loadPage('reports')">Open Reports</button></div>`}
async function reports(){const r=await supabaseClient.from("payments").select("amount,payment_date,payment_mode,scheme_name");const rows=r.error?[]:(r.data||[]);const total=rows.reduce((s,x)=>s+Number(x.amount||0),0);main.innerHTML=`<div class="page-title"><h1>📊 Reports</h1><button class="secondary" onclick="window.print()">🖨 Print</button></div><div class="grid"><div class="stat">Transactions<b>${rows.length}</b></div><div class="stat">Total collected<b>${money(total)}</b></div></div><div class="table-wrap"><table class="table"><tr><th>Date</th><th>Scheme</th><th>Mode</th><th>Amount</th></tr>${rows.map(x=>`<tr><td>${esc(x.payment_date)}</td><td>${esc(x.scheme_name)}</td><td>${esc(x.payment_mode)}</td><td>${money(x.amount)}</td></tr>`).join("")}</table></div>`}
async function staff(){main.innerHTML=`<div class="card"><h1>👨‍💼 Admin / Staff Permissions</h1><p>Staff authentication uses Supabase Auth. Database permissions should remain enforced by Supabase RLS; do not put a service-role key in this web app.</p><p>For your existing database, keep the roles/policies already created in Supabase and test each role before production use.</p></div>`}

if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
init();
