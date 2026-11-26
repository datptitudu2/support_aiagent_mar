const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function createSeedData() {
  const now = new Date();
  const daysAgo = (d) => new Date(now.getTime() - d * 86400000).toISOString();

  return {
    brand: {
      name: 'AuraSkin',
      industry: 'Mỹ phẩm / Chăm sóc da thiên nhiên (Skincare Local Brand)',
      targetAudience:
        'Nữ 20-32 tuổi, sinh viên và nhân viên văn phòng, quan tâm thành phần lành tính, dễ kích ứng, thường đọc review trước khi mua.',
      brandVoice:
        'Gần gũi, chân thành, có kiến thức chuyên môn dễ hiểu, không dùng từ sáo rỗng, xưng hô "AuraSkin – bạn".',
      products: [
        {
          id: 'p1',
          name: 'Kem chống nắng thoáng nhẹ AuraSkin SPF50+ PA++++',
          price: '285.000đ / 50ml',
          usp: 'Thấm nhanh sau 45 giây, không nâng tông giả, không gây bít tắc lỗ chân lông cho da dầu mụn.',
        },
        {
          id: 'p2',
          name: 'Serum rau má phục hồi AuraSkin B5 5%',
          price: '320.000đ / 30ml',
          usp: 'Làm dịu da mẩn đỏ, không cồn, không hương liệu, phù hợp da nhạy cảm sau nặn mụn.',
        },
        {
          id: 'p3',
          name: 'Sữa rửa mặt dịu nhẹ pH 5.5 AuraSkin',
          price: '195.000đ / 150ml',
          usp: 'Làm sạch dịu nhẹ không gây khô căng, giữ ẩm tự nhiên sau khi rửa.',
        },
      ],
      bannedWords: [
        'trị dứt điểm 100%',
        'trắng bật tông sau 1 đêm',
        'cam kết khỏi mụn vĩnh viễn',
        'thần thánh',
        'hiệu quả tức thì',
      ],
    },
    settings: {
      aiProvider: 'local', // 'local' | 'gemini' | 'openai'
      geminiApiKey: '',
      geminiModel: 'gemini-2.5-flash',
      openaiApiKey: '',
      openaiModel: 'gpt-4o-mini',
      publishMode: 'mock', // 'mock' | 'telegram' | 'facebook'
      telegramBotToken: '',
      telegramChatId: '',
      fbPageId: '',
      fbAccessToken: '',
    },
    competitors: [
      {
        id: 'c1',
        name: 'Mộc Thảo Skincare',
        channel: 'Facebook Fanpage',
        url: 'https://facebook.com/mocthaoskincare',
        segment: 'Đối thủ trực tiếp',
      },
      {
        id: 'c2',
        name: 'LumiDerma VN',
        channel: 'Facebook & TikTok',
        url: 'https://facebook.com/lumidermavn',
        segment: 'Đối thủ trực tiếp',
      },
      {
        id: 'c3',
        name: 'Sora Botanicals',
        channel: 'Facebook Fanpage',
        url: 'https://facebook.com/sorabotanicals',
        segment: 'Thương hiệu dẫn đầu phân khúc',
      },
    ],
    collectedPosts: [
      {
        id: 'cp1',
        competitorId: 'c1',
        competitorName: 'Mộc Thảo Skincare',
        channel: 'Facebook',
        collectedAt: daysAgo(1),
        pillar: 'Bán hàng / Khuyến mãi',
        title: 'Flash Sale đầu hè: Mua 1 tặng 1 Kem chống nắng thảo mộc',
        content:
          'Nắng nóng chạm đỉnh rồi nàng ơi! Mộc Thảo tung ưu đãi Mua 1 Tặng 1 dòng Kem chống nắng thảo mộc SPF50 chỉ trong 48 giờ cuối tuần. Giảm thêm 10% cho đơn từ 399k. Nhắn tin ngay để giữ suất!',
        likes: 420,
        commentsCount: 86,
        shares: 34,
        isPromoAlert: true,
        promoDetail: 'Mua 1 tặng 1 Kem chống nắng + giảm thêm 10% (48h)',
        topComments: [
          'Da dầu dùng có bị bí hay xuống tông cuối ngày không shop?',
          'Mình mua đợt trước thấy hơi dày mặt một chút nhưng mùi dễ chịu.',
          'Giao về Hà Nội mất mấy ngày vậy shop?',
        ],
        sourceUrl: 'https://facebook.com/mocthaoskincare/posts/101',
      },
      {
        id: 'cp2',
        competitorId: 'c2',
        competitorName: 'LumiDerma VN',
        channel: 'TikTok',
        collectedAt: daysAgo(2),
        pillar: 'Giáo dục kiến thức',
        title: '3 sai lầm khi thoa Serum B5 khiến da mãi không phục hồi',
        content:
          'Nhiều bạn dùng B5 cả tháng vẫn thấy da khô căng, rát nhẹ? Lý do nằm ở việc thoa trên nền da quá khô và không khóa ẩm ngay sau đó. Cùng LumiDerma kiểm tra lại chu trình 3 bước chuẩn cho da nhạy cảm.',
        likes: 1280,
        commentsCount: 142,
        shares: 215,
        isPromoAlert: false,
        promoDetail: '',
        topComments: [
          'Thảo nào mình bôi xong thấy dính dính mà da vẫn mốc.',
          'B5 bên mình có dùng chung với Retinol được không ạ?',
          'Giá lọ 30ml bao nhiêu vậy shop, thấy hơi cao so với sinh viên.',
        ],
        sourceUrl: 'https://tiktok.com/@lumidermavn/video/202',
      },
      {
        id: 'cp3',
        competitorId: 'c3',
        competitorName: 'Sora Botanicals',
        channel: 'Facebook',
        collectedAt: daysAgo(3),
        pillar: 'Đánh giá / Review',
        title: 'Feedback 14 ngày phục hồi da kích ứng từ khách hàng văn phòng',
        content:
          'Ngồi điều hòa 8 tiếng mỗi ngày khiến da dễ mất nước và mẩn đỏ hai bên má. Chị Minh Anh (26 tuổi) chia sẻ cảm nhận sau 2 tuần tối giản chu trình chỉ còn Sữa rửa mặt dịu nhẹ và Serum phục hồi.',
        likes: 690,
        commentsCount: 64,
        shares: 48,
        isPromoAlert: false,
        promoDetail: '',
        topComments: [
          'Da mình cũng ngồi máy lạnh suốt, hay bị đỏ hai má giống chị này.',
          'Có bản mini dùng thử không shop? Sợ mua chai to không hợp.',
        ],
        sourceUrl: 'https://facebook.com/sorabotanicals/posts/303',
      },
      {
        id: 'cp4',
        competitorId: 'c1',
        competitorName: 'Mộc Thảo Skincare',
        channel: 'Facebook',
        collectedAt: daysAgo(4),
        pillar: 'Bắt trend / Tương tác',
        title: 'Kiểm tra loại da của bạn qua 1 câu hỏi nhanh buổi sáng',
        content:
          'Sáng ngủ dậy vùng chữ T đổ dầu nhưng hai má lại căng khô? Comment ngay tình trạng da hiện tại của bạn bên dưới để chuyên viên gợi ý chu trình tối giản dưới 500k nhé.',
        likes: 310,
        commentsCount: 95,
        shares: 19,
        isPromoAlert: false,
        promoDetail: '',
        topComments: [
          'Mình bị đổ dầu vùng mũi, hay có mụn ẩn ở cằm.',
          'Mình da nhạy cảm dễ đỏ khi ra nắng.',
        ],
        sourceUrl: 'https://facebook.com/mocthaoskincare/posts/104',
      },
    ],
    analysis: null,
    drafts: [
      {
        id: 'd1',
        title: 'Vì sao da dầu thường ngại thoa kem chống nắng vào mùa nóng?',
        channel: 'Facebook Fanpage',
        pillar: 'Giáo dục kiến thức',
        angleSource: 'Khoảng trống từ bình luận khách hàng của Mộc Thảo Skincare',
        content:
          'Nhiều bạn da dầu chia sẻ với AuraSkin rằng ngại thoa lại kem chống nắng giữa trưa vì sợ cảm giác dày mặt, bí da và xuống tông cuối ngày.\n\nThực tế, cảm giác nặng mặt thường đến từ kết cấu kem quá đặc hoặc lớp dưỡng bên dưới chưa kịp thấm. Với thời tiết nóng ẩm, bạn chỉ cần ưu tiên kem chống nắng thấm nhanh dưới 1 phút, không nâng tông giả và không chứa dầu khoáng gây bít tắc.\n\nKem chống nắng thoáng nhẹ AuraSkin SPF50+ PA++++ (285.000đ / 50ml) được thiết kế riêng cho da dầu mụn: ráo mịn sau 45 giây, giữ bề mặt da tự nhiên suốt ngày làm việc.\n\nBạn đang gặp tình trạng bí da hay đổ dầu khi dùng kem chống nắng? Nhắn tin cho AuraSkin để được tư vấn đúng loại da nhé.\n\n#AuraSkin #ChamSocDaDau #KemChongNangThoangNhe #SkincareThienNhien',
        visualBrief:
          'Ảnh chụp cận cảnh kết cấu kem chống nắng thấm trong suốt trên mu bàn tay, ánh sáng tự nhiên, nền trắng sạch. Chèn 1 dòng chữ ngắn gọn: "Ráo nhẹ sau 45 giây – Không bết rít, không nâng tông giả".',
        status: 'pending', // 'draft' | 'pending' | 'scheduled' | 'published'
        scheduledFor: new Date(now.getTime() + 86400000).toISOString().slice(0, 16),
        publishedAt: null,
        publishLog: '',
        createdAt: daysAgo(0),
      },
    ],
    activityLogs: [
      {
        id: 'log1',
        timestamp: daysAgo(0),
        stage: 'Khởi tạo hệ thống',
        message: 'Đã nạp hồ sơ thương hiệu AuraSkin và 4 bài đăng mẫu từ 3 đối thủ.',
      },
    ],
  };
}

function loadDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const seed = createSeedData();
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), 'utf8');
    return seed;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    const seed = createSeedData();
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), 'utf8');
    return seed;
  }
}

function saveDb(db) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

function addLog(db, stage, message) {
  db.activityLogs.unshift({
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
    stage,
    message,
  });
  db.activityLogs = db.activityLogs.slice(0, 30);
}

function checkCompliance(text, bannedWords = []) {
  const lower = (text || '').toLowerCase();
  const violations = [];
  for (const w of bannedWords) {
    const clean = (w || '').trim();
    if (clean && lower.includes(clean.toLowerCase())) {
      violations.push(clean);
    }
  }
  return {
    passed: violations.length === 0,
    violations,
  };
}

// Local deterministic Vietnamese Marketing Intelligence Engine (works offline / without API key)
function runLocalAnalysis(db) {
  const posts = db.collectedPosts || [];
  const total = posts.length || 1;
  const pillarCounts = {};
  const promoAlerts = [];
  const customerPainPoints = [];

  for (const p of posts) {
    const pillar = p.pillar || 'Khác';
    pillarCounts[pillar] = (pillarCounts[pillar] || 0) + 1;
    if (p.isPromoAlert || /giảm|sale|tặng|ưu đãi|voucher/i.test(p.content + ' ' + p.title)) {
      promoAlerts.push({
        competitor: p.competitorName,
        title: p.title,
        detail: p.promoDetail || 'Phát hiện từ khóa khuyến mãi trong bài đăng gần đây.',
      });
    }
    for (const c of p.topComments || []) {
      if (/bí|dày|dính|cao|đắt|mốc|đỏ|mụn|mini|dùng thử|mấy ngày/i.test(c)) {
        customerPainPoints.push({
          competitor: p.competitorName,
          comment: c,
        });
      }
    }
  }

  const pillarBreakdown = Object.entries(pillarCounts)
    .map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const sortedByEng = [...posts].sort(
    (a, b) =>
      (b.likes || 0) + (b.commentsCount || 0) * 3 + (b.shares || 0) * 4 -
      ((a.likes || 0) + (a.commentsCount || 0) * 3 + (a.shares || 0) * 4)
  );

  const topHooks = sortedByEng.slice(0, 3).map((p) => ({
    competitor: p.competitorName,
    channel: p.channel,
    title: p.title,
    engagementScore: (p.likes || 0) + (p.commentsCount || 0) * 3 + (p.shares || 0) * 4,
    metrics: `${p.likes || 0} thích · ${p.commentsCount || 0} bình luận · ${p.shares || 0} chia sẻ`,
    reason:
      p.pillar === 'Giáo dục kiến thức'
        ? 'Đánh trúng nỗi đau thực tế khi dùng sản phẩm, dễ lưu và chia sẻ.'
        : p.pillar === 'Bán hàng / Khuyến mãi'
          ? 'Tạo tính khẩn cấp ngắn hạn (48h) kết hợp ưu đãi dễ hiểu.'
          : 'Khơi gợi sự đồng cảm qua tình huống thực tế của khách hàng văn phòng.',
  }));

  const brandName = db.brand?.name || 'Thương hiệu';
  const products = db.brand?.products || [];
  const p1 = products[0]?.name || 'Sản phẩm chủ lực 1';
  const p2 = products[1]?.name || 'Sản phẩm chủ lực 2';

  const contentGaps = [
    {
      gap: 'Khách hàng ngại kem chống nắng dày mặt, bí da và xuống tông cuối ngày',
      evidence: 'Xuất hiện trực tiếp trong bình luận dưới bài khuyến mãi của đối thủ.',
      opportunity: `Tập trung chứng minh độ thoáng nhẹ, thấm nhanh và không gây bít tắc của ${p1}.`,
    },
    {
      gap: 'Người dùng còn lúng túng cách kết hợp Serum B5 và lo ngại mức giá cao',
      evidence: 'Nhiều bình luận hỏi cách kết hợp hoạt chất và chần chừ về giá ở nhóm sinh viên/văn phòng.',
      opportunity: `Làm bài hướng dẫn 3 bước phục hồi da dễ áp dụng tại nhà kèm mức giá minh bạch của ${p2}.`,
    },
    {
      gap: 'Nhu cầu trải nghiệm thực tế cho da ngồi điều hòa và da dễ mẩn đỏ',
      evidence: 'Bài chia sẻ câu chuyện thật của khách hàng văn phòng nhận tương tác ổn định.',
      opportunity: `Xây dựng tuyến nội dung nhật ký 7–14 ngày tối giản chu trình chăm da cùng ${brandName}.`,
    },
  ];

  const suggestedIdeas = [
    {
      id: 'idea_1',
      title: `So sánh cảm giác trên da: Kem chống nắng dày mặt vs. kết cấu ráo nhẹ 45 giây`,
      pillar: 'Giáo dục kiến thức',
      channel: 'Facebook Fanpage',
      targetProduct: p1,
      rationale: 'Đánh trực tiếp vào nỗi lo bí da mà khách hàng đang phản hồi ở đối thủ.',
    },
    {
      id: 'idea_2',
      title: `3 bước dùng Serum B5 đúng cách để da nhạy cảm dịu đỏ mà không bị dính`,
      pillar: 'Giáo dục kiến thức',
      channel: 'TikTok (Kịch bản ngắn)',
      targetProduct: p2,
      rationale: 'Tận dụng chủ đề đang đạt lượt chia sẻ cao nhất thị trường, bổ sung hướng dẫn dễ hiểu hơn.',
    },
    {
      id: 'idea_3',
      title: `Chu trình chăm da tối giản cho dân văn phòng ngồi máy lạnh 8 tiếng/ngày`,
      pillar: 'Đánh giá / Review',
      channel: 'Facebook Fanpage',
      targetProduct: p2,
      rationale: 'Khớp đúng tệp khách hàng mục tiêu 20-32 tuổi, dễ tạo bình luận đồng cảm.',
    },
    {
      id: 'idea_4',
      title: `Ưu đãi trải nghiệm cuối tuần: Tặng kèm tư vấn chu trình da cá nhân hóa`,
      pillar: 'Bán hàng / Khuyến mãi',
      channel: 'Facebook Fanpage',
      targetProduct: p1,
      rationale: 'Phản ứng nhanh trước đợt Flash Sale của đối thủ nhưng giữ định vị giá trị thay vì chỉ đua giảm giá.',
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    engine: 'Local Marketing Engine',
    totalPostsAnalyzed: posts.length,
    summary: `Đã phân tích ${posts.length} bài đăng từ ${db.competitors.length} đối thủ. Nhóm nội dung giáo dục kiến thức đạt tỷ lệ chia sẻ cao nhất, trong khi các bài khuyến mãi của đối thủ bộc lộ rõ nỗi lo của khách hàng về độ bí da và giá bán. Đây là cơ hội trực tiếp để ${brandName} định vị thông điệp thoáng nhẹ, lành tính và minh bạch.`,
    pillarBreakdown,
    promoAlerts,
    topHooks,
    customerPainPoints: customerPainPoints.slice(0, 6),
    contentGaps,
    suggestedIdeas,
  };
}

function generateLocalDraft(db, { title, pillar, channel, angleSource, targetProduct }) {
  const brand = db.brand;
  const prod =
    (brand.products || []).find((p) => p.name === targetProduct) ||
    (brand.products || [])[0] || {
      name: 'Sản phẩm chủ lực',
      price: 'Liên hệ',
      usp: 'Lành tính, phù hợp nhu cầu sử dụng hằng ngày.',
    };

  let content = '';
  let visualBrief = '';

  if ((channel || '').toLowerCase().includes('tiktok')) {
    content =
      `[00:00 - 00:04 | Hook mở đầu]\n` +
      `"${title}" — nếu bạn cũng đang gặp tình trạng thoa dưỡng mãi mà da vẫn khó chịu, hãy kiểm tra ngay 3 điểm nhỏ này.\n\n` +
      `[00:04 - 00:18 | Nội dung chính]\n` +
      `1. Không thoa trên nền da khô hoàn toàn: hãy giữ độ ẩm nhẹ ngay sau bước làm sạch.\n` +
      `2. Lấy lượng vừa đủ (2–3 giọt), vỗ nhẹ thay vì miết mạnh gây đỏ da.\n` +
      `3. Chọn công thức tối giản, không cồn và không hương liệu để hạn chế kích ứng.\n\n` +
      `[00:18 - 00:30 | Giải pháp & Kêu gọi hành động]\n` +
      `Với ${prod.name} (${prod.price}), điểm mạnh là ${prod.usp}\n` +
      `Lưu lại video này để áp dụng tối nay, hoặc bình luận tình trạng da để ${brand.name} gợi ý chu trình phù hợp cho bạn nhé.\n\n` +
      `#${brand.name.replace(/\s+/g, '')} #SkincareCoBan #ChamSocDaNhayCam`;
    visualBrief =
      'Quay dọc 9:16 bằng điện thoại ánh sáng tự nhiên cạnh cửa sổ. Cảnh 1: quay cận tay lấy sản phẩm. Cảnh 2: thao tác vỗ nhẹ lên da. Chữ phụ đề tối giản màu đen/trắng dễ đọc.';
  } else {
    content =
      `${title}\n\n` +
      `Khi theo dõi phản hồi của nhiều khách hàng trong nhóm ${brand.targetAudience.split(',')[0].toLowerCase()}, ${brand.name} nhận thấy phần lớn mọi người không ngại chăm da — điều khiến họ chần chừ là cảm giác nặng mặt, dễ kích ứng hoặc chu trình quá nhiều bước.\n\n` +
      `Thay vì chạy theo nhiều sản phẩm phức tạp, bạn có thể bắt đầu từ việc chọn đúng một sản phẩm cốt lõi giải quyết đúng nhu cầu hằng ngày:\n` +
      `- Sản phẩm gợi ý: ${prod.name} (${prod.price})\n` +
      `- Điểm khác biệt: ${prod.usp}\n\n` +
      `Với tiêu chí minh bạch thành phần và hướng tới trải nghiệm dịu nhẹ lâu dài, ${brand.name} luôn sẵn sàng lắng nghe tình trạng da thực tế của bạn trước khi tư vấn.\n\n` +
      `Bạn đang quan tâm vấn đề nào nhất của làn da tuần này? Bình luận bên dưới hoặc nhắn tin trực tiếp để ${brand.name} hỗ trợ nhé.\n\n` +
      `#${brand.name.replace(/\s+/g, '')} #ChamSocDaLanhTinh #MarketingInsight`;
    visualBrief =
      `Ảnh sản phẩm ${prod.name} đặt trên nền sáng tối giản (trắng hoặc be nhạt), kèm 1 góc ảnh cận chất sản phẩm. Tiêu đề ngắn trên ảnh (tối đa 8 chữ) nhấn mạnh USP chính, không nhồi nhiều chữ.`;
  }

  return {
    title: title || `Bài viết mới cho ${brand.name}`,
    pillar: pillar || 'Giáo dục kiến thức',
    channel: channel || 'Facebook Fanpage',
    angleSource: angleSource || 'Đề xuất từ phân tích đối thủ',
    content,
    visualBrief,
  };
}

// Optional real AI call (Gemini or OpenAI) with graceful fallback to local engine
async function callExternalAI(settings, systemPrompt, userPrompt) {
  if (settings.aiProvider === 'gemini' && settings.geminiApiKey) {
    const model = settings.geminiModel || 'gemini-2.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(settings.geminiApiKey)}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.5 },
      }),
    });
    if (!res.ok) {
      throw new Error(`Gemini API lỗi (${res.status}): ${await res.text()}`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  if (settings.aiProvider === 'openai' && settings.openaiApiKey) {
    const model = settings.openaiModel || 'gpt-4o-mini';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.openaiApiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.5,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });
    if (!res.ok) {
      throw new Error(`OpenAI API lỗi (${res.status}): ${await res.text()}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  return null;
}

function parseJsonFromText(text) {
  if (!text) return null;
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function analyzeWithAgent(db) {
  if (
    (db.settings.aiProvider === 'gemini' && db.settings.geminiApiKey) ||
    (db.settings.aiProvider === 'openai' && db.settings.openaiApiKey)
  ) {
    const systemPrompt =
      'Bạn là chuyên gia Marketing Intelligence. Trả về DUY NHẤT một đối tượng JSON hợp lệ (không thêm giải thích ngoài JSON) bằng tiếng Việt.';
    const userPrompt =
      `Hồ sơ thương hiệu:\n${JSON.stringify(db.brand, null, 2)}\n\n` +
      `Danh sách bài đăng đối thủ:\n${JSON.stringify(db.collectedPosts, null, 2)}\n\n` +
      `Hãy phân tích và trả về JSON theo đúng cấu trúc:\n` +
      `{"summary": "...", "contentGaps": [{"gap":"...", "evidence":"...", "opportunity":"..."}], "suggestedIdeas": [{"id":"idea_1", "title":"...", "pillar":"...", "channel":"Facebook Fanpage", "targetProduct":"...", "rationale":"..."}]}`;
    try {
      const raw = await callExternalAI(db.settings, systemPrompt, userPrompt);
      const parsed = parseJsonFromText(raw);
      const base = runLocalAnalysis(db);
      if (parsed) {
        return {
          ...base,
          engine: db.settings.aiProvider === 'gemini' ? `Gemini (${db.settings.geminiModel})` : `OpenAI (${db.settings.openaiModel})`,
          summary: parsed.summary || base.summary,
          contentGaps: Array.isArray(parsed.contentGaps) && parsed.contentGaps.length ? parsed.contentGaps : base.contentGaps,
          suggestedIdeas:
            Array.isArray(parsed.suggestedIdeas) && parsed.suggestedIdeas.length ? parsed.suggestedIdeas : base.suggestedIdeas,
        };
      }
    } catch (err) {
      const fallback = runLocalAnalysis(db);
      fallback.engine = `Local Fallback (Lỗi API: ${err.message.slice(0, 80)})`;
      return fallback;
    }
  }
  return runLocalAnalysis(db);
}

async function draftWithAgent(db, payload) {
  if (
    (db.settings.aiProvider === 'gemini' && db.settings.geminiApiKey) ||
    (db.settings.aiProvider === 'openai' && db.settings.openaiApiKey)
  ) {
    const systemPrompt =
      `Bạn là Copywriter nội bộ của thương hiệu ${db.brand.name}. ` +
      `Giọng văn: ${db.brand.brandVoice}. ` +
      `KHÔNG ĐƯỢC DÙNG các từ cấm sau: ${(db.brand.bannedWords || []).join(', ')}. ` +
      `Trả về DUY NHẤT JSON: {"title": "...", "content": "...", "visualBrief": "..."}.`;
    const userPrompt =
      `Thông tin sản phẩm:\n${JSON.stringify(db.brand.products, null, 2)}\n\n` +
      `Yêu cầu bài viết:\n- Chủ đề: ${payload.title}\n- Trụ cột nội dung: ${payload.pillar}\n- Kênh: ${payload.channel}\n- Góc tiếp cận: ${payload.angleSource || ''}\n- Sản phẩm ưu tiên: ${payload.targetProduct || ''}`;
    try {
      const raw = await callExternalAI(db.settings, systemPrompt, userPrompt);
      const parsed = parseJsonFromText(raw);
      if (parsed && parsed.content) {
        return {
          title: parsed.title || payload.title,
          pillar: payload.pillar || 'Giáo dục kiến thức',
          channel: payload.channel || 'Facebook Fanpage',
          angleSource: payload.angleSource || 'Đề xuất từ AI Agent',
          content: parsed.content,
          visualBrief: parsed.visualBrief || 'Ảnh sản phẩm trên nền sáng tối giản, nhấn mạnh USP chính.',
        };
      }
    } catch (err) {
      addLog(db, 'Soạn thảo (Fallback)', `API lỗi, chuyển sang Local Engine: ${err.message.slice(0, 80)}`);
    }
  }
  return generateLocalDraft(db, payload);
}

async function fetchPublicUrl(targetUrl) {
  const res = await fetch(targetUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MarketingResearchBot/1.0' },
  });
  if (!res.ok) {
    throw new Error(`Không thể truy cập trang (${res.status})`);
  }
  const html = await res.text();
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const title = (titleMatch ? titleMatch[1] : targetUrl).replace(/\s+/g, ' ').trim().slice(0, 140);
  const content = (descMatch ? descMatch[1] + ' — ' : '') + bodyText.slice(0, 420);
  return { title, content };
}

async function sendTelegramMessage(botToken, chatId, text) {
  const endpoint = `https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: String(text || '').slice(0, 4000),
      disable_web_page_preview: true,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.description || `Telegram API lỗi (${res.status})`);
  }
  return data.result;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 2 * 1024 * 1024) {
        reject(new Error('Payload quá lớn'));
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('JSON không hợp lệ'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  try {
    // API Routes
    if (pathname === '/api/state' && req.method === 'GET') {
      const db = loadDb();
      return sendJson(res, 200, db);
    }

    if (pathname === '/api/brand' && req.method === 'PUT') {
      const db = loadDb();
      const body = await readJsonBody(req);
      db.brand = { ...db.brand, ...body };
      addLog(db, 'Hồ sơ thương hiệu', `Đã cập nhật Brand Guideline cho ${db.brand.name}.`);
      saveDb(db);
      return sendJson(res, 200, db.brand);
    }

    if (pathname === '/api/settings' && req.method === 'PUT') {
      const db = loadDb();
      const body = await readJsonBody(req);
      db.settings = { ...db.settings, ...body };
      addLog(db, 'Cấu hình hệ thống', `Đã cập nhật cấu hình AI (${db.settings.aiProvider}) và chế độ đăng (${db.settings.publishMode}).`);
      saveDb(db);
      return sendJson(res, 200, db.settings);
    }

    if (pathname === '/api/competitors' && req.method === 'POST') {
      const db = loadDb();
      const body = await readJsonBody(req);
      const comp = {
        id: 'c_' + Date.now(),
        name: (body.name || '').trim() || 'Đối thủ mới',
        channel: (body.channel || '').trim() || 'Facebook Fanpage',
        url: (body.url || '').trim(),
        segment: (body.segment || '').trim() || 'Đối thủ trực tiếp',
      };
      db.competitors.unshift(comp);
      addLog(db, 'Thu thập đối thủ', `Đã thêm đối thủ theo dõi: ${comp.name}.`);
      saveDb(db);
      return sendJson(res, 201, comp);
    }

    if (pathname.startsWith('/api/competitors/') && req.method === 'DELETE') {
      const id = pathname.split('/').pop();
      const db = loadDb();
      db.competitors = db.competitors.filter((c) => c.id !== id);
      saveDb(db);
      return sendJson(res, 200, { ok: true });
    }

    if (pathname === '/api/posts' && req.method === 'POST') {
      const db = loadDb();
      const body = await readJsonBody(req);
      const post = {
        id: 'cp_' + Date.now(),
        competitorId: body.competitorId || '',
        competitorName: (body.competitorName || 'Đối thủ').trim(),
        channel: (body.channel || 'Facebook').trim(),
        collectedAt: new Date().toISOString(),
        pillar: body.pillar || 'Giáo dục kiến thức',
        title: (body.title || 'Bài đăng mới thu thập').trim(),
        content: (body.content || '').trim(),
        likes: Number(body.likes) || 0,
        commentsCount: Number(body.commentsCount) || 0,
        shares: Number(body.shares) || 0,
        isPromoAlert: Boolean(body.isPromoAlert) || /sale|giảm|tặng|ưu đãi/i.test(body.content || ''),
        promoDetail: body.promoDetail || '',
        topComments: Array.isArray(body.topComments)
          ? body.topComments
          : String(body.topComments || '')
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean),
        sourceUrl: body.sourceUrl || '',
      };
      db.collectedPosts.unshift(post);
      addLog(db, 'Thu thập dữ liệu', `Đã lưu bài đăng mới từ ${post.competitorName}: "${post.title}".`);
      saveDb(db);
      return sendJson(res, 201, post);
    }

    if (pathname.startsWith('/api/posts/') && req.method === 'DELETE') {
      const id = pathname.split('/').pop();
      const db = loadDb();
      db.collectedPosts = db.collectedPosts.filter((p) => p.id !== id);
      saveDb(db);
      return sendJson(res, 200, { ok: true });
    }

    if (pathname === '/api/collect/url' && req.method === 'POST') {
      const db = loadDb();
      const body = await readJsonBody(req);
      if (!body.url) return sendJson(res, 400, { error: 'Vui lòng nhập đường dẫn URL hợp lệ.' });
      const fetched = await fetchPublicUrl(body.url);
      const post = {
        id: 'cp_' + Date.now(),
        competitorId: '',
        competitorName: (body.competitorName || new URL(body.url).hostname).trim(),
        channel: 'Website / Công khai',
        collectedAt: new Date().toISOString(),
        pillar: /giảm|sale|khuyến mãi|ưu đãi/i.test(fetched.title + fetched.content)
          ? 'Bán hàng / Khuyến mãi'
          : 'Giáo dục kiến thức',
        title: fetched.title,
        content: fetched.content,
        likes: 0,
        commentsCount: 0,
        shares: 0,
        isPromoAlert: /giảm|sale|khuyến mãi|ưu đãi/i.test(fetched.title + fetched.content),
        promoDetail: /giảm|sale|khuyến mãi|ưu đãi/i.test(fetched.title + fetched.content)
          ? 'Phát hiện nội dung khuyến mãi từ trang công khai'
          : '',
        topComments: [],
        sourceUrl: body.url,
      };
      db.collectedPosts.unshift(post);
      addLog(db, 'Quét URL công khai', `Đã trích xuất nội dung từ ${body.url}.`);
      saveDb(db);
      return sendJson(res, 201, post);
    }

    if (pathname === '/api/collect/sync-demo' && req.method === 'POST') {
      const db = loadDb();
      const samplePool = [
        {
          competitorName: 'LumiDerma VN',
          channel: 'Facebook',
          pillar: 'Bán hàng / Khuyến mãi',
          title: 'Combo da sạch dịu nhẹ giảm 25% dịp giữa tháng',
          content:
            'Giảm ngay 25% combo Sữa rửa mặt + Nước cân bằng cho 200 đơn đầu tiên trong tuần này. Miễn phí vận chuyển toàn quốc.',
          likes: 540,
          commentsCount: 73,
          shares: 41,
          isPromoAlert: true,
          promoDetail: 'Giảm 25% combo làm sạch + Freeship',
          topComments: [
            'Sữa rửa mặt có bị khô căng da sau khi rửa không shop?',
            'Mình da nhạy cảm có dùng được bộ này không?',
          ],
        },
        {
          competitorName: 'Sora Botanicals',
          channel: 'TikTok',
          pillar: 'Giáo dục kiến thức',
          title: 'Cách đọc bảng thành phần để tránh kem chống nắng gây cay mắt',
          content:
            'Nếu bạn hay bị cay mắt vào cuối chiều khi thoa kem chống nắng, hãy kiểm tra màng lọc chống nắng và hạn chế thoa quá sát viền mi dưới.',
          likes: 1520,
          commentsCount: 188,
          shares: 310,
          isPromoAlert: false,
          promoDetail: '',
          topComments: [
            'Đúng thứ mình cần, dùng mấy loại toàn bị cay mắt buổi trưa.',
            'Hãng gợi ý giúp mình loại nào thấm nhanh không bị bóng dầu với ạ.',
          ],
        },
      ];
      const pick = samplePool[db.collectedPosts.length % samplePool.length];
      const newPost = {
        id: 'cp_' + Date.now(),
        competitorId: '',
        collectedAt: new Date().toISOString(),
        sourceUrl: 'https://example.com/demo-feed',
        ...pick,
      };
      db.collectedPosts.unshift(newPost);
      addLog(db, 'Agent thu thập tự động', `Đã thu thập thêm 1 bài mới từ ${newPost.competitorName}.`);
      saveDb(db);
      return sendJson(res, 201, newPost);
    }

    if (pathname === '/api/analyze' && req.method === 'POST') {
      const db = loadDb();
      const analysis = await analyzeWithAgent(db);
      db.analysis = analysis;
      addLog(db, 'Phân tích Marketing', `Hoàn tất phân tích ${analysis.totalPostsAnalyzed} bài đối thủ (${analysis.engine}).`);
      saveDb(db);
      return sendJson(res, 200, analysis);
    }

    if (pathname === '/api/drafts/generate' && req.method === 'POST') {
      const db = loadDb();
      const body = await readJsonBody(req);
      const generated = await draftWithAgent(db, body);
      const draft = {
        id: 'd_' + Date.now(),
        ...generated,
        status: 'pending',
        scheduledFor: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        publishedAt: null,
        publishLog: '',
        createdAt: new Date().toISOString(),
      };
      db.drafts.unshift(draft);
      addLog(db, 'Soạn thảo nội dung', `Đã tạo bài nháp chờ duyệt: "${draft.title}".`);
      saveDb(db);
      return sendJson(res, 201, {
        draft,
        compliance: checkCompliance(draft.content, db.brand.bannedWords),
      });
    }

    if (pathname.startsWith('/api/drafts/') && req.method === 'PUT') {
      const id = pathname.split('/').pop();
      const db = loadDb();
      const body = await readJsonBody(req);
      const idx = db.drafts.findIndex((d) => d.id === id);
      if (idx === -1) return sendJson(res, 404, { error: 'Không tìm thấy bài viết.' });
      db.drafts[idx] = { ...db.drafts[idx], ...body };
      saveDb(db);
      return sendJson(res, 200, {
        draft: db.drafts[idx],
        compliance: checkCompliance(db.drafts[idx].content, db.brand.bannedWords),
      });
    }

    if (pathname.startsWith('/api/drafts/') && req.method === 'DELETE') {
      const id = pathname.split('/').pop();
      const db = loadDb();
      db.drafts = db.drafts.filter((d) => d.id !== id);
      saveDb(db);
      return sendJson(res, 200, { ok: true });
    }

    if (pathname === '/api/telegram/test' && req.method === 'POST') {
      const db = loadDb();
      const body = await readJsonBody(req);
      const token = (body.telegramBotToken || db.settings.telegramBotToken || '').trim();
      const chatId = (body.telegramChatId || db.settings.telegramChatId || '').trim();
      if (!token || !chatId) {
        return sendJson(res, 400, { error: 'Vui lòng nhập đầy đủ Telegram Bot Token và Chat ID.' });
      }
      const msg =
        `[Kiểm tra kết nối] Hệ thống AI Agent Marketing (${db.brand.name}) đã kết nối thành công với Telegram.\n` +
        `Thời gian: ${new Date().toLocaleString('vi-VN')}`;
      const result = await sendTelegramMessage(token, chatId, msg);
      addLog(db, 'Kiểm tra Telegram', `Đã gửi tin nhắn thử thành công (Message ID: ${result.message_id}).`);
      saveDb(db);
      return sendJson(res, 200, { ok: true, messageId: result.message_id });
    }

    if (pathname === '/api/telegram/alert' && req.method === 'POST') {
      const db = loadDb();
      const token = (db.settings.telegramBotToken || '').trim();
      const chatId = (db.settings.telegramChatId || '').trim();
      if (!token || !chatId) {
        return sendJson(res, 400, { error: 'Chưa cấu hình Telegram Bot Token và Chat ID trong mục Cấu hình.' });
      }
      const alerts = db.collectedPosts.filter((p) => p.isPromoAlert);
      const lines = alerts.length
        ? alerts.slice(0, 3).map((a, i) => `${i + 1}. ${a.competitorName}: ${a.title}\n   Chi tiết: ${a.promoDetail || a.content.slice(0, 120)}`)
        : ['Hiện chưa có cảnh báo khuyến mãi mới từ đối thủ.'];
      const msg = `[CẢNH BÁO ĐỐI THỦ - ${db.brand.name}]\n\n${lines.join('\n\n')}`;
      const result = await sendTelegramMessage(token, chatId, msg);
      addLog(db, 'Cảnh báo Telegram', `Đã gửi báo cáo cảnh báo đối thủ sang Telegram (ID: ${result.message_id}).`);
      saveDb(db);
      return sendJson(res, 200, { ok: true, messageId: result.message_id });
    }

    if (pathname === '/api/publish' && req.method === 'POST') {
      const db = loadDb();
      const body = await readJsonBody(req);
      const draft = db.drafts.find((d) => d.id === body.id);
      if (!draft) return sendJson(res, 404, { error: 'Không tìm thấy bài viết.' });

      const compliance = checkCompliance(draft.content, db.brand.bannedWords);
      if (!compliance.passed && !body.force) {
        return sendJson(res, 400, {
          error: `Bài viết còn chứa từ khóa cấm: ${compliance.violations.join(', ')}`,
          compliance,
        });
      }

      if (body.mode === 'schedule') {
        draft.status = 'scheduled';
        draft.scheduledFor = body.scheduledFor || draft.scheduledFor;
        draft.publishLog = `Đã duyệt & lên lịch đăng lúc ${draft.scheduledFor.replace('T', ' ')}`;
        addLog(db, 'Duyệt & Lên lịch', `Đã duyệt bài "${draft.title}" (hẹn đăng ${draft.scheduledFor.replace('T', ' ')}).`);
      } else {
        if (db.settings.publishMode === 'telegram' && db.settings.telegramBotToken && db.settings.telegramChatId) {
          const tgText =
            `[${db.brand.name} - ${draft.channel}]\n\n` +
            `${draft.content}\n\n` +
            `Gợi ý hình ảnh (Visual Brief): ${draft.visualBrief}`;
          const tgResult = await sendTelegramMessage(db.settings.telegramBotToken, db.settings.telegramChatId, tgText);
          draft.status = 'published';
          draft.publishedAt = new Date().toISOString();
          draft.publishLog = `Đã đăng thật lên Telegram (Message ID: ${tgResult.message_id})`;
          addLog(db, 'Đăng bài Telegram', `Đã xuất bản bài "${draft.title}" lên Telegram (ID: ${tgResult.message_id}).`);
        } else if (db.settings.publishMode === 'facebook' && db.settings.fbPageId && db.settings.fbAccessToken) {
          const fbRes = await fetch(
            `https://graph.facebook.com/v19.0/${encodeURIComponent(db.settings.fbPageId)}/feed`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: draft.content,
                access_token: db.settings.fbAccessToken,
              }),
            }
          );
          const fbData = await fbRes.json();
          if (!fbRes.ok) {
            return sendJson(res, 400, { error: fbData.error?.message || 'Đăng Facebook thất bại.' });
          }
          draft.status = 'published';
          draft.publishedAt = new Date().toISOString();
          draft.publishLog = `Đã đăng lên Facebook Page thật (Post ID: ${fbData.id})`;
          addLog(db, 'Đăng bài Facebook', `Đã đăng thành công "${draft.title}" (ID: ${fbData.id}).`);
        } else {
          draft.status = 'published';
          draft.publishedAt = new Date().toISOString();
          draft.publishLog = 'Đã đăng thành công (Chế độ Local Demo)';
          addLog(db, 'Đăng bài tự động', `Đã duyệt và xuất bản bài "${draft.title}" trên kênh ${draft.channel}.`);
        }
      }

      saveDb(db);
      return sendJson(res, 200, { draft });
    }

    if (pathname === '/api/pipeline/run' && req.method === 'POST') {
      const db = loadDb();
      const steps = [];

      // Step 1: Collect
      const analysisBefore = db.collectedPosts.length;
      steps.push(`Bước 1/3 – Thu thập: Đang sử dụng ${analysisBefore} bài dữ liệu từ ${db.competitors.length} đối thủ.`);

      // Step 2: Analyze
      const analysis = await analyzeWithAgent(db);
      db.analysis = analysis;
      steps.push(`Bước 2/3 – Phân tích: Hoàn tất trích xuất ${analysis.contentGaps.length} khoảng trống nội dung và ${analysis.suggestedIdeas.length} ý tưởng (${analysis.engine}).`);

      // Step 3: Draft top idea
      const topIdea = analysis.suggestedIdeas[0];
      let createdDraft = null;
      if (topIdea) {
        const gen = await draftWithAgent(db, {
          title: topIdea.title,
          pillar: topIdea.pillar,
          channel: topIdea.channel,
          angleSource: topIdea.rationale,
          targetProduct: topIdea.targetProduct,
        });
        createdDraft = {
          id: 'd_' + Date.now(),
          ...gen,
          status: 'pending',
          scheduledFor: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
          publishedAt: null,
          publishLog: '',
          createdAt: new Date().toISOString(),
        };
        db.drafts.unshift(createdDraft);
        steps.push(`Bước 3/3 – Soạn bài: Đã tạo 1 bài nháp chờ duyệt "${createdDraft.title}".`);
      }

      addLog(db, 'Chạy toàn trình Agent', 'Hoàn tất chu trình Thu thập -> Phân tích -> Tạo bài nháp chờ duyệt.');
      saveDb(db);
      return sendJson(res, 200, { steps, analysis, createdDraft });
    }

    // Static files
    if (pathname === '/favicon.ico') {
      res.writeHead(204);
      return res.end();
    }
    const safePath = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.join(PUBLIC_DIR, path.normalize(safePath).replace(/^(\.\.[/\\])+/, ''));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      return fs.createReadStream(filePath).pipe(res);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Lỗi xử lý máy chủ' });
  }
});

server.listen(PORT, () => {
  console.log(`Marketing AI Agent đang chạy tại: http://localhost:${PORT}`);
});
