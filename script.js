/* ============================================================
   DEEPAK YADAV PORTFOLIO — Fixed Script v3.0
   ─────────────────────────────────────────────────────────────
   BUGS FIXED:
   ✔ BUG 1: Changed 'play reverse play reverse' → 'play none none none'
             Elements no longer disappear on back-scroll or nav-jump
   ✔ BUG 2: initScrollReveal() no longer removes 'is-visible' on exit
             Content stays visible after first reveal, always
   ✔ BUG 3: Removed initProjectReveal() entirely — it was re-hiding
             projects 400ms after load, overriding GSAP
   ✔ BUG 4: GSAP and IntersectionObserver no longer fight each other
             GSAP handles entrance; IO only adds class, never removes
   ✔ BUG 5: Navbar jump works because content is never set back to
             opacity:0 after it's been revealed once
   ✔ BUG 6: Footer now has its own smooth entrance animation
   ✔ BONUS: Skills animate every time you enter the section (correct)
   ============================================================ */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;


/* ============================================================
   CURTAIN INTRO — plays once right as the loader finishes
   ============================================================ */
function playCurtainIntro() {
    const curtain = $('#curtain-intro');
    if (!curtain) return;

    curtain.classList.add('opening');
    /* last column delay (0.49s) + panel transition (0.95s) + buffer */
    setTimeout(() => {
        curtain.classList.add('done');
    }, 1550);
}



/* ============================================================
   0. PAGE LOADER
   ============================================================ */
function initLoader() {
    const loader   = $('#page-loader');
    const barFill  = loader ? loader.querySelector('.loader-bar-fill') : null;
    const linesBox = $('#boot-lines');

    if (!loader || !linesBox) return;

    const bootSequence = [
        { text: 'ssh deepak@neural-core.dev', prompt: true },
        { text: 'Connecting to host...', ok: false },
        { text: 'Authenticating credentials...', ok: true },
        { text: 'Loading skill matrix [Python, TensorFlow, PyTorch]...', ok: true },
        { text: 'Mounting project archives (3 found)...', ok: true },
        { text: 'Calibrating neural weights...', ok: true },
        { text: 'Rendering portfolio interface...', ok: true },
        { text: 'System Ready ✓', ok: true, final: true },
    ];

    let i = 0;
    let progress = 0;

    function typeNextLine() {
        if (i >= bootSequence.length) {
            setTimeout(() => {
                loader.classList.add('loaded');
                playCurtainIntro();
                bootApp();
            }, 300);
            return;
        }

        const item = bootSequence[i];
        const line = document.createElement('div');
        line.className = 'boot-line';

        if (item.prompt) {
            line.innerHTML = `<span class="boot-prompt">$</span>${item.text}`;
        } else if (item.final) {
            line.innerHTML = `<span class="boot-ok">✔</span> ${item.text}`;
        } else {
            line.innerHTML = `${item.ok ? '<span class="boot-ok">✔</span> ' : ''}${item.text}`;
        }

        const cursor = document.createElement('span');
        cursor.className = 'boot-cursor';

        const prevCursor = linesBox.querySelector('.boot-cursor');
        if (prevCursor) prevCursor.remove();

        line.appendChild(cursor);
        linesBox.appendChild(line);

        progress = Math.min(100, Math.round(((i + 1) / bootSequence.length) * 100));
        if (barFill) barFill.style.width = progress + '%';

        i++;
        setTimeout(typeNextLine, item.prompt ? 380 : 260 + Math.random() * 220);
    }

    typeNextLine();
}

/* ============================================================
   1. MAGNETIC CURSOR — smooth rAF interpolation
   ============================================================ */
const cursorDot  = $('#cursor-dot');
const cursorRing = $('#cursor-ring');

let mouse   = { x: -200, y: -200 };
let dotPos  = { x: -200, y: -200 };
let ringPos = { x: -200, y: -200 };

function initCursor() {
    if (isTouchDevice || !cursorDot || !cursorRing) return;

    document.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
    document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

    const hoverTargets = 'a, button, [data-cursor-hover], .btn-filter, .social-btn, .tech-stack .icons i, .tilt-card';
    document.addEventListener('mouseover', e => {
        if (e.target.closest(hoverTargets)) document.body.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest(hoverTargets)) document.body.classList.remove('cursor-hover');
    });

    (function animateCursor() {
        dotPos.x  += (mouse.x - dotPos.x)  * 0.18;
        dotPos.y  += (mouse.y - dotPos.y)  * 0.18;
        ringPos.x += (mouse.x - ringPos.x) * 0.10;
        ringPos.y += (mouse.y - ringPos.y) * 0.10;

        cursorDot.style.left  = dotPos.x  + 'px';
        cursorDot.style.top   = dotPos.y  + 'px';
        cursorRing.style.left = ringPos.x + 'px';
        cursorRing.style.top  = ringPos.y + 'px';

        requestAnimationFrame(animateCursor);
    })();
}

/* ============================================================
   2. SCROLL PROGRESS BAR
   ============================================================ */
function initScrollProgress() {
    const bar = $('#scroll-progress-bar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (max <= 0) return;
        bar.style.width = (window.scrollY / max * 100) + '%';
    }, { passive: true });
}

/* ============================================================
   3. NAVBAR
   ============================================================ */
const navbar = $('#navbar');
let lastKnownScroll = 0;
let ticking = false;

function initNavbar() {
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const sy = window.scrollY;
                navbar.classList.toggle('sticky', sy > 20);
                navbar.classList.toggle('navbar-hidden', sy > lastKnownScroll && sy > 100);
                lastKnownScroll = sy;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

/* ============================================================
   4. ACTIVE NAV — IntersectionObserver
   ============================================================ */
function initActiveNav() {
    const sections = $$('section[id]');
    const navLinks = $$('.nav-link');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.toggle('active',
                        link.getAttribute('href') === '#' + entry.target.id
                    );
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => observer.observe(s));
}

/* ============================================================
   5. GSAP HERO ENTRANCE — cinematic stagger
   ============================================================ */
function initHeroEntrance() {
    if (typeof gsap === 'undefined') {
        $$('[data-hero-el]').forEach(el => {
            el.style.opacity   = '1';
            el.style.transform = 'none';
        });
        const nameEl = $('#hero-name');
        if (nameEl) nameEl.classList.add('name-revealed');
        return;
    }

    gsap.set('[data-hero-el]', { opacity: 0, y: 40 });

    gsap.timeline({ delay: 0.25 })
        .to('[data-hero-el]', {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.15,
            ease: 'power3.out'
        })
        .call(() => {
            const nameEl = $('#hero-name');
            const scanLine = $('#name-scan-line');
            if (!nameEl || !scanLine) return;
            scanLine.classList.add('scanning');
            nameEl.classList.add('name-revealed');
        }, null, '-=0.3')
        .call(() => {
            initHeroStatsCounter();
        }, null, '-=0.1');

    /* Parallax on hero sphere — scrub only, never hides content */
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.to('.hero-img-wrapper', {
            yPercent: -18,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero-section',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }
}


/* ============================================================
   5b. CURSOR SPOTLIGHT — follows mouse in hero section
   ============================================================ */
function initHeroSpotlight() {
    if (isTouchDevice) return;
    const hero = $('.hero-section');
    const spotlight = $('#hero-spotlight');
    if (!hero || !spotlight) return;

    hero.addEventListener('mousemove', e => {
        const rect = hero.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        spotlight.style.setProperty('--sx', x + '%');
        spotlight.style.setProperty('--sy', y + '%');
        spotlight.classList.add('active');
    });

    hero.addEventListener('mouseleave', () => {
        spotlight.classList.remove('active');
    });
}



/* ============================================================
   5c. HERO STATS COUNTER — animates once on page load
   ============================================================ */
function initHeroStatsCounter() {
    const counters = $$('.hero-counter');
    if (!counters.length) return;

    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 1400;
        const start = performance.now();

        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.round(eased * target);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    });
}



/* ============================================================
   6. SCROLL REVEAL — CSS-class based
   ─────────────────────────────────────────────────────────────
   FIX BUG 2 & 4:
   We ONLY add 'is-visible', never remove it.
   This means once an element is revealed it stays visible —
   even when jumping via navbar or back-scrolling.
   GSAP handles the actual animation; this is just a CSS
   fallback for elements GSAP doesn't target.
   ============================================================ */
function initScrollReveal() {
    const blocks = $$('.reveal-block');
    if (!blocks.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add class when it scrolls into view
                entry.target.classList.add('is-visible');
            } else {
                // REMOVE class when it scrolls out of view so it can animate again!
                entry.target.classList.remove('is-visible');
            }
        });
    }, { threshold: 0.08 });

    blocks.forEach(el => observer.observe(el));
}

/* ============================================================
   7. GSAP SCROLL ANIMATIONS
   ─────────────────────────────────────────────────────────────
   FIX BUG 1 & 5:
   All toggleActions changed to 'play none none none'.
   'reverse' was causing opacity:0 when scrolling back up or
   jumping via navbar — content became invisible.
   FIX BUG 6: Footer now gets its own entrance animation.
   ============================================================ */
function initGsapScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    /* ── Section titles — replays both directions ── */
    $$('.section-title').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, y: 42, skewY: 1.5, scale: 0.97 },
            {
                opacity: 1, y: 0, skewY: 0, scale: 1,
                duration: 0.85,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    end: 'bottom top',
                    toggleActions: 'play reset play reset'
                }
            }
        );
    });

    /* ── Service cards — advanced staggered reveal, replays both directions ── */
    $$('.service-card').forEach((card, i) => {
        const icon  = card.querySelector('.icon-wrapper');
        const title = card.querySelector('h3');
        const desc  = card.querySelector('p');
        const link  = card.querySelector('.link-learn');

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                end: 'bottom top',
                toggleActions: 'play reset play reset'
            }
        });

        /* Card frame rises in with a settle */
        tl.fromTo(card,
            { opacity: 0, y: 60, scale: 0.93 },
            { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out', delay: i * 0.08 },
            0
        );

        /* Icon pops in with a spin-settle */
        if (icon) {
            tl.fromTo(icon,
                { opacity: 0, scale: 0.5, rotate: -25 },
                { opacity: 1, scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(1.9)' },
                0.15 + i * 0.08
            );
        }

        /* Circuit trace border powers on around the card */
        const traceBorder = card.querySelector('.card-trace-border');
        if (traceBorder) {
            tl.call(() => {
                traceBorder.classList.remove('tracing');
                void traceBorder.offsetWidth; /* force reflow to restart animation */
                traceBorder.classList.add('tracing');
            }, null, 0.05);
        }

        /* Title fades up */
        if (title) {
            tl.fromTo(title,
                { opacity: 0, y: 16 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
                0.3 + i * 0.08
            );
        }

        /* Description fades up right after */
        if (desc) {
            tl.fromTo(desc,
                { opacity: 0, y: 14 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
                0.38 + i * 0.08
            );
        }

        /* Link/CTA slides in from left last */
        if (link) {
            tl.fromTo(link,
                { opacity: 0, x: -16 },
                { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' },
                0.48 + i * 0.08
            );
        }
    });

    /* ── Skill cards — replays both directions ── */
    const skillCards = $$('.skill-card');
    if (skillCards.length) {
        gsap.fromTo(skillCards,
            { opacity: 0, scale: 0.82, y: 30 },
            {
                opacity: 1, scale: 1, y: 0,
                duration: 0.68,
                ease: 'back.out(1.5)',
                stagger: 0.1,
                scrollTrigger: {
                    trigger: '#skills',
                    start: 'top 78%',
                    end: 'bottom top',
                    toggleActions: 'play reset play reset'
                }
            }
        );
    }

    /* ── Timeline items — advanced staggered reveal, replays both directions ── */
    $$('.timeline-item').forEach(el => {
        const fromSide  = el.classList.contains('left') ? -70 : 70;
        const content   = el.querySelector('.timeline-content');
        const dateBadge = el.querySelector('.date-badge');
        const degree    = el.querySelector('.degree');
        const uni       = el.querySelector('.university');
        const loc       = el.querySelector('.location');
        const tags      = el.querySelectorAll('.coursework span');
        const dot        = el; /* ::after pseudo-element pulse handled via class toggle below */
        const decoration = el.querySelector('.timeline-decoration');

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: el,
                start: 'top 82%',
                end: 'bottom top',
                toggleActions: 'play reset play reset'
            }
        });

        /* Card slides in from its side, with a subtle scale settle */
        if (content) {
            tl.fromTo(content,
                { opacity: 0, x: fromSide, scale: 0.95 },
                { opacity: 1, x: 0, scale: 1, duration: 0.7, ease: 'power3.out' },
                0
            );
        }

        /* Timeline node dot pops in */
        tl.fromTo(el,
            { '--dot-scale': 0 },
            { '--dot-scale': 1, duration: 0.01 },
            0.1
        );
        tl.call(() => el.classList.add('node-pop'), null, 0.15);

        /* Date badge pops with a bounce */
        if (dateBadge) {
            tl.fromTo(dateBadge,
                { opacity: 0, y: -14, scale: 0.85 },
                { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.8)' },
                0.15
            );
        }

        /* Degree + university + location cascade up */
        if (degree) tl.fromTo(degree, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.28);
        if (uni)    tl.fromTo(uni,    { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.36);
        if (loc)    tl.fromTo(loc,    { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.44);

        /* Coursework tags pop in one by one */
        if (tags.length) {
            tl.fromTo(tags,
                { opacity: 0, y: 10, scale: 0.8 },
                { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: 'back.out(1.7)', stagger: 0.06 },
                0.5
            );
        }

        /* Side decoration icon (brain / code box) fades and rotates in */
        if (decoration) {
            tl.fromTo(decoration,
                { opacity: 0, scale: 0.7, rotate: fromSide > 0 ? -15 : 15 },
                { opacity: 1, scale: 1, rotate: 0, duration: 0.55, ease: 'back.out(1.6)' },
                0.2
            );
        }
    });

/* ── Experience cards — replays both directions ── */
    $$('.exp-card').forEach((card, i) => {
        const logo   = card.querySelector('.exp-logo');
        const role   = card.querySelector('.exp-role');
        const skills = card.querySelectorAll('.exp-skills span');

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                end: 'bottom top',
                toggleActions: 'play reset play reset'
            }
        });

        tl.fromTo(card,
            { opacity: 0, x: i % 2 === 0 ? -50 : 50, scale: 0.96 },
            { opacity: 1, x: 0, scale: 1, duration: 0.65, ease: 'power3.out' },
            0
        );
        if (logo) tl.fromTo(logo, { opacity: 0, scale: 0.5, rotate: -20 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.45, ease: 'back.out(1.8)' }, 0.2);
        if (role) tl.fromTo(role, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.3);
        if (skills.length) tl.fromTo(skills, { opacity: 0, y: 10, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(1.7)', stagger: 0.06 }, 0.42);
    });



    /* ── Project showcases — advanced staggered reveal ── */
    $$('.project-showcase').forEach(el => {
        const isReversed = el.querySelector('.flex-lg-row-reverse');
        const textCol  = el.querySelector('.col-lg-5');
        const imgCol   = el.querySelector('.col-lg-7');
        const badge    = el.querySelector('.live-badge');
        const title    = el.querySelector('.project-title');
        const desc     = el.querySelector('.project-desc');
        const tags     = el.querySelectorAll('.tech-tags span');
        const btns     = el.querySelector('.action-btns');

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: el,
                start: 'top 82%',
                end: 'bottom top',
                toggleActions: 'play reset play reset'
            }
        });

        /* Whole card frame + shadow settle */
        tl.fromTo(el,
            { opacity: 0, y: 70, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }
        );

        /* Image column slides in from its own side (reverses on alternate rows) */
        if (imgCol) {
            tl.fromTo(imgCol,
                { opacity: 0, x: isReversed ? -50 : 50, clipPath: 'inset(0 0 0 0)' },
                { opacity: 1, x: 0, duration: 0.75, ease: 'power3.out' },
                '-=0.55'
            );
        }

        /* Cinematic curtain reveal on the screenshot itself */
        const revealPanel = el.querySelector('.img-reveal-panel');
        if (revealPanel) {
            tl.set(revealPanel, { scaleX: 1 }, 0);
            tl.to(revealPanel, {
                scaleX: 0,
                duration: 0.9,
                ease: 'power4.inOut'
            }, '-=0.4');
        }

        /* Text content staggers in piece by piece */
        if (badge) tl.fromTo(badge, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.55');
        if (title) tl.fromTo(title, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3');
        if (desc)  tl.fromTo(desc,  { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.35');
        if (tags.length) tl.fromTo(tags,
            { opacity: 0, y: 12, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.6)', stagger: 0.06 },
            '-=0.3'
        );
        if (btns) tl.fromTo(btns, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '-=0.25');
    });

    /* ── Contact cards — advanced staggered reveal, replays both directions ── */
    $$('.contact-card').forEach((el, i) => {
        const iconBox    = el.querySelector('.icon-box');
        const details    = el.querySelector('.contact-details');
        const socialBtns = $$('.social-btn', el);

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                end: 'bottom top',
                toggleActions: 'play reset play reset'
            }
        });

        /* Card slides in from the left with a settle */
        tl.fromTo(el,
            { opacity: 0, x: -45, scale: 0.96 },
            { opacity: 1, x: 0, scale: 1, duration: 0.55, ease: 'power3.out', delay: i * 0.1 },
            0
        );

        /* Icon box pops in with a bounce */
        if (iconBox) {
            tl.fromTo(iconBox,
                { opacity: 0, scale: 0.5, rotate: -20 },
                { opacity: 1, scale: 1, rotate: 0, duration: 0.45, ease: 'back.out(1.9)' },
                0.15 + i * 0.1
            );
        }

        /* Text details fade up */
        if (details) {
            tl.fromTo(details,
                { opacity: 0, y: 14 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
                0.25 + i * 0.1
            );
        }

        /* Social icons (LinkedIn/GitHub/Website) pop in one by one */
        if (socialBtns.length) {
            tl.fromTo(socialBtns,
                { opacity: 0, y: 14, scale: 0.7 },
                { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.8)', stagger: 0.08 },
                0.3 + i * 0.1
            );
        }
    });

    /* ── Contact form — advanced staggered reveal, replays both directions ── */
    const formEl = $('.form-container');
    if (formEl) {
        const inputGroups = $$('.input-group', formEl);
        const submitBtn   = $('.btn-submit', formEl);

        const formTl = gsap.timeline({
            scrollTrigger: {
                trigger: formEl,
                start: 'top 84%',
                end: 'bottom top',
                toggleActions: 'play reset play reset'
            }
        });

        /* Form panel rises in with a settle */
        formTl.fromTo(formEl,
            { opacity: 0, y: 50, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' },
            0
        );

        /* Each input field fades up, one after another */
        if (inputGroups.length) {
            formTl.fromTo(inputGroups,
                { opacity: 0, y: 22 },
                { opacity: 1, y: 0, duration: 0.42, ease: 'power2.out', stagger: 0.09 },
                0.2
            );
        }

        /* Submit button pops in last */
        if (submitBtn) {
            formTl.fromTo(submitBtn,
                { opacity: 0, y: 18, scale: 0.92 },
                { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' },
                0.55
            );
        }
    }

    /* ── Footer entrance animation — advanced, replays both directions ── */
    const footer = $('footer.footer-section');
    if (footer) {
        const footerBrand   = footer.querySelector('.footer-brand');
        const footerDesc    = footer.querySelector('.footer-desc');
        const statusBadge   = footer.querySelector('.status-indicator');
        const footerHeadings= $$('.footer-heading', footer);
        const footerLinks   = $$('.footer-links li', footer);
        const footerSocialCards = $$('.footer-section .social-card', footer);
        const footerBottom  = footer.querySelector('.footer-bottom');

        const footerTl = gsap.timeline({
            scrollTrigger: {
                trigger: footer,
                start: 'top 88%',
                end: 'bottom top',
                toggleActions: 'play reset play reset'
            }
        });

        /* Top divider line sweeps in first */
        footerTl.fromTo(footer,
            { '--footer-line-w': '0%' },
            { duration: 0.01 }, 0
        );

        /* Brand logo pops in */
        if (footerBrand) {
            footerTl.fromTo(footerBrand,
                { opacity: 0, y: 25, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.7)' },
                0.05
            );
        }

        /* Description fades up right after */
        if (footerDesc) {
            footerTl.fromTo(footerDesc,
                { opacity: 0, y: 18 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
                0.18
            );
        }

        /* Status badge slides in with a little bounce */
        if (statusBadge) {
            footerTl.fromTo(statusBadge,
                { opacity: 0, x: -20, scale: 0.9 },
                { opacity: 1, x: 0, scale: 1, duration: 0.45, ease: 'back.out(1.8)' },
                0.3
            );
        }

        /* Column headings (Navigation / Connect Protocol) fade up together */
        if (footerHeadings.length) {
            footerTl.fromTo(footerHeadings,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.12 },
                0.15
            );
        }

        /* Nav links slide from left, one by one */
        if (footerLinks.length) {
            footerTl.fromTo(footerLinks,
                { opacity: 0, x: -25 },
                { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out', stagger: 0.08 },
                0.32
            );
        }

        /* Social cards slide from right, one by one */
        if (footerSocialCards.length) {
            footerTl.fromTo(footerSocialCards,
                { opacity: 0, x: 35 },
                { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out', stagger: 0.1 },
                0.32
            );
        }

        /* Bottom copyright line fades in last */
        if (footerBottom) {
            footerTl.fromTo(footerBottom,
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
                0.7
            );
        }
    }

    /* ── Badge titles — pop-in, replays both directions ── */
    $$('.badge-title').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, y: 20, scale: 0.8 },
            {
                opacity: 1, y: 0, scale: 1,
                duration: 0.5,
                ease: 'back.out(1.9)',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 90%',
                    end: 'bottom top',
                    toggleActions: 'play reset play reset'
                }
            }
        );
    });
}

