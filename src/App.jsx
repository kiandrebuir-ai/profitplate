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



const DARK = {
  bg: "#080810", card: "#10101c", border: "#1c1c2e",
  accent: "#ff6b2b", accentHover: "#ff8c4f",
  green: "#4ade80", red: "#f87171", yellow: "#facc15",
  text: "#e8e0d0", muted: "#55556a",
  font: "'DM Mono', monospace", display: "'Bebas Neue', sans-serif",
};
const LIGHT = {
  bg: "#f4f4f0", card: "#ffffff", border: "#e2e2e8",
  accent: "#ff6b2b", accentHover: "#ff8c4f",
  green: "#16a34a", red: "#dc2626", yellow: "#d97706",
  text: "#1a1a2e", muted: "#888899",
  font: "'DM Mono', monospace", display: "'Bebas Neue', sans-serif",
};
let G = DARK;

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
  const [theme, setTheme] = useState(() => localStorage.getItem("pp_theme") || "dark");
  G = theme === "dark" ? DARK : LIGHT;
  const [screen, setScreen] = useState("landing");
  const [activeId, setActiveId] = useState(null);
  const [activeRole, setActiveRole] = useState("owner");
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
    <PinScreen restaurant={restaurant} onSuccess={(role) => { setActiveRole(role); setScreen("app"); }} onBack={() => setScreen("select")} />
  );

  // APP
  if (screen === "app" && restaurant) return (
    <MainApp
      restaurant={restaurant}
      role={activeRole}
      update={u => updateRestaurant(activeId, u)}
      onLogout={() => { setScreen("select"); setActiveRole("owner"); }}
      showToast={showToast}
      theme={theme}
      toggleTheme={() => { const t = theme === "dark" ? "light" : "dark"; setTheme(t); localStorage.setItem("pp_theme", t); }}
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
      if (!data.secretQuestion || !data.secretAnswer) return t("Set a recovery question", "error");
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
            <div style={{ fontSize: 12, color: G.muted, lineHeight: 1.7 }}>Owner PIN protects full access. Staff PIN gives cashier-only access (ring up sales only).</div>
            <div style={{ background: G.accent+"11", border: `1px solid ${G.accent}33`, borderRadius: 6, padding: 12, fontSize: 11, color: G.accent }}>OWNER PIN (full access)</div>
            <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>CREATE OWNER PIN (4–6 digits)</div><input type="password" inputMode="numeric" maxLength={6} value={data.pin} onChange={e => setData(d => ({ ...d, pin: e.target.value.replace(/\D/g, "") }))} placeholder="••••" /></div>
            <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>CONFIRM OWNER PIN</div><input type="password" inputMode="numeric" maxLength={6} value={data.confirmPin} onChange={e => setData(d => ({ ...d, confirmPin: e.target.value.replace(/\D/g, "") }))} placeholder="••••" /></div>
            <div style={{ background: G.border, height: 1 }} />
            <div style={{ background: "#0a0a14", border: `1px solid ${G.border}`, borderRadius: 6, padding: 12, fontSize: 11, color: G.muted }}>STAFF PIN (cashier only — optional)</div>
            <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>STAFF PIN (4–6 digits)</div><input type="password" inputMode="numeric" maxLength={6} value={data.staffPin||""} onChange={e => setData(d => ({ ...d, staffPin: e.target.value.replace(/\D/g, "") }))} placeholder="••••  (optional)" /></div>
            <div style={{ background: G.border, height: 1 }} />
            <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted }}>PIN RECOVERY</div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>SECRET QUESTION</div>
              <select value={data.secretQuestion||""} onChange={e => setData(d => ({ ...d, secretQuestion: e.target.value }))}>
                <option value="">Select a question</option>
                <option>What was the name of your first pet?</option>
                <option>What street did you grow up on?</option>
                <option>What is your mother's maiden name?</option>
                <option>What was the name of your first school?</option>
                <option>What city were you born in?</option>
              </select>
            </div>
            <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>YOUR ANSWER</div><input placeholder="Answer (case sensitive)" value={data.secretAnswer||""} onChange={e => setData(d => ({ ...d, secretAnswer: e.target.value }))} /></div>
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
    {/* Edit Menu Item Modal */}
    {editingItem && (
      <div className="modal-bg" onClick={() => setEditingItem(null)}>
        <div className="modal slide" onClick={e => e.stopPropagation()}>
          <div style={{ fontFamily: G.display, fontSize: 24, letterSpacing: 2, color: "#fff", marginBottom: 20 }}>EDIT MENU ITEM</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div><div style={{ fontSize: 10, color: G.muted, marginBottom: 4 }}>ITEM NAME</div>
              <input value={editingItem.name} onChange={e => setEditingItem(m => ({ ...m, name: e.target.value }))} /></div>
            <div><div style={{ fontSize: 10, color: G.muted, marginBottom: 4 }}>SELL PRICE ($)</div>
              <input type="number" value={editingItem.price} onChange={e => setEditingItem(m => ({ ...m, price: e.target.value }))} /></div>
            <div style={{ fontSize: 10, color: G.muted, marginBottom: 8 }}>LINKED INGREDIENTS</div>
            {(editingItem.ingredients || []).map(ing => {
              const inv = inventory.find(i => i.id === ing.id);
              return (
                <div key={ing.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "6px 10px", background: "#0a0a14", borderRadius: 5 }}>
                  <span style={{ color: G.accent }}>{inv?.name || ing.id}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="number" value={ing.qty} style={{ width: 60, padding: "4px 8px" }}
                      onChange={e => setEditingItem(m => ({ ...m, ingredients: m.ingredients.map(i => i.id === ing.id ? { ...i, qty: parseFloat(e.target.value) || 1 } : i) }))} />
                    <button className="btn-danger" style={{ padding: "4px 8px" }} onClick={() => setEditingItem(m => ({ ...m, ingredients: m.ingredients.filter(i => i.id !== ing.id) }))}>✕</button>
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button className="btn" onClick={() => {
                update(r => ({ ...r, menuItems: (r.menuItems || menuItems).map(m => m.id === editingItem.id ? { ...editingItem, price: parseFloat(editingItem.price) || 0 } : m) }));
                showToast(editingItem.name + " updated!");
                setEditingItem(null);
              }}>SAVE CHANGES</button>
              <button className="btn-ghost" onClick={() => setEditingItem(null)}>CANCEL</button>
            </div>
          </div>
        </div>
      </div>
    )}
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
  const [mode, setMode] = useState("pin"); // pin | recovery
  const [recoveryAnswer, setRecoveryAnswer] = useState("");
  const [recoveryError, setRecoveryError] = useState("");

  function press(d) {
    if (entered.length >= 6) return;
    const next = entered + d;
    setEntered(next);
    const minLen = Math.min(restaurant.pin.length, restaurant.staffPin ? Math.min(restaurant.pin.length, restaurant.staffPin.length) : restaurant.pin.length);
    if (next.length >= restaurant.pin.length || (restaurant.staffPin && next.length >= restaurant.staffPin.length)) {
      if (next === restaurant.pin) { onSuccess("owner"); }
      else if (restaurant.staffPin && next === restaurant.staffPin) { onSuccess("staff"); }
      else if (next.length >= restaurant.pin.length) {
        setShake(true); setTimeout(() => { setShake(false); setEntered(""); }, 600);
      }
    }
  }

  function submitRecovery() {
    if (recoveryAnswer.trim() === (restaurant.secretAnswer || "").trim()) {
      onSuccess("owner");
    } else {
      setRecoveryError("Incorrect answer. Try again.");
    }
  }

  if (mode === "recovery") return (
    <div style={{ fontFamily: G.font, background: G.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: G.text }}>
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: 400, padding: 24 }} className="fade">
        <div style={{ fontFamily: G.display, fontSize: 28, letterSpacing: 3, color: "#fff", marginBottom: 4 }}>PIN RECOVERY</div>
        <div style={{ fontSize: 11, color: G.muted, marginBottom: 28 }}>{restaurant.name}</div>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 12, color: G.muted }}>{restaurant.secretQuestion || "What was the name of your first pet?"}</div>
          <input placeholder="Your answer" value={recoveryAnswer} onChange={e => setRecoveryAnswer(e.target.value)} />
          {recoveryError && <div style={{ fontSize: 11, color: G.red }}>{recoveryError}</div>}
          <button className="btn" onClick={submitRecovery}>VERIFY ANSWER</button>
          <button className="btn-ghost" onClick={() => setMode("pin")} style={{ fontSize: 11 }}>← BACK TO PIN</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: G.font, background: G.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: G.text }}>
      <style>{css}</style>
      <div style={{ textAlign: "center" }} className="fade">
        {restaurant.logo && <img src={restaurant.logo} alt="" style={{ width: 80, height: 80, borderRadius: 16, objectFit: "cover", marginBottom: 16, border: `2px solid ${G.accent}` }} onError={e => e.target.style.display="none"} />}
        {!restaurant.logo && <div style={{ width: 80, height: 80, borderRadius: 16, background: G.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 16 }}>🍔</div>}
        <div style={{ fontFamily: G.display, fontSize: 36, letterSpacing: 3, color: "#fff", marginBottom: 4 }}>{restaurant.name}</div>
        <div style={{ fontSize: 11, color: G.muted, letterSpacing: 2, marginBottom: 12 }}>ENTER PIN TO CONTINUE</div>
        {restaurant.staffPin && <div style={{ fontSize: 10, color: G.muted, marginBottom: 28 }}>Owner PIN = full access · Staff PIN = cashier only</div>}
        {!restaurant.staffPin && <div style={{ marginBottom: 28 }} />}
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
        <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="btn-ghost" style={{ fontSize: 11 }} onClick={onBack}>← BACK</button>
          {restaurant.secretQuestion && <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => setMode("recovery")}>FORGOT PIN?</button>}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function MainApp({ restaurant, role, update, onLogout, showToast, theme, toggleTheme }) {
  const isOwner = role === "owner";
  const [tab, setTab] = useState("dashboard");
  const [order, setOrder] = useState([]);
  const [orderNote, setOrderNote] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [toast, setToast] = useState(null);
  const [briefing, setBriefing] = useState(true);
  const [tutorial, setTutorial] = useState(() => {
    const inv = restaurant.inventory || [];
    const menu = restaurant.menuItems || [];
    return inv.length === 0 && menu.length === 0;
  });

  function t(msg, type = "success") { setToast({ msg, type }); setTimeout(() => setToast(null), 2600); }

  const sales = restaurant.sales || [];
  const inventory = restaurant.inventory || [];
  const menuItems = restaurant.menuItems || [];
  const taxRate = parseFloat(restaurant.taxRate) || 0;

  const totalRevenue = sales.reduce((s, x) => s + x.price, 0);
  const totalCOGS = sales.reduce((s, x) => s + x.cost, 0);
  const totalProfit = totalRevenue - totalCOGS;
  const lowStock = inventory.filter(i => i.qty <= i.threshold);

  const [modifierModal, setModifierModal] = useState(null); // {item, modifiers:[]}

  function addToOrder(item) {
    setModifierModal({ item, modifiers: [] });
  }

  function confirmAddToOrder(item, modifiers) {
    setOrder(prev => {
      const key = item.id + (modifiers.length ? "_" + modifiers.join("_") : "");
      const ex = prev.find(o => o._key === key);
      const entry = { ...item, qty: 1, _key: key, modifiers };
      return ex ? prev.map(o => o._key === key ? { ...o, qty: o.qty + 1 } : o) : [...prev, entry];
    });
    setModifierModal(null);
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
        newSales.push({ id: uid(), item: mi.name, price: mi.price, cost: parseFloat(cogs.toFixed(2)), profit: parseFloat((mi.price - cogs).toFixed(2)), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), date: new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }), dow: new Date().toLocaleDateString([], { weekday: "short" }) });
      }
    }
    update(r => ({ ...r, inventory: newInv, sales: newSales }));
    setReceipt({ items: [...order], subtotal, tax, total, profit: subtotal - totalCost, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), note: orderNote });
    setOrder([]);
    setOrderNote("");
  }

  function voidLastSale() {
    if (!sales.length) return t("No sales to void", "error");
    const last = sales[sales.length - 1];
    const mi = menuItems.find(m => m.name === last.item);
    let newInv = [...inventory];
    if (mi) {
      for (const ing of (mi.ingredients || [])) {
        newInv = newInv.map(i => i.id === ing.id ? { ...i, qty: parseFloat((i.qty + ing.qty).toFixed(2)) } : i);
      }
    }
    update(r => ({ ...r, sales: (r.sales || sales).slice(0, -1), inventory: newInv }));
    t("Last sale voided — inventory restored");
  }

  const allTabs = [
    { id: "dashboard", label: "Dashboard", icon: "◈", ownerOnly: false },
    { id: "pos", label: "Ring Up", icon: "⊕", ownerOnly: false },
    { id: "inventory", label: "Inventory", icon: "⊟", ownerOnly: true },
    { id: "margins", label: "Margins", icon: "%", ownerOnly: true },
    { id: "deals", label: "Deals", icon: "★", ownerOnly: true },
    { id: "pricing", label: "Pricing AI", icon: "🧠", ownerOnly: true },
    { id: "waste", label: "Waste Monitor", icon: "🔍", ownerOnly: true },
    { id: "eod", label: "End of Day", icon: "📋", ownerOnly: true },
    { id: "paycheck", label: "Paycheck", icon: "$", ownerOnly: true },
    { id: "settings", label: "Settings", icon: "⚙", ownerOnly: true },
  ];
  const tabs = allTabs.filter(t => !t.ownerOnly || isOwner);

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

      {/* Getting Started Tutorial */}
      {tutorial && (
        <div className="modal-bg">
          <div className="modal slide" style={{ maxWidth: 500 }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>👋</div>
              <div style={{ fontFamily: G.display, fontSize: 32, letterSpacing: 2, color: "#fff" }}>WELCOME TO PROFITPLATE</div>
              <div style={{ fontSize: 12, color: G.muted, marginTop: 4 }}>Let's get your restaurant set up in 3 steps</div>
            </div>
            {[
              { num: "01", title: "ADD YOUR INGREDIENTS", desc: "Go to Settings → Inventory. Add everything you buy — buns, patties, fries, sauces. Use the Pack mode for items bought in bulk.", icon: "📦", tab: "settings" },
              { num: "02", title: "BUILD YOUR MENU", desc: "Go to Settings → Menu. Add each item you sell, set the price, and link the ingredients it uses. The app calculates your profit margin automatically.", icon: "🍔", tab: "settings" },
              { num: "03", title: "START RINGING UP SALES", desc: "Go to Ring Up. Tap items to build an order, hit Mark as Sold, and your inventory updates automatically.", icon: "💰", tab: "pos" },
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: i < 2 ? `1px solid ${G.border}` : "none" }}>
                <div style={{ fontFamily: G.display, fontSize: 28, color: G.accent, width: 36, flexShrink: 0 }}>{step.num}</div>
                <div style={{ fontSize: 22, flexShrink: 0 }}>{step.icon}</div>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: G.accent, marginBottom: 4 }}>{step.title}</div>
                  <div style={{ fontSize: 12, color: G.muted, lineHeight: 1.7 }}>{step.desc}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 24, display: "flex", gap: 8 }}>
              <button className="btn" style={{ flex: 1, fontSize: 13, padding: 13 }} onClick={() => { setTutorial(false); setTab("settings"); }}>START SETUP →</button>
              <button className="btn-ghost" onClick={() => setTutorial(false)}>SKIP</button>
            </div>
          </div>
        </div>
      )}

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
          {!isOwner && <span className="badge by">STAFF MODE</span>}
          <button onClick={toggleTheme} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }} title="Toggle theme">{theme === "dark" ? "☀️" : "🌙"}</button>
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
            {(inventory.length === 0 || menuItems.length === 0) && (
              <div className="card" style={{ borderColor: G.accent+"55", marginBottom: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: G.accent, marginBottom: 12 }}>⚡ GETTING STARTED CHECKLIST</div>
                {[
                  { done: inventory.length > 0, label: "Add your ingredients", action: () => setTab("settings"), hint: "Settings → Inventory" },
                  { done: menuItems.length > 0, label: "Build your menu", action: () => setTab("settings"), hint: "Settings → Menu" },
                  { done: sales.length > 0, label: "Ring up your first sale", action: () => setTab("pos"), hint: "Ring Up tab" },
                ].map((item, i) => (
                  <div key={i} onClick={!item.done ? item.action : undefined} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 2 ? `1px solid ${G.border}` : "none", cursor: item.done ? "default" : "pointer" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: item.done ? G.green : G.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>{item.done ? "✓" : i+1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: item.done ? G.muted : G.text, textDecoration: item.done ? "line-through" : "none" }}>{item.label}</div>
                      {!item.done && <div style={{ fontSize: 10, color: G.accent }}>→ {item.hint}</div>}
                    </div>
                    {item.done && <span className="badge bg">DONE</span>}
                  </div>
                ))}
              </div>
            )}

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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: G.display, fontSize: 30, letterSpacing: 3, color: "#fff" }}>RING UP A SALE</div>
              {isOwner && sales.length > 0 && <button className="btn-danger" style={{ fontSize: 11 }} onClick={voidLastSale}>VOID LAST SALE</button>}
            </div>
            {receipt ? (
              <div style={{ maxWidth: 420, margin: "0 auto" }}>
                <div className="card" style={{ borderColor: G.green + "55", textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <div style={{ fontFamily: G.display, fontSize: 28, letterSpacing: 2, color: G.green, marginBottom: 4 }}>SALE LOGGED</div>
                  <div style={{ fontSize: 11, color: G.muted, marginBottom: 24, letterSpacing: 1 }}>MARK AS RECEIVED FROM CUSTOMER</div>
                  <div style={{ background: "#0a0a14", border: `1px solid ${G.border}`, borderRadius: 6, padding: 16, textAlign: "left", marginBottom: 16 }}>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 12 }}>ORDER SUMMARY — {receipt.time}</div>
                    {receipt.items.map(o => (
                      <div key={o._key || o.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: `1px solid ${G.border}` }}>
                        <div>
                          <span>{o.name} <span style={{ color: G.muted }}>×{o.qty}</span></span>
                          {o.modifiers && o.modifiers.length > 0 && <div style={{ fontSize: 10, color: G.accent }}>{o.modifiers.join(", ")}</div>}
                        </div>
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
                  <div style={{ display: "flex", gap: 8, marginBottom: 0 }}>
                    <button className="btn-ghost" style={{ flex: 1 }} onClick={() => {
                      const w = window.open("", "_blank");
                      w.document.write(`<html><head><title>Receipt</title><style>body{font-family:monospace;padding:20px;max-width:300px;margin:0 auto}h2{text-align:center}hr{border:1px dashed #ccc}.row{display:flex;justify-content:space-between}.total{font-size:18px;font-weight:bold}.note{color:#888;font-size:12px;margin-top:8px}</style></head><body><h2>${restaurant.name}</h2><p style="text-align:center">${receipt.time}</p><hr/>${receipt.items.map(o => `<div class="row"><span>${o.name}${o.modifiers&&o.modifiers.length?" ("+o.modifiers.join(", ")+")" :""} x${o.qty}</span><span>$${(o.price*o.qty).toFixed(2)}</span></div>`).join("")}<hr/><div class="row"><span>Subtotal</span><span>$${receipt.subtotal.toFixed(2)}</span></div><div class="row"><span>Tax</span><span>$${receipt.tax.toFixed(2)}</span></div><div class="row total"><span>TOTAL</span><span>$${receipt.total.toFixed(2)}</span></div>${receipt.note?`<p class="note">Note: ${receipt.note}</p>`:""}<hr/><p style="text-align:center;font-size:12px">Thank you!</p></body></html>`);
                      w.document.close(); w.print();
                    }}>🖨 PRINT</button>
                    <button className="btn" style={{ flex: 2, padding: 13 }} onClick={() => setReceipt(null)}>+ NEW ORDER</button>
                  </div>
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
                            <button onClick={() => setOrder(prev => prev.filter(x => (x._key || x.id) !== (o._key || o.id)))} style={{ background: "none", border: "none", color: G.red, fontSize: 14 }}>✕</button>
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


      {/* Modifier Modal */}
      {modifierModal && (
        <div className="modal-bg" onClick={() => setModifierModal(null)}>
          <div className="modal slide" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div style={{ fontFamily: G.display, fontSize: 24, letterSpacing: 2, color: "#fff", marginBottom: 4 }}>{modifierModal.item.name}</div>
            <div style={{ fontSize: 11, color: G.muted, marginBottom: 20 }}>${modifierModal.item.price.toFixed(2)} · Select any modifications</div>
            {["No onions", "No pickles", "No tomato", "No lettuce", "Extra cheese", "Extra sauce", "Well done", "Light ice", "No ice", "Extra crispy"].map(mod => (
              <div key={mod} onClick={() => setModifierModal(m => ({
                ...m,
                modifiers: m.modifiers.includes(mod) ? m.modifiers.filter(x => x !== mod) : [...m.modifiers, mod]
              }))} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", marginBottom: 8, background: modifierModal.modifiers.includes(mod) ? G.accent+"22" : "#0a0a14", border: `1px solid ${modifierModal.modifiers.includes(mod) ? G.accent : G.border}`, borderRadius: 6, cursor: "pointer", fontSize: 12, color: modifierModal.modifiers.includes(mod) ? G.accent : G.text }}>
                {mod}
                {modifierModal.modifiers.includes(mod) && <span>✓</span>}
              </div>
            ))}
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => confirmAddToOrder(modifierModal.item, modifierModal.modifiers)}>ADD TO ORDER</button>
              <button className="btn-ghost" onClick={() => setModifierModal(null)}>CANCEL</button>
            </div>
          </div>
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


        {/* ── END OF DAY ── */}
        {tab === "eod" && (
          <div className="fade">
            <div style={{ fontFamily: G.display, fontSize: 30, letterSpacing: 3, marginBottom: 8, color: "#fff" }}>END OF DAY REPORT</div>
            <div style={{ fontSize: 12, color: G.muted, marginBottom: 24 }}>Summary of today's performance</div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 20 }}>
              {[
                { label: "TOTAL REVENUE", val: `$${totalRevenue.toFixed(2)}`, color: G.green },
                { label: "FOOD COST", val: `$${totalCOGS.toFixed(2)}`, color: G.red },
                { label: "NET PROFIT", val: `$${totalProfit.toFixed(2)}`, color: G.accent },
                { label: "TOTAL SALES", val: sales.length, color: G.text },
                { label: "AVG SALE", val: sales.length > 0 ? `$${(totalRevenue / sales.length).toFixed(2)}` : "$0", color: G.yellow },
                { label: "PROFIT MARGIN", val: totalRevenue > 0 ? `${((totalProfit/totalRevenue)*100).toFixed(1)}%` : "0%", color: G.accent },
              ].map((s, i) => (
                <div key={i} className="card" style={{ borderTop: `2px solid ${s.color}` }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontFamily: G.display, fontSize: 28, color: s.color }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Best sellers */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 14 }}>BEST SELLERS TODAY</div>
              {(() => {
                const counts = {};
                sales.forEach(s => { counts[s.item] = (counts[s.item] || 0) + 1; });
                return Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,5).map(([name, count]) => (
                  <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${G.border}`, fontSize: 12 }}>
                    <span>{name}</span>
                    <span style={{ color: G.accent }}>{count} sold</span>
                  </div>
                ));
              })()}
            </div>

            {/* Weekly breakdown */}
            {sales.some(s => s.date) && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 14 }}>SALES BY DAY</div>
                {(() => {
                  const byDate = {};
                  sales.forEach(s => {
                    const d = s.date || "Today";
                    if (!byDate[d]) byDate[d] = { revenue: 0, profit: 0, count: 0 };
                    byDate[d].revenue += s.price;
                    byDate[d].profit += s.profit;
                    byDate[d].count += 1;
                  });
                  return Object.entries(byDate).slice(-7).reverse().map(([date, data]) => (
                    <div key={date} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${G.border}`, fontSize: 12 }}>
                      <span style={{ color: G.muted }}>{date}</span>
                      <div style={{ display: "flex", gap: 20 }}>
                        <span>{data.count} sales</span>
                        <span>${data.revenue.toFixed(2)}</span>
                        <span style={{ color: G.green }}>+${data.profit.toFixed(2)}</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn" onClick={() => {
                const rows = [["Item","Date","Time","Sale","Food Cost","Profit","Note"]];
                sales.forEach(s => rows.push([s.item, s.date||"", s.time, s.price.toFixed(2), s.cost.toFixed(2), s.profit.toFixed(2), s.note||""]));
                const csv = rows.map(r => r.join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = `profitplate-${new Date().toISOString().slice(0,10)}.csv`;
                a.click(); URL.revokeObjectURL(url);
              }}>⬇ EXPORT CSV</button>
              <button className="btn-ghost" style={{ color: G.red, borderColor: G.red+"44" }} onClick={() => {
                if (window.confirm("Clear all sales? This cannot be undone.")) {
                  update(r => ({ ...r, sales: [] }));
                  t("Sales cleared");
                }
              }}>🗑 CLEAR & RESET</button>
            </div>
          </div>
        )}

        {/* ── PAYCHECK ── */}
        {tab === "paycheck" && (
          <div className="fade">
            <div style={{ fontFamily: G.display, fontSize: 30, letterSpacing: 3, marginBottom: 8, color: "#fff" }}>PAYCHECK VIEW</div>
            <div style={{ fontSize: 12, color: G.muted, marginBottom: 24 }}>What you actually pocketed after food costs</div>
            {(() => {
              const taxCollected = sales.reduce((s, x) => s + (x.price * taxRate / 100), 0);
              const revenueAfterTax = totalRevenue - taxCollected;
              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 20 }}>
                  <div className="card" style={{ borderTop: `2px solid ${G.text}` }}>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 8 }}>GROSS REVENUE</div>
                    <div style={{ fontFamily: G.display, fontSize: 36 }}>${totalRevenue.toFixed(2)}</div>
                    <div style={{ fontSize: 11, color: G.muted }}>{sales.length} transactions</div>
                  </div>
                  <div className="card" style={{ borderTop: `2px solid ${G.yellow}` }}>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 8 }}>TAX COLLECTED</div>
                    <div style={{ fontFamily: G.display, fontSize: 36, color: G.yellow }}>− ${taxCollected.toFixed(2)}</div>
                    <div style={{ fontSize: 11, color: G.muted }}>owed to government</div>
                  </div>
                  <div className="card" style={{ borderTop: `2px solid ${G.red}` }}>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 8 }}>FOOD COST</div>
                    <div style={{ fontFamily: G.display, fontSize: 36, color: G.red }}>− ${totalCOGS.toFixed(2)}</div>
                    <div style={{ fontSize: 11, color: G.muted }}>ingredients used</div>
                  </div>
                </div>
              );
            })()}
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
                        <td style={{ color: G.muted }}>{s.date ? `${s.date} ` : ""}{s.time}</td>
                        <td>${s.price.toFixed(2)}</td>
                        <td style={{ color: G.red }}>−${s.cost.toFixed(2)}</td>
                        <td style={{ color: G.green }}>+${s.profit.toFixed(2)}</td>
                        {s.note && <td style={{ color: G.muted, fontSize: 10, fontStyle: "italic" }}>{s.note}</td>}
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
  const [editingItem, setEditingItem] = useState(null); // holds menu item being edited
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
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 500 }}>
          <div className="card">
            <div style={{ fontSize: 10, letterSpacing: 2, color: G.accent, marginBottom: 14 }}>OWNER PIN (full access)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>NEW OWNER PIN</div><input type="password" inputMode="numeric" maxLength={6} value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, "") }))} placeholder="••••" /></div>
              <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>CONFIRM PIN</div><input type="password" inputMode="numeric" maxLength={6} value={form.confirmPin} onChange={e => setForm(f => ({ ...f, confirmPin: e.target.value.replace(/\D/g, "") }))} placeholder="••••" /></div>
              <button className="btn" onClick={savePin}>UPDATE OWNER PIN</button>
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 14 }}>STAFF PIN (cashier only — ring up sales only)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><div style={{ fontSize: 10, letterSpacing: 2, color: G.muted, marginBottom: 6 }}>STAFF PIN</div><input type="password" inputMode="numeric" maxLength={6} value={form.staffPin||""} onChange={e => setForm(f => ({ ...f, staffPin: e.target.value.replace(/\D/g, "") }))} placeholder="•••• (optional)" /></div>
              <button className="btn-ghost" onClick={() => { update(r => ({ ...r, staffPin: form.staffPin })); showToast("Staff PIN saved!"); }}>SAVE STAFF PIN</button>
            </div>
          </div>
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
                        <td style={{ display: "flex", gap: 6 }}>
                          <button className="btn-sm" style={{ fontSize: 10 }} onClick={() => setEditingItem({...item})}>EDIT</button>
                          <button className="btn-danger" onClick={() => update(r => ({ ...r, menuItems: (r.menuItems || menuItems).filter(m => m.id !== item.id) }))}>✕</button>
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
