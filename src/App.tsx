import { useState, useEffect, useRef } from "react";

// --- GIF URLs per exercise (Giphy / public fitness sources) ---
const EXERCISE_GIFS = {
  "Hip circles": "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
  "Leg swings": "https://media.giphy.com/media/3o7TKwxYkeW0ZvTqsU/giphy.gif",
  "Bodyweight Squat": "https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif",
  "Inchworm": "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif",
  "Lichte KB Deadlift": "https://media.giphy.com/media/l0HlPwMAzh13pcZ20/giphy.gif",
  "KB Goblet Squat": "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnVhd2J6eTZjM2VkOW9wZWFsY2k3MmN0N3dxYWU3ZXVjZGZlcHU4ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSx0g7RqRnVqJG/giphy.gif",
  "KB Single-leg RDL": "https://media.giphy.com/media/3oEjI789af0AVurF60/giphy.gif",
  "KB Bent-over Row": "https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif",
  "KB Farmer's Carry": "https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif",
  "KB Swing ⭐": "https://media.giphy.com/media/3oEjI5VtIhAfkpKLKE/giphy.gif",
  "KB Reverse Lunge": "https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif",
  "KB Push Press": "https://media.giphy.com/media/3oEjHWpiVIOGXT5l9m/giphy.gif",
  "KB Renegade Row": "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
  "KB Suitcase Carry": "https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif",
  "Dead Bug": "https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif",
  "KB Glute Bridge": "https://media.giphy.com/media/3oEjHYqImHXDSAF4Oc/giphy.gif",
  "Heupflexor stretch": "https://media.giphy.com/media/3oEjI789af0AVurF60/giphy.gif",
  "Hamstring stretch": "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
  "Thoracale rotatie": "https://media.giphy.com/media/3o7TKwxYkeW0ZvTqsU/giphy.gif",
};

// Fallback animated SVG per exercise type
function ExerciseAnimation({ name, color }) {
  const isSwing = name.includes("Swing");
  const isSquat = name.includes("Squat") || name.includes("Lunge");
  const isCarry = name.includes("Carry");
  const isRow = name.includes("Row");
  const isDead = name.includes("Dead") || name.includes("Bridge");

  return (
    <svg viewBox="0 0 120 120" width="120" height="120" style={{ display: "block" }}>
      <style>{`
        @keyframes swing { 0%,100%{transform:rotate(-20deg)} 50%{transform:rotate(20deg)} }
        @keyframes squat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(12px)} }
        @keyframes carry { 0%,100%{transform:translateX(-8px)} 50%{transform:translateX(8px)} }
        @keyframes row { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-10px)} }
        @keyframes bridge { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
        .swing-anim { transform-origin:60px 40px; animation: swing 1.2s ease-in-out infinite; }
        .squat-anim { transform-origin:60px 60px; animation: squat 1.4s ease-in-out infinite; }
        .carry-anim { transform-origin:60px 60px; animation: carry 1.6s ease-in-out infinite; }
        .row-anim { transform-origin:60px 60px; animation: row 1.2s ease-in-out infinite; }
        .bridge-anim { transform-origin:60px 80px; animation: bridge 1.4s ease-in-out infinite; }
        .pulse-anim { animation: pulse 1.5s ease-in-out infinite; }
      `}</style>
      <circle cx="60" cy="20" r="10" fill={color} opacity="0.9" />
      <g className={isSwing ? "swing-anim" : isSquat ? "squat-anim" : isCarry ? "carry-anim" : isRow ? "row-anim" : "bridge-anim"}>
        <rect x="52" y="32" width="16" height="28" rx="6" fill={color} opacity="0.85" />
        <rect x="30" y="36" width="22" height="8" rx="4" fill={color} opacity="0.7" />
        <rect x="68" y="36" width="22" height="8" rx="4" fill={color} opacity="0.7" />
        <rect x="52" y="60" width="7" height="30" rx="4" fill={color} opacity="0.75" />
        <rect x="61" y="60" width="7" height="30" rx="4" fill={color} opacity="0.75" />
        {isSwing && <ellipse cx="26" cy="40" rx="8" ry="6" fill={color} opacity="0.5" className="pulse-anim" />}
        {isCarry && <rect x="18" y="60" width="10" height="14" rx="3" fill={color} opacity="0.6" />}
      </g>
    </svg>
  );
}

