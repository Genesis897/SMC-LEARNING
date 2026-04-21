// Reusable SVG chart primitives for SMC lessons
// All charts use a shared coordinate system: priceToY(price) + index-based X

const GREEN = '#26A69A';
const RED = '#EF5350';
const BLUE = '#2962FF';
const YELLOW = '#F5A623';
const PURPLE = '#A78BFA';
const GRID = '#1a2029';
const AXIS = '#4a5463';

// ---- Candle ----
function Candle({ x, w, o, h, l, c, priceToY, dim=false, onClick, hint }) {
  const up = c >= o;
  const color = up ? GREEN : RED;
  const bodyTop = priceToY(Math.max(o,c));
  const bodyBot = priceToY(Math.min(o,c));
  const wickTop = priceToY(h);
  const wickBot = priceToY(l);
  return (
    <g opacity={dim?0.35:1} style={{cursor:onClick?'pointer':'default'}} onClick={onClick}>
      <line x1={x+w/2} x2={x+w/2} y1={wickTop} y2={wickBot} stroke={color} strokeWidth={1.2}/>
      <rect x={x} y={bodyTop} width={w} height={Math.max(1,bodyBot-bodyTop)} fill={color} rx={0.5}/>
      {hint && <title>{hint}</title>}
    </g>
  );
}

// ---- Generic chart frame ----
function ChartFrame({ width=640, height=320, data, padding={t:20,r:30,b:20,l:10}, children, yTicks=5 }) {
  // compute price bounds from data if provided
  let min = Infinity, max = -Infinity;
  if (data) {
    data.forEach(d => { min = Math.min(min, d.l); max = Math.max(max, d.h); });
    const span = max - min;
    min -= span * 0.1; max += span * 0.1;
  }
  const chartW = width - padding.l - padding.r;
  const chartH = height - padding.t - padding.b;
  const priceToY = p => padding.t + (1 - (p - min) / (max - min)) * chartH;
  const indexToX = (i, n) => padding.l + (n > 1 ? (i / (n - 1)) * chartW : chartW/2);
  const candleSlot = n => chartW / n;

  // horizontal grid
  const ticks = [];
  for (let i = 0; i <= yTicks; i++) {
    const p = min + (i / yTicks) * (max - min);
    const y = priceToY(p);
    ticks.push(
      <g key={i}>
        <line x1={padding.l} x2={width-padding.r} y1={y} y2={y} stroke={GRID} strokeDasharray="2 4"/>
        <text x={width-padding.r+6} y={y+3} className="ticks">{p.toFixed(1)}</text>
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{display:'block'}}>
      <rect x={0} y={0} width={width} height={height} fill="transparent"/>
      {ticks}
      {typeof children === 'function'
        ? children({ priceToY, indexToX, candleSlot, chartW, chartH, padding, width, height })
        : children}
    </svg>
  );
}

// ---- helper: render candle array ----
function Candles({ data, priceToY, indexToX, slotW, dimMap={}, onCandleClick }) {
  const cw = slotW * 0.65;
  return data.map((d,i) => {
    const x = indexToX(i, data.length) - cw/2;
    return (
      <Candle key={i} x={x} w={cw}
        o={d.o} h={d.h} l={d.l} c={d.c}
        priceToY={priceToY}
        dim={dimMap[i]}
        onClick={onCandleClick ? () => onCandleClick(i,d) : undefined}
        hint={d.label}
      />
    );
  });
}

// ---- Swing label ----
function SwingLabel({ x, y, text, color=BLUE, pos='top' }) {
  const dy = pos === 'top' ? -12 : 20;
  return (
    <g>
      <circle cx={x} cy={y} r={4} fill={color} stroke="#0b0f14" strokeWidth={2}/>
      <rect x={x-18} y={y+dy-11} width={36} height={16} rx={3} fill={color} opacity={0.15}/>
      <text x={x} y={y+dy} textAnchor="middle" fill={color} fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">{text}</text>
    </g>
  );
}

