import { useState, useEffect } from "react";

function uid() { return Math.random().toString(36).slice(2, 9); }

function getCOGS(item, inventory) {
  return (item.ingredients || []).reduce((s, ing) => {
    const inv = inventory.find(i => i.id === ing.id);
    return s + (inv ? inv.cost * ing.qty : 0);
  }, 0);
}

// ─── Data Persistence ─────────────────────────────────────────────────────────
const STORAGE_KEY = "profitplate_data_v1";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed || {};
  } catch {
    return {};
  }
}

function saveData(restaurants) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
  } catch (e) {
    console.warn("Could not save data:", e);
  }
}



const G = {
  bg: "#080810", card: "#10101c", border: "#1c1c2e",
  accent: "#ff6b2b", accentHover: "#ff8c4f",
  green: "#4ade80", red: "#f87171", yellow: "#facc15",
  text: "#e8e0d0", muted: "#55556a",
  font: "'DM Mono', monospace", display: "'Bebas Neue', sans-serif",
};

const DEMO_INVENTORY = [
  { id: "i1", name: "Burger Patty", unit: "each", qty: 48, threshold: 10, cost: 1.20 },
  { id: "i2", name: "Brioche Bun", unit: "each", qty: 50, threshold: 10, cost: 0.40 },
  { id: "i3", name: "Cheddar Slice", unit: "each", qty: 80, threshold: 15, cost: 0.25 },
  { id: "i4", name: "Lettuce", unit: "oz", qty: 32, threshold: 8, cost: 0.10 },
  { id: "i5", name: "Tomato Slice", unit: "each", qty: 60, threshold: 10, cost: 0.15 },
  { id: "i6", name: "Frozen Fries", unit: "oz", qty: 96, threshold: 24, cost: 0.08 },
  { id: "i7", name: "Chicken Breast", unit: "each", qty: 24, threshold: 8, cost: 1.80 },
  { id: "i8", name: "Soda Cup", unit: "each", qty: 100, threshold: 20, cost: 0.30 },
  { id: "i9", name: "Bacon Strip", unit: "each", qty: 8, threshold: 10, cost: 0.45 },
  { id: "i10", name: "Sauce Pack", unit: "each", qty: 90, threshold: 20, cost: 0.10 },
];

const DEMO_MENU = [
  { id: "m1", name: "Classic Burger", price: 9.99, ingredients: [{ id: "i1", qty: 1 }, { id: "i2", qty: 1 }, { id: "i3", qty: 1 }, { id: "i4", qty: 1 }, { id: "i5", qty: 2 }, { id: "i10", qty: 1 }] },
  { id: "m2", name: "Bacon Burger", price: 12.99, ingredients: [{ id: "i1", qty: 1 }, { id: "i2", qty: 1 }, { id: "i3", qty: 1 }, { id: "i9", qty: 2 }, { id: "i4", qty: 1 }, { id: "i5", qty: 2 }, { id: "i10", qty: 1 }] },
  { id: "m3", name: "Chicken Sandwich", price: 10.99, ingredients: [{ id: "i7", qty: 1 }, { id: "i2", qty: 1 }, { id: "i3", qty: 1 }, { id: "i4", qty: 1 }, { id: "i10", qty: 1 }] },
  { id: "m4", name: "Fries", price: 3.99, ingredients: [{ id: "i6", qty: 6 }] },
  { id: "m5", name: "Soda", price: 2.49, ingredients: [{ id: "i8", qty: 1 }] },
  { id: "m6", name: "Burger Combo", price: 14.99, ingredients: [{ id: "i1", qty: 1 }, { id: "i2", qty: 1 }, { id: "i3", qty: 1 }, { id: "i4", qty: 1 }, { id: "i5", qty: 2 }, { id: "i6", qty: 6 }, { id: "i8", qty: 1 }, { id: "i10", qty: 1 }] },
];