// --- Progression logic ---
function getProgressionLevel(sessionsCompleted) {
  if (sessionsCompleted < 4) return { level: 1, label: "Week 1–2", workBonus: 0, restPenalty: 0, extraRound: false, challenge: false };
  if (sessionsCompleted < 8) return { level: 2, label: "Week 3–4", workBonus: 5, restPenalty: 5, extraRound: false, challenge: false };
  if (sessionsCompleted < 12) return { level: 3, label: "Week 5–6", workBonus: 5, restPenalty: 5, extraRound: true, challenge: false };
  return { level: 4, label: "Week 7+", workBonus: 10, restPenalty: 10, extraRound: true, challenge: true };
}

const BASE_WORKOUT = [
  {
    block: "🟡 Warming-up", blockKey: "warmup",
    exercises: [
      { name: "Hip circles", duration: 30, rest: 0, description: "Draai je heupen langzaam in grote cirkels. 15 sec per richting." },
      { name: "Leg swings", duration: 30, rest: 0, description: "Schommel één been voor en achter. Wissel na 15 sec." },
      { name: "Bodyweight Squat", duration: 30, rest: 0, description: "Zak diep door de knieën, borst omhoog, hielen op de grond." },
      { name: "Inchworm", duration: 30, rest: 0, description: "Loop met je handen naar voren naar een plankpositie en terug." },
      { name: "Lichte KB Deadlift", duration: 30, rest: 10, description: "Voeten schouderbreedte, KB tussen je voeten. Strek je heupen om op te staan." },
    ],
  },
  {
    block: "🔵 Blok 1 — Kracht", blockKey: "blok1", rounds: 3,
    exercises: [
      { name: "KB Goblet Squat", duration: 40, rest: 20, description: "Houd KB voor borst. Zak diep, borst omhoog, duw vanuit hielen omhoog." },
      { name: "KB Single-leg RDL", duration: 40, rest: 20, description: "Sta op één been. Kantel vooruit, vrij been naar achter, rug recht." },
      { name: "KB Bent-over Row", duration: 40, rest: 20, description: "Romp 45° voorover. Trek KB naar navel, ellebogen langs het lichaam." },
      { name: "KB Farmer's Carry", duration: 40, rest: 20, description: "KB in elke hand, rechtop lopen. Buik aangespannen, niet zwaaien." },
    ],
  },
  {
    block: "🔴 Blok 2 — Metabolic", blockKey: "blok2", rounds: 4,
    exercises: [
      { name: "KB Swing ⭐", duration: 35, rest: 25, description: "KB achteruit tussen benen (heupscharnieren!), explosief naar voren. Kracht uit billen." },
      { name: "KB Reverse Lunge", duration: 35, rest: 25, description: "Stap naar achteren, zak gecontroleerd. Voorste knie boven enkel." },
      { name: "KB Push Press", duration: 35, rest: 25, description: "KB op schouder. Lichte kniebuiging, explosief omhoog drukken." },
      { name: "KB Renegade Row", duration: 35, rest: 25, description: "Plankpositie op KB's. Trek één KB naar heup, heupen niet draaien." },
    ],
    betweenRounds: { name: "Actief herstel (wandelen)", duration: 60 },
  },
  {
    block: "🟢 Blok 3 — Core", blockKey: "blok3", rounds: 2,
    exercises: [
      { name: "KB Suitcase Carry", duration: 40, rest: 0, description: "KB aan één kant, rechtop lopen. Weersta neiging om opzij te hangen." },
      { name: "Dead Bug", duration: 40, rest: 0, description: "Op rug, armen omhoog, knieën 90°. Laat arm + tegenoverliggend been zakken." },
      { name: "KB Glute Bridge", duration: 40, rest: 20, description: "Op rug, KB op heupen. Duw heupen omhoog, billen maximaal aanspannen." },
    ],
  },
  {
    block: "🧘 Cool-down", blockKey: "cooldown",
    exercises: [
      { name: "Heupflexor stretch", duration: 30, rest: 0, description: "Knie op de grond, stap naar voren. Duw heupen licht naar voren." },
      { name: "Hamstring stretch", duration: 30, rest: 0, description: "Been gestrekt, buig voorover naar je teen, rug recht houden." },
      { name: "Thoracale rotatie", duration: 30, rest: 0, description: "Draai langzaam van links naar rechts, adem rustig." },
    ],
  },
];

