// Main app — layout, nav, scroll-tracking, localStorage

const LESSONS = [
  { id:1, title:'Market Structure', sub:'HH, HL, LH, LL', comp:'Lesson1' },
  { id:2, title:'BOS vs CHoCH', sub:'ทะลุโครงสร้าง', comp:'Lesson2' },
  { id:3, title:'Liquidity', sub:'Buyside & Sellside', comp:'Lesson3' },
  { id:4, title:'Order Block', sub:'OB คุณภาพดี', comp:'Lesson4' },
  { id:5, title:'Fair Value Gap', sub:'FVG / Imbalance', comp:'Lesson5' },
  { id:6, title:'Premium & Discount', sub:'Fibonacci + OTE', comp:'Lesson6' },
  { id:7, title:'A+ Trade Setup', sub:'รวมทุกอย่าง', comp:'Lesson7' },
];

const STORAGE_KEY = 'smc-learn-progress-v1';

function useLocalProgress() {
  const [done, setDone] = React.useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });
  const toggle = React.useCallback((id) => {
    setDone(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...n])); } catch {}
      return n;
    });
  }, []);
  const reset = React.useCallback(() => {
    setDone(new Set());
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);
  return [done, toggle, reset];
}

function useReveal() {
  React.useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useActiveSection(ids) {
  const [active, setActive] = React.useState(ids[0]);
  React.useEffect(() => {
    const handler = () => {
      let cur = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.35) cur = id;
      }
      setActive(cur);
    };
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [ids]);
  return active;
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 16;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

function Sidebar({ open, setOpen, done, active }) {
  const ids = ['hero', ...LESSONS.map(l => `lesson-${l.id}`), 'practice', 'resources'];
  return (
    <aside className={`sidebar ${open?'open':''}`}>
      <div className="brand">
        <div className="brand-mark">Σ</div>
        <div>
          <div className="brand-title">SMC Academy</div>
          <div className="brand-sub">Thai · 7 lessons</div>
        </div>
      </div>

      <div className="nav-label">หลักสูตร</div>
      <ul className="nav">
        {LESSONS.map(l => {
          const id = `lesson-${l.id}`;
          const isActive = active === id;
          const isDone = done.has(l.id);
          return (
            <li key={l.id}
              className={`nav-item ${isActive?'active':''} ${isDone?'done':''}`}
              onClick={() => { scrollToId(id); setOpen(false); }}>
              <span className="nav-num">{isDone?'✓':l.id}</span>
              <span>
                <div style={{fontSize:13,lineHeight:1.3}}>{l.title}</div>
                <div style={{fontSize:11,color:'var(--text-3)',fontFamily:'JetBrains Mono',marginTop:2}}>{l.sub}</div>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="nav-label">เพิ่มเติม</div>
      <ul className="nav">
        <li className={`nav-item ${active==='practice'?'active':''}`}
          onClick={()=>{scrollToId('practice');setOpen(false);}}>
          <span className="nav-num">★</span>
          <span><div style={{fontSize:13}}>Practice</div>
            <div style={{fontSize:11,color:'var(--text-3)',fontFamily:'JetBrains Mono',marginTop:2}}>6 quiz</div></span>
        </li>
        <li className={`nav-item ${active==='resources'?'active':''}`}
          onClick={()=>{scrollToId('resources');setOpen(false);}}>
          <span className="nav-num">↗</span>
          <span><div style={{fontSize:13}}>Resources</div>
            <div style={{fontSize:11,color:'var(--text-3)',fontFamily:'JetBrains Mono',marginTop:2}}>YouTube · PDF · TV</div></span>
        </li>
      </ul>

      <div className="progress-wrap">
        <div className="progress-row">
          <span>PROGRESS</span>
          <span>{done.size}/7</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{width:`${(done.size/7)*100}%`}}/>
        </div>
      </div>
    </aside>
  );
}

function Hero({ done }) {
  return (
    <section id="hero" className="hero">
      <div className="container">
        <div className="reveal">
          <div className="eyebrow"><span className="dot"></span>LIVE COURSE · เริ่มต้นฟรี</div>
          <h1 className="hero-title">
            เข้าใจ <span className="grad">Smart Money Concepts</span><br/>
            ใน 7 บทเรียน
          </h1>
          <p className="hero-sub">
            เรียนรู้วิธีอ่านกราฟแบบสถาบัน — โครงสร้างตลาด, Liquidity, Order Block, FVG และการหาจุดเข้าไม้ A+ Setup
            ด้วยกราฟจำลองแบบโต้ตอบได้ทุกขั้นตอน ภาษาไทยเข้าใจง่าย
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={()=>scrollToId('lesson-1')}>
              เริ่มเรียน
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
            <button className="btn btn-ghost" onClick={()=>scrollToId('resources')}>
              ดู Resources
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat"><div className="stat-num">7</div><div className="stat-lbl">บทเรียน</div></div>
            <div className="stat"><div className="stat-num">12+</div><div className="stat-lbl">Interactive Chart</div></div>
            <div className="stat"><div className="stat-num">1-2h</div><div className="stat-lbl">เวลาเรียน</div></div>
            <div className="stat"><div className="stat-num" style={{color:'var(--green)'}}>{done.size}/7</div><div className="stat-lbl">ที่คุณเรียนจบ</div></div>
          </div>
        </div>

        <div className="hero-visual reveal">
          <HeroChart/>
        </div>
      </div>
    </section>
  );
}

function Lesson({ id, number, title, sub, children, done, toggle }) {
  const isDone = done.has(number);
  return (
    <section id={id} className="lesson reveal">
      <div className="container">
        <div className="lesson-header">
          <div className="lesson-tag">
            <span className="n">บทที่ {number.toString().padStart(2,'0')}</span>
            <span>/ {sub}</span>
          </div>
          <h2 className="lesson-title">{title}</h2>
        </div>
        {children}
        <div className={`mark-bar ${isDone?'done':''}`}>
          <div className="done-state">
            {isDone ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                เรียนจบบทนี้แล้ว
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                เมื่ออ่านจบ กดปุ่มด้านขวาเพื่อบันทึกความคืบหน้า
              </>
            )}
          </div>
          <button className={`btn ${isDone?'btn-ghost':'btn-primary'}`} onClick={()=>toggle(number)}>
            {isDone ? 'ยกเลิกเครื่องหมาย' : 'ทำเครื่องหมายว่าเรียนจบ'}
            {!isDone && number < 7 && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

function PracticeWrap() {
  return (
    <section id="practice" className="lesson reveal">
      <div className="container">
        <div className="lesson-header">
          <div className="lesson-tag">
            <span className="n">PRACTICE</span>
            <span>/ ทดสอบสายตา</span>
          </div>
          <h2 className="lesson-title">ฝึกอ่านกราฟจริง</h2>
          <p className="lesson-desc">6 กราฟจำลอง — ดูแล้วตอบว่าเกิดอะไรขึ้น พร้อมเฉลยทันที</p>
        </div>
        <PracticeSection/>
      </div>
    </section>
  );
}

function Resources() {
  return (
    <section id="resources" className="lesson reveal">
      <div className="container">
        <div className="lesson-header">
          <div className="lesson-tag">
            <span className="n">RESOURCES</span>
            <span>/ แหล่งเรียนเพิ่ม</span>
          </div>
          <h2 className="lesson-title">ไปต่อจากที่นี่</h2>
          <p className="lesson-desc">ลิงก์แนะนำเพื่อต่อยอดความรู้และฝึกปฏิบัติจริง</p>
        </div>

        <div className="res-grid">
          <a className="res-card" href="https://www.youtube.com/results?search_query=smart+money+concepts+thai" target="_blank" rel="noopener">
            <div className="res-ico" style={{background:'rgba(239,83,80,.12)',color:'var(--red)'}}>▶</div>
            <h4>YouTube · SMC ภาษาไทย</h4>
            <p>ช่องและคลิปสอน SMC เป็นภาษาไทยที่อธิบายชัดเจน</p>
          </a>
          <a className="res-card" href="https://www.tradingview.com/chart/" target="_blank" rel="noopener">
            <div className="res-ico" style={{background:'rgba(41,98,255,.12)',color:'var(--blue)'}}>◪</div>
            <h4>Chart Platform</h4>
            <p>ฝึกลากโครงสร้างและ backtest กับกราฟจริงบน platform ฟรี</p>
          </a>
          <a className="res-card" href="#" onClick={(e)=>{e.preventDefault();alert('Cheatsheet PDF — ยังอยู่ระหว่างเตรียม');}}>
            <div className="res-ico" style={{background:'rgba(38,166,154,.12)',color:'var(--green)'}}>⇩</div>
            <h4>Cheatsheet PDF</h4>
            <p>สรุป 7 บทเรียนเป็นไฟล์เดียว — พิมพ์ติดโต๊ะได้</p>
          </a>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [done, toggle, reset] = useLocalProgress();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const ids = ['hero', ...LESSONS.map(l => `lesson-${l.id}`), 'practice', 'resources'];
  const active = useActiveSection(ids);
  useReveal();

  React.useEffect(() => {
    const btn = document.getElementById('menu-btn');
    const h = () => setSidebarOpen(o=>!o);
    btn.addEventListener('click', h);
    return () => btn.removeEventListener('click', h);
  }, []);

  const lessonMap = { Lesson1, Lesson2, Lesson3, Lesson4, Lesson5, Lesson6, Lesson7 };

  return (
    <div className="app">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} done={done} active={active}/>
      <main className="main">
        <Hero done={done}/>
        {LESSONS.map(l => {
          const Comp = lessonMap[l.comp];
          return (
            <Lesson key={l.id} id={`lesson-${l.id}`} number={l.id}
              title={l.title} sub={l.sub} done={done} toggle={toggle}>
              <Comp/>
            </Lesson>
          );
        })}

        {done.size===7 && (
          <section className="lesson reveal">
            <div className="container">
              <div className="complete-banner">
                <h3>🎉 เรียนจบครบ 7 บทแล้ว!</h3>
                <p>ลองทำ Practice ด้านล่างเพื่อทดสอบสายตาของคุณ</p>
              </div>
            </div>
          </section>
        )}

        <PracticeWrap/>
        <Resources/>

        <footer>
          <div className="container">
            <div className="foot-grid">
              <div>
                <h4>SMC Academy</h4>
                <p style={{color:'var(--text-3)',maxWidth:420}}>
                  คอร์สเรียน Smart Money Concepts ภาษาไทย — ออกแบบมาสำหรับมือใหม่ที่ต้องการเข้าใจกราฟแบบสถาบัน
                  ด้วยการแสดงผลแบบ interactive เข้าใจง่ายภายในชั่วโมงเดียว
                </p>
              </div>
              <div>
                <h4>บทเรียน</h4>
                {LESSONS.map(l => (
                  <a key={l.id} href={`#lesson-${l.id}`} onClick={(e)=>{e.preventDefault();scrollToId(`lesson-${l.id}`);}}>
                    {l.id}. {l.title}
                  </a>
                ))}
              </div>
              <div>
                <h4>อื่นๆ</h4>
                <a href="#practice" onClick={(e)=>{e.preventDefault();scrollToId('practice');}}>Practice</a>
                <a href="#resources" onClick={(e)=>{e.preventDefault();scrollToId('resources');}}>Resources</a>
                <a href="#" onClick={(e)=>{e.preventDefault();if(confirm('รีเซ็ตความคืบหน้าทั้งหมด?')) reset();}}>รีเซ็ตความคืบหน้า</a>
              </div>
            </div>
            <div className="disclaimer">
              ⚠ <b>Disclaimer:</b> เนื้อหานี้จัดทำเพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน การเทรดมีความเสี่ยง
              ผู้เรียนควรศึกษาและทดลองบน demo account ก่อนนำไปใช้จริง ผู้สร้างไม่รับผิดชอบต่อความเสียหายที่อาจเกิดขึ้น
            </div>
            <div style={{marginTop:20,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10,fontFamily:'JetBrains Mono',fontSize:11,color:'var(--text-3)'}}>
              <div>© 2026 SMC Academy · Thai Edition</div>
              <div>Built with ♥ for Thai retail traders</div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
