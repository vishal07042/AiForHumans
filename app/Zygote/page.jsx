'use client'

import { useState, useEffect, useRef } from "react";

// ── AI Blog Palette ────────────────────────────────────────────────────────────
// --bg:      #0b0b0d   --bg2: #131315   --bg3: #1a1a1e   --card: #16161a
// --text:    #edeae4   --muted: #7a776f  --muted2: #444444
// --border:  rgba(255,255,255,0.07)      --border2: rgba(255,255,255,0.13)
// --accent:  #f5a623   --accent2: #e8593c
// --blue:    #4a9eff   --green: #5ec784  --purple: #b48fff
// --pink:    #ff7eb3   --teal: #3ecfcf

const scenes = [
    {
        id: 0,
        chapter: "Stage 01",
        title: "Power Button Pressed",
        text: `You press the power button. The screen is black — completely dead. Deep inside the chip, a tiny piece of write-protected memory called Boot ROM wakes up. This is the only code hardwired into the processor itself. It can't be changed. It can't be hacked. It is the one truth the phone was born with.`,
        visual: "intro",
    },
    {
        id: 1,
        chapter: "Stage 02",
        title: "Bootloader Takes Over",
        text: `Boot ROM hands control to the Bootloader — a small program that lives before Android even exists. This is where manufacturers place their locks. The bootloader detects external RAM, sets up memory and network parameters, then verifies the kernel's signature. If anything looks wrong, it stops here. This is the gatekeeper.`,
        visual: "phone_off",
    },
    {
        id: 2,
        chapter: "Stage 03",
        title: "Linux Kernel Ignites",
        text: `The Linux Kernel boots. It sets up CPU scheduling, memory management, loads hardware drivers, mounts the file system, and starts kernel daemons. This is the engine room — no UI, no apps, just raw system machinery coming alive. At the end, it launches one single process: init.`,
        visual: "contact",
    },
    {
        id: 3,
        chapter: "Stage 04",
        title: "Init — The First Process",
        text: `Init (PID 1) is the parent of all Android processes. It reads the init.rc script, mounts /dev, /sys, /proc, starts Bluetooth and ADB daemons — and crucially, triggers one line: "start zygote". Everything before this was Linux. What comes next is Android.`,
        visual: "zygote",
    },
    {
        id: 4,
        chapter: "Stage 05",
        title: "Zygote Spawns",
        text: `Zygote — named after biology's first cell — is the first Android-specific process. It fires up the ART/Dalvik virtual machine and preloads every Java class and resource an app might ever need into shared memory. It then listens on a socket, waiting for requests to spawn new apps. Every Android app you will ever run is a child of Zygote.`,
        visual: "division",
    },
    {
        id: 5,
        chapter: "Stage 06",
        title: "Zygote Forks System Server",
        text: `Zygote's first explicit act is to fork itself and create the System Server process. This is the heart of Android. System Server initializes ActivityManager, PackageManager, WindowManager, NotificationManager and dozens of other critical services — each running as its own Dalvik thread inside System Server.`,
        visual: "morula",
    },
    {
        id: 6,
        chapter: "Stage 07",
        title: "Home Screen — Boot Complete",
        text: `ActivityManager fires an Intent to launch the Home Launcher. The familiar home screen appears. Behind the scenes, ACTION_BOOT_COMPLETED broadcasts to all listening apps. Every icon you tap from this moment forwards causes System Server to ask Zygote to fork a new process. The whole OS is a family tree — and Zygote is the root.`,
        visual: "blastocyst",
    },
];

// ─── Phone Visual ──────────────────────────────────────────────────────────────

