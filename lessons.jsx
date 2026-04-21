// Lesson content components — text, quizzes, tables, checklists

function Quiz({ question, options, correct, explain }) {
  const [picked, setPicked] = React.useState(null);
  return (
    <div className="quiz">
      <div className="quiz-q">❓ {question}</div>
      <div className="quiz-opts">
        {options.map((o,i) => {
          const letters = ['A','B','C','D'];
          const isCorrect = picked!==null && i===correct;
          const isWrong = picked===i && i!==correct;
          return (
            <button key={i}
              className={`opt ${isCorrect?'correct':''} ${isWrong?'wrong':''}`}
              disabled={picked!==null}
              onClick={()=>setPicked(i)}>
              <span className="letter">{letters[i]}</span>
              <span>{o}</span>
            </button>
          );
        })}
      </div>
      {picked!==null && (
        <div className={`quiz-fb ${picked===correct?'ok':'no'}`}>
          {picked===correct ? '✓ ถูกต้อง! ' : '✗ ยังไม่ใช่ — '}{explain}
        </div>
      )}
    </div>
  );
}

// ---- Lesson 1: Market Structure ----
function Lesson1() {
  return (
    <>
      <div className="grid-2">
        <div className="card">
          <h3>โครงสร้างขาขึ้น (Uptrend)</h3>
          <p>ราคาทำ <span className="pill g">HH</span> (Higher High) และ <span className="pill g">HL</span> (Higher Low) สลับกันไปเรื่อยๆ — จุดสูงและจุดต่ำยกตัวสูงขึ้นเรื่อยๆ</p>
        </div>
        <div className="card">
          <h3>โครงสร้างขาลง (Downtrend)</h3>
          <p>ราคาทำ <span className="pill r">LH</span> (Lower High) และ <span className="pill r">LL</span> (Lower Low) — จุดสูงและจุดต่ำต่ำลงเรื่อยๆ</p>
        </div>
      </div>

      <MarketStructureChart/>

      <Quiz
        question="จากกราฟด้านบน ราคาอยู่ในโครงสร้างแบบใด (ดูสองส่วน — ช่วงแรกและช่วงหลัง)"
        options={[
          'Uptrend ตลอด — ราคาขึ้นต่อเนื่อง',
          'Uptrend ก่อน แล้วกลับเป็น Downtrend',
          'Range ไม่มีทิศทาง',
          'Downtrend ก่อน แล้วกลับเป็น Uptrend',
        ]}
        correct={1}
        explain="ช่วงแรกทำ HH/HL = uptrend จากนั้นเมื่อเกิด LH/LL = โครงสร้างกลับเป็น downtrend"
      />
    </>
  );
}

// ---- Lesson 2: BOS vs CHoCH ----
function Lesson2() {
  return (
    <>
      <div className="card">
        <h3>สองเหตุการณ์ที่เกิดเมื่อราคาทะลุโครงสร้าง</h3>
        <p>ไม่ใช่ทุกการ "ทะลุ" จะหมายความเหมือนกัน — BOS บอกว่าเทรนด์เดิมแข็งแรง ส่วน CHoCH เตือนว่าเทรนด์กำลังจะเปลี่ยน</p>
      </div>

      <BOSvsCHoCHChart/>

      <div className="card" style={{marginTop:20}}>
        <table className="cmp-table">
          <thead><tr><th>หัวข้อ</th><th style={{color:'var(--green)'}}>BOS</th><th style={{color:'var(--red)'}}>CHoCH</th></tr></thead>
          <tbody>
            <tr><td>ชื่อเต็ม</td><td>Break of Structure</td><td>Change of Character</td></tr>
            <tr><td>ความหมาย</td><td>เทรนด์เดิม<b>ไปต่อ</b></td><td>เทรนด์เดิม<b>จบ</b></td></tr>
            <tr><td>เกิดเมื่อ</td><td>ทะลุ swing high/low ตามทิศเทรนด์</td><td>ทะลุ swing ล่าสุดสวนทิศเทรนด์</td></tr>
            <tr><td>สัญญาณ</td><td>Continuation</td><td>Reversal</td></tr>
            <tr><td>กลยุทธ์</td><td>เข้าไม้ตามเทรนด์</td><td>รอยืนยันเทรนด์ใหม่ก่อนเข้า</td></tr>
          </tbody>
        </table>
      </div>

      <Quiz
        question="ถ้าอยู่ใน Downtrend แล้วราคาทะลุ Lower High ล่าสุดขึ้นไป เรียกว่าอะไร?"
        options={['BOS ขาลง', 'CHoCH', 'Liquidity Sweep', 'FVG']}
        correct={1}
        explain="Downtrend ทะลุ LH ขึ้น = ทะลุสวนทิศเทรนด์ = CHoCH สัญญาณกลับตัว"
      />
    </>
  );
}

