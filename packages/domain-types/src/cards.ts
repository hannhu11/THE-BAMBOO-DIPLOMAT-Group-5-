import { CardCategory, CardType, StrategicAxis } from './entities';

/**
 * Nguồn dữ liệu DUY NHẤT cho 9 thẻ chiến lược (UI đọc từ đây).
 * Hiệu ứng thực tế nằm ở packages/engine/src/resolver.ts — hai nơi phải khớp nhau.
 *
 * Nguyên tắc cân bằng:
 *  - Mỗi đội chỉ có 3 thẻ, mỗi thẻ dùng 1 lần, mỗi vòng chỉ gắn được 1 thẻ.
 *  - Mỗi thẻ có giá trị kỳ vọng ≈ +3 điểm tổng (đo trên cả 12 câu hỏi, giả định 50% chọn đúng
 *    phương án cân bằng). Điểm không có trần trên, khởi điểm mỗi trục là 10.
 *  - Thẻ chắc chắn (giá trị cố định) đổi lấy trần thấp; thẻ có điều kiện có trần cao hơn.
 *  - Không thẻ nào vừa rộng vừa mạnh hơn hẳn thẻ cùng nhóm.
 */
export interface CardCatalogEntry {
  id: CardType;
  category: CardCategory;
  name: string;
  subtitle: string;
  /** Trục điểm dùng để mở khoá thẻ (điểm hiện tại của trục ≥ requirementValue) */
  requirementAxis: StrategicAxis;
  requirementValue: number;
  /** Mô tả hiệu ứng chính xác, khớp với engine */
  effect: string;
  /** Các chỉ số ngắn gọn hiển thị dạng chip */
  stats: string[];
  /** Cách dùng hiệu quả nhất / đánh đổi */
  tip: string;
  /** Giá trị kỳ vọng tham khảo */
  value: string;
  quote: string;
  principle: string;
}

export const CARD_USES_PER_GAME = 1;
export const CARD_ACTIVATION_TIMING = 'Gắn vào phương án trước khi khóa biểu quyết';

export const CARD_CATEGORY_META: Record<
  CardCategory,
  { label: string; short: string; axis: StrategicAxis; axisLabel: string; blurb: string }
> = {
  attack: {
    label: 'Thẻ Tấn Công',
    short: 'CÔNG',
    axis: 'economy',
    axisLabel: 'Kinh Tế (KT)',
    blurb: 'Chủ động dùng thế mạnh kinh tế để mở đường.',
  },
  defense: {
    label: 'Thẻ Phòng Thủ',
    short: 'THỦ',
    axis: 'autonomy',
    axisLabel: 'Tự Chủ (TC)',
    blurb: 'Giữ vững độc lập, tự chủ trước sức ép bên ngoài.',
  },
  utility: {
    label: 'Thẻ Chức Năng',
    short: 'MINH',
    axis: 'prestige',
    axisLabel: 'Uy Tín (UT)',
    blurb: 'Nâng vị thế, kết nối đa phương.',
  },
};

