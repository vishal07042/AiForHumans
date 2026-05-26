"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from './BinderIpc.module.css';

const SECTIONS = [
  {
    id: 0,
    title: "1. Binder IPC: The Most Important Thing in Android That Nobody Taught You",
    content: (
      <>
        <p>A kernel driver, a phone book, a teleporter, a very paranoid bouncer, and the reason <code>getSystemService()</code> isn't magic — it's just Binder wearing a hat.</p>
        <p>Where do you think <code>notify()</code> actually runs? In your app? Nope. It runs in <strong>system_server</strong>. A completely separate process.</p>
        <p>Turn off Binder, and the entire Android system grinds to a halt. Binder is not a feature. Binder is the plumbing.</p>
      </>
    )
  },
  {
    id: 1,
    title: "2. Why Couldn't Android Just Use Sockets?",
    content: (
      <>
        <p>Linux has Pipes, Unix Domain Sockets, Shared memory, Message queues... why didn't Android pick one?</p>
        <p><strong>Sockets</strong> require two copies of the data. 1: User to Kernel. 2: Kernel to User. For a system where thousands of Binder transactions happen per second, that's a lot of unnecessary memory traffic.</p>
        <p><strong>Binder</strong> is single copy, automatic caller identity, and synchronous request-response.</p>
      </>
    )
  },
  {
    id: 2,
    title: "3. The Four Players",
    content: (
      <>
        <p>1. <strong>The Client</strong> — your app. Wants to call a method.</p>
        <p>2. <strong>The Server</strong> — the process that owns the implementation.</p>
        <p>3. <strong>The Binder Driver</strong> (<code>/dev/binder</code>) — the kernel mechanism making it all possible.</p>
        <p>4. <strong>ServiceManager</strong> — the phone book. The special handle 0.</p>
      </>
    )
  },
  {
    id: 3,
    title: "4. The Memory Mapping Trick",
    content: (
      <>
        <p>When any process starts up, it opens <code>/dev/binder</code> and immediately calls <code>mmap()</code>.</p>
        <p>This maps kernel memory directly into the process's user-space address space. The client uses <code>copy_from_user()</code> to copy data to Kernel ONCE. Since the server already mapped this memory, it can read it directly! <strong>One copy!</strong></p>
      </>
    )
  },
  {
    id: 4,
    title: "5. Parcel: Flattening Your Call",
    content: (
      <>
        <p>A <code>Parcel</code> is a container for a message — a flat byte buffer. This is why <code>Parcelable</code> exists instead of <code>Serializable</code>. It's custom, binary, compact, and fast.</p>
        <p>Watch out for <code>TransactionTooLargeException</code> if you pack more than 1MB!</p>
      </>
    )
  },
  {
    id: 5,
    title: "6. The ioctl() Bottom Line",
    content: (
      <>
        <p><code>ioctl(BINDER_WRITE_READ)</code> blocks everything. The driver routes the Parcel to the server, wakes the server thread up, waits for the response, and blocks the client until done.</p>
        <p>The Binder driver handles thread management automatically.</p>
      </>
    )
  },
  {
    id: 6,
    title: "7. AIDL: Forgetting the Details",
    content: (
      <>
        <p>Writing raw Binder code is terrible. <strong>AIDL</strong> generates a <strong>Proxy</strong> for the client and a <strong>Stub</strong> for the server.</p>
        <p>It feels like a local method call, but it's just generated code over the Binder driver.</p>
      </>
    )
  },
  {
    id: 7,
    title: "8. Phone Book & Death Notifications",
    content: (
      <>
        <p><strong>ServiceManager</strong> lives at handle 0. Everyone asks it for addresses.</p>
        <p><strong>Death Notifications</strong> let processes know when another process crashed suddenly. It uses <code>linkToDeath()</code> to reconnect or throw errors safely.</p>
      </>
    )
  }
];