function applyProgression(baseWorkout, prog) {
  return baseWorkout.map(block => {
    const isMetabolic = block.blockKey === "blok2";
    const isKracht = block.blockKey === "blok1";
    const rounds = block.rounds
      ? (prog.extraRound && isMetabolic ? block.rounds + 1 : block.rounds)
      : undefined;
    const exercises = block.exercises.map(ex => ({
      ...ex,
      duration: (isMetabolic || isKracht) ? ex.duration + prog.workBonus : ex.duration,
      rest: (isMetabolic || isKracht) ? Math.max(10, ex.rest - prog.restPenalty) : ex.rest,
    }));
    return { ...block, rounds: rounds ?? block.rounds, exercises };
  });
}

function buildQueue(workout) {
  const queue = [];
  for (const block of workout) {
    const rounds = block.rounds || 1;
    for (let r = 0; r < rounds; r++) {
      queue.push({ type: "round-header", block: block.block, round: r + 1, totalRounds: rounds, duration: 3 });
      for (const ex of block.exercises) {
        queue.push({ type: "work", name: ex.name, duration: ex.duration, description: ex.description, block: block.block });
        if (ex.rest > 0) {
          queue.push({ type: "rest", name: "Rust", duration: ex.rest, block: block.block });
        }
      }
      if (block.betweenRounds && r < rounds - 1) {
        queue.push({ type: "between-rounds", name: block.betweenRounds.name, duration: block.betweenRounds.duration, block: block.block });
      }
    }
  }
  return queue;
}

const blockColors = {
  "🟡 Warming-up": { bg: "#fef3c7", accent: "#d97706", text: "#78350f", dark: "#b45309" },
  "🔵 Blok 1 — Kracht": { bg: "#dbeafe", accent: "#2563eb", text: "#1e3a8a", dark: "#1d4ed8" },
  "🔴 Blok 2 — Metabolic": { bg: "#fee2e2", accent: "#dc2626", text: "#7f1d1d", dark: "#b91c1c" },
  "🟢 Blok 3 — Core": { bg: "#dcfce7", accent: "#16a34a", text: "#14532d", dark: "#15803d" },
  "🧘 Cool-down": { bg: "#f3e8ff", accent: "#9333ea", text: "#4c1d95", dark: "#7e22ce" },
};
function getColor(block) {
  return blockColors[block] || { bg: "#f1f5f9", accent: "#64748b", text: "#1e293b", dark: "#475569" };
}

