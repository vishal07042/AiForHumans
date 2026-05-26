"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";

/* ─── DESIGN TOKENS (Shared across series) ──────────────────────────────── */
const T = {
    bg: "#0b0b0d",
    surface: "#111114",
    card: "#17171b",
    border: "rgba(255,255,255,0.08)",
    border2: "rgba(255,255,255,0.14)",
    text: "#edeae4",
    muted: "#a8a49c",
    dim: "#909090",
    accent: "#f5a623",
    red: "#e8593c",
    blue: "#5b9cf6",
    green: "#52c07a",
    purple: "#b48fff",
    pink: "#f07eb3",
    teal: "#3ecfcf",
};

/* ─── MODE CONFIG ────────────────────────────────────────────────────────── */
const MODES = [
    { id: "general", label: "General", emoji: "📖", color: T.accent },
    { id: "five", label: "I'm 5 🧒", emoji: "🧒", color: T.green },
    { id: "code", label: "Code Heavy 💻", emoji: "💻", color: T.blue },
    { id: "banter", label: "Banter 🔥", emoji: "🔥", color: T.red },
];

/* ─── CONTENT DICTIONARY ──────────────────────────────────────────────────── */
const CONTENT = {
    hero: {
        general: { title: "What Is an Embedding?", sub: "How AI turns words, ideas, and concepts into numbers scattered across space — and how it understands meaning." },
        five: { title: "Words into Numbers", sub: "Imagine sorting your toys into boxes. All the animals go together. All the cars go together. That's exactly how AI organizes language." },
        code: { title: "Vector Embeddings", sub: "Mapping discrete categorical variables (like words) into continuous dense vector spaces (ℝ^n) using dot products and cosine similarity." },
        banter: { title: "Dictionaries for Math Nerds", sub: "AI doesn't read. It just calculates distances between lists of numbers and hopes you think it's conscious. Welcome to linear algebra." },
    },
    s1: {
        general: {
            h: "The Problem: Computers Can't Read",
            p: "If I say the word 'Apple', you picture a fruit. Or a trillion-dollar company. Or the color red. Your brain intuitively links 'Apple' to a massive web of meaning. But to a computer? 'Apple' is just a sequence of 1s and 0s: 01000001 01110000 01110000 01101100 01100101.",
            p2: "If we just feed those 1s and 0s to an AI, it has no idea that 'Apple' is closer to 'Banana' than it is to 'Helicopter.' To teach AI meaning, we had to stop treating words like letters, and start treating them like coordinates on a map.",
        },
        five: {
            h: "Computers are blind to meaning 🙈",
            p: "When you look at a picture of a dog and a cat, you know they are both fluffy pets. You know they belong together. A computer just sees a bunch of colored squares (pixels).",
            p2: "If we want a computer to understand that 'dog' and 'cat' are similar, we can't just teach it the letters D-O-G. We have to build a giant invisible map, and put the 'dog' pin right next to the 'cat' pin.",
        },
        code: {
            h: "One-hot encoding is dead",
            p: "Historically, we represented a vocabulary of V words using one-hot vectors of size V. Apple might be [0,0,1,0...], Banana [0,1,0,0...]. The problem? The dot product between any two one-hot vectors is 0.",
            p2: "One-hot vectors assume all words are completely independent and equally dissimilar. They carry zero semantic information and scale terribly (curse of dimensionality). We needed a way to compress V dimensions down to d dimensions (where d << V) such that similar words cluster together.",
        },
        banter: {
            h: "Computers are incredibly stupid calculating machines 🧮",
            p: "Let's be real. A GPU doesn't know what a 'sunset' is. It doesn't feel love, it doesn't fear death, and it absolutely cannot read English. It just multiplies matrices very fast.",
            p2: "So in the 2010s, AI researchers had a brilliant realization: instead of trying to teach machines what words actually mean, let's just turn the entire English language into a giant game of Battleship. Send me the coordinates for B-4, and I'll tell you if it's an adverb.",
        },
    },
    s2: {
        general: {
            h: "The Map of Meaning",
            p: "An embedding maps every word to a specific coordinate in space. Imagine a simple 2D map. The X-axis is 'Fluffiness' and the Y-axis is 'Size.' On this map, 'Dog' and 'Cat' would be right next to each other (very fluffy, medium size). 'Whale' would be far away (not fluffy, huge).",
            p2: "By placing words in space, we turn 'understanding meaning' into 'measuring distances.' If two words appear near each other in this space, the AI assumes they mean similar things. If they are far apart, they are unrelated.",
        },
        five: {
            h: "Sorting toys onto a giant rug 🧸",
            p: "Imagine a giant rug in your living room. We are going to place all your toys on it. We put all the stuffed animals in the top left corner. We put all the fast cars in the bottom right corner.",
            p2: "Now, if you close your eyes, reach out, and grab a toy from the top left, what will it be? A stuffed animal! The AI does the exact same thing with words. It organizes them on a giant, invisible rug so it knows where to find things.",
        },
        code: {
            h: "Dense vector spaces",
            p: "An embedding matrix E ∈ ℝ^(V × d) acts as a lookup table. For a token index i, its embedding representation is E[i], a d-dimensional vector. During training (via architectures like Word2Vec's skip-gram or modern transformer pre-training), these weights are updated via backpropagation.",
            p2: "The loss function forces words that appear in similar continuous contexts ( distributional semantics ) to be pushed closer together in the vector space, maximizing their cosine similarity ( A·B / ||A||||B|| ).",
        },
        banter: {
            h: "Spatial reasoning for the soulless 🗺️",
            p: "Embeddings are just the AI awkwardly trying to categorize human culture on an infinite graph. 'Ah yes, Taylor Swift and Beyoncé, these coordinates belong near each other. Tax evasion and golf? Also quite close.'",
            p2: "The AI doesn't know what the axes mean. It just knows that whenever a human writes 'scandal', the words 'politician' and 'golf' usually show up nearby. It is purely statistical guilt by association.",
        },
    },
    s3: {
        general: {
            h: "Vector Math: King - Man + Woman = ?",
            p: "Because words are just coordinates, you can actually do math on them. This is the craziest part of embeddings. If you take the coordinate for 'King', subtract the coordinate for 'Man', and add the coordinate for 'Woman'...",
            p2: "...you physically end up landing on the exact coordinate for 'Queen'. The AI mathematically understands gender and royalty relationships without anyone ever explicitly programming it into the system.",
        },
        five: {
            h: "Superpower math! 🦸‍♂️",
            p: "Because words are points on a map, we can draw lines between them. The line from 'Man' to 'Woman' is the exact same shape and size as the line from 'King' to 'Queen'.",
            p2: "It's like walking steps. If you walk 3 steps north to get from Boy to Girl, you can start at Prince, walk 3 steps north, and you'll find Princess! Is it magic? No, it's just really cool maps.",
        },
        code: {
            h: "Linear substructures in latent space",
            p: "The word2vec paper (Mikolov, 2013) famously demonstrated that relational similarities captured by models translate into vector arithmetic: vec('King') - vec('Man') + vec('Woman') ≈ vec('Queen').",
            p2: "This occurs naturally because the difference vector represents a consistent semantic relationship (like gender or pluralization). The model learns latent linear combinations holding semantic meaning across the continuous geometry of the space.",
        },
        banter: {
            h: "The equation that launched 10,000 startups 🚀",
            p: "King - Man + Woman = Queen. The single most legendary finding in modern AI. When researchers first saw this in 2013, they collectively lost their minds. They realized the computer wasn't just memorizing strings, it had somehow modeled logic.",
            p2: "Of course, if you venture further out into the math, it occasionally breaks down in hilarious ways. 'Programmer' - 'Coffee' + 'Sleep' = 'Unemployed'. (Don't quote me on that one, but it feels right).",
        },
    },
};

