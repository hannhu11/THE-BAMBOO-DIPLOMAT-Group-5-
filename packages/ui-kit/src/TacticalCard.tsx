import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { audioEngine } from './AudioEngine';
import {
  CARD_CATALOG,
  CARD_USES_PER_GAME,
  CardCategory,
  CardType,
} from '@bamboo/domain-types';
import { CardIllustration, LEGACY_CARD_ALIAS } from './CardIllustrations';

export interface TacticalCardProps {
  type: CardType;
  status?: 'ready' | 'active' | 'spent';
  compact?: boolean;
  onActivate?: () => void;
  canActivate?: boolean;
  className?: string;
}

/**
 * Lá bài chiến lược — giấy dó kem, khung may chỉ, ấn son, màu tre / chàm / vàng nghệ.
 * Nội dung (tên, hiệu ứng, điều kiện) luôn lấy từ CARD_CATALOG để khớp engine.
 */
interface Theme {
  label: string;
  seal: string;
  deep: string;
  mid: string;
  border: string;
  soft: string;
  tint: string;
  /** Màu con dấu ở góc phải: Công son đỏ, Thủ xanh tre, Minh chàm */
  sealBg: string;
  sealGlow: string;
}

const THEMES: Record<CardCategory, Theme> = {
  attack: {
    label: 'Tấn công ngoại giao',
    seal: 'CÔNG',
    deep: '#7A5410',
    mid: '#B07A1E',
    border: '#E0C27A',
    soft: '#FFF1CF',
    tint: '#FBE3AC',
    sealBg: '#C8453F',
    sealGlow: 'rgba(200,69,63,0.35)',
  },
  defense: {
    label: 'Phòng thủ chiến lược',
    seal: 'THỦ',
    deep: '#1C5C47',
    mid: '#2F7D62',
    border: '#9CCDB4',
    soft: '#E4F3EA',
    tint: '#CBE8D7',
    sealBg: '#2F7D62',
    sealGlow: 'rgba(47,125,98,0.35)',
  },
  utility: {
    label: 'Ngoại giao đa phương',
    seal: 'MINH',
    deep: '#264E7A',
    mid: '#3F73A6',
    border: '#A9C7E4',
    soft: '#E7F0F9',
    tint: '#D0E3F4',
    sealBg: '#3F73A6',
    sealGlow: 'rgba(63,115,166,0.35)',
  },
};

const AXIS_SHORT = { autonomy: 'TC', economy: 'KT', prestige: 'UT' } as const;

/** Điển tích / ý nghĩa của từng thẻ (mặt sau) */
const LORE: Record<string, string> = {
  break_supply:
    'Ngoại giao kinh tế là mũi nhọn: khi đối thủ dùng sức mạnh độc quyền để áp đặt, chủ động phân tán chuỗi cung ứng là thế trận phản công sắc bén.',
  counter_tariff:
    'Dùng rào cản kỹ thuật và các phán quyết của WTO để bảo hộ nền sản xuất trong nước trước những đòn phá giá bất bình đẳng.',
  submarine_cable:
    'Ai làm chủ huyết mạch thông tin số dưới lòng đại dương, người đó nắm giữ huyết mạch kinh tế của thế kỷ 21.',
  di_bat_bien:
    '"Dĩ bất biến, ứng vạn biến": giữ vững độc lập, chủ quyền làm gốc rễ, còn phương pháp và sách lược thì uyển chuyển, linh hoạt như cây tre trước gió.',
  sovereignty_shield:
    'Xây thế trận lòng dân kết hợp củng cố quốc phòng toàn dân, tạo nên vành đai bảo vệ vững chắc như luỹ tre làng.',
  self_reliance:
    'Một dân tộc không tự lực cánh sinh mà cứ ngồi chờ dân tộc khác giúp đỡ thì không xứng đáng được độc lập. Nội lực là gốc rễ của tự cường.',
  cau_dong_ton_di:
    'Tìm điểm tương đồng lớn nhất, gác lại bất đồng thứ yếu để kiến tạo hòa bình và cùng hợp tác phát triển bền vững.',
  un_resolution:
    'Đại hội đồng Liên Hợp Quốc là diễn đàn pháp lý quan trọng: tranh thủ sự ủng hộ của công lý quốc tế để bảo vệ lợi ích chính đáng.',
  diplomatic_gong:
    'Tiếng chiêng vang xa khắp năm châu: dùng lẽ phải và tinh thần hoà bình để cảm hoá, quy tụ lòng người.',
};

