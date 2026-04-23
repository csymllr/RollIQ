// hifi-retro-screens.jsx — retro thin vertical: Live, Analytics, Session Start, Arsenal, Ball Detail
// Pairs with hifi-retro.jsx (Pulse). All screens support retro-dark + retro-light via data-theme.

function RScore({ b1, b2, sc, running, isTenth, b3 }) {
  const isStrike = b1 === 'X';
  const isSpare = b2 === '/';
  return (
    <div style={{
      padding: '6px 4px 8px',
      background: isStrike ? 'rgba(0,224,255,0.06)' : isSpare ? 'rgba(255,46,110,0.05)' : 'transparent',
      borderRight: '1px solid var(--line-soft)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2, minHeight: 14 }}>
        <span className="marquee text-glow-cyan" style={{ fontSize: 10, minWidth: 10, textAlign: 'center' }}>{b1}</span>
        <span className="marquee text-glow-cyan" style={{ fontSize: 10, minWidth: 10, textAlign: 'center' }}>{b2}</span>
        {isTenth && <span className="marquee text-glow-pink" style={{ fontSize: 10, minWidth: 10, textAlign: 'center' }}>{b3}</span>}
      </div>
      <div className="num" style={{ fontSize: 16, color: 'var(--text-0)', textAlign: 'center', marginTop: 2 }}>{sc}</div>
    </div>
  );
}

// ═══════════════════════════════════════════
// RETRO · LIVE GAME · DESKTOP
// ═══════════════════════════════════════════
function Retro_Live_D({ theme = 'retro-dark' }) {
  return (
    <div className="theme-root retro" data-theme={theme}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* top bar */}
        <div className="between" style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--bg-0)',
        }}>
          <div className="row" style={{ alignItems: 'center', gap: 16 }}>
            <span className="marquee text-glow-pink" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--accent)', boxShadow: 'var(--neon-glow-pink)' }}/>
              LIVE
            </span>
            <span className="script" style={{ fontSize: 22, color: 'var(--text-0)' }}>Thursday Doubles</span>
            <span className="chip">LANE 14</span>
            <span className="chip">HOUSE · 40FT</span>
          </div>
          <div className="row" style={{ alignItems: 'center', gap: 10 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>G2 OF 3</span>
            <button className="btn ghost">PAUSE</button>
            <button className="btn primary">END GAME</button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 360px', overflow: 'hidden' }}>
          {/* main scoresheet */}
          <div style={{ padding: 24, overflow: 'auto' }} className="no-scrollbar">
            {/* series totals */}
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <div className="between" style={{ marginBottom: 12 }}>
                <span className="marquee text-glow-cyan" style={{ fontSize: 11 }}>━━ SERIES ━━</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>RUNNING</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) 1.2fr', gap: 12 }}>
                {[
                  { g: 'G1', sc: 202, done: true },
                  { g: 'G2', sc: 142, done: false, live: true },
                  { g: 'G3', sc: '—', done: false },
                ].map((g, i) => (
                  <div key={i} style={{
                    padding: '14px 16px',
                    border: '1px solid ' + (g.live ? 'var(--accent)' : 'var(--line)'),
                    borderRadius: 4,
                    background: g.live ? 'rgba(255,46,110,0.08)' : 'var(--bg-1)',
                    boxShadow: g.live ? 'inset 0 0 12px rgba(255,46,110,0.15)' : 'none',
                  }}>
                    <div className="marquee" style={{ fontSize: 10, color: g.live ? 'var(--accent)' : 'var(--text-3)' }}>{g.g}</div>
                    <div className="num" style={{
                      fontSize: 32, color: 'var(--text-0)', marginTop: 2,
                      textShadow: g.live ? 'var(--neon-glow-pink)' : g.done ? 'var(--neon-glow-cyan)' : 'none',
                    }}>{g.sc}</div>
                  </div>
                ))}
                <div style={{
                  padding: '14px 16px',
                  border: '1px solid var(--accent-2)',
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, rgba(0,224,255,0.10), rgba(255,46,110,0.06))',
                }}>
                  <div className="marquee text-glow-cyan" style={{ fontSize: 10 }}>SERIES</div>
                  <div className="num text-glow-cyan" style={{ fontSize: 32, marginTop: 2 }}>344</div>
                </div>
              </div>
            </div>

            {/* live scoresheet */}
            <div className="card scanlines" style={{
              padding: 20, borderColor: 'var(--accent-line)',
              background: 'linear-gradient(135deg, var(--bg-1), #261538)',
            }}>
              <div className="marquee text-glow-pink" style={{ fontSize: 11, marginBottom: 12 }}>
                ━━ GAME 2 · FRAME 7 ━━
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)',
                border: '1px solid var(--accent-line)', borderRadius: 4,
                overflow: 'hidden',
              }}>
                <RScore b1="X" b2="" sc={30}/>
                <RScore b1="9" b2="/" sc={49}/>
                <RScore b1="X" b2="" sc={78}/>
                <RScore b1="8" b2="1" sc={87}/>
                <RScore b1="X" b2="" sc={117}/>
                <RScore b1="X" b2="" sc={142}/>
                {/* current frame */}
                <div style={{
                  padding: '6px 4px 8px',
                  background: 'rgba(255,46,110,0.15)',
                  border: '2px solid var(--accent)',
                  boxShadow: 'inset 0 0 16px rgba(255,46,110,0.25)',
                  animation: 'pulse 2s ease-in-out infinite',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2, minHeight: 14 }}>
                    <span className="marquee text-glow-cyan" style={{ fontSize: 10, minWidth: 10, textAlign: 'center' }}>9</span>
                    <span className="marquee text-glow-pink" style={{ fontSize: 10, minWidth: 10, textAlign: 'center' }}>_</span>
                  </div>
                  <div className="num text-glow-pink" style={{ fontSize: 16, textAlign: 'center', marginTop: 2 }}>—</div>
                </div>
                {[8, 9, 10].map(n => (
                  <div key={n} style={{ padding: '6px 4px 8px', borderRight: n === 10 ? 'none' : '1px solid var(--line-soft)' }}>
                    <div style={{ minHeight: 14 }}/>
                    <div className="num" style={{ fontSize: 16, color: 'var(--text-3)', textAlign: 'center' }}>—</div>
                  </div>
                ))}
              </div>

              {/* pin deck */}
              <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <div className="marquee text-glow-cyan" style={{ fontSize: 10, marginBottom: 12 }}>
                    ON THE DECK · 2ND BALL
                  </div>
                  <PinDeck leftPins={[10]}/>
                  <div className="mono uppercase tracked" style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 12, textAlign: 'center' }}>
                    10-PIN · YOUR LEAK · TAP TO TRACK
                  </div>
                </div>
                <div>
                  <div className="marquee text-glow-pink" style={{ fontSize: 10, marginBottom: 12 }}>
                    CAPTURE
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      ['FOOT BOARD', '22', 'cyan'],
                      ['TARGET', '10', 'cyan'],
                      ['BALL SPEED', '17.2', 'pink'],
                      ['ANGLE ADJ', '+1R', 'pink'],
                    ].map(([lab, v, c]) => (
                      <div key={lab} className="card" style={{ padding: 10 }}>
                        <div className="mono uppercase tracked" style={{ fontSize: 9, color: 'var(--text-3)' }}>{lab}</div>
                        <div className={'num ' + (c === 'cyan' ? 'text-glow-cyan' : 'text-glow-pink')} style={{ fontSize: 20, marginTop: 2 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <textarea placeholder="Frame note..." style={{
                    width: '100%', marginTop: 10, padding: 10,
                    background: 'var(--bg-1)', border: '1px solid var(--line)',
                    borderRadius: 4, color: 'var(--text-1)',
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                    resize: 'none', height: 48,
                  }}/>
                </div>
              </div>
            </div>

            {/* bottom actions */}
            <div className="row" style={{ marginTop: 16, justifyContent: 'center' }}>
              <button className="btn ghost" style={{ padding: '14px 24px' }}>↶ UNDO LAST</button>
              <button className="btn primary" style={{ padding: '14px 32px', fontSize: 13 }}>STRIKE ✗</button>
              <button className="btn primary" style={{ padding: '14px 24px', background: 'var(--accent-2)', borderColor: 'var(--accent-2)', boxShadow: 'var(--neon-glow-cyan)', color: '#0B0012' }}>SPARE /</button>
              <button className="btn ghost" style={{ padding: '14px 24px' }}>KEYPAD</button>
            </div>
          </div>

          {/* right rail */}
          <aside style={{
            borderLeft: '1px solid var(--line)',
            background: 'var(--bg-0)',
            padding: 20, overflow: 'auto',
          }} className="no-scrollbar">
            {/* ball */}
            <div className="marquee text-glow-pink" style={{ fontSize: 10, marginBottom: 10 }}>IN HAND</div>
            <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #FF2E6E, #FF2E6E33 70%)',
                border: '1px solid #FF2E6E',
                boxShadow: '0 0 12px #FF2E6E66',
                flexShrink: 0,
              }}/>
              <div style={{ flex: 1 }}>
                <div className="script" style={{ fontSize: 16, color: 'var(--text-0)' }}>Phaze II</div>
                <div className="mono uppercase tracked" style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>BENCHMARK · 15 LB</div>
              </div>
              <button className="btn ghost" style={{ padding: '6px 10px', fontSize: 10 }}>SWAP</button>
            </div>

            {/* AI coach card */}
            <div className="card" style={{
              padding: 16, marginBottom: 16,
              background: 'linear-gradient(180deg, rgba(255,46,110,0.12), transparent)',
              borderColor: 'var(--accent-line)',
            }}>
              <div className="between" style={{ marginBottom: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="text-glow-pink">✦</span>
                  <span className="marquee text-glow-pink" style={{ fontSize: 10 }}>COACH · LIVE</span>
                </span>
                <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)' }}>0:14 AGO</span>
              </div>
              <div className="script" style={{ fontSize: 15, color: 'var(--text-0)', lineHeight: 1.35 }}>
                Second 10-pin this game. Try a flatter angle — stand 2 boards right.
              </div>
              <div className="row" style={{ marginTop: 10, gap: 6 }}>
                <button className="btn primary" style={{ padding: '8px 12px', fontSize: 10 }}>GOT IT</button>
                <button className="btn ghost" style={{ padding: '8px 12px', fontSize: 10 }}>ASK</button>
              </div>
            </div>

            {/* frame-by-frame leaks */}
            <div className="marquee text-glow-cyan" style={{ fontSize: 10, marginBottom: 10 }}>THIS GAME</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                ['Strikes', '4/6', 'cyan'],
                ['Spares',  '2/2', 'cyan'],
                ['Opens',   '1',   'pink'],
                ['10-pins', '2',   'pink'],
              ].map(([k, v, c]) => (
                <div key={k} className="between" style={{ padding: '8px 0', borderBottom: '1px solid var(--line-soft)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-1)' }}>{k}</span>
                  <span className={'num ' + (c === 'cyan' ? 'text-glow-cyan' : 'text-glow-pink')} style={{ fontSize: 16 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* projection */}
            <div className="card" style={{ padding: 14, marginTop: 18, textAlign: 'center' }}>
              <div className="marquee text-glow-pink" style={{ fontSize: 10, marginBottom: 8 }}>PROJECTED</div>
              <div className="num text-glow-cyan" style={{ fontSize: 40 }}>218</div>
              <div className="mono uppercase tracked" style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 4 }}>
                IF YOU CLOSE EVERY FRAME
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { box-shadow: inset 0 0 16px rgba(255,46,110,0.25); } 50% { box-shadow: inset 0 0 24px rgba(255,46,110,0.45); } }`}</style>
    </div>
  );
}

// Pin deck SVG
function PinDeck({ leftPins = [] }) {
  // standing pins: 1..10; leftPins are the ones STILL STANDING
  const positions = [
    { n: 7, x: 20, y: 20 }, { n: 8, x: 50, y: 20 }, { n: 9, x: 80, y: 20 }, { n: 10, x: 110, y: 20 },
    { n: 4, x: 35, y: 50 }, { n: 5, x: 65, y: 50 }, { n: 6, x: 95, y: 50 },
    { n: 2, x: 50, y: 80 }, { n: 3, x: 80, y: 80 },
    { n: 1, x: 65, y: 110 },
  ];
  return (
    <svg viewBox="0 0 130 130" width="100%" style={{ maxHeight: 160, display: 'block' }}>
      {positions.map(p => {
        const standing = leftPins.includes(p.n);
        return (
          <g key={p.n}>
            <circle cx={p.x} cy={p.y} r={10}
              fill={standing ? 'rgba(255,255,255,0.92)' : 'transparent'}
              stroke={standing ? '#FF2E6E' : 'rgba(110,95,117,0.4)'}
              strokeWidth={standing ? 1.5 : 1}
              strokeDasharray={standing ? 'none' : '2 2'}
              style={standing ? { filter: 'drop-shadow(0 0 6px #FF2E6E)' } : {}}
            />
            <text x={p.x} y={p.y + 3} textAnchor="middle"
              fontFamily="Bungee" fontSize="9"
              fill={standing ? '#1A1020' : 'rgba(110,95,117,0.7)'}>{p.n}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ═══════════════════════════════════════════
// RETRO · LIVE GAME · MOBILE
// ═══════════════════════════════════════════
function Retro_Live_M({ theme = 'retro-dark' }) {
  return (
    <div className="theme-root retro" data-theme={theme}>
      {/* status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px 4px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-1)', fontWeight: 600 }}>
        <span>9:41</span><span style={{ color: 'var(--text-2)' }}>● ● ● ▮▮▮▮</span>
      </div>

      {/* top bar */}
      <div className="between" style={{ padding: '10px 16px 12px', borderBottom: '1px solid var(--line)' }}>
        <div>
          <div className="marquee text-glow-pink" style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent)', boxShadow: 'var(--neon-glow-pink)' }}/>
            LIVE · G2 OF 3
          </div>
          <div className="script" style={{ fontSize: 17, color: 'var(--text-0)', marginTop: 2 }}>Thursday Doubles</div>
        </div>
        <button className="btn ghost" style={{ padding: '6px 10px', fontSize: 10 }}>END</button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px 180px' }} className="no-scrollbar">
        {/* series bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.2fr', gap: 6, marginBottom: 14 }}>
          {[
            { g: 'G1', sc: 202, done: true },
            { g: 'G2', sc: 142, live: true },
            { g: 'G3', sc: '—' },
          ].map((g, i) => (
            <div key={i} style={{
              padding: '8px 10px', borderRadius: 4,
              border: '1px solid ' + (g.live ? 'var(--accent)' : 'var(--line)'),
              background: g.live ? 'rgba(255,46,110,0.08)' : 'var(--bg-1)',
            }}>
              <div className="marquee" style={{ fontSize: 9, color: g.live ? 'var(--accent)' : 'var(--text-3)' }}>{g.g}</div>
              <div className="num" style={{ fontSize: 20, color: 'var(--text-0)' }}>{g.sc}</div>
            </div>
          ))}
          <div style={{ padding: '8px 10px', borderRadius: 4, border: '1px solid var(--accent-2)', background: 'rgba(0,224,255,0.08)' }}>
            <div className="marquee text-glow-cyan" style={{ fontSize: 9 }}>SER</div>
            <div className="num text-glow-cyan" style={{ fontSize: 20 }}>344</div>
          </div>
        </div>

        {/* scoresheet (split 2 rows on mobile) */}
        <div className="card scanlines" style={{ padding: 12, borderColor: 'var(--accent-line)', marginBottom: 14 }}>
          <div className="marquee text-glow-pink" style={{ fontSize: 10, marginBottom: 8 }}>━ G2 · FR 7 ━</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', border: '1px solid var(--accent-line)', borderRadius: 3, marginBottom: 2 }}>
            <RScore b1="X" b2="" sc={30}/>
            <RScore b1="9" b2="/" sc={49}/>
            <RScore b1="X" b2="" sc={78}/>
            <RScore b1="8" b2="1" sc={87}/>
            <RScore b1="X" b2="" sc={117}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', border: '1px solid var(--accent-line)', borderRadius: 3 }}>
            <RScore b1="X" b2="" sc={142}/>
            <div style={{ padding: '6px 4px 8px', background: 'rgba(255,46,110,0.15)', border: '2px solid var(--accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2, minHeight: 14 }}>
                <span className="marquee text-glow-cyan" style={{ fontSize: 10 }}>9</span>
                <span className="marquee text-glow-pink" style={{ fontSize: 10 }}>_</span>
              </div>
              <div className="num text-glow-pink" style={{ fontSize: 14, textAlign: 'center' }}>—</div>
            </div>
            {[8,9,10].map(n => (
              <div key={n} style={{ padding: '6px 4px 8px' }}>
                <div style={{ minHeight: 14 }}/>
                <div className="num" style={{ fontSize: 14, color: 'var(--text-3)', textAlign: 'center' }}>—</div>
              </div>
            ))}
          </div>
        </div>

        {/* pin deck */}
        <div className="card" style={{ padding: 14, marginBottom: 14 }}>
          <div className="marquee text-glow-cyan" style={{ fontSize: 10, marginBottom: 8, textAlign: 'center' }}>
            ON DECK · TAP STANDING PINS
          </div>
          <PinDeck leftPins={[10]}/>
        </div>

        {/* coach */}
        <div className="card" style={{ padding: 14, marginBottom: 14, borderColor: 'var(--accent-line)', background: 'linear-gradient(180deg, rgba(255,46,110,0.10), transparent)' }}>
          <div className="marquee text-glow-pink" style={{ fontSize: 10, marginBottom: 6 }}>✦ COACH</div>
          <div className="script" style={{ fontSize: 14, color: 'var(--text-0)', lineHeight: 1.35 }}>
            2nd 10-pin this game. Try stand 2 boards right.
          </div>
        </div>

        {/* in hand */}
        <div className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #FF2E6E, #FF2E6E33 70%)', border: '1px solid #FF2E6E', boxShadow: '0 0 10px #FF2E6E66', flexShrink: 0 }}/>
          <div style={{ flex: 1 }}>
            <div className="script" style={{ fontSize: 14, color: 'var(--text-0)' }}>Phaze II</div>
            <div className="mono uppercase tracked" style={{ fontSize: 9, color: 'var(--text-3)' }}>IN HAND · 15 LB</div>
          </div>
          <button className="btn ghost" style={{ padding: '5px 8px', fontSize: 9 }}>SWAP</button>
        </div>
      </div>

      {/* bottom action bar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: '#14091E', borderTop: '1px solid var(--accent-line)',
        padding: '12px 16px 26px',
      }}>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn primary" style={{ flex: 1, padding: '14px', fontSize: 12 }}>STRIKE ✗</button>
          <button className="btn primary" style={{ flex: 1, padding: '14px', background: 'var(--accent-2)', borderColor: 'var(--accent-2)', color: '#0B0012', boxShadow: 'var(--neon-glow-cyan)', fontSize: 12 }}>SPARE /</button>
          <button className="btn ghost" style={{ padding: '14px 12px', fontSize: 12 }}>⌨</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// RETRO · ANALYTICS · DESKTOP
// ═══════════════════════════════════════════
function Retro_Analytics_D({ theme = 'retro-dark' }) {
  const avgData = [198, 202, 205, 199, 211, 208, 213, 217, 215, 220, 218, 223];
  return (
    <div className="theme-root retro" data-theme={theme}>
      <div style={{ display: 'grid', gridTemplateColumns: '236px 1fr', height: '100%' }}>
        <RetroNav active="ANALYTICS" theme={theme}/>
        <main style={{ overflow: 'auto', padding: 24 }} className="no-scrollbar">
          {/* header */}
          <div className="between" style={{ marginBottom: 18 }}>
            <div>
              <div className="marquee text-glow-pink" style={{ fontSize: 10 }}>━━━ DEEP DIVE ━━━</div>
              <div className="script text-glow-cyan" style={{ fontSize: 40, lineHeight: 1, marginTop: 2 }}>Analytics</div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <div className="chip">🗓 90 DAY</div>
              <div className="chip">ALL EVENTS</div>
              <div className="chip">ALL BALLS</div>
              <div className="chip">ALL PATTERNS</div>
              <button className="btn ghost">＋ FILTER</button>
            </div>
          </div>

          {/* hero KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div className="card scanlines" style={{ padding: 22, borderColor: 'var(--accent-line)', background: 'linear-gradient(135deg, var(--bg-1), #261538)' }}>
              <div className="between">
                <span className="marquee text-glow-pink" style={{ fontSize: 10 }}>AVG · 90 DAY</span>
                <span className="chip accent" style={{ background: 'var(--accent)', color: '#FFF', borderColor: 'var(--accent)', boxShadow: 'var(--neon-glow-pink)' }}>▲ 15 VS YOU-THEN</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 12 }}>
                <span className="num text-glow-cyan" style={{ fontSize: 84, lineHeight: 1 }}>213</span>
                <div>
                  <div className="mono uppercase tracked" style={{ fontSize: 9, color: 'var(--text-3)' }}>vs bowlers like you</div>
                  <div className="num text-glow-pink" style={{ fontSize: 20, marginTop: 2 }}>+18</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>top 12%</div>
                </div>
              </div>
              {/* trend chart */}
              <div style={{ marginTop: 18 }}>
                <svg viewBox="0 0 400 80" width="100%" height="80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="trendGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(0,224,255,0.4)"/>
                      <stop offset="100%" stopColor="rgba(0,224,255,0)"/>
                    </linearGradient>
                  </defs>
                  {(() => {
                    const w = 400, h = 80;
                    const max = Math.max(...avgData), min = Math.min(...avgData);
                    const range = max - min || 1;
                    const pts = avgData.map((v, i) => {
                      const x = (i / (avgData.length - 1)) * w;
                      const y = h - ((v - min) / range) * (h - 10) - 5;
                      return { x, y, v };
                    });
                    const path = 'M' + pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L');
                    const area = path + ` L${w},${h} L0,${h} Z`;
                    return (
                      <>
                        <path d={area} fill="url(#trendGrad)"/>
                        <path d={path} fill="none" stroke="#00E0FF" strokeWidth="2"
                          style={{ filter: 'drop-shadow(0 0 6px #00E0FF)' }}/>
                        {pts.map((p, i) => (i === pts.length - 1 || i === 0) && (
                          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#FF2E6E" style={{ filter: 'drop-shadow(0 0 6px #FF2E6E)' }}/>
                        ))}
                      </>
                    );
                  })()}
                </svg>
                <div className="between" style={{ marginTop: 4 }}>
                  <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)' }}>JAN</span>
                  <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)' }}>FEB</span>
                  <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)' }}>MAR</span>
                  <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)' }}>APR</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 22 }}>
              <div className="marquee text-glow-pink" style={{ fontSize: 10 }}>PER-BALL AVG</div>
              {[
                { name: 'Phaze II', avg: 223, w: 100, c: '#FF2E6E', role: 'BENCHMARK' },
                { name: 'IQ Tour',  avg: 215, w: 88, c: '#00E0FF', role: 'ASYM' },
                { name: 'Hy-Road',  avg: 201, w: 74, c: '#FFD83D', role: 'CONTROL' },
              ].map((b, i) => (
                <div key={i} style={{ marginTop: 14 }}>
                  <div className="between">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: `radial-gradient(circle at 30% 30%, ${b.c}, ${b.c}33)`, border: `1px solid ${b.c}`, boxShadow: `0 0 6px ${b.c}66` }}/>
                      <span className="script" style={{ fontSize: 14, color: 'var(--text-0)' }}>{b.name}</span>
                    </div>
                    <span className="num text-glow-cyan" style={{ fontSize: 16 }}>{b.avg}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${b.w}%`, height: '100%', background: b.c, boxShadow: `0 0 6px ${b.c}` }}/>
                  </div>
                  <div className="mono uppercase tracked" style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 3 }}>{b.role}</div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 22 }}>
              <div className="marquee text-glow-cyan" style={{ fontSize: 10 }}>PER-PATTERN</div>
              {[
                { name: 'House',       len: '40 ft', avg: 221, c: '#00E0FF' },
                { name: 'Chameleon',   len: '39 ft', avg: 198, c: '#FFD83D' },
                { name: 'Viper',       len: '36 ft', avg: 205, c: '#FF2E6E' },
              ].map((p, i) => (
                <div key={i} className="between" style={{ padding: '10px 0', borderBottom: i === 2 ? 'none' : '1px solid var(--line-soft)' }}>
                  <div>
                    <div className="script" style={{ fontSize: 14, color: 'var(--text-0)' }}>{p.name}</div>
                    <div className="mono uppercase tracked" style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>{p.len}</div>
                  </div>
                  <div className="num" style={{ fontSize: 18, color: p.c, textShadow: `0 0 8px ${p.c}66` }}>{p.avg}</div>
                </div>
              ))}
            </div>
          </div>

          {/* leaks deep-dive */}
          <div className="card" style={{ padding: 22, marginBottom: 14 }}>
            <div className="between" style={{ marginBottom: 14 }}>
              <span className="script text-glow-pink" style={{ fontSize: 22 }}>Leaks · where pins leave you</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>90 DAY · 18 SESSIONS</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                {[
                  ['10-pin conversion', '71%', '↑ 85% with flatter angle', '+6.2/game', 100],
                  ['Open in frame 10',  '18%', '↑ 10% target', '+3.1/game', 50],
                  ['Fatigue after fr 7','-4.2', 'avg score drop late',   '+2.4/game', 38],
                  ['7-pin spare',       '79%', '↑ 90% target', '+1.8/game', 28],
                ].map(([k, cur, note, cost, w], i) => (
                  <div key={k} style={{ marginBottom: 14 }}>
                    <div className="between">
                      <span className="script" style={{ fontSize: 15, color: 'var(--text-0)' }}>{k}</span>
                      <span className="num text-glow-pink" style={{ fontSize: 14 }}>{cost}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 3 }}>{cur} · {note}</div>
                    <div style={{ height: 3, background: 'var(--bg-3)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${w}%`, height: '100%', background: 'var(--accent)', boxShadow: 'var(--neon-glow-pink)' }}/>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--bg-0)', border: '1px solid var(--line)', borderRadius: 4, padding: 16 }}>
                <div className="marquee text-glow-cyan" style={{ fontSize: 10, marginBottom: 12 }}>10-PIN HEATMAP · MISS ANGLE</div>
                <svg viewBox="0 0 200 120" width="100%">
                  <defs>
                    <radialGradient id="heat" cx="60%" cy="50%" r="40%">
                      <stop offset="0%" stopColor="#FF2E6E" stopOpacity="0.8"/>
                      <stop offset="60%" stopColor="#FF2E6E" stopOpacity="0.25"/>
                      <stop offset="100%" stopColor="#FF2E6E" stopOpacity="0"/>
                    </radialGradient>
                  </defs>
                  <rect x="0" y="0" width="200" height="120" fill="var(--bg-1)"/>
                  {/* vertical boards */}
                  {[...Array(10)].map((_, i) => (
                    <line key={i} x1={i * 20} y1={0} x2={i * 20} y2={120} stroke="var(--line-soft)" strokeWidth="0.5"/>
                  ))}
                  <ellipse cx="120" cy="60" rx="55" ry="30" fill="url(#heat)"/>
                  {/* 10-pin marker */}
                  <circle cx="170" cy="60" r="5" fill="#FFF6E0" stroke="#FF2E6E" strokeWidth="1.5"/>
                  <text x="170" y="63" textAnchor="middle" fontSize="6" fontFamily="Bungee" fill="#1A1020">10</text>
                  {/* arrow */}
                  <path d="M 60 80 Q 100 55 155 60" fill="none" stroke="#00E0FF" strokeWidth="1.5" strokeDasharray="3 2" style={{ filter: 'drop-shadow(0 0 4px #00E0FF)' }}/>
                  <text x="60" y="94" fontSize="7" fontFamily="JetBrains Mono" fill="#B8A88A">YOUR MISS</text>
                  <text x="130" y="40" fontSize="7" fontFamily="JetBrains Mono" fill="#00E0FF">FLATTER = MAKE</text>
                </svg>
                <button className="btn primary" style={{ width: '100%', marginTop: 14 }}>OPEN 10-PIN DRILL</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Shared nav (desktop)
function RetroNav({ active = 'ANALYTICS', theme }) {
  return (
    <aside style={{
      background: theme === 'retro-light' ? '#FFF9E8' : '#14091E',
      borderRight: '1px solid var(--line)',
      padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ padding: '0 6px 18px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="script text-glow-cyan" style={{ fontSize: 32, lineHeight: 1 }}>Roll</span>
          <span className="script text-glow-pink" style={{ fontSize: 32, lineHeight: 1 }}>IQ</span>
        </div>
      </div>
      {[
        ['◉', 'PULSE'],
        ['▶', 'PLAY'],
        ['◐', 'ARSENAL'],
        ['△', 'ANALYTICS'],
        ['≡', 'SESSIONS'],
        ['◎', 'LEAGUES'],
      ].map(([ic, label]) => {
        const isActive = label === active;
        return (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 4, cursor: 'pointer',
            background: isActive ? 'var(--accent-dim)' : 'transparent',
            border: isActive ? '1px solid var(--accent-line)' : '1px solid transparent',
            color: isActive ? 'var(--accent)' : 'var(--text-2)',
            fontFamily: 'Bungee, Archivo, sans-serif',
            fontSize: 11, letterSpacing: '0.08em',
          }}>
            <span style={{ fontSize: 13, width: 16 }}>{ic}</span>
            <span>{label}</span>
          </div>
        );
      })}
    </aside>
  );
}

// ═══════════════════════════════════════════
// RETRO · ANALYTICS · MOBILE
// ═══════════════════════════════════════════
function Retro_Analytics_M({ theme = 'retro-dark' }) {
  const avgData = [198, 202, 205, 199, 211, 208, 213, 217, 215, 220, 218, 223];
  return (
    <div className="theme-root retro" data-theme={theme}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px 4px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-1)', fontWeight: 600 }}>
        <span>9:41</span><span style={{ color: 'var(--text-2)' }}>● ● ● ▮▮▮▮</span>
      </div>
      <div className="between" style={{ padding: '10px 16px 12px' }}>
        <div className="script text-glow-cyan" style={{ fontSize: 24 }}>Analytics</div>
        <button className="btn ghost" style={{ padding: '6px 10px', fontSize: 10 }}>⏷ 90D</button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 90px' }} className="no-scrollbar">
        {/* filter chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10 }} className="no-scrollbar">
          <div className="chip accent" style={{ background: 'var(--accent-dim)', borderColor: 'var(--accent-line)', color: 'var(--accent)', flexShrink: 0 }}>ALL</div>
          <div className="chip" style={{ flexShrink: 0 }}>LEAGUE</div>
          <div className="chip" style={{ flexShrink: 0 }}>TOURNEY</div>
          <div className="chip" style={{ flexShrink: 0 }}>PRACTICE</div>
        </div>

        {/* hero */}
        <div className="card scanlines" style={{ padding: 18, borderColor: 'var(--accent-line)', background: 'linear-gradient(135deg, var(--bg-1), #261538)', marginBottom: 12 }}>
          <div className="between">
            <span className="marquee text-glow-pink" style={{ fontSize: 10 }}>AVG · 90D</span>
            <span className="chip" style={{ background: 'var(--accent)', color: '#FFF', borderColor: 'var(--accent)' }}>▲ 15</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 10 }}>
            <span className="num text-glow-cyan" style={{ fontSize: 72, lineHeight: 1 }}>213</span>
            <div>
              <div className="mono uppercase tracked" style={{ fontSize: 8, color: 'var(--text-3)' }}>VS YOUR PEERS</div>
              <div className="num text-glow-pink" style={{ fontSize: 16 }}>+18</div>
            </div>
          </div>
          <svg viewBox="0 0 300 40" width="100%" style={{ marginTop: 12, display: 'block' }} preserveAspectRatio="none">
            {(() => {
              const w = 300, h = 40;
              const max = Math.max(...avgData), min = Math.min(...avgData);
              const range = max - min || 1;
              const pts = avgData.map((v, i) => {
                const x = (i / (avgData.length - 1)) * w;
                const y = h - ((v - min) / range) * (h - 6) - 3;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });
              return <path d={'M' + pts.join(' L')} fill="none" stroke="#00E0FF" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px #00E0FF)' }}/>;
            })()}
          </svg>
        </div>

        {/* leaks */}
        <div className="marquee text-glow-pink" style={{ fontSize: 10, margin: '8px 0' }}>TOP LEAKS</div>
        {[
          ['10-pin conv', '71% → 85%', '+6.2/g', 100],
          ['Open fr 10',  '18% → 10%', '+3.1/g', 50],
          ['Late fatigue','−4.2 late', '+2.4/g', 38],
        ].map(([k, v, c, w]) => (
          <div key={k} className="card" style={{ padding: 12, marginBottom: 8 }}>
            <div className="between">
              <span className="script" style={{ fontSize: 14, color: 'var(--text-0)' }}>{k}</span>
              <span className="num text-glow-pink" style={{ fontSize: 13 }}>{c}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{v}</div>
            <div style={{ height: 3, background: 'var(--bg-3)', borderRadius: 2, marginTop: 6 }}>
              <div style={{ width: `${w}%`, height: '100%', background: 'var(--accent)', boxShadow: 'var(--neon-glow-pink)' }}/>
            </div>
          </div>
        ))}

        {/* per-ball */}
        <div className="marquee text-glow-cyan" style={{ fontSize: 10, margin: '18px 0 8px' }}>PER-BALL AVG</div>
        {[
          ['Phaze II', 223, '#FF2E6E', 100],
          ['IQ Tour',  215, '#00E0FF', 88],
          ['Hy-Road',  201, '#FFD83D', 74],
        ].map(([n, a, c, w]) => (
          <div key={n} className="card" style={{ padding: 12, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `radial-gradient(circle at 30% 30%, ${c}, ${c}33)`, border: `1px solid ${c}`, boxShadow: `0 0 8px ${c}66`, flexShrink: 0 }}/>
            <div style={{ flex: 1 }}>
              <div className="script" style={{ fontSize: 14, color: 'var(--text-0)' }}>{n}</div>
              <div style={{ height: 3, background: 'var(--bg-3)', borderRadius: 2, marginTop: 4 }}>
                <div style={{ width: `${w}%`, height: '100%', background: c, boxShadow: `0 0 4px ${c}` }}/>
              </div>
            </div>
            <div className="num" style={{ fontSize: 15, color: c, textShadow: `0 0 6px ${c}66` }}>{a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// RETRO · SESSION START · MOBILE
// ═══════════════════════════════════════════
function Retro_SessionStart_M({ theme = 'retro-dark' }) {
  return (
    <div className="theme-root retro" data-theme={theme}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px 4px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-1)', fontWeight: 600 }}>
        <span>9:41</span><span style={{ color: 'var(--text-2)' }}>● ● ● ▮▮▮▮</span>
      </div>

      <div className="between" style={{ padding: '10px 16px 12px' }}>
        <div style={{ color: 'var(--text-2)', fontSize: 22 }}>×</div>
        <div className="script text-glow-cyan" style={{ fontSize: 22 }}>New session</div>
        <span style={{ width: 22 }}/>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 100px' }} className="no-scrollbar">
        {/* recent chips */}
        <div className="marquee text-glow-pink" style={{ fontSize: 10, margin: '6px 0 8px' }}>RECENT · ONE-TAP</div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }} className="no-scrollbar">
          {[
            { e: 'Thursday Doubles', p: 'AMF North · House 40', icon: '👥' },
            { e: 'Solo Practice',    p: 'Local 300 Lanes',     icon: '◉' },
            { e: 'Spring Classic',   p: 'Strike Zone · Viper', icon: '★' },
          ].map((c, i) => (
            <div key={i} className="card" style={{ padding: 12, minWidth: 180, flexShrink: 0 }}>
              <div className="marquee text-glow-pink" style={{ fontSize: 11 }}>{c.icon} QUICK-START</div>
              <div className="script" style={{ fontSize: 14, color: 'var(--text-0)', marginTop: 3 }}>{c.e}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{c.p}</div>
            </div>
          ))}
        </div>

        {/* event type segmented */}
        <div className="marquee text-glow-cyan" style={{ fontSize: 10, margin: '20px 0 8px' }}>EVENT TYPE</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, padding: 4, background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 6 }}>
          {[
            ['PRACTICE', false],
            ['LEAGUE', true],
            ['TOURNEY', false],
            ['OPEN', false],
          ].map(([l, on]) => (
            <div key={l} style={{
              padding: '10px 6px', borderRadius: 4, textAlign: 'center',
              background: on ? 'var(--accent)' : 'transparent',
              color: on ? '#FFF' : 'var(--text-2)',
              fontFamily: 'Bungee', fontSize: 10, letterSpacing: '0.06em',
              boxShadow: on ? 'var(--neon-glow-pink)' : 'none',
            }}>{l}</div>
          ))}
        </div>

        {/* league name */}
        <div className="marquee text-glow-pink" style={{ fontSize: 10, margin: '18px 0 8px' }}>LEAGUE</div>
        <input defaultValue="Thursday Night Doubles" style={{
          width: '100%', padding: '14px 14px',
          background: 'var(--bg-1)', border: '1px solid var(--line)',
          borderRadius: 6, color: 'var(--text-0)',
          fontFamily: 'Kalnia', fontSize: 15, fontStyle: 'italic',
        }}/>

        {/* center + lane */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 10, marginTop: 14 }}>
          <div>
            <div className="marquee text-glow-pink" style={{ fontSize: 10, marginBottom: 6 }}>CENTER</div>
            <div className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="script" style={{ fontSize: 14, color: 'var(--text-0)' }}>AMF North</div>
                <div className="mono" style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>0.8 mi</div>
              </div>
              <span style={{ color: 'var(--accent-2)' }}>⌄</span>
            </div>
          </div>
          <div>
            <div className="marquee text-glow-cyan" style={{ fontSize: 10, marginBottom: 6 }}>LANE PAIR</div>
            <div className="card" style={{ padding: 12, textAlign: 'center' }}>
              <span className="num text-glow-cyan" style={{ fontSize: 18 }}>13 / 14</span>
            </div>
          </div>
        </div>

        {/* oil pattern */}
        <div className="marquee text-glow-pink" style={{ fontSize: 10, margin: '18px 0 8px' }}>OIL PATTERN</div>
        <div className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 4,
            background: 'linear-gradient(90deg, #00E0FF 0%, #00E0FF 75%, transparent 75%)',
            opacity: 0.5, border: '1px solid var(--line)',
          }}/>
          <div style={{ flex: 1 }}>
            <div className="script" style={{ fontSize: 14, color: 'var(--text-0)' }}>House · 40 ft</div>
            <div className="mono" style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>THS · MED VOLUME · 2.5:1</div>
          </div>
          <span style={{ color: 'var(--accent-2)' }}>⌄</span>
        </div>

        {/* games planned + handicap */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
          <div>
            <div className="marquee text-glow-cyan" style={{ fontSize: 10, marginBottom: 6 }}>GAMES</div>
            <div className="card" style={{ padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--accent-2)', fontSize: 18 }}>−</span>
              <span className="num text-glow-cyan" style={{ fontSize: 22 }}>3</span>
              <span style={{ color: 'var(--accent-2)', fontSize: 18 }}>+</span>
            </div>
          </div>
          <div>
            <div className="marquee text-glow-pink" style={{ fontSize: 10, marginBottom: 6 }}>SCORING</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 4, background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 6 }}>
              <div style={{ padding: '6px', textAlign: 'center', borderRadius: 4, background: 'var(--accent)', color: '#FFF', fontFamily: 'Bungee', fontSize: 9, boxShadow: 'var(--neon-glow-pink)' }}>HCP</div>
              <div style={{ padding: '6px', textAlign: 'center', color: 'var(--text-2)', fontFamily: 'Bungee', fontSize: 9 }}>SCR</div>
            </div>
          </div>
        </div>

        {/* starting ball */}
        <div className="marquee text-glow-cyan" style={{ fontSize: 10, margin: '18px 0 8px' }}>STARTING BALL</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { n: 'Phaze II', c: '#FF2E6E', on: true },
            { n: 'IQ Tour',  c: '#00E0FF' },
          ].map(b => (
            <div key={b.n} className="card" style={{
              padding: 12, display: 'flex', alignItems: 'center', gap: 10,
              borderColor: b.on ? 'var(--accent)' : 'var(--line)',
              boxShadow: b.on ? 'var(--neon-glow-pink)' : 'none',
            }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: `radial-gradient(circle at 30% 30%, ${b.c}, ${b.c}33)`, border: `1px solid ${b.c}` }}/>
              <span className="script" style={{ fontSize: 13, color: 'var(--text-0)' }}>{b.n}</span>
            </div>
          ))}
        </div>

        {/* draft hint */}
        <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center', marginTop: 20 }}>
          ✓ DRAFT AUTO-SAVED
        </div>
      </div>

      {/* sticky CTA */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#14091E', borderTop: '1px solid var(--accent-line)', padding: '12px 16px 26px' }}>
        <button className="btn primary" style={{ width: '100%', padding: '16px', fontSize: 13 }}>START GAME 1 →</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// RETRO · ARSENAL · MOBILE
// ═══════════════════════════════════════════
function Retro_Arsenal_M({ theme = 'retro-dark' }) {
  const balls = [
    { n: 'Phaze II',  c: '#FF2E6E', role: 'BENCHMARK', avg: 223, inBag: true,  layout: '50×5×35', surface: '3000 Abr', weight: 15 },
    { n: 'IQ Tour',   c: '#00E0FF', role: 'STRONG ASYM', avg: 215, inBag: true,  layout: '45×4½×40', surface: '4000 Abr', weight: 15 },
    { n: 'Hy-Road',   c: '#FFD83D', role: 'CONTROL', avg: 201, inBag: false, layout: '60×5×45', surface: '2000 Abr',   weight: 15 },
    { n: 'Zen U',     c: '#8A4BE8', role: 'SPARE',    avg: '—',  inBag: true,  layout: '—',       surface: 'polished',   weight: 14 },
  ];
  return (
    <div className="theme-root retro" data-theme={theme}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px 4px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-1)', fontWeight: 600 }}>
        <span>9:41</span><span style={{ color: 'var(--text-2)' }}>● ● ● ▮▮▮▮</span>
      </div>
      <div className="between" style={{ padding: '10px 16px 12px' }}>
        <div className="script text-glow-pink" style={{ fontSize: 26 }}>The Arsenal</div>
        <button className="btn primary" style={{ padding: '8px 12px', fontSize: 10 }}>＋ ADD</button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 90px' }} className="no-scrollbar">
        {/* in-bag toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 4, background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 6, marginBottom: 12 }}>
          <div style={{ padding: '8px', textAlign: 'center', borderRadius: 4, background: 'var(--accent)', color: '#FFF', fontFamily: 'Bungee', fontSize: 10, boxShadow: 'var(--neon-glow-pink)' }}>IN BAG (3)</div>
          <div style={{ padding: '8px', textAlign: 'center', color: 'var(--text-2)', fontFamily: 'Bungee', fontSize: 10 }}>ALL (4)</div>
        </div>

        {balls.map((b, i) => (
          <div key={i} className="card" style={{ padding: 14, marginBottom: 10, opacity: b.inBag ? 1 : 0.55 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: `radial-gradient(circle at 30% 30%, ${b.c}, ${b.c}33 70%)`,
                border: `1px solid ${b.c}`, boxShadow: `0 0 12px ${b.c}66`,
                flexShrink: 0,
              }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="between">
                  <span className="script" style={{ fontSize: 17, color: 'var(--text-0)' }}>{b.n}</span>
                  <span className="num" style={{ fontSize: 16, color: b.c, textShadow: `0 0 6px ${b.c}66` }}>{b.avg}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                  <span className="chip" style={{ background: b.c + '22', borderColor: b.c + '66', color: b.c }}>{b.role}</span>
                  <span className="chip">{b.weight} LB</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line-soft)' }}>
              <div>
                <div className="mono uppercase tracked" style={{ fontSize: 9, color: 'var(--text-3)' }}>LAYOUT</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--text-1)', marginTop: 2 }}>{b.layout}</div>
              </div>
              <div>
                <div className="mono uppercase tracked" style={{ fontSize: 9, color: 'var(--text-3)' }}>SURFACE</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--text-1)', marginTop: 2 }}>{b.surface}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// RETRO · BALL DETAIL · MOBILE
// ═══════════════════════════════════════════
function Retro_BallDetail_M({ theme = 'retro-dark' }) {
  const perf = [212, 215, 209, 220, 218, 225, 223, 230, 227, 223];
  return (
    <div className="theme-root retro" data-theme={theme}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px 4px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-1)', fontWeight: 600 }}>
        <span>9:41</span><span style={{ color: 'var(--text-2)' }}>● ● ● ▮▮▮▮</span>
      </div>
      <div className="between" style={{ padding: '10px 16px 12px' }}>
        <span style={{ color: 'var(--text-2)', fontSize: 22 }}>‹</span>
        <div className="marquee text-glow-pink" style={{ fontSize: 10 }}>BENCHMARK · IN BAG</div>
        <span style={{ color: 'var(--text-2)', fontSize: 18 }}>⋯</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 100px' }} className="no-scrollbar">
        {/* hero */}
        <div className="card scanlines" style={{ padding: 24, borderColor: 'var(--accent-line)', background: 'linear-gradient(135deg, var(--bg-1), #261538)', textAlign: 'center', marginBottom: 14 }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%', margin: '0 auto 14px',
            background: 'radial-gradient(circle at 32% 30%, #FF2E6E, #FF2E6E22 70%)',
            border: '2px solid #FF2E6E', boxShadow: '0 0 28px #FF2E6E80',
          }}/>
          <div className="script text-glow-cyan" style={{ fontSize: 32, lineHeight: 1 }}>Phaze II</div>
          <div className="mono uppercase tracked" style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 6 }}>
            STORM · 15 LB · RG 2.48 · DIFF 0.052
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 20 }}>
            <div>
              <div className="num text-glow-pink" style={{ fontSize: 28 }}>223</div>
              <div className="mono uppercase tracked" style={{ fontSize: 9, color: 'var(--text-3)' }}>AVG</div>
            </div>
            <div>
              <div className="num text-glow-cyan" style={{ fontSize: 28 }}>267</div>
              <div className="mono uppercase tracked" style={{ fontSize: 9, color: 'var(--text-3)' }}>PEAK</div>
            </div>
            <div>
              <div className="num" style={{ fontSize: 28, color: 'var(--text-0)' }}>48</div>
              <div className="mono uppercase tracked" style={{ fontSize: 9, color: 'var(--text-3)' }}>GAMES</div>
            </div>
          </div>
        </div>

        {/* perf spark */}
        <div className="card" style={{ padding: 16, marginBottom: 14 }}>
          <div className="marquee text-glow-cyan" style={{ fontSize: 10, marginBottom: 10 }}>LAST 10 · WITH THIS BALL</div>
          <svg viewBox="0 0 300 50" width="100%" preserveAspectRatio="none">
            {(() => {
              const max = Math.max(...perf), min = Math.min(...perf);
              const range = max - min || 1;
              const pts = perf.map((v, i) => {
                const x = (i / (perf.length - 1)) * 300;
                const y = 50 - ((v - min) / range) * 42 - 4;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });
              return <path d={'M' + pts.join(' L')} fill="none" stroke="#FF2E6E" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px #FF2E6E)' }}/>;
            })()}
          </svg>
        </div>

        {/* specs */}
        <div className="marquee text-glow-pink" style={{ fontSize: 10, margin: '4px 0 8px' }}>SPECS & LAYOUT</div>
        <div className="card" style={{ padding: 0, marginBottom: 14 }}>
          {[
            ['CORE',     'ASYMMETRIC · Atomic'],
            ['COVER',    'R2S Solid Reactive'],
            ['LAYOUT',   '50 × 5 × 35'],
            ['SURFACE',  '3000 Abralon'],
            ['PAP',      '5¾ × ¾↑'],
            ['DRILLED',  'Jan 14, 2025'],
          ].map(([k, v], i, a) => (
            <div key={k} className="between" style={{ padding: '12px 14px', borderBottom: i === a.length - 1 ? 'none' : '1px solid var(--line-soft)' }}>
              <span className="mono uppercase tracked" style={{ fontSize: 10, color: 'var(--text-3)' }}>{k}</span>
              <span className="script" style={{ fontSize: 13, color: 'var(--text-0)' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* best on */}
        <div className="marquee text-glow-cyan" style={{ fontSize: 10, margin: '4px 0 8px' }}>BEST ON</div>
        <div className="card" style={{ padding: 16 }}>
          {[
            ['House · 40ft', 225, 100],
            ['Chameleon',    218, 82],
            ['Viper · 36ft', 208, 65],
          ].map(([p, a, w]) => (
            <div key={p} style={{ marginBottom: 10 }}>
              <div className="between">
                <span className="script" style={{ fontSize: 13, color: 'var(--text-0)' }}>{p}</span>
                <span className="num text-glow-pink" style={{ fontSize: 14 }}>{a}</span>
              </div>
              <div style={{ height: 3, background: 'var(--bg-3)', borderRadius: 2, marginTop: 4 }}>
                <div style={{ width: `${w}%`, height: '100%', background: 'var(--accent)', boxShadow: 'var(--neon-glow-pink)' }}/>
              </div>
            </div>
          ))}
        </div>

        {/* status controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
          <button className="btn ghost" style={{ padding: '12px', fontSize: 10 }}>↓ BENCH</button>
          <button className="btn ghost" style={{ padding: '12px', fontSize: 10, color: 'var(--danger)', borderColor: 'var(--danger)' }}>🗑 RETIRE</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Retro_Live_D, Retro_Live_M,
  Retro_Analytics_D, Retro_Analytics_M,
  Retro_SessionStart_M,
  Retro_Arsenal_M,
  Retro_BallDetail_M,
});
