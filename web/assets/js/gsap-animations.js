// GSAP Animaties voor Gordijn Studio
// Veilige aanpak: content is altijd zichtbaar, GSAP voegt animatie toe als enhancement

(function () {
    if (typeof gsap === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    if (typeof ScrollToPlugin !== 'undefined') gsap.registerPlugin(ScrollToPlugin);

    // Markeer body zodat CSS weet dat GSAP actief is
    document.documentElement.classList.add('gsap-ready');

    // ═══════════════════════════════════════
    // 1. HERO — stagger tekst reveal na loading screen
    // ═══════════════════════════════════════
    var heroTl = gsap.timeline({ paused: true });

    heroTl
        .from('.hero-content-lecrance', {
            opacity: 0, y: 30, duration: 1, ease: 'power3.out'
        })
        .from('.hero-title-surana', {
            opacity: 0, y: 50, duration: 1.2, ease: 'power3.out'
        }, '-=0.8')
        .from('.hero-quote-box', {
            opacity: 0, y: 30, duration: 1, ease: 'power3.out'
        }, '-=0.8')
        .from('.hero-actions', {
            opacity: 0, y: 20, duration: 0.8, ease: 'power3.out'
        }, '-=0.6')
        .from('.scroll-indicator', {
            opacity: 0, duration: 1, ease: 'power2.out'
        }, '-=0.4');

    // Start hero animatie na loading screen (of direct als er geen loading screen is)
    var loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(function () { heroTl.play(); }, 6800);
    } else {
        heroTl.play();
    }

    // ═══════════════════════════════════════
    // 2. PARALLAX — achtergrondbeelden bewegen bij scroll
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
        var mirrorTl = gsap.timeline({
            scrollTrigger: {
                trigger: mirror,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });

        var l1 = mirror.querySelector('.parallax-layer--1');
        var l2 = mirror.querySelector('.parallax-layer--2');
        var l3 = mirror.querySelector('.parallax-layer--3');

        if (l1) mirrorTl.to(l1, { yPercent: -15, opacity: 0.7, duration: 1 }, 0);
        if (l2) mirrorTl.fromTo(l2,
            { yPercent: 20, opacity: 0 },
            { yPercent: -10, opacity: 0.6, duration: 1 }, 0);
        if (l3) mirrorTl.fromTo(l3,
            { yPercent: 30, opacity: 0 },
            { yPercent: -20, opacity: 0.9, duration: 1 }, 0);

        mirrorTl.to('.parallax-text h2', { scale: 1.08, duration: 1 }, 0);
    }

    // ═══════════════════════════════════════
    // 4. MANIFESTO — tekst reveal bij scroll
    // ═══════════════════════════════════════
    gsap.from('.manifesto-label', {
        opacity: 0, y: 20, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: '.manifesto-content', start: 'top 85%' }
    });
    gsap.from('.manifesto-text', {
        opacity: 0, y: 40, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: '.manifesto-content', start: 'top 80%' }
    });
    gsap.from('.manifesto-signature', {
        opacity: 0, y: 20, duration: 0.8, delay: 0.2, ease: 'power3.out',
        scrollTrigger: { trigger: '.manifesto-content', start: 'top 80%' }
    });

    // ═══════════════════════════════════════
    // 5. SECTION HEADERS — nummer + titel reveal
    // ═══════════════════════════════════════
    gsap.utils.toArray('.section-header-lecrance').forEach(function (header) {
        gsap.from(header.children, {
            opacity: 0, y: 30, duration: 0.8, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: header, start: 'top 88%' }
        });
    });

    // ═══════════════════════════════════════
    // 6. OFFER GRID (AANBOD) — stagger kaarten
    // ═══════════════════════════════════════
    var offerGrid = document.querySelector('.offer-grid');
    if (offerGrid) {
        var offerCards = gsap.utils.toArray('.offer-card');
        gsap.set(offerCards, { opacity: 0, y: 60 });

        ScrollTrigger.create({
            trigger: offerGrid,
            start: 'top 80%',
            onEnter: function () {
                gsap.to(offerCards, {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    stagger: 0.15,
                    ease: 'power3.out'
                });
            },
            once: true
        });

        // Hover animatie
        offerCards.forEach(function (card) {
            var img = card.querySelector('.offer-visual img');
            if (!img) return;
            card.addEventListener('mouseenter', function () {
                gsap.to(img, { scale: 1.05, duration: 0.6, ease: 'power2.out' });
            });
            card.addEventListener('mouseleave', function () {
                gsap.to(img, { scale: 1, duration: 0.6, ease: 'power2.out' });
            });
        });
    }

    // ═══════════════════════════════════════
    // 7. PROPERTIES — kaarten stagger + hover
    // ═══════════════════════════════════════
    var propItems = gsap.utils.toArray('.property-item');
    if (propItems.length) {
        gsap.from(propItems, {
            opacity: 0, y: 60, duration: 0.9, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: '.properties-grid-lecrance', start: 'top 82%' }
        });

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
    // 8. COLLECTION — kaarten stagger + hover
    // ═══════════════════════════════════════
    var cards = gsap.utils.toArray('.collection-card');
    if (cards.length) {
        gsap.from(cards, {
            opacity: 0, y: 50, duration: 0.8, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: '.collection-grid', start: 'top 82%' }
        });

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
    // 9. CRAFT SECTION — split reveal + stats counter
    // ═══════════════════════════════════════
    var craftContent = document.querySelector('.craft-content');
    if (craftContent) {
        gsap.from(craftContent.querySelectorAll('.section-header-lecrance, .craft-title, .craft-text, .craft-stats'), {
            opacity: 0, x: -40, duration: 0.9, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: craftContent, start: 'top 75%' }
        });

        // Stats counter animatie
        gsap.utils.toArray('.stat').forEach(function (stat) {
            var numEl = stat.querySelector('.stat-num');
            if (!numEl) return;
            var text = numEl.textContent.trim();
            var num = parseInt(text.replace(/\D/g, ''));
            var suffix = text.replace(/[0-9]/g, '');
            if (isNaN(num)) return;

            var obj = { val: 0 };

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
    // 9. PROCESS STEPS — stagger reveal
    // ═══════════════════════════════════════
    var steps = gsap.utils.toArray('.process-step');
    if (steps.length) {
        gsap.from(steps, {
            opacity: 0, y: 40, duration: 0.8, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: '.process-steps', start: 'top 82%' }
        });
    }

    // ═══════════════════════════════════════
    // 10. CTA — tekst reveal
    // ═══════════════════════════════════════
    var ctaContent = document.querySelector('.cta-content-lecrance');
    if (ctaContent) {
        gsap.from(ctaContent.children, {
            opacity: 0, y: 30, duration: 0.8, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: ctaContent, start: 'top 80%' }
        });
    }

    // ═══════════════════════════════════════
    // 11. CONTACT — info + form reveal
    // ═══════════════════════════════════════
    gsap.from('.contact-info-lecrance', {
        opacity: 0, x: -30, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '.contact-grid-lecrance', start: 'top 82%' }
    });
    gsap.from('.contact-form-lecrance', {
        opacity: 0, x: 30, duration: 0.9, delay: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: '.contact-grid-lecrance', start: 'top 82%' }
    });

    // ═══════════════════════════════════════
    // 12. FOOTER — reveal
    // ═══════════════════════════════════════
    var footerGrid = document.querySelector('.footer-grid');
    if (footerGrid) {
        gsap.from(footerGrid.children, {
            opacity: 0, y: 20, duration: 0.7, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: footerGrid, start: 'top 92%' }
        });
    }

    // ═══════════════════════════════════════
    // 13. SMOOTH SCROLL — anchor links
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
