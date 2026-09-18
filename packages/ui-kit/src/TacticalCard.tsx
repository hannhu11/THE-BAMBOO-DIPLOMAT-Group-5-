import React, { useState, useRef } from 'react';
import { audioEngine } from './AudioEngine';
import { CardAnchorArt, CardAllianceArt, CardChallengeArt } from './Sigils';

export type CardType = 'anchor' | 'alliance' | 'challenge';

export interface TacticalCardProps {
  type: CardType;
  status?: 'ready' | 'active' | 'spent';
  compact?: boolean;
  onActivate?: () => void;
  canActivate?: boolean;
  className?: string;
}

interface CardMeta {
  title: string;
  sub: string;
  category: string;
  tier: string;
  rarity: string;
  effect: string;
  usage: string;
  lore: string;
  quote: string;
  colors: {
    bg: string;
    border: string;
    glow: string;
    badgeBg: string;
    badgeText: string;
    accent: string;
  };
}

const CARD_DATA: Record<CardType, CardMeta> = {
  anchor: {
    title: 'DĨ BẤT BIẾN',
    sub: 'Anchor of Sovereignty',
    category: 'PHÒNG THỦ CHIẾN LƯỢC',
    tier: 'TIER I · GOLD',
    rarity: 'HOÀNG GIA',
    effect: 'Vô hiệu hóa toàn bộ delta âm (Δ-) của trục Tự Chủ trong vòng chơi hiện tại.',
    usage: '1 LẦN / TOÀN TRẬN ĐẤU',
    lore: 'Nguyên lý cốt lõi của Chủ tịch Hồ Chí Minh: "Dĩ bất biến, ứng vạn biến" — Giữ vững độc lập, chủ quyền làm gốc rễ, phương pháp và sách lược uyển chuyển linh hoạt.',
    quote: '« Dĩ bất biến, ứng vạn biến. Lợi ích tối cao của dân tộc là bất biến. »',
    colors: {
      bg: 'linear-gradient(145deg, #18231C 0%, #0D1612 50%, #070F0B 100%)',
      border: '#D8B46D',
      glow: 'rgba(216, 180, 109, 0.35)',
      badgeBg: 'linear-gradient(180deg, #8E6A24, #5C4314)',
      badgeText: '#F3EEDC',
      accent: '#F3CA68',
    },
  },
  alliance: {
    title: 'CẦU ĐỒNG TỒN DỊ',
    sub: 'Alliance Form',
    category: 'NGOẠI GIAO ĐA PHƯƠNG',
    tier: 'TIER I · JADE',
    rarity: 'NGỌC BÍCH',
    effect: 'Chỉ định 1 nhóm đối tác. Nếu cả 2 cùng chọn phương án đa phương cân bằng → +50% điểm thưởng.',
    usage: '1 LẦN / TOÀN TRẬN ĐẤU',
    lore: 'Tìm kiếm điểm tương đồng lớn nhất, gác lại bất đồng thứ yếu để kiến tạo hòa bình, cùng hợp tác phát triển bền vững.',
    quote: '« Tìm cái đồng, gác cái dị; thêm bạn bớt thù, đa phương hóa quan hệ. »',
    colors: {
      bg: 'linear-gradient(145deg, #13271F 0%, #0C1A14 50%, #06110D 100%)',
      border: '#2F7D62',
      glow: 'rgba(47, 125, 98, 0.4)',
      badgeBg: 'linear-gradient(180deg, #1C5C47, #0F3628)',
      badgeText: '#B5D6C6',
      accent: '#68A98F',
    },
  },
  challenge: {
    title: 'CHẤT VẤN ĐA PHƯƠNG',
    sub: 'Multilateral Challenge',
    category: 'ĐỐI ĐẦU NGHỊ TRƯỜNG',
    tier: 'TIER II · CRIMSON',
    rarity: 'SƠN SON',
    effect: 'Kích hoạt phiên điều trần 45s buộc nhóm dẫn đầu giải trình. Thất bại → Chuyển 20 điểm Uy tín sang nhóm bạn.',
    usage: '1 LẦN / CẢ LỚP HỌC',
    lore: 'Nghị trường Liên Hợp Quốc là vũ đài ngoại giao quốc tế: Dùng luật pháp và lẽ phải để chất vấn các quyết sách áp đặt.',
    quote: '« Thượng tôn công lý, kiên quyết bảo vệ chân lý và chuẩn mực quốc tế. »',
    colors: {
      bg: 'linear-gradient(145deg, #2A1316 0%, #1A0C0E 50%, #0D0506 100%)',
      border: '#A9474F',
      glow: 'rgba(169, 71, 79, 0.45)',
      badgeBg: 'linear-gradient(180deg, #8A2F37, #4D151B)',
      badgeText: '#FCA5A5',
      accent: '#EF4444',
    },
  },
};

