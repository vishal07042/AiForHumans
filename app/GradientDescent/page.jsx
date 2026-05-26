"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";

/* ─── DESIGN TOKENS ─────────────────────────────────────────────────────── */
const T = {
    bg: "#0b0b0d",
    surface: "#111114",
    card: "#17171b",
    border: "rgba(255,255,255,0.08)",
    border2: "rgba(255,255,255,0.14)",
    text: "#edeae4",
    muted: "#a8a49c",   /* was #8a877f — bumped for WCAG AA contrast */
    dim: "#909090",    /* was #555 — fails contrast at 3:1, now ~6:1 on dark bg */
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

/* ─── CONTENT ────────────────────────────────────────────────────────────── */
const CONTENT = {
    hero: {
        general: { title: "Gradient Descent", sub: "How AI learns by rolling a ball downhill — and why it sometimes gets stuck in a ditch forever." },
        five: { title: "Teaching AI to Not Be Dumb", sub: "Imagine you're blindfolded on a bumpy playground. You just want to find the lowest point. That's literally gradient descent." },
        code: { title: "Gradient Descent", sub: "The optimization algorithm underneath every model you've ever used. From math to intuition to implementation." },
        banter: { title: "Gradient Descent", sub: "A $3 trillion industry. Millions of engineers. The world's most powerful supercomputers. The secret? Roll a ball downhill and see where it stops. You're welcome." },
    },
    s1: {
        general: {
            h: "The problem: how does AI get better?",
            p: "You know neural networks have weights — millions of little numbers that decide how the network behaves. But how do those numbers actually get good? They start random. Useless. The network guessing whether a photo is a cat with the confidence of someone who has never seen a cat. Something has to fix that. That something is gradient descent.",
            p2: "Imagine you're standing on a hilly landscape, blindfolded. Your goal is to reach the lowest point — the valley. You can't see anything, but you can feel the slope under your feet. You take a small step in whichever direction feels downhill. Then another. Then another. Eventually you reach the bottom. That's gradient descent. The landscape is the loss function. The valley is where your AI is smart.",
        },
        five: {
            h: "You're blindfolded on bumpy ground 🙈",
            p: "Picture this: you're wearing a blindfold in a big park with lots of hills and valleys. Someone says 'find the lowest spot.' You can't see anything. But you CAN feel the ground tipping under your feet. If it tilts left, step left. If it tilts forward, step forward. Keep doing this until it stops tilting — that's the lowest spot!",
            p2: "That's exactly what AI does when it's learning. The bumpy ground is all the possible ways the AI could be wrong. The lowest spot is where the AI is the least wrong. The AI takes tiny steps downhill until it gets there. That's the whole secret. Seriously.",
        },
        code: {
            h: "The optimization problem",
            p: "Every ML model solves an optimization problem: minimize a loss function L(θ) where θ are your parameters. Gradient descent computes the gradient ∇L(θ) — a vector pointing in the direction of steepest ascent — and moves opposite to it. Update rule: θ ← θ − α∇L(θ) where α is your learning rate.",
            p2: "In practice you never compute gradients over the full dataset (too slow). Stochastic Gradient Descent (SGD) approximates this using one sample. Mini-batch SGD (the industry standard) uses a batch of 32–512 samples. You get noisy but fast gradient estimates that converge surprisingly well in practice.",
        },
        banter: {
            h: "We gave a computer a brain. The brain is a hill. 🗻",
            p: "ChatGPT? Ball rolling downhill. DALL·E painting you a nightmare? Ball. Downhill. The algorithm that beat Lee Sedol at Go, made a self-driving car, and writes your cover letters while you procrastinate? One. Algorithm. Go. Downhill. Humanity spent 300 years inventing calculus, 70 years building computers, and 40 years failing at AI. Then someone went: 'what if we just... went downhill?' Silence. Then $3 trillion in venture capital.",
            p2: "Here's the part where it gets embarrassing: gradient descent doesn't even find the BEST answer. It finds AN answer. A local minimum. A 'good enough.' GPT-4 might be confidently stuck in a mediocre valley right now, telling someone that dolphins are fish. But it also passed the bar exam. So who's wrong here? (It's the dolphins.)",
        },
    },
    s2: {
        general: {
            h: "Loss: measuring how wrong you are",
            p: "Before you can go downhill, you need a hill. In neural networks, the 'hill' is called the loss function — a mathematical way of measuring how badly the network is doing. High loss = very wrong. Low loss = doing great. Zero loss = perfection (almost never happens).",
            p2: "The most common loss for classification is Cross-Entropy. For regression it's Mean Squared Error. They're just ways of computing 'how far was your guess from the truth?' The genius of gradient descent is that it doesn't need to understand WHY it's wrong — just HOW MUCH.",
        },
        five: {
            h: "The 'how wrong am I?' number 📏",
            p: "Imagine you're playing a guessing game. You guess '10' and the answer is '7'. You were wrong by 3. That '3' is your loss! The bigger the number, the more wrong you were. If you guessed perfectly, your loss is 0.",
            p2: "AI has a special calculator that figures out how wrong it is after every guess. It adds up all the wrongness into one big number. Then gradient descent tries to make that number smaller and smaller until the AI starts getting things right!",
        },
        code: {
            h: "Loss functions: the math of wrongness",
            p: "MSE: L = (1/n)Σ(ŷᵢ − yᵢ)². Differentiable everywhere, convex for linear models — gradient descent finds the global minimum. Cross-entropy: L = −Σyᵢlog(ŷᵢ). Better for classification, paired with softmax. Key property both need: differentiability so you can compute ∂L/∂θ for every parameter.",
            p2: "The gradient ∂L/∂θᵢ tells you: 'if I increase weight θᵢ by a tiny ε, how much does the loss change?' Computed for every weight simultaneously via backpropagation (chain rule applied backwards through the computation graph). This is the O(n) magic that makes deep learning tractable.",
        },
        banter: {
            h: "Loss: the AI's permanent, public record of humiliation 📋",
            p: "Loss is how we measure the AI's failure. Quantitatively. Mercilessly. In real time. High loss: the model looked at a golden retriever, thought for 0.003 seconds, and announced '94% saxophone.' Low loss: it's finally holding itself together. Zero loss: never happens. The AI lives with this. Every. Single. Batch.",
            p2: "And here's the AI's entire emotional response to failure: it doesn't reflect. It doesn't grow. It doesn't call its therapist. It screams '❗NUMBER BAD❗' internally, then *slightly adjusts 175,000,000,000 random knobs at once*, checks if the number got smaller, and repeats. We called this 'learning' so the press releases would sound better. It works. We have no idea why it works as well as it does. This is fine.",
        },
    },
    s3: {
        general: {
            h: "Learning rate: the size of each step",
            p: "You're blindfolded on that hill. How big should each step be? Too big and you might step right over the valley and up the other side. Too small and you'll be there forever — the universe will end before you reach the bottom.",
            p2: "That step size is the learning rate. It's one of the most important settings in all of machine learning, and there's no perfect universal answer. The art of finding a good learning rate is what separates decent ML engineers from great ones.",
        },
        five: {
            h: "Big steps vs tiny steps 👣",
            p: "Back to the blindfold park! If you take HUGE steps, you might skip right over the lowest point and end up on the other side. Whoops! If you take tiny baby steps, you'll find it eventually — but it'll take forever. Like, your parents will finish dinner and you're still out there stepping.",
            p2: "The learning rate is just how big each step is. AI researchers spend a LOT of time figuring out the perfect step size. Not too big, not too small. It's like finding the right amount of ketchup. Everyone has an opinion. Nobody fully agrees.",
        },
        code: {
            h: "Learning rate: the critical hyperparameter",
            p: "θ ← θ − α∇L(θ). If α is too large: oscillation, divergence. If too small: slow convergence, gets stuck in plateaus. Typical starting values: 1e-3 for Adam, 1e-1 for SGD with momentum. Modern approaches: cosine annealing, warmup + decay, or adaptive methods like Adam that compute per-parameter rates.",
            p2: "Adam: θ ← θ − α · m̂/(√v̂ + ε) where m̂, v̂ are bias-corrected first and second moment estimates. Big steps where gradients are small and consistent, small steps where they're noisy. Invented in 2014. Still the default in 2025. If your model isn't training, try Adam with lr=1e-3 first.",
        },
        banter: {
            h: "Learning rate: how fast it sprints into a wall 🏃💨🧱",
            p: "Too high: the AI overshoots the minimum, bounces off the other side, overshoots again, and the loss value goes to infinity while you watch your GPU bill also go to infinity. Too low: training will finish. Eventually. Your grandchildren will inform you of the results. The sweet spot? Somewhere in between, discovered through a ritual combination of gut feeling, Stack Overflow, and quiet suffering.",
            p2: "Research papers on this topic include: 'Cyclical Learning Rates' (2017), 'Warm Restarts' (2017), 'Linear Warmup with Cosine Decay' (2018), 'Just Use 3e-4 and Pray' (unpublished, passed around Discord). In 2025, somebody on Twitter posted '1e-4 go brrr' and it got 4,000 likes from ML engineers who just nodded. We landed on the moon in 1969. The learning rate problem remains unsolved. This is where we are.",
        },
    },
};

/* ─── QUIZ DATA ──────────────────────────────────────────────────────────── */
const QUIZ_NODES = [
    { id: "gd", x: 390, y: 190, label: "Gradient Descent", color: T.accent, r: 26 },
    { id: "loss", x: 180, y: 100, label: "Loss Function", color: T.blue, r: 21 },
    { id: "lr", x: 600, y: 100, label: "Learning Rate", color: T.green, r: 21 },
    { id: "weights", x: 180, y: 290, label: "Weights", color: T.purple, r: 21 },
    { id: "backprop", x: 600, y: 290, label: "Backprop", color: T.pink, r: 21 },
    { id: "sgd", x: 390, y: 330, label: "Mini-batch SGD", color: T.teal, r: 17 },
    { id: "overfit", x: 90, y: 200, label: "Overfitting", color: T.red, r: 17 },
    { id: "converge", x: 680, y: 200, label: "Convergence", color: T.accent, r: 17 },
];

const CORRECT_EDGES = [
    { from: "gd", to: "loss", label: "minimizes" },
    { from: "gd", to: "lr", label: "uses" },
    { from: "gd", to: "weights", label: "updates" },
    { from: "backprop", to: "gd", label: "enables" },
    { from: "lr", to: "converge", label: "affects" },
    { from: "sgd", to: "gd", label: "variant of" },
    { from: "overfit", to: "loss", label: "low training" },
];

/* ─── UTILS ──────────────────────────────────────────────────────────────── */
const sig = x => 1 / (1 + Math.exp(-x));
const relu = x => Math.max(0, x);
const gdLoss = (x, y) =>
    0.28 * Math.sin(x * 1.6) * Math.cos(y) +
    0.18 * (x * x + y * y) +
    0.1 * Math.sin(x * 3.2) +
    0.09 * Math.cos(y * 2.4);
const gdGrad = (x, y) => ({
    dx: 0.28 * 1.6 * Math.cos(x * 1.6) * Math.cos(y) + 0.36 * x + 0.32 * Math.cos(x * 3.2),
    dy: -0.28 * Math.sin(x * 1.6) * Math.sin(y) + 0.36 * y - 0.216 * Math.sin(y * 2.4),
});

/* ─── HOOKS ──────────────────────────────────────────────────────────────── */
function useGDCanvas(canvasRef, lr) {
    const ball = useRef(null);
    const running = useRef(false);
    const raf = useRef(null);
    const path = useRef([]);
    const [status, setStatus] = useState("Click the surface to place a ball, then hit Start");

    const draw = useCallback(() => {
        const cv = canvasRef.current; if (!cv) return;
        const dpr = window.devicePixelRatio || 1;
        cv.width = cv.clientWidth * dpr;
        cv.height = cv.clientHeight * dpr;
        const ctx = cv.getContext("2d"); ctx.scale(dpr, dpr);
        const W = cv.clientWidth, H = cv.clientHeight;
        ctx.clearRect(0, 0, W, H);
        const toX = x => ((x + 2.2) / 4.4) * W;
        const toY = y => ((y + 2.2) / 4.4) * H;
        /* heatmap */
        for (let xi = 0; xi <= 55; xi++) for (let yi = 0; yi <= 55; yi++) {
            const x = xi / 55 * 4.4 - 2.2, y = yi / 55 * 4.4 - 2.2;
            const t = Math.max(0, Math.min(1, (gdLoss(x, y) + 0.05) / 1.1));
            ctx.fillStyle = `rgb(${Math.round(12 + t * 80)},${Math.round(20 + t * 20)},${Math.round(50 - t * 30)})`;
            ctx.fillRect(xi * W / 55, yi * H / 55, W / 55 + 1, H / 55 + 1);
        }
        /* contours */
        ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 0.5;
        [0.1, 0.2, 0.3, 0.4, 0.5].forEach(lv => {
            for (let xi = 0; xi < 55; xi++) for (let yi = 0; yi < 55; yi++) {
                const x = xi / 55 * 4.4 - 2.2, y = yi / 55 * 4.4 - 2.2;
                if (Math.abs(gdLoss(x, y) - lv) < 0.035) { ctx.beginPath(); ctx.arc(toX(x), toY(y), 0.8, 0, Math.PI * 2); ctx.stroke(); }
            }
        });
        /* trail */
        if (path.current.length > 1) {
            ctx.beginPath();
            path.current.forEach((p, i) => i === 0 ? ctx.moveTo(toX(p.x), toY(p.y)) : ctx.lineTo(toX(p.x), toY(p.y)));
            ctx.strokeStyle = "rgba(245,166,35,0.6)"; ctx.lineWidth = 2; ctx.stroke();
        }
        /* ball */
        if (ball.current) {
            const bx = toX(ball.current.x), by = toY(ball.current.y);
            ctx.beginPath(); ctx.arc(bx, by, 10, 0, Math.PI * 2);
            ctx.fillStyle = T.accent; ctx.shadowColor = "rgba(245,166,35,0.9)"; ctx.shadowBlur = 20; ctx.fill(); ctx.shadowBlur = 0;
            ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.fillStyle = "rgba(245,166,35,0.9)"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
            ctx.fillText("loss: " + gdLoss(ball.current.x, ball.current.y).toFixed(3), bx, by - 18);
        }
    }, [canvasRef]);

    const place = useCallback((e) => {
        const cv = canvasRef.current; if (!cv) return;
        const rect = cv.getBoundingClientRect();
        const x = (e.clientX - rect.left) / cv.clientWidth * 4.4 - 2.2;
        const y = (e.clientY - rect.top) / cv.clientHeight * 4.4 - 2.2;
        ball.current = { x, y }; path.current = [{ x, y }];
        running.current = false; if (raf.current) cancelAnimationFrame(raf.current);
        setStatus(`Ball at (${x.toFixed(2)}, ${y.toFixed(2)}) — loss ${gdLoss(x, y).toFixed(3)}. Hit ▶ Start Rolling.`);
        draw();
    }, [draw]);

    const start = useCallback(() => {
        if (!ball.current || running.current) return;
        running.current = true; let step = 0;
        const tick = () => {
            if (!running.current || step > 700) return;
            const { dx, dy } = gdGrad(ball.current.x, ball.current.y);
            ball.current.x = Math.max(-2.1, Math.min(2.1, ball.current.x - lr * dx));
            ball.current.y = Math.max(-2.1, Math.min(2.1, ball.current.y - lr * dy));
            path.current.push({ x: ball.current.x, y: ball.current.y });
            if (path.current.length > 120) path.current.shift();
            draw(); step++;
            const lv = gdLoss(ball.current.x, ball.current.y);
            setStatus(`Step ${step} — Loss: ${lv.toFixed(4)} ${lv < 0.01 ? "🎉 Minimum found!" : lv < 0.05 ? "Getting close…" : "Rolling…"}`);
            if (lv < 0.004) { running.current = false; setStatus("🎉 Minimum found! This is what a trained network feels like."); return; }
            raf.current = requestAnimationFrame(tick);
        };
        tick();
    }, [lr, draw]);

    const reset = useCallback(() => {
        ball.current = null; path.current = []; running.current = false;
        if (raf.current) cancelAnimationFrame(raf.current);
        setStatus("Click the surface to place a ball, then hit Start");
        draw();
    }, [draw]);

    useEffect(() => { draw(); }, [draw]);
    useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);
    return { place, start, reset, status };
}

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
                            color: active
                                ? (m.id === "banter" || m.id === "five" ? "#000" : "#000")
                                : "rgba(200,196,188,0.75)",
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

