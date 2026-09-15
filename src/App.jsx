import React, { useState, useMemo } from "react";
import {
  Recycle, Truck, Coins, LayoutDashboard, CheckCircle2, Camera, MapPin,
  Calendar, Package, TrendingUp, Users, ClipboardList, LogOut, Droplets,
  Leaf, ArrowRight, Plus, Gift, Scale, ChevronRight, Clock, ShieldCheck
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ---------- design tokens ----------
const T = {
  ink: "#16261E",       // near-black forest ink, headings/sidebar
  inkSoft: "#3C4A41",
  paper: "#EEF0E3",     // pale sage paper background
  paperRaised: "#F7F8EF",
  leaf: "#4B7A3E",       // primary brand green
  leafDeep: "#365C2C",
  wet: "#2F6E72",        // wet waste teal
  wetSoft: "#DCEAEA",
  dry: "#8C6A34",        // dry waste ochre/cardboard
  drySoft: "#EDE3CB",
  coin: "#C77D2E",       // green-coin ochre
  coinSoft: "#F3E1C8",
  line: "#D8D9C8",
  danger: "#A6402F",
};

const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
`;

// ---------- seed data ----------
const seedPickups = [
  { id: "P-1042", household: "Nandini R.", address: "Flat 4B, Palm Meadows, HSR Layout", waste: "wet", date: "2026-09-14", slot: "8:00–10:00 AM", status: "Collected", collector: "Farooq S.", weight: 3.2, coins: 6 },
  { id: "P-1043", household: "Nandini R.", address: "Flat 4B, Palm Meadows, HSR Layout", waste: "dry", date: "2026-09-11", slot: "4:00–6:00 PM", status: "Collected", collector: "Farooq S.", weight: 2.1, coins: 8 },
  { id: "P-1044", household: "Arvind K.", address: "12, Lakeview Residency, Indiranagar", waste: "mixed", date: "2026-09-15", slot: "9:00–11:00 AM", status: "Accepted", collector: "Farooq S.", weight: null, coins: null },
  { id: "P-1045", household: "Sunita M.", address: "B-201, Green Aster Apts, Koramangala", waste: "dry", date: "2026-09-15", slot: "6:00–8:00 AM", status: "Requested", collector: null, weight: null, coins: null },
  { id: "P-1046", household: "Reema T.", address: "22, Sunrise Villas, Whitefield", waste: "wet", date: "2026-09-15", slot: "5:00–7:00 PM", status: "Requested", collector: null, weight: null, coins: null },
  { id: "P-1047", household: "Nandini R.", address: "Flat 4B, Palm Meadows, HSR Layout", waste: "dry", date: "2026-09-08", slot: "8:00–10:00 AM", status: "Collected", collector: "Deepak V.", weight: 1.6, coins: 6 },
];

const trend = [
  { day: "Mon", wet: 42, dry: 31 },
  { day: "Tue", wet: 38, dry: 29 },
  { day: "Wed", wet: 51, dry: 34 },
  { day: "Thu", wet: 47, dry: 40 },
  { day: "Fri", wet: 55, dry: 37 },
  { day: "Sat", wet: 63, dry: 46 },
  { day: "Sun", wet: 58, dry: 42 },
];

const redeemables = [
  { name: "₹100 Big Basket voucher", cost: 220, icon: Gift },
  { name: "Reusable jute tote bag", cost: 90, icon: Leaf },
  { name: "Compost starter kit", cost: 160, icon: Recycle },
  { name: "₹50 mobile recharge", cost: 110, icon: Coins },
];

const wasteMeta = {
  wet: { label: "Wet waste", color: T.wet, soft: T.wetSoft, rate: 2, desc: "Kitchen scraps, peels, leftovers" },
  dry: { label: "Dry waste", color: T.dry, soft: T.drySoft, rate: 4, desc: "Paper, plastic, metal, glass" },
  mixed: { label: "Mixed", color: T.inkSoft, soft: "#E4E3D6", rate: 3, desc: "Not yet segregated" },
};

const statusColor = {
  Requested: { bg: "#F3E1C8", fg: T.coin },
  Accepted: { bg: T.wetSoft, fg: T.wet },
  Collected: { bg: "#DCEBDC", fg: T.leafDeep },
};

function uid(prefix) {
  return prefix + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

// ---------- small UI atoms ----------
function Badge({ status }) {
  const c = statusColor[status];
  return (
    <span style={{ background: c.bg, color: c.fg }} className="text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
      {status === "Collected" && <CheckCircle2 size={12} />}
      {status}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="p-5 flex flex-col gap-3" style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}>
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: T.inkSoft }}>{label}</span>
        <Icon size={18} color={accent || T.leaf} />
      </div>
      <div className="text-3xl" style={{ fontFamily: "Fraunces, serif", color: T.ink }}>{value}</div>
      {sub && <span className="text-xs" style={{ color: T.inkSoft }}>{sub}</span>}
    </div>
  );
}

function WasteTag({ type }) {
  const m = wasteMeta[type];
  return (
    <span style={{ background: m.soft, color: m.color }} className="text-xs font-semibold px-2 py-1 rounded-full">
      {m.label}
    </span>
  );
}

// ---------- Role gate (landing) ----------
function RoleGate({ onEnter }) {
  return (
    <div style={{ background: T.ink, minHeight: "100vh" }} className="flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid md:grid-cols-2 overflow-hidden" style={{ border: `1px solid ${T.leafDeep}` }}>
        <div className="p-10 flex flex-col justify-between" style={{ background: T.leafDeep }}>
          <div className="flex items-center gap-2" style={{ color: T.paper }}>
            <Recycle size={22} />
            <span className="text-sm tracking-wide">ECLEAN</span>
          </div>
          <div>
            <h1 style={{ fontFamily: "Fraunces, serif", color: T.paper, fontSize: "2.6rem", lineHeight: 1.08 }}>
              Doorstep waste,<br />turned into a resource.
            </h1>
            <p className="mt-4 text-sm" style={{ color: "#C9D6C0", maxWidth: "34ch" }}>
              Book a segregated pickup, track what it becomes, and earn Green Coins for doing it right — a working preview of the ECLEAN MVP.
            </p>
          </div>
          <CycleDiagram />
        </div>
        <div className="p-10 flex flex-col justify-center gap-3" style={{ background: T.paper }}>
          <p className="text-xs font-semibold tracking-wide mb-1" style={{ color: T.inkSoft }}>PREVIEW AS</p>
          <RoleButton icon={Leaf} title="Household" desc="Book pickups, track Green Coins" onClick={() => onEnter("household")} />
          <RoleButton icon={Truck} title="Collector" desc="Accept jobs, record weights" onClick={() => onEnter("collector")} />
          <RoleButton icon={ShieldCheck} title="Admin" desc="Operations & platform health" onClick={() => onEnter("admin")} />
          <p className="text-xs mt-2" style={{ color: T.inkSoft }}>No sign-in needed — this is a click-through prototype, data resets each session.</p>
        </div>
      </div>
    </div>
  );
}

function RoleButton({ icon: Icon, title, desc, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-4 p-4 text-left transition-colors" style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = T.leaf}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = T.line}>
      <div className="w-10 h-10 flex items-center justify-center" style={{ background: T.paper }}>
        <Icon size={18} color={T.leafDeep} />
      </div>
      <div className="flex-1">
        <div className="font-semibold" style={{ color: T.ink }}>{title}</div>
        <div className="text-xs" style={{ color: T.inkSoft }}>{desc}</div>
      </div>
      <ChevronRight size={16} color={T.inkSoft} />
    </button>
  );
}

function CycleDiagram() {
  const stops = ["Household", "Collector", "Recycler", "Reward"];
  return (
    <div className="flex items-center gap-1 mt-8">
      {stops.map((s, i) => (
        <React.Fragment key={s}>
          <span className="text-xs px-2 py-1" style={{ color: "#C9D6C0", border: "1px solid #4A6B40" }}>{s}</span>
          {i < stops.length - 1 && <ArrowRight size={12} color="#7FA26E" />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ---------- Shell ----------
function Sidebar({ role, view, setView, onExit, coins }) {
  const items = {
    household: [
      { id: "dashboard", label: "Overview", icon: LayoutDashboard },
      { id: "book", label: "Book pickup", icon: Plus },
      { id: "history", label: "Pickup history", icon: ClipboardList },
      { id: "rewards", label: "Green Coins", icon: Coins },
    ],
    collector: [
      { id: "available", label: "Available jobs", icon: Package },
      { id: "myjobs", label: "My jobs", icon: Truck },
    ],
    admin: [
      { id: "dashboard", label: "Overview", icon: LayoutDashboard },
      { id: "requests", label: "Pickup requests", icon: ClipboardList },
      { id: "collectors", label: "Collectors", icon: Users },
    ],
  };
  const roleLabel = { household: "Household · Nandini R.", collector: "Collector · Farooq S.", admin: "Admin console" };
  return (
    <div className="w-60 shrink-0 flex flex-col justify-between" style={{ background: T.leafDeep, minHeight: "100vh" }}>
      <div>
        <div className="p-5 flex items-center gap-2" style={{ borderBottom: "1px solid #2E4C27" }}>
          <Recycle size={20} color={T.paper} />
          <span style={{ color: T.paper, fontFamily: "Fraunces, serif", fontSize: "1.1rem" }}>ECLEAN</span>
        </div>
        <div className="px-5 pt-4 pb-2 text-xs" style={{ color: "#A9C29B" }}>{roleLabel[role]}</div>
        <nav className="mt-1 flex flex-col">
          {items[role].map((it) => {
            const active = view === it.id;
            return (
              <button key={it.id} onClick={() => setView(it.id)}
                className="flex items-center gap-3 px-5 py-3 text-sm text-left transition-colors"
                style={{ background: active ? "#2E4C27" : "transparent", color: active ? T.paper : "#B9CDAF", borderLeft: active ? `3px solid ${T.paper}` : "3px solid transparent" }}>
                <it.icon size={16} />
                {it.label}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="p-5" style={{ borderTop: "1px solid #2E4C27" }}>
        {role === "household" && (
          <div className="mb-4 flex items-center gap-2 text-sm" style={{ color: T.paper }}>
            <Coins size={15} color="#E8B368" /> {coins} Green Coins
          </div>
        )}
        <button onClick={onExit} className="flex items-center gap-2 text-xs" style={{ color: "#A9C29B" }}>
          <LogOut size={13} /> Switch role
        </button>
      </div>
    </div>
  );
}

// ---------- Household views ----------
function HouseholdDashboard({ pickups, coins, setView }) {
  const mine = pickups.filter((p) => p.household === "Nandini R.");
  const kg = mine.reduce((s, p) => s + (p.weight || 0), 0);
  const collected = mine.filter((p) => p.status === "Collected").length;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 style={{ fontFamily: "Fraunces, serif", fontSize: "1.7rem", color: T.ink }}>Good to see you, Nandini</h2>
        <p className="text-sm" style={{ color: T.inkSoft }}>Here's your impact so far, and what's coming up.</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Scale} label="Waste diverted" value={`${kg.toFixed(1)} kg`} sub="from landfill, lifetime" />
        <StatCard icon={CheckCircle2} label="Pickups completed" value={collected} sub={`${mine.length} total requested`} />
        <StatCard icon={Coins} label="Green Coins" value={coins} accent={T.coin} sub="≈ redeemable now" />
      </div>
      <div className="flex items-center justify-between p-5" style={{ background: T.leafDeep }}>
        <div>
          <p style={{ color: T.paper, fontFamily: "Fraunces, serif", fontSize: "1.2rem" }}>Ready for your next pickup?</p>
          <p className="text-xs mt-1" style={{ color: "#C9D6C0" }}>Segregate wet and dry waste before booking for the best rate.</p>
        </div>
        <button onClick={() => setView("book")} className="px-4 py-2 text-sm font-semibold flex items-center gap-2" style={{ background: T.paper, color: T.leafDeep }}>
          Book pickup <ArrowRight size={14} />
        </button>
      </div>
      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: T.ink }}>Upcoming</p>
        <div className="flex flex-col gap-2">
          {mine.filter((p) => p.status !== "Collected").length === 0 && (
            <p className="text-sm" style={{ color: T.inkSoft }}>Nothing scheduled — book a pickup to get started.</p>
          )}
          {mine.filter((p) => p.status !== "Collected").map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4" style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}>
              <div className="flex items-center gap-3">
                <WasteTag type={p.waste} />
                <span className="text-sm" style={{ color: T.ink }}>{p.date} · {p.slot}</span>
              </div>
              <Badge status={p.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookPickup({ addPickup }) {
  const [waste, setWaste] = useState("wet");
  const [date, setDate] = useState("2026-09-17");
  const [slot, setSlot] = useState("8:00–10:00 AM");
  const [address, setAddress] = useState("Flat 4B, Palm Meadows, HSR Layout");
  const [confirmed, setConfirmed] = useState(null);

  const submit = () => {
    const p = { id: uid("P"), household: "Nandini R.", address, waste, date, slot, status: "Requested", collector: null, weight: null, coins: null };
    addPickup(p);
    setConfirmed(p);
  };

  if (confirmed) {
    return (
      <div className="max-w-md flex flex-col items-start gap-4 p-8" style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}>
        <div className="w-12 h-12 flex items-center justify-center" style={{ background: "#DCEBDC" }}>
          <CheckCircle2 color={T.leafDeep} size={22} />
        </div>
        <div>
          <p style={{ fontFamily: "Fraunces, serif", fontSize: "1.3rem", color: T.ink }}>Pickup requested</p>
          <p className="text-sm mt-1" style={{ color: T.inkSoft }}>Request {confirmed.id} for {confirmed.date}, {confirmed.slot}. A collector will accept it shortly — track it under Pickup history.</p>
        </div>
        <button onClick={() => setConfirmed(null)} className="text-sm font-semibold" style={{ color: T.leafDeep }}>Book another pickup →</button>
      </div>
    );
  }

  return (
    <div className="max-w-lg flex flex-col gap-6">
      <h2 style={{ fontFamily: "Fraunces, serif", fontSize: "1.7rem", color: T.ink }}>Book a doorstep pickup</h2>
      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: T.ink }}>What are you handing over?</p>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(wasteMeta).map(([key, m]) => (
            <button key={key} onClick={() => setWaste(key)} className="p-4 text-left flex flex-col gap-2"
              style={{ background: waste === key ? m.soft : T.paperRaised, border: `1.5px solid ${waste === key ? m.color : T.line}` }}>
              <span className="text-sm font-semibold" style={{ color: m.color }}>{m.label}</span>
              <span className="text-xs" style={{ color: T.inkSoft }}>{m.desc}</span>
              <span className="text-xs font-semibold" style={{ color: m.color }}>{m.rate} coins/kg</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold" style={{ color: T.ink }}>Pickup address</label>
        <div className="flex items-center gap-2 px-3 py-2" style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}>
          <MapPin size={15} color={T.inkSoft} />
          <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full text-sm bg-transparent outline-none" style={{ color: T.ink }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold" style={{ color: T.ink }}>Date</label>
          <div className="flex items-center gap-2 px-3 py-2" style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}>
            <Calendar size={15} color={T.inkSoft} />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full text-sm bg-transparent outline-none" style={{ color: T.ink }} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold" style={{ color: T.ink }}>Time slot</label>
          <select value={slot} onChange={(e) => setSlot(e.target.value)} className="text-sm px-3 py-2 outline-none" style={{ background: T.paperRaised, border: `1px solid ${T.line}`, color: T.ink }}>
            {["6:00–8:00 AM", "8:00–10:00 AM", "4:00–6:00 PM", "6:00–8:00 PM"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <button onClick={submit} className="self-start px-5 py-2.5 text-sm font-semibold" style={{ background: T.leaf, color: T.paper }}>
        Confirm pickup request
      </button>
    </div>
  );
}

function HouseholdHistory({ pickups }) {
  const mine = pickups.filter((p) => p.household === "Nandini R.");
  return (
    <div className="flex flex-col gap-4">
      <h2 style={{ fontFamily: "Fraunces, serif", fontSize: "1.7rem", color: T.ink }}>Pickup history</h2>
      <div className="flex flex-col gap-2">
        {mine.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4" style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}>
            <div className="flex items-center gap-4">
              <WasteTag type={p.waste} />
              <div>
                <p className="text-sm font-semibold" style={{ color: T.ink }}>{p.date} · {p.slot}</p>
                <p className="text-xs" style={{ color: T.inkSoft }}>{p.id} {p.weight ? `· ${p.weight} kg` : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {p.coins && <span className="text-xs font-semibold flex items-center gap-1" style={{ color: T.coin }}><Coins size={12} /> +{p.coins}</span>}
              <Badge status={p.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HouseholdRewards({ coins, redeem, log }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="p-6 flex items-center justify-between" style={{ background: T.coinSoft }}>
        <div>
          <p className="text-sm" style={{ color: T.inkSoft }}>Your balance</p>
          <p style={{ fontFamily: "Fraunces, serif", fontSize: "2.4rem", color: T.coin }}>{coins} <span className="text-base font-sans" style={{ color: T.inkSoft }}>Green Coins</span></p>
        </div>
        <Coins size={40} color={T.coin} />
      </div>
      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: T.ink }}>Redeem</p>
        <div className="grid grid-cols-2 gap-3">
          {redeemables.map((r) => {
            const can = coins >= r.cost;
            return (
              <div key={r.name} className="p-4 flex items-center gap-3" style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}>
                <r.icon size={18} color={T.leafDeep} />
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: T.ink }}>{r.name}</p>
                  <p className="text-xs" style={{ color: T.inkSoft }}>{r.cost} coins</p>
                </div>
                <button disabled={!can} onClick={() => redeem(r)} className="text-xs font-semibold px-3 py-1.5"
                  style={{ background: can ? T.leaf : T.line, color: can ? T.paper : T.inkSoft, cursor: can ? "pointer" : "not-allowed" }}>
                  Redeem
                </button>
              </div>
            );
          })}
        </div>
      </div>
      {log.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-2" style={{ color: T.ink }}>Redeemed</p>
          <div className="flex flex-col gap-2">
            {log.map((l, i) => (
              <div key={i} className="text-sm flex items-center gap-2" style={{ color: T.inkSoft }}>
                <CheckCircle2 size={13} color={T.leaf} /> {l.name} — {l.cost} coins
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Collector views ----------
function CollectorAvailable({ pickups, accept }) {
  const open = pickups.filter((p) => p.status === "Requested");
  return (
    <div className="flex flex-col gap-4">
      <h2 style={{ fontFamily: "Fraunces, serif", fontSize: "1.7rem", color: T.ink }}>Available jobs near you</h2>
      {open.length === 0 && <p className="text-sm" style={{ color: T.inkSoft }}>No open requests right now — check back soon.</p>}
      <div className="flex flex-col gap-2">
        {open.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4" style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}>
            <div className="flex items-center gap-4">
              <WasteTag type={p.waste} />
              <div>
                <p className="text-sm font-semibold flex items-center gap-1" style={{ color: T.ink }}><MapPin size={13} /> {p.address}</p>
                <p className="text-xs" style={{ color: T.inkSoft }}>{p.date} · {p.slot}</p>
              </div>
            </div>
            <button onClick={() => accept(p.id)} className="text-xs font-semibold px-3 py-2" style={{ background: T.leaf, color: T.paper }}>
              Accept job
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CollectorMyJobs({ pickups, complete }) {
  const mine = pickups.filter((p) => p.collector === "Farooq S." && p.status !== "Collected");
  const [openId, setOpenId] = useState(null);
  const [weight, setWeight] = useState("");
  const [photo, setPhoto] = useState(null);

  const submitCollection = (p) => {
    const w = parseFloat(weight);
    if (!w) return;
    complete(p.id, w);
    setOpenId(null); setWeight(""); setPhoto(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 style={{ fontFamily: "Fraunces, serif", fontSize: "1.7rem", color: T.ink }}>My jobs</h2>
      {mine.length === 0 && <p className="text-sm" style={{ color: T.inkSoft }}>No active jobs — accept one from Available jobs.</p>}
      <div className="flex flex-col gap-2">
        {mine.map((p) => (
          <div key={p.id} style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <WasteTag type={p.waste} />
                <div>
                  <p className="text-sm font-semibold flex items-center gap-1" style={{ color: T.ink }}><MapPin size={13} /> {p.address}</p>
                  <p className="text-xs" style={{ color: T.inkSoft }}>{p.date} · {p.slot} · {p.household}</p>
                </div>
              </div>
              <button onClick={() => setOpenId(openId === p.id ? null : p.id)} className="text-xs font-semibold px-3 py-2" style={{ background: T.wet, color: T.paper }}>
                {openId === p.id ? "Close" : "Record collection"}
              </button>
            </div>
            {openId === p.id && (
              <div className="p-4 grid grid-cols-2 gap-4" style={{ borderTop: `1px solid ${T.line}` }}>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold flex items-center gap-1" style={{ color: T.ink }}><Scale size={13} /> Weight collected (kg)</label>
                  <input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" step="0.1" placeholder="e.g. 2.4"
                    className="text-sm px-3 py-2 outline-none" style={{ background: T.paper, border: `1px solid ${T.line}`, color: T.ink }} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold flex items-center gap-1" style={{ color: T.ink }}><Camera size={13} /> Proof photo</label>
                  <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0]?.name || null)}
                    className="text-xs" style={{ color: T.inkSoft }} />
                </div>
                <button onClick={() => submitCollection(p)} className="col-span-2 self-start px-4 py-2 text-sm font-semibold" style={{ background: T.leaf, color: T.paper }}>
                  Mark as collected
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Admin views ----------
function AdminDashboard({ pickups }) {
  const total = pickups.length;
  const collected = pickups.filter((p) => p.status === "Collected").length;
  const kg = pickups.reduce((s, p) => s + (p.weight || 0), 0);
  const households = new Set(pickups.map((p) => p.household)).size;
  const pieData = [
    { name: "Wet", value: pickups.filter((p) => p.waste === "wet").length, color: T.wet },
    { name: "Dry", value: pickups.filter((p) => p.waste === "dry").length, color: T.dry },
    { name: "Mixed", value: pickups.filter((p) => p.waste === "mixed").length, color: T.inkSoft },
  ];
  return (
    <div className="flex flex-col gap-6">
      <h2 style={{ fontFamily: "Fraunces, serif", fontSize: "1.7rem", color: T.ink }}>Operations overview</h2>
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Users} label="Active households" value={households} />
        <StatCard icon={ClipboardList} label="Pickups (all time)" value={total} sub={`${collected} collected`} />
        <StatCard icon={Scale} label="Waste collected" value={`${kg.toFixed(1)} kg`} />
        <StatCard icon={TrendingUp} label="Completion rate" value={`${Math.round((collected / total) * 100)}%`} accent={T.leaf} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 p-5" style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}>
          <p className="text-sm font-semibold mb-3" style={{ color: T.ink }}>Waste collected this week (kg)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend}>
              <CartesianGrid stroke={T.line} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: T.inkSoft }} axisLine={{ stroke: T.line }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: T.inkSoft }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: `1px solid ${T.line}`, fontSize: 12 }} />
              <Bar dataKey="wet" stackId="a" fill={T.wet} name="Wet" />
              <Bar dataKey="dry" stackId="a" fill={T.dry} name="Dry" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="p-5" style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}>
          <p className="text-sm font-semibold mb-3" style={{ color: T.ink }}>Requests by category</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ border: `1px solid ${T.line}`, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function AdminRequests({ pickups }) {
  const [filter, setFilter] = useState("All");
  const tabs = ["All", "Requested", "Accepted", "Collected"];
  const rows = pickups.filter((p) => filter === "All" || p.status === filter);
  return (
    <div className="flex flex-col gap-4">
      <h2 style={{ fontFamily: "Fraunces, serif", fontSize: "1.7rem", color: T.ink }}>Pickup requests</h2>
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setFilter(t)} className="text-xs font-semibold px-3 py-1.5"
            style={{ background: filter === t ? T.leaf : T.paperRaised, color: filter === t ? T.paper : T.inkSoft, border: `1px solid ${filter === t ? T.leaf : T.line}` }}>
            {t}
          </button>
        ))}
      </div>
      <div style={{ border: `1px solid ${T.line}` }}>
        <div className="grid grid-cols-6 px-4 py-2 text-xs font-semibold" style={{ background: T.paper, color: T.inkSoft, borderBottom: `1px solid ${T.line}` }}>
          <span>ID</span><span>Household</span><span>Type</span><span>Collector</span><span>Weight</span><span>Status</span>
        </div>
        {rows.map((p) => (
          <div key={p.id} className="grid grid-cols-6 px-4 py-3 text-sm items-center" style={{ borderBottom: `1px solid ${T.line}`, background: T.paperRaised, color: T.ink }}>
            <span>{p.id}</span>
            <span>{p.household}</span>
            <span><WasteTag type={p.waste} /></span>
            <span style={{ color: T.inkSoft }}>{p.collector || "—"}</span>
            <span style={{ color: T.inkSoft }}>{p.weight ? `${p.weight} kg` : "—"}</span>
            <span><Badge status={p.status} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminCollectors({ pickups }) {
  const names = Array.from(new Set(pickups.map((p) => p.collector).filter(Boolean)));
  const collectors = names.length ? names : ["Farooq S.", "Deepak V."];
  return (
    <div className="flex flex-col gap-4">
      <h2 style={{ fontFamily: "Fraunces, serif", fontSize: "1.7rem", color: T.ink }}>Collectors</h2>
      <div className="grid grid-cols-2 gap-4">
        {collectors.map((c) => {
          const jobs = pickups.filter((p) => p.collector === c);
          const done = jobs.filter((p) => p.status === "Collected").length;
          const kg = jobs.reduce((s, p) => s + (p.weight || 0), 0);
          return (
            <div key={c} className="p-5 flex items-center gap-4" style={{ background: T.paperRaised, border: `1px solid ${T.line}` }}>
              <div className="w-11 h-11 flex items-center justify-center" style={{ background: T.wetSoft }}>
                <Truck size={18} color={T.wet} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: T.ink }}>{c}</p>
                <p className="text-xs" style={{ color: T.inkSoft }}>{done} jobs completed · {kg.toFixed(1)} kg handled</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- App root ----------
export default function App() {
  const [role, setRole] = useState(null);
  const [view, setView] = useState("dashboard");
  const [pickups, setPickups] = useState(seedPickups);
  const [coins, setCoins] = useState(64);
  const [redeemLog, setRedeemLog] = useState([]);

  const enter = (r) => {
    setRole(r);
    setView(r === "collector" ? "available" : "dashboard");
  };
  const exit = () => setRole(null);

  const addPickup = (p) => setPickups((prev) => [p, ...prev]);
  const acceptJob = (id) => setPickups((prev) => prev.map((p) => p.id === id ? { ...p, status: "Accepted", collector: "Farooq S." } : p));
  const completeJob = (id, weight) => {
    setPickups((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const earned = Math.round(weight * wasteMeta[p.waste].rate);
      if (p.household === "Nandini R.") setCoins((c) => c + earned);
      return { ...p, status: "Collected", weight, coins: earned };
    }));
  };
  const redeem = (r) => { setCoins((c) => c - r.cost); setRedeemLog((l) => [r, ...l]); };

  if (!role) return (
    <>
      <style>{fontImport}</style>
      <RoleGate onEnter={enter} />
    </>
  );

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: T.paper, minHeight: "100vh" }}>
      <style>{fontImport}</style>
      <div className="flex">
        <Sidebar role={role} view={view} setView={setView} onExit={exit} coins={coins} />
        <div className="flex-1 p-8">
          {role === "household" && view === "dashboard" && <HouseholdDashboard pickups={pickups} coins={coins} setView={setView} />}
          {role === "household" && view === "book" && <BookPickup addPickup={addPickup} />}
          {role === "household" && view === "history" && <HouseholdHistory pickups={pickups} />}
          {role === "household" && view === "rewards" && <HouseholdRewards coins={coins} redeem={redeem} log={redeemLog} />}

          {role === "collector" && view === "available" && <CollectorAvailable pickups={pickups} accept={acceptJob} />}
          {role === "collector" && view === "myjobs" && <CollectorMyJobs pickups={pickups} complete={completeJob} />}

          {role === "admin" && view === "dashboard" && <AdminDashboard pickups={pickups} />}
          {role === "admin" && view === "requests" && <AdminRequests pickups={pickups} />}
          {role === "admin" && view === "collectors" && <AdminCollectors pickups={pickups} />}
        </div>
      </div>
    </div>
  );
}
