import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { audioEngine } from './AudioEngine';
import { CardAnchorArt, CardAllianceArt, CardChallengeArt } from './Sigils';

import { CardType } from '@bamboo/domain-types';

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
  requirement: string;
  colors: {
    bg: string;
    border: string;
    glow: string;
    badgeBg: string;
    badgeText: string;
    accent: string;
  };
}

const CARD_DATA: Record<string, CardMeta> = {
  // === NHÓM 1: TẤN CÔNG NGOẠI GIAO (Yêu cầu Kinh Tế >= 7) ===
  break_supply: {
    title: 'BẺ GÃY CHUỖI CUNG ỨNG',
    sub: 'Supply Chain Interdiction',
    category: 'TẤN CÔNG NGOẠI GIAO',
    tier: 'TIER I · VÀNG',
    rarity: 'HOÀNG GIA',
    requirement: 'YÊU CẦU: KINH TẾ ≥ 7',
    effect: 'Phong tỏa đối trọng: Đóng băng quyền kích hoạt thẻ bài chiến lược của 1 đội đối thủ trong câu hỏi hiện tại.',
    usage: '1 LẦN / TOÀN TRẬN ĐẤU',
    lore: 'Ngoại giao kinh tế là mũi nhọn: Khi đối thủ dùng sức mạnh độc quyền áp đặt, việc chủ động phân tán chuỗi cung ứng là thế trận phản công sắc bén.',
    quote: '« Muốn người ta giúp cho thì trước hết phải tự giúp lấy mình. Đa dạng hóa chuỗi huyết mạch kinh tế. »',
    colors: {
      bg: 'linear-gradient(145deg, #241D12 0%, #17120A 50%, #0A0805 100%)',
      border: '#D4AF37',
      glow: 'rgba(212, 175, 55, 0.4)',
      badgeBg: 'linear-gradient(180deg, #8E6A24, #5C4314)',
      badgeText: '#FBF8EE',
      accent: '#F3CA68',
    },
  },
  counter_tariff: {
    title: 'ÁP ĐẶT THUẾ ĐỐI KHÁNG',
    sub: 'Countervailing Tariff Defense',
    category: 'TẤN CÔNG NGOẠI GIAO',
    tier: 'TIER II · VÀNG',
    rarity: 'HOÀNG GIA',
    requirement: 'YÊU CẦU: KINH TẾ ≥ 7',
    effect: 'Tận dụng công cụ pháp lý quốc tế: Nhân đôi toàn bộ điểm Kinh Tế (+KT) đạt được trong câu hỏi này nếu chọn phương án có lợi ích kinh tế.',
    usage: '1 LẦN / TOÀN TRẬN ĐẤU',
    lore: 'Sử dụng rào cản kỹ thuật và các phán quyết của WTO để bảo hộ nền sản xuất nội địa trước các đòn phá giá bất bình đẳng.',
    quote: '« Tự lực cánh sinh, kết hợp phòng vệ thương mại có lý có tình. »',
    colors: {
      bg: 'linear-gradient(145deg, #241D12 0%, #17120A 50%, #0A0805 100%)',
      border: '#D4AF37',
      glow: 'rgba(212, 175, 55, 0.4)',
      badgeBg: 'linear-gradient(180deg, #8E6A24, #5C4314)',
      badgeText: '#FBF8EE',
      accent: '#F3CA68',
    },
  },
  submarine_cable: {
    title: 'CHIẾM LĨNH CÁP QUANG BIỂN',
    sub: 'Subsea Cable Supremacy',
    category: 'TẤN CÔNG NGOẠI GIAO',
    tier: 'TIER III · VÀNG',
    rarity: 'HOÀNG GIA',
    requirement: 'YÊU CẦU: KINH TẾ ≥ 7',
    effect: 'Chớp thời cơ hạ tầng số: Cộng ngay +2 điểm Kinh Tế và hút 1 điểm KT từ đội có tổng điểm cao nhất nếu đội biểu quyết sớm nhất.',
    usage: '1 LẦN / TOÀN TRẬN ĐẤU',
    lore: 'Ai làm chủ huyết mạch thông tin số dưới lòng đại dương, người đó nắm giữ huyết mạch kinh tế của thế kỷ 21.',
    quote: '« Tương lai thuộc về công nghệ và tự chủ thông tin liên lạc quốc gia. »',
    colors: {
      bg: 'linear-gradient(145deg, #241D12 0%, #17120A 50%, #0A0805 100%)',
      border: '#D4AF37',
      glow: 'rgba(212, 175, 55, 0.4)',
      badgeBg: 'linear-gradient(180deg, #8E6A24, #5C4314)',
      badgeText: '#FBF8EE',
      accent: '#F3CA68',
    },
  },

  // === NHÓM 2: PHÒNG THỦ & TỰ CHỦ (Yêu cầu Tự Chủ >= 7) ===
  di_bat_bien: {
    title: 'DĨ BẤT BIẾN, ỨNG VẠN BIẾN',
    sub: 'Anchor of Sovereignty',
    category: 'PHÒNG THỦ CHIẾN LƯỢC',
    tier: 'TIER I · NGỌC BÍCH',
    rarity: 'BẢO VẬT',
    requirement: 'YÊU CẦU: TỰ CHỦ ≥ 7',
    effect: 'Vô hiệu hóa 100% mọi delta âm (Δ-) của trục Tự Chủ trong câu hỏi hiện tại dù phương án có chịu sức ép chính trị.',
    usage: '1 LẦN / TOÀN TRẬN ĐẤU',
    lore: 'Nguyên lý cốt lõi của Chủ tịch Hồ Chí Minh: "Dĩ bất biến, ứng vạn biến" — Giữ vững độc lập, chủ quyền làm gốc rễ, phương pháp và sách lược uyển chuyển linh hoạt.',
    quote: '« Dĩ bất biến, ứng vạn biến. Lợi ích tối cao của dân tộc là bất biến. »',
    colors: {
      bg: 'linear-gradient(145deg, #13271F 0%, #0C1A14 50%, #06110D 100%)',
      border: '#2F7D62',
      glow: 'rgba(47, 125, 98, 0.4)',
      badgeBg: 'linear-gradient(180deg, #1C5C47, #0F3628)',
      badgeText: '#B5D6C6',
      accent: '#68A98F',
    },
  },
  sovereignty_shield: {
    title: 'VÀNH ĐAI ĐỘC LẬP',
    sub: 'Sovereignty Shield',
    category: 'PHÒNG THỦ CHIẾN LƯỢC',
    tier: 'TIER II · NGỌC BÍCH',
    rarity: 'BẢO VẬT',
    requirement: 'YÊU CẦU: TỰ CHỦ ≥ 7',
    effect: 'Lá chắn chủ quyền: Miễn nhiễm hoàn toàn khỏi mọi tác động tiêu cực hoặc biến động trừ điểm từ Thiên Nga Đen trong câu này.',
    usage: '1 LẦN / TOÀN TRẬN ĐẤU',
    lore: 'Xây dựng thế trận lòng dân kết hợp củng cố quốc phòng toàn dân, tạo vành đai bảo vệ bất khả xâm phạm.',
    quote: '« Nước Việt Nam là một, dân tộc Việt Nam là một. Sông có thể cạn, núi có thể mòn, song chân lý ấy không bao giờ thay đổi. »',
    colors: {
      bg: 'linear-gradient(145deg, #13271F 0%, #0C1A14 50%, #06110D 100%)',
      border: '#2F7D62',
      glow: 'rgba(47, 125, 98, 0.4)',
      badgeBg: 'linear-gradient(180deg, #1C5C47, #0F3628)',
      badgeText: '#B5D6C6',
      accent: '#68A98F',
    },
  },
  self_reliance: {
    title: 'TỰ LỰC CÁNH SINH',
    sub: 'Strategic Self-Reliance',
    category: 'PHÒNG THỦ CHIẾN LƯỢC',
    tier: 'TIER III · NGỌC BÍCH',
    rarity: 'BẢO VẬT',
    requirement: 'YÊU CẦU: TỰ CHỦ ≥ 7',
    effect: 'Vận dụng nội lực dân tộc: Nếu điểm Tự Chủ bị giảm xuống dưới 7, tự động chuyển đổi 2 điểm KT thành 2 điểm TC để giữ ngưỡng an toàn.',
    usage: '1 LẦN / TOÀN TRẬN ĐẤU',
    lore: 'Chủ tịch Hồ Chí Minh chỉ rõ: "Một dân tộc không tự lực cánh sinh mà cứ ngồi chờ dân tộc khác giúp đỡ thì không xứng đáng được độc lập."',
    quote: '« Độc lập tự do là quyền thiêng liêng bất khả xâm phạm; nội lực là gốc rễ của tự cường. »',
    colors: {
      bg: 'linear-gradient(145deg, #13271F 0%, #0C1A14 50%, #06110D 100%)',
      border: '#2F7D62',
      glow: 'rgba(47, 125, 98, 0.4)',
      badgeBg: 'linear-gradient(180deg, #1C5C47, #0F3628)',
      badgeText: '#B5D6C6',
      accent: '#68A98F',
    },
  },

  // === NHÓM 3: CHỨC NĂNG & UY TÍN (Yêu cầu Uy Tín >= 7) ===
  cau_dong_ton_di: {
    title: 'CẦU ĐỒNG TỒN DỊ',
    sub: 'Multilateral Concord',
    category: 'NGOẠI GIAO ĐA PHƯƠNG',
    tier: 'TIER I · LAM NGỌC',
    rarity: 'CAO QUÝ',
    requirement: 'YÊU CẦU: UY TÍN ≥ 7',
    effect: 'Hòa giải đa phương: Cộng thêm +2 điểm Uy Tín nếu phương án nhóm lựa chọn ưu tiên đàm phán hòa bình và hợp tác cùng có lợi.',
    usage: '1 LẦN / TOÀN TRẬN ĐẤU',
    lore: 'Tìm kiếm điểm tương đồng lớn nhất, gác lại bất đồng thứ yếu để kiến tạo hòa bình, cùng hợp tác phát triển bền vững.',
    quote: '« Tìm cái đồng, gác cái dị; thêm bạn bớt thù, đa phương hóa quan hệ quốc tế. »',
    colors: {
      bg: 'linear-gradient(145deg, #10212E 0%, #0A1620 50%, #050B10 100%)',
      border: '#4E7EA7',
      glow: 'rgba(78, 126, 167, 0.45)',
      badgeBg: 'linear-gradient(180deg, #2E5C8A, #183756)',
      badgeText: '#C7DCEF',
      accent: '#6B9DC4',
    },
  },
  un_resolution: {
    title: 'NGHỊ QUYẾT ĐHĐ LIÊN HỢP QUỐC',
    sub: 'UN General Assembly Mandate',
    category: 'NGOẠI GIAO ĐA PHƯƠNG',
    tier: 'TIER II · LAM NGỌC',
    rarity: 'CAO QUÝ',
    requirement: 'YÊU CẦU: UY TÍN ≥ 7',
    effect: 'Chính danh quốc tế: Soi sáng phương án tối ưu hóa chỉ số Uy Tín nhất trước khi nhóm quyết định nộp bài (+2 Uy Tín khi hoàn thành).',
    usage: '1 LẦN / TOÀN TRẬN ĐẤU',
    lore: 'Đại hội đồng LHQ là vũ đài pháp lý tối cao: Tranh thủ sự ủng hộ của công lý quốc tế để bảo vệ các lợi ích chính đáng.',
    quote: '« Thượng tôn Hiến chương Liên Hợp Quốc và luật pháp quốc tế, bình đẳng giữa các quốc gia. »',
    colors: {
      bg: 'linear-gradient(145deg, #10212E 0%, #0A1620 50%, #050B10 100%)',
      border: '#4E7EA7',
      glow: 'rgba(78, 126, 167, 0.45)',
      badgeBg: 'linear-gradient(180deg, #2E5C8A, #183756)',
      badgeText: '#C7DCEF',
      accent: '#6B9DC4',
    },
  },
  diplomatic_gong: {
    title: 'TIẾNG CHIÊNG NGOẠI GIAO',
    sub: 'Diplomatic Resonator',
    category: 'NGOẠI GIAO ĐA PHƯƠNG',
    tier: 'TIER III · LAM NGỌC',
    rarity: 'CAO QUÝ',
    requirement: 'YÊU CẦU: UY TÍN ≥ 7',
    effect: 'Tuyên cáo chính nghĩa: Nhân đôi toàn bộ điểm số tổng (TC + KT + UT) nhận được trong lượt biểu quyết hiện tại!',
    usage: '1 LẦN / TOÀN TRẬN ĐẤU',
    lore: 'Khí phách ngoại giao Hồ Chí Minh vang vọng khắp năm châu: Đem lẽ phải và hòa bình cảm hóa thế giới.',
    quote: '« Văn hóa là ngọn đuốc soi đường cho quốc dân đi; chính nghĩa ngoại giao quy tụ lòng người. »',
    colors: {
      bg: 'linear-gradient(145deg, #10212E 0%, #0A1620 50%, #050B10 100%)',
      border: '#4E7EA7',
      glow: 'rgba(78, 126, 167, 0.45)',
      badgeBg: 'linear-gradient(180deg, #2E5C8A, #183756)',
      badgeText: '#C7DCEF',
      accent: '#6B9DC4',
    },
  },

  // Aliases cho tương thích ngược
  anchor: {
    title: 'DĨ BẤT BIẾN, ỨNG VẠN BIẾN',
    sub: 'Anchor of Sovereignty',
    category: 'PHÒNG THỦ CHIẾN LƯỢC',
    tier: 'TIER I · NGỌC BÍCH',
    rarity: 'BẢO VẬT',
    requirement: 'YÊU CẦU: TỰ CHỦ ≥ 7',
    effect: 'Vô hiệu hóa 100% mọi delta âm (Δ-) của trục Tự Chủ trong câu hỏi hiện tại.',
    usage: '1 LẦN / TOÀN TRẬN ĐẤU',
    lore: 'Nguyên lý cốt lõi của Chủ tịch Hồ Chí Minh: Giữ vững độc lập, chủ quyền làm gốc rễ.',
    quote: '« Dĩ bất biến, ứng vạn biến. Lợi ích tối cao của dân tộc là bất biến. »',
    colors: {
      bg: 'linear-gradient(145deg, #13271F 0%, #0C1A14 50%, #06110D 100%)',
      border: '#2F7D62',
      glow: 'rgba(47, 125, 98, 0.4)',
      badgeBg: 'linear-gradient(180deg, #1C5C47, #0F3628)',
      badgeText: '#B5D6C6',
      accent: '#68A98F',
    },
  },
  alliance: {
    title: 'CẦU ĐỒNG TỒN DỊ',
    sub: 'Multilateral Concord',
    category: 'NGOẠI GIAO ĐA PHƯƠNG',
    tier: 'TIER I · LAM NGỌC',
    rarity: 'CAO QUÝ',
    requirement: 'YÊU CẦU: UY TÍN ≥ 7',
    effect: 'Hòa giải đa phương: Cộng thêm +2 điểm Uy Tín nếu lựa chọn đối thoại hòa bình.',
    usage: '1 LẦN / TOÀN TRẬN ĐẤU',
    lore: 'Tìm kiếm điểm tương đồng lớn nhất, gác lại bất đồng thứ yếu.',
    quote: '« Tìm cái đồng, gác cái dị; thêm bạn bớt thù. »',
    colors: {
      bg: 'linear-gradient(145deg, #10212E 0%, #0A1620 50%, #050B10 100%)',
      border: '#4E7EA7',
      glow: 'rgba(78, 126, 167, 0.45)',
      badgeBg: 'linear-gradient(180deg, #2E5C8A, #183756)',
      badgeText: '#C7DCEF',
      accent: '#6B9DC4',
    },
  },
  challenge: {
    title: 'TIẾNG CHIÊNG NGOẠI GIAO',
    sub: 'Diplomatic Resonator',
    category: 'NGOẠI GIAO ĐA PHƯƠNG',
    tier: 'TIER III · LAM NGỌC',
    rarity: 'CAO QUÝ',
    requirement: 'YÊU CẦU: UY TÍN ≥ 7',
    effect: 'Nhân đôi toàn bộ điểm số tổng (TC + KT + UT) nhận được trong lượt hiện tại.',
    usage: '1 LẦN / TOÀN TRẬN ĐẤU',
    lore: 'Khí phách ngoại giao Hồ Chí Minh đem lẽ phải và hòa bình cảm hóa thế giới.',
    quote: '« Văn hóa là ngọn đuốc soi đường cho quốc dân đi. »',
    colors: {
      bg: 'linear-gradient(145deg, #10212E 0%, #0A1620 50%, #050B10 100%)',
      border: '#4E7EA7',
      glow: 'rgba(78, 126, 167, 0.45)',
      badgeBg: 'linear-gradient(180deg, #2E5C8A, #183756)',
      badgeText: '#C7DCEF',
      accent: '#6B9DC4',
    },
  },
};