/* ─── DATA COMPONENTS ────────────────────────────────────────────────────── */

const WORD_MAP_CLUSTERS = [
    { id: "dog", x: 20, y: 30, label: "Dog", cluster: "animals" },
    { id: "cat", x: 24, y: 25, label: "Cat", cluster: "animals" },
    { id: "wolf", x: 15, y: 35, label: "Wolf", cluster: "animals" },
    { id: "tiger", x: 28, y: 32, label: "Tiger", cluster: "animals" },
    
    { id: "king", x: 75, y: 20, label: "King", cluster: "royalty" },
    { id: "queen", x: 75, y: 40, label: "Queen", cluster: "royalty" },
    { id: "prince", x: 85, y: 25, label: "Prince", cluster: "royalty" },
    { id: "castle", x: 80, y: 10, label: "Castle", cluster: "royalty" },

    { id: "car", x: 15, y: 75, label: "Car", cluster: "tech" },
    { id: "truck", x: 20, y: 85, label: "Truck", cluster: "tech" },
    { id: "engine", x: 25, y: 70, label: "Engine", cluster: "tech" },
    { id: "robot", x: 35, y: 80, label: "Robot", cluster: "tech" },

    { id: "apple", x: 80, y: 80, label: "Apple", cluster: "food" },
    { id: "banana", x: 70, y: 85, label: "Banana", cluster: "food" },
    { id: "cake", x: 90, y: 75, label: "Cake", cluster: "food" },
    { id: "pie", x: 85, y: 90, label: "Pie", cluster: "food" },
];

const EQUATIONS = [
    { label: "Royalty & Gender", a: "King", b: "Man", c: "Woman", result: "Queen", col: T.purple },
    { label: "Capitals", a: "Paris", b: "France", c: "Italy", result: "Rome", col: T.accent },
    { label: "Tense", a: "Walked", b: "Walking", c: "Swimming", result: "Swam", col: T.blue },
    { label: "Concept", a: "Sushi", b: "Rice", c: "Bread", result: "Sandwich", col: T.green },
];

/* ─── QUIZ DATA ──────────────────────────────────────────────────────────── */
const QUIZ_NODES = [
    { id: "embed", x: 390, y: 190, label: "Word Embedding", color: T.accent, r: 60 },
    { id: "vector", x: 180, y: 100, label: "Dense Vector", color: T.blue, r: 52 },
    { id: "onehot", x: 600, y: 100, label: "One-Hot Vector", color: T.green, r: 58 },
    { id: "vocab", x: 180, y: 290, label: "Vocabulary", color: T.purple, r: 48 },
    { id: "meaning", x: 600, y: 290, label: "Semantic Meaning", color: T.pink, r: 62 },
    { id: "cosine", x: 390, y: 330, label: "Cosine Similarity", color: T.teal, r: 68 },
    { id: "1536d", x: 90, y: 200, label: "1536 Dimensions", color: T.red, r: 60 },
    { id: "math", x: 680, y: 200, label: "Vector Math", color: T.accent, r: 52 },
];

const CORRECT_EDGES = [
    { from: "vocab", to: "embed", label: "mapped to" },
    { from: "embed", to: "vector", label: "represented as" },
    { from: "onehot", to: "embed", label: "replaced by" },
    { from: "embed", to: "meaning", label: "captures" },
    { from: "vector", to: "1536d", label: "has" },
    { from: "meaning", to: "math", label: "enables" },
    { from: "embed", to: "cosine", label: "measured with" },
];


