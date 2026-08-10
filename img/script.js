/* ==========================================================================
   OYE — script.js
   Reveal · Parallax · Filtro portafolio · Tabs de paquetes · Contador ·
   Lightbox · Formulario
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     PRELOADER
  ------------------------------------------------------------------ */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    gsap.to(preloader, {
      opacity: 0, duration: .6, delay: .25, ease: 'power2.out',
      onComplete: () => { preloader.style.display = 'none'; playHeroIntro(); }
    });
  });
  setTimeout(() => {
    if (preloader && preloader.style.display !== 'none') {
      gsap.to(preloader, { opacity: 0, duration: .6, onComplete: () => { preloader.style.display = 'none'; playHeroIntro(); } });
    }
  }, 1800);

  /* ------------------------------------------------------------------
     HERO ENTRANCE
  ------------------------------------------------------------------ */
  function playHeroIntro(){
    const items = gsap.utils.toArray('.hero [data-delay]');
    items.sort((a,b) => (+a.dataset.delay) - (+b.dataset.delay));
    gsap.set(items, { opacity: 0, y: 36 });
    gsap.to(items, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: .12 });
    gsap.fromTo('.hero__scroll', { opacity: 0 }, { opacity: 1, duration: 1, delay: 1.1 });

    const heroWave = document.querySelector('.wave--hero');
    if (heroWave) animateWaveDraw(heroWave, 1.3);
  }

  /* ------------------------------------------------------------------
     SCROLL PROGRESS
  ------------------------------------------------------------------ */
  const scrollBar = document.getElementById('scrollBar');
  function updateScrollBar(){
    const h = document.documentElement;
    scrollBar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  }
  document.addEventListener('scroll', updateScrollBar, { passive: true });
  updateScrollBar();

  /* ------------------------------------------------------------------
     NAV
  ------------------------------------------------------------------ */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  document.addEventListener('scroll', () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }, { passive: true });

  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', open);
  });

  document.querySelectorAll('[data-scroll]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      navLinks.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      gsap.to(window, { duration: 1.1, ease: 'power3.inOut', scrollTo: { y: target, offsetY: 0 } });
    });
  });

  /* ------------------------------------------------------------------
     SCROLL REVEAL — con IntersectionObserver en vez de ScrollTrigger.
     El navegador detecta la intersección en tiempo real; no depende de
     posiciones en píxeles calculadas de antemano, así que no se
     desincroniza cuando la página cambia de alto (imágenes, fuentes,
     filtros, pestañas). Esto es lo que evita que una sección se quede
     "atascada" invisible.

     Cada tipo de tarjeta tiene su propio "perfil" de entrada (más
     dramático en testimonios, con rebote en paquetes, con escala en
     el portafolio) pero SIEMPRE hay un único responsable por elemento
     — nunca dos animaciones compitiendo por la misma tarjeta, que fue
     la causa del bug anterior.
  ------------------------------------------------------------------ */
  function getRevealProfile(el){
    if (el.classList.contains('masonry__item')) {
      return {
        from: { opacity: 0, y: 46, scale: .94 },
        to:   { opacity: 1, y: 0, scale: 1, duration: .8, ease: 'power3.out' }
      };
    }
    if (el.classList.contains('package')) {
      return {
        from: { opacity: 0, y: 34, scale: .97 },
        to:   { opacity: 1, y: 0, scale: 1, duration: .7, ease: 'back.out(1.6)' }
      };
    }
    if (el.classList.contains('testimonial') || el.classList.contains('invite-card') || el.classList.contains('invite-row')) {
      return {
        from: { opacity: 0, y: 52 },
        to:   { opacity: 1, y: 0, duration: .95, ease: 'power3.out' }
      };
    }
    if (el.classList.contains('about__figure') || el.classList.contains('hero__figure')) {
      return {
        from: { opacity: 0, y: 30, scale: 1.04 },
        to:   { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out' }
      };
    }
    return {
      from: { opacity: 0, y: 36 },
      to:   { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }
    };
  }

  function revealNow(el, delay = 0){
    const profile = getRevealProfile(el);
    gsap.to(el, { ...profile.to, delay });
    el.classList.add('is-revealed');
  }

  // Selectores de contenedores en grupo: sus hijos .reveal-up se revelan
  // con un pequeño desfase entre ellos (efecto stagger) según su orden.
  const REVEAL_GROUP_SELECTOR = '.testimonials__grid, .invites__examples, .masonry, .packages__grid';

  function staggerDelayFor(el){
    const group = el.closest(REVEAL_GROUP_SELECTOR);
    if (!group) return 0;
    const siblings = Array.from(group.children).filter(c => c.classList.contains('reveal-up'));
    const idx = siblings.indexOf(el);
    return idx > 0 ? Math.min(idx, 8) * 0.09 : 0;
  }

  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      obs.unobserve(el);
      revealNow(el, staggerDelayFor(el));
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('.reveal-up').forEach(el => {
    if (el.closest('.hero')) return; // el hero se anima aparte, al cargar
    // Se fija el estado inicial explícitamente (incluye props como scale
    // que la clase CSS .reveal-up no cubre) antes de observar el elemento.
    gsap.set(el, getRevealProfile(el).from);
    revealObserver.observe(el);
  });


  /* ------------------------------------------------------------------
     ONDA "OYE" — se dibuja al entrar en pantalla (motivo de firma)
  ------------------------------------------------------------------ */
  function animateWaveDraw(svg, delay = 0){
    const path = svg.querySelector('path');
    if (!path) return;
    gsap.to(path, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut', delay });
  }

  const waveObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      animateWaveDraw(entry.target);
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('[data-wave]').forEach(svg => {
    if (svg.closest('.hero')) return; // la del hero se dibuja al cargar
    waveObserver.observe(svg);
  });

  /* ------------------------------------------------------------------
     PARALLAX
  ------------------------------------------------------------------ */
  if (!REDUCE_MOTION) {
    gsap.to('.hero__img', {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.about__figure img', {
      yPercent: -8, scale: 1.08, ease: 'none',
      scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  /* ------------------------------------------------------------------
     STAT COUNTER
  ------------------------------------------------------------------ */
  const statsContainer = document.querySelector('.about__stats');
  if (statsContainer) {
    const statObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        entry.target.querySelectorAll('.stat__value').forEach(el => {
          const target = +el.dataset.count;
          const counter = { val: 0 };
          gsap.to(counter, {
            val: target, duration: 1.6, ease: 'power2.out',
            onUpdate: () => { el.textContent = Math.round(counter.val); }
          });
        });
      });
    }, { threshold: 0.2 });
    statObserver.observe(statsContainer);
  }

  /* ------------------------------------------------------------------
     CARD HOVER TILT — paquetes e invitaciones
  ------------------------------------------------------------------ */
  document.querySelectorAll('.package, .invite-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (REDUCE_MOTION) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - .5;
      const y = (e.clientY - rect.top) / rect.height - .5;
      gsap.to(card, { rotateX: y * -4, rotateY: x * 4, duration: .4, ease: 'power2.out', transformPerspective: 800 });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: .6, ease: 'power3.out' });
    });
  });

  /* ------------------------------------------------------------------
     PORTFOLIO FILTER
  ------------------------------------------------------------------ */
  const filterButtons = document.querySelectorAll('.filter');
  const masonryItems = document.querySelectorAll('.masonry__item');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      masonryItems.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        if (match) {
          item.classList.remove('is-hidden');
          gsap.fromTo(item, { opacity: 0, scale: .92 }, { opacity: 1, scale: 1, duration: .5, ease: 'power3.out' });
        } else {
          gsap.to(item, {
            opacity: 0, scale: .92, duration: .3, ease: 'power2.in',
            onComplete: () => item.classList.add('is-hidden')
          });
        }
      });
    });
  });

  /* ------------------------------------------------------------------
     PACKAGE TABS — Bodas / XV años / Fiestas, como grupos independientes
  ------------------------------------------------------------------ */
  const ptabs = document.querySelectorAll('.ptab');

  ptabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('is-active')) return;
      ptabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      const category = tab.dataset.category;
      const nextGroup = document.querySelector(`.package-group[data-group="${category}"]`);
      const currentGroup = document.querySelector('.package-group.is-active');
      if (!nextGroup || currentGroup === nextGroup) return;

      const finishSwap = () => {
        if (currentGroup) currentGroup.classList.remove('is-active');
        nextGroup.classList.add('is-active');
        gsap.fromTo(nextGroup.querySelectorAll('.package'),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: .55, stagger: .1, ease: 'power3.out' }
        );
      };

      if (currentGroup) {
        gsap.to(currentGroup.querySelectorAll('.package'), {
          opacity: 0, y: -14, duration: .28, stagger: .05, ease: 'power2.in',
          onComplete: finishSwap
        });
      } else {
        finishSwap();
      }
    });
  });

  /* ------------------------------------------------------------------
     LIGHTBOX GALLERY (respeta el filtro activo)
  ------------------------------------------------------------------ */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let currentIndex = 0;

  function visibleItems(){
    return Array.from(masonryItems).filter(i => !i.classList.contains('is-hidden'));
  }

  function openLightbox(item){
    const items = visibleItems();
    currentIndex = items.indexOf(item);
    showItem(items[currentIndex]);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function showItem(item){
    lightboxImg.src = item.dataset.full;
    lightboxImg.alt = item.querySelector('img')?.alt || '';
  }
  function closeLightbox(){
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function showRelative(delta){
    const items = visibleItems();
    currentIndex = (currentIndex + delta + items.length) % items.length;
    gsap.fromTo(lightboxImg, { opacity: 0 }, { opacity: 1, duration: .35 });
    showItem(items[currentIndex]);
  }

  masonryItems.forEach(item => item.addEventListener('click', () => openLightbox(item)));
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => showRelative(-1));
  lightboxNext.addEventListener('click', () => showRelative(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showRelative(-1);
    if (e.key === 'ArrowRight') showRelative(1);
  });

  /* ------------------------------------------------------------------
     CONTACT FORM VALIDATION + ENVÍO REAL (Formspree)
  ------------------------------------------------------------------ */
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('contactSuccess');
  const FORM_ENDPOINT = 'https://formspree.io/f/mbgrgkjr';

  function setError(fieldId, message){
    const errorEl = document.getElementById('err-' + fieldId);
    const fieldWrap = errorEl ? errorEl.closest('.field') : null;
    if (errorEl) errorEl.textContent = message || '';
    if (fieldWrap) fieldWrap.classList.toggle('has-error', !!message);
  }

  function validateForm(data){
    let valid = true;

    if (!data.name || data.name.trim().length < 3) {
      setError('c-name', 'Escribe tu nombre completo.'); valid = false;
    } else { setError('c-name', ''); }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailPattern.test(data.email)) {
      setError('c-email', 'Escribe un correo electrónico válido.'); valid = false;
    } else { setError('c-email', ''); }

    const phonePattern = /^[\d\s()+-]{8,}$/;
    if (!data.phone || !phonePattern.test(data.phone)) {
      setError('c-phone', 'Escribe un teléfono válido.'); valid = false;
    } else { setError('c-phone', ''); }

    if (!data.type) {
      setError('c-type', 'Selecciona el tipo de evento.'); valid = false;
    } else { setError('c-type', ''); }

    return valid;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    successMsg.classList.remove('is-visible', 'is-error');

    const data = {
      name: document.getElementById('c-name').value,
      email: document.getElementById('c-email').value,
      phone: document.getElementById('c-phone').value,
      type: document.getElementById('c-type').value,
      date: document.getElementById('c-date').value,
      message: document.getElementById('c-message').value
    };

    const isValid = validateForm(data);

    if (!isValid) {
      const firstError = form.querySelector('.has-error input, .has-error select');
      if (firstError) {
        gsap.fromTo(firstError.closest('.field'), { x: -6 }, { x: 0, duration: .4, ease: 'elastic.out(1, .3)' });
        firstError.focus?.();
      }
      return;
    }

    const btn = form.querySelector('.btn--primary');
    const btnLabel = btn.querySelector('span');
    const originalLabel = btnLabel.textContent;
    btn.disabled = true;
    btn.style.opacity = '.7';
    btnLabel.textContent = 'Enviando...';

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });

      if (!response.ok) throw new Error('Formspree respondió con error');

      successMsg.textContent = 'Gracias — recibimos tu mensaje y te contactaremos pronto.';
      successMsg.classList.add('is-visible');
      form.reset();

    } catch (err) {
      successMsg.textContent = 'No se pudo enviar. Por favor escríbenos directo por WhatsApp o a fotografiaoye@gmail.com.';
      successMsg.classList.add('is-visible', 'is-error');
    } finally {
      btn.disabled = false;
      btn.style.opacity = '';
      btnLabel.textContent = originalLabel;
    }
  });

  ['c-name', 'c-email', 'c-phone', 'c-type'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => setError(id, ''));
    el.addEventListener('change', () => setError(id, ''));
  });

  /* ------------------------------------------------------------------
     WHATSAPP FLOTANTE — aparece con una pequeña animación tras la carga
  ------------------------------------------------------------------ */
  const whatsappFloat = document.getElementById('whatsappFloat');
  if (whatsappFloat) {
    setTimeout(() => {
      whatsappFloat.classList.add('is-visible');
      gsap.fromTo(whatsappFloat, { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .6, ease: 'back.out(1.8)' });
    }, 1200);
  }

  /* ------------------------------------------------------------------
     FOOTER YEAR
  ------------------------------------------------------------------ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     REFRESH ScrollTrigger after full load
  ------------------------------------------------------------------ */
  window.addEventListener('load', () => ScrollTrigger.refresh());

});