export const CARD_CATALOG: CardCatalogEntry[] = [
  // ===== TẤN CÔNG — cần Kinh Tế ≥ 7 =====
  {
    id: 'submarine_cable',
    category: 'attack',
    name: 'Chiếm Lĩnh Cáp Quang Biển',
    subtitle: 'Subsea Cable Supremacy',
    requirementAxis: 'economy',
    requirementValue: 7,
    effect: 'Cộng thẳng +3 KT vào kết quả lượt này, bất kể phương án nào.',
    stats: ['+3 KT cố định'],
    tip: 'Chắc chắn, không phụ thuộc phương án. Trần thấp hơn Thuế Đối Kháng nhưng không bao giờ trượt.',
    value: 'Luôn +3',
    quote: 'Ai làm chủ huyết mạch thông tin số dưới lòng đại dương, người đó nắm giữ huyết mạch kinh tế.',
    principle: 'Tự lực cánh sinh về hạ tầng số',
  },
  {
    id: 'counter_tariff',
    category: 'attack',
    name: 'Áp Đặt Thuế Đối Kháng',
    subtitle: 'Countervailing Tariff',
    requirementAxis: 'economy',
    requirementValue: 7,
    effect:
      'Nếu phương án mang lại KT dương: nhân đôi (thưởng thêm tối đa +5). Luôn được cộng thêm +1 KT.',
    stats: ['KT dương ×2 (thêm tối đa +5)', '+1 KT'],
    tip: 'Mạnh nhất khi chọn đúng phương án có lợi kinh tế; chọn sai vẫn còn +1 KT.',
    value: '+1 đến +6',
    quote: 'Tự lực cánh sinh, kết hợp phòng vệ thương mại có lý có tình.',
    principle: 'Dựa vào luật pháp quốc tế để bảo hộ sản xuất',
  },
  {
    id: 'break_supply',
    category: 'attack',
    name: 'Bẻ Gãy Chuỗi Cung Ứng',
    subtitle: 'Supply Chain Interdiction',
    requirementAxis: 'economy',
    requirementValue: 7,
    effect:
      'Chọn 1 đội đối thủ: thẻ chiến lược của đội đó bị vô hiệu trong câu hỏi này. Đội bạn được cộng +2 KT.',
    stats: ['Đóng băng thẻ 1 đội', '+2 KT'],
    tip: 'Phải chọn đội mục tiêu trước khi khóa. Có giá trị cao khi đội bị chọn đang định dùng thẻ.',
    value: '+2 và chặn đối thủ',
    quote: 'Muốn người ta giúp cho thì trước hết phải tự giúp lấy mình.',
    principle: 'Đa dạng hoá, không phụ thuộc một đối tác',
  },

  // ===== PHÒNG THỦ — cần Tự Chủ ≥ 7 =====
  {
    id: 'di_bat_bien',
    category: 'defense',
    name: 'Dĩ Bất Biến, Ứng Vạn Biến',
    subtitle: 'Anchor of Sovereignty',
    requirementAxis: 'autonomy',
    requirementValue: 7,
    effect: 'Xoá toàn bộ điểm TC âm của lượt này (TC không bao giờ bị trừ), sau đó cộng thêm +1 TC.',
    stats: ['TC âm → 0', '+1 TC'],
    tip: 'Bảo hiểm tuyệt đối cho trục Tự Chủ. Không có tác dụng với KT và UT.',
    value: '+1 đến +9',
    quote: 'Dĩ bất biến, ứng vạn biến.',
    principle: 'Độc lập, tự chủ là bất biến',
  },
  {
    id: 'sovereignty_shield',
    category: 'defense',
    name: 'Vành Đai Độc Lập',
    subtitle: 'Sovereignty Shield',
    requirementAxis: 'autonomy',
    requirementValue: 7,
    effect:
      'Mọi điểm âm ở cả 3 trục (TC, KT, UT) giảm một nửa; mỗi trục được bảo vệ tối đa 4 điểm.',
    stats: ['Mọi điểm âm −50%', 'Tối đa 4 điểm / trục'],
    tip: 'Che cả 3 trục nhưng chỉ giảm một nửa. Đáng giá nhất ở các câu khủng hoảng bị trừ nặng.',
    value: '+0 đến +12',
    quote: 'Không có gì quý hơn độc lập, tự do.',
    principle: 'Thế trận phòng thủ toàn diện',
  },
  {
    id: 'self_reliance',
    category: 'defense',
    name: 'Tự Lực Cánh Sinh',
    subtitle: 'Strategic Self-Reliance',
    requirementAxis: 'autonomy',
    requirementValue: 7,
    effect:
      'Cộng +3 TC. Nếu TC sau lượt này xuống dưới 7: cộng thêm +2 TC (tổng +5) nhưng mất 1 KT.',
    stats: ['+3 TC', 'TC < 7: thêm +2 TC, −1 KT'],
    tip: 'Luôn có lợi; phát huy tối đa khi Tự Chủ đang sát ngưỡng nguy hiểm.',
    value: '+3 đến +4',
    quote: 'Đem sức ta mà tự giải phóng cho ta.',
    principle: 'Độc lập, tự chủ, tự lực cánh sinh',
  },

  // ===== CHỨC NĂNG — cần Uy Tín ≥ 7 =====
  {
    id: 'cau_dong_ton_di',
    category: 'utility',
    name: 'Cầu Đồng Tồn Dị',
    subtitle: 'Multilateral Concord',
    requirementAxis: 'prestige',
    requirementValue: 7,
    effect: 'Cộng +2 UT. Nếu chọn phương án cân bằng (hợp tác, đôi bên cùng có lợi): cộng thêm +2 UT.',
    stats: ['+2 UT', 'Phương án cân bằng: +2 UT'],
    tip: 'Thưởng cho đội chọn đúng hướng hợp tác; chọn sai vẫn giữ +2 UT.',
    value: '+2 hoặc +4',
    quote: 'Tìm cái đồng, gác cái dị; thêm bạn bớt thù.',
    principle: 'Đoàn kết trên cơ sở mục tiêu chung',
  },
  {
    id: 'un_resolution',
    category: 'utility',
    name: 'Nghị Quyết Đại Hội Đồng LHQ',
    subtitle: 'UN General Assembly Mandate',
    requirementAxis: 'prestige',
    requirementValue: 7,
    effect: 'Cộng +1 cho mỗi trục: +1 TC, +1 KT, +1 UT (tổng +3).',
    stats: ['+1 TC', '+1 KT', '+1 UT'],
    tip: 'Đều tay, chắc chắn, không phụ thuộc phương án. Phù hợp khi chưa rõ nên bù trục nào.',
    value: 'Luôn +3',
    quote: 'Thượng tôn Hiến chương Liên Hợp Quốc và luật pháp quốc tế.',
    principle: 'Tuân thủ luật pháp quốc tế',
  },
  {
    id: 'diplomatic_gong',
    category: 'utility',
    name: 'Tiếng Chiêng Ngoại Giao',
    subtitle: 'Diplomatic Resonator',
    requirementAxis: 'prestige',
    requirementValue: 7,
    effect:
      'Nhân đôi mọi điểm dương ở từng trục, phần thưởng thêm tối đa +2 mỗi trục (tối đa +6 tổng).',
    stats: ['Điểm dương ×2', 'Thêm tối đa +2 / trục'],
    tip: 'Trần cao nhất trong bộ thẻ, nhưng chỉ khi chọn đúng phương án nhiều điểm dương.',
    value: '+1 đến +6',
    quote: 'Văn hóa là ngọn đuốc soi đường cho quốc dân đi.',
    principle: 'Chính nghĩa ngoại giao quy tụ lòng người',
  },
];

export function getCardCatalogEntry(id: CardType): CardCatalogEntry | undefined {
  return CARD_CATALOG.find((c) => c.id === id);
}

export function getCardsByCategory(category: CardCategory): CardCatalogEntry[] {
  return CARD_CATALOG.filter((c) => c.category === category);
}
