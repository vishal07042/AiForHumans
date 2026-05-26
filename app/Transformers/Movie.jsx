import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// SCRIPT: ~3 min movie, scene by scene
// Each beat: { speaker, text, duration(ms), bg, visualKey }
// ─────────────────────────────────────────────
const SCRIPT = [
    // ── COLD OPEN ──────────────────────────────
    { speaker: null, text: null, duration: 2200, bg: "night", visualKey: "title", caption: "A Pixel Short Film" },

    // ── ACT 1: INTRO ───────────────────────────
    { speaker: "ARIA", text: "MAX. I have a question.", duration: 2400, bg: "lab", visualKey: "idle", mood: "normal" },
    { speaker: "MAX", text: "Is it about Transformers again?", duration: 2400, bg: "lab", visualKey: "idle", mood: "tired" },
    { speaker: "ARIA", text: "How did you know??", duration: 2000, bg: "lab", visualKey: "surprised", mood: "surprised" },
    { speaker: "MAX", text: "Because it's ALWAYS Transformers.", duration: 2200, bg: "lab", visualKey: "idle", mood: "sigh" },
    { speaker: "ARIA", text: "OK so. What even IS a Transformer?", duration: 2600, bg: "lab", visualKey: "idle", mood: "curious" },
    { speaker: "MAX", text: "Not the robot. Not the movie. The AI architecture.", duration: 2800, bg: "lab", visualKey: "point", mood: "normal" },
    { speaker: "ARIA", text: "...I was thinking the robot.", duration: 2000, bg: "lab", visualKey: "idle", mood: "sheepish" },
    { speaker: "MAX", text: "Of course you were. OK, story time.", duration: 2400, bg: "lab", visualKey: "stretch", mood: "normal" },

    // ── ACT 2: RNNs ────────────────────────────
    { speaker: "MAX", text: "Before 2017, everyone used RNNs to process text.", duration: 3000, bg: "classroom", visualKey: "teach", mood: "normal" },
    { speaker: "ARIA", text: "R-N-N... sounds like a robot sneezing.", duration: 2400, bg: "classroom", visualKey: "idle", mood: "amused" },
    { speaker: "MAX", text: "Recurrent Neural Network. It reads words one. by. one.", duration: 3200, bg: "classroom", visualKey: "rnn_anim", mood: "normal" },
    { speaker: "ARIA", text: "Like me reading on a Monday morning.", duration: 2200, bg: "classroom", visualKey: "idle", mood: "tired" },
    { speaker: "MAX", text: "And it carries a hidden state — like a notepad — updating as it reads.", duration: 3400, bg: "classroom", visualKey: "notepad", mood: "normal" },
    { speaker: "ARIA", text: "OK that's clever actually.", duration: 2000, bg: "classroom", visualKey: "idle", mood: "impressed" },
    { speaker: "MAX", text: "Yeah. Except... it FORGETS things.", duration: 2600, bg: "classroom", visualKey: "vanish", mood: "dramatic" },
    { speaker: "ARIA", text: "What do you mean forgets?", duration: 2200, bg: "classroom", visualKey: "curious", mood: "curious" },
    { speaker: "MAX", text: "By word 50, it barely remembers word 1. The gradient vanishes.", duration: 3400, bg: "classroom", visualKey: "vanish", mood: "normal" },
    { speaker: "ARIA", text: "That's me in every meeting.", duration: 2000, bg: "classroom", visualKey: "idle", mood: "amused" },
    { speaker: "MAX", text: "Also, it's sequential. Word 2 waits for word 1. Word 3 waits for word 2...", duration: 3400, bg: "classroom", visualKey: "queue", mood: "normal" },
    { speaker: "ARIA", text: "So the GPU is just... sitting there?", duration: 2200, bg: "classroom", visualKey: "idle", mood: "shocked" },
    { speaker: "MAX", text: "Crying. The GPU is crying.", duration: 2200, bg: "classroom", visualKey: "idle", mood: "deadpan" },
    { speaker: "ARIA", text: "Oof. So someone fixed this?", duration: 2000, bg: "classroom", visualKey: "idle", mood: "curious" },
    { speaker: "MAX", text: "Eight engineers in 2017 blew the whole thing up.", duration: 2800, bg: "classroom", visualKey: "explosion", mood: "dramatic" },

    // ── ACT 3: ATTENTION ───────────────────────
    { speaker: "MAX", text: "Their paper was called 'Attention Is All You Need.'", duration: 3000, bg: "whiteboard", visualKey: "title_paper", mood: "normal" },
    { speaker: "ARIA", text: "That title is SO confident.", duration: 2200, bg: "whiteboard", visualKey: "idle", mood: "amused" },
    { speaker: "MAX", text: "Annoyingly confident. And annoyingly correct.", duration: 2600, bg: "whiteboard", visualKey: "idle", mood: "resigned" },
    { speaker: "ARIA", text: "So what's the big idea?", duration: 2200, bg: "whiteboard", visualKey: "idle", mood: "curious" },
    { speaker: "MAX", text: "Instead of reading one word at a time — every word looks at every other word. Simultaneously.", duration: 3800, bg: "whiteboard", visualKey: "attention_web", mood: "excited" },
    { speaker: "ARIA", text: "WHAT. All at once?!", duration: 2000, bg: "whiteboard", visualKey: "surprised", mood: "shocked" },
    { speaker: "MAX", text: "All at once. The GPU stops crying. It's beautiful.", duration: 2800, bg: "whiteboard", visualKey: "happy_gpu", mood: "happy" },
    { speaker: "ARIA", text: "But how does a word know which other word to pay attention TO?", duration: 3200, bg: "whiteboard", visualKey: "think", mood: "curious" },
    { speaker: "MAX", text: "Ohhh. Great question. That's where Q, K and V come in.", duration: 3000, bg: "whiteboard", visualKey: "qkv_intro", mood: "excited" },

    // ── ACT 4: Q K V ───────────────────────────
    { speaker: "ARIA", text: "Q K V... is this chess?", duration: 2200, bg: "qkv_room", visualKey: "idle", mood: "confused" },
    { speaker: "MAX", text: "No. Think YouTube search.", duration: 2200, bg: "qkv_room", visualKey: "teach", mood: "normal" },
    { speaker: "ARIA", text: "...I'm listening.", duration: 1800, bg: "qkv_room", visualKey: "lean", mood: "curious" },
    { speaker: "MAX", text: "You type a query. YouTube matches it against video keys — titles, tags.", duration: 3400, bg: "qkv_room", visualKey: "query_key", mood: "normal" },
    { speaker: "MAX", text: "Then returns the value — the actual video.", duration: 2800, bg: "qkv_room", visualKey: "query_value", mood: "normal" },
    { speaker: "ARIA", text: "So Q is what I'm searching for, K is what things advertise, V is the content?", duration: 3800, bg: "qkv_room", visualKey: "qkv_label", mood: "thinking" },
    { speaker: "MAX", text: "EXACTLY. Give the student a gold star!", duration: 2400, bg: "qkv_room", visualKey: "celebrate", mood: "excited" },
    { speaker: "ARIA", text: "And the model LEARNS what Q K V should be?", duration: 2600, bg: "qkv_room", visualKey: "idle", mood: "curious" },
    { speaker: "MAX", text: "During training, yes. It figures out the right questions to ask, and what to offer.", duration: 3600, bg: "qkv_room", visualKey: "teach", mood: "normal" },
    { speaker: "ARIA", text: "That's actually kinda magical.", duration: 2200, bg: "qkv_room", visualKey: "idle", mood: "impressed" },
    { speaker: "MAX", text: "Don't let it go to its head. It's just matrix multiplication.", duration: 2800, bg: "qkv_room", visualKey: "deadpan", mood: "deadpan" },

    // ── ACT 5: MULTI-HEAD ──────────────────────
    { speaker: "ARIA", text: "You mentioned 8 heads earlier. Why 8?", duration: 2800, bg: "lab", visualKey: "idle", mood: "curious" },
    { speaker: "MAX", text: "Because one attention head can only focus on one thing at a time.", duration: 3200, bg: "lab", visualKey: "one_head", mood: "normal" },
    { speaker: "ARIA", text: "Like me. One tab open at a time.", duration: 2200, bg: "lab", visualKey: "idle", mood: "sheepish" },
    { speaker: "MAX", text: "Exactly you. So they run 8 in parallel. Each head specializes.", duration: 3200, bg: "lab", visualKey: "multi_head", mood: "excited" },
    { speaker: "ARIA", text: "Like one watches grammar, one watches meaning...?", duration: 2800, bg: "lab", visualKey: "idle", mood: "curious" },
    { speaker: "MAX", text: "Yes! One does coreference. One does syntax. One does... vibes probably.", duration: 3200, bg: "lab", visualKey: "multi_head", mood: "amused" },
    { speaker: "ARIA", text: "VIBES. A head dedicated to vibes.", duration: 2200, bg: "lab", visualKey: "laugh", mood: "laughing" },
    { speaker: "MAX", text: "We don't fully know what each head does. Interpretability is hard.", duration: 3000, bg: "lab", visualKey: "shrug", mood: "shrug" },
    { speaker: "ARIA", text: "So we built the most powerful AI ever and we don't know how it thinks.", duration: 3200, bg: "lab", visualKey: "idle", mood: "shocked" },
    { speaker: "MAX", text: "Welcome to deep learning.", duration: 2000, bg: "lab", visualKey: "idle", mood: "deadpan" },

    // ── ACT 6: POSITIONAL ──────────────────────
    { speaker: "ARIA", text: "Wait wait wait. If everything is parallel, how does it know word ORDER?", duration: 3400, bg: "whiteboard", visualKey: "think", mood: "curious" },
    { speaker: "MAX", text: "...It doesn't. Not naturally.", duration: 2400, bg: "whiteboard", visualKey: "idle", mood: "guilty" },
    { speaker: "ARIA", text: "WHAT.", duration: 1800, bg: "whiteboard", visualKey: "shocked", mood: "shocked" },
    { speaker: "MAX", text: "Self-attention is completely position-blind. Shuffle the tokens? Same math.", duration: 3600, bg: "whiteboard", visualKey: "shuffle", mood: "normal" },
    { speaker: "ARIA", text: "So 'cat bit dog' and 'dog bit cat' look THE SAME to it?!", duration: 3200, bg: "whiteboard", visualKey: "idle", mood: "panicked" },
    { speaker: "MAX", text: "Without positional encoding, yes. So they inject sine wave signals into every token.", duration: 3600, bg: "whiteboard", visualKey: "sine_wave", mood: "normal" },
    { speaker: "ARIA", text: "So the title 'Attention Is All You Need' is a LIE?", duration: 3000, bg: "whiteboard", visualKey: "point_accuse", mood: "gotcha" },
    { speaker: "MAX", text: "Attention is all you need... plus position encoding. They didn't fit that on the title.", duration: 3800, bg: "whiteboard", visualKey: "idle", mood: "resigned" },
    { speaker: "ARIA", text: "Ha! Scientists are so bad at naming things.", duration: 2400, bg: "whiteboard", visualKey: "laugh", mood: "laughing" },
    { speaker: "MAX", text: "We really are.", duration: 1800, bg: "whiteboard", visualKey: "idle", mood: "agree" },

    // ── ACT 7: FINALE ──────────────────────────
    { speaker: "ARIA", text: "So... every AI I've used is built on THIS?", duration: 2800, bg: "cosmos", visualKey: "cosmos", mood: "wonder" },
    { speaker: "MAX", text: "GPT. Claude. Gemini. Llama. All of them. Transformers.", duration: 3200, bg: "cosmos", visualKey: "models_appear", mood: "normal" },
    { speaker: "ARIA", text: "And it all started from a 15-page paper in 2017.", duration: 2800, bg: "cosmos", visualKey: "idle", mood: "amazed" },
    { speaker: "MAX", text: "Eight people changed everything. Not bad for a Tuesday.", duration: 3000, bg: "cosmos", visualKey: "idle", mood: "wry" },
    { speaker: "ARIA", text: "I'm going to go re-read that paper.", duration: 2400, bg: "cosmos", visualKey: "walk_off", mood: "determined" },
    { speaker: "MAX", text: "The math hits hard. Bring snacks.", duration: 2400, bg: "cosmos", visualKey: "idle", mood: "warn" },
    { speaker: "ARIA", text: "Will the GPU be OK?", duration: 2200, bg: "cosmos", visualKey: "idle", mood: "concerned" },
    { speaker: "MAX", text: "The GPU is thriving. It has never been happier.", duration: 2600, bg: "cosmos", visualKey: "happy_gpu", mood: "happy" },
    { speaker: null, text: null, duration: 3000, bg: "cosmos", visualKey: "end_card", caption: "THE END" },
];

