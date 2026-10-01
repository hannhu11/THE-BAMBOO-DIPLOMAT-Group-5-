import React from 'react';
import { CardType } from '@bamboo/domain-types';

/**
 * Bộ 9 hình minh hoạ cho thẻ chiến lược — nét phẳng, bo tròn, màu pastel
 * (tre, chàm, vàng nghệ, son) theo tinh thần tranh dân gian Việt Nam.
 * Mỗi hình vẽ trong khung 120x120.
 */
const C = {
  ink: '#27493B',
  leaf: '#2F7D62',
  leafDark: '#1C5C47',
  leafLight: '#7DB59A',
  mint: '#D6EBDD',
  paper: '#FFF9EA',
  gold: '#E2B04A',
  goldDeep: '#B8860B',
  cinnabar: '#C8453F',
  indigo: '#3F73A6',
  indigoLight: '#A9C7E4',
  water: '#BCDDE8',
  wood: '#C9985A',
  woodDark: '#8F6A3A',
  soil: '#B08A5E',
  white: '#FFFFFF',
};

type Art = React.FC;

/** Chiếm lĩnh cáp quang biển: mặt trời, sóng, sợi cáp và phao */
const SubmarineCable: Art = () => (
  <g>
    <circle cx="88" cy="30" r="13" fill={C.gold} />
    <g stroke={C.gold} strokeWidth="3" strokeLinecap="round">
      <path d="M88 8v4M88 48v4M66 30h4M106 30h4M72 14l3 3M101 43l3 3M104 14l-3 3M75 43l-3 3" />
    </g>
    <ellipse cx="30" cy="30" rx="14" ry="7" fill={C.white} />
    <ellipse cx="40" cy="26" rx="10" ry="7" fill={C.white} />
    <path d="M8 62q13-10 26 0t26 0t26 0t26 0v50H8z" fill={C.water} />
    <path d="M8 76q13-9 26 0t26 0t26 0t26 0" fill="none" stroke={C.white} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
    <path d="M12 92C34 108 54 80 76 94S100 98 108 90" fill="none" stroke={C.ink} strokeWidth="4.5" strokeLinecap="round" />
    <rect x="6" y="85" width="12" height="12" rx="3" fill={C.cinnabar} />
    <rect x="102" y="84" width="12" height="12" rx="3" fill={C.cinnabar} />
    <g transform="translate(58 52)">
      <circle r="9" fill={C.cinnabar} />
      <path d="M-9 0a9 9 0 0 1 18 0z" fill={C.white} />
      <rect x="-1.5" y="-15" width="3" height="7" rx="1.5" fill={C.ink} />
    </g>
  </g>
);

/** Áp đặt thuế đối kháng: cán cân */
const CounterTariff: Art = () => (
  <g>
    <rect x="57" y="30" width="6" height="62" rx="3" fill={C.woodDark} />
    <path d="M38 100h44l-6-10H44z" fill={C.wood} />
    <rect x="24" y="34" width="72" height="6" rx="3" fill={C.wood} />
    <circle cx="60" cy="30" r="7" fill={C.gold} stroke={C.goldDeep} strokeWidth="2" />
    <g stroke={C.ink} strokeWidth="1.6" fill="none" strokeLinecap="round">
      <path d="M27 40L16 70M27 40l11 30M93 40L82 70M93 40l11 30" />
    </g>
    <path d="M12 70h30a15 12 0 0 1-30 0z" fill={C.leafLight} stroke={C.leafDark} strokeWidth="2" />
    <path d="M78 70h30a15 12 0 0 1-30 0z" fill={C.leafLight} stroke={C.leafDark} strokeWidth="2" />
    <rect x="17" y="56" width="20" height="14" rx="3" fill={C.wood} stroke={C.woodDark} strokeWidth="2" />
    <path d="M17 62h20" stroke={C.woodDark} strokeWidth="2" />
    <circle cx="93" cy="62" r="8.5" fill={C.gold} stroke={C.goldDeep} strokeWidth="2" />
    <circle cx="93" cy="62" r="3.5" fill="none" stroke={C.goldDeep} strokeWidth="1.5" />
  </g>
);

/** Bẻ gãy chuỗi cung ứng: sợi xích đứt */
const BreakSupply: Art = () => (
  <g>
    <rect x="8" y="46" width="38" height="28" rx="14" fill="none" stroke={C.ink} strokeWidth="7" />
    <rect x="74" y="46" width="38" height="28" rx="14" fill="none" stroke={C.ink} strokeWidth="7" />
    <path d="M46 60h6M68 60h6" stroke={C.mint} strokeWidth="9" strokeLinecap="round" />
    <path d="M44 50l12 8-8 4 12 8" fill="none" stroke={C.cinnabar} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <g stroke={C.gold} strokeWidth="3.5" strokeLinecap="round">
      <path d="M60 28v-10M44 30l-6-8M76 30l6-8" />
      <path d="M60 92v10M44 90l-6 8M76 90l6 8" />
    </g>
    <path d="M30 104q-4-8 3-12M90 104q4-8-3-12" fill="none" stroke={C.leafLight} strokeWidth="3" strokeLinecap="round" />
  </g>
);

