/* ═══════════════════════════════════════════════════════════
   LATANEGEO — Main Script
   GSAP 3 + ScrollTrigger + Lenis smooth scroll
═══════════════════════════════════════════════════════════ */

'use strict';

/* ── GSAP plugin registration ───────────────────────────── */
gsap.registerPlugin(ScrollTrigger);


/* ══════════════════════════════════════════════════════════
   LOADER
══════════════════════════════════════════════════════════ */
(function initLoader() {
    const loader   = document.getElementById('loader');
    const letters  = loader.querySelectorAll('.loader-letters span');
    const fill     = document.getElementById('loaderFill');
    const pctEl    = document.getElementById('loaderPct');
    const sub      = loader.querySelector('.loader-sub');

    document.body.classList.add('loading');

    const counter = { val: 0 };

    const tl = gsap.timeline({
        onComplete: exitLoader
    });

    // Count from 0 → 100
    tl.to(counter, {
        val: 100,
        duration: 2.2,
        ease: 'power2.inOut',
        onUpdate() {
            const v = Math.round(counter.val);
            pctEl.textContent = v;
            fill.style.width  = v + '%';
        }
    }, 0);

    // Letters stagger in
    tl.to(letters, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.055,
        ease: 'back.out(1.6)'
    }, 0.5);

    // Sub-tagline fades in
    tl.to(sub, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out'
    }, 1.4);

    // Set initial states
    gsap.set(letters, { opacity: 0, y: 28 });
    gsap.set(sub,     { opacity: 0, y: 12 });

    function exitLoader() {
        // Hold briefly so user can see 100%
        gsap.delayedCall(0.5, () => {
            // Curtain slides up
            gsap.to(loader, {
                yPercent: -102,
                duration: 1.1,
                ease: 'power3.inOut',
                onComplete() {
                    loader.remove();
                    document.body.classList.remove('loading');
                    startSite();
                }
            });

            // Site rises to meet it
            gsap.from('#site', {
                yPercent: 1.5,
                duration: 1.1,
                ease: 'power3.inOut',
                // clearProps removes the inline transform after completion;
                // without this, GSAP leaves transform:translateY(0) on #site,
                // creating a stacking context that traps position:fixed children
                // and causes the GSAP pin to position relative to #site instead of viewport.
                clearProps: 'transform',
            }, '<');
        });
    }
})();


/* ══════════════════════════════════════════════════════════
   LENIS SMOOTH SCROLL
══════════════════════════════════════════════════════════ */
let lenis;

function initLenis() {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
    });

    // Tell ScrollTrigger to use Lenis as its scroll source
    ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value) {
            if (arguments.length) {
                lenis.scrollTo(value, { immediate: true });
            }
            return lenis.scroll;
        },
        getBoundingClientRect() {
            return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        }
    });

    // Connect Lenis to GSAP ticker
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Smooth anchor clicks
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            lenis.scrollTo(target, {
                offset: -80,
                duration: 1.4,
                easing: (t) => 1 - Math.pow(1 - t, 4)
            });
        });
    });
}


