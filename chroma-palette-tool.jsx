import { useState, useRef } from "react";

// ─── Colour Science ──────────────────────────────────────────────────────────

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}
function hexToHsl(hex) {
  let { r, g, b } = hexToRgb(hex);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s));
  l = Math.max(0, Math.min(100, l));
  const a = s * Math.min(l, 100 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1))).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
function rgbToCmyk({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - r - k) / (1 - k)) * 100),
    m: Math.round(((1 - g - k) / (1 - k)) * 100),
    y: Math.round(((1 - b - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}
function generateHarmonies(hex) {
  const { h, s, l } = hexToHsl(hex);
  return {
    Monochromatic: [hslToHex(h,s,Math.min(93,l+32)), hslToHex(h,s,Math.min(93,l+16)), hex, hslToHex(h,s,Math.max(7,l-16)), hslToHex(h,s,Math.max(7,l-32))],
    Analogous: [hslToHex(h-30,s,l), hslToHex(h-15,s,l), hex, hslToHex(h+15,s,l), hslToHex(h+30,s,l)],
    Complementary: [hex, hslToHex(h+30,Math.max(20,s-10),Math.min(88,l+18)), hslToHex(h+180,s,l), hslToHex(h+150,s,l), hslToHex(h+210,s,l)],
    Triadic: [hex, hslToHex(h+120,s,l), hslToHex(h+240,s,l), hslToHex(h+60,Math.max(20,s-20),Math.min(90,l+15)), hslToHex(h+300,Math.max(20,s-20),Math.min(90,l+15))],
  };
}

// ─── Data ────────────────────────────────────────────────────────────────────

const COLLECTIONS = [
  { id: "SS26-COASTAL", name: "Coastal Drift", season: "SS26", category: "Fashion",
    colors: [
      { hex: "#E8EFF5", name: "Salt Air", code: "CHR-1102" },
      { hex: "#BACFE0", name: "Shoreline", code: "CHR-1108" },
      { hex: "#6A9DB8", name: "Deep Cove", code: "CHR-1115" },
      { hex: "#3D6E8A", name: "Tidal Blue", code: "CHR-1121" },
      { hex: "#C9DDD5", name: "Sea Glass", code: "CHR-1130" },
      { hex: "#F5ECD7", name: "Dune Sand", code: "CHR-1138" },
    ]},
  { id: "AW26-EARTH", name: "Terra Profonda", season: "AW26", category: "Fashion",
    colors: [
      { hex: "#3B2A1A", name: "Dark Peat", code: "CHR-2204" },
      { hex: "#7A5535", name: "Clay Brown", code: "CHR-2211" },
      { hex: "#B8894E", name: "Raw Sienna", code: "CHR-2218" },
      { hex: "#D4B483", name: "Warm Sand", code: "CHR-2225" },
      { hex: "#E8D8BC", name: "Linen", code: "CHR-2232" },
      { hex: "#5C3D22", name: "Mahogany", code: "CHR-2240" },
    ]},
  { id: "SS26-BLOOM", name: "Botanical Bloom", season: "SS26", category: "Interior",
    colors: [
      { hex: "#E8C4C4", name: "Petal Blush", code: "CHR-3102" },
      { hex: "#C47A8A", name: "Wild Rose", code: "CHR-3109" },
      { hex: "#8A4A5A", name: "Deep Fuchsia", code: "CHR-3116" },
      { hex: "#D4C8A0", name: "Sage Pollen", code: "CHR-3124" },
      { hex: "#7A9070", name: "Garden Moss", code: "CHR-3131" },
      { hex: "#F5F0E0", name: "White Petal", code: "CHR-3140" },
    ]},
  { id: "AW26-METRO", name: "Urban Grey", season: "AW26", category: "Fashion",
    colors: [
      { hex: "#F2F2F0", name: "Chalk", code: "CHR-4102" },
      { hex: "#D0CFC8", name: "Pale Concrete", code: "CHR-4108" },
      { hex: "#9E9D94", name: "Stone", code: "CHR-4115" },
      { hex: "#6A6860", name: "Slate", code: "CHR-4122" },
      { hex: "#3C3B38", name: "Graphite", code: "CHR-4130" },
      { hex: "#1A1A18", name: "Carbon", code: "CHR-4138" },
    ]},
  { id: "SS26-CITRUS", name: "Sun Market", season: "SS26", category: "Lifestyle",
    colors: [
      { hex: "#F5E84A", name: "Lemon Zest", code: "CHR-5102" },
      { hex: "#F0B830", name: "Saffron", code: "CHR-5108" },
      { hex: "#E87820", name: "Blood Orange", code: "CHR-5115" },
      { hex: "#C84820", name: "Paprika", code: "CHR-5122" },
      { hex: "#F8F0D8", name: "Cream", code: "CHR-5130" },
      { hex: "#4A3010", name: "Dark Spice", code: "CHR-5138" },
    ]},
  { id: "AW26-NIGHT", name: "Nocturne", season: "AW26", category: "Fashion",
    colors: [
      { hex: "#0A0C18", name: "Midnight", code: "CHR-6102" },
      { hex: "#1E2240", name: "Indigo Night", code: "CHR-6108" },
      { hex: "#3A4070", name: "Dusk Blue", code: "CHR-6115" },
      { hex: "#6870A8", name: "Lavender Haze", code: "CHR-6122" },
      { hex: "#C0C4E0", name: "Moonlight", code: "CHR-6130" },
      { hex: "#E8D060", name: "Star Yellow", code: "CHR-6138" },
    ]},
];

const SEASONS = ["All", "SS26", "AW26"];
const CATEGORIES = ["All", "Fashion", "Interior", "Lifestyle"];
const TREND_TAGS = ["Quiet Luxury","Post-Digital Craft","Climate Grief","Hyperlocal Artisan","Neo-Baroque","Techno-Pastoral","Decolonial Futures","Slow Fashion"];
const HARMONY_MODES = ["Monochromatic","Analogous","Complementary","Triadic"];

// ─── Shared Components ───────────────────────────────────────────────────────

function ColorChip({ hex, name, code, size = "md", selected, onClick, mini = false }) {
  const [copied, setCopied] = useState(false);
  const sizes = { sm: { chip: 80, label: 32 }, md: { chip: 110, label: 40 }, lg: { chip: 140, label: 48 } };
  const s = sizes[size];

  const handleClick = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1100);
    onClick && onClick();
  };

  if (mini) {
    return (
      <div onClick={handleClick} title={`${name} · ${hex}`} style={{
        display: "flex", flexDirection: "column", cursor: "pointer",
        transition: "transform 0.15s", width: "100%",
      }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "none"}
      >
        <div style={{ backgroundColor: hex, height: "48px", border: "1.5px solid #e8e8e8", borderBottom: "none", position: "relative" }}>
          {copied && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.18)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>}
        </div>
        <div style={{ background: "#fff", border: "1.5px solid #e8e8e8", borderTop: "none", padding: "3px 4px" }}>
          <div style={{ fontSize: "7px", fontWeight: 600, color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'DM Sans', sans-serif" }}>{name}</div>
          <div style={{ fontSize: "6px", fontFamily: "monospace", color: "#aaa" }}>{hex.toUpperCase()}</div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={handleClick} style={{
      display: "flex", flexDirection: "column", cursor: "pointer", userSelect: "none",
      transition: "transform 0.18s cubic-bezier(.34,1.4,.64,1), box-shadow 0.18s",
      transform: selected ? "translateY(-6px)" : "none",
      boxShadow: selected ? "0 12px 32px rgba(0,0,0,0.18)" : "0 2px 8px rgba(0,0,0,0.08)",
      width: "100%",
    }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.14)"; }}}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; }}}
    >
      <div style={{ backgroundColor: hex, height: s.chip, position: "relative", overflow: "hidden", border: selected ? "2px solid #1a1a1a" : "2px solid transparent", borderBottom: "none", transition: "border-color 0.18s" }}>
        {copied && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: getLuminance(hex) < 128 ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={getLuminance(hex) < 128 ? "#fff" : "#000"} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>}
      </div>
      <div style={{ background: "#fff", height: s.label, padding: "5px 7px", borderLeft: selected ? "2px solid #1a1a1a" : "2px solid #e8e8e8", borderRight: selected ? "2px solid #1a1a1a" : "2px solid #e8e8e8", borderBottom: selected ? "2px solid #1a1a1a" : "2px solid #e8e8e8", display: "flex", flexDirection: "column", justifyContent: "center", transition: "border-color 0.18s" }}>
        {name && <div style={{ fontSize: size === "lg" ? 9 : 8, fontWeight: 600, color: "#1a1a1a", letterSpacing: "0.02em", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'DM Sans', sans-serif" }}>{name}</div>}
        <div style={{ fontSize: 7, color: "#888", letterSpacing: "0.06em", fontFamily: "monospace", marginTop: "1px" }}>{code || hex.toUpperCase()}</div>
      </div>
    </div>
  );
}

// ─── TREND BOARD ─────────────────────────────────────────────────────────────

const BOARD_TEXT_STYLES = ["Display", "Headline", "Subhead", "Body", "Caption", "Tag"];
const BOARD_LAYOUTS = ["Free Mix", "Wide Strip", "Chip Grid", "Split Panel"];

function TrendBoard() {
  const [boardTitle, setBoardTitle] = useState("Untitled Board");
  const [season, setBoardSeason] = useState("SS26");
  const [category, setBoardCategory] = useState("Fashion");
  const [boardSwatches, setBoardSwatches] = useState([]);
  const [textBlocks, setTextBlocks] = useState([
    { id: 1, style: "Display", text: "Colour Story" },
    { id: 2, style: "Body", text: "Describe the mood, season, cultural context and trend direction for this palette..." },
  ]);
  const [keywords, setKeywords] = useState(["Texture", "Warmth", "Restraint"]);
  const [kwInput, setKwInput] = useState("");
  const [layout, setLayout] = useState("Free Mix");
  const [pickerHex, setPickerHex] = useState("#6A9DB8");
  const [pickerName, setPickerName] = useState("");
  const [activeSource, setActiveSource] = useState("picker"); // "picker" | collection id
  const [editingText, setEditingText] = useState(null);
  const [boards, setBoards] = useState([]);
  const [savedMsg, setSavedMsg] = useState(false);
  const nextId = useRef(100);

  const addSwatchFromPicker = () => {
    if (boardSwatches.length >= 12) return;
    setBoardSwatches(s => [...s, { hex: pickerHex, name: pickerName || pickerHex.toUpperCase(), code: `CHR-B${(nextId.current++).toString().padStart(3,"0")}` }]);
  };

  const addSwatchFromCollection = (color) => {
    if (boardSwatches.length >= 12) return;
    if (boardSwatches.find(s => s.hex === color.hex)) return;
    setBoardSwatches(s => [...s, { ...color }]);
  };

  const removeSwatchAt = (i) => setBoardSwatches(s => s.filter((_, idx) => idx !== i));

  const addTextBlock = () => {
    setTextBlocks(t => [...t, { id: nextId.current++, style: "Body", text: "New text block..." }]);
  };

  const updateText = (id, field, val) => setTextBlocks(t => t.map(b => b.id === id ? { ...b, [field]: val } : b));
  const removeText = (id) => setTextBlocks(t => t.filter(b => b.id !== id));

  const addKeyword = () => {
    const kw = kwInput.trim();
    if (kw && !keywords.includes(kw)) { setKeywords(k => [...k, kw]); setKwInput(""); }
  };

  const saveBoard = () => {
    setBoards(b => [{ title: boardTitle, season, category, swatches: boardSwatches, texts: textBlocks, keywords, layout, ts: Date.now() }, ...b.slice(0, 5)]);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 1800);
  };

  const TEXT_SIZES = { Display: 28, Headline: 20, Subhead: 15, Body: 13, Caption: 11, Tag: 10 };
  const TEXT_WEIGHTS = { Display: 700, Headline: 700, Subhead: 600, Body: 400, Caption: 400, Tag: 600 };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 240px", minHeight: "calc(100vh - 57px)", animation: "fadeIn 0.25s ease" }}>

      {/* ── LEFT PANEL: Swatch sources ── */}
      <div style={{ background: "#fff", borderRight: "1px solid #efefed", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid #efefed" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", color: "#bbb", marginBottom: "10px" }}>ADD SWATCHES</div>

          {/* Picker */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "#888", marginBottom: "7px" }}>CUSTOM COLOUR</div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "7px" }}>
              <input type="color" value={pickerHex} onChange={e => setPickerHex(e.target.value)}
                style={{ width: "36px", height: "36px", border: "1.5px solid #e0e0e0", cursor: "pointer", padding: "2px", background: "none" }} />
              <div>
                <div style={{ fontSize: "11px", fontWeight: 600, fontFamily: "monospace", color: "#1a1a1a" }}>{pickerHex.toUpperCase()}</div>
                <div style={{ fontSize: "9px", color: "#bbb", fontFamily: "monospace" }}>
                  {(() => { const { h, s, l } = hexToHsl(pickerHex); return `H${h} S${s} L${l}`; })()}
                </div>
              </div>
            </div>
            <input
              type="text" placeholder="Colour name (optional)"
              value={pickerName} onChange={e => setPickerName(e.target.value)}
              style={{ width: "100%", border: "1px solid #e8e8e8", padding: "5px 8px", fontSize: "11px", fontFamily: "'DM Sans', sans-serif", outline: "none", marginBottom: "7px", color: "#1a1a1a" }}
            />
            <button onClick={addSwatchFromPicker} disabled={boardSwatches.length >= 12}
              style={{ width: "100%", padding: "7px 0", background: "#1a1a1a", color: "#fff", border: "none", cursor: "pointer", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", fontFamily: "'DM Sans', sans-serif", opacity: boardSwatches.length >= 12 ? 0.4 : 1 }}>
              + ADD TO BOARD
            </button>
          </div>
        </div>

        {/* From collections */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ padding: "12px 18px 8px" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "#888", marginBottom: "10px" }}>FROM COLLECTIONS</div>
          </div>
          {COLLECTIONS.map(coll => (
            <div key={coll.id}>
              <div style={{ padding: "8px 18px", borderTop: "1px solid #f5f5f5", background: "#fafafa" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#555", letterSpacing: "0.05em" }}>{coll.name}</div>
                <div style={{ fontSize: "9px", color: "#bbb", letterSpacing: "0.08em" }}>{coll.season} · {coll.category}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "3px", padding: "6px 18px 10px" }}>
                {coll.colors.map((c, i) => (
                  <div key={i} onClick={() => addSwatchFromCollection(c)} title={`Add ${c.name}`}
                    style={{ height: "28px", backgroundColor: c.hex, cursor: "pointer", border: "1.5px solid transparent", transition: "border-color 0.15s, transform 0.15s",
                      borderColor: boardSwatches.find(s => s.hex === c.hex) ? "#1a1a1a" : "transparent" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.12)"; e.currentTarget.style.borderColor = "#1a1a1a"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = boardSwatches.find(s => s.hex === c.hex) ? "#1a1a1a" : "transparent"; }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CENTER: Board Canvas ── */}
      <div style={{ background: "#F7F7F5", overflowY: "auto" }}>

        {/* Board header */}
        <div style={{ background: "#fff", borderBottom: "1px solid #efefed", padding: "16px 24px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <input
            type="text" value={boardTitle} onChange={e => setBoardTitle(e.target.value)}
            style={{ fontSize: "18px", fontWeight: 700, border: "none", outline: "none", color: "#1a1a1a", fontFamily: "'DM Sans', sans-serif", background: "transparent", flex: 1, minWidth: "180px" }}
          />
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <select value={season} onChange={e => setBoardSeason(e.target.value)}
              style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", border: "1px solid #e0e0e0", padding: "4px 8px", fontFamily: "'DM Sans', sans-serif", color: "#555", background: "#fff", outline: "none", cursor: "pointer" }}>
              {["SS26","AW26","SS27","AW27"].map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={category} onChange={e => setBoardCategory(e.target.value)}
              style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", border: "1px solid #e0e0e0", padding: "4px 8px", fontFamily: "'DM Sans', sans-serif", color: "#555", background: "#fff", outline: "none", cursor: "pointer" }}>
              {["Fashion","Interior","Lifestyle","Beauty","Sport"].map(c => <option key={c}>{c}</option>)}
            </select>
            {/* Layout toggle */}
            <div style={{ display: "flex", gap: "2px" }}>
              {BOARD_LAYOUTS.map(l => (
                <button key={l} onClick={() => setLayout(l)}
                  style={{ padding: "4px 8px", fontSize: "9px", fontWeight: 600, letterSpacing: "0.08em", fontFamily: "'DM Sans', sans-serif", border: "1px solid #e0e0e0", background: layout === l ? "#1a1a1a" : "#fff", color: layout === l ? "#fff" : "#888", cursor: "pointer", transition: "all 0.15s" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: "24px" }}>

          {/* ── Swatch area based on layout ── */}
          {boardSwatches.length === 0 ? (
            <div style={{ background: "#fff", border: "2px dashed #e0e0e0", borderRadius: "2px", height: "160px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", color: "#ccc", textTransform: "uppercase" }}>No swatches added yet</div>
                <div style={{ fontSize: "12px", color: "#ddd", marginTop: "5px" }}>Pick colours from the left panel</div>
              </div>
            </div>
          ) : layout === "Wide Strip" ? (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", height: "120px", gap: "2px", marginBottom: "4px" }}>
                {boardSwatches.map((s, i) => (
                  <div key={i} style={{ flex: 1, backgroundColor: s.hex, position: "relative", cursor: "pointer", transition: "flex 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.flex = "1.4"}
                    onMouseLeave={e => e.currentTarget.style.flex = "1"}
                  >
                    <button onClick={() => removeSwatchAt(i)}
                      style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, border: "none", borderRadius: "50%", background: "rgba(0,0,0,0.3)", color: "#fff", fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0"}
                    >✕</button>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "2px" }}>
                {boardSwatches.map((s, i) => (
                  <div key={i} style={{ flex: 1, background: "#fff", border: "1px solid #efefed", padding: "4px 5px" }}>
                    <div style={{ fontSize: "8px", fontWeight: 600, color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'DM Sans', sans-serif" }}>{s.name}</div>
                    <div style={{ fontSize: "7px", fontFamily: "monospace", color: "#aaa" }}>{s.hex.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : layout === "Chip Grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "10px", marginBottom: "20px" }}>
              {boardSwatches.map((s, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <ColorChip hex={s.hex} name={s.name} code={s.code} size="md" />
                  <button onClick={() => removeSwatchAt(i)}
                    style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, border: "1.5px solid #e0e0e0", borderRadius: "50%", background: "#fff", color: "#888", fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : layout === "Split Panel" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px", marginBottom: "20px", height: "200px" }}>
              {boardSwatches.slice(0, 6).map((s, i) => (
                <div key={i} style={{ backgroundColor: s.hex, position: "relative", display: "flex", alignItems: "flex-end", padding: "8px" }}>
                  <div style={{ fontSize: "9px", color: getLuminance(s.hex) < 130 ? "#fff" : "#000", opacity: 0.75, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{s.name}</div>
                  <button onClick={() => removeSwatchAt(i)}
                    style={{ position: "absolute", top: 6, right: 6, width: 16, height: 16, border: "none", borderRadius: "50%", background: "rgba(0,0,0,0.25)", color: "#fff", fontSize: 9, cursor: "pointer" }}>✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Free Mix — default */
            <div style={{ background: "#fff", border: "1px solid #efefed", padding: "20px", marginBottom: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: "8px" }}>
                {boardSwatches.map((s, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <ColorChip hex={s.hex} name={s.name} code={s.code} size="sm" />
                    <button onClick={() => removeSwatchAt(i)}
                      style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, border: "1.5px solid #e0e0e0", borderRadius: "50%", background: "#fff", color: "#888", fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              {boardSwatches.length > 0 && (
                <div style={{ height: "5px", background: `linear-gradient(to right, ${boardSwatches.map(s => s.hex).join(", ")})`, marginTop: "16px" }} />
              )}
            </div>
          )}

          {/* ── Keywords ── */}
          <div style={{ background: "#fff", border: "1px solid #efefed", padding: "16px 18px", marginBottom: "16px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", color: "#bbb", marginBottom: "10px" }}>KEYWORDS</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
              {keywords.map((kw, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px", background: "#f5f5f3", border: "1px solid #e8e8e6", padding: "4px 10px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#1a1a1a", letterSpacing: "0.05em", fontFamily: "'DM Sans', sans-serif" }}>{kw}</span>
                  <button onClick={() => setKeywords(k => k.filter((_, j) => j !== i))}
                    style={{ border: "none", background: "none", cursor: "pointer", color: "#bbb", fontSize: 10, lineHeight: 1, padding: 0 }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <input type="text" value={kwInput} onChange={e => setKwInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addKeyword()}
                placeholder="Add keyword…"
                style={{ flex: 1, border: "1px solid #e0e0e0", padding: "5px 9px", fontSize: "11px", fontFamily: "'DM Sans', sans-serif", outline: "none", color: "#1a1a1a" }} />
              <button onClick={addKeyword}
                style={{ padding: "5px 12px", background: "#1a1a1a", color: "#fff", border: "none", cursor: "pointer", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", fontFamily: "'DM Sans', sans-serif" }}>ADD</button>
            </div>
          </div>

          {/* ── Text blocks ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
            {textBlocks.map((block) => (
              <div key={block.id} style={{ background: "#fff", border: "1px solid #efefed", padding: "14px 16px", position: "relative" }}>
                <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "10px" }}>
                  <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", color: "#bbb" }}>STYLE</div>
                  <div style={{ display: "flex", gap: "3px" }}>
                    {BOARD_TEXT_STYLES.map(st => (
                      <button key={st} onClick={() => updateText(block.id, "style", st)}
                        style={{ padding: "2px 7px", fontSize: "9px", fontWeight: 600, border: "1px solid #e0e0e0", background: block.style === st ? "#1a1a1a" : "#fff", color: block.style === st ? "#fff" : "#888", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.06em", transition: "all 0.12s" }}>
                        {st}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => removeText(block.id)}
                    style={{ marginLeft: "auto", border: "none", background: "none", cursor: "pointer", color: "#ccc", fontSize: 12, padding: "0 2px" }}>✕</button>
                </div>
                <textarea
                  value={block.text}
                  onChange={e => updateText(block.id, "text", e.target.value)}
                  rows={block.style === "Display" ? 2 : block.style === "Headline" ? 2 : 3}
                  style={{
                    width: "100%", border: "none", outline: "none", resize: "none", background: "transparent",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: TEXT_SIZES[block.style] + "px",
                    fontWeight: TEXT_WEIGHTS[block.style],
                    color: "#1a1a1a", lineHeight: 1.4,
                    letterSpacing: block.style === "Display" ? "-0.01em" : block.style === "Tag" ? "0.12em" : "0",
                    textTransform: block.style === "Tag" ? "uppercase" : "none",
                  }}
                />
              </div>
            ))}
          </div>

          <button onClick={addTextBlock}
            style={{ width: "100%", padding: "10px 0", border: "1.5px dashed #d8d8d8", background: "transparent", cursor: "pointer", fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", color: "#bbb", fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.15s, color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.color = "#1a1a1a"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#d8d8d8"; e.currentTarget.style.color = "#bbb"; }}
          >
            + ADD TEXT BLOCK
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL: Board meta + preview ── */}
      <div style={{ background: "#fff", borderLeft: "1px solid #efefed", padding: "20px 18px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>

        {/* Board summary */}
        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", color: "#bbb", marginBottom: "10px" }}>BOARD SUMMARY</div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1a1a", marginBottom: "4px" }}>{boardTitle || "Untitled"}</div>
          <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#aaa", letterSpacing: "0.06em", marginBottom: "10px" }}>{season} · {category}</div>

          {/* Mini swatch strip */}
          {boardSwatches.length > 0 && (
            <div style={{ display: "flex", gap: "2px", marginBottom: "8px" }}>
              {boardSwatches.map((s, i) => (
                <div key={i} style={{ flex: 1, height: "28px", backgroundColor: s.hex, border: "1px solid #efefed" }} title={s.name} />
              ))}
            </div>
          )}
          <div style={{ fontSize: "11px", color: "#888" }}>{boardSwatches.length} swatch{boardSwatches.length !== 1 ? "es" : ""} · {textBlocks.length} text block{textBlocks.length !== 1 ? "s" : ""}</div>
        </div>

        <div style={{ height: "1px", background: "#efefed" }} />

        {/* Colour breakdown */}
        {boardSwatches.length > 0 && (
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", color: "#bbb", marginBottom: "10px" }}>COLOUR BREAKDOWN</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {boardSwatches.map((s, i) => {
                const rgb = hexToRgb(s.hex);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "24px", height: "24px", backgroundColor: s.hex, border: "1px solid #efefed", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "#1a1a1a", lineHeight: 1.2 }}>{s.name}</div>
                      <div style={{ fontSize: "9px", fontFamily: "monospace", color: "#bbb" }}>{s.hex.toUpperCase()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {boardSwatches.length > 0 && <div style={{ height: "1px", background: "#efefed" }} />}

        {/* Saved boards mini-list */}
        {boards.length > 0 && (
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", color: "#bbb", marginBottom: "8px" }}>RECENT BOARDS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {boards.map((b, i) => (
                <div key={i} style={{ border: "1px solid #efefed", overflow: "hidden" }}>
                  <div style={{ display: "flex", height: "18px" }}>
                    {b.swatches.map((s, j) => <div key={j} style={{ flex: 1, backgroundColor: s.hex }} />)}
                  </div>
                  <div style={{ padding: "5px 7px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "#1a1a1a" }}>{b.title}</div>
                    <div style={{ fontSize: "9px", color: "#bbb" }}>{b.season} · {b.swatches.length} colours</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: "auto" }}>
          <button onClick={saveBoard}
            style={{ width: "100%", padding: "12px 0", background: savedMsg ? "#2a6a3a" : "#1a1a1a", color: "#fff", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s" }}>
            {savedMsg ? "✓  BOARD SAVED" : "SAVE BOARD"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ color }) {
  if (!color) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "8px", opacity: 0.3 }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>
      <div style={{ fontSize: "11px", letterSpacing: "0.1em", fontFamily: "'DM Sans', sans-serif", color: "#1a1a1a" }}>SELECT A CHIP</div>
    </div>
  );
  const rgb = hexToRgb(color.hex);
  const hsl = hexToHsl(color.hex);
  const cmyk = rgbToCmyk(rgb);
  return (
    <div style={{ animation: "fadeIn 0.2s ease" }}>
      <div style={{ height: "120px", backgroundColor: color.hex, border: "1px solid #e8e8e8", borderBottom: "none" }} />
      <div style={{ background: "#fff", border: "1px solid #e8e8e8", padding: "16px", marginBottom: "16px" }}>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a", marginBottom: "2px", fontFamily: "'DM Sans', sans-serif" }}>{color.name}</div>
        <div style={{ fontSize: "11px", color: "#888", letterSpacing: "0.08em", fontFamily: "monospace" }}>{color.code}</div>
      </div>
      <div style={{ background: "#fff", border: "1px solid #e8e8e8", padding: "14px" }}>
        {[["HEX", color.hex.toUpperCase()], ["RGB", `${rgb.r}, ${rgb.g}, ${rgb.b}`], ["HSL", `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`], ["CMYK", `${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k}`]].map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", color: "#aaa", fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
            <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#1a1a1a", fontWeight: 500 }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function Chroma() {
  const [tab, setTab] = useState("collections");
  const [selectedCollection, setSelectedCollection] = useState(0);
  const [selectedChip, setSelectedChip] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [customColor, setCustomColor] = useState("#3D6E8A");
  const [harmonyMode, setHarmonyMode] = useState("Monochromatic");
  const [activeTrend, setActiveTrend] = useState(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState([]);
  const [justSaved, setJustSaved] = useState(false);

  const filteredCollections = COLLECTIONS.filter(c =>
    (seasonFilter === "All" || c.season === seasonFilter) &&
    (categoryFilter === "All" || c.category === categoryFilter)
  );
  const collection = COLLECTIONS[selectedCollection];
  const harmonies = generateHarmonies(customColor);
  const currentHarmony = harmonies[harmonyMode];
  const selectedColor = tab === "collections" && selectedChip !== null ? collection.colors[selectedChip] : null;

  const savePalette = () => {
    const p = tab === "collections"
      ? { name: collection.name, id: collection.id, colors: collection.colors, trend: activeTrend !== null ? TREND_TAGS[activeTrend] : null, note }
      : { name: `Custom · ${harmonyMode}`, id: `CUSTOM-${Date.now()}`, colors: currentHarmony.map((hex, i) => ({ hex, name: hex, code: `CHR-C${i+1}00` })), trend: activeTrend !== null ? TREND_TAGS[activeTrend] : null, note };
    setSaved(p => [p, ...p.slice(0, 11)]);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  };

  const TABS = [
    { id: "collections", label: "Collections" },
    { id: "build", label: "Build" },
    { id: "trendboard", label: "Trend Board" },
    { id: "saved", label: `Saved (${saved.length})` },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F7F5", minHeight: "100vh", color: "#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .tab { background: none; border: none; cursor: pointer; padding: 14px 20px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #aaa; transition: color 0.2s; border-bottom: 2px solid transparent; }
        .tab.on { color: #1a1a1a; border-bottom-color: #1a1a1a; }
        .tab:hover:not(.on) { color: #555; }
        .tab.trendboard-tab.on { color: #1a1a1a; border-bottom-color: #1a1a1a; }
        .filter-btn { background: #fff; border: 1px solid #e0e0e0; cursor: pointer; padding: 5px 12px; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #888; transition: all 0.15s; }
        .filter-btn.on { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
        .filter-btn:hover:not(.on) { border-color: #aaa; color: #444; }
        .coll-row { padding: 14px 20px; border-bottom: 1px solid #efefed; cursor: pointer; transition: background 0.15s; display: flex; align-items: center; gap: 14px; }
        .coll-row:hover { background: #f0f0ee; }
        .coll-row.on { background: #fff; border-left: 3px solid #1a1a1a; }
        .coll-row:not(.on) { border-left: 3px solid transparent; }
        .harmony-btn { background: #fff; border: 1px solid #e0e0e0; cursor: pointer; padding: 6px 14px; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #888; transition: all 0.15s; }
        .harmony-btn.on { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
        .harmony-btn:hover:not(.on) { border-color: #999; color: #444; }
        .trend-chip { background: #fff; border: 1px solid #e0e0e0; cursor: pointer; padding: 4px 10px; font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.06em; color: #888; transition: all 0.15s; text-transform: uppercase; }
        .trend-chip.on { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
        .trend-chip:hover:not(.on) { border-color: #999; color: #444; }
        .save-btn { border: 1.5px solid #1a1a1a; cursor: pointer; padding: 12px 0; width: 100%; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; transition: all 0.15s; background: #1a1a1a; color: #fff; }
        .save-btn:hover { background: #333; }
        .save-btn.done { background: #2a6a3a; border-color: #2a6a3a; color: #fff; }
        textarea { background: #fff; border: 1px solid #e0e0e0; color: #1a1a1a; font-family: 'DM Sans', sans-serif; font-size: 13px; line-height: 1.6; padding: 12px 14px; width: 100%; resize: none; outline: none; transition: border-color 0.2s; }
        textarea:focus { border-color: #1a1a1a; }
        textarea::placeholder { color: #ccc; }
        input[type="color"] { -webkit-appearance: none; border: 1.5px solid #e0e0e0; width: 44px; height: 44px; cursor: pointer; padding: 2px; background: none; transition: border-color 0.2s; }
        input[type="color"]:hover { border-color: #1a1a1a; }
        input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        input[type="color"]::-webkit-color-swatch { border: none; }
        .section-head { font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #bbb; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #efefed; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #ddd; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #efefed", padding: "0 32px", display: "flex", alignItems: "stretch", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "16px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", gap: "3px" }}>
              {["#E87820","#3D6E8A","#7A9070","#C84820","#3A4070"].map((c, i) => (
                <div key={i} style={{ width: "6px", height: "24px", backgroundColor: c }} />
              ))}
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "0.12em", lineHeight: 1, color: "#1a1a1a" }}>CHROMA</div>
              <div style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.22em", color: "#bbb", marginTop: "1px" }}>COLOUR INTELLIGENCE</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "stretch" }}>
          {TABS.map(({ id, label }) => (
            <button key={id} className={`tab ${tab === id ? "on" : ""}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", padding: "0" }}>
          <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", color: "#bbb" }}>SS · AW 2026</div>
        </div>
      </div>

      {/* ── COLLECTIONS ── */}
      {tab === "collections" && (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 200px", minHeight: "calc(100vh - 57px)", animation: "fadeIn 0.25s ease" }}>
          <div style={{ background: "#fff", borderRight: "1px solid #efefed", overflowY: "auto" }}>
            <div style={{ padding: "14px 20px 10px", borderBottom: "1px solid #efefed" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", color: "#bbb", marginBottom: "8px" }}>SEASON</div>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "10px" }}>
                {SEASONS.map(s => <button key={s} className={`filter-btn ${seasonFilter === s ? "on" : ""}`} onClick={() => setSeasonFilter(s)}>{s}</button>)}
              </div>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", color: "#bbb", marginBottom: "8px" }}>CATEGORY</div>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {CATEGORIES.map(c => <button key={c} className={`filter-btn ${categoryFilter === c ? "on" : ""}`} onClick={() => setCategoryFilter(c)}>{c}</button>)}
              </div>
            </div>
            {filteredCollections.length === 0 ? (
              <div style={{ padding: "24px 20px", fontSize: "12px", color: "#ccc", textAlign: "center" }}>No collections match</div>
            ) : filteredCollections.map(coll => {
              const realIdx = COLLECTIONS.indexOf(coll);
              return (
                <div key={coll.id} className={`coll-row ${selectedCollection === realIdx ? "on" : ""}`} onClick={() => { setSelectedCollection(realIdx); setSelectedChip(null); }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "2px", width: "48px", flexShrink: 0 }}>
                    {coll.colors.map((c, j) => <div key={j} style={{ backgroundColor: c.hex, height: "16px" }} />)}
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#1a1a1a", lineHeight: 1.2 }}>{coll.name}</div>
                    <div style={{ fontSize: "10px", color: "#bbb", letterSpacing: "0.06em", marginTop: "2px" }}>{coll.season} · {coll.category}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: "28px 32px" }}>
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "6px" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "0.02em", color: "#1a1a1a" }}>{collection.name}</h2>
                <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", color: "#bbb" }}>{collection.season} · {collection.category}</div>
              </div>
              <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", color: "#ccc" }}>{collection.id}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px", marginBottom: "28px" }}>
              {collection.colors.map((color, i) => (
                <ColorChip key={i} hex={color.hex} name={color.name} code={color.code} size="lg" selected={selectedChip === i} onClick={() => setSelectedChip(selectedChip === i ? null : i)} />
              ))}
            </div>
            <div style={{ height: "6px", background: `linear-gradient(to right, ${collection.colors.map(c => c.hex).join(", ")})`, marginBottom: "20px" }} />
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {collection.colors.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "10px", height: "10px", backgroundColor: c.hex, border: "1px solid #e0e0e0", flexShrink: 0 }} />
                  <div style={{ fontSize: "10px", fontFamily: "'DM Mono', monospace", color: "#999", letterSpacing: "0.05em" }}>{c.code}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", borderLeft: "1px solid #efefed", padding: "20px 18px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <DetailPanel color={selectedColor} />
            {selectedColor && (
              <>
                <div className="section-head">Trend Tag</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "4px" }}>
                  {TREND_TAGS.map((t, i) => (
                    <button key={i} className={`trend-chip ${activeTrend === i ? "on" : ""}`} onClick={() => setActiveTrend(activeTrend === i ? null : i)}>{t}</button>
                  ))}
                </div>
              </>
            )}
            <div>
              <div className="section-head">Notes</div>
              <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Add context, observations, references..." />
            </div>
            <button className={`save-btn ${justSaved ? "done" : ""}`} onClick={savePalette}>{justSaved ? "✓  Saved" : "Save Collection"}</button>
          </div>
        </div>
      )}

      {/* ── BUILD ── */}
      {tab === "build" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", minHeight: "calc(100vh - 57px)", animation: "fadeIn 0.25s ease" }}>
          <div style={{ padding: "28px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid #efefed" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input type="color" value={customColor} onChange={e => setCustomColor(e.target.value)} />
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "0.04em", lineHeight: 1.2 }}>{customColor.toUpperCase()}</div>
                  {(() => { const { h, s, l } = hexToHsl(customColor); return <div style={{ fontSize: "11px", fontFamily: "'DM Mono', monospace", color: "#999", marginTop: "3px" }}>HSL {h}° {s}% {l}%</div>; })()}
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
                {HARMONY_MODES.map(m => (
                  <button key={m} className={`harmony-btn ${harmonyMode === m ? "on" : ""}`} onClick={() => setHarmonyMode(m)}>{m}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "24px" }}>
              {currentHarmony.map((hex, i) => (
                <ColorChip key={`${hex}-${i}`} hex={hex} name={`${harmonyMode.slice(0,4).toUpperCase()}-${(i+1).toString().padStart(2,"0")}`} code={`CHR-C${(i+1).toString().padStart(3,"0")}`} size="lg" />
              ))}
            </div>
            <div style={{ height: "6px", background: `linear-gradient(to right, ${currentHarmony.join(", ")})`, marginBottom: "16px" }} />
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {currentHarmony.map((hex, i) => {
                const rgb = hexToRgb(hex); const cmyk = rgbToCmyk(rgb);
                return (
                  <div key={i} style={{ background: "#fff", border: "1px solid #efefed", padding: "8px 10px", minWidth: "80px" }}>
                    <div style={{ width: "100%", height: "20px", backgroundColor: hex, marginBottom: "6px" }} />
                    <div style={{ fontSize: "9px", fontFamily: "'DM Mono', monospace", color: "#999", lineHeight: 1.6 }}>
                      <div>{hex.toUpperCase()}</div>
                      <div>RGB {rgb.r} {rgb.g} {rgb.b}</div>
                      <div>CMYK {cmyk.c} {cmyk.m} {cmyk.y} {cmyk.k}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ background: "#fff", borderLeft: "1px solid #efefed", padding: "20px 18px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="section-head">Trend Tag</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {TREND_TAGS.map((t, i) => (
                <button key={i} className={`trend-chip ${activeTrend === i ? "on" : ""}`} onClick={() => setActiveTrend(activeTrend === i ? null : i)}>{t}</button>
              ))}
            </div>
            {activeTrend !== null && (
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#1a1a1a", letterSpacing: "0.05em", paddingLeft: "8px", borderLeft: "2px solid #1a1a1a" }}>{TREND_TAGS[activeTrend]}</div>
            )}
            <div className="section-head" style={{ marginTop: "4px" }}>Notes</div>
            <textarea rows={4} value={note} onChange={e => setNote(e.target.value)} placeholder="Add context, observations, references..." />
            <button className={`save-btn ${justSaved ? "done" : ""}`} onClick={savePalette}>{justSaved ? "✓  Saved" : "Save Palette"}</button>
          </div>
        </div>
      )}

      {/* ── TREND BOARD ── */}
      {tab === "trendboard" && <TrendBoard />}

      {/* ── SAVED ── */}
      {tab === "saved" && (
        <div style={{ padding: "28px 32px", animation: "fadeIn 0.25s ease" }}>
          {saved.length === 0 ? (
            <div style={{ textAlign: "center", padding: "100px 0" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", color: "#ccc", textTransform: "uppercase" }}>No saved palettes yet</div>
              <div style={{ fontSize: "13px", color: "#ddd", marginTop: "8px" }}>Browse collections or build a custom palette to save here.</div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #efefed" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "0.04em" }}>Saved Palettes</h2>
                <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", color: "#bbb" }}>{saved.length} {saved.length === 1 ? "palette" : "palettes"}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                {saved.map((p, pi) => (
                  <div key={pi} style={{ background: "#fff", border: "1px solid #efefed" }}>
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${p.colors.length}, 1fr)`, height: "80px" }}>
                      {p.colors.map((c, ci) => (
                        <div key={ci} style={{ display: "flex", flexDirection: "column" }}>
                          <div style={{ flex: 1, backgroundColor: c.hex }} />
                          <div style={{ height: "22px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", borderRight: ci < p.colors.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                            <div style={{ fontSize: "7px", fontFamily: "'DM Mono', monospace", color: "#ccc", letterSpacing: "0.04em" }}>{c.hex?.toUpperCase().slice(1)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: "14px 16px", borderTop: "1px solid #efefed" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a" }}>{p.name}</div>
                        <div style={{ fontSize: "9px", fontFamily: "'DM Mono', monospace", color: "#bbb", letterSpacing: "0.08em" }}>{p.id}</div>
                      </div>
                      {p.trend && <div style={{ display: "inline-block", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", color: "#fff", background: "#1a1a1a", padding: "2px 8px", marginBottom: "6px", textTransform: "uppercase" }}>{p.trend}</div>}
                      {p.note && <div style={{ fontSize: "12px", color: "#888", lineHeight: 1.55 }}>{p.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