/** Dĩ bất biến: cây tre đứng vững, rễ bám đất */
const DiBatBien: Art = () => (
  <g>
    <ellipse cx="60" cy="100" rx="42" ry="9" fill={C.soil} />
    <ellipse cx="60" cy="97" rx="34" ry="6" fill="#C7A276" />
    <g stroke={C.woodDark} strokeWidth="2.5" fill="none" strokeLinecap="round">
      <path d="M60 94q-10 8-20 6M60 94q10 8 20 6M60 94q-3 9-2 14" />
    </g>
    <rect x="53" y="10" width="14" height="86" rx="7" fill={C.leaf} />
    <rect x="53" y="10" width="5" height="86" rx="2.5" fill={C.leafLight} opacity="0.6" />
    <g fill={C.leafDark}>
      <rect x="50" y="30" width="20" height="5" rx="2.5" />
      <rect x="50" y="54" width="20" height="5" rx="2.5" />
      <rect x="50" y="78" width="20" height="5" rx="2.5" />
    </g>
    <g fill={C.leafLight} stroke={C.leaf} strokeWidth="1.5">
      <path d="M67 32q22-4 32-20q-24 0-32 20z" />
      <path d="M53 56q-22-4-32-20q24 0 32 20z" />
      <path d="M67 80q18-2 28-16q-20-2-28 16z" />
    </g>
  </g>
);

/** Vành đai độc lập: khiên, ngôi sao và luỹ tre */
const SovereigntyShield: Art = () => (
  <g>
    <path d="M60 10l38 13v34c0 26-19 41-38 51C41 98 22 83 22 57V23z" fill={C.paper} stroke={C.leaf} strokeWidth="5" strokeLinejoin="round" />
    <path d="M60 20l28 10v27c0 19-14 31-28 38C46 88 32 76 32 57V30z" fill={C.mint} />
    <path d="M60 36l6.6 13.6 15 2.2-10.9 10.6 2.6 14.9L60 70l-13.3 7.3 2.6-14.9L38.4 51.8l15-2.2z" fill={C.cinnabar} />
    <g fill={C.leafDark}>
      <rect x="6" y="64" width="9" height="46" rx="4.5" />
      <rect x="105" y="64" width="9" height="46" rx="4.5" />
    </g>
    <g fill={C.leafLight}>
      <path d="M10 66q-8-6-6-16q10 4 6 16z" />
      <path d="M110 66q8-6 6-16q-10 4-6 16z" />
    </g>
  </g>
);

/** Tự lực cánh sinh: măng non đội đất mọc lên */
const SelfReliance: Art = () => (
  <g>
    <circle cx="26" cy="26" r="11" fill={C.gold} />
    <path d="M8 98q52-34 104 0v10H8z" fill={C.soil} />
    <path d="M8 98q52-34 104 0" fill="none" stroke="#C7A276" strokeWidth="4" strokeLinecap="round" />
    <path d="M60 18C46 36 42 66 40 92h40C78 66 74 36 60 18z" fill="#D9E8A8" stroke={C.leaf} strokeWidth="3" strokeLinejoin="round" />
    <g stroke={C.leaf} strokeWidth="2.5" fill="none" strokeLinecap="round">
      <path d="M46 50q14 8 28 0M43 68q17 9 34 0M41 86q19 9 38 0" />
    </g>
    <path d="M60 18c-3 8 3 12 0 18" fill="none" stroke={C.leaf} strokeWidth="2.5" strokeLinecap="round" />
    <g fill={C.leafLight} stroke={C.leaf} strokeWidth="1.5">
      <path d="M86 78q14-10 22-4q-6 12-22 4z" />
      <path d="M32 82q-14-10-22-4q6 12 22 4z" />
    </g>
    <g fill={C.gold}>
      <path d="M96 30l2.5 6 6 2.5-6 2.5L96 47l-2.5-6-6-2.5 6-2.5z" />
      <circle cx="86" cy="58" r="2.5" />
    </g>
  </g>
);

/** Cầu đồng tồn dị: chiếc cầu nối hai bờ */
const CauDongTonDi: Art = () => (
  <g>
    <circle cx="60" cy="30" r="14" fill="#FFE9A8" />
    <path d="M4 96h112v16H4z" fill={C.water} />
    <path d="M4 104q14-7 28 0t28 0t28 0t28 0" fill="none" stroke={C.white} strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
    <path d="M4 82q16-6 24 0v16H4z" fill={C.leafLight} />
    <path d="M116 82q-16-6-24 0v16h24z" fill={C.leafLight} />
    <path d="M18 88Q60 28 102 88" fill="none" stroke={C.woodDark} strokeWidth="10" strokeLinecap="round" />
    <path d="M18 88Q60 28 102 88" fill="none" stroke={C.wood} strokeWidth="6" strokeLinecap="round" />
    <g stroke={C.woodDark} strokeWidth="3" strokeLinecap="round">
      <path d="M32 71v-12M44 59v-12M60 54v-12M76 59v-12M88 71v-12" />
    </g>
    <path d="M32 59Q60 30 88 59" fill="none" stroke={C.woodDark} strokeWidth="3" strokeLinecap="round" />
    <g>
      <path d="M17 78v-10" stroke={C.ink} strokeWidth="2" />
      <path d="M17 68c8-3 8 5 15 2v8c-7 3-7-5-15-2z" fill={C.cinnabar} />
      <path d="M103 78v-10" stroke={C.ink} strokeWidth="2" />
      <path d="M103 68c-8-3-8 5-15 2v8c7 3 7-5 15-2z" fill={C.indigo} />
    </g>
  </g>
);