/** Stat card */
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

/** Flow step list */
function FlowSteps({ steps }) {
    return (
        <ol style={{ listStyle: "none", margin: "32px 0", padding: 0, position: "relative" }}
            aria-label="Training process steps">
            <li aria-hidden="true" style={{
                position: "absolute", left: 19, top: 28, bottom: 28, width: 1,
                background: "linear-gradient(to bottom,transparent,rgba(255,255,255,0.1) 20%,rgba(255,255,255,0.1) 80%,transparent)"
            }} />
            {steps.map(({ n, h, p }) => (
                <li key={n} style={{ display: "flex", gap: 18, padding: "14px 0" }}
                    onMouseEnter={e => e.currentTarget.querySelector(".fnum").style.cssText += ";background:rgba(245,166,35,0.15);border-color:#f5a623;transform:scale(1.1)"}
                    onMouseLeave={e => e.currentTarget.querySelector(".fnum").style.cssText += ";background:#1a1a1e;border-color:rgba(255,255,255,0.13);transform:scale(1)"}
                >
                    <div className="fnum" aria-hidden="true"
                        style={{
                            width: 40, height: 40, minWidth: 40, borderRadius: "50%", background: "#1a1a1e",
                            border: `1px solid ${T.border2}`, display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "monospace", fontSize: 19, color: T.accent, position: "relative", zIndex: 1,
                            transition: "all 0.25s", flexShrink: 0
                        }}>{n}</div>
                    <div style={{ paddingTop: 8 }}>
                        <h4 style={{ fontSize: 21, fontWeight: 600, color: T.text, margin: "0 0 4px" }}>{h}</h4>
                        <p style={{ fontSize: 20, color: T.muted, margin: 0, lineHeight: 1.7 }}>{p}</p>
                    </div>
                </li>
            ))}
        </ol>
    );
}