/* ─── UTILS ──────────────────────────────────────────────────────────────── */
function getHelperStyles(c) { return { titleColor: c }; } // simple stub

/* ─── SUB-COMPONENTS ─────────────────────────────────────────────────────── */

/** Accessible 4-way mode toggle */
function ModeToggle({ mode, onChange }) {
    return (
        <div
            role="group"
            aria-label="Learning mode selector"
            style={{
                display: "inline-flex",
                background: "rgba(10,10,13,0.88)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.11)",
                borderRadius: 999,
                padding: "5px 6px",
                gap: 4,
                boxShadow: "0 8px 40px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.06) inset",
            }}
        >
            {MODES.map(m => {
                const active = mode === m.id;
                return (
                    <button
                        key={m.id}
                        onClick={() => onChange(m.id)}
                        aria-pressed={active}
                        aria-label={`Switch to ${m.label} mode`}
                        style={{
                            fontFamily: "'DM Sans', system-ui, sans-serif",
                            fontSize: 20,
                            fontWeight: active ? 700 : 500,
                            padding: "9px 20px",
                            borderRadius: 999,
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                            background: active
                                ? `linear-gradient(135deg, ${m.color}, ${m.color}cc)`
                                : "transparent",
                            color: active ? "#000" : "rgba(200,196,188,0.75)",
                            boxShadow: active
                                ? `0 0 20px ${m.color}55, 0 2px 8px rgba(0,0,0,0.4)`
                                : "none",
                            letterSpacing: active ? "0.01em" : "0",
                            whiteSpace: "nowrap",
                        }}
                        onFocus={e => { if (!active) e.target.style.boxShadow = `0 0 0 2px ${m.color}88`; }}
                        onBlur={e => { if (!active) e.target.style.boxShadow = "none"; }}
                        onMouseEnter={e => {
                            if (!active) {
                                e.target.style.background = "rgba(255,255,255,0.07)";
                                e.target.style.color = T.text;
                            }
                        }}
                        onMouseLeave={e => {
                            if (!active) {
                                e.target.style.background = "transparent";
                                e.target.style.color = "rgba(200,196,188,0.75)";
                            }
                        }}
                    >
                        {m.label}
                    </button>
                );
            })}
        </div>
    );
}

/** Live region that announces mode changes to screen readers */
function LiveRegion({ mode }) {
    const labels = { general: "General mode", five: "Explaining for a 5-year-old", code: "Code-heavy mode", banter: "Banter and satire mode" };
    return (
        <div role="status" aria-live="polite" aria-atomic="true"
            style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
            {labels[mode]} selected
        </div>
    );
}

/** Section divider */
function SecMark({ n }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 44 }}>
            <span style={{ fontFamily: "monospace", fontSize: 19, color: T.dim }}>{n}</span>
            <div role="presentation" style={{ flex: 1, height: 1, background: T.border }} />
        </div>
    );
}