// ---- Lesson 3: Liquidity ----
function Lesson3() {
  return (
    <>
      <div className="grid-2">
        <div className="card">
          <h3>💧 Liquidity คืออะไร</h3>
          <p>คือ "แอ่งของ stop loss" ที่เทรดเดอร์รายย่อยวางไว้ — smart money ต้องการราคาไปแตะจุดเหล่านั้นเพื่อให้มี order ให้พวกเขาเข้าไม้ใหญ่ๆ</p>
        </div>
        <div className="card">
          <h3>🎯 Buyside vs Sellside</h3>
          <p><span className="pill b">Buyside</span> อยู่เหนือ swing high (SL ของคน short)<br/>
          <span className="pill y">Sellside</span> อยู่ใต้ swing low (SL ของคน long)</p>
        </div>
      </div>

      <LiquidityChart/>

      <div className="card" style={{marginTop:20}}>
        <table className="cmp-table">
          <thead><tr><th>ประเภท</th><th>ตำแหน่ง</th><th>ใครตาย</th></tr></thead>
          <tbody>
            <tr><td>Buyside Liquidity</td><td>เหนือ swing high / equal highs</td><td>Short seller (SL โดนกวาด)</td></tr>
            <tr><td>Sellside Liquidity</td><td>ใต้ swing low / equal lows</td><td>Long buyer (SL โดนกวาด)</td></tr>
            <tr><td>Trendline Liquidity</td><td>ตามแนวเส้น trendline</td><td>คนเข้าไม้ที่ trendline</td></tr>
            <tr><td>Equal Highs/Lows</td><td>จุดที่มี high/low เท่ากัน</td><td>คนใช้แนวรับ-แนวต้านแบบ flat</td></tr>
          </tbody>
        </table>
      </div>

      <Quiz
        question="ทำไม smart money ถึง 'กวาด' liquidity บ่อยๆ?"
        options={[
          'เพื่อสร้างความสับสนให้รายย่อย',
          'เพราะต้องการ order ปริมาณมากเพื่อเข้าไม้ใหญ่',
          'เพราะ broker บังคับ',
          'ไม่มีเหตุผล',
        ]}
        correct={1}
        explain="เมื่อ SL โดนกวาด จะเกิด sell market order (หรือ buy) จำนวนมาก → smart money ใช้ liquidity นั้นเข้าไม้สวนทาง"
      />
    </>
  );
}