/** Hill SVG diagram (changes per mode) */
function HillDiagram({ mode }) {
    const labels = {
        general: { start: "start (random weights)", path: "gradient steps", goal: "minimum ✓", title: "Loss landscape — every training step rolls the ball downhill" },
        five: { start: "where AI begins 😰", path: "tiny steps downhill", goal: "lowest point! 🎉", title: "The blindfold park — AI is the blue dot finding the lowest spot" },
        code: { start: "θ₀ (init)", path: "θ ← θ − α∇L(θ)", goal: "θ* (optimum)", title: "Loss surface L(θ) — gradient descent traces the steepest descent path" },
        banter: { start: "you (day 1) 💀", path: "vibes-based descent", goal: "good enough™ 🎉", title: "The entire AI industry, explained in one embarrassing doodle" },
    };
    const L = labels[mode] || labels.general;
    return (
        <figure aria-label={L.title} style={{
            background: T.surface, borderRadius: 14, padding: 20,
            border: `1px solid ${T.border}`, margin: "24px 0"
        }}>
            <figcaption style={{ fontFamily: "monospace", fontSize: 18, color: T.dim, marginBottom: 12, letterSpacing: "0.06em" }}>
                {L.title.toUpperCase()}
            </figcaption>
            <svg viewBox="0 0 680 190" role="img" aria-label={L.title} style={{ width: "100%", display: "block" }}>
                <defs>
                    <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2a1505" />
                        <stop offset="100%" stopColor="#0d0a15" />
                    </linearGradient>
                    <marker id="dah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                        <path d="M1,2 L8,5 L1,8" fill="none" stroke={T.blue} strokeWidth="1.5" />
                    </marker>
                </defs>
                <path d="M0,175 Q80,38 160,115 Q240,192 340,75 Q440,155 520,95 Q600,38 680,115 L680,192 L0,192Z"
                    fill="url(#hg)" stroke="rgba(245,166,35,0.25)" strokeWidth="1.5" />
                <circle cx={340} cy={77} r={13} fill={T.accent} />
                <text x={340} y={62} textAnchor="middle" fill={T.accent} fontSize={17} fontFamily="monospace">{L.goal}</text>
                <circle cx={128} cy={82} r={13} fill={T.blue} />
                <text x={128} y={67} textAnchor="middle" fill={T.blue} fontSize={16} fontFamily="monospace">{L.start}</text>
                <path d="M128,82 Q185,108 235,128 Q285,148 312,108 Q328,88 340,77"
                    fill="none" stroke="rgba(91,156,246,0.7)" strokeWidth="2" strokeDasharray="5,3" markerEnd="url(#dah)" />
                <text x={225} y={150} textAnchor="middle" fill={T.dim} fontSize={16} fontFamily="monospace">{L.path}</text>
                <text x={580} y={76} fill={T.dim} fontSize={16} fontFamily="monospace" textAnchor="middle">local trap ⚠</text>
                <circle cx={535} cy={95} r={16} fill="rgba(232,89,60,0.4)" stroke={T.red} strokeWidth={1} />
            </svg>
        </figure>
    );
}