// =========================================================================
// LESSON 1: Market Structure — interactive swing labeler
// =========================================================================
function MarketStructureChart() {
  // data designed to have clear HH, HL, LH, LL swings
  const data = [
    {o:100,h:102,l:99,c:101},
    {o:101,h:104,l:100,c:103},
    {o:103,h:108,l:102,c:107,swing:'HL',label:'HL'},      // swing low #1
    {o:107,h:112,l:106,c:111},
    {o:111,h:118,l:110,c:117,swing:'HH',label:'HH'},      // swing high #1
    {o:117,h:118,l:113,c:114},
    {o:114,h:115,l:109,c:110,swing:'HL',label:'HL'},      // swing low #2 (higher than first)
    {o:110,h:116,l:109,c:115},
    {o:115,h:125,l:114,c:124,swing:'HH',label:'HH'},      // swing high #2
    {o:124,h:125,l:119,c:120},
    {o:120,h:121,l:116,c:117},
    {o:117,h:122,l:115,c:121,swing:'LL',label:'LL',phase:'reverse'},  // breakdown start — LH
    {o:121,h:124,l:120,c:121,swing:'LH',label:'LH'},
    {o:121,h:122,l:115,c:116},
    {o:116,h:117,l:110,c:112,swing:'LL',label:'LL'},
  ];

  // the four labelable swing points (index into data)
  const swings = [
    {i:2, price:102, type:'HL', pos:'bot'},
    {i:4, price:118, type:'HH', pos:'top'},
    {i:6, price:109, type:'HL', pos:'bot'},
    {i:8, price:125, type:'HH', pos:'top'},
    {i:12, price:124, type:'LH', pos:'top'},
    {i:14, price:110, type:'LL', pos:'bot'},
  ];

  const [revealed, setRevealed] = React.useState(new Set());
  const revealAll = () => setRevealed(new Set(swings.map((_,i)=>i)));
  const reset = () => setRevealed(new Set());

  return (
    <div>
      <div className="chart">
        <div className="chart-toolbar">
          <div className="chart-title">BTC/USDT • 1H • Market Structure</div>
          <div className="chart-controls">
            <button className="chip" onClick={revealAll}>แสดงทั้งหมด</button>
            <button className="chip" onClick={reset}>รีเซ็ต</button>
          </div>
        </div>
        <ChartFrame data={data} height={340}>
          {({priceToY, indexToX, candleSlot}) => {
            const slotW = candleSlot(data.length);
            return (
              <>
                <Candles data={data} priceToY={priceToY} indexToX={indexToX} slotW={slotW}/>
                {/* swing points — clickable dots */}
                {swings.map((s,si) => {
                  const x = indexToX(s.i, data.length);
                  const y = priceToY(s.price);
                  const shown = revealed.has(si);
                  const color = s.type.includes('H') && s.type==='HH' ? GREEN
                              : s.type==='HL' ? GREEN
                              : s.type==='LH' ? RED
                              : RED;
                  return (
                    <g key={si} style={{cursor:'pointer'}} onClick={() => {
                      const n = new Set(revealed); n.add(si); setRevealed(n);
                    }}>
                      <circle cx={x} cy={y} r={shown?5:7} fill={shown?color:'#1a2029'} stroke={color} strokeWidth={2}>
                        {!shown && <animate attributeName="r" values="7;10;7" dur="1.8s" repeatCount="indefinite"/>}
                      </circle>
                      {shown && <SwingLabel x={x} y={y} text={s.type} color={color} pos={s.pos}/>}
                    </g>
                  );
                })}
                {/* trend line connectors — only when all shown */}
                {revealed.size===swings.length && (
                  <g opacity={0.5}>
                    <line x1={indexToX(2,data.length)} y1={priceToY(102)} x2={indexToX(8,data.length)} y2={priceToY(125)} stroke={GREEN} strokeDasharray="3 3" strokeWidth={1.2}/>
                    <line x1={indexToX(8,data.length)} y1={priceToY(125)} x2={indexToX(14,data.length)} y2={priceToY(110)} stroke={RED} strokeDasharray="3 3" strokeWidth={1.2}/>
                  </g>
                )}
              </>
            );
          }}
        </ChartFrame>
        <div className="legend">
          <span><i style={{background:GREEN}}></i>HH = High ที่สูงกว่าเดิม</span>
          <span><i style={{background:GREEN}}></i>HL = Low ที่สูงกว่าเดิม</span>
          <span><i style={{background:RED}}></i>LH = High ที่ต่ำกว่าเดิม</span>
          <span><i style={{background:RED}}></i>LL = Low ที่ต่ำกว่าเดิม</span>
        </div>
      </div>
      <p style={{color:'var(--text-3)',fontSize:12,marginTop:10,fontFamily:'JetBrains Mono'}}>
        ▸ คลิกที่จุดกะพริบบนกราฟเพื่อดู label swing แต่ละจุด
      </p>
    </div>
  );
}

// =========================================================================
// LESSON 2: BOS vs CHoCH — side-by-side animated
// =========================================================================
function BOSvsCHoCHChart() {
  const [playKey, setPlayKey] = React.useState(0);

  // BOS — uptrend makes higher high
  const bosData = [
    {o:100,h:103,l:99,c:102},
    {o:102,h:108,l:101,c:107},
    {o:107,h:109,l:104,c:105},  // swing low
    {o:105,h:110,l:104,c:109},
    {o:109,h:115,l:108,c:114},  // prev high
    {o:114,h:116,l:112,c:113},
    {o:113,h:115,l:110,c:111},
    {o:111,h:114,l:110,c:113},
    {o:113,h:120,l:112,c:119},  // breakout
    {o:119,h:122,l:118,c:121},
  ];
  // CHoCH — uptrend reverses by breaking last HL
  const chochData = [
    {o:100,h:103,l:99,c:102},
    {o:102,h:108,l:101,c:107},
    {o:107,h:109,l:104,c:105},
    {o:105,h:115,l:104,c:114},
    {o:114,h:116,l:112,c:113},
    {o:113,h:114,l:108,c:109}, // HL at 108
    {o:109,h:112,l:107,c:108},
    {o:108,h:110,l:105,c:106},
    {o:106,h:107,l:100,c:101}, // break HL → CHoCH
    {o:101,h:102,l:97,c:98},
  ];

  const Chart = ({ data, breakLevel, breakIndex, type, title }) => (
    <div className="chart" key={playKey+type}>
      <div className="chart-toolbar">
        <div className="chart-title">{title}</div>
        <span className={`pill ${type==='BOS'?'g':'r'}`}>{type}</span>
      </div>
      <ChartFrame data={data} height={240}>
        {({priceToY, indexToX, candleSlot, chartW, padding}) => {
          const slotW = candleSlot(data.length);
          const yLvl = priceToY(breakLevel);
          const xBreak = indexToX(breakIndex, data.length);
          return (
            <>
              {/* structure line being broken */}
              <line x1={padding.l} x2={xBreak} y1={yLvl} y2={yLvl}
                stroke={type==='BOS'?GREEN:RED} strokeWidth={1.4} strokeDasharray="4 3" opacity={0.85}/>
              <text x={padding.l+4} y={yLvl-5} fontSize="10" fontFamily="JetBrains Mono"
                fill={type==='BOS'?GREEN:RED}>
                {type==='BOS'?'Previous High':'Previous HL'}
              </text>
              <Candles data={data} priceToY={priceToY} indexToX={indexToX} slotW={slotW}/>
              {/* break arrow animation */}
              <g>
                <line x1={xBreak} x2={xBreak} y1={yLvl}
                  y2={type==='BOS'?priceToY(data[breakIndex].h):priceToY(data[breakIndex].l)}
                  stroke={type==='BOS'?GREEN:RED} strokeWidth={2}>
                  <animate attributeName="stroke-dasharray" from="0,100" to="100,0" dur="1.2s" fill="freeze"/>
                </line>
                <text x={xBreak+8} y={type==='BOS'?yLvl-20:yLvl+28} fontSize="11"
                  fontFamily="JetBrains Mono" fontWeight="600"
                  fill={type==='BOS'?GREEN:RED}>
                  {type} ↯
                </text>
              </g>
            </>
          );
        }}
      </ChartFrame>
    </div>
  );

  return (
    <div>
      <div className="grid-2">
        <Chart data={bosData} breakLevel={115} breakIndex={8} type="BOS" title="Uptrend • Break of Structure"/>
        <Chart data={chochData} breakLevel={108} breakIndex={8} type="CHoCH" title="Uptrend → Reversal"/>
      </div>
      <div style={{textAlign:'center',marginTop:12}}>
        <button className="chip" onClick={() => setPlayKey(k=>k+1)}>↻ เล่นอนิเมชั่นอีกครั้ง</button>
      </div>
    </div>
  );
}

