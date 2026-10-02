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
  BrandLogoLockup,
} from '@bamboo/ui-kit';

interface IntelCable {
  faction: string;
  sigil: React.ComponentType<{ size?: number }>;
  code: string;
  tag: string;
  tagColor: string;
  borderColor: string;
  text: string;
}

const INTEL_FEEDS: Record<string, IntelCable[]> = {
  sc1: [
    {
      faction: 'WESTERN · MARITIME & TECH ALLIANCE',
      sigil: SigilWest,
      code: 'CABLE #W-811',
      tag: 'ÁP LỰC FONOP & CÁP',
      tagColor: '#93C5FD',
      borderColor: 'rgba(107,135,180,0.35)',
      text: 'Đề xuất tài trợ toàn phần tuyến cáp quang tốc độ cao; yêu cầu trạm cập bờ độc quyền và quyền miễn trừ kiểm toán an ninh mạng quốc gia.',
    },
    {
      faction: 'NEIGHBORING · REGIONAL SECURITY',
      sigil: SigilNeighbor,
      code: 'DISPATCH #N-402',
      tag: 'CẢNH BÁO ĐỊA CHÍNH TRỊ',
      tagColor: '#FCA5A5',
      borderColor: 'rgba(138,47,55,0.4)',
      text: 'Cảnh báo nguy cơ mất cân bằng an ninh khu vực; chuẩn bị phương án siết chặt thông quan biên mậu nếu Việt Nam thỏa hiệp độc quyền với bên thứ ba.',
    },
    {
      faction: 'UNITED NATIONS · UNCLOS TRIBUNAL',
      sigil: SigilUN,
      code: 'BRIEF #UN-109',
      tag: 'THƯỢNG TÔN LUẬT PHÁP',
      tagColor: '#FDE68A',
      borderColor: 'rgba(216,180,109,0.35)',
      text: 'Nhấn mạnh Công ước LHQ về Luật Biển (UNCLOS 1982) bảo đảm quyền tự chủ vùng đặc quyền kinh tế và tính mở của hạ tầng cáp ngầm quốc tế.',
    },
    {
      faction: 'VIETNAMESE CITIZENS · SOVEREIGN WILL',
      sigil: SigilVN,
      code: 'MEMO #VN-DOMESTIC',
      tag: 'TỰ CHỦ DỮ LIỆU SỐ',
      tagColor: '#86EFAC',
      borderColor: 'rgba(47,125,98,0.4)',
      text: 'Ý chí toàn dân kiên định: Chủ quyền không gian số là bộ phận bất khả xâm phạm của chủ quyền quốc gia — Độc lập, tự chủ, tự lực cánh sinh.',
    },
  ],
  sc2: [
    {
      faction: 'WESTERN · DIPLOMATIC BLOC',
      sigil: SigilWest,
      code: 'CABLE #W-923',
      tag: 'VẬN ĐỘNG HÀNH LANG',
      tagColor: '#93C5FD',
      borderColor: 'rgba(107,135,180,0.35)',
      text: 'Đại sứ quán phương Tây tăng cường tiếp xúc song phương; thúc đẩy bỏ phiếu Thuận nhằm cô lập Quốc gia K và đe dọa các biện pháp trừng phạt thứ cấp.',
    },
    {
      faction: 'NEIGHBORING & HISTORIC PARTNERS',
      sigil: SigilNeighbor,
      code: 'DISPATCH #N-518',
      tag: 'QUAN SÁT LẬP TRƯỜNG',
      tagColor: '#FCA5A5',
      borderColor: 'rgba(138,47,55,0.4)',
      text: 'Theo dõi chặt chẽ tiến trình bỏ phiếu tại New York; ghi nhận sự ủng hộ truyền thống và khuyến cáo thận trọng trước tiền lệ can thiệp đơn phương.',
    },
    {
      faction: 'UN GENERAL ASSEMBLY · SECRETARIAT',
      sigil: SigilUN,
      code: 'BRIEF #UN-244',
      tag: 'CỨU TRỢ NHÂN ĐẠO',
      tagColor: '#FDE68A',
      borderColor: 'rgba(216,180,109,0.35)',
      text: 'Chủ tịch ĐHĐ kêu gọi các bên ngừng bắn ngay lập tức, mở hành lang nhân đạo và giải quyết tranh chấp bằng đàm phán trên nền tảng Hiến chương LHQ.',
    },
    {
      faction: 'VIETNAMESE CITIZENS · MORAL FIBER',
      sigil: SigilVN,
      code: 'MEMO #VN-ETHICS',
      tag: 'CÓ LÝ, CÓ TÌNH',
      tagColor: '#86EFAC',
      borderColor: 'rgba(47,125,98,0.4)',
      text: 'Truyền thống nghĩa tình thủy chung với bạn bè quốc tế song hành cùng lòng tôn trọng công lý quốc tế — Kiên quyết không chọn phe, chọn chính nghĩa.',
    },
  ],
  sc3: [
    {
      faction: 'WESTERN · JETP FINANCIAL CONSORTIUM',
      sigil: SigilWest,
      code: 'CABLE #W-775',
      tag: 'ĐIỀU KIỆN TÍN DỤNG',
      tagColor: '#93C5FD',
      borderColor: 'rgba(107,135,180,0.35)',
      text: 'Đề xuất 15,5 tỷ USD chuyển đổi xanh nhưng 70% là vay thương mại lãi suất nổi; yêu cầu quyền giám sát và định giá thị trường điều độ điện lực.',
    },
    {
      faction: 'NEIGHBORING · ENERGY ALLIANCE',
      sigil: SigilNeighbor,
      code: 'DISPATCH #N-331',
      tag: 'AN NINH NĂNG LƯỢNG',
      tagColor: '#FCA5A5',
      borderColor: 'rgba(138,47,55,0.4)',
      text: 'Sẵn sàng ký kết thỏa thuận cung ứng nhiên liệu phụ trợ và chuyển giao công nghệ điện sạch khu vực nếu các điều kiện JETP gây bất lợi cho Việt Nam.',
    },
    {
      faction: 'UN FRAMEWORK CONVENTION (UNFCCC)',
      sigil: SigilUN,
      code: 'BRIEF #UN-502',
      tag: 'CÔNG BẰNG KHÍ HẬU',
      tagColor: '#FDE68A',
      borderColor: 'rgba(216,180,109,0.35)',
      text: 'Nhắc lại nguyên tắc "Trách nhiệm chung nhưng có phân biệt"; tài chính khí hậu quốc tế phải là trách nhiệm hỗ trợ không hoàn lại, không tạo gánh nặng nợ.',
    },
    {
      faction: 'VIETNAMESE CITIZENS & SCIENTISTS',
      sigil: SigilVN,
      code: 'MEMO #VN-ENERGY',
      tag: 'NỘI LỰC LÀ THEN CHỐT',
      tagColor: '#86EFAC',
      borderColor: 'rgba(47,125,98,0.4)',
      text: 'Giữ vững an ninh năng lượng là xương sống phát triển quốc gia; kết hợp sức mạnh dân tộc với sức mạnh thời đại — Nội lực quyết định, ngoại lực là quan trọng.',
    },
  ],
};

