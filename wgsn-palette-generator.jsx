import { useState, useEffect, useRef } from "react";

// Van Gogh's palette pulled from his major works
const VG_WORKS = [
  { title: "The Starry Night", year: "1889", hex: "#1B3A6B" },
  { title: "Sunflowers", year: "1888", hex: "#E8B84B" },
  { title: "Café Terrace at Night", year: "1888", hex: "#2C4A7C" },
  { title: "Wheat Field with Crows", year: "1890", hex: "#4A7C2C" },
  { title: "The Bedroom", year: "1888", hex: "#7BAFD4" },
];

const INSPIRATIONS = [
  {
    city: "TOKYO", season: "Printemps", mood: "Wabi-sabi Bloom",
    brushwork: "Delicate, feathered strokes — the ephemeral",
    description: "Cherry blossom fog. Aged cedar. Silent markets at dawn. The beauty in imperfection.",
    painting: "After the Japanese woodblock prints that enchanted Vincent",
    palettes: [
      { hex: "#E8D5C4", name: "Kinari Silk" },
      { hex: "#C4A882", name: "Warm Tatami" },
      { hex: "#8B6F5E", name: "Aged Cedar" },
      { hex: "#D4B8A0", name: "Sakura Fog" },
      { hex: "#6B4F3A", name: "Sumi Ink" },
      { hex: "#F2E8DC", name: "Washi Paper" },
    ],
  },
  {
    city: "ARLES", season: "Été", mood: "Provençal Heat",
    brushwork: "Thick impasto, furious yellows, the southern sun",
    description: "The very light Vincent moved south to find. Sunflower fields. Cicadas. Canvas drying in minutes.",
    painting: "Drawn directly from Sunflowers & The Yellow House",
    palettes: [
      { hex: "#E8C84A", name: "Chrome Yellow" },
      { hex: "#D4A020", name: "Raw Sienna" },
      { hex: "#8B6010", name: "Burnt Umber" },
      { hex: "#F0E080", name: "Cadmium Light" },
      { hex: "#C87820", name: "Ochre Deep" },
      { hex: "#F8F0D0", name: "Linen Canvas" },
    ],
  },
  {
    city: "PARIS", season: "Automne", mood: "Montmartre Dusk",
    brushwork: "Pointillist dots merging into impressionist haze",
    description: "Zinc rooftops, mist on the Seine, the blue hour between café lights and street lamps.",
    painting: "Paris rooftops and the café terrace at night",
    palettes: [
      { hex: "#1B3A6B", name: "Prussian Blue" },
      { hex: "#4A6EA8", name: "Cobalt Veil" },
      { hex: "#8BA8D4", name: "Cerulean Haze" },
      { hex: "#C8D8F0", name: "Moonlit Plaster" },
      { hex: "#2C2040", name: "Violet Night" },
      { hex: "#E8D890", name: "Gaslight Gold" },
    ],
  },
  {
    city: "NUENEN", season: "Hiver", mood: "Potato Eaters Dark",
    brushwork: "Earthy, dense, almost muddy — humanity in shadow",
    description: "Dark interiors. Peasant hands. Tallow candles. The honesty of labour and soil.",
    painting: "Directly from The Potato Eaters, 1885",
    palettes: [
      { hex: "#2A1A0A", name: "Peat Earth" },
      { hex: "#5C3A18", name: "Raw Umber" },
      { hex: "#8B5E30", name: "Warm Ochre" },
      { hex: "#C4945A", name: "Tallow Light" },
      { hex: "#3A2A10", name: "Tobacco Dark" },
      { hex: "#D4B880", name: "Candlelit Linen" },
    ],
  },
  {
    city: "SAINT-RÉMY", season: "Printemps", mood: "Starry Night",
    brushwork: "Swirling vortices — emotion made visible in every stroke",
    description: "The asylum garden at night. Stars that burn like suns. Cypress reaching into infinity.",
    painting: "The Starry Night, June 1889 — his masterwork",
    palettes: [
      { hex: "#1B3A6B", name: "Night Sky" },
      { hex: "#2C5A9A", name: "Swirling Cobalt" },
      { hex: "#E8D84A", name: "Crescent Yellow" },
      { hex: "#FFFFFF", name: "Star White" },
      { hex: "#0A1428", name: "Infinite Dark" },
      { hex: "#4A8AC8", name: "Rolling Wave" },
    ],
  },
  {
    city: "AUVERS", season: "Été", mood: "Wheat Fields & Crows",
    brushwork: "Urgent, chaotic — painted in the last 70 days",
    description: "Golden wheat against a churning sky. Crows rising. The world at its most alive and most ominous.",
    painting: "Wheatfield with Crows, July 1890",
    palettes: [
      { hex: "#C8A020", name: "Ripe Wheat" },
      { hex: "#4A7C2C", name: "Verdigris Field" },
      { hex: "#1A2840", name: "Storm Indigo" },
      { hex: "#E8C040", name: "Harvest Gold" },
      { hex: "#2C3A18", name: "Deep Grass" },
      { hex: "#8090B8", name: "Turbulent Sky" },
    ],
  },
  {
    city: "MUMBAI", season: "Mousson", mood: "Chromatic Abundance",
    brushwork: "Vibrant complementaries — Vincent would have wept with joy",
    description: "Marigold garlands. Sindoor red. Bougainvillea on wet walls. Spice stalls in the rain.",
    painting: "Through the lens of his studies of colour theory",
    palettes: [
      { hex: "#C8304A", name: "Sindoor" },
      { hex: "#E87820", name: "Marigold Market" },
      { hex: "#6A3C8C", name: "Bougainvillea" },
      { hex: "#1A4A2C", name: "Wet Banyan" },
      { hex: "#F0D840", name: "Haldi Spice" },
      { hex: "#8C1A30", name: "Gulabi Rose" },
    ],
  },
];

