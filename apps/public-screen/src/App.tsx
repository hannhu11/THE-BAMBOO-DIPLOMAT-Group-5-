import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Panel,
  Timer,
  Icon,
  SovereigntyRadar,
  VolumeToggle,
  DecryptedText,
  audioEngine,
  SigilWest,
  SigilNeighbor,
  SigilUN,
  SigilVN,
} from '@bamboo/ui-kit';

export function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [session, setSession] = useState<any>(null);
  const [scenario, setScenario] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [presence, setPresence] = useState<any>({ onlineSeats: 0, captainReadyCount: 0 });
  const [remainingSec, setRemainingSec] = useState(45);
  const [blackSwanBanner, setBlackSwanBanner] = useState<any>(null);

  // Compute average axes for class
  const [avgAxes, setAvgAxes] = useState({ autonomy: 50, economy: 50, prestige: 50 });

  useEffect(() => {
    const s = io({
      path: '/socket.io/',
      auth: { role: 'screen' },
    });

    s.on('session.synced', (data: any) => {
      setSession(data.session);
      setScenario(data.currentScenario);
      setLeaderboard(data.leaderboard || []);
      setPresence(data.presence || { onlineSeats: 0, captainReadyCount: 0 });
    });

    s.on('round.opened', (data: any) => {
      setSession(data.session);
      setScenario(data.scenario);
      setRemainingSec(data.durationSeconds || 45);
      setBlackSwanBanner(null);
      audioEngine.playGong();
    });

    s.on('round.locked', (data: any) => {
      setSession(data.session);
      audioEngine.playStamp();
    });

    s.on('round.revealed', (data: any) => {
      setSession(data.session);
      setLeaderboard(data.leaderboard || []);
      audioEngine.playFanfare();
    });

    s.on('leaderboard.updated', (lb: any) => {
      setLeaderboard(lb);
      if (lb && lb.length > 0) {
        const sumA = lb.reduce((acc: number, item: any) => acc + (item.axes?.autonomy || 50), 0);
        const sumE = lb.reduce((acc: number, item: any) => acc + (item.axes?.economy || 50), 0);
        const sumP = lb.reduce((acc: number, item: any) => acc + (item.axes?.prestige || 50), 0);
        setAvgAxes({
          autonomy: Math.round(sumA / lb.length),
          economy: Math.round(sumE / lb.length),
          prestige: Math.round(sumP / lb.length),
        });
      }
    });

    s.on('presence.updated', (p: any) => {
      setPresence(p);
    });

    s.on('banner.pushed', (banner: any) => {
      setBlackSwanBanner(banner);
      audioEngine.playSiren();
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Timer countdown with audio tension
  useEffect(() => {
    if (session?.status !== 'round_open' || remainingSec <= 0) return;
    if (remainingSec === 10 || remainingSec === 5 || remainingSec === 3 || remainingSec === 1) {
      audioEngine.playHeartbeat();
    }
    const interval = setInterval(() => {
      setRemainingSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.status, remainingSec]);

  return (
    <div className="stage" role="img" aria-label="Public situation room projector display">
      {/* Top Bar */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Icon name="autonomy" size={24} />
          </div>
          <div>
            <h1 className="brand-h1">THE BAMBOO DIPLOMAT</h1>
            <div className="brand-sub">SITUATION ROOM · MULTIPOLAR ERA</div>
          </div>
        </div>

        <div className="phase-strip">
          {[1, 2, 3].map((r) => {
            const currentR = session?.currentRound || 1;
            const isDone = r < currentR;
            const isNow = r === currentR;
            return (
              <div
                key={r}
                className={`phase-pill ${isNow ? 'now' : ''} ${isDone ? 'done' : ''}`}
              >
                PHASE 0{r}
              </div>
            );
          })}
        </div>

        <div className="metrics" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <VolumeToggle />
          <div>
            <span style={{ fontSize: 10, color: 'var(--color-slate-300)', letterSpacing: 2 }}>
              ONLINE / 34
            </span>
            <div className="metric-v">
              {presence.onlineSeats} <small style={{ fontSize: 14, color: 'var(--color-slate-500)' }}>/ 34</small>
            </div>
          </div>

          <Timer secondsLeft={remainingSec} size="lg" />
        </div>
      </header>

      {/* Main Grid */}
      <main className="main-grid">
        {/* Left: Scenario & Axes */}
        <Panel variant="elevated" className="scenario-stage">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--color-gold-300)', letterSpacing: 4 }}>
            {scenario ? `TÌNH HUỐNG CHIẾN LƯỢC · ${scenario.principle}` : 'PHÒNG ĐIỀU HÀNH CHIẾN LƯỢC'}
          </div>

          <h2>{scenario ? <DecryptedText text={scenario.title} speed={30} /> : 'Chờ bắt đầu phiên mô phỏng...'}</h2>

          <p>{scenario?.context}</p>

          {/* Strategic Axes */}
          <div className="axes-grid">
            <div className="axis-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: 2, color: 'var(--color-gold-300)', fontWeight: 700 }}>
                  TỰ CHỦ (GỐC VỮNG)
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: '#86EFAC' }}>
                  {avgAxes.autonomy}<small style={{ fontSize: 13, color: '#94A3B8' }}>/100</small>
                </span>
              </div>
              <div className="axis-bar">
                <div
                  className="axis-fill"
                  style={{
                    width: `${avgAxes.autonomy}%`,
                    background: 'linear-gradient(90deg, #059669 0%, #10B981 70%, #6EE7B7 100%)',
                    boxShadow: '0 0 12px rgba(16, 185, 129, 0.6)',
                  }}
                />
              </div>
            </div>

            <div className="axis-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: 2, color: 'var(--color-gold-300)', fontWeight: 700 }}>
                  KINH TẾ (THÂN CHẮC)
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: '#FDE047' }}>
                  {avgAxes.economy}<small style={{ fontSize: 13, color: '#94A3B8' }}>/100</small>
                </span>
              </div>
              <div className="axis-bar">
                <div
                  className="axis-fill"
                  style={{
                    width: `${avgAxes.economy}%`,
                    background: 'linear-gradient(90deg, #D97706 0%, #F59E0B 70%, #FDE68A 100%)',
                    boxShadow: '0 0 12px rgba(245, 158, 11, 0.6)',
                  }}
                />
              </div>
            </div>

            <div className="axis-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: 2, color: 'var(--color-gold-300)', fontWeight: 700 }}>
                  UY TÍN (CÀNH UYỂN CHUYỂN)
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: '#7DD3FC' }}>
                  {avgAxes.prestige}<small style={{ fontSize: 13, color: '#94A3B8' }}>/100</small>
                </span>
              </div>
              <div className="axis-bar">
                <div
                  className="axis-fill"
                  style={{
                    width: `${avgAxes.prestige}%`,
                    background: 'linear-gradient(90deg, #0284C7 0%, #38BDF8 70%, #BAE6FD 100%)',
                    boxShadow: '0 0 12px rgba(56, 189, 248, 0.6)',
                  }}
                />
              </div>
            </div>
          </div>
        </Panel>

        {/* Center: 360° Sovereignty & Submarine Cable Radar */}
        <Panel variant="elevated" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 10px', position: 'relative' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '0 6px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--color-gold-300)', letterSpacing: 2.5, fontWeight: 700 }}>
              RADAR CHỦ QUYỀN BIỂN ĐÔNG
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: blackSwanBanner ? '#EF4444' : '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: blackSwanBanner ? '#EF4444' : '#10B981', boxShadow: blackSwanBanner ? '0 0 6px #EF4444' : '0 0 6px #10B981' }} />
              {blackSwanBanner ? 'BÁO ĐỘNG ĐỎ' : 'GIÁM SÁT 24/7'}
            </span>
          </div>

          <SovereigntyRadar
            width={340}
            height={340}
            isCrisis={Boolean(blackSwanBanner)}
          />

          <div style={{ marginTop: 8, width: '100%', display: 'flex', justifyContent: 'space-around', fontFamily: 'var(--font-mono)', fontSize: 9.5, color: '#94A3B8', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 6 }}>
            <span>HOÀNG SA: BÌNH THƯỜNG</span>
            <span>TRƯỜNG SA: BÌNH THƯỜNG</span>
          </div>
        </Panel>

        {/* Right: Live Leaderboard */}
        <Panel variant="elevated">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              BẢNG XẾP HẠNG (7 NHÓM)
            </h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-gold-300)', background: 'rgba(243, 202, 104, 0.12)', padding: '3px 8px', borderRadius: 999, border: '1px solid rgba(243, 202, 104, 0.3)' }}>
              TRỰC TIẾP
            </span>
          </div>

          <div className="leaderboard-list">
            {leaderboard.map((item, idx) => {
              const factionNames: Record<string, string> = {
                G01: 'Sen Vàng',
                G02: 'Trúc Xanh',
                G03: 'Cương Nhu',
                G04: 'Hòa Hiếu',
                G05: 'Độc Lập',
                G06: 'Tự Cường',
                G07: 'Đa Phương',
              };
              const faction = factionNames[item.groupId] || item.name || item.groupId;
              const isFirst = idx === 0;

              return (
                <div key={item.groupId} className={`lb-row ${isFirst ? 'top' : ''}`}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: 12,
                      color: isFirst ? '#0A1510' : idx < 3 ? '#E2E8F0' : '#94A3B8',
                      background: isFirst
                        ? 'linear-gradient(180deg, #F3CA68, #D97706)'
                        : idx < 3
                        ? 'rgba(255,255,255,0.1)'
                        : 'transparent',
                      padding: isFirst ? '3px 8px' : '2px 6px',
                      borderRadius: 6,
                      boxShadow: isFirst ? '0 0 10px rgba(243, 202, 104, 0.4)' : undefined,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 40,
                    }}
                  >
                    {isFirst ? 'TOP 1' : `0${item.rank}`}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#FFFFFF' }}>
                      {item.groupId} · {faction}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: '#94A3B8', letterSpacing: 0.5, marginTop: 2 }}>
                      <span style={{ color: '#86EFAC' }}>TC: {item.axes?.autonomy}</span> ·{' '}
                      <span style={{ color: '#FDE047' }}>KT: {item.axes?.economy}</span> ·{' '}
                      <span style={{ color: '#7DD3FC' }}>UT: {item.axes?.prestige}</span>
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 20,
                      fontWeight: 800,
                      color: isFirst ? '#F3CA68' : '#FFFFFF',
                      textShadow: isFirst ? '0 0 10px rgba(243, 202, 104, 0.4)' : 'none',
                    }}
                  >
                    {item.score}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </main>

      {/* Bottom Rail: Feed and Black Swan Alert */}
      <footer className="bottom-rail">
        {blackSwanBanner ? (
          <div className="blackswan-banner" style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'center', gap: 24, padding: '18px 24px', position: 'relative', overflow: 'hidden' }}>
            <svg width="68" height="68" viewBox="0 0 300 200" fill="#0B0808" stroke="#E8C2A6" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M0 180 C 40 120 120 100 180 130 C 210 110 240 92 270 96 C 260 106 244 112 236 116 C 260 120 280 132 290 152 C 260 148 232 152 210 168 C 180 190 130 200 90 194 C 60 190 30 190 0 180 Z" />
              <circle cx="272" cy="98" r="4" fill="#E8C2A6" />
              <path d="M262 108 L272 108" stroke="#8A2F37" strokeWidth="3" />
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 3, color: '#E8C2A6', fontWeight: 700 }}>
                BIẾN CỐ THIÊN NGA ĐEN (BLACK SWAN CRISIS)
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', margin: '4px 0', color: '#F3EEDC', fontSize: 20 }}>
                {blackSwanBanner.title}
              </h2>
              <p style={{ margin: 0, color: 'var(--color-slate-300)', fontSize: 13.5 }}>
                {blackSwanBanner.narrative}
              </p>
            </div>
          </div>
        ) : (
          <>
            <Panel variant="standard" style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2, color: 'var(--color-gold-300)', fontWeight: 700 }}>
                  PHẢN ỨNG QUỐC TẾ (REACTION FEED)
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                  TÌNH BÁO
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(107,135,180,0.2)' }}>
                  <SigilWest size={26} />
                  <div style={{ fontSize: 11.5, color: 'var(--color-slate-300)', lineHeight: 1.35 }}>
                    <b style={{ color: '#C7D3E5' }}>Phương Tây:</b> Giám sát tự do hàng hải & quyền khai thác trạm cáp biển.
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(138,47,55,0.25)' }}>
                  <SigilNeighbor size={26} />
                  <div style={{ fontSize: 11.5, color: 'var(--color-slate-300)', lineHeight: 1.35 }}>
                    <b style={{ color: '#E8C2A6' }}>Láng Giềng:</b> Cảnh báo nguy cơ mất thăng bằng nếu ký kết liên minh quân sự.
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(95,114,132,0.25)' }}>
                  <SigilUN size={26} />
                  <div style={{ fontSize: 11.5, color: 'var(--color-slate-300)', lineHeight: 1.35 }}>
                    <b style={{ color: '#DAD6C4' }}>Liên Hợp Quốc:</b> Đề xuất giải quyết hòa bình trên cơ sở UNCLOS 1982.
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(47,125,98,0.3)' }}>
                  <SigilVN size={26} />
                  <div style={{ fontSize: 11.5, color: 'var(--color-slate-300)', lineHeight: 1.35 }}>
                    <b style={{ color: '#C7E1CE' }}>Nhân Dân VN:</b> Kiên định ngoại giao Cây Tre — Giữ độc lập, chủ quyền là trên hết.
                  </div>
                </div>
              </div>
            </Panel>

            <Panel variant="standard">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2, color: 'var(--color-gold-300)', marginBottom: 8 }}>
                NGUYÊN TẮC NGOẠI GIAO HỒ CHÍ MINH
              </div>
              <div style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--color-paper-light)', lineHeight: 1.6 }}>
                "Dĩ bất biến, ứng vạn biến. Thực lực là cái chiêng mà ngoại giao là cái tiếng, chiêng có to tiếng mới lớn."
              </div>
            </Panel>

            <Panel variant="standard">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2, color: 'var(--color-gold-300)', marginBottom: 8 }}>
                TIẾN ĐỘ BIỂU QUYẾT
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-slate-300)' }}>
                <div>Số nhóm đã khóa phiếu: <b>{leaderboard.length}/7</b></div>
                <div style={{ marginTop: 6 }}>Tất cả các quyết định được xử lý tập trung trên Server 2 OCI.</div>
              </div>
            </Panel>
          </>
        )}
      </footer>
    </div>
  );
}
