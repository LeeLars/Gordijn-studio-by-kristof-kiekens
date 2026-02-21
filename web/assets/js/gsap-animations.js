// Gordijnstudio Christophe Kiekens – GSAP Animaties
// Zachte fade-ins als enhancement, content altijd zichtbaar als fallback

(function () {
    if (typeof gsap === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    if (typeof ScrollToPlugin !== 'undefined') gsap.registerPlugin(ScrollToPlugin);

    // ── HERO: stagger reveal na loading screen ──
    var heroTl = gsap.timeline({ paused: true });

    heroTl
        .from('.hero-title .line', {
            opacity: 0, y: 60, duration: 1.2, stagger: 0.2, ease: 'power4.out'
        })
        .from('.hero-sub', {
            opacity: 0, y: 20, duration: 0.8, ease: 'power3.out'
        }, '-=0.6')
        .from('.hero-actions', {
            opacity: 0, y: 20, duration: 0.8, ease: 'power3.out'
        }, '-=0.5')
        .from('.scroll-indicator', {
            opacity: 0, duration: 0.6, ease: 'power2.out'
        }, '-=0.3');

    var ls = document.getElementById('loading-screen');
    if (ls) {
        setTimeout(function () { heroTl.play(); }, 6800);
    } else {
        heroTl.play();
    }

    // ── HERO PARALLAX ──
    gsap.utils.toArray('[data-parallax]').forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
        var section = el.closest('section') || el.parentElement;
        gsap.to(el, {
            yPercent: speed * 15,
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    });

    // ── INTRO ──
    gsap.from('.intro-text', {
        opacity: 0, y: 30, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.intro-section', start: 'top 80%' }
    });
    gsap.from('.intro-accent', {
        opacity: 0, y: 15, duration: 0.8, delay: 0.2, ease: 'power3.out',
        scrollTrigger: { trigger: '.intro-section', start: 'top 80%' }
    });

    // ── AANBOD: stagger items ──
    var aanbodItems = gsap.utils.toArray('.aanbod-item');
    aanbodItems.forEach(function (item) {
        var img = item.querySelector('.aanbod-img');
        var info = item.querySelector('.aanbod-info');

        gsap.from(img, {
            opacity: 0, x: -30, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: item, start: 'top 82%' }
        });

        gsap.from(info, {
            opacity: 0, x: 30, duration: 0.9, delay: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: item, start: 'top 82%' }
        });
    });

    // ── ERVARING: beeld + tekst ──
    gsap.from('.ervaring-visual', {
        opacity: 0, x: -40, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.ervaring-grid', start: 'top 78%' }
    });
    gsap.from('.ervaring-content', {
        opacity: 0, x: 40, duration: 1, delay: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: '.ervaring-grid', start: 'top 78%' }
    });

    // ── WERKWIJZE: stappen stagger ──
    var stappen = gsap.utils.toArray('.stap');
    if (stappen.length) {
        gsap.from(stappen, {
            opacity: 0, y: 30, duration: 0.7, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: '.stappen', start: 'top 82%' }
        });
    }

    gsap.from('.werkwijze-extra', {
        opacity: 0, y: 20, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.werkwijze-extra', start: 'top 85%' }
    });

    // ── CTA ──
    var ctaContent = document.querySelector('.cta-content');
    if (ctaContent) {
        gsap.from(ctaContent.children, {
            opacity: 0, y: 25, duration: 0.8, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: ctaContent, start: 'top 80%' }
        });
    }

    // ── CONTACT: info + form ──
    gsap.from('.contact-info', {
        opacity: 0, x: -30, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '.contact-grid', start: 'top 82%' }
    });
    gsap.from('.contact-form', {
        opacity: 0, x: 30, duration: 0.9, delay: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.contact-grid', start: 'top 82%' }
    });

    // ── FOOTER ──
    var footerContent = document.querySelector('.site-footer .footer-content');
    if (footerContent) {
        gsap.from(footerContent.children, {
            opacity: 0, y: 15, duration: 0.7, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: footerContent, start: 'top 92%' }
        });
    }

    // ── SECTION LINES: subtle reveal ──
    gsap.utils.toArray('.section-line').forEach(function (line) {
        gsap.from(line, {
            scaleX: 0, transformOrigin: 'left center', duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: line, start: 'top 88%' }
        });
    });

    // ── SMOOTH SCROLL ──
    if (typeof ScrollToPlugin !== 'undefined') {
        document.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                var href = this.getAttribute('href');
                if (href === '#') return;
                var target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    gsap.to(window, {
                        duration: 1,
                        scrollTo: { y: target, offsetY: 80 },
                        ease: 'power3.inOut'
                    });
                }
            });
        });
    }
})();