/* ══════════════════════════════════════════════════════════
   HERO CANVAS — Structural grid animation
══════════════════════════════════════════════════════════ */
function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    const ctx  = canvas.getContext('2d');
    let nodes  = [];
    let animId = null;
    let W, H;

    const SPACING = 110;
    const DRIFT   = 18;   // max px nodes drift from grid

    function resize() {
        W = canvas.width  = document.documentElement.clientWidth;
        H = canvas.height = window.innerHeight;
        buildGrid();
    }

    function buildGrid() {
        nodes = [];
        const cols = Math.ceil(W / SPACING) + 1;
        const rows = Math.ceil(H / SPACING) + 1;

        for (let r = 0; r <= rows; r++) {
            for (let c = 0; c <= cols; c++) {
                nodes.push({
                    bx:    c * SPACING,
                    by:    r * SPACING,
                    x:     c * SPACING,
                    y:     r * SPACING,
                    ox:    (Math.random() - 0.5) * DRIFT * 2,
                    oy:    (Math.random() - 0.5) * DRIFT * 2,
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.18 + Math.random() * 0.18,
                    col:   c,
                    row:   r,
                });
            }
        }
    }

    const COLS_COUNT = () => Math.ceil(W / SPACING) + 1;

    function draw(t) {
        ctx.clearRect(0, 0, W, H);

        const cols = COLS_COUNT();

        // Update positions
        nodes.forEach(n => {
            n.x = n.bx + Math.sin(t * n.speed + n.phase)          * DRIFT * 0.7;
            n.y = n.by + Math.cos(t * n.speed + n.phase + 1.3)     * DRIFT * 0.7;
        });

        // Draw grid lines
        ctx.lineWidth = 0.7;

        nodes.forEach((n, i) => {
            // Right neighbor
            const right = nodes[i + 1];
            if (right && right.col === n.col + 1) {
                ctx.beginPath();
                ctx.moveTo(n.x, n.y);
                ctx.lineTo(right.x, right.y);
                ctx.strokeStyle = `rgba(129, 189, 211, 0.07)`;
                ctx.stroke();
            }
            // Bottom neighbor
            const below = nodes[i + cols];
            if (below) {
                ctx.beginPath();
                ctx.moveTo(n.x, n.y);
                ctx.lineTo(below.x, below.y);
                ctx.strokeStyle = `rgba(129, 189, 211, 0.07)`;
                ctx.stroke();
            }
        });

        // Draw node dots
        ctx.fillStyle = 'rgba(193, 127, 74, 0.22)';
        nodes.forEach(n => {
            ctx.beginPath();
            ctx.arc(n.x, n.y, 1.2, 0, Math.PI * 2);
            ctx.fill();
        });

        animId = requestAnimationFrame((ts) => draw(ts * 0.001));
    }

    resize();
    window.addEventListener('resize', resize);
    draw(0);

    // Pause when hero is not visible (perf)
    ScrollTrigger.create({
        trigger: '.hero',
        start: 'top bottom',
        end: 'bottom top',
        onLeave:  () => cancelAnimationFrame(animId),
        onEnter:  () => draw(0),
        onEnterBack: () => draw(0),
    });
}


/* ══════════════════════════════════════════════════════════
   HEADER SCROLL BEHAVIOR
══════════════════════════════════════════════════════════ */
function initHeader() {
    const header = document.getElementById('header');
    let isScrolled = false;

    ScrollTrigger.create({
        start: 'top -60',
        onUpdate(self) {
            const shouldScroll = self.scroll() > 60;
            if (shouldScroll !== isScrolled) {
                isScrolled = shouldScroll;
                header.classList.toggle('is-scrolled', isScrolled);
            }
        }
    });

    // Mobile nav toggle
    const toggle    = document.querySelector('.nav-toggle');
    const mobileNav = document.getElementById('mobileNav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', () => {
            const isOpen = toggle.classList.toggle('is-open');
            mobileNav.classList.toggle('is-open', isOpen);
            mobileNav.setAttribute('aria-hidden', String(!isOpen));
            toggle.setAttribute('aria-expanded', String(isOpen));
            // Lock/unlock scroll
            if (lenis) {
                isOpen ? lenis.stop() : lenis.start();
            }
        });

        // Close on link click
        mobileNav.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                toggle.classList.remove('is-open');
                mobileNav.classList.remove('is-open');
                mobileNav.setAttribute('aria-hidden', 'true');
                toggle.setAttribute('aria-expanded', 'false');
                if (lenis) lenis.start();
            });
        });
    }

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 55%',
            end: 'bottom 55%',
            onEnter()    { setActiveNav(section.id); },
            onEnterBack(){ setActiveNav(section.id); },
        });
    });

    function setActiveNav(id) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
    }
}


