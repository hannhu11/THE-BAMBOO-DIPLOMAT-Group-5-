import React, { useState, useRef, useEffect } from 'react';
import { CardType } from '@bamboo/domain-types';
import { TacticalCard, audioEngine } from '@bamboo/ui-kit';

export interface StrategicLuckyWheelProps {
  assignedCards: CardType[];
  onComplete: () => void;
}

interface WheelCardItem {
  id: CardType;
  name: string;
  wheelLabel: string;
  category: 'attack' | 'defense' | 'utility';
  categoryTitle: string;
  requirement: string;
  color: string;
  textColor: string;
  accentColor: string;
  description: string;
  image: string;
}

export const ALL_9_CARDS: WheelCardItem[] = [
  {
    id: 'break_supply',
    name: 'Bẻ Gãy Chuỗi Cung Ứng',
    wheelLabel: 'BẺ GÃY CUNG ỨNG',
    category: 'attack',
    categoryTitle: 'TẤN CÔNG NGOẠI GIAO',
    requirement: 'KINH TẾ ≥ 7',
    color: '#8E6A24',
    textColor: '#FBF8EE',
    accentColor: '#F3CA68',
    description: 'Phong tỏa đối trọng: Đóng băng quyền kích hoạt thẻ bài của 1 đội đối thủ trong câu hỏi hiện tại.',
    image: '/cards/break_supply.jpg',
  },
  {
    id: 'di_bat_bien',
    name: 'Dĩ Bất Biến, Ứng Vạn Biến',
    wheelLabel: 'DĨ BẤT BIẾN',
    category: 'defense',
    categoryTitle: 'PHÒNG THỦ CHIẾN LƯỢC',
    requirement: 'TỰ CHỦ ≥ 7',
    color: '#1C5C47',
    textColor: '#E6F4EA',
    accentColor: '#34D399',
    description: 'Vô hiệu hóa 100% mọi delta âm (Δ- TC = 0) của trục Tự Chủ trong câu hỏi này dù chịu sức ép địa chính trị.',
    image: '/cards/di_bat_bien.png',
  },
  {
    id: 'cau_dong_ton_di',
    name: 'Cầu Đồng Tồn Dị',
    wheelLabel: 'CẦU ĐỒNG TỒN DỊ',
    category: 'utility',
    categoryTitle: 'NGOẠI GIAO ĐA PHƯƠNG',
    requirement: 'UY TÍN ≥ 7',
    color: '#1E3A8A',
    textColor: '#DBEAFE',
    accentColor: '#60A5FA',
    description: 'Hòa giải đa phương: +2 điểm Uy Tín khi đối thoại hòa bình; thưởng thêm khi liên minh cùng cân bằng.',
    image: '/cards/cau_dong_ton_di.png',
  },
  {
    id: 'counter_tariff',
    name: 'Áp Đặt Thuế Đối Kháng',
    wheelLabel: 'THUẾ ĐỐI KHÁNG',
    category: 'attack',
    categoryTitle: 'TẤN CÔNG NGOẠI GIAO',
    requirement: 'KINH TẾ ≥ 7',
    color: '#A16207',
    textColor: '#FEF3C7',
    accentColor: '#FBBF24',
    description: 'Phòng vệ thương mại WTO: Nhân đôi toàn bộ điểm Kinh Tế (+KT) đạt được trong câu hỏi nếu có lợi ích kinh tế.',
    image: '/cards/counter_tariff.jpg',
  },
  {
    id: 'sovereignty_shield',
    name: 'Vành Đai Độc Lập',
    wheelLabel: 'VÀNH ĐAI ĐỘC LẬP',
    category: 'defense',
    categoryTitle: 'PHÒNG THỦ CHIẾN LƯỢC',
    requirement: 'TỰ CHỦ ≥ 7',
    color: '#065F46',
    textColor: '#D1FAE5',
    accentColor: '#10B981',
    description: 'Lá chắn chủ quyền: Miễn nhiễm hoàn toàn khỏi mọi tác động tiêu cực hoặc biến động trừ điểm trên cả 3 trục.',
    image: '/cards/sovereignty_shield.png',
  },
  {
    id: 'un_resolution',
    name: 'Nghị Quyết ĐHĐ LHQ',
    wheelLabel: 'NGHỊ QUYẾT LHQ',
    category: 'utility',
    categoryTitle: 'NGOẠI GIAO ĐA PHƯƠNG',
    requirement: 'UY TÍN ≥ 7',
    color: '#1E40AF',
    textColor: '#EFF6FF',
    accentColor: '#93C5FD',
    description: 'Chính danh quốc tế: Tranh thủ công lý toàn cầu và UNCLOS 1982, cộng ngay +2 điểm Uy Tín.',
    image: '/cards/un_resolution.png',
  },
  {
    id: 'submarine_cable',
    name: 'Chiếm Lĩnh Cáp Quang Biển',
    wheelLabel: 'CÁP QUANG BIỂN',
    category: 'attack',
    categoryTitle: 'TẤN CÔNG NGOẠI GIAO',
    requirement: 'KINH TẾ ≥ 7',
    color: '#78350F',
    textColor: '#FEF9C3',
    accentColor: '#FDE047',
    description: 'Chớp thời cơ hạ tầng số: Cộng ngay +2 điểm Kinh Tế và làm chủ huyết mạch truyền dẫn dữ liệu.',
    image: '/cards/submarine_cable.jpg',
  },
  {
    id: 'self_reliance',
    name: 'Tự Lực Cánh Sinh',
    wheelLabel: 'TỰ LỰC CÁNH SINH',
    category: 'defense',
    categoryTitle: 'PHÒNG THỦ CHIẾN LƯỢC',
    requirement: 'TỰ CHỦ ≥ 7',
    color: '#047857',
    textColor: '#ECFDF5',
    accentColor: '#6EE7B7',
    description: 'Vận dụng nội lực: Nếu điểm Tự Chủ giảm dưới 7, tự động chuyển đổi 1 điểm KT thành 2 điểm TC an toàn.',
    image: '/cards/self_reliance.png',
  },
  {
    id: 'diplomatic_gong',
    name: 'Tiếng Chiêng Ngoại Giao',
    wheelLabel: 'CHIÊNG NGOẠI GIAO',
    category: 'utility',
    categoryTitle: 'NGOẠI GIAO ĐA PHƯƠNG',
    requirement: 'UY TÍN ≥ 7',
    color: '#0F172A',
    textColor: '#E0F2FE',
    accentColor: '#38BDF8',
    description: 'Tuyên cáo chính nghĩa: Nhân đôi toàn bộ điểm số tổng (TC + KT + UT) nhận được trong lượt này!',
    image: '/cards/diplomatic_gong.png',
  },
];