const STORAGE_KEY = "kb_sessions_falco";

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { count: 0, history: [] };
  } catch { return { count: 0, history: [] }; }
}
function saveSessions(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// Screen components
function HomeScreen({ sessions, prog, onStart, onReset }) {
  const next = prog.level < 4
    ? `Niveau ${prog.level + 1} na ${[4,8,12][prog.level-1] - sessions.count} sessies`
    : "Je zit op max niveau! 🔥";

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"24px 20px", gap:20, maxWidth:360, margin:"0 auto" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:11, letterSpacing:4, color:"#64748b", textTransform:"uppercase", marginBottom:6 }}>Falco's</div>
        <div style={{ fontSize:28, fontWeight:"900", color:"#f1f5f9", letterSpacing:-1 }}>Kettlebell</div>
        <div style={{ fontSize:28, fontWeight:"900", color:"#f97316", letterSpacing:-1, marginTop:-4 }}>Workout</div>
        <div style={{ fontSize:12, color:"#64748b", marginTop:6 }}>Full Body · 40 min · Vetverbranding + Loopkracht</div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, width:"100%" }}>
        {[
          { label: "Sessies", value: sessions.count, icon: "🏋️" },
          { label: "Niveau", value: prog.level + "/4", icon: "📈" },
          { label: "Fase", value: prog.label, icon: "📅" },
        ].map(s => (
          <div key={s.label} style={{ background:"#1e293b", borderRadius:14, padding:"12px 8px", textAlign:"center" }}>
            <div style={{ fontSize:20 }}>{s.icon}</div>
            <div style={{ fontSize:18, fontWeight:"bold", color:"#f1f5f9", marginTop:4 }}>{s.value}</div>
            <div style={{ fontSize:10, color:"#64748b", marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progression bar */}
      <div style={{ width:"100%", background:"#1e293b", borderRadius:14, padding:"14px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:12, color:"#94a3b8", fontWeight:"bold" }}>Progressie niveau {prog.level}</span>
          <span style={{ fontSize:11, color:"#64748b" }}>{next}</span>
        </div>
        <div style={{ height:6, background:"#0f172a", borderRadius:10, overflow:"hidden" }}>
          <div style={{
            height:"100%",
            width:`${Math.min(100,(sessions.count % 4) / 4 * 100)}%`,
            background:"linear-gradient(90deg,#f97316,#ef4444)",
            borderRadius:10, transition:"width 0.6s ease"
          }} />
        </div>
        {prog.workBonus > 0 && (
          <div style={{ marginTop:10, fontSize:11, color:"#64748b" }}>
            ⚡ +{prog.workBonus}s werk · -{prog.restPenalty}s rust
            {prog.extraRound ? " · +1 ronde blok 2" : ""}
            {prog.challenge ? " · Challenge mode 🔥" : ""}
          </div>
        )}
      </div>

      {/* Recent history */}
      {sessions.history.length > 0 && (
        <div style={{ width:"100%", background:"#1e293b", borderRadius:14, padding:"12px 16px" }}>
          <div style={{ fontSize:11, color:"#64748b", marginBottom:8, letterSpacing:1, textTransform:"uppercase" }}>Laatste sessies</div>
          {sessions.history.slice(-3).reverse().map((h, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom: i<2 ? "1px solid #0f172a":"none" }}>
              <span style={{ fontSize:12, color:"#94a3b8" }}>{h.date}</span>
              <span style={{ fontSize:12, color:"#4ade80" }}>✓ Voltooid</span>
            </div>
          ))}
        </div>
      )}

      <button onClick={onStart} style={{
        width:"100%", padding:"16px", borderRadius:16, border:"none",
        background:"linear-gradient(135deg, #f97316, #ef4444)",
        color:"white", fontSize:18, fontWeight:"bold", cursor:"pointer",
        letterSpacing:1, fontFamily:"inherit",
        boxShadow:"0 8px 24px #f9731640",
      }}>START WORKOUT ▶</button>

      {sessions.count > 0 && (
        <button onClick={onReset} style={{
          background:"none", border:"none", color:"#334155",
          fontSize:11, cursor:"pointer", fontFamily:"inherit"
        }}>Reset sessies</button>
      )}
    </div>
  );
}

function GifDemo({ name, color }) {
  const [gifError, setGifError] = useState(false);
  const gifUrl = EXERCISE_GIFS[name];

  if (!gifUrl || gifError) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", width:120, height:120, background:"#1e293b", borderRadius:16 }}>
        <ExerciseAnimation name={name} color={color} />
      </div>
    );
  }

  return (
    <div style={{ width:120, height:120, borderRadius:16, overflow:"hidden", background:"#1e293b", flexShrink:0 }}>
      <img
        src={gifUrl}
        alt={name}
        onError={() => setGifError(true)}
        style={{ width:"100%", height:"100%", objectFit:"cover" }}
      />
    </div>
  );
}