function PhoneVisual({ scene }) {
    const [flash, setFlash] = useState(false);

    useEffect(() => {
        if (scene === "contact") {
            const t = setTimeout(() => setFlash(true), 300);
            return () => clearTimeout(t);
        } else {
            setFlash(false);
        }
    }, [scene]);

    const phoneOn = scene !== "phone_off" && scene !== "intro";

    return (
        <div style={{ position: "relative", width: 220, height: 420, margin: "0 auto", transform: "scale(1.8)", transformOrigin: "center center" }}>
            {/* Phone shell */}
            <div style={{
                position: "absolute", inset: 0,
                borderRadius: 36,
                background: "#0b0b0d",
                boxShadow: phoneOn
                    ? "0 0 0 2px #2a2318, 0 0 60px rgba(245,166,35,0.18), 0 20px 60px rgba(0,0,0,0.9)"
                    : "0 0 0 2px rgba(255,255,255,0.07), 0 20px 40px rgba(0,0,0,0.8)",
                transition: "box-shadow 1s ease",
                overflow: "hidden",
            }}>
                {/* Screen */}
                <div style={{
                    position: "absolute", inset: "10px 8px",
                    borderRadius: 28,
                    background: phoneOn
                        ? "radial-gradient(ellipse at 50% 30%, #1a1a1e 0%, #0b0b0d 100%)"
                        : "#0b0b0d",
                    transition: "background 1.2s ease",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>

                    {/* INTRO — Boot ROM chip glow */}
                    {scene === "intro" && (
                        <div style={{ textAlign: "center", padding: 20 }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: 12,
                                background: "linear-gradient(135deg, #f5a623 0%, #3ecfcf 100%)",
                                margin: "0 auto 16px",
                                boxShadow: "0 0 40px rgba(245,166,35,0.55)",
                                animation: "pulse 2s ease-in-out infinite",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <span style={{ fontSize: 22 }}>⚡</span>
                            </div>
                            <p style={{ color: "#f5a623", fontSize: 10, fontFamily: "'DM Mono','Courier New',monospace", letterSpacing: 3 }}>BOOT ROM</p>
                            <p style={{ color: "#3ecfcf", fontSize: 9, fontFamily: "'DM Mono','Courier New',monospace", letterSpacing: 1, marginTop: 4 }}>POWER ON</p>
                        </div>
                    )}

                    {/* BOOTLOADER */}
                    {scene === "phone_off" && (
                        <div style={{ textAlign: "center", padding: 16 }}>
                            <div style={{
                                width: 52, height: 52, margin: "0 auto 12px",
                                borderRadius: 10,
                                border: "2px solid #e8593c",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                animation: "fadeout 1.5s ease forwards",
                                boxShadow: "0 0 20px rgba(232,89,60,0.35)",
                            }}>
                                <span style={{ fontSize: 22 }}>🔒</span>
                            </div>
                            <p style={{ color: "#e8593c", fontSize: 9, fontFamily: "'DM Mono','Courier New',monospace", letterSpacing: 2 }}>BOOTLOADER</p>
                            <p style={{ color: "#7a776f", fontSize: 8, fontFamily: "'DM Mono','Courier New',monospace", letterSpacing: 1, marginTop: 4 }}>VERIFYING...</p>
                        </div>
                    )}

                    {/* KERNEL */}
                    {scene === "contact" && (
                        <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {flash && (
                                <div style={{
                                    position: "absolute", inset: 0,
                                    background: "radial-gradient(ellipse at 50% 50%, rgba(62,207,207,0.45) 0%, transparent 70%)",
                                    animation: "flashPulse 0.8s ease-out",
                                    borderRadius: 28,
                                }} />
                            )}
                            <div style={{ textAlign: "center" }}>
                                <div style={{ width: 70, height: 70, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="70" height="70" viewBox="0 0 70 70">
                                        <circle cx="35" cy="35" r="28" stroke="#3ecfcf" strokeWidth="1" fill="none" opacity="0.4" strokeDasharray="4 3" />
                                        <circle cx="35" cy="35" r="18" stroke="#f5a623" strokeWidth="1.5" fill="rgba(245,166,35,0.08)" />
                                        <circle cx="35" cy="35" r="8" fill="#3ecfcf" opacity="0.9" />
                                        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                                            const r = 28, rx = 35 + r * Math.cos(deg * Math.PI / 180), ry = 35 + r * Math.sin(deg * Math.PI / 180);
                                            return <circle key={i} cx={rx} cy={ry} r="3" fill="#e8593c" opacity="0.8" />;
                                        })}
                                    </svg>
                                </div>
                                <p style={{ color: "#3ecfcf", fontSize: 9, fontFamily: "'DM Mono','Courier New',monospace", letterSpacing: 2 }}>LINUX KERNEL</p>
                                <p style={{ color: "#7a776f", fontSize: 8, fontFamily: "'DM Mono','Courier New',monospace", letterSpacing: 1, marginTop: 3 }}>MOUNTING FS...</p>
                            </div>
                        </div>
                    )}

                    {/* INIT PROCESS */}
                    {scene === "zygote" && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 14 }}>
                            <div style={{
                                width: 60, height: 60,
                                background: "linear-gradient(135deg, #16161a, #1a1a1e)",
                                border: "2px solid #f5a623",
                                borderRadius: 14,
                                boxShadow: "0 0 24px rgba(245,166,35,0.4)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                animation: "gentleGlow 2s ease-in-out infinite alternate",
                                fontSize: 24,
                            }}>🌱</div>
                            <p style={{ color: "#f5a623", fontSize: 9, fontFamily: "'DM Mono','Courier New',monospace", letterSpacing: 2, textAlign: "center" }}>INIT PID:1</p>
                            <div style={{
                                background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.25)",
                                borderRadius: 6, padding: "4px 8px",
                            }}>
                                <p style={{ color: "#7a776f", fontSize: 8, fontFamily: "'DM Mono','Courier New',monospace", margin: 0 }}>start zygote ▶</p>
                            </div>
                        </div>
                    )}

                    {/* ZYGOTE SPAWNS */}
                    {scene === "division" && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: 12 }}>
                            <div style={{
                                width: 58, height: 58, borderRadius: "50%",
                                background: "radial-gradient(circle at 38% 33%, #ffd49a 0%, #f5a623 50%, #3a2200 100%)",
                                boxShadow: "0 0 24px rgba(245,166,35,0.6)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 20,
                            }}>🥚</div>
                            <div style={{ color: "#f5a623", fontSize: 10 }}>↓ fork()</div>
                            <div style={{ display: "flex", gap: 10 }}>
                                {["📱", "⚙️"].map((em, i) => (
                                    <div key={i} style={{
                                        width: 42, height: 42, borderRadius: "50%",
                                        background: i === 0
                                            ? "radial-gradient(circle, #b0d8ff 0%, #4a9eff 50%, #001a3a 100%)"
                                            : "radial-gradient(circle, #b8ffd8 0%, #5ec784 50%, #002010 100%)",
                                        boxShadow: i === 0
                                            ? "0 0 14px rgba(74,158,255,0.5)"
                                            : "0 0 14px rgba(94,199,132,0.5)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 16,
                                        animation: `cellAppear 0.5s ease ${i * 0.15}s both`,
                                    }}>{em}</div>
                                ))}
                            </div>
                            <p style={{ color: "#3ecfcf", fontSize: 8, fontFamily: "'DM Mono','Courier New',monospace", letterSpacing: 2, textAlign: "center" }}>ZYGOTE SPAWNED<br />ART VM READY</p>
                        </div>
                    )}

                    {/* SYSTEM SERVER */}
                    {scene === "morula" && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 10 }}>
                            <p style={{ color: "#e8593c", fontSize: 10, fontFamily: "'DM Mono','Courier New',monospace", letterSpacing: 2, margin: 0 }}>SYSTEM SERVER</p>
                            <div style={{ position: "relative", width: 160, height: 110 }}>
                                {[
                                    ["ActivityMgr", 4, 4, "#f5a623"],
                                    ["PackageMgr", 84, 4, "#3ecfcf"],
                                    ["WindowMgr", 4, 57, "#4a9eff"],
                                    ["NotifMgr", 84, 57, "#5ec784"],
                                ].map(([label, x, y, color], i) => (
                                    <div key={i} style={{
                                        position: "absolute", left: x, top: y,
                                        width: 72, height: 45, borderRadius: 8,
                                        background: `${color}14`,
                                        border: `1px solid ${color}44`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        animation: `cellAppear 0.4s ease ${i * 0.1}s both`,
                                    }}>
                                        <p style={{ color, fontSize: 9.5, fontFamily: "'DM Mono','Courier New',monospace", textAlign: "center", margin: 0, lineHeight: 1.3 }}>{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* HOME SCREEN */}
                    {scene === "blastocyst" && (
                        <div style={{ width: "100%", height: "100%", padding: 12, display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ color: "#f5a623", fontSize: 8, fontFamily: "'DM Mono','Courier New',monospace" }}>9:41</span>
                                <span style={{ color: "#3ecfcf", fontSize: 8, fontFamily: "'DM Mono','Courier New',monospace" }}>▮▮▮ WiFi</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, flex: 1, alignContent: "center" }}>
                                {["📷", "📱", "🎵", "🗺️", "⚙️", "📧", "🔍", "📅", "🎮"].map((em, i) => (
                                    <div key={i} style={{
                                        height: 40, borderRadius: 10,
                                        background: "linear-gradient(135deg, rgba(245,166,35,0.12), rgba(62,207,207,0.07))",
                                        border: "1px solid rgba(255,255,255,0.07)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 18,
                                        animation: `cellAppear 0.3s ease ${i * 0.06}s both`,
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                                    }}>{em}</div>
                                ))}
                            </div>
                            <p style={{ color: "#5ec784", fontSize: 8, fontFamily: "'DM Mono','Courier New',monospace", textAlign: "center", marginTop: 8, letterSpacing: 2 }}>BOOT COMPLETE ✓</p>
                        </div>
                    )}

                    {/* Screen glare */}
                    <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: "45%",
                        background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
                        borderRadius: "28px 28px 0 0",
                        pointerEvents: "none",
                    }} />
                </div>

                {/* Notch removed per user request */}
            </div>

            {/* Side buttons */}
            <div style={{ position: "absolute", right: -4, top: 100, width: 4, height: 40, borderRadius: 2, background: "#1a1a1e" }} />
            <div style={{ position: "absolute", left: -4, top: 90, width: 4, height: 28, borderRadius: 2, background: "#1a1a1e" }} />
            <div style={{ position: "absolute", left: -4, top: 126, width: 4, height: 28, borderRadius: 2, background: "#1a1a1e" }} />
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ScrollyTeller() {
    const [activeScene, setActiveScene] = useState(0);
    const containerRef = useRef(null);
    const textRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const idx = parseInt(entry.target.dataset.index, 10);
                        setActiveScene(idx);
                    }
                });
            },
            {
                root: containerRef.current,
                rootMargin: "-40% 0px -40% 0px",
                threshold: 0,
            }
        );
        textRefs.current.forEach((el) => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const currentScene = scenes[activeScene];

    return (
        <div style={{
            fontFamily: "'DM Sans', 'Outfit', 'Segoe UI', sans-serif",
            background: "#0b0b0d",
            color: "#edeae4",
            height: "100vh",
            width: "100VW",
            display: "flex",
            flexDirection: "row",
            overflow: "hidden",
            position: "relative",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(245,166,35,0.4); }
          50% { transform: scale(1.1); box-shadow: 0 0 40px rgba(245,166,35,0.8); }
        }
        @keyframes flashPulse {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes gentleGlow {
          from { box-shadow: 0 0 24px rgba(245,166,35,0.3); }
          to   { box-shadow: 0 0 48px rgba(245,166,35,0.65); }
        }
        @keyframes cellAppear {
          from { transform: scale(0.2); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeout {
          0%   { opacity: 0.5; }
          100% { opacity: 0.07; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0b0b0d; }
        ::-webkit-scrollbar-thumb { background: #2a2318; border-radius: 2px; }
      `}</style>

            {/* ── LEFT: scrollable text ──────────────────────────────────────────────── */}
            <div
                ref={containerRef}
                style={{
                    flex: "0 0 45%",
                    overflowY: "scroll",
                    padding: "0 60px",
                    scrollBehavior: "smooth",
                    position: "relative",
                    borderRight: "1px solid rgba(255,255,255,0.07)",
                }}
            >
                <div style={{ height: "35vh" }} />
                {scenes.map((scene, i) => (
                    <div
                        key={scene.id}
                        ref={(el) => (textRefs.current[i] = el)}
                        data-index={i}
                        style={{
                            minHeight: "80vh",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            padding: "40px 0",
                            opacity: activeScene === i ? 1 : 0.25,
                            transform: activeScene === i ? "translateX(0)" : "translateX(-15px)",
                            transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                    >
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <span style={{
                                fontSize: 11, letterSpacing: 4, color: "#f5a623",
                                fontFamily: "'DM Mono', 'Courier New', monospace",
                                textTransform: "uppercase",
                            }}>
                                {scene.chapter}
                            </span>
                            <span style={{ width: 32, height: 1, background: "linear-gradient(90deg, #f5a623, transparent)" }} />
                            {activeScene === i && (
                                <span style={{
                                    width: 7, height: 7, borderRadius: "50%",
                                    background: "#e8593c",
                                    boxShadow: "0 0 12px rgba(232,89,60,0.85)",
                                    animation: "pulse 1.8s ease-in-out infinite",
                                }} />
                            )}
                        </div>
                        
                        <h2 style={{
                            fontSize: "clamp(26px, 3.5vw, 42px)",
                            fontWeight: 700,
                            marginBottom: 20,
                            lineHeight: 1.15,
                            letterSpacing: "-0.5px",
                            background: "linear-gradient(135deg, #edeae4 0%, #f5a623 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}>
                            {scene.title}
                        </h2>
                        
                        <p style={{
                            fontSize: "clamp(16px, 2.2vw, 18px)",
                            lineHeight: 1.8,
                            color: activeScene === i ? "#edeae4" : "#7a776f",
                            margin: 0,
                            fontWeight: 300,
                            transition: "color 0.6s ease",
                        }}>
                            {scene.text}
                        </p>
                    </div>
                ))}
                <div style={{ height: "45vh" }} />
            </div>

            {/* ── RIGHT: sticky visual ──────────────────────────────────────────────── */}
            <div style={{
                flex: "1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* Ambient glow */}
                <div style={{
                    position: "absolute", inset: 0,
                    background: "radial-gradient(ellipse at 50% 50%, rgba(245,166,35,0.05) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />

                {/* Dot grid */}
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: "radial-gradient(circle, rgba(245,166,35,0.06) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                    pointerEvents: "none",
                }} />

                {/* Phone */}
                <div style={{ position: "relative", zIndex: 2 }}>
                    <PhoneVisual scene={currentScene.visual} />
                    <div style={{
                        textAlign: "center", marginTop: 24,
                        fontFamily: "'DM Mono', 'Courier New', monospace",
                        fontSize: 10, letterSpacing: 5,
                        color: "#444444",
                        textTransform: "uppercase",
                    }}>
                        Android Boot Sequence
                    </div>
                </div>
            </div>
        </div>
    );
}