/* ══════════════════════════════════════════════════════════
   HERO ENTRANCE
══════════════════════════════════════════════════════════ */
function initHeroEntrance() {
    // 1. Wrap each .hero-word's text in an inner span for clip reveal
    document.querySelectorAll('.hero-word').forEach(word => {
        const text = word.textContent;
        word.innerHTML = `<span class="hero-word-inner">${text}</span>`;
    });

    // 2. Set initial states
    gsap.set('.hero-word-inner', { y: '108%' });

    // 3. Build timeline
    const tl = gsap.timeline({ delay: 0.15 });

    // Eyebrow
    tl.to('.hero-eyebrow', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, 0);

    // Heading word clips slide up
    tl.to('.hero-word-inner', {
        y: '0%',
        duration: 1.15,
        stagger: 0.12,
        ease: 'power4.out'
    }, 0.1);

    // Description
    tl.to('.hero-desc', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, 0.5);

    // CTA buttons
    tl.to('.hero-actions', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, 0.65);

    // Stats
    tl.to('.hero-stats', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, 0.75);

    // Scroll indicator
    tl.to('.hero-scroll-indicator', {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
    }, 1.1);
}


/* ══════════════════════════════════════════════════════════
   SECTION HEADING REVEALS
══════════════════════════════════════════════════════════ */
function initRevealHeaders() {
    document.querySelectorAll('.reveal-header').forEach(header => {
        const label    = header.querySelector('.section-label');
        const title    = header.querySelector('.section-title');
        const subtitle = header.querySelector('.section-subtitle');

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: header,
                start: 'top 78%',
                once: true,
            }
        });

        if (label) {
            tl.to(label, {
                opacity: 1, y: 0,
                duration: 0.6,
                ease: 'power3.out'
            }, 0);
        }

        if (title) {
            // Split title into lines
            const lines = title.innerHTML.split('<br>');
            if (lines.length > 1) {
                title.innerHTML = lines.map(l =>
                    `<span class="title-line-wrap"><span class="title-line-inner">${l}</span></span>`
                ).join('');

                gsap.set(title.querySelectorAll('.title-line-inner'), { y: '110%' });

                tl.to(title.querySelectorAll('.title-line-inner'), {
                    y: 0,
                    duration: 0.9,
                    stagger: 0.1,
                    ease: 'power4.out',
                    opacity: 1,
                }, 0.1);

                gsap.set(title, { opacity: 1 });
            } else {
                tl.to(title, {
                    opacity: 1, y: 0,
                    duration: 0.9,
                    ease: 'power4.out'
                }, 0.1);
            }
        }

        if (subtitle) {
            tl.to(subtitle, {
                opacity: 1, y: 0,
                duration: 0.7,
                ease: 'power3.out'
            }, 0.35);
        }
    });
}


/* ══════════════════════════════════════════════════════════
   BLOCK & CARD REVEALS
══════════════════════════════════════════════════════════ */
function initRevealElements() {
    // Generic blocks
    document.querySelectorAll('.reveal-block').forEach(el => {
        gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 80%',
                once: true,
            }
        });
    });

    // Cards with stagger — group by parent
    const parents = new Set();
    document.querySelectorAll('.reveal-card').forEach(card => {
        parents.add(card.parentElement);
    });

    parents.forEach(parent => {
        const cards = parent.querySelectorAll('.reveal-card');
        gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: parent,
                start: 'top 78%',
                once: true,
            }
        });
    });
}


/* ══════════════════════════════════════════════════════════
   HERO STATS COUNTER
══════════════════════════════════════════════════════════ */
function initStatsCounter() {
    const stats = document.querySelectorAll('.count');
    stats.forEach(stat => {
        const target = parseInt(stat.dataset.target, 10);
        const obj    = { val: 0 };

        ScrollTrigger.create({
            trigger: stat,
            start: 'top 85%',
            once: true,
            onEnter() {
                gsap.to(obj, {
                    val: target,
                    duration: 1.8,
                    ease: 'power2.out',
                    onUpdate() {
                        stat.textContent = Math.round(obj.val);
                    }
                });
            }
        });
    });
}