// Total ~ 3 min

// ─────────────────────────────────────────────
// PIXEL ART CHARACTER RENDERER
// ─────────────────────────────────────────────

// Aria: pink hair, blue outfit — curious student
function PixelAria({ mood = "normal", flip = false, scale = 1 }) {
    const body = [
        // hair
        { x: 1, y: 0, c: "#f472b6" }, { x: 2, y: 0, c: "#f472b6" }, { x: 3, y: 0, c: "#f472b6" },
        { x: 0, y: 1, c: "#f472b6" }, { x: 1, y: 1, c: "#f9a8d4" }, { x: 2, y: 1, c: "#f9a8d4" }, { x: 3, y: 1, c: "#f472b6" }, { x: 4, y: 1, c: "#f472b6" },
        // face
        { x: 1, y: 2, c: "#fde68a" }, { x: 2, y: 2, c: "#fde68a" }, { x: 3, y: 2, c: "#fde68a" },
        { x: 1, y: 3, c: "#fde68a" }, { x: 2, y: 3, c: "#fde68a" }, { x: 3, y: 3, c: "#fde68a" },
        // eyes
        { x: 1, y: 2, c: mood === "shocked" || mood === "panicked" ? "#ffffff" : "#fde68a" },
        { x: 2, y: 3, c: mood === "surprised" || mood === "shocked" ? "#60a5fa" : "#1e3a5f" },
        { x: mood === "surprised" ? 1 : 1, y: 3, c: "#1e3a5f" },
        // mouth
        { x: 2, y: 4, c: mood === "laughing" || mood === "excited" || mood === "amused" ? "#ef4444" : mood === "sad" || mood === "tired" ? "#94a3b8" : "#c0737a" },
        // body
        { x: 1, y: 5, c: "#3b82f6" }, { x: 2, y: 5, c: "#3b82f6" }, { x: 3, y: 5, c: "#3b82f6" },
        { x: 1, y: 6, c: "#3b82f6" }, { x: 2, y: 6, c: "#2563eb" }, { x: 3, y: 6, c: "#3b82f6" },
        // legs
        { x: 1, y: 7, c: "#1d4ed8" }, { x: 3, y: 7, c: "#1d4ed8" },
        { x: 1, y: 8, c: "#1e293b" }, { x: 3, y: 8, c: "#1e293b" },
        // arms
        { x: 0, y: 5, c: "#fde68a" }, { x: 4, y: 5, c: "#fde68a" },
        { x: mood === "think" || mood === "curious" ? -1 : 0, y: 6, c: mood === "thinking" ? "#fde68a" : "transparent" },
    ];

    const px = 7;
    const W = 5 * px;
    const H = 9 * px;

    return (
        <svg width={W * scale} height={H * scale} viewBox={`0 0 ${W} ${H}`}
            style={{ transform: flip ? "scaleX(-1)" : "none", imageRendering: "pixelated" }}>
            {[
                // hair
                [1, 0, "#ec4899"], [2, 0, "#ec4899"], [3, 0, "#ec4899"],
                [0, 1, "#ec4899"], [1, 1, "#f9a8d4"], [2, 1, "#f9a8d4"], [3, 1, "#f9a8d4"], [4, 1, "#ec4899"],
                // face
                [1, 2, "#fde68a"], [2, 2, "#fde68a"], [3, 2, "#fde68a"],
                [1, 3, "#fde68a"], [2, 3, "#fde68a"], [3, 3, "#fde68a"],
                [0, 3, "#ec4899"], // hair side
                // eyes
                [1, 2, "#60a5fa"], [3, 2, "#60a5fa"],
                // mouth
                [2, 3, mood === "laughing" || mood === "amused" || mood === "excited" || mood === "impressed" || mood === "happy" ? "#ef4444" : mood === "tired" || mood === "sheepish" ? "#94a3b8" : "#c0737a"],
                // brow
                [1, 1, "#ec4899"], [3, 1, "#ec4899"],
                // body
                [1, 4, "#3b82f6"], [2, 4, "#3b82f6"], [3, 4, "#3b82f6"],
                [1, 5, "#3b82f6"], [2, 5, "#2563eb"], [3, 5, "#3b82f6"],
                // arms
                [0, 4, "#fde68a"], [4, 4, mood === "think" || mood === "curious" ? "#fde68a" : "#3b82f6"],
                [0, 5, "#fde68a"], [4, 5, mood === "think" || mood === "curious" ? "#fde68a" : "#fde68a"],
                // raised arm for think
                ...(mood === "think" || mood === "curious" ? [[4, 3, "#fde68a"]] : []),
                // legs
                [1, 6, "#1d4ed8"], [3, 6, "#1d4ed8"],
                [1, 7, "#1e293b"], [3, 7, "#1e293b"],
            ].map(([x, y, c], i) => c !== "transparent" && (
                <rect key={i} x={x * px} y={y * px} width={px} height={px} fill={c} />
            ))}
        </svg>
    );
}

