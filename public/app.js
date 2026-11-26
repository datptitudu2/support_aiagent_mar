const VIEW_META = {
  overview: {
    title: 'Tổng quan quy trình',
    desc: 'Theo dõi trạng thái thu thập đối thủ, phân tích thị trường và lịch xuất bản nội dung.',
  },
  collect: {
    title: '1. Thu thập dữ liệu đối thủ',
    desc: 'Quản lý danh sách đối thủ, quét đường dẫn công khai hoặc nhập bài đăng thực tế vào kho dữ liệu.',
  },
  analyze: {
    title: '2. Phân tích Marketing',
    desc: 'AI Agent tổng hợp Content Pillar, góc tiếp cận hiệu quả, khoảng trống nội dung và đề xuất ý tưởng.',
  },
  studio: {
    title: '3. Xưởng bài & Duyệt đăng',
    desc: 'Soạn thảo tự động theo Brand Guideline, kiểm tra từ khóa cấm, xem trước và duyệt đăng bài.',
  },
  brand: {
    title: 'Hồ sơ thương hiệu & Cấu hình',
    desc: 'Thiết lập thông tin thương hiệu, sản phẩm, từ khóa cấm và chế độ kết nối AI / Facebook.',
  },
};

const STATUS_LABELS = {
  draft: { text: 'Bản nháp', cls: 'tag' },
  pending: { text: 'Chờ duyệt', cls: 'tag tag-warn' },
  scheduled: { text: 'Đã lên lịch', cls: 'tag tag-success' },
  published: { text: 'Đã đăng', cls: 'tag tag-success' },
};

let state = null;
let selectedDraftId = null;

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3500);
}

async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Có lỗi xảy ra khi gọi máy chủ');
  }
  return data;
}

