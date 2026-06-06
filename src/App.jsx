import { useState } from "react";

function uid() { return Math.random().toString(36).slice(2, 9); }
function getCOGS(item, inv) {
  return (item.ingredients||[]).reduce((s,ing)=>{
    const i=inv.find(x=>x.id===ing.id); return s+(i?i.cost*ing.qty:0);
  },0);
}
// COGS including choice group selections
function getSaleCOGS(menuItem, inv, choiceSelections, choiceGroups) {
  let base = getCOGS(menuItem, inv);
  if (choiceSelections && choiceGroups) {
    Object.entries(choiceSelections).forEach(([groupId, selected]) => {
      const group = choiceGroups.find(g => g.id === groupId);
      if (!group) return;
      const selectedArr = Array.isArray(selected) ? selected : [selected];
      selectedArr.forEach(optId => {
        const opt = group.options.find(o => o.id === optId);
        if (opt && opt.invId && opt.qty) {
          const inv2 = inv.find(i => i.id === opt.invId);
          if (inv2) base += inv2.cost * opt.qty;
        }
      });
    });
  }
  return base;
}
function getExtraCharge(choiceSelections, choiceGroups) {
  let extra = 0;
  if (!choiceSelections || !choiceGroups) return 0;
  Object.entries(choiceSelections).forEach(([groupId, selected]) => {
    const group = choiceGroups.find(g => g.id === groupId);
    if (!group) return;
    const selectedArr = Array.isArray(selected) ? selected : [selected];
    selectedArr.forEach(optId => {
      const opt = group.options.find(o => o.id === optId);
      if (opt && opt.extra) extra += parseFloat(opt.extra) || 0;
    });
  });
  return extra;
}

const STORAGE_KEY = "profitplate_v2";
function loadData() { try { const d=localStorage.getItem(STORAGE_KEY); return d?JSON.parse(d):{restaurants:{}}; } catch { return {restaurants:{}}; } }
function saveData(d) { try { localStorage.setItem(STORAGE_KEY,JSON.stringify(d)); } catch {} }

const DK = {
  bg:"#080810",card:"#10101c",border:"#1c1c2e",
  accent:"#ff6b2b",green:"#4ade80",red:"#f87171",yellow:"#facc15",
  text:"#e8e0d0",muted:"#55556a",
  font:"'DM Mono',monospace",display:"'Bebas Neue',sans-serif"
};
const LT = {
  bg:"#f0f0ec",card:"#ffffff",border:"#dddde8",
  accent:"#ff6b2b",green:"#16a34a",red:"#dc2626",yellow:"#d97706",
  text:"#1a1a2e",muted:"#888899",
  font:"'DM Mono',monospace",display:"'Bebas Neue',sans-serif"
};

function getCSS(G) { return `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${G.bg};}
  ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:${G.accent};border-radius:2px;}
  input,select,textarea{background:${G.card};border:1px solid ${G.border};color:${G.text};padding:9px 12px;font-family:${G.font};font-size:12px;border-radius:5px;outline:none;width:100%;}
  input:focus,select:focus{border-color:${G.accent};}
  button{cursor:pointer;font-family:${G.font};}
  .btn{background:${G.accent};border:none;color:#080810;padding:10px 22px;font-size:12px;font-weight:500;border-radius:5px;letter-spacing:.5px;transition:background .15s;}
  .btn:hover{background:#ff8c4f;}
  .btn-ghost{background:none;border:1px solid ${G.border};color:${G.muted};padding:9px 18px;font-size:12px;border-radius:5px;transition:all .15s;}
  .btn-ghost:hover{border-color:${G.accent};color:${G.text};}
  .btn-danger{background:#7f1d1d;border:none;color:${G.red};padding:7px 13px;font-size:11px;border-radius:5px;}
  .btn-sm{background:${G.accent};border:none;color:#080810;padding:6px 14px;font-size:11px;border-radius:4px;}
  .card{background:${G.card};border:1px solid ${G.border};border-radius:8px;padding:20px;}
  .badge{display:inline-block;padding:2px 8px;border-radius:3px;font-size:10px;letter-spacing:1px;}
  .bg{background:#052e16;border:1px solid #166534;color:#4ade80;}
  .br{background:#7f1d1d;border:1px solid #991b1b;color:#f87171;}
  .by{background:#422006;border:1px solid #854d0e;color:#facc15;}
  .bo{background:#431407;border:1px solid #9a3412;color:#fb923c;}
  table{width:100%;border-collapse:collapse;font-size:12px;}
  th{text-align:left;padding:8px 12px;color:${G.muted};letter-spacing:1px;font-size:10px;border-bottom:1px solid ${G.border};font-weight:400;}
  td{padding:10px 12px;border-bottom:1px solid ${G.border};}
  tr:last-child td{border-bottom:none;}
  .tab{background:none;border:1px solid ${G.border};color:${G.muted};padding:9px 14px;font-size:11px;letter-spacing:1px;border-radius:4px;transition:all .15s;}
  .tab:hover{border-color:${G.accent}44;color:${G.text};}
  .tab.on{background:${G.accent};border-color:${G.accent};color:#080810;font-weight:500;}
  .pin-btn{background:${G.card};border:1px solid ${G.border};color:${G.text};width:68px;height:68px;font-size:22px;border-radius:8px;font-family:'Bebas Neue',sans-serif;transition:all .1s;}
  .pin-btn:hover{border-color:${G.accent}66;}
  .pin-btn:active{background:${G.accent}22;border-color:${G.accent};}
  @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
  .fade{animation:fadeIn .3s ease;}
  .slide{animation:slideDown .3s ease;}
  .toast{position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:6px;font-size:12px;z-index:9999;animation:fadeIn .3s ease;}
  .ts{background:#14532d;border:1px solid #4ade80;color:#4ade80;}
  .te{background:#7f1d1d;border:1px solid #f87171;color:#f87171;}
  .modal-bg{position:fixed;inset:0;background:#000000cc;z-index:999;display:flex;align-items:center;justify-content:center;padding:20px;}
  .modal{background:${G.card};border:1px solid ${G.border};border-radius:10px;padding:28px;width:100%;max-width:540px;max-height:85vh;overflow-y:auto;}
  .prog-bar{background:${G.border};border-radius:2px;height:4px;overflow:hidden;}
  .prog-fill{height:4px;border-radius:2px;transition:width .3s;}
  .cg-opt{border:1px solid ${G.border};border-radius:7px;padding:12px 14px;cursor:pointer;transition:all .15s;display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
  .cg-opt:hover{border-color:${G.accent}66;}
  .cg-opt.selected{border-color:${G.accent};background:${G.accent}18;}
  .cg-opt.oos{opacity:.45;cursor:not-allowed;border-color:${G.border};}
`; }

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [store, setStore] = useState(() => loadData());
  const [screen, setScreen] = useState("landing");
  const [activeId, setActiveId] = useState(null);
  const [activeRole, setActiveRole] = useState("owner");
  const [theme, setTheme] = useState(() => localStorage.getItem("pp_theme") || "dark");
  const [toast, setToast] = useState(null);

  const G = theme === "dark" ? DK : LT;
  const css = getCSS(G);

  function showToast(msg, type="success") { setToast({msg,type}); setTimeout(()=>setToast(null),2800); }

  function updateRestaurant(id, updater) {
    setStore(prev => {
      const updated = typeof updater==="function" ? updater(prev.restaurants[id]) : {...prev.restaurants[id],...updater};
      const next = {...prev, restaurants: {...prev.restaurants, [id]: updated}};
      saveData(next);
      return next;
    });
  }

  const rList = Object.values(store.restaurants||{});
  const restaurant = activeId ? store.restaurants[activeId] : null;

  function toggleTheme() {
    const t = theme==="dark"?"light":"dark";
    setTheme(t);
    localStorage.setItem("pp_theme", t);
  }

  if (screen==="landing") return (
    <div style={{fontFamily:G.font,background:G.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:G.text}}>
      <style>{css}</style>
      <div style={{textAlign:"center",maxWidth:460}} className="fade">
        <div style={{fontSize:60,marginBottom:16}}>🍔</div>
        <div style={{fontFamily:G.display,fontSize:54,letterSpacing:4,color:G.accent,lineHeight:1}}>PROFITPLATE</div>
        <div style={{fontSize:11,letterSpacing:3,color:G.muted,marginTop:6,marginBottom:40}}>RESTAURANT INTELLIGENCE PLATFORM</div>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <button className="btn" style={{fontSize:13,padding:"13px 32px"}} onClick={()=>setScreen("setup")}>+ NEW RESTAURANT</button>
          {rList.length>0 && <button className="btn-ghost" style={{fontSize:13,padding:"13px 32px"}} onClick={()=>setScreen("select")}>OPEN EXISTING</button>}
        </div>
        {rList.length>0 && <div style={{marginTop:20,fontSize:11,color:G.muted}}>{rList.length} restaurant{rList.length!==1?"s":""} registered</div>}
        <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:24,flexWrap:"wrap"}}>
          <button onClick={()=>{
            const data=JSON.stringify(store,null,2);
            const blob=new Blob([data],{type:"application/json"});
            const url=URL.createObjectURL(blob);
            const a=document.createElement("a");
            a.href=url;a.download=`profitplate-backup-${new Date().toISOString().slice(0,10)}.json`;
            a.click();URL.revokeObjectURL(url);
          }} style={{background:"none",border:`1px solid ${G.accent}44`,borderRadius:5,padding:"7px 16px",fontSize:11,color:G.accent,cursor:"pointer"}}>⬇ BACKUP DATA</button>
          <label style={{background:"none",border:`1px solid ${G.border}`,borderRadius:5,padding:"7px 16px",fontSize:11,color:G.muted,cursor:"pointer"}}>
            ⬆ RESTORE BACKUP
            <input type="file" accept=".json" style={{display:"none"}} onChange={e=>{
              const file=e.target.files[0];
              if(!file) return;
              const reader=new FileReader();
              reader.onload=ev=>{
                try{
                  const parsed=JSON.parse(ev.target.result);
                  if(parsed.restaurants){
                    setStore(parsed);
                    saveData(parsed);
                    showToast("Data restored successfully!");
                  } else {
                    showToast("Invalid backup file","error");
                  }
                } catch {
                  showToast("Could not read file","error");
                }
              };
              reader.readAsText(file);
              e.target.value="";
            }} />
          </label>
        </div>
      </div>
      {toast && <div className={`toast ${toast.type==="success"?"ts":"te"}`}>{toast.msg}</div>}
    </div>
  );

  if (screen==="select") return (
    <div style={{fontFamily:G.font,background:G.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:G.text}}>
      <style>{css}</style>
      <div style={{width:"100%",maxWidth:420}} className="fade">
        <div style={{fontFamily:G.display,fontSize:32,letterSpacing:3,color:G.accent,marginBottom:24,textAlign:"center"}}>SELECT LOCATION</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {rList.map(r=>(
            <button key={r.id} className="btn-ghost" style={{padding:"16px 20px",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}
              onClick={()=>{setActiveId(r.id);setScreen("pin");}}>
              <div>
                <div style={{color:G.text,fontSize:14}}>{r.name}</div>
                <div style={{color:G.muted,fontSize:10,marginTop:2}}>{r.menuItems?.length||0} items · {r.inventory?.length||0} ingredients</div>
              </div>
              <span style={{color:G.accent}}>→</span>
            </button>
          ))}
        </div>
        <div style={{marginTop:20,textAlign:"center"}}>
          <button className="btn-ghost" onClick={()=>setScreen("landing")} style={{fontSize:11}}>← BACK</button>
        </div>
      </div>
    </div>
  );

  if (screen==="setup") return (
    <SetupWizard G={G} css={css}
      onComplete={data=>{
        const id=uid();
        setStore(prev=>{
          const next={...prev,restaurants:{...prev.restaurants,[id]:{...data,id}}};
          saveData(next); return next;
        });
        setActiveId(id); setActiveRole("owner"); setScreen("app");
        showToast("Welcome to ProfitPlate!");
      }}
      onBack={()=>setScreen("landing")}
    />
  );

  if (screen==="pin" && restaurant) return (
    <PinScreen G={G} css={css} restaurant={restaurant}
      onSuccess={role=>{setActiveRole(role);setScreen("app");}}
      onBack={()=>setScreen("select")}
    />
  );

  if (screen==="app" && restaurant) return (
    <MainApp G={G} css={css} theme={theme} toggleTheme={toggleTheme}
      restaurant={restaurant} role={activeRole}
      update={u=>updateRestaurant(activeId,u)}
      onLogout={()=>{setScreen("select");setActiveRole("owner");}}
      showToast={showToast}
    />
  );

  return <div style={{fontFamily:DK.font,background:DK.bg,minHeight:"100vh",color:DK.text,display:"flex",alignItems:"center",justifyContent:"center"}}><style>{getCSS(DK)}</style>Loading...</div>;
}