// Max: white hair, lab coat — tired but wise
function PixelMax({ mood = "normal", flip = false, scale = 1 }) {
    const px = 7;
    const W = 5 * px;
    const H = 9 * px;

    return (
        <svg width={W * scale} height={H * scale} viewBox={`0 0 ${W} ${H}`}
            style={{ transform: flip ? "scaleX(-1)" : "none", imageRendering: "pixelated" }}>
            {[
                // hair (white/grey)
                [1, 0, "#e2e8f0"], [2, 0, "#e2e8f0"], [3, 0, "#e2e8f0"],
                [0, 1, "#cbd5e1"], [1, 1, "#f1f5f9"], [2, 1, "#f1f5f9"], [3, 1, "#f1f5f9"], [4, 1, "#cbd5e1"],
                // face
                [1, 2, "#fde68a"], [2, 2, "#fde68a"], [3, 2, "#fde68a"],
                [1, 3, "#fde68a"], [2, 3, "#fde68a"], [3, 3, "#fde68a"],
                [0, 3, "#e2e8f0"],
                // eyes
                [1, 2, mood === "tired" || mood === "sigh" ? "#475569" : "#1e293b"],
                [3, 2, mood === "tired" || mood === "sigh" ? "#475569" : "#1e293b"],
                // glasses
                [1, 2, "#60a5fa"], [3, 2, "#60a5fa"], [2, 2, "#94a3b8"],
                // mouth
                [2, 3, mood === "excited" || mood === "happy" || mood === "amused" ? "#ef4444" : mood === "deadpan" || mood === "tired" ? "#64748b" : mood === "sigh" || mood === "resigned" ? "#94a3b8" : "#c0737a"],
                // lab coat
                [1, 4, "#f8fafc"], [2, 4, "#f8fafc"], [3, 4, "#f8fafc"],
                [1, 5, "#f8fafc"], [2, 5, "#e2e8f0"], [3, 5, "#f8fafc"],
                // arms
                [0, 4, "#fde68a"], [4, 4, "#fde68a"],
                [0, 5, mood === "teach" || mood === "point" ? "#fde68a" : "#f8fafc"],
                [4, 5, "#fde68a"],
                // raised pointing arm
                ...(mood === "teach" || mood === "point" ? [[-1, 4, "#fde68a"], [-1, 3, "#fde68a"]] : []),
                // legs
                [1, 6, "#334155"], [3, 6, "#334155"],
                [1, 7, "#1e293b"], [3, 7, "#1e293b"],
            ].map(([x, y, c], i) => (
                <rect key={i} x={x * px} y={y * px} width={px} height={px} fill={c} />
            ))}
        </svg>
    );
}

