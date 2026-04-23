// hifi-retro.jsx — Bowling-native retro neon hi-fi screens
// Palette: 1A1020 / 3B1E5A / FF2E6E / 00E0FF / FFF6E0

function RetroSpark({ data, color, height = 36, width = 120 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <path d={'M' + pts.join(' L')} fill="none" stroke={color} strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}/>
    </svg>
  );
}

function RetroLogo({ size = 22 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span className="script text-glow-cyan" style={{ fontSize: size, lineHeight: 1 }}>Roll</span>
      <span className="script text-glow-pink" style={{ fontSize: size, lineHeight: 1 }}>IQ</span>
    </div>
  );
}

function RetroMetric({ label, value, delta, deltaDir, unit, neon }) {
  const deltaColor = deltaDir === 'up' ? 'var(--success)' : deltaDir === 'down' ? 'var(--danger)' : 'var(--text-2)';
  const arrow = deltaDir === 'up' ? '▲' : deltaDir === 'down' ? '▼' : '—';
  return (
    <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', overflow: 'hidden' }}>
      <div className="between">
        <span className="mono uppercase tracked" style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>{label}</span>
        {delta && (
          <span className="mono" style={{ fontSize: 11, color: deltaColor, fontWeight: 700 }}>
            {arrow} {delta}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span className="num" style={{
          fontSize: 34, color: 'var(--text-0)', lineHeight: 1,
          textShadow: neon === 'pink' ? 'var(--neon-glow-pink)'
                    : neon === 'cyan' ? '0 0 10px rgba(0,224,255,0.45)'
                    : 'none',
        }}>{value}</span>
        {unit && <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{unit}</span>}
      </div>
    </div>
  );
}

// ═══════════════ DESKTOP PULSE (Retro) ═══════════════
function Retro_Pulse_D({ theme = 'retro-dark' }) {
  return (
    <div className="theme-root retro" data-theme={theme}>
      <div style={{ display: 'grid', gridTemplateColumns: '236px 1fr', height: '100%' }}>
        {/* sidebar */}
        <aside style={{
          background: '#14091E', borderRight: '1px solid var(--line)',
          padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 4,
          position: 'relative',
        }}>
          <div style={{ padding: '0 6px 18px', display: 'flex', justifyContent: 'center' }}>
            <RetroLogo size={32}/>
          </div>

          {[
            ['◉', 'PULSE', true],
            ['▶', 'PLAY', false],
            ['◐', 'ARSENAL', false],
            ['△', 'ANALYTICS', false],
            ['≡', 'SESSIONS', false],
            ['◎', 'LEAGUES', false],
          ].map(([ic, label, active]) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              borderRadius: 4, cursor: 'pointer',
              background: active ? 'var(--accent-dim)' : 'transparent',
              border: active ? '1px solid var(--accent-line)' : '1px solid transparent',
              color: active ? 'var(--accent)' : 'var(--text-2)',
              fontFamily: 'Bungee, Archivo, sans-serif',
              fontSize: 11, letterSpacing: '0.08em',
              boxShadow: active ? 'inset 0 0 12px rgba(255,46,110,0.15)' : 'none',
            }}>
              <span style={{ fontSize: 13, width: 16 }}>{ic}</span>
              <span>{label}</span>
            </div>
          ))}

          <div style={{ flex: 1 }}/>

          {/* live marquee */}
          <div className="card" style={{
            padding: 14, marginTop: 12,
            background: 'var(--bg-2)', borderColor: 'var(--accent)',
            boxShadow: 'var(--neon-glow-pink)',
          }}>
            <div className="marquee text-glow-pink" style={{ fontSize: 10 }}>
              ● LIVE · G2 OF 3
            </div>
            <div className="num text-glow-cyan" style={{ fontSize: 26, marginTop: 6 }}>142</div>
            <div style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 2 }}>
              Thursday Doubles · Ln 14
            </div>
            <div className="marquee" style={{
              marginTop: 10, padding: '7px 10px', borderRadius: 4,
              background: 'var(--accent)', color: '#FFF',
              fontSize: 10, textAlign: 'center',
              boxShadow: 'var(--neon-glow-pink)',
            }}>
              RESUME →
            </div>
          </div>

          {/* profile */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 6px', marginTop: 8,
            borderTop: '1px solid var(--line-soft)',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'var(--grad-accent)', color: '#FFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13, fontFamily: 'Bungee',
              boxShadow: 'var(--neon-glow-pink)',
            }}>CM</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="script" style={{ fontSize: 15, color: 'var(--text-0)', lineHeight: 1 }}>Casey Morales</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>avg 213 · top 12%</div>
            </div>
          </div>
        </aside>

        {/* main */}
        <main style={{ overflow: 'auto', padding: 24, position: 'relative' }} className="no-scrollbar">
          {/* top bar */}
          <div className="between" style={{ marginBottom: 22 }}>
            <div>
              <div className="mono uppercase tracked" style={{ fontSize: 10, color: 'var(--text-3)' }}>
                TUE · APR 23 · 7:14 PM
              </div>
              <div className="script text-glow-cyan" style={{ fontSize: 40, lineHeight: 1, marginTop: 2 }}>
                Pulse
              </div>
            </div>
            <div className="row" style={{ alignItems: 'center', gap: 10 }}>
              <div className="chip">
                <span className="mono">⌘K</span>
                <span style={{ color: 'var(--text-2)' }}>quick action</span>
              </div>
              <button className="btn primary">＋ NEW SESSION</button>
            </div>
          </div>

          {/* hero + insight */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginBottom: 14 }}>
            {/* hero — neon-signed scoresheet */}
            <div className="card scanlines" style={{
              padding: 24, position: 'relative', overflow: 'hidden',
              background: 'linear-gradient(135deg, var(--bg-1) 0%, #261538 100%)',
              borderColor: 'var(--accent-line)',
            }}>
              <div className="between" style={{ position: 'relative' }}>
                <span className="marquee text-glow-pink" style={{ fontSize: 11 }}>
                  ROLLING AVG · 30 DAY
                </span>
                <span className="chip accent"
                  style={{ background: 'var(--accent)', color: '#FFF', borderColor: 'var(--accent)', boxShadow: 'var(--neon-glow-pink)' }}>
                  ▲ 9 VS PRIOR 30D
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 14, position: 'relative' }}>
                <span className="num text-glow-cyan" style={{
                  fontSize: 104, lineHeight: 1,
                  textShadow: '0 0 18px rgba(0,224,255,0.5), 0 0 40px rgba(0,224,255,0.25)',
                }}>213</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span className="mono uppercase tracked" style={{ fontSize: 10, color: 'var(--text-3)' }}>PEAK</span>
                  <span className="num text-glow-pink" style={{ fontSize: 22 }}>267</span>
                  <span className="mono uppercase tracked" style={{ fontSize: 10, color: 'var(--text-3)' }}>HIGH GAME</span>
                </div>
              </div>

              {/* marquee-style scoresheet */}
              <div style={{ marginTop: 22 }}>
                <div className="marquee" style={{ fontSize: 10, color: 'var(--text-2)', marginBottom: 8 }}>
                  ━━━  LAST GAME  ━━━
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)',
                  border: '1px solid var(--accent-line)', borderRadius: 4,
                  overflow: 'hidden',
                  background: 'rgba(255,46,110,0.04)',
                }}>
                  {[
                    ['X',  '', 30],
                    ['9','/',49],
                    ['X', '', 78],
                    ['8','1',87],
                    ['X', '', 117],
                    ['X', '', 145],
                    ['9','/',163],
                    ['X', '', 183],
                    ['X', '', 203],
                    ['X','X', 238, 'X', true],
                  ].map(([b1, b2, sc, b3, tenth], i) => (
                    <div key={i} style={{
                      borderRight: i === 9 ? 'none' : '1px solid var(--line)',
                      padding: '6px 4px 8px',
                      background: b1 === 'X' ? 'rgba(0,224,255,0.06)' : 'transparent',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2, minHeight: 14 }}>
                        <span className="marquee text-glow-cyan" style={{ fontSize: 10, minWidth: 10, textAlign: 'center' }}>{b1}</span>
                        <span className="marquee text-glow-cyan" style={{ fontSize: 10, minWidth: 10, textAlign: 'center' }}>{b2}</span>
                        {tenth && <span className="marquee text-glow-pink" style={{ fontSize: 10, minWidth: 10, textAlign: 'center' }}>{b3}</span>}
                      </div>
                      <div className="num" style={{
                        fontSize: 16, color: 'var(--text-0)', textAlign: 'center', marginTop: 2,
                      }}>{sc}</div>
                    </div>
                  ))}
                </div>
                <div className="between" style={{ marginTop: 8 }}>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>
                    245 · thu apr 19 · Phaze II
                  </span>
                  <span className="mono uppercase tracked" style={{ fontSize: 10, color: 'var(--accent-2)' }}>
                    VIEW GAME →
                  </span>
                </div>
              </div>
            </div>

            {/* AI insight */}
            <div className="card" style={{
              padding: 22, display: 'flex', flexDirection: 'column', gap: 12,
              background: 'linear-gradient(180deg, var(--bg-2), var(--bg-1))',
              borderColor: 'var(--accent-line)',
            }}>
              <div className="between">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="text-glow-pink" style={{ fontSize: 16 }}>✦</span>
                  <span className="marquee text-glow-pink" style={{ fontSize: 10 }}>
                    COACH · DAILY READ
                  </span>
                </div>
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>01:42 AGO</span>
              </div>
              <div className="script" style={{ fontSize: 22, color: 'var(--text-0)', lineHeight: 1.25 }}>
                Your 10-pin is costing you <span className="text-glow-pink">6.2 pins</span> per game.
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.55 }}>
                On house shots, you leave 10s on 38% of first balls but convert only 71%. A flatter spare shot would lift that to ~85%.
              </div>
              <div className="row" style={{ marginTop: 4 }}>
                <button className="btn primary">OPEN DRILL PLAN</button>
                <button className="btn ghost">SEE DATA</button>
              </div>
            </div>
          </div>

          {/* metric row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 14 }}>
            <RetroMetric label="STRIKE %" value="42" unit="%" delta="4.1" deltaDir="up" neon="cyan"/>
            <RetroMetric label="SPARE %" value="84" unit="%" delta="1.2" deltaDir="up"/>
            <RetroMetric label="CLEAN %" value="68" unit="%" delta="2.4" deltaDir="down"/>
            <RetroMetric label="FIRST BALL" value="8.9" unit="avg" delta="0.3" deltaDir="up" neon="pink"/>
          </div>

          {/* secondary grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
            {/* recent sessions */}
            <div className="card" style={{ padding: 20 }}>
              <div className="between" style={{ marginBottom: 14 }}>
                <span className="script text-glow-cyan" style={{ fontSize: 22 }}>Recent sessions</span>
                <span className="mono uppercase tracked" style={{ fontSize: 10, color: 'var(--accent-2)', cursor: 'pointer' }}>
                  VIEW ALL →
                </span>
              </div>
              {[
                { date: '19 APR', event: 'Thursday Doubles', type: 'LEAGUE', high: 245, series: 685, ball: 'Phaze II', pat: 'House 40ft' },
                { date: '16 APR', event: 'Practice',         type: 'PRACTICE', high: 221, series: 612, ball: 'IQ Tour', pat: 'Chameleon 39' },
                { date: '12 APR', event: 'Thursday Doubles', type: 'LEAGUE', high: 238, series: 851, ball: 'Phaze II', pat: 'House 40ft' },
                { date: '07 APR', event: 'Spring Classic',   type: 'TOURNEY', high: 267, series: 1304, ball: 'Phaze II', pat: 'Viper 36' },
              ].map((s, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '64px 1fr auto auto',
                  alignItems: 'center', gap: 12, padding: '13px 0',
                  borderBottom: i === 3 ? 'none' : '1px solid var(--line-soft)',
                }}>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700 }}>{s.date}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="script" style={{ fontSize: 16, color: 'var(--text-0)' }}>{s.event}</span>
                      <span className="chip" style={{ background: s.type === 'LEAGUE' ? 'rgba(0,224,255,0.10)' : s.type === 'TOURNEY' ? 'rgba(255,46,110,0.10)' : 'var(--bg-2)' }}>{s.type}</span>
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>
                      {s.ball} · {s.pat}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="num text-glow-cyan" style={{ fontSize: 18 }}>{s.high}</div>
                    <div className="mono uppercase tracked" style={{ fontSize: 9, color: 'var(--text-3)' }}>HIGH</div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 56 }}>
                    <div className="num" style={{ fontSize: 14, color: 'var(--text-1)' }}>{s.series}</div>
                    <div className="mono uppercase tracked" style={{ fontSize: 9, color: 'var(--text-3)' }}>SERIES</div>
                  </div>
                </div>
              ))}
            </div>

            {/* arsenal + leaks */}
            <div className="card" style={{ padding: 20 }}>
              <div className="between" style={{ marginBottom: 14 }}>
                <span className="script text-glow-pink" style={{ fontSize: 22 }}>In the bag</span>
                <span className="mono uppercase tracked" style={{ fontSize: 10, color: 'var(--text-3)' }}>
                  2 OF 5 ACTIVE
                </span>
              </div>
              {[
                { name: 'Phaze II',  role: 'BENCHMARK', avg: 223, color: '#FF2E6E', primary: true },
                { name: 'IQ Tour',   role: 'STRONG ASYM', avg: 215, color: '#00E0FF' },
              ].map((b, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0',
                  borderTop: i === 0 ? 'none' : '1px solid var(--line-soft)',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: `radial-gradient(circle at 30% 30%, ${b.color}, ${b.color}33 70%)`,
                    border: `1px solid ${b.color}`,
                    flexShrink: 0,
                    boxShadow: `0 0 12px ${b.color}66`,
                  }}/>
                  <div style={{ flex: 1 }}>
                    <div className="script" style={{ fontSize: 16, color: 'var(--text-0)' }}>{b.name}</div>
                    <div className="mono uppercase tracked" style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>
                      {b.role}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="num" style={{
                      fontSize: 16,
                      color: b.primary ? 'var(--accent)' : 'var(--accent-2)',
                      textShadow: b.primary ? 'var(--neon-glow-pink)' : 'var(--neon-glow-cyan)',
                    }}>{b.avg}</div>
                    <div className="mono uppercase tracked" style={{ fontSize: 9, color: 'var(--text-3)' }}>AVG</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line-soft)' }}>
                <div className="marquee text-glow-pink" style={{ fontSize: 10, marginBottom: 10 }}>
                  TOP 3 LEAKS · 90 DAY
                </div>
                {[
                  ['10-pin conversion', '+6.2', 80],
                  ['open in frame 10',  '+3.1', 40],
                  ['fatigue after fr 7','+2.4', 30],
                ].map(([k, v, w], i) => (
                  <div key={k} style={{ marginBottom: i === 2 ? 0 : 10 }}>
                    <div className="between" style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-1)' }}>{k}</span>
                      <span className="num text-glow-pink" style={{ fontSize: 12 }}>{v}</span>
                    </div>
                    <div style={{ height: 3, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        width: `${w}%`, height: '100%',
                        background: 'var(--accent)',
                        boxShadow: 'var(--neon-glow-pink)',
                      }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ═══════════════ MOBILE PULSE (Retro) ═══════════════
function Retro_Pulse_M({ theme = 'retro-dark' }) {
  return (
    <div className="theme-root retro" data-theme={theme}>
      {/* status bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        padding: '10px 20px 4px',
        fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
        color: 'var(--text-1)', fontWeight: 600,
      }}>
        <span>9:41</span>
        <span style={{ color: 'var(--text-2)' }}>● ● ● ▮▮▮▮</span>
      </div>

      {/* top bar */}
      <div className="between" style={{ padding: '14px 20px 12px' }}>
        <RetroLogo size={26}/>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ color: 'var(--text-2)', fontSize: 16 }}>⌕</span>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--grad-accent)', color: '#FFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 12, fontFamily: 'Bungee',
            boxShadow: 'var(--neon-glow-pink)',
          }}>CM</div>
        </div>
      </div>

      {/* scrollable body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 100px' }} className="no-scrollbar">
        <div className="marquee text-glow-pink" style={{ fontSize: 10, padding: '8px 4px' }}>
          TUE · APR 23 · EVENING
        </div>

        {/* hero */}
        <div className="card scanlines" style={{
          padding: 20, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--bg-1) 0%, #261538 100%)',
          borderColor: 'var(--accent-line)',
        }}>
          <div className="between">
            <span className="marquee text-glow-pink" style={{ fontSize: 10 }}>
              30-DAY AVG
            </span>
            <span className="chip" style={{
              background: 'var(--accent)', color: '#FFF', borderColor: 'var(--accent)',
              boxShadow: 'var(--neon-glow-pink)',
            }}>▲ 9</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 10 }}>
            <span className="num text-glow-cyan" style={{
              fontSize: 88, lineHeight: 1,
              textShadow: '0 0 18px rgba(0,224,255,0.5), 0 0 36px rgba(0,224,255,0.25)',
            }}>213</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="mono uppercase tracked" style={{ fontSize: 9, color: 'var(--text-3)' }}>PEAK</span>
              <span className="num text-glow-pink" style={{ fontSize: 18 }}>267</span>
            </div>
          </div>

          {/* mini scoresheet */}
          <div style={{
            marginTop: 16,
            display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)',
            border: '1px solid var(--accent-line)', borderRadius: 4,
            overflow: 'hidden',
          }}>
            {[['X','',30],['9','/',49],['X','',78],['8','1',87],['X','',117],['X','',145],['9','/',163],['X','',183],['X','',203],['X','',238]].map(([b1, b2, sc], i) => (
              <div key={i} style={{
                borderRight: i === 9 ? 'none' : '1px solid var(--line-soft)',
                padding: '4px 2px 5px',
                background: b1 === 'X' ? 'rgba(0,224,255,0.05)' : 'transparent',
              }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 1, minHeight: 11 }}>
                  <span className="marquee text-glow-cyan" style={{ fontSize: 8 }}>{b1}</span>
                  <span className="marquee text-glow-cyan" style={{ fontSize: 8 }}>{b2}</span>
                </div>
                <div className="num" style={{ fontSize: 11, color: 'var(--text-0)', textAlign: 'center' }}>{sc}</div>
              </div>
            ))}
          </div>
          <div className="mono uppercase tracked" style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 6, textAlign: 'center' }}>
            LAST GAME · 245 · thu apr 19
          </div>
        </div>

        {/* AI coach */}
        <div className="card" style={{
          padding: 16, marginTop: 12,
          background: 'linear-gradient(180deg, rgba(255,46,110,0.10), transparent)',
          borderColor: 'var(--accent-line)',
        }}>
          <div className="between" style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="text-glow-pink" style={{ fontSize: 14 }}>✦</span>
              <span className="marquee text-glow-pink" style={{ fontSize: 10 }}>COACH</span>
            </div>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>DAILY</span>
          </div>
          <div className="script" style={{ fontSize: 19, color: 'var(--text-0)', lineHeight: 1.3 }}>
            Your 10-pin is costing you <span className="text-glow-pink">6.2 pins/game</span>.
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-1)', marginTop: 6, lineHeight: 1.5 }}>
            Tap to see drill plan.
          </div>
        </div>

        {/* metric row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          <RetroMetric label="STRIKE %" value="42" delta="4.1" deltaDir="up" neon="cyan"/>
          <RetroMetric label="SPARE %" value="84" delta="1.2" deltaDir="up"/>
          <RetroMetric label="CLEAN %" value="68" delta="2.4" deltaDir="down"/>
          <RetroMetric label="1ST BALL" value="8.9" delta="0.3" deltaDir="up" neon="pink"/>
        </div>

        {/* recent sessions */}
        <div className="marquee text-glow-pink" style={{ fontSize: 10, padding: '20px 4px 10px' }}>
          RECENT SESSIONS
        </div>
        {[
          { date: '19', mon: 'APR', event: 'Thursday Doubles', type: 'LEAGUE', high: 245, series: 685 },
          { date: '16', mon: 'APR', event: 'Practice',         type: 'PRACTICE', high: 221, series: 612 },
          { date: '12', mon: 'APR', event: 'Thursday Doubles', type: 'LEAGUE', high: 238, series: 851 },
        ].map((s, i) => (
          <div key={i} className="card" style={{
            padding: 14, marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 48, textAlign: 'center', flexShrink: 0,
              borderRight: '1px solid var(--line-soft)', paddingRight: 12,
            }}>
              <div className="num text-glow-cyan" style={{ fontSize: 20, lineHeight: 1 }}>{s.date}</div>
              <div className="mono uppercase tracked" style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>{s.mon}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="script" style={{ fontSize: 16, color: 'var(--text-0)', lineHeight: 1.2 }}>{s.event}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <span className="chip" style={{ background: s.type === 'LEAGUE' ? 'rgba(0,224,255,0.10)' : 'var(--bg-2)' }}>{s.type}</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>series {s.series}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="num text-glow-cyan" style={{ fontSize: 18 }}>{s.high}</div>
              <div className="mono uppercase tracked" style={{ fontSize: 9, color: 'var(--text-3)' }}>HIGH</div>
            </div>
          </div>
        ))}
      </div>

      {/* bottom nav */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: '#14091E', borderTop: '1px solid var(--accent-line)',
        padding: '10px 8px 22px',
        display: 'flex', justifyContent: 'space-around',
      }}>
        {[['◉', 'PULSE', true], ['▶', 'PLAY', false], ['◐', 'GEAR', false], ['△', 'STATS', false], ['≡', 'MORE', false]].map(([ic, label, on]) => (
          <div key={label} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: on ? 'var(--accent)' : 'var(--text-3)',
            textShadow: on ? 'var(--neon-glow-pink)' : 'none',
          }}>
            <span style={{ fontSize: 16 }}>{ic}</span>
            <span className="marquee" style={{ fontSize: 8 }}>{label}</span>
          </div>
        ))}
        <div style={{
          position: 'absolute', right: 16, top: -26,
          width: 52, height: 52, borderRadius: 26,
          background: 'var(--accent)', color: '#FFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 700, fontFamily: 'Bungee',
          boxShadow: 'var(--neon-glow-pink), 0 8px 24px rgba(255,46,110,0.5)',
        }}>＋</div>
      </div>
    </div>
  );
}

window.Retro_Pulse_D = Retro_Pulse_D;
window.Retro_Pulse_M = Retro_Pulse_M;