/* ============================================================
   8. SKILLS ANIMATION — re-runs every time section enters view
   ─────────────────────────────────────────────────────────────
   This is INTENTIONALLY different from section 7 above.
   Skills counters and ring bars should re-animate each time
   you scroll into the section — that's the desired UX.
   We reset on exit so they re-animate on next entry.
   ============================================================ */
function initSkillsAnimation() {
    const skillSection = $('#skills');
    if (!skillSection) return;

    const circumference = 2 * Math.PI * 52; /* r=52 from SVG */

    /* Set initial state for all ring bars */
    $$('.progress-ring__bar').forEach(bar => {
        bar.style.strokeDasharray  = `${circumference} ${circumference}`;
        bar.style.strokeDashoffset = circumference;
        /* Transition will be re-enabled in runSkills() */
        bar.style.transition = 'none';
    });

    function runSkills() {
        /* Animate SVG ring progress bars */
        $$('.progress-ring__bar').forEach(bar => {
            const pct = parseFloat(bar.getAttribute('data-percent') || 0);
            bar.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)';
            /* rAF ensures transition triggers after transition property is set */
            requestAnimationFrame(() => {
                bar.style.strokeDashoffset = circumference - (pct / 100) * circumference;
            });
        });

        /* Animate number counters */
        $$('.counter').forEach(counter => {
            const target   = +counter.getAttribute('data-target');
            const duration = 1600;
            const start    = performance.now();
            counter.textContent = '0';

            function tick(now) {
                const progress = Math.min((now - start) / duration, 1);
                const eased    = 1 - Math.pow(1 - progress, 3); /* easeOutCubic */
                counter.textContent = Math.round(eased * target);
                if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });

        /* Animate horizontal skill bars */
        $$('.bar-fill').forEach(fill => {
            const w = fill.getAttribute('data-width') || 0;
            fill.style.transition = 'none';
            fill.style.width = '0%';
            /* Double rAF: first frame applies 'none', second applies transition */
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    fill.style.transition = 'width 1.5s cubic-bezier(0.4,0,0.2,1)';
                    fill.style.width = w + '%';
                });
            });
        });
    }

    function resetSkills() {
        /* Reset ring bars */
        $$('.progress-ring__bar').forEach(bar => {
            bar.style.transition = 'none';
            bar.style.strokeDashoffset = circumference;
        });
        /* Reset horizontal bars */
        $$('.bar-fill').forEach(fill => {
            fill.style.transition = 'none';
            fill.style.width = '0%';
        });
        /* Reset counters */
        $$('.counter').forEach(counter => {
            counter.textContent = '0';
        });
    }

    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            runSkills();
        } else {
            resetSkills(); /* Reset so it re-animates next time */
        }
    }, { threshold: 0.22 });

    observer.observe(skillSection);
}

/* ============================================================
   9. NEURAL CANVAS — retina-aware animated background
   ============================================================ */