// =========================================================================
// LESSON 3: Liquidity — hover swing points
// =========================================================================
function LiquidityChart() {
  const data = [
    {o:100,h:102,l:99,c:101},
    {o:101,h:108,l:100,c:107},
    {o:107,h:115,l:106,c:114},  // swing high A
    {o:114,h:115,l:110,c:111},
    {o:111,h:112,l:105,c:106},  // swing low A
    {o:106,h:113,l:105,c:112},
    {o:112,h:118,l:111,c:117},  // swing high B — equal-ish highs
    {o:117,h:118,l:113,c:114},
    {o:114,h:115,l:107,c:108},  // swing low B
    {o:108,h:122,l:107,c:121},  // sweep up → grabs buyside liq at 118
    {o:121,h:123,l:117,c:118},
    {o:118,h:119,l:113,c:114},
  ];

  const [hover, setHover] = React.useState(null);
  const [showSweep, setShowSweep] = React.useState(false);

  const points = [
    {i:2, price:115, type:'buyside', label:'Buyside Liquidity', desc:'Stop loss ของคน short อยู่เหนือแนวนี้'},
    {i:6, price:118, type:'buyside', label:'Buyside Liquidity', desc:'เป็นเป้าให้ smart money ลากราคาขึ้นไปกวาด'},
    {i:4, price:105, type:'sellside', label:'Sellside Liquidity', desc:'Stop loss ของคน long อยู่ใต้แนวนี้'},
    {i:8, price:107, type:'sellside', label:'Sellside Liquidity', desc:'เป้าสำหรับการกวาดล่าง'},
  ];

  return (
    <div>
      <div className="chart" style={{position:'relative'}}>
        <div className="chart-toolbar">
          <div className="chart-title">Liquidity Pools • Hover จุดบนกราฟ</div>
          <div className="chart-controls">
            <button className={`chip ${showSweep?'active':''}`} onClick={()=>setShowSweep(s=>!s)}>
              {showSweep?'ซ่อน Sweep':'▶ เล่น Liquidity Sweep'}
            </button>
          </div>
        </div>
        <ChartFrame data={data} height={320}>
          {({priceToY, indexToX, candleSlot, padding, width}) => {
            const slotW = candleSlot(data.length);
            return (
              <>
                {/* liquidity zones */}
                <rect x={padding.l} y={priceToY(118)-3} width={width-padding.l-padding.r} height={6}
                  fill={BLUE} opacity={0.12}/>
                <rect x={padding.l} y={priceToY(107)-3} width={width-padding.l-padding.r} height={6}
                  fill={YELLOW} opacity={0.12}/>
                <line x1={padding.l} x2={width-padding.r} y1={priceToY(118)} y2={priceToY(118)} stroke={BLUE} strokeDasharray="3 3" opacity={0.6}/>
                <text x={padding.l+4} y={priceToY(118)-4} fontSize="10" fontFamily="JetBrains Mono" fill={BLUE}>BUYSIDE LIQ</text>
                <line x1={padding.l} x2={width-padding.r} y1={priceToY(107)} y2={priceToY(107)} stroke={YELLOW} strokeDasharray="3 3" opacity={0.6}/>
                <text x={padding.l+4} y={priceToY(107)+12} fontSize="10" fontFamily="JetBrains Mono" fill={YELLOW}>SELLSIDE LIQ</text>

                <Candles data={data} priceToY={priceToY} indexToX={indexToX} slotW={slotW}
                  dimMap={showSweep?{}:{9:false,10:false,11:false}}/>

                {/* sweep animation */}
                {showSweep && (
                  <g>
                    <path d={`M ${indexToX(8,data.length)} ${priceToY(108)}
                              L ${indexToX(9,data.length)} ${priceToY(122)}
                              L ${indexToX(11,data.length)} ${priceToY(113)}`}
                      stroke={PURPLE} strokeWidth={2} fill="none" strokeDasharray="4 3">
                      <animate attributeName="stroke-dashoffset" from="200" to="0" dur="1.6s" fill="freeze"/>
                    </path>
                    <text x={indexToX(9,data.length)} y={priceToY(122)-8} fontSize="10"
                      fontFamily="JetBrains Mono" fontWeight="600" fill={PURPLE} textAnchor="middle">
                      SWEEP ↯
                    </text>
                  </g>
                )}

                {/* hoverable swing points */}
                {points.map((p,pi) => {
                  const x = indexToX(p.i, data.length);
                  const y = priceToY(p.price);
                  const color = p.type==='buyside' ? BLUE : YELLOW;
                  return (
                    <g key={pi} style={{cursor:'pointer'}}
                      onMouseEnter={()=>setHover({...p,x,y,color})}
                      onMouseLeave={()=>setHover(null)}>
                      <circle cx={x} cy={y} r={10} fill={color} opacity={0.15}/>
                      <circle cx={x} cy={y} r={5} fill={color} stroke="#0b0f14" strokeWidth={2}/>
                    </g>
                  );
                })}
              </>
            );
          }}
        </ChartFrame>
        {hover && (
          <div className="ttip show" style={{
            left: Math.min(Math.max(10, hover.x*640/640 - 120), 500),
            top: hover.y < 100 ? hover.y + 30 : hover.y - 60,
            whiteSpace:'normal',maxWidth:240
          }}>
            <div style={{color:hover.color,fontWeight:600,marginBottom:4,fontSize:11}}>{hover.label}</div>
            <div style={{color:'var(--text-2)',fontFamily:'IBM Plex Sans Thai',fontSize:12,lineHeight:1.5}}>{hover.desc}</div>
          </div>
        )}
        <div className="legend">
          <span><i style={{background:BLUE}}></i>Buyside (เหนือ swing high)</span>
          <span><i style={{background:YELLOW}}></i>Sellside (ใต้ swing low)</span>
          <span><i style={{background:PURPLE}}></i>Sweep Path</span>
        </div>
      </div>
      <p style={{color:'var(--text-3)',fontSize:12,marginTop:10,fontFamily:'JetBrains Mono'}}>
        ▸ Hover ที่จุดสี่จุดบนกราฟ เพื่อเห็นว่า stop loss ของใครอยู่ตรงนั้น
      </p>
    </div>
  );
}

