/* ═══════════════════════════════════════════
   AARISHA — Main JavaScript (v3 "Heritage Gold & Forest")
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const API_BASE_URL = ['127.0.0.1', 'localhost'].includes(location.hostname) ? 'http://127.0.0.1:8000' : `${location.origin}/api`;
  const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value));
  const priceNumber = value => typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.]/g, '')) || 0;
  document.addEventListener('error', event => {
    const image = event.target;
    if (image.tagName === 'IMG' && !image.src.endsWith('/placeholder.svg')) image.src = 'placeholder.svg';
  }, true);

  // ── Brand Contact Synchronization (Pulls BRAND_WHATSAPP_NUMBER from backend .env) ──
  async function syncBrandContact() {
    try {
      const response = await fetch(`${API_BASE_URL}/brand/contact`);
      if (!response.ok) return;
      const data = await response.json();
      const rawNumber = data.whatsapp_number || '';
      const digits = data.digits || rawNumber.replace(/\D/g, '');
      const waUrl = data.whatsapp_url || `https://wa.me/${digits}`;
      const telUrl = data.tel_url || `tel:+${digits}`;

      let formattedNumber = rawNumber;
      if (digits.length === 12 && digits.startsWith('91')) {
        formattedNumber = `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
      } else if (digits.length === 10) {
        formattedNumber = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
      } else if (rawNumber && !rawNumber.startsWith('+')) {
        formattedNumber = `+${rawNumber}`;
      }

      document.querySelectorAll('[data-brand-phone]').forEach(el => {
        el.textContent = formattedNumber;
      });
      document.querySelectorAll('[data-brand-whatsapp-link]').forEach(el => {
        el.href = waUrl;
      });
      document.querySelectorAll('[data-brand-tel-link]').forEach(el => {
        el.href = telUrl;
      });
    } catch (_) {
      // Fallback silently if offline or API unreachable
    }
  }
  syncBrandContact();

  // ── Sticky Navigation ──
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  });

  // ── Scroll lock — keep the page from scrolling under any open overlay ──
  function updateScrollLock() {
    const anyOpen =
      document.getElementById('mobileMenu').classList.contains('open') ||
      document.getElementById('collectionModal').classList.contains('open') ||
      document.getElementById('cartDrawer').classList.contains('open') ||
      (document.getElementById('orderModal') && document.getElementById('orderModal').classList.contains('open')) ||
      (document.getElementById('searchOverlay') && document.getElementById('searchOverlay').classList.contains('open'));
    document.body.style.overflow = anyOpen ? 'hidden' : '';
  }

  // ── Focus trap — cycle Tab/Shift+Tab inside an open overlay (UISKILL.md §9.2) ──
  function trapFocus(container, event) {
    if (event.key !== 'Tab') return;
    const focusables = container.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  // ── Mobile navigation menu (hamburger → full-screen overlay) ──
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuClose = document.getElementById('menuClose');

  function setMenuOpen(open) {
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    mobileMenu.inert = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    updateScrollLock();
    if (open) menuClose.focus();
    else menuToggle.focus();
  }

  menuToggle.addEventListener('click', () => setMenuOpen(!mobileMenu.classList.contains('open')));
  menuClose.addEventListener('click', () => setMenuOpen(false));
  mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuOpen(false)));

  // ═══════════════════════════════════════════
  // RANI KI VAV HERITAGE BACKDROP (DESIGN.md §Motif)
  // One fixed full-screen monument line-art layer with a cursor-reactive line glow
  // (pointer devices) or ambient pulse (touch/keyboard). Purely decorative:
  // aria-hidden + pointer-events:none in the markup/CSS; nothing here blocks input.
  // ═══════════════════════════════════════════
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const glowLayers = document.querySelectorAll('.heritage-bg[data-glow]');

  if (glowLayers.length) {
    // Cursor line-glow — a masked copy of the artwork brightens within ~240px of
    // the pointer. The glow copy carries a drop-shadow filter so the LINES
    // themselves emit light (not a radial light source). Position updates are
    // rAF-batched; the glow fades via CSS opacity. The layer is fixed full-screen,
    // so listeners live on document, not per-section.
    glowLayers.forEach(layer => {
      let rafId = null;
      const onMove = event => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          rafId = null;
          const rect = layer.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          layer.style.setProperty('--glow-x', `${x.toFixed(2)}%`);
          layer.style.setProperty('--glow-y', `${y.toFixed(2)}%`);
          layer.classList.add('glowing');
        });
      };
      const onLeave = () => layer.classList.remove('glowing');

      // Use unified PointerEvents for mouse, touch, and stylus
      document.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', onLeave);
      document.addEventListener('pointerup', onLeave);
      document.addEventListener('pointercancel', onLeave);
    });

    // Touch devices or hybrid devices with touch interface get the ambient pulse by default
    const isTouchFriendly = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchFriendly && !reduceMotion) {
      glowLayers.forEach(layer => layer.classList.add('pulse'));
    }

    // Keyboard users get the ambient pulse once they start tabbing
    document.addEventListener('keydown', event => {
      if (event.key === 'Tab' && !reduceMotion && !glowLayers[0].classList.contains('pulse')) {
        glowLayers.forEach(layer => layer.classList.add('pulse'));
      }
    });
  }

  // ── Intersection Observer — Reveal Animations ──
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const parent = entry.target.parentElement;
        const siblings = parent ? Array.from(parent.children).filter(c =>
          c.classList.contains('reveal') || c.classList.contains('reveal-left') || c.classList.contains('reveal-right')
        ) : [];
        const index = siblings.indexOf(entry.target);
        const delay = index >= 0 ? index * 150 : 0;

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  if (window.innerWidth <= 768) {
    revealElements.forEach(el => el.classList.add('visible'));
  } else {
    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ── Generate Featured Product Cards ──
  const featuredScroll = document.getElementById('featuredScroll');
  if (featuredScroll) {
    fetch(`${API_BASE_URL}/products`)
      .then(response => response.ok ? response.json() : [])
      .then(products => products.forEach((product, index) => {
      const card = document.createElement('div');
      card.className = 'product-card reveal';
      card.style.animationDelay = `${index * 80}ms`;
      const outOfStock = product.in_stock === false;
      const hasDiscount = product.original_price && Number(product.price) < Number(product.original_price);
      const priceHTML = hasDiscount
        ? `<span class="original-price">${money(product.original_price)}</span>${money(product.price)}`
        : money(product.price);
      card.innerHTML = `
        <div class="product-card-img"><img src="${product.image_url}" alt="${product.name}"></div>
        <div class="product-card-info">
          <h4>${product.name}</h4>
          <span class="price">${priceHTML}</span>
        </div>
        <div class="card-actions">
          <button type="button" class="add-to-cart" ${outOfStock ? 'disabled' : ''}>${outOfStock ? 'Out of Stock' : 'Add to Cart'}</button>
          <button type="button" class="order-whatsapp" ${outOfStock ? 'disabled' : ''}>Order on WhatsApp</button>
        </div>`;
      featuredScroll.appendChild(card);
      card.querySelector('.add-to-cart').addEventListener('click', (e) => addToCart(product, e.currentTarget, e));
      card.querySelector('.order-whatsapp').addEventListener('click', (e) => orderOnWhatsApp(product, e.currentTarget));
      if (window.innerWidth <= 768) {
        card.classList.add('visible');
      } else {
        revealObserver.observe(card);
      }
    }))
      .catch((err) => {
        console.error('Error loading featured products:', err);
      });

    // Drag-to-scroll
    let isDown = false, startX, scrollLeft;
    featuredScroll.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - featuredScroll.offsetLeft;
      scrollLeft = featuredScroll.scrollLeft;
    });
    featuredScroll.addEventListener('mouseleave', () => isDown = false);
    featuredScroll.addEventListener('mouseup', () => isDown = false);
    featuredScroll.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - featuredScroll.offsetLeft;
      featuredScroll.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });

    // Keyboard: arrow keys scroll the horizontal strip (RULES.md §4.2 — no
    // interaction may depend on mouse-only gestures)
    featuredScroll.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      featuredScroll.scrollBy({ left: event.key === 'ArrowRight' ? 280 : -280, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  // ── Collection Detail Modal ──
  const collectionModal = document.getElementById('collectionModal');
  const modalBackBtn = document.getElementById('modalBackBtn');
  const modalTitle = document.getElementById('modalCategoryTitle');
  const modalTopbarTitle = document.getElementById('modalTopbarTitle');
  const modalGrid = document.getElementById('modalProductGrid');
  // Progressive disclosure: the compact top-bar label takes over once the large
  // heading has scrolled under the pinned top bar (see .modal-topbar-title).
  let modalTitleThreshold = 200;
  collectionModal.addEventListener('scroll', () => {
    collectionModal.classList.toggle('has-scrolled', collectionModal.scrollTop >= modalTitleThreshold);
  }, { passive: true });
  const CART_STORAGE_KEY = 'aarisha-cart-v1';
  const apiCategories = { Earrings: 'earrings', Rings: 'rings', Bracelets: 'bracelets', NeckPieces: 'necklaces' };
  let cart = JSON.parse(sessionStorage.getItem(CART_STORAGE_KEY) || '[]');

  const productKey = product => String(product.id || product.src || product.name);
  let lastFocusedCart = null;
  let lastFocusedModal = null;

  function saveCart() {
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    renderCart();
  }

  let toastTimer = null;
  function showToast(productName) {
    const toast = document.getElementById('cartToast');
    const messageEl = document.getElementById('cartToastMsg');
    if (!toast || !messageEl) return;
    messageEl.textContent = productName;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  // ── Vivid Add-to-Cart Motion & Spatial Feedback (UISKILL.md §6.2, §6.3) ──
  function triggerAddToCartAnimation(button, clickEvent) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Button Tactile Feedback & Ripple
    if (button) {
      if (!prefersReducedMotion) {
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'add-to-cart-ripple';
        const x = clickEvent && clickEvent.clientX ? (clickEvent.clientX - rect.left) : (rect.width / 2);
        const y = clickEvent && clickEvent.clientY ? (clickEvent.clientY - rect.top) : (rect.height / 2);
        const size = Math.max(rect.width, rect.height) * 2.2;
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      }

      // Button confirmation state: "Added ✓" with gold shimmer
      if (!button.dataset.originalText) {
        button.dataset.originalText = button.textContent;
      }
      button.classList.add('is-added');
      button.textContent = 'Added ✓';
      setTimeout(() => {
        button.classList.remove('is-added');
        button.textContent = button.dataset.originalText || 'Add to Cart';
        delete button.dataset.originalText;
      }, 1200);
    }

    const cartToggle = document.getElementById('cartToggle');
    const cartBadge = document.getElementById('cartCount');

    // Generate 12 radial golden lines encircling the cart icon (architectural Rani ki Vav burst)
    function createRadialRaysSVG() {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'cart-radial-rays animate');
      svg.setAttribute('viewBox', '0 0 72 72');
      svg.setAttribute('aria-hidden', 'true');
      const numRays = 12;
      const cx = 36, cy = 36, rInner = 20, rOuter = 34;
      for (let i = 0; i < numRays; i++) {
        const angle = (i * 2 * Math.PI) / numRays;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', (cx + rInner * Math.cos(angle)).toFixed(1));
        line.setAttribute('y1', (cy + rInner * Math.sin(angle)).toFixed(1));
        line.setAttribute('x2', (cx + rOuter * Math.cos(angle)).toFixed(1));
        line.setAttribute('y2', (cy + rOuter * Math.sin(angle)).toFixed(1));
        svg.appendChild(line);
      }
      return svg;
    }

    // Trigger cart badge bump, golden ring shockwave & radial rays
    function triggerCartBadgeFeedback() {
      if (cartBadge) {
        cartBadge.classList.remove('bump');
        void cartBadge.offsetWidth; // force reflow
        cartBadge.classList.add('bump');
        setTimeout(() => cartBadge.classList.remove('bump'), 500);
      }
      if (cartToggle) {
        cartToggle.classList.remove('ring-burst');
        void cartToggle.offsetWidth; // force reflow
        cartToggle.classList.add('ring-burst');
        setTimeout(() => cartToggle.classList.remove('ring-burst'), 650);

        // Encircling radial golden rays
        const existingRays = cartToggle.querySelectorAll('.cart-radial-rays');
        existingRays.forEach(r => r.remove());
        const rays = createRadialRaysSVG();
        cartToggle.appendChild(rays);
        setTimeout(() => rays.remove(), 700);
      }
    }

    // 2. Spatial Flying Product Image (Takes product image and glides to cart)
    if (cartToggle && !prefersReducedMotion) {
      // Find source image in product card or fallback to button
      const card = button ? button.closest('.product-card, .modal-product-card') : null;
      const sourceImg = card ? card.querySelector('img') : null;
      const imgSrc = sourceImg ? sourceImg.src : (product ? (product.image_url || product.src) : null);

      let startRect = null;
      if (sourceImg && sourceImg.getBoundingClientRect().width > 0) {
        startRect = sourceImg.getBoundingClientRect();
      } else if (button && button.getBoundingClientRect().width > 0) {
        startRect = button.getBoundingClientRect();
      }

      const cartRect = cartToggle.getBoundingClientRect();

      if (window.innerWidth > 768 && startRect && cartRect.width > 0 && imgSrc) {
        // Thumbnail starts matching source image aspect ratio or compact jewel plaque (max 80px)
        const initialWidth = Math.min(startRect.width, 88);
        const initialHeight = Math.min(startRect.height, 88);
        const startX = startRect.left + (startRect.width - initialWidth) / 2;
        const startY = startRect.top + (startRect.height - initialHeight) / 2;

        const flyingImg = document.createElement('img');
        flyingImg.className = 'cart-flying-img';
        flyingImg.src = imgSrc;
        flyingImg.alt = '';
        flyingImg.style.width = `${initialWidth}px`;
        flyingImg.style.height = `${initialHeight}px`;
        flyingImg.style.left = `${startX}px`;
        flyingImg.style.top = `${startY}px`;
        document.body.appendChild(flyingImg);

        const targetCenterX = cartRect.left + cartRect.width / 2;
        const targetCenterY = cartRect.top + cartRect.height / 2;
        const startCenterX = startX + initialWidth / 2;
        const startCenterY = startY + initialHeight / 2;

        const deltaX = targetCenterX - startCenterX;
        const deltaY = targetCenterY - startCenterY;

        // Animate along an elegant arc to the cart center
        const duration = 750;
        const animation = flyingImg.animate([
          {
            transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)',
            opacity: 1
          },
          {
            offset: 0.35,
            transform: `translate3d(${deltaX * 0.35}px, ${deltaY * 0.15 - 70}px, 0) scale(0.85) rotate(-6deg)`,
            opacity: 1
          },
          {
            offset: 0.75,
            transform: `translate3d(${deltaX * 0.8}px, ${deltaY * 0.8}px, 0) scale(0.42) rotate(10deg)`,
            opacity: 0.95
          },
          {
            transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.12) rotate(20deg)`,
            opacity: 0
          }
        ], {
          duration,
          easing: 'cubic-bezier(0.2, 0.85, 0.3, 1)',
          fill: 'forwards'
        });

        animation.onfinish = () => {
          flyingImg.remove();
          triggerCartBadgeFeedback();
        };

        return;
      }
    }

    // Fallback: immediate feedback if not animating flight
    triggerCartBadgeFeedback();
  }

  function addToCart(product, triggerButton, clickEvent) {
    const normalized = { id: productKey(product), serverProductId: product.id || null, name: product.name, price: priceNumber(product.price), src: product.image_url || product.src };
    const existing = cart.find(item => item.id === normalized.id);
    existing ? existing.quantity += 1 : cart.push({ ...normalized, quantity: 1 });
    saveCart();
    triggerAddToCartAnimation(triggerButton, clickEvent, product);
    showToast(normalized.name);
  }

  // ── Order on WhatsApp Details Modal ──
  const orderModal = document.getElementById('orderModal');
  const orderModalScrim = document.getElementById('orderModalScrim');
  const orderModalClose = document.getElementById('orderModalClose');
  const orderModalForm = document.getElementById('orderModalForm');
  const orderModalSummary = document.getElementById('orderModalSummary');
  const waCustomerName = document.getElementById('waCustomerName');
  const waCustomerPhone = document.getElementById('waCustomerPhone');
  const waNameError = document.getElementById('waNameError');
  const waPhoneError = document.getElementById('waPhoneError');
  const orderModalSubmit = document.getElementById('orderModalSubmit');

  let activeOrderContext = null;
  let lastFocusedOrder = null;

  function loadSavedCustomer() {
    try {
      const saved = localStorage.getItem('aarisha_customer_info');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  function saveCustomer(name, phone) {
    try {
      localStorage.setItem('aarisha_customer_info', JSON.stringify({ name, phone }));
    } catch {}
  }

  function openOrderModal(context, triggerEl) {
    activeOrderContext = context;
    lastFocusedOrder = triggerEl || document.activeElement;

    // Reset validation errors
    if (waCustomerName) waCustomerName.closest('.order-form-group')?.classList.remove('has-error');
    if (waCustomerPhone) waCustomerPhone.closest('.order-form-group')?.classList.remove('has-error');
    if (waNameError) waNameError.textContent = '';
    if (waPhoneError) waPhoneError.textContent = '';

    // Populate summary preview
    if (context.type === 'single') {
      const p = context.product;
      const imgSrc = p.image_url || p.src || 'placeholder.svg';
      const priceVal = typeof p.price === 'number' ? money(p.price) : p.price;
      const categoryLabel = p.category ? String(p.category).toUpperCase() : 'EXCLUSIVE PIECE';
      orderModalSummary.innerHTML = `
        <div class="order-preview-single">
          <img class="order-preview-img" src="${imgSrc}" alt="${p.name}">
          <div class="order-preview-details">
            <h4>${p.name}</h4>
            <p>${categoryLabel}</p>
          </div>
          <div class="order-preview-price">${priceVal}</div>
        </div>
      `;
    } else if (context.type === 'cart') {
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      orderModalSummary.innerHTML = `
        <div class="order-preview-cart">
          <div class="order-preview-cart-info">
            <div class="order-preview-cart-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18m-5 4a4 4 0 01-8 0"/></svg>
            </div>
            <div class="order-preview-cart-text">
              <h4>Your Cart Selection</h4>
              <p>${count} ${count === 1 ? 'item' : 'items'} ready to order</p>
            </div>
          </div>
          <div class="order-preview-price">${money(total)}</div>
        </div>
      `;
    }

    // Pre-fill from localStorage if available
    const saved = loadSavedCustomer();
    if (saved) {
      if (saved.name && !waCustomerName.value) waCustomerName.value = saved.name;
      if (saved.phone && !waCustomerPhone.value) waCustomerPhone.value = saved.phone;
    }

    orderModal.classList.add('open');
    orderModal.setAttribute('aria-hidden', 'false');
    orderModal.inert = false;
    updateScrollLock();

    // Focus first input or phone if name already filled
    setTimeout(() => {
      if (!waCustomerName.value) waCustomerName.focus();
      else if (!waCustomerPhone.value) waCustomerPhone.focus();
      else if (orderModalSubmit) orderModalSubmit.focus();
    }, 60);
  }

  function closeOrderModal() {
    orderModal.classList.remove('open');
    orderModal.setAttribute('aria-hidden', 'true');
    orderModal.inert = true;
    updateScrollLock();
    if (lastFocusedOrder) lastFocusedOrder.focus();
    activeOrderContext = null;
  }

  if (orderModalClose) orderModalClose.addEventListener('click', closeOrderModal);
  if (orderModalScrim) orderModalScrim.addEventListener('click', closeOrderModal);

  if (orderModalForm) {
    orderModalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!activeOrderContext) return;

      const nameVal = waCustomerName.value.trim();
      const rawPhoneVal = waCustomerPhone.value.trim();

      let hasError = false;

      // Validate name
      const nameGroup = waCustomerName.closest('.order-form-group');
      if (!nameVal || nameVal.length < 2) {
        if (nameGroup) nameGroup.classList.add('has-error');
        if (waNameError) waNameError.textContent = 'Please enter your name (at least 2 characters).';
        hasError = true;
      } else {
        if (nameGroup) nameGroup.classList.remove('has-error');
        if (waNameError) waNameError.textContent = '';
      }

      // Validate phone (at least 10 digits)
      const phoneDigits = rawPhoneVal.replace(/\D/g, '');
      const phoneGroup = waCustomerPhone.closest('.order-form-group');
      if (!rawPhoneVal || phoneDigits.length < 10) {
        if (phoneGroup) phoneGroup.classList.add('has-error');
        if (waPhoneError) waPhoneError.textContent = 'Please enter a valid 10-digit mobile number.';
        hasError = true;
      } else {
        if (phoneGroup) phoneGroup.classList.remove('has-error');
        if (waPhoneError) waPhoneError.textContent = '';
      }

      if (hasError) return;

      saveCustomer(nameVal, rawPhoneVal);

      let formattedPhone = rawPhoneVal;
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+91 ${phoneDigits.length === 10 ? phoneDigits : rawPhoneVal}`;
      }

      let itemsPayload = [];
      if (activeOrderContext.type === 'single') {
        const prod = activeOrderContext.product;
        const productId = prod.serverProductId || prod.id;
        if (!productId) return alert('Connect the catalogue API before ordering on WhatsApp.');
        itemsPayload = [{ product_id: productId, quantity: 1 }];
      } else if (activeOrderContext.type === 'cart') {
        if (!cart.length) return;
        if (cart.some(item => !item.serverProductId)) return alert('Connect the catalogue API before ordering on WhatsApp.');
        itemsPayload = cart.map(item => ({ product_id: item.serverProductId, quantity: item.quantity }));
      }

      orderModalSubmit.disabled = true;
      orderModalSubmit.classList.add('is-loading');

      try {
        const response = await fetch(`${API_BASE_URL}/orders/whatsapp-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: itemsPayload,
            customer_name: nameVal,
            customer_phone: formattedPhone
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Unable to create WhatsApp order link.');

        window.open(data.url, '_blank', 'noopener');

        if (activeOrderContext.type === 'cart') {
          cart = [];
          saveCart();
          setCartOpen(false);
        }

        closeOrderModal();
      } catch (error) {
        alert(error.message);
      } finally {
        orderModalSubmit.disabled = false;
        orderModalSubmit.classList.remove('is-loading');
      }
    });
  }

  // Order a single product on WhatsApp (prompts for Name & Mobile first)
  function orderOnWhatsApp(product, triggerEl) {
    const productId = product.serverProductId || product.id;
    if (!productId) return alert('Connect the catalogue API before ordering on WhatsApp.');
    openOrderModal({ type: 'single', product }, triggerEl);
  }

  function renderCart() {
    const items = document.getElementById('cartItems');
    const count = document.getElementById('cartCount');
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    count.textContent = itemCount;
    const cartLive = document.getElementById('cartLive');
    if (cartLive) cartLive.textContent = `${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your cart`;
    document.getElementById('cartTotal').textContent = money(total);
    items.innerHTML = cart.length ? cart.map(item => `<article class="cart-item"><img src="${item.src}" alt="${item.name}"><div><h3>${item.name}</h3><p>${money(item.price)}</p><div class="cart-quantity"><button type="button" data-cart-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button type="button" data-cart-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button></div></div><button class="cart-remove" type="button" data-cart-action="remove" data-id="${item.id}" aria-label="Remove ${item.name}">&times;</button></article>`).join('') : '<p class="cart-empty">Your cart is waiting for a little sparkle.</p>';
  }

  function setCartOpen(open) {
    const drawer = document.getElementById('cartDrawer');
    drawer.classList.toggle('open', open);
    document.getElementById('cartScrim').classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    drawer.inert = !open;
    updateScrollLock();
    if (open) {
      lastFocusedCart = document.activeElement;
      document.getElementById('cartClose').focus();
    } else if (lastFocusedCart) {
      lastFocusedCart.focus();
    }
  }

  document.getElementById('cartToggle').addEventListener('click', () => setCartOpen(true));
  document.getElementById('cartClose').addEventListener('click', () => setCartOpen(false));
  document.getElementById('cartScrim').addEventListener('click', () => setCartOpen(false));
  document.getElementById('cartItems').addEventListener('click', event => {
    const button = event.target.closest('[data-cart-action]');
    if (!button) return;
    const item = cart.find(entry => entry.id === button.dataset.id);
    if (!item) return;
    if (button.dataset.cartAction === 'increase') item.quantity += 1;
    if (button.dataset.cartAction === 'decrease') item.quantity -= 1;
    if (button.dataset.cartAction === 'remove' || item.quantity < 1) cart = cart.filter(entry => entry.id !== item.id);
    saveCart();
  });
  document.getElementById('whatsappOrder').addEventListener('click', (e) => {
    if (!cart.length) return;
    if (cart.some(item => !item.serverProductId)) return alert('Connect the catalogue API before ordering on WhatsApp.');
    openOrderModal({ type: 'cart' }, e.currentTarget);
  });
  renderCart();

  const displayNames = { Earrings: 'Earrings', Rings: 'Rings', Bracelets: 'Bracelets', NeckPieces: 'Neck Pieces' };

  async function openCollectionModal(category) {
    lastFocusedModal = document.activeElement;
    let products = [];
    const title = displayNames[category] || category;
    modalTitle.textContent = title;
    if (modalTopbarTitle) modalTopbarTitle.textContent = title;
    modalGrid.innerHTML = '';

    try {
      const response = await fetch(`${API_BASE_URL}/products/${apiCategories[category]}`);
      if (!response.ok) throw new Error('Unable to load products.');
      products = (await response.json()).map(product => {
        const hasDiscount = !!(product.original_price && Number(product.price) < Number(product.original_price));
        return {
          ...product,
          src: product.image_url,
          price: money(product.price),
          originalPriceFormatted: hasDiscount ? money(product.original_price) : null,
          hasDiscount
        };
      });
    } catch (err) {
      console.error('Error loading products for category', category, err);
    }

    if (products.length === 0) {
      modalGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--gold);font-family:var(--font-heading);font-size:20px;font-style:italic;padding:60px 0;">Coming Soon — Stay Tuned</p>';
    } else {
      products.forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'modal-product-card';
        card.style.animationDelay = `${i * 80}ms`;
        const priceHTML = p.hasDiscount
          ? `<span class="original-price">${p.originalPriceFormatted}</span>${p.price}`
          : p.price;
        card.innerHTML = `
          <div class="modal-product-card-img"><img src="${p.src}" alt="${p.name}"></div>
          <div class="modal-product-card-info">
            <h4>${p.name}</h4>
            <span class="price">${priceHTML}</span>
          </div>`;
        const actions = document.createElement('div');
        actions.className = 'card-actions';

        const addButton = document.createElement('button');
        addButton.className = 'add-to-cart';
        addButton.type = 'button';
        addButton.textContent = p.in_stock === false ? 'Out of Stock' : 'Add to Cart';
        addButton.disabled = p.in_stock === false;
        addButton.addEventListener('click', (e) => addToCart(p, e.currentTarget, e));
        actions.appendChild(addButton);

        const whatsappButton = document.createElement('button');
        whatsappButton.className = 'order-whatsapp';
        whatsappButton.type = 'button';
        whatsappButton.textContent = 'Order on WhatsApp';
        whatsappButton.disabled = p.in_stock === false;
        whatsappButton.addEventListener('click', (e) => orderOnWhatsApp(p, e.currentTarget));
        actions.appendChild(whatsappButton);

        card.appendChild(actions);
        modalGrid.appendChild(card);

      });
    }

    collectionModal.classList.add('open');
    collectionModal.inert = false;
    updateScrollLock();
    collectionModal.scrollTop = 0;
    collectionModal.classList.remove('has-scrolled');
    // offsetTop is transform-independent, so it stays stable while the modal
    // animates in; when the big heading reaches the top, the label takes over.
    modalTitleThreshold = Math.max(60, modalTitle.offsetTop);
    navbar.classList.add('modal-open');
    modalBackBtn.focus();
  }

  function closeCollectionModal() {
    collectionModal.classList.remove('open');
    collectionModal.inert = true;
    navbar.classList.remove('modal-open');
    updateScrollLock();
    if (lastFocusedModal) lastFocusedModal.focus();
  }

  // Attach click + keyboard activation to collection cards (Enter/Space)
  document.querySelectorAll('.collection-card[data-category]').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-category');
      openCollectionModal(cat);
    });
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openCollectionModal(card.getAttribute('data-category'));
      }
    });
  });

  modalBackBtn.addEventListener('click', closeCollectionModal);

  // Escape closes the topmost overlay; Tab is trapped inside open overlays
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const searchOvl = document.getElementById('searchOverlay');
      if (searchOvl && searchOvl.classList.contains('open') && typeof closeSearch === 'function') closeSearch();
      else if (orderModal && orderModal.classList.contains('open')) closeOrderModal();
      else if (mobileMenu.classList.contains('open')) setMenuOpen(false);
      else if (collectionModal.classList.contains('open')) closeCollectionModal();
      else if (document.getElementById('cartDrawer').classList.contains('open')) setCartOpen(false);
      return;
    }
    if (e.key === 'Tab') {
      const searchOvl = document.getElementById('searchOverlay');
      if (searchOvl && searchOvl.classList.contains('open')) trapFocus(searchOvl, e);
      else if (orderModal && orderModal.classList.contains('open')) trapFocus(orderModal, e);
      else if (collectionModal.classList.contains('open')) trapFocus(collectionModal, e);
      else if (document.getElementById('cartDrawer').classList.contains('open')) trapFocus(document.getElementById('cartDrawer'), e);
    }
  });

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      // Close whatever overlay is up first, so the navigation actually happens
      // visibly — the product modal, mobile menu, cart drawer, and order modal all lock the
      // page scroll, which would otherwise swallow the jump.
      if (orderModal && orderModal.classList.contains('open')) closeOrderModal();
      if (mobileMenu.classList.contains('open')) setMenuOpen(false);
      if (collectionModal.classList.contains('open')) closeCollectionModal();
      if (document.getElementById('cartDrawer').classList.contains('open')) setCartOpen(false);
      if (searchOverlay && searchOverlay.classList.contains('open')) closeSearch();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ═══════════════════════════════════════════
  // PRODUCT SEARCH WITH CACHING
  // Two-tier cache: in-memory Map + sessionStorage (5-min TTL).
  // Debounced live search across name, category, and description.
  // ═══════════════════════════════════════════

  const searchOverlay = document.getElementById('searchOverlay');
  const searchToggle = document.getElementById('searchToggle');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  const searchResults = document.getElementById('searchResults');
  const searchFilters = document.getElementById('searchFilters');

  if (searchOverlay && searchToggle) {
    const CACHE_KEY = 'aarisha_catalogue_cache';
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    let catalogueMemoryCache = null;
    let catalogueCacheTime = 0;
    const queryResultCache = new Map();
    let activeFilter = 'all';
    let searchDebounceTimer = null;
    let lastFocusedSearch = null;

    // Retrieve catalogue from cache or fetch from API
    async function getCatalogue() {
      const now = Date.now();

      // Tier 1: memory cache
      if (catalogueMemoryCache && (now - catalogueCacheTime) < CACHE_TTL) {
        return catalogueMemoryCache;
      }

      // Tier 2: sessionStorage
      try {
        const stored = sessionStorage.getItem(CACHE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.ts && (now - parsed.ts) < CACHE_TTL && Array.isArray(parsed.data)) {
            catalogueMemoryCache = parsed.data;
            catalogueCacheTime = parsed.ts;
            return catalogueMemoryCache;
          }
        }
      } catch (_) { /* corrupt storage — re-fetch */ }

      // Tier 3: network fetch
      try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) return catalogueMemoryCache || [];
        const products = await response.json();
        catalogueMemoryCache = products;
        catalogueCacheTime = now;
        queryResultCache.clear();
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: now, data: products }));
        } catch (_) { /* storage full — memory cache still works */ }
        return products;
      } catch (_) {
        return catalogueMemoryCache || [];
      }
    }

    function openSearch() {
      lastFocusedSearch = document.activeElement;
      searchOverlay.classList.add('open');
      searchOverlay.setAttribute('aria-hidden', 'false');
      searchOverlay.inert = false;
      updateScrollLock();
      setTimeout(() => searchInput.focus(), 60);
    }

    function closeSearch() {
      searchOverlay.classList.remove('open');
      searchOverlay.setAttribute('aria-hidden', 'true');
      searchOverlay.inert = true;
      updateScrollLock();
      if (lastFocusedSearch) lastFocusedSearch.focus();
    }

    searchToggle.addEventListener('click', openSearch);
    searchClose.addEventListener('click', closeSearch);

    // Clear button
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.hidden = true;
        performSearch();
        searchInput.focus();
      });
    }

    // Category filter pills
    if (searchFilters) {
      searchFilters.addEventListener('click', (e) => {
        const pill = e.target.closest('.search-filter-pill');
        if (!pill) return;
        searchFilters.querySelectorAll('.search-filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeFilter = pill.dataset.filter;
        performSearch();
      });
    }

    // Debounced search input
    searchInput.addEventListener('input', () => {
      if (searchClear) searchClear.hidden = !searchInput.value;
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(performSearch, 150);
    });

    async function performSearch() {
      const query = searchInput.value.trim().toLowerCase();

      if (!query) {
        searchResults.innerHTML = '<p class="search-prompt">Start typing to discover our curated collection\u2026</p>';
        return;
      }

      const cacheKey = `${query}|${activeFilter}`;
      if (queryResultCache.has(cacheKey)) {
        renderSearchResults(queryResultCache.get(cacheKey), query);
        return;
      }

      const products = await getCatalogue();
      const filtered = products.filter(p => {
        // Category filter
        if (activeFilter !== 'all' && p.category !== activeFilter) return false;
        // Text match across name, category, and description
        const text = `${p.name || ''} ${p.category || ''} ${p.description || ''}`.toLowerCase();
        return text.includes(query);
      });

      queryResultCache.set(cacheKey, filtered);
      renderSearchResults(filtered, query);
    }

    function renderSearchResults(products, query) {
      if (!products.length) {
        searchResults.innerHTML = `
          <div class="search-no-results">
            <h3>No pieces found</h3>
            <p>Try a different search term or browse our collections.</p>
          </div>`;
        return;
      }

      const countLabel = `<span class="search-count">${products.length} ${products.length === 1 ? 'piece' : 'pieces'} found</span>`;
      const cards = products.map(p => {
        const hasDiscount = p.original_price && Number(p.price) < Number(p.original_price);
        const priceHTML = hasDiscount
          ? `<span class="original-price">${money(p.original_price)}</span>${money(p.price)}`
          : money(p.price);
        const outOfStock = p.in_stock === false;
        const categoryLabel = p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : '';
        return `
          <div class="search-result-card" data-product-id="${p.id}">
            <img src="${p.image_url || 'placeholder.svg'}" alt="${p.name}" loading="lazy">
            <div class="search-result-info">
              ${categoryLabel ? `<span class="search-category-label">${categoryLabel}</span>` : ''}
              <h4>${p.name}</h4>
              <span class="price">${priceHTML}</span>
            </div>
            <div class="search-result-actions">
              <button type="button" class="add-to-cart" ${outOfStock ? 'disabled' : ''}>${outOfStock ? 'Sold Out' : 'Add to Cart'}</button>
              <button type="button" class="order-whatsapp" ${outOfStock ? 'disabled' : ''}>WhatsApp</button>
            </div>
          </div>`;
      }).join('');

      searchResults.innerHTML = `${countLabel}<div class="search-results-grid">${cards}</div>`;

      // Attach cart/order handlers to search result buttons
      searchResults.querySelectorAll('.search-result-card').forEach(card => {
        const productId = card.dataset.productId;
        const product = products.find(p => String(p.id) === productId);
        if (!product) return;

        const addBtn = card.querySelector('.add-to-cart');
        if (addBtn && !addBtn.disabled) {
          addBtn.addEventListener('click', (e) => addToCart(product, e.currentTarget, e));
        }

        const waBtn = card.querySelector('.order-whatsapp');
        if (waBtn && !waBtn.disabled) {
          waBtn.addEventListener('click', (e) => orderOnWhatsApp(product, e.currentTarget));
        }
      });
    }
  }

});