const FONT_DISPLAY = 'var(--font-display, "Be Vietnam Pro", sans-serif)';
const FONT_UI = 'var(--font-ui, "Be Vietnam Pro", sans-serif)';

function useCardMeta(type: CardType) {
  const id = (LEGACY_CARD_ALIAS[type] ?? type) as CardType;
  const entry = CARD_CATALOG.find((c) => c.id === id) ?? CARD_CATALOG.find((c) => c.id === 'di_bat_bien')!;
  return { id, entry, theme: THEMES[entry.category], lore: LORE[entry.id] ?? '' };
}

/** Cành lá tre nhỏ trang trí hai bên huy hiệu */
const Sprig: React.FC<{ flip?: boolean; color: string }> = ({ flip, color }) => (
  <svg
    width="34"
    height="64"
    viewBox="0 0 34 64"
    aria-hidden="true"
    style={{ flex: '0 0 auto', transform: flip ? 'scaleX(-1)' : undefined, opacity: 0.9 }}
  >
    <path d="M10 62C12 44 12 22 18 4" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M13 44c10-2 16-9 18-18-10 1-16 8-18 18z" fill={color} opacity="0.75" />
    <path d="M12 30C4 28-1 22-1 14c9 1 14 8 13 16z" fill={color} opacity="0.55" />
    <path d="M17 18c8-1 13-6 14-13-8 0-13 5-14 13z" fill={color} opacity="0.4" />
  </svg>
);

const LeafMark: React.FC<{ color: string; size?: number }> = ({ color, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
    <path d="M2 14C2 6 8 2 14 2c0 7-4 12-12 12z" fill={color} />
    <path d="M3 13L11 5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
  </svg>
);

const BambooRule: React.FC<{ color: string }> = ({ color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0' }} aria-hidden="true">
    <span style={{ flex: 1, height: 1.5, background: `linear-gradient(90deg, transparent, ${color})` }} />
    <svg width="34" height="12" viewBox="0 0 34 12">
      <rect x="0" y="3" width="34" height="6" rx="3" fill={color} />
      <rect x="10" y="1" width="4" height="10" rx="2" fill="#2F7D62" opacity="0.7" />
      <rect x="21" y="1" width="4" height="10" rx="2" fill="#2F7D62" opacity="0.7" />
    </svg>
    <span style={{ flex: 1, height: 1.5, background: `linear-gradient(270deg, transparent, ${color})` }} />
  </div>
);

const faceBase = (theme: Theme): React.CSSProperties => ({
  position: 'absolute',
  inset: 0,
  borderRadius: 22,
  overflow: 'hidden',
  background: 'linear-gradient(165deg, #FFFDF5 0%, #FAF2DE 100%)',
  border: `2px solid ${theme.border}`,
  boxShadow: '0 16px 36px rgba(31, 64, 48, 0.22), inset 0 1px 0 rgba(255,255,255,0.9)',
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  fontFamily: FONT_UI,
});

/** Hoạ tiết đan tre rất nhẹ + đường may chỉ quanh mép */
const Decor: React.FC<{ theme: Theme }> = ({ theme }) => (
  <>
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage:
          'repeating-linear-gradient(45deg, rgba(47,125,98,0.05) 0 2px, transparent 2px 11px), repeating-linear-gradient(-45deg, rgba(184,134,11,0.045) 0 2px, transparent 2px 11px)',
      }}
    />
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 7,
        borderRadius: 16,
        border: `1.5px dashed ${theme.border}`,
        pointerEvents: 'none',
      }}
    />
  </>
);