// ---- Lesson 4: Order Block ----
function Lesson4() {
  return (
    <>
      <div className="card">
        <h3>Order Block (OB) คืออะไร</h3>
        <p>แท่งเทียน<b> ตัวสุดท้ายก่อนราคาจะวิ่งแรง</b>ไปทะลุโครงสร้าง — สะท้อนว่ามี institutional order อยู่ตรงนั้น ราคามักจะกลับมาทดสอบก่อนไปต่อ</p>
      </div>

      <OrderBlockChart/>

      <div className="checklist">
        <div className="check-row good"><span className="ico">✓</span><span><b>OB คุณภาพดี</b> — อยู่ตรงกับ HTF structure, ทำให้เกิด BOS ชัดเจน, ยังไม่เคยถูก mitigate</span></div>
        <div className="check-row good"><span className="ico">✓</span><span>มี FVG อยู่ใกล้ๆ (confluence เพิ่ม)</span></div>
        <div className="check-row good"><span className="ico">✓</span><span>อยู่ใน discount zone (fib 50-78.6%)</span></div>
        <div className="check-row bad"><span className="ico">✗</span><span><b>OB คุณภาพแย่</b> — ถูกทดสอบหลายครั้งแล้ว</span></div>
        <div className="check-row bad"><span className="ico">✗</span><span>อยู่ใน premium zone ตอนจะเปิด long</span></div>
        <div className="check-row bad"><span className="ico">✗</span><span>BOS ที่เกิดจาก OB นั้นอ่อนแอ (candle เล็ก)</span></div>
      </div>

      <Quiz
        question="OB ขาขึ้น (Bullish OB) คือแท่งเทียนสีอะไร?"
        options={[
          'แท่งเขียวตัวสุดท้ายก่อนราคาพุ่งขึ้น',
          'แท่งแดงตัวสุดท้ายก่อนราคาพุ่งขึ้น',
          'แท่งเขียวตัวใหญ่ที่สุด',
          'แท่งไหนก็ได้ที่มีไส้ยาว',
        ]}
        correct={1}
        explain="Bullish OB = แท่งแดงตัวสุดท้ายก่อนการวิ่งขึ้นแรง (inverse ของทิศทางที่ราคาจะไป)"
      />
    </>
  );
}

// ---- Lesson 5: FVG ----
function Lesson5() {
  return (
    <>
      <div className="card">
        <h3>Fair Value Gap (FVG) / Imbalance</h3>
        <p>"ช่องว่างราคา" ที่เกิดจากราคาวิ่งแรงเร็วเกินไป — ตลาดถือว่าราคาช่วงนั้น "ยังไม่ยุติธรรม" และมักจะกลับมาเติมช่องว่างนั้น</p>
      </div>

      <FVGChart/>

      <div className="grid-2" style={{marginTop:20}}>
        <div className="card">
          <h3>วิธีหา FVG (3-candle rule)</h3>
          <p style={{fontFamily:'JetBrains Mono',fontSize:13,color:'var(--text-2)'}}>
            <b style={{color:'var(--green)'}}>Bullish:</b> candle1.high &lt; candle3.low<br/>
            <b style={{color:'var(--red)'}}>Bearish:</b> candle1.low &gt; candle3.high<br/>
            <span style={{color:'var(--text-3)'}}>→ ช่องว่างระหว่างนั้นคือ FVG</span>
          </p>
        </div>
        <div className="card">
          <h3>ทำไมต้องเติม?</h3>
          <p>ราคาที่วิ่งแรงทิ้ง order ไว้ไม่ครบ — เมื่อราคากลับมาเติม จะ trigger order ที่ค้างอยู่ แล้วถึงจะไปต่อได้ด้วยแรงเต็ม</p>
        </div>
      </div>

      <Quiz
        question="FVG มักถูกใช้เป็นอะไรในการเทรด?"
        options={[
          'จุด breakout',
          'Target profit เท่านั้น',
          'Entry zone — รอราคากลับมาเติมแล้วเข้าไม้',
          'สัญญาณปิดไม้',
        ]}
        correct={2}
        explain="FVG เป็น entry zone ยอดนิยม — รอราคา retrace กลับมาเติมช่องว่าง แล้วเข้าไม้ตามทิศทางเดิม"
      />
    </>
  );
}