// =========================================================================
// LESSON 4: Order Block — before/after slider
// =========================================================================
function OrderBlockChart() {
  const data = [
    {o:100,h:102,l:99,c:101},
    {o:101,h:103,l:100,c:102},
    {o:102,h:104,l:101,c:103},
    {o:103,h:104,l:100,c:101},  // OB candle (bearish) — last down close before rally
    {o:101,h:103,l:100,c:102},
    {o:102,h:108,l:101,c:107},  // impulse up
    {o:107,h:112,l:106,c:111},  // impulse continues
    {o:111,h:115,l:110,c:114},  // breaks structure (prev high ~104)
    {o:114,h:116,l:113,c:115},
    {o:115,h:116,l:112,c:113},
  ];

  const [step, setStep] = React.useState(0);
  const maxStep = 3;

  // step 0: raw candles
  // step 1: mark previous structure
  // step 2: mark BOS
  // step 3: mark OB
  const prevHigh = 104;
  const obIdx = 3;
  const bosIdx = 7;

  return (
    <div>
      <div className="chart">
        <div className="chart-toolbar">
          <div className="chart-title">Order Block • เลื่อน slider เพื่อดูขั้นตอน</div>
          <div className="pill b">STEP {step}/{maxStep}</div>
        </div>
        <ChartFrame data={data} height={300}>
          {({priceToY, indexToX, candleSlot, padding, width}) => {
            const slotW = candleSlot(data.length);
            const obX = indexToX(obIdx, data.length) - slotW*0.5;
            const obY = priceToY(data[obIdx].h);
            const obH = priceToY(data[obIdx].l) - priceToY(data[obIdx].h);
            return (
              <>
                {/* prev structure line */}
                {step>=1 && (
                  <g>
                    <line x1={padding.l} x2={width-padding.r} y1={priceToY(prevHigh)} y2={priceToY(prevHigh)}
                      stroke={YELLOW} strokeDasharray="3 3" opacity={0.8}>
                      <animate attributeName="opacity" from="0" to="0.8" dur=".4s" fill="freeze"/>
                    </line>
                    <text x={padding.l+4} y={priceToY(prevHigh)-4} fontSize="10" fontFamily="JetBrains Mono" fill={YELLOW}>Previous High</text>
                  </g>
                )}
                {/* OB zone */}
                {step>=3 && (
                  <g>
                    <rect x={padding.l} y={priceToY(data[obIdx].h)}
                      width={width-padding.l-padding.r}
                      height={priceToY(data[obIdx].l)-priceToY(data[obIdx].h)}
                      fill={BLUE} opacity={0.18}>
                      <animate attributeName="opacity" from="0" to="0.18" dur=".5s" fill="freeze"/>
                    </rect>
                    <text x={width-padding.r-6} y={priceToY(data[obIdx].h)-4} fontSize="10"
                      fontFamily="JetBrains Mono" fontWeight="600" fill={BLUE} textAnchor="end">
                      BULLISH OB
                    </text>
                  </g>
                )}
                <Candles data={data} priceToY={priceToY} indexToX={indexToX} slotW={slotW}/>
                {/* highlight OB candle */}
                {step>=3 && (
                  <rect x={indexToX(obIdx,data.length)-slotW*0.4} y={priceToY(data[obIdx].h)-2}
                    width={slotW*0.8} height={priceToY(data[obIdx].l)-priceToY(data[obIdx].h)+4}
                    fill="none" stroke={BLUE} strokeWidth={1.5} rx={2}/>
                )}
                {/* BOS marker */}
                {step>=2 && (
                  <g>
                    <line x1={indexToX(bosIdx,data.length)} x2={indexToX(bosIdx,data.length)}
                      y1={priceToY(prevHigh)} y2={priceToY(data[bosIdx].h)}
                      stroke={GREEN} strokeWidth={2}/>
                    <text x={indexToX(bosIdx,data.length)+6} y={priceToY(data[bosIdx].h)+4}
                      fontSize="11" fontFamily="JetBrains Mono" fontWeight="600" fill={GREEN}>BOS</text>
                  </g>
                )}
              </>
            );
          }}
        </ChartFrame>
      </div>

      <div className="slider-wrap">
        <span style={{color:'var(--text)'}}>ขั้นตอน</span>
        <input type="range" min="0" max={maxStep} value={step}
          onChange={e=>setStep(+e.target.value)}/>
        <span style={{minWidth:170,color:'var(--blue)'}}>
          {['1. ดูกราฟดิบ','2. หาโครงสร้างเดิม','3. รอ BOS เกิด','4. ระบุ OB'][step]}
        </span>
      </div>
    </div>
  );
}