const FullCard: React.FC<TacticalCardProps> = ({ type, status = 'ready', className = '' }) => {
  const { entry, theme, lore } = useCardMeta(type);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glintX, setGlintX] = useState(50);
  const [glintY, setGlintY] = useState(30);
  const [isFlipped, setIsFlipped] = useState(false);
  const spent = status === 'spent';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (spent) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRotateX(((y - rect.height / 2) / (rect.height / 2)) * -9);
    setRotateY(((x - rect.width / 2) / (rect.width / 2)) * 9);
    setGlintX((x / rect.width) * 100);
    setGlintY((y / rect.height) * 100);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleClick = () => {
    audioEngine.playCardFlip();
    setIsFlipped((f) => !f);
  };

  const requirementText = `${AXIS_SHORT[entry.requirementAxis]} ≥ ${entry.requirementValue}`;

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="button"
      aria-label={`Thẻ ${entry.name}. Bấm để lật xem điển tích.`}
      style={{
        position: 'relative',
        width: 300,
        height: 480,
        flexShrink: 0,
        cursor: 'pointer',
        userSelect: 'none',
        transformStyle: 'preserve-3d',
        transform: `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.15s ease-out',
        filter: spent ? 'saturate(0.45) brightness(0.97)' : undefined,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.65s cubic-bezier(0.34, 1.2, 0.5, 1)',
          transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
        }}
      >
        {/* ===== MẶT TRƯỚC ===== */}
        <div style={faceBase(theme)}>
          <Decor theme={theme} />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              opacity: 0.5,
              background: `radial-gradient(circle at ${glintX}% ${glintY}%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 55%)`,
            }}
          />

          <div
            style={{
              position: 'relative',
              boxSizing: 'border-box',
              height: '100%',
              padding: '18px 18px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {/* Hàng đầu: nhóm thẻ + ấn son */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 11px 4px 8px',
                  borderRadius: 999,
                  background: theme.soft,
                  border: `1px solid ${theme.border}`,
                  color: theme.deep,
                  fontSize: 11.5,
                  fontWeight: 700,
                }}
              >
                <LeafMark color={theme.mid} />
                {theme.label}
              </span>
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: theme.sealBg,
                  color: '#FFF5E1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: 0.5,
                  transform: 'rotate(-6deg)',
                  boxShadow: `inset 0 0 0 3px ${theme.sealBg}, inset 0 0 0 4.5px rgba(255,245,225,0.75), 0 3px 8px ${theme.sealGlow}`,
                }}
              >
                {theme.seal}
              </span>
            </div>

            {/* Tên thẻ */}
            <div style={{ textAlign: 'center', padding: '0 6px' }}>
              <h3
                style={{
                  margin: '2px 0 3px',
                  fontFamily: FONT_DISPLAY,
                  fontSize: 19,
                  lineHeight: 1.25,
                  fontWeight: 800,
                  color: '#1F4030',
                }}
              >
                {entry.name}
              </h3>
              <div style={{ fontSize: 11.5, fontStyle: 'italic', color: '#6F8A7C' }}>{entry.subtitle}</div>
            </div>

            {/* Huy hiệu minh hoạ */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <Sprig color={theme.mid} />
              <div
                style={{
                  width: 116,
                  height: 116,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 50% 30%, #FFFFFF 0%, ${theme.tint} 100%)`,
                  border: `3px solid ${theme.border}`,
                  boxShadow: `0 0 0 5px ${theme.soft}, 0 8px 18px rgba(31,64,48,0.14)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CardIllustration type={type} size={102} />
              </div>
              <Sprig color={theme.mid} flip />
            </div>

            <div style={{ textAlign: 'center', fontSize: 11, color: '#7E9487' }}>Chạm để lật xem điển tích ↻</div>

            {/* Tác dụng */}
            <div
              style={{
                marginTop: 'auto',
                padding: '10px 12px 9px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.78)',
                border: `1px solid ${theme.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <LeafMark color={theme.mid} size={12} />
                <span style={{ fontSize: 11.5, fontWeight: 800, color: theme.deep }}>Tác dụng</span>
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.5, color: '#27493B' }}>{entry.effect}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 7 }}>
                {entry.stats.map((s) => (
                  <span
                    key={s}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: theme.soft,
                      border: `1px solid ${theme.border}`,
                      color: theme.deep,
                      fontSize: 10.5,
                      fontWeight: 700,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 8,
                  paddingTop: 7,
                  borderTop: `1px dashed ${theme.border}`,
                  fontSize: 10.5,
                  color: '#6F8A7C',
                }}
              >
                <span>{CARD_USES_PER_GAME} lần / trận</span>
                <span style={{ fontWeight: 700, color: theme.deep }}>Mở khoá khi {requirementText}</span>
              </div>
            </div>
          </div>

          {spent && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '42%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-12deg)',
                padding: '6px 18px',
                border: '3px solid #C8453F',
                borderRadius: 10,
                color: '#C8453F',
                fontFamily: FONT_DISPLAY,
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: 2,
                whiteSpace: 'nowrap',
                background: 'rgba(255,253,245,0.85)',
              }}
            >
              ĐÃ DÙNG
            </div>
          )}
        </div>

        {/* ===== MẶT SAU: ĐIỂN TÍCH ===== */}
        <div style={{ ...faceBase(theme), transform: 'rotateY(180deg)' }}>
          <Decor theme={theme} />
          <div
            style={{
              position: 'relative',
              boxSizing: 'border-box',
              height: '100%',
              padding: '22px 22px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px 4px 9px',
                borderRadius: 999,
                background: theme.soft,
                border: `1px solid ${theme.border}`,
                color: theme.deep,
                fontSize: 11.5,
                fontWeight: 700,
              }}
            >
              <LeafMark color={theme.mid} />
              Ý nghĩa &amp; điển tích
            </span>

            <h3 style={{ margin: '12px 0 0', fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 800, color: '#1F4030' }}>
              {entry.name}
            </h3>

            <div
              aria-hidden="true"
              style={{ fontFamily: 'Georgia, serif', fontSize: 54, lineHeight: 0.8, color: theme.border, marginTop: 14 }}
            >
              “
            </div>
            <p
              style={{
                margin: '2px 4px 0',
                fontSize: 14.5,
                lineHeight: 1.6,
                fontStyle: 'italic',
                color: '#27493B',
              }}
            >
              {entry.quote}
            </p>

            <BambooRule color={theme.border} />

            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: '#46614F' }}>{lore}</p>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: 999,
                  background: theme.soft,
                  border: `1px solid ${theme.border}`,
                  color: theme.deep,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                Nguyên tắc: {entry.principle}
              </span>
              <span style={{ fontSize: 11, color: '#7E9487' }}>Chạm để lật lại ↻</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Ô thẻ thu nhỏ; bấm vào mở khung xem cận cảnh có nút kích hoạt */
