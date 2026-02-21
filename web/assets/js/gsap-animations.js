// GSAP Animaties voor Gordijn Studio
// Alle scroll-driven en interactieve animaties

(function () {
    if (typeof gsap === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    if (typeof ScrollToPlugin !== 'undefined') gsap.registerPlugin(ScrollToPlugin);

    // Helper: scroll-triggered reveal
    function reveal(targets, vars) {
        var defaults = {
            opacity: 0,
            y: 40,
            duration: 1,
            ease: 'power3.out'
        };
        var merged = Object.assign({}, defaults, vars);
        var trigger = merged.scrollTriggerEl || targets;
        delete merged.scrollTriggerEl;

        merged.scrollTrigger = {
            trigger: trigger,
            start: merged.start || 'top 85%',
            toggleActions: 'play none none none'
        };
        delete merged.start;

        gsap.from(targets, merged);
    }

    // ═══════════════════════════════════════
    // 1. HERO — stagger tekst reveal na loading screen
    // ═══════════════════════════════════════
    var heroElements = document.querySelectorAll('.hero-content-lecrance > *');
    if (heroElements.length) {
        // Verberg hero content tot na loading screen
        gsap.set(heroElements, { opacity: 0, y: 40 });

        setTimeout(function () {
            var tl = gsap.timeline();

            tl.to('.hero-kicker', {
                opacity: 1, y: 0, duration: 0.8, ease: 'power3.out'
            })
            .to('.hero-title-lecrance .line', {
                opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power4.out'
            }, '-=0.5')
            .to('.hero-subtitle-lecrance', {
                opacity: 1, y: 0, duration: 0.8, ease: 'power3.out'
            }, '-=0.6')
            .to('.hero-cta', {
                opacity: 1, y: 0, duration: 0.8, ease: 'power3.out'
            }, '-=0.5')
            .to('.scroll-indicator', {
                opacity: 1, duration: 0.6, ease: 'power2.out'
            }, '-=0.3');
        }, 6800);

        gsap.set('.scroll-indicator', { opacity: 0 });
    }

    // ═══════════════════════════════════════
    // 2. PARALLAX — hero, cta, craft achtergrondbeelden
    // ═══════════════════════════════════════
    gsap.utils.toArray('[data-parallax]').forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
        var section = el.closest('section') || el.parentElement;

        gsap.to(el, {
            yPercent: speed * 20,
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    });

    // ═══════════════════════════════════════
    // 3. PARALLAX MIRROR — multi-layer scroll sectie
    // ═══════════════════════════════════════
    var mirror = document.querySelector('.parallax-mirror-section');
    if (mirror) {
        var layer1 = mirror.querySelector('.parallax-layer--1');
        var layer2 = mirror.querySelector('.parallax-layer--2');
        var layer3 = mirror.querySelector('.parallax-layer--3');

        var mirrorTl = gsap.timeline({
            scrollTrigger: {
                trigger: mirror,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });

        if (layer1) mirrorTl.to(layer1, { yPercent: -15, opacity: 0.7, duration: 1 }, 0);
        if (layer2) mirrorTl.fromTo(layer2,
            { yPercent: 20, opacity: 0 },
            { yPercent: -10, opacity: 0.6, duration: 1 }, 0);
        if (layer3) mirrorTl.fromTo(layer3,
            { yPercent: 30, opacity: 0 },
            { yPercent: -20, opacity: 0.9, duration: 1 }, 0);

        mirrorTl.to('.parallax-text h2', { scale: 1.08, duration: 1 }, 0);
    }

    // ═══════════════════════════════════════
    // 4. MANIFESTO — tekst reveal
    // ═══════════════════════════════════════
    var manifesto = document.querySelector('.manifesto-content');
    if (manifesto) {
        reveal('.manifesto-label', { y: 20, duration: 0.6, start: 'top 85%', scrollTriggerEl: manifesto });
        reveal('.manifesto-text', { y: 50, duration: 1.2, start: 'top 80%', scrollTriggerEl: manifesto });
        reveal('.manifesto-signature', { y: 20, opacity: 0, duration: 0.8, delay: 0.3, start: 'top 80%', scrollTriggerEl: manifesto });
    }

    // ═══════════════════════════════════════
    // 5. PROPERTIES — stagger kaarten
    // ═══════════════════════════════════════
    var propGrid = document.querySelector('.properties-grid-lecrance');
    if (propGrid) {
        var propItems = gsap.utils.toArray('.property-item');
        gsap.set(propItems, { opacity: 0, y: 60 });

        ScrollTrigger.create({
            trigger: propGrid,
            start: 'top 80%',
            onEnter: function () {
                gsap.to(propItems, {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    stagger: 0.15,
                    ease: 'power3.out'
                });
            },
            once: true
        });

        // Hover
        propItems.forEach(function (card) {
            var img = card.querySelector('.property-visual img');
            if (!img) return;
            card.addEventListener('mouseenter', function () {
                gsap.to(img, { scale: 1.06, duration: 0.5, ease: 'power2.out' });
            });
            card.addEventListener('mouseleave', function () {
                gsap.to(img, { scale: 1, duration: 0.5, ease: 'power2.out' });
            });
        });
    }

    // ═══════════════════════════════════════
    // 6. COLLECTION — stagger kaarten
    // ═══════════════════════════════════════
    var collGrid = document.querySelector('.collection-grid');
    if (collGrid) {
        var cards = gsap.utils.toArray('.collection-card');
        gsap.set(cards, { opacity: 0, y: 50 });

        ScrollTrigger.create({
            trigger: collGrid,
            start: 'top 80%',
            onEnter: function () {
                gsap.to(cards, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power3.out'
                });
            },
            once: true
        });

        // Hover
        cards.forEach(function (card) {
            var img = card.querySelector('.collection-visual img');
            var h3 = card.querySelector('h3');
            if (!img) return;
            card.addEventListener('mouseenter', function () {
                gsap.to(img, { scale: 1.05, duration: 0.4, ease: 'power2.out' });
                if (h3) gsap.to(h3, { y: -4, duration: 0.3, ease: 'power2.out' });
            });
            card.addEventListener('mouseleave', function () {
                gsap.to(img, { scale: 1, duration: 0.4, ease: 'power2.out' });
                if (h3) gsap.to(h3, { y: 0, duration: 0.3, ease: 'power2.out' });
            });
        });
    }

    // ═══════════════════════════════════════
    // 7. CRAFT SECTION — split reveal + stats counter
    // ═══════════════════════════════════════
    var craftContent = document.querySelector('.craft-content');
    if (craftContent) {
        var craftEls = craftContent.querySelectorAll('.section-header-lecrance, .craft-title, .craft-text, .craft-stats');
        gsap.set(craftEls, { opacity: 0, x: -40 });

        ScrollTrigger.create({
            trigger: craftContent,
            start: 'top 75%',
            onEnter: function () {
                gsap.to(craftEls, {
                    opacity: 1,
                    x: 0,
                    duration: 0.9,
                    stagger: 0.15,
                    ease: 'power3.out'
                });
            },
            once: true
        });

        // Stats counter
        gsap.utils.toArray('.stat').forEach(function (stat) {
            var numEl = stat.querySelector('.stat-num');
            if (!numEl) return;
            var text = numEl.textContent;
            var num = parseInt(text.replace(/\D/g, ''));
            var suffix = text.replace(/[0-9]/g, '');
            if (isNaN(num)) return;

            var obj = { val: 0 };
            numEl.textContent = '0' + suffix;

            ScrollTrigger.create({
                trigger: stat,
                start: 'top 85%',
                onEnter: function () {
                    gsap.to(obj, {
                        val: num,
                        duration: 2,
                        ease: 'power2.out',
                        onUpdate: function () {
                            numEl.textContent = Math.round(obj.val) + suffix;
                        }
                    });
                },
                once: true
            });
        });
    }

    // ═══════════════════════════════════════
    // 8. PROCESS STEPS — stagger + nummer animatie
    // ═══════════════════════════════════════
    var processGrid = document.querySelector('.process-steps');
    if (processGrid) {
        var steps = gsap.utils.toArray('.process-step');
        gsap.set(steps, { opacity: 0, y: 40 });

        ScrollTrigger.create({
            trigger: processGrid,
            start: 'top 80%',
            onEnter: function () {
                gsap.to(steps, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: 'power3.out'
                });
            },
            once: true
        });
    }

    // ═══════════════════════════════════════
    // 9. CONTACT — info + form reveal
    // ═══════════════════════════════════════
    var contactInfo = document.querySelector('.contact-info-lecrance');
    if (contactInfo) {
        gsap.set(contactInfo, { opacity: 0, y: 40 });
        ScrollTrigger.create({
            trigger: contactInfo,
            start: 'top 85%',
            onEnter: function () {
                gsap.to(contactInfo, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' });
            },
            once: true
        });
    }

    var contactForm = document.querySelector('.contact-form-lecrance');
    if (contactForm) {
        gsap.set(contactForm, { opacity: 0, y: 40 });
        ScrollTrigger.create({
            trigger: contactForm,
            start: 'top 85%',
            onEnter: function () {
                gsap.to(contactForm, { opacity: 1, y: 0, duration: 0.9, delay: 0.2, ease: 'power3.out' });
            },
            once: true
        });
    }

    // ═══════════════════════════════════════
    // 10. CTA SECTION — tekst reveal
    // ═══════════════════════════════════════
    var ctaContent = document.querySelector('.cta-content-lecrance');
    if (ctaContent) {
        gsap.set(ctaContent.children, { opacity: 0, y: 30 });
        ScrollTrigger.create({
            trigger: ctaContent,
            start: 'top 80%',
            onEnter: function () {
                gsap.to(ctaContent.children, {
                    opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out'
                });
            },
            once: true
        });
    }

    // ═══════════════════════════════════════
    // 11. FOOTER — reveal
    // ═══════════════════════════════════════
    var footerGrid = document.querySelector('.footer-grid');
    if (footerGrid) {
        gsap.set(footerGrid.children, { opacity: 0, y: 20 });
        ScrollTrigger.create({
            trigger: footerGrid,
            start: 'top 90%',
            onEnter: function () {
                gsap.to(footerGrid.children, {
                    opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out'
                });
            },
            once: true
        });
    }

    // ═══════════════════════════════════════
    // 12. SMOOTH SCROLL — anchor links
    // ═══════════════════════════════════════
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