const DEMO_SALES = [
  { id: "s1", item: "Burger Combo", price: 14.99, cost: 3.05, profit: 11.94, time: "09:14 AM" },
  { id: "s2", item: "Chicken Sandwich", price: 10.99, cost: 2.65, profit: 8.34, time: "09:31 AM" },
  { id: "s3", item: "Classic Burger", price: 9.99, cost: 2.20, profit: 7.79, time: "10:02 AM" },
  { id: "s4", item: "Fries", price: 3.99, cost: 0.48, profit: 3.51, time: "10:02 AM" },
  { id: "s5", item: "Bacon Burger", price: 12.99, cost: 3.10, profit: 9.89, time: "10:45 AM" },
  { id: "s6", item: "Burger Combo", price: 14.99, cost: 3.05, profit: 11.94, time: "11:20 AM" },
  { id: "s7", item: "Soda", price: 2.49, cost: 0.30, profit: 2.19, time: "11:22 AM" },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${G.bg};}
  ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:${G.accent};border-radius:2px;}
  input,select,textarea{background:#0a0a14;border:1px solid ${G.border};color:${G.text};padding:9px 12px;font-family:${G.font};font-size:12px;border-radius:5px;outline:none;width:100%;}
  input:focus,select:focus{border-color:${G.accent};}
  button{cursor:pointer;font-family:${G.font};}
  .btn{background:${G.accent};border:none;color:#080810;padding:10px 22px;font-size:12px;font-weight:500;border-radius:5px;letter-spacing:.5px;transition:background .15s;}
  .btn:hover{background:${G.accentHover};}
  .btn-ghost{background:none;border:1px solid ${G.border};color:${G.muted};padding:9px 18px;font-size:12px;border-radius:5px;transition:all .15s;}
  .btn-ghost:hover{border-color:${G.accent};color:${G.text};}
  .btn-danger{background:#7f1d1d;border:none;color:${G.red};padding:7px 13px;font-size:11px;border-radius:5px;}
  .btn-sm{background:${G.accent};border:none;color:#080810;padding:6px 14px;font-size:11px;border-radius:4px;}
  .card{background:${G.card};border:1px solid ${G.border};border-radius:8px;padding:20px;}
  .badge{display:inline-block;padding:2px 8px;border-radius:3px;font-size:10px;letter-spacing:1px;}
  .bg{background:#052e16;border:1px solid #166534;color:${G.green};}
  .br{background:#7f1d1d;border:1px solid #991b1b;color:${G.red};}
  .by{background:#422006;border:1px solid #854d0e;color:${G.yellow};}
  .bo{background:#431407;border:1px solid #9a3412;color:#fb923c;}
  table{width:100%;border-collapse:collapse;font-size:12px;}
  th{text-align:left;padding:8px 12px;color:${G.muted};letter-spacing:1px;font-size:10px;border-bottom:1px solid ${G.border};font-weight:400;}
  td{padding:10px 12px;border-bottom:1px solid #0d0d1a;}
  tr:last-child td{border-bottom:none;}
  tr:hover td{background:#0c0c18;}
  .tab{background:none;border:1px solid ${G.border};color:${G.muted};padding:9px 14px;font-size:11px;letter-spacing:1px;border-radius:4px;transition:all .15s;}
  .tab:hover{border-color:${G.accent}44;color:${G.text};}
  .tab.on{background:${G.accent};border-color:${G.accent};color:#080810;font-weight:500;}
  .pin-btn{background:#12121e;border:1px solid ${G.border};color:${G.text};width:68px;height:68px;font-size:22px;border-radius:8px;font-family:${G.display};letter-spacing:1px;transition:all .1s;}
  .pin-btn:hover{background:#1a1a2e;border-color:${G.accent}66;}
  .pin-btn:active{background:${G.accent}22;border-color:${G.accent};}
  @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
  .fade{animation:fadeIn .3s ease;}
  .slide{animation:slideDown .3s ease;}
  .toast{position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:6px;font-size:12px;letter-spacing:.5px;z-index:9999;animation:fadeIn .3s ease;}
  .ts{background:#14532d;border:1px solid ${G.green};color:${G.green};}
  .te{background:#7f1d1d;border:1px solid ${G.red};color:${G.red};}
  .modal-bg{position:fixed;inset:0;background:#000000cc;z-index:999;display:flex;align-items:center;justify-content:center;padding:20px;}
  .modal{background:${G.card};border:1px solid ${G.border};border-radius:10px;padding:28px;width:100%;max-width:540px;max-height:85vh;overflow-y:auto;}
  .step-dot{width:8px;height:8px;border-radius:50%;background:${G.border};}
  .step-dot.done{background:${G.accent};}
  .prog-bar{background:${G.border};border-radius:2px;height:4px;overflow:hidden;}
  .prog-fill{height:4px;border-radius:2px;transition:width .3s;}
`;

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [restaurants, setRestaurants] = useState(() => loadData());
  const [screen, setScreen] = useState("landing");
  const [activeId, setActiveId] = useState(null);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }

  function updateRestaurant(id, updater) {
    setRestaurants(prev => {
      const updated = typeof updater === "function" ? updater(prev[id]) : { ...prev[id], ...updater };
      const next = { ...prev, [id]: updated };
      saveData(next);
      return next;
    });
  }

  const rList = Object.values(restaurants);
  const restaurant = activeId ? restaurants[activeId] : null;

  // LANDING
  if (screen === "landing") return (
    <div style={{ fontFamily: G.font, background: G.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: G.text }}>
      <style>{css}</style>
      <div style={{ textAlign: "center", maxWidth: 460 }} className="fade">
        <div style={{ fontSize: 60, marginBottom: 16 }}>🍔</div>
        <div style={{ fontFamily: G.display, fontSize: 54, letterSpacing: 4, color: "#fff", lineHeight: 1 }}>PROFITPLATE</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: G.muted, marginTop: 6, marginBottom: 40 }}>RESTAURANT INTELLIGENCE PLATFORM</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn" style={{ fontSize: 13, padding: "13px 32px" }} onClick={() => setScreen("setup")}>+ NEW RESTAURANT</button>
          {rList.length > 0 && <button className="btn-ghost" style={{ fontSize: 13, padding: "13px 32px" }} onClick={() => setScreen("select")}>OPEN EXISTING</button>}
        </div>
        {rList.length > 0 && <div style={{ marginTop: 20, fontSize: 11, color: G.muted }}>{rList.length} restaurant{rList.length !== 1 ? "s" : ""} registered</div>}
      </div>
      {toast && <div className={`toast ${toast.type === "success" ? "ts" : "te"}`}>{toast.msg}</div>}
    </div>
  );

  // SELECT
  if (screen === "select") return (
    <div style={{ fontFamily: G.font, background: G.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: G.text }}>
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: 420 }} className="fade">
        <div style={{ fontFamily: G.display, fontSize: 32, letterSpacing: 3, color: "#fff", marginBottom: 24, textAlign: "center" }}>SELECT LOCATION</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rList.map(r => (
            <button key={r.id} className="btn-ghost" style={{ padding: "16px 20px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              onClick={() => { setActiveId(r.id); setScreen("pin"); }}>
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

  // SETUP
  if (screen === "setup") return (
    <SetupWizard
      onComplete={data => {
        const id = uid();
        setRestaurants(prev => {
          const next = { ...prev, [id]: { ...data, id } };
          saveData(next);
          return next;
        });
        setActiveId(id);
        setScreen("app");
        showToast("Welcome to ProfitPlate!");
      }}
      onBack={() => setScreen("landing")}
    />
  );

  // PIN
  if (screen === "pin" && restaurant) return (
    <PinScreen restaurant={restaurant} onSuccess={() => setScreen("app")} onBack={() => setScreen("select")} />
  );

  // APP
  if (screen === "app" && restaurant) return (
    <MainApp
      restaurant={restaurant}
      update={u => updateRestaurant(activeId, u)}
      onLogout={() => setScreen("select")}
      showToast={showToast}
    />
  );

  return <div style={{ fontFamily: G.font, background: G.bg, minHeight: "100vh", color: G.text, display: "flex", alignItems: "center", justifyContent: "center" }}><style>{css}</style>Loading...</div>;
}

// ─── SETUP WIZARD ────────────────────────────────────────────────────────────
function SetupWizard({ onComplete, onBack }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: "", logo: "", taxRate: "8.5", pin: "", confirmPin: "", inventory: [], menuItems: [], sales: [] });
  const [invItem, setInvItem] = useState({ name: "", unit: "each", qty: "", threshold: "", cost: "", mode: "single", packSize: "", packCost: "", packCount: "", bulkTotal: "", bulkCost: "", bulkServing: "" });
  const [menuItem, setMenuItem] = useState({ name: "", price: "", ingredients: [] });
  const [menuIng, setMenuIng] = useState({ id: "", qty: "" });
  const [toast, setToast] = useState(null);
  const steps = ["Info", "PIN", "Inventory", "Menu", "Review"];

  function t(msg, type = "success") { setToast({ msg, type }); setTimeout(() => setToast(null), 2200); }

  function addInv() {
    const name = (invItem.name || "").trim();
    if (!name) return t("Enter ingredient name", "error");
    let qty = 0, cost = 0;
    if (invItem.mode === "pack") {
      if (!invItem.packSize || !invItem.packCost || !invItem.packCount) return t("Fill all pack fields", "error");
      qty = parseFloat(invItem.packSize) * parseFloat(invItem.packCount);
      cost = parseFloat(invItem.packCost) / parseFloat(invItem.packSize);
    } else if (invItem.mode === "bulk") {
      if (!invItem.bulkTotal || !invItem.bulkCost || !invItem.bulkServing) return t("Fill all bulk fields", "error");
      qty = parseFloat(invItem.bulkTotal);
      cost = parseFloat(invItem.bulkCost) / parseFloat(invItem.bulkTotal) * parseFloat(invItem.bulkServing);
    } else {
      if (!invItem.qty || !invItem.cost) return t("Fill qty and cost", "error");
      qty = parseFloat(invItem.qty);
      cost = parseFloat(invItem.cost);
    }
    const newItem = { id: uid(), name, unit: invItem.unit, qty: parseFloat(qty.toFixed(2)), threshold: parseFloat(invItem.threshold) || 5, cost: parseFloat(cost.toFixed(4)) };
    setData(d => ({ ...d, inventory: [...d.inventory, newItem] }));
    setInvItem({ name: "", unit: "each", qty: "", threshold: "", cost: "", mode: "single", packSize: "", packCost: "", packCount: "", bulkTotal: "", bulkCost: "", bulkServing: "" });
    t(name + " added!");
  }

  function addMenuIng() {
    if (!menuIng.id || !menuIng.qty) return;
    setMenuItem(m => ({ ...m, ingredients: [...m.ingredients.filter(i => i.id !== menuIng.id), { id: menuIng.id, qty: parseFloat(menuIng.qty) }] }));
    setMenuIng({ id: "", qty: "" });
  }

  function addMenuItem() {
    if (!menuItem.name || !menuItem.price) return t("Name and price required", "error");
    if (!menuItem.ingredients.length) return t("Add at least one ingredient", "error");
    setData(d => ({ ...d, menuItems: [...d.menuItems, { ...menuItem, id: uid(), price: parseFloat(menuItem.price) }] }));
    setMenuItem({ name: "", price: "", ingredients: [] });
    t("Menu item added!");
  }

  function next() {
    if (step === 0 && !data.name.trim()) return t("Enter restaurant name", "error");
    if (step === 1) {
      if (data.pin.length < 4) return t("PIN must be 4+ digits", "error");
      if (data.pin !== data.confirmPin) return t("PINs don't match", "error");
    }
    if (step === steps.length - 1) return onComplete({ ...data, setupDone: true });
    setStep(s => s + 1);
  }

  return (
    <div style={{ fontFamily: G.font, background: G.bg, minHeight: "100vh", color: G.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: 560 }} className="fade">
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 28, alignItems: "center" }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div className={`step-dot${i <= step ? " done" : ""}`} style={{ width: i === step ? 28 : 8, borderRadius: i === step ? 4 : "50%", transition: "all .3s" }} />
              {i < steps.length - 1 && <div style={{ width: 20, height: 1, background: i < step ? G.accent : G.border }} />}
            </div>
          ))}
        </div>
        <div style={{ fontFamily: G.display, fontSize: 32, letterSpacing: 3, color: "#fff", marginBottom: 4 }}>{steps[step].toUpperCase()}</div>
        <div style={{ fontSize: 11, color: G.muted, marginBottom: 24, letterSpacing: 1 }}>STEP {step + 1} OF {steps.length}</div>

        {step === 0 && (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>RESTAURANT NAME *</div><input placeholder="e.g. Smoky's Burger Bar" value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} /></div>
            <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>TAX RATE (%)</div><input type="number" value={data.taxRate} onChange={e => setData(d => ({ ...d, taxRate: e.target.value }))} /></div>
            <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>LOGO URL (optional)</div><input placeholder="https://..." value={data.logo} onChange={e => setData(d => ({ ...d, logo: e.target.value }))} /></div>
          </div>
        )}

        {step === 1 && (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 12, color: G.muted, lineHeight: 1.7 }}>This PIN protects access to your dashboard. Keep it secure.</div>
            <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>CREATE PIN (4–6 digits)</div><input type="password" inputMode="numeric" maxLength={6} value={data.pin} onChange={e => setData(d => ({ ...d, pin: e.target.value.replace(/\D/g, "") }))} placeholder="••••" /></div>
            <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>CONFIRM PIN</div><input type="password" inputMode="numeric" maxLength={6} value={data.confirmPin} onChange={e => setData(d => ({ ...d, confirmPin: e.target.value.replace(/\D/g, "") }))} placeholder="••••" /></div>
          </div>
        )}

        {step === 2 && <InventoryForm invItem={invItem} setInvItem={setInvItem} onAdd={addInv} inventory={data.inventory} onDelete={id => setData(d => ({ ...d, inventory: d.inventory.filter(i => i.id !== id) }))} />}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card">
              <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 14 }}>ADD MENU ITEM</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <input placeholder="Item name" value={menuItem.name} onChange={e => setMenuItem(m => ({ ...m, name: e.target.value }))} />
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
                    return <span key={ing.id} style={{ background: G.accent + "18", border: `1px solid ${G.accent}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, color: G.accent }}>{inv?.name} ×{ing.qty}</span>;
                  })}
                </div>
              )}
              <button className="btn" onClick={addMenuItem}>+ ADD MENU ITEM</button>
            </div>
            {data.menuItems.length > 0 && (
              <div className="card">
                {data.menuItems.map(item => {
                  const cogs = getCOGS(item, data.inventory);
                  const margin = item.price > 0 ? ((item.price - cogs) / item.price * 100).toFixed(0) : 0;
                  return (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${G.border}`, fontSize: 12 }}>
                      <span>{item.name}</span>
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
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              {data.logo && <img src={data.logo} alt="" style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover" }} onError={e => e.target.style.display = "none"} />}
              <div>
                <div style={{ fontFamily: G.display, fontSize: 28, letterSpacing: 2, color: "#fff" }}>{data.name}</div>
                <div style={{ fontSize: 11, color: G.muted }}>Tax: {data.taxRate}% · PIN: {"•".repeat(data.pin.length)}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "#0a0a14", border: `1px solid ${G.border}`, borderRadius: 6, padding: 14 }}>
                <div style={{ fontSize: 10, color: G.muted, letterSpacing: 1, marginBottom: 4 }}>INGREDIENTS</div>
                <div style={{ fontFamily: G.display, fontSize: 32, color: G.accent }}>{data.inventory.length}</div>
              </div>
              <div style={{ background: "#0a0a14", border: `1px solid ${G.border}`, borderRadius: 6, padding: 14 }}>
                <div style={{ fontSize: 10, color: G.muted, letterSpacing: 1, marginBottom: 4 }}>MENU ITEMS</div>
                <div style={{ fontFamily: G.display, fontSize: 32, color: G.green }}>{data.menuItems.length}</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          <button className="btn-ghost" onClick={() => step === 0 ? onBack() : setStep(s => s - 1)}>← BACK</button>
          <button className="btn" onClick={next}>{step === steps.length - 1 ? "LAUNCH APP →" : "NEXT →"}</button>
        </div>
      </div>
      {toast && <div className={`toast ${toast.type === "success" ? "ts" : "te"}`}>{toast.msg}</div>}
    </div>
  );
}

// ─── INVENTORY FORM COMPONENT (3 modes) ──────────────────────────────────────
function InventoryForm({ invItem, setInvItem, onAdd, inventory, onDelete }) {
  const mode = invItem.mode || "single";
  const packCostPer = invItem.packSize && invItem.packCost ? (parseFloat(invItem.packCost) / parseFloat(invItem.packSize)).toFixed(4) : null;
  const packTotalQty = invItem.packSize && invItem.packCount ? parseFloat(invItem.packSize) * parseFloat(invItem.packCount) : null;
  const bulkCostPer = invItem.bulkTotal && invItem.bulkCost && invItem.bulkServing ? (parseFloat(invItem.bulkCost) / parseFloat(invItem.bulkTotal) * parseFloat(invItem.bulkServing)).toFixed(4) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card">
        <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 14 }}>ADD INGREDIENT</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 10, marginBottom: 12 }}>
          <input placeholder="Ingredient name" value={invItem.name} onChange={e => setInvItem(i => ({ ...i, name: e.target.value }))} />
          <select value={invItem.unit} onChange={e => setInvItem(i => ({ ...i, unit: e.target.value }))}>
            {["each", "oz", "lb", "g", "ml", "cup", "slice", "gallon"].map(u => <option key={u}>{u}</option>)}
          </select>
        </div>

        {/* Mode selector */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { key: "single", label: "SINGLE UNIT", sub: "patties, eggs, slices" },
            { key: "pack", label: "PACKS / CASES", sub: "buns, cans, bottles" },
            { key: "bulk", label: "BULK / WEIGHT", sub: "fries, oil, flour" },
          ].map(m => (
            <button key={m.key} onClick={() => setInvItem(i => ({ ...i, mode: m.key }))}
              style={{ background: mode === m.key ? G.accent + "22" : "#0a0a14", border: `1px solid ${mode === m.key ? G.accent : G.border}`, borderRadius: 6, padding: "10px 8px", textAlign: "center", cursor: "pointer" }}>
              <div style={{ fontSize: 10, letterSpacing: 1, color: mode === m.key ? G.accent : G.muted, fontFamily: G.font }}>{m.label}</div>
              <div style={{ fontSize: 9, color: G.muted, marginTop: 3 }}>{m.sub}</div>
            </button>
          ))}
        </div>

        {/* Single unit fields */}
        {mode === "single" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            <input type="number" placeholder="Qty on hand" value={invItem.qty} onChange={e => setInvItem(i => ({ ...i, qty: e.target.value }))} />
            <input type="number" placeholder="Reorder at" value={invItem.threshold} onChange={e => setInvItem(i => ({ ...i, threshold: e.target.value }))} />
            <input type="number" placeholder="Cost per unit $" value={invItem.cost} onChange={e => setInvItem(i => ({ ...i, cost: e.target.value }))} />
          </div>
        )}

        {/* Pack fields */}
        {mode === "pack" && (
          <div style={{ background: "#0a0a14", border: `1px solid ${G.accent}33`, borderRadius: 6, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: G.accent, letterSpacing: 2, marginBottom: 10 }}>PACK DETAILS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: G.muted, marginBottom: 4 }}>HOW MANY IN ONE PACK?</div>
                <input type="number" placeholder="e.g. 8 buns" value={invItem.packSize || ""} onChange={e => setInvItem(i => ({ ...i, packSize: e.target.value }))} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: G.muted, marginBottom: 4 }}>PRICE PER PACK ($)</div>
                <input type="number" placeholder="e.g. 2.99" value={invItem.packCost || ""} onChange={e => setInvItem(i => ({ ...i, packCost: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: G.muted, marginBottom: 4 }}>HOW MANY PACKS DO YOU HAVE NOW?</div>
              <input type="number" placeholder="e.g. 3 packs" value={invItem.packCount || ""} onChange={e => setInvItem(i => ({ ...i, packCount: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: G.muted, marginBottom: 4 }}>REORDER WHEN BELOW (units)</div>
              <input type="number" placeholder="e.g. 16" value={invItem.threshold} onChange={e => setInvItem(i => ({ ...i, threshold: e.target.value }))} />
            </div>
            {packCostPer && packTotalQty && (
              <div style={{ background: G.green + "11", border: `1px solid ${G.green}33`, borderRadius: 5, padding: "8px 12px", fontSize: 11, color: G.green }}>
                ✓ Cost per unit = <strong>${packCostPer}</strong> &nbsp;·&nbsp; {packTotalQty} total units in stock
              </div>
            )}
          </div>
        )}

        {/* Bulk fields */}
        {mode === "bulk" && (
          <div style={{ background: "#0a0a14", border: `1px solid ${G.yellow}33`, borderRadius: 6, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: G.yellow, letterSpacing: 2, marginBottom: 10 }}>BULK / WEIGHT DETAILS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: G.muted, marginBottom: 4 }}>TOTAL AMOUNT PURCHASED (units/oz/lb)</div>
                <input type="number" placeholder="e.g. 80 oz" value={invItem.bulkTotal || ""} onChange={e => setInvItem(i => ({ ...i, bulkTotal: e.target.value }))} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: G.muted, marginBottom: 4 }}>PRICE PAID ($)</div>
                <input type="number" placeholder="e.g. 6.99" value={invItem.bulkCost || ""} onChange={e => setInvItem(i => ({ ...i, bulkCost: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: G.muted, marginBottom: 4 }}>HOW MUCH PER SERVING?</div>
                <input type="number" placeholder="e.g. 6 oz per order" value={invItem.bulkServing || ""} onChange={e => setInvItem(i => ({ ...i, bulkServing: e.target.value }))} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: G.muted, marginBottom: 4 }}>REORDER WHEN BELOW</div>
                <input type="number" placeholder="e.g. 24 oz" value={invItem.threshold} onChange={e => setInvItem(i => ({ ...i, threshold: e.target.value }))} />
              </div>
            </div>
            {bulkCostPer && (
              <div style={{ background: G.yellow + "11", border: `1px solid ${G.yellow}33`, borderRadius: 5, padding: "8px 12px", fontSize: 11, color: G.yellow }}>
                ✓ Cost per serving = <strong>${bulkCostPer}</strong> &nbsp;·&nbsp; {invItem.bulkTotal} {invItem.unit} on hand
              </div>
            )}
          </div>
        )}

        <button className="btn" onClick={onAdd}>+ ADD INGREDIENT</button>
      </div>

      {inventory && inventory.length > 0 && (
        <div className="card">
          <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 12 }}>ADDED ({inventory.length})</div>
          {inventory.map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${G.border}`, fontSize: 12 }}>
              <span style={{ color: G.text }}>{item.name} <span style={{ color: G.muted }}>({item.unit})</span></span>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ color: G.muted }}>qty: {item.qty} · ${item.cost}/unit</span>
                {onDelete && <button className="btn-danger" onClick={() => onDelete(item.id)}>✕</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PIN SCREEN ───────────────────────────────────────────────────────────────
function PinScreen({ restaurant, onSuccess, onBack }) {
  const [entered, setEntered] = useState("");
  const [shake, setShake] = useState(false);

  function press(d) {
    if (entered.length >= 6) return;
    const next = entered + d;
    setEntered(next);
    if (next.length >= restaurant.pin.length) {
      if (next === restaurant.pin) { onSuccess(); }
      else { setShake(true); setTimeout(() => { setShake(false); setEntered(""); }, 600); }
    }
  }

  return (
    <div style={{ fontFamily: G.font, background: G.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: G.text }}>
      <style>{css}</style>
      <div style={{ textAlign: "center" }} className="fade">
        <div style={{ fontFamily: G.display, fontSize: 36, letterSpacing: 3, color: "#fff", marginBottom: 4 }}>{restaurant.name}</div>
        <div style={{ fontSize: 11, color: G.muted, letterSpacing: 2, marginBottom: 40 }}>ENTER PIN TO CONTINUE</div>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 36, animation: shake ? "shake .4s ease" : "none" }}>
          {Array.from({ length: restaurant.pin.length }).map((_, i) => (
            <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${i < entered.length ? G.accent : G.border}`, background: i < entered.length ? G.accent : "transparent", transition: "all .15s" }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 68px)", gap: 10, justifyContent: "center" }}>
          {[1,2,3,4,5,6,7,8,9].map(n => <button key={n} className="pin-btn" onClick={() => press(String(n))}>{n}</button>)}
          <div />
          <button className="pin-btn" onClick={() => press("0")}>0</button>
          <button className="pin-btn" onClick={() => setEntered(e => e.slice(0, -1))} style={{ fontSize: 16, color: G.muted }}>⌫</button>
        </div>
        <button className="btn-ghost" style={{ marginTop: 28, fontSize: 11 }} onClick={onBack}>← BACK</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function MainApp({ restaurant, update, onLogout, showToast }) {
  const [tab, setTab] = useState("dashboard");
  const [order, setOrder] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [toast, setToast] = useState(null);
  const [briefing, setBriefing] = useState(true);

  function t(msg, type = "success") { setToast({ msg, type }); setTimeout(() => setToast(null), 2600); }

  const sales = restaurant.sales || DEMO_SALES;
  const inventory = restaurant.inventory || DEMO_INVENTORY;
  const menuItems = restaurant.menuItems || DEMO_MENU;
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
    if (!order.length) return t("Add items first", "error");
    let newInv = [...inventory];
    for (const oi of order) {
      const mi = menuItems.find(m => m.id === oi.id);
      for (const ing of (mi.ingredients || [])) {
        const inv = newInv.find(i => i.id === ing.id);
        if (!inv || inv.qty < ing.qty * oi.qty) return t(`Low stock: ${inv?.name || "ingredient"}`, "error");
      }
    }
    const subtotal = order.reduce((s, o) => s + o.price * o.qty, 0);
    const tax = subtotal * taxRate / 100;
    const total = subtotal + tax;
    let totalCost = 0;
    let newSales = [...sales];
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
    { id: "dashboard", label: "Dashboard", icon: "◈" },
    { id: "pos", label: "Ring Up", icon: "⊕" },
    { id: "inventory", label: "Inventory", icon: "⊟" },
    { id: "margins", label: "Margins", icon: "%" },
    { id: "deals", label: "Deals", icon: "★" },
    { id: "pricing", label: "Pricing AI", icon: "🧠" },
    { id: "waste", label: "Waste Monitor", icon: "🔍" },
    { id: "paycheck", label: "Paycheck", icon: "$" },
    { id: "settings", label: "Settings", icon: "⚙" },
  ];

  // ── AI: Daily Briefing data ──
  const bestMarginItem = [...menuItems].sort((a, b) => {
    const ma = (a.price - getCOGS(a, inventory)) / a.price;
    const mb = (b.price - getCOGS(b, inventory)) / b.price;
    return mb - ma;
  })[0];
  const forecastLow = (totalRevenue * 0.85).toFixed(2);
  const forecastHigh = (totalRevenue * 1.25).toFixed(2);
  const forecastMid = (totalRevenue * 1.05).toFixed(2);

  return (
    <div style={{ fontFamily: G.font, background: G.bg, minHeight: "100vh", color: G.text }}>
      <style>{css}</style>

      {/* Daily Briefing Modal */}
      {briefing && (
        <div className="modal-bg" onClick={() => setBriefing(false)}>
          <div className="modal slide" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: G.display, fontSize: 28, letterSpacing: 2, color: "#fff" }}>GOOD MORNING ☀️</div>
                <div style={{ fontSize: 11, color: G.muted, letterSpacing: 1 }}>YOUR DAILY BRIEFING</div>
              </div>
              <button className="btn-ghost" style={{ fontSize: 11, padding: "6px 12px" }} onClick={() => setBriefing(false)}>DISMISS</button>
            </div>
            {[
              { icon: "📊", label: "YESTERDAY'S PERFORMANCE", val: `Revenue $${totalRevenue.toFixed(2)} · Profit $${totalProfit.toFixed(2)} · ${sales.length} sales · ${((totalProfit / Math.max(totalRevenue, 1)) * 100).toFixed(1)}% margin` },
              { icon: "🔮", label: "TODAY'S FORECAST", val: `Expected $${forecastMid} · Low $${forecastLow} · High $${forecastHigh} based on recent trends` },
              { icon: "📦", label: "LOW STOCK ITEMS", val: lowStock.length > 0 ? lowStock.map(i => `${i.name} (${i.qty} left)`).join(", ") : "All items well stocked ✓" },
              { icon: "🏆", label: "PUSH THIS TODAY", val: bestMarginItem ? `${bestMarginItem.name} — highest margin at ${((bestMarginItem.price - getCOGS(bestMarginItem, inventory)) / bestMarginItem.price * 100).toFixed(0)}%` : "Check margins tab" },
              { icon: "✅", label: "ONE ACTION TO TAKE", val: lowStock.length > 0 ? `Reorder ${lowStock[0].name} — currently at ${lowStock[0].qty} units, below your ${lowStock[0].threshold} threshold` : "Review Deal Engine for combo opportunities to boost revenue today" },
            ].map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < 4 ? `1px solid ${G.border}` : "none" }}>
                <div style={{ fontSize: 20, width: 28, flexShrink: 0 }}>{b.icon}</div>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: G.accent, marginBottom: 4 }}>{b.label}</div>
                  <div style={{ fontSize: 12, color: G.text, lineHeight: 1.6 }}>{b.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${G.border}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {restaurant.logo
            ? <img src={restaurant.logo} alt="" style={{ width: 34, height: 34, borderRadius: 6, objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
            : <div style={{ background: G.accent, width: 34, height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🍔</div>}
          <div>
            <div style={{ fontFamily: G.display, fontSize: 20, letterSpacing: 2, color: "#fff" }}>{restaurant.name}</div>
            <div style={{ fontSize: 10, color: G.muted, letterSpacing: 1 }}>PROFITPLATE · TAX {restaurant.taxRate}%</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {lowStock.length > 0 && <span className="badge br">⚠ {lowStock.length} LOW</span>}
          <button style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }} onClick={() => setBriefing(true)} title="Daily Briefing">🔔</button>
          <button className="btn-ghost" style={{ fontSize: 10, padding: "6px 12px" }} onClick={onLogout}>LOCK</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "10px 20px", borderBottom: `1px solid ${G.border}`, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {tabs.map(t2 => <button key={t2.id} className={`tab${tab === t2.id ? " on" : ""}`} onClick={() => setTab(t2.id)}>{t2.icon} {t2.label}</button>)}
      </div>

      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div className="fade">
            <div style={{ fontFamily: G.display, fontSize: 30, letterSpacing: 3, marginBottom: 20, color: "#fff" }}>TODAY'S OVERVIEW</div>

            {/* Forecast card */}
            <div className="card" style={{ marginBottom: 16, borderColor: G.accent + "44" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: G.accent, marginBottom: 4 }}>🔮 REVENUE FORECAST</div>
                  <div style={{ fontFamily: G.display, fontSize: 28, color: "#fff" }}>${forecastMid}</div>
                  <div style={{ fontSize: 11, color: G.muted }}>expected today based on trends</div>
                </div>
                <div style={{ textAlign: "right", fontSize: 11, color: G.muted }}>
                  <div>Low: <span style={{ color: G.red }}>${forecastLow}</span></div>
                  <div style={{ marginTop: 4 }}>High: <span style={{ color: G.green }}>${forecastHigh}</span></div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4, height: 8 }}>
                <div style={{ flex: 1, background: G.red + "88", borderRadius: "4px 0 0 4px" }} />
                <div style={{ flex: 2, background: G.yellow + "88" }} />
                <div style={{ flex: 1, background: G.green + "88", borderRadius: "0 4px 4px 0" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: G.muted, marginTop: 4 }}>
                <span>LOW ${forecastLow}</span><span>EXPECTED ${forecastMid}</span><span>HIGH ${forecastHigh}</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14, marginBottom: 20 }}>
              {[
                { label: "REVENUE", val: `$${totalRevenue.toFixed(2)}`, sub: `${sales.length} sales`, color: G.green },
                { label: "FOOD COST", val: `$${totalCOGS.toFixed(2)}`, sub: "ingredients used", color: G.red },
                { label: "NET PROFIT", val: `$${totalProfit.toFixed(2)}`, sub: totalRevenue > 0 ? `${((totalProfit / totalRevenue) * 100).toFixed(1)}% margin` : "—", color: G.accent },
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
                {sales.slice(-6).reverse().map(s => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid #0f0f1c`, fontSize: 12 }}>
                    <div><div>{s.item}</div><div style={{ color: G.muted, fontSize: 10 }}>{s.time}</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ color: G.green }}>+${s.profit.toFixed(2)}</div><div style={{ color: G.muted, fontSize: 10 }}>${s.price.toFixed(2)}</div></div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 14 }}>INVENTORY HEALTH</div>
                {inventory.slice(0, 8).map(item => {
                  const pct = Math.min((item.qty / Math.max(item.threshold * 4, 1)) * 100, 100);
                  const color = item.qty <= item.threshold ? G.red : item.qty <= item.threshold * 2 ? G.yellow : G.green;
                  return (
                    <div key={item.id} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                        <span style={{ color: "#aaa" }}>{item.name}</span>
                        <span style={{ color }}>{item.qty}</span>
                      </div>
                      <div className="prog-bar"><div className="prog-fill" style={{ width: `${pct}%`, background: color }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── POS ── */}
        {tab === "pos" && (
          <div className="fade">
            <div style={{ fontFamily: G.display, fontSize: 30, letterSpacing: 3, marginBottom: 20, color: "#fff" }}>RING UP A SALE</div>
            {receipt ? (
              <div style={{ maxWidth: 420, margin: "0 auto" }}>
                <div className="card" style={{ borderColor: G.green + "55", textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <div style={{ fontFamily: G.display, fontSize: 28, letterSpacing: 2, color: G.green, marginBottom: 4 }}>SALE LOGGED</div>
                  <div style={{ fontSize: 11, color: G.muted, marginBottom: 24, letterSpacing: 1 }}>MARK AS RECEIVED FROM CUSTOMER</div>
                  <div style={{ background: "#0a0a14", border: `1px solid ${G.border}`, borderRadius: 6, padding: 16, textAlign: "left", marginBottom: 16 }}>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 12 }}>ORDER SUMMARY — {receipt.time}</div>
                    {receipt.items.map(o => (
                      <div key={o.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: `1px solid ${G.border}` }}>
                        <span>{o.name} <span style={{ color: G.muted }}>×{o.qty}</span></span>
                        <span>${(o.price * o.qty).toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: G.muted }}><span>Subtotal</span><span>${receipt.subtotal.toFixed(2)}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: G.muted }}><span>Tax ({taxRate}%)</span><span>${receipt.tax.toFixed(2)}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, paddingTop: 8, borderTop: `1px solid ${G.border}`, marginTop: 4 }}>
                        <span style={{ color: "#fff" }}>TOTAL DUE</span>
                        <span style={{ fontFamily: G.display, fontSize: 22, color: "#fff" }}>${receipt.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ background: G.accent + "11", border: `1px solid ${G.accent}33`, borderRadius: 6, padding: 12, marginBottom: 12, fontSize: 11, color: G.accent }}>
                    💳 Collect <strong>${receipt.total.toFixed(2)}</strong> from customer via cash, card, or existing payment method.
                  </div>
                  <div style={{ background: G.green + "11", border: `1px solid ${G.green}33`, borderRadius: 6, padding: 12, marginBottom: 20, fontSize: 11, color: G.green }}>
                    📈 Your profit on this order: <strong>${receipt.profit.toFixed(2)}</strong> · Inventory updated
                  </div>
                  <button className="btn" style={{ width: "100%", padding: 13 }} onClick={() => setReceipt(null)}>+ NEW ORDER</button>
                </div>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="card" style={{ color: G.muted }}>No menu items. Add them in Settings.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {menuItems.map(item => {
                    const cogs = getCOGS(item, inventory);
                    const margin = item.price > 0 ? ((item.price - cogs) / item.price * 100).toFixed(0) : 0;
                    const inOrder = order.find(o => o.id === item.id);
                    return (
                      <button key={item.id} onClick={() => addToOrder(item)}
                        style={{ background: G.card, border: `1px solid ${inOrder ? G.accent : G.border}`, color: G.text, padding: "14px 16px", borderRadius: 7, textAlign: "left", cursor: "pointer", transition: "all .15s" }}>
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
                        <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid #0f0f1c`, fontSize: 12 }}>
                          <div><div>{o.name}</div><div style={{ color: G.muted, fontSize: 10 }}>×{o.qty} @ ${o.price.toFixed(2)}</div></div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ color: G.green }}>${(o.price * o.qty).toFixed(2)}</span>
                            <button onClick={() => setOrder(prev => prev.filter(x => x.id !== o.id))} style={{ background: "none", border: "none", color: G.red, fontSize: 14 }}>✕</button>
                          </div>
                        </div>
                      ))}
                      <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${G.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: G.muted }}>Subtotal</span><span>${order.reduce((s, o) => s + o.price * o.qty, 0).toFixed(2)}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: G.muted, marginBottom: 4 }}><span>Tax ({taxRate}%)</span><span>${(order.reduce((s, o) => s + o.price * o.qty, 0) * taxRate / 100).toFixed(2)}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 14, paddingTop: 8, borderTop: `1px solid ${G.border}` }}><span>Total</span><span style={{ color: "#fff" }}>${(order.reduce((s, o) => s + o.price * o.qty, 0) * (1 + taxRate / 100)).toFixed(2)}</span></div>
                        <button className="btn" style={{ width: "100%" }} onClick={submitOrder}>MARK AS SOLD →</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── INVENTORY ── */}
        {tab === "inventory" && (
          <div className="fade">
            <div style={{ fontFamily: G.display, fontSize: 30, letterSpacing: 3, marginBottom: 20, color: "#fff" }}>INVENTORY</div>

            {/* Reorder Intelligence */}
            <div className="card" style={{ marginBottom: 16, borderColor: G.accent + "44" }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: G.accent, marginBottom: 14 }}>📦 REORDER INTELLIGENCE</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
                {inventory.map(item => {
                  const salesUsingItem = sales.filter(s => {
                    const mi = menuItems.find(m => m.name === s.item);
                    return mi && (mi.ingredients || []).some(ing => ing.id === item.id);
                  });
                  const avgPerDay = salesUsingItem.length > 0 ? salesUsingItem.reduce((sum, s) => {
                    const mi = menuItems.find(m => m.name === s.item);
                    const ing = mi && (mi.ingredients || []).find(i => i.id === item.id);
                    return sum + (ing ? ing.qty : 0);
                  }, 0) / Math.max(1, salesUsingItem.length) * salesUsingItem.length : 0;
                  const daysLeft = avgPerDay > 0 ? Math.floor(item.qty / avgPerDay) : 99;
                  const reorderQty = Math.ceil(avgPerDay * 7);
                  const color = daysLeft <= 2 ? G.red : daysLeft <= 5 ? G.yellow : G.green;
                  return (
                    <div key={item.id} style={{ background: "#0a0a14", border: `1px solid ${color}33`, borderRadius: 6, padding: 12 }}>
                      <div style={{ fontSize: 11, color: G.text, marginBottom: 4 }}>{item.name}</div>
                      <div style={{ fontFamily: G.display, fontSize: 22, color }}>{daysLeft >= 99 ? "∞" : daysLeft} days</div>
                      <div style={{ fontSize: 10, color: G.muted, marginTop: 2 }}>{item.qty} units · reorder {reorderQty}/wk</div>
                    </div>
                  );
                })}
              </div>
            </div>

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
          </div>
        )}

        {/* ── MARGINS ── */}
        {tab === "margins" && (
          <div className="fade">
            <div style={{ fontFamily: G.display, fontSize: 30, letterSpacing: 3, marginBottom: 20, color: "#fff" }}>PROFIT MARGINS</div>
            {[...menuItems].sort((a, b) => {
              const ma = (a.price - getCOGS(a, inventory)) / Math.max(a.price, 0.01);
              const mb = (b.price - getCOGS(b, inventory)) / Math.max(b.price, 0.01);
              return mb - ma;
            }).map(item => {
              const cogs = getCOGS(item, inventory);
              const profit = item.price - cogs;
              const margin = item.price > 0 ? (profit / item.price * 100).toFixed(1) : 0;
              return (
                <div key={item.id} className="card" style={{ marginBottom: 10, display: "grid", gridTemplateColumns: "1fr 80px 80px 80px 110px", alignItems: "center", gap: 14 }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 6 }}>{item.name}</div>
                    <div className="prog-bar"><div className="prog-fill" style={{ width: `${Math.min(parseFloat(margin), 100)}%`, background: parseFloat(margin) >= 65 ? G.green : parseFloat(margin) >= 45 ? G.yellow : G.red }} /></div>
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

        {/* ── DEALS ── */}
        {tab === "deals" && (
          <div className="fade">
            <div style={{ fontFamily: G.display, fontSize: 30, letterSpacing: 3, marginBottom: 8, color: "#fff" }}>DEAL ENGINE</div>
            <div style={{ fontSize: 12, color: G.muted, marginBottom: 24 }}>Auto-generated combos to push revenue and move stock</div>
            {menuItems.length < 2 ? <div className="card" style={{ color: G.muted }}>Add at least 2 menu items to generate combos.</div> : (
              (() => {
                const combos = [];
                for (let i = 0; i < menuItems.length; i++) {
                  for (let j = i + 1; j < menuItems.length; j++) {
                    const items = [menuItems[i], menuItems[j]];
                    const tc = items.reduce((s, x) => s + getCOGS(x, inventory), 0);
                    const fp = items.reduce((s, x) => s + x.price, 0);
                    const sp = parseFloat((fp * 0.92).toFixed(2));
                    const margin = ((sp - tc) / sp * 100).toFixed(1);
                    combos.push({ items, tc, fp, sp, margin });
                  }
                }
                return combos.sort((a, b) => parseFloat(b.margin) - parseFloat(a.margin)).slice(0, 6).map((c, i) => (
                  <div key={i} className="card" style={{ marginBottom: 12, borderColor: G.accent + "33" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontFamily: G.display, fontSize: 18, color: G.accent, letterSpacing: 1, marginBottom: 8 }}>{c.items.map(x => x.name).join(" + ")}</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {c.items.map(x => <span key={x.id} style={{ background: G.accent + "18", border: `1px solid ${G.accent}33`, borderRadius: 20, padding: "2px 10px", fontSize: 11, color: G.accent }}>{x.name} ${x.price.toFixed(2)}</span>)}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: G.display, fontSize: 32, color: G.green }}>${c.sp.toFixed(2)}</div>
                        <div style={{ fontSize: 10, color: G.muted }}>saves ${(c.fp - c.sp).toFixed(2)}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 12, display: "flex", gap: 16, fontSize: 11, color: G.muted }}>
                      <span>COGS: <span style={{ color: G.red }}>${c.tc.toFixed(2)}</span></span>
                      <span>Profit: <span style={{ color: G.green }}>${(c.sp - c.tc).toFixed(2)}</span></span>
                      <span className={`badge ${parseFloat(c.margin) >= 60 ? "bg" : "by"}`}>{c.margin}%</span>
                    </div>
                  </div>
                ));
              })()
            )}
            {inventory.filter(i => i.qty > i.threshold * 3).length > 0 && (
              <>
                <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, margin: "24px 0 12px" }}>MOVE OVERSTOCKED ITEMS</div>
                {inventory.filter(i => i.qty > i.threshold * 3).map(item => (
                  <div key={item.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, borderColor: G.yellow + "33" }}>
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

        {/* ── PRICING AI ── */}
        {tab === "pricing" && (
          <div className="fade">
            <div style={{ fontFamily: G.display, fontSize: 30, letterSpacing: 3, marginBottom: 8, color: "#fff" }}>🧠 SMART PRICING ENGINE</div>
            <div style={{ fontSize: 12, color: G.muted, marginBottom: 24 }}>AI analysis of your margins — recommendations to maximize profit without losing customers</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {menuItems.map(item => {
                const cogs = getCOGS(item, inventory);
                const margin = item.price > 0 ? (item.price - cogs) / item.price * 100 : 0;
                let rec, recPrice, recReason, recColor, confidence;
                if (margin < 45) {
                  recPrice = parseFloat((cogs / 0.55).toFixed(2));
                  rec = "RAISE PRICE";
                  recReason = `Margin too low at ${margin.toFixed(0)}%. Raising to $${recPrice.toFixed(2)} hits 55% margin.`;
                  recColor = G.red;
                  confidence = "HIGH";
                } else if (margin > 80) {
                  recPrice = parseFloat((cogs / 0.70).toFixed(2));
                  rec = "CONSIDER LOWERING";
                  recReason = `${margin.toFixed(0)}% margin may be pricing out customers. $${recPrice.toFixed(2)} stays profitable at 70%.`;
                  recColor = G.yellow;
                  confidence = "MEDIUM";
                } else {
                  recPrice = item.price;
                  rec = "PRICE IS GOOD";
                  recReason = `${margin.toFixed(0)}% margin is healthy. No change needed.`;
                  recColor = G.green;
                  confidence = "HIGH";
                }
                const marginGain = ((recPrice - cogs) / recPrice * 100 - margin).toFixed(1);
                return (
                  <div key={item.id} className="card" style={{ borderLeft: `3px solid ${recColor}` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "start" }}>
                      <div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
                          <span className={`badge ${rec === "RAISE PRICE" ? "br" : rec === "CONSIDER LOWERING" ? "by" : "bg"}`}>{rec}</span>
                          <span className="badge bo">CONFIDENCE: {confidence}</span>
                        </div>
                        <div style={{ fontSize: 11, color: G.muted, lineHeight: 1.7 }}>{recReason}</div>
                        <div style={{ display: "flex", gap: 20, marginTop: 10, fontSize: 11 }}>
                          <span style={{ color: G.muted }}>Current: <span style={{ color: G.text }}>${item.price.toFixed(2)}</span></span>
                          <span style={{ color: G.muted }}>Suggested: <span style={{ color: recColor }}>${recPrice.toFixed(2)}</span></span>
                          <span style={{ color: G.muted }}>COGS: <span style={{ color: G.text }}>${cogs.toFixed(2)}</span></span>
                          {rec !== "PRICE IS GOOD" && <span style={{ color: G.muted }}>Margin shift: <span style={{ color: parseFloat(marginGain) > 0 ? G.green : G.red }}>{parseFloat(marginGain) > 0 ? "+" : ""}{marginGain}%</span></span>}
                        </div>
                      </div>
                      {rec !== "PRICE IS GOOD" && (
                        <button className="btn-sm" onClick={() => {
                          update(r => ({ ...r, menuItems: (r.menuItems || DEMO_MENU).map(m => m.id === item.id ? { ...m, price: recPrice } : m) }));
                          t(`${item.name} price updated to $${recPrice.toFixed(2)}`);
                        }}>APPLY ${recPrice.toFixed(2)}</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── WASTE MONITOR ── */}
        {tab === "waste" && (
          <div className="fade">
            <div style={{ fontFamily: G.display, fontSize: 30, letterSpacing: 3, marginBottom: 8, color: "#fff" }}>🔍 WASTE & LOSS MONITOR</div>
            <div style={{ fontSize: 12, color: G.muted, marginBottom: 24 }}>Compares expected vs actual stock. Flags discrepancies that could mean theft, over-portioning, or spoilage.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {inventory.map(item => {
                let expectedUsed = 0;
                sales.forEach(s => {
                  const mi = menuItems.find(m => m.name === s.item);
                  if (mi) {
                    const ing = (mi.ingredients || []).find(i => i.id === item.id);
                    if (ing) expectedUsed += ing.qty;
                  }
                });
                const startQty = item.qty + expectedUsed;
                const actualUsed = startQty - item.qty;
                const discrepancy = actualUsed - expectedUsed;
                const discrepancyVal = Math.abs(discrepancy * item.cost);
                const hasIssue = discrepancy > 1;
                const issueType = discrepancy > 5 ? "POSSIBLE THEFT" : discrepancy > 2 ? "OVER-PORTIONING" : "MINOR VARIANCE";
                const issueColor = discrepancy > 5 ? G.red : discrepancy > 2 ? G.yellow : G.muted;

                return (
                  <div key={item.id} className="card" style={{ borderLeft: hasIssue ? `3px solid ${issueColor}` : `3px solid ${G.border}` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 16 }}>
                      <div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                          <div style={{ fontWeight: 500 }}>{item.name}</div>
                          {hasIssue && <span className={`badge ${discrepancy > 5 ? "br" : "by"}`}>{issueType}</span>}
                          {!hasIssue && <span className="badge bg">✓ ON TRACK</span>}
                        </div>
                        <div style={{ display: "flex", gap: 20, fontSize: 11, color: G.muted }}>
                          <span>Expected used: <span style={{ color: G.text }}>{expectedUsed.toFixed(1)} {item.unit}</span></span>
                          <span>Actual used: <span style={{ color: G.text }}>{actualUsed.toFixed(1)} {item.unit}</span></span>
                          {hasIssue && <span>Discrepancy: <span style={{ color: issueColor }}>{discrepancy.toFixed(1)} units (${discrepancyVal.toFixed(2)} loss)</span></span>}
                        </div>
                      </div>
                      {hasIssue && (
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: G.display, fontSize: 24, color: issueColor }}>−${discrepancyVal.toFixed(2)}</div>
                          <div style={{ fontSize: 10, color: G.muted }}>estimated loss</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 20, padding: 14, background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, fontSize: 11, color: G.muted }}>
              Total estimated discrepancy loss today: <span style={{ color: G.red, fontFamily: G.display, fontSize: 18 }}>
                ${inventory.reduce((total, item) => {
                  let expectedUsed = 0;
                  sales.forEach(s => {
                    const mi = menuItems.find(m => m.name === s.item);
                    if (mi) { const ing = (mi.ingredients || []).find(i => i.id === item.id); if (ing) expectedUsed += ing.qty; }
                  });
                  const actualUsed = (item.qty + expectedUsed) - item.qty;
                  const discrepancy = actualUsed - expectedUsed;
                  return total + (discrepancy > 0 ? discrepancy * item.cost : 0);
                }, 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* ── PAYCHECK ── */}
        {tab === "paycheck" && (
          <div className="fade">
            <div style={{ fontFamily: G.display, fontSize: 30, letterSpacing: 3, marginBottom: 8, color: "#fff" }}>PAYCHECK VIEW</div>
            <div style={{ fontSize: 12, color: G.muted, marginBottom: 24 }}>What you actually pocketed after food costs</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div className="card" style={{ borderTop: `2px solid ${G.text}` }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 8 }}>GROSS REVENUE</div>
                <div style={{ fontFamily: G.display, fontSize: 42 }}>${totalRevenue.toFixed(2)}</div>
                <div style={{ fontSize: 11, color: G.muted }}>{sales.length} transactions</div>
              </div>
              <div className="card" style={{ borderTop: `2px solid ${G.red}` }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 8 }}>FOOD COST</div>
                <div style={{ fontFamily: G.display, fontSize: 42, color: G.red }}>− ${totalCOGS.toFixed(2)}</div>
              </div>
            </div>
            <div className="card" style={{ borderColor: G.accent + "55", marginBottom: 20 }}>
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

        {/* ── SETTINGS ── */}
        {tab === "settings" && <SettingsPanel restaurant={restaurant} update={update} showToast={t} inventory={inventory} menuItems={menuItems} />}

      </div>
      {toast && <div className={`toast ${toast.type === "success" ? "ts" : "te"}`}>{toast.msg}</div>}
    </div>
  );
}


// ─── RESTOCK ROW COMPONENT ────────────────────────────────────────────────────
function RestockRow({ item, onSave }) {
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({ qty: item.qty, name: item.name, cost: item.cost, threshold: item.threshold });
  const [addQty, setAddQty] = useState("");

  function handleRestock() {
    const add = parseFloat(addQty);
    if (!addQty || isNaN(add) || add <= 0) return;
    const newQty = parseFloat((item.qty + add).toFixed(2));
    onSave({ qty: newQty });
    setAddQty("");
  }

  function handleSaveEdit() {
    onSave({ name: fields.name, cost: parseFloat(fields.cost) || item.cost, threshold: parseFloat(fields.threshold) || item.threshold, qty: parseFloat(fields.qty) || item.qty });
    setEditing(false);
  }

  const status = item.qty <= item.threshold ? "CRITICAL" : item.qty <= item.threshold * 2 ? "LOW" : "OK";
  const statusColor = status === "CRITICAL" ? G.red : status === "LOW" ? G.yellow : G.green;

  return (
    <div style={{ background: "#0a0a14", border: `1px solid ${G.border}`, borderRadius: 6, padding: 14 }}>
      {!editing ? (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ fontSize: 13, color: G.text, fontWeight: 500 }}>{item.name}</div>
              <span style={{ fontSize: 10, color: G.muted }}>{item.unit}</span>
              <span className={"badge " + (status === "CRITICAL" ? "br" : status === "LOW" ? "by" : "bg")}>{status}</span>
            </div>
            <button className="btn-ghost" style={{ fontSize: 10, padding: "5px 10px" }} onClick={() => { setFields({ qty: item.qty, name: item.name, cost: item.cost, threshold: item.threshold }); setEditing(true); }}>EDIT</button>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 11, color: G.muted, marginBottom: 12 }}>
            <span>In stock: <span style={{ color: statusColor, fontFamily: G.display, fontSize: 16 }}>{item.qty}</span></span>
            <span>Reorder at: <span style={{ color: G.text }}>{item.threshold}</span></span>
            <span>Cost/unit: <span style={{ color: G.text }}>${item.cost}</span></span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="number" placeholder="Add qty (e.g. +24 when you restock)" value={addQty} onChange={e => setAddQty(e.target.value)}
              style={{ maxWidth: 260 }} />
            <button className="btn" style={{ whiteSpace: "nowrap", padding: "9px 16px" }} onClick={handleRestock}>+ ADD STOCK</button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2, color: G.accent, marginBottom: 12 }}>EDITING: {item.name}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><div style={{ fontSize: 10, color: G.muted, marginBottom: 4 }}>NAME</div>
              <input value={fields.name} onChange={e => setFields(f => ({ ...f, name: e.target.value }))} /></div>
            <div><div style={{ fontSize: 10, color: G.muted, marginBottom: 4 }}>CURRENT QTY</div>
              <input type="number" value={fields.qty} onChange={e => setFields(f => ({ ...f, qty: e.target.value }))} /></div>
            <div><div style={{ fontSize: 10, color: G.muted, marginBottom: 4 }}>COST PER UNIT ($)</div>
              <input type="number" value={fields.cost} onChange={e => setFields(f => ({ ...f, cost: e.target.value }))} /></div>
            <div><div style={{ fontSize: 10, color: G.muted, marginBottom: 4 }}>REORDER THRESHOLD</div>
              <input type="number" value={fields.threshold} onChange={e => setFields(f => ({ ...f, threshold: e.target.value }))} /></div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={handleSaveEdit}>SAVE CHANGES</button>
            <button className="btn-ghost" onClick={() => setEditing(false)}>CANCEL</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS PANEL ───────────────────────────────────────────────────────────
function SettingsPanel({ restaurant, update, showToast, inventory, menuItems }) {
  const [section, setSection] = useState("restaurant");
  const [form, setForm] = useState({ name: restaurant.name, logo: restaurant.logo || "", taxRate: String(restaurant.taxRate), pin: "", confirmPin: "" });
  const [invItem, setInvItem] = useState({ name: "", unit: "each", qty: "", threshold: "", cost: "", mode: "single", packSize: "", packCost: "", packCount: "", bulkTotal: "", bulkCost: "", bulkServing: "" });
  const [menuItem, setMenuItem] = useState({ name: "", price: "", ingredients: [] });
  const [menuIng, setMenuIng] = useState({ id: "", qty: "" });

  function saveRestaurant() {
    if (!form.name.trim()) return showToast("Name required", "error");
    update(r => ({ ...r, name: form.name.trim(), logo: form.logo, taxRate: parseFloat(form.taxRate) || 0 }));
    showToast("Saved!");
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
    if (!name) return showToast("Enter ingredient name", "error");
    let qty = 0, cost = 0;
    if (invItem.mode === "pack") {
      if (!invItem.packSize || !invItem.packCost || !invItem.packCount) return showToast("Fill all pack fields", "error");
      qty = parseFloat(invItem.packSize) * parseFloat(invItem.packCount);
      cost = parseFloat(invItem.packCost) / parseFloat(invItem.packSize);
    } else if (invItem.mode === "bulk") {
      if (!invItem.bulkTotal || !invItem.bulkCost || !invItem.bulkServing) return showToast("Fill all bulk fields", "error");
      qty = parseFloat(invItem.bulkTotal);
      cost = parseFloat(invItem.bulkCost) / parseFloat(invItem.bulkTotal) * parseFloat(invItem.bulkServing);
    } else {
      if (!invItem.qty || !invItem.cost) return showToast("Fill qty and cost", "error");
      qty = parseFloat(invItem.qty);
      cost = parseFloat(invItem.cost);
    }
    const newItem = { id: uid(), name, unit: invItem.unit, qty: parseFloat(qty.toFixed(2)), threshold: parseFloat(invItem.threshold) || 5, cost: parseFloat(cost.toFixed(4)) };
    update(r => ({ ...r, inventory: [...(r.inventory || inventory), newItem] }));
    setInvItem({ name: "", unit: "each", qty: "", threshold: "", cost: "", mode: "single", packSize: "", packCost: "", packCount: "", bulkTotal: "", bulkCost: "", bulkServing: "" });
    showToast(name + " added!");
  }

  function addMenuIng() {
    if (!menuIng.id || !menuIng.qty) return;
    setMenuItem(m => ({ ...m, ingredients: [...m.ingredients.filter(i => i.id !== menuIng.id), { id: menuIng.id, qty: parseFloat(menuIng.qty) }] }));
    setMenuIng({ id: "", qty: "" });
  }

  function addMenuItem() {
    if (!menuItem.name || !menuItem.price) return showToast("Name and price required", "error");
    if (!menuItem.ingredients.length) return showToast("Add at least one ingredient", "error");
    update(r => ({ ...r, menuItems: [...(r.menuItems || menuItems), { ...menuItem, id: uid(), price: parseFloat(menuItem.price) }] }));
    setMenuItem({ name: "", price: "", ingredients: [] });
    showToast("Menu item added!");
  }

  return (
    <div className="fade">
      <div style={{ fontFamily: G.display, fontSize: 30, letterSpacing: 3, marginBottom: 20, color: "#fff" }}>SETTINGS</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {["restaurant", "pin", "inventory", "menu"].map(s => <button key={s} className={`tab${section === s ? " on" : ""}`} onClick={() => setSection(s)}>{s.toUpperCase()}</button>)}
      </div>

      {section === "restaurant" && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 500 }}>
          <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>RESTAURANT NAME</div><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>LOGO URL</div><input value={form.logo} onChange={e => setForm(f => ({ ...f, logo: e.target.value }))} placeholder="https://..." /></div>
          <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>TAX RATE (%)</div><input type="number" value={form.taxRate} onChange={e => setForm(f => ({ ...f, taxRate: e.target.value }))} /></div>
          <button className="btn" onClick={saveRestaurant}>SAVE CHANGES</button>
        </div>
      )}

      {section === "pin" && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 400 }}>
          <div style={{ fontSize: 12, color: G.muted }}>Change the PIN used to access this restaurant.</div>
          <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>NEW PIN</div><input type="password" inputMode="numeric" maxLength={6} value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, "") }))} placeholder="••••" /></div>
          <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>CONFIRM PIN</div><input type="password" inputMode="numeric" maxLength={6} value={form.confirmPin} onChange={e => setForm(f => ({ ...f, confirmPin: e.target.value.replace(/\D/g, "") }))} placeholder="••••" /></div>
          <button className="btn" onClick={savePin}>UPDATE PIN</button>
        </div>
      )}

      {section === "inventory" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <InventoryForm invItem={invItem} setInvItem={setInvItem} onAdd={addInv} inventory={inventory} onDelete={id => update(r => ({ ...r, inventory: (r.inventory || inventory).filter(i => i.id !== id) }))} />
          {inventory.length > 0 && (
            <div className="card">
              <div style={{ fontSize: 10, letterSpacing: 2, color: G.accent, marginBottom: 4 }}>RESTOCK AND EDIT</div>
              <div style={{ fontSize: 11, color: G.muted, marginBottom: 16 }}>Update qty when you restock, or edit name, cost, and reorder threshold anytime.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {inventory.map(item => (
                  <RestockRow key={item.id} item={item} onSave={(updated) => {
                    update(r => ({ ...r, inventory: (r.inventory || inventory).map(i => i.id === item.id ? { ...i, ...updated } : i) }));
                    showToast(item.name + " updated!");
                  }} />
                ))}
              </div>
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
            <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 8 }}>LINK INGREDIENTS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", gap: 8, marginBottom: 10 }}>
              <select value={menuIng.id} onChange={e => setMenuIng(i => ({ ...i, id: e.target.value }))}>
                <option value="">Select ingredient</option>
                {inventory.map(inv => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
              </select>
              <input type="number" placeholder="Qty" value={menuIng.qty} onChange={e => setMenuIng(i => ({ ...i, qty: e.target.value }))} />
              <button className="btn-ghost" onClick={addMenuIng} style={{ fontSize: 11 }}>+ ADD</button>
            </div>
            {menuItem.ingredients.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {menuItem.ingredients.map(ing => {
                  const inv = inventory.find(i => i.id === ing.id);
                  return <span key={ing.id} style={{ background: G.accent + "18", border: `1px solid ${G.accent}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, color: G.accent }}>{inv?.name} ×{ing.qty}</span>;
                })}
              </div>
            )}
            <button className="btn" onClick={addMenuItem}>+ ADD TO MENU</button>
          </div>
          {menuItems.length > 0 && (
            <div className="card">
              <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 14 }}>CURRENT MENU ({menuItems.length} items)</div>
              <table>
                <thead><tr><th>ITEM</th><th>PRICE</th><th>COGS</th><th>MARGIN</th><th></th></tr></thead>
                <tbody>
                  {menuItems.map(item => {
                    const cogs = getCOGS(item, inventory);
                    const margin = item.price > 0 ? ((item.price - cogs) / item.price * 100).toFixed(0) : 0;
                    return (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td style={{ color: G.red }}>${cogs.toFixed(2)}</td>
                        <td><span className={`badge ${parseFloat(margin) >= 60 ? "bg" : "by"}`}>{margin}%</span></td>
                        <td><button className="btn-danger" onClick={() => update(r => ({ ...r, menuItems: (r.menuItems || menuItems).filter(m => m.id !== item.id) }))}>✕</button></td>
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