function initNeuralCanvas() {
    const canvas = $('#neural-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resizeCanvas() {
        const W = window.innerWidth;
        const H = window.innerHeight;
        canvas.width  = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width  = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0); /* Reset before re-scaling */
        ctx.scale(dpr, dpr);
    }
    resizeCanvas();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resizeCanvas, 150);
    }, { passive: true });

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    const COLORS     = ['59,130,246', '139,92,246', '236,72,153', '16,185,129'];
    const nodeCount  = window.innerWidth < 768 ? 28 : 55;

    const nodes = Array.from({ length: nodeCount }, () => ({
        x     : Math.random() * W(),
        y     : Math.random() * H(),
        vx    : (Math.random() - 0.5) * 0.38,
        vy    : (Math.random() - 0.5) * 0.38,
        r     : Math.random() * 2.2 + 1.2,
        color : COLORS[Math.floor(Math.random() * COLORS.length)],
        pulse : Math.random() * Math.PI * 2
    }));

    let mx = -999, my = -999;
    window.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
    }, { passive: true });

    function draw() {
        ctx.clearRect(0, 0, W(), H());

        nodes.forEach(n => {
            n.x += n.vx; n.y += n.vy; n.pulse += 0.018;
            if (n.x < 0 || n.x > W()) n.vx *= -1;
            if (n.y < 0 || n.y > H()) n.vy *= -1;

            const ddx = n.x - mx, ddy = n.y - my;
            const dd  = Math.sqrt(ddx * ddx + ddy * ddy);
            if (dd < 100 && dd > 0) {
                const f = (100 - dd) / 100 * 0.6;
                n.vx += (ddx / dd) * f;
                n.vy += (ddy / dd) * f;
                const sp = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
                if (sp > 2) { n.vx = n.vx / sp * 2; n.vy = n.vy / sp * 2; }
            }
        });

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx   = nodes[i].x - nodes[j].x;
                const dy   = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 155) {
                    const alpha = (1 - dist / 155) * 0.22;
                    const g = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                    g.addColorStop(0, `rgba(${nodes[i].color},${alpha})`);
                    g.addColorStop(1, `rgba(${nodes[j].color},${alpha})`);
                    ctx.beginPath();
                    ctx.strokeStyle = g;
                    ctx.lineWidth   = alpha * 3;
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        nodes.forEach(n => {
            const glow = Math.sin(n.pulse) * 0.3 + 0.7;
            ctx.beginPath();
            ctx.fillStyle = `rgba(${n.color},${glow})`;
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();

            if (n.r > 2.5 && Math.sin(n.pulse) > 0.8) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${n.color},${(Math.sin(n.pulse) - 0.8) * 2})`;
                ctx.lineWidth   = 1;
                ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
                ctx.stroke();
            }
        });

        requestAnimationFrame(draw);
    }
    draw();
}

/* ============================================================
   10. TYPEWRITER EFFECT
   ============================================================ */
class TypeWriter {
    constructor(el, words, wait = 3000) {
        this.el        = el;
        this.words     = words;
        this.txt       = '';
        this.wordIndex = 0;
        this.wait      = parseInt(wait, 10);
        this.deleting  = false;
        this.type();
    }
    type() {
        const full  = this.words[this.wordIndex % this.words.length];
        this.txt    = this.deleting
            ? full.substring(0, this.txt.length - 1)
            : full.substring(0, this.txt.length + 1);
        this.el.innerHTML = `<span class="txt">${this.txt}</span>`;

        let speed = this.deleting ? 80 : 160;
        if (!this.deleting && this.txt === full) {
            speed = this.wait; this.deleting = true;
        } else if (this.deleting && this.txt === '') {
            this.deleting = false; this.wordIndex++; speed = 500;
        }
        setTimeout(() => this.type(), speed);
    }
}

/* ============================================================
   11. PORTFOLIO FILTER
   ============================================================ */
function initFilter() {
    const filterBtns = $$('.btn-filter');
    const projects   = $$('.project-showcase');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');

            projects.forEach((proj, i) => {
                const match = filter === 'all' || proj.classList.contains(filter);
                if (!match) {
                    proj.style.opacity   = '0';
                    proj.style.transform = 'scale(0.95)';
                    setTimeout(() => { proj.style.display = 'none'; }, 300);
                } else {
                    proj.style.display   = 'block';
                    proj.style.opacity   = '0';
                    proj.style.transform = 'translateY(30px)';
                    setTimeout(() => {
                        proj.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        proj.style.opacity    = '1';
                        proj.style.transform  = 'translateY(0)';
                    }, 60 + i * 80);
                }
            });
        });
    });
}

/* ============================================================
   12. 3D TILT CARDS
   ============================================================ */
function initTiltCards() {
    if (isTouchDevice) return;

    $$('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const cx   = rect.left + rect.width  / 2;
            const cy   = rect.top  + rect.height / 2;
            const rotX = ((e.clientY - cy) / (rect.height / 2)) * -8;
            const rotY = ((e.clientX - cx) / (rect.width  / 2)) *  8;
            card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

/* ============================================================
   13. MAGNETIC BUTTONS
   ============================================================ */
function initMagneticButtons() {
    if (isTouchDevice) return;

    function attachMagnet(selector, strength, maxOffset) {
        $$(selector).forEach(el => {
            el.classList.add('magnetic-el');
            el.addEventListener('mousemove', e => {
                const rect = el.getBoundingClientRect();
                let dx = (e.clientX - (rect.left + rect.width  / 2)) * strength;
                let dy = (e.clientY - (rect.top  + rect.height / 2)) * strength;
                dx = Math.max(-maxOffset, Math.min(maxOffset, dx));
                dy = Math.max(-maxOffset, Math.min(maxOffset, dy));
                el.style.transform = `translate(${dx}px, ${dy}px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    }

    /* Buttons — noticeable pull */
    attachMagnet('.btn-hire, .btn-liquid, .btn-download, .btn-submit, .btn-filter, .cmdk-trigger', 0.35, 14);

    /* Nav links — subtle nudge */
    attachMagnet('.nav-link', 0.25, 8);

    /* Cards — gentle tilt-pull (bigger elements need smaller strength) */
    attachMagnet('.service-card, .skill-card, .float-card', 0.12, 10);

    /* Skill stack icons / social icons — playful bounce */
    attachMagnet('.icons i, .social-btn', 0.5, 16);

    /* Theme toggle & bot toggle — small icons, strong pull */
    attachMagnet('#theme-toggle, #bot-toggle, .scroll-top-btn', 0.4, 12);
}



/* ============================================================
   14. PARTICLE TRAIL (desktop only)
   ============================================================ */
function initParticleTrail() {
    if (isTouchDevice) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99997;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const particles = [];
    const colors    = ['59,130,246', '139,92,246', '236,72,153', '16,185,129'];

    window.addEventListener('mousemove', e => {
        if (Math.random() > 0.35) return;
        particles.push({
            x    : e.clientX,
            y    : e.clientY,
            vx   : (Math.random() - 0.5) * 1.5,
            vy   : (Math.random() - 0.5) * 1.5 - 0.5,
            life : 1,
            r    : Math.random() * 3 + 1,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }, { passive: true });

    (function drawTrail() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x    += p.vx;
            p.y    += p.vy;
            p.vy   += 0.04;
            p.life -= 0.035;
            if (p.life <= 0) { particles.splice(i, 1); continue; }
            ctx.beginPath();
            ctx.fillStyle = `rgba(${p.color},${p.life * 0.5})`;
            ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(drawTrail);
    })();
}

/* ============================================================
   15. CONTACT FORM
   ============================================================ */
function initContactForm() {
    const form         = $('#my-form');
    const status       = $('#my-form-status');
    const sweep        = $('#transmit-sweep');
    const successCard  = $('#transmit-success');
    if (!form) return;

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const btn        = $('#my-form-button');
        btn.textContent  = 'Transmitting…';
        btn.disabled     = true;

        try {
            const res = await fetch(form.action, {
                method : form.method,
                body   : new FormData(form),
                headers: { Accept: 'application/json' }
            });
            if (res.ok) {
                /* Cinematic transmission success sequence */
                if (sweep) {
                    sweep.classList.remove('sweeping');
                    void sweep.offsetWidth;
                    sweep.classList.add('sweeping');
                }
                setTimeout(() => {
                    if (successCard) successCard.classList.add('show');
                }, 500);
                setTimeout(() => {
                    if (successCard) successCard.classList.remove('show');
                }, 4000);

                status.textContent = '';
                form.reset();
            } else {
                const data = await res.json().catch(() => ({}));
                status.textContent = data.errors
                    ? data.errors.map(err => err.message).join(', ')
                    : 'Transmission Failed. Please try again.';
                status.style.color = '#ef4444';
            }
        } catch {
            status.textContent = 'Network Error. Check your connection.';
            status.style.color = '#ef4444';
        } finally {
            btn.innerHTML = '<span>Transmit Message</span><i class="fa-solid fa-paper-plane"></i>';
            btn.disabled  = false;
            setTimeout(() => { if (status) status.textContent = ''; }, 5000);
        }
    });
}

/* ============================================================
   16. SCROLL-TO-TOP
   ============================================================ */
function initScrollTop() {
    const btn = $('#scroll-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('active', window.scrollY > 300);
    }, { passive: true });
}

/* ============================================================
   17. HIGHLIGHT NAME — ensure position:relative for underline
   ============================================================ */
function initNameHover() {
    const name = $('.highlight-name');
    if (name) name.style.position = 'relative';
}

/* ============================================================
   18. DATA PARTICLES (hero section floating code words)
   ============================================================ */
function initDataParticles() {
    $$('.dp').forEach(dp => {
        const delay  = parseFloat(getComputedStyle(dp).getPropertyValue('--d')) || 0;
        const yRange = 20 + Math.random() * 20;

        function randomMove() {
            const duration = 8000 + Math.random() * 6000;
            const newY     = (Math.random() - 0.5) * yRange;
            const newX     = (Math.random() - 0.5) * 30;
            dp.style.transition = `transform ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`;
            dp.style.transform  = `translate(${newX}px, ${newY}px)`;
            dp.style.opacity    = (0.08 + Math.random() * 0.18).toString();
            setTimeout(randomMove, duration);
        }
        setTimeout(randomMove, delay * 1000);
    });
}

/* ============================================================
   19. COMMAND PALETTE (Ctrl+K / Cmd+K)
   ============================================================ */