// ─────────────────────────────────────────────
// BACKGROUND SCENES
// ─────────────────────────────────────────────
function BgNight() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 800 400" style={{ position: "absolute", inset: 0 }}>
            <rect width="800" height="400" fill="#020209" />
            {Array.from({ length: 60 }).map((_, i) => (
                <rect key={i} x={(i * 137) % 800} y={(i * 93) % 300} width="2" height="2"
                    fill="white" opacity={0.3 + ((i * 7) % 10) * 0.05} />
            ))}
            <rect x="0" y="330" width="800" height="70" fill="#0a0a14" />
            <rect x="0" y="355" width="800" height="3" fill="#1e293b" />
        </svg>
    );
}

function BgLab() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 800 400" style={{ position: "absolute", inset: 0 }}>
            <rect width="800" height="400" fill="#0f172a" />
            {/* Grid floor */}
            {Array.from({ length: 16 }).map((_, i) => (
                <line key={`v${i}`} x1={i * 52} y1="300" x2={i * 52} y2="400" stroke="#1e293b" strokeWidth="1" />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
                <line key={`h${i}`} x1="0" y1={300 + i * 25} x2="800" y2={300 + i * 25} stroke="#1e293b" strokeWidth="1" />
            ))}
            {/* Wall */}
            <rect x="0" y="0" width="800" height="300" fill="#0c1526" />
            <rect x="0" y="298" width="800" height="4" fill="#1e293b" />
            {/* Screen on wall */}
            <rect x="300" y="60" width="200" height="130" rx="4" fill="#0a1628" stroke="#334155" strokeWidth="2" />
            <rect x="308" y="68" width="184" height="114" fill="#0d1f38" />
            {/* Code lines on screen */}
            {["#22c55e", "#3b82f6", "#f59e0b", "#22c55e", "#94a3b8"].map((c, i) => (
                <rect key={i} x="318" y={78 + i * 18} width={60 + i * 15} height="4" rx="2" fill={c} opacity="0.6" />
            ))}
            {/* Desk */}
            <rect x="0" y="295" width="800" height="12" fill="#1e293b" />
        </svg>
    );
}

function BgClassroom() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 800 400" style={{ position: "absolute", inset: 0 }}>
            <rect width="800" height="400" fill="#0c1220" />
            <rect x="0" y="0" width="800" height="280" fill="#0a1020" />
            {/* Blackboard */}
            <rect x="120" y="40" width="560" height="200" rx="4" fill="#0d2b1a" stroke="#14532d" strokeWidth="3" />
            <rect x="132" y="52" width="536" height="176" fill="#0a2416" />
            {/* Chalk writing on board */}
            <text x="400" y="100" textAnchor="middle" fontSize="11" fill="#d1fae5" fontFamily="monospace" opacity="0.7">RNN: word₁ → word₂ → word₃ → ...</text>
            <text x="400" y="125" textAnchor="middle" fontSize="11" fill="#fef9c3" fontFamily="monospace" opacity="0.6">gradient → vanishes 💀</text>
            <text x="400" y="155" textAnchor="middle" fontSize="10" fill="#bfdbfe" fontFamily="monospace" opacity="0.5">sequential = not parallelizable</text>
            {/* Floor */}
            <rect x="0" y="280" width="800" height="120" fill="#0a0e18" />
            <rect x="0" y="278" width="800" height="4" fill="#1e293b" />
        </svg>
    );
}