// ---- Lesson 6: Premium & Discount ----
function Lesson6() {
  return (
    <>
      <div className="grid-2">
        <div className="card">
          <h3><span className="pill r">PREMIUM</span> — ครึ่งบน</h3>
          <p>เมื่อราคาอยู่เหนือ 50% ของ swing range — ถือว่า "แพง" ไม่เหมาะเปิด long ควรรอ short หรือขาย</p>
        </div>
        <div className="card">
          <h3><span className="pill g">DISCOUNT</span> — ครึ่งล่าง</h3>
          <p>เมื่อราคาอยู่ใต้ 50% — ถือว่า "ถูก" เหมาะเปิด long เพื่อรอให้ราคากลับไปหาด้านบน</p>
        </div>
      </div>

      <PremiumDiscountChart/>

      <div className="card" style={{marginTop:20}}>
        <h3>🎯 OTE Zone (Optimal Trade Entry)</h3>
        <p>โซนพิเศษระหว่าง <span className="pill b">Fib 61.8% — 78.6%</span> เป็นจุดเข้าไม้ที่ smart money ใช้บ่อยที่สุด
        — ลึกเข้าไปใน discount พอให้ RR ดี แต่ก็ใกล้ structure พอให้ SL แคบ</p>
      </div>

      <Quiz
        question="ถ้าคุณต้องการเปิด long ตาม uptrend ควรหาจุดเข้าที่ไหน?"
        options={[
          'ที่ Premium zone เพื่อตามแรงขึ้น',
          'ที่ Discount zone (ต่ำกว่า 50% ของ swing)',
          'ที่ swing high พอดี',
          'ซื้อตรงไหนก็ได้ในเทรนด์',
        ]}
        correct={1}
        explain="เปิด long ใน discount zone → ราคาถูก + SL ใกล้ swing low + RR สูง เป็นหลักการหลักของ SMC"
      />
    </>
  );
}

// ---- Lesson 7: A+ Setup ----
function Lesson7() {
  return (
    <>
      <div className="card">
        <h3>รวมทุกอย่างที่เรียนมา</h3>
        <p>A+ Setup คือการหาจุดที่มีสัญญาณยืนยันจาก SMC หลายอย่างมารวมกัน (confluence) — ยิ่งมีหลายเงื่อนไข ยิ่งมั่นใจ</p>
      </div>

      <APlusSetupChart/>

      <div className="card" style={{marginTop:20}}>
        <h3>✅ Checklist 7 ข้อก่อนเข้าไม้</h3>
        <div className="checklist">
          {[
            'HTF (1H/4H) โครงสร้างชัดเจน — uptrend หรือ downtrend',
            'เกิด liquidity sweep ล่าสุด (กวาด stop loss)',
            'เกิด CHoCH บน LTF (M15/M5) ยืนยันกลับตัว',
            'ระบุ Order Block + FVG ได้ในทิศทางเดียวกัน',
            'จุดเข้าอยู่ใน Discount zone (ถ้า long) / Premium (ถ้า short)',
            'SL อยู่ที่จุดที่ structure จะแตกจริงๆ — ไม่ใกล้เกินไป',
            'Risk:Reward อย่างน้อย 1:3 ขึ้นไป',
          ].map((t,i)=>(
            <div key={i} className="check-row good"><span className="ico">{i+1}</span><span>{t}</span></div>
          ))}
        </div>
      </div>

      <div className="card" style={{marginTop:20}}>
        <h3>📐 ตัวอย่าง Risk:Reward</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginTop:12,fontFamily:'JetBrains Mono'}}>
          <div style={{padding:'14px',background:'#10161f',borderRadius:10,border:'1px solid var(--border-2)'}}>
            <div style={{fontSize:11,color:'var(--text-3)',marginBottom:4}}>ENTRY</div>
            <div style={{fontSize:22,color:'var(--green)'}}>110.0</div>
          </div>
          <div style={{padding:'14px',background:'#10161f',borderRadius:10,border:'1px solid var(--border-2)'}}>
            <div style={{fontSize:11,color:'var(--text-3)',marginBottom:4}}>SL</div>
            <div style={{fontSize:22,color:'var(--red)'}}>107.0</div>
          </div>
          <div style={{padding:'14px',background:'#10161f',borderRadius:10,border:'1px solid var(--border-2)'}}>
            <div style={{fontSize:11,color:'var(--text-3)',marginBottom:4}}>TP</div>
            <div style={{fontSize:22,color:'var(--blue)'}}>125.0</div>
          </div>
        </div>
        <div style={{marginTop:14,padding:'12px 14px',background:'rgba(38,166,154,.08)',borderRadius:8,fontFamily:'JetBrains Mono',fontSize:13,color:'var(--green)'}}>
          Risk = 3.0 • Reward = 15.0 • <b>R:R = 1:5</b>
        </div>
      </div>

      <Quiz
        question="จากหลัก SMC สิ่งที่ 'ไม่ควร' ทำคือข้อใด?"
        options={[
          'รอ confluence หลายอย่างก่อนเข้าไม้',
          'เข้า long ใน premium zone ของ uptrend',
          'วาง SL ใต้ OB ที่เข้าไม้',
          'รอ CHoCH ยืนยันก่อนเปิดสวนเทรนด์',
        ]}
        correct={1}
        explain="Premium zone = แพง ไม่เหมาะเปิด long ทุกกรณี — ควรรอราคา pullback เข้า discount ก่อน"
      />
    </>
  );
}

