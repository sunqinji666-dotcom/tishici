(() => {
  const $ = (s) => document.querySelector(s);
  const particleField = $('#particleField');
  if (particleField && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const particleCount = 30;
    for (let index = 0; index < particleCount; index += 1) {
      const particle = document.createElement('i');
      const isBokeh = index % 6 === 0;
      particle.className = `particle${isBokeh ? ` is-bokeh${index % 12 === 0 ? ' is-cool' : ''}` : ''}`;
      particle.setAttribute('aria-hidden', 'true');
      particle.style.setProperty('--x', `${Math.round(Math.random() * 1000) / 10}%`);
      particle.style.setProperty('--size', isBokeh ? `${(Math.random() * 24 + 16).toFixed(1)}px` : `${(Math.random() * 2.8 + 1.3).toFixed(2)}px`);
      particle.style.setProperty('--duration', isBokeh ? `${(Math.random() * 18 + 30).toFixed(1)}s` : `${(Math.random() * 14 + 18).toFixed(1)}s`);
      particle.style.setProperty('--delay', `${(-Math.random() * 32).toFixed(1)}s`);
      particle.style.setProperty('--drift', `${Math.round(Math.random() * (isBokeh ? 220 : 170) - (isBokeh ? 110 : 85))}px`);
      particle.style.setProperty('--opacity', isBokeh ? `${(Math.random() * .055 + .045).toFixed(3)}` : `${(Math.random() * .23 + .13).toFixed(2)}`);
      particleField.appendChild(particle);
    }
  }

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cursorLayer = $('#cursorLayer'), cursorRing = $('#cursorRing'), cursorDot = $('#cursorDot');
  if (cursorLayer && cursorRing && cursorDot && finePointer.matches && !reduceMotion.matches) {
    document.body.classList.add('custom-cursor-active');
    const cursor = { targetX: -40, targetY: -40, ringX: -40, ringY: -40, frame: 0 };
    const interactiveSelector = 'a, button, label, [role="button"], [role="tab"], [role="option"], .dropzone';
    const nativeSelector = 'input:not([type="file"]), textarea, [contenteditable="true"]';
    const renderCursor = () => {
      cursor.ringX += (cursor.targetX - cursor.ringX) * .24;
      cursor.ringY += (cursor.targetY - cursor.ringY) * .24;
      cursorDot.style.transform = `translate3d(${cursor.targetX}px, ${cursor.targetY}px, 0)`;
      cursorRing.style.transform = `translate3d(${cursor.ringX}px, ${cursor.ringY}px, 0)`;
      cursor.frame = requestAnimationFrame(renderCursor);
    };
    const makeClickBurst = (x, y) => {
      const burst = document.createElement('span');
      burst.className = 'click-burst';
      burst.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      burst.innerHTML = '<i class="click-burst-ring"></i>';
      for (let index = 0; index < 6; index += 1) {
        const angle = (Math.PI * 2 * index / 6) + (Math.random() * .24 - .12);
        const distance = 24 + Math.random() * 18;
        const spark = document.createElement('i');
        spark.className = 'click-spark';
        spark.style.setProperty('--spark-x', `${Math.cos(angle) * distance}px`);
        spark.style.setProperty('--spark-y', `${Math.sin(angle) * distance}px`);
        spark.style.animationDelay = `${index * 12}ms`;
        burst.appendChild(spark);
      }
      document.body.appendChild(burst);
      window.setTimeout(() => burst.remove(), 650);
    };
    const setCursorTarget = (target) => {
      const native = Boolean(target.closest(nativeSelector));
      cursorLayer.classList.toggle('is-native', native);
      cursorLayer.classList.toggle('is-target', !native && Boolean(target.closest(interactiveSelector)));
    };
    document.addEventListener('pointermove', (event) => {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      cursor.targetX = event.clientX; cursor.targetY = event.clientY;
      cursorLayer.classList.add('is-visible');
      setCursorTarget(event.target);
    }, { passive: true });
    document.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || (event.pointerType && event.pointerType !== 'mouse')) return;
      cursorLayer.classList.add('is-pressed');
      if (!event.target.closest(nativeSelector)) makeClickBurst(event.clientX, event.clientY);
    }, { passive: true });
    document.addEventListener('pointerup', () => cursorLayer.classList.remove('is-pressed'), { passive: true });
    document.addEventListener('pointercancel', () => cursorLayer.classList.remove('is-pressed'), { passive: true });
    document.documentElement.addEventListener('mouseleave', () => cursorLayer.classList.remove('is-visible'));
    window.addEventListener('blur', () => cursorLayer.classList.remove('is-visible'));
    renderCursor();
  }
  const form = $('#promptForm'), feed = $('#feed'), empty = $('#emptyState');
  const title = $('#title'), prompt = $('#prompt'), media = $('#media'), dropzone = $('#dropzone');
  const mediaPreview = $('#mediaPreview'), draftMediaStack = $('#draftMediaStack'), fileName = $('#fileName'), fileSize = $('#fileSize');
  const processingCard = $('#processingCard'), processingTitle = $('#processingTitle'), processingPercent = $('#processingPercent'), processingFile = $('#processingFile'), processingProgress = $('#processingProgress'), processingBar = $('#processingBar'), processingDetail = $('#processingDetail');
  const MODELS = {
    image: [
      { name: 'G Image 2', meta: '4K', icon: '✺' },
      { name: '香蕉2', meta: '4K', icon: '◒' },
      { name: '香蕉Pro', meta: '4K', icon: '◒' },
      { name: 'Seedream 5.0 Pro', meta: '2K', icon: '▮▮' },
      { name: 'Seedream 4.5', meta: '4K', icon: '▮▮' },
    ],
    video: [
      { name: 'Seedance 2.0', meta: '4K · 4–15s · 音频', icon: '▮▶' },
      { name: 'Seedance 2.0 Fast', meta: '720P · 4–15s · 音频', icon: '▮▶' },
      { name: 'Seedance 2.0 Mini', meta: '720P · 4–15s · 音频', icon: '▮▶' },
      { name: 'Hailuo 2.3 Fast', meta: '1080P · 6–10s', icon: '◉' },
      { name: 'Hailuo 2.3', meta: '1080P · 6–10s', icon: '◉' },
    ],
  };
  const state = { items: [], workspaceMode: 'prompt', modeSwitching: false, newestFirst: true, visibleCount: 6, filteredCount: 0, lazyLoading: false, lazyScrollTimer: 0, mediaItems: [], fileToken: 0, canPublish: false, draftTimer: null, type: 'image', selectedModels: { image: '香蕉Pro', video: 'Seedance 2.0 Mini' }, modalTrigger: null, modalTitle: '', modalTimer: null, modalMediaItems: [], modalMediaIndex: 0, processingProgress: 0, isProcessing: false, isPublishing: false, dropReceiptTimer: null };
  const draftKeyFor = (mode) => `tishici-draft-v3-${mode}`;
  const draftIdFor = (mode) => `active-${mode}`;
  const LAZY_BATCH_SIZE = 6;
  const MAX_MEDIA_ITEMS = 12;
  const MAX_IMAGE_BYTES = 1024 * 1024;
  const MAX_VIDEO_BYTES = 1024 * 1024;
  const draftDb = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('indexeddb_unavailable'));
    const request = indexedDB.open('tishici-drafts', 2);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains('drafts')) request.result.createObjectStore('drafts', { keyPath: 'id' }); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const detectMediaKind = (file) => {
    const mime = String(file?.type || '').toLowerCase();
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    const extension = String(file?.name || '').split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp'].includes(extension)) return 'image';
    if (['mp4', 'webm', 'mov', 'm4v'].includes(extension)) return 'video';
    return null;
  };
  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '刚刚';
    const diff = Date.now() - date.getTime();
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  };
  const formatBytes = (bytes) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  const formatDuration = (seconds) => {
    const safeSeconds = Math.max(0, Math.round(Number(seconds) || 0));
    const minutes = Math.floor(safeSeconds / 60);
    const remainder = safeSeconds % 60;
    return minutes ? `${minutes}:${String(remainder).padStart(2, '0')}` : `${remainder} 秒`;
  };
  const showToast = (message) => { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600); };
  const getItemMediaItems = (item) => {
    const multiple = Array.isArray(item?.mediaItems) ? item.mediaItems.map((entry) => ({
      url: entry?.url || entry?.mediaUrl || '',
      kind: entry?.kind || entry?.mediaType || 'image',
    })).filter((entry) => entry.url) : [];
    if (multiple.length) return multiple;
    const url = item?.mediaUrl || item?.imageUrl || item?.videoUrl || '';
    return url ? [{ url, kind: item?.mediaType || (item?.videoUrl ? 'video' : 'image') }] : [];
  };
  const renderModalMedia = () => {
    const modalImage = $('#mediaModalImage'), modalVideo = $('#mediaModalVideo');
    const mediaItems = state.modalMediaItems;
    const current = mediaItems[state.modalMediaIndex];
    if (!current) return;
    const isVideo = current.kind === 'video';
    modalVideo.pause();
    modalVideo.removeAttribute('src');
    modalVideo.load();
    modalImage.removeAttribute('src');
    modalImage.hidden = isVideo;
    modalVideo.hidden = !isVideo;
    if (isVideo) {
      modalVideo.src = current.url;
      normalizeVideoDuration(modalVideo);
      modalVideo.play().catch(() => {});
    } else {
      modalImage.src = current.url;
      modalImage.alt = `${state.modalTitle || '素材预览'} ${state.modalMediaIndex + 1}`;
    }
    $('#mediaModalTitle').textContent = mediaItems.length > 1 ? `${state.modalTitle} · ${state.modalMediaIndex + 1} / ${mediaItems.length}` : state.modalTitle;
    $('#mediaModalType').textContent = `${isVideo ? 'VIDEO / PLAYBACK' : 'IMAGE / PREVIEW'}${mediaItems.length > 1 ? ` · ${state.modalMediaIndex + 1} / ${mediaItems.length}` : ''}`;
    $('#mediaModalPrev').hidden = mediaItems.length < 2;
    $('#mediaModalNext').hidden = mediaItems.length < 2;
    const filmstrip = $('#mediaFilmstrip');
    filmstrip.hidden = mediaItems.length < 2;
    filmstrip.innerHTML = mediaItems.map((entry, index) => `<button class="media-filmstrip-button ${index === state.modalMediaIndex ? 'active' : ''}" type="button" data-media-index="${index}" role="listitem" aria-label="查看第 ${index + 1} 个素材">${entry.kind === 'video' ? `<video muted preload="metadata" playsinline src="${escapeHtml(entry.url)}"></video><span>▶</span>` : `<img loading="lazy" decoding="async" src="${escapeHtml(entry.url)}" alt="">`}</button>`).join('');
    filmstrip.querySelectorAll('video').forEach(normalizeVideoDuration);
    filmstrip.querySelector('.active')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  };
  const setModalMediaIndex = (index) => {
    const total = state.modalMediaItems.length;
    if (!total) return;
    state.modalMediaIndex = (index + total) % total;
    renderModalMedia();
  };
  const openMedia = (trigger) => {
    const modal = $('#mediaModal');
    const item = state.items.find((entry) => entry.id === trigger.dataset.mediaId);
    const mediaItems = item ? getItemMediaItems(item) : trigger.dataset.mediaUrl ? [{ url: trigger.dataset.mediaUrl, kind: trigger.dataset.mediaType || 'image' }] : [];
    if (!mediaItems.length) return;
    clearTimeout(state.modalTimer);
    state.modalTrigger = trigger;
    state.modalTitle = trigger.dataset.mediaTitle || '素材预览';
    state.modalMediaItems = mediaItems;
    state.modalMediaIndex = 0;
    modal.hidden = false;
    renderModalMedia();
    requestAnimationFrame(() => {
      modal.classList.add('is-open');
      $('#mediaModalClose').focus({ preventScroll: true });
    });
  };
  const closeMedia = () => {
    const modal = $('#mediaModal'), modalVideo = $('#mediaModalVideo');
    if (modal.hidden) return;
    modal.classList.remove('is-open');
    modalVideo.pause();
    clearTimeout(state.modalTimer);
    const finish = () => {
      modal.hidden = true;
      modalVideo.removeAttribute('src'); modalVideo.load();
      $('#mediaModalImage').removeAttribute('src');
      if (state.modalTrigger?.isConnected) state.modalTrigger.focus({ preventScroll: true });
      state.modalTrigger = null;
      state.modalTitle = '';
      state.modalMediaItems = [];
      state.modalMediaIndex = 0;
      $('#mediaFilmstrip').innerHTML = '';
    };
    if (reduceMotion.matches) finish();
    else state.modalTimer = setTimeout(finish, 220);
  };
  const normalizeVideoDuration = (video) => {
    const normalize = () => {
      if (Number.isFinite(video.duration)) return;
      const restore = () => {
        video.removeEventListener('timeupdate', restore);
        video.currentTime = 0;
      };
      video.addEventListener('timeupdate', restore);
      video.currentTime = Number.MAX_SAFE_INTEGER;
    };
    if (video.readyState >= 1) normalize();
    else video.addEventListener('loadedmetadata', normalize, { once: true });
  };
  const setModelMenu = (open) => {
    const picker = $('#modelPicker'), trigger = $('#modelTrigger');
    picker.setAttribute('aria-hidden', String(!open)); trigger.setAttribute('aria-expanded', String(open));
  };
  const renderMediaInput = () => {
    const selectedCount = state.mediaItems.length;
    media.accept = 'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,video/x-m4v,.mov,.m4v';
    $('#mediaLabel').textContent = state.workspaceMode === 'note' ? '图片或视频' : '参考图片或视频';
    $('#mediaHint').textContent = `可多选 · 单条最多 ${MAX_MEDIA_ITEMS} 个 · 超过 1MB 本地压缩`;
    $('#dropTitle').textContent = selectedCount ? `继续添加素材 · 已选 ${selectedCount} / ${MAX_MEDIA_ITEMS}` : '拖入图片或视频，或点击多选';
    $('#dropHint').textContent = state.workspaceMode === 'note' ? '图片和视频会与这条随手记一起保存' : '图片和视频会以层叠素材组显示在提示词下方';
  };
  const renderModelPicker = () => {
    document.querySelectorAll('.type-tab').forEach((tab) => {
      const active = tab.dataset.type === state.type;
      tab.classList.toggle('active', active); tab.setAttribute('aria-selected', String(active));
    });
    const models = MODELS[state.type];
    const selected = models.find((model) => model.name === state.selectedModels[state.type]) || models[0];
    $('#modelCount').textContent = `${models.length} 个可选`;
    $('#modelTrigger').innerHTML = `<span class="model-icon">${escapeHtml(selected.icon)}</span><span class="model-copy"><strong>${escapeHtml(selected.name)}</strong><small>${escapeHtml(selected.meta)}</small></span><span class="model-chevron">⌄</span>`;
    $('#modelPicker').innerHTML = models.map((model) => {
      const active = state.selectedModels[state.type] === model.name;
      return `<button class="model-option ${active ? 'active' : ''}" type="button" data-model="${escapeHtml(model.name)}" role="option" aria-selected="${active}">
        <span class="model-icon">${escapeHtml(model.icon)}</span><span class="model-copy"><strong>${escapeHtml(model.name)}</strong><small>${escapeHtml(model.meta)}</small></span><span class="model-check">${active ? '✓' : ''}</span>
      </button>`;
    }).join('');
    renderMediaInput();
  };
  const WORKSPACE_COPY = {
    prompt: {
      title: '提示词工作台', tagline: '随手存，马上发。', eyebrow: "JACK'S CONTACT SHEET · PROMPT ARCHIVE",
      count: '条备份', composerKicker: '01 / COMPOSE', composerTitle: '新建备份',
      titleLabel: '给它一个名字', titlePlaceholder: '例如：雨夜城市肖像',
      promptLabel: '提示词', promptPlaceholder: '把提示词粘贴在这里……\n\n你可以保留换行、参数和备注，它们都会原样保存。',
      privacy: '只存到你的备份库', auth: '发布身份', feedKicker: '02 / YOUR ARCHIVE', feedTitle: '已发布',
      search: '搜索备份', emptyCopy: '写下第一条提示词，它会马上出现在这里。', emptyCta: '开始写第一条 ↗',
    },
    note: {
      title: '随手记工作台', tagline: '想到什么，就记什么。', eyebrow: "JACK'S POCKET NOTE · QUICK CAPTURE",
      count: '条随手记', composerKicker: '01 / JOT DOWN', composerTitle: '记一笔',
      titleLabel: '这件事叫什么', titlePlaceholder: '例如：明天要补拍的镜头',
      promptLabel: '随手记', promptPlaceholder: '想到什么，就记在这里……\n\n可以是一句话、一个待办，也可以附上一张图片或一段视频。',
      privacy: '只存到你的随手记', auth: '保存身份', feedKicker: '02 / YOUR NOTES', feedTitle: '记下的东西',
      search: '搜索随手记', emptyCopy: '写下第一条随手记，它会马上出现在这里。', emptyCta: '记下第一件事 ↗',
    },
  };
  const renderWorkspaceMode = () => {
    const copy = WORKSPACE_COPY[state.workspaceMode];
    document.body.dataset.workspace = state.workspaceMode;
    document.title = state.workspaceMode === 'note' ? '随手记 · tishici' : '提示词备份库 · tishici';
    document.querySelectorAll('.workspace-switch-button').forEach((button) => {
      const active = button.dataset.workspace === state.workspaceMode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $('#promptSettings').hidden = state.workspaceMode === 'note';
    $('#heroEyebrow').textContent = copy.eyebrow;
    $('#heroTitle').textContent = copy.title;
    $('#heroTagline').textContent = copy.tagline;
    $('#countLabel').textContent = copy.count;
    $('#composerKicker').textContent = copy.composerKicker;
    $('#composerTitle').textContent = copy.composerTitle;
    $('#titleLabel').textContent = copy.titleLabel;
    title.placeholder = copy.titlePlaceholder;
    $('#promptLabel').textContent = copy.promptLabel;
    prompt.placeholder = copy.promptPlaceholder;
    $('#composerPrivacy').textContent = copy.privacy;
    $('#authLabel').textContent = copy.auth;
    $('#feedKicker').textContent = copy.feedKicker;
    $('#feedTitle').textContent = copy.feedTitle;
    $('#search').placeholder = copy.search;
    $('#emptyCopy').textContent = copy.emptyCopy;
    $('#emptyCta').textContent = copy.emptyCta;
    renderMediaInput();
    syncPublishButton();
  };
  const snapshotDraft = () => ({
    title: title.value,
    prompt: prompt.value,
    type: state.type,
    selectedModels: { ...state.selectedModels },
    mediaItems: state.mediaItems.map((item) => ({ file: item.file, kind: item.kind, originalName: item.originalName || item.file.name })),
  });
  const saveDraftTextFallback = (mode, draft) => {
    try {
      localStorage.setItem(draftKeyFor(mode), JSON.stringify({ title: draft.title, prompt: draft.prompt, type: draft.type, selectedModels: draft.selectedModels }));
    } catch {}
  };
  const persistDraft = async (mode, draft) => {
    saveDraftTextFallback(mode, draft);
    try {
      const db = await draftDb;
      const transaction = db.transaction('drafts', 'readwrite');
      transaction.objectStore('drafts').put({ id: draftIdFor(mode), ...draft });
      await new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
      if (state.workspaceMode === mode) $('#draftState').textContent = draft.prompt || draft.title || draft.mediaItems?.length ? '草稿已保存到本机' : '自动保存草稿';
    } catch {
      if (state.workspaceMode === mode) $('#draftState').textContent = '草稿已保存到当前浏览器';
    }
  };
  const saveDraft = () => {
    const mode = state.workspaceMode;
    const draft = snapshotDraft();
    saveDraftTextFallback(mode, draft);
    clearTimeout(state.draftTimer);
    state.draftTimer = setTimeout(() => persistDraft(mode, draft), 350);
  };
  const clearDraft = async (mode = state.workspaceMode) => {
    clearTimeout(state.draftTimer);
    state.draftTimer = null;
    try {
      localStorage.removeItem(draftKeyFor(mode));
      if (mode === 'prompt') localStorage.removeItem('tishici-draft-v2');
    } catch {}
    try {
      const db = await draftDb;
      const transaction = db.transaction('drafts', 'readwrite');
      const store = transaction.objectStore('drafts');
      store.delete(draftIdFor(mode));
      if (mode === 'prompt') store.delete('active');
      await new Promise((resolve) => {
        transaction.oncomplete = resolve;
        transaction.onerror = resolve;
        transaction.onabort = resolve;
      });
    } catch {}
  };
  const updateCount = () => { $('#charCount').textContent = `${prompt.value.length.toLocaleString()} / 12,000`; };
  const syncPublishButton = () => {
    const button = $('#publishButton');
    button.disabled = state.isProcessing || state.isPublishing;
    button.querySelector('span').textContent = state.isProcessing ? '素材处理中…' : state.isPublishing ? '正在保存…' : state.workspaceMode === 'note' ? '记下来' : '发布备份';
    document.querySelectorAll('.workspace-switch-button').forEach((workspaceButton) => {
      workspaceButton.disabled = state.modeSwitching || state.isProcessing || state.isPublishing;
    });
  };
  const showProcessing = (file, kind, progress, heading, detail, status = 'working') => {
    const wasHidden = processingCard.hidden;
    const nextProgress = status === 'error' ? 100 : Math.max(state.processingProgress, Math.min(99, Math.round(progress)));
    state.processingProgress = nextProgress;
    state.isProcessing = status === 'working';
    processingCard.hidden = false;
    processingCard.dataset.state = status;
    processingTitle.textContent = heading;
    processingPercent.textContent = status === 'error' ? '失败' : `${nextProgress}%`;
    processingFile.textContent = `${file.name || (kind === 'video' ? '未命名视频' : '未命名图片')} · ${formatBytes(file.size)}`;
    processingProgress.setAttribute('aria-valuenow', String(status === 'error' ? 0 : nextProgress));
    processingBar.style.transform = `scaleX(${status === 'error' ? 1 : Math.max(.04, nextProgress / 100)})`;
    processingDetail.textContent = detail;
    dropzone.hidden = true;
    mediaPreview.hidden = true;
    $('#draftState').textContent = status === 'error' ? '素材处理失败' : `浏览器本地处理中 · ${nextProgress}%`;
    syncPublishButton();
    if (wasHidden) requestAnimationFrame(() => processingCard.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'nearest' }));
  };
  const hideProcessing = () => {
    processingCard.hidden = true;
    processingCard.dataset.state = '';
    state.processingProgress = 0;
    state.isProcessing = false;
    syncPublishButton();
  };
  const renderDraftMediaStack = () => {
    const total = state.mediaItems.length;
    renderMediaInput();
    if (!total) {
      draftMediaStack.innerHTML = '';
      draftMediaStack.setAttribute('aria-hidden', 'true');
      mediaPreview.hidden = true;
      dropzone.hidden = false;
      return;
    }
    const visible = state.mediaItems.slice(-3);
    const positions = visible.length === 1 ? ['is-center'] : visible.length === 2 ? ['is-left', 'is-right'] : ['is-left', 'is-right', 'is-center'];
    draftMediaStack.innerHTML = visible.map((item, index) => {
      const mediaMarkup = item.kind === 'video'
        ? `<video muted preload="metadata" playsinline src="${escapeHtml(item.previewUrl)}"></video><i class="stack-play-mark">▶</i>`
        : `<img src="${escapeHtml(item.previewUrl)}" alt="">`;
      return `<span class="draft-stack-item ${positions[index]}">${mediaMarkup}</span>`;
    }).join('') + `<b class="draft-stack-count">${total}</b>`;
    draftMediaStack.querySelectorAll('video').forEach(normalizeVideoDuration);
    draftMediaStack.setAttribute('aria-hidden', 'false');
    const totalBytes = state.mediaItems.reduce((sum, item) => sum + item.file.size, 0);
    const lastItem = state.mediaItems[total - 1];
    fileName.textContent = total === 1 ? lastItem.originalName : `已选 ${total} 个素材`;
    fileSize.textContent = `${formatBytes(totalBytes)} · 图片与视频可混合`;
    mediaPreview.hidden = false;
    dropzone.hidden = false;
  };
  const appendMediaItem = (file, originalName, kind) => {
    const item = {
      file,
      kind,
      originalName: originalName || file.name,
      previewUrl: URL.createObjectURL(file),
    };
    state.mediaItems.push(item);
    renderDraftMediaStack();
    return item;
  };
  const clearMediaItems = () => {
    state.fileToken += 1;
    state.mediaItems.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    state.mediaItems = [];
    media.value = '';
    draftMediaStack.innerHTML = '';
    mediaPreview.hidden = true;
    hideProcessing();
    dropzone.hidden = false;
    renderMediaInput();
  };
  const restoreDraft = async (mode = state.workspaceMode) => {
    let draft = null;
    try {
      const db = await draftDb;
      draft = await new Promise((resolve) => {
        const store = db.transaction('drafts').objectStore('drafts');
        const request = store.get(draftIdFor(mode));
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      });
      if (!draft && mode === 'prompt') {
        draft = await new Promise((resolve) => {
          const request = db.transaction('drafts').objectStore('drafts').get('active');
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => resolve(null);
        });
      }
    } catch {}
    if (!draft) {
      try {
        draft = JSON.parse(localStorage.getItem(draftKeyFor(mode)) || (mode === 'prompt' ? localStorage.getItem('tishici-draft-v2') : '') || '{}');
      } catch { draft = {}; }
    }
    if (draft?.type && MODELS[draft.type]) state.type = draft.type;
    if (draft?.selectedModels) {
      for (const type of ['image', 'video']) {
        const candidate = draft.selectedModels[type];
        if (candidate && MODELS[type].some((model) => model.name === candidate)) state.selectedModels[type] = candidate;
      }
    }
    renderModelPicker();
    title.value = draft?.title || ''; prompt.value = draft?.prompt || ''; updateCount();
    const storedItems = Array.isArray(draft?.mediaItems) ? draft.mediaItems : [];
    for (const storedItem of storedItems.slice(0, MAX_MEDIA_ITEMS)) {
      const storedMedia = storedItem?.file;
      if (!(storedMedia instanceof Blob)) continue;
      const kind = storedItem.kind || (storedMedia.type?.startsWith('video/') ? 'video' : 'image');
      const fallbackName = kind === 'video' ? 'prompt-video.webm' : 'prompt-image.webp';
      const originalName = storedItem.originalName || storedMedia.name || fallbackName;
      const file = storedMedia instanceof File
        ? storedMedia
        : new File([storedMedia], originalName, { type: storedMedia.type || (kind === 'video' ? 'video/webm' : 'image/webp'), lastModified: Date.now() });
      appendMediaItem(file, originalName, kind);
    }
    if (!storedItems.length && (draft?.media || draft?.image)) {
      const storedMedia = draft.media || draft.image;
      const kind = draft.mediaKind || (storedMedia.type?.startsWith('video/') ? 'video' : 'image');
      const fallbackName = kind === 'video' ? 'prompt-video.webm' : 'prompt-image.webp';
      const file = storedMedia instanceof File ? storedMedia : new File([storedMedia], draft.fileName || fallbackName, { type: storedMedia.type || (kind === 'video' ? 'video/webm' : 'image/webp'), lastModified: Date.now() });
      appendMediaItem(file, draft.fileName || file.name, kind);
    }
    renderDraftMediaStack();
    if (title.value || prompt.value || state.mediaItems.length) $('#draftState').textContent = '已恢复本机草稿';
    else $('#draftState').textContent = '自动保存草稿';
  };
  const blobFromCanvas = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  const compressImage = async (file, onProgress = () => {}) => {
    const sourceUrl = URL.createObjectURL(file);
    try {
      onProgress(12, '正在读取图片像素…');
      const source = new Image();
      source.decoding = 'async'; source.src = sourceUrl; await source.decode();
      onProgress(24, '图片读取完成，正在计算最佳尺寸…');
      let width = source.naturalWidth, height = source.naturalHeight;
      const scale = Math.min(1, 2400 / Math.max(width, height));
      width = Math.max(1, Math.round(width * scale)); height = Math.max(1, Math.round(height * scale));
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { alpha: true });
      let compressed = null;
      for (let dimensionTry = 0; dimensionTry < 7 && !compressed; dimensionTry += 1) {
        canvas.width = width; canvas.height = height; context.clearRect(0, 0, width, height); context.drawImage(source, 0, 0, width, height);
        let qualityTry = 0;
        for (let quality = 0.86; quality >= 0.34; quality -= 0.08, qualityTry += 1) {
          const attemptProgress = 26 + Math.round(((dimensionTry * 7 + qualityTry) / 49) * 68);
          onProgress(attemptProgress, '正在优化尺寸和画质，目标控制在 1MB 内…');
          const blob = await blobFromCanvas(canvas, 'image/webp', quality);
          if (blob && blob.size <= MAX_IMAGE_BYTES) { compressed = blob; break; }
        }
        if (!compressed) { width = Math.max(480, Math.round(width * 0.82)); height = Math.max(480, Math.round(height * 0.82)); }
      }
      if (!compressed) throw new Error('compression_failed');
      onProgress(97, '压缩完成，正在生成预览…');
      const baseName = (file.name || 'prompt-image').replace(/\.[^.]+$/, '').slice(0, 80) || 'prompt-image';
      return new File([compressed], `${baseName}.webp`, { type: 'image/webp', lastModified: Date.now() });
    } finally { URL.revokeObjectURL(sourceUrl); }
  };
  const compressVideoDirectAttempt = async (file, videoBitsPerSecond, onProgress = () => {}) => {
    const sourceUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'auto'; video.muted = true; video.playsInline = true; video.src = sourceUrl;
    let recorder = null, sourceStream = null, outputStream = null, reportProgress = null;
    try {
      await new Promise((resolve, reject) => {
        video.onloadeddata = resolve;
        video.onerror = () => reject(new Error('video_decode_failed'));
      });
      if (!Number.isFinite(video.duration) || video.duration <= 0) throw new Error('video_duration_unavailable');
      reportProgress = () => onProgress(Math.min(1, video.currentTime / video.duration), video.currentTime, video.duration);
      video.addEventListener('timeupdate', reportProgress);
      reportProgress();
      if (typeof video.captureStream !== 'function' || !window.MediaRecorder || !window.MediaStream) throw new Error('video_compression_unsupported');
      sourceStream = video.captureStream();
      const videoTracks = sourceStream.getVideoTracks();
      if (!videoTracks.length) throw new Error('video_compression_unsupported');
      outputStream = new MediaStream(videoTracks);
      const mimeTypes = ['video/webm;codecs=vp8', 'video/webm;codecs=vp9', 'video/webm'];
      const mimeType = mimeTypes.find((candidate) => MediaRecorder.isTypeSupported(candidate));
      if (!mimeType) throw new Error('video_compression_unsupported');
      recorder = new MediaRecorder(outputStream, { mimeType, videoBitsPerSecond });
      const chunks = [];
      const result = new Promise((resolve, reject) => {
        const watchdog = window.setTimeout(() => {
          if (recorder.state !== 'inactive') recorder.stop();
          reject(new Error('video_record_timeout'));
        }, Math.ceil((video.duration + 12) * 1000));
        recorder.ondataavailable = (event) => { if (event.data?.size) chunks.push(event.data); };
        recorder.onerror = () => {
          window.clearTimeout(watchdog);
          reject(new Error('video_record_failed'));
        };
        recorder.onstop = () => {
          window.clearTimeout(watchdog);
          resolve(new Blob(chunks, { type: mimeType }));
        };
        video.onended = () => {
          if (recorder.state === 'recording') recorder.requestData();
          window.setTimeout(() => {
            if (recorder.state !== 'inactive') recorder.stop();
          }, 180);
        };
      });
      recorder.start(250);
      await video.play();
      return await result;
    } finally {
      if (recorder && recorder.state !== 'inactive') recorder.stop();
      if (outputStream) outputStream.getTracks().forEach((track) => track.stop());
      if (sourceStream) sourceStream.getTracks().forEach((track) => track.stop());
      if (reportProgress) video.removeEventListener('timeupdate', reportProgress);
      video.pause(); video.removeAttribute('src'); video.load(); URL.revokeObjectURL(sourceUrl);
    }
  };
  const compressVideoAttempt = async (file, options, onProgress = () => {}) => {
    const sourceUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'auto'; video.muted = true; video.playsInline = true; video.src = sourceUrl;
    let animationFrame = 0, videoFrame = 0, recorder = null;
    let canvasStream = null;
    try {
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = () => reject(new Error('video_decode_failed'));
      });
      if (!Number.isFinite(video.duration) || video.duration <= 0) throw new Error('video_duration_unavailable');
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        await new Promise((resolve, reject) => {
          video.onloadeddata = resolve;
          video.onerror = () => reject(new Error('video_decode_failed'));
        });
      }
      const scale = Math.min(1, options.maxDimension / Math.max(video.videoWidth, video.videoHeight));
      const width = Math.max(2, Math.round(video.videoWidth * scale / 2) * 2);
      const height = Math.max(2, Math.round(video.videoHeight * scale / 2) * 2);
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const context = canvas.getContext('2d', { alpha: false });
      if (!context || !canvas.captureStream || !window.MediaRecorder) throw new Error('video_compression_unsupported');
      context.drawImage(video, 0, 0, width, height);
      canvasStream = canvas.captureStream(0);
      let canvasTrack = canvasStream.getVideoTracks()[0];
      if (!canvasTrack || typeof canvasTrack.requestFrame !== 'function') {
        canvasStream.getTracks().forEach((track) => track.stop());
        canvasStream = canvas.captureStream(options.fps);
        canvasTrack = canvasStream.getVideoTracks()[0];
      }
      const mimeTypes = ['video/webm;codecs=vp8', 'video/webm;codecs=vp9', 'video/webm'];
      const mimeType = mimeTypes.find((candidate) => MediaRecorder.isTypeSupported(candidate));
      if (!mimeType) throw new Error('video_compression_unsupported');
      recorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: options.videoBitsPerSecond });
      const chunks = [];
      const result = new Promise((resolve, reject) => {
        const watchdog = window.setTimeout(() => {
          if (recorder.state !== 'inactive') recorder.stop();
          reject(new Error('video_record_timeout'));
        }, Math.ceil((video.duration + 12) * 1000));
        recorder.ondataavailable = (event) => { if (event.data?.size) chunks.push(event.data); };
        recorder.onerror = () => {
          window.clearTimeout(watchdog);
          reject(new Error('video_record_failed'));
        };
        recorder.onstop = () => {
          window.clearTimeout(watchdog);
          resolve(new Blob(chunks, { type: mimeType }));
        };
        video.onended = () => {
          context.drawImage(video, 0, 0, width, height);
          if (canvasTrack && typeof canvasTrack.requestFrame === 'function') canvasTrack.requestFrame();
          if (recorder.state === 'recording') recorder.requestData();
          window.setTimeout(() => {
            if (recorder.state !== 'inactive') recorder.stop();
          }, 180);
        };
      });
      let lastDrawnAt = -Infinity;
      const drawFrame = (_now, metadata = null) => {
        if (video.ended) return;
        const mediaTime = Number.isFinite(metadata?.mediaTime) ? metadata.mediaTime : video.currentTime;
        if (mediaTime - lastDrawnAt >= (1 / options.fps) - 0.004) {
          context.drawImage(video, 0, 0, width, height);
          if (canvasTrack && typeof canvasTrack.requestFrame === 'function') canvasTrack.requestFrame();
          lastDrawnAt = mediaTime;
          onProgress(Math.min(1, mediaTime / video.duration), mediaTime, video.duration);
        }
        if ('requestVideoFrameCallback' in video) videoFrame = video.requestVideoFrameCallback(drawFrame);
        else animationFrame = requestAnimationFrame(drawFrame);
      };
      recorder.start(250);
      if (canvasTrack && typeof canvasTrack.requestFrame === 'function') canvasTrack.requestFrame();
      if ('requestVideoFrameCallback' in video) videoFrame = video.requestVideoFrameCallback(drawFrame);
      else animationFrame = requestAnimationFrame(drawFrame);
      await video.play();
      return await result;
    } finally {
      cancelAnimationFrame(animationFrame);
      if (videoFrame && 'cancelVideoFrameCallback' in video) video.cancelVideoFrameCallback(videoFrame);
      if (recorder && recorder.state !== 'inactive') recorder.stop();
      if (canvasStream) canvasStream.getTracks().forEach((track) => track.stop());
      video.pause(); video.removeAttribute('src'); video.load(); URL.revokeObjectURL(sourceUrl);
    }
  };
  const validateCompressedVideo = async (blob, expectedDuration) => {
    if (!blob || blob.size < 4096) throw new Error('video_compression_invalid');
    const previewUrl = URL.createObjectURL(blob);
    const preview = document.createElement('video');
    preview.preload = 'metadata'; preview.muted = true; preview.playsInline = true; preview.src = previewUrl;
    try {
      await new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error('video_compression_invalid')), 8000);
        preview.onloadedmetadata = () => { window.clearTimeout(timeout); resolve(); };
        preview.onerror = () => { window.clearTimeout(timeout); reject(new Error('video_compression_invalid')); };
      });
      if (!preview.videoWidth || !preview.videoHeight) throw new Error('video_compression_invalid');
      let actualDuration = preview.duration;
      if (!Number.isFinite(actualDuration)) {
        await new Promise((resolve, reject) => {
          const timeout = window.setTimeout(() => reject(new Error('video_compression_invalid')), 8000);
          preview.onseeked = () => { window.clearTimeout(timeout); resolve(); };
          preview.onerror = () => { window.clearTimeout(timeout); reject(new Error('video_compression_invalid')); };
          preview.currentTime = Number.MAX_SAFE_INTEGER;
        });
        actualDuration = preview.duration;
      }
      if (!Number.isFinite(actualDuration) || actualDuration < expectedDuration * 0.9) throw new Error('video_compression_incomplete');
    } finally {
      preview.pause(); preview.removeAttribute('src'); preview.load(); URL.revokeObjectURL(previewUrl);
    }
  };
  const compressVideo = async (file, onProgress = () => {}) => {
    const sourceUrl = URL.createObjectURL(file);
    const probe = document.createElement('video');
    probe.preload = 'metadata'; probe.src = sourceUrl;
    let duration = 0;
    try {
      duration = await new Promise((resolve, reject) => {
        probe.onloadedmetadata = () => resolve(probe.duration);
        probe.onerror = () => reject(new Error('video_decode_failed'));
      });
    } finally {
      probe.removeAttribute('src'); probe.load(); URL.revokeObjectURL(sourceUrl);
    }
    let lastUiProgress = -1;
    const emitProgress = (progress, detail) => {
      const rounded = Math.min(99, Math.max(0, Math.round(progress)));
      if (rounded === lastUiProgress) return;
      lastUiProgress = rounded;
      onProgress(rounded, detail);
    };
    emitProgress(8, `视频读取完成 · 完整时长 ${formatDuration(duration)}`);
    const targetBitrate = (MAX_VIDEO_BYTES * 8 * 0.84) / Math.max(1, duration);
    const directBitrates = [
      Math.min(1400000, Math.max(160000, Math.round(targetBitrate * 0.88))),
      Math.min(900000, Math.max(100000, Math.round(targetBitrate * 0.62))),
    ];
    const directStages = [{ start: 10, end: 50 }, { start: 50, end: 72 }];
    for (let index = 0; index < directBitrates.length; index += 1) {
      const stage = directStages[index];
      try {
        emitProgress(stage.start, `正在本地压缩视频 · 第 ${index + 1} 轮画质优化`);
        const blob = await compressVideoDirectAttempt(file, directBitrates[index], (fraction, current, total) => {
          emitProgress(stage.start + (stage.end - stage.start) * fraction, `完整时长保留 · ${formatDuration(current)} / ${formatDuration(total)}`);
        });
        if (blob && blob.size <= MAX_VIDEO_BYTES) {
          emitProgress(98, '体积已达标，正在校验完整时长…');
          await validateCompressedVideo(blob, duration);
          const baseName = (file.name || 'prompt-video').replace(/\.[^.]+$/, '').slice(0, 80) || 'prompt-video';
          return new File([blob], `${baseName}.webm`, { type: 'video/webm', lastModified: Date.now() });
        }
      } catch {}
    }
    const attempts = [
      { maxDimension: 640, fps: 15, videoBitsPerSecond: Math.min(1200000, Math.max(180000, Math.round(targetBitrate * 0.9))) },
      { maxDimension: 480, fps: 12, videoBitsPerSecond: Math.min(700000, Math.max(120000, Math.round(targetBitrate * 0.66))) },
      { maxDimension: 360, fps: 10, videoBitsPerSecond: 120000 },
    ];
    const canvasStages = [{ start: 72, end: 83 }, { start: 83, end: 92 }, { start: 92, end: 98 }];
    for (let index = 0; index < attempts.length; index += 1) {
      const stage = canvasStages[index];
      try {
        emitProgress(stage.start, `正在继续优化体积 · 第 ${index + 3} 轮`);
        const blob = await compressVideoAttempt(file, attempts[index], (fraction, current, total) => {
          emitProgress(stage.start + (stage.end - stage.start) * fraction, `完整时长保留 · ${formatDuration(current)} / ${formatDuration(total)}`);
        });
        if (blob && blob.size <= MAX_VIDEO_BYTES) {
          emitProgress(99, '体积已达标，正在校验完整时长…');
          await validateCompressedVideo(blob, duration);
          const baseName = (file.name || 'prompt-video').replace(/\.[^.]+$/, '').slice(0, 80) || 'prompt-video';
          return new File([blob], `${baseName}.webm`, { type: 'video/webm', lastModified: Date.now() });
        }
      } catch {}
    }
    throw new Error('video_compression_failed');
  };
  const renderPasswordGate = () => {
    const passwordInput = $('#publishPassword');
    const hint = $('#passwordHint');
    passwordInput.hidden = state.canPublish;
    hint.textContent = state.canPublish ? 'jack · 已验证' : 'jack · 首次发布需密码';
  };
  const processMediaFile = async (file, token, position, total) => {
    const fileKind = detectMediaKind(file);
    const isVideo = fileKind === 'video';
    if (!fileKind) return { ok: false, reason: 'unsupported' };
    const kindLabel = isVideo ? '视频' : '图片';
    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    state.processingProgress = 0;
    const sequence = total > 1 ? `第 ${position} / ${total} 个 · ` : '';
    showProcessing(file, fileKind, 4, `${kindLabel}已接收`, `${sequence}${formatBytes(file.size)} · 正在检查是否需要压缩`);
    setNote(`${sequence}${kindLabel}已经进入浏览器，正在检查素材…`);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (token !== state.fileToken) return { ok: false, reason: 'cancelled' };
    if (file.size <= maxBytes) {
      appendMediaItem(file, file.name, fileKind);
      return { ok: true, compressed: false };
    }
    try {
      const progress = (percent, detail) => {
        if (token !== state.fileToken) return;
        showProcessing(file, fileKind, percent, `正在压缩${kindLabel}`, `${sequence}${detail}`);
        setNote(`${sequence}${kindLabel}正在浏览器本地压缩 · ${Math.round(percent)}%`);
      };
      progress(8, isVideo ? '仅使用当前浏览器处理 · 完整时长会保留' : '仅使用当前浏览器处理 · 正在转换为 WebP');
      const compressed = isVideo ? await compressVideo(file, progress) : await compressImage(file, progress);
      if (token !== state.fileToken) return { ok: false, reason: 'cancelled' };
      showProcessing(file, fileKind, 99, '压缩完成', `${sequence}正在生成预览并保存本机草稿…`);
      appendMediaItem(compressed, file.name, fileKind);
      return { ok: true, compressed: true };
    } catch (error) {
      if (token !== state.fileToken) return { ok: false, reason: 'cancelled' };
      const message = isVideo
        ? (error.message === 'video_compression_unsupported' ? '当前浏览器不支持本地视频压缩，请使用最新版 Chrome 或 Edge。' : '这段视频无法压缩到 1MB，请换一段更短或分辨率更低的视频。')
        : '这张图片无法压缩，请换一张图片再试。';
      showProcessing(file, fileKind, 100, `${kindLabel}压缩失败`, `${sequence}${message}`, 'error');
      return { ok: false, reason: 'compression', message };
    }
  };
  const setFiles = async (files) => {
    const incoming = Array.from(files || []).filter(Boolean);
    if (!incoming.length) return;
    const supported = incoming.filter((file) => detectMediaKind(file));
    if (!supported.length) {
      setNote('请选择 JPG、PNG、WEBP 图片，或 MP4、WebM、MOV 视频。', true);
      showToast('没有识别到可用的图片或视频');
      return;
    }
    const remaining = Math.max(0, MAX_MEDIA_ITEMS - state.mediaItems.length);
    if (!remaining) {
      setNote(`每条最多保存 ${MAX_MEDIA_ITEMS} 个素材，请先移除现有素材。`, true);
      showToast(`已达到 ${MAX_MEDIA_ITEMS} 个素材上限`);
      return;
    }
    const queue = supported.slice(0, remaining);
    const skipped = incoming.length - supported.length;
    const limited = supported.length - queue.length;
    const token = ++state.fileToken;
    media.value = '';
    closeMedia();
    let added = 0;
    let compressed = 0;
    let failed = skipped;
    for (let index = 0; index < queue.length; index += 1) {
      const result = await processMediaFile(queue[index], token, index + 1, queue.length);
      if (token !== state.fileToken || result.reason === 'cancelled') return;
      if (result.ok) {
        added += 1;
        if (result.compressed) compressed += 1;
      } else {
        failed += 1;
      }
    }
    hideProcessing();
    renderDraftMediaStack();
    saveDraft();
    const details = [
      added ? `已加入 ${added} 个` : '',
      compressed ? `${compressed} 个已压缩到 1MB 内` : '',
      failed ? `${failed} 个未能处理` : '',
      limited ? `${limited} 个因达到上限未加入` : '',
    ].filter(Boolean).join(' · ');
    setNote(`${details || '没有加入素材'}${added ? ' · 草稿已自动保存到本机。' : ''}`, failed > 0 && added === 0);
    showToast(added ? `素材已进入草稿 · 当前共 ${state.mediaItems.length} 个` : '素材处理失败，请换一份再试');
  };
  const importDroppedFiles = async (files) => setFiles(files);
  const setNote = (message, error = false) => { const note = $('#formNote'); note.textContent = message; note.classList.toggle('error', error); };
  const getItemWorkspace = (item) => item.collection === 'note' ? 'note' : 'prompt';
  const getWorkspaceItems = () => state.items.filter((item) => getItemWorkspace(item) === state.workspaceMode);
  const getFilteredItems = () => {
    const query = $('#search').value.trim().toLowerCase();
    const items = getWorkspaceItems().filter((item) => !query || `${item.title} ${item.prompt} ${item.type || ''} ${item.model || ''}`.toLowerCase().includes(query));
    items.sort((a, b) => state.newestFirst ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt));
    return items;
  };
  const renderCard = (item, index) => {
    const isNote = getItemWorkspace(item) === 'note';
    const itemMedia = getItemMediaItems(item);
    const firstMedia = itemMedia[0] || null;
    const mediaTitle = item.title || (isNote ? '随手记素材' : '提示词素材');
    const badge = isNote ? '随手记' : item.type === 'video' ? '视频' : '图片';
    const mediaKinds = new Set(itemMedia.map((entry) => entry.kind));
    const noteMediaLabel = !itemMedia.length ? '文字' : itemMedia.length > 1 ? `${itemMedia.length} 项素材` : firstMedia.kind === 'video' ? '视频' : '图片';
    const detailBadge = isNote ? noteMediaLabel : item.model;
    let mediaMarkup = '';
    if (itemMedia.length === 1) {
      mediaMarkup = `<button class="prompt-media-button" type="button" data-media-id="${escapeHtml(item.id)}" data-media-title="${escapeHtml(mediaTitle)}" aria-label="打开${firstMedia.kind === 'video' ? '视频' : '图片'}：${escapeHtml(mediaTitle)}">${firstMedia.kind === 'video' ? `<video class="prompt-video" muted preload="metadata" playsinline src="${escapeHtml(firstMedia.url)}"></video><span class="media-open-mark is-play">▶</span>` : `<img class="prompt-image" loading="lazy" decoding="async" src="${escapeHtml(firstMedia.url)}" alt="${escapeHtml(mediaTitle)}"><span class="media-open-mark">↗</span>`}</button>`;
    } else if (itemMedia.length > 1) {
      const visible = itemMedia.slice(-3);
      const positions = visible.length === 2 ? ['is-left', 'is-right'] : ['is-left', 'is-right', 'is-center'];
      const stackedItems = visible.map((entry, mediaIndex) => `<span class="published-stack-item ${positions[mediaIndex]}">${entry.kind === 'video' ? `<video class="prompt-video" muted preload="metadata" playsinline src="${escapeHtml(entry.url)}"></video><i class="stack-play-mark">▶</i>` : `<img class="prompt-image" loading="lazy" decoding="async" src="${escapeHtml(entry.url)}" alt="">`}</span>`).join('');
      const mixedLabel = mediaKinds.size > 1 ? '图片 + 视频' : firstMedia.kind === 'video' ? '视频组' : '图片组';
      mediaMarkup = `<button class="prompt-media-button is-stack" type="button" data-media-id="${escapeHtml(item.id)}" data-media-title="${escapeHtml(mediaTitle)}" aria-label="打开 ${itemMedia.length} 个${mixedLabel}">${stackedItems}<span class="published-stack-count">${itemMedia.length}</span><span class="published-stack-label">${mixedLabel}</span></button>`;
    }
    return `<article class="prompt-card ${isNote ? 'is-note' : ''}" style="animation-delay:${Math.min((index % LAZY_BATCH_SIZE) * 45, 220)}ms">
      <div class="prompt-badges"><span>${badge}</span>${detailBadge ? `<b>${escapeHtml(detailBadge)}</b>` : ''}</div>
      <div class="prompt-card-head"><h3 class="prompt-card-title ${item.title ? '' : 'untitled'}">${escapeHtml(item.title || (isNote ? '没写标题' : '未命名提示词'))}</h3><time class="prompt-date">${formatDate(item.createdAt)}</time></div>
      <p class="prompt-text">${escapeHtml(item.prompt)}</p>
      ${mediaMarkup}
      <div class="prompt-card-foot"><span class="prompt-id">${escapeHtml(String(item.author || 'jack').toLowerCase())} · ${escapeHtml(item.id)}</span><div class="card-actions"><button class="card-action copy-action" data-id="${escapeHtml(item.id)}" type="button">复制文字</button><button class="card-action delete-action" data-id="${escapeHtml(item.id)}" type="button">删除</button></div></div>
    </article>`;
  };
  const renderLazySentinel = () => state.visibleCount < state.filteredCount
    ? `<div class="lazy-sentinel" id="lazySentinel" role="status"><span>⌄</span><p>继续向下 · 自动载入更多</p><small>${state.visibleCount} / ${state.filteredCount}</small></div>`
    : '';
  const normalizeRenderedVideos = (scope = feed) => scope.querySelectorAll('.prompt-video').forEach(normalizeVideoDuration);
  const render = () => {
    const items = getFilteredItems();
    $('#count').textContent = getWorkspaceItems().length;
    state.filteredCount = items.length;
    if (!items.length) { feed.innerHTML = ''; empty.hidden = false; return; }
    state.visibleCount = Math.min(items.length, Math.max(LAZY_BATCH_SIZE, state.visibleCount));
    const visibleItems = items.slice(0, state.visibleCount);
    empty.hidden = true;
    feed.innerHTML = `<div class="feed-grid" id="feedGrid">${visibleItems.map(renderCard).join('')}</div>${renderLazySentinel()}`;
    feed.scrollTop = 0;
    normalizeRenderedVideos();
  };
  const loadMoreItems = () => {
    if (state.lazyLoading || state.visibleCount >= state.filteredCount) return;
    const items = getFilteredItems();
    const start = state.visibleCount;
    const nextItems = items.slice(start, start + LAZY_BATCH_SIZE);
    if (!nextItems.length) return;
    const grid = $('#feedGrid');
    if (!grid) return;
    state.lazyLoading = true;
    $('#lazySentinel')?.remove();
    grid.insertAdjacentHTML('beforeend', nextItems.map((item, index) => renderCard(item, start + index)).join(''));
    state.visibleCount += nextItems.length;
    state.filteredCount = items.length;
    feed.insertAdjacentHTML('beforeend', renderLazySentinel());
    normalizeRenderedVideos(grid);
    state.lazyLoading = false;
  };
  const resetLazyFeed = () => {
    clearTimeout(state.lazyScrollTimer);
    state.lazyScrollTimer = 0;
    state.visibleCount = LAZY_BATCH_SIZE;
    state.filteredCount = 0;
    state.lazyLoading = false;
    render();
  };
  const switchWorkspaceMode = async (nextMode) => {
    if (!WORKSPACE_COPY[nextMode] || nextMode === state.workspaceMode || state.modeSwitching || state.isProcessing || state.isPublishing) return;
    state.modeSwitching = true;
    syncPublishButton();
    clearTimeout(state.draftTimer);
    await persistDraft(state.workspaceMode, snapshotDraft());
    clearMediaItems();
    form.reset();
    title.value = '';
    prompt.value = '';
    state.workspaceMode = nextMode;
    setModelMenu(false);
    $('#search').value = '';
    state.newestFirst = true;
    $('#sortButton').firstChild.textContent = '最新 ';
    setNote('');
    renderWorkspaceMode();
    renderModelPicker();
    updateCount();
    await restoreDraft(nextMode);
    resetLazyFeed();
    renderPasswordGate();
    state.modeSwitching = false;
    syncPublishButton();
  };
  const load = async () => {
    try { const response = await fetch('api.php?action=list', { cache: 'no-store' }); const data = await response.json(); if (!response.ok) throw new Error(data.error); state.items = data.items || []; state.canPublish = Boolean(data.canPublish); state.visibleCount = LAZY_BATCH_SIZE; renderPasswordGate(); render(); } catch (error) { feed.innerHTML = `<div class="loading-state"><p>暂时取不回备份，请刷新再试。</p></div>`; setNote(error.message, true); }
  };
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (state.isProcessing) return setNote(`素材仍在浏览器本地压缩，请等进度完成后再${state.workspaceMode === 'note' ? '保存' : '发布'}。`, true);
    if (!prompt.value.trim()) return setNote(state.workspaceMode === 'note' ? '先写下一点内容，再记下来。' : '先写下一段提示词，再发布。', true);
    state.isPublishing = true; syncPublishButton(); setNote('');
    const body = new FormData();
    body.append('collection', state.workspaceMode);
    body.append('title', title.value.trim());
    body.append('prompt', prompt.value.trim());
    body.append('type', state.workspaceMode === 'note' ? (state.mediaItems[0]?.kind || 'text') : state.type);
    body.append('model', state.workspaceMode === 'note' ? '' : state.selectedModels[state.type]);
    body.append('password', $('#publishPassword').value);
    state.mediaItems.forEach((item) => body.append('media[]', item.file, item.file.name));
    try {
      const response = await fetch('api.php?action=create', { method: 'POST', body }); const data = await response.json(); if (!response.ok) throw new Error(data.error || '保存失败');
      state.canPublish = true; state.items.unshift(data.item); state.visibleCount = LAZY_BATCH_SIZE; form.reset(); clearMediaItems(); await clearDraft(); updateCount(); $('#draftState').textContent = '自动保存草稿'; renderWorkspaceMode(); renderPasswordGate(); render(); showToast(state.workspaceMode === 'note' ? '记好了，就在右边' : '已发布，备份就在这里'); document.querySelector('.feed-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) { setNote(error.message === 'publish_password_required' ? '请输入正确的发布密码。' : error.message === 'publish_password_not_configured' ? '服务器尚未配置发布密码，请先完成运行环境设置。' : error.message === 'upload_too_large' ? '素材压缩后仍超过 1MB，请换一份更短或更小的素材。' : error.message === 'upload_failed' ? '素材上传失败，请换一份再试。' : '保存失败，请稍后再试。', true); }
    finally { state.isPublishing = false; syncPublishButton(); }
  });
  $('#clearButton').addEventListener('click', async () => { form.reset(); clearMediaItems(); await clearDraft(); updateCount(); $('#draftState').textContent = '自动保存草稿'; setNote(''); });
  $('#emptyCta').addEventListener('click', () => { title.focus(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  prompt.addEventListener('input', () => { updateCount(); saveDraft(); }); title.addEventListener('input', saveDraft);
  media.addEventListener('change', () => setFiles(media.files));
  $('#removeMedia').addEventListener('click', () => { clearMediaItems(); saveDraft(); setNote('已移除全部素材，文字草稿仍保留。'); });
  ['dragenter','dragover'].forEach((event) => dropzone.addEventListener(event, (e) => { e.preventDefault(); dropzone.classList.add('is-dragging'); }));
  ['dragleave','drop'].forEach((event) => dropzone.addEventListener(event, (e) => { e.preventDefault(); dropzone.classList.remove('is-dragging'); }));
  const globalDropOverlay = $('#globalDropOverlay');
  let globalDragDepth = 0;
  const resetGlobalDrop = () => {
    clearTimeout(state.dropReceiptTimer);
    state.dropReceiptTimer = null;
    globalDragDepth = 0;
    globalDropOverlay.classList.remove('is-visible', 'is-received');
  };
  const hasDraggedFiles = (event) => {
    const transfer = event.dataTransfer;
    if (!transfer) return false;
    if (transfer.files?.length) return true;
    const types = Array.from(transfer.types || [], (type) => String(type).toLowerCase());
    if (types.includes('files')) return true;
    return Array.from(transfer.items || []).some((item) => String(item.kind).toLowerCase() === 'file');
  };
  const getDraggedFiles = (transfer) => {
    const directFiles = Array.from(transfer?.files || []);
    if (directFiles.length) return directFiles;
    const files = [];
    for (const item of Array.from(transfer?.items || [])) {
      if (String(item.kind).toLowerCase() !== 'file') continue;
      const file = item.getAsFile?.();
      if (file) files.push(file);
    }
    return files;
  };
  const updateGlobalDropCopy = (event) => {
    const mime = event.dataTransfer?.items?.[0]?.type || '';
    const kind = mime.startsWith('video/') ? '视频' : mime.startsWith('image/') ? '图片' : '素材';
    $('#globalDropTitle').textContent = `松手，${kind}自动进入草稿`;
    $('#globalDropHint').textContent = `${kind === '素材' ? '图片或视频' : kind} · 自动识别 · 浏览器本地压缩`;
  };
  const showGlobalDropReceipt = (files) => {
    clearTimeout(state.dropReceiptTimer);
    globalDragDepth = 0;
    const firstFile = files[0];
    const kind = detectMediaKind(firstFile);
    const kindLabel = files.length > 1 ? `${files.length} 个素材` : kind === 'video' ? '视频' : kind === 'image' ? '图片' : '素材';
    $('#globalDropTitle').textContent = `已接收${kindLabel}`;
    $('#globalDropHint').textContent = files.length > 1 ? '正在逐个检查并保存到本机草稿' : `${firstFile.name || '未命名素材'} · ${firstFile.size > 1024 * 1024 ? '准备在浏览器本地压缩' : '无需压缩，正在生成预览'}`;
    globalDropOverlay.classList.add('is-visible', 'is-received');
    state.dropReceiptTimer = window.setTimeout(resetGlobalDrop, 900);
  };
  document.addEventListener('dragenter', (event) => {
    if (!hasDraggedFiles(event)) return;
    event.preventDefault();
    globalDragDepth += 1;
    updateGlobalDropCopy(event);
    globalDropOverlay.classList.add('is-visible');
  });
  document.addEventListener('dragover', (event) => {
    if (!hasDraggedFiles(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  });
  document.addEventListener('dragleave', (event) => {
    if (globalDragDepth === 0) return;
    if (!event.relatedTarget) { resetGlobalDrop(); return; }
    globalDragDepth = Math.max(0, globalDragDepth - 1);
    if (globalDragDepth === 0) globalDropOverlay.classList.remove('is-visible');
  });
  document.addEventListener('drop', (event) => {
    if (!hasDraggedFiles(event)) return;
    event.preventDefault();
    const files = getDraggedFiles(event.dataTransfer);
    if (!files.length) { resetGlobalDrop(); return; }
    showGlobalDropReceipt(files);
    importDroppedFiles(files);
  });
  document.addEventListener('dragend', resetGlobalDrop);
  window.addEventListener('blur', resetGlobalDrop);
  $('#workspaceSwitch').addEventListener('click', (event) => {
    const button = event.target.closest('.workspace-switch-button');
    if (button) switchWorkspaceMode(button.dataset.workspace);
  });
  $('#typeTabs').addEventListener('click', (event) => {
    if (state.workspaceMode !== 'prompt') return;
    const tab = event.target.closest('.type-tab'); if (!tab || !MODELS[tab.dataset.type]) return;
    state.type = tab.dataset.type; setModelMenu(false); renderModelPicker(); saveDraft();
  });
  $('#modelTrigger').addEventListener('click', () => setModelMenu($('#modelTrigger').getAttribute('aria-expanded') !== 'true'));
  $('#modelPicker').addEventListener('click', (event) => {
    const option = event.target.closest('.model-option'); if (!option) return;
    if (!MODELS[state.type].some((model) => model.name === option.dataset.model)) return;
    state.selectedModels[state.type] = option.dataset.model; setModelMenu(false); renderModelPicker(); saveDraft();
  });
  document.addEventListener('pointerdown', (event) => { if (!event.target.closest('.model-select-shell')) setModelMenu(false); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { setModelMenu(false); closeMedia(); return; }
    if ($('#mediaModal').hidden || state.modalMediaItems.length < 2) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); setModalMediaIndex(state.modalMediaIndex - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); setModalMediaIndex(state.modalMediaIndex + 1); }
  });
  $('#search').addEventListener('input', resetLazyFeed);
  $('#sortButton').addEventListener('click', () => { state.newestFirst = !state.newestFirst; $('#sortButton').firstChild.textContent = state.newestFirst ? '最新 ' : '最早 '; resetLazyFeed(); });
  feed.addEventListener('scroll', () => {
    if (state.lazyScrollTimer) return;
    state.lazyScrollTimer = window.setTimeout(() => {
      state.lazyScrollTimer = 0;
      if (feed.scrollTop <= 0) return;
      if (feed.scrollTop + feed.clientHeight >= feed.scrollHeight - 72) loadMoreItems();
    }, 40);
  }, { passive: true });
  feed.addEventListener('click', async (event) => {
    const mediaButton = event.target.closest('.prompt-media-button');
    if (mediaButton) { openMedia(mediaButton); return; }
    const button = event.target.closest('.card-action'); if (!button) return; const item = state.items.find((entry) => entry.id === button.dataset.id); if (!item) return;
    const itemIsNote = getItemWorkspace(item) === 'note';
    if (button.classList.contains('copy-action')) { await navigator.clipboard.writeText(item.prompt); showToast(itemIsNote ? '随手记已复制' : '提示词已复制'); return; }
    if (!window.confirm(itemIsNote ? '确定删除这条随手记吗？' : '确定删除这条备份吗？')) return;
    const response = await fetch('api.php?action=delete', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: item.id, password: $('#publishPassword').value }) });
    if (response.ok) { state.canPublish = true; state.items = state.items.filter((entry) => entry.id !== item.id); renderPasswordGate(); render(); showToast('已删除'); } else if (response.status === 401) setNote('请输入正确的发布密码后再删除。', true); else if (response.status === 503) setNote('服务器尚未配置发布密码，请先完成运行环境设置。', true); else showToast('删除失败，请再试一次');
  });
  $('#mediaModalClose').addEventListener('click', closeMedia);
  $('#mediaModal').addEventListener('pointerdown', (event) => { if (event.target === event.currentTarget) closeMedia(); });
  $('#mediaModalPrev').addEventListener('click', () => setModalMediaIndex(state.modalMediaIndex - 1));
  $('#mediaModalNext').addEventListener('click', () => setModalMediaIndex(state.modalMediaIndex + 1));
  $('#mediaFilmstrip').addEventListener('click', (event) => {
    const button = event.target.closest('[data-media-index]');
    if (button) setModalMediaIndex(Number(button.dataset.mediaIndex));
  });
  $('#themeToggle').addEventListener('click', () => { document.documentElement.classList.toggle('dark'); localStorage.setItem('tishici-theme-v2', document.documentElement.classList.contains('dark') ? 'dark' : 'light'); });
  if (localStorage.getItem('tishici-theme-v2') !== 'light') document.documentElement.classList.add('dark');
  renderWorkspaceMode(); renderPasswordGate(); renderModelPicker(); restoreDraft(state.workspaceMode).then(load);
})();