function PhoneVisualBinder({ scene }) {
    return (
        <div style={{ position: "relative", width: 220, height: 420, margin: "0 auto", transform: "scale(0.85)", transformOrigin: "center center" }}>
            <style>{`
                @keyframes sceneFade { from { opacity: 0.2; transform: translateY(12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes floatItem { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(12px); } }
            `}</style>
            {/* Phone shell */}
            <div style={{
                position: "absolute", inset: 0,
                borderRadius: 36,
                background: "#0b0b0d",
                boxShadow: "0 0 0 2px #2a2318, 0 0 60px rgba(245,166,35,0.18), 0 20px 60px rgba(0,0,0,0.9)",
                overflow: "hidden",
            }}>
                {/* Screen */}
                <div style={{
                    position: "absolute", inset: "10px 8px",
                    borderRadius: 28,
                    background: "radial-gradient(ellipse at 50% 30%, #1a1a1e 0%, #0b0b0d 100%)",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                }}>
                    
                    {/* SCENE 0: Intro */}
                    {scene === 0 && (
                        <div style={{ textAlign: "center", animation: "sceneFade 0.7s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                            <div style={{ fontSize: 44, marginBottom: 12 }}>🤖</div>
                            <h3 style={{ color: "#00d2ff", fontFamily: "'DM Mono', monospace", fontSize: 13, margin: 0, letterSpacing: 1 }}>BINDER IPC</h3>
                            <p style={{ color: "#7a776f", fontSize: 10, marginTop: 4 }}>System Plumbing</p>
                        </div>
                    )}

                    {/* SCENE 1: Sockets */}
                    {scene === 1 && (
                        <div style={{ textAlign: "center", animation: "sceneFade 0.7s cubic-bezier(0.16, 1, 0.3, 1)", width: "100%", padding: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, padding: "0 10px" }}>
                                <div style={{ background: "rgba(43,0,255,0.2)", border: "1px solid #2b00ff", padding: "8px 4px", borderRadius: 8, fontSize: 9, color: "#fff", width: 50 }}>App</div>
                                <span style={{ color: "#ff3366", fontSize: 16 }}>❌</span>
                                <div style={{ background: "rgba(255,51,102,0.2)", border: "1px solid #ff3366", padding: "8px 4px", borderRadius: 8, fontSize: 9, color: "#fff", width: 50 }}>Server</div>
                            </div>
                            <p style={{ color: "#ff3366", fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: 1, margin: 0 }}>2 COPIES</p>
                            <p style={{ color: "#7a776f", fontSize: 9, marginTop: 6 }}>Too Slow for UI</p>
                        </div>
                    )}

                    {/* SCENE 2: The Four Players */}
                    {scene === 2 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "75%", animation: "sceneFade 0.7s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                            <div style={{ background: "rgba(0, 210, 255, 0.1)", border: "1px solid #00d2ff", padding: 10, borderRadius: 8, textAlign: "center", color: "#00d2ff", fontSize: 10 }}>1. App Client</div>
                            <div style={{ background: "rgba(255, 51, 102, 0.1)", border: "1px solid #ff3366", padding: 10, borderRadius: 8, textAlign: "center", color: "#ff3366", fontSize: 10 }}>2. System Server</div>
                            <div style={{ background: "rgba(122, 119, 111, 0.15)", border: "1px solid #7a776f", padding: 10, borderRadius: 8, textAlign: "center", color: "#edeae4", fontSize: 10 }}>3. /dev/binder</div>
                            <div style={{ background: "rgba(245, 166, 35, 0.1)", border: "1px solid #f5a623", padding: 10, borderRadius: 8, textAlign: "center", color: "#f5a623", fontSize: 10 }}>4. ServiceManager</div>
                        </div>
                    )}

                    {/* SCENE 3: mmap */}
                    {scene === 3 && (
                        <div style={{ textAlign: "center", animation: "sceneFade 0.7s cubic-bezier(0.16, 1, 0.3, 1)", position: "relative", height: 160, width: 140 }}>
                            <div style={{ position: "absolute", top: 10, left: 10, width: 80, height: 70, background: "rgba(0,210,255,0.2)", border: "1px solid #00d2ff", borderRadius: 8, zIndex: 1 }} />
                            <div style={{ position: "absolute", top: 40, left: 50, width: 80, height: 70, background: "rgba(255,51,102,0.2)", border: "1px solid #ff3366", borderRadius: 8, zIndex: 2 }} />
                            <div style={{ position: "absolute", bottom: -5, width: "100%", color: "#3ecfcf", fontSize: 13, fontFamily: "'DM Mono', monospace", fontWeight: "bold", letterSpacing: 2 }}>mmap()</div>
                            <p style={{ position: "absolute", bottom: -25, left: 25, color: "#edeae4", fontSize: 9 }}>1 shared copy!</p>
                        </div>
                    )}

                    {/* SCENE 4: Parcel */}
                    {scene === 4 && (
                        <div style={{ textAlign: "center", animation: "sceneFade 0.7s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                            <div style={{ fontSize: 50, animation: "floatItem 2.5s ease-in-out infinite" }}>📦</div>
                            <h3 style={{ color: "#f5a623", fontFamily: "'DM Mono', monospace", fontSize: 15, marginTop: 24, letterSpacing: 2 }}>PARCEL</h3>
                            <p style={{ color: "#7a776f", fontSize: 10, marginTop: 4 }}>Flattened Data</p>
                        </div>
                    )}

                    {/* SCENE 5: ioctl */}
                    {scene === 5 && (
                        <div style={{ textAlign: "center", animation: "sceneFade 0.7s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                            <div style={{ fontSize: 40, color: "#ff3366", marginBottom: 16 }}>🔒</div>
                            <div style={{ background: "rgba(255,51,102,0.05)", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,51,102,0.3)" }}>
                                <span style={{ color: "#ff3366", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>ioctl(WRITE_READ)</span>
                            </div>
                            <p style={{ color: "#edeae4", fontSize: 10, marginTop: 16 }}>Thread Blocked!</p>
                        </div>
                    )}

                    {/* SCENE 6: AIDL */}
                    {scene === 6 && (
                        <div style={{ textAlign: "center", animation: "sceneFade 0.7s cubic-bezier(0.16, 1, 0.3, 1)", width: "100%", padding: 20 }}>
                            <div style={{ fontSize: 38, marginBottom: 16 }}>🪄</div>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                                <div style={{ flex: 1, background: "rgba(0,210,255,0.08)", border: "1px solid #00d2ff", padding: "10px 0", borderRadius: 6, fontSize: 10, color: "#00d2ff" }}>PROXY<br/><span style={{fontSize: 8, color:"#7a776f"}}>Client</span></div>
                                <div style={{ flex: 1, background: "rgba(255,51,102,0.08)", border: "1px solid #ff3366", padding: "10px 0", borderRadius: 6, fontSize: 10, color: "#ff3366" }}>STUB<br/><span style={{fontSize: 8, color:"#7a776f"}}>Server</span></div>
                            </div>
                            <div style={{ color: "#f5a623", fontSize: 13, fontFamily: "'DM Mono', monospace", margin: "20px 0 0", letterSpacing: 1 }}>AIDL AUTO-GEN</div>
                        </div>
                    )}

                    {/* SCENE 7: Death Notif */}
                    {scene === 7 && (
                        <div style={{ textAlign: "center", animation: "sceneFade 0.7s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 24 }}>
                                <div style={{ fontSize: 32 }}>📱</div>
                                <div style={{ fontSize: 16, color: "#ff3366" }}>←</div>
                                <div style={{ fontSize: 32 }}>💀</div>
                            </div>
                            <div style={{ background: "rgba(245,166,35,0.05)", border: "1px solid rgba(245,166,35,0.3)", padding: "10px 14px", borderRadius: 8, display: "inline-block" }}>
                                <span style={{ color: "#f5a623", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>linkToDeath()</span>
                            </div>
                            <p style={{ color: "#7a776f", fontSize: 10, marginTop: 16 }}>Alerts when app dies</p>
                        </div>
                    )}

                </div>
            </div>
            {/* Side buttons */}
            <div style={{ position: "absolute", right: -4, top: 100, width: 4, height: 40, borderRadius: 2, background: "#1a1a1e" }} />
            <div style={{ position: "absolute", left: -4, top: 90, width: 4, height: 28, borderRadius: 2, background: "#1a1a1e" }} />
            <div style={{ position: "absolute", left: -4, top: 126, width: 4, height: 28, borderRadius: 2, background: "#1a1a1e" }} />
        </div>
    );
}

export default function BinderIpc() {
  const [activeStep, setActiveStep] = useState(0);
  const [visMode, setVisMode] = useState("default");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setActiveStep(index);
          }
        });
      },
      {
        root: null,
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0.1
      }
    );

    const elements = document.querySelectorAll('.sectionBlock');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const renderVis = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className={`${styles.visItem} ${styles['fade-in']}`}>
             <div className={styles.bigTitle}>BINDER IPC</div>
             <div style={{fontSize: '4.5rem', marginTop: 20}}>🚗 📞 🌀 🤖</div>
          </div>
        );
      case 1:
        return (
          <div className={`${styles.visItem} ${styles['fade-in']}`} style={{ flexDirection: 'row', gap: '40px' }}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
               <div className={`${styles.box} ${styles.clientBox}`}>Client User Space</div>
               <div className={styles.pipeLine}><div className={styles.pipeDot} /></div>
               <div className={styles.pipeLine}><div className={styles.pipeDot} style={{animationDelay: '0.5s'}}/></div>
               <div className={`${styles.box} ${styles.serverBox}`}>Kernel Buffer</div>
            </div>
            <div style={{fontSize: '2.5rem', color: '#ff3366', fontWeight: 900}}>❌ 2 COPIES</div>
          </div>
        );
      case 2:
        return (
          <div className={`${styles.visItem} ${styles['fade-in']}`} style={{width: '90%', height: '80%', position: 'relative'}}>
            <div className={`${styles.box} ${styles.clientBox}`} style={{position: 'absolute', top: 0, left: '10%'}}>1. Client (App)</div>
            <div className={`${styles.box} ${styles.serverBox}`} style={{position: 'absolute', top: 0, right: '10%'}}>2. Server (System)</div>
            <div className={`${styles.box} ${styles.kernelBox}`} style={{position: 'absolute', bottom: '15%', left: '30%', width: '40%'}}>3. /dev/binder Driver</div>
            <div className={`${styles.box} ${styles.smBox} ${styles.pulse}`} style={{position: 'absolute', top: '35%', left: '42%', display:'flex', alignItems:'center', justifyContent:'center'}}>4. Service<br/>Manager</div>
          </div>
        );
      case 3:
        return (
          <div className={`${styles.visItem} ${styles['fade-in']}`} style={{width: '70%', textAlign: 'center'}}>
             <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '40px'}}>
                <div className={`${styles.box} ${styles.clientBox}`} style={{zIndex: 2}}>Client Space</div>
                <div className={`${styles.box} ${styles.serverBox}`} style={{zIndex: 2, height: '180px', paddingTop: '20px', borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'flex-start'}}>Server Virtual Space</div>
             </div>
             <div className={`${styles.box} ${styles.kernelBox}`} style={{width: '100%', height: '100px', marginTop: '-140px', zIndex: 1, paddingLeft: '50%', color: '#fff', fontWeight: 'bold'}}>
                 Kernel Memory (Shared Physical Pages)
             </div>
             <div style={{position: 'absolute', top: '25%', left: '30%', fontWeight: '900', color: '#ff3366', fontSize: '1.2rem', textShadow: '1px 1px 0px white'}}>copy_from_user() ➡</div>
             <div style={{position: 'absolute', top: '70%', right: '12%', fontWeight: '900', color: '#2b00ff', fontSize: '1.5rem', textShadow: '1px 1px 0px white'}}>✅ mmap() overlap (1 copy!)</div>
          </div>
        );
      case 4:
        return (
          <div className={`${styles.visItem} ${styles['fade-in']}`} style={{width:'80%', height:'80%'}}>
            <div className={`${styles.box} ${styles.clientBox}`} style={{position: 'absolute', left: '5%', top: '40%'}}>Client Code</div>
            
            <div className={styles.dataPacket} style={{animation: 'slideAcross 2.5s infinite linear', top: '42%', left: '30%'}}></div>
            <div style={{position: 'absolute', top: '28%', left: '43%', color: '#ff3366', fontWeight: 900, fontSize: '1.5rem'}}>PARCEL 📦</div>
            <div style={{position: 'absolute', top: '55%', left: '38%', color: '#4a4a5e', fontWeight: 600}}>Flattened Method Call</div>
            
            <div className={`${styles.box} ${styles.serverBox}`} style={{position: 'absolute', right: '5%', top: '40%'}}>SystemServer</div>
          </div>
        );
      case 5:
        return (
          <div className={`${styles.visItem} ${styles['fade-in']}`} style={{width:'90%', display:'flex', gap: '30px'}}>
             <div className={`${styles.box} ${styles.clientBox}`} style={{opacity: 0.5, filter: 'grayscale(100%)'}}>Zzz... Client<br/><small>(Blocked Thread)</small></div>
             <div className={`${styles.box} ${styles.kernelBox} ${styles.pulse}`} style={{fontSize: '1.5rem'}}>ioctl(BINDER_WRITE_READ)</div>
             <div className={`${styles.box} ${styles.serverBox} ${styles['fade-in']}`} style={{animationDelay: '1s'}}>🔥 Server Thread<br/><small>(Processing)</small></div>
          </div>
        );
      case 6:
        return (
          <div className={`${styles.visItem} ${styles['fade-in']}`} style={{flexDirection: 'column', gap: '30px'}}>
             <div style={{fontSize: '3.5rem', fontWeight: 900, color: '#ffcc00', textShadow: '2px 2px 0px #ff3366'}}>🪄 AIDL</div>
             <div style={{display: 'flex', gap: '50px'}}>
                <div className={`${styles.box}`} style={{background: '#fff', border: '4px solid #00d2ff', color:'#1a1a24'}}><strong>Proxy (Client)</strong><br/><small>Pretends to be real</small></div>
                <div className={`${styles.box}`} style={{background: '#fff', border: '4px solid #11998e', color:'#1a1a24'}}><strong>Stub (Server)</strong><br/><small>Deserializes Parcel</small></div>
             </div>
          </div>
        );
      case 7:
        return (
          <div className={`${styles.visItem} ${styles['fade-in']}`} style={{height: '100%', width: '100%'}}>
             <div className={`${styles.box} ${styles.clientBox}`} style={{position: 'absolute', left: '15%', top: '40%'}}>Alive App</div>
             <div style={{position: 'absolute', left: '35%', top: '44%', color: '#ff3366', fontWeight: 900, fontSize: '1.8rem'}}>⬅ 👻 Death Notification</div>
             <div className={`${styles.box}`} style={{position: 'absolute', right: '15%', top: '40%', background: '#444', color: '#aaa', textDecoration: 'line-through', border: '2px solid #222'}}>Dead System Process</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ position: 'absolute', top: 30, right: 30, zIndex: 100, display: 'flex', gap: 10, background: 'rgba(255,255,255,0.9)', padding: 12, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <button onClick={() => setVisMode('default')} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: visMode === 'default' ? '#ff3366' : '#e2e8f0', color: visMode === 'default' ? 'white' : '#1e293b', cursor: 'pointer', fontWeight: 'bold' }}>Default View</button>
        <button onClick={() => setVisMode('phone')} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: visMode === 'phone' ? '#ff3366' : '#e2e8f0', color: visMode === 'phone' ? 'white' : '#1e293b', cursor: 'pointer', fontWeight: 'bold' }}>Phone Mode</button>
      </div>

      <div className={styles.textSectionWrapper}>
        <div style={{height: '10vh'}}></div>
        {SECTIONS.map((section, idx) => (
          <div 
            key={section.id} 
            data-index={idx}
            className={`sectionBlock ${styles.sectionBlock} ${activeStep === idx ? styles.active : ''}`}
          >
            <h2>{section.title}</h2>
            <div>{section.content}</div>
          </div>
        ))}
        <div style={{height: '30vh'}}></div>
      </div>
      
      <div className={styles.visWrapper} style={{ background: visMode === 'phone' ? '#0b0b0d' : '' }}>
        <div className={styles.visStage}>
          {visMode === 'phone' ? (
            <PhoneVisualBinder scene={activeStep} />
          ) : (
            renderVis()
          )}
        </div>
      </div>
    </div>
  );
}