export const StrategicLuckyWheel: React.FC<StrategicLuckyWheelProps> = ({
  assignedCards,
  onComplete,
}) => {
  // Normalize cards to 3 valid cards
  const targetCards: CardType[] = React.useMemo(() => {
    if (assignedCards && assignedCards.length >= 3) {
      return assignedCards.slice(0, 3);
    }
    // Fallback default set if empty
    return ['break_supply', 'di_bat_bien', 'cau_dong_ton_di'];
  }, [assignedCards]);

  const [currentStep, setCurrentStep] = useState<number>(0); // 0: spin 1, 1: spin 2, 2: spin 3, 3: completed
  const [unlockedCards, setUnlockedCards] = useState<CardType[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [revealedCardModal, setRevealedCardModal] = useState<CardType | null>(null);
  const [hoveredCard, setHoveredCard] = useState<WheelCardItem | null>(null);

  const numSlices = ALL_9_CARDS.length;
  const sliceAngle = 360 / numSlices; // 40 degrees

  // Step information
  const stepTitles = [
    'LƯỢT QUAY 1/3: KHAI THẺ TẤN CÔNG NGOẠI GIAO',
    'LƯỢT QUAY 2/3: KHAI THẺ PHÒNG THỦ CHIẾN LƯỢC',
    'LƯỢT QUAY 3/3: KHAI THẺ NGOẠI GIAO ĐA PHƯƠNG',
    'BỘ 3 BẢO VẬT CHIẾN LƯỢC ĐÃ ĐƯỢC THIẾT LẬP HOÀN TẤT',
  ];

  // Sound ticking timer during spin
  useEffect(() => {
    if (!isSpinning) return;
    let tickCount = 0;
    const interval = setInterval(() => {
      tickCount++;
      if (tickCount < 25) {
        audioEngine.playCardFlip();
      }
    }, 160);

    return () => clearInterval(interval);
  }, [isSpinning]);

  // Handle spin for current step
  const handleSpin = () => {
    if (isSpinning || currentStep >= targetCards.length) return;

    const fallbackId: CardType = 'break_supply';
    const targetCardId: CardType = targetCards[currentStep] || fallbackId;
    const targetIdx = ALL_9_CARDS.findIndex((c) => c.id === targetCardId);
    const validIdx = targetIdx >= 0 ? targetIdx : (currentStep * 3) % 9;

    setIsSpinning(true);
    audioEngine.playCardFlip();

    // Calculate rotation so target slice lands at 12 o'clock (0 degrees)
    // Slices are laid out from 0 to 360. Slice i center is at i * 40 degrees.
    const currentModulo = wheelRotation % 360;
    const desiredModulo = (360 - validIdx * sliceAngle) % 360;
    let delta = desiredModulo - currentModulo;
    if (delta <= 0) delta += 360;

    // Add 5 full rotations (1800 deg) for dramatic spin
    const fullSpins = 5 * 360;
    // Add minor randomized landing offset within slice (+/- 8 deg)
    const jitter = (Math.random() - 0.5) * 16;
    const nextRotation = wheelRotation + fullSpins + delta + jitter;

    setWheelRotation(nextRotation);

    // Stop after 4.8s
    setTimeout(() => {
      setIsSpinning(false);
      audioEngine.playStamp();
      audioEngine.playGong();

      const wonCard: CardType = ALL_9_CARDS[validIdx]?.id || targetCardId;
      setUnlockedCards((prev) => [...prev, wonCard]);
      setRevealedCardModal(wonCard);
      setCurrentStep((prev) => prev + 1);
    }, 4800);
  };

  // Quick auto-spin all remaining
  const handleAutoSpinAll = () => {
    if (isSpinning) return;
    audioEngine.playGong();
    setUnlockedCards(targetCards);
    setCurrentStep(3);
    const lastCard: CardType = targetCards[targetCards.length - 1] || 'break_supply';
    setRevealedCardModal(lastCard);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(145deg, #091A14 0%, #06120D 60%, #030805 100%)',
        color: '#F7F4EA',
        padding: '24px 20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Top Banner Header */}
      <div style={{ textAlign: 'center', marginBottom: 20, maxWidth: 900 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 11.5,
            letterSpacing: 2,
            color: '#D4AF37',
            fontWeight: 800,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          NGHI THỨC NGOẠI GIAO ĐẦU TRẬN · HCM202
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display, serif)',
            fontSize: 32,
            fontWeight: 900,
            color: '#FBF8EE',
            letterSpacing: 0.5,
            textShadow: '0 2px 14px rgba(212, 175, 55, 0.35)',
          }}
        >
          VÒNG QUAY CHIẾN LƯỢC TAM TRỤ
        </h1>
        <p
          style={{
            margin: '8px auto 0',
            fontSize: 13.5,
            color: '#B5C4BC',
            maxWidth: 680,
            lineHeight: 1.5,
          }}
        >
          {stepTitles[currentStep] || stepTitles[0]}
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="strategic-wheel-grid">
        {/* LEFT COLUMN: THE LUCKY WHEEL */}
        <div
          style={{
            background: 'rgba(14, 40, 30, 0.65)',
            border: '1.5px solid rgba(212, 175, 55, 0.35)',
            borderRadius: 24,
            padding: '24px 20px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Wheel Container with Pointer */}
          <div className="strategic-wheel-wrapper">
            {/* Top Indicator Arrow (Kim Chỉ Nam) */}
            <div
              style={{
                position: 'absolute',
                top: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 30,
                width: 0,
                height: 0,
                borderLeft: '14px solid transparent',
                borderRight: '14px solid transparent',
                borderTop: '32px solid #D4AF37',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.75))',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -30,
                  left: -5,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#9E2A2B',
                  border: '1.5px solid #FFFFFF',
                }}
              />
            </div>

            {/* Rotating SVG Wheel */}
            <svg
              className="strategic-wheel-svg"
              viewBox="0 0 440 440"
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                transition: isSpinning
                  ? 'transform 4.8s cubic-bezier(0.12, 0.98, 0.24, 1)'
                  : 'none',
              }}
            >
              <defs>
                <radialGradient id="wheelCenterGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F3CA68" />
                  <stop offset="60%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#8E6A24" />
                </radialGradient>
                <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 9 Slices */}
              {ALL_9_CARDS.map((card, i) => {
                const startAngle = (i * sliceAngle - sliceAngle / 2) * (Math.PI / 180);
                const endAngle = (i * sliceAngle + sliceAngle / 2) * (Math.PI / 180);
                const cx = 220;
                const cy = 220;
                const r = 210;

                const x1 = cx + r * Math.sin(startAngle);
                const y1 = cy - r * Math.cos(startAngle);
                const x2 = cx + r * Math.sin(endAngle);
                const y2 = cy - r * Math.cos(endAngle);

                const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
                const textAngle = i * sliceAngle;

                return (
                  <g key={card.id}>
                    {/* Slice wedge */}
                    <path
                      d={d}
                      fill={card.color}
                      stroke="#D4AF37"
                      strokeWidth="2.5"
                    />

                    {/* Radial text along slice */}
                    <g transform={`translate(${cx}, ${cy}) rotate(${textAngle})`}>
                      <text
                        x="0"
                        y="-120"
                        fill={card.textColor}
                        fontSize="10.5"
                        fontFamily="var(--font-mono, monospace)"
                        fontWeight="800"
                        letterSpacing="0.8"
                        textAnchor="middle"
                        transform="rotate(0)"
                      >
                        {card.wheelLabel}
                      </text>
                      <circle
                        cx="0"
                        y="-185"
                        r="4"
                        fill="#F3CA68"
                        stroke="#241D12"
                        strokeWidth="1"
                      />
                    </g>
                  </g>
                );
              })}

              {/* Outer Golden Studded Rim */}
              <circle
                cx="220"
                cy="220"
                r="212"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="7"
              />
              <circle
                cx="220"
                cy="220"
                r="217"
                fill="none"
                stroke="#F3CA68"
                strokeWidth="1.5"
                strokeDasharray="4 8"
              />

              {/* Center Medallion (Dong Son Hub) */}
              <circle
                cx="220"
                cy="220"
                r="44"
                fill="url(#wheelCenterGrad)"
                stroke="#241D12"
                strokeWidth="3.5"
              />
              <circle
                cx="220"
                cy="220"
                r="36"
                fill="#13271F"
                stroke="#D4AF37"
                strokeWidth="2"
              />
              <polygon
                points="220,196 226,212 242,212 230,222 234,238 220,228 206,238 210,222 198,212 214,212"
                fill="#F3CA68"
              />
            </svg>
          </div>

          {/* Action Spin Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', alignItems: 'center' }}>
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                style={{
                  width: '100%',
                  maxWidth: 340,
                  padding: '16px 24px',
                  borderRadius: 14,
                  fontSize: 16,
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 900,
                  letterSpacing: 1.5,
                  background: isSpinning
                    ? 'rgba(212, 175, 55, 0.4)'
                    : 'linear-gradient(180deg, #F3CA68, #B8860B)',
                  color: '#0E281E',
                  border: '2px solid #F3CA68',
                  cursor: isSpinning ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 20px rgba(212, 175, 55, 0.45)',
                  transition: 'all 0.2s',
                  transform: isSpinning ? 'scale(0.98)' : 'scale(1)',
                }}
              >
                {isSpinning ? 'ĐANG QUAY CHIẾN LƯỢC...' : `QUAY LƯỢT ${currentStep + 1}/3 ➔`}
              </button>
            ) : (
              <button
                type="button"
                onClick={onComplete}
                style={{
                  width: '100%',
                  maxWidth: 360,
                  padding: '16px 24px',
                  borderRadius: 14,
                  fontSize: 15,
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 900,
                  letterSpacing: 1.2,
                  background: 'linear-gradient(180deg, #10B981, #059669)',
                  color: '#FFFFFF',
                  border: '2px solid #34D399',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.45)',
                }}
              >
                TIẾP NHẬN BỘ THẺ & VÀO PHÒNG TÁC CHIẾN ➔
              </button>
            )}

            {currentStep < 3 && (
              <button
                type="button"
                onClick={handleAutoSpinAll}
                disabled={isSpinning}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9EAA9F',
                  fontSize: 12.5,
                  fontFamily: 'var(--font-mono, monospace)',
                  cursor: isSpinning ? 'not-allowed' : 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Mở nhanh cả 3 lượt quay
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: KHO TÀNG 9 BẢO VẬT CHIẾN LƯỢC */}
        <div
          style={{
            background: 'rgba(14, 40, 30, 0.7)',
            border: '1.5px solid rgba(212, 175, 55, 0.3)',
            borderRadius: 24,
            padding: '24px 22px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55)',
            maxHeight: 640,
            overflowY: 'auto',
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 10.5,
                fontWeight: 800,
                color: '#D4AF37',
                letterSpacing: 1.5,
                textTransform: 'uppercase',
              }}
            >
              DANH MỤC THÔNG SỐ VÒNG QUAY
            </div>
            <h2
              style={{
                margin: '4px 0 6px',
                fontFamily: 'var(--font-display, serif)',
                fontSize: 22,
                fontWeight: 800,
                color: '#FBF8EE',
              }}
            >
              9 BẢO VẬT CHIẾN LƯỢC
            </h2>
            <p style={{ margin: 0, fontSize: 12.5, color: '#A0B0A7', lineHeight: 1.45 }}>
              Tìm hiểu rõ chức năng từng bảo vật trước khi quay. Mỗi đội sẽ quay được 3 thẻ tương ứng với 3 mũi giáp: Tấn Công, Phòng Thủ, và Đa Phương.
            </p>
          </div>

          {/* Cards List Grouped by 3 Categories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ALL_9_CARDS.map((card) => {
              const isWon = unlockedCards.includes(card.id);
              const isTargetForCurrentStep =
                targetCards[currentStep] === card.id && isSpinning;

              return (
                <div
                  key={card.id}
                  onMouseEnter={() => setHoveredCard(card)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => setRevealedCardModal(card.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 14,
                    background: isWon
                      ? 'rgba(16, 185, 129, 0.12)'
                      : isTargetForCurrentStep
                      ? 'rgba(212, 175, 55, 0.2)'
                      : 'rgba(255, 255, 255, 0.04)',
                    border: isWon
                      ? '1.5px solid #10B981'
                      : isTargetForCurrentStep
                      ? '1.5px solid #F3CA68'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Thumbnail Avatar */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      border: `1.5px solid ${card.accentColor}`,
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: '#091A14',
                    }}
                  >
                    <img
                      src={card.image}
                      alt={card.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Info Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: isWon ? '#34D399' : '#FBF8EE',
                          fontFamily: 'var(--font-display, serif)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {card.name}
                      </div>
                      <span
                        style={{
                          fontSize: 9,
                          fontFamily: 'var(--font-mono, monospace)',
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: isWon ? '#10B981' : 'rgba(212, 175, 55, 0.2)',
                          color: isWon ? '#FFFFFF' : card.accentColor,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {isWon ? '✓ ĐÃ SỞ HỮU' : card.requirement}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        color: '#CBD5E1',
                        marginTop: 3,
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {card.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM TRAY: 3 UNLOCKED SLOTS */}
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          background: 'rgba(9, 26, 20, 0.85)',
          border: '1.5px solid rgba(212, 175, 55, 0.35)',
          borderRadius: 20,
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 11,
            fontWeight: 800,
            color: '#D4AF37',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          BỘ 3 THẺ CHIẾN LƯỢC CỦA ĐỘI BẠN ({unlockedCards.length}/3)
        </div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[0, 1, 2].map((slotIdx) => {
            const cardId = unlockedCards[slotIdx];
            const slotCategory =
              slotIdx === 0
                ? 'TẤN CÔNG (KT ≥ 7)'
                : slotIdx === 1
                ? 'PHÒNG THỦ (TC ≥ 7)'
                : 'ĐA PHƯƠNG (UT ≥ 7)';

            if (!cardId) {
              return (
                <div
                  key={slotIdx}
                  style={{
                    width: 180,
                    height: 100,
                    borderRadius: 14,
                    border: '1.5px dashed rgba(212, 175, 55, 0.4)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    color: '#8E9C95',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  <span style={{ fontSize: 18, opacity: 0.6 }}>🔒</span>
                  <span>{slotCategory}</span>
                </div>
              );
            }

            const cardMeta = ALL_9_CARDS.find((c) => c.id === cardId);
            return (
              <div
                key={slotIdx}
                onClick={() => setRevealedCardModal(cardId)}
                style={{
                  width: 200,
                  minHeight: 100,
                  borderRadius: 14,
                  border: '1.5px solid #10B981',
                  background: 'linear-gradient(145deg, #13271F, #06120D)',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.25)',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    border: '1.5px solid #34D399',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={cardMeta?.image}
                    alt={cardMeta?.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9, color: '#34D399', fontFamily: 'var(--font-mono, monospace)', fontWeight: 800 }}>
                    {slotCategory}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#FBF8EE', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cardMeta?.name}
                  </div>
                  <div style={{ fontSize: 9.5, color: '#9EAA9F', marginTop: 2 }}>
                    Chạm để xem điển tích ➔
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* POPUP MODAL: WON / INSPECTED CARD DETAIL */}
      {revealedCardModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setRevealedCardModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              maxWidth: 400,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 12,
                fontWeight: 800,
                color: '#F3CA68',
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                textAlign: 'center',
              }}
            >
              ★ CHI TIẾT BẢO VẬT CHIẾN LƯỢC ★
            </div>

            {/* Render full 3D Tarot card with all effects & generated artwork */}
            <TacticalCard
              type={revealedCardModal}
              status="ready"
              canActivate={true}
            />

            <button
              type="button"
              onClick={() => setRevealedCardModal(null)}
              style={{
                padding: '10px 28px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Đóng xem lại ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