export const TacticalCard: React.FC<TacticalCardProps> = ({
  type,
  status = 'ready',
  compact = false,
  onActivate,
  canActivate = true,
  className = '',
}) => {
  const meta: CardMeta = type === 'alliance' ? CARD_DATA.alliance : type === 'challenge' ? CARD_DATA.challenge : CARD_DATA.anchor;
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glintX, setGlintX] = useState(50);
  const [glintY, setGlintY] = useState(50);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (compact || status === 'spent') return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -12;
    const rY = ((x - centerX) / centerX) * 12;

    setRotateX(rX);
    setRotateY(rY);
    setGlintX((x / rect.width) * 100);
    setGlintY((y / rect.height) * 100);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleCardClick = () => {
    audioEngine.playCardFlip();
    if (compact) {
      setIsModalOpen(true);
    } else {
      setIsFlipped(!isFlipped);
    }
  };

  const handleModalActivate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canActivate || status === 'spent') return;
    audioEngine.playStamp();
    onActivate?.();
    setIsModalOpen(false);
  };

  // Compact card representation in player mobile bar
  if (compact) {
    const isReady = status === 'ready';
    const isActive = status === 'active';
    const isSpent = status === 'spent';

    return (
      <>
        <div
          onClick={handleCardClick}
          className={className}
          style={{
            position: 'relative',
            borderRadius: 14,
            padding: '10px 10px',
            cursor: 'pointer',
            userSelect: 'none',
            border: isActive
              ? '1.5px solid #F3CA68'
              : isSpent
              ? '1px solid #24302C'
              : '1px solid rgba(216, 180, 109, 0.3)',
            background: meta.colors.bg,
            boxShadow: isActive ? `0 0 20px ${meta.colors.glow}` : '0 4px 12px rgba(0,0,0,0.3)',
            transform: isActive ? 'scale(1.02)' : 'none',
            opacity: isSpent ? 0.45 : 1,
            transition: 'all 0.2s cubic-bezier(0.22, 0.61, 0.36, 1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 88,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 8.5,
                fontFamily: 'var(--font-mono, monospace)',
                padding: '2px 5px',
                borderRadius: 4,
                letterSpacing: 1.2,
                fontWeight: 700,
                background: meta.colors.badgeBg,
                color: meta.colors.badgeText,
              }}
            >
              {type === 'anchor' ? 'THỦ' : type === 'alliance' ? 'MINH' : 'CHẤT'}
            </span>
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono, monospace)', color: isActive ? '#F3CA68' : '#8E9C95' }}>
              {isActive ? 'ĐANG DÙNG' : isSpent ? 'ĐÃ DÙNG' : 'SẴN SÀNG'}
            </span>
          </div>

          <div style={{ fontSize: 11.5, fontWeight: 800, color: '#F3EEDC', fontFamily: 'var(--font-display, sans-serif)', lineHeight: 1.25 }}>
            {meta.title}
          </div>

          <div style={{ fontSize: 9.5, color: '#A8B3AF', marginTop: 4, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {meta.effect}
          </div>
        </div>

        {/* Modal Xem Cận Cảnh & Kích Hoạt Thẻ */}
        {isModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              background: 'rgba(3, 8, 6, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 340,
                borderRadius: 24,
                padding: 22,
                border: `1.5px solid ${meta.colors.border}`,
                background: meta.colors.bg,
                boxShadow: `0 25px 60px rgba(0,0,0,0.85), 0 0 35px ${meta.colors.glow}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                ✕
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 9.5,
                    fontFamily: 'var(--font-mono, monospace)',
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontWeight: 800,
                    letterSpacing: 1.5,
                    background: meta.colors.badgeBg,
                    color: meta.colors.badgeText,
                  }}
                >
                  {meta.tier}
                </span>
                <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono, monospace)', color: '#D8B46D' }}>
                  {meta.rarity}
                </span>
              </div>

              <h3 style={{ margin: '4px 0 2px', fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display, sans-serif)', color: '#F3EEDC' }}>
                {meta.title}
              </h3>
              <div style={{ fontSize: 11, color: '#8E9C95', fontFamily: 'var(--font-mono, monospace)', letterSpacing: 1, marginBottom: 14 }}>
                {meta.sub}
              </div>

              {/* Tactical Sigil Artwork */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0 16px' }}>
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    border: `1px solid ${meta.colors.border}`,
                    background: 'radial-gradient(circle, rgba(28,92,71,0.35) 0%, rgba(9,18,14,0.9) 80%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 25px ${meta.colors.glow}`,
                  }}
                >
                  {type === 'anchor' ? (
                    <CardAnchorArt size={76} />
                  ) : type === 'alliance' ? (
                    <CardAllianceArt size={76} />
                  ) : (
                    <CardChallengeArt size={76} />
                  )}
                </div>
              </div>

              <div style={{ padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 12 }}>
                <div style={{ fontSize: 9.5, fontFamily: 'var(--font-mono, monospace)', letterSpacing: 1.5, color: '#D8B46D', marginBottom: 4, textTransform: 'uppercase' }}>
                  TÁC DỤNG CHIẾN LƯỢC
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#F3EEDC', lineHeight: 1.55 }}>
                  {meta.effect}
                </p>
              </div>

              <div style={{ padding: 12, borderRadius: 12, background: 'rgba(17, 33, 28, 0.6)', border: '1px solid rgba(47, 125, 98, 0.25)', marginBottom: 18 }}>
                <div style={{ fontSize: 9.5, fontFamily: 'var(--font-mono, monospace)', letterSpacing: 1.5, color: '#68A98F', marginBottom: 4, textTransform: 'uppercase' }}>
                  ĐIỂN TÍCH NGOẠI GIAO HỒ CHÍ MINH
                </div>
                <p style={{ margin: 0, fontSize: 11.5, color: '#CBD5E1', fontStyle: 'italic', lineHeight: 1.55 }}>
                  {meta.lore}
                </p>
                <div style={{ fontSize: 10.5, color: '#D8B46D', fontWeight: 600, marginTop: 6, textAlign: 'right' }}>
                  {meta.quote}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '11px 0',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'transparent',
                    color: '#A8B3AF',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Đóng lại
                </button>
                {canActivate && status !== 'spent' && (
                  <button
                    type="button"
                    onClick={handleModalActivate}
                    style={{
                      flex: 1.3,
                      padding: '11px 0',
                      borderRadius: 12,
                      border: 'none',
                      background: `linear-gradient(180deg, ${meta.colors.accent}, ${meta.colors.badgeBg})`,
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                      boxShadow: `0 0 20px ${meta.colors.glow}`,
                      letterSpacing: 0.5,
                    }}
                  >
                    KÍCH HOẠT LÁ BÀI
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Full-size 3D Physical Tarot Card with Hover Tilt & Foil Glint
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      className={className}
      style={{
        position: 'relative',
        width: 300,
        height: 440,
        borderRadius: 24,
        cursor: 'pointer',
        userSelect: 'none',
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        boxShadow: `0 20px 45px rgba(0,0,0,0.7), 0 0 25px ${meta.colors.glow}`,
        transition: 'transform 0.15s ease-out',
      }}
    >
      {/* Front Face */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 24,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: `2px solid ${meta.colors.border}`,
          overflow: 'hidden',
          background: meta.colors.bg,
        }}
      >
        {/* Holographic foil glint layer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: 0.25,
            background: `radial-gradient(circle at ${glintX}% ${glintY}%, rgba(255,255,255,0.85) 0%, rgba(243,202,104,0.3) 35%, transparent 70%)`,
          }}
        />

        {/* Card Header */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono, monospace)', letterSpacing: 2, color: '#D8B46D', textTransform: 'uppercase' }}>
              {meta.category}
            </div>
            <h3 style={{ margin: '4px 0 2px', fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display, sans-serif)', color: '#F3EEDC' }}>
              {meta.title}
            </h3>
            <div style={{ fontSize: 11, color: '#A8B3AF', fontFamily: 'var(--font-mono, monospace)' }}>
              {meta.sub}
            </div>
          </div>
          <span
            style={{
              fontSize: 10,
              fontFamily: 'var(--font-mono, monospace)',
              padding: '3px 8px',
              borderRadius: 4,
              fontWeight: 800,
              background: meta.colors.badgeBg,
              color: meta.colors.badgeText,
            }}
          >
            {meta.tier}
          </span>
        </div>

        {/* Center Artwork Emblem */}
        <div style={{ position: 'relative', zIndex: 10, margin: 'auto 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              border: `1px solid ${meta.colors.border}`,
              background: 'radial-gradient(circle, rgba(28,92,71,0.45) 0%, rgba(9,18,14,0.85) 80%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 25px ${meta.colors.glow}`,
            }}
          >
            {type === 'anchor' ? (
              <CardAnchorArt size={96} />
            ) : type === 'alliance' ? (
              <CardAllianceArt size={96} />
            ) : (
              <CardChallengeArt size={96} />
            )}
          </div>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono, monospace)', color: 'rgba(203,213,225,0.6)', marginTop: 12, letterSpacing: 1.5 }}>
            CHẠM ĐỂ LẬT XEM ĐIỂN TÍCH
          </span>
        </div>

        {/* Card Footer */}
        <div style={{ position: 'relative', zIndex: 10, padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 9.5, fontFamily: 'var(--font-mono, monospace)', letterSpacing: 1.5, color: '#D8B46D', textTransform: 'uppercase', marginBottom: 2 }}>
            TÁC DỤNG CHIẾN LƯỢC
          </div>
          <div style={{ fontSize: 12, color: '#F3EEDC', lineHeight: 1.45 }}>
            {meta.effect}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 9, fontFamily: 'var(--font-mono, monospace)', color: '#A8B3AF' }}>
            <span>{meta.usage}</span>
            <span style={{ color: meta.colors.accent, fontWeight: 700 }}>{meta.rarity}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