/** Nghị quyết LHQ: quả địa cầu giữa hai cành ô liu */
const UnResolution: Art = () => (
  <g>
    <circle cx="60" cy="56" r="28" fill={C.indigoLight} stroke={C.indigo} strokeWidth="4" />
    <g fill={C.leafLight} opacity="0.95">
      <path d="M46 40q10-2 12 8q-2 8-10 6q-8-6-2-14z" />
      <path d="M66 58q10-2 14 6q-2 10-12 10q-6-8-2-16z" />
    </g>
    <g fill="none" stroke={C.white} strokeWidth="2" opacity="0.9">
      <ellipse cx="60" cy="56" rx="12" ry="28" />
      <path d="M32 56h56M36 42h48M36 70h48" />
    </g>
    <g stroke={C.leaf} strokeWidth="3" fill="none" strokeLinecap="round">
      <path d="M22 100Q8 70 24 40" />
      <path d="M98 100Q112 70 96 40" />
    </g>
    <g fill={C.leaf}>
      <ellipse cx="14" cy="86" rx="8" ry="4" transform="rotate(-50 14 86)" />
      <ellipse cx="12" cy="68" rx="8" ry="4" transform="rotate(-30 12 68)" />
      <ellipse cx="15" cy="52" rx="8" ry="4" transform="rotate(-10 15 52)" />
      <ellipse cx="106" cy="86" rx="8" ry="4" transform="rotate(50 106 86)" />
      <ellipse cx="108" cy="68" rx="8" ry="4" transform="rotate(30 108 68)" />
      <ellipse cx="105" cy="52" rx="8" ry="4" transform="rotate(10 105 52)" />
    </g>
    <path d="M40 106h40" stroke={C.gold} strokeWidth="5" strokeLinecap="round" />
  </g>
);

/** Tiếng chiêng ngoại giao: chiêng treo trên khung tre */
const DiplomaticGong: Art = () => (
  <g>
    <rect x="12" y="12" width="96" height="9" rx="4.5" fill={C.leaf} />
    <rect x="14" y="12" width="9" height="98" rx="4.5" fill={C.leaf} />
    <rect x="97" y="12" width="9" height="98" rx="4.5" fill={C.leaf} />
    <g fill={C.leafDark}>
      <rect x="12" y="10" width="13" height="4" rx="2" />
      <rect x="95" y="10" width="13" height="4" rx="2" />
    </g>
    <path d="M44 21L52 38M76 21L68 38" stroke={C.cinnabar} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="60" cy="64" r="28" fill={C.gold} stroke={C.goldDeep} strokeWidth="4" />
    <circle cx="60" cy="64" r="20" fill="none" stroke={C.goldDeep} strokeWidth="2" opacity="0.7" />
    <circle cx="60" cy="64" r="11" fill="#F2CD76" stroke={C.goldDeep} strokeWidth="2" />
    <circle cx="60" cy="64" r="3.5" fill={C.goldDeep} />
    <path d="M36 50q4-14 20-16" fill="none" stroke={C.white} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    <path d="M92 100l-14-20" stroke={C.woodDark} strokeWidth="5" strokeLinecap="round" />
    <circle cx="76" cy="77" r="7" fill={C.cinnabar} />
    <g stroke={C.leafLight} strokeWidth="3" strokeLinecap="round" fill="none">
      <path d="M96 56q6 8 0 16M103 50q10 14 0 28" />
    </g>
  </g>
);

const ART: Record<string, Art> = {
  submarine_cable: SubmarineCable,
  counter_tariff: CounterTariff,
  break_supply: BreakSupply,
  di_bat_bien: DiBatBien,
  sovereignty_shield: SovereigntyShield,
  self_reliance: SelfReliance,
  cau_dong_ton_di: CauDongTonDi,
  un_resolution: UnResolution,
  diplomatic_gong: DiplomaticGong,
};

/** Tên cũ (tương thích ngược) -> thẻ hiện tại */
export const LEGACY_CARD_ALIAS: Partial<Record<CardType, CardType>> = {
  anchor: 'di_bat_bien',
  alliance: 'cau_dong_ton_di',
  challenge: 'break_supply',
};

export const CardIllustration: React.FC<{ type: CardType; size?: number }> = ({ type, size = 100 }) => {
  const id = LEGACY_CARD_ALIAS[type] ?? type;
  const Art = ART[id] ?? DiBatBien;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-hidden="true" style={{ display: 'block' }}>
      <Art />
    </svg>
  );
};