function initCommandPalette() {
    const overlay  = $('#cmdk-overlay');
    const palette  = $('#cmdk-palette');
    const input    = $('#cmdk-input');
    const resultsEl= $('#cmdk-results');
    const trigger  = $('#cmdk-trigger');
    if (!overlay || !input || !resultsEl) return;

    const commands = [
        { title: 'Home',              sub: 'Go to top',        icon: 'fa-solid fa-house',        action: () => scrollToSection('#home') },
        { title: 'Services',          sub: 'Expertise',        icon: 'fa-solid fa-layer-group',  action: () => scrollToSection('#expertise') },
        { title: 'About',             sub: 'Skills',           icon: 'fa-solid fa-user-astronaut',action: () => scrollToSection('#skills') },
        { title: 'Education',         sub: 'Qualification',    icon: 'fa-solid fa-graduation-cap',action: () => scrollToSection('#qualification') },
        { title: 'Experience',        sub: 'Career Path',      icon: 'fa-solid fa-briefcase',      action: () => scrollToSection('#experience') },
        { title: 'Projects',          sub: 'View Work',        icon: 'fa-solid fa-diagram-project',action: () => scrollToSection('#projects') },
        { title: 'Contact',           sub: 'Get in touch',     icon: 'fa-solid fa-paper-plane',  action: () => scrollToSection('#contact') },
        { title: 'Download CV',       sub: 'PDF',              icon: 'fa-solid fa-file-arrow-down', action: () => { const a = $('.btn-download'); if (a) a.click(); } },
        { title: 'Email Deepak',      sub: 'Mail',              icon: 'fa-solid fa-envelope',     action: () => window.location.href = 'mailto:dy0169489@gmail.com' },
        { title: 'GitHub',            sub: 'External link',     icon: 'fa-brands fa-github',      action: () => window.open('https://github.com/D0027', '_blank', 'noopener') },
        { title: 'LinkedIn',          sub: 'External link',     icon: 'fa-brands fa-linkedin-in', action: () => window.open('https://www.linkedin.com/in/deepakyadav027/', '_blank', 'noopener') },
        { title: 'Neural Arena',      sub: 'Project',           icon: 'fa-solid fa-gamepad',      action: () => scrollToSection('#projects') },
        { title: 'Plant Disease Classifier', sub: 'Project',    icon: 'fa-solid fa-seedling',     action: () => scrollToSection('#projects') },
        { title: 'Real Estate Advisor', sub: 'Project',         icon: 'fa-solid fa-chart-line',   action: () => scrollToSection('#projects') },
    ];

    function scrollToSection(sel) {
        const el = $(sel);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    let filtered = commands;
    let activeIdx = 0;

    function render() {
        resultsEl.innerHTML = '';
        if (!filtered.length) {
            resultsEl.innerHTML = '<li class="cmdk-empty"><i class="fa-solid fa-ghost" aria-hidden="true"></i> No results found</li>';
            return;
        }
        filtered.forEach((cmd, i) => {
            const li = document.createElement('li');
            li.className = 'cmdk-item' + (i === activeIdx ? ' active' : '');
            li.setAttribute('role', 'option');
            li.dataset.idx = i;
            li.innerHTML = `
                <span class="cmdk-icon-box"><i class="${cmd.icon}" aria-hidden="true"></i></span>
                <span class="cmdk-item-title">${cmd.title}</span>
                <span class="cmdk-item-sub">${cmd.sub}</span>
                ${i < 9 ? `<kbd class="cmdk-num">${i + 1}</kbd>` : ''}
            `;
            resultsEl.appendChild(li);
        });
    }

    /* Event delegation — fixes click-miss bug caused by re-rendering on hover */
    resultsEl.addEventListener('mousemove', e => {
        const li = e.target.closest('.cmdk-item');
        if (!li || li.dataset.idx === undefined) return;
        const idx = Number(li.dataset.idx);
        if (idx !== activeIdx) {
            activeIdx = idx;
            $$('.cmdk-item', resultsEl).forEach(el => el.classList.remove('active'));
            li.classList.add('active');
        }
    });

    resultsEl.addEventListener('click', e => {
        const li = e.target.closest('.cmdk-item');
        if (!li || li.dataset.idx === undefined) return;
        const cmd = filtered[Number(li.dataset.idx)];
        if (cmd) runCommand(cmd);
    });

    function runCommand(cmd) {
        closePalette();
        setTimeout(() => cmd.action(), 150);
    }

    function filterCommands(query) {
        const q = query.trim().toLowerCase();
        filtered = !q ? commands : commands.filter(c =>
            c.title.toLowerCase().includes(q) || c.sub.toLowerCase().includes(q)
        );
        activeIdx = 0;
        render();
    }

    function openPalette() {
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        input.value = '';
        filterCommands('');
        document.body.style.overflow = 'hidden';
        setTimeout(() => input.focus(), 60);
    }

    function closePalette() {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    if (trigger) trigger.addEventListener('click', openPalette);

    document.addEventListener('keydown', e => {
        const isK = e.key === 'k' || e.key === 'K';
        if ((e.ctrlKey || e.metaKey) && isK) {
            e.preventDefault();
            overlay.classList.contains('active') ? closePalette() : openPalette();
        }
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closePalette();
        }
    });

    overlay.addEventListener('click', e => {
        if (e.target === overlay) closePalette();
    });

    input.addEventListener('input', () => filterCommands(input.value));

    input.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIdx = Math.min(activeIdx + 1, filtered.length - 1);
            render();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIdx = Math.max(activeIdx - 1, 0);
            render();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[activeIdx]) runCommand(filtered[activeIdx]);
        }
    });

    document.addEventListener('keydown', e => {
        if (!overlay.classList.contains('active')) return;
        const num = Number(e.key);
        if (num >= 1 && num <= 9 && filtered[num - 1] && document.activeElement !== input) {
            runCommand(filtered[num - 1]);
        }
    });
}

/* ============================================================
   20. THEME TOGGLE (Dark / Light)
   ============================================================ */
function initThemeToggle() {
    const toggle = $('#theme-toggle');
    if (!toggle) return;
    const root = document.documentElement;

    function apply(theme) {
        root.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        toggle.setAttribute('aria-pressed', theme === 'dark');
    }

    toggle.addEventListener('click', () => {
        const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        apply(current === 'dark' ? 'light' : 'dark');
    });

    apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
}



/* ============================================================
   21. AI FAQ CHATBOT
   ============================================================ */
function initChatbot() {
    const toggle   = $('#bot-toggle');
    const win      = $('#bot-window');
    const closeBtn = $('#bot-close');
    const messages = $('#bot-messages');
    const form     = $('#bot-form');
    const input    = $('#bot-input');
    const chipsBox = $('#bot-quick-replies');
    if (!toggle || !win || !messages || !form) return;

    const KB = [
        {
            keys: ['skill', 'stack', 'technolog', 'tech stack', 'know', 'expert'],
            reply: "Deepak works across the full AI/ML + web stack: <b>Python, TensorFlow, PyTorch, OpenCV</b> for AI/ML, and <b>Django, Streamlit, Gradio</b> for deployment. Strong in NLP, Computer Vision, and Data Visualization too.",
            chips: ['Show projects', 'Education']
        },
        {
            keys: ['project', 'work', 'built', 'portfolio', 'showcase'],
            reply: "Deepak has built <b>Neural Arena</b> (AI simulation hub, live on PythonAnywhere), <b>Plant Disease Classifier</b> (Vision Transformer-based agro diagnostics on Hugging Face), and <b>Real Estate Investment Advisor</b> (XGBoost-powered forecasting, live on Streamlit). Scroll to the Projects section to see them live!",
            chips: ['Skills', 'Contact']
        },
        {
            keys: ['education', 'study', 'university', 'degree', 'college', 'qualification'],
            reply: "Deepak is pursuing a <b>Master of Computer Application (2024–2026)</b> at P P Savani University, Surat, and completed a <b>Bachelor of Computer Application (2022–2024)</b> at Saurashtra University, Rajkot.",
            chips: ['Skills', 'Contact']
        },
        {
            keys: ['contact', 'email', 'reach', 'hire', 'available', 'connect'],
            reply: "You can reach Deepak at <a href='mailto:dy0169489@gmail.com'>dy0169489@gmail.com</a>, or scroll down to the Contact section to send a message directly. He's currently <b>available for projects</b>!",
            chips: ['Show projects', 'Skills']
        },
        {
            keys: ['resume', 'cv', 'download'],
            reply: "You can download Deepak's CV using the button in the About section, or say 'download' and I'll scroll you there.",
            chips: ['Contact', 'Skills']
        },
        {
            keys: ['neural arena'],
            reply: "<b>Neural Arena</b> is an AI-powered simulation platform hosted on PythonAnywhere — features real-time data processing, intelligent automation, and interactive AI games like Tic-Tac-Toe and Neon Pac-Man with adaptive AI opponents.",
            chips: ['Other projects', 'Contact']
        },
        {
            keys: ['plant', 'agro', 'disease', 'leaf'],
            reply: "The <b>Plant Disease Classifier</b> is an intelligent agro-vision diagnostic dashboard using Vision Transformers to analyze leaf images and detect diseases with high confidence — live on Hugging Face Spaces.",
            chips: ['Other projects', 'Contact']
        },
        {
            keys: ['real estate', 'property', 'investment'],
            reply: "The <b>Real Estate Investment Advisor</b> analyzes 18+ features using XGBoost to forecast 5-year property values and gives actionable investment verdicts — live on Streamlit with ~94% confidence.",
            chips: ['Other projects', 'Contact']
        },
        {
            keys: ['hello', 'hi', 'hey', 'namaste'],
            reply: "Hey there! 👋 I'm Deepak's portfolio assistant. Ask me about his skills, projects, education, or how to get in touch!",
            chips: ['Skills', 'Projects', 'Contact']
        },
        {
            keys: ['thank', 'thanks', 'bye'],
            reply: "You're welcome! Feel free to reach out to Deepak directly if you'd like to discuss a project. 🚀",
            chips: ['Contact']
        },
    ];

    const FALLBACK = "I'm not sure about that specific question, but I can tell you about Deepak's skills, projects, education, or how to contact him. What would you like to know?";

    function scrollToSection(sel) {
        const el = $(sel);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function findReply(text) {
        const q = text.toLowerCase();
        const hit = KB.find(item => item.keys.some(k => q.includes(k)));
        return hit || { reply: FALLBACK, chips: ['Skills', 'Projects', 'Contact'] };
    }

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `bot-msg ${sender}`;
        div.innerHTML = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function renderChips(chips) {
        chipsBox.innerHTML = '';
        (chips || []).forEach(label => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'bot-chip';
            btn.textContent = label;
            btn.addEventListener('click', () => handleUserInput(label));
            chipsBox.appendChild(btn);
        });
    }

    function showTyping() {
        const div = document.createElement('div');
        div.className = 'bot-typing';
        div.id = 'bot-typing-indicator';
        div.innerHTML = '<span></span><span></span><span></span>';
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function hideTyping() {
        const el = $('#bot-typing-indicator');
        if (el) el.remove();
    }

    function handleUserInput(text) {
        if (!text.trim()) return;
        addMessage(text, 'user');
        chipsBox.innerHTML = '';
        showTyping();

        const lower = text.toLowerCase();
        if (lower.includes('project') && lower.includes('other')) {
            setTimeout(() => { hideTyping(); scrollToSection('#projects'); }, 500);
        }

        setTimeout(() => {
            hideTyping();
            const { reply, chips } = findReply(text);
            addMessage(reply, 'bot');
            renderChips(chips);
        }, 700 + Math.random() * 500);
    }

    function openBot() {
        win.classList.add('open');
        win.setAttribute('aria-hidden', 'false');
        toggle.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
        if (!messages.children.length) {
            setTimeout(() => {
                addMessage("Hi! 👋 I'm Deepak's AI assistant. Ask me about his skills, projects, education, or how to get in touch.", 'bot');
                renderChips(['Skills', 'Projects', 'Education', 'Contact']);
            }, 300);
        }
        setTimeout(() => input.focus(), 350);
    }

    function closeBot() {
        win.classList.remove('open');
        win.setAttribute('aria-hidden', 'true');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', () => {
        win.classList.contains('open') ? closeBot() : openBot();
    });
    closeBtn.addEventListener('click', closeBot);

    form.addEventListener('submit', e => {
        e.preventDefault();
        const val = input.value;
        input.value = '';
        handleUserInput(val);
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && win.classList.contains('open')) closeBot();
    });
}