// =========================================================================
// LESSON 5: Fair Value Gap — toggle bullish/bearish
// =========================================================================
function FVGChart() {
  const [mode, setMode] = React.useState('bullish'); // bullish | bearish
  const [showFill, setShowFill] = React.useState(false);

  const bullData = [
    {o:100,h:102,l:99,c:101},
    {o:101,h:104,l:100,c:103},   // candle 1
    {o:103,h:112,l:103,c:111},   // candle 2 — big impulse
    {o:111,h:114,l:108,c:113},   // candle 3
    {o:113,h:115,l:111,c:112},
    {o:112,h:113,l:108,c:109},
    {o:109,h:111,l:105,c:106},   // pullback to FVG
    {o:106,h:110,l:104,c:109},   // FVG fill
    {o:109,h:115,l:108,c:114},
    {o:114,h:118,l:113,c:117},
  ];
  const bearData = [
    {o:120,h:122,l:118,c:119},
    {o:119,h:120,l:116,c:117},
    {o:117,h:117,l:108,c:109},   // big red candle
    {o:109,h:112,l:106,c:107},
    {o:107,h:108,l:104,c:105},
    {o:105,h:110,l:104,c:109},
    {o:109,h:114,l:108,c:113},   // pullback into FVG
    {o:113,h:115,l:110,c:111},   // FVG fill
    {o:111,h:112,l:106,c:107},
    {o:107,h:108,l:102,c:103},
  ];

  const data = mode==='bullish' ? bullData : bearData;
  // FVG is between candle1.high and candle3.low for bullish
  // candle1.low and candle3.high for bearish
  const fvg = mode==='bullish'
    ? { top: bullData[2].l, bot: bullData[0].h, idx:[0,1,2], fillIdx: 7 }   // actually gap between c1.high and c3.low: 104 → 108
    : { top: bearData[0].l, bot: bearData[2].h, idx:[0,1,2], fillIdx: 7 };

  // Correct FVG: 3-candle where candle2 leaves a gap between c1.high and c3.low (bullish)
  const fvgTop = mode==='bullish' ? data[2].l : data[0].l;
  const fvgBot = mode==='bullish' ? data[0].h : data[2].h;

  return (
    <div>
      <div className="chart">
        <div className="chart-toolbar">
          <div className="chart-title">Fair Value Gap • 3-Candle Pattern</div>
          <div className="chart-controls">
            <button className={`chip ${mode==='bullish'?'g':''}`} onClick={()=>setMode('bullish')}>Bullish FVG</button>
            <button className={`chip ${mode==='bearish'?'r':''}`} onClick={()=>setMode('bearish')}>Bearish FVG</button>
            <button className={`chip ${showFill?'active':''}`} onClick={()=>setShowFill(s=>!s)}>
              {showFill?'ซ่อน Fill':'▶ ดูราคากลับมาเติม'}
            </button>
          </div>
        </div>
        <ChartFrame data={data} height={300}>
          {({priceToY, indexToX, candleSlot, padding, width}) => {
            const slotW = candleSlot(data.length);
            const fvgTopY = priceToY(Math.max(fvgTop,fvgBot));
            const fvgBotY = priceToY(Math.min(fvgTop,fvgBot));
            const color = mode==='bullish' ? GREEN : RED;
            return (
              <>
                {/* FVG zone */}
                <rect x={padding.l} y={fvgTopY}
                  width={width-padding.l-padding.r} height={fvgBotY-fvgTopY}
                  fill={color} opacity={0.14}/>
                <line x1={padding.l} x2={width-padding.r} y1={fvgTopY} y2={fvgTopY} stroke={color} strokeDasharray="3 3" opacity={0.5}/>
                <line x1={padding.l} x2={width-padding.r} y1={fvgBotY} y2={fvgBotY} stroke={color} strokeDasharray="3 3" opacity={0.5}/>
                <text x={width-padding.r-6} y={fvgTopY-4} fontSize="10"
                  fontFamily="JetBrains Mono" fontWeight="600" fill={color} textAnchor="end">
                  FVG ({mode==='bullish'?'bullish':'bearish'})
                </text>

                <Candles data={data} priceToY={priceToY} indexToX={indexToX} slotW={slotW}
                  dimMap={showFill ? {} : {6:true,7:true,8:true,9:true}}/>

                {/* highlight 3 candles */}
                {[0,1,2].map(i => (
                  <rect key={i}
                    x={indexToX(i,data.length)-slotW*0.45}
                    y={priceToY(data[i].h)-3}
                    width={slotW*0.9}
                    height={priceToY(data[i].l)-priceToY(data[i].h)+6}
                    fill="none" stroke="rgba(41,98,255,.5)" strokeWidth={1} rx={2}/>
                ))}
                <text x={indexToX(1,data.length)} y={priceToY(data[1].h)-10}
                  fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle"
                  fill={BLUE}>3-candle pattern</text>

                {/* fill arrow */}
                {showFill && (
                  <g>
                    <path d={`M ${indexToX(5,data.length)} ${priceToY(data[5].c)}
                              Q ${indexToX(6,data.length)} ${(fvgTopY+fvgBotY)/2}
                              ${indexToX(7,data.length)} ${(fvgTopY+fvgBotY)/2}`}
                      stroke={PURPLE} strokeWidth={2} fill="none" strokeDasharray="4 3">
                      <animate attributeName="stroke-dashoffset" from="150" to="0" dur="1.5s" fill="freeze"/>
                    </path>
                  </g>
                )}
              </>
            );
          }}
        </ChartFrame>
      </div>
    </div>
  );
}

