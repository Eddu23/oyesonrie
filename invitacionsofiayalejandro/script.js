/* ==========================================================================
   SOFÍA & ALEJANDRO — script.js
   Countdown · GSAP scroll reveal · Parallax · Lightbox · Smooth scroll · RSVP
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
      opacity: 0,
      duration: .6,
      delay: .3,
      ease: 'power2.out',
      onComplete: () => { preloader.style.display = 'none'; playHeroIntro(); }
    });
  });
  // Fallback in case 'load' is slow to fire in preview environments
  setTimeout(() => {
    if (preloader && preloader.style.display !== 'none') {
      gsap.to(preloader, { opacity: 0, duration: .6, onComplete: () => { preloader.style.display = 'none'; playHeroIntro(); } });
    }
  }, 1800);

  /* ------------------------------------------------------------------
     HERO ENTRANCE ANIMATION
  ------------------------------------------------------------------ */
  function playHeroIntro(){
    const items = gsap.utils.toArray('.hero [data-delay]');
    items.sort((a,b) => (+a.dataset.delay) - (+b.dataset.delay));
    gsap.set(items, { opacity: 0, y: 36 });
    gsap.to(items, {
      opacity: 1, y: 0,
      duration: 1.1,
      ease: 'power3.out',
      stagger: .12
    });
    gsap.fromTo('.hero__scroll', { opacity:0 }, { opacity:1, duration: 1, delay: 1.1 });

    // Hero branch draws in
    const heroBranch = document.querySelector('.branch--hero');
    if (heroBranch) animateBranchDraw(heroBranch, 1.4);
  }

  /* ------------------------------------------------------------------
     SCROLL PROGRESS BAR
  ------------------------------------------------------------------ */
  const scrollBar = document.getElementById('scrollBar');
  function updateScrollBar(){
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    scrollBar.style.width = scrolled + '%';
  }
  document.addEventListener('scroll', updateScrollBar, { passive: true });
  updateScrollBar();

  /* ------------------------------------------------------------------
     NAV: scrolled state + mobile toggle + smooth scroll
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
      gsap.to(window, {
        duration: 1.1,
        ease: 'power3.inOut',
        scrollTo: { y: target, offsetY: 0 }
      });
    });
  });

  /* ------------------------------------------------------------------
     COUNTDOWN — target: Sept 19, 2026, 16:00 (America/Mexico_City, UTC-6)
  ------------------------------------------------------------------ */
  const WEDDING_DATE = new Date('2026-09-19T16:00:00-06:00');
  const elDays  = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMins  = document.getElementById('cd-mins');
  const elSecs  = document.getElementById('cd-secs');
  const pad = n => String(Math.max(0, n)).padStart(2, '0');

  function tickCountdown(){
    const now = new Date();
    let diff = WEDDING_DATE - now;
    if (diff < 0) diff = 0;

    const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins  = Math.floor((diff / (1000 * 60)) % 60);
    const secs  = Math.floor((diff / 1000) % 60);

    if (elDays.textContent !== pad(days))   elDays.textContent  = pad(days);
    if (elHours.textContent !== pad(hours)) elHours.textContent = pad(hours);
    if (elMins.textContent !== pad(mins))   elMins.textContent  = pad(mins);
    elSecs.textContent = pad(secs);
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ------------------------------------------------------------------
     SCROLL REVEAL (GSAP + ScrollTrigger) for all .reveal-up elements
  ------------------------------------------------------------------ */
  const revealEls = gsap.utils.toArray('.reveal-up');
  revealEls.forEach((el) => {
    if (el.closest('.hero')) return; // hero handled by its own intro timeline
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: .9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        },
        onStart: () => el.classList.add('is-revealed')
      }
    );
  });

  /* Stagger the itinerary cards & gallery items a touch more richly */
  gsap.utils.toArray('.itinerary__cards').forEach(grid => {
    gsap.from(grid.children, {
      opacity: 0, y: 50,
      duration: .9,
      stagger: .15,
      ease: 'power3.out',
      scrollTrigger: { trigger: grid, start: 'top 85%' }
    });
  });

  gsap.from('.masonry__item', {
    opacity: 0, y: 60, scale: .96,
    duration: .8,
    stagger: { each: .08, from: 'start' },
    ease: 'power3.out',
    scrollTrigger: { trigger: '.masonry', start: 'top 85%' }
  });

  /* Countdown numbers pop-in */
  gsap.from('.countdown__unit', {
    opacity: 0, y: 30,
    duration: .8, stagger: .12, ease: 'back.out(1.6)',
    scrollTrigger: { trigger: '.countdown__grid', start: 'top 85%' }
  });

  /* ------------------------------------------------------------------
     BUGAMBILIA BRANCH — draw-on-scroll (signature motif animation)
  ------------------------------------------------------------------ */
  function animateBranchDraw(svg, delay = 0){
    const stem = svg.querySelector('.branch-stem');
    const leaves = svg.querySelectorAll('.branch-leaves path');
    const flowers = svg.querySelectorAll('.branch-flowers ellipse');
    const centers = svg.querySelectorAll('.branch-flower-center');
    if (!stem) return;

    const tl = gsap.timeline({ delay });
    tl.to(stem, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' })
      .to(leaves, { opacity: .85, scale: 1, duration: .5, stagger: .1, ease: 'back.out(2)' }, '-=0.9')
      .to(flowers, { opacity: .95, scale: 1, duration: .5, stagger: .08, ease: 'back.out(2.2)' }, '-=0.6')
      .to(centers, { opacity: 1, duration: .3, stagger: .06 }, '-=0.3');
  }

  document.querySelectorAll('[data-branch]').forEach(svg => {
    if (svg.closest('.hero')) return; // already handled in playHeroIntro
    gsap.set(svg.querySelectorAll('.branch-leaves path, .branch-flowers ellipse'), { scale: .5 });
    ScrollTrigger.create({
      trigger: svg,
      start: 'top 80%',
      once: true,
      onEnter: () => animateBranchDraw(svg)
    });
  });

  /* ------------------------------------------------------------------
     PARALLAX — hero image + branch drift + countdown branch
  ------------------------------------------------------------------ */
  if (!REDUCE_MOTION) {
    gsap.to('.hero__img', {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.branch--hero', {
      yPercent: -30, xPercent: 6,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.branch--countdown', {
      rotate: 190,
      ease: 'none',
      scrollTrigger: { trigger: '.countdown', start: 'top bottom', end: 'bottom top', scrub: true }
    });
    gsap.to('.story__figure img', {
      yPercent: -8, scale: 1.08,
      ease: 'none',
      scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  /* ------------------------------------------------------------------
     ITINERARY CARD HOVER micro-interaction (tilt)
  ------------------------------------------------------------------ */
  document.querySelectorAll('.itinerary__card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (REDUCE_MOTION) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - .5;
      const y = (e.clientY - rect.top) / rect.height - .5;
      gsap.to(card, { rotateX: y * -6, rotateY: x * 6, duration: .4, ease: 'power2.out', transformPerspective: 700 });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: .6, ease: 'power3.out' });
    });
  });

  /* ------------------------------------------------------------------
     LIGHTBOX GALLERY
  ------------------------------------------------------------------ */
  const items = Array.from(document.querySelectorAll('.masonry__item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let currentIndex = 0;

  function openLightbox(index){
    currentIndex = index;
    const item = items[currentIndex];
    lightboxImg.src = item.dataset.full;
    lightboxImg.alt = item.querySelector('img')?.alt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox(){
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function showRelative(delta){
    currentIndex = (currentIndex + delta + items.length) % items.length;
    const item = items[currentIndex];
    gsap.fromTo(lightboxImg, { opacity: 0 }, { opacity: 1, duration: .35 });
    lightboxImg.src = item.dataset.full;
    lightboxImg.alt = item.querySelector('img')?.alt || '';
  }

  items.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
  });
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
     RSVP FORM VALIDATION
  ------------------------------------------------------------------ */
  const form = document.getElementById('rsvpForm');
  const successMsg = document.getElementById('rsvpSuccess');

  function setError(fieldId, message){
    const errorEl = document.getElementById('err-' + fieldId);
    const fieldWrap = errorEl ? errorEl.closest('.field') : null;
    if (errorEl) errorEl.textContent = message || '';
    if (fieldWrap) fieldWrap.classList.toggle('has-error', !!message);
  }

  function validateForm(data){
    let valid = true;

    if (!data.name || data.name.trim().length < 3) {
      setError('name', 'Escribe tu nombre completo.');
      valid = false;
    } else { setError('name', ''); }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailPattern.test(data.email)) {
      setError('email', 'Escribe un correo electrónico válido.');
      valid = false;
    } else { setError('email', ''); }

    if (data.guests === '') {
      setError('guests', 'Selecciona el número de acompañantes.');
      valid = false;
    } else { setError('guests', ''); }

    if (!data.attendance) {
      setError('attendance', 'Indica si podrás acompañarnos.');
      valid = false;
    } else { setError('attendance', ''); }

    return valid;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    successMsg.classList.remove('is-visible');

    const data = {
      name: form.name.value,
      email: form.email.value,
      guests: form.guests.value,
      attendance: form.querySelector('input[name="attendance"]:checked')?.value || '',
      message: form.message.value
    };

    const isValid = validateForm(data);

    if (!isValid) {
      const firstError = form.querySelector('.has-error input, .has-error select, .field--radio.has-error');
      if (firstError) {
        gsap.fromTo(firstError.closest('.field') || firstError, { x: -6 }, { x: 0, duration: .4, ease: 'elastic.out(1, .3)' });
        firstError.focus?.();
      }
      return;
    }

    // Simulated successful submission (no backend wired up in this template)
    const btn = form.querySelector('.btn--primary');
    gsap.to(btn, { scale: .96, duration: .12, yoyo: true, repeat: 1 });

    successMsg.classList.add('is-visible');
    form.reset();
  });

  /* Live-clear errors as the user types/selects */
  ['name', 'email', 'guests'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => setError(id, ''));
    el.addEventListener('change', () => setError(id, ''));
  });
  form.querySelectorAll('input[name="attendance"]').forEach(radio => {
    radio.addEventListener('change', () => setError('attendance', ''));
  });

  /* ------------------------------------------------------------------
     REFRESH ScrollTrigger after fonts/images load (layout shifts)
  ------------------------------------------------------------------ */
  window.addEventListener('load', () => ScrollTrigger.refresh());

});