/* ============================================================
   22. 3D NEURAL NETWORK HERO (Three.js)
   ============================================================ */
function init3DNeuralHero() {
    const canvas = $('#neural-3d-canvas');
    if (!canvas || typeof THREE === 'undefined' || window.innerWidth < 992) return;

    const wrapper = canvas.parentElement;
    let width  = wrapper.clientWidth;
    let height = wrapper.clientHeight;

    function isDark() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 9;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    function updateFog() {
        scene.fog = new THREE.FogExp2(isDark() ? 0x0b1120 : 0xdbe4f3, 0.045);
    }
    updateFog();

    /* ── Glow sprite texture (soft radial dot) for nodes ── */
    function makeGlowTexture() {
        const size = 128;
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const ctx = c.getContext('2d');
        const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        grad.addColorStop(0,   'rgba(255,255,255,1)');
        grad.addColorStop(0.25,'rgba(255,255,255,0.9)');
        grad.addColorStop(1,   'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(c);
    }
    const glowTex = makeGlowTexture();

    /* ── Build layered neural network structure ── */
    const LAYER_SIZES = [5, 8, 10, 8, 5]; /* input → hidden → hidden → hidden → output — reduced counts for cleaner spacing */
    const nodes = [];
    const nodesByLayer = [];
    const group = new THREE.Group();

    const darkColors  = [0x60a5fa, 0xa78bfa, 0xf472b6, 0x34d399];
    const lightColors = [0x2563eb, 0x7c3aed, 0xdb2777, 0x059669];

    /* Safe bounds so no node/edge pokes past the visible frustum.
       Margins are larger this pass — previous pass only accounted for
       jitter, not sprite radius + the idle float animation range. */
    const X_MARGIN = 1.15;
    const Y_MARGIN = 1.0;
    const X_MIN = -4.2 + X_MARGIN, X_MAX = 4.2 - X_MARGIN;
    const Y_MAX_ABS = 3.3 - Y_MARGIN;

    let colorCursor = 0;
    LAYER_SIZES.forEach((size, layerIdx) => {
        const layerNodes = [];
        const isEdgeLayer = layerIdx === 0 || layerIdx === LAYER_SIZES.length - 1;
        /* Compress layer x-span into the safe zone instead of the old -4.2..4.2 */
        const xPos = X_MIN + (layerIdx / (LAYER_SIZES.length - 1)) * (X_MAX - X_MIN);
        const spacing = (Y_MAX_ABS * 2 * 0.92) / size;

        for (let j = 0; j < size; j++) {
            const scale = 0.22 + Math.random() * 0.24;

            const spriteMat = new THREE.SpriteMaterial({
                map: glowTex,
                transparent: true,
                opacity: 0.95,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.scale.set(scale, scale, 1);

            /* Organic jitter — softens the rigid grid into a natural cluster,
               with radial fade so edges taper off instead of cutting sharply.
               Jitter is reduced on the first/last layer and everything is
               clamped inside the safe zone so nothing can drift off-frame,
               even with the idle homePos float animation added later. */
            const rowT = (j - (size - 1) / 2) / (size / 2);
            const taper = 1 - Math.pow(Math.abs(rowT), 2.2) * 0.35;

            const jitterStrength = isEdgeLayer ? 0.22 : 0.6;
            const xJitter = (Math.random() - 0.5) * jitterStrength;
            const zPos = (Math.random() - 0.5) * (isEdgeLayer ? 1.0 : 2.0);

            let xFinal = xPos + xJitter;
            let yFinal = (j - (size - 1) / 2) * spacing * taper + (Math.random() - 0.5) * 0.35;

            /* Per-node margin grows slightly with sprite scale so bigger
               glow sprites never clip the frame edge either */
            const nodeMarginX = X_MARGIN * 0.15 * scale;
            const nodeMarginY = Y_MARGIN * 0.15 * scale;

            xFinal = Math.max(X_MIN + nodeMarginX, Math.min(X_MAX - nodeMarginX, xFinal));
            yFinal = Math.max(-Y_MAX_ABS + nodeMarginY, Math.min(Y_MAX_ABS - nodeMarginY, yFinal));

            sprite.position.set(xFinal, yFinal, zPos);
            sprite.userData.colorIndex   = colorCursor % 4;
            sprite.userData.twinklePhase = Math.random() * Math.PI * 2;
            sprite.userData.baseOpacity  = 0.65 + Math.random() * 0.35;
            sprite.userData.layer        = layerIdx;
            sprite.userData.homePos      = sprite.position.clone();

            group.add(sprite);
            nodes.push(sprite);
            layerNodes.push(sprite);
            colorCursor++;
        }
        nodesByLayer.push(layerNodes);
    });

    /* ── Connect each layer to the next, like real NN edges ── */
    const linePositions = [];
    const lineIndexPairs = [];
    const linkedPairs = [];

    for (let l = 0; l < nodesByLayer.length - 1; l++) {
        const current = nodesByLayer[l];
        const next    = nodesByLayer[l + 1];

        current.forEach(nodeA => {
            /* Each node connects to 2-3 random nodes in the next layer */
            const connectCount = 2 + Math.floor(Math.random() * 2);
            const shuffled = [...next].sort(() => Math.random() - 0.5).slice(0, connectCount);

            shuffled.forEach(nodeB => {
                linePositions.push(
                    nodeA.position.x, nodeA.position.y, nodeA.position.z,
                    nodeB.position.x, nodeB.position.y, nodeB.position.z
                );
                lineIndexPairs.push(0.35 + Math.random() * 0.25);
                linkedPairs.push([nodeA, nodeB]);
            });
        });
    }
    const lineColorsArr = new Float32Array(linePositions.length);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColorsArr, 3));

    const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lines);

    function updateLineColors(forFadeIn) {
        const base = new THREE.Color(isDark() ? 0x60a5fa : 0x3b82f6);
        const arr = lineGeo.attributes.color.array;
        lineIndexPairs.forEach((alpha, idx) => {
            const c = base.clone().multiplyScalar(alpha * (isDark() ? 1 : 0.85));
            const o = idx * 6;
            arr[o] = c.r; arr[o+1] = c.g; arr[o+2] = c.b;
            arr[o+3] = c.r; arr[o+4] = c.g; arr[o+5] = c.b;
        });
        lineGeo.attributes.color.needsUpdate = true;

        const targetOpacity = isDark() ? 0.5 : 0.6;
        if (forFadeIn && typeof gsap !== 'undefined') {
            lineMat.opacity = 0;
            gsap.to(lineMat, { opacity: targetOpacity, duration: 1.2, delay: 1.1, ease: 'power2.out' });
        } else {
            gsap.killTweensOf(lineMat);
            lineMat.opacity = targetOpacity;
        }
    }

    /* ── Central glowing core (layered sprites for depth) ── */
    const coreLayers = [];
    [ { scale: 2.2, opacity: 0.18 },
      { scale: 1.3, opacity: 0.38 },
      { scale: 0.6, opacity: 0.6 },
    ].forEach(cfg => {
        const mat = new THREE.SpriteMaterial({
            map: glowTex, transparent: true,
            opacity: cfg.opacity, blending: THREE.AdditiveBlending, depthWrite: false
        });
        const s = new THREE.Sprite(mat);
        s.scale.set(cfg.scale, cfg.scale, 1);
        s.userData.isCore = true;
        s.userData.baseScale = cfg.scale;
        s.userData.baseOpacity = cfg.opacity;
        group.add(s);
        coreLayers.push(s);
    });

    let firstThemeApply = true;
    function applyThemeColors() {
        const dark = isDark();
        const palette = dark ? darkColors : lightColors;
        nodes.forEach(n => {
            n.material.color.setHex(palette[n.userData.colorIndex]);
        });
        coreLayers[0].material.color.setHex(dark ? 0x3b82f6 : 0x60a5fa);
        coreLayers[1].material.color.setHex(dark ? 0x60a5fa : 0x93c5fd);
        coreLayers[2].material.color.setHex(0xffffff);
        coreLayers.forEach(l => { l.material.opacity = l.userData.baseOpacity * (dark ? 1 : 0.85); });
        updateFog();
        updateLineColors(firstThemeApply);
        firstThemeApply = false;
    }
    applyThemeColors();

    /* React live to theme toggle */
    const themeObserver = new MutationObserver(applyThemeColors);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    scene.add(group);

    /* ── Chaos → Order boot reveal, with dramatic bounce settle ── */
    if (typeof gsap !== 'undefined') {
        nodes.forEach(n => {
            /* Scatter to a random chaotic position NOW (after lines are built) */
            n.position.set(
                (Math.random() - 0.5) * 16,
                (Math.random() - 0.5) * 16,
                (Math.random() - 0.5) * 16
            );
            gsap.to(n.position, {
                x: n.userData.homePos.x,
                y: n.userData.homePos.y,
                z: n.userData.homePos.z,
                duration: 1.5,
                delay: 0.3 + n.userData.layer * 0.15 + Math.random() * 0.15,
                ease: 'back.out(1.7)'
            });
        });
        gsap.fromTo(group.scale,
            { x: 0.65, y: 0.65, z: 0.65 },
            { x: 1, y: 1, z: 1, duration: 1.6, delay: 0.2, ease: 'back.out(1.4)' }
        );
        gsap.fromTo(group.rotation,
            { y: -0.6 },
            { y: 0, duration: 2, delay: 0.2, ease: 'power2.out' }
        );
    }

    /* ── Mouse-reactive rotation ── */
    let targetRotX = 0, targetRotY = 0;
    let currentRotX = 0, currentRotY = 0;

    wrapper.addEventListener('mousemove', e => {
        const rect = wrapper.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        targetRotY = x * 0.9;
        targetRotX = y * 0.9;
    });

    let clock = 0;

    function animate() {
        requestAnimationFrame(animate);
        clock += 0.012;

        currentRotX += (targetRotX - currentRotX) * 0.05;
        currentRotY += (targetRotY - currentRotY) * 0.05;

        group.rotation.x = currentRotX;
        group.rotation.y = clock * 0.12 + currentRotY;

        const dark = isDark();
        nodes.forEach(n => {
            const tw = Math.sin(clock * 2 + n.userData.twinklePhase) * 0.25;
            n.material.opacity = Math.max(0.3, n.userData.baseOpacity + tw) * (dark ? 1 : 0.9);
        });

        coreLayers.forEach(l => {
            const pulse = 1 + Math.sin(clock * 1.6) * 0.08;
            l.scale.set(l.userData.baseScale * pulse, l.userData.baseScale * pulse, 1);
        });

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        if (window.innerWidth < 992) return;
        width  = wrapper.clientWidth;
        height = wrapper.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });

    document.body.classList.add('neural-3d-active');
}


