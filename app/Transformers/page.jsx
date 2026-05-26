"use client"

import { useState, useEffect, useRef, useMemo } from "react";

const C = {
    bg: "#060606", card: "#0c0c0c", card2: "#111", card3: "#161616",
    border: "#181818", border2: "#222", border3: "#2e2e2e",
    text: "#ddd9d2", muted: "#666", faint: "#2a2a2a", vfaint: "#141414",
    orange: "#ff6235", teal: "#00c9a7", amber: "#ffb830",
    purple: "#a78bfa", pink: "#f472b6", blue: "#60a5fa", green: "#34d399",
    mono: "'JetBrains Mono','Courier New',monospace",
};

// ── Sentence ──────────────────────────────────────────────────────────────────
const TOKENS = ["The", "cat", "sat", "on", "the", "mat", "because", "it", "was", "tired"];
const N = TOKENS.length;
const TOK_COLOR = t => ({ cat: C.teal, it: C.orange, mat: C.amber, sat: C.purple, tired: C.pink, was: C.blue }[t]);

// ── SVG Arc Layout ────────────────────────────────────────────────────────────
const SVG_W = 720, TY = 72, TR = 18;
const TX = i => 34 + i * 72;
function arcPath(i, j) {
    if (i === j) return null;
    const x1 = TX(i), x2 = TX(j);
    const depth = Math.min(Math.abs(j - i) * 24, 185);
    return `M${x1},${TY} Q${(x1 + x2) / 2},${TY + depth} ${x2},${TY}`;
}

// ── Attention Weights ─────────────────────────────────────────────────────────
const HEADS = {
    coref: [
        [.52, .16, .08, .05, .08, .04, .03, .02, .01, .01],
        [.09, .50, .18, .05, .06, .05, .03, .02, .01, .01],
        [.04, .32, .24, .12, .05, .13, .04, .03, .02, .01],
        [.03, .06, .12, .38, .09, .24, .04, .02, .01, .01],
        [.05, .06, .05, .10, .46, .20, .04, .02, .01, .01],
        [.03, .06, .10, .16, .09, .43, .07, .03, .02, .01],
        [.03, .08, .08, .05, .05, .10, .38, .13, .07, .03],
        [.02, .67, .06, .02, .03, .05, .07, .03, .03, .02],
        [.02, .11, .05, .03, .03, .05, .08, .26, .24, .13],
        [.02, .09, .05, .02, .03, .05, .08, .24, .24, .18],
    ],
    syntactic: [
        [.48, .22, .10, .05, .08, .04, .02, .01, .00, .00],
        [.10, .36, .30, .06, .05, .07, .02, .02, .01, .01],
        [.04, .30, .20, .14, .04, .16, .05, .04, .02, .01],
        [.03, .06, .12, .36, .10, .26, .04, .01, .01, .01],
        [.05, .07, .05, .08, .44, .24, .04, .02, .01, .00],
        [.03, .07, .14, .18, .08, .38, .06, .03, .02, .01],
        [.03, .09, .10, .05, .05, .10, .36, .14, .05, .03],
        [.02, .36, .12, .03, .04, .08, .12, .10, .09, .04],
        [.02, .09, .06, .03, .03, .05, .08, .30, .22, .12],
        [.02, .07, .05, .02, .03, .04, .06, .28, .28, .15],
    ],
    positional: [
        [.55, .37, .06, .01, .01, .00, .00, .00, .00, .00],
        [.30, .32, .28, .07, .02, .01, .00, .00, .00, .00],
        [.06, .28, .32, .24, .07, .02, .01, .00, .00, .00],
        [.01, .07, .24, .32, .24, .10, .01, .01, .00, .00],
        [.01, .02, .07, .24, .34, .24, .06, .01, .01, .00],
        [.00, .01, .02, .10, .24, .34, .22, .05, .01, .01],
        [.00, .01, .01, .02, .06, .22, .34, .24, .07, .03],
        [.00, .00, .01, .01, .02, .06, .24, .34, .24, .08],
        [.00, .00, .00, .01, .01, .02, .08, .26, .36, .26],
        [.00, .00, .00, .00, .01, .02, .04, .10, .30, .53],
    ],
};

// ── Positional Encoding ───────────────────────────────────────────────────────
function PE(pos, dim, dModel = 32) {
    return dim % 2 === 0
        ? Math.sin(pos / Math.pow(10000, dim / dModel))
        : Math.cos(pos / Math.pow(10000, (dim - 1) / dModel));
}

// ── Shared Primitives ─────────────────────────────────────────────────────────
const Mono = ({ children, color = C.teal, bg = true }) => (
    <code style={{
        fontFamily: C.mono, fontSize: 13, color,
        background: bg ? `${color}12` : "transparent",
        border: bg ? `1px solid ${color}25` : "none",
        borderRadius: 4, padding: bg ? "2px 7px" : "0"
    }}>{children}</code>
);
const Tag = ({ children, color = C.orange }) => (
    <span style={{
        fontFamily: C.mono, fontSize: 9, color, textTransform: "uppercase",
        letterSpacing: "2.5px", background: `${color}10`, border: `1px solid ${color}20`,
        borderRadius: 4, padding: "3px 8px"
    }}>{children}</span>
);
const Prose = ({ children, style = {} }) => (
    <p style={{ color: C.muted, fontSize: 18, lineHeight: 1.85, marginBottom: 16, ...style }}>{children}</p>
);
const H = ({ children, color = C.text, size = 18, mb = 6 }) => (
    <h3 style={{ fontFamily: C.mono, fontSize: size, color, fontWeight: 700, marginBottom: mb, lineHeight: 1.25 }}>{children}</h3>
);
const Divider = () => <div style={{ height: 1, background: C.border, margin: "24px 0" }} />;
const Callout = ({ text, color = C.orange }) => (
    <div style={{
        background: `${color}08`, border: `1px solid ${color}22`, borderRadius: 12,
        padding: "14px 18px", margin: "16px 0"
    }}>
        <span style={{ fontFamily: C.mono, fontSize: 13, color: C.muted, lineHeight: 1.75 }}>{text}</span>
    </div>
);
const Formula = ({ children }) => (
    <div style={{
        background: C.vfaint, border: `1px solid ${C.border2}`, borderRadius: 10,
        padding: "12px 16px", fontFamily: C.mono, fontSize: 12, color: C.amber,
        margin: "12px 0", letterSpacing: .5
    }}>{children}</div>
);
const SectionLabel = ({ n, color = C.orange }) => (
    <div style={{
        fontFamily: C.mono, fontSize: 8, color, letterSpacing: "3px",
        textTransform: "uppercase", marginBottom: 8, opacity: .7
    }}>
        Chapter {n.toString().padStart(2, "0")}
    </div>
);