// =========================================================================
// LESSON 6: Premium & Discount — interactive Fibonacci
// =========================================================================
function PremiumDiscountChart() {
  // default swing points
  const [hi, setHi] = React.useState(130);
  const [lo, setLo] = React.useState(100);

  // simulated price series using the swing
  const data = [
    {o:100,h:104,l:99,c:103},
    {o:103,h:110,l:102,c:109},
    {o:109,h:118,l:108,c:117},
    {o:117,h:125,l:116,c:124},
    {o:124,h:130,l:123,c:125},   // swing high
    {o:125,h:127,l:120,c:121},
    {o:121,h:122,l:115,c:116},
    {o:116,h:118,l:112,c:113},
    {o:113,h:115,l:108,c:109},
    {o:109,h:112,l:106,c:108},
    {o:108,h:115,l:107,c:114},
    {o:114,h:121,l:113,c:120},
  ];

  const mid = (hi+lo)/2;
  const ote62 = hi - (hi-lo)*0.618;
  const ote79 = hi - (hi-lo)*0.786;

  return (
    <div>
      <div className="chart">
        <div className="chart-toolbar">
          <div className="chart-title">Premium / Discount Zones + OTE</div>
          <div className="pill b">MID: {mid.toFixed(1)}</div>
        </div>
        <ChartFrame data={data} height={340}>
          {({priceToY, indexToX, candleSlot, padding, width}) => {
            const slotW = candleSlot(data.length);
            const topY = priceToY(hi);
            const midY = priceToY(mid);
            const botY = priceToY(lo);
            const ote62Y = priceToY(ote62);
            const ote79Y = priceToY(ote79);
            return (
              <>
                {/* premium (upper half) */}
                <rect x={padding.l} y={topY} width={width-padding.l-padding.r} height={midY-topY}
                  fill={RED} opacity={0.06}/>
                {/* discount (lower half) */}
                <rect x={padding.l} y={midY} width={width-padding.l-padding.r} height={botY-midY}
                  fill={GREEN} opacity={0.06}/>
                {/* OTE zone */}
                <rect x={padding.l} y={ote62Y} width={width-padding.l-padding.r} height={ote79Y-ote62Y}
                  fill={BLUE} opacity={0.22}/>

                {/* lines */}
                {[
                  {y:topY, label:'1.00  HIGH', color:RED, val:hi},
                  {y:ote62Y, label:'0.618', color:BLUE, val:ote62},
                  {y:midY, label:'0.50  EQ', color:'#9DA7B3', val:mid},
                  {y:ote79Y, label:'0.786', color:BLUE, val:ote79},
                  {y:botY, label:'0.00  LOW', color:GREEN, val:lo},
                ].map((l,i) => (
                  <g key={i}>
                    <line x1={padding.l} x2={width-padding.r} y1={l.y} y2={l.y}
                      stroke={l.color} strokeDasharray={i===2?"":"3 3"} strokeWidth={1}/>
                    <text x={padding.l+4} y={l.y-4} fontSize="10" fontFamily="JetBrains Mono" fill={l.color}>{l.label}</text>
                    <text x={width-padding.r-6} y={l.y-4} fontSize="10" fontFamily="JetBrains Mono" fill={l.color} textAnchor="end">
                      {l.val.toFixed(1)}
                    </text>
                  </g>
                ))}

                <text x={width-padding.r-6} y={topY+18} fontSize="10" fontFamily="JetBrains Mono"
                  fill={RED} textAnchor="end" fontWeight="600">PREMIUM — ขาย</text>
                <text x={width-padding.r-6} y={botY-6} fontSize="10" fontFamily="JetBrains Mono"
                  fill={GREEN} textAnchor="end" fontWeight="600">DISCOUNT — ซื้อ</text>
                <text x={padding.l+4} y={(ote62Y+ote79Y)/2+4} fontSize="10" fontFamily="JetBrains Mono"
                  fill={BLUE} fontWeight="600">OTE ZONE</text>

                <Candles data={data} priceToY={priceToY} indexToX={indexToX} slotW={slotW}/>
              </>
            );
          }}
        </ChartFrame>
      </div>

      <div className="slider-wrap">
        <span style={{minWidth:90,color:'var(--text)'}}>Swing High</span>
        <input type="range" min="120" max="140" step="1" value={hi} onChange={e=>setHi(+e.target.value)}/>
        <span style={{minWidth:40,color:'var(--red)'}}>{hi}</span>
      </div>
      <div className="slider-wrap" style={{marginTop:8}}>
        <span style={{minWidth:90,color:'var(--text)'}}>Swing Low</span>
        <input type="range" min="90" max="110" step="1" value={lo} onChange={e=>setLo(+e.target.value)}/>
        <span style={{minWidth:40,color:'var(--green)'}}>{lo}</span>
      </div>
    </div>
  );
}