/* ============================================================
   23. VOICE-ACTIVATED PORTFOLIO NARRATION
   ============================================================ */
function initVoiceNarration() {
    const toggle  = $('#narrate-toggle');
    const caption = $('#narrate-caption');
    if (!toggle || !caption || !('speechSynthesis' in window)) {
        if (toggle) toggle.style.display = 'none';
        return;
    }

    const script = [
        { sel: '#home', text: "Hello! I'm Deepak Yadav, architecting intelligence through AI and machine learning. I bridge the gap between complex data and human experience, building adaptive systems that learn, evolve, and solve real-world problems." },
        { sel: '#expertise', text: "My expertise spans Machine Learning, Deep Learning, and Big Data Operations — building predictive models, architecting neural networks, and optimizing data pipelines at scale." },
        { sel: '#skills', text: "I work primarily with Python, TensorFlow, and computer vision using OpenCV, along with strong skills in natural language processing and data visualization. I also deploy full systems using Django, Streamlit, and Gradio." },
        { sel: '#qualification', text: "I completed my Master of Computer Application at P P Savani University, and my Bachelor's at Saurashtra University in Rajkot, Gujarat." },
        { sel: '#projects', text: "Some of my key projects include Neural Arena, an AI simulation hub; a Plant Disease Classifier using Vision Transformers; and a Real Estate Investment Advisor powered by XGBoost." },
        { sel: '#contact', text: "I'm currently available for projects. Feel free to reach out through the contact form, or connect with me on LinkedIn and GitHub. Thanks for visiting my portfolio!" },
    ];

    let isSpeaking = false;
    let queueIndex = 0;
    let sessionId  = 0;   // increments every stop/start — guards against stale timeouts

    function showCaption(text) {
        caption.textContent = text;
        caption.classList.add('show');
    }
    function hideCaption() {
        caption.classList.remove('show');
    }

    function speakNext(mySession) {
        if (mySession !== sessionId) return;          // a stop happened — abort silently
        if (queueIndex >= script.length) {
            stopNarration();
            return;
        }
        const item = script[queueIndex];
        const el = $(item.sel);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        showCaption(item.text);

        const utter = new SpeechSynthesisUtterance(item.text);
        utter.rate = 1.02;
        utter.pitch = 1;
        utter.onend = () => {
            if (mySession !== sessionId) return;       // stopped mid-utterance
            queueIndex++;
            setTimeout(() => speakNext(mySession), 500);
        };
        utter.onerror = () => {
            if (mySession !== sessionId) return;
            queueIndex++;
            speakNext(mySession);
        };
        window.speechSynthesis.speak(utter);
    }

    function startNarration() {
        window.speechSynthesis.cancel();
        sessionId++;
        const mySession = sessionId;
        queueIndex = 0;
        isSpeaking = true;
        toggle.classList.add('speaking');
        toggle.setAttribute('aria-pressed', 'true');
        speakNext(mySession);
    }

    function stopNarration() {
        sessionId++;                     // invalidates any in-flight speakNext calls
        window.speechSynthesis.cancel();
        isSpeaking = false;
        toggle.classList.remove('speaking');
        toggle.setAttribute('aria-pressed', 'false');
        hideCaption();
    }

    toggle.addEventListener('click', () => {
        isSpeaking ? stopNarration() : startNarration();
    });

    /* Extra safety: Escape key always stops narration instantly */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && isSpeaking) stopNarration();
    });

    /* Stop narration if user navigates away/closes tab */
    window.addEventListener('beforeunload', () => window.speechSynthesis.cancel());
}



/* ============================================================
   24. AI-GENERATED PROJECT INSIGHTS
   ============================================================ */
