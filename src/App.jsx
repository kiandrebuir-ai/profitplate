import { useState, useEffect } from "react";

// ── Persistence helpers ──────────────────────────────────────────────────────
const STORE_KEY = "profitplate_v1";
function loadStore() {
  try { const d = localStorage.getItem(STORE_KEY); return d ? JSON.parse(d) : null; } catch { return null; }
}
function saveStore(data) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch {}
}

// ── Default blank restaurant state ───────────────────────────────────────────
function blankRestaurant(name) {
  return {
    name, logo: "", taxRate: 8.5, pin: "",
    inventory: [], menuItems: [], sales: [], setupDone: false,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getCOGS(item, inventory) {
  return (item.ingredients || []).reduce((s, ing) => {
    const inv = inventory.find(i => i.id === ing.id);
    return s + (inv ? inv.cost * ing.qty : 0);
  }, 0);
}
function uid() { return Math.random().toString(36).slice(2, 9); }

// ── Styles ───────────────────────────────────────────────────────────────────
const G = {
  bg: "#080810", card: "#10101c", border: "#1c1c2e",
  accent: "#ff6b2b", accentHover: "#ff8c4f",
  green: "#4ade80", red: "#f87171", yellow: "#facc15",
  text: "#e8e0d0", muted: "#55556a", font: "'DM Mono', monospace", display: "'Bebas Neue', sans-serif",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Bebas+Neue&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${G.bg};}
  ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:${G.accent};border-radius:2px;}
  input,select,textarea{background:#0a0a14;border:1px solid ${G.border};color:${G.text};padding:9px 12px;font-family:${G.font};font-size:12px;border-radius:5px;outline:none;width:100%;}
  input:focus,select:focus,textarea:focus{border-color:${G.accent};}
  button{cursor:pointer;font-family:${G.font};}
  .btn{background:${G.accent};border:none;color:#080810;padding:10px 22px;font-size:12px;font-weight:500;border-radius:5px;letter-spacing:.5px;transition:background .15s;}
  .btn:hover{background:${G.accentHover};}
  .btn-ghost{background:none;border:1px solid ${G.border};color:${G.muted};padding:9px 18px;font-size:12px;border-radius:5px;transition:all .15s;}
  .btn-ghost:hover{border-color:${G.accent};color:${G.text};}
  .btn-danger{background:#7f1d1d;border:none;color:${G.red};padding:8px 14px;font-size:11px;border-radius:5px;}
  .btn-danger:hover{background:#991b1b;}
  .card{background:${G.card};border:1px solid ${G.border};border-radius:8px;padding:20px;}
  .badge{display:inline-block;padding:2px 8px;border-radius:3px;font-size:10px;letter-spacing:1px;}
  .bg{background:${G.green};border:1px solid #166534;color:#052e16;}
  .br{background:#7f1d1d;border:1px solid #991b1b;color:${G.red};}
  .by{background:#422006;border:1px solid #854d0e;color:${G.yellow};}
  table{width:100%;border-collapse:collapse;font-size:12px;}
  th{text-align:left;padding:8px 12px;color:${G.muted};letter-spacing:1px;font-size:10px;border-bottom:1px solid ${G.border};font-weight:400;}
  td{padding:10px 12px;border-bottom:1px solid #0d0d1a;}
  tr:last-child td{border-bottom:none;}
  tr:hover td{background:#0c0c18;}
  .tab{background:none;border:1px solid ${G.border};color:${G.muted};padding:9px 15px;font-size:11px;letter-spacing:1px;border-radius:4px;transition:all .15s;}
  .tab:hover{border-color:${G.accent}44;color:${G.text};}
  .tab.on{background:${G.accent};border-color:${G.accent};color:#080810;font-weight:500;}
  .pin-btn{background:#12121e;border:1px solid ${G.border};color:${G.text};width:70px;height:70px;font-size:22px;border-radius:8px;font-family:${G.display};letter-spacing:1px;transition:all .1s;}
  .pin-btn:hover{background:#1a1a2e;border-color:${G.accent}66;}
  .pin-btn:active{background:${G.accent}22;border-color:${G.accent};}
  @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  .fade{animation:fadeIn .3s ease;}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  .toast{position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:6px;font-size:12px;letter-spacing:.5px;z-index:9999;animation:fadeIn .3s ease;}
  .ts{background:#14532d;border:1px solid ${G.green};color:${G.green};}
  .te{background:#7f1d1d;border:1px solid ${G.red};color:${G.red};}
  .step-dot{width:8px;height:8px;border-radius:50%;background:${G.border};}
  .step-dot.done{background:${G.accent};}
`;

// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [store, setStore] = useState(() => loadStore() || { restaurants: {}, lastRestaurant: null });
  const [screen, setScreen] = useState("landing");
  const [activeRestaurant, setActiveRestaurant] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { saveStore(store); }, [store]);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }

  function updateRestaurant(id, updater) {
    setStore(s => {
      const updated = typeof updater === "function" ? updater(s.restaurants[id]) : { ...s.restaurants[id], ...updater };
      return { ...s, restaurants: { ...s.restaurants, [id]: updated } };
    });
  }

  const restaurants = Object.values(store.restaurants || {});
  const restaurant = activeRestaurant ? store.restaurants[activeRestaurant] : null;

  // ── LANDING ─────────────────────────────────────────────────────────────
  if (screen === "landing") return (
    <div style={{ fontFamily: G.font, background: G.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: G.text }}>
      <style>{css}</style>
      <div style={{ textAlign: "center", maxWidth: 460 }} className="fade">
        <div style={{ fontSize: 56, marginBottom: 16 }}>🍔</div>
        <div style={{ fontFamily: G.display, fontSize: 52, letterSpacing: 4, color: "#fff", lineHeight: 1 }}>PROFITPLATE</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: G.muted, marginTop: 6, marginBottom: 40 }}>RESTAURANT INTELLIGENCE PLATFORM</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn" style={{ fontSize: 13, padding: "13px 32px" }} onClick={() => setScreen("setup")}>+ NEW RESTAURANT</button>
          {restaurants.length > 0 && <button className="btn-ghost" style={{ fontSize: 13, padding: "13px 32px" }} onClick={() => setScreen("selectRestaurant")}>EXISTING RESTAURANT</button>}
        </div>
        {restaurants.length > 0 && (
          <div style={{ marginTop: 24, fontSize: 11, color: G.muted }}>{restaurants.length} restaurant{restaurants.length !== 1 ? "s" : ""} registered</div>
        )}
      </div>
    </div>
  );

  if (screen === "selectRestaurant") return (
    <div style={{ fontFamily: G.font, background: G.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: G.text }}>
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: 420 }} className="fade">
        <div style={{ fontFamily: G.display, fontSize: 32, letterSpacing: 3, color: "#fff", marginBottom: 24, textAlign: "center" }}>SELECT LOCATION</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {restaurants.map(r => (
            <button key={r.id} className="btn-ghost" style={{ padding: "16px 20px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              onClick={() => { setActiveRestaurant(r.id); setScreen("pin"); }}>
              <div>
                <div style={{ color: G.text, fontSize: 14 }}>{r.name}</div>
                <div style={{ color: G.muted, fontSize: 10, marginTop: 2 }}>{r.menuItems?.length || 0} items · {r.inventory?.length || 0} ingredients</div>
              </div>
              <span style={{ color: G.accent }}>→</span>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button className="btn-ghost" onClick={() => setScreen("landing")} style={{ fontSize: 11 }}>← BACK</button>
        </div>
      </div>
    </div>
  );

  if (screen === "setup") return (
    <SetupWizard
      onComplete={(data) => {
        const id = uid();
        const r = { ...blankRestaurant(data.name), ...data, id, setupDone: true };
        setStore(s => ({ ...s, restaurants: { ...s.restaurants, [id]: r } }));
        setActiveRestaurant(id);
        setScreen("app");
        showToast("Restaurant created! Welcome to ProfitPlate.");
      }}
      onBack={() => setScreen("landing")}
    />
  );

  if (screen === "pin" && restaurant) return (
    <PinScreen
      restaurant={restaurant}
      onSuccess={() => setScreen("app")}
      onBack={() => setScreen("selectRestaurant")}
    />
  );

  if (screen === "app" && restaurant) return (
    <>
      <MainApp
        restaurant={restaurant}
        update={(u) => updateRestaurant(activeRestaurant, u)}
        onLogout={() => setScreen("selectRestaurant")}
        showToast={showToast}
      />
      {toast && <div className={`toast ${toast.type === "success" ? "ts" : "te"}`}>{toast.msg}</div>}
    </>
  );

  return <div style={{ fontFamily: G.font, background: G.bg, minHeight: "100vh", color: G.text, display: "flex", alignItems: "center", justifyContent: "center" }}><style>{css}</style>Loading...</div>;
}

// ════════════════════════════════════════════════════════════════════════════
// SETUP WIZARD
// ════════════════════════════════════════════════════════════════════════════
function SetupWizard({ onComplete, onBack }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: "", logo: "", taxRate: "8.5", pin: "", confirmPin: "", inventory: [], menuItems: [] });
  const [invItem, setInvItem] = useState({ name: "", unit: "each", qty: "", threshold: "", cost: "", buyInPacks: false, packSize: "", packCost: "", packCount: "" });
  const [menuItem, setMenuItem] = useState({ name: "", price: "", ingredients: [] });
  const [menuIng, setMenuIng] = useState({ id: "", qty: "" });
  const [toast, setToast] = useState(null);

  function showT(msg, type = "success") { setToast({ msg, type }); setTimeout(() => setToast(null), 2200); }

  function addInv() {
    if (!invItem.name || !invItem.qty || !invItem.cost) return showT("Fill all fields", "error");
    setData(d => ({ ...d, inventory: [...d.inventory, { ...invItem, id: uid(), qty: parseFloat(invItem.qty), threshold: parseFloat(invItem.threshold) || 5, cost: parseFloat(invItem.cost) }] }));
    setInvItem({ name: "", unit: "each", qty: "", threshold: "", cost: "", buyInPacks: false, packSize: "", packCost: "", packCount: "" });
    showT("Ingredient added!");
  }

  function addMenuItem() {
    if (!menuItem.name || !menuItem.price) return showT("Fill name and price", "error");
    if (menuItem.ingredients.length === 0) return showT("Add at least one ingredient", "error");
    setData(d => ({ ...d, menuItems: [...d.menuItems, { ...menuItem, id: uid(), price: parseFloat(menuItem.price) }] }));
    setMenuItem({ name: "", price: "", ingredients: [] });
    showT("Menu item added!");
  }

  function addMenuIng() {
    if (!menuIng.id || !menuIng.qty) return;
    setMenuItem(m => ({ ...m, ingredients: [...m.ingredients.filter(i => i.id !== menuIng.id), { id: menuIng.id, qty: parseFloat(menuIng.qty) }] }));
    setMenuIng({ id: "", qty: "" });
  }

  const steps = ["Restaurant Info", "Set PIN", "Inventory", "Menu Items", "Review"];

  function nextStep() {
    if (step === 0 && !data.name) return showT("Enter your restaurant name", "error");
    if (step === 1) {
      if (data.pin.length < 4) return showT("PIN must be at least 4 digits", "error");
      if (data.pin !== data.confirmPin) return showT("PINs don't match", "error");
    }
    if (step === steps.length - 1) return onComplete(data);
    setStep(s => s + 1);
  }

  return (
    <div style={{ fontFamily: G.font, background: G.bg, minHeight: "100vh", color: G.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: 560 }} className="fade">
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 32, alignItems: "center" }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div className={`step-dot ${i <= step ? "done" : ""}`} style={{ width: i === step ? 28 : 8, borderRadius: i === step ? 4 : "50%", transition: "all .3s" }} />
              {i < steps.length - 1 && <div style={{ width: 20, height: 1, background: i < step ? G.accent : G.border }} />}
            </div>
          ))}
        </div>

        <div style={{ fontFamily: G.display, fontSize: 32, letterSpacing: 3, color: "#fff", marginBottom: 6 }}>{steps[step].toUpperCase()}</div>
        <div style={{ fontSize: 11, color: G.muted, marginBottom: 28, letterSpacing: 1 }}>STEP {step + 1} OF {steps.length}</div>

        {step === 0 && (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>RESTAURANT NAME *</div>
              <input placeholder="e.g. Smoky's Burger Bar" value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>TAX RATE (%)</div>
              <input type="number" placeholder="8.5" value={data.taxRate} onChange={e => setData(d => ({ ...d, taxRate: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>LOGO URL (optional)</div>
              <input placeholder="https://yourlogo.com/logo.png" value={data.logo} onChange={e => setData(d => ({ ...d, logo: e.target.value }))} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 12, color: G.muted, lineHeight: 1.6 }}>This PIN will be required every time someone opens the app. Keep it secure.</div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>CREATE PIN (4–6 digits)</div>
              <input type="password" inputMode="numeric" maxLength={6} placeholder="••••" value={data.pin} onChange={e => setData(d => ({ ...d, pin: e.target.value.replace(/\D/g, "") }))} />
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>CONFIRM PIN</div>
              <input type="password" inputMode="numeric" maxLength={6} placeholder="••••" value={data.confirmPin} onChange={e => setData(d => ({ ...d, confirmPin: e.target.value.replace(/\D/g, "") }))} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card">
              <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 14 }}>ADD INGREDIENT</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 10, marginBottom: 10 }}>
                <input placeholder="Ingredient name (e.g. Burger Patty)" value={invItem.name} onChange={e => setInvItem(i => ({ ...i, name: e.target.value }))} />
                <select value={invItem.unit} onChange={e => setInvItem(i => ({ ...i, unit: e.target.value }))}>
                  {["each", "oz", "lb", "g", "ml", "cup", "slice"].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                <input type="number" placeholder="Qty on hand" value={invItem.qty} onChange={e => setInvItem(i => ({ ...i, qty: e.target.value }))} />
                <input type="number" placeholder="Reorder at" value={invItem.threshold} onChange={e => setInvItem(i => ({ ...i, threshold: e.target.value }))} />
                <input type="number" placeholder="Cost per unit $" value={invItem.cost} onChange={e => setInvItem(i => ({ ...i, cost: e.target.value }))} />
              </div>
              <button className="btn" onClick={addInv}>+ ADD INGREDIENT</button>
            </div>

            {data.inventory.length > 0 && (
              <div className="card">
                <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 12 }}>ADDED ({data.inventory.length})</div>
                {data.inventory.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${G.border}`, fontSize: 12 }}>
                    <span>{item.name} <span style={{ color: G.muted }}>({item.unit})</span></span>
                    <span style={{ color: G.muted }}>qty: {item.qty} · ${item.cost}/unit</span>
                  </div>
                ))}
              </div>
            )}

            {data.inventory.length === 0 && <div style={{ fontSize: 11, color: G.muted, textAlign: "center", padding: 12 }}>Add ingredients first — you'll link them to menu items next</div>}
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card">
              <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 14 }}>ADD MENU ITEM</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <input placeholder="Item name (e.g. Classic Burger)" value={menuItem.name} onChange={e => setMenuItem(m => ({ ...m, name: e.target.value }))} />
                <input type="number" placeholder="Sell price $" value={menuItem.price} onChange={e => setMenuItem(m => ({ ...m, price: e.target.value }))} />
              </div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 8 }}>LINK INGREDIENTS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", gap: 8, marginBottom: 10 }}>
                <select value={menuIng.id} onChange={e => setMenuIng(i => ({ ...i, id: e.target.value }))}>
                  <option value="">Select ingredient</option>
                  {data.inventory.map(inv => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
                </select>
                <input type="number" placeholder="Qty" value={menuIng.qty} onChange={e => setMenuIng(i => ({ ...i, qty: e.target.value }))} />
                <button className="btn-ghost" onClick={addMenuIng} style={{ fontSize: 11 }}>+ ADD</button>
              </div>
              {menuItem.ingredients.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {menuItem.ingredients.map(ing => {
                    const inv = data.inventory.find(i => i.id === ing.id);
                    return <span key={ing.id} style={{ background: `${G.accent}22`, border: `1px solid ${G.accent}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, color: G.accent }}>{inv?.name} ×{ing.qty}</span>;
                  })}
                </div>
              )}
              <button className="btn" onClick={addMenuItem}>+ ADD MENU ITEM</button>
            </div>

            {data.menuItems.length > 0 && (
              <div className="card">
                <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 12 }}>MENU ({data.menuItems.length})</div>
                {data.menuItems.map(item => {
                  const cogs = getCOGS(item, data.inventory);
                  const margin = item.price > 0 ? ((item.price - cogs) / item.price * 100).toFixed(0) : 0;
                  return (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${G.border}`, fontSize: 12 }}>
                      <span style={{ color: G.text }}>{item.name}</span>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <span style={{ color: G.muted }}>${item.price.toFixed(2)}</span>
                        <span className={`badge ${parseFloat(margin) >= 60 ? "bg" : parseFloat(margin) >= 40 ? "by" : "br"}`}>{margin}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              {data.logo && <img src={data.logo} alt="logo" style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover" }} onError={e => e.target.style.display = "none"} />}
              <div>
                <div style={{ fontFamily: G.display, fontSize: 28, letterSpacing: 2, color: "#fff" }}>{data.name}</div>
                <div style={{ fontSize: 11, color: G.muted }}>Tax: {data.taxRate}% · PIN: {"•".repeat(data.pin.length)}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "#0a0a14", border: `1px solid ${G.border}`, borderRadius: 6, padding: 14 }}>
                <div style={{ fontSize: 10, color: G.muted, letterSpacing: 1, marginBottom: 6 }}>INGREDIENTS</div>
                <div style={{ fontFamily: G.display, fontSize: 32, color: G.accent }}>{data.inventory.length}</div>
              </div>
              <div style={{ background: "#0a0a14", border: `1px solid ${G.border}`, borderRadius: 6, padding: 14 }}>
                <div style={{ fontSize: 10, color: G.muted, letterSpacing: 1, marginBottom: 6 }}>MENU ITEMS</div>
                <div style={{ fontFamily: G.display, fontSize: 32, color: G.green }}>{data.menuItems.length}</div>
              </div>
            </div>
            <div style={{ marginTop: 16, fontSize: 11, color: G.muted }}>You can add more items anytime from the Settings screen inside the app.</div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          <button className="btn-ghost" onClick={() => step === 0 ? onBack() : setStep(s => s - 1)}>← BACK</button>
          <button className="btn" onClick={nextStep}>{step === steps.length - 1 ? "LAUNCH APP →" : "NEXT →"}</button>
        </div>
      </div>
      {toast && <div className={`toast ${toast.type === "success" ? "ts" : "te"}`}>{toast.msg}</div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PIN SCREEN
// ════════════════════════════════════════════════════════════════════════════
function PinScreen({ restaurant, onSuccess, onBack }) {
  const [entered, setEntered] = useState("");
  const [shake, setShake] = useState(false);

  function press(d) {
    if (entered.length >= 6) return;
    const next = entered + d;
    setEntered(next);
    if (next.length >= restaurant.pin.length) {
      if (next === restaurant.pin) { onSuccess(); }
      else {
        setShake(true);
        setTimeout(() => { setShake(false); setEntered(""); }, 600);
      }
    }
  }
  function del() { setEntered(e => e.slice(0, -1)); }

  return (
    <div style={{ fontFamily: G.font, background: G.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: G.text }}>
      <style>{css}</style>
      <div style={{ textAlign: "center" }} className="fade">
        {restaurant.logo && <img src={restaurant.logo} alt="logo" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", marginBottom: 16 }} onError={e => e.target.style.display = "none"} />}
        <div style={{ fontFamily: G.display, fontSize: 36, letterSpacing: 3, color: "#fff", marginBottom: 4 }}>{restaurant.name}</div>
        <div style={{ fontSize: 11, color: G.muted, letterSpacing: 2, marginBottom: 40 }}>ENTER PIN TO CONTINUE</div>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 36, animation: shake ? "shake .4s ease" : "none" }}>
          {Array.from({ length: restaurant.pin.length }).map((_, i) => (
            <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${i < entered.length ? G.accent : G.border}`, background: i < entered.length ? G.accent : "transparent", transition: "all .15s" }} />
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 70px)", gap: 10, justifyContent: "center" }}>
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} className="pin-btn" onClick={() => press(String(n))}>{n}</button>
          ))}
          <div />
          <button className="pin-btn" onClick={() => press("0")}>0</button>
          <button className="pin-btn" onClick={del} style={{ fontSize: 16, color: G.muted }}>⌫</button>
        </div>

        <button className="btn-ghost" style={{ marginTop: 32, fontSize: 11 }} onClick={onBack}>← BACK</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════════════════════
function MainApp({ restaurant, update, onLogout, showToast }) {
  const [tab, setTab] = useState("dashboard");
  const [order, setOrder] = useState([]);
  const [toast, setToast] = useState(null);
  const [receipt, setReceipt] = useState(null);

  function toast2(msg, type = "success") { setToast({ msg, type }); setTimeout(() => setToast(null), 2600); }

  const sales = restaurant.sales || [];
  const inventory = restaurant.inventory || [];
  const menuItems = restaurant.menuItems || [];
  const taxRate = parseFloat(restaurant.taxRate) || 0;

  const totalRevenue = sales.reduce((s, x) => s + x.price, 0);
  const totalCOGS = sales.reduce((s, x) => s + x.cost, 0);
  const totalProfit = totalRevenue - totalCOGS;
  const lowStock = inventory.filter(i => i.qty <= i.threshold);

  function addToOrder(item) {
    setOrder(prev => {
      const ex = prev.find(o => o.id === item.id);
      return ex ? prev.map(o => o.id === item.id ? { ...o, qty: o.qty + 1 } : o) : [...prev, { ...item, qty: 1 }];
    });
  }

  function submitOrder() {
    if (order.length === 0) return toast2("Add items first", "error");
    let newInv = [...inventory];
    for (const oi of order) {
      const mi = menuItems.find(m => m.id === oi.id);
      for (const ing of (mi.ingredients || [])) {
        const inv = newInv.find(i => i.id === ing.id);
        if (!inv || inv.qty < ing.qty * oi.qty) return toast2(`Low stock: ${inv?.name || "ingredient"}`, "error");
      }
    }
    let newSales = [...sales];
    const subtotal = order.reduce((s, o) => s + o.price * o.qty, 0);
    const tax = subtotal * taxRate / 100;
    const total = subtotal + tax;
    let totalCost = 0;
    for (const oi of order) {
      const mi = menuItems.find(m => m.id === oi.id);
      for (let q = 0; q < oi.qty; q++) {
        for (const ing of (mi.ingredients || [])) {
          newInv = newInv.map(i => i.id === ing.id ? { ...i, qty: i.qty - ing.qty } : i);
        }
        const cogs = getCOGS(mi, inventory);
        totalCost += cogs;
        newSales.push({ id: uid(), item: mi.name, price: mi.price, cost: parseFloat(cogs.toFixed(2)), profit: parseFloat((mi.price - cogs).toFixed(2)), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
      }
    }
    update(r => ({ ...r, inventory: newInv, sales: newSales }));
    setReceipt({ items: [...order], subtotal, tax, total, profit: subtotal - totalCost, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
    setOrder([]);
  }

  const tabs = [
    { id: "dashboard", icon: "◈", label: "Dashboard" },
    { id: "pos", icon: "⊕", label: "Ring Up" },
    { id: "inventory", icon: "⊟", label: "Inventory" },
    { id: "menu", icon: "%", label: "Margins" },
    { id: "deals", icon: "★", label: "Deals" },
    { id: "paycheck", icon: "$", label: "Paycheck" },
    { id: "settings", icon: "⚙", label: "Settings" },
  ];

  return (
    <div style={{ fontFamily: G.font, background: G.bg, minHeight: "100vh", color: G.text }}>
      <style>{css}</style>

      <div style={{ borderBottom: `1px solid ${G.border}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {restaurant.logo
            ? <img src={restaurant.logo} alt="" style={{ width: 34, height: 34, borderRadius: 6, objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
            : <div style={{ background: G.accent, width: 34, height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>🍔</div>}
          <div>
            <div style={{ fontFamily: G.display, fontSize: 20, letterSpacing: 2, color: "#fff" }}>{restaurant.name}</div>
            <div style={{ fontSize: 10, color: G.muted, letterSpacing: 1 }}>PROFITPLATE · TAX {restaurant.taxRate}%</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {lowStock.length > 0 && <span className="badge br">⚠ {lowStock.length} LOW</span>}
          <button className="btn-ghost" style={{ fontSize: 10, padding: "6px 12px" }} onClick={onLogout}>LOCK</button>
        </div>
      </div>

      <div style={{ padding: "10px 20px", borderBottom: `1px solid ${G.border}`, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {tabs.map(t => <button key={t.id} className={`tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>{t.icon} {t.label}</button>)}
      </div>

      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>

        {tab === "dashboard" && (
          <div className="fade">
            <div style={{ fontFamily: G.display, fontSize: 30, letterSpacing: 3, marginBottom: 20, color: "#fff" }}>TODAY'S OVERVIEW</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14, marginBottom: 22 }}>
              {[
                { label: "REVENUE", val: `$${totalRevenue.toFixed(2)}`, sub: `${sales.length} sales`, color: G.green },
                { label: "FOOD COST", val: `$${totalCOGS.toFixed(2)}`, sub: "ingredients used", color: G.red },
                { label: "NET PROFIT", val: `$${totalProfit.toFixed(2)}`, sub: totalRevenue > 0 ? `${((totalProfit/totalRevenue)*100).toFixed(1)}% margin` : "—", color: G.accent },
                { label: "LOW STOCK", val: lowStock.length, sub: "items need reorder", color: G.yellow },
              ].map((s, i) => (
                <div key={i} className="card" style={{ borderTop: `2px solid ${s.color}` }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontFamily: G.display, fontSize: 30, letterSpacing: 2, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: G.muted, marginTop: 4 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="card">
                <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 14 }}>RECENT SALES</div>
                {sales.length === 0 && <div style={{ color: G.muted, fontSize: 12 }}>No sales yet. Ring one up!</div>}
                {sales.slice(-6).reverse().map(s => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #0f0f1c", fontSize: 12 }}>
                    <div><div>{s.item}</div><div style={{ color: G.muted, fontSize: 10 }}>{s.time}</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ color: G.green }}>+${s.profit.toFixed(2)}</div><div style={{ color: G.muted, fontSize: 10 }}>${s.price.toFixed(2)} sold</div></div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 14 }}>INVENTORY HEALTH</div>
                {inventory.length === 0 && <div style={{ color: G.muted, fontSize: 12 }}>No inventory yet. Add in Settings.</div>}
                {inventory.slice(0, 8).map(item => {
                  const pct = Math.min((item.qty / Math.max(item.threshold * 4, 1)) * 100, 100);
                  const color = item.qty <= item.threshold ? G.red : item.qty <= item.threshold * 2 ? G.yellow : G.green;
                  return (
                    <div key={item.id} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                        <span style={{ color: "#aaa" }}>{item.name}</span>
                        <span style={{ color }}>{item.qty}</span>
                      </div>
                      <div style={{ background: G.border, borderRadius: 2, height: 3 }}>
                        <div style={{ width: `${pct}%`, height: 3, borderRadius: 2, background: color, transition: "width .3s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === "pos" && (
          <div className="fade">
            <div style={{ fontFamily: G.display, fontSize: 30, letterSpacing: 3, marginBottom: 20, color: "#fff" }}>RING UP A SALE</div>

            {receipt ? (
              <div style={{ maxWidth: 420, margin: "0 auto" }}>
                <div className="card" style={{ borderColor: `${G.green}55`, textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <div style={{ fontFamily: G.display, fontSize: 28, letterSpacing: 2, color: G.green, marginBottom: 4 }}>SALE LOGGED</div>
                  <div style={{ fontSize: 11, color: G.muted, marginBottom: 24, letterSpacing: 1 }}>MARK AS RECEIVED FROM CUSTOMER</div>

                  <div style={{ background: "#0a0a14", border: `1px solid ${G.border}`, borderRadius: 6, padding: 16, textAlign: "left", marginBottom: 20 }}>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 12 }}>ORDER SUMMARY — {receipt.time}</div>
                    {receipt.items.map(o => (
                      <div key={o.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: `1px solid ${G.border}` }}>
                        <span>{o.name} <span style={{ color: G.muted }}>×{o.qty}</span></span>
                        <span>${(o.price * o.qty).toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: G.muted }}>
                        <span>Subtotal</span><span>${receipt.subtotal.toFixed(2)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: G.muted }}>
                        <span>Tax ({taxRate}%)</span><span>${receipt.tax.toFixed(2)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, paddingTop: 8, borderTop: `1px solid ${G.border}`, marginTop: 4 }}>
                        <span style={{ color: "#fff" }}>TOTAL DUE</span>
                        <span style={{ fontFamily: G.display, fontSize: 22, color: "#fff" }}>${receipt.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: `${G.accent}11`, border: `1px solid ${G.accent}33`, borderRadius: 6, padding: 12, marginBottom: 20, fontSize: 11, color: G.accent, lineHeight: 1.6 }}>
                    💳 Collect <strong>${receipt.total.toFixed(2)}</strong> from customer via cash, card, or your existing payment method.
                  </div>

                  <div style={{ background: `${G.green}11`, border: `1px solid ${G.green}33`, borderRadius: 6, padding: 12, marginBottom: 24, fontSize: 11, color: G.green }}>
                    📈 Your profit on this order: <strong>${receipt.profit.toFixed(2)}</strong> · Inventory auto-updated
                  </div>

                  <button className="btn" style={{ width: "100%", fontSize: 13, padding: "13px" }} onClick={() => setReceipt(null)}>
                    + NEW ORDER
                  </button>
                </div>
              </div>
            ) : menuItems.length === 0
              ? <div className="card" style={{ color: G.muted, fontSize: 13 }}>No menu items yet. Go to Settings → Menu Items to add them.</div>
              : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {menuItems.map(item => {
                      const cogs = getCOGS(item, inventory);
                      const margin = item.price > 0 ? ((item.price - cogs) / item.price * 100).toFixed(0) : 0;
                      const inOrder = order.find(o => o.id === item.id);
                      return (
                        <button key={item.id} style={{ background: G.card, border: `1px solid ${inOrder ? G.accent : G.border}`, color: G.text, padding: "14px 16px", borderRadius: 7, textAlign: "left", transition: "all .15s", cursor: "pointer" }} onClick={() => addToOrder(item)}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div style={{ fontWeight: 500, fontSize: 13 }}>{item.name}</div>
                            <span className={`badge ${parseFloat(margin) >= 65 ? "bg" : parseFloat(margin) >= 45 ? "by" : "br"}`}>{margin}%</span>
                          </div>
                          <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", color: G.muted, fontSize: 11 }}>
                            <span>${item.price.toFixed(2)}</span><span>COGS ${cogs.toFixed(2)}</span>
                          </div>
                          {inOrder && <div style={{ marginTop: 6, color: G.accent, fontSize: 10 }}>×{inOrder.qty} in order</div>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="card" style={{ height: "fit-content" }}>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 14 }}>CURRENT ORDER</div>
                    {order.length === 0 ? <div style={{ color: G.muted, fontSize: 12, textAlign: "center", padding: "16px 0" }}>Tap items to add</div> : (
                      <>
                        {order.map(o => (
                          <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #0f0f1c", fontSize: 12 }}>
                            <div><div>{o.name}</div><div style={{ color: G.muted, fontSize: 10 }}>×{o.qty} @ ${o.price.toFixed(2)}</div></div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <span style={{ color: G.green }}>${(o.price * o.qty).toFixed(2)}</span>
                              <button onClick={() => setOrder(prev => prev.filter(x => x.id !== o.id))} style={{ background: "none", border: "none", color: G.red, fontSize: 14 }}>✕</button>
                            </div>
                          </div>
                        ))}
                        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${G.border}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                            <span style={{ color: G.muted }}>Subtotal</span>
                            <span>${order.reduce((s, o) => s + o.price * o.qty, 0).toFixed(2)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: G.muted, marginBottom: 4 }}>
                            <span>Tax ({taxRate}%)</span>
                            <span>${(order.reduce((s, o) => s + o.price * o.qty, 0) * taxRate / 100).toFixed(2)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 14, paddingTop: 8, borderTop: `1px solid ${G.border}` }}>
                            <span>Total</span>
                            <span style={{ color: "#fff" }}>${(order.reduce((s, o) => s + o.price * o.qty, 0) * (1 + taxRate / 100)).toFixed(2)}</span>
                          </div>
                          <button className="btn" style={{ width: "100%" }} onClick={submitOrder}>MARK AS SOLD →</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
          </div>
        )}

        {tab === "inventory" && (
          <div className="fade">
            <div style={{ fontFamily: G.display, fontSize: 30, letterSpacing: 3, marginBottom: 20, color: "#fff" }}>INVENTORY</div>
            {inventory.length === 0
              ? <div className="card" style={{ color: G.muted }}>No inventory. Add ingredients in Settings.</div>
              : (
                <div className="card">
                  <table>
                    <thead><tr><th>INGREDIENT</th><th>IN STOCK</th><th>UNIT</th><th>COST/UNIT</th><th>REORDER AT</th><th>STATUS</th></tr></thead>
                    <tbody>
                      {inventory.map(item => {
                        const s = item.qty <= item.threshold ? "CRITICAL" : item.qty <= item.threshold * 2 ? "LOW" : "OK";
                        return (
                          <tr key={item.id}>
                            <td>{item.name}</td>
                            <td style={{ fontFamily: G.display, fontSize: 18, color: s === "CRITICAL" ? G.red : s === "LOW" ? G.yellow : G.text }}>{item.qty}</td>
                            <td style={{ color: G.muted }}>{item.unit}</td>
                            <td style={{ color: "#aaa" }}>${item.cost.toFixed(2)}</td>
                            <td style={{ color: G.muted }}>{item.threshold}</td>
                            <td><span className={`badge ${s === "CRITICAL" ? "br" : s === "LOW" ? "by" : "bg"}`}>{s}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        )}

        {tab === "menu" && (
          <div className="fade">
            <div style={{ fontFamily: G.display, fontSize: 30, letterSpacing: 3, marginBottom: 20, color: "#fff" }}>PROFIT MARGINS</div>
            {menuItems.length === 0
              ? <div className="card" style={{ color: G.muted }}>No menu items yet. Add them in Settings.</div>
              : [...menuItems].sort((a, b) => {
                  const ma = (a.price - getCOGS(a, inventory)) / a.price;
                  const mb = (b.price - getCOGS(b, inventory)) / b.price;
                  return mb - ma;
                }).map(item => {
                  const cogs = getCOGS(item, inventory);
                  const profit = item.price - cogs;
                  const margin = item.price > 0 ? (profit / item.price * 100).toFixed(1) : 0;
                  return (
                    <div key={item.id} className="card" style={{ marginBottom: 10, display: "grid", gridTemplateColumns: "1fr 80px 80px 80px 110px", alignItems: "center", gap: 14 }}>
                      <div>
                        <div style={{ fontWeight: 500, marginBottom: 6 }}>{item.name}</div>
                        <div style={{ background: G.border, borderRadius: 2, height: 3 }}>
                          <div style={{ width: `${Math.min(parseFloat(margin), 100)}%`, height: 3, borderRadius: 2, background: parseFloat(margin) >= 65 ? G.green : parseFloat(margin) >= 45 ? G.yellow : G.red }} />
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: G.muted, marginBottom: 2 }}>SELL</div><div style={{ fontFamily: G.display, fontSize: 20 }}>${item.price.toFixed(2)}</div></div>
                      <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: G.muted, marginBottom: 2 }}>COGS</div><div style={{ fontFamily: G.display, fontSize: 20, color: G.red }}>${cogs.toFixed(2)}</div></div>
                      <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: G.muted, marginBottom: 2 }}>PROFIT</div><div style={{ fontFamily: G.display, fontSize: 20, color: G.green }}>${profit.toFixed(2)}</div></div>
                      <div style={{ textAlign: "center" }}><span className={`badge ${parseFloat(margin) >= 65 ? "bg" : parseFloat(margin) >= 45 ? "by" : "br"}`} style={{ fontSize: 13, padding: "4px 10px" }}>{margin}%</span></div>
                    </div>
                  );
                })}
          </div>
        )}

        {tab === "deals" && (
          <div className="fade">
            <div style={{ fontFamily: G.display, fontSize: 30, letterSpacing: 3, marginBottom: 8, color: "#fff" }}>DEAL ENGINE</div>
            <div style={{ fontSize: 12, color: G.muted, marginBottom: 24 }}>Auto-generated combos to push revenue and move stock</div>
            {menuItems.length < 2
              ? <div className="card" style={{ color: G.muted }}>Add at least 2 menu items to generate combo suggestions.</div>
              : (() => {
                  const combos = [];
                  for (let i = 0; i < menuItems.length; i++) {
                    for (let j = i + 1; j < menuItems.length; j++) {
                      const items = [menuItems[i], menuItems[j]];
                      const totalCOGS2 = items.reduce((s, x) => s + getCOGS(x, inventory), 0);
                      const fullPrice = items.reduce((s, x) => s + x.price, 0);
                      const suggestedPrice = parseFloat((fullPrice * 0.92).toFixed(2));
                      const margin = ((suggestedPrice - totalCOGS2) / suggestedPrice * 100).toFixed(1);
                      combos.push({ items, totalCOGS: totalCOGS2, fullPrice, suggestedPrice, margin });
                    }
                  }
                  return combos.sort((a, b) => parseFloat(b.margin) - parseFloat(a.margin)).slice(0, 6).map((c, i) => (
                    <div key={i} className="card" style={{ marginBottom: 12, borderColor: `${G.accent}33` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontFamily: G.display, fontSize: 18, color: G.accent, letterSpacing: 1, marginBottom: 8 }}>
                            {c.items.map(x => x.name).join(" + ")}
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {c.items.map(x => <span key={x.id} style={{ background: `${G.accent}18`, border: `1px solid ${G.accent}33`, borderRadius: 20, padding: "2px 10px", fontSize: 11, color: G.accent }}>{x.name} ${x.price.toFixed(2)}</span>)}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: G.display, fontSize: 32, color: G.green }}>${c.suggestedPrice.toFixed(2)}</div>
                          <div style={{ fontSize: 10, color: G.muted }}>saves ${(c.fullPrice - c.suggestedPrice).toFixed(2)}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 12, display: "flex", gap: 16, fontSize: 11, color: G.muted }}>
                        <span>COGS: <span style={{ color: G.red }}>${c.totalCOGS.toFixed(2)}</span></span>
                        <span>Profit: <span style={{ color: G.green }}>${(c.suggestedPrice - c.totalCOGS).toFixed(2)}</span></span>
                        <span className={`badge ${parseFloat(c.margin) >= 60 ? "bg" : "by"}`}>{c.margin}% margin</span>
                      </div>
                    </div>
                  ));
                })()}

            {inventory.filter(i => i.qty > i.threshold * 3).length > 0 && (
              <>
                <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, margin: "24px 0 12px" }}>MOVE OVERSTOCKED ITEMS</div>
                {inventory.filter(i => i.qty > i.threshold * 3).map(item => (
                  <div key={item.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, borderColor: `${G.yellow}33` }}>
                    <div>
                      <div style={{ color: G.yellow, fontSize: 12, marginBottom: 2 }}>⚡ OVERSTOCKED: {item.name}</div>
                      <div style={{ fontSize: 11, color: G.muted }}>{item.qty} units on hand — feature in a daily special</div>
                    </div>
                    <span className="badge by">PROMO OPPORTUNITY</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {tab === "paycheck" && (
          <div className="fade">
            <div style={{ fontFamily: G.display, fontSize: 30, letterSpacing: 3, marginBottom: 8, color: "#fff" }}>PAYCHECK VIEW</div>
            <div style={{ fontSize: 12, color: G.muted, marginBottom: 24 }}>What you actually pocketed after food costs</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div className="card" style={{ borderTop: `2px solid ${G.text}` }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 8 }}>GROSS REVENUE</div>
                <div style={{ fontFamily: G.display, fontSize: 42, color: G.text }}>${totalRevenue.toFixed(2)}</div>
                <div style={{ fontSize: 11, color: G.muted }}>{sales.length} transactions</div>
              </div>
              <div className="card" style={{ borderTop: `2px solid ${G.red}` }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 8 }}>FOOD COST</div>
                <div style={{ fontFamily: G.display, fontSize: 42, color: G.red }}>− ${totalCOGS.toFixed(2)}</div>
                <div style={{ fontSize: 11, color: G.muted }}>ingredients used</div>
              </div>
            </div>

            <div className="card" style={{ borderColor: `${G.accent}55`, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: G.accent, marginBottom: 4 }}>YOUR TAKE-HOME</div>
                  <div style={{ fontFamily: G.display, fontSize: 56, color: G.green }}>${totalProfit.toFixed(2)}</div>
                  <div style={{ fontSize: 11, color: G.muted }}>{totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}% margin · does not include labor/overhead</div>
                </div>
                <div style={{ fontSize: 64 }}>💰</div>
              </div>
            </div>

            {sales.length > 0 && (
              <div className="card">
                <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 14 }}>TRANSACTION LOG</div>
                <table>
                  <thead><tr><th>ITEM</th><th>TIME</th><th>SALE</th><th>FOOD COST</th><th>PROFIT</th></tr></thead>
                  <tbody>
                    {sales.slice().reverse().map(s => (
                      <tr key={s.id}>
                        <td>{s.item}</td>
                        <td style={{ color: G.muted }}>{s.time}</td>
                        <td>${s.price.toFixed(2)}</td>
                        <td style={{ color: G.red }}>−${s.cost.toFixed(2)}</td>
                        <td style={{ color: G.green }}>+${s.profit.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "settings" && (
          <SettingsPanel restaurant={restaurant} update={update} showToast={(m,t) => { toast2(m,t); }} />
        )}
      </div>

      {toast && <div className={`toast ${toast.type === "success" ? "ts" : "te"}`}>{toast.msg}</div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SETTINGS PANEL
// ════════════════════════════════════════════════════════════════════════════
function SettingsPanel({ restaurant, update, showToast }) {
  const [section, setSection] = useState("restaurant");
  const [form, setForm] = useState({ name: restaurant.name, logo: restaurant.logo || "", taxRate: String(restaurant.taxRate), pin: "", confirmPin: "" });
  const [invItem, setInvItem] = useState({ name: "", unit: "each", qty: "", threshold: "", cost: "", buyInPacks: false, packSize: "", packCost: "", packCount: "" });
  const [menuItem, setMenuItem] = useState({ name: "", price: "", ingredients: [] });
  const [menuIng, setMenuIng] = useState({ id: "", qty: "" });

  function saveRestaurant() {
    if (!form.name) return showToast("Name required", "error");
    update(r => ({ ...r, name: form.name, logo: form.logo, taxRate: parseFloat(form.taxRate) || 0 }));
    showToast("Restaurant info saved!");
  }

  function savePin() {
    if (form.pin.length < 4) return showToast("PIN must be 4+ digits", "error");
    if (form.pin !== form.confirmPin) return showToast("PINs don't match", "error");
    update(r => ({ ...r, pin: form.pin }));
    setForm(f => ({ ...f, pin: "", confirmPin: "" }));
    showToast("PIN updated!");
  }

  function addInv() {
    const name = (invItem.name || "").trim();
    const qty = parseFloat(invItem.qty);
    const cost = parseFloat(invItem.cost);
    const threshold = parseFloat(invItem.threshold) || 5;
    if (!name) return showToast("Enter ingredient name", "error");
    if (isNaN(qty) || qty <= 0) return showToast("Enter a valid quantity", "error");
    if (isNaN(cost) || cost < 0) return showToast("Enter a valid cost", "error");
    const newItem = { id: uid(), name, unit: invItem.unit || "each", qty, threshold, cost };
    update(r => {
      const existing = r.inventory || [];
      return { ...r, inventory: [...existing, newItem] };
    });
    setInvItem({ name: "", unit: "each", qty: "", threshold: "", cost: "", buyInPacks: false, packSize: "", packCost: "", packCount: "" });
    showToast(name + " added!");
  }

  function updateInvQty(id, val) {
    const qty = parseFloat(val);
    if (isNaN(qty)) return;
    update(r => ({ ...r, inventory: (r.inventory || []).map(i => i.id === id ? { ...i, qty } : i) }));
  }

  function deleteInv(id) {
    update(r => ({ ...r, inventory: r.inventory.filter(i => i.id !== id) }));
    showToast("Removed");
  }

  function addMenuIng() {
    if (!menuIng.id || !menuIng.qty) return;
    setMenuItem(m => ({ ...m, ingredients: [...m.ingredients.filter(i => i.id !== menuIng.id), { id: menuIng.id, qty: parseFloat(menuIng.qty) }] }));
    setMenuIng({ id: "", qty: "" });
  }

  function addMenuItem() {
    if (!menuItem.name || !menuItem.price) return showToast("Name and price required", "error");
    if (menuItem.ingredients.length === 0) return showToast("Add at least one ingredient", "error");
    update(r => ({ ...r, menuItems: [...(r.menuItems || []), { ...menuItem, id: uid(), price: parseFloat(menuItem.price) }] }));
    setMenuItem({ name: "", price: "", ingredients: [] });
    showToast("Menu item added!");
  }

  function deleteMenuItem(id) {
    update(r => ({ ...r, menuItems: r.menuItems.filter(m => m.id !== id) }));
    showToast("Removed");
  }

  const sections = ["restaurant", "pin", "inventory", "menu"];

  return (
    <div className="fade">
      <div style={{ fontFamily: G.display, fontSize: 30, letterSpacing: 3, marginBottom: 20, color: "#fff" }}>SETTINGS</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {sections.map(s => <button key={s} className={`tab ${section === s ? "on" : ""}`} onClick={() => setSection(s)}>{s.toUpperCase()}</button>)}
      </div>

      {section === "restaurant" && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 500 }}>
          <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>RESTAURANT NAME</div>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>LOGO URL</div>
            <input value={form.logo} onChange={e => setForm(f => ({ ...f, logo: e.target.value }))} placeholder="https://..." /></div>
          <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>TAX RATE (%)</div>
            <input type="number" value={form.taxRate} onChange={e => setForm(f => ({ ...f, taxRate: e.target.value }))} /></div>
          <button className="btn" onClick={saveRestaurant}>SAVE CHANGES</button>
        </div>
      )}

      {section === "pin" && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}>
          <div style={{ fontSize: 12, color: G.muted }}>Change the PIN used to access this restaurant's dashboard.</div>
          <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>NEW PIN (4–6 digits)</div>
            <input type="password" inputMode="numeric" maxLength={6} value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, "") }))} placeholder="••••" /></div>
          <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>CONFIRM NEW PIN</div>
            <input type="password" inputMode="numeric" maxLength={6} value={form.confirmPin} onChange={e => setForm(f => ({ ...f, confirmPin: e.target.value.replace(/\D/g, "") }))} placeholder="••••" /></div>
          <button className="btn" onClick={savePin}>UPDATE PIN</button>
        </div>
      )}

      {section === "inventory" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 14 }}>ADD NEW INGREDIENT</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 10, marginBottom: 10 }}>
              <input placeholder="Ingredient name (e.g. Burger Buns)" value={invItem.name} onChange={e => setInvItem(i => ({ ...i, name: e.target.value }))} />
              <select value={invItem.unit} onChange={e => setInvItem(i => ({ ...i, unit: e.target.value }))}>
                {["each", "oz", "lb", "g", "ml", "cup", "slice"].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "10px 12px", background: "#0a0a14", border: `1px solid ${invItem.buyInPacks ? G.accent + "66" : G.border}`, borderRadius: 6 }}>
              <input type="checkbox" id="packToggle" checked={!!invItem.buyInPacks} onChange={e => setInvItem(i => ({ ...i, buyInPacks: e.target.checked, packSize: "", packCost: "", cost: "" }))} style={{ width: "auto", accentColor: G.accent }} />
              <label htmlFor="packToggle" style={{ fontSize: 12, color: invItem.buyInPacks ? G.accent : G.muted, cursor: "pointer", letterSpacing: 1 }}>
                I BUY THIS IN PACKS / CASES
              </label>
            </div>

            {invItem.buyInPacks ? (
              <div style={{ background: "#0a0a14", border: `1px solid ${G.accent}33`, borderRadius: 6, padding: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: G.accent, letterSpacing: 2, marginBottom: 10 }}>PACK DETAILS</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: G.muted, marginBottom: 4 }}>HOW MANY IN A PACK?</div>
                    <input type="number" placeholder="e.g. 8 buns per pack" value={invItem.packSize || ""} onChange={e => {
                      const ps = e.target.value;
                      const pc = invItem.packCost;
                      const costPer = ps && pc ? (parseFloat(pc) / parseFloat(ps)).toFixed(4) : "";
                      setInvItem(i => ({ ...i, packSize: ps, cost: costPer }));
                    }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: G.muted, marginBottom: 4 }}>PRICE PER PACK ($)</div>
                    <input type="number" placeholder="e.g. 2.99" value={invItem.packCost || ""} onChange={e => {
                      const pc = e.target.value;
                      const ps = invItem.packSize;
                      const costPer = ps && pc ? (parseFloat(pc) / parseFloat(ps)).toFixed(4) : "";
                      setInvItem(i => ({ ...i, packCost: pc, cost: costPer }));
                    }} />
                  </div>
                </div>
                {invItem.cost && invItem.packSize && invItem.packCost && (
                  <div style={{ background: `${G.green}11`, border: `1px solid ${G.green}33`, borderRadius: 5, padding: "8px 12px", fontSize: 11, color: G.green }}>
                    ✓ Cost per unit = <strong>${parseFloat(invItem.cost).toFixed(4)}</strong> &nbsp;·&nbsp; ${invItem.packCost} ÷ {invItem.packSize} units
                  </div>
                )}
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 10, color: G.muted, marginBottom: 4 }}>HOW MANY PACKS DO YOU HAVE RIGHT NOW?</div>
                  <input type="number" placeholder="e.g. 3 packs" value={invItem.packCount || ""} onChange={e => {
                    const pc = e.target.value;
                    const ps = invItem.packSize;
                    const totalQty = ps && pc ? String(parseFloat(ps) * parseFloat(pc)) : "";
                    setInvItem(i => ({ ...i, packCount: pc, qty: totalQty }));
                  }} />
                  {invItem.qty && invItem.packSize && invItem.packCount && (
                    <div style={{ marginTop: 6, fontSize: 11, color: G.muted }}>= {invItem.qty} total units in stock</div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                <input type="number" placeholder="Qty on hand" value={invItem.qty} onChange={e => setInvItem(i => ({ ...i, qty: e.target.value }))} />
                <input type="number" placeholder="Reorder at" value={invItem.threshold} onChange={e => setInvItem(i => ({ ...i, threshold: e.target.value }))} />
                <input type="number" placeholder="Cost per unit $" value={invItem.cost} onChange={e => setInvItem(i => ({ ...i, cost: e.target.value }))} />
              </div>
            )}

            <button className="btn" onClick={addInv}>+ ADD INGREDIENT</button>
          </div>

          {(restaurant.inventory || []).length > 0 && (
            <div className="card">
              <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 14 }}>MANAGE INVENTORY</div>
              <table>
                <thead><tr><th>NAME</th><th>QTY</th><th>UNIT</th><th>COST</th><th></th></tr></thead>
                <tbody>
                  {restaurant.inventory.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td><input type="number" value={item.qty} onChange={e => updateInvQty(item.id, e.target.value)} style={{ width: 70, padding: "4px 8px" }} /></td>
                      <td style={{ color: G.muted }}>{item.unit}</td>
                      <td style={{ color: G.muted }}>${item.cost}</td>
                      <td><button className="btn-danger" onClick={() => deleteInv(item.id)}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {section === "menu" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 14 }}>ADD MENU ITEM</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <input placeholder="Item name" value={menuItem.name} onChange={e => setMenuItem(m => ({ ...m, name: e.target.value }))} />
              <input type="number" placeholder="Sell price $" value={menuItem.price} onChange={e => setMenuItem(m => ({ ...m, price: e.target.value }))} />
            </div>

            <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 8 }}>INGREDIENTS USED</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", gap: 8, marginBottom: 10 }}>
              <select value={menuIng.id} onChange={e => setMenuIng(i => ({ ...i, id: e.target.value }))}>
                <option value="">Select ingredient</option>
                {(restaurant.inventory || []).map(inv => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
              </select>
              <input type="number" placeholder="Qty" value={menuIng.qty} onChange={e => setMenuIng(i => ({ ...i, qty: e.target.value }))} />
              <button className="btn-ghost" onClick={addMenuIng} style={{ fontSize: 11 }}>+ ADD</button>
            </div>

            {menuItem.ingredients.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {menuItem.ingredients.map(ing => {
                  const inv = (restaurant.inventory || []).find(i => i.id === ing.id);
                  return <span key={ing.id} style={{ background: `${G.accent}18`, border: `1px solid ${G.accent}33`, borderRadius: 20, padding: "2px 10px", fontSize: 11, color: G.accent }}>{inv?.name} ×{ing.qty}</span>;
                })}
              </div>
            )}

            <button className="btn" onClick={addMenuItem}>+ ADD TO MENU</button>
          </div>

          {(restaurant.menuItems || []).length > 0 && (
            <div className="card">
              <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 14 }}>CURRENT MENU</div>
              <table>
                <thead><tr><th>ITEM</th><th>PRICE</th><th>COGS</th><th>MARGIN</th><th></th></tr></thead>
                <tbody>
                  {restaurant.menuItems.map(item => {
                    const cogs = getCOGS(item, restaurant.inventory || []);
                    const margin = item.price > 0 ? ((item.price - cogs) / item.price * 100).toFixed(0) : 0;
                    return (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td style={{ color: G.red }}>${cogs.toFixed(2)}</td>
                        <td><span className={`badge ${parseFloat(margin) >= 60 ? "bg" : "by"}`}>{margin}%</span></td>
                        <td><button className="btn-danger" onClick={() => deleteMenuItem(item.id)}>✕</button></td>
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