// =========================================================================
// LESSON 7: A+ Setup — step-by-step walkthrough
// =========================================================================
function APlusSetupChart() {
  const [step, setStep] = React.useState(0);
  const steps = [
    {title:'HTF เป็น Uptrend', desc:'โครงสร้างหลักเป็นขาขึ้น — HH/HL ชัดเจน'},
    {title:'เกิด Liquidity Sweep', desc:'ราคากวาด sellside liquidity ใต้ swing low'},
    {title:'เกิด CHoCH บน LTF', desc:'ราคาทะลุโครงสร้างเล็กขึ้น → สัญญาณกลับตัว'},
    {title:'ระบุ OB + FVG', desc:'Mark zone ที่จะเข้าไม้ — ตรงกับ discount zone'},
    {title:'เข้าไม้ที่ OB', desc:'SL ใต้ OB, TP ที่ buyside liquidity ด้านบน'},
    {title:'ราคาวิ่งถึงเป้า', desc:'Risk:Reward 1:5 ✓ เป้าสำเร็จ'},
  ];

  const data = [
    {o:100,h:103,l:99,c:102},
    {o:102,h:110,l:101,c:109},   // uptrend
    {o:109,h:118,l:108,c:117},
    {o:117,h:120,l:114,c:115},
    {o:115,h:116,l:108,c:109},
    {o:109,h:110,l:103,c:104},   // sweep sellside (low 103) — swing low was at 108
    {o:104,h:112,l:103,c:111},   // CHoCH up
    {o:111,h:113,l:108,c:110},   // pullback into OB
    {o:110,h:118,l:109,c:117},
    {o:117,h:122,l:116,c:121},
    {o:121,h:125,l:120,c:124},   // targets buyside
  ];

  return (
    <div>
      <div className="chart">
        <div className="chart-toolbar">
          <div className="chart-title">A+ Setup • Full Trade Walkthrough</div>
          <div className="pill g">STEP {step+1}/{steps.length}</div>
        </div>
        <ChartFrame data={data} height={340}>
          {({priceToY, indexToX, candleSlot, padding, width}) => {
            const slotW = candleSlot(data.length);
            return (
              <>
                {/* buyside liquidity */}
                <line x1={padding.l} x2={width-padding.r} y1={priceToY(120)} y2={priceToY(120)}
                  stroke={BLUE} strokeDasharray="3 3" opacity={step>=0?0.8:0}/>
                <text x={padding.l+4} y={priceToY(120)-4} fontSize="10"
                  fontFamily="JetBrains Mono" fill={BLUE}>BSL (TP)</text>

                {/* sellside liquidity */}
                <line x1={padding.l} x2={indexToX(6,data.length)} y1={priceToY(108)} y2={priceToY(108)}
                  stroke={YELLOW} strokeDasharray="3 3" opacity={step>=1?0.8:0}/>
                <text x={padding.l+4} y={priceToY(108)-4} fontSize="10"
                  fontFamily="JetBrains Mono" fill={YELLOW} opacity={step>=1?1:0}>SSL</text>

                {/* sweep marker */}
                {step>=1 && (
                  <g>
                    <circle cx={indexToX(5,data.length)} cy={priceToY(103)} r={6}
                      fill="none" stroke={PURPLE} strokeWidth={2}>
                      <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    <text x={indexToX(5,data.length)} y={priceToY(103)+22} fontSize="10"
                      fontFamily="JetBrains Mono" fontWeight="600" fill={PURPLE} textAnchor="middle">SWEEP</text>
                  </g>
                )}

                {/* CHoCH */}
                {step>=2 && (
                  <g>
                    <line x1={padding.l} x2={indexToX(6,data.length)} y1={priceToY(110)} y2={priceToY(110)}
                      stroke={GREEN} strokeDasharray="2 2" opacity={0.6}/>
                    <text x={indexToX(6,data.length)-4} y={priceToY(110)+12} fontSize="10"
                      fontFamily="JetBrains Mono" fill={GREEN} textAnchor="end">CHoCH ↑</text>
                  </g>
                )}

                {/* OB zone */}
                {step>=3 && (
                  <rect x={padding.l} y={priceToY(110)}
                    width={width-padding.l-padding.r} height={priceToY(108)-priceToY(110)}
                    fill={BLUE} opacity={0.2}/>
                )}

                {/* entry/SL/TP lines */}
                {step>=4 && (
                  <g>
                    <line x1={indexToX(7,data.length)} x2={width-padding.r}
                      y1={priceToY(110)} y2={priceToY(110)} stroke={GREEN} strokeWidth={1.5}/>
                    <text x={width-padding.r-6} y={priceToY(110)-4} fontSize="10"
                      fontFamily="JetBrains Mono" fill={GREEN} textAnchor="end" fontWeight="600">ENTRY 110</text>
                    <line x1={indexToX(7,data.length)} x2={width-padding.r}
                      y1={priceToY(107)} y2={priceToY(107)} stroke={RED} strokeWidth={1.5}/>
                    <text x={width-padding.r-6} y={priceToY(107)+12} fontSize="10"
                      fontFamily="JetBrains Mono" fill={RED} textAnchor="end" fontWeight="600">SL 107</text>
                    <line x1={indexToX(7,data.length)} x2={width-padding.r}
                      y1={priceToY(120)} y2={priceToY(120)} stroke={BLUE} strokeWidth={1.5}/>
                    <text x={width-padding.r-6} y={priceToY(120)-4} fontSize="10"
                      fontFamily="JetBrains Mono" fill={BLUE} textAnchor="end" fontWeight="600">TP 120</text>
                  </g>
                )}

                {/* final arrow */}
                {step>=5 && (
                  <path d={`M ${indexToX(7,data.length)} ${priceToY(110)}
                            L ${indexToX(10,data.length)} ${priceToY(120)}`}
                    stroke={GREEN} strokeWidth={2} fill="none" markerEnd="url(#arr-green)">
                    <animate attributeName="stroke-dasharray" from="0 100" to="100 0" dur="1s" fill="freeze"/>
                  </path>
                )}

                <defs>
                  <marker id="arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M0,0 L10,5 L0,10 Z" fill={GREEN}/>
                  </marker>
                </defs>

                <Candles data={data} priceToY={priceToY} indexToX={indexToX} slotW={slotW}/>
              </>
            );
          }}
        </ChartFrame>
      </div>

      <div className="steps">
        {steps.map((s,i) => (
          <div key={i} className={`step-dot ${step===i?'active':''}`} onClick={()=>setStep(i)}>
            <div className="num">{i+1}</div>
            <span>{s.title}</span>
          </div>
        ))}
      </div>
      <div style={{marginTop:14,padding:'14px 16px',background:'#10161f',border:'1px solid var(--border-2)',borderRadius:10}}>
        <div style={{fontSize:12,color:'var(--text-3)',fontFamily:'JetBrains Mono',marginBottom:4}}>
          STEP {step+1}
        </div>
        <div style={{fontSize:15,color:'var(--text)',marginBottom:4,fontWeight:500}}>{steps[step].title}</div>
        <div style={{fontSize:13,color:'var(--text-2)',lineHeight:1.6}}>{steps[step].desc}</div>
      </div>
    </div>
  );
}