/* ══════════════════════════════════════════════════════════
   PROJECTS HORIZONTAL SCROLL
══════════════════════════════════════════════════════════ */
function initProjectsScroll() {
    const outer = document.querySelector('.projects-scroll-outer');
    const track = document.querySelector('.projects-track');
    if (!outer || !track) return;

    // Desktop only
    const mm = gsap.matchMedia();

    mm.add('(min-width: 769px)', () => {
        const getScrollAmt = () => {
            const raw = -(track.scrollWidth - outer.offsetWidth + parseFloat(getComputedStyle(outer).paddingLeft));
            return Math.min(raw, 0); // always negative or zero; guard against layout-not-ready edge case
        };

        gsap.to(track, {
            x: getScrollAmt,
            ease: 'none',
            scrollTrigger: {
                trigger: outer,
                start: 'top top',
                pin: true,
                pinSpacing: true,
                anticipatePin: 0,
                fastScrollEnd: true,
                scrub: 0.8,
                end: () => '+=' + Math.max(Math.abs(getScrollAmt()), 1),
                invalidateOnRefresh: true,
            }
        });

        // Refresh measurements on resize so pin math stays correct
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 300);
        });
    });
}


/* ══════════════════════════════════════════════════════════
   SECTION DIVIDER LINES
══════════════════════════════════════════════════════════ */
function initDividerLines() {
    // Use CSS class toggle only — no DOM insertion, no inline position override
    document.querySelectorAll('section:not(.hero)').forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 88%',
            once: true,
            onEnter() {
                section.classList.add('line-revealed');
            }
        });
    });
}


/* ══════════════════════════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════════════════════════ */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Handle select label float
    const serviceSelect = form.querySelector('#service');
    if (serviceSelect) {
        const field = serviceSelect.closest('.form-field');
        serviceSelect.addEventListener('change', () => {
            field.classList.toggle('has-value', serviceSelect.value !== '');
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Basic validation
        const required = form.querySelectorAll('[required]');
        let valid = true;

        required.forEach(field => {
            field.classList.remove('is-error');
            if (!field.value.trim()) {
                valid = false;
                field.classList.add('is-error');
            }
        });

        if (!valid) {
            // Shake animation
            gsap.fromTo(form.querySelector('.form-submit .btn-primary'), {
                x: -6
            }, {
                x: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
            return;
        }

        const btn = document.getElementById('submitBtn');
        const btnSpan = btn.querySelector('span');

        // Loading state
        btn.disabled = true;
        btnSpan.textContent = 'Enviando...';

        // Simulate async send
        setTimeout(() => {
            btnSpan.textContent = 'Mensagem enviada!';
            form.reset();
            form.querySelector('#service')
                ?.closest('.form-field')
                ?.classList.remove('has-value');

            gsap.from(btn, {
                scale: 0.96,
                duration: 0.4,
                ease: 'back.out(2)'
            });

            setTimeout(() => {
                btn.disabled   = false;
                btnSpan.textContent = 'Enviar Mensagem';
            }, 3500);
        }, 1200);
    });
}


/* ══════════════════════════════════════════════════════════
   MOBILE ACCORDION — Services section
══════════════════════════════════════════════════════════ */
function initMobileAccordion() {
    if (window.innerWidth > 768) return;
    document.querySelectorAll('[data-accordion="service"]').forEach(card => {
        const header = card.querySelector('.service-accordion-header');
        if (!header) return;
        header.addEventListener('click', () => {
            const isOpen = card.classList.contains('is-open');
            // Close all
            document.querySelectorAll('[data-accordion="service"]').forEach(c => c.classList.remove('is-open'));
            // Open clicked if it wasn't already open
            if (!isOpen) card.classList.add('is-open');
        });
    });
}


/* ══════════════════════════════════════════════════════════
   MAIN INIT — called after loader exits
══════════════════════════════════════════════════════════ */
function startSite() {
    // Init Lenis
    initLenis();

    // Init everything
    initHeroCanvas();
    initHeader();
    initHeroEntrance();
    initRevealHeaders();
    initRevealElements();
    initStatsCounter();
    initProjectsScroll();
    initDividerLines();
    initContactForm();
    initMobileAccordion();

    // Refresh ScrollTrigger after fonts + one full paint cycle (ensures correct height measurements)
    document.fonts.ready.then(() => {
        requestAnimationFrame(() => ScrollTrigger.refresh());
    });
}