const renderCardArtwork = (cardType: CardType, size: number) => {
  if (
    cardType === 'break_supply' ||
    cardType === 'counter_tariff' ||
    cardType === 'submarine_cable' ||
    cardType === 'challenge'
  ) {
    return <CardChallengeArt size={size} />;
  }
  if (
    cardType === 'cau_dong_ton_di' ||
    cardType === 'un_resolution' ||
    cardType === 'diplomatic_gong' ||
    cardType === 'alliance'
  ) {
    return <CardAllianceArt size={size} />;
  }
  return <CardAnchorArt size={size} />;
};

export const TacticalCard: React.FC<TacticalCardProps> = ({
  type,
  status = 'ready',
  compact = false,
  onActivate,
  canActivate = true,
  className = '',
}) => {
  const meta: CardMeta = (CARD_DATA[type] || CARD_DATA.di_bat_bien || CARD_DATA.anchor)!;
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glintX, setGlintX] = useState(50);
  const [glintY, setGlintY] = useState(50);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFace, setModalFace] = useState<'front' | 'back'>('front');

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

        {/* Modal Xem Cận Cảnh & Kích Hoạt Thẻ (Render qua Portal để gắn vào document.body tránh lỗi backdrop-filter) */}
        {isModalOpen && typeof document !== 'undefined' && createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              background: 'rgba(3, 8, 6, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxSizing: 'border-box',
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 350,
                maxHeight: '90vh',
                overflowY: 'auto',
                borderRadius: 24,
                padding: '20px 20px',
                border: `1.5px solid ${meta.colors.border}`,
                background: meta.colors.bg,
                boxShadow: `0 25px 60px rgba(0,0,0,0.85), 0 0 35px ${meta.colors.glow}`,
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Controls: Face Switcher & Close */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playCardFlip();
                      setModalFace('front');
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 10,
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: 700,
                      border: modalFace === 'front' ? `1px solid ${meta.colors.border}` : '1px solid rgba(255,255,255,0.1)',
                      background: modalFace === 'front' ? 'rgba(216, 180, 109, 0.2)' : 'rgba(255,255,255,0.03)',
                      color: modalFace === 'front' ? '#F3CA68' : '#94A3B8',
                      cursor: 'pointer',
                    }}
                  >
                    MẶT TRƯỚC
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playCardFlip();
                      setModalFace('back');
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 10,
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: 700,
                      border: modalFace === 'back' ? `1px solid ${meta.colors.border}` : '1px solid rgba(255,255,255,0.1)',
                      background: modalFace === 'back' ? 'rgba(216, 180, 109, 0.2)' : 'rgba(255,255,255,0.03)',
                      color: modalFace === 'back' ? '#F3CA68' : '#94A3B8',
                      cursor: 'pointer',
                    }}
                  >
                    ĐIỂN TÍCH BÁC HỒ
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  ✕
                </button>
              </div>

              {modalFace === 'front' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
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

                  <h3 style={{ margin: '4px 0 2px', fontSize: 21, fontWeight: 800, fontFamily: 'var(--font-display, sans-serif)', color: '#F3EEDC' }}>
                    {meta.title}
                  </h3>
                  <div style={{ fontSize: 11, color: '#8E9C95', fontFamily: 'var(--font-mono, monospace)', letterSpacing: 1, marginBottom: 12 }}>
                    {meta.sub}
                  </div>

                  {/* Tactical Sigil Artwork */}
                  <div
                    onClick={() => {
                      audioEngine.playCardFlip();
                      setModalFace('back');
                    }}
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      margin: '8px 0 12px',
                      cursor: 'pointer',
                    }}
                    title="Chạm để lật xem Điển tích"
                  >
                    <div
                      style={{
                        width: 92,
                        height: 92,
                        borderRadius: '50%',
                        border: `1.5px solid ${meta.colors.border}`,
                        background: 'radial-gradient(circle, rgba(28,92,71,0.45) 0%, rgba(9,18,14,0.95) 80%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 0 25px ${meta.colors.glow}`,
                      }}
                    >
                      {renderCardArtwork(type, 74)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', fontSize: 9.5, color: '#8E9C95', fontStyle: 'italic', marginBottom: 10 }}>
                    Chạm biểu trưng hoặc tab trên để lật xem Điển tích Hồ Chí Minh ↻
                  </div>

                  <div style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 14 }}>
                    <div style={{ fontSize: 9, fontFamily: 'var(--font-mono, monospace)', letterSpacing: 1.5, color: '#D8B46D', marginBottom: 4, textTransform: 'uppercase' }}>
                      TÁC DỤNG CHIẾN LƯỢC
                    </div>
                    <p style={{ margin: 0, fontSize: 12.5, color: '#F3EEDC', lineHeight: 1.5 }}>
                      {meta.effect}
                    </p>
                  </div>
                </>
              ) : (
                /* Mặt sau: Điển tích Bác Hồ */
                <div style={{ padding: '4px 0 12px' }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono, monospace)', letterSpacing: 2, color: '#68A98F', marginBottom: 6, textTransform: 'uppercase' }}>
                    DI SẢN NGOẠI GIAO HỒ CHÍ MINH
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-display, sans-serif)', color: '#F3CA68', marginBottom: 10 }}>
                    {meta.title}
                  </div>

                  <blockquote
                    style={{
                      margin: '0 0 12px 0',
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: 'rgba(216, 180, 109, 0.08)',
                      borderLeft: '3px solid #D8B46D',
                      fontStyle: 'italic',
                      fontSize: 12,
                      color: '#F3EEDC',
                      lineHeight: 1.6,
                    }}
                  >
                    {meta.quote}
                  </blockquote>

                  <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(17, 33, 28, 0.6)', border: '1px solid rgba(47, 125, 98, 0.25)', marginBottom: 14 }}>
                    <div style={{ fontSize: 9, fontFamily: 'var(--font-mono, monospace)', color: '#A8B3AF', letterSpacing: 1, marginBottom: 4 }}>
                      BỐI CẢNH LỊCH SỬ & ÁP DỤNG
                    </div>
                    <p style={{ margin: 0, fontSize: 11.5, color: '#CBD5E1', lineHeight: 1.55 }}>
                      {meta.lore}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 6 }}>
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
          </div>,
          document.body
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
        width: 324,
        minHeight: 520,
        height: 520,
        borderRadius: 24,
        cursor: 'pointer',
        userSelect: 'none',
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        boxShadow: `0 20px 45px rgba(0,0,0,0.7), 0 0 25px ${meta.colors.glow}`,
        transition: 'transform 0.15s ease-out',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 24,
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: `2px solid ${meta.colors.border}`,
          overflow: 'hidden',
          background: meta.colors.bg,
          boxSizing: 'border-box',
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

        {!isFlipped ? (
          /* MẶT TRƯỚC: TÁC DỤNG CHIẾN LƯỢC */
          <>
            {/* Card Header */}
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontSize: 9.5, fontFamily: 'var(--font-mono, monospace)', letterSpacing: 2, color: '#D8B46D', textTransform: 'uppercase' }}>
                  {meta.category}
                </div>
                <h3 style={{ margin: '4px 0 2px', fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-display, sans-serif)', color: '#F3EEDC', lineHeight: 1.25 }}>
                  {meta.title}
                </h3>
                <div style={{ fontSize: 10.5, color: '#A8B3AF', fontFamily: 'var(--font-mono, monospace)' }}>
                  {meta.sub}
                </div>
              </div>
              <span
                style={{
                  fontSize: 9.5,
                  fontFamily: 'var(--font-mono, monospace)',
                  padding: '3px 8px',
                  borderRadius: 4,
                  fontWeight: 800,
                  background: meta.colors.badgeBg,
                  color: meta.colors.badgeText,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {meta.tier}
              </span>
            </div>

            {/* Center Artwork Emblem */}
            <div style={{ position: 'relative', zIndex: 10, margin: '4px 0 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  border: `1.5px solid ${meta.colors.border}`,
                  background: 'radial-gradient(circle, rgba(28,92,71,0.45) 0%, rgba(9,18,14,0.85) 80%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 20px ${meta.colors.glow}`,
                }}
              >
                {renderCardArtwork(type, 56)}
              </div>
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono, monospace)', color: 'rgba(203,213,225,0.7)', marginTop: 6, letterSpacing: 1.2 }}>
                CHẠM ĐỂ LẬT XEM ĐIỂN TÍCH ↻
              </span>
            </div>

            {/* Card Footer: Action Box (Fix Truncation & Enable Full Clean Wrap) */}
            <div
              style={{
                position: 'relative',
                zIndex: 10,
                padding: '10px 12px',
                borderRadius: 12,
                background: 'rgba(0,0,0,0.55)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxSizing: 'border-box',
                width: '100%',
              }}
            >
              <div style={{ fontSize: 9, fontFamily: 'var(--font-mono, monospace)', letterSpacing: 1.5, color: '#D8B46D', textTransform: 'uppercase', marginBottom: 4 }}>
                TÁC DỤNG CHIẾN LƯỢC
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: '#F3EEDC',
                  lineHeight: 1.45,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                }}
              >
                {meta.effect}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 9, fontFamily: 'var(--font-mono, monospace)', color: '#A8B3AF' }}>
                <span>{meta.usage}</span>
                <span style={{ color: meta.colors.accent, fontWeight: 700 }}>{meta.rarity}</span>
              </div>
            </div>
          </>
        ) : (
          /* MẶT SAU: ĐIỂN TÍCH BÁC HỒ & TRIẾT LÝ NGOẠI GIAO */
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono, monospace)', letterSpacing: 1.5, color: '#68A98F', textTransform: 'uppercase' }}>
                  DI SẢN NGOẠI GIAO HỒ CHÍ MINH
                </span>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono, monospace)', color: '#D8B46D' }}>
                  {meta.tier}
                </span>
              </div>

              <h4 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 800, fontFamily: 'var(--font-display, sans-serif)', color: '#F3CA68', lineHeight: 1.25 }}>
                {meta.title}
              </h4>

              <blockquote
                style={{
                  margin: '0 0 12px 0',
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'rgba(216, 180, 109, 0.08)',
                  borderLeft: '3px solid #D8B46D',
                  fontStyle: 'italic',
                  fontSize: 11.5,
                  color: '#F3EEDC',
                  lineHeight: 1.55,
                }}
              >
                {meta.quote}
              </blockquote>

              <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(17, 33, 28, 0.65)', border: '1px solid rgba(47, 125, 98, 0.3)' }}>
                <div style={{ fontSize: 8.5, fontFamily: 'var(--font-mono, monospace)', color: '#A8B3AF', letterSpacing: 1, marginBottom: 4 }}>
                  BỐI CẢNH LỊCH SỬ & Ý NGHĨA
                </div>
                <p style={{ margin: 0, fontSize: 11, color: '#CBD5E1', lineHeight: 1.5 }}>
                  {meta.lore}
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'center', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 9.5, fontFamily: 'var(--font-mono, monospace)', color: '#D8B46D', letterSpacing: 1 }}>
                CHẠM ĐỂ QUAY LẠI MẶT TRƯỚC ↻
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