/** Loss demo widget */
function LossDemo({ mode }) {
    const [pred, setPred] = useState(0.5);
    const [truth, setTruth] = useState(1);
    const id = useId();
    const loss = -truth * Math.log(pred + 1e-9) - (1 - truth) * Math.log(1 - pred + 1e-9);
    const pct = Math.min(100, (loss / 3) * 100);
    const col = loss > 2 ? T.red : loss > 0.5 ? T.accent : T.green;
    const explain = {
        general: `Cross-entropy loss = ${loss.toFixed(3)}. Closer your prediction to the truth, the lower this gets.`,
        five: `AI guessed ${(pred * 100).toFixed(0)}% cat. Real answer: ${truth ? "100% cat 🐱" : "0% cat 🚫"}. Wrongness score: ${loss.toFixed(2)}!`,
        code: `BCE = −[y·log(ŷ) + (1−y)·log(1−ŷ)] = ${loss.toFixed(4)}   y=${truth}  ŷ=${pred.toFixed(2)}`,
        banter: `AI said "${(pred * 100).toFixed(0)}% cat." Real: ${truth ? "it's a cat" : "NOT a cat"}. Shame score: ${loss.toFixed(2)}. ${loss > 2 ? "Embarrassing." : loss > 1 ? "Mediocre." : "Acceptable."}`,
    };
    return (
        <section aria-label="Loss function interactive demo"
            style={{ background: T.card, borderRadius: 14, padding: 24, border: `1px solid ${T.border2}`, marginTop: 24 }}>
            <h3 style={{
                fontFamily: "monospace", fontSize: 18, color: T.accent, letterSpacing: "0.1em", margin: "0 0 18px",
                textTransform: "uppercase"
            }}>
                Interactive: Loss Function
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div>
                    <label htmlFor={`${id}-pred`}
                        style={{
                            fontFamily: "monospace", fontSize: 19, color: T.muted, display: "flex",
                            justifyContent: "space-between", marginBottom: 8
                        }}>
                        <span>AI Prediction</span>
                        <span style={{ color: T.accent }}>{pred.toFixed(2)}</span>
                    </label>
                    <input id={`${id}-pred`} type="range" min="0.01" max="0.99" step="0.01" value={pred}
                        aria-valuetext={`${(pred * 100).toFixed(0)} percent cat`}
                        onChange={e => setPred(+e.target.value)}
                        style={{ width: "100%", accentColor: T.accent, cursor: "pointer" }} />
                </div>
                <div>
                    <p style={{ fontFamily: "monospace", fontSize: 19, color: T.muted, margin: "0 0 8px" }}>Ground Truth</p>
                    <div role="group" aria-label="Ground truth selector" style={{ display: "flex", gap: 8 }}>
                        {[1, 0].map(v => (
                            <button key={v} onClick={() => setTruth(v)} aria-pressed={truth === v}
                                style={{
                                    flex: 1, padding: "8px 4px", borderRadius: 8,
                                    border: `1px solid ${truth === v ? T.green : T.border}`,
                                    background: truth === v ? "rgba(82,192,122,0.15)" : "transparent",
                                    color: truth === v ? T.green : T.dim,
                                    fontFamily: "monospace", fontSize: 19, cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                                onFocus={e => { e.target.style.boxShadow = `0 0 0 2px ${T.green}`; }}
                                onBlur={e => { e.target.style.boxShadow = "none"; }}
                            >
                                {v === 1 ? "Cat 🐱" : "Not Cat 🚫"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div style={{ background: T.bg, borderRadius: 12, padding: 16, textAlign: "center" }}>
                <p style={{ fontFamily: "monospace", fontSize: 18, color: T.dim, margin: "0 0 8px", letterSpacing: "0.08em" }}>LOSS VALUE</p>
                <div role="status" aria-live="polite" aria-atomic="true"
                    style={{ fontFamily: "'Instrument Serif',serif", fontSize: 50, color: col, transition: "color 0.3s" }}>
                    {loss.toFixed(3)}
                </div>
                <div role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}
                    aria-label="Loss magnitude indicator"
                    style={{ height: 5, background: "#1a1a1e", borderRadius: 3, marginTop: 12, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: col, borderRadius: 3, transition: "all 0.35s" }} />
                </div>
                <p role="status" aria-live="polite" style={{ fontFamily: "monospace", fontSize: 19, color: T.dim, marginTop: 10 }}>
                    {explain[mode]}
                </p>
            </div>
        </section>
    );
}

/** GD canvas demo */
function GDDemo({ mode, accentColor }) {
    const canvasRef = useRef(null);
    const [lr, setLr] = useState(0.1);
    const lrId = useId();
    const { place, start, reset, status } = useGDCanvas(canvasRef, lr);

    const lrCards = [
        { rate: "α = 0.01", lbl: "Too small", desc: "Takes forever. Correct eventually but you'll miss your birthday.", col: T.blue },
        { rate: "α = 0.1", lbl: "Goldilocks ✓", desc: "Usually works. Requires hope and moderate amounts of coffee.", col: T.green },
        { rate: "α = 0.5", lbl: "Too big", desc: "Overshoots. Bounces. Loss goes to infinity. Bad time.", col: T.red },
    ];

    return (
        <section aria-label="Gradient descent interactive demo"
            style={{
                background: T.card, borderRadius: 18, padding: 28, border: `1px solid ${T.border2}`,
                position: "relative", marginTop: 40
            }}>
            <div aria-hidden="true"
                style={{
                    position: "absolute", top: -12, left: 20, background: accentColor, color: "#000",
                    fontFamily: "monospace", fontSize: 17, fontWeight: 600, padding: "3px 12px",
                    borderRadius: 20, letterSpacing: "0.1em"
                }}>
                INTERACTIVE
            </div>
            <h3 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 28, margin: "0 0 6px" }}>
                Gradient Descent Live
            </h3>
            <p style={{ fontSize: 20, color: T.muted, margin: "0 0 20px" }}>
                Click anywhere to place the ball. Adjust learning rate. Try a high rate and watch it overshoot.
            </p>
            <canvas ref={canvasRef}
                role="img" aria-label="Gradient descent loss surface visualization"
                style={{ width: "100%", height: 280, display: "block", borderRadius: 10, cursor: "crosshair" }}
                onClick={place}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") start(); }}
                tabIndex={0} />
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
                <button onClick={start}
                    aria-label="Start gradient descent animation"
                    style={{
                        fontFamily: "monospace", fontSize: 19, padding: "9px 18px", borderRadius: 10,
                        border: "none", background: accentColor, color: "#000", cursor: "pointer", fontWeight: 600,
                        transition: "all 0.2s"
                    }}
                    onFocus={e => { e.target.style.boxShadow = `0 0 0 3px ${accentColor}55`; }}
                    onBlur={e => { e.target.style.boxShadow = "none"; }}>
                    ▶ Start Rolling
                </button>
                <button onClick={reset} aria-label="Reset gradient descent demo"
                    style={{
                        fontFamily: "monospace", fontSize: 19, padding: "9px 18px", borderRadius: 10,
                        border: `1px solid ${T.border2}`, background: "transparent", color: T.muted,
                        cursor: "pointer", transition: "all 0.2s"
                    }}
                    onFocus={e => { e.target.style.boxShadow = `0 0 0 3px ${T.border2}`; }}
                    onBlur={e => { e.target.style.boxShadow = "none"; }}>
                    ↺ Reset
                </button>
                <div style={{ flex: 1, minWidth: 200 }}>
                    <label htmlFor={lrId}
                        style={{
                            display: "flex", justifyContent: "space-between", fontFamily: "monospace",
                            fontSize: 19, color: T.muted, marginBottom: 6
                        }}>
                        <span>Learning rate (α)</span>
                        <span style={{ color: accentColor }}>{lr.toFixed(2)}</span>
                    </label>
                    <input id={lrId} type="range" min="0.01" max="0.5" step="0.01" value={lr}
                        aria-valuetext={`Learning rate ${lr.toFixed(2)}`}
                        onChange={e => setLr(+e.target.value)}
                        style={{ width: "100%", accentColor, cursor: "pointer" }} />
                </div>
            </div>
            <p role="status" aria-live="polite" aria-atomic="true"
                style={{ fontFamily: "monospace", fontSize: 19, color: T.dim, marginTop: 10 }}>{status}</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 24 }}>
                {lrCards.map(c => (
                    <div key={c.rate} style={{ background: T.bg, borderRadius: 12, padding: 16, border: `1px solid ${c.col}33` }}>
                        <div style={{ fontFamily: "monospace", fontSize: 21, color: c.col, marginBottom: 4 }}>{c.rate}</div>
                        <div style={{ fontWeight: 600, fontSize: 19, color: T.text, marginBottom: 6 }}>{c.lbl}</div>
                        <p style={{ fontSize: 19, color: T.muted, lineHeight: 1.65, margin: 0 }}>{c.desc}</p>
                    </div>
                ))}
            </div>
        </section>
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
    const svgRef = useRef(null);
    const dragOff = useRef({ x: 0, y: 0 });
    const announceRef = useRef(null);

    const announce = msg => { if (announceRef.current) announceRef.current.textContent = msg; };

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

    /* keyboard-driven connecting */
    const [kbFrom, setKbFrom] = useState(null);
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

    const reset = () => { setEdges([]); setScore(null); setNodes(QUIZ_NODES.map(n => ({ ...n }))); setKbFrom(null); announce("Quiz reset."); };

    return (
        <section aria-label="Knowledge map quiz" style={{ background: "#0d0d10", borderRadius: 16, padding: 24, border: `1px solid ${T.border}` }}>
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
                        {score.correct >= 5
                            ? "🎉 "
                            : score.correct >= 3
                                ? "📈 "
                                : "🤔 "}
                        {score.correct}/{score.total} correct connection{score.total !== 1 ? "s" : ""}
                    </p>
                    <p style={{ fontSize: 19, color: T.muted, margin: 0, lineHeight: 1.65 }}>
                        Green = correct. Red = not quite.
                        {score.correct < score.total && " Hint: think about what backprop enables, and what the learning rate affects…"}
                    </p>
                </div>
            )}
        </section>
    );
}