function BgWhiteboard() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 800 400" style={{ position: "absolute", inset: 0 }}>
            <rect width="800" height="400" fill="#0f172a" />
            <rect x="80" y="30" width="640" height="220" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <rect x="92" y="42" width="616" height="196" fill="#f8fafc" />
            {/* Marker drawings */}
            <text x="400" y="90" textAnchor="middle" fontSize="13" fill="#1e293b" fontFamily="monospace">softmax( Q·Kᵀ / √d ) · V</text>
            {["Q = query", "K = key", "V = value"].map((t, i) => (
                <text key={i} x={200 + i * 200} y="130" textAnchor="middle" fontSize="11" fill="#334155" fontFamily="monospace">{t}</text>
            ))}
            {/* connection lines */}
            {[0, 1, 2, 3, 4].map(i => (
                <circle key={i} cx={180 + i * 110} cy="175" r="18" fill="none" stroke={["#f43f5e", "#f97316", "#eab308", "#22c55e", "#3b82f6"][i]} strokeWidth="2" />
            ))}
            {[0, 1, 2, 3].map(i => (
                <line key={i} x1={198 + i * 110} y1="175" x2={262 + i * 110} y2="175" stroke="#94a3b8" strokeWidth="1" />
            ))}
            <rect x="0" y="280" width="800" height="120" fill="#0c1018" />
            <rect x="0" y="278" width="800" height="4" fill="#1e293b" />
        </svg>
    );
}

function BgQkvRoom() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 800 400" style={{ position: "absolute", inset: 0 }}>
            <rect width="800" height="400" fill="#0d0d1f" />
            {/* Q K V floating panels */}
            {[{ l: "Q", x: 150, c: "#6366f1" }, { l: "K", x: 400, c: "#a78bfa" }, { l: "V", x: 650, c: "#c4b5fd" }].map((p, i) => (
                <g key={i}>
                    <rect x={p.x - 50} y="50" width="100" height="80" rx="8" fill="#1e1b4b" stroke={p.c} strokeWidth="2" opacity="0.7" />
                    <text x={p.x} y="103" textAnchor="middle" fontSize="36" fill={p.c} fontFamily="monospace" fontWeight="bold">{p.l}</text>
                </g>
            ))}
            <rect x="0" y="280" width="800" height="120" fill="#0a0814" />
            <rect x="0" y="278" width="800" height="4" fill="#312e81" />
        </svg>
    );
}

function BgCosmos() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 800 400" style={{ position: "absolute", inset: 0 }}>
            <defs>
                <radialGradient id="cosmos" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#0a0a2e" />
                    <stop offset="100%" stopColor="#020208" />
                </radialGradient>
            </defs>
            <rect width="800" height="400" fill="url(#cosmos)" />
            {Array.from({ length: 100 }).map((_, i) => (
                <rect key={i} x={(i * 137) % 800} y={(i * 93) % 380} width={i % 5 === 0 ? "3" : "1"} height={i % 5 === 0 ? "3" : "1"}
                    fill="white" opacity={0.1 + ((i * 7) % 10) * 0.05} />
            ))}
            {/* nebula blobs */}
            {[[200, 150, "#6366f1"], [500, 200, "#22c55e"], [350, 300, "#f97316"]].map(([x, y, c], i) => (
                <ellipse key={i} cx={x} cy={y} rx="80" ry="40" fill={c} opacity="0.04" />
            ))}
            <rect x="0" y="330" width="800" height="70" fill="rgba(0,0,0,0.5)" />
            <rect x="0" y="328" width="800" height="4" fill="#1e1b4b" />
        </svg>
    );
}

const BG_MAP = { night: BgNight, lab: BgLab, classroom: BgClassroom, whiteboard: BgWhiteboard, qkv_room: BgQkvRoom, cosmos: BgCosmos };