// ---- Practice Section ----
function PracticeSection() {
  const items = [
    {id:1,type:'bos',q:'ที่เกิดในกราฟนี้คือ?',opts:['BOS','CHoCH','FVG','OB'],ans:0,exp:'ราคาทะลุ previous high ตามทิศ uptrend = BOS'},
    {id:2,type:'choch',q:'ที่เกิดในกราฟนี้คือ?',opts:['BOS','CHoCH','Sweep','Range'],ans:1,exp:'ราคา uptrend กลับมาทะลุ HL ลงล่าง = CHoCH'},
    {id:3,type:'ob',q:'กล่องสีฟ้าคือ?',opts:['FVG','Order Block','Liquidity','Premium Zone'],ans:1,exp:'แท่งแดงสุดท้ายก่อนวิ่งขึ้น = Bullish OB'},
    {id:4,type:'fvg',q:'กล่องสีเขียวคือ?',opts:['OB','CHoCH','FVG','BSL'],ans:2,exp:'ช่องว่างระหว่าง candle1.high กับ candle3.low = Bullish FVG'},
    {id:5,type:'bos',q:'ที่เกิดในกราฟนี้คือ?',opts:['CHoCH','Range','BOS','Sweep'],ans:2,exp:'ราคาทะลุ previous high ต่อเนื่องใน uptrend = BOS'},
    {id:6,type:'ob',q:'กล่องสีฟ้าคือ?',opts:['Order Block','FVG','Sellside Liq','BOS'],ans:0,exp:'แท่งแดงก่อน impulse ขึ้น = Bullish OB'},
  ];
  const [answers, setAnswers] = React.useState({});

  return (
    <div className="prac-grid">
      {items.map(it => {
        const pick = answers[it.id];
        const answered = pick !== undefined;
        return (
          <div key={it.id} className="prac-card">
            <PracticeChart type={it.type} id={it.id}/>
            <div className="prac-q">{it.q}</div>
            <div className="prac-opts">
              {it.opts.map((o,i) => {
                const cls = answered
                  ? (i===it.ans ? 'sel correct' : (i===pick ? 'sel wrong' : (i===it.ans?'show-ans':'')))
                  : '';
                return (
                  <button key={i} className={`prac-opt ${cls}`}
                    disabled={answered}
                    onClick={()=>setAnswers(a=>({...a,[it.id]:i}))}>
                    {o}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div style={{marginTop:10,fontSize:12,color:pick===it.ans?'var(--green)':'var(--red)',lineHeight:1.5,fontFamily:'IBM Plex Sans Thai'}}>
                {pick===it.ans?'✓ ถูกต้อง ':'✗ ยังไม่ใช่ '}
                <span style={{color:'var(--text-2)'}}>— {it.exp}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, {
  Quiz, Lesson1, Lesson2, Lesson3, Lesson4, Lesson5, Lesson6, Lesson7,
  PracticeSection,
});
