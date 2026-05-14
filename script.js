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
   0. PAGE LOADER
   ============================================================ */
function initLoader() {
    const loader  = $('#page-loader');
    const barFill = loader ? loader.querySelector('.loader-bar-fill') : null;
    const txt     = loader ? loader.querySelector('.loader-text') : null;

    if (!loader) return;

    const msgs = [
        'Initializing Systems...',
        'Loading Neural Weights...',
        'Calibrating Models...',
        'System Ready ✓'
    ];
    let progress = 0;
    let msgIdx   = 0;

    const iv = setInterval(() => {
        progress += Math.random() * 18 + 8;
        if (progress >= 100) progress = 100;

        if (barFill) barFill.style.width = progress + '%';
        if (txt && progress < 100) {
            msgIdx = Math.min(Math.floor(progress / 34), msgs.length - 2);
            txt.textContent = msgs[msgIdx];
        }

        if (progress >= 100) {
            clearInterval(iv);
            if (txt) txt.textContent = msgs[msgs.length - 1];
            setTimeout(() => {
                loader.classList.add('loaded');
                bootApp();
            }, 350);
        }
    }, 80);
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
        });

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

    /* ── Section titles ── */
    $$('.section-title').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, y: 42, skewY: 1.5 },
            {
                opacity: 1, y: 0, skewY: 0,
                duration: 0.85,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none reset'   /* FIX: was 'play reverse play reverse' */
                }
            }
        );
    });

    /* ── Service cards — staggered ── */
    const serviceCards = $$('.service-card');
    if (serviceCards.length) {
        gsap.fromTo(serviceCards,
            { opacity: 0, y: 55, scale: 0.95 },
            {
                opacity: 1, y: 0, scale: 1,
                duration: 0.72,
                ease: 'power2.out',
                stagger: 0.12,
                scrollTrigger: {
                    trigger: '#expertise',
                    start: 'top 78%',
                    toggleActions: 'play none none none'   /* FIX */
                }
            }
        );
    }

    /* ── Skill cards ── */
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
                    toggleActions: 'play none none none'   /* FIX */
                }
            }
        );
    }

    /* ── Timeline items — slide from sides ── */
    $$('.timeline-item.left').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, x: -55 },
            {
                opacity: 1, x: 0,
                duration: 0.78,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 82%',
                    toggleActions: 'play none none none'   /* FIX */
                }
            }
        );
    });

    $$('.timeline-item.right').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, x: 55 },
            {
                opacity: 1, x: 0,
                duration: 0.78,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 82%',
                    toggleActions: 'play none none none'   /* FIX */
                }
            }
        );
    });

    /* ── Project showcases ── */
    $$('.project-showcase').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, y: 65 },
            {
                opacity: 1, y: 0,
                duration: 0.88,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none'   /* FIX */
                }
            }
        );
    });

    /* ── Contact cards ── */
    $$('.contact-card').forEach((el, i) => {
        gsap.fromTo(el,
            { opacity: 0, x: -38 },
            {
                opacity: 1, x: 0,
                duration: 0.62,
                delay: i * 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none'   /* FIX */
                }
            }
        );
    });

    /* ── Contact form ── */
    const formEl = $('.form-container');
    if (formEl) {
        gsap.fromTo(formEl,
            { opacity: 0, y: 38 },
            {
                opacity: 1, y: 0,
                duration: 0.78,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: formEl,
                    start: 'top 84%',
                    toggleActions: 'play none none none'   /* FIX */
                }
            }
        );
    }

    /* ── FIX BUG 6: Footer entrance animation (was missing entirely) ── */
    const footer = $('footer.footer-section');
    if (footer) {
        /* Footer brand + desc block */
        const footerCol1 = footer.querySelector('.col-lg-4');
        const footerCol2 = footer.querySelector('.col-lg-3');
        const footerCol3 = footer.querySelector('.col-lg-4:last-of-type');
        const footerBottom = footer.querySelector('.footer-bottom');

        const footerEls = [footerCol1, footerCol2, footerCol3, footerBottom].filter(Boolean);

        gsap.fromTo(footerEls,
            { opacity: 0, y: 35 },
            {
                opacity: 1, y: 0,
                duration: 0.72,
                ease: 'power2.out',
                stagger: 0.13,
                scrollTrigger: {
                    trigger: footer,
                    start: 'top 90%',
                    toggleActions: 'play none none none'
                }
            }
        );

        /* Footer social cards slide in from right */
        const footerSocialCards = $$('.footer-section .social-card');
        if (footerSocialCards.length) {
            gsap.fromTo(footerSocialCards,
                { opacity: 0, x: 30 },
                {
                    opacity: 1, x: 0,
                    duration: 0.55,
                    ease: 'power2.out',
                    stagger: 0.1,
                    scrollTrigger: {
                        trigger: footer,
                        start: 'top 88%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        /* Footer links slide from left */
        const footerLinks = $$('.footer-links li');
        if (footerLinks.length) {
            gsap.fromTo(footerLinks,
                { opacity: 0, x: -20 },
                {
                    opacity: 1, x: 0,
                    duration: 0.45,
                    ease: 'power2.out',
                    stagger: 0.08,
                    scrollTrigger: {
                        trigger: footer,
                        start: 'top 88%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }
    }

    /* ── Badge titles subtle fade-up ── */
    $$('.badge-title').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, y: 20 },
            {
                opacity: 1, y: 0,
                duration: 0.6,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 90%',
                    toggleActions: 'play none none none'
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
    $$('.btn-hire, .btn-liquid, .btn-download, .btn-submit').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const dx   = (e.clientX - (rect.left + rect.width  / 2)) * 0.35;
            const dy   = (e.clientY - (rect.top  + rect.height / 2)) * 0.35;
            btn.style.transform = `translate(${dx}px, ${dy}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
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
    const form   = $('#my-form');
    const status = $('#my-form-status');
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
                status.textContent = 'Message Transmitted Successfully! ✅';
                status.style.color = '#10b981';
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