const TREND_DIRECTIONS = [
  "Quiet Luxury", "Post-Digital Craft", "Climate Grief",
  "Hyperlocal Artisan", "Neo-Baroque", "Techno-Pastoral",
  "Decolonial Futures", "Slow Fashion",
];

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
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
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
function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s));
  l = Math.max(0, Math.min(100, l));
  const a = s * Math.min(l, 100 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
function generateHarmonies(hex) {
  const { h, s, l } = hexToHsl(hex);
  return {
    "Tints": [hslToHex(h,s,Math.min(93,l+30)), hslToHex(h,s,Math.min(93,l+15)), hex, hslToHex(h,s,Math.max(7,l-15)), hslToHex(h,s,Math.max(7,l-30))],
    "Analogous": [hslToHex(h-30,s,l), hslToHex(h-15,s,l), hex, hslToHex(h+15,s,l), hslToHex(h+30,s,l)],
    "Complementary": [hex, hslToHex(h+150,s,l), hslToHex(h+180,s,l), hslToHex(h+210,s,l), hslToHex(h+180,Math.max(10,s-20),Math.min(90,l+20))],
    "Triadic": [hex, hslToHex(h+60,s,l), hslToHex(h+120,s,l), hslToHex(h+180,s,l), hslToHex(h+240,s,l)],
  };
}

// Swirling SVG brushstroke border paths
const SWIRL_PATHS = [
  "M10,50 C20,20 80,80 90,50 C80,20 20,80 10,50",
  "M5,50 Q25,10 50,50 Q75,90 95,50",
  "M10,30 C30,10 70,90 90,70 C70,50 30,50 10,30",
];

function BrushBorder({ color = "#1B3A6B", opacity = 0.15 }) {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }} preserveAspectRatio="none">
      <defs>
        <filter id="rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <rect x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)"
        fill="none" stroke={color} strokeWidth="3.5"
        filter="url(#rough)" opacity={opacity}
        strokeDasharray="8 3" strokeLinecap="round"
      />
    </svg>
  );
}