const CompactCard: React.FC<TacticalCardProps> = (props) => {
  const { type, status = 'ready', onActivate, canActivate = true, className = '' } = props;
  const { entry, theme } = useCardMeta(type);
  const [open, setOpen] = useState(false);
  const spent = status === 'spent';
  const active = status === 'active';

  const activate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canActivate || spent) return;
    audioEngine.playStamp();
    onActivate?.();
    setOpen(false);
  };

  return (
    <>
      <div
        onClick={() => {
          audioEngine.playCardFlip();
          setOpen(true);
        }}
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 10px',
          borderRadius: 14,
          cursor: 'pointer',
          userSelect: 'none',
          background: 'linear-gradient(165deg, #FFFDF5 0%, #FAF2DE 100%)',
          border: `1.5px solid ${active ? theme.mid : theme.border}`,
          boxShadow: active ? `0 0 0 3px ${theme.soft}, 0 6px 14px rgba(31,64,48,0.15)` : '0 3px 10px rgba(31,64,48,0.1)',
          opacity: spent ? 0.5 : 1,
          transition: 'all 0.2s ease',
          fontFamily: FONT_UI,
        }}
      >
        <div
          style={{
            flex: '0 0 auto',
            width: 46,
            height: 46,
            borderRadius: '50%',
            background: `radial-gradient(circle at 50% 30%, #FFFFFF, ${theme.tint})`,
            border: `2px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CardIllustration type={type} size={34} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: '#1F4030', lineHeight: 1.25 }}>{entry.name}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: theme.deep, whiteSpace: 'nowrap' }}>
              {active ? 'Đang dùng' : spent ? 'Đã dùng' : 'Sẵn sàng'}
            </span>
          </div>
          <div
            style={{
              fontSize: 10.5,
              color: '#5C7667',
              marginTop: 2,
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {entry.effect}
          </div>
        </div>
      </div>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              padding: 16,
              background: 'rgba(14, 40, 30, 0.72)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <FullCard type={type} status={status} />
            </div>
            <div style={{ display: 'flex', gap: 10 }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  padding: '11px 22px',
                  borderRadius: 12,
                  border: '1.5px solid #D8D0BE',
                  background: '#FFFFFF',
                  color: '#27493B',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Đóng lại
              </button>
              {canActivate && !spent && (
                <button
                  type="button"
                  onClick={activate}
                  style={{
                    padding: '11px 22px',
                    borderRadius: 12,
                    border: '1.5px solid #B8860B',
                    background: 'linear-gradient(180deg, #1C5C47, #0F3628)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: '0 6px 16px rgba(15, 54, 40, 0.3)',
                  }}
                >
                  Kích hoạt lá bài
                </button>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export const TacticalCard: React.FC<TacticalCardProps> = (props) =>
  props.compact ? <CompactCard {...props} /> : <FullCard {...props} />;
