// Gordijnstudio Christophe Kiekens – GSAP Animaties
// Lecrance-stijl: subtiel, elegant, content altijd zichtbaar als fallback

(function () {
    if (typeof gsap === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    if (typeof ScrollToPlugin !== 'undefined') gsap.registerPlugin(ScrollToPlugin);

    var ease = 'power3.out';
    var easeSlow = 'power4.out';

    // ── HERO: cinematic stagger na loading screen ──
    var heroTl = gsap.timeline({ paused: true });

    heroTl
        .from('.hero-title .line', {
            opacity: 0, y: 80, duration: 1.4, stagger: 0.25, ease: easeSlow
        })
        .from('.hero-sub', {
            opacity: 0, y: 25, duration: 1, ease: ease
        }, '-=0.7')
        .from('.hero-actions', {
            opacity: 0, y: 20, duration: 0.9, ease: ease
        }, '-=0.6')
        .from('.scroll-indicator', {
            opacity: 0, y: -10, duration: 0.8, ease: ease
        }, '-=0.3');

    var ls = document.getElementById('loading-screen');
    if (ls) {
        setTimeout(function () { heroTl.play(); }, 5200);
    } else {
        heroTl.play();
    }

    // ── PARALLAX op hero beeld ──
    gsap.utils.toArray('[data-parallax]').forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
        var section = el.closest('section') || el.parentElement;
        gsap.to(el, {
            yPercent: speed * 20,
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    });

    // ── SECTION LABELS: line + text reveal ──
    gsap.utils.toArray('.section-label').forEach(function (label) {
        gsap.from(label, {
            opacity: 0, x: -20, duration: 0.8, ease: ease,
            scrollTrigger: { trigger: label, start: 'top 88%' }
        });
    });

    // ── INTRO: tekst reveal ──
    gsap.from('.intro-text', {
        opacity: 0, y: 40, duration: 1.2, ease: easeSlow,
        scrollTrigger: { trigger: '.intro-section', start: 'top 75%' }
    });
    gsap.from('.intro-accent', {
        opacity: 0, duration: 0.8, delay: 0.3, ease: ease,
        scrollTrigger: { trigger: '.intro-section', start: 'top 75%' }
    });

    // ── AANBOD: per item beeld + info reveal ──
    gsap.utils.toArray('.aanbod-item').forEach(function (item, i) {
        var img = item.querySelector('.aanbod-img');
        var info = item.querySelector('.aanbod-info');
        var isEven = i % 2 === 1;

        var tl = gsap.timeline({
            scrollTrigger: { trigger: item, start: 'top 80%' }
        });

        tl.from(img, {
            opacity: 0,
            x: isEven ? 40 : -40,
            duration: 1,
            ease: easeSlow
        })
        .from(info, {
            opacity: 0,
            y: 30,
            duration: 0.9,
            ease: ease
        }, '-=0.6');
    });

    // ── ERVARING: split reveal ──
    var ervaringTl = gsap.timeline({
        scrollTrigger: { trigger: '.ervaring-grid', start: 'top 75%' }
    });

    ervaringTl
        .from('.ervaring-visual', {
            opacity: 0, scale: 0.95, duration: 1.2, ease: easeSlow
        })
        .from('.ervaring-content .section-label', {
            opacity: 0, x: -15, duration: 0.6, ease: ease
        }, '-=0.7')
        .from('.ervaring-content h2', {
            opacity: 0, y: 30, duration: 0.9, ease: ease
        }, '-=0.4')
        .from('.ervaring-content p', {
            opacity: 0, y: 20, duration: 0.7, stagger: 0.1, ease: ease
        }, '-=0.5');

    // ── WERKWIJZE: stappen stagger ──
    var stappen = gsap.utils.toArray('.stap');
    if (stappen.length) {
        gsap.from(stappen, {
            opacity: 0, y: 35, duration: 0.8, stagger: 0.15, ease: ease,
            scrollTrigger: { trigger: '.stappen', start: 'top 80%' }
        });
    }

    gsap.from('.werkwijze-extra', {
        opacity: 0, y: 25, duration: 0.9, ease: ease,
        scrollTrigger: { trigger: '.werkwijze-extra', start: 'top 85%' }
    });

    // ── GORDIJN REVEAL: gordijnen schuiven open bij scroll ──
    var revealSection = document.querySelector('.reveal-section');
    if (revealSection) {
        var revealTl = gsap.timeline({
            scrollTrigger: {
                trigger: revealSection,
                start: 'top top',
                end: 'center center',
                scrub: 0.5,
                pin: false
            }
        });

        revealTl
            .to('.reveal-curtain.left', {
                xPercent: -100,
                ease: 'none'
            }, 0)
            .to('.reveal-curtain.right', {
                xPercent: 100,
                ease: 'none'
            }, 0)
            .to('.reveal-image', {
                scale: 1,
                ease: 'none'
            }, 0);
    }

    // ── CTA: donkere sectie reveal ──
    var ctaContent = document.querySelector('.cta-content');
    if (ctaContent) {
        gsap.from(ctaContent.children, {
            opacity: 0, y: 30, duration: 0.9, stagger: 0.2, ease: ease,
            scrollTrigger: { trigger: ctaContent, start: 'top 78%' }
        });
    }

    // ── CONTACT: info + form ──
    gsap.from('.contact-info', {
        opacity: 0, y: 30, duration: 1, ease: ease,
        scrollTrigger: { trigger: '.contact-grid', start: 'top 80%' }
    });

    gsap.from('.contact-form', {
        opacity: 0, y: 30, duration: 1, delay: 0.15, ease: ease,
        scrollTrigger: { trigger: '.contact-grid', start: 'top 80%' }
    });

    // ── FOOTER ──
    var footerContent = document.querySelector('.site-footer .footer-content');
    if (footerContent) {
        gsap.from(footerContent.children, {
            opacity: 0, y: 15, duration: 0.7, stagger: 0.1, ease: ease,
            scrollTrigger: { trigger: footerContent, start: 'top 92%' }
        });
    }

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
                        duration: 1.2,
                        scrollTo: { y: target, offsetY: 80 },
                        ease: 'power3.inOut'
                    });
                }
            });
        });
    }
})();