function switchView(viewName) {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  document.getElementById(`view-${viewName}`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach((b) => {
    b.classList.toggle('active', b.dataset.view === viewName);
  });
  document.getElementById('pageTitle').textContent = VIEW_META[viewName].title;
  document.getElementById('pageDesc').textContent = VIEW_META[viewName].desc;
}

function checkLocalCompliance(text) {
  const banned = state?.brand?.bannedWords || [];
  const lower = (text || '').toLowerCase();
  const violations = banned.filter((w) => w.trim() && lower.includes(w.trim().toLowerCase()));
  return { passed: violations.length === 0, violations };
}

function renderAll() {
  if (!state) return;

  // Sidebar meta
  document.getElementById('sidebarBrandName').textContent = state.brand.name || 'Thương hiệu';
  document.getElementById('sidebarAiMode').textContent =
    state.settings.aiProvider === 'gemini'
      ? 'Gemini API'
      : state.settings.aiProvider === 'openai'
        ? 'OpenAI API'
        : 'Local Engine';
  document.getElementById('sidebarPublishMode').textContent =
    state.settings.publishMode === 'telegram'
      ? 'Telegram Bot'
      : state.settings.publishMode === 'facebook'
        ? 'Facebook Page'
        : 'Giả lập Local';

  // KPIs
  const pendingCount = state.drafts.filter((d) => d.status === 'pending' || d.status === 'draft').length;
  const pubCount = state.drafts.filter((d) => d.status === 'scheduled' || d.status === 'published').length;
  document.getElementById('kpiCompetitors').textContent = state.competitors.length;
  document.getElementById('kpiPosts').textContent = state.collectedPosts.length;
  document.getElementById('kpiPending').textContent = pendingCount;
  document.getElementById('kpiPublished').textContent = pubCount;

  renderOverview();
  renderCollect();
  renderAnalysis();
  renderStudio();
  renderBrandAndSettings();
}

function renderOverview() {
  const alertsEl = document.getElementById('overviewAlerts');
  const promoPosts = state.collectedPosts.filter((p) => p.isPromoAlert);
  if (!promoPosts.length) {
    alertsEl.innerHTML = '<div class="empty-state">Chưa ghi nhận chương trình khuyến mãi nổi bật từ đối thủ.</div>';
  } else {
    alertsEl.innerHTML = promoPosts
      .slice(0, 5)
      .map(
        (p) => `
      <div class="list-item" style="margin-bottom:8px;">
        <div>
          <div class="item-title">${esc(p.competitorName)} — ${esc(p.title)}</div>
          <div class="item-meta">${esc(p.promoDetail || p.content.slice(0, 110))}</div>
        </div>
        <span class="tag tag-warn">Khuyến mãi</span>
      </div>`
      )
      .join('');
  }

  const logsEl = document.getElementById('overviewLogs');
  logsEl.innerHTML = state.activityLogs
    .slice(0, 7)
    .map(
      (l) => `
    <div class="list-item" style="margin-bottom:8px;">
      <div>
        <div class="item-title">${esc(l.stage)}</div>
        <div class="item-meta">${esc(l.message)}</div>
      </div>
      <span class="item-meta" style="white-space:nowrap;">${fmtTime(l.timestamp)}</span>
    </div>`
    )
    .join('');
}

function renderCollect() {
  const compEl = document.getElementById('competitorList');
  if (!state.competitors.length) {
    compEl.innerHTML = '<div class="empty-state">Chưa có đối thủ nào.</div>';
  } else {
    compEl.innerHTML = state.competitors
      .map(
        (c) => `
      <div class="list-item">
        <div>
          <div class="item-title">${esc(c.name)}</div>
          <div class="item-meta">${esc(c.channel)} · ${esc(c.segment)}</div>
        </div>
        <button class="btn btn-sm btn-danger-outline" data-del-comp="${esc(c.id)}">Xóa</button>
      </div>`
      )
      .join('');
  }

  document.getElementById('collectedCountBadge').textContent = `${state.collectedPosts.length} bài`;
  const tbody = document.getElementById('collectedPostsBody');
  if (!state.collectedPosts.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Chưa có bài đăng đối thủ nào.</td></tr>';
  } else {
    tbody.innerHTML = state.collectedPosts
      .map(
        (p) => `
      <tr>
        <td>
          <div class="item-title">${esc(p.competitorName)}</div>
          <div class="item-meta">${esc(p.channel)} · ${fmtTime(p.collectedAt)}</div>
        </td>
        <td><span class="tag">${esc(p.pillar)}</span></td>
        <td>
          <div class="item-title">${esc(p.title)}</div>
          <div class="item-meta" style="margin-top:4px; color:var(--text-secondary);">${esc(p.content)}</div>
          ${p.sourceUrl ? `<div class="item-meta" style="margin-top:4px;"><a href="${esc(p.sourceUrl)}" target="_blank" rel="noopener noreferrer" style="color:var(--text); text-decoration:underline;">Xem nguồn gốc thực tế</a></div>` : ''}
          ${(p.topComments || [])
            .map((c) => `<div class="comment-quote">"${esc(c)}"</div>`)
            .join('')}
        </td>
        <td style="font-variant-numeric: tabular-nums;">
          ${p.likes || 0} thích<br />
          ${p.commentsCount || 0} bình luận<br />
          ${p.shares || 0} chia sẻ
        </td>
        <td>
          ${p.isPromoAlert ? '<span class="tag tag-warn">Khuyến mãi</span>' : '<span class="item-meta">Bình thường</span>'}
        </td>
        <td>
          <button class="btn btn-sm btn-danger-outline" data-del-post="${esc(p.id)}">Xóa</button>
        </td>
      </tr>`
      )
      .join('');
  }
}

function renderAnalysis() {
  const container = document.getElementById('analysisContainer');
  const metaEl = document.getElementById('analysisMeta');
  const a = state.analysis;

  if (!a) {
    metaEl.textContent = 'Chưa có báo cáo phân tích. Nhấn nút bên phải để AI Agent tổng hợp dữ liệu.';
    container.innerHTML =
      '<div class="empty-state">Nhấn <strong>Chạy AI Phân tích ngay</strong> để hệ thống đọc toàn bộ bài đối thủ, thống kê Content Pillar, tìm khoảng trống nội dung và đề xuất ý tưởng bài viết mới.</div>';
    return;
  }

  metaEl.textContent = `Cập nhật lúc ${fmtTime(a.generatedAt)} · Bộ máy: ${a.engine} · Đã đọc ${a.totalPostsAnalyzed} bài`;

  const pillarsHtml = (a.pillarBreakdown || [])
    .map(
      (item) => `
    <div class="pillar-bar-row">
      <div>${esc(item.name)}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${item.percent}%"></div></div>
      <div style="text-align:right; font-variant-numeric:tabular-nums;">${item.percent}% (${item.count})</div>
    </div>`
    )
    .join('');

  const hooksHtml = (a.topHooks || [])
    .map(
      (h) => `
    <tr>
      <td><strong>${esc(h.competitor)}</strong><div class="item-meta">${esc(h.channel)}</div></td>
      <td>${esc(h.title)}</td>
      <td>${esc(h.metrics)}</td>
      <td>${esc(h.reason)}</td>
    </tr>`
    )
    .join('');

  const gapsHtml = (a.contentGaps || [])
    .map(
      (g) => `
    <tr>
      <td><strong>${esc(g.gap)}</strong></td>
      <td>${esc(g.evidence)}</td>
      <td>${esc(g.opportunity)}</td>
    </tr>`
    )
    .join('');

  const ideasHtml = (a.suggestedIdeas || [])
    .map(
      (idea, idx) => `
    <div class="idea-card">
      <div>
        <div class="item-title">${esc(idea.title)}</div>
        <div class="item-meta">${esc(idea.channel)} · ${esc(idea.pillar)} · Sản phẩm: ${esc(idea.targetProduct || '')}</div>
        <div class="item-meta" style="color:var(--text-secondary); margin-top:4px;">Lý do đề xuất: ${esc(idea.rationale)}</div>
      </div>
      <button class="btn btn-primary btn-sm" data-use-idea="${idx}">Tạo bài từ ý tưởng này</button>
    </div>`
    )
    .join('');

  container.innerHTML = `
    <div class="analysis-summary">
      <strong>Nhận định tổng quan:</strong> ${esc(a.summary)}
    </div>

    <div class="section-heading">1. Phân bổ Trụ cột nội dung (Content Pillar) của đối thủ</div>
    ${pillarsHtml}

    <div class="section-heading">2. Các bài viết &amp; Góc tiếp cận tạo tương tác cao nhất</div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>Đối thủ</th><th>Tiêu đề / Hook</th><th>Chỉ số</th><th>Lý do hiệu quả</th></tr>
        </thead>
        <tbody>${hooksHtml}</tbody>
      </table>
    </div>

    <div class="section-heading">3. Khoảng trống nội dung (Content Gap) &amp; Cơ hội cho ${esc(state.brand.name)}</div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>Vấn đề khách hàng quan tâm</th><th>Bằng chứng từ dữ liệu</th><th>Cơ hội khai thác</th></tr>
        </thead>
        <tbody>${gapsHtml}</tbody>
      </table>
    </div>

    <div class="section-heading">4. Ý tưởng bài viết đề xuất (Chuyển sang Xưởng nội dung)</div>
    ${ideasHtml}
  `;
}

function renderStudio() {
  const prodSelect = document.getElementById('genProduct');
  prodSelect.innerHTML = (state.brand.products || [])
    .map((p) => `<option value="${esc(p.name)}">${esc(p.name)}</option>`)
    .join('');

  document.getElementById('draftsCountBadge').textContent = `${state.drafts.length} bài`;
  const queueEl = document.getElementById('draftQueueList');

  if (!state.drafts.length) {
    queueEl.innerHTML = '<div class="empty-state">Chưa có bài viết nào. Hãy tạo bài mới ở khung trên.</div>';
    selectedDraftId = null;
  } else {
    if (!selectedDraftId || !state.drafts.some((d) => d.id === selectedDraftId)) {
      selectedDraftId = state.drafts[0].id;
    }
    queueEl.innerHTML = state.drafts
      .map((d) => {
        const st = STATUS_LABELS[d.status] || STATUS_LABELS.draft;
        return `
        <div class="queue-item ${d.id === selectedDraftId ? 'selected' : ''}" data-select-draft="${esc(d.id)}">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:4px;">
            <span class="${st.cls}">${st.text}</span>
            <span class="item-meta">${esc(d.channel)}</span>
          </div>
          <div class="item-title">${esc(d.title)}</div>
          <div class="item-meta">${esc(d.publishLog || 'Tạo lúc ' + fmtTime(d.createdAt))}</div>
        </div>`;
      })
      .join('');
  }

  renderEditor();
}

function renderEditor() {
  const ws = document.getElementById('editorWorkspace');
  const delBtn = document.getElementById('btnDeleteDraft');
  const statusLine = document.getElementById('editorStatusLine');
  const draft = state.drafts.find((d) => d.id === selectedDraftId);

  if (!draft) {
    delBtn.classList.add('hidden');
    statusLine.textContent = 'Chọn một bài viết ở cột bên trái để chỉnh sửa và duyệt đăng.';
    ws.innerHTML = '<div class="empty-state">Chưa chọn bài viết nào.</div>';
    return;
  }

  delBtn.classList.remove('hidden');
  const st = STATUS_LABELS[draft.status] || STATUS_LABELS.draft;
  statusLine.textContent = `Trạng thái: ${st.text} · Kênh: ${draft.channel} · Nguồn: ${draft.angleSource || 'Thủ công'}`;

  const comp = checkLocalCompliance(draft.content);
  const initials = (state.brand.name || 'AS').slice(0, 2).toUpperCase();

  ws.innerHTML = `
    <div class="compliance-box ${comp.passed ? '' : 'failed'}" id="complianceBanner">
      ${
        comp.passed
          ? 'Kiểm duyệt tự động: Đạt chuẩn – Không phát hiện từ khóa cấm theo quy định ngành.'
          : 'Cảnh báo vi phạm từ khóa cấm: ' + esc(comp.violations.join(', ')) + '. Vui lòng chỉnh sửa trước khi duyệt đăng.'
      }
    </div>

    <div class="editor-split">
      <div class="stack-form">
        <div class="field">
          <label for="edTitle">Tiêu đề quản lý</label>
          <input type="text" id="edTitle" value="${esc(draft.title)}" />
        </div>
        <div class="field">
          <label for="edContent">Nội dung bài đăng (Chỉnh sửa trực tiếp)</label>
          <textarea id="edContent" rows="12">${esc(draft.content)}</textarea>
        </div>
        <div class="field">
          <label for="edVisual">Mô tả ý tưởng hình ảnh (Visual Brief cho Designer)</label>
          <textarea id="edVisual" rows="3">${esc(draft.visualBrief)}</textarea>
        </div>
        <div class="form-actions" style="justify-content:flex-start;">
          <button class="btn btn-secondary" id="btnSaveDraft">Lưu chỉnh sửa</button>
        </div>
      </div>

      <div>
        <div class="field" style="margin-bottom:8px;">
          <label>Xem trước bài đăng (${esc(draft.channel)})</label>
        </div>
        <div class="preview-card">
          <div class="preview-header">
            <div class="preview-avatar">${esc(initials)}</div>
            <div>
              <div class="item-title">${esc(state.brand.name)}</div>
              <div class="item-meta">${draft.publishedAt ? 'Đã đăng lúc ' + fmtTime(draft.publishedAt) : 'Bản xem trước · Công khai'}</div>
            </div>
          </div>
          <div class="preview-body" id="previewContent">${esc(draft.content)}</div>
          <div class="preview-visual-placeholder" id="previewVisual">
            <strong>Ý tưởng hình ảnh đính kèm:</strong><br />
            ${esc(draft.visualBrief)}
          </div>
          <div class="preview-footer">
            <span>Thích</span>
            <span>Bình luận</span>
            <span>Chia sẻ</span>
          </div>
        </div>

        <div class="publish-bar">
          <div class="field" style="flex:1; min-width:170px;">
            <label for="edSchedule">Hẹn giờ đăng</label>
            <input type="datetime-local" id="edSchedule" value="${esc(draft.scheduledFor || '')}" />
          </div>
          <div style="display:flex; gap:8px; align-self:flex-end;">
            <button class="btn btn-secondary" id="btnScheduleDraft">Duyệt &amp; Hẹn giờ</button>
            <button class="btn btn-primary" id="btnPublishNow">Duyệt &amp; Đăng ngay</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Live preview & compliance binding
  const contentInput = document.getElementById('edContent');
  const visualInput = document.getElementById('edVisual');
  contentInput.addEventListener('input', () => {
    document.getElementById('previewContent').textContent = contentInput.value;
    const c = checkLocalCompliance(contentInput.value);
    const banner = document.getElementById('complianceBanner');
    banner.className = `compliance-box ${c.passed ? '' : 'failed'}`;
    banner.textContent = c.passed
      ? 'Kiểm duyệt tự động: Đạt chuẩn – Không phát hiện từ khóa cấm theo quy định ngành.'
      : `Cảnh báo vi phạm từ khóa cấm: ${c.violations.join(', ')}. Vui lòng chỉnh sửa trước khi duyệt đăng.`;
  });
  visualInput.addEventListener('input', () => {
    document.getElementById('previewVisual').innerHTML =
      '<strong>Ý tưởng hình ảnh đính kèm:</strong><br />' + esc(visualInput.value);
  });

  document.getElementById('btnSaveDraft').addEventListener('click', async () => {
    await saveCurrentDraft();
    showToast('Đã lưu chỉnh sửa bài viết.');
  });

  document.getElementById('btnScheduleDraft').addEventListener('click', async () => {
    await saveCurrentDraft();
    try {
      await api('/api/publish', {
        method: 'POST',
        body: JSON.stringify({
          id: draft.id,
          mode: 'schedule',
          scheduledFor: document.getElementById('edSchedule').value,
        }),
      });
      await loadState();
      showToast('Đã duyệt và lên lịch đăng bài.');
    } catch (e) {
      showToast(e.message);
    }
  });

  document.getElementById('btnPublishNow').addEventListener('click', async () => {
    await saveCurrentDraft();
    try {
      await api('/api/publish', {
        method: 'POST',
        body: JSON.stringify({ id: draft.id, mode: 'now' }),
      });
      await loadState();
      showToast('Đã duyệt và xuất bản bài viết thành công.');
    } catch (e) {
      showToast(e.message);
    }
  });
}

async function saveCurrentDraft() {
  if (!selectedDraftId) return;
  const title = document.getElementById('edTitle')?.value;
  const content = document.getElementById('edContent')?.value;
  const visualBrief = document.getElementById('edVisual')?.value;
  const scheduledFor = document.getElementById('edSchedule')?.value;
  await api(`/api/drafts/${selectedDraftId}`, {
    method: 'PUT',
    body: JSON.stringify({ title, content, visualBrief, scheduledFor }),
  });
  await loadState();
}

function renderBrandAndSettings() {
  document.getElementById('brandName').value = state.brand.name || '';
  document.getElementById('brandIndustry').value = state.brand.industry || '';
  document.getElementById('brandAudience').value = state.brand.targetAudience || '';
  document.getElementById('brandVoice').value = state.brand.brandVoice || '';
  document.getElementById('brandBanned').value = (state.brand.bannedWords || []).join('\n');
  document.getElementById('brandProductsText').value = (state.brand.products || [])
    .map((p) => `${p.name} | ${p.price} | ${p.usp}`)
    .join('\n');

  document.getElementById('aiProvider').value = state.settings.aiProvider || 'local';
  document.getElementById('geminiApiKey').value = state.settings.geminiApiKey || '';
  document.getElementById('geminiModel').value = state.settings.geminiModel || 'gemini-2.5-flash';
  document.getElementById('openaiApiKey').value = state.settings.openaiApiKey || '';
  document.getElementById('openaiModel').value = state.settings.openaiModel || 'gpt-4o-mini';
  document.getElementById('publishMode').value = state.settings.publishMode || 'mock';
  document.getElementById('telegramBotToken').value = state.settings.telegramBotToken || '';
  document.getElementById('telegramChatId').value = state.settings.telegramChatId || '';
  document.getElementById('fbPageId').value = state.settings.fbPageId || '';
  document.getElementById('fbAccessToken').value = state.settings.fbAccessToken || '';

  toggleSettingsFields();
}

function toggleSettingsFields() {
  const provider = document.getElementById('aiProvider').value;
  document.getElementById('geminiFields').classList.toggle('hidden', provider !== 'gemini');
  document.getElementById('openaiFields').classList.toggle('hidden', provider !== 'openai');

  const pubMode = document.getElementById('publishMode').value;
  document.getElementById('telegramFields').classList.toggle('hidden', pubMode !== 'telegram');
  document.getElementById('fbFields').classList.toggle('hidden', pubMode !== 'facebook');
}

async function loadState() {
  state = await api('/api/state');
  renderAll();
}

// Event Listeners
document.querySelectorAll('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

document.addEventListener('click', async (e) => {
  const jump = e.target.closest('[data-jump]');
  if (jump) {
    switchView(jump.dataset.jump);
    return;
  }

  const delComp = e.target.closest('[data-del-comp]');
  if (delComp) {
    await api(`/api/competitors/${delComp.dataset.delComp}`, { method: 'DELETE' });
    await loadState();
    showToast('Đã xóa đối thủ.');
    return;
  }

  const delPost = e.target.closest('[data-del-post]');
  if (delPost) {
    await api(`/api/posts/${delPost.dataset.delPost}`, { method: 'DELETE' });
    await loadState();
    showToast('Đã xóa bài viết khỏi kho.');
    return;
  }

  const useIdea = e.target.closest('[data-use-idea]');
  if (useIdea && state?.analysis?.suggestedIdeas) {
    const idea = state.analysis.suggestedIdeas[Number(useIdea.dataset.useIdea)];
    if (!idea) return;
    useIdea.disabled = true;
    useIdea.textContent = 'Đang soạn bài...';
    try {
      const res = await api('/api/drafts/generate', {
        method: 'POST',
        body: JSON.stringify({
          title: idea.title,
          pillar: idea.pillar,
          channel: idea.channel,
          angleSource: idea.rationale,
          targetProduct: idea.targetProduct,
        }),
      });
      selectedDraftId = res.draft.id;
      await loadState();
      switchView('studio');
      showToast('Đã soạn xong bài nháp từ ý tưởng đã chọn.');
    } catch (err) {
      showToast(err.message);
      useIdea.disabled = false;
      useIdea.textContent = 'Tạo bài từ ý tưởng này';
    }
    return;
  }

  const selectDraft = e.target.closest('[data-select-draft]');
  if (selectDraft) {
    selectedDraftId = selectDraft.dataset.selectDraft;
    renderStudio();
  }
});

// Collect sub-tabs
document.querySelectorAll('[data-collect-tab]').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('[data-collect-tab]').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    const isManual = tab.dataset.collectTab === 'manual';
    document.getElementById('formManualPost').classList.toggle('hidden', !isManual);
    document.getElementById('formUrlCollect').classList.toggle('hidden', isManual);
  });
});

document.getElementById('formAddCompetitor').addEventListener('submit', async (e) => {
  e.preventDefault();
  await api('/api/competitors', {
    method: 'POST',
    body: JSON.stringify({
      name: document.getElementById('compName').value,
      channel: document.getElementById('compChannel').value,
      url: document.getElementById('compUrl').value,
    }),
  });
  e.target.reset();
  document.getElementById('compChannel').value = 'Facebook Fanpage';
  await loadState();
  showToast('Đã thêm đối thủ theo dõi.');
});

document.getElementById('formManualPost').addEventListener('submit', async (e) => {
  e.preventDefault();
  await api('/api/posts', {
    method: 'POST',
    body: JSON.stringify({
      competitorName: document.getElementById('postCompName').value,
      channel: document.getElementById('postChannel').value,
      pillar: document.getElementById('postPillar').value,
      title: document.getElementById('postTitle').value,
      content: document.getElementById('postContent').value,
      likes: document.getElementById('postLikes').value,
      commentsCount: document.getElementById('postCommentsCount').value,
      shares: document.getElementById('postShares').value,
      topComments: document.getElementById('postTopComments').value,
    }),
  });
  e.target.reset();
  await loadState();
  showToast('Đã lưu bài đăng đối thủ vào kho dữ liệu.');
});

document.getElementById('formUrlCollect').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Đang quét...';
  try {
    await api('/api/collect/url', {
      method: 'POST',
      body: JSON.stringify({
        competitorName: document.getElementById('scrapeCompName').value,
        url: document.getElementById('scrapeUrl').value,
      }),
    });
    e.target.reset();
    await loadState();
    showToast('Đã quét và lưu nội dung từ đường dẫn công khai.');
  } catch (err) {
    showToast(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Quét nội dung trang';
  }
});

document.getElementById('btnSyncLive').addEventListener('click', async (e) => {
  const btn = e.target;
  btn.disabled = true;
  btn.textContent = 'Đang quét Internet...';
  try {
    const res = await api('/api/collect/live', { method: 'POST' });
    await loadState();
    showToast(`Đã quét dữ liệu thật: thêm mới ${res.addedCount} bài viết (tổng ${res.totalPosts} bài).`);
  } catch (err) {
    showToast(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Quét dữ liệu thật từ Internet';
  }
});

document.getElementById('btnRunAnalysis').addEventListener('click', async (e) => {
  const btn = e.target;
  btn.disabled = true;
  btn.textContent = 'Đang phân tích...';
  try {
    await api('/api/analyze', { method: 'POST' });
    await loadState();
    showToast('Hoàn tất phân tích dữ liệu đối thủ.');
  } catch (err) {
    showToast(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Chạy AI Phân tích ngay';
  }
});

document.getElementById('formGenerateDraft').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Đang soạn bài...';
  try {
    const res = await api('/api/drafts/generate', {
      method: 'POST',
      body: JSON.stringify({
        title: document.getElementById('genTitle').value,
        channel: document.getElementById('genChannel').value,
        pillar: document.getElementById('genPillar').value,
        targetProduct: document.getElementById('genProduct').value,
        angleSource: 'Yêu cầu trực tiếp từ team Marketing',
      }),
    });
    e.target.reset();
    selectedDraftId = res.draft.id;
    await loadState();
    showToast('Đã soạn xong bài nháp chờ duyệt.');
  } catch (err) {
    showToast(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'AI Soạn bài nháp';
  }
});

document.getElementById('btnDeleteDraft').addEventListener('click', async () => {
  if (!selectedDraftId) return;
  await api(`/api/drafts/${selectedDraftId}`, { method: 'DELETE' });
  selectedDraftId = null;
  await loadState();
  showToast('Đã xóa bài viết.');
});

document.getElementById('btnRunPipeline').addEventListener('click', async (e) => {
  const btn = e.target;
  btn.disabled = true;
  btn.textContent = 'Agent đang chạy...';
  try {
    const res = await api('/api/pipeline/run', { method: 'POST' });
    if (res.createdDraft) selectedDraftId = res.createdDraft.id;
    await loadState();
    switchView('overview');
    const outBox = document.getElementById('pipelineOutput');
    const list = document.getElementById('pipelineStepsList');
    list.innerHTML = (res.steps || []).map((s) => `<li>${esc(s)}</li>`).join('');
    outBox.classList.remove('hidden');
    showToast('Đã chạy xong toàn trình AI Agent.');
  } catch (err) {
    showToast(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Chạy toàn trình Agent';
  }
});

document.getElementById('formBrand').addEventListener('submit', async (e) => {
  e.preventDefault();
  const products = document
    .getElementById('brandProductsText')
    .value.split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const [name, price, usp] = line.split('|').map((s) => (s || '').trim());
      return { id: 'p_' + i, name: name || line, price: price || '', usp: usp || '' };
    });

  const bannedWords = document
    .getElementById('brandBanned')
    .value.split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  await api('/api/brand', {
    method: 'PUT',
    body: JSON.stringify({
      name: document.getElementById('brandName').value,
      industry: document.getElementById('brandIndustry').value,
      targetAudience: document.getElementById('brandAudience').value,
      brandVoice: document.getElementById('brandVoice').value,
      bannedWords,
      products,
    }),
  });
  await loadState();
  showToast('Đã lưu hồ sơ thương hiệu.');
});

document.getElementById('aiProvider').addEventListener('change', toggleSettingsFields);
document.getElementById('publishMode').addEventListener('change', toggleSettingsFields);

document.getElementById('formSettings').addEventListener('submit', async (e) => {
  e.preventDefault();
  await api('/api/settings', {
    method: 'PUT',
    body: JSON.stringify({
      aiProvider: document.getElementById('aiProvider').value,
      geminiApiKey: document.getElementById('geminiApiKey').value.trim(),
      geminiModel: document.getElementById('geminiModel').value.trim() || 'gemini-2.5-flash',
      openaiApiKey: document.getElementById('openaiApiKey').value.trim(),
      openaiModel: document.getElementById('openaiModel').value.trim() || 'gpt-4o-mini',
      publishMode: document.getElementById('publishMode').value,
      telegramBotToken: document.getElementById('telegramBotToken').value.trim(),
      telegramChatId: document.getElementById('telegramChatId').value.trim(),
      fbPageId: document.getElementById('fbPageId').value.trim(),
      fbAccessToken: document.getElementById('fbAccessToken').value.trim(),
    }),
  });
  await loadState();
  showToast('Đã lưu cấu hình hệ thống.');
});

document.getElementById('btnTestTelegram').addEventListener('click', async (e) => {
  const btn = e.target;
  btn.disabled = true;
  btn.textContent = 'Đang gửi...';
  try {
    await api('/api/telegram/test', {
      method: 'POST',
      body: JSON.stringify({
        telegramBotToken: document.getElementById('telegramBotToken').value.trim(),
        telegramChatId: document.getElementById('telegramChatId').value.trim(),
      }),
    });
    await loadState();
    showToast('Đã gửi tin nhắn thử tới Telegram thành công.');
  } catch (err) {
    showToast(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Gửi tin nhắn thử Telegram';
  }
});

document.getElementById('btnSendTgAlert').addEventListener('click', async (e) => {
  const btn = e.target;
  btn.disabled = true;
  btn.textContent = 'Đang gửi...';
  try {
    await api('/api/telegram/alert', { method: 'POST' });
    await loadState();
    showToast('Đã gửi báo cáo cảnh báo đối thủ sang Telegram.');
  } catch (err) {
    showToast(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Gửi cảnh báo Telegram';
  }
});

loadState();