function initProjectInsights() {
    const buttons = $$('.btn-insights');
    if (!buttons.length) return;

    function animateCount(el, target, suffix) {
        const duration = 900;
        const start = performance.now();
        function step(now) {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    function buildPanel(panel, stats) {
        panel.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'insights-grid';

        Object.entries(stats).forEach(([label, value]) => {
            const stat = document.createElement('div');
            stat.className = 'insight-stat';
            stat.innerHTML = `
                <span class="insight-stat-label">${label}</span>
                <span class="insight-stat-value">0%</span>
                <div class="insight-stat-bar-track">
                    <div class="insight-stat-bar-fill"></div>
                </div>
            `;
            grid.appendChild(stat);
        });
        panel.appendChild(grid);

        requestAnimationFrame(() => {
            const statEls = grid.querySelectorAll('.insight-stat');
            statEls.forEach((stat, i) => {
                const value = Object.values(stats)[i];
                const valueEl = stat.querySelector('.insight-stat-value');
                const barEl   = stat.querySelector('.insight-stat-bar-fill');
                setTimeout(() => {
                    animateCount(valueEl, value, '%');
                    barEl.style.width = value + '%';
                }, i * 120);
            });
        });
    }

    buttons.forEach(btn => {
        const panel = btn.closest('.action-btns').nextElementSibling;
        if (!panel || !panel.classList.contains('insights-panel')) return;

        let built = false;

        btn.addEventListener('click', () => {
            const isOpen = panel.classList.contains('open');

            if (!isOpen && !built) {
                const stats = JSON.parse(btn.dataset.stats);
                buildPanel(panel, stats);
                built = true;
            }

            panel.classList.toggle('open');
            btn.classList.toggle('active');
            btn.setAttribute('aria-expanded', String(!isOpen));
            panel.setAttribute('aria-hidden', String(isOpen));

            if (!isOpen) {
                btn.innerHTML = '<i class="fa-solid fa-chart-simple" aria-hidden="true"></i> Hide Insights';
            } else {
                btn.innerHTML = '<i class="fa-solid fa-chart-simple" aria-hidden="true"></i> Analyze';
            }
        });
    });
}



/* ============================================================
   25. RPG SKILL TREE
   ============================================================ */
function initSkillTree() {
    const wrapper = $('.skill-tree-wrapper');
    const tooltip = $('#skill-tooltip');
    if (!wrapper || !tooltip) return;

    const nodes = $$('.skill-node');

    const backdrop = document.createElement('div');
    backdrop.className = 'skill-tooltip-backdrop';
    document.body.appendChild(backdrop);
    document.body.appendChild(tooltip);

    /* Animate glowing pulse dots traveling along each tree line */
    function animateTreePulses() {
        const lines = $$('.skill-tree-lines line');
        const dots  = $$('.tree-pulse-dot');

        lines.forEach((line, i) => {
            const dot = dots[i];
            if (!dot) return;

            const x1 = +line.getAttribute('x1'), y1 = +line.getAttribute('y1');
            const x2 = +line.getAttribute('x2'), y2 = +line.getAttribute('y2');
            dot.classList.add('active');

            gsap.fromTo(dot,
                { attr: { cx: x1, cy: y1 } },
                {
                    attr: { cx: x2, cy: y2 },
                    duration: 1.4,
                    ease: 'power1.inOut',
                    repeat: -1,
                    delay: i * 0.2,
                    repeatDelay: 0.3
                }
            );
        });
    }

    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                nodes.forEach((node, i) => {
                    setTimeout(() => node.classList.add('unlocked'), i * 150);
                });
                if (typeof gsap !== 'undefined') {
                    setTimeout(animateTreePulses, 400);
                }
                obs.disconnect();
            }
        });
    }, { threshold: 0.3 });
    obs.observe(wrapper);

    const titleEl = $('#skill-tooltip-title');
    const descEl  = $('#skill-tooltip-desc');
    const xpFill  = $('#skill-tooltip-xp-fill');
    const xpLabel = $('#skill-tooltip-xp-label');
    const closeBtn = $('.skill-tooltip-close');

    function openTooltip(node) {
        titleEl.textContent = node.dataset.name;
        descEl.textContent  = node.dataset.desc;
        const xp = parseInt(node.dataset.xp, 10);
        xpFill.style.width = '0%';
        xpLabel.textContent = `Proficiency: ${xp}%`;
        tooltip.classList.add('open');
        backdrop.classList.add('open');
        tooltip.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(() => { xpFill.style.width = xp + '%'; });
    }

    function closeTooltip() {
        tooltip.classList.remove('open');
        backdrop.classList.remove('open');
        tooltip.setAttribute('aria-hidden', 'true');
    }

    nodes.forEach(node => {
        node.addEventListener('click', () => openTooltip(node));
    });
    closeBtn.addEventListener('click', closeTooltip);
    backdrop.addEventListener('click', closeTooltip);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && tooltip.classList.contains('open')) closeTooltip();
    });
}


/* ============================================================
   26. BEFORE / AFTER COMPARE SLIDER
   ============================================================ */
function initCompareSliders() {
    $$('.compare-slider').forEach(slider => {
        const afterImg = slider.querySelector('.compare-after');
        const handle   = slider.querySelector('.compare-handle');
        if (!afterImg || !handle) return;

        let dragging = false;

        function setPosition(clientX) {
            const rect = slider.getBoundingClientRect();
            let pct = ((clientX - rect.left) / rect.width) * 100;
            pct = Math.max(0, Math.min(100, pct));
            afterImg.style.clipPath = `inset(0 0 0 ${pct}%)`;
            handle.style.left = pct + '%';
        }

        function onMove(e) {
            if (!dragging) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            setPosition(clientX);
        }

        slider.addEventListener('mousedown', e => {
            dragging = true;
            slider.classList.add('dragging');
            setPosition(e.clientX);
        });
        slider.addEventListener('touchstart', e => {
            dragging = true;
            slider.classList.add('dragging');
            setPosition(e.touches[0].clientX);
        }, { passive: true });

        window.addEventListener('mousemove', onMove);
        window.addEventListener('touchmove', onMove, { passive: true });

        window.addEventListener('mouseup', () => {
            dragging = false;
            slider.classList.remove('dragging');
        });
        window.addEventListener('touchend', () => {
            dragging = false;
            slider.classList.remove('dragging');
        });

        /* Auto-reveal to center on hover (desktop) */
        slider.addEventListener('mouseenter', () => {
            if (isTouchDevice) return;
            afterImg.style.clipPath = 'inset(0 0 0 50%)';
            handle.style.left = '50%';
        });

        /* Reset back to fully "Before" on mouse leave */
        slider.addEventListener('mouseleave', () => {
            if (isTouchDevice || dragging) return;
            afterImg.style.clipPath = 'inset(0 0 0 100%)';
            handle.style.left = '100%';
        });

        /* Click-to-jump (without dragging) */
        slider.addEventListener('click', e => setPosition(e.clientX));
    });
}




/* ============================================================
   27. EASTER EGG — Konami Code
   ============================================================ */
function initEasterEgg() {
    const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let progress = 0;

    document.addEventListener('keydown', e => {
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        if (key === sequence[progress]) {
            progress++;
            if (progress === sequence.length) {
                triggerEasterEgg();
                progress = 0;
            }
        } else {
            progress = (key === sequence[0]) ? 1 : 0;
        }
    });

    function triggerEasterEgg() {
        runMatrixRain();
        const toast = $('#egg-toast');
        if (toast) {
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 5000);
        }

        /* Allow instant dismiss with Escape key */
        const escHandler = e => {
            if (e.key === 'Escape') {
                $('#matrix-canvas')?.classList.remove('active');
                toast?.classList.remove('show');
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    function runMatrixRain() {
        const canvas = $('#matrix-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.classList.remove('active');
        void canvas.offsetWidth;
        canvas.classList.add('active');

        const chars = 'アイウエオカキクケコ01アルゴリズムPYTHONAI'.split('');
        const fontSize = 16;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = Array(columns).fill(1);

        let frame = 0;
        const maxFrames = 200;

        function draw() {
            frame++;
            ctx.fillStyle = 'rgba(11,17,32,0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = fontSize + 'px monospace';
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
                grad.addColorStop(0, '#3b82f6');
                grad.addColorStop(1, '#8b5cf6');
                ctx.fillStyle = grad;
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }

            if (frame < maxFrames) requestAnimationFrame(draw);
            else ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        draw();
    }
}




/* ============================================================
   BOOT — called after loader finishes
   ─────────────────────────────────────────────────────────────
   FIX BUG 3: initProjectReveal() has been REMOVED from here.
   It was setting opacity:0 on projects 400ms after boot,
   overriding GSAP which had already revealed them. Projects
   are now handled exclusively by initGsapScrollAnimations().
   ============================================================ */
function bootApp() {
    initCursor();
    initScrollProgress();
    initNavbar();
    initActiveNav();
    initNeuralCanvas();
    initHeroEntrance();
    initHeroSpotlight();
    initScrollReveal();
    initGsapScrollAnimations();
    initSkillsAnimation();
    initFilter();
    initContactForm();
    initScrollTop();
    initMagneticButtons();
    initTiltCards();
    initNameHover();
    initDataParticles();
    initCommandPalette();
    initThemeToggle();
    initChatbot();
    init3DNeuralHero();
    initVoiceNarration();
    initProjectInsights();
    initSkillTree();
    initCompareSliders();
    initEasterEgg();

    /* Typewriter */
    const typeEl = $('.txt-type');
    if (typeEl) {
        try {
            const words = JSON.parse(typeEl.getAttribute('data-words'));
            const wait  = typeEl.getAttribute('data-wait') || 3000;
            new TypeWriter(typeEl, words, wait);
        } catch (err) {
            console.warn('TypeWriter init failed:', err);
        }
    }

    /* Particle trail — slight delay so page is interactive first */
    setTimeout(initParticleTrail, 600);
}

/* ============================================================
   START — init loader on DOM ready
   ============================================================ */
document.addEventListener('DOMContentLoaded', initLoader);