/** Big stat callout */
function StatCard({ num, label, accent }) {
    return (
        <div style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "20px 16px",
            textAlign: "center", transition: "all 0.25s"
        }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}44`; e.currentTarget.style.transform = "translateY(-3px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; }}
        >
            <div aria-hidden="true" style={{ fontFamily: "'Instrument Serif',serif", fontSize: 38, color: accent, marginBottom: 4 }}>{num}</div>
            <div style={{ fontFamily: "monospace", fontSize: 19, color: T.dim, lineHeight: 1.6 }}>{label}</div>
            <span style={{ position: "absolute", clip: "rect(0,0,0,0)" }}>{num} {label}</span>
        </div>
    );
}

/** Callout box variants */
function Callout({ type = "info", children }) {
    const styles = {
        info: { bg: "rgba(245,166,35,0.06)", border: T.accent },
        warn: { bg: "rgba(232,89,60,0.06)", border: T.red },
        gentle: { bg: "rgba(94,192,122,0.06)", border: T.green },
        code: { bg: "rgba(91,156,246,0.06)", border: T.blue },
    };
    const s = styles[type] || styles.info;
    return (
        <aside style={{
            background: s.bg, borderLeft: `3px solid ${s.border}`, borderRadius: "0 12px 12px 0",
            padding: "16px 20px", margin: "28px 0", fontSize: 21, lineHeight: 1.75, color: "#d4d0c8"
        }}>
            {children}
        </aside>
    );
}


/* ─── INTERACTIVE WIDGETS ──────────────────────────────────────────────── */

function WordMap({ mc }) {
    const [hover, setHover] = useState(null);

    return (
        <figure aria-label="A 2D scatter plot showing words grouped by semantic meaning." style={{
            background: T.surface, borderRadius: 14, padding: 20,
            border: `1px solid ${T.border}`, margin: "24px 0", position: "relative"
        }}>
            <figcaption style={{ fontFamily: "monospace", fontSize: 15, color: T.dim, marginBottom: 16, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Semantic Coordinate Space (2D Projection)
            </figcaption>
            
            <div style={{ position: "relative", width: "100%", aspectRatio: "2/1", background: T.bg, borderRadius: 8, overflow: "hidden", border: `1px solid ${T.border2}` }}>
                {/* Grid lines */}
                <svg width="100%" height="100%" viewBox="0 0 1000 500" style={{ position: "absolute", inset: 0, opacity: 0.1 }}>
                    <defs>
                        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                            <rect width="50" height="50" fill="none" />
                            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#fff" strokeWidth="2"/>
                        </pattern>
                    </defs>
                    <rect width="1000" height="500" fill="url(#grid)" />
                </svg>

                {/* Nodes */}
                <svg width="100%" height="100%" viewBox="0 0 1000 500" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                    {WORD_MAP_CLUSTERS.map(w => {
                        const isHovered = hover === w.id;
                        const isDimmed = hover && hover !== w.id;
                        let color = w.cluster === "animals" ? T.accent : w.cluster === "royalty" ? T.purple : w.cluster === "tech" ? T.blue : T.green;
                        
                        return (
                            <g key={w.id} 
                               transform={`translate(${w.x * 10}, ${w.y * 5})`}
                               onMouseEnter={() => setHover(w.id)}
                               onMouseLeave={() => setHover(null)}
                               style={{ cursor: "crosshair", transition: "opacity 0.2s" }}
                               opacity={isDimmed ? 0.3 : 1}
                            >
                                {/* Glow */}
                                <circle r={isHovered ? 40 : 0} fill={color} opacity="0.2" fillFilter="blur(8px)" style={{ transition: "all 0.3s" }}/>
                                <circle r={isHovered ? 14 : 10} fill={color} style={{ transition: "all 0.2s" }}/>
                                <text x={24} y={8} fill={T.text} fontSize={28} fontFamily="'DM Sans', sans-serif" fontWeight={isHovered ? "bold" : "normal"}>
                                    {w.label}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
            <p style={{ fontFamily: "monospace", fontSize: 15, color: T.muted, marginTop: 16, marginBottom: 0 }}>
                Hover a plot point to inspect. Words describing similar concepts cluster tightly together.
            </p>
        </figure>
    );
}

function VectorMathWidget() {
    const [eq, setEq] = useState(EQUATIONS[0]);
    const [step, setStep] = useState(0); // 0=A, 1=A-B, 2=A-B+C

    useEffect(() => {
        let timer;
        if (step === 0) timer = setTimeout(() => setStep(1), 1200);
        else if (step === 1) timer = setTimeout(() => setStep(2), 1200);
        return () => clearTimeout(timer);
    }, [step, eq]);

    return (
        <section aria-label="Vector math interactive demo"
            style={{
                background: T.card, borderRadius: 18, padding: 28, border: `1px solid ${T.border2}`,
                position: "relative", marginTop: 40, marginBottom: 80
            }}>
            <div aria-hidden="true"
                style={{
                    position: "absolute", top: -12, left: 20, background: eq.col, color: "#000",
                    fontFamily: "monospace", fontSize: 14, fontWeight: 600, padding: "3px 12px",
                    borderRadius: 20, letterSpacing: "0.1em"
                }}>
                VECTOR ALGEBRA
            </div>
            <h3 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 31, margin: "0 0 6px" }}>
                Semantic Relationships
            </h3>
            <p style={{ fontSize: 23, color: T.muted, margin: "0 0 24px", lineHeight: 1.6 }}>
                Select an equation. Watch how subtracting and adding concepts mathematically traces meaning.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 30 }}>
                {EQUATIONS.map((e) => (
                    <button key={e.label} 
                        onClick={() => { setEq(e); setStep(0); }}
                        style={{
                        fontFamily: "monospace", fontSize: 16, padding: "8px 16px", borderRadius: 8,
                        border: `1px solid ${eq.label === e.label ? e.col : T.border2}`, 
                        background: eq.label === e.label ? `${e.col}22` : "transparent", 
                        color: eq.label === e.label ? e.col : T.muted,
                        cursor: "pointer", transition: "all 0.2s"
                    }}>
                        {e.label}
                    </button>
                ))}
            </div>

            {/* Math Display */}
            <div style={{
                background: T.bg, borderRadius: 12, padding: "30px 20px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 20,
                border: `1px solid ${T.border}`, flexWrap: "wrap"
            }}>
                <MathPill word={eq.a} color={eq.col} show={true} />
                <span style={{ fontSize: 24, color: T.dim }}>−</span>
                <MathPill word={eq.b} color={T.dim} show={step >= 1} />
                <span style={{ fontSize: 24, color: T.dim }}>+</span>
                <MathPill word={eq.c} color={T.text} show={step >= 2} />
                <span style={{ fontSize: 24, color: T.text }}>=</span>
                <MathPill word={eq.result} color={T.accent} show={step >= 2} pulse={true} />
            </div>
        </section>
    );
}

function MathPill({ word, color, show, pulse }) {
    if (!show) return <div style={{ minWidth: 80, height: 44 }} />;
    return (
        <div style={{
            padding: "8px 20px", borderRadius: 30, background: `${color}15`,
            border: `1px solid ${color}55`, color: color, fontSize: 20, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            animation: pulse ? "blink 2s ease-in-out infinite" : "none",
            boxShadow: pulse ? `0 0 15px ${color}44` : "none"
        }}>
            {word}
        </div>
    );
}

/** Obsidian quiz */
function ObsidianQuiz() {
    const [nodes, setNodes] = useState(QUIZ_NODES.map(n => ({ ...n })));
    const [edges, setEdges] = useState([]);
    const [dragging, setDragging] = useState(null);
    const [connecting, setConnecting] = useState(null);
    const [score, setScore] = useState(null);
    const [hover, setHover] = useState(null);
    const [kbFrom, setKbFrom] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const svgRef = useRef(null);
    const dragOff = useRef({ x: 0, y: 0 });
    const announceRef = useRef(null);
    const timerRef = useRef(null);

    const announce = msg => { if (announceRef.current) announceRef.current.textContent = msg; };

    useEffect(() => {
        if (timeLeft === null) return;
        if (timeLeft <= 0) {
            setEdges(CORRECT_EDGES.map((ce, i) => ({ ...ce, id: `sol-${i}` })));
            setScore({ correct: CORRECT_EDGES.length, total: CORRECT_EDGES.length });
            announce("Solution shown.");
            setTimeLeft(null);
            return;
        }
        timerRef.current = setTimeout(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearTimeout(timerRef.current);
    }, [timeLeft]);

    const onMouseDown = (e, id) => {
        e.stopPropagation();
        if (e.shiftKey) { setConnecting(id); announce(`Connecting from ${id}. Shift+click another node to link them.`); return; }
        const rect = svgRef.current.getBoundingClientRect();
        const node = nodes.find(n => n.id === id);
        dragOff.current = { x: e.clientX - rect.left - node.x, y: e.clientY - rect.top - node.y };
        setDragging(id);
    };

    const onMouseMove = e => {
        if (!dragging) return;
        const rect = svgRef.current.getBoundingClientRect();
        setNodes(ns => ns.map(n => n.id === dragging
            ? { ...n, x: e.clientX - rect.left - dragOff.current.x, y: e.clientY - rect.top - dragOff.current.y }
            : n));
    };

    const onMouseUp = (e, id) => {
        if (connecting && id && id !== connecting) {
            if (!edges.find(ed => ed.from === connecting && ed.to === id)) {
                setEdges(es => [...es, { from: connecting, to: id, id: Date.now() }]);
                announce(`Connected ${connecting} to ${id}.`);
            }
        }
        setDragging(null); setConnecting(null);
    };

    const removeEdge = id => { setEdges(es => es.filter(e => e.id !== id)); announce("Connection removed."); };

    const onKeyDown = (e, id) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!kbFrom) { setKbFrom(id); announce(`Start node set to ${id}. Press Enter on another node to connect.`); }
            else {
                if (kbFrom !== id && !edges.find(ed => ed.from === kbFrom && ed.to === id)) {
                    setEdges(es => [...es, { from: kbFrom, to: id, id: Date.now() }]);
                    announce(`Connected ${kbFrom} to ${id}.`);
                }
                setKbFrom(null);
            }
        }
        if (e.key === "Escape") { setKbFrom(null); announce("Connection cancelled."); }
    };

    const checkAnswers = () => {
        let correct = 0;
        CORRECT_EDGES.forEach(ce => { if (edges.find(e => e.from === ce.from && e.to === ce.to)) correct++; });
        setScore({ correct, total: CORRECT_EDGES.length });
        announce(`Score: ${correct} out of ${CORRECT_EDGES.length} correct connections.`);
    };

    const reset = () => {
        setEdges([]); setScore(null); setNodes(QUIZ_NODES.map(n => ({ ...n }))); setKbFrom(null); announce("Quiz reset.");
        setTimeLeft(null);
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const showSolution = () => {
        if (timeLeft !== null) return;
        setTimeLeft(120);
        announce("Timer started. Solution will be shown in 2 minutes.");
    };

    const formatTime = (secs) => `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;

    return (
        <section aria-label="Knowledge map quiz" style={{ background: "#0d0d10", borderRadius: 16, padding: 24, border: `1px solid ${T.border}`, marginBottom: 100 }}>
            {/* sr announcements */}
            <div ref={announceRef} role="status" aria-live="assertive" aria-atomic="true"
                style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }} />

            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div>
                    <h3 style={{ fontFamily: "monospace", fontSize: 19, color: T.dim, letterSpacing: "0.1em", margin: "0 0 6px", textTransform: "uppercase" }}>
                        Obsidian Knowledge Map
                    </h3>
                    <p style={{ fontSize: 19, color: T.muted, margin: 0, lineHeight: 1.65 }}>
                        <strong style={{ color: T.text }}>Drag</strong> nodes to arrange.{" "}
                        <strong style={{ color: T.text }}>Shift+drag</strong> or{" "}
                        <strong style={{ color: T.text }}>Tab + Enter</strong> to connect them.
                        Click <strong style={{ color: T.text }}>✕</strong> on an edge to remove it.
                    </p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={checkAnswers} aria-label="Check your connections"
                        style={{
                            fontFamily: "monospace", fontSize: 18, padding: "7px 14px", borderRadius: 8,
                            border: `1px solid ${T.accent}55`, background: `${T.accent}11`,
                            color: T.accent, cursor: "pointer", transition: "all 0.2s"
                        }}
                        onFocus={e => { e.target.style.boxShadow = `0 0 0 2px ${T.accent}`; }}
                        onBlur={e => { e.target.style.boxShadow = "none"; }}>
                        Check Connections
                    </button>
                    <button onClick={reset} aria-label="Reset quiz"
                        style={{
                            fontFamily: "monospace", fontSize: 18, padding: "7px 14px", borderRadius: 8,
                            border: `1px solid ${T.border2}`, background: "transparent",
                            color: T.muted, cursor: "pointer", transition: "all 0.2s"
                        }}
                        onFocus={e => { e.target.style.boxShadow = `0 0 0 2px ${T.border2}`; }}
                        onBlur={e => { e.target.style.boxShadow = "none"; }}>
                        Reset
                    </button>
                    <button onClick={showSolution} aria-label="Show Solution"
                        disabled={timeLeft !== null}
                        style={{
                            fontFamily: "monospace", fontSize: 18, padding: "7px 14px", borderRadius: 8,
                            border: `1px solid ${T.blue}55`, background: timeLeft !== null ? `${T.blue}11` : "transparent",
                            color: timeLeft !== null ? T.dim : T.blue, cursor: timeLeft !== null ? "not-allowed" : "pointer", transition: "all 0.2s"
                        }}
                        onFocus={e => { e.target.style.boxShadow = `0 0 0 2px ${T.blue}`; }}
                        onBlur={e => { e.target.style.boxShadow = "none"; }}>
                        {timeLeft !== null ? `Showing in ${formatTime(timeLeft)}...` : "Show Solution"}
                    </button>
                </div>
            </div>

            {kbFrom && (
                <p role="status" aria-live="polite" style={{ fontFamily: "monospace", fontSize: 19, color: T.accent, margin: "0 0 8px" }}>
                    Connecting from <strong>{kbFrom}</strong> — press Enter on target node. Esc to cancel.
                </p>
            )}

            <svg ref={svgRef} width="100%" height="400"
                role="application" aria-label="Interactive knowledge graph — connect related AI concepts"
                style={{
                    display: "block", borderRadius: 10, background: "#080810",
                    cursor: dragging ? "grabbing" : connecting ? "crosshair" : "default",
                    touchAction: "none"
                }}
                onMouseMove={onMouseMove} onMouseUp={e => onMouseUp(e, null)}>
                <defs>
                    <marker id="qah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                        <path d="M1,2 L8,5 L1,8" fill="none" stroke={T.accent} strokeWidth="1.5" strokeLinecap="round" />
                    </marker>
                </defs>

                {edges.map(e => {
                    const f = nodes.find(n => n.id === e.from), t = nodes.find(n => n.id === e.to);
                    if (!f || !t) return null;
                    const mid = { x: (f.x + t.x) / 2, y: (f.y + t.y) / 2 };
                    const isCorrect = score && CORRECT_EDGES.find(ce => ce.from === e.from && ce.to === e.to);
                    const isWrong = score && !isCorrect;
                    return (
                        <g key={e.id}>
                            <line x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                                stroke={isCorrect ? T.green : isWrong ? T.red : "rgba(245,166,35,0.4)"}
                                strokeWidth="1.5" markerEnd="url(#qah)" />
                            <circle cx={mid.x} cy={mid.y} r={9} fill="#1a1a1e" stroke={T.border} strokeWidth={0.5}
                                style={{ cursor: "pointer" }} role="button" aria-label="Remove this connection"
                                tabIndex={0} onClick={() => removeEdge(e.id)}
                                onKeyDown={ev => { if (ev.key === "Enter" || ev.key === " ") removeEdge(e.id); }} />
                            <text x={mid.x} y={mid.y + 4} textAnchor="middle" fill={T.dim} fontSize={16}
                                style={{ pointerEvents: "none" }}>✕</text>
                        </g>
                    );
                })}

                {nodes.map(n => {
                    const isFrom = kbFrom === n.id;
                    return (
                        <g key={n.id} role="button"
                            aria-label={`${n.label} node${isFrom ? " — selected as connection start" : ""}`}
                            tabIndex={0}
                            onMouseDown={e => onMouseDown(e, n.id)}
                            onMouseUp={e => onMouseUp(e, n.id)}
                            onMouseEnter={() => setHover(n.id)}
                            onMouseLeave={() => setHover(null)}
                            onKeyDown={e => onKeyDown(e, n.id)}
                            style={{ cursor: "grab", outline: "none" }}>
                            <circle cx={n.x} cy={n.y} r={n.r + 5} fill={n.color} opacity={isFrom ? 0.25 : hover === n.id ? 0.12 : 0.06} />
                            <circle cx={n.x} cy={n.y} r={n.r}
                                fill="#12121a" stroke={n.color}
                                strokeWidth={isFrom ? 3 : hover === n.id ? 2.5 : 1.5}
                                strokeDasharray={isFrom ? "4,2" : "none"} />
                            {n.label.split(" ").map((w, i, arr) => (
                                <text key={i} x={n.x} y={n.y} textAnchor="middle" dominantBaseline="middle"
                                    fill={n.color} fontSize={n.r > 20 ? 14 : 13} fontFamily="monospace" fontWeight="500"
                                    style={{ pointerEvents: "none", userSelect: "none" }}>
                                    <tspan x={n.x} dy={arr.length > 1 ? (i === 0 ? -7 : 14) : 0}>{w}</tspan>
                                </text>
                            ))}
                        </g>
                    );
                })}
            </svg>

            {score && (
                <div role="alert"
                    style={{
                        marginTop: 16, background: score.correct >= 5 ? "rgba(82,192,122,0.08)" : "rgba(232,89,60,0.08)",
                        border: `1px solid ${score.correct >= 5 ? T.green : T.red}`,
                        borderRadius: 10, padding: "14px 18px"
                    }}>
                    <p style={{ fontFamily: "monospace", fontSize: 20, color: score.correct >= 5 ? T.green : T.red, margin: "0 0 6px" }}>
                        {score.correct >= Math.floor(CORRECT_EDGES.length * 0.7)
                            ? "🎉 "
                            : score.correct >= 3
                                ? "📈 "
                                : "🤔 "}
                        {score.correct}/{score.total} correct connection{score.total !== 1 ? "s" : ""}
                    </p>
                    <p style={{ fontSize: 19, color: T.muted, margin: 0, lineHeight: 1.65 }}>
                        Green = correct. Red = not quite.
                        {score.correct < score.total && " Hint: think about how words cluster in high dimensions and what that allows..."}
                    </p>
                </div>
            )}
        </section>
    );
}