export default function KettlebellTimer() {
  const [screen, setScreen] = useState("home"); // home | workout | done
  const [sessions, setSessions] = useState(loadSessions);
  const prog = getProgressionLevel(sessions.count);
  const workout = applyProgression(BASE_WORKOUT, prog);
  const queue = buildQueue(workout);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const audioCtx = useRef(null);

  const current = queue[currentIndex];
  const colors = current ? getColor(current.block) : { accent: "#64748b", dark: "#475569" };

  function beep(freq = 880, dur = 0.15, vol = 0.4) {
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx.current;
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + dur);
    } catch {}
  }

  function tripleBeep() {
    beep(660, 0.12); setTimeout(() => beep(660, 0.12), 160); setTimeout(() => beep(880, 0.2), 320);
  }

  function skipHeaders(idx) {
    while (idx < queue.length && (queue[idx].type === "round-header")) idx++;
    return idx;
  }

  useEffect(() => {
    if (screen === "workout" && timeLeft === null && current) {
      const idx = skipHeaders(0);
      setCurrentIndex(idx);
      setTimeLeft(queue[idx]?.duration || 30);
    }
  }, [screen]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          tripleBeep();
          const raw = currentIndex + 1;
          const next = skipHeaders(raw);
          if (next >= queue.length) {
            const newSessions = {
              count: sessions.count + 1,
              history: [...sessions.history, { date: new Date().toLocaleDateString("nl-NL") }]
            };
            setSessions(newSessions);
            saveSessions(newSessions);
            setRunning(false);
            setScreen("done");
            return 0;
          }
          setCurrentIndex(next);
          setTimeLeft(queue[next].duration);
          return queue[next].duration;
        }
        if (t === 4) beep(440, 0.1);
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, currentIndex]);

  function handleStartPause() { setRunning(r => !r); }

  function handleNext() {
    clearInterval(intervalRef.current); setRunning(false);
    const next = skipHeaders(currentIndex + 1);
    if (next >= queue.length) return;
    setCurrentIndex(next); setTimeLeft(queue[next].duration);
  }

  function handlePrev() {
    clearInterval(intervalRef.current); setRunning(false);
    let prev = currentIndex - 1;
    while (prev >= 0 && queue[prev].type === "round-header") prev--;
    if (prev < 0) return;
    setCurrentIndex(prev); setTimeLeft(queue[prev].duration);
  }

  function startWorkout() {
    const idx = skipHeaders(0);
    setCurrentIndex(idx);
    setTimeLeft(queue[idx]?.duration || 30);
    setRunning(false);
    setScreen("workout");
  }

  function resetSessions() {
    const empty = { count: 0, history: [] };
    setSessions(empty); saveSessions(empty);
  }

  const isRest = current?.type === "rest" || current?.type === "between-rounds";
  const workItems = queue.filter(q => q.type === "work");
  const currentWorkIndex = current?.type === "work" ? workItems.findIndex(w => w === current) : -1;
  const circumference = 2 * Math.PI * 54;
  const elapsed = current ? current.duration - (timeLeft ?? current.duration) : 0;
  const strokeDash = circumference - (elapsed / (current?.duration || 1)) * circumference;

  // next non-header item
  let nextIdx = currentIndex + 1;
  while (nextIdx < queue.length && queue[nextIdx].type === "round-header") nextIdx++;
  const nextItem = queue[nextIdx];

  return (
    <div style={{
      minHeight:"100vh", background:"#0f172a",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-start",
      fontFamily:"'Georgia', serif", color:"#f8fafc",
      paddingBottom: 40,
    }}>
      {/* HOME */}
      {screen === "home" && (
        <HomeScreen sessions={sessions} prog={prog} onStart={startWorkout} onReset={resetSessions} />
      )}

      {/* WORKOUT */}
      {screen === "workout" && current && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"20px 16px", gap:12, width:"100%", maxWidth:360, margin:"0 auto" }}>

          {/* Top bar */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", width:"100%" }}>
            <button onClick={() => { clearInterval(intervalRef.current); setRunning(false); setScreen("home"); }} style={{
              background:"none", border:"none", color:"#475569", fontSize:13, cursor:"pointer", fontFamily:"inherit"
            }}>← Terug</button>
            <div style={{
              background: colors.bg || "#1e293b",
              color: colors.text || "#94a3b8",
              borderRadius:20, padding:"3px 12px", fontSize:11, fontWeight:"bold"
            }}>{current.block}</div>
            <div style={{ fontSize:11, color:"#475569" }}>
              {currentWorkIndex >= 0 ? `${currentWorkIndex+1}/${workItems.length}` : ""}
            </div>
          </div>

          {/* GIF + Timer side by side */}
          <div style={{ display:"flex", gap:14, alignItems:"center", width:"100%", justifyContent:"center" }}>
            {current.type === "work" && (
              <GifDemo name={current.name} color={colors.accent} />
            )}

            {/* Circular timer */}
            <div style={{ position:"relative", width:140, height:140, flexShrink:0 }}>
              <svg width="140" height="140" style={{ transform:"rotate(-90deg)" }}>
                <circle cx="70" cy="70" r="54" fill="none" stroke="#1e293b" strokeWidth="10" />
                <circle cx="70" cy="70" r="54" fill="none"
                  stroke={isRest ? "#334155" : colors.accent}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDash}
                  strokeLinecap="round"
                  style={{ transition:"stroke-dashoffset 0.9s linear" }}
                />
              </svg>
              <div style={{
                position:"absolute", top:0, left:0, right:0, bottom:0,
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"
              }}>
                <div style={{ fontSize:44, fontWeight:"bold", lineHeight:1, color: isRest ? "#475569" : "#f1f5f9" }}>
                  {timeLeft}
                </div>
                <div style={{ fontSize:10, color:"#64748b", letterSpacing:1, marginTop:2 }}>SEC</div>
              </div>
            </div>
          </div>

          {/* Exercise name */}
          <div style={{ fontSize: isRest ? 15 : 20, fontWeight:"bold", textAlign:"center", color: isRest ? "#64748b" : "#f1f5f9", maxWidth:300 }}>
            {isRest ? "⏸ Rust" : current.name}
          </div>

          {/* Description */}
          {current.description && !isRest && (
            <div style={{
              background:"#1e293b", borderLeft:`3px solid ${colors.accent}`,
              borderRadius:"0 10px 10px 0", padding:"10px 14px",
              fontSize:13, color:"#cbd5e1", maxWidth:320, lineHeight:1.5, width:"100%"
            }}>{current.description}</div>
          )}

          {/* Controls */}
          <div style={{ display:"flex", gap:16, alignItems:"center", marginTop:4 }}>
            <button onClick={handlePrev} style={{
              width:44, height:44, borderRadius:"50%", border:"1px solid #1e293b",
              background:"#0f172a", color:"#475569", fontSize:18, cursor:"pointer",
            }}>‹</button>
            <button onClick={handleStartPause} style={{
              width:72, height:72, borderRadius:"50%", border:"none",
              background: isRest ? "#1e293b" : `linear-gradient(135deg, ${colors.accent}, ${colors.dark})`,
              color:"white", fontSize:26, cursor:"pointer",
              boxShadow: isRest ? "none" : `0 0 20px ${colors.accent}60`,
            }}>
              {running ? "⏸" : "▶"}
            </button>
            <button onClick={handleNext} style={{
              width:44, height:44, borderRadius:"50%", border:"1px solid #1e293b",
              background:"#0f172a", color:"#475569", fontSize:18, cursor:"pointer",
            }}>›</button>
          </div>

          {/* Overall progress */}
          <div style={{ width:"100%", maxWidth:320 }}>
            <div style={{ height:4, background:"#1e293b", borderRadius:10, overflow:"hidden" }}>
              <div style={{
                height:"100%",
                width:`${Math.max(0,(currentWorkIndex+1)/workItems.length*100)}%`,
                background:`linear-gradient(90deg,#f97316,#ef4444)`,
                borderRadius:10, transition:"width 0.4s ease"
              }} />
            </div>
          </div>

          {/* Up next */}
          {nextItem && (
            <div style={{
              background:"#1e293b", borderRadius:12, padding:"10px 14px",
              width:"100%", maxWidth:320, display:"flex", alignItems:"center", gap:8
            }}>
              <div style={{ fontSize:10, color:"#475569", minWidth:50 }}>Hierna:</div>
              <div style={{ fontSize:13, color:"#94a3b8", fontWeight:"bold", flex:1 }}>{nextItem.name}</div>
              <div style={{ fontSize:11, color:"#475569" }}>{nextItem.duration}s</div>
            </div>
          )}
        </div>
      )}

      {/* DONE */}
      {screen === "done" && (
        <div style={{ textAlign:"center", padding:"60px 24px", maxWidth:360, margin:"0 auto" }}>
          <div style={{ fontSize:72 }}>🎉</div>
          <div style={{ fontSize:26, fontWeight:"900", marginTop:16, color:"#4ade80", letterSpacing:-0.5 }}>
            Workout voltooid!
          </div>
          <div style={{ color:"#64748b", marginTop:8, fontSize:14 }}>
            Sessie #{sessions.count} · Goed gedaan Falco!
          </div>

          <div style={{ background:"#1e293b", borderRadius:16, padding:"16px 20px", marginTop:24, textAlign:"left" }}>
            <div style={{ fontSize:11, color:"#64748b", letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Jouw stats</div>
            {[
              { label:"Totaal sessies", value: sessions.count + " 🏋️" },
              { label:"Huidig niveau", value: prog.label },
              { label:"Gewicht (laatste meting)", value: "87.9 kg" },
              { label:"Doel", value: "83.0 kg (-4.9kg)" },
            ].map(s => (
              <div key={s.label} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #0f172a" }}>
                <span style={{ fontSize:13, color:"#94a3b8" }}>{s.label}</span>
                <span style={{ fontSize:13, color:"#f1f5f9", fontWeight:"bold" }}>{s.value}</span>
              </div>
            ))}
          </div>

          {prog.level < 4 && (
            <div style={{ background:"#1e293b", borderRadius:16, padding:"12px 16px", marginTop:12, fontSize:12, color:"#64748b" }}>
              📈 Nog <strong style={{color:"#f97316"}}>{[4,8,12][prog.level-1] - sessions.count} sessies</strong> tot niveau {prog.level + 1}
            </div>
          )}

          <button onClick={() => { startWorkout(); }} style={{
            width:"100%", padding:"14px", borderRadius:14, border:"none", marginTop:20,
            background:"linear-gradient(135deg,#f97316,#ef4444)",
            color:"white", fontSize:16, fontWeight:"bold", cursor:"pointer", fontFamily:"inherit"
          }}>Nog een ronde ▶</button>

          <button onClick={() => setScreen("home")} style={{
            width:"100%", padding:"12px", borderRadius:14, border:"1px solid #1e293b",
            background:"none", color:"#94a3b8", fontSize:14, cursor:"pointer",
            fontFamily:"inherit", marginTop:10
          }}>← Terug naar home</button>
        </div>
      )}
    </div>
  );
}