// =========================================================================
// Practice charts — small static charts for practice section
// =========================================================================
function PracticeChart({ type, id }) {
  // different small datasets per type
  const sets = {
    bos: {
      data: [
        {o:100,h:102,l:99,c:101},{o:101,h:105,l:100,c:104},{o:104,h:108,l:103,c:107},
        {o:107,h:108,l:104,c:105},{o:105,h:107,l:103,c:104},{o:104,h:110,l:103,c:109},
        {o:109,h:114,l:108,c:113},{o:113,h:115,l:112,c:114},
      ],
      breakLevel:108, breakIdx:6, label:'BOS'
    },
    choch: {
      data: [
        {o:100,h:103,l:99,c:102},{o:102,h:108,l:101,c:107},{o:107,h:109,l:104,c:105},
        {o:105,h:112,l:104,c:111},{o:111,h:113,l:109,c:110},{o:110,h:111,l:104,c:105},
        {o:105,h:106,l:100,c:101},{o:101,h:102,l:97,c:98},
      ],
      breakLevel:105, breakIdx:6, label:'CHoCH'
    },
    ob: {
      data: [
        {o:100,h:102,l:99,c:101},{o:101,h:102,l:99,c:100},
        {o:100,h:101,l:98,c:99},
        {o:99,h:103,l:98,c:102},{o:102,h:108,l:101,c:107},{o:107,h:112,l:106,c:111},
        {o:111,h:113,l:110,c:112},{o:112,h:114,l:111,c:113},
      ],
      ob: 2, label:'OB'
    },
    fvg: {
      data: [
        {o:100,h:102,l:99,c:101},{o:101,h:104,l:100,c:103},
        {o:103,h:113,l:103,c:112},
        {o:112,h:114,l:108,c:113},{o:113,h:115,l:112,c:114},{o:114,h:115,l:113,c:114},
        {o:114,h:116,l:112,c:115},{o:115,h:118,l:114,c:117},
      ],
      fvgTop:108, fvgBot:104, label:'FVG'
    },
  };
  const s = sets[type];

  return (
    <div className="chart">
      <div className="chart-toolbar">
        <div className="chart-title">Chart #{id}</div>
      </div>
      <ChartFrame data={s.data} height={160} padding={{t:12,r:28,b:12,l:8}}>
        {({priceToY, indexToX, candleSlot, padding, width}) => {
          const slotW = candleSlot(s.data.length);
          return (
            <>
              {type==='bos'||type==='choch' ? (
                <line x1={padding.l} x2={width-padding.r} y1={priceToY(s.breakLevel)} y2={priceToY(s.breakLevel)}
                  stroke={type==='bos'?GREEN:RED} strokeDasharray="3 3" opacity={0.7}/>
              ) : null}
              {type==='ob' && (
                <rect x={padding.l} y={priceToY(s.data[s.ob].h)}
                  width={width-padding.l-padding.r}
                  height={priceToY(s.data[s.ob].l)-priceToY(s.data[s.ob].h)}
                  fill={BLUE} opacity={0.18}/>
              )}
              {type==='fvg' && (
                <rect x={padding.l} y={priceToY(s.fvgTop)}
                  width={width-padding.l-padding.r}
                  height={priceToY(s.fvgBot)-priceToY(s.fvgTop)}
                  fill={GREEN} opacity={0.15}/>
              )}
              <Candles data={s.data} priceToY={priceToY} indexToX={indexToX} slotW={slotW}/>
            </>
          );
        }}
      </ChartFrame>
    </div>
  );
}

// ---- Hero mini-chart (static decorative) ----
function HeroChart() {
  const data = [
    {o:100,h:103,l:99,c:101},{o:101,h:107,l:100,c:106},{o:106,h:110,l:104,c:105},
    {o:105,h:107,l:101,c:102},{o:102,h:106,l:101,c:105},{o:105,h:115,l:104,c:114},
    {o:114,h:118,l:112,c:113},{o:113,h:115,l:108,c:109},{o:109,h:113,l:108,c:112},
    {o:112,h:122,l:111,c:121},{o:121,h:124,l:119,c:120},{o:120,h:121,l:116,c:117},
    {o:117,h:118,l:113,c:114},{o:114,h:119,l:113,c:118},{o:118,h:126,l:117,c:125},
  ];
  return (
    <ChartFrame data={data} height={280}>
      {({priceToY, indexToX, candleSlot, padding, width}) => {
        const slotW = candleSlot(data.length);
        return (
          <>
            {/* OB */}
            <rect x={padding.l} y={priceToY(107)} width={width-padding.l-padding.r} height={priceToY(104)-priceToY(107)} fill={BLUE} opacity={0.15}/>
            <text x={width-padding.r-6} y={priceToY(107)-4} fontSize="10" fontFamily="JetBrains Mono" fill={BLUE} textAnchor="end">ORDER BLOCK</text>
            {/* BSL */}
            <line x1={padding.l} x2={width-padding.r} y1={priceToY(122)} y2={priceToY(122)} stroke={YELLOW} strokeDasharray="3 3" opacity={0.6}/>
            <text x={padding.l+4} y={priceToY(122)-4} fontSize="10" fontFamily="JetBrains Mono" fill={YELLOW}>BUYSIDE LIQ</text>
            {/* BOS */}
            <line x1={padding.l} x2={width-padding.r} y1={priceToY(110)} y2={priceToY(110)} stroke={GREEN} strokeDasharray="3 3" opacity={0.5}/>
            <text x={padding.l+4} y={priceToY(110)-4} fontSize="10" fontFamily="JetBrains Mono" fill={GREEN}>PREV HIGH</text>
            <text x={indexToX(9,data.length)+6} y={priceToY(121)+4} fontSize="11" fontFamily="JetBrains Mono" fill={GREEN} fontWeight="600">BOS ↑</text>
            <Candles data={data} priceToY={priceToY} indexToX={indexToX} slotW={slotW}/>
          </>
        );
      }}
    </ChartFrame>
  );
}

Object.assign(window, {
  MarketStructureChart, BOSvsCHoCHChart, LiquidityChart,
  OrderBlockChart, FVGChart, PremiumDiscountChart, APlusSetupChart,
  PracticeChart, HeroChart,
});