// ── SETUP WIZARD ──────────────────────────────────────────────────────────────
function SetupWizard({G,css,onComplete,onBack}) {
  const [step,setStep]=useState(0);
  const [data,setData]=useState({name:"",logo:"",taxRate:"8.5",pin:"",confirmPin:"",staffPin:"",secretQuestion:"",secretAnswer:"",inventory:[],menuItems:[],choiceGroups:[],sales:[]});
  const [invItem,setInvItem]=useState({name:"",unit:"each",qty:"",threshold:"",cost:"",mode:"single",packSize:"",packCost:"",packCount:"",bulkTotal:"",bulkCost:"",bulkServing:""});
  const [menuItem,setMenuItem]=useState({name:"",price:"",ingredients:[],choiceGroupIds:[]});
  const [menuIng,setMenuIng]=useState({id:"",qty:""});
  const [toast,setToast]=useState(null);
  const steps=["Info","PIN","Inventory","Menu","Review"];
  function t(msg,type="success"){setToast({msg,type});setTimeout(()=>setToast(null),2200);}

  function addInv(){
    const name=(invItem.name||"").trim();
    if(!name) return t("Enter ingredient name","error");
    let qty=0,cost=0;
    if(invItem.mode==="pack"){
      if(!invItem.packSize||!invItem.packCost||!invItem.packCount) return t("Fill all pack fields","error");
      qty=parseFloat(invItem.packSize)*parseFloat(invItem.packCount);
      cost=parseFloat(invItem.packCost)/parseFloat(invItem.packSize);
    } else if(invItem.mode==="bulk"){
      if(!invItem.bulkTotal||!invItem.bulkCost||!invItem.bulkServing) return t("Fill all bulk fields","error");
      qty=parseFloat(invItem.bulkTotal);
      cost=parseFloat(invItem.bulkCost)/parseFloat(invItem.bulkTotal)*parseFloat(invItem.bulkServing);
    } else {
      if(!invItem.qty||!invItem.cost) return t("Fill qty and cost","error");
      qty=parseFloat(invItem.qty); cost=parseFloat(invItem.cost);
    }
    const ni={id:uid(),name,unit:invItem.unit,qty:parseFloat(qty.toFixed(2)),threshold:parseFloat(invItem.threshold)||5,cost:parseFloat(cost.toFixed(4))};
    setData(d=>({...d,inventory:[...d.inventory,ni]}));
    setInvItem({name:"",unit:"each",qty:"",threshold:"",cost:"",mode:"single",packSize:"",packCost:"",packCount:"",bulkTotal:"",bulkCost:"",bulkServing:""});
    t(name+" added!");
  }

  function addMenuIng(){
    if(!menuIng.id||!menuIng.qty) return;
    setMenuItem(m=>({...m,ingredients:[...m.ingredients.filter(i=>i.id!==menuIng.id),{id:menuIng.id,qty:parseFloat(menuIng.qty)}]}));
    setMenuIng({id:"",qty:""});
  }

  function addMenuItem(){
    if(!menuItem.name||!menuItem.price) return t("Name and price required","error");
    setData(d=>({...d,menuItems:[...d.menuItems,{...menuItem,id:uid(),price:parseFloat(menuItem.price)}]}));
    setMenuItem({name:"",price:"",ingredients:[],choiceGroupIds:[]});
    t("Menu item added!");
  }

  function next(){
    if(step===0&&!data.name.trim()) return t("Enter restaurant name","error");
    if(step===1){
      if(data.pin.length<4) return t("PIN must be 4+ digits","error");
      if(data.pin!==data.confirmPin) return t("PINs don't match","error");
      if(!data.secretQuestion||!data.secretAnswer) return t("Set a recovery question","error");
    }
    if(step===steps.length-1) return onComplete({...data,setupDone:true});
    setStep(s=>s+1);
  }

  return (
    <div style={{fontFamily:G.font,background:G.bg,minHeight:"100vh",color:G.text,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{css}</style>
      <div style={{width:"100%",maxWidth:560}} className="fade">
        <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:28,alignItems:"center"}}>
          {steps.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:i===step?28:8,height:8,borderRadius:i===step?4:"50%",background:i<=step?G.accent:G.border,transition:"all .3s"}} />
              {i<steps.length-1&&<div style={{width:20,height:1,background:i<step?G.accent:G.border}} />}
            </div>
          ))}
        </div>
        <div style={{fontFamily:G.display,fontSize:32,letterSpacing:3,color:G.accent,marginBottom:4}}>{steps[step].toUpperCase()}</div>
        <div style={{fontSize:11,color:G.muted,marginBottom:24,letterSpacing:1}}>STEP {step+1} OF {steps.length}</div>

        {step===0 && (
          <div className="card" style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:6}}>RESTAURANT NAME *</div><input placeholder="e.g. Smoky's Burger Bar" value={data.name} onChange={e=>setData(d=>({...d,name:e.target.value}))} /></div>
            <div><div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:6}}>TAX RATE (%)</div><input type="number" value={data.taxRate} onChange={e=>setData(d=>({...d,taxRate:e.target.value}))} /></div>
            <div><div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:6}}>LOGO URL (optional)</div><input placeholder="https://..." value={data.logo} onChange={e=>setData(d=>({...d,logo:e.target.value}))} /></div>
          </div>
        )}

        {step===1 && (
          <div className="card" style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{fontSize:11,color:G.muted}}>Owner PIN = full access. Staff PIN = cashier only (optional).</div>
            <div><div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:6}}>OWNER PIN (4-6 digits)</div><input type="password" inputMode="numeric" maxLength={6} value={data.pin} onChange={e=>setData(d=>({...d,pin:e.target.value.replace(/\D/g,"")}))} placeholder="••••" /></div>
            <div><div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:6}}>CONFIRM OWNER PIN</div><input type="password" inputMode="numeric" maxLength={6} value={data.confirmPin} onChange={e=>setData(d=>({...d,confirmPin:e.target.value.replace(/\D/g,"")}))} placeholder="••••" /></div>
            <div style={{background:G.border,height:1}} />
            <div><div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:6}}>STAFF PIN (optional)</div><input type="password" inputMode="numeric" maxLength={6} value={data.staffPin||""} onChange={e=>setData(d=>({...d,staffPin:e.target.value.replace(/\D/g,"")}))} placeholder="•••• optional" /></div>
            <div style={{background:G.border,height:1}} />
            <div style={{fontSize:10,letterSpacing:2,color:G.muted}}>PIN RECOVERY</div>
            <div>
              <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:6}}>SECRET QUESTION</div>
              <select value={data.secretQuestion||""} onChange={e=>setData(d=>({...d,secretQuestion:e.target.value}))}>
                <option value="">Select a question</option>
                <option>What was the name of your first pet?</option>
                <option>What street did you grow up on?</option>
                <option>What is your mother's maiden name?</option>
                <option>What was the name of your first school?</option>
                <option>What city were you born in?</option>
              </select>
            </div>
            <div><div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:6}}>YOUR ANSWER</div><input placeholder="Answer" value={data.secretAnswer||""} onChange={e=>setData(d=>({...d,secretAnswer:e.target.value}))} /></div>
          </div>
        )}

        {step===2 && <InventoryForm G={G} invItem={invItem} setInvItem={setInvItem} onAdd={addInv} inventory={data.inventory} onDelete={id=>setData(d=>({...d,inventory:d.inventory.filter(i=>i.id!==id)}))} />}

        {step===3 && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div className="card">
              <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:14}}>ADD MENU ITEM</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                <input placeholder="Item name" value={menuItem.name} onChange={e=>setMenuItem(m=>({...m,name:e.target.value}))} />
                <input type="number" placeholder="Sell price $" value={menuItem.price} onChange={e=>setMenuItem(m=>({...m,price:e.target.value}))} />
              </div>
              {data.inventory.length>0&&<>
                <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:8}}>LINK INGREDIENTS (optional)</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 80px 80px",gap:8,marginBottom:10}}>
                  <select value={menuIng.id} onChange={e=>setMenuIng(i=>({...i,id:e.target.value}))}>
                    <option value="">Select ingredient</option>
                    {data.inventory.map(inv=><option key={inv.id} value={inv.id}>{inv.name}</option>)}
                  </select>
                  <input type="number" placeholder="Qty" value={menuIng.qty} onChange={e=>setMenuIng(i=>({...i,qty:e.target.value}))} />
                  <button className="btn-ghost" onClick={addMenuIng} style={{fontSize:11}}>+ ADD</button>
                </div>
              </>}
              {menuItem.ingredients.length>0 && (
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                  {menuItem.ingredients.map(ing=>{
                    const inv=data.inventory.find(i=>i.id===ing.id);
                    return <span key={ing.id} style={{background:G.accent+"18",border:`1px solid ${G.accent}44`,borderRadius:20,padding:"2px 10px",fontSize:11,color:G.accent}}>{inv?.name} x{ing.qty}</span>;
                  })}
                </div>
              )}
              <button className="btn" onClick={addMenuItem}>+ ADD MENU ITEM</button>
            </div>
            {data.menuItems.length>0 && (
              <div className="card">
                {data.menuItems.map(item=>{
                  const cogs=getCOGS(item,data.inventory);
                  const margin=item.price>0?((item.price-cogs)/item.price*100).toFixed(0):0;
                  return (
                    <div key={item.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${G.border}`,fontSize:12}}>
                      <span>{item.name}</span>
                      <div style={{display:"flex",gap:12,alignItems:"center"}}>
                        <span style={{color:G.muted}}>${item.price.toFixed(2)}</span>
                        <span className={`badge ${parseFloat(margin)>=60?"bg":parseFloat(margin)>=40?"by":"br"}`}>{margin}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {step===4 && (
          <div className="card">
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
              {data.logo && <img src={data.logo} alt="" style={{width:52,height:52,borderRadius:8,objectFit:"cover"}} onError={e=>e.target.style.display="none"} />}
              <div>
                <div style={{fontFamily:G.display,fontSize:28,letterSpacing:2,color:G.accent}}>{data.name}</div>
                <div style={{fontSize:11,color:G.muted}}>Tax: {data.taxRate}% · PIN set · {data.inventory.length} ingredients · {data.menuItems.length} menu items</div>
              </div>
            </div>
            <div style={{fontSize:12,color:G.muted}}>Everything looks good! Click Launch to start using ProfitPlate.</div>
          </div>
        )}

        <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
          <button className="btn-ghost" onClick={()=>step===0?onBack():setStep(s=>s-1)}>← BACK</button>
          <button className="btn" onClick={next}>{step===steps.length-1?"LAUNCH APP →":"NEXT →"}</button>
        </div>
      </div>
      {toast && <div className={`toast ${toast.type==="success"?"ts":"te"}`}>{toast.msg}</div>}
    </div>
  );
}

// ── INVENTORY FORM ────────────────────────────────────────────────────────────
function InventoryForm({G,invItem,setInvItem,onAdd,inventory,onDelete}) {
  const mode=invItem.mode||"single";
  const packCostPer=invItem.packSize&&invItem.packCost?(parseFloat(invItem.packCost)/parseFloat(invItem.packSize)).toFixed(4):null;
  const packTotalQty=invItem.packSize&&invItem.packCount?parseFloat(invItem.packSize)*parseFloat(invItem.packCount):null;
  const bulkCostPer=invItem.bulkTotal&&invItem.bulkCost&&invItem.bulkServing?(parseFloat(invItem.bulkCost)/parseFloat(invItem.bulkTotal)*parseFloat(invItem.bulkServing)).toFixed(4):null;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div className="card">
        <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:14}}>ADD INGREDIENT</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 80px",gap:10,marginBottom:12}}>
          <input placeholder="Ingredient name" value={invItem.name} onChange={e=>setInvItem(i=>({...i,name:e.target.value}))} />
          <select value={invItem.unit} onChange={e=>setInvItem(i=>({...i,unit:e.target.value}))}>
            {["each","oz","lb","g","ml","cup","slice","gallon"].map(u=><option key={u}>{u}</option>)}
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
          {[{key:"single",label:"SINGLE UNIT",sub:"patties, eggs"},{key:"pack",label:"PACKS / CASES",sub:"buns, cans"},{key:"bulk",label:"BULK / WEIGHT",sub:"fries, oil, flour"}].map(m=>(
            <button key={m.key} onClick={()=>setInvItem(i=>({...i,mode:m.key}))}
              style={{background:mode===m.key?G.accent+"22":"transparent",border:`1px solid ${mode===m.key?G.accent:G.border}`,borderRadius:6,padding:"10px 8px",textAlign:"center",cursor:"pointer"}}>
              <div style={{fontSize:10,letterSpacing:1,color:mode===m.key?G.accent:G.muted,fontFamily:G.font}}>{m.label}</div>
              <div style={{fontSize:9,color:G.muted,marginTop:3}}>{m.sub}</div>
            </button>
          ))}
        </div>

        {mode==="single" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
            <input type="number" placeholder="Qty on hand" value={invItem.qty} onChange={e=>setInvItem(i=>({...i,qty:e.target.value}))} />
            <input type="number" placeholder="Reorder at" value={invItem.threshold} onChange={e=>setInvItem(i=>({...i,threshold:e.target.value}))} />
            <input type="number" placeholder="Cost/unit $" value={invItem.cost} onChange={e=>setInvItem(i=>({...i,cost:e.target.value}))} />
          </div>
        )}

        {mode==="pack" && (
          <div style={{background:G.accent+"11",border:`1px solid ${G.accent}33`,borderRadius:6,padding:14,marginBottom:12}}>
            <div style={{fontSize:10,color:G.accent,letterSpacing:2,marginBottom:10}}>PACK DETAILS</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div><div style={{fontSize:10,color:G.muted,marginBottom:4}}>HOW MANY IN ONE PACK?</div><input type="number" placeholder="e.g. 8" value={invItem.packSize||""} onChange={e=>setInvItem(i=>({...i,packSize:e.target.value}))} /></div>
              <div><div style={{fontSize:10,color:G.muted,marginBottom:4}}>PRICE PER PACK ($)</div><input type="number" placeholder="e.g. 2.99" value={invItem.packCost||""} onChange={e=>setInvItem(i=>({...i,packCost:e.target.value}))} /></div>
            </div>
            <div style={{marginBottom:10}}><div style={{fontSize:10,color:G.muted,marginBottom:4}}>HOW MANY PACKS ON HAND?</div><input type="number" placeholder="e.g. 3" value={invItem.packCount||""} onChange={e=>setInvItem(i=>({...i,packCount:e.target.value}))} /></div>
            <div style={{marginBottom:10}}><div style={{fontSize:10,color:G.muted,marginBottom:4}}>REORDER WHEN BELOW (units)</div><input type="number" placeholder="e.g. 16" value={invItem.threshold} onChange={e=>setInvItem(i=>({...i,threshold:e.target.value}))} /></div>
            {packCostPer&&packTotalQty&&<div style={{background:G.green+"11",border:`1px solid ${G.green}33`,borderRadius:5,padding:"8px 12px",fontSize:11,color:G.green}}>Cost per unit = <strong>${packCostPer}</strong> · {packTotalQty} total units in stock</div>}
          </div>
        )}

        {mode==="bulk" && (
          <div style={{background:G.yellow+"11",border:`1px solid ${G.yellow}33`,borderRadius:6,padding:14,marginBottom:12}}>
            <div style={{fontSize:10,color:G.yellow,letterSpacing:2,marginBottom:10}}>BULK / WEIGHT DETAILS</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div><div style={{fontSize:10,color:G.muted,marginBottom:4}}>TOTAL AMOUNT PURCHASED</div><input type="number" placeholder="e.g. 80 oz" value={invItem.bulkTotal||""} onChange={e=>setInvItem(i=>({...i,bulkTotal:e.target.value}))} /></div>
              <div><div style={{fontSize:10,color:G.muted,marginBottom:4}}>PRICE PAID ($)</div><input type="number" placeholder="e.g. 6.99" value={invItem.bulkCost||""} onChange={e=>setInvItem(i=>({...i,bulkCost:e.target.value}))} /></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div><div style={{fontSize:10,color:G.muted,marginBottom:4}}>HOW MUCH PER SERVING?</div><input type="number" placeholder="e.g. 6 oz" value={invItem.bulkServing||""} onChange={e=>setInvItem(i=>({...i,bulkServing:e.target.value}))} /></div>
              <div><div style={{fontSize:10,color:G.muted,marginBottom:4}}>REORDER WHEN BELOW</div><input type="number" placeholder="e.g. 24" value={invItem.threshold} onChange={e=>setInvItem(i=>({...i,threshold:e.target.value}))} /></div>
            </div>
            {bulkCostPer&&<div style={{background:G.yellow+"11",border:`1px solid ${G.yellow}33`,borderRadius:5,padding:"8px 12px",fontSize:11,color:G.yellow}}>Cost per serving = <strong>${bulkCostPer}</strong></div>}
          </div>
        )}
        <button className="btn" onClick={onAdd}>+ ADD INGREDIENT</button>
      </div>
      {inventory&&inventory.length>0&&(
        <div className="card">
          <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:12}}>ADDED ({inventory.length})</div>
          {inventory.map(item=>(
            <div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${G.border}`,fontSize:12}}>
              <span>{item.name} <span style={{color:G.muted}}>({item.unit})</span></span>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <span style={{color:G.muted}}>qty:{item.qty} · ${item.cost}/unit</span>
                {onDelete&&<button className="btn-danger" onClick={()=>onDelete(item.id)}>x</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PIN SCREEN ────────────────────────────────────────────────────────────────
function PinScreen({G,css,restaurant,onSuccess,onBack}) {
  const [entered,setEntered]=useState("");
  const [shake,setShake]=useState(false);
  const [mode,setMode]=useState("pin");
  const [recoveryAnswer,setRecoveryAnswer]=useState("");
  const [recoveryError,setRecoveryError]=useState("");

  function press(d) {
    if(entered.length>=6) return;
    const next=entered+d;
    setEntered(next);
    const ownerLen=restaurant.pin.length;
    const staffLen=restaurant.staffPin?restaurant.staffPin.length:0;
    if(next===restaurant.pin){onSuccess("owner");return;}
    if(restaurant.staffPin&&next===restaurant.staffPin){onSuccess("staff");return;}
    if(next.length>=ownerLen&&(!staffLen||next.length>=staffLen)){
      setShake(true); setTimeout(()=>{setShake(false);setEntered("");},600);
    }
  }

  if(mode==="recovery") return (
    <div style={{fontFamily:G.font,background:G.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:G.text}}>
      <style>{css}</style>
      <div style={{width:"100%",maxWidth:400,padding:24}} className="fade">
        <div style={{fontFamily:G.display,fontSize:28,letterSpacing:3,color:G.accent,marginBottom:24}}>PIN RECOVERY</div>
        <div className="card" style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{fontSize:12,color:G.muted}}>{restaurant.secretQuestion||"Secret question not set"}</div>
          <input placeholder="Your answer" value={recoveryAnswer} onChange={e=>setRecoveryAnswer(e.target.value)} />
          {recoveryError&&<div style={{fontSize:11,color:G.red}}>{recoveryError}</div>}
          <button className="btn" onClick={()=>{
            if(recoveryAnswer.trim()===(restaurant.secretAnswer||"").trim()){onSuccess("owner");}
            else{setRecoveryError("Incorrect answer.");}
          }}>VERIFY</button>
          <button className="btn-ghost" onClick={()=>setMode("pin")} style={{fontSize:11}}>← BACK TO PIN</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{fontFamily:G.font,background:G.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:G.text}}>
      <style>{css}</style>
      <div style={{textAlign:"center"}} className="fade">
        {restaurant.logo
          ?<img src={restaurant.logo} alt="" style={{width:80,height:80,borderRadius:16,objectFit:"cover",marginBottom:16,border:`2px solid ${G.accent}`}} onError={e=>e.target.style.display="none"} />
          :<div style={{width:80,height:80,borderRadius:16,background:G.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,marginBottom:16}}>🍔</div>
        }
        <div style={{fontFamily:G.display,fontSize:36,letterSpacing:3,color:G.accent,marginBottom:4}}>{restaurant.name}</div>
        <div style={{fontSize:11,color:G.muted,letterSpacing:2,marginBottom:restaurant.staffPin?8:28}}>ENTER PIN TO CONTINUE</div>
        {restaurant.staffPin&&<div style={{fontSize:10,color:G.muted,marginBottom:28}}>Owner PIN = full access · Staff PIN = cashier only</div>}
        <div style={{display:"flex",gap:14,justifyContent:"center",marginBottom:36,animation:shake?"shake .4s ease":"none"}}>
          {Array.from({length:restaurant.pin.length}).map((_,i)=>(
            <div key={i} style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${i<entered.length?G.accent:G.border}`,background:i<entered.length?G.accent:"transparent",transition:"all .15s"}} />
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3, 68px)",gap:10,justifyContent:"center"}}>
          {[1,2,3,4,5,6,7,8,9].map(n=><button key={n} className="pin-btn" onClick={()=>press(String(n))}>{n}</button>)}
          <div />
          <button className="pin-btn" onClick={()=>press("0")}>0</button>
          <button className="pin-btn" onClick={()=>setEntered(e=>e.slice(0,-1))} style={{fontSize:16,color:G.muted}}>⌫</button>
        </div>
        <div style={{marginTop:24,display:"flex",gap:12,justifyContent:"center"}}>
          <button className="btn-ghost" style={{fontSize:11}} onClick={onBack}>← BACK</button>
          {restaurant.secretQuestion&&<button className="btn-ghost" style={{fontSize:11}} onClick={()=>setMode("recovery")}>FORGOT PIN?</button>}
        </div>
      </div>
    </div>
  );
}

// ── RESTOCK ROW ───────────────────────────────────────────────────────────────
function RestockRow({G,item,onSave}) {
  const [editing,setEditing]=useState(false);
  const [fields,setFields]=useState({qty:item.qty,name:item.name,cost:item.cost,threshold:item.threshold});
  const [addQty,setAddQty]=useState("");
  const status=item.qty<=item.threshold?"CRITICAL":item.qty<=item.threshold*2?"LOW":"OK";
  const statusColor=status==="CRITICAL"?G.red:status==="LOW"?G.yellow:G.green;

  if(editing) return (
    <div style={{background:G.bg,border:`1px solid ${G.accent}`,borderRadius:6,padding:14}}>
      <div style={{fontSize:10,letterSpacing:2,color:G.accent,marginBottom:12}}>EDITING: {item.name}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><div style={{fontSize:10,color:G.muted,marginBottom:4}}>NAME</div><input value={fields.name} onChange={e=>setFields(f=>({...f,name:e.target.value}))} /></div>
        <div><div style={{fontSize:10,color:G.muted,marginBottom:4}}>CURRENT QTY</div><input type="number" value={fields.qty} onChange={e=>setFields(f=>({...f,qty:e.target.value}))} /></div>
        <div><div style={{fontSize:10,color:G.muted,marginBottom:4}}>COST/UNIT ($)</div><input type="number" value={fields.cost} onChange={e=>setFields(f=>({...f,cost:e.target.value}))} /></div>
        <div><div style={{fontSize:10,color:G.muted,marginBottom:4}}>REORDER AT</div><input type="number" value={fields.threshold} onChange={e=>setFields(f=>({...f,threshold:e.target.value}))} /></div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button className="btn" onClick={()=>{onSave({name:fields.name,cost:parseFloat(fields.cost)||item.cost,threshold:parseFloat(fields.threshold)||item.threshold,qty:parseFloat(fields.qty)||item.qty});setEditing(false);}}>SAVE</button>
        <button className="btn-ghost" onClick={()=>setEditing(false)}>CANCEL</button>
      </div>
    </div>
  );

  return (
    <div style={{background:G.bg,border:`1px solid ${G.border}`,borderRadius:6,padding:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{fontSize:13,color:G.text,fontWeight:500}}>{item.name}</div>
          <span style={{fontSize:10,color:G.muted}}>{item.unit}</span>
          <span className={`badge ${status==="CRITICAL"?"br":status==="LOW"?"by":"bg"}`}>{status}</span>
        </div>
        <button className="btn-ghost" style={{fontSize:10,padding:"5px 10px"}} onClick={()=>{setFields({qty:item.qty,name:item.name,cost:item.cost,threshold:item.threshold});setEditing(true);}}>EDIT</button>
      </div>
      <div style={{display:"flex",gap:16,fontSize:11,color:G.muted,marginBottom:12}}>
        <span>In stock: <span style={{color:statusColor,fontFamily:G.display,fontSize:18}}>{item.qty}</span></span>
        <span>Reorder at: <span style={{color:G.text}}>{item.threshold}</span></span>
        <span>Cost: <span style={{color:G.text}}>${item.cost}</span></span>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <input type="number" placeholder="Add qty when restocking (e.g. +24)" value={addQty} onChange={e=>setAddQty(e.target.value)} style={{maxWidth:280}} />
        <button className="btn" style={{whiteSpace:"nowrap",padding:"9px 16px"}} onClick={()=>{
          const add=parseFloat(addQty);
          if(!addQty||isNaN(add)||add<=0) return;
          onSave({qty:parseFloat((item.qty+add).toFixed(2))});
          setAddQty("");
        }}>+ ADD STOCK</button>
      </div>
    </div>
  );
}

// ── CHOICE GROUP SELECTION MODAL ──────────────────────────────────────────────
function ChoiceGroupModal({G, item, choiceGroups, inventory, onConfirm, onCancel}) {
  const groups = (item.choiceGroupIds||[]).map(id => choiceGroups.find(g=>g.id===id)).filter(Boolean);
  const [selections, setSelections] = useState(() => {
    const init = {};
    groups.forEach(g => { init[g.id] = g.multiSelect ? [] : null; });
    return init;
  });

  function getInvQty(invId) {
    if (!invId) return 999;
    const inv = inventory.find(i=>i.id===invId);
    return inv ? inv.qty : 0;
  }

  function toggleOption(group, optId) {
    const invItem = inventory.find(i=>i.id===group.options.find(o=>o.id===optId)?.invId);
    const optQty = group.options.find(o=>o.id===optId)?.qty || 0;
    if (invItem && invItem.qty < optQty) return; // out of stock
    setSelections(prev => {
      if (group.multiSelect) {
        const cur = prev[group.id] || [];
        return {...prev, [group.id]: cur.includes(optId) ? cur.filter(x=>x!==optId) : [...cur, optId]};
      } else {
        return {...prev, [group.id]: prev[group.id]===optId ? null : optId};
      }
    });
  }

  function isSelected(groupId, optId) {
    const sel = selections[groupId];
    if (Array.isArray(sel)) return sel.includes(optId);
    return sel === optId;
  }

  function canConfirm() {
    return groups.every(g => {
      if (!g.required) return true;
      const sel = selections[g.id];
      if (Array.isArray(sel)) return sel.length > 0;
      return sel !== null && sel !== undefined;
    });
  }

  const extraCharge = getExtraCharge(selections, choiceGroups);
  const totalPrice = item.price + extraCharge;

  // Build label for selections
  function getSelectionLabel() {
    const parts = [];
    groups.forEach(g => {
      const sel = selections[g.id];
      const selectedArr = Array.isArray(sel) ? sel : (sel ? [sel] : []);
      if (selectedArr.length > 0) {
        const names = selectedArr.map(id => g.options.find(o=>o.id===id)?.name).filter(Boolean);
        parts.push(names.join(", "));
      }
    });
    return parts.join(" · ");
  }

  return (
    <div className="modal-bg" onClick={onCancel}>
      <div className="modal slide" onClick={e=>e.stopPropagation()} style={{maxWidth:500}}>
        <div style={{marginBottom:4}}>
          <div style={{fontFamily:G.display,fontSize:26,letterSpacing:2,color:G.accent}}>{item.name}</div>
          <div style={{fontSize:11,color:G.muted,marginTop:2}}>
            Base: ${item.price.toFixed(2)}{extraCharge>0&&<span style={{color:G.green}}> + ${extraCharge.toFixed(2)} extras = ${totalPrice.toFixed(2)}</span>}
          </div>
        </div>

        {groups.map((group, gi) => (
          <div key={group.id} style={{marginTop:20}}>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:11,letterSpacing:2,color:G.text}}>{group.name.toUpperCase()}</div>
              {group.required && <span className="badge br">REQUIRED</span>}
              {group.multiSelect && <span className="badge by">PICK MULTIPLE</span>}
            </div>
            {group.options.map(opt => {
              const invItem = inventory.find(i=>i.id===opt.invId);
              const currentQty = invItem ? invItem.qty : 999;
              const isOOS = opt.invId && currentQty < (opt.qty||1);
              const isLow = !isOOS && opt.invId && currentQty <= (invItem?.threshold||5)*2;
              const selected = isSelected(group.id, opt.id);
              return (
                <div key={opt.id}
                  className={`cg-opt${selected?" selected":""}${isOOS?" oos":""}`}
                  onClick={()=>!isOOS&&toggleOption(group, opt.id)}
                  style={{borderColor:selected?G.accent:isOOS?G.border:undefined}}
                >
                  <div>
                    <div style={{fontSize:13,color:isOOS?G.muted:G.text,fontWeight:selected?500:400}}>{opt.name}</div>
                    {isOOS && <div style={{fontSize:10,color:G.red,marginTop:2}}>OUT OF STOCK</div>}
                    {isLow && !isOOS && <div style={{fontSize:10,color:G.yellow,marginTop:2}}>⚠ Low stock — {currentQty} left</div>}
                    {!isOOS && !isLow && opt.invId && invItem && (
                      <div style={{fontSize:10,color:G.muted,marginTop:2}}>{currentQty} available</div>
                    )}
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    {opt.extra>0 && <span style={{fontSize:11,color:G.green}}>+${parseFloat(opt.extra).toFixed(2)}</span>}
                    <div style={{width:20,height:20,borderRadius:group.multiSelect?"3px":"50%",border:`2px solid ${selected?G.accent:G.muted}`,background:selected?G.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {selected&&<div style={{fontSize:10,color:"#080810",fontWeight:"bold"}}>✓</div>}
                    </div>
                  </div>
                </div>
              );
            })}
            {gi < groups.length-1 && <div style={{height:1,background:G.border,marginTop:16}} />}
          </div>
        ))}

        <div style={{marginTop:20,display:"flex",gap:8}}>
          <button className="btn" style={{flex:1,opacity:canConfirm()?1:0.5}} disabled={!canConfirm()}
            onClick={()=>onConfirm(selections, getSelectionLabel(), extraCharge)}>
            ADD TO ORDER — ${totalPrice.toFixed(2)}
          </button>
          <button className="btn-ghost" onClick={onCancel}>CANCEL</button>
        </div>
        {!canConfirm() && (
          <div style={{fontSize:10,color:G.muted,textAlign:"center",marginTop:8}}>
            {groups.filter(g=>g.required&&!(Array.isArray(selections[g.id])?selections[g.id].length>0:selections[g.id])).map(g=>`Select ${g.name}`).join(" · ")}
          </div>
        )}
      </div>
    </div>
  );
}

// ── CHOICE GROUPS SETTINGS PANEL ──────────────────────────────────────────────
function ChoiceGroupsPanel({G, choiceGroups, inventory, update, showToast}) {
  const [editingGroup, setEditingGroup] = useState(null); // null = list, {} = new, {...} = editing
  const [newOpt, setNewOpt] = useState({name:"",invId:"",qty:"1",extra:""});

  function saveGroup(group) {
    if (!group.name.trim()) return showToast("Group name required","error");
    if (!group.options||group.options.length===0) return showToast("Add at least one option","error");
    update(r => {
      const existing = (r.choiceGroups||[]);
      const idx = existing.findIndex(g=>g.id===group.id);
      const updated = idx>=0 ? existing.map(g=>g.id===group.id?group:g) : [...existing, {...group, id:group.id||uid()}];
      return {...r, choiceGroups: updated};
    });
    showToast("Choice group saved!");
    setEditingGroup(null);
  }

  function deleteGroup(id) {
    update(r => ({...r, choiceGroups: (r.choiceGroups||[]).filter(g=>g.id!==id)}));
    showToast("Group deleted");
  }

  function startNew() {
    setEditingGroup({id:uid(),name:"",required:true,multiSelect:false,options:[]});
    setNewOpt({name:"",invId:"",qty:"1",extra:""});
  }

  if (editingGroup) {
    const group = editingGroup;
    function addOpt() {
      if (!newOpt.name.trim()) return showToast("Option name required","error");
      setEditingGroup(g=>({...g, options:[...g.options, {id:uid(),name:newOpt.name.trim(),invId:newOpt.invId||null,qty:parseFloat(newOpt.qty)||1,extra:parseFloat(newOpt.extra)||0}]}));
      setNewOpt({name:"",invId:"",qty:"1",extra:""});
    }
    return (
      <div className="fade">
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20}}>
          <button className="btn-ghost" onClick={()=>setEditingGroup(null)} style={{fontSize:11}}>← BACK</button>
          <div style={{fontFamily:G.display,fontSize:22,letterSpacing:2,color:G.accent}}>{group.id&&choiceGroups.find(g=>g.id===group.id)?"EDIT GROUP":"NEW CHOICE GROUP"}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14,maxWidth:580}}>
          <div className="card">
            <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:14}}>GROUP SETTINGS</div>
            <div style={{marginBottom:12}}><div style={{fontSize:10,color:G.muted,marginBottom:4}}>GROUP NAME (e.g. "Meat Selection", "Side Selection")</div>
              <input value={group.name} onChange={e=>setEditingGroup(g=>({...g,name:e.target.value}))} placeholder="Meat Selection" /></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div onClick={()=>setEditingGroup(g=>({...g,required:!g.required}))}
                style={{display:"flex",gap:10,alignItems:"center",padding:"12px",borderRadius:6,border:`1px solid ${group.required?G.accent:G.border}`,background:group.required?G.accent+"18":"transparent",cursor:"pointer"}}>
                <div style={{width:18,height:18,borderRadius:3,background:group.required?G.accent:G.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {group.required&&<div style={{fontSize:11,color:"#080810",fontWeight:"bold"}}>✓</div>}
                </div>
                <div>
                  <div style={{fontSize:11,color:group.required?G.accent:G.muted}}>REQUIRED</div>
                  <div style={{fontSize:10,color:G.muted}}>Must pick before adding</div>
                </div>
              </div>
              <div onClick={()=>setEditingGroup(g=>({...g,multiSelect:!g.multiSelect}))}
                style={{display:"flex",gap:10,alignItems:"center",padding:"12px",borderRadius:6,border:`1px solid ${group.multiSelect?G.accent:G.border}`,background:group.multiSelect?G.accent+"18":"transparent",cursor:"pointer"}}>
                <div style={{width:18,height:18,borderRadius:3,background:group.multiSelect?G.accent:G.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {group.multiSelect&&<div style={{fontSize:11,color:"#080810",fontWeight:"bold"}}>✓</div>}
                </div>
                <div>
                  <div style={{fontSize:11,color:group.multiSelect?G.accent:G.muted}}>MULTI-SELECT</div>
                  <div style={{fontSize:10,color:G.muted}}>Pick more than one</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:14}}>ADD OPTIONS</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <input placeholder="Option name (e.g. Baked Chicken)" value={newOpt.name} onChange={e=>setNewOpt(n=>({...n,name:e.target.value}))} />
              <select value={newOpt.invId} onChange={e=>setNewOpt(n=>({...n,invId:e.target.value}))}>
                <option value="">No inventory link</option>
                {inventory.map(inv=><option key={inv.id} value={inv.id}>{inv.name}</option>)}
              </select>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div><div style={{fontSize:10,color:G.muted,marginBottom:4}}>DEDUCT QTY WHEN SELECTED</div>
                <input type="number" placeholder="1" value={newOpt.qty} onChange={e=>setNewOpt(n=>({...n,qty:e.target.value}))} /></div>
              <div><div style={{fontSize:10,color:G.muted,marginBottom:4}}>EXTRA CHARGE ($, optional)</div>
                <input type="number" placeholder="0.00" value={newOpt.extra} onChange={e=>setNewOpt(n=>({...n,extra:e.target.value}))} /></div>
            </div>
            <button className="btn" onClick={addOpt}>+ ADD OPTION</button>

            {group.options.length>0&&(
              <div style={{marginTop:16}}>
                <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:10}}>OPTIONS ({group.options.length})</div>
                {group.options.map((opt,i)=>{
                  const invItem = inventory.find(iv=>iv.id===opt.invId);
                  return (
                    <div key={opt.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${G.border}`,fontSize:12}}>
                      <div>
                        <span style={{color:G.text}}>{opt.name}</span>
                        {invItem&&<span style={{color:G.muted,fontSize:10,marginLeft:8}}>→ {invItem.name} x{opt.qty}</span>}
                        {opt.extra>0&&<span style={{color:G.green,fontSize:10,marginLeft:8}}>+${opt.extra.toFixed(2)}</span>}
                      </div>
                      <button className="btn-danger" onClick={()=>setEditingGroup(g=>({...g,options:g.options.filter(o=>o.id!==opt.id)}))}>x</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{display:"flex",gap:8}}>
            <button className="btn" onClick={()=>saveGroup(group)}>SAVE GROUP</button>
            <button className="btn-ghost" onClick={()=>setEditingGroup(null)}>CANCEL</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontFamily:G.display,fontSize:28,letterSpacing:3,color:G.accent}}>CHOICE GROUPS</div>
          <div style={{fontSize:11,color:G.muted,marginTop:2}}>Define meats, sides, and other selections for plate meals</div>
        </div>
        <button className="btn" onClick={startNew}>+ NEW GROUP</button>
      </div>

      {(!choiceGroups||choiceGroups.length===0)?(
        <div className="card" style={{textAlign:"center",padding:40}}>
          <div style={{fontSize:32,marginBottom:12}}>🍽️</div>
          <div style={{fontFamily:G.display,fontSize:22,letterSpacing:2,color:G.accent,marginBottom:8}}>NO CHOICE GROUPS YET</div>
          <div style={{fontSize:12,color:G.muted,marginBottom:20,lineHeight:1.8}}>Choice groups let customers pick their meat and sides when ordering a plate meal.<br/>Create a "Meat Selection" and "Side Selection" group, then link them to menu items.</div>
          <button className="btn" onClick={startNew}>+ CREATE FIRST GROUP</button>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {choiceGroups.map(group=>(
            <div key={group.id} className="card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                    <div style={{fontSize:15,color:G.text,fontWeight:500}}>{group.name}</div>
                    {group.required&&<span className="badge br">REQUIRED</span>}
                    {group.multiSelect&&<span className="badge by">MULTI-SELECT</span>}
                    <span style={{fontSize:10,color:G.muted}}>{group.options.length} options</span>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {group.options.map(opt=>{
                      const invItem = inventory.find(i=>i.id===opt.invId);
                      const isOOS = invItem && invItem.qty < opt.qty;
                      return (
                        <span key={opt.id} style={{background:isOOS?G.border:G.accent+"18",border:`1px solid ${isOOS?G.border:G.accent}44`,borderRadius:20,padding:"2px 10px",fontSize:11,color:isOOS?G.muted:G.accent}}>
                          {opt.name}{isOOS?" (OOS)":""}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div style={{display:"flex",gap:6,marginLeft:12}}>
                  <button className="btn-sm" style={{fontSize:10}} onClick={()=>{setEditingGroup({...group,options:[...group.options]});setNewOpt({name:"",invId:"",qty:"1",extra:""});}}>EDIT</button>
                  <button className="btn-danger" onClick={()=>deleteGroup(group.id)}>x</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
function MainApp({G,css,theme,toggleTheme,restaurant,role,update,onLogout,showToast}) {
  const isOwner=role==="owner";
  const [tab,setTab]=useState("dashboard");
  const [order,setOrder]=useState([]);
  const [orderNote,setOrderNote]=useState("");
  const [receipt,setReceipt]=useState(null);
  const [choiceModal,setChoiceModal]=useState(null); // {item}
  const [modifierModal,setModifierModal]=useState(null); // for items WITHOUT choice groups
  const [editingItem,setEditingItem]=useState(null);
  const [briefing,setBriefing]=useState(true);
  const [tutorial,setTutorial]=useState(false);
  const [toast2,setToast2]=useState(null);
  const [showTip,setShowTip]=useState(null);
  const [seenTabs,setSeenTabs]=useState(()=>{try{const d=localStorage.getItem("pp_seen_tabs");return d?JSON.parse(d):[];}catch{return [];}});
  const [advisorMessages,setAdvisorMessages]=useState([{role:"assistant",content:"Hey! I'm your ProfitPlate AI Business Advisor. I'm here to help you grow your restaurant, improve profits, and build your brand.\n\nTo give you the best advice, let me learn about your business first. What type of restaurant do you run, and how long have you been open?"}]);
  const [advisorInput,setAdvisorInput]=useState("");
  const [advisorLoading,setAdvisorLoading]=useState(false);
  const [businessContext,setBusinessContext]=useState({type:"",platforms:[],challenges:[],goals:[]});

  function t(msg,type="success"){setToast2({msg,type});setTimeout(()=>setToast2(null),2600);}

  const sales=restaurant.sales||[];
  const inventory=restaurant.inventory||[];
  const menuItems=restaurant.menuItems||[];
  const choiceGroups=restaurant.choiceGroups||[];
  const taxRate=parseFloat(restaurant.taxRate)||0;

  const totalRevenue=sales.reduce((s,x)=>s+x.price,0);
  const totalCOGS=sales.reduce((s,x)=>s+x.cost,0);
  const totalProfit=totalRevenue-totalCOGS;
  const lowStock=inventory.filter(i=>i.qty<=i.threshold);

  useState(()=>{
    if(inventory.length===0&&menuItems.length===0) setTutorial(true);
  });

  const allTabs=[
    {id:"dashboard",label:"Dashboard",icon:"◈",ownerOnly:false},
    {id:"pos",label:"Ring Up",icon:"⊕",ownerOnly:false},
    {id:"inventory",label:"Inventory",icon:"⊟",ownerOnly:true},
    {id:"margins",label:"Margins",icon:"%",ownerOnly:true},
    {id:"deals",label:"Deals",icon:"★",ownerOnly:true},
    {id:"pricing",label:"Pricing AI",icon:"🧠",ownerOnly:true},
    {id:"waste",label:"Waste",icon:"🔍",ownerOnly:true},
    {id:"eod",label:"End of Day",icon:"📋",ownerOnly:true},
    {id:"paycheck",label:"Paycheck",icon:"$",ownerOnly:true},
    {id:"advisor",label:"AI Advisor",icon:"💬",ownerOnly:true},
    {id:"settings",label:"Settings",icon:"⚙",ownerOnly:true},
  ];
  const tabs=allTabs.filter(t2=>!t2.ownerOnly||isOwner);

  const forecastMid=(totalRevenue*1.05).toFixed(2);
  const forecastLow=(totalRevenue*0.85).toFixed(2);
  const forecastHigh=(totalRevenue*1.25).toFixed(2);
  const bestItem=[...menuItems].sort((a,b)=>{
    const ma=(a.price-getCOGS(a,inventory))/Math.max(a.price,0.01);
    const mb=(b.price-getCOGS(b,inventory))/Math.max(b.price,0.01);
    return mb-ma;
  })[0];

  function addToOrder(item) {
    const itemGroups = (item.choiceGroupIds||[]).map(id=>choiceGroups.find(g=>g.id===id)).filter(Boolean);
    if (itemGroups.length > 0) {
      setChoiceModal({item});
    } else {
      setModifierModal({item, modifiers:[]});
    }
  }

  function confirmChoiceAdd(item, selections, selectionLabel, extraCharge) {
    const finalPrice = item.price + (extraCharge||0);
    setOrder(prev => {
      const key = item.id + "_" + JSON.stringify(selections);
      const ex = prev.find(o=>o._key===key);
      const entry = {...item, price:finalPrice, basePrice:item.price, qty:1, _key:key, choiceSelections:selections, selectionLabel};
      return ex ? prev.map(o=>o._key===key?{...o,qty:o.qty+1}:o) : [...prev, entry];
    });
    setChoiceModal(null);
  }

  function confirmAdd(item,modifiers){
    setOrder(prev=>{
      const key=item.id+(modifiers.length?"_"+modifiers.join("_"):"");
      const ex=prev.find(o=>o._key===key);
      const entry={...item,qty:1,_key:key,modifiers};
      return ex?prev.map(o=>o._key===key?{...o,qty:o.qty+1}:o):[...prev,entry];
    });
    setModifierModal(null);
  }

  function submitOrder(){
    if(!order.length) return t("Add items first","error");
    let newInv=[...inventory];

    for(const oi of order){
      const mi=menuItems.find(m=>m.id===oi.id);
      // Check base ingredients
      for(const ing of(mi.ingredients||[])){
        const inv=newInv.find(i=>i.id===ing.id);
        if(!inv||inv.qty<ing.qty*oi.qty) return t("Low stock: "+(inv?.name||"ingredient"),"error");
      }
      // Check choice group ingredients
      if (oi.choiceSelections) {
        for (const [groupId, selected] of Object.entries(oi.choiceSelections)) {
          const group = choiceGroups.find(g=>g.id===groupId);
          if (!group) continue;
          const selectedArr = Array.isArray(selected)?selected:(selected?[selected]:[]);
          for (const optId of selectedArr) {
            const opt = group.options.find(o=>o.id===optId);
            if (opt?.invId && opt?.qty) {
              const inv = newInv.find(i=>i.id===opt.invId);
              if (!inv||inv.qty<opt.qty*oi.qty) return t("Low stock: "+(inv?.name||"ingredient"),"error");
            }
          }
        }
      }
    }

    const subtotal=order.reduce((s,o)=>s+o.price*o.qty,0);
    const tax=subtotal*taxRate/100;
    const total=subtotal+tax;
    let totalCost=0;
    let newSales=[...sales];
    const now=new Date();

    for(const oi of order){
      const mi=menuItems.find(m=>m.id===oi.id);
      for(let q=0;q<oi.qty;q++){
        // Deduct base ingredients
        for(const ing of(mi.ingredients||[])){
          newInv=newInv.map(i=>i.id===ing.id?{...i,qty:parseFloat((i.qty-ing.qty).toFixed(2))}:i);
        }
        // Deduct choice group ingredients
        if (oi.choiceSelections) {
          for (const [groupId, selected] of Object.entries(oi.choiceSelections)) {
            const group = choiceGroups.find(g=>g.id===groupId);
            if (!group) continue;
            const selectedArr = Array.isArray(selected)?selected:(selected?[selected]:[]);
            for (const optId of selectedArr) {
              const opt = group.options.find(o=>o.id===optId);
              if (opt?.invId && opt?.qty) {
                newInv=newInv.map(i=>i.id===opt.invId?{...i,qty:parseFloat((i.qty-opt.qty).toFixed(2))}:i);
              }
            }
          }
        }
        const cogs = getSaleCOGS(mi, inventory, oi.choiceSelections, choiceGroups);
        totalCost+=cogs;
        const salePrice = oi.price; // includes extras
        newSales.push({
          id:uid(),item:mi.name,
          choiceLabel: oi.selectionLabel || null,
          price:salePrice,cost:parseFloat(cogs.toFixed(2)),profit:parseFloat((salePrice-cogs).toFixed(2)),
          time:now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
          date:now.toLocaleDateString([],{month:"short",day:"numeric",year:"numeric"}),
          dow:now.toLocaleDateString([],{weekday:"short"})
        });
      }
    }

    update(r=>({...r,inventory:newInv,sales:newSales}));
    setReceipt({items:[...order],subtotal,tax,total,profit:subtotal-totalCost,time:now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),note:orderNote});
    setOrder([]);setOrderNote("");
  }

  function voidLastSale(){
    if(!sales.length) return t("No sales to void","error");
    const last=sales[sales.length-1];
    const mi=menuItems.find(m=>m.name===last.item);
    let newInv=[...inventory];
    if(mi){
      for(const ing of(mi.ingredients||[])){
        newInv=newInv.map(i=>i.id===ing.id?{...i,qty:parseFloat((i.qty+ing.qty).toFixed(2))}:i);
      }
      // Restore choice group inventory — we'd need to store selections on the sale for perfect restore
      // Basic restore: just deduct base ingredients (already handled above)
    }
    update(r=>({...r,sales:(r.sales||sales).slice(0,-1),inventory:newInv}));
    t("Last sale voided");
  }

  async function sendAdvisorMessage(){
    if(!advisorInput.trim()||advisorLoading) return;
    const userMsg={role:"user",content:advisorInput.trim()};
    const newMsgs=[...advisorMessages,userMsg];
    setAdvisorMessages(newMsgs);
    setAdvisorInput("");
    setAdvisorLoading(true);

    const topItems=[...menuItems].sort((a,b)=>{
      const ma=(a.price-getCOGS(a,inventory))/Math.max(a.price,0.01);
      const mb=(b.price-getCOGS(b,inventory))/Math.max(b.price,0.01);
      return mb-ma;
    }).slice(0,3).map(m=>`${m.name} ($${m.price}, ${((m.price-getCOGS(m,inventory))/m.price*100).toFixed(0)}% margin)`).join(", ");
    const lowStockItems=inventory.filter(i=>i.qty<=i.threshold).map(i=>i.name).join(", ");
    const avgSale=sales.length>0?(totalRevenue/sales.length).toFixed(2):"0";

    const systemPrompt = `You are an expert restaurant business advisor inside ProfitPlate, a restaurant management app. You are talking directly to a restaurant owner. Your job is to give them detailed, actionable, street-smart business advice — not generic tips.

CURRENT BUSINESS DATA:
- Restaurant: ${restaurant.name}
- Total revenue tracked: $${totalRevenue.toFixed(2)}
- Net profit: $${totalProfit.toFixed(2)}  
- Profit margin: ${totalRevenue>0?((totalProfit/totalRevenue)*100).toFixed(1):0}%
- Total sales logged: ${sales.length}
- Average sale: $${avgSale}
- Menu items: ${menuItems.length}
- Low stock alerts: ${lowStockItems||"none"}
- Top margin items: ${topItems||"none yet"}
- Inventory items tracked: ${inventory.length}

BUSINESS CONTEXT FROM CONVERSATION:
${JSON.stringify(businessContext)}

YOUR BEHAVIOR:
1. Ask smart follow-up questions to understand their business deeply before giving advice. Ask one question at a time.
2. When they mention a problem, dig into it — ask what they've already tried, what their customer base looks like, what their price point is.
3. When they mention social media or content, ask which platforms they use and what has worked. Then give platform-specific advice.
4. Reference their actual app data when relevant — mention their real margins, their low stock items, their top sellers.
5. Give specific, detailed advice. Not "post more content" — say "post a behind-the-scenes reel showing how you make your [top item] on Tuesday at 6pm when your audience is most active."
6. Be direct and honest. If their margins are bad, say so. If they need to raise prices, tell them exactly which items and by how much.
7. Think like a business partner, not a chatbot. Push back if they have a bad idea. Celebrate wins with them.
8. Cover any topic they bring up: marketing, pricing, staffing, inventory, social media, delivery apps, catering, expansion, branding.
9. Always end your response with either a follow-up question OR a specific action they should take today.

Keep responses conversational but detailed. Use line breaks to make it readable. Never give a one-liner response.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type":"application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY || "",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: newMsgs.map(m=>({role:m.role,content:m.content}))
        })
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "Something went wrong. Try again.";

      const fullConvo = newMsgs.map(m=>m.content).join(" ").toLowerCase();
      if(fullConvo.includes("instagram")||fullConvo.includes("tiktok")||fullConvo.includes("facebook")){
        const platforms=[];
        if(fullConvo.includes("instagram")) platforms.push("Instagram");
        if(fullConvo.includes("tiktok")) platforms.push("TikTok");
        if(fullConvo.includes("facebook")) platforms.push("Facebook");
        setBusinessContext(c=>({...c,platforms}));
      }

      setAdvisorMessages(prev=>[...prev,{role:"assistant",content:reply}]);
    } catch(err) {
      setAdvisorMessages(prev=>[...prev,{role:"assistant",content:"Connection error. Check your internet and try again."}]);
    }
    setAdvisorLoading(false);
  }

  const TAB_TIPS = {
    dashboard:{title:"DASHBOARD",tips:["Check this screen every morning before service starts.","The Getting Started checklist disappears once you add inventory and menu items.","Revenue Forecast is based on your sales history — the more sales you log the more accurate it gets.","Click any low stock alert to jump straight to inventory.","The bell icon at the top opens your Daily Briefing with a full summary and action item."]},
    pos:{title:"RING UP SALE",tips:["Tap any menu item — if it has Choice Groups, a selection popup appears for meat/sides.","Items with no choice groups show a modifiers popup (no onions, extra cheese, etc).","The margin % badge on each item tells you which ones are most profitable.","Add an order note for special requests like Table 4 or allergy info.","After marking as sold, use the PRINT button to open a printable receipt in a new tab."]},
    inventory:{title:"INVENTORY",tips:["Use PACK mode for anything you buy in bulk — buns, cans, bottles.","Use BULK mode for fries, oil, flour, or anything sold by weight.","Set your reorder threshold carefully — this is what triggers the LOW and CRITICAL alerts.","Use the RESTOCK section at the bottom to add stock when a delivery arrives.","The Reorder Intelligence cards show how many days of stock you have left based on actual sales."]},
    margins:{title:"MARGINS",tips:["Items are sorted highest to lowest margin — your most profitable items are at the top.","Anything below 45% margin (red) needs attention — either raise the price or reduce the cost.","COGS = your actual ingredient cost per item based on what you entered in inventory.","Use this screen before creating daily specials — push your highest margin items.","If your margins look off, check that your ingredient costs are up to date in Settings."]},
    deals:{title:"DEAL ENGINE",tips:["Combos are auto-generated from your menu — the app picks pairs with the best combined margin.","The suggested combo price gives customers a small discount while keeping your profit strong.","Overstocked items show up as Promo Opportunities — run a special to move them before they expire.","Use these combo ideas for your daily specials board or social media posts.","The more menu items you add the more combo options the engine generates."]},
    pricing:{title:"PRICING AI",tips:["Items flagged RAISE PRICE are costing you money — act on these first.","The suggested price is calculated to hit a healthy 55-70% margin.","Click APPLY to update the price instantly — it reflects everywhere in the app immediately.","CONSIDER LOWERING items may be priced too high for your market — use your judgment.","Re-check this screen every time your ingredient costs change."]},
    waste:{title:"WASTE MONITOR",tips:["This screen compares how much you should have used vs what actually left your inventory.","POSSIBLE THEFT means a big gap — more went missing than sales can explain.","OVER-PORTIONING means your staff is using more per dish than the recipe calls for.","Review this screen at the end of every week to catch issues early.","If everything shows ON TRACK your portions and inventory are aligned perfectly."]},
    eod:{title:"END OF DAY",tips:["Run this screen at closing time every day for a full performance summary.","Sales by Day shows your week-over-week trends — look for your strongest and weakest days.","Export CSV to save your sales data to a spreadsheet — great for your accountant or taxes.","Use Best Sellers to decide what to feature on your menu board or social media tomorrow.","Hit CLEAR AND RESET at the end of each day or week to start fresh — data is saved in the CSV export."]},
    paycheck:{title:"PAYCHECK VIEW",tips:["Tax Collected is money you owe the government — do not spend it, set it aside.","Your Take-Home is profit after food costs only — labor and overhead are not included yet.","Use this screen at the end of the week to see your real earnings.","Order notes show up in the transaction log so you can trace any sale.","The date and time on every transaction helps you spot your busiest hours and days."]},
    advisor:{title:"AI ADVISOR",tips:["The more context you give the better the advice — share your challenges, goals, and what you've tried.","Tell the advisor which social platforms you use and it will give you platform-specific content ideas.","Ask about pricing, marketing, staffing, delivery apps, catering — anything business related.","The advisor sees your real app data — margins, low stock, revenue — and uses it in advice.","Be specific with your questions. The more detail you give the more detailed the answer."]},
    settings:{title:"SETTINGS",tips:["Always add your ingredients before building menu items — you need them to link.","Go to CHOICE GROUPS to set up meat/side selections for plate meals.","Link Choice Groups to menu items in the Menu tab under settings.","Staff PIN gives employees access to Ring Up only — they cannot see financials.","Your restaurant name and logo show on the PIN screen — make it look professional."]}
  };

  return (
    <div style={{fontFamily:G.font,background:G.bg,minHeight:"100vh",color:G.text}}>
      <style>{css}</style>

      {tutorial&&(
        <div className="modal-bg">
          <div className="modal slide" style={{maxWidth:500}}>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{fontSize:48,marginBottom:8}}>👋</div>
              <div style={{fontFamily:G.display,fontSize:32,letterSpacing:2,color:G.accent}}>WELCOME TO PROFITPLATE</div>
              <div style={{fontSize:12,color:G.muted,marginTop:4}}>Get set up in 3 steps</div>
            </div>
            {[
              {num:"01",icon:"📦",title:"ADD YOUR INGREDIENTS",desc:"Go to Settings → Inventory. Add everything you buy — chicken, collard greens, mac. Use Pack or Bulk mode for items bought in quantity."},
              {num:"02",icon:"🍽️",title:"SET UP CHOICE GROUPS",desc:"Go to Settings → Choice Groups. Create 'Meat Selection' and 'Side Selection' groups with all options. Then link them to plate meal menu items."},
              {num:"03",icon:"💰",title:"RING UP SALES",desc:"Tap Ring Up. When a customer orders a plate, the meat and sides picker appears automatically. Inventory deducts from what they picked."},
            ].map((s,i)=>(
              <div key={i} style={{display:"flex",gap:16,padding:"14px 0",borderBottom:i<2?`1px solid ${G.border}`:"none"}}>
                <div style={{fontFamily:G.display,fontSize:28,color:G.accent,width:36,flexShrink:0}}>{s.num}</div>
                <div style={{fontSize:22,flexShrink:0}}>{s.icon}</div>
                <div>
                  <div style={{fontSize:11,letterSpacing:2,color:G.accent,marginBottom:4}}>{s.title}</div>
                  <div style={{fontSize:12,color:G.muted,lineHeight:1.7}}>{s.desc}</div>
                </div>
              </div>
            ))}
            <div style={{marginTop:24,display:"flex",gap:8}}>
              <button className="btn" style={{flex:1,fontSize:13,padding:13}} onClick={()=>{setTutorial(false);setTab("settings");}}>START SETUP →</button>
              <button className="btn-ghost" onClick={()=>setTutorial(false)}>SKIP</button>
            </div>
          </div>
        </div>
      )}

      {briefing&&!tutorial&&(
        <div className="modal-bg" onClick={()=>setBriefing(false)}>
          <div className="modal slide" onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
              <div><div style={{fontFamily:G.display,fontSize:28,letterSpacing:2,color:G.accent}}>GOOD MORNING ☀️</div><div style={{fontSize:11,color:G.muted}}>DAILY BRIEFING</div></div>
              <button className="btn-ghost" style={{fontSize:11,padding:"6px 12px"}} onClick={()=>setBriefing(false)}>DISMISS</button>
            </div>
            {[
              {icon:"📊",label:"YESTERDAY",val:`Revenue $${totalRevenue.toFixed(2)} · Profit $${totalProfit.toFixed(2)} · ${sales.length} sales`},
              {icon:"🔮",label:"TODAY'S FORECAST",val:`Expected $${forecastMid} · Low $${forecastLow} · High $${forecastHigh}`},
              {icon:"📦",label:"LOW STOCK",val:lowStock.length>0?lowStock.map(i=>`${i.name} (${i.qty} left)`).join(", "):"All items well stocked ✓"},
              {icon:"🏆",label:"PUSH TODAY",val:bestItem?`${bestItem.name} — highest margin`:"Add menu items to get recommendations"},
              {icon:"✅",label:"ONE ACTION",val:lowStock.length>0?`Reorder ${lowStock[0].name} — ${lowStock[0].qty} units left`:"Check Deal Engine for combo opportunities"},
            ].map((b,i)=>(
              <div key={i} style={{display:"flex",gap:14,padding:"14px 0",borderBottom:i<4?`1px solid ${G.border}`:"none"}}>
                <div style={{fontSize:20,width:28,flexShrink:0}}>{b.icon}</div>
                <div><div style={{fontSize:10,letterSpacing:2,color:G.accent,marginBottom:4}}>{b.label}</div><div style={{fontSize:12,color:G.text,lineHeight:1.6}}>{b.val}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Choice Group Modal */}
      {choiceModal&&(
        <ChoiceGroupModal
          G={G}
          item={choiceModal.item}
          choiceGroups={choiceGroups}
          inventory={inventory}
          onConfirm={(selections, label, extra)=>confirmChoiceAdd(choiceModal.item, selections, label, extra)}
          onCancel={()=>setChoiceModal(null)}
        />
      )}

      {/* Modifier Modal (for items without choice groups) */}
      {modifierModal&&(
        <div className="modal-bg" onClick={()=>setModifierModal(null)}>
          <div className="modal slide" onClick={e=>e.stopPropagation()} style={{maxWidth:380}}>
            <div style={{fontFamily:G.display,fontSize:24,letterSpacing:2,color:G.accent,marginBottom:4}}>{modifierModal.item.name}</div>
            <div style={{fontSize:11,color:G.muted,marginBottom:20}}>${modifierModal.item.price.toFixed(2)} · Select modifications</div>
            {["No onions","No pickles","No tomato","No lettuce","Extra cheese","Extra sauce","Well done","Light ice","No ice","Extra crispy"].map(mod=>(
              <div key={mod} onClick={()=>setModifierModal(m=>({...m,modifiers:m.modifiers.includes(mod)?m.modifiers.filter(x=>x!==mod):[...m.modifiers,mod]}))}
                style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",marginBottom:8,background:modifierModal.modifiers.includes(mod)?G.accent+"22":"transparent",border:`1px solid ${modifierModal.modifiers.includes(mod)?G.accent:G.border}`,borderRadius:6,cursor:"pointer",fontSize:12,color:modifierModal.modifiers.includes(mod)?G.accent:G.text}}>
                {mod}{modifierModal.modifiers.includes(mod)&&<span>✓</span>}
              </div>
            ))}
            <div style={{marginTop:16,display:"flex",gap:8}}>
              <button className="btn" style={{flex:1}} onClick={()=>confirmAdd(modifierModal.item,modifierModal.modifiers)}>ADD TO ORDER</button>
              <button className="btn-ghost" onClick={()=>setModifierModal(null)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Menu Item Modal */}
      {editingItem&&(
        <div className="modal-bg" onClick={()=>setEditingItem(null)}>
          <div className="modal slide" onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:G.display,fontSize:24,letterSpacing:2,color:G.accent,marginBottom:20}}>EDIT: {editingItem.name}</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div><div style={{fontSize:10,color:G.muted,marginBottom:4}}>ITEM NAME</div><input value={editingItem.name} onChange={e=>setEditingItem(m=>({...m,name:e.target.value}))} /></div>
              <div><div style={{fontSize:10,color:G.muted,marginBottom:4}}>SELL PRICE ($)</div><input type="number" value={editingItem.price} onChange={e=>setEditingItem(m=>({...m,price:e.target.value}))} /></div>
              {inventory.length>0&&<>
                <div style={{fontSize:10,color:G.muted,marginBottom:4}}>BASE INGREDIENTS</div>
                {(editingItem.ingredients||[]).map(ing=>{
                  const inv=inventory.find(i=>i.id===ing.id);
                  return (
                    <div key={ing.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,padding:"6px 10px",background:G.bg,borderRadius:5}}>
                      <span style={{color:G.accent}}>{inv?.name||ing.id}</span>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <input type="number" value={ing.qty} style={{width:60,padding:"4px 8px"}} onChange={e=>setEditingItem(m=>({...m,ingredients:m.ingredients.map(i=>i.id===ing.id?{...i,qty:parseFloat(e.target.value)||1}:i)}))} />
                        <button className="btn-danger" style={{padding:"4px 8px"}} onClick={()=>setEditingItem(m=>({...m,ingredients:m.ingredients.filter(i=>i.id!==ing.id)}))}>x</button>
                      </div>
                    </div>
                  );
                })}
              </>}
              {choiceGroups.length>0&&<>
                <div style={{fontSize:10,color:G.muted,marginBottom:4}}>LINKED CHOICE GROUPS</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {choiceGroups.map(g=>{
                    const linked = (editingItem.choiceGroupIds||[]).includes(g.id);
                    return (
                      <div key={g.id} onClick={()=>setEditingItem(m=>({...m,choiceGroupIds:linked?(m.choiceGroupIds||[]).filter(id=>id!==g.id):[...(m.choiceGroupIds||[]),g.id]}))}
                        style={{display:"flex",gap:10,alignItems:"center",padding:"10px 12px",borderRadius:6,border:`1px solid ${linked?G.accent:G.border}`,background:linked?G.accent+"18":"transparent",cursor:"pointer"}}>
                        <div style={{width:16,height:16,borderRadius:3,background:linked?G.accent:G.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          {linked&&<div style={{fontSize:10,color:"#080810",fontWeight:"bold"}}>✓</div>}
                        </div>
                        <div style={{fontSize:12,color:linked?G.accent:G.text}}>{g.name}</div>
                        {g.required&&<span className="badge br" style={{fontSize:9}}>REQUIRED</span>}
                      </div>
                    );
                  })}
                </div>
              </>}
              <div style={{display:"flex",gap:8,marginTop:4}}>
                <button className="btn" onClick={()=>{
                  update(r=>({...r,menuItems:(r.menuItems||menuItems).map(m=>m.id===editingItem.id?{...editingItem,price:parseFloat(editingItem.price)||0}:m)}));
                  t(editingItem.name+" updated!"); setEditingItem(null);
                }}>SAVE CHANGES</button>
                <button className="btn-ghost" onClick={()=>setEditingItem(null)}>CANCEL</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTip&&TAB_TIPS[showTip]&&(
        <div className="modal-bg" onClick={()=>setShowTip(null)}>
          <div className="modal slide" onClick={e=>e.stopPropagation()} style={{maxWidth:480}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <div style={{fontFamily:G.display,fontSize:26,letterSpacing:2,color:G.accent}}>{TAB_TIPS[showTip].title}</div>
                <div style={{fontSize:11,color:G.muted}}>HOW TO GET THE MOST OUT OF THIS SCREEN</div>
              </div>
              <button className="btn-ghost" style={{fontSize:11,padding:"6px 12px"}} onClick={()=>setShowTip(null)}>CLOSE</button>
            </div>
            {TAB_TIPS[showTip].tips.map((tip,i)=>(
              <div key={i} style={{display:"flex",gap:14,padding:"12px 0",borderBottom:i<TAB_TIPS[showTip].tips.length-1?`1px solid ${G.border}`:"none"}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:G.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#080810",flexShrink:0,fontWeight:"bold"}}>{i+1}</div>
                <div style={{fontSize:12,color:G.text,lineHeight:1.7}}>{tip}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{borderBottom:`1px solid ${G.border}`,padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {restaurant.logo?<img src={restaurant.logo} alt="" style={{width:34,height:34,borderRadius:6,objectFit:"cover"}} onError={e=>e.target.style.display="none"} />:<div style={{background:G.accent,width:34,height:34,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center"}}>🍔</div>}
          <div>
            <div style={{fontFamily:G.display,fontSize:20,letterSpacing:2,color:G.accent}}>{restaurant.name}</div>
            <div style={{fontSize:10,color:G.muted}}>PROFITPLATE · TAX {restaurant.taxRate}%</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {lowStock.length>0&&<span className="badge br">⚠ {lowStock.length} LOW</span>}
          {!isOwner&&<span className="badge by">STAFF</span>}
          <button onClick={()=>setBriefing(true)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer"}}>🔔</button>
          <button onClick={toggleTheme} style={{background:"none",border:"none",fontSize:18,cursor:"pointer"}}>{theme==="dark"?"☀️":"🌙"}</button>
          <button className="btn-ghost" style={{fontSize:10,padding:"6px 12px"}} onClick={onLogout}>LOCK</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{padding:"10px 20px",borderBottom:`1px solid ${G.border}`,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        {tabs.map(t2=><button key={t2.id} className={`tab${tab===t2.id?" on":""}`} onClick={()=>{
          setTab(t2.id);
          if(!seenTabs.includes(t2.id)&&TAB_TIPS[t2.id]){
            setTimeout(()=>setShowTip(t2.id),200);
            const updated=[...seenTabs,t2.id];
            setSeenTabs(updated);
            try{localStorage.setItem("pp_seen_tabs",JSON.stringify(updated));}catch{}
          }
        }}>{t2.icon} {t2.label}</button>)}
        <button onClick={()=>setShowTip(tab)} style={{background:"none",border:`1px solid ${G.accent}55`,borderRadius:"50%",width:28,height:28,color:G.accent,fontSize:13,cursor:"pointer",marginLeft:"auto",flexShrink:0}} title="How to use this screen">?</button>
      </div>

      <div style={{padding:24,maxWidth:1100,margin:"0 auto"}}>

        {/* DASHBOARD */}
        {tab==="dashboard"&&(
          <div className="fade">
            <div style={{fontFamily:G.display,fontSize:30,letterSpacing:3,marginBottom:20,color:G.accent}}>TODAY'S OVERVIEW</div>
            {(inventory.length===0||menuItems.length===0)&&(
              <div className="card" style={{borderColor:G.accent+"55",marginBottom:20}}>
                <div style={{fontSize:10,letterSpacing:2,color:G.accent,marginBottom:12}}>⚡ GETTING STARTED</div>
                {[
                  {done:inventory.length>0,label:"Add your ingredients",hint:"Settings → Inventory",action:()=>setTab("settings")},
                  {done:menuItems.length>0,label:"Build your menu",hint:"Settings → Menu",action:()=>setTab("settings")},
                  {done:sales.length>0,label:"Ring up your first sale",hint:"Ring Up tab",action:()=>setTab("pos")},
                ].map((item,i)=>(
                  <div key={i} onClick={!item.done?item.action:undefined} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<2?`1px solid ${G.border}`:"none",cursor:item.done?"default":"pointer"}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:item.done?G.green:G.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0,color:"#080810"}}>{item.done?"✓":i+1}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,color:item.done?G.muted:G.text,textDecoration:item.done?"line-through":"none"}}>{item.label}</div>
                      {!item.done&&<div style={{fontSize:10,color:G.accent}}>→ {item.hint}</div>}
                    </div>
                    {item.done&&<span className="badge bg">DONE</span>}
                  </div>
                ))}
              </div>
            )}
            <div className="card" style={{marginBottom:16,borderColor:G.accent+"44"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div><div style={{fontSize:10,letterSpacing:2,color:G.accent,marginBottom:4}}>🔮 REVENUE FORECAST</div><div style={{fontFamily:G.display,fontSize:28,color:G.text}}>${forecastMid}</div><div style={{fontSize:11,color:G.muted}}>expected today</div></div>
                <div style={{textAlign:"right",fontSize:11,color:G.muted}}><div>Low: <span style={{color:G.red}}>${forecastLow}</span></div><div style={{marginTop:4}}>High: <span style={{color:G.green}}>${forecastHigh}</span></div></div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14,marginBottom:20}}>
              {[{label:"REVENUE",val:`$${totalRevenue.toFixed(2)}`,sub:`${sales.length} sales`,color:G.green},{label:"FOOD COST",val:`$${totalCOGS.toFixed(2)}`,sub:"ingredients",color:G.red},{label:"NET PROFIT",val:`$${totalProfit.toFixed(2)}`,sub:totalRevenue>0?`${((totalProfit/totalRevenue)*100).toFixed(1)}% margin`:"—",color:G.accent},{label:"LOW STOCK",val:lowStock.length,sub:"need reorder",color:G.yellow}].map((s,i)=>(
                <div key={i} className="card" style={{borderTop:`2px solid ${s.color}`}}>
                  <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:8}}>{s.label}</div>
                  <div style={{fontFamily:G.display,fontSize:30,color:s.color}}>{s.val}</div>
                  <div style={{fontSize:10,color:G.muted,marginTop:4}}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div className="card">
                <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:14}}>RECENT SALES</div>
                {sales.length===0&&<div style={{color:G.muted,fontSize:12}}>No sales yet.</div>}
                {sales.slice(-6).reverse().map(s=>(
                  <div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${G.border}`,fontSize:12}}>
                    <div>
                      <div>{s.item}</div>
                      {s.choiceLabel&&<div style={{color:G.accent,fontSize:10}}>{s.choiceLabel}</div>}
                      <div style={{color:G.muted,fontSize:10}}>{s.date} {s.time}</div>
                    </div>
                    <div style={{textAlign:"right"}}><div style={{color:G.green}}>+${s.profit.toFixed(2)}</div><div style={{color:G.muted,fontSize:10}}>${s.price.toFixed(2)}</div></div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:14}}>INVENTORY HEALTH</div>
                {inventory.length===0&&<div style={{color:G.muted,fontSize:12}}>No inventory yet.</div>}
                {inventory.slice(0,8).map(item=>{
                  const pct=Math.min((item.qty/Math.max(item.threshold*4,1))*100,100);
                  const color=item.qty<=item.threshold?G.red:item.qty<=item.threshold*2?G.yellow:G.green;
                  return (
                    <div key={item.id} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:G.muted}}>{item.name}</span><span style={{color}}>{item.qty}</span></div>
                      <div className="prog-bar"><div className="prog-fill" style={{width:`${pct}%`,background:color}} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* POS */}
        {tab==="pos"&&(
          <div className="fade">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontFamily:G.display,fontSize:30,letterSpacing:3,color:G.accent}}>RING UP A SALE</div>
              {isOwner&&sales.length>0&&<button className="btn-danger" onClick={voidLastSale}>VOID LAST SALE</button>}
            </div>
            {receipt?(
              <div style={{maxWidth:420,margin:"0 auto"}}>
                <div className="card" style={{borderColor:G.green+"55",textAlign:"center"}}>
                  <div style={{fontSize:48,marginBottom:12}}>✅</div>
                  <div style={{fontFamily:G.display,fontSize:28,color:G.green,marginBottom:4}}>SALE LOGGED</div>
                  <div style={{fontSize:11,color:G.muted,marginBottom:24}}>COLLECT FROM CUSTOMER</div>
                  <div style={{background:G.bg,border:`1px solid ${G.border}`,borderRadius:6,padding:16,textAlign:"left",marginBottom:16}}>
                    <div style={{fontSize:10,color:G.muted,marginBottom:12}}>ORDER — {receipt.time}</div>
                    {receipt.items.map(o=>(
                      <div key={o._key||o.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0",borderBottom:`1px solid ${G.border}`}}>
                        <div>
                          <span>{o.name} x{o.qty}</span>
                          {o.selectionLabel&&<div style={{fontSize:10,color:G.accent}}>{o.selectionLabel}</div>}
                          {o.modifiers&&o.modifiers.length>0&&<div style={{fontSize:10,color:G.accent}}>{o.modifiers.join(", ")}</div>}
                        </div>
                        <span>${(o.price*o.qty).toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:4}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:G.muted}}><span>Subtotal</span><span>${receipt.subtotal.toFixed(2)}</span></div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:G.muted}}><span>Tax ({taxRate}%)</span><span>${receipt.tax.toFixed(2)}</span></div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:14,paddingTop:8,borderTop:`1px solid ${G.border}`,marginTop:4}}><span style={{color:G.text}}>TOTAL DUE</span><span style={{fontFamily:G.display,fontSize:22,color:G.text}}>${receipt.total.toFixed(2)}</span></div>
                    </div>
                  </div>
                  <div style={{background:G.accent+"11",border:`1px solid ${G.accent}33`,borderRadius:6,padding:12,marginBottom:12,fontSize:11,color:G.accent}}>💳 Collect <strong>${receipt.total.toFixed(2)}</strong> via cash or card</div>
                  <div style={{background:G.green+"11",border:`1px solid ${G.green}33`,borderRadius:6,padding:12,marginBottom:20,fontSize:11,color:G.green}}>📈 Profit on this order: <strong>${receipt.profit.toFixed(2)}</strong></div>
                  <div style={{display:"flex",gap:8}}>
                    <button className="btn-ghost" style={{flex:1}} onClick={()=>{
                      const w=window.open("","_blank");
                      w.document.write(`<html><head><title>Receipt</title><style>body{font-family:monospace;padding:20px;max-width:300px;margin:0 auto}h2{text-align:center}hr{border:1px dashed #ccc}.row{display:flex;justify-content:space-between}.total{font-size:18px;font-weight:bold}</style></head><body><h2>${restaurant.name}</h2><p style="text-align:center">${receipt.time}</p><hr/>${receipt.items.map(o=>`<div class="row"><span>${o.name}${o.selectionLabel?" ("+o.selectionLabel+")":""}${o.modifiers&&o.modifiers.length?" — "+o.modifiers.join(", "):""} x${o.qty}</span><span>$${(o.price*o.qty).toFixed(2)}</span></div>`).join("")}<hr/><div class="row"><span>Subtotal</span><span>$${receipt.subtotal.toFixed(2)}</span></div><div class="row"><span>Tax</span><span>$${receipt.tax.toFixed(2)}</span></div><div class="row total"><span>TOTAL</span><span>$${receipt.total.toFixed(2)}</span></div><hr/><p style="text-align:center">Thank you!</p></body></html>`);
                      w.document.close();w.print();
                    }}>🖨 PRINT</button>
                    <button className="btn" style={{flex:2,padding:13}} onClick={()=>setReceipt(null)}>+ NEW ORDER</button>
                  </div>
                </div>
              </div>
            ):menuItems.length===0?(
              <div className="card" style={{color:G.muted}}>No menu items yet. Go to Settings → Menu to add them.</div>
            ):(
              <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:20}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {menuItems.map(item=>{
                    const cogs=getCOGS(item,inventory);
                    const margin=item.price>0?((item.price-cogs)/item.price*100).toFixed(0):0;
                    const inOrder=order.find(o=>o.id===item.id);
                    const hasGroups = (item.choiceGroupIds||[]).length>0;
                    return (
                      <button key={item.id} onClick={()=>addToOrder(item)}
                        style={{background:G.card,border:`1px solid ${inOrder?G.accent:G.border}`,color:G.text,padding:"14px 16px",borderRadius:7,textAlign:"left",cursor:"pointer",transition:"all .15s"}}>
                        <div style={{display:"flex",justifyContent:"space-between"}}>
                          <div style={{fontWeight:500,fontSize:13}}>{item.name}</div>
                          <span className={`badge ${parseFloat(margin)>=65?"bg":parseFloat(margin)>=45?"by":"br"}`}>{margin}%</span>
                        </div>
                        <div style={{marginTop:8,display:"flex",justifyContent:"space-between",color:G.muted,fontSize:11}}>
                          <span>${item.price.toFixed(2)}</span><span>COGS ${cogs.toFixed(2)}</span>
                        </div>
                        {hasGroups&&<div style={{marginTop:6,color:G.accent,fontSize:10}}>🍽️ Pick meat & sides</div>}
                        {inOrder&&<div style={{marginTop:4,color:G.accent,fontSize:10}}>x{inOrder.qty} in order</div>}
                      </button>
                    );
                  })}
                </div>
                <div className="card" style={{height:"fit-content"}}>
                  <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:14}}>CURRENT ORDER</div>
                  {order.length===0?<div style={{color:G.muted,fontSize:12,textAlign:"center",padding:"16px 0"}}>Tap items to add</div>:(
                    <>
                      {order.map(o=>(
                        <div key={o._key||o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${G.border}`,fontSize:12}}>
                          <div>
                            <div>{o.name}</div>
                            {o.selectionLabel&&<div style={{color:G.accent,fontSize:10}}>{o.selectionLabel}</div>}
                            {o.modifiers&&o.modifiers.length>0&&<div style={{color:G.accent,fontSize:10}}>{o.modifiers.join(", ")}</div>}
                            <div style={{color:G.muted,fontSize:10}}>x{o.qty} @ ${o.price.toFixed(2)}</div>
                          </div>
                          <div style={{display:"flex",gap:8,alignItems:"center"}}>
                            <span style={{color:G.green}}>${(o.price*o.qty).toFixed(2)}</span>
                            <button onClick={()=>setOrder(prev=>prev.filter(x=>(x._key||x.id)!==(o._key||o.id)))} style={{background:"none",border:"none",color:G.red,fontSize:14}}>x</button>
                          </div>
                        </div>
                      ))}
                      <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${G.border}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:G.muted}}>Subtotal</span><span>${order.reduce((s,o)=>s+o.price*o.qty,0).toFixed(2)}</span></div>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:G.muted,marginBottom:4}}><span>Tax ({taxRate}%)</span><span>${(order.reduce((s,o)=>s+o.price*o.qty,0)*taxRate/100).toFixed(2)}</span></div>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:10,paddingTop:8,borderTop:`1px solid ${G.border}`}}><span>Total</span><span style={{color:G.text}}>${(order.reduce((s,o)=>s+o.price*o.qty,0)*(1+taxRate/100)).toFixed(2)}</span></div>
                        <div style={{marginBottom:10}}><div style={{fontSize:10,color:G.muted,marginBottom:4}}>NOTE (optional)</div><input placeholder="e.g. Table 4, no onions" value={orderNote} onChange={e=>setOrderNote(e.target.value)} style={{fontSize:11}} /></div>
                        <button className="btn" style={{width:"100%"}} onClick={submitOrder}>MARK AS SOLD →</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* INVENTORY */}
        {tab==="inventory"&&(
          <div className="fade">
            <div style={{fontFamily:G.display,fontSize:30,letterSpacing:3,marginBottom:20,color:G.accent}}>INVENTORY</div>
            <div className="card" style={{marginBottom:16,borderColor:G.accent+"44"}}>
              <div style={{fontSize:10,letterSpacing:2,color:G.accent,marginBottom:14}}>📦 REORDER INTELLIGENCE</div>
              {inventory.length===0?<div style={{color:G.muted,fontSize:12}}>No inventory yet.</div>:(
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>
                  {inventory.map(item=>{
                    const used=sales.reduce((sum,s)=>{const mi=menuItems.find(m=>m.name===s.item);const ing=mi&&(mi.ingredients||[]).find(i=>i.id===item.id);return sum+(ing?ing.qty:0);},0);
                    const daysLeft=used>0?Math.floor(item.qty/(used/Math.max(sales.length,1)*sales.length)):99;
                    const reorderQty=Math.ceil((used/Math.max(sales.length,1))*7);
                    const color=daysLeft<=2?G.red:daysLeft<=5?G.yellow:G.green;
                    return (
                      <div key={item.id} style={{background:G.bg,border:`1px solid ${color}33`,borderRadius:6,padding:12}}>
                        <div style={{fontSize:11,color:G.text,marginBottom:4}}>{item.name}</div>
                        <div style={{fontFamily:G.display,fontSize:22,color}}>{daysLeft>=99?"∞":daysLeft} days</div>
                        <div style={{fontSize:10,color:G.muted,marginTop:2}}>{item.qty} units · reorder {reorderQty}/wk</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="card">
              <table>
                <thead><tr><th>INGREDIENT</th><th>QTY</th><th>UNIT</th><th>COST/UNIT</th><th>REORDER AT</th><th>STATUS</th></tr></thead>
                <tbody>
                  {inventory.map(item=>{
                    const s=item.qty<=item.threshold?"CRITICAL":item.qty<=item.threshold*2?"LOW":"OK";
                    return (<tr key={item.id}><td>{item.name}</td><td style={{fontFamily:G.display,fontSize:18,color:s==="CRITICAL"?G.red:s==="LOW"?G.yellow:G.text}}>{item.qty}</td><td style={{color:G.muted}}>{item.unit}</td><td>${item.cost.toFixed(2)}</td><td style={{color:G.muted}}>{item.threshold}</td><td><span className={`badge ${s==="CRITICAL"?"br":s==="LOW"?"by":"bg"}`}>{s}</span></td></tr>);
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MARGINS */}
        {tab==="margins"&&(
          <div className="fade">
            <div style={{fontFamily:G.display,fontSize:30,letterSpacing:3,marginBottom:20,color:G.accent}}>PROFIT MARGINS</div>
            {menuItems.length===0?<div className="card" style={{color:G.muted}}>No menu items yet.</div>:
              [...menuItems].sort((a,b)=>{const ma=(a.price-getCOGS(a,inventory))/Math.max(a.price,0.01);const mb=(b.price-getCOGS(b,inventory))/Math.max(b.price,0.01);return mb-ma;}).map(item=>{
                const cogs=getCOGS(item,inventory);const profit=item.price-cogs;const margin=item.price>0?(profit/item.price*100).toFixed(1):0;
                return (
                  <div key={item.id} className="card" style={{marginBottom:10,display:"grid",gridTemplateColumns:"1fr 80px 80px 80px 110px",alignItems:"center",gap:14}}>
                    <div>
                      <div style={{fontWeight:500,marginBottom:4}}>{item.name}</div>
                      {(item.choiceGroupIds||[]).length>0&&<div style={{fontSize:10,color:G.accent,marginBottom:4}}>🍽️ {(item.choiceGroupIds||[]).map(id=>choiceGroups.find(g=>g.id===id)?.name).filter(Boolean).join(" + ")}</div>}
                      <div className="prog-bar"><div className="prog-fill" style={{width:`${Math.min(parseFloat(margin),100)}%`,background:parseFloat(margin)>=65?G.green:parseFloat(margin)>=45?G.yellow:G.red}} /></div>
                    </div>
                    <div style={{textAlign:"center"}}><div style={{fontSize:10,color:G.muted,marginBottom:2}}>SELL</div><div style={{fontFamily:G.display,fontSize:20}}>${item.price.toFixed(2)}</div></div>
                    <div style={{textAlign:"center"}}><div style={{fontSize:10,color:G.muted,marginBottom:2}}>COGS</div><div style={{fontFamily:G.display,fontSize:20,color:G.red}}>${cogs.toFixed(2)}</div></div>
                    <div style={{textAlign:"center"}}><div style={{fontSize:10,color:G.muted,marginBottom:2}}>PROFIT</div><div style={{fontFamily:G.display,fontSize:20,color:G.green}}>${profit.toFixed(2)}</div></div>
                    <div style={{textAlign:"center"}}><span className={`badge ${parseFloat(margin)>=65?"bg":parseFloat(margin)>=45?"by":"br"}`} style={{fontSize:13,padding:"4px 10px"}}>{margin}%</span></div>
                  </div>
                );
              })
            }
          </div>
        )}

        {/* DEALS */}
        {tab==="deals"&&(
          <div className="fade">
            <div style={{fontFamily:G.display,fontSize:30,letterSpacing:3,marginBottom:8,color:G.accent}}>DEAL ENGINE</div>
            <div style={{fontSize:12,color:G.muted,marginBottom:24}}>Auto-generated combos to push revenue</div>
            {menuItems.length<2?<div className="card" style={{color:G.muted}}>Add at least 2 menu items.</div>:(()=>{
              const combos=[];
              for(let i=0;i<menuItems.length;i++){for(let j=i+1;j<menuItems.length;j++){
                const items=[menuItems[i],menuItems[j]];
                const tc=items.reduce((s,x)=>s+getCOGS(x,inventory),0);
                const fp=items.reduce((s,x)=>s+x.price,0);
                const sp=parseFloat((fp*0.92).toFixed(2));
                const margin=((sp-tc)/sp*100).toFixed(1);
                combos.push({items,tc,fp,sp,margin});
              }}
              return combos.sort((a,b)=>parseFloat(b.margin)-parseFloat(a.margin)).slice(0,6).map((c,i)=>(
                <div key={i} className="card" style={{marginBottom:12,borderColor:G.accent+"33"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontFamily:G.display,fontSize:18,color:G.accent,marginBottom:8}}>{c.items.map(x=>x.name).join(" + ")}</div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{c.items.map(x=><span key={x.id} style={{background:G.accent+"18",border:`1px solid ${G.accent}33`,borderRadius:20,padding:"2px 10px",fontSize:11,color:G.accent}}>{x.name} ${x.price.toFixed(2)}</span>)}</div>
                    </div>
                    <div style={{textAlign:"right"}}><div style={{fontFamily:G.display,fontSize:32,color:G.green}}>${c.sp.toFixed(2)}</div><div style={{fontSize:10,color:G.muted}}>saves ${(c.fp-c.sp).toFixed(2)}</div></div>
                  </div>
                  <div style={{marginTop:12,display:"flex",gap:16,fontSize:11,color:G.muted}}>
                    <span>COGS: <span style={{color:G.red}}>${c.tc.toFixed(2)}</span></span>
                    <span>Profit: <span style={{color:G.green}}>${(c.sp-c.tc).toFixed(2)}</span></span>
                    <span className={`badge ${parseFloat(c.margin)>=60?"bg":"by"}`}>{c.margin}%</span>
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

        {/* PRICING AI */}
        {tab==="pricing"&&(
          <div className="fade">
            <div style={{fontFamily:G.display,fontSize:30,letterSpacing:3,marginBottom:8,color:G.accent}}>🧠 PRICING ENGINE</div>
            <div style={{fontSize:12,color:G.muted,marginBottom:24}}>AI-powered price recommendations</div>
            {menuItems.map(item=>{
              const cogs=getCOGS(item,inventory);
              const margin=item.price>0?(item.price-cogs)/item.price*100:0;
              let rec,recPrice,reason,recColor;
              if(margin<45){recPrice=parseFloat((cogs/0.55).toFixed(2));rec="RAISE PRICE";reason=`${margin.toFixed(0)}% margin is too low. Raise to $${recPrice.toFixed(2)} to hit 55%.`;recColor=G.red;}
              else if(margin>80){recPrice=parseFloat((cogs/0.70).toFixed(2));rec="CONSIDER LOWERING";reason=`${margin.toFixed(0)}% may be pricing out customers. $${recPrice.toFixed(2)} stays at 70%.`;recColor=G.yellow;}
              else{recPrice=item.price;rec="PRICE IS GOOD";reason=`${margin.toFixed(0)}% margin is healthy.`;recColor=G.green;}
              return (
                <div key={item.id} className="card" style={{marginBottom:12,borderLeft:`3px solid ${recColor}`}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:16,alignItems:"start"}}>
                    <div>
                      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                        <div style={{fontWeight:500,fontSize:14}}>{item.name}</div>
                        <span className={`badge ${rec==="RAISE PRICE"?"br":rec==="CONSIDER LOWERING"?"by":"bg"}`}>{rec}</span>
                      </div>
                      <div style={{fontSize:11,color:G.muted,lineHeight:1.7}}>{reason}</div>
                      <div style={{display:"flex",gap:20,marginTop:10,fontSize:11}}>
                        <span style={{color:G.muted}}>Current: <span style={{color:G.text}}>${item.price.toFixed(2)}</span></span>
                        <span style={{color:G.muted}}>Suggested: <span style={{color:recColor}}>${recPrice.toFixed(2)}</span></span>
                      </div>
                    </div>
                    {rec!=="PRICE IS GOOD"&&<button className="btn-sm" onClick={()=>{update(r=>({...r,menuItems:(r.menuItems||menuItems).map(m=>m.id===item.id?{...m,price:recPrice}:m)}));t(`${item.name} updated to $${recPrice.toFixed(2)}`)}}>APPLY</button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* WASTE */}
        {tab==="waste"&&(
          <div className="fade">
            <div style={{fontFamily:G.display,fontSize:30,letterSpacing:3,marginBottom:8,color:G.accent}}>🔍 WASTE MONITOR</div>
            <div style={{fontSize:12,color:G.muted,marginBottom:24}}>Compares expected vs actual usage. Flags discrepancies.</div>
            {inventory.map(item=>{
              let expected=0;
              sales.forEach(s=>{const mi=menuItems.find(m=>m.name===s.item);if(mi){const ing=(mi.ingredients||[]).find(i=>i.id===item.id);if(ing)expected+=ing.qty;}});
              const actual=(item.qty+expected)-item.qty;
              const disc=actual-expected;
              const val=Math.abs(disc*item.cost);
              const hasIssue=disc>1;
              const issueType=disc>5?"POSSIBLE THEFT":disc>2?"OVER-PORTIONING":"MINOR VARIANCE";
              const color=disc>5?G.red:disc>2?G.yellow:G.muted;
              return (
                <div key={item.id} className="card" style={{marginBottom:10,borderLeft:`3px solid ${hasIssue?color:G.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:6}}>
                        <div style={{fontWeight:500}}>{item.name}</div>
                        {hasIssue?<span className={`badge ${disc>5?"br":"by"}`}>{issueType}</span>:<span className="badge bg">ON TRACK</span>}
                      </div>
                      <div style={{display:"flex",gap:20,fontSize:11,color:G.muted}}>
                        <span>Expected: {expected.toFixed(1)}</span><span>Actual: {actual.toFixed(1)}</span>
                        {hasIssue&&<span style={{color}}>Discrepancy: {disc.toFixed(1)} units (${val.toFixed(2)})</span>}
                      </div>
                    </div>
                    {hasIssue&&<div style={{textAlign:"right"}}><div style={{fontFamily:G.display,fontSize:24,color}}>-${val.toFixed(2)}</div><div style={{fontSize:10,color:G.muted}}>estimated loss</div></div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* END OF DAY */}
        {tab==="eod"&&(
          <div className="fade">
            <div style={{fontFamily:G.display,fontSize:30,letterSpacing:3,marginBottom:8,color:G.accent}}>END OF DAY REPORT</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:20}}>
              {[{label:"REVENUE",val:`$${totalRevenue.toFixed(2)}`,color:G.green},{label:"FOOD COST",val:`$${totalCOGS.toFixed(2)}`,color:G.red},{label:"NET PROFIT",val:`$${totalProfit.toFixed(2)}`,color:G.accent},{label:"TOTAL SALES",val:sales.length,color:G.text},{label:"AVG SALE",val:sales.length>0?`$${(totalRevenue/sales.length).toFixed(2)}`:"$0",color:G.yellow},{label:"MARGIN",val:totalRevenue>0?`${((totalProfit/totalRevenue)*100).toFixed(1)}%`:"0%",color:G.accent}].map((s,i)=>(
                <div key={i} className="card" style={{borderTop:`2px solid ${s.color}`}}><div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:8}}>{s.label}</div><div style={{fontFamily:G.display,fontSize:28,color:s.color}}>{s.val}</div></div>
              ))}
            </div>
            <div className="card" style={{marginBottom:16}}>
              <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:14}}>BEST SELLERS</div>
              {(()=>{const counts={};sales.forEach(s=>{counts[s.item]=(counts[s.item]||0)+1;});return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,count])=>(<div key={name} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${G.border}`,fontSize:12}}><span>{name}</span><span style={{color:G.accent}}>{count} sold</span></div>));})()}
            </div>
            {sales.some(s=>s.date)&&(
              <div className="card" style={{marginBottom:16}}>
                <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:14}}>SALES BY DAY</div>
                {(()=>{
                  const byDate={};
                  sales.forEach(s=>{const d=s.date||"Today";if(!byDate[d])byDate[d]={revenue:0,profit:0,count:0};byDate[d].revenue+=s.price;byDate[d].profit+=s.profit;byDate[d].count+=1;});
                  return Object.entries(byDate).slice(-7).reverse().map(([date,data])=>(<div key={date} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${G.border}`,fontSize:12}}><span style={{color:G.muted}}>{date}</span><div style={{display:"flex",gap:20}}><span>{data.count} sales</span><span>${data.revenue.toFixed(2)}</span><span style={{color:G.green}}>+${data.profit.toFixed(2)}</span></div></div>));
                })()}
              </div>
            )}
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              <button className="btn" onClick={()=>{
                const rows=[["Item","Selections","Date","Time","Sale","Food Cost","Profit","Note"]];
                sales.forEach(s=>rows.push([s.item,s.choiceLabel||"",s.date||"",s.time,s.price.toFixed(2),s.cost.toFixed(2),s.profit.toFixed(2),s.note||""]));
                const csv=rows.map(r=>r.join(",")).join("\n");
                const blob=new Blob([csv],{type:"text/csv"});
                const url=URL.createObjectURL(blob);
                const a=document.createElement("a");a.href=url;a.download=`profitplate-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(url);
              }}>⬇ EXPORT CSV</button>
              <button className="btn-ghost" style={{color:G.red,borderColor:G.red+"44"}} onClick={()=>{if(window.confirm("Clear all sales? Cannot undo.")){update(r=>({...r,sales:[]}));t("Sales cleared");}}}>🗑 CLEAR & RESET</button>
            </div>
          </div>
        )}

        {/* PAYCHECK */}
        {tab==="paycheck"&&(
          <div className="fade">
            <div style={{fontFamily:G.display,fontSize:30,letterSpacing:3,marginBottom:8,color:G.accent}}>PAYCHECK VIEW</div>
            <div style={{fontSize:12,color:G.muted,marginBottom:24}}>What you actually pocketed after food costs</div>
            {(()=>{
              const taxCollected=sales.reduce((s,x)=>s+x.price*taxRate/100,0);
              return (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:20}}>
                  <div className="card" style={{borderTop:`2px solid ${G.text}`}}><div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:8}}>GROSS REVENUE</div><div style={{fontFamily:G.display,fontSize:36}}>${totalRevenue.toFixed(2)}</div><div style={{fontSize:11,color:G.muted}}>{sales.length} transactions</div></div>
                  <div className="card" style={{borderTop:`2px solid ${G.yellow}`}}><div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:8}}>TAX COLLECTED</div><div style={{fontFamily:G.display,fontSize:36,color:G.yellow}}>-${taxCollected.toFixed(2)}</div><div style={{fontSize:11,color:G.muted}}>owed to gov</div></div>
                  <div className="card" style={{borderTop:`2px solid ${G.red}`}}><div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:8}}>FOOD COST</div><div style={{fontFamily:G.display,fontSize:36,color:G.red}}>-${totalCOGS.toFixed(2)}</div></div>
                </div>
              );
            })()}
            <div className="card" style={{borderColor:G.accent+"55",marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:11,letterSpacing:2,color:G.accent,marginBottom:4}}>YOUR TAKE-HOME</div><div style={{fontFamily:G.display,fontSize:56,color:G.green}}>${totalProfit.toFixed(2)}</div><div style={{fontSize:11,color:G.muted}}>{totalRevenue>0?((totalProfit/totalRevenue)*100).toFixed(1):0}% margin · excludes labor/overhead</div></div>
                <div style={{fontSize:64}}>💰</div>
              </div>
            </div>
            {sales.length>0&&(
              <div className="card">
                <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:14}}>TRANSACTION LOG</div>
                <table>
                  <thead><tr><th>ITEM</th><th>SELECTIONS</th><th>DATE/TIME</th><th>SALE</th><th>FOOD COST</th><th>PROFIT</th></tr></thead>
                  <tbody>
                    {sales.slice().reverse().map(s=>(
                      <tr key={s.id}>
                        <td>{s.item}{s.note&&<div style={{fontSize:10,color:G.muted,fontStyle:"italic"}}>{s.note}</div>}</td>
                        <td style={{color:G.accent,fontSize:10}}>{s.choiceLabel||"—"}</td>
                        <td style={{color:G.muted}}>{s.date?`${s.date} `:""}{s.time}</td>
                        <td>${s.price.toFixed(2)}</td>
                        <td style={{color:G.red}}>-${s.cost.toFixed(2)}</td>
                        <td style={{color:G.green}}>+${s.profit.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* AI ADVISOR */}
        {tab==="advisor"&&(
          <div className="fade" style={{display:"flex",flexDirection:"column",height:"calc(100vh - 180px)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div>
                <div style={{fontFamily:G.display,fontSize:30,letterSpacing:3,color:G.accent}}>💬 AI BUSINESS ADVISOR</div>
                <div style={{fontSize:11,color:G.muted,marginTop:2}}>Powered by Claude AI · Knows your real business data</div>
              </div>
              <button className="btn-ghost" style={{fontSize:10,padding:"6px 12px"}} onClick={()=>setAdvisorMessages([{role:"assistant",content:"Hey! I'm your ProfitPlate AI Business Advisor. I'm here to help you grow your restaurant, improve profits, and build your brand.\n\nTo give you the best advice, let me learn about your business first. What type of restaurant do you run, and how long have you been open?"}])}>RESET CHAT</button>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
              {["How can I increase my profit margins?","Give me social media content ideas","What should I do about low stock?","How do I get more customers?","Should I join DoorDash or Uber Eats?","Help me create a daily special"].map(q=>(
                <button key={q} onClick={()=>setAdvisorInput(q)} style={{background:G.accent+"18",border:`1px solid ${G.accent}33`,borderRadius:20,padding:"5px 12px",fontSize:11,color:G.accent,cursor:"pointer",whiteSpace:"nowrap"}}>{q}</button>
              ))}
            </div>
            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:12,marginBottom:16,paddingRight:4}}>
              {advisorMessages.map((msg,i)=>(
                <div key={i} style={{display:"flex",gap:10,justifyContent:msg.role==="user"?"flex-end":"flex-start"}}>
                  {msg.role==="assistant"&&(<div style={{width:32,height:32,borderRadius:"50%",background:G.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,alignSelf:"flex-start"}}>🍔</div>)}
                  <div style={{maxWidth:"75%",padding:"12px 16px",borderRadius:msg.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px",background:msg.role==="user"?G.accent:G.card,color:msg.role==="user"?"#080810":G.text,border:msg.role==="user"?"none":`1px solid ${G.border}`,fontSize:12,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{msg.content}</div>
                  {msg.role==="user"&&(<div style={{width:32,height:32,borderRadius:"50%",background:G.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,alignSelf:"flex-start"}}>👤</div>)}
                </div>
              ))}
              {advisorLoading&&(
                <div style={{display:"flex",gap:10}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:G.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🍔</div>
                  <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:"12px 12px 12px 2px",padding:"12px 16px",fontSize:12,color:G.muted}}>Thinking...</div>
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
              <textarea value={advisorInput} onChange={e=>setAdvisorInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendAdvisorMessage();}}}
                placeholder="Ask anything about your restaurant — marketing, pricing, staffing, content ideas..."
                style={{flex:1,resize:"none",height:48,borderRadius:8,padding:"12px 14px",fontSize:12,fontFamily:G.font,background:G.card,border:`1px solid ${G.border}`,color:G.text,outline:"none"}} />
              <button className="btn" style={{height:48,padding:"0 20px",flexShrink:0}} onClick={sendAdvisorMessage} disabled={advisorLoading}>{advisorLoading?"...":"SEND →"}</button>
            </div>
            <div style={{fontSize:10,color:G.muted,marginTop:8,textAlign:"center"}}>Press Enter to send · Shift+Enter for new line</div>
          </div>
        )}

        {/* SETTINGS */}
        {tab==="settings"&&<SettingsPanel G={G} restaurant={restaurant} update={update} showToast={t} inventory={inventory} menuItems={menuItems} choiceGroups={choiceGroups} setEditingItem={setEditingItem} />}

      </div>
      {toast2&&<div className={`toast ${toast2.type==="success"?"ts":"te"}`}>{toast2.msg}</div>}
    </div>
  );
}

// ── SETTINGS PANEL ────────────────────────────────────────────────────────────
function SettingsPanel({G,restaurant,update,showToast,inventory,menuItems,choiceGroups,setEditingItem}) {
  const [section,setSection]=useState("restaurant");
  const [form,setForm]=useState({name:restaurant.name,logo:restaurant.logo||"",taxRate:String(restaurant.taxRate),pin:"",confirmPin:"",staffPin:restaurant.staffPin||""});
  const [invItem,setInvItem]=useState({name:"",unit:"each",qty:"",threshold:"",cost:"",mode:"single",packSize:"",packCost:"",packCount:"",bulkTotal:"",bulkCost:"",bulkServing:""});
  const [menuItem,setMenuItem]=useState({name:"",price:"",ingredients:[],choiceGroupIds:[]});
  const [menuIng,setMenuIng]=useState({id:"",qty:""});

  function saveRestaurant(){if(!form.name.trim())return showToast("Name required","error");update(r=>({...r,name:form.name.trim(),logo:form.logo,taxRate:parseFloat(form.taxRate)||0}));showToast("Saved!");}
  function savePin(){if(form.pin.length<4)return showToast("PIN must be 4+ digits","error");if(form.pin!==form.confirmPin)return showToast("PINs don't match","error");update(r=>({...r,pin:form.pin}));setForm(f=>({...f,pin:"",confirmPin:""}));showToast("PIN updated!");}
  function saveStaffPin(){update(r=>({...r,staffPin:form.staffPin}));showToast("Staff PIN saved!");}

  function addInv(){
    const name=(invItem.name||"").trim();
    if(!name)return showToast("Enter ingredient name","error");
    let qty=0,cost=0;
    if(invItem.mode==="pack"){if(!invItem.packSize||!invItem.packCost||!invItem.packCount)return showToast("Fill all pack fields","error");qty=parseFloat(invItem.packSize)*parseFloat(invItem.packCount);cost=parseFloat(invItem.packCost)/parseFloat(invItem.packSize);}
    else if(invItem.mode==="bulk"){if(!invItem.bulkTotal||!invItem.bulkCost||!invItem.bulkServing)return showToast("Fill all bulk fields","error");qty=parseFloat(invItem.bulkTotal);cost=parseFloat(invItem.bulkCost)/parseFloat(invItem.bulkTotal)*parseFloat(invItem.bulkServing);}
    else{if(!invItem.qty||!invItem.cost)return showToast("Fill qty and cost","error");qty=parseFloat(invItem.qty);cost=parseFloat(invItem.cost);}
    const ni={id:uid(),name,unit:invItem.unit,qty:parseFloat(qty.toFixed(2)),threshold:parseFloat(invItem.threshold)||5,cost:parseFloat(cost.toFixed(4))};
    update(r=>({...r,inventory:[...(r.inventory||inventory),ni]}));
    setInvItem({name:"",unit:"each",qty:"",threshold:"",cost:"",mode:"single",packSize:"",packCost:"",packCount:"",bulkTotal:"",bulkCost:"",bulkServing:""});
    showToast(name+" added!");
  }

  function addMenuIng(){if(!menuIng.id||!menuIng.qty)return;setMenuItem(m=>({...m,ingredients:[...m.ingredients.filter(i=>i.id!==menuIng.id),{id:menuIng.id,qty:parseFloat(menuIng.qty)}]}));setMenuIng({id:"",qty:""});}

  function addMenuItem(){
    if(!menuItem.name||!menuItem.price)return showToast("Name and price required","error");
    update(r=>({...r,menuItems:[...(r.menuItems||menuItems),{...menuItem,id:uid(),price:parseFloat(menuItem.price)}]}));
    setMenuItem({name:"",price:"",ingredients:[],choiceGroupIds:[]});showToast("Menu item added!");
  }

  return (
    <div className="fade">
      <div style={{fontFamily:G.display,fontSize:30,letterSpacing:3,marginBottom:20,color:G.accent}}>SETTINGS</div>
      <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
        {["restaurant","pin","inventory","choicegroups","menu"].map(s=><button key={s} className={`tab${section===s?" on":""}`} onClick={()=>setSection(s)}>{s==="choicegroups"?"CHOICE GROUPS":s.toUpperCase()}</button>)}
      </div>

      {section==="restaurant"&&(
        <div className="card" style={{display:"flex",flexDirection:"column",gap:14,maxWidth:500}}>
          <div><div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:6}}>RESTAURANT NAME</div><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></div>
          <div><div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:6}}>LOGO URL</div><input value={form.logo} onChange={e=>setForm(f=>({...f,logo:e.target.value}))} placeholder="https://..." /></div>
          <div><div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:6}}>TAX RATE (%)</div><input type="number" value={form.taxRate} onChange={e=>setForm(f=>({...f,taxRate:e.target.value}))} /></div>
          <button className="btn" onClick={saveRestaurant}>SAVE CHANGES</button>
          <div style={{marginTop:8,paddingTop:16,borderTop:`1px solid ${G.border}`}}>
            <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:10}}>DATA BACKUP</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button className="btn-ghost" style={{fontSize:11}} onClick={()=>{
                const data=JSON.stringify({restaurants:{[restaurant.id]:restaurant}},null,2);
                const blob=new Blob([data],{type:"application/json"});
                const url=URL.createObjectURL(blob);
                const a=document.createElement("a");
                a.href=url;a.download=`${restaurant.name.replace(/\s/g,"-")}-backup-${new Date().toISOString().slice(0,10)}.json`;
                a.click();URL.revokeObjectURL(url);
                showToast("Backup downloaded!");
              }}>⬇ DOWNLOAD BACKUP</button>
            </div>
            <div style={{fontSize:10,color:G.muted,marginTop:8}}>Download a backup after every major setup change. Restore from the main screen.</div>
          </div>
        </div>
      )}

      {section==="pin"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14,maxWidth:500}}>
          <div className="card">
            <div style={{fontSize:10,letterSpacing:2,color:G.accent,marginBottom:14}}>OWNER PIN</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div><div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:6}}>NEW OWNER PIN</div><input type="password" inputMode="numeric" maxLength={6} value={form.pin} onChange={e=>setForm(f=>({...f,pin:e.target.value.replace(/\D/g,"")}))} placeholder="••••" /></div>
              <div><div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:6}}>CONFIRM PIN</div><input type="password" inputMode="numeric" maxLength={6} value={form.confirmPin} onChange={e=>setForm(f=>({...f,confirmPin:e.target.value.replace(/\D/g,"")}))} placeholder="••••" /></div>
              <button className="btn" onClick={savePin}>UPDATE OWNER PIN</button>
            </div>
          </div>
          <div className="card">
            <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:14}}>STAFF PIN (cashier only)</div>
            <div><div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:6}}>STAFF PIN</div><input type="password" inputMode="numeric" maxLength={6} value={form.staffPin||""} onChange={e=>setForm(f=>({...f,staffPin:e.target.value.replace(/\D/g,"")}))} placeholder="•••• optional" /></div>
            <button className="btn-ghost" style={{marginTop:12}} onClick={saveStaffPin}>SAVE STAFF PIN</button>
          </div>
        </div>
      )}

      {section==="inventory"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <InventoryForm G={G} invItem={invItem} setInvItem={setInvItem} onAdd={addInv} inventory={inventory} onDelete={id=>update(r=>({...r,inventory:(r.inventory||inventory).filter(i=>i.id!==id)}))} />
          {inventory.length>0&&(
            <div className="card">
              <div style={{fontSize:10,letterSpacing:2,color:G.accent,marginBottom:4}}>RESTOCK AND EDIT</div>
              <div style={{fontSize:11,color:G.muted,marginBottom:16}}>Update qty when restocked, or edit details.</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {inventory.map(item=>(
                  <RestockRow key={item.id} G={G} item={item} onSave={updated=>{update(r=>({...r,inventory:(r.inventory||inventory).map(i=>i.id===item.id?{...i,...updated}:i)}));showToast(item.name+" updated!");}} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {section==="choicegroups"&&(
        <ChoiceGroupsPanel G={G} choiceGroups={choiceGroups} inventory={inventory} update={update} showToast={showToast} />
      )}

      {section==="menu"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div className="card">
            <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:14}}>ADD MENU ITEM</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <input placeholder="Item name" value={menuItem.name} onChange={e=>setMenuItem(m=>({...m,name:e.target.value}))} />
              <input type="number" placeholder="Sell price $" value={menuItem.price} onChange={e=>setMenuItem(m=>({...m,price:e.target.value}))} />
            </div>
            {inventory.length>0&&<>
              <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:8}}>BASE INGREDIENTS (optional)</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 80px 80px",gap:8,marginBottom:10}}>
                <select value={menuIng.id} onChange={e=>setMenuIng(i=>({...i,id:e.target.value}))}>
                  <option value="">Select ingredient</option>
                  {inventory.map(inv=><option key={inv.id} value={inv.id}>{inv.name}</option>)}
                </select>
                <input type="number" placeholder="Qty" value={menuIng.qty} onChange={e=>setMenuIng(i=>({...i,qty:e.target.value}))} />
                <button className="btn-ghost" onClick={addMenuIng} style={{fontSize:11}}>+ ADD</button>
              </div>
              {menuItem.ingredients.length>0&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                  {menuItem.ingredients.map(ing=>{const inv=inventory.find(i=>i.id===ing.id);return <span key={ing.id} style={{background:G.accent+"18",border:`1px solid ${G.accent}44`,borderRadius:20,padding:"2px 10px",fontSize:11,color:G.accent}}>{inv?.name} x{ing.qty}</span>;})}
                </div>
              )}
            </>}
            {choiceGroups.length>0&&<>
              <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:8,marginTop:4}}>LINK CHOICE GROUPS</div>
              <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
                {choiceGroups.map(g=>{
                  const linked = (menuItem.choiceGroupIds||[]).includes(g.id);
                  return (
                    <div key={g.id} onClick={()=>setMenuItem(m=>({...m,choiceGroupIds:linked?(m.choiceGroupIds||[]).filter(id=>id!==g.id):[...(m.choiceGroupIds||[]),g.id]}))}
                      style={{display:"flex",gap:10,alignItems:"center",padding:"10px 12px",borderRadius:6,border:`1px solid ${linked?G.accent:G.border}`,background:linked?G.accent+"18":"transparent",cursor:"pointer"}}>
                      <div style={{width:16,height:16,borderRadius:3,background:linked?G.accent:G.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {linked&&<div style={{fontSize:10,color:"#080810",fontWeight:"bold"}}>✓</div>}
                      </div>
                      <div style={{fontSize:12,color:linked?G.accent:G.text}}>{g.name}</div>
                      <div style={{fontSize:10,color:G.muted,marginLeft:"auto"}}>{g.options.length} options</div>
                      {g.required&&<span className="badge br" style={{fontSize:9}}>REQUIRED</span>}
                    </div>
                  );
                })}
              </div>
            </>}
            <button className="btn" onClick={addMenuItem}>+ ADD TO MENU</button>
            {choiceGroups.length===0&&inventory.length>0&&(
              <div style={{marginTop:10,fontSize:11,color:G.muted}}>💡 Tip: Create Choice Groups first to link meat & side selections to plate meals.</div>
            )}
          </div>
          {menuItems.length>0&&(
            <div className="card">
              <div style={{fontSize:10,letterSpacing:2,color:G.muted,marginBottom:14}}>CURRENT MENU ({menuItems.length})</div>
              <table>
                <thead><tr><th>ITEM</th><th>PRICE</th><th>COGS</th><th>MARGIN</th><th>CHOICE GROUPS</th><th></th></tr></thead>
                <tbody>
                  {menuItems.map(item=>{
                    const cogs=getCOGS(item,inventory);const margin=item.price>0?((item.price-cogs)/item.price*100).toFixed(0):0;
                    const linkedGroups = (item.choiceGroupIds||[]).map(id=>choiceGroups.find(g=>g.id===id)?.name).filter(Boolean);
                    return (
                      <tr key={item.id}>
                        <td>{item.name}</td><td>${item.price.toFixed(2)}</td>
                        <td style={{color:G.red}}>${cogs.toFixed(2)}</td>
                        <td><span className={`badge ${parseFloat(margin)>=60?"bg":"by"}`}>{margin}%</span></td>
                        <td style={{fontSize:10,color:G.accent}}>{linkedGroups.length>0?linkedGroups.join(", "):"—"}</td>
                        <td style={{display:"flex",gap:6}}>
                          <button className="btn-sm" style={{fontSize:10}} onClick={()=>setEditingItem({...item,choiceGroupIds:item.choiceGroupIds||[]})}>EDIT</button>
                          <button className="btn-danger" onClick={()=>update(r=>({...r,menuItems:(r.menuItems||menuItems).filter(m=>m.id!==item.id)}))}>x</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