/* ─── MAIN PAGE COMPONENT ────────────────────────────────────────────────── */

export default function Episode03() {
    const [mode, setMode] = useState("general");
    const [readPct, setReadPct] = useState(0);
    const mainRef = useRef(null);
    const C = (section) => CONTENT[section][mode] || CONTENT[section].general;
    const mc = MODES.find(m => m.id === mode)?.color || T.accent;

    /* Read progress listener */
    useEffect(() => {
        const onScroll = () => {
            const h = document.documentElement;
            const scroll = h.scrollTop || document.body.scrollTop;
            const max = h.scrollHeight - h.clientHeight;
            setReadPct(max > 0 ? (scroll / max) * 100 : 0);
        };
        window.addEventListener("scroll", onScroll);
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&family=Instrument+Serif:ital@0;1&family=DM+Mono:ital,wght@0,300;0,400;0,500&display=swap');
                body { margin: 0; background: ${T.bg}; overflow-x: hidden; -webkit-font-smoothing: antialiased; word-spacing: 0.05em; }
                p, li, h1, h2, h3, h4 { word-spacing: 0.05em; }
                @keyframes blink { 0%, 100% { opacity: 0.3; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } }
                @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration:0.01ms !important; animation-duration:0.01ms !important; } }
            `}</style>
            
            {/* ── SKIP LINK ── */}
            <a href="#main-content"
                style={{
                    position: "absolute", top: -44, left: 0, background: T.accent, color: "#000", padding: "10px 18px",
                    fontFamily: "monospace", fontSize: 19, fontWeight: 600, textDecoration: "none", borderRadius: "0 0 8px 0",
                    zIndex: 9999, transition: "top 0.2s"
                }}
                onFocus={e => { e.target.style.top = "0"; }}
                onBlur={e => { e.target.style.top = "-44px"; }}>
                Skip to main content
            </a>

            {/* ── READ PROGRESS ── */}
            <div role="progressbar" aria-label="Reading progress" aria-valuenow={Math.round(readPct)} aria-valuemin={0} aria-valuemax={100}
                style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: T.surface, zIndex: 500 }}>
                <div style={{ height: "100%", width: `${readPct}%`, background: `linear-gradient(90deg,${mc},${T.red})`, transition: "width 0.1s" }} />
            </div>

            {/* ── MODE TOGGLE (sticky) ── */}
            <div style={{ position: "sticky", top: 10, zIndex: 200, display: "flex", justifyContent: "center", padding: "0 16px", marginBottom: -20 }}>
                <ModeToggle mode={mode} onChange={setMode} />
                <LiveRegion mode={mode} />
            </div>

            <div style={{
                background: T.bg, minHeight: "100vh", color: T.text,
                fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
                fontSize: 22, lineHeight: 1.9,
                letterSpacing: "0.01em"
            }}>
                <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 40px" }}>

                    {/* ── HERO ── */}
                    <header style={{ paddingTop: 100, paddingBottom: 56 }}>
                        <div aria-hidden="true" style={{
                            display: "inline-flex", alignItems: "center", gap: 10,
                            fontFamily: "'DM Sans', system-ui, sans-serif",
                            fontSize: 18, fontWeight: 600, letterSpacing: "0.16em",
                            textTransform: "uppercase", color: mc,
                            border: `1px solid ${mc}44`,
                            padding: "8px 18px",
                            borderRadius: 999, marginBottom: 36,
                            background: `linear-gradient(135deg, ${mc}12, ${mc}06)`,
                            boxShadow: `0 0 24px ${mc}22, 0 1px 0 ${mc}18 inset`,
                        }}>
                            <span style={{
                                width: 7, height: 7, borderRadius: "50%",
                                background: T.green,
                                display: "inline-block",
                                flexShrink: 0,
                                boxShadow: `0 0 8px ${mc}, 0 0 16px ${mc}88`,
                                animation: "blink 2s ease-in-out infinite"
                            }} />
                            Beginner Series
                            <span style={{
                                width: 1, height: 12, background: `${mc}44`,
                                display: "inline-block", flexShrink: 0
                            }} />
                            Module 03
                        </div>

                        <h1 style={{
                            fontFamily: "'Instrument Serif',serif", fontSize: "clamp(52px,7vw,86px)", fontWeight: 400,
                            lineHeight: 1.06, letterSpacing: "-0.025em", margin: "0 0 28px"
                        }}>
                            {C("hero").title}
                        </h1>
                        <p style={{ fontSize: 27, color: T.muted, maxWidth: 680, margin: "0 0 52px", lineHeight: 1.75 }}>
                            {C("hero").sub}
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }} role="list" aria-label="Key facts">
                            <div role="listitem"><StatCard num="1536" label="dimensions in OpenAI embeddings" accent={mc} /></div>
                            <div role="listitem"><StatCard num="ℝ^n" label="the symbol for a vector space" accent={mc} /></div>
                            <div role="listitem"><StatCard num="≈1.0" label="ideal cosine similarity score" accent={mc} /></div>
                        </div>
                    </header>

                    <div role="separator" style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)", marginBottom: 80 }} />

                    {/* ── MAIN ── */}
                    <main id="main-content" ref={mainRef} tabIndex={-1} style={{ outline: "none" }}>

                        {/* S1 */}
                        <article aria-labelledby="s1-heading" style={{ marginBottom: 80 }}>
                            <SecMark n="01 / 04" />
                            <h2 id="s1-heading" style={{
                                fontFamily: "'Instrument Serif',serif", fontSize: "clamp(34px,3.8vw,52px)",
                                fontWeight: 400, lineHeight: 1.15, margin: "0 0 22px"
                            }}>
                                {C("s1").h}
                            </h2>
                            <p style={{ color: "#ccc8c0", marginBottom: 20 }}>{C("s1").p}</p>
                            <p style={{ color: "#ccc8c0", marginBottom: 32 }}>{C("s1").p2}</p>
                            
                            {mode === "code" && <Callout type="code"><strong style={{ color: T.blue }}>nn.Embedding(vocab, dim)</strong><br /><span style={{ color: T.dim, fontSize: 16 }}>// Replaces sparse one-hot arrays with dense, trainable float arrays.</span></Callout>}
                            {mode === "banter" && <Callout type="warn">Nobody knows how exactly a 1536-dimensional space encodes sarcasm, but it does, and it's plotting against you.</Callout>}
                        </article>

                        {/* S2 */}
                        <article aria-labelledby="s2-heading" style={{ marginBottom: 60 }}>
                            <SecMark n="02 / 04" />
                            <h2 id="s2-heading" style={{
                                fontFamily: "'Instrument Serif',serif", fontSize: "clamp(34px,3.8vw,52px)",
                                fontWeight: 400, lineHeight: 1.15, margin: "0 0 22px"
                            }}>
                                {C("s2").h}
                            </h2>
                            <p style={{ color: "#ccc8c0", marginBottom: 20 }}>{C("s2").p}</p>
                            <p style={{ color: "#ccc8c0", marginBottom: 0 }}>{C("s2").p2}</p>
                        </article>

                        <WordMap mc={mc} />

                        {/* S3 */}
                        <article aria-labelledby="s3-heading" style={{ marginBottom: 40, marginTop: 100 }}>
                            <SecMark n="03 / 04" />
                            <h2 id="s3-heading" style={{
                                fontFamily: "'Instrument Serif',serif", fontSize: "clamp(34px,3.8vw,52px)",
                                fontWeight: 400, lineHeight: 1.15, margin: "0 0 22px"
                            }}>
                                {C("s3").h}
                            </h2>
                            <p style={{ color: "#ccc8c0", marginBottom: 20 }}>{C("s3").p}</p>
                            <p style={{ color: "#ccc8c0", marginBottom: 0 }}>{C("s3").p2}</p>
                        </article>

                        <VectorMathWidget />

                        {/* S4: HIGH DIMENSIONS + NEXT */}
                        <article aria-labelledby="s4-heading" style={{ marginBottom: 80 }}>
                            <SecMark n="04 / 04" />
                            <h2 id="s4-heading" style={{
                                fontFamily: "'Instrument Serif',serif", fontSize: "clamp(34px,3.8vw,52px)",
                                fontWeight: 400, lineHeight: 1.15, margin: "0 0 22px"
                            }}>
                                {mode === "banter" ? "We ran out of space in 3D, so we made 1500 more dimensions." :
                                    mode === "five" ? "The map has thousands of sides! 🤯" :
                                        "1536 Dimensions (The Reality)"}
                            </h2>
                            <p style={{ color: "#ccc8c0", marginBottom: 60 }}>
                                {mode === "banter" ? "If you thought 2D was cool, wait till you realize ChatGPT uses a 1536-dimensional space to store concepts like 'existential dread.' Human brains literally cannot visualize this. We just trust the dot products." :
                                    mode === "five" ? "A normal map has Up/Down and Left/Right. But the AI's map has thousands of directions! One direction for Fluffy, one direction for heavy, one direction for smelly... it tracks everything!" :
                                        "A 2D space isn't enough to capture the nuance of human language. Modern embeddings like OpenAI's text-embedding-ada-002 map every word and sentence into a 1536-dimensional space. Thousands of axes computing relationships simultaneously."}
                            </p>

                            {/* NEXT EPISODE TEASER */}
                            <div style={{
                                background: "linear-gradient(135deg,rgba(62,207,207,0.05),rgba(91,156,246,0.05))",
                                border: `1px solid ${T.teal}44`, borderRadius: 16, padding: 28, position: "relative", overflow: "hidden"
                            }}>
                                <div aria-hidden="true"
                                    style={{
                                        position: "absolute", top: 0, right: 0, width: 180, height: 180,
                                        background: "radial-gradient(circle,rgba(91,156,246,0.1),transparent 70%)", pointerEvents: "none"
                                    }} />
                                <p style={{ fontFamily: "monospace", fontSize: 18, color: T.teal, letterSpacing: "0.1em", margin: "0 0 12px" }}>COMING NEXT — MODULE 04</p>
                                <h3 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, margin: "0 0 12px" }}>
                                    Self-Attention: <em style={{ color: T.teal }}>The Transformer Core</em>
                                </h3>
                                <p style={{ color: T.muted, fontSize: 23, margin: "0 0 20px", lineHeight: 1.75 }}>
                                    How words finally learn to look at the other words around them. The mechanism that threw out RNNs, changed natural language processing forever, and birthed the LLM era.
                                </p>
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    {["Q,K,V Matrices", "Dot-Product Attention", "Masking", "Context Windows"].map(t => (
                                        <span key={t} style={{
                                            fontFamily: "monospace", fontSize: 18, color: T.teal,
                                            background: "rgba(62,207,207,0.1)", border: `1px solid rgba(62,207,207,0.2)`,
                                            padding: "4px 12px", borderRadius: 20
                                        }}>{t}</span>
                                    ))}
                                </div>
                            </div>
                        </article>

                        {/* QUIZ */}
                        <ObsidianQuiz />
                        
                    </main>

                    {/* FOOTER */}
                    <footer style={{ borderTop: `1px solid ${T.border}`, padding: "40px 0", textAlign: "center", marginTop: 40 }}>
                        <p style={{ color: T.muted, fontSize: 20, margin: 0 }}>
                            <strong style={{ color: T.text }}>Gradient Descent</strong> part of the AI For Humans interactive series.
                        </p>
                        <p style={{ color: T.dim, fontSize: 19, marginTop: 6 }}>
                            Press <strong style={{ color: T.text }}>Tab</strong> to navigate by keyboard.
                        </p>
                    </footer>
                </div>
            </div>
        </>
    );
}
