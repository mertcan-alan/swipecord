/**
 * Swipecord — Main Application Logic
 * Tinder-style swipe mechanics for Discord servers.
 */

(function () {
  'use strict';

  // ── State ──
  let api = null;
  let user = null;
  let guilds = [];
  let currentIdx = 0;
  let statsLeft = 0;
  let statsRight = 0;
  let history = []; // for undo
  let isDragging = false;
  let startX = 0, startY = 0;
  let currentX = 0, currentY = 0;
  let cardEl = null;

  const SWIPE_THRESHOLD = 100; // px to trigger swipe
  const ROTATION_FACTOR = 0.12; // rotation per px

  // ── DOM refs ──
  const $ = (sel) => document.querySelector(sel);
  const screenLogin = $('#screen-login');
  const screenMain = $('#screen-main');
  const tokenInput = $('#token-input');
  const toggleToken = $('#toggle-token');
  const btnLogin = $('#btn-login');
  const loadingOverlay = $('#loading-overlay');
  const loadingText = $('#loading-text');
  const userAvatar = $('#user-avatar');
  const userName = $('#user-name');
  const currentIndexEl = $('#current-index');
  const totalCountEl = $('#total-count');
  const statLeftEl = $('#stat-left');
  const statRightEl = $('#stat-right');
  const cardStack = $('#card-stack');
  const emptyState = $('#empty-state');
  const finalLeft = $('#final-left');
  const finalKept = $('#final-kept');
  const btnLeave = $('#btn-leave');
  const btnKeep = $('#btn-keep');
  const btnUndo = $('#btn-undo');
  const btnLogout = $('#btn-logout');
  const progressFill = $('#progress-fill');
  const actionButtons = $('#action-buttons');
  const toastContainer = $('#toast-container');
  
  const btnApply = $('#btn-apply');
  const confirmModal = $('#confirm-modal');
  const btnConfirmCancel = $('#btn-confirm-cancel');
  const btnConfirmOk = $('#btn-confirm-ok');
  const confirmDesc = $('#confirm-desc');

  const executionOverlay = $('#execution-overlay');
  const executionText = $('#execution-text');
  const executionProgress = $('#execution-progress');
  const executionStatus = $('#execution-status');
  const executionRing = $('#execution-ring');
  const btnExecutionDone = $('#btn-execution-done');

  // ── Window controls ──
  $('#btn-close')?.addEventListener('click', () => window.electronAPI?.close());
  $('#btn-minimize')?.addEventListener('click', () => window.electronAPI?.minimize());
  $('#btn-maximize')?.addEventListener('click', () => window.electronAPI?.maximize());

  // ── Token visibility toggle ──
  toggleToken.addEventListener('click', () => {
    const isPassword = tokenInput.type === 'password';
    tokenInput.type = isPassword ? 'text' : 'password';
    toggleToken.querySelector('.eye-open').style.display = isPassword ? 'none' : 'block';
    toggleToken.querySelector('.eye-closed').style.display = isPassword ? 'block' : 'none';
  });

  // ── Login ──
  btnLogin.addEventListener('click', handleLogin);
  tokenInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  async function handleLogin() {
    const token = tokenInput.value.trim();
    if (!token) {
      toast('Token boş olamaz', 'error');
      return;
    }

    setLoginLoading(true);

    try {
      api = new DiscordAPI(token);
      user = await api.getMe();

      // Set user info
      userAvatar.src = api.getUserAvatarURL(user);
      userName.textContent = user.global_name || user.username;

      // Load guilds
      showLoading('Sunucular yükleniyor...');
      guilds = await api.getGuildsWithCounts();

      // Sort: owned servers last (don't accidentally leave those)
      guilds.sort((a, b) => {
        if (a.owner && !b.owner) return 1;
        if (!a.owner && b.owner) return -1;
        return 0;
      });

      totalCountEl.textContent = guilds.length;
      currentIdx = 0;
      statsLeft = 0;
      statsRight = 0;
      history = [];

      // Switch screens
      screenLogin.classList.remove('active');
      screenMain.classList.add('active');

      hideLoading();
      renderCards();
      updateUI();
    } catch (err) {
      console.error('Login failed:', err);
      toast('Giriş başarısız — Token\'ı kontrol et', 'error');
      setLoginLoading(false);
    }
  }

  function setLoginLoading(loading) {
    btnLogin.disabled = loading;
    btnLogin.querySelector('.btn-text').style.display = loading ? 'none' : 'inline';
    btnLogin.querySelector('.btn-loader').style.display = loading ? 'inline-flex' : 'none';
  }

  // ── Loading overlay ──
  function showLoading(msg) {
    loadingText.textContent = msg;
    loadingOverlay.style.display = 'flex';
  }

  function hideLoading() {
    loadingOverlay.style.display = 'none';
  }

  // ── Toast ──
  function toast(msg, type = '') {
    const el = document.createElement('div');
    el.className = `toast${type ? ` toast-${type}` : ''}`;
    el.textContent = msg;
    toastContainer.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  // ── Card rendering ──
  function renderCards() {
    cardStack.innerHTML = '';

    if (currentIdx >= guilds.length) {
      showEmptyState();
      return;
    }

    // Render up to 3 cards (stack effect)
    const count = Math.min(3, guilds.length - currentIdx);
    for (let i = count - 1; i >= 0; i--) {
      const guild = guilds[currentIdx + i];
      const card = createCardElement(guild, i);
      cardStack.appendChild(card);
    }

    // Attach swipe to top card
    const topCard = cardStack.lastElementChild;
    if (topCard) {
      topCard.classList.add('card-enter');
      attachSwipeHandlers(topCard);
      cardEl = topCard;
    }
  }

  function createCardElement(guild, stackIndex) {
    const card = document.createElement('div');
    card.className = 'server-card';
    if (stackIndex === 1) card.classList.add('behind');
    if (stackIndex >= 2) card.classList.add('far-behind');

    const iconURL = api.getGuildIconURL(guild);
    const bannerURL = api.getGuildBannerURL(guild);
    const initials = api.getGuildInitials(guild.name);
    const isOwner = api.isOwner(guild);
    const memberCount = guild.approximate_member_count;
    const presenceCount = guild.approximate_presence_count;

    card.innerHTML = `
      <div class="card-banner">
        <div class="card-banner-bg"></div>
        ${bannerURL ? `<img class="card-banner-img" src="${bannerURL}" alt="" loading="lazy" />` : ''}
        <div class="card-banner-fade"></div>
        <div class="card-icon-wrap">
          ${iconURL
            ? `<img class="card-server-icon" src="${iconURL}" alt="" loading="lazy" />`
            : `<div class="card-icon-fallback">${initials}</div>`
          }
        </div>
        ${isOwner ? '<div class="card-owner-badge">Sahip</div>' : ''}
      </div>
      <div class="card-body">
        <div class="card-server-name">${escapeHTML(guild.name)}</div>
        ${guild.description ? `<div class="card-server-desc">${escapeHTML(guild.description)}</div>` : ''}
        <div class="card-meta">
          ${memberCount != null ? `
            <div class="meta-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              ${formatNumber(memberCount)}
            </div>` : ''}
          ${presenceCount != null ? `
            <div class="meta-tag">
              <span class="dot-online"></span>
              ${formatNumber(presenceCount)} online
            </div>` : ''}
          ${guild.features && guild.features.includes('VERIFIED') ? `
            <div class="meta-tag" style="color: var(--blurple);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Doğrulanmış
            </div>` : ''}
          ${guild.features && guild.features.includes('PARTNERED') ? `
            <div class="meta-tag" style="color: var(--blurple);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Partner
            </div>` : ''}
        </div>
      </div>
      <div class="card-stamp stamp-leave">LEAVE</div>
      <div class="card-stamp stamp-keep">KEEP</div>
    `;

    return card;
  }

  // ── Swipe mechanics ──
  function attachSwipeHandlers(card) {
    card.addEventListener('pointerdown', onPointerDown);
    card.addEventListener('pointermove', onPointerMove);
    card.addEventListener('pointerup', onPointerUp);
    card.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerDown(e) {
    if (e.button !== 0) return; // left click only
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    currentX = 0;
    currentY = 0;
    cardEl = e.currentTarget;
    cardEl.setPointerCapture(e.pointerId);
    cardEl.style.transition = 'none';
    cardEl.style.cursor = 'grabbing';
  }

  function onPointerMove(e) {
    if (!isDragging || !cardEl) return;
    currentX = e.clientX - startX;
    currentY = e.clientY - startY;

    const rotation = currentX * ROTATION_FACTOR;
    const opacity = Math.max(0, 1 - Math.abs(currentX) / 400);

    cardEl.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;

    // Show stamps
    const stampLeave = cardEl.querySelector('.stamp-leave');
    const stampKeep = cardEl.querySelector('.stamp-keep');

    if (currentX < -40) {
      stampLeave.classList.add('visible');
      stampKeep.classList.remove('visible');
    } else if (currentX > 40) {
      stampKeep.classList.add('visible');
      stampLeave.classList.remove('visible');
    } else {
      stampLeave.classList.remove('visible');
      stampKeep.classList.remove('visible');
    }
  }

  function onPointerUp(e) {
    if (!isDragging || !cardEl) return;
    isDragging = false;

    cardEl.style.cursor = 'grab';

    if (currentX < -SWIPE_THRESHOLD) {
      animateSwipeOut('left');
    } else if (currentX > SWIPE_THRESHOLD) {
      animateSwipeOut('right');
    } else {
      // Snap back
      cardEl.style.transition = `transform 0.45s var(--ease-bounce)`;
      cardEl.style.transform = 'translate(0, 0) rotate(0deg)';

      const stampLeave = cardEl.querySelector('.stamp-leave');
      const stampKeep = cardEl.querySelector('.stamp-keep');
      stampLeave?.classList.remove('visible');
      stampKeep?.classList.remove('visible');
    }

    currentX = 0;
    currentY = 0;
  }

  function animateSwipeOut(direction) {
    if (!cardEl) return;

    const flyX = direction === 'left' ? -window.innerWidth * 1.2 : window.innerWidth * 1.2;
    const flyRotation = direction === 'left' ? -30 : 30;

    cardEl.style.transition = 'transform 0.4s var(--ease-smooth), opacity 0.4s';
    cardEl.style.transform = `translate(${flyX}px, ${currentY}px) rotate(${flyRotation}deg)`;
    cardEl.style.opacity = '0';
    cardEl.style.pointerEvents = 'none';

    setTimeout(() => {
      if (direction === 'left') {
        performLeave();
      } else {
        performKeep();
      }
    }, 350);
  }

  // ── Actions ──
  async function performLeave() {
    const guild = guilds[currentIdx];
    if (!guild) return;

    if (guild.owner) {
      toast('Sahip olduğun sunucudan ayrılamazsın!', 'error');
      currentIdx++;
      statsRight++;
      updateUI();
      renderCards();
      return;
    }

    // Sıraya ekle
    history.push({ guild, action: 'left', index: currentIdx });
    statsLeft++;
    currentIdx++;
    toast(`${guild.name} — ayrılınacak`, 'success');

    updateUI();
    renderCards();
  }

  function performKeep() {
    const guild = guilds[currentIdx];
    if (!guild) return;

    history.push({ guild, action: 'kept', index: currentIdx });
    statsRight++;
    currentIdx++;

    updateUI();
    renderCards();
  }

  // ── Undo ──
  // Artık hem keep hem de leave işlemlerini geri alabiliriz
  function performUndo() {
    if (history.length === 0) return;

    const last = history.pop();

    if (last.action === 'kept') {
      statsRight--;
      currentIdx = last.index;
      toast(`Geri alındı: ${last.guild.name}`);
    } else {
      statsLeft--;
      currentIdx = last.index;
      toast(`Geri alındı: ${last.guild.name}`);
    }

    updateUI();
    renderCards();
  }

  // ── Button handlers ──
  btnLeave.addEventListener('click', () => {
    if (currentIdx >= guilds.length) return;
    // Animate out then perform
    if (cardEl) {
      currentY = 0;
      currentX = -SWIPE_THRESHOLD - 1;
      animateSwipeOut('left');
    }
  });

  btnKeep.addEventListener('click', () => {
    if (currentIdx >= guilds.length) return;
    if (cardEl) {
      currentY = 0;
      currentX = SWIPE_THRESHOLD + 1;
      animateSwipeOut('right');
    }
  });

  btnUndo.addEventListener('click', performUndo);

  btnLogout.addEventListener('click', () => {
    api = null;
    user = null;
    guilds = [];
    currentIdx = 0;
    statsLeft = 0;
    statsRight = 0;
    history = [];
    tokenInput.value = '';
    screenMain.classList.remove('active');
    screenLogin.classList.add('active');
  });

  // ── Keyboard shortcuts ──
  document.addEventListener('keydown', (e) => {
    if (!screenMain.classList.contains('active')) return;
    if (currentIdx >= guilds.length) return;

    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
      btnLeave.click();
    } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
      btnKeep.click();
    } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
      performUndo();
    }
  });

  // ── UI Updates ──
  function updateUI() {
    currentIndexEl.textContent = Math.min(currentIdx + 1, guilds.length);
    statLeftEl.textContent = statsLeft;
    statRightEl.textContent = statsRight;

    const pct = guilds.length > 0 ? (currentIdx / guilds.length) * 100 : 0;
    progressFill.style.width = `${pct}%`;

    btnUndo.disabled = history.length === 0;

    const finished = currentIdx >= guilds.length;
    btnLeave.disabled = finished;
    btnKeep.disabled = finished;
  }

  function showEmptyState() {
    cardStack.innerHTML = '';
    emptyState.style.display = 'flex';
    finalLeft.textContent = statsLeft;
    finalKept.textContent = statsRight;
    btnLeave.disabled = true;
    btnKeep.disabled = true;
  }

  // ── Execution Flow ──
  let leaveQueue = [];

  btnApply?.addEventListener('click', () => {
    leaveQueue = history.filter(h => h.action === 'left');
    
    if (leaveQueue.length === 0) {
      toast('Ayrılınacak sunucu yok.', 'success');
      return;
    }

    confirmDesc.textContent = `${leaveQueue.length} adet sunucudan kalıcı olarak ayrılacaksın. Onaylıyor musun?`;
    confirmModal.style.display = 'flex';
  });

  btnConfirmCancel?.addEventListener('click', () => {
    confirmModal.style.display = 'none';
  });

  btnConfirmOk?.addEventListener('click', async () => {
    confirmModal.style.display = 'none';
    
    executionOverlay.style.display = 'flex';
    executionRing.style.display = 'block';
    btnExecutionDone.style.display = 'none';
    executionProgress.style.width = '0%';
    
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < leaveQueue.length; i++) {
      const item = leaveQueue[i];
      executionText.textContent = `Ayrılıyor: ${item.guild.name}`;
      executionStatus.textContent = `${i + 1} / ${leaveQueue.length}`;
      executionProgress.style.width = `${((i) / leaveQueue.length) * 100}%`;

      try {
        await api.leaveGuild(item.guild.id);
        successCount++;
        await new Promise(r => setTimeout(r, 2500)); // Rate limit koruması artırıldı
      } catch (err) {
        console.error(`Ayrılma başarısız (${item.guild.name}):`, err);
        toast(`Hata: ${err.message}`, 'error');
        failCount++;
      }
      
      executionProgress.style.width = `${((i + 1) / leaveQueue.length) * 100}%`;
    }

    executionRing.style.display = 'none';
    executionText.textContent = `İşlem Tamamlandı`;
    executionStatus.textContent = `Başarılı: ${successCount} | Hatalı: ${failCount}`;
    btnExecutionDone.style.display = 'block';
  });

  btnExecutionDone?.addEventListener('click', () => {
    executionOverlay.style.display = 'none';
    btnLogout.click(); // İşlem bitince girişe dön
  });

  // ── Utilities ──
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

})();