// ─────────────────────────────────────────────
// VISUAL OVERLAYS per beat
// ─────────────────────────────────────────────
function Visual({ visualKey, progress }) {
    const p = Math.min(1, progress * 2);

    if (visualKey === "title") return (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ fontSize: "11px", color: "#475569", letterSpacing: "6px", fontFamily: "monospace", marginBottom: "10px", opacity: p }}>A PIXEL SHORT FILM</div>
            <div style={{ fontSize: "clamp(18px,4vw,36px)", color: "white", fontFamily: "'Courier New',monospace", fontWeight: "bold", letterSpacing: "2px", textAlign: "center", opacity: p, textShadow: "0 0 30px #6366f1" }}>
                ATTENTION IS<br />ALL YOU NEED
            </div>
            <div style={{ marginTop: "14px", fontSize: "10px", color: "#334155", letterSpacing: "4px", fontFamily: "monospace", opacity: p }}>TRANSFORMERS EXPLAINED</div>
        </div>
    );

    if (visualKey === "rnn_anim") return (
        <div style={{ position: "absolute", top: "40px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "4px", alignItems: "center", pointerEvents: "none" }}>
            {["The", "cat", "sat", "on", "mat"].map((w, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", opacity: Math.max(0, Math.min(1, p * 5 - i * 0.8)) }}>
                    <div style={{ width: "36px", height: "22px", background: "#1e3a5f", border: "1px solid #3b82f6", borderRadius: "4px", fontSize: "8px", color: "#93c5fd", fontFamily: "monospace", display: "flex", alignItems: "center", justifyContent: "center" }}>h{i}</div>
                    {i < 4 && <div style={{ fontSize: "10px", color: "#3b82f6" }}>→</div>}
                    <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "3px", padding: "2px 5px", fontSize: "9px", color: "#94a3b8", fontFamily: "monospace" }}>{w}</div>
                </div>
            ))}
        </div>
    );

    if (visualKey === "vanish") return (
        <div style={{ position: "absolute", top: "35px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px", alignItems: "flex-end", pointerEvents: "none", opacity: p }}>
            {[1, 0.7, 0.45, 0.25, 0.1, 0.03].map((s, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: `rgba(239,68,68,${s})`, border: `1px solid rgba(239,100,100,${s})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "7px", color: "white", fontFamily: "monospace" }}>{Math.round(s * 100)}%</div>
                    <div style={{ fontSize: "7px", color: "#475569", fontFamily: "monospace" }}>w{i + 1}</div>
                </div>
            ))}
            <div style={{ fontSize: "9px", color: "#ef4444", fontFamily: "monospace", paddingBottom: "10px", marginLeft: "4px" }}>← gradient dies</div>
        </div>
    );

    if (visualKey === "attention_web") return (
        <svg style={{ position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }} width="260" height="90" viewBox="0 0 260 90">
            {["The", "cat", "sat", "it", "was"].map((w, i) => {
                const cx = 26 + i * 52, cy = 50;
                return (
                    <g key={i} opacity={Math.min(1, p * 2)}>
                        {[0, 1, 2, 3, 4].filter(j => j !== i).map(j => (
                            <line key={j} x1={cx} y1={cy} x2={26 + j * 52} y2={50}
                                stroke={i === 3 && j === 1 ? "#22c55e" : "#1e3a5f"}
                                strokeWidth={i === 3 && j === 1 ? 2 : 0.8} opacity={i === 3 && j === 1 ? 0.9 : 0.3} />
                        ))}
                        <circle cx={cx} cy={cy} r="18" fill={i === 3 ? "#14532d" : "#0f172a"} stroke={i === 3 ? "#22c55e" : i === 1 ? "#16a34a" : "#1e3a5f"} strokeWidth={i === 3 || i === 1 ? 2 : 1} />
                        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="8" fill={i === 3 ? "#86efac" : i === 1 ? "#4ade80" : "#475569"} fontFamily="monospace">{w}</text>
                    </g>
                );
            })}
            <text x="130" y="85" textAnchor="middle" fontSize="8" fill="#22c55e" fontFamily="monospace" opacity={p}>"it" → "cat" in one shot</text>
        </svg>
    );

    if (visualKey === "qkv_label" || visualKey === "query_key" || visualKey === "query_value") return (
        <div style={{ position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "12px", pointerEvents: "none", opacity: p }}>
            {[{ l: "Q", d: "What I seek", c: "#6366f1" }, { l: "K", d: "What I offer", c: "#a78bfa" }, { l: "V", d: "My content", c: "#c4b5fd" }].map((item, i) => (
                <div key={i} style={{ background: "#1e1b4b", border: `1px solid ${item.c}`, borderRadius: "6px", padding: "6px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: "20px", color: item.c, fontFamily: "monospace", fontWeight: "bold" }}>{item.l}</div>
                    <div style={{ fontSize: "8px", color: item.c, fontFamily: "monospace", marginTop: "2px", opacity: 0.8 }}>{item.d}</div>
                </div>
            ))}
        </div>
    );

    if (visualKey === "multi_head") return (
        <svg style={{ position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }} width="240" height="100" viewBox="0 0 240 100">
            {["#f43f5e", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"].map((c, i) => {
                const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
                const r = 36, cx = 120 + Math.cos(angle) * r, cy = 56 + Math.sin(angle) * r;
                return (
                    <g key={i} opacity={Math.min(1, p * 2)}>
                        <line x1="120" y1="56" x2={cx} y2={cy} stroke={c} strokeWidth="1" opacity="0.5" />
                        <circle cx={cx} cy={cy} r="12" fill={`${c}22`} stroke={c} strokeWidth="1.5" />
                        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="7" fill={c} fontFamily="monospace">H{i + 1}</text>
                    </g>
                );
            })}
            <circle cx="120" cy="56" r="14" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.5" opacity={p} />
            <text x="120" y="60" textAnchor="middle" fontSize="7" fill="#94a3b8" fontFamily="monospace" opacity={p}>token</text>
        </svg>
    );

    if (visualKey === "sine_wave") return (
        <svg style={{ position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }} width="280" height="80" viewBox="0 0 280 80">
            {[0, 1, 2].map(row => {
                const pts = Array.from({ length: 56 }, (_, i) => `${i * 5},${35 + Math.sin((i / 8) * Math.PI * 2 * (row + 1)) * 18}`).join(" ");
                return <polyline key={row} points={pts} fill="none" stroke={["#38bdf8", "#818cf8", "#34d399"][row]} strokeWidth="1.5" opacity={p * 0.8} />;
            })}
            <text x="140" y="74" textAnchor="middle" fontSize="8" fill="#64748b" fontFamily="monospace" opacity={p}>position signals injected per token</text>
        </svg>
    );

    if (visualKey === "models_appear") return (
        <div style={{ position: "absolute", top: "15px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", maxWidth: "320px", pointerEvents: "none" }}>
            {[["GPT", "#22c55e"], ["BERT", "#3b82f6"], ["Claude", "#a78bfa"], ["Gemini", "#06b6d4"], ["Llama", "#f97316"], ["T5", "#f43f5e"]].map(([name, c], i) => (
                <div key={i} style={{ background: `${c}18`, border: `1px solid ${c}`, borderRadius: "20px", padding: "3px 10px", fontSize: "9px", color: c, fontFamily: "monospace", opacity: Math.min(1, p * 3 - i * 0.3) }}>
                    {name}
                </div>
            ))}
        </div>
    );

    if (visualKey === "end_card") return (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ fontSize: "clamp(24px,5vw,52px)", color: "white", fontFamily: "'Courier New',monospace", fontWeight: "bold", opacity: p, textShadow: "0 0 40px #6366f1", letterSpacing: "4px" }}></div>
            <div style={{ marginTop: "12px", fontSize: "10px", color: "#334155", letterSpacing: "4px", fontFamily: "monospace", opacity: p }}>Next: The KV Cache</div>
        </div>
    );

    if (visualKey === "explosion") return (
        <div style={{ position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)", fontSize: "clamp(22px,4vw,38px)", opacity: p, pointerEvents: "none", textAlign: "center" }}>
            💥
            <div style={{ fontSize: "9px", color: "#f97316", fontFamily: "monospace", marginTop: "4px" }}>RNNs: demolished</div>
        </div>
    );

    if (visualKey === "happy_gpu") return (
        <div style={{ position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)", opacity: p, pointerEvents: "none", textAlign: "center" }}>
            <div style={{ fontSize: "28px" }}>🖥️✨</div>
            <div style={{ fontSize: "9px", color: "#22c55e", fontFamily: "monospace", marginTop: "2px" }}>GPU: never been happier</div>
        </div>
    );

    return null;
}

// ─────────────────────────────────────────────
// SPEECH BUBBLE
// ─────────────────────────────────────────────
function SpeechBubble({ text, side = "left", visible, progress }) {
    const chars = Math.floor((text || "").length * Math.min(1, progress * 3));
    const displayed = (text || "").slice(0, chars);
    if (!visible || !text) return null;
    return (
        <div style={{
            position: "absolute",
            bottom: "130px",
            ...(side === "left" ? { left: "clamp(80px,18%,160px)" } : { right: "clamp(80px,18%,160px)" }),
            maxWidth: "clamp(140px,38%,260px)",
            background: side === "left" ? "#1e3a5f" : "#1a0e2e",
            border: `2px solid ${side === "left" ? "#3b82f6" : "#8b5cf6"}`,
            borderRadius: "8px",
            padding: "8px 10px",
            fontSize: "clamp(9px,1.8vw,12px)",
            color: "white",
            fontFamily: "'Courier New', monospace",
            lineHeight: 1.5,
            zIndex: 10,
            boxShadow: `0 0 16px ${side === "left" ? "#3b82f620" : "#8b5cf620"}`,
        }}>
            {displayed}
            {chars < (text || "").length && <span style={{ opacity: 0.5 }}>▌</span>}
            {/* Tail */}
            <div style={{
                position: "absolute",
                bottom: "-10px",
                ...(side === "left" ? { left: "20px" } : { right: "20px" }),
                width: 0, height: 0,
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: `10px solid ${side === "left" ? "#3b82f6" : "#8b5cf6"}`,
            }} />
        </div>
    );
}

// ─────────────────────────────────────────────
// NAME TAGS
// ─────────────────────────────────────────────
function NameTag({ name, side, color }) {
    return (
        <div style={{
            position: "absolute",
            bottom: "94px",
            ...(side === "left" ? { left: "clamp(20px,5%,50px)" } : { right: "clamp(20px,5%,50px)" }),
            fontSize: "8px", color, fontFamily: "monospace", letterSpacing: "2px",
            background: "rgba(0,0,0,0.5)", padding: "2px 6px", borderRadius: "3px",
            border: `1px solid ${color}`, zIndex: 5,
        }}>{name}</div>
    );
}

// ─────────────────────────────────────────────
// MAIN MOVIE COMPONENT
// ─────────────────────────────────────────────
export default function TransformerPixelMovie() {
    const [beatIdx, setBeatIdx] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [beatProgress, setBeatProgress] = useState(0);
    const [bobOffset, setBobOffset] = useState(0);
    const startRef = useRef(null);
    const rafRef = useRef(null);
    const beatRafRef = useRef(null);
    const bobRef = useRef(null);

    const beat = SCRIPT[beatIdx] || SCRIPT[SCRIPT.length - 1];
    const BgComponent = BG_MAP[beat.bg] || BgLab;

    // Bob animation
    useEffect(() => {
        const animate = (ts) => {
            setBobOffset(Math.sin(ts / 400) * 3);
            bobRef.current = requestAnimationFrame(animate);
        };
        bobRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(bobRef.current);
    }, []);

    // Beat progress + auto-advance
    useEffect(() => {
        if (!isPlaying) { cancelAnimationFrame(beatRafRef.current); return; }
        startRef.current = null;
        const animate = (ts) => {
            if (!startRef.current) startRef.current = ts;
            const p = Math.min((ts - startRef.current) / beat.duration, 1);
            setBeatProgress(p);
            if (p < 1) {
                beatRafRef.current = requestAnimationFrame(animate);
            } else {
                setTimeout(() => {
                    if (beatIdx < SCRIPT.length - 1) {
                        setBeatIdx(b => b + 1);
                        setBeatProgress(0);
                    } else {
                        setIsPlaying(false);
                    }
                }, 200);
            }
        };
        beatRafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(beatRafRef.current);
    }, [isPlaying, beatIdx, beat.duration]);

    const goTo = (idx) => { setBeatIdx(idx); setBeatProgress(0); setIsPlaying(true); };
    const togglePlay = () => { if (!isPlaying) setBeatProgress(0); setIsPlaying(v => !v); };

    const ariaActive = beat.speaker === "ARIA";
    const maxActive = beat.speaker === "MAX";
    const ariaMood = beat.speaker === "ARIA" ? (beat.mood || "normal") : "normal";
    const maxMood = beat.speaker === "MAX" ? (beat.mood || "normal") : "normal";

    // Total time calc
    const totalMs = SCRIPT.reduce((a, b) => a + b.duration, 0);
    const elapsedMs = SCRIPT.slice(0, beatIdx).reduce((a, b) => a + b.duration, 0) + beatProgress * beat.duration;
    const totalProgress = elapsedMs / totalMs;

    const fmt = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;

    return (
        <div style={{
            background: "#000",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px",
            fontFamily: "'Courier New', monospace",
        }}>
            {/* Header */}
            <div style={{ color: "#334155", fontSize: "9px", letterSpacing: "4px", marginBottom: "10px", textTransform: "uppercase" }}>
                {/* LLM INTERNALS · EPISODE 02 · PIXEL FILM */}
            </div>

            {/* Movie Frame */}
            <div style={{
                width: "100%",
                maxWidth: "800px",
                aspectRatio: "2/1.15", // Slightly increases height
                position: "relative",
                borderRadius: "8px",
                overflow: "hidden",
                border: "2px solid #1e293b",
                boxShadow: "0 0 60px rgba(99,102,241,0.12)",
                background: "#000",
            }}>
       
                {/* Background */}
                <BgComponent />

                {/* Visual overlay */}
                <Visual visualKey={beat.visualKey} progress={beatProgress} />

                {/* Caption for title/end */}
                {beat.caption && (
                    <div style={{
                        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "clamp(14px,3vw,28px)", color: "white", fontFamily: "monospace", fontWeight: "bold",
                        letterSpacing: "4px", textShadow: "0 0 30px #6366f1",
                        opacity: Math.min(1, beatProgress * 2),
                        pointerEvents: "none",
                    }}>
                        {beat.caption}
                    </div>
                )}

                {/* Characters */}
                {beat.speaker !== null && (
                    <>
                        {/* ARIA — left side */}
                        <div style={{
                            position: "absolute",
                            bottom: "60px",
                            left: "clamp(16px,4%,40px)",
                            transform: `translateY(${ariaActive ? bobOffset : 0}px) scale(${ariaActive ? 1 : 0.88})`,
                            transition: "transform 0.3s ease",
                            filter: ariaActive ? "none" : "brightness(0.45)",
                            imageRendering: "pixelated",
                            zIndex: 6,
                        }}>
                            <PixelAria mood={ariaMood} scale={window.innerWidth < 500 ? 1.6 : 2.2} />
                        </div>

                        {/* MAX — right side */}
                        <div style={{
                            position: "absolute",
                            bottom: "60px",
                            right: "clamp(16px,4%,40px)",
                            transform: `translateY(${maxActive ? bobOffset : 0}px) scale(${maxActive ? 1 : 0.88})`,
                            transition: "transform 0.3s ease",
                            filter: maxActive ? "none" : "brightness(0.45)",
                            imageRendering: "pixelated",
                            zIndex: 6,
                        }}>
                            <PixelMax mood={maxMood} flip scale={window.innerWidth < 500 ? 1.6 : 2.2} />
                        </div>

                        {/* Name tags */}
                        <NameTag name="ARIA" side="left" color="#60a5fa" />
                        <NameTag name="MAX" side="right" color="#a78bfa" />

                        {/* Ground line */}
                        <div style={{ position: "absolute", bottom: "56px", left: 0, right: 0, height: "2px", background: "#1e293b", zIndex: 4 }} />

                        {/* Speech bubbles */}
                        <SpeechBubble text={beat.text} side={ariaActive ? "left" : "right"} visible={!!beat.speaker} progress={beatProgress} />
                    </>
                )}

                {/* Beat counter */}
                <div style={{
                    position: "absolute", top: "8px", right: "10px",
                    fontSize: "8px", color: "#334155", fontFamily: "monospace",
                    background: "rgba(0,0,0,0.6)", padding: "2px 6px", borderRadius: "3px",
                }}>
                    {beatIdx + 1}/{SCRIPT.length}
                </div>

                {/* Speaker tag */}
                {beat.speaker && (
                    <div style={{
                        position: "absolute", top: "8px", left: "10px",
                        fontSize: "8px", color: beat.speaker === "ARIA" ? "#60a5fa" : "#a78bfa",
                        fontFamily: "monospace", background: "rgba(0,0,0,0.6)",
                        padding: "2px 6px", borderRadius: "3px", letterSpacing: "2px",
                    }}>
                        {beat.speaker}
                    </div>
                )}
            </div>

            {/* Timeline bar */}
            <div style={{ width: "100%", maxWidth: "800px", marginTop: "10px" }}>
                <div style={{ height: "3px", background: "#0f172a", borderRadius: "2px", overflow: "hidden", cursor: "pointer" }}
                    onClick={e => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const ratio = (e.clientX - rect.left) / rect.width;
                        const targetMs = ratio * totalMs;
                        let acc = 0;
                        for (let i = 0; i < SCRIPT.length; i++) {
                            if (acc + SCRIPT[i].duration >= targetMs) { goTo(i); break; }
                            acc += SCRIPT[i].duration;
                        }
                    }}>
                    <div style={{ height: "100%", width: `${totalProgress * 100}%`, background: "linear-gradient(90deg,#6366f1,#ec4899)", transition: "width 0.1s linear" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "8px", color: "#334155", fontFamily: "monospace" }}>
                    <span>{fmt(elapsedMs)}</span>
                    <span>{fmt(totalMs)}</span>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                <button onClick={() => beatIdx > 0 && goTo(beatIdx - 1)} disabled={beatIdx === 0}
                    style={{ background: "none", border: "1px solid #1e293b", color: beatIdx === 0 ? "#1e293b" : "#64748b", padding: "6px 14px", borderRadius: "5px", cursor: "pointer", fontFamily: "monospace", fontSize: "11px" }}>
                    ◀ PREV
                </button>
                <button onClick={togglePlay}
                    style={{ background: isPlaying ? "#1e293b" : "#6366f1", border: "none", color: "white", padding: "8px 24px", borderRadius: "6px", cursor: "pointer", fontFamily: "monospace", fontSize: "11px", letterSpacing: "2px" }}>
                    {isPlaying ? "⏸ PAUSE" : "▶ PLAY"}
                </button>
                <button onClick={() => beatIdx < SCRIPT.length - 1 && goTo(beatIdx + 1)} disabled={beatIdx === SCRIPT.length - 1}
                    style={{ background: "none", border: "1px solid #1e293b", color: beatIdx === SCRIPT.length - 1 ? "#1e293b" : "#64748b", padding: "6px 14px", borderRadius: "5px", cursor: "pointer", fontFamily: "monospace", fontSize: "11px" }}>
                    NEXT ▶
                </button>
            </div>

            {/* Chapter markers */}
            <div style={{ display: "flex", gap: "5px", marginTop: "12px", flexWrap: "wrap", justifyContent: "center", maxWidth: "760px" }}>
                {[
                    { label: "Intro", idx: 0 },
                    { label: "RNNs", idx: 8 },
                    { label: "Attention", idx: 22 },
                    { label: "Q·K·V", idx: 30 },
                    { label: "Heads", idx: 41 },
                    { label: "Position", idx: 50 },
                    { label: "Finale", idx: 59 },
                ].map(ch => (
                    <button key={ch.label} onClick={() => goTo(ch.idx)}
                        style={{
                            background: beatIdx >= ch.idx && beatIdx < (ch.idx + 8) ? "#1e293b" : "none",
                            border: `1px solid ${beatIdx >= ch.idx && beatIdx < (ch.idx + 8) ? "#6366f1" : "#1e293b"}`,
                            // Color change for accessibility: use white text on selected (dark bg), keep existing color otherwise
                            color: beatIdx >= ch.idx && beatIdx < (ch.idx + 8) ? "#fff" : "#334155",
                            padding: "3px 10px", borderRadius: "4px", cursor: "pointer",
                            fontFamily: "monospace", fontSize: "12px", letterSpacing: "1px",
                        }}>
                        {ch.label}
                    </button>
                ))}
            </div>
    

            <div style={{ marginTop: "10px", fontSize: "8px", color: "#1e293b", fontFamily: "monospace", letterSpacing: "2px" }}>
                CLICK TIMELINE TO SCRUB · CHAPTER BUTTONS TO JUMP
            </div>
        </div>
    );
}