// ── Token Arc SVG Component ───────────────────────────────────────────────────
function ArcViz({ weights, selected, onSelect, height = 250, headColor = C.orange }) {
    const maxW = Math.max(...weights);
    return (
        <svg viewBox={`0 0 ${SVG_W} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
            {weights.map((w, j) => {
                if (j === selected || w < .013) return null;
                const d = arcPath(selected, j); if (!d) return null;
                const isWin = w === maxW;
                const col = TOK_COLOR(TOKENS[j]) || headColor;
                return <path key={j} d={d} fill="none"
                    stroke={isWin ? "#fff" : col} strokeWidth={isWin ? 4 : 1 + w * 8}
                    strokeOpacity={isWin ? .72 : .08 + w * .92}
                    style={{ transition: "all .35s cubic-bezier(.4,0,.2,1)" }} />;
            })}
            {weights.map((w, j) => {
                if (j === selected || w < .07) return null;
                const x1 = TX(selected), x2 = TX(j), dep = Math.min(Math.abs(j - selected) * 24, 185);
                return <text key={j} x={(x1 + x2) / 2} y={TY + dep * .55} textAnchor="middle"
                    fill={w === maxW ? C.text : C.muted} fontSize={8} fontFamily={C.mono}
                    style={{ transition: "all .35s" }}>{(w * 100).toFixed(0)}%</text>;
            })}
            {TOKENS.map((t, i) => {
                const isSel = i === selected, acc = TOK_COLOR(t), w = weights[i], isWin = w === maxW && !isSel;
                return (
                    <g key={i} onClick={() => onSelect(i)} style={{ cursor: "pointer" }}>
                        {isWin && <circle cx={TX(i)} cy={TY} r={TR + 7} fill="none"
                            stroke={acc || headColor} strokeWidth={1.5} strokeOpacity={.35}>
                            <animate attributeName="r" values={`${TR + 5};${TR + 12};${TR + 5}`} dur="1.8s" repeatCount="indefinite" />
                            <animate attributeName="stroke-opacity" values=".35;.05;.35" dur="1.8s" repeatCount="indefinite" />
                        </circle>}
                        <circle cx={TX(i)} cy={TY} r={isSel ? TR + 3 : TR}
                            fill={isSel ? `${headColor}28` : isWin ? `${acc || headColor}1e` : C.card2}
                            stroke={isSel ? headColor : isWin ? (acc || headColor) : acc ? `${acc}55` : C.border2}
                            strokeWidth={isSel || isWin ? 2 : 1} style={{ transition: "all .3s" }} />
                        <text x={TX(i)} y={TY + 4} textAnchor="middle"
                            fill={isSel ? headColor : isWin ? (acc || headColor) : acc || C.text}
                            fontSize={t.length > 4 ? 8 : 11} fontFamily={C.mono}
                            fontWeight={isSel || isWin ? "700" : "400"}
                            style={{ pointerEvents: "none", transition: "fill .3s" }}>{t}</text>
                        {isSel && <text x={TX(i)} y={TY - 26} textAnchor="middle"
                            fill={headColor} fontSize={8} fontFamily={C.mono}>query</text>}
                        {w > .045 && <text x={TX(i)} y={height - 18} textAnchor="middle"
                            fill={isWin ? headColor : C.faint} fontSize={8} fontFamily={C.mono}>
                            {(w * 100).toFixed(0)}%</text>}
                    </g>
                );
            })}
        </svg>
    );
}

// ── Attention Heatmap Component ───────────────────────────────────────────────
function Heatmap({ matrix, selected, onSelect }) {
    const [hov, setHov] = useState(null);
    const cell = 26, gap = 2, total = cell + gap;
    const W = N * total + 80, H = N * total + 44;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
            {/* Column headers */}
            {TOKENS.map((t, j) => (
                <text key={j} x={72 + j * total + cell / 2} y={20} textAnchor="middle"
                    fill={j === selected ? C.orange : TOK_COLOR(t) || C.muted}
                    fontSize={8} fontFamily={C.mono} fontWeight={j === selected ? "700" : "400"}>
                    {t.slice(0, 3)}
                </text>
            ))}
            {/* Row headers + cells */}
            {TOKENS.map((rt, i) => (
                <g key={i}>
                    <text x={68} y={38 + i * total + cell / 2} textAnchor="end" dominantBaseline="middle"
                        fill={i === selected ? C.orange : TOK_COLOR(rt) || C.muted}
                        fontSize={8} fontFamily={C.mono} fontWeight={i === selected ? "700" : "400"}
                        style={{ cursor: "pointer" }} onClick={() => onSelect(i)}>
                        {rt.slice(0, 4)}
                    </text>
                    {matrix[i].map((w, j) => {
                        const isSelRow = i === selected, isSelCol = j === selected;
                        const isHov = hov && hov[0] === i && hov[1] === j;
                        const alpha = Math.floor(w * 220 + 8).toString(16).padStart(2, "0");
                        const col = TOK_COLOR(TOKENS[j]) || C.teal;
                        return (
                            <g key={j} onMouseEnter={() => setHov([i, j])} onMouseLeave={() => setHov(null)}
                                onClick={() => onSelect(i)} style={{ cursor: "pointer" }}>
                                <rect x={72 + j * total} y={28 + i * total} width={cell} height={cell} rx={3}
                                    fill={`${col}${alpha}`}
                                    stroke={isSelRow || isSelCol ? col : isHov ? "#ffffff30" : C.border}
                                    strokeWidth={isSelRow && isSelCol ? 2 : isSelRow || isSelCol ? .8 : .3}
                                    style={{ transition: "all .25s" }} />
                                {isHov && (
                                    <text x={72 + j * total + cell / 2} y={28 + i * total + cell / 2 + 1}
                                        textAnchor="middle" dominantBaseline="middle"
                                        fill={w > .3 ? C.bg : C.text} fontSize={7} fontFamily={C.mono} fontWeight="700">
                                        {(w * 100).toFixed(0)}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </g>
            ))}
            {/* Tooltip */}
            {hov && (
                <text x={W / 2} y={H - 4} textAnchor="middle" fill={C.muted} fontSize={8} fontFamily={C.mono}>
                    {TOKENS[hov[0]]} → {TOKENS[hov[1]]}: {(matrix[hov[0]][hov[1]] * 100).toFixed(1)}% attention
                </text>
            )}
        </svg>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
// CHAPTER 1: The RNN Problem
// ════════════════════════════════════════════════════════════════════════════════
function Ch1() {
    const [step, setStep] = useState(-1);
    const [playing, setPlaying] = useState(false);
    const iref = useRef(null);
    const RNN = ["The", "cat", "sat", "on", "the", "mat", "…"];
    const nr = RNN.length;
    const bx = i => 24 + i * 100, by = 72;

    useEffect(() => {
        if (playing) {
            iref.current = setInterval(() => {
                setStep(s => { if (s >= nr - 1) { setPlaying(false); return s; } return s + 1; });
            }, 720);
        }
        return () => clearInterval(iref.current);
    }, [playing]);

    const ret = i => step < 0 ? 1 : Math.max(.05, 1 - (step - i) * .175);
    const reset = () => { clearInterval(iref.current); setStep(-1); setPlaying(false); };

    return (
        <div>
            <SectionLabel n={1} />
            <H size={22} mb={10}>The <span style={{ color: C.orange }}>Problem</span> With Everything That Came Before</H>

            <Prose>Before 2017, the dominant approach for processing language was the <strong style={{ color: C.text }}>Recurrent Neural Network (RNN)</strong>. The idea was elegant: read a sequence one token at a time, carry a "hidden state" forward through each step — like reading a sentence and taking notes as you go.</Prose>
            <Prose>By the last word, your notes contain a summary of everything you've read. Use that summary to do your task. Simple. Elegant. And in practice, deeply broken.</Prose>

            <Formula>h_t = tanh(W_h · h_(t-1) + W_x · x_t + b)</Formula>
            <Prose style={{ fontSize: 12 }}>Each hidden state h_t depends on the previous h_(t-1). You cannot process token 5 until you've finished token 4. This is the original sin.</Prose>

            <Divider />
            <H size={16} mb={8} color={C.orange}>Experiment: Watch What Gets Lost</H>
            <Prose>Hit play. Watch the processor move token by token. The bars below each token show <strong style={{ color: C.text }}>memory retention</strong> — how much information from that token survives to the end. Early tokens get compressed into oblivion.</Prose>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 14px 14px", margin: "12px 0" }}>
                <svg viewBox="0 0 720 195" style={{ width: "100%", height: "auto", display: "block" }}>
                    <defs>
                        <marker id="a1" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                            <path d="M0,1L6,3.5L0,6Z" fill={C.orange} />
                        </marker>
                    </defs>
                    {RNN.map((_, i) => i < nr - 1 && (
                        <line key={i} x1={bx(i) + 50} y1={by} x2={bx(i + 1) - 12} y2={by}
                            stroke={i < step ? C.orange : C.faint} strokeWidth={2.5}
                            markerEnd="url(#a1)" style={{ transition: "stroke .4s" }} />
                    ))}
                    {step >= 0 && step < nr && (
                        <rect x={bx(step) - 12} y={by - 30} width={102} height={58} rx={11}
                            fill={`${C.orange}14`} stroke={C.orange} strokeWidth={1.5}>
                            <animate attributeName="opacity" values="1;.45;1" dur=".9s" repeatCount="indefinite" />
                        </rect>
                    )}
                    {RNN.map((t, i) => {
                        const active = i === step, done = i < step, r = ret(i);
                        return (
                            <g key={i}>
                                <rect x={bx(i) - 12} y={by - 26} width={92} height={50} rx={10}
                                    fill={active ? `${C.orange}1a` : C.card2}
                                    stroke={active ? C.orange : done ? C.border2 : C.border}
                                    strokeWidth={active ? 1.5 : 1} style={{ transition: "all .35s" }} />
                                <text x={bx(i) + 34} y={by + 6} textAnchor="middle"
                                    fill={active ? C.orange : done ? C.text : C.muted}
                                    fontSize={t === "…" ? 20 : 13} fontFamily={C.mono} fontWeight={active ? "700" : "400"}
                                    style={{ transition: "fill .3s" }}>{t}</text>
                                <text x={bx(i) + 34} y={by - 32} textAnchor="middle" fill={C.faint} fontSize={8} fontFamily={C.mono}>t{i}</text>
                                {step >= 0 && (
                                    <>
                                        <rect x={bx(i) - 12} y={by + 34} width={92} height={7} rx={3.5} fill={C.faint} />
                                        <rect x={bx(i) - 12} y={by + 34} width={92 * r} height={7} rx={3.5}
                                            fill={r > .55 ? C.teal : r > .25 ? C.amber : C.orange}
                                            style={{ transition: "width .55s ease" }} />
                                    </>
                                )}
                            </g>
                        );
                    })}
                    {step >= 0 && <text x={360} y={180} textAnchor="middle" fill={C.muted} fontSize={9} fontFamily={C.mono}>
                        memory retention — earlier tokens slowly disappear
                    </text>}
                </svg>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", paddingTop: 10 }}>
                    {[[`▶  Play`, () => { reset(); setTimeout(() => setPlaying(true), 60); }, C.orange], [`↺  Reset`, reset, C.muted]].map(([l, a, col]) => (
                        <button key={l} onClick={a} style={{
                            background: `${col}12`, border: `1px solid ${col}40`,
                            borderRadius: 9, padding: "8px 22px", color: col, fontFamily: C.mono, fontSize: 11, cursor: "pointer"
                        }}>{l}</button>
                    ))}
                </div>
            </div>

            <Divider />
            <H size={16} mb={8} color={C.orange}>The Three Fatal Flaws</H>

            {[
                [C.orange, "Sequential = No Parallelism", "Each step depends on the previous. You cannot process token 5 until you've finished 4. Training on a GPU designed to run 10,000 operations in parallel? You're bottlenecked to 1. Training times were catastrophic."],
                [C.amber, "Vanishing Gradient", "Errors travel backward through every timestep during training. Multiply a number like 0.9 by itself 50 times. You get 0.005. Gradients vanish. The model stops learning about anything that happened early in the sequence — not as a policy decision, but because the math makes it mathematically impossible."],
                [C.teal, "The Information Bottleneck", "Everything the model has read must be compressed into a single fixed-size vector before it can be used. One vector. For the whole document. You can imagine what gets dropped."],
            ].map(([col, title, desc]) => (
                <div key={title} style={{
                    background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                    padding: "14px 16px", marginBottom: 8, borderLeft: `3px solid ${col}`
                }}>
                    <div style={{ fontFamily: C.mono, fontSize: 16, color: col, fontWeight: 700, marginBottom: 5 }}>{title}</div>
                    <div style={{ fontFamily: C.mono, fontSize: 14, color: C.muted, lineHeight: 1.75 }}>{desc}</div>
                </div>
            ))}

            {step >= nr - 1 && <Callout color={C.orange} text={`You just saw it. By the time the RNN finishes, "The" and "cat" are orange slivers — compressed through 6 bottlenecks. When "it was tired" appears, the model is trying to resolve "it" from a vector that barely remembers there was a cat. This is what the Transformer fixed.`} />}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
// CHAPTER 2: The Core Idea
// ════════════════════════════════════════════════════════════════════════════════
function Ch2() {
    const [sel, setSel] = useState(7);
    const [sharp, setSharp] = useState(1.0);
    const base = HEADS.coref[7];
    const weights = useMemo(() => {
        const r = base.map(w => Math.pow(w, 1 / Math.max(sharp, .01)));
        const s = r.reduce((a, b) => a + b, 0);
        return r.map(w => w / s);
    }, [sharp]);

    return (
        <div>
            <SectionLabel n={2} />
            <H size={22} mb={10}>Direct <span style={{ color: C.teal }}>Connections</span>: The Breakthrough</H>

            <Prose>The 2017 paper — "Attention Is All You Need" — had one central insight that sounds obvious in hindsight: <strong style={{ color: C.text }}>what if every token could directly attend to every other token, regardless of distance?</strong></Prose>
            <Prose>No chain. No hidden state traveling through time. No bottleneck. Token 0 and token 9 talk to each other as directly as token 4 and token 5. And the entire conversation happens <strong style={{ color: C.text }}>in parallel</strong>.</Prose>

            <Callout color={C.teal} text={`"Attention" existed before 2017 — it was a trick bolted onto RNNs to let decoders peek at encoder states. The 2017 insight was: remove the RNN entirely. Make attention the whole architecture. That's it. That's the paper.`} />

            <Divider />
            <H size={16} mb={8} color={C.teal}>Visualizing Direct Connections</H>
            <Prose>Below: "it" (selected) attending to all other tokens simultaneously. Every arc happens at the same time. Slide the sharpness to see how focused vs diffuse attention can be — this maps to what temperature does at the logit level.</Prose>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 14px 14px", margin: "12px 0" }}>
                <ArcViz weights={weights} selected={7} onSelect={() => { }} headColor={C.teal} />
                <div style={{ padding: "4px 8px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <Tag color={C.muted}>Attention Sharpness</Tag>
                        <Tag color={C.teal}>{sharp.toFixed(2)}×</Tag>
                    </div>
                    <input type="range" min={10} max={300} value={sharp * 100}
                        onChange={e => setSharp(e.target.value / 100)}
                        style={{ width: "100%", accentColor: C.teal }} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                        <span style={{ fontFamily: C.mono, fontSize: 8, color: C.faint }}>diffuse — everything equally</span>
                        <span style={{ fontFamily: C.mono, fontSize: 8, color: C.faint }}>sharp — one token wins</span>
                    </div>
                </div>
            </div>

            <Divider />
            <H size={16} mb={8} color={C.teal}>Why Parallelism Matters So Much</H>
            <Prose>This isn't just a latency win. It's a training revolution. Modern GPUs are designed to run thousands of operations simultaneously. RNNs gave them a sequential workload — all that parallel compute sat idle.</Prose>
            <Prose>Transformers are embarrassingly parallel during training. Every token's attention over every other token can be computed at once as a single matrix multiplication. This is why you could train on billion-token datasets. This is why scaling worked.</Prose>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "12px 0" }}>
                {[
                    [C.orange, "RNN", "Sequential. Token N waits for N-1. GPU at 2% utilization. Training = weeks."],
                    [C.teal, "Transformer", "Parallel. All tokens at once. GPU at 90%+ utilization. Training = days."],
                ].map(([col, name, desc]) => (
                    <div key={name} style={{
                        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                        padding: "14px", borderTop: `3px solid ${col}`
                    }}>
                        <div style={{ fontFamily: C.mono, fontSize: 13, color: col, fontWeight: 700, marginBottom: 6 }}>{name}</div>
                        <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, lineHeight: 1.7 }}>{desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
// CHAPTER 3: Self-Attention + Full Heatmap
// ════════════════════════════════════════════════════════════════════════════════
function Ch3() {
    const [sel, setSel] = useState(7);
    const [view, setView] = useState("arcs");
    const w = HEADS.coref[sel];
    const maxW = Math.max(...w);

    const insights = {
        7: `"it" attends to "cat" at ${(w[1] * 100).toFixed(0)}%. The model correctly resolved the pronoun. Nobody labelled this data — it emerged purely from predicting next tokens across billions of sentences.`,
        2: `"sat" attends to "cat" (${(w[1] * 100).toFixed(0)}%) — its subject — and "mat" (${(w[5] * 100).toFixed(0)}%) via "on". It's assembling: who did what, where.`,
        1: `"cat" attends to "sat" (${(w[2] * 100).toFixed(0)}%). It's learning: I am the one that sat. Contextual self-definition through attention.`,
        9: `"tired" attends to "it" (${(w[7] * 100).toFixed(0)}%) and "was" (${(w[8] * 100).toFixed(0)}%). It's anchoring to its predicate chain.`,
        6: `"because" scores highest on itself and "it" — bridging the causal clause to the consequence. It's a connector and it attends like one.`,
        3: `"on" attends to "mat" (${(w[5] * 100).toFixed(0)}%) — the preposition naturally points to its object. Spatial/prepositional relationship encoded.`,
    };

    return (
        <div>
            <SectionLabel n={3} />
            <H size={22} mb={10}><span style={{ color: C.orange }}>Self-Attention</span>: Tokens Talking to Tokens</H>

            <Prose><strong style={{ color: C.text }}>Self-attention</strong> means a sequence attending to itself — every token in your input produces attention weights over every other token in the same input. There's no separate encoder/decoder here. The same sequence is the query, the key, and the value source.</Prose>
            <Prose>When the model processes "The cat sat on the mat because it was tired," self-attention lets "it" look directly at every other word and decide: which of these am I referring to? The answer — 67% "cat", 6% "sat", everything else in the noise — is computed in a single operation.</Prose>

            <Formula>Attention(Q,K,V) = softmax( Q·Kᵀ / √d_k ) · V</Formula>

            <Prose style={{ fontSize: 13 }}>Don't worry about the formula yet — Chapter 4 breaks it down step by step. Right now, explore what it produces.</Prose>

            <Divider />
            <H size={16} mb={8} color={C.orange}>Explorer: Click Any Word</H>

            <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
                {TOKENS.map((t, i) => {
                    const acc = TOK_COLOR(t) || C.muted;
                    return <button key={i} onClick={() => setSel(i)} style={{
                        padding: "5px 12px", borderRadius: 7, cursor: "pointer", fontFamily: C.mono, fontSize: 11,
                        background: sel === i ? `${acc}20` : "transparent",
                        border: `1px solid ${sel === i ? acc : C.border2}`,
                        color: sel === i ? acc : C.muted, transition: "all .2s", fontWeight: sel === i ? "700" : "400"
                    }}>{t}</button>;
                })}
            </div>

            {/* View toggle */}
            <div style={{
                display: "flex", gap: 4, background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 10, padding: 3, marginBottom: 10
            }}>
                {[["arcs", "Arc View"], ["heat", "Heatmap"]].map(([v, l]) => (
                    <button key={v} onClick={() => setView(v)} style={{
                        flex: 1, padding: "7px", borderRadius: 8,
                        border: "none", cursor: "pointer", fontFamily: C.mono, fontSize: 11,
                        background: view === v ? `${C.orange}20` : "transparent",
                        color: view === v ? C.orange : C.faint, transition: "all .2s"
                    }}>{l}</button>
                ))}
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px", marginBottom: 10 }}>
                {view === "arcs"
                    ? <ArcViz weights={w} selected={sel} onSelect={setSel} />
                    : <Heatmap matrix={HEADS.coref} selected={sel} onSelect={setSel} />
                }
            </div>

            {/* Weight bars */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 14px", marginBottom: 10 }}>
                <Tag color={C.muted} style={{ marginBottom: 10, display: "block" }}>Distribution from "{TOKENS[sel]}"</Tag>
                <div style={{ display: "flex", gap: 3, marginTop: 8 }}>
                    {w.map((v, j) => {
                        const acc = TOK_COLOR(TOKENS[j]) || C.teal;
                        const hex = Math.round(v * 220 + 15).toString(16).padStart(2, "0");
                        const isWin = v === maxW && j !== sel;
                        return (
                            <div key={j} style={{
                                flex: 1, borderRadius: 7, padding: "9px 2px", textAlign: "center",
                                background: `${acc}${hex}`, border: `1px solid ${isWin ? acc : "transparent"}`,
                                transition: "all .35s"
                            }}>
                                <div style={{ fontFamily: C.mono, fontSize: 7, color: v > .28 ? C.bg : v > .09 ? C.text : C.muted, marginBottom: 1 }}>{TOKENS[j]}</div>
                                <div style={{ fontFamily: C.mono, fontSize: 10, fontWeight: "700", color: v > .28 ? C.bg : v > .1 ? C.text : C.faint }}>{(v * 100).toFixed(0)}%</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {view === "heat" && <Callout color={C.amber} text="The heatmap shows ALL attention weights at once. Each row = one token attending. Click a row label to select it. Diagonal = self-attention (each token attends to itself). Off-diagonal patterns reveal what the model learned about relationships." />}
            {insights[sel]
                ? <Callout color={C.orange} text={insights[sel]} />
                : <Callout color={C.muted} text={`"${TOKENS[sel]}" is building its contextual representation. Try clicking other words — especially "it", "sat", and "because" for the most interesting patterns.`} />
            }

            <Divider />
            <H size={16} mb={8} color={C.orange}>What's Actually Happening</H>
            <Prose>The output for each token is not its original embedding anymore. It's a <strong style={{ color: C.text }}>weighted blend of other tokens' representations</strong>, weighted by how relevant each was. "it" exits self-attention carrying 67% "cat", 6% "sat", and small amounts of everything else.</Prose>
            <Prose>This new vector now contextually knows it's a pronoun referring to the cat. The original embedding of "it" had no idea. Self-attention is where context gets baked in.</Prose>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
// CHAPTER 4: Q·K·V Deep Dive
// ════════════════════════════════════════════════════════════════════════════════
function Ch4() {
    const [step, setStep] = useState(0);
    const [qTok, setQTok] = useState(7);
    const w = HEADS.coref[qTok];
    const maxW = Math.max(...w);
    const steps = ["1. Query", "2. Keys", "3. Dot Product", "4. Scale", "5. Softmax", "6. Output"];
    const descs = [
        `Every token generates a Query vector by multiplying its embedding by a learned W_Q matrix. This encodes: "What am I looking for?" Different tokens want different things — "it" wants an antecedent; "on" wants a spatial object.`,
        `Every token also generates a Key vector via W_K. Keys are advertisements: "Here's what I contain." The model learns — through training — what to put in Keys so that Queries find the right tokens.`,
        `Compute the dot product between the Query of "${TOKENS[qTok]}" and the Key of every other token. High dot product = similar direction = high relevance. The raw scores are unnormalized — just raw similarity.`,
        `Divide every score by √d_k (square root of the key dimension). Without this, scores for high-dimensional vectors get very large, pushing softmax into saturation where everything looks like 0% or 100%. Scaling prevents this. It's a stability trick that matters enormously.`,
        `Run softmax on the scaled scores. This converts raw numbers into probabilities summing to 1. High scores dominate. Low ones get crushed toward zero. These are your final attention weights.`,
        `Multiply each weight by that token's Value vector (embedding × W_V), then sum everything up. The output for "${TOKENS[qTok]}" is a weighted blend — informationally enriched by what it paid attention to.`,
    ];

    return (
        <div>
            <SectionLabel n={4} />
            <H size={22} mb={10}><span style={{ color: C.amber }}>Q · K · V</span>: The Mechanism</H>

            <Prose>Every token generates three different vectors. Not one — three. Each serves a distinct role in the attention computation, and each comes from a different learned weight matrix applied to the same embedding.</Prose>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, margin: "14px 0" }}>
                {[
                    [C.orange, "Q", "Query", "What am I looking for?", "W_Q"],
                    [C.teal, "K", "Key", "What do I contain?", "W_K"],
                    [C.amber, "V", "Value", "What will I give?", "W_V"],
                ].map(([col, letter, name, desc, mat]) => (
                    <div key={letter} style={{
                        background: C.card, border: `1px solid ${col}30`, borderRadius: 12,
                        padding: "14px", borderTop: `3px solid ${col}`, textAlign: "center"
                    }}>
                        <div style={{ fontFamily: C.mono, fontSize: 28, color: col, fontWeight: 700, marginBottom: 4 }}>{letter}</div>
                        <div style={{ fontFamily: C.mono, fontSize: 11, color: col, marginBottom: 6 }}>{name}</div>
                        <div style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, lineHeight: 1.6, marginBottom: 8 }}>{desc}</div>
                        <Mono color={col}>{mat}</Mono>
                    </div>
                ))}
            </div>

            <Prose>The YouTube analogy is accurate: your search query is Q, video titles and tags are K, the actual video content is V. You find relevant videos by matching Q against K, then retrieve V. Attention does the same thing, but the queries, keys, and values are all <em style={{ color: C.text }}>learned</em> — the model decides what to search for and how to advertise.</Prose>

            <Divider />
            <H size={16} mb={8} color={C.amber}>Step Through the Full Computation</H>

            <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
                {TOKENS.map((t, i) => {
                    const acc = TOK_COLOR(t) || C.muted;
                    return <button key={i} onClick={() => { setQTok(i); setStep(0); }} style={{
                        padding: "5px 10px", borderRadius: 7, cursor: "pointer", fontFamily: C.mono, fontSize: 11,
                        background: qTok === i ? `${acc}20` : "transparent",
                        border: `1px solid ${qTok === i ? acc : C.border2}`,
                        color: qTok === i ? acc : C.muted, transition: "all .2s"
                    }}>{t}</button>;
                })}
            </div>

            <div style={{
                display: "flex", gap: 3, background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: 3, marginBottom: 12
            }}>
                {steps.map((s, i) => (
                    <button key={i} onClick={() => setStep(i)} style={{
                        flex: 1, padding: "7px 2px", borderRadius: 9, border: "none", cursor: "pointer",
                        background: step === i ? `${C.amber}20` : "transparent",
                        color: step === i ? C.amber : i < step ? `${C.muted}80` : C.faint,
                        fontFamily: C.mono, fontSize: 8, fontWeight: step === i ? "700" : "400", transition: "all .2s"
                    }}>
                        {i < step ? "✓" : ""}{s}
                    </button>
                ))}
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, minHeight: 170, marginBottom: 10 }}>
                {step === 0 && (
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                            <div style={{ background: `${TOK_COLOR(TOKENS[qTok]) || C.orange}20`, border: `1px solid ${TOK_COLOR(TOKENS[qTok]) || C.orange}`, borderRadius: 9, padding: "7px 14px", fontFamily: C.mono, fontSize: 14, color: TOK_COLOR(TOKENS[qTok]) || C.orange, fontWeight: 700 }}>{TOKENS[qTok]}</div>
                            <span style={{ color: C.faint, fontFamily: C.mono, fontSize: 12 }}>× W_Q =</span>
                            <span style={{ fontFamily: C.mono, fontSize: 11, color: C.orange }}>Query vector Q</span>
                        </div>
                        <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 72 }}>
                            {w.map((v, i) => (
                                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                                    <div style={{
                                        width: "100%", background: C.orange, borderRadius: "2px 2px 0 0",
                                        height: `${12 + v * 58}px`, opacity: .45 + v * .55, transition: "height .4s"
                                    }} />
                                    <div style={{ fontFamily: C.mono, fontSize: 6, color: C.faint }}>{i}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ fontFamily: C.mono, fontSize: 9, color: C.faint, marginTop: 6, textAlign: "center" }}>
                            Q encodes "what {TOKENS[qTok]} is looking for" in {w.length}-dimensional space
                        </div>
                    </div>
                )}
                {step === 1 && (
                    <div>
                        <Tag color={C.muted} style={{ marginBottom: 10, display: "block" }}>Key vectors — every token advertising its contents:</Tag>
                        {TOKENS.map((t, i) => {
                            const acc = TOK_COLOR(t) || C.teal;
                            return (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                                    <div style={{ width: 62, fontFamily: C.mono, fontSize: 11, color: acc, textAlign: "right" }}>{t}</div>
                                    <div style={{ flex: 1, height: 14, background: C.faint, borderRadius: 3, overflow: "hidden" }}>
                                        <div style={{
                                            height: "100%", width: `${16 + w[i] * 76}%`, background: `${acc}90`,
                                            borderRadius: 3, transition: "width .4s"
                                        }} />
                                    </div>
                                    <div style={{ width: 18, fontFamily: C.mono, fontSize: 8, color: C.faint }}>K{i}</div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {step === 2 && (
                    <div>
                        <Tag color={C.muted} style={{ marginBottom: 10, display: "block" }}>Raw dot-product scores: Q · Kᵀ (unnormalized)</Tag>
                        {TOKENS.map((t, i) => {
                            const acc = TOK_COLOR(t) || C.teal;
                            return (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                                    <div style={{ width: 62, fontFamily: C.mono, fontSize: 11, color: acc, textAlign: "right" }}>{t}</div>
                                    <div style={{ flex: 1, height: 15, background: C.faint, borderRadius: 3, overflow: "hidden" }}>
                                        <div style={{
                                            height: "100%", width: `${6 + w[i] * 90}%`, background: acc,
                                            opacity: .35 + w[i] * .65, borderRadius: 3, transition: "width .4s"
                                        }} />
                                    </div>
                                    <div style={{ width: 38, fontFamily: C.mono, fontSize: 9, color: C.muted, textAlign: "right" }}>
                                        {(w[i] * 10 - 2).toFixed(2)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {step === 3 && (
                    <div>
                        <Formula>score / √d_k</Formula>
                        <Prose>Without scaling, dot-product scores grow large as dimension d_k increases — variance of the dot product is proportional to d_k. Large scores push softmax into extreme values: gradients vanish, training breaks.</Prose>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                            {[["Before scaling (raw)", w.map(v => v * 10 - 2), C.orange], ["After ÷ √d_k", w.map(v => (v * 10 - 2) / Math.sqrt(10)), C.teal]].map(([label, vals, col]) => (
                                <div key={label}>
                                    <div style={{ fontFamily: C.mono, fontSize: 9, color: col, marginBottom: 6 }}>{label}</div>
                                    <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 55 }}>
                                        {vals.map((v, i) => {
                                            const h = Math.max(4, (v + 3) * 9);
                                            return <div key={i} style={{
                                                flex: 1, background: col, borderRadius: "2px 2px 0 0",
                                                height: `${h}px`, opacity: .4 + Math.max(0, v / 8) * .6
                                            }} />;
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {step === 4 && (
                    <div>
                        <Tag color={C.muted} style={{ marginBottom: 10, display: "block" }}>softmax(scores) → probabilities, Σ = 1.0</Tag>
                        <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 90 }}>
                            {w.map((v, i) => {
                                const acc = TOK_COLOR(TOKENS[i]) || C.teal, isWin = v === maxW;
                                return (
                                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                                        <div style={{ fontFamily: C.mono, fontSize: 7, color: isWin ? C.text : C.faint }}>{(v * 100).toFixed(0)}%</div>
                                        <div style={{
                                            width: "100%", background: isWin ? acc : `${acc}55`, borderRadius: "2px 2px 0 0",
                                            height: `${v * 82}px`, border: isWin ? `1px solid ${acc}` : "none", transition: "height .4s"
                                        }} />
                                        <div style={{ fontFamily: C.mono, fontSize: 7, color: acc }}>{TOKENS[i]}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {step === 5 && (
                    <div>
                        <Prose>Weighted sum of all Value vectors, weighted by attention probabilities:</Prose>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
                            {w.map((v, i) => {
                                if (v < .025) return null;
                                const acc = TOK_COLOR(TOKENS[i]) || C.teal;
                                return (
                                    <div key={i} style={{
                                        background: `${acc}10`, border: `1px solid ${acc}30`,
                                        borderRadius: 8, padding: "6px 10px", display: "flex", gap: 5, alignItems: "center"
                                    }}>
                                        <span style={{ fontFamily: C.mono, fontSize: 9, color: C.muted }}>{(v * 100).toFixed(0)}%</span>
                                        <span style={{ fontFamily: C.mono, fontSize: 11, color: acc, fontWeight: 700 }}>× V_{TOKENS[i]}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{
                            background: `${C.amber}0e`, border: `1px solid ${C.amber}28`, borderRadius: 10,
                            padding: "11px 14px", fontFamily: C.mono, fontSize: 11, color: C.text, lineHeight: 1.6
                        }}>
                            → New embedding for <span style={{ color: C.amber, fontWeight: 700 }}>"{TOKENS[qTok]}"</span>:
                            contextually enriched, dominated by <span style={{ color: TOK_COLOR(TOKENS[w.indexOf(maxW)]) || C.teal }}>{TOKENS[w.indexOf(maxW)]}</span> at {(maxW * 100).toFixed(0)}%.
                        </div>
                    </div>
                )}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
                    <button disabled={step === 0} onClick={() => setStep(s => s - 1)} style={{
                        background: "transparent", border: `1px solid ${step === 0 ? C.faint : C.border2}`, borderRadius: 8,
                        padding: "6px 14px", color: step === 0 ? C.faint : C.muted, fontFamily: C.mono, fontSize: 10,
                        cursor: step === 0 ? "not-allowed" : "pointer"
                    }}>← back</button>
                    <button disabled={step === steps.length - 1} onClick={() => setStep(s => s + 1)} style={{
                        background: step === steps.length - 1 ? "transparent" : `${C.amber}15`,
                        border: `1px solid ${step === steps.length - 1 ? C.faint : C.amber}`, borderRadius: 8,
                        padding: "6px 14px", color: step === steps.length - 1 ? C.faint : C.amber,
                        fontFamily: C.mono, fontSize: 10, cursor: step === steps.length - 1 ? "not-allowed" : "pointer"
                    }}>next →</button>
                </div>
            </div>
            <Callout color={C.amber} text={descs[step]} />
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
// CHAPTER 5: Multi-Head
// ════════════════════════════════════════════════════════════════════════════════
function Ch5() {
    const [head, setHead] = useState("coref");
    const [sel, setSel] = useState(7);
    const w = HEADS[head][sel], maxW = Math.max(...w);
    const hc = ({ coref: C.orange, syntactic: C.teal, positional: C.purple })[head];
    const meta = {
        coref: { label: "Coreference", desc: "Tracks pronoun→noun links. \"it\"→\"cat\" at 67%. Nobody taught it this — it learned from text." },
        syntactic: { label: "Syntactic", desc: "Maps grammar. Subject→verb→object. \"cat\" knows it owns \"sat\". \"sat\" knows its object is \"mat\"." },
        positional: { label: "Positional", desc: "Attends to immediate neighbors. Encodes local word order and adjacency." },
    };

    return (
        <div>
            <SectionLabel n={5} />
            <H size={22} mb={10}><span style={{ color: C.purple }}>Multi-Head</span> Attention</H>

            <Prose>A single attention head can only find one type of relationship at a time. When processing "The bank by the river bank broke the bank" — a single head can't simultaneously track that "bank" refers to a financial institution, a riverbank, and a verb.</Prose>
            <Prose><strong style={{ color: C.text }}>Multi-head attention</strong> runs the attention mechanism h times in parallel, each with completely independent W_Q, W_K, W_V weight matrices. Each head learns to specialize. The outputs are concatenated and projected back to the original dimension.</Prose>

            <Formula>MultiHead(Q,K,V) = Concat(head_1,...,head_h) · W_O</Formula>

            <Prose style={{ fontSize: 13 }}>The original paper used 8 heads. Modern models use 32, 64, even 96. Each head operates on a lower-dimensional projection (d_model / h), so total compute stays roughly constant. You get h perspectives for the price of one.</Prose>

            <Divider />
            <H size={16} mb={8} color={C.purple}>Compare 3 Specialized Heads</H>

            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {Object.entries(meta).map(([key, m]) => {
                    const col = { coref: C.orange, syntactic: C.teal, positional: C.purple }[key];
                    return (
                        <button key={key} onClick={() => setHead(key)} style={{
                            flex: 1, padding: "10px 6px", borderRadius: 10, cursor: "pointer", fontFamily: C.mono,
                            fontSize: 10, border: `1px solid ${head === key ? col : C.border2}`, textAlign: "center",
                            background: head === key ? `${col}18` : "transparent", color: head === key ? col : C.muted,
                            transition: "all .2s"
                        }}>
                            <div style={{ fontWeight: 700, marginBottom: 2 }}>{m.label}</div>
                            <div style={{ fontSize: 8, opacity: .65 }}>head specialization</div>
                        </button>
                    );
                })}
            </div>

            <div style={{
                fontFamily: C.mono, fontSize: 11, color: C.muted, padding: "10px 14px",
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 10, lineHeight: 1.65
            }}>
                <span style={{ color: hc }}>▸ </span>{meta[head].desc}
            </div>

            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                {TOKENS.map((t, i) => {
                    const acc = TOK_COLOR(t) || C.muted;
                    return <button key={i} onClick={() => setSel(i)} style={{
                        padding: "5px 10px", borderRadius: 7, cursor: "pointer", fontFamily: C.mono, fontSize: 11,
                        background: sel === i ? `${acc}20` : "transparent",
                        border: `1px solid ${sel === i ? acc : C.border2}`,
                        color: sel === i ? acc : C.muted, transition: "all .2s", fontWeight: sel === i ? "700" : "400"
                    }}>{t}</button>;
                })}
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px", marginBottom: 10 }}>
                <ArcViz weights={w} selected={sel} onSelect={setSel} headColor={hc} />
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px" }}>
                <Tag color={C.muted} style={{ display: "block", marginBottom: 10 }}>All 3 heads for "{TOKENS[sel]}" — same token, 3 specializations:</Tag>
                {Object.entries(meta).map(([key, m]) => {
                    const hw = HEADS[key][sel], hmax = Math.max(...hw), col = { coref: C.orange, syntactic: C.teal, positional: C.purple }[key];
                    return (
                        <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <div style={{ width: 82, fontFamily: C.mono, fontSize: 9, color: col }}>{m.label}</div>
                            <div style={{ flex: 1, display: "flex", gap: 2, height: 16 }}>
                                {hw.map((v, j) => (
                                    <div key={j} title={`${TOKENS[j]}: ${(v * 100).toFixed(0)}%`}
                                        style={{
                                            flex: 1, background: `${col}${Math.round(v * 215 + 18).toString(16).padStart(2, "0")}`,
                                            borderRadius: 2, border: v === hmax ? `1px solid ${col}` : "none", transition: "background .4s"
                                        }} />
                                ))}
                            </div>
                            <div style={{ width: 54, fontFamily: C.mono, fontSize: 9, color: col, textAlign: "right" }}>
                                → {TOKENS[hw.indexOf(hmax)]}
                            </div>
                        </div>
                    );
                })}
                <div style={{ fontFamily: C.mono, fontSize: 8, color: C.faint, marginTop: 8, textAlign: "center" }}>
                    hover cells for % · same token · 3 completely different specializations · real GPT-3 uses 96 heads
                </div>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
// CHAPTER 6: Positional Encoding
// ════════════════════════════════════════════════════════════════════════════════
function Ch6() {
    const [dim, setDim] = useState(0);
    const [showShuffle, setShowShuffle] = useState(false);
    const shuffled = ["mat", "it", "sat", "The", "because", "cat", "the", "was", "tired", "on"];
    const dims = Array.from({ length: 12 }, (_, i) => i);

    const vals = useMemo(() =>
        TOKENS.map((_, pos) => dims.map(d => PE(pos, d, 24)))
        , []);

    const sinWave = useMemo(() =>
        TOKENS.map((_, pos) => PE(pos, dim, 24))
        , [dim]);

    function colorFromPE(v) {
        const t = (v + 1) / 2;
        const r = Math.floor(lerp(96, 255, t));
        const g = Math.floor(lerp(165, 98, t));
        const b = Math.floor(lerp(250, 53, t));
        return `rgb(${r},${g},${b})`;
    }
    function lerp(a, b, t) { return a + (b - a) * t; }

    return (
        <div>
            <SectionLabel n={6} />
            <H size={22} mb={10}><span style={{ color: C.blue }}>Positional Encoding</span>: The Dirty Secret</H>

            <Prose>Here's something the title "Attention Is All You Need" doesn't mention: <strong style={{ color: C.text }}>attention has no idea about order.</strong></Prose>
            <Prose>When every token attends to every other token in parallel, there's no inherent sense that token 3 comes before token 7. The math is position-agnostic. If you shuffled "The cat sat on the mat" to "mat cat The sat on the," the attention scores would be identical.</Prose>

            <div style={{ background: C.card, border: `1px solid ${C.border2}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <button onClick={() => setShowShuffle(false)} style={{
                        flex: 1, padding: "7px", borderRadius: 8, border: "none",
                        cursor: "pointer", fontFamily: C.mono, fontSize: 10,
                        background: !showShuffle ? `${C.blue}20` : "transparent", color: !showShuffle ? C.blue : C.faint, transition: "all .2s"
                    }}>
                        Original order
                    </button>
                    <button onClick={() => setShowShuffle(true)} style={{
                        flex: 1, padding: "7px", borderRadius: 8, border: "none",
                        cursor: "pointer", fontFamily: C.mono, fontSize: 10,
                        background: showShuffle ? `${C.orange}20` : "transparent", color: showShuffle ? C.orange : C.faint, transition: "all .2s"
                    }}>
                        Shuffled (attention is blind)
                    </button>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {(showShuffle ? shuffled : TOKENS).map((t, i) => {
                        const acc = TOK_COLOR(t) || C.muted;
                        return (
                            <div key={i} style={{
                                padding: "6px 10px", borderRadius: 8, fontFamily: C.mono, fontSize: 12,
                                background: `${acc}15`, border: `1px solid ${acc}35`, color: acc
                            }}>
                                {i + 1}. {t}
                            </div>
                        );
                    })}
                </div>
                {showShuffle && <div style={{ fontFamily: C.mono, fontSize: 10, color: C.orange, marginTop: 8, lineHeight: 1.6 }}>
                    Without positional encoding, the model treats this as equivalent to the original. The grammar dies. The meaning dies. It needs positional information injected externally.
                </div>}
            </div>

            <Divider />
            <H size={16} mb={8} color={C.blue}>Sinusoidal Positional Encoding</H>
            <Prose>The fix: before feeding tokens into the Transformer, add a positional encoding vector to each token's embedding. Each position gets a unique pattern of sine and cosine values:</Prose>

            <Formula>
                PE(pos, 2i) = sin(pos / 10000^(2i/d_model))<br />
                PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
            </Formula>

            <Prose>Each dimension oscillates at a different frequency — some fast (change every position), some slow (change over hundreds of positions). Together, every position gets a unique fingerprint the model can use to infer ordering and distance.</Prose>

            <H size={15} mb={8} color={C.muted}>Interactive: Positional Encoding Grid</H>
            <Prose style={{ fontSize: 13 }}>Each cell = PE value for that (position, dimension) pair. Purple = -1, orange = +1. Select a dimension below to highlight its wave pattern.</Prose>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
                {/* Heatmap grid */}
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${N},1fr)`, gap: 3, marginBottom: 10 }}>
                    {TOKENS.map((t, pos) => (
                        <div key={pos} style={{
                            textAlign: "center", fontFamily: C.mono, fontSize: 8,
                            color: TOK_COLOR(t) || C.muted, marginBottom: 3
                        }}>{t.slice(0, 3)}</div>
                    ))}
                    {dims.map(d => (
                        <>{TOKENS.map((_, pos) => {
                            const v = vals[pos][d];
                            const isSelDim = d === dim;
                            return (
                                <div key={pos} style={{
                                    height: 18, borderRadius: 3,
                                    background: colorFromPE(v),
                                    border: isSelDim ? `1.5px solid ${C.blue}` : `1px solid transparent`,
                                    opacity: isSelDim ? 1 : .55,
                                    transition: "all .3s"
                                }} />
                            );
                        })}</>
                    ))}
                </div>
                {/* Dimension selector */}
                <div style={{ padding: "0 4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <Tag color={C.muted}>Dimension</Tag>
                        <Tag color={C.blue}>{dim} (frequency: {dim % 2 === 0 ? `sin` : `cos`}, period ≈ {Math.round(2 * Math.PI * Math.pow(10000, dim / 24))})</Tag>
                    </div>
                    <input type="range" min={0} max={dims.length - 1} value={dim}
                        onChange={e => setDim(+e.target.value)}
                        style={{ width: "100%", accentColor: C.blue }} />
                </div>
                {/* Wave visualization */}
                <div style={{ marginTop: 12 }}>
                    <Tag color={C.muted} style={{ marginBottom: 8, display: "block" }}>Dimension {dim} across all positions:</Tag>
                    <svg viewBox={`0 0 ${N * 64} 60`} style={{ width: "100%", height: "auto", display: "block" }}>
                        {sinWave.map((v, i) => (
                            <g key={i}>
                                <rect x={i * 64 + 4} y={2} width={56} height={56} rx={6}
                                    fill={colorFromPE(v)} opacity={.85} />
                                <text x={i * 64 + 32} y={35} textAnchor="middle" dominantBaseline="middle"
                                    fill={Math.abs(v) > .5 ? C.bg : C.text} fontSize={10} fontFamily={C.mono} fontWeight="700">
                                    {v.toFixed(2)}
                                </text>
                                <text x={i * 64 + 32} y={52} textAnchor="middle"
                                    fill={C.faint} fontSize={7} fontFamily={C.mono}>{TOKENS[i].slice(0, 3)}</text>
                            </g>
                        ))}
                    </svg>
                </div>
            </div>

            <Callout color={C.blue} text={`Positional encoding is the part "Attention Is All You Need" quietly ignores. You definitely need it. Modern models (like those using RoPE — Rotary Position Embedding) embed position more cleverly, but the need to inject positional information externally has never gone away.`} />
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
// CHAPTER 7: Full Transformer Layer
// ════════════════════════════════════════════════════════════════════════════════
function Ch7() {
    const [active, setActive] = useState(null);
    const layers = [
        { id: "input", label: "Input Embeddings + PE", color: C.blue, y: 10, desc: "Token embeddings (from vocabulary lookup) + positional encodings. The raw input to every transformer layer." },
        { id: "mha", label: "Multi-Head Self-Attention", color: C.orange, y: 80, desc: "The attention mechanism you now know deeply. 8 (or more) heads, each finding different relationships. Runs in parallel." },
        { id: "add1", label: "Add & Layer Norm", color: C.teal, y: 148, desc: "Residual connection: add the input directly to the attention output. Then normalize. This lets gradients flow freely during training and prevents the vanishing gradient problem from creeping back in." },
        { id: "ffn", label: "Feed-Forward Network", color: C.amber, y: 214, desc: "Two linear transformations with a ReLU in between: FFN(x) = max(0, xW₁+b₁)W₂+b₂. The inner dimension is 4× larger (2048 in original paper). Research suggests attention does routing; FFN does knowledge storage." },
        { id: "add2", label: "Add & Layer Norm", color: C.teal, y: 280, desc: "Another residual connection and normalization after the FFN. Same purpose — gradient highway + training stability." },
        { id: "output", label: "Output (repeat × 6–96 layers)", color: C.purple, y: 346, desc: "The output feeds into the next identical layer. The original Transformer stacks 6 encoder layers and 6 decoder layers. GPT-3 has 96 decoder layers. Each layer refines the representations further." },
    ];

    return (
        <div>
            <SectionLabel n={7} />
            <H size={22} mb={10}>The <span style={{ color: C.green }}>Full Layer</span>: Putting It Together</H>

            <Prose>Self-attention is the star but it's not alone. Each transformer layer wraps it in a full pipeline. Click each component below to understand its role.</Prose>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14, margin: "14px 0" }}>
                {/* Layer diagram */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, position: "relative" }}>
                    <svg viewBox="0 0 160 420" style={{ width: "100%", height: "auto", display: "block" }}>
                        {/* Residual skip connections */}
                        <path d="M 140,10 C 155,10 155,148 140,148" fill="none" stroke={C.teal} strokeWidth={1.5} strokeDasharray="4,3" opacity={.5} />
                        <path d="M 140,148 C 155,148 155,280 140,280" fill="none" stroke={C.teal} strokeWidth={1.5} strokeDasharray="4,3" opacity={.5} />
                        {/* Flow arrows */}
                        {[44, 112, 178, 244, 310].map(y => (
                            <line key={y} x1={80} y1={y} x2={80} y2={y + 20} stroke={C.faint} strokeWidth={1.5}
                                markerEnd="url(#la)" />
                        ))}
                        <defs>
                            <marker id="la" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                                <path d="M0,1L5,3L0,5Z" fill={C.faint} />
                            </marker>
                        </defs>
                        {/* Layer blocks */}
                        {layers.map(l => (
                            <g key={l.id} onClick={() => setActive(active === l.id ? null : l.id)} style={{ cursor: "pointer" }}>
                                <rect x={10} y={l.y} width={130} height={50} rx={8}
                                    fill={active === l.id ? `${l.color}25` : C.card2}
                                    stroke={active === l.id ? l.color : l.color + 40}
                                    strokeWidth={active === l.id ? 2 : 1} style={{ transition: "all .25s" }} />
                                <text x={75} y={l.y + 21} textAnchor="middle"
                                    fill={active === l.id ? l.color : l.color + 99} fontSize={8.5} fontFamily={C.mono} fontWeight="700">
                                    {l.label.split("(")[0]}
                                </text>
                                {l.label.includes("(") && (
                                    <text x={75} y={l.y + 34} textAnchor="middle"
                                        fill={C.faint} fontSize={7} fontFamily={C.mono}>
                                        {l.label.split("(")[1].replace(")", "").slice(0, 20)}
                                    </text>
                                )}
                            </g>
                        ))}
                        <text x={145} y={218} fill={C.teal} fontSize={8} fontFamily={C.mono}>skip</text>
                    </svg>
                </div>

                {/* Description panel */}
                <div>
                    {active
                        ? (() => {
                            const l = layers.find(x => x.id === active);
                            return (
                                <div style={{
                                    background: C.card, border: `1px solid ${l.color}35`, borderRadius: 12,
                                    padding: 16, borderLeft: `3px solid ${l.color}`
                                }}>
                                    <div style={{ fontFamily: C.mono, fontSize: 13, color: l.color, fontWeight: 700, marginBottom: 10 }}>{l.label}</div>
                                    <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, lineHeight: 1.8 }}>{l.desc}</div>
                                </div>
                            );
                        })()
                        : <div style={{
                            background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16,
                            height: "100%", display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <div style={{ fontFamily: C.mono, fontSize: 11, color: C.faint, textAlign: "center", lineHeight: 1.7 }}>
                                ← Click any component<br />to learn what it does
                            </div>
                        </div>
                    }
                    <div style={{ marginTop: 10 }}>
                        <Prose>The residual connections (dashed lines) are critical — they let gradients flow directly backward through the addition operation, bypassing the attention and FFN computations. This is how you train a 96-layer network without gradients dying.</Prose>
                        <Prose>Layer normalization stabilizes the scale of activations. Without it, deep networks suffer from internal covariate shift — the distribution of each layer's inputs shifts during training, making it hard for subsequent layers to learn.</Prose>
                    </div>
                </div>
            </div>

            <Divider />
            <H size={16} mb={8} color={C.green}>Encoder vs Decoder: Where GPT Lives</H>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                {[
                    [C.teal, "Encoder", "BERT, RoBERTa", "Sees the full sequence. Every token can attend to every other token. Used for understanding tasks: classification, NER, question answering from context.", "Bidirectional"],
                    [C.orange, "Decoder", "GPT, Claude, Llama", "Generates left to right. Each token can ONLY attend to previous tokens — future is masked. This is how autoregressive generation works.", "Causal (masked)"],
                ].map(([col, name, models, desc, type]) => (
                    <div key={name} style={{
                        background: C.card, border: `1px solid ${col}30`, borderRadius: 12,
                        padding: 14, borderTop: `3px solid ${col}`
                    }}>
                        <div style={{ fontFamily: C.mono, fontSize: 14, color: col, fontWeight: 700, marginBottom: 4 }}>{name}-only</div>
                        <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, marginBottom: 8 }}>{models}</div>
                        <div style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, lineHeight: 1.7, marginBottom: 8 }}>{desc}</div>
                        <Tag color={col}>{type}</Tag>
                    </div>
                ))}
            </div>

            {/* Causal mask visualization */}
            <H size={15} mb={8} color={C.orange}>Causal Masking — Why GPT Generates Left-to-Right</H>
            <Prose style={{ fontSize: 13 }}>In decoder models, the attention matrix is masked so no token can attend to future tokens. The upper triangle is set to -∞ before softmax, making those weights zero. Token 3 can only see tokens 0, 1, 2, and itself.</Prose>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
                <svg viewBox="0 0 360 200" style={{ width: "100%", maxWidth: 400, height: "auto", display: "block", margin: "0 auto" }}>
                    {["The", "cat", "sat", "on", "mat"].map((t, i) => (
                        <g key={i}>
                            <text x={38 + i * 60} y={22} textAnchor="middle" fill={TOK_COLOR(t) || C.muted}
                                fontSize={9} fontFamily={C.mono}>{t}</text>
                            <text x={18} y={50 + i * 32} dominantBaseline="middle" fill={TOK_COLOR(t) || C.muted}
                                fontSize={9} fontFamily={C.mono} textAnchor="middle">{t}</text>
                            {["The", "cat", "sat", "on", "mat"].map((t2, j) => {
                                const canAttend = j <= i;
                                const col = canAttend ? (TOK_COLOR(t2) || C.teal) : "#ffffff";
                                const fillAlpha = canAttend ? (i === j ? "55" : "30") : "08";
                                return (
                                    <g key={j}>
                                        <rect x={8 + j * 60} y={36 + i * 32} width={54} height={24} rx={4}
                                            fill={`${col}${fillAlpha}`}
                                            stroke={canAttend ? `${col}50` : C.faint} strokeWidth={.8} />
                                        <text x={35 + j * 60} y={52 + i * 32} textAnchor="middle" dominantBaseline="middle"
                                            fill={canAttend ? (i === j ? col : col) : C.faint} fontSize={9} fontFamily={C.mono}>
                                            {canAttend ? `✓` : `✗`}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    ))}
                </svg>
                <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, textAlign: "center", marginTop: 8 }}>
                    ✓ = can attend · ✗ = masked (future token) · each row = one token's allowed attention
                </div>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
// CHAPTER 8: Everything Together
// ════════════════════════════════════════════════════════════════════════════════
function Ch8() {
    const [quiz, setQuiz] = useState(null);
    const [answer, setAnswer] = useState(null);
    const qs = [
        { q: "What does a token's Query vector represent?", opts: ["The token's embedding", "What the token is looking for in other tokens", "The token's position", "The output after attention"], correct: 1, exp: "Query = 'what am I searching for?' It's the embedding × W_Q, tuned during training to encode the token's search intent." },
        { q: "Why do we divide attention scores by √d_k?", opts: ["To make them negative", "To sum to 1", "To prevent softmax saturation from large dot products", "To apply positional encoding"], correct: 2, exp: "Dot products grow with dimensionality. Without scaling, scores become huge → softmax saturates → gradients vanish → training breaks." },
        { q: "Why does GPT use a causal (masked) attention?", opts: ["It's cheaper", "It prevents seeing future tokens during generation", "It improves memory", "It enables bidirectional understanding"], correct: 1, exp: "Autoregressive generation requires predicting one token at a time, left to right. Masking the upper triangle ensures no token can 'cheat' by looking ahead." },
        { q: "What's the role of residual connections?", opts: ["They add positional information", "They let gradients flow directly backward for stable deep training", "They implement multi-head attention", "They compute the softmax"], correct: 1, exp: "Residual connections create a direct gradient highway through the addition operation, preventing the vanishing gradient problem from returning in deep stacks." },
    ];

    return (
        <div>
            <SectionLabel n={8} />
            <H size={22} mb={10}>The Full Picture + <span style={{ color: C.green }}>Quiz</span></H>

            <Prose>You've now covered every major component of the Transformer. Let's stitch them together into one coherent picture before you go nod confidently in meetings.</Prose>

            {/* Full pipeline summary */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
                <H size={14} mb={12} color={C.muted}>The Complete Forward Pass</H>
                {[
                    [C.blue, "Tokenization", "Text → token IDs → embeddings via vocabulary lookup"],
                    [C.purple, "Positional Encoding", "Add sinusoidal (or learned) position vectors to embeddings"],
                    [C.orange, "Self-Attention × h heads", "Each token attends to all others in parallel. Output = contextual blend."],
                    [C.teal, "Add & Norm", "Residual + layer normalization. Stability and gradient flow."],
                    [C.amber, "Feed-Forward Network", "Per-token: 2-layer MLP with 4× inner dimension. Knowledge storage."],
                    [C.teal, "Add & Norm again", "Another residual + normalization."],
                    [C.purple, "Repeat × N layers", "Stack 6–96 identical layers. Each refines representations further."],
                    [C.green, "Output projection", "Final embeddings → vocabulary logits → softmax → next token probabilities."],
                ].map(([col, step, desc], i) => (
                    <div key={step} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                        <div style={{
                            width: 20, height: 20, borderRadius: "50%", background: `${col}20`, border: `1px solid ${col}50`,
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1
                        }}>
                            <span style={{ fontFamily: C.mono, fontSize: 8, color: col, fontWeight: 700 }}>{i + 1}</span>
                        </div>
                        <div>
                            <span style={{ fontFamily: C.mono, fontSize: 11, color: col, fontWeight: 700 }}>{step}</span>
                            <span style={{ fontFamily: C.mono, fontSize: 11, color: C.muted }}> — {desc}</span>
                        </div>
                    </div>
                ))}
            </div>

            <Divider />
            <H size={16} mb={10} color={C.green}>Test Yourself</H>
            <Prose>Four questions. No tricks. Just checking you actually learned something.</Prose>

            {qs.map((q, qi) => (
                <div key={qi} style={{
                    background: C.card, border: `1px solid ${quiz === qi && answer !== null ? (answer === q.correct ? C.green : C.orange) : C.border}`,
                    borderRadius: 12, padding: 14, marginBottom: 8, transition: "border-color .3s"
                }}>
                    <div style={{ fontFamily: C.mono, fontSize: 12, color: C.text, marginBottom: 10, lineHeight: 1.6 }}>
                        <span style={{ color: C.muted }}>Q{qi + 1}. </span>{q.q}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {q.opts.map((opt, oi) => {
                            const isSelected = quiz === qi && answer === oi;
                            const isCorrect = oi === q.correct;
                            const revealed = quiz === qi && answer !== null;
                            let col = C.border2, textCol = C.muted, bg = "transparent";
                            if (revealed && isCorrect) { col = C.green; textCol = C.green; bg = `${C.green}10`; }
                            else if (revealed && isSelected && !isCorrect) { col = C.orange; textCol = C.orange; bg = `${C.orange}10`; }
                            else if (isSelected) { col = C.purple; textCol = C.purple; bg = `${C.purple}10`; }
                            return (
                                <button key={oi} onClick={() => { if (quiz !== qi || answer === null) { setQuiz(qi); setAnswer(oi); } }}
                                    style={{
                                        border: `1px solid ${col}`, borderRadius: 8, padding: "8px 12px",
                                        background: bg, color: textCol, fontFamily: C.mono, fontSize: 11,
                                        textAlign: "left", cursor: revealed ? "default" : "pointer", transition: "all .2s"
                                    }}>
                                    {revealed && isCorrect ? "✓ " : revealed && isSelected && !isCorrect ? "✗ " : ""}{opt}
                                </button>
                            );
                        })}
                    </div>
                    {quiz === qi && answer !== null && (
                        <div style={{
                            fontFamily: C.mono, fontSize: 10, color: C.muted, marginTop: 10,
                            padding: "8px 12px", background: C.vfaint, borderRadius: 8, lineHeight: 1.7
                        }}>
                            {answer === q.correct ? "✓ Correct — " : "✗ Not quite — "}{q.exp}
                        </div>
                    )}
                </div>
            ))}

            <Callout color={C.green} text="You now understand every major component of the Transformer. Tokens → embeddings → positional encoding → multi-head self-attention (Q, K, V, scaled dot product, softmax) → residuals → FFN → repeat. GPT is a decoder-only stack of these layers. BERT is encoder-only. You can nod confidently now. It's earned." />
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
// APP SHELL
// ════════════════════════════════════════════════════════════════════════════════
const CHAPTERS = [
    { label: "RNN Problem", comp: Ch1, accent: C.orange },
    { label: "Breakthrough", comp: Ch2, accent: C.teal },
    { label: "Self-Attention", comp: Ch3, accent: C.orange },
    { label: "Q · K · V", comp: Ch4, accent: C.amber },
    { label: "Multi-Head", comp: Ch5, accent: C.purple },
    { label: "Positional Enc.", comp: Ch6, accent: C.blue },
    { label: "Full Layer", comp: Ch7, accent: C.green },
    { label: "Quiz & Review", comp: Ch8, accent: C.green },
];

export default function App() {
    const [ch, setCh] = useState(0);
    const contentRef = useRef(null);
    const { comp: Chapter, accent } = CHAPTERS[ch];

    const go = n => { setCh(n); contentRef.current?.scrollTo({ top: 0, behavior: "smooth" }); };

    return (
        <div style={{
            display: "flex", flexDirection: "column", width: "100vw", height: "100vh", background: C.bg,
            color: C.text, fontFamily: C.mono, overflow: "hidden"
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body,html{width:100%;height:100%;overflow:hidden;}
        #root{width:100vw!important;max-width:100vw!important;margin:0!important;border:none!important;min-height:100vh!important;padding:0!important;}
        button{outline:none;font-family:inherit;}
        input[type=range]{-webkit-appearance:none;height:4px;border-radius:2px;outline:none;background:#222;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;cursor:pointer;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#0a0a0a;}
        ::-webkit-scrollbar-thumb{background:#222;border-radius:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

            {/* Top bar */}
            <div style={{
                borderBottom: `1px solid ${C.border}`, padding: "14px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0
            }}>
                <div>
                    <div style={{ fontSize: 9, color: C.muted, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 4 }}>
                        LLM Internals · Episode 02 · Interactive Course
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>
                        How <span style={{ color: accent, transition: "color .4s" }}>Transformers</span> Actually Work
                    </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                    {CHAPTERS.map((_, i) => (
                        <button key={i} onClick={() => go(i)} style={{
                            width: i === ch ? 18 : 6, height: 6, borderRadius: 3, border: "none", cursor: "pointer",
                            background: i === ch ? accent : i < ch ? C.border3 : C.faint, transition: "all .3s"
                        }} />
                    ))}
                </div>
            </div>

            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* Sidebar */}
                <div style={{
                    width: 210, borderRight: `1px solid ${C.border}`, padding: "16px 12px",
                    display: "flex", flexDirection: "column", gap: 2, overflowY: "auto", flexShrink: 0
                }}>
                    {CHAPTERS.map(({ label, accent: a }, i) => (
                        <button key={i} onClick={() => go(i)} style={{
                            display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 9,
                            border: `1px solid ${i === ch ? a : C.border}`, cursor: "pointer", textAlign: "left",
                            background: i === ch ? `${a}12` : "transparent", transition: "all .2s", width: "100%"
                        }}>
                            <div>
                                <div style={{
                                    fontFamily: C.mono, fontSize: 10, color: i === ch ? a : C.muted,
                                    fontWeight: i === ch ? "700" : "400", lineHeight: 1.3
                                }}>{label}</div>
                                <div style={{ fontFamily: C.mono, fontSize: 7, color: i < ch ? C.green : C.faint, marginTop: 1 }}>
                                    {i < ch ? "done" : i === ch ? "in progress" : "—"}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Main content */}
                <div ref={contentRef} style={{ flex: 1, overflowY: "auto", padding: "36px 40px 56px" }}>
                    <div key={ch} style={{ maxWidth: 800, margin: "0 auto", animation: "fadeUp .3s ease" }}>
                        <Chapter />
                        <div style={{
                            display: "flex", justifyContent: "space-between", marginTop: 28,
                            paddingTop: 18, borderTop: `1px solid ${C.border}`
                        }}>
                            <button onClick={() => go(Math.max(0, ch - 1))} disabled={ch === 0} style={{
                                background: "transparent", border: `1px solid ${ch === 0 ? C.faint : C.border2}`,
                                borderRadius: 9, padding: "9px 20px", color: ch === 0 ? C.faint : C.muted,
                                fontFamily: C.mono, fontSize: 11, cursor: ch === 0 ? "not-allowed" : "pointer"
                            }}>
                                ← prev chapter
                            </button>
                            <span style={{ fontFamily: C.mono, fontSize: 9, color: C.faint, alignSelf: "center" }}>
                                {ch + 1} / {CHAPTERS.length}
                            </span>
                            <button onClick={() => go(Math.min(CHAPTERS.length - 1, ch + 1))} disabled={ch === CHAPTERS.length - 1} style={{
                                background: ch === CHAPTERS.length - 1 ? "transparent" : `${accent}18`,
                                border: `1px solid ${ch === CHAPTERS.length - 1 ? C.faint : accent}`, borderRadius: 9,
                                padding: "9px 20px", color: ch === CHAPTERS.length - 1 ? C.faint : accent,
                                fontFamily: C.mono, fontSize: 11, cursor: ch === CHAPTERS.length - 1 ? "not-allowed" : "pointer"
                            }}>
                                next chapter →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}