const DEFAULT_INTEL_FEEDS: IntelCable[] = INTEL_FEEDS['sc1']!;

export function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [session, setSession] = useState<any>(null);
  const [scenario, setScenario] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [presence, setPresence] = useState<any>({ onlineSeats: 0, captainReadyCount: 0 });
  const [remainingSec, setRemainingSec] = useState(45);
  const [blackSwanBanner, setBlackSwanBanner] = useState<any>(null);
  const [roundDecisions, setRoundDecisions] = useState<Record<string, any>>({});

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
      if (data.roundDecisions) {
        setRoundDecisions(data.roundDecisions);
      }
    });

    s.on('round.opened', (data: any) => {
      setSession(data.session);
      setScenario(data.scenario);
      setRemainingSec(data.durationSeconds || 45);
      setBlackSwanBanner(null);
      setRoundDecisions({});
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

    s.on('group.decision.locked', (data: any) => {
      setRoundDecisions((prev) => ({
        ...prev,
        [data.groupId]: { isLocked: true },
      }));
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

  const activeCables: IntelCable[] = (scenario?.id && INTEL_FEEDS[scenario.id]) ? INTEL_FEEDS[scenario.id]! : DEFAULT_INTEL_FEEDS;

  return (
    <div className="stage" role="img" aria-label="Public situation room projector display">
      {/* Top Bar */}
      <header className="topbar">
        <div className="brand" style={{ display: 'flex', alignItems: 'center' }}>
          <BrandLogoLockup height={42} subtitle="KỶ NGUYÊN ĐA CỰC · PHÒNG TÁC CHIẾN CHIẾN LƯỢC" />
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
            width={260}
            height={260}
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
              BẢNG XẾP HẠNG TRỰC TIẾP
            </h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-gold-300)', background: 'rgba(243, 202, 104, 0.12)', padding: '3px 8px', borderRadius: 999, border: '1px solid rgba(243, 202, 104, 0.3)' }}>
              TRỰC TIẾP
            </span>
          </div>

          <div className="leaderboard-list">
            {leaderboard.length > 0 ? (
              leaderboard.map((item, idx) => {
                const displayName = item.name || item.groupId;
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
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14.5, color: '#FFFFFF' }}>
                        {displayName}
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 3, alignItems: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 6px', borderRadius: 4, background: 'rgba(16, 185, 129, 0.18)', border: '1px solid rgba(16, 185, 129, 0.45)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: '#86EFAC' }}>
                          <span style={{ fontSize: 9, opacity: 0.8 }}>TC</span> {item.axes?.autonomy ?? 50}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 6px', borderRadius: 4, background: 'rgba(245, 158, 11, 0.18)', border: '1px solid rgba(245, 158, 11, 0.45)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: '#FDE047' }}>
                          <span style={{ fontSize: 9, opacity: 0.8 }}>KT</span> {item.axes?.economy ?? 50}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 6px', borderRadius: 4, background: 'rgba(56, 189, 248, 0.18)', border: '1px solid rgba(56, 189, 248, 0.45)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: '#7DD3FC' }}>
                          <span style={{ fontSize: 9, opacity: 0.8 }}>UT</span> {item.axes?.prestige ?? 50}
                        </span>
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
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94A3B8', fontStyle: 'italic', fontSize: 13 }}>
                Chưa có đội tham gia. Đang chờ các đội kết nối...
              </div>
            )}
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
            {/* Live Strategic Intelligence Wire */}
            <Panel variant="standard" style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 2, color: 'var(--color-gold-300)', fontWeight: 700 }}>
                  PHẢN ỨNG QUỐC TẾ & ĐIỆN MẬT TÌNH BÁO
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                  ĐIỆN MẬT 24/7
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, flex: 1 }}>
                {activeCables.map((cable, idx) => {
                  const SigilComp = cable.sigil;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: 2,
                        padding: '4px 8px',
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.02)',
                        border: `1px solid ${cable.borderColor}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <SigilComp size={16} />
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: '#E2E8F0', letterSpacing: 0.2 }}>
                            {cable.faction}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#94A3B8' }}>{cable.code}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, fontWeight: 700, color: cable.tagColor, background: 'rgba(255,255,255,0.06)', padding: '1px 4px', borderRadius: 3 }}>
                            {cable.tag}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: '#CBD5E1', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {cable.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel variant="standard" style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, color: 'var(--color-gold-300)', marginBottom: 4, fontWeight: 700 }}>
                NGUYÊN TẮC NGOẠI GIAO HỒ CHÍ MINH
              </div>
              <div style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--color-paper-light)', lineHeight: 1.5 }}>
                "{scenario?.wisdom?.quote || 'Dĩ bất biến, ứng vạn biến. Thực lực là cái chiêng mà ngoại giao là cái tiếng, chiêng có to tiếng mới lớn.'}"
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--color-gold-300)', marginTop: 4, opacity: 0.85 }}>
                {scenario?.wisdom?.source || 'Hồ Chí Minh Toàn tập'}
              </div>
            </Panel>

            <Panel variant="standard" style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, color: 'var(--color-gold-300)', marginBottom: 4, fontWeight: 700 }}>
                TRẠM TÁC CHIẾN HỆ THỐNG
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--color-slate-300)', lineHeight: 1.5 }}>
                <div>Đã khóa phiếu: <b style={{ color: '#86EFAC', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{Object.values(roundDecisions).filter((d: any) => d.isLocked).length}/{leaderboard.length}</b> nhóm</div>
                <div style={{ color: '#94A3B8', marginTop: 2, fontSize: 11 }}>Trực tuyến: <b>{presence.onlineSeats}</b> đại biểu</div>
                <div style={{ color: '#64748B', marginTop: 2, fontSize: 9.5, fontFamily: 'var(--font-mono)' }}>Server 2 OCI · Đồng bộ thời gian thực</div>
              </div>
            </Panel>
          </>
        )}
      </footer>
    </div>
  );
}
