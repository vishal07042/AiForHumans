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

export default function BinderIpc() {
  const [activeStep, setActiveStep] = useState(0);

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
      </div>
      
      <div className={styles.visWrapper}>
        <div className={styles.visStage}>
          {renderVis()}
        </div>
      </div>
    </div>
  );
}