/* ─── ROOT ───────────────────────────────────────────────────────────────── */
export default function GradientDescentBlog() {
    const [mode, setMode] = useState("general");
    const [readPct, setReadPct] = useState(0);
    const mainRef = useRef(null);

    const mc = MODES.find(m => m.id === mode)?.color || T.accent;
    const C = key => CONTENT[key]?.[mode] || CONTENT[key]?.general;

    useEffect(() => {
        const onScroll = () => {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            setReadPct(h > 0 ? (window.scrollY / h) * 100 : 0);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const FLOW_STEPS = [
        { n: "1", h: "Initialise random weights", p: "Complete garbage numbers. The network knows absolutely nothing. Expected and fine." },
        { n: "2", h: "Forward pass", p: "Feed an example in. Each neuron fires or doesn't. A prediction emerges from the other end." },
        { n: "3", h: "Measure loss", p: "How wrong was the prediction? Bigger mistake = higher loss. One number summarises all the wrongness." },
        { n: "4", h: "Backpropagation", p: "Work backwards through the network. Figure out which weights caused the most wrongness. Assign blame mathematically." },
        { n: "5", h: "Nudge every weight", p: "Adjust each guilty weight slightly in the right direction. Size of nudge = learning rate." },
        { n: "6", h: "Repeat millions of times", p: "With millions of examples. Patterns emerge. Weights crystallise. Magic happens — it's math." },
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        /* Smooth antialiasing for dark-mode text — mirrors Joy of React */
        body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        /* Keyboard focus ring — do NOT override with outline:none */
        :focus-visible { outline: 2px solid ${T.accent}; outline-offset: 3px; border-radius: 4px; }
        /* Ensure buttons never suppress focus visually — remove any rogue outline:none */
        button:focus:not(:focus-visible) { outline: none; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: #2a2a2e; border-radius: 3px; }
        input[type=range] { height:4px; appearance:none; -webkit-appearance:none; background:${T.card}; border-radius:2px; cursor:pointer; }
        input[type=range]::-webkit-slider-thumb { appearance:none; -webkit-appearance:none; width:20px; height:20px; border-radius:50%; cursor:pointer; transition:transform 0.15s; }
        input[type=range]::-webkit-slider-thumb:hover { transform:scale(1.25); }
        input[type=range]:focus-visible { outline: 2px solid ${T.accent}; outline-offset: 2px; border-radius: 2px; }
        /* Increase text spacing for WCAG 1.4.12 */
        p, li, h1, h2, h3, h4 { word-spacing: 0.05em; }
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
                letterSpacing: "0.01em"  /* slight optical spacing for dark bg readability */
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
                            Episode 02
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
                            <div role="listitem"><StatCard num="10M+" label="training steps per model" accent={mc} /></div>
                            <div role="listitem"><StatCard num="α" label="the learning rate symbol" accent={mc} /></div>
                            <div role="listitem"><StatCard num="≈0" label="loss we're chasing" accent={mc} /></div>
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
                            <HillDiagram mode={mode} />
                            {mode === "code" && <Callout type="code"><strong style={{ color: T.blue }}>θ ← θ − α∇L(θ)</strong><br /><span style={{ color: T.dim, fontSize: 18 }}>// Update every weight by the gradient scaled by learning rate</span></Callout>}
                            {mode === "banter" && <Callout type="warn">Fun fact: gradient descent was invented in 1847 by Cauchy. He had no idea he was building ChatGPT. He was just vibing with calculus.</Callout>}
                            {mode === "five" && <Callout type="gentle">🧒 The blue dot is the AI! It takes little steps downhill until it finds the lowest point (the orange dot). When it gets there — training is done!</Callout>}
                        </article>

                        {/* S2 */}
                        <article aria-labelledby="s2-heading" style={{ marginBottom: 80 }}>
                            <SecMark n="02 / 04" />
                            <h2 id="s2-heading" style={{
                                fontFamily: "'Instrument Serif',serif", fontSize: "clamp(34px,3.8vw,52px)",
                                fontWeight: 400, lineHeight: 1.15, margin: "0 0 22px"
                            }}>
                                {C("s2").h}
                            </h2>
                            <p style={{ color: "#ccc8c0", marginBottom: 20 }}>{C("s2").p}</p>
                            <p style={{ color: "#ccc8c0", marginBottom: 0 }}>{C("s2").p2}</p>
                            <LossDemo mode={mode} />
                        </article>

                        {/* S3 */}
                        <article aria-labelledby="s3-heading" style={{ marginBottom: 80 }}>
                            <SecMark n="03 / 04" />
                            <h2 id="s3-heading" style={{
                                fontFamily: "'Instrument Serif',serif", fontSize: "clamp(34px,3.8vw,52px)",
                                fontWeight: 400, lineHeight: 1.15, margin: "0 0 22px"
                            }}>
                                {C("s3").h}
                            </h2>
                            <p style={{ color: "#ccc8c0", marginBottom: 20 }}>{C("s3").p}</p>
                            <p style={{ color: "#ccc8c0", marginBottom: 0 }}>{C("s3").p2}</p>
                            <GDDemo mode={mode} accentColor={mc} />
                        </article>

                        {/* S4: TRAINING STEPS + NEXT */}
                        <article aria-labelledby="s4-heading" style={{ marginBottom: 80 }}>
                            <SecMark n="04 / 04" />
                            <h2 id="s4-heading" style={{
                                fontFamily: "'Instrument Serif',serif", fontSize: "clamp(34px,3.8vw,52px)",
                                fontWeight: 400, lineHeight: 1.15, margin: "0 0 22px"
                            }}>
                                {mode === "banter" ? "Congrats. You now know more about AI than most of LinkedIn. 🎓" :
                                    mode === "five" ? "How does the AI know which way is downhill? 🤔" :
                                        "Putting it all together: the training loop"}
                            </h2>
                            <p style={{ color: "#ccc8c0", marginBottom: 0 }}>
                                {mode === "banter" ? "You understand gradient descent. The algorithm that every VC-funded startup lists as their 'proprietary technology.' The thing powering the robots taking your job and also writing your performance review. A method invented in 1847 by a French mathematician who was just vibing with calculus and had absolutely no idea he was doing this. Go tell someone. Watch as their eyes glaze over. Feel the quiet superiority anyway. You've earned it." :
                                    mode === "five" ? "Every time the AI makes a wrong guess, it does a little check on ALL its weights to see which ones were responsible. Then it tweaks them tiny bits. This is called the training loop!" :
                                        "Every training run follows the same six steps, repeated millions of times. This is the loop that turns random garbage weights into something that can recognise faces, translate languages, and write poetry of varying quality."}
                            </p>
                            <FlowSteps steps={FLOW_STEPS} />

                            {/* NEXT EPISODE TEASER */}
                            <div style={{
                                background: "linear-gradient(135deg,rgba(245,166,35,0.05),rgba(180,143,255,0.05))",
                                border: `1px solid ${T.purple}44`, borderRadius: 16, padding: 28, position: "relative", overflow: "hidden"
                            }}>
                                <div aria-hidden="true"
                                    style={{
                                        position: "absolute", top: 0, right: 0, width: 180, height: 180,
                                        background: "radial-gradient(circle,rgba(180,143,255,0.1),transparent 70%)", pointerEvents: "none"
                                    }} />
                                <p style={{ fontFamily: "monospace", fontSize: 18, color: T.purple, letterSpacing: "0.1em", margin: "0 0 12px" }}>COMING NEXT — EPISODE 03</p>
                                <h3 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, margin: "0 0 12px" }}>
                                    Backpropagation: <em style={{ color: T.purple }}>Mathematical Blame</em>
                                </h3>
                                <p style={{ color: T.muted, fontSize: 23, margin: "0 0 20px", lineHeight: 1.75 }}>
                                    The chain rule. Gradient flow. Why training deep networks was "impossible" for 30 years — and then suddenly wasn't. The most important algorithm you've never properly heard of.
                                </p>
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    {["Chain Rule", "Vanishing Gradients", "Exploding Gradients", "Computation Graphs", "Auto-diff"].map(t => (
                                        <span key={t} style={{
                                            fontFamily: "monospace", fontSize: 18, color: T.purple,
                                            background: "rgba(180,143,255,0.1)", border: `1px solid rgba(180,143,255,0.2)`,
                                            padding: "4px 12px", borderRadius: 20
                                        }}>{t}</span>
                                    ))}
                                </div>
                            </div>
                        </article>

                        {/* QUIZ */}
                        <section aria-labelledby="quiz-heading" style={{ marginBottom: 100 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
                                <span style={{ fontFamily: "monospace", fontSize: 18, color: T.dim }}>QUIZ</span>
                                <div role="separator" style={{ flex: 1, height: 1, background: T.border }} />
                            </div>
                            <h2 id="quiz-heading" style={{
                                fontFamily: "'Instrument Serif',serif", fontSize: "clamp(32px,3.2vw,48px)",
                                fontWeight: 400, margin: "0 0 14px"
                            }}>
                                Build the Knowledge Map
                            </h2>
                            <p style={{ color: T.muted, fontSize: 23, margin: "0 0 28px", lineHeight: 1.75 }}>
                                Connect the concepts the way your brain understood them.{" "}
                                <strong style={{ color: T.text }}>Drag</strong> nodes to reposition.{" "}
                                <strong style={{ color: T.text }}>Shift+drag</strong> or use{" "}
                                <strong style={{ color: T.text }}>Tab + Enter</strong> to draw connections.
                                How many correct links can you make out of {CORRECT_EDGES.length}?
                            </p>
                            <ObsidianQuiz />
                        </section>

                    </main>

                    <footer style={{ borderTop: `1px solid ${T.border}`, padding: "48px 0", textAlign: "center" }}>
                        <p style={{ color: T.muted, fontSize: 20, margin: 0 }}>
                            Part of the <strong style={{ color: T.text }}>AI for Humans</strong> series — explaining things properly the first time.
                        </p>
                        <p style={{ color: T.dim, fontSize: 19, marginTop: 6 }}>
                            Made with excessive Bruno analogies and zero regrets.
                        </p>
                    </footer>

                </div>
            </div>

            <style>{`
        @keyframes blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.6)} }
      `}</style>
        </>
    );
}