function SwatchCard({ hex, name, tall = false }) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const lum = getLuminance(hex);
  const textCol = lum > 130 ? "#1a0f00" : "#fdf8ee";

  const copy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  };

  return (
    <div
      onClick={copy}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        backgroundColor: hex,
        height: tall ? "120px" : "80px",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        padding: "10px 10px 8px",
        cursor: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a1 1 0 0 0-1.41 0L9 12.25 11.75 15l8.96-8.96a1 1 0 0 0 0-1.41z'/%3E%3C/svg%3E\") 0 24, crosshair",
        transition: "transform 0.2s cubic-bezier(.34,1.56,.64,1)",
        transform: hovered ? "translateY(-4px) rotate(-1deg)" : "none",
        filter: hovered ? "brightness(1.08)" : "none",
        overflow: "hidden",
      }}
    >
      {/* Canvas texture overlay */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.08,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        backgroundSize: "120px 120px",
        pointerEvents: "none",
      }} />
      {/* Brushstroke border on hover */}
      {hovered && (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <rect x="3" y="3" width="calc(100%-6px)" height="calc(100%-6px)" fill="none"
            stroke={textCol} strokeWidth="2" opacity="0.4" strokeDasharray="6 3" strokeLinecap="round"
          />
        </svg>
      )}
      {name && <div style={{ fontSize: "9px", fontFamily: "'Crimson Pro', Georgia, serif", fontWeight: 600, color: textCol, letterSpacing: "0.05em", lineHeight: 1.2, position: "relative", zIndex: 1 }}>{name}</div>}
      <div style={{ fontSize: "8px", fontFamily: "monospace", color: textCol, opacity: 0.6, marginTop: "1px", position: "relative", zIndex: 1 }}>{hex.toUpperCase()}</div>
      {copied && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", zIndex: 2 }}>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "16px", color: "#F8E84A", transform: "rotate(-3deg)", fontWeight: 700 }}>Copied ✓</div>
        </div>
      )}
    </div>
  );
}

// Animated swirling stars background (CSS-only circles)
function StarField() {
  const stars = Array.from({ length: 18 }, (_, i) => ({
    cx: 10 + (i * 37 % 80), cy: 10 + (i * 23 % 80),
    r: 1 + (i % 4) * 0.8,
    delay: (i * 0.4) % 3,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", opacity: 0.3 }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {stars.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#F8E84A"
            style={{ animation: `pulse ${1.5 + s.delay}s ease-in-out infinite`, animationDelay: `${s.delay}s` }}
          />
        ))}
      </svg>
    </div>
  );
}

export default function VanGoghWGSN() {
  const [tab, setTab] = useState("studies");
  const [cityIdx, setCityIdx] = useState(4); // Start on Starry Night
  const [customColor, setCustomColor] = useState("#1B3A6B");
  const [harmonyMode, setHarmonyMode] = useState("Analogous");
  const [activeTrend, setActiveTrend] = useState(0);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState([]);
  const [justSaved, setJustSaved] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);

  const quotes = [
    '"I dream of painting and then I paint my dream." — Vincent',
    '"Colour is my day-long obsession, joy and torment." — Vincent',
    '"Great things are done by a series of small things brought together." — Vincent',
    '"If you truly love nature, you will find beauty everywhere." — Vincent',
  ];

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(i => (i + 1) % quotes.length), 5000);
    return () => clearInterval(t);
  }, []);

  const city = INSPIRATIONS[cityIdx];
  const harmonies = generateHarmonies(customColor);
  const currentHarmony = harmonies[harmonyMode];

  const savePalette = () => {
    const p = tab === "studies"
      ? { label: `${city.city} — ${city.mood}`, colors: city.palettes, trend: TREND_DIRECTIONS[activeTrend], note, painting: city.painting }
      : { label: `Mixed Study — ${harmonyMode}`, colors: currentHarmony.map(h => ({ hex: h, name: h })), trend: TREND_DIRECTIONS[activeTrend], note, painting: "Custom colour study" };
    setSaved(prev => [p, ...prev.slice(0, 7)]);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  };

  return (
    <div style={{ fontFamily: "'Crimson Pro', Georgia, serif", minHeight: "100vh", background: "#1a0f00", color: "#fdf8ee", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Caveat:wght@400;600;700&family=IM+Fell+English:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes swirl {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes pulse {
          0%,100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.6); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes quoteSlide {
          0%,20% { opacity: 1; transform: translateY(0); }
          25%,95% { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%,100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .tab-btn {
          background: transparent; border: none; cursor: pointer; padding: 10px 20px;
          font-family: 'Caveat', cursive; font-size: 17px; font-weight: 600;
          letter-spacing: 0.04em; color: #b8a87a; transition: all 0.3s;
          position: relative;
        }
        .tab-btn::after {
          content: ''; position: absolute; bottom: 0; left: 20%; right: 20%; height: 2px;
          background: #E8C84A; transform: scaleX(0); transition: transform 0.3s;
        }
        .tab-btn.on { color: #F8E84A; }
        .tab-btn.on::after { transform: scaleX(1); }
        .tab-btn:hover:not(.on) { color: #e8d8aa; }

        .city-btn {
          background: transparent; border: 1px solid rgba(232,200,74,0.25);
          cursor: pointer; padding: 8px 14px;
          font-family: 'Caveat', cursive; font-size: 15px; font-weight: 600;
          color: #b8a87a; transition: all 0.25s; text-align: left;
        }
        .city-btn.on { background: rgba(232,200,74,0.15); border-color: #E8C84A; color: #F8E84A; }
        .city-btn:hover:not(.on) { border-color: rgba(232,200,74,0.5); color: #e8d8aa; background: rgba(232,200,74,0.07); }

        .trend-btn {
          background: transparent; border: 1px solid rgba(232,200,74,0.2);
          cursor: pointer; padding: 5px 12px;
          font-family: 'Crimson Pro', serif; font-size: 13px; font-style: italic;
          color: #a09060; transition: all 0.25s;
        }
        .trend-btn.on { background: rgba(232,200,74,0.18); border-color: #E8C84A; color: #F8E84A; }
        .trend-btn:hover:not(.on) { border-color: rgba(232,200,74,0.45); color: #e8d8aa; }

        .harmony-btn {
          background: transparent; border: 1px solid rgba(232,200,74,0.2);
          cursor: pointer; padding: 6px 14px;
          font-family: 'Caveat', cursive; font-size: 15px; font-weight: 600;
          color: #a09060; transition: all 0.25s;
        }
        .harmony-btn.on { background: rgba(232,200,74,0.18); border-color: #E8C84A; color: #F8E84A; }
        .harmony-btn:hover:not(.on) { border-color: rgba(232,200,74,0.45); color: #e8d8aa; }

        .save-btn {
          border: 1px solid #E8C84A; cursor: pointer; padding: 14px 0; width: 100%;
          font-family: 'Caveat', cursive; font-size: 20px; font-weight: 700;
          letter-spacing: 0.06em; transition: all 0.25s; background: transparent;
        }
        .save-btn.ready { color: #F8E84A; }
        .save-btn.ready:hover { background: rgba(232,200,74,0.15); transform: translateY(-2px); box-shadow: 0 6px 24px rgba(232,200,74,0.2); }
        .save-btn.done { color: #a0e8a0; border-color: #a0e8a0; }

        textarea {
          background: rgba(255,248,230,0.06); border: 1px solid rgba(232,200,74,0.25);
          color: #e8d8aa; font-family: 'Crimson Pro', serif; font-size: 15px;
          font-style: italic; line-height: 1.7; padding: 14px 16px;
          width: 100%; resize: none; outline: none; transition: border-color 0.3s;
        }
        textarea:focus { border-color: rgba(232,200,74,0.6); background: rgba(255,248,230,0.09); }
        textarea::placeholder { color: rgba(232,200,74,0.25); font-style: italic; }

        input[type="color"] {
          -webkit-appearance: none; border: 2px solid rgba(232,200,74,0.5);
          width: 54px; height: 54px; cursor: pointer; padding: 2px; background: none;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        input[type="color"]:hover { border-color: #E8C84A; box-shadow: 0 0 16px rgba(232,200,74,0.3); }
        input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        input[type="color"]::-webkit-color-swatch { border: none; }

        .fade { animation: fadeUp 0.4s ease; }

        .section-label {
          font-family: 'Caveat', cursive; font-size: 12px; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase; color: rgba(232,200,74,0.45);
          margin-bottom: 10px;
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(232,200,74,0.3), transparent);
          margin: 20px 0;
        }
      `}</style>

      {/* Background — deep night sky with swirling texture */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 30% 20%, #1B3A6B 0%, #0A1428 40%, #1a0f00 100%)", zIndex: 0 }} />
      
      {/* Swirl overlays */}
      <div style={{ position: "fixed", top: "-20%", right: "-10%", width: "60vw", height: "60vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(27,58,107,0.4) 0%, transparent 70%)",
        animation: "swirl 30s linear infinite", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-20%", left: "-10%", width: "50vw", height: "50vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,200,74,0.08) 0%, transparent 70%)",
        animation: "swirl 40s linear infinite reverse", zIndex: 0 }} />

      {/* Canvas grain texture */}
      <div style={{ position: "fixed", inset: 0, opacity: 0.04, zIndex: 1,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: "300px 300px", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 2 }}>

        {/* HEADER */}
        <div style={{ padding: "28px 36px 20px", borderBottom: "1px solid rgba(232,200,74,0.18)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "6px" }}>
              <h1 style={{ fontFamily: "'IM Fell English', serif", fontSize: "42px", fontWeight: 400, fontStyle: "italic", color: "#F8E84A", lineHeight: 1, letterSpacing: "-0.01em" }}>
                Colour Studies
              </h1>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: "18px", color: "rgba(232,200,74,0.5)", fontWeight: 600 }}>× WGSN Intelligence</span>
            </div>
            <div style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", fontSize: "13px", color: "rgba(232,200,74,0.45)", letterSpacing: "0.1em" }}>
              After Vincent Willem van Gogh · SS26 Forecasting
            </div>
          </div>

          {/* Rotating quote */}
          <div style={{ maxWidth: "340px", textAlign: "right" }}>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: "14px", color: "rgba(232,200,74,0.6)", fontStyle: "italic", lineHeight: 1.5, animation: "shimmer 5s ease-in-out infinite" }}>
              {quotes[quoteIdx]}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div style={{ padding: "0 36px", borderBottom: "1px solid rgba(232,200,74,0.12)", display: "flex", gap: "0" }}>
          {[["studies", "City Studies"], ["studio", "The Studio"], ["atelier", `Atelier (${saved.length})`]].map(([t, l]) => (
            <button key={t} className={`tab-btn ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>{l}</button>
          ))}
        </div>

        {/* CITY STUDIES */}
        {tab === "studies" && (
          <div className="fade" style={{ display: "grid", gridTemplateColumns: "200px 1fr 260px", minHeight: "calc(100vh - 160px)" }}>

            {/* LEFT: City list */}
            <div style={{ borderRight: "1px solid rgba(232,200,74,0.15)", padding: "20px 0" }}>
              <div style={{ padding: "0 16px 12px", fontSize: "10px", fontFamily: "'Caveat', cursive", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(232,200,74,0.4)" }}>
                Colour Studies
              </div>
              {INSPIRATIONS.map((c, i) => (
                <button key={i} className={`city-btn ${cityIdx === i ? "on" : ""}`} onClick={() => setCityIdx(i)}
                  style={{ width: "100%", display: "block", padding: "10px 16px", borderLeft: "none", borderRight: "none", borderTop: "none", borderBottom: "1px solid rgba(232,200,74,0.1)" }}>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "15px", fontWeight: 700, lineHeight: 1.1 }}>{c.city}</div>
                  <div style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", fontSize: "11px", color: cityIdx === i ? "rgba(248,232,74,0.7)" : "rgba(184,168,122,0.6)", marginTop: "2px" }}>{c.mood}</div>
                  <div style={{ display: "flex", gap: "2px", marginTop: "5px" }}>
                    {c.palettes.map((s, j) => (
                      <div key={j} style={{ flex: 1, height: "5px", backgroundColor: s.hex, opacity: 0.9 }} />
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* CENTER: Palette */}
            <div style={{ padding: "28px 32px", borderRight: "1px solid rgba(232,200,74,0.15)" }}>
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "12px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(232,200,74,0.4)", marginBottom: "8px" }}>
                  {city.season} · {city.city}
                </div>
                <h2 style={{ fontFamily: "'IM Fell English', serif", fontSize: "34px", fontWeight: 400, fontStyle: "italic", color: "#F8E84A", lineHeight: 1.1, marginBottom: "10px" }}>
                  {city.mood}
                </h2>
                <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "16px", color: "#c8b888", lineHeight: 1.75, marginBottom: "12px" }}>
                  {city.description}
                </p>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "13px", color: "rgba(232,200,74,0.45)", fontStyle: "italic" }}>
                  〜 {city.painting}
                </div>
              </div>

              <div className="divider" />

              <div style={{ fontFamily: "'Caveat', cursive", fontSize: "12px", fontWeight: 600, letterSpacing: "0.15em", color: "rgba(232,200,74,0.35)", textTransform: "uppercase", marginBottom: "6px" }}>
                Brushwork: {city.brushwork}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px", marginBottom: "16px", marginTop: "16px" }}>
                {city.palettes.map((s, i) => (
                  <SwatchCard key={i} hex={s.hex} name={s.name} tall />
                ))}
              </div>

              {/* Impasto gradient bar */}
              <div style={{ height: "12px", background: `linear-gradient(to right, ${city.palettes.map(p => p.hex).join(", ")})`, marginBottom: "14px",
                boxShadow: `0 3px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)`,
                filter: "url(#rough)" }} />

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {city.palettes.map((s, i) => (
                  <div key={i} style={{ fontFamily: "monospace", fontSize: "10px", color: "rgba(232,200,74,0.5)", background: "rgba(232,200,74,0.07)", border: "1px solid rgba(232,200,74,0.15)", padding: "3px 8px" }}>
                    {s.hex.toUpperCase()}
                  </div>
                ))}
              </div>

              {/* Reference works mini-strip */}
              <div className="divider" />
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: "12px", fontWeight: 600, letterSpacing: "0.15em", color: "rgba(232,200,74,0.35)", textTransform: "uppercase", marginBottom: "10px" }}>
                Van Gogh's palette references
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {VG_WORKS.map((w, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "12px", height: "12px", backgroundColor: w.hex, border: "1px solid rgba(232,200,74,0.3)" }} />
                    <div style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", fontSize: "11px", color: "rgba(184,168,122,0.7)" }}>{w.title}, {w.year}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Controls */}
            <div style={{ padding: "24px 20px" }}>
              <div className="section-label">Trend Direction</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "16px" }}>
                {TREND_DIRECTIONS.map((t, i) => (
                  <button key={i} className={`trend-btn ${activeTrend === i ? "on" : ""}`} onClick={() => setActiveTrend(i)}>{t}</button>
                ))}
              </div>

              {activeTrend !== null && (
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "14px", color: "#F8E84A", marginBottom: "20px", paddingLeft: "8px", borderLeft: "2px solid rgba(232,200,74,0.4)", fontStyle: "italic" }}>
                  ↳ {TREND_DIRECTIONS[activeTrend]}
                </div>
              )}

              <div className="divider" />

              <div className="section-label">Forecaster's Note</div>
              <textarea rows={5} value={note} onChange={e => setNote(e.target.value)}
                placeholder="As Vincent wrote to Theo — observations, instincts, what the colour is trying to say..." style={{ marginBottom: "20px" }} />

              <button className={`save-btn ${justSaved ? "done" : "ready"}`} onClick={savePalette}>
                {justSaved ? "✓ Study archived" : "Archive this study"}
              </button>
            </div>
          </div>
        )}

        {/* STUDIO / CUSTOM TAB */}
        {tab === "studio" && (
          <div className="fade" style={{ display: "grid", gridTemplateColumns: "1fr 260px", minHeight: "calc(100vh - 160px)" }}>
            <div style={{ padding: "28px 32px", borderRight: "1px solid rgba(232,200,74,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "22px", marginBottom: "28px" }}>
                <input type="color" value={customColor} onChange={e => setCustomColor(e.target.value)} />
                <div>
                  <h2 style={{ fontFamily: "'IM Fell English', serif", fontSize: "30px", fontStyle: "italic", color: "#F8E84A", lineHeight: 1.1, marginBottom: "5px" }}>
                    Mix your own colour
                  </h2>
                  <div style={{ fontFamily: "monospace", fontSize: "12px", color: "rgba(232,200,74,0.5)" }}>
                    {customColor.toUpperCase()} &nbsp;·&nbsp;
                    {(() => { const { h, s, l } = hexToHsl(customColor); return `HSL ${h}° ${s}% ${l}%`; })()}
                  </div>
                </div>
                <div style={{ marginLeft: "auto", width: "56px", height: "56px", backgroundColor: customColor, flexShrink: 0,
                  boxShadow: `0 4px 24px ${customColor}80, 0 0 0 2px rgba(232,200,74,0.3)` }} />
              </div>

              <div className="section-label" style={{ marginBottom: "8px" }}>Harmony studies</div>
              <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", marginBottom: "24px" }}>
                {Object.keys(harmonies).map(h => (
                  <button key={h} className={`harmony-btn ${harmonyMode === h ? "on" : ""}`} onClick={() => setHarmonyMode(h)}>{h}</button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px", marginBottom: "16px" }}>
                {currentHarmony.map((hex, i) => (
                  <SwatchCard key={`${hex}-${i}`} hex={hex} tall />
                ))}
              </div>

              <div style={{ height: "12px", background: `linear-gradient(to right, ${currentHarmony.join(", ")})`, marginBottom: "14px",
                boxShadow: "0 3px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)" }} />

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {currentHarmony.map((hex, i) => (
                  <div key={i} style={{ fontFamily: "monospace", fontSize: "10px", color: "rgba(232,200,74,0.5)", background: "rgba(232,200,74,0.07)", border: "1px solid rgba(232,200,74,0.15)", padding: "3px 8px" }}>
                    {hex.toUpperCase()}
                  </div>
                ))}
              </div>

              <div className="divider" />
              <p style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", fontSize: "14px", color: "rgba(184,168,122,0.6)", lineHeight: 1.7 }}>
                "Instead of trying to reproduce exactly what I have before my eyes, I use colour more arbitrarily, in order to express myself forcibly." — Vincent, letter to Theo, 1888
              </p>
            </div>

            <div style={{ padding: "24px 20px" }}>
              <div className="section-label">Trend Direction</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "16px" }}>
                {TREND_DIRECTIONS.map((t, i) => (
                  <button key={i} className={`trend-btn ${activeTrend === i ? "on" : ""}`} onClick={() => setActiveTrend(i)}>{t}</button>
                ))}
              </div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: "14px", color: "#F8E84A", marginBottom: "20px", paddingLeft: "8px", borderLeft: "2px solid rgba(232,200,74,0.4)", fontStyle: "italic" }}>
                ↳ {TREND_DIRECTIONS[activeTrend]}
              </div>
              <div className="divider" />
              <div className="section-label">Forecaster's Note</div>
              <textarea rows={5} value={note} onChange={e => setNote(e.target.value)}
                placeholder="As Vincent wrote to Theo — observations, instincts, what the colour is trying to say..." style={{ marginBottom: "20px" }} />
              <button className={`save-btn ${justSaved ? "done" : "ready"}`} onClick={savePalette}>
                {justSaved ? "✓ Study archived" : "Archive this study"}
              </button>
            </div>
          </div>
        )}

        {/* ATELIER / SAVED */}
        {tab === "atelier" && (
          <div className="fade" style={{ padding: "32px 36px" }}>
            {saved.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontFamily: "'IM Fell English', serif", fontSize: "64px", color: "rgba(232,200,74,0.1)", fontStyle: "italic", lineHeight: 1 }}>Atelier</div>
                <div style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", fontSize: "18px", color: "rgba(184,168,122,0.45)", marginTop: "16px" }}>
                  No studies archived yet. Begin your colour research.
                </div>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: "'IM Fell English', serif", fontSize: "36px", fontStyle: "italic", color: "#F8E84A", marginBottom: "8px" }}>Archived Studies</h2>
                <div style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", fontSize: "14px", color: "rgba(184,168,122,0.5)", marginBottom: "28px" }}>{saved.length} colour {saved.length === 1 ? "study" : "studies"} saved</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {saved.map((p, pi) => (
                    <div key={pi} style={{ border: "1px solid rgba(232,200,74,0.2)", overflow: "hidden", background: "rgba(255,248,230,0.03)", position: "relative" }}>
                      <div style={{ display: "grid", gridTemplateColumns: `repeat(${p.colors.length}, 1fr)`, height: "64px" }}>
                        {p.colors.map((c, ci) => (
                          <div key={ci} style={{ backgroundColor: c.hex }} />
                        ))}
                      </div>
                      <div style={{ padding: "14px 16px" }}>
                        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "17px", fontWeight: 700, color: "#F8E84A", marginBottom: "4px" }}>{p.label}</div>
                        <div style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", fontSize: "12px", color: "rgba(232,200,74,0.5)", marginBottom: "6px" }}>{p.painting}</div>
                        <div style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", fontSize: "12px", color: "rgba(184,168,122,0.6)", marginBottom: p.note ? "8px" : "0" }}>
                          Trend: {p.trend}
                        </div>
                        {p.note && <p style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", fontSize: "13px", color: "#a08858", lineHeight: 1.6 }}>{p.note}</p>}
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "10px" }}>
                          {p.colors.map((c, ci) => (
                            <span key={ci} style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(232,200,74,0.4)", background: "rgba(232,200,74,0.06)", border: "1px solid rgba(232,200,74,0.12)", padding: "2px 5px" }}>
                              {c.hex?.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: "1px solid rgba(232,200,74,0.15)", padding: "14px 36px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "13px", color: "rgba(232,200,74,0.35)" }}>
            Van Gogh × WGSN — Colour Intelligence Studio — SS26
          </div>
          <div style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", fontSize: "12px", color: "rgba(184,168,122,0.3)" }}>
            "I am seeking, I am striving, I am in it with all my heart." — Vincent, 1882
          </div>
        </div>
      </div>
    </div>
  );
}
