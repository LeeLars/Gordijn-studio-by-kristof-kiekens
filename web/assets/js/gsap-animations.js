// GSAP Animaties voor Gordijn Studio

(function () {
    // Wacht tot GSAP en ScrollTrigger geladen zijn
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP of ScrollTrigger niet geladen');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ── HERO ANIMATIES ──
    // Stagger animatie voor hero tekst na loading screen
    setTimeout(function () {
        gsap.from('.hero-kicker', {
            opacity: 0,
            y: 30,
            duration: 1,
            ease: 'power3.out'
        });

        gsap.from('.hero-title-lecrance .line', {
            opacity: 0,
            y: 100,
            duration: 1.2,
            stagger: 0.2,
            ease: 'power4.out',
            delay: 0.2
        });

        gsap.from('.hero-subtitle-lecrance', {
            opacity: 0,
            y: 30,
            duration: 1,
            ease: 'power3.out',
            delay: 0.6
        });

        gsap.from('.hero-cta', {
            opacity: 0,
            y: 30,
            duration: 1,
            ease: 'power3.out',
            delay: 0.8
        });

        gsap.from('.scroll-indicator', {
            opacity: 0,
            duration: 1,
            ease: 'power2.out',
            delay: 1.2
        });
    }, 6800); // Na loading screen

    // ── PARALLAX MIRROR MET GSAP SCROLLTRIGGER ──
    var parallaxMirror = document.querySelector('.parallax-mirror-section');
    if (parallaxMirror) {
        var layers = parallaxMirror.querySelectorAll('.parallax-layer');
        
        layers.forEach(function (layer, index) {
            var speed = parseFloat(layer.getAttribute('data-speed')) || 0.5;
            
            gsap.to(layer, {
                y: function () {
                    return -(100 * speed);
                },
                opacity: function () {
                    if (index === 0) return 0.6;
                    return 0.8;
                },
                ease: 'none',
                scrollTrigger: {
                    trigger: parallaxMirror,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        });

        // Parallax text scale effect
        gsap.to('.parallax-text h2', {
            scale: 1.1,
            ease: 'none',
            scrollTrigger: {
                trigger: parallaxMirror,
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            }
        });
    }

    // ── PROPERTIES GRID STAGGER ANIMATIE ──
    var propertyCards = gsap.utils.toArray('.property-item');
    if (propertyCards.length > 0) {
        gsap.from(propertyCards, {
            opacity: 0,
            y: 80,
            scale: 0.95,
            duration: 1,
            stagger: {
                amount: 0.6,
                from: 'start'
            },
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.properties-grid-lecrance',
                start: 'top 80%',
                toggleActions: 'play none none none'
            }
        });

        // Hover animatie voor property cards
        propertyCards.forEach(function (card) {
            var img = card.querySelector('.property-visual img');
            
            card.addEventListener('mouseenter', function () {
                gsap.to(img, {
                    scale: 1.08,
                    duration: 0.6,
                    ease: 'power2.out'
                });
            });
            
            card.addEventListener('mouseleave', function () {
                gsap.to(img, {
                    scale: 1,
                    duration: 0.6,
                    ease: 'power2.out'
                });
            });
        });
    }

    // ── COLLECTION CARDS STAGGER ──
    var collectionCards = gsap.utils.toArray('.collection-card');
    if (collectionCards.length > 0) {
        gsap.from(collectionCards, {
            opacity: 0,
            y: 60,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.collection-grid',
                start: 'top 75%',
                toggleActions: 'play none none none'
            }
        });

        // Hover animaties
        collectionCards.forEach(function (card) {
            var img = card.querySelector('.collection-visual img');
            var title = card.querySelector('h3');
            
            card.addEventListener('mouseenter', function () {
                gsap.to(img, {
                    scale: 1.05,
                    duration: 0.5,
                    ease: 'power2.out'
                });
                gsap.to(title, {
                    y: -5,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
            
            card.addEventListener('mouseleave', function () {
                gsap.to(img, {
                    scale: 1,
                    duration: 0.5,
                    ease: 'power2.out'
                });
                gsap.to(title, {
                    y: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });
    }

    // ── STATS COUNTER ANIMATIE ──
    var stats = gsap.utils.toArray('.stat');
    if (stats.length > 0) {
        stats.forEach(function (stat) {
            var numEl = stat.querySelector('.stat-num');
            if (!numEl) return;
            
            var text = numEl.textContent;
            var num = parseInt(text.replace(/\D/g, ''));
            var suffix = text.replace(/[0-9]/g, '');
            
            if (!isNaN(num)) {
                var obj = { val: 0 };
                
                gsap.to(obj, {
                    val: num,
                    duration: 2,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: stat,
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    },
                    onUpdate: function () {
                        numEl.textContent = Math.round(obj.val) + suffix;
                    }
                });
            }
        });
    }

    // ── PROCESS STEPS ANIMATIE ──
    var processSteps = gsap.utils.toArray('.process-step');
    if (processSteps.length > 0) {
        gsap.from(processSteps, {
            opacity: 0,
            x: -50,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.process-steps',
                start: 'top 75%',
                toggleActions: 'play none none none'
            }
        });

        // Nummer animatie
        processSteps.forEach(function (step) {
            var num = step.querySelector('.process-num');
            if (num) {
                gsap.from(num, {
                    scale: 0,
                    rotation: -180,
                    duration: 1,
                    ease: 'back.out(1.7)',
                    scrollTrigger: {
                        trigger: step,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                });
            }
        });
    }

    // ── MANIFESTO TEXT REVEAL ──
    var manifestoText = document.querySelector('.manifesto-text');
    if (manifestoText) {
        gsap.from(manifestoText, {
            opacity: 0,
            y: 50,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: manifestoText,
                start: 'top 80%',
                toggleActions: 'play none none none'
            }
        });
    }

    // ── CRAFT SECTION SPLIT REVEAL ──
    var craftContent = document.querySelector('.craft-content');
    if (craftContent) {
        var craftElements = craftContent.querySelectorAll('.section-header-lecrance, .craft-title, .craft-text, .craft-stats');
        
        gsap.from(craftElements, {
            opacity: 0,
            x: -60,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: craftContent,
                start: 'top 70%',
                toggleActions: 'play none none none'
            }
        });
    }

    // ── CONTACT FORM ANIMATIE ──
    var contactForm = document.querySelector('.contact-form-lecrance');
    if (contactForm) {
        var formFields = contactForm.querySelectorAll('.form-field-lecrance, .form-row, .btn-submit');
        
        gsap.from(formFields, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: contactForm,
                start: 'top 80%',
                toggleActions: 'play none none none'
            }
        });
    }

    // ── SECTION HEADERS ANIMATIE ──
    var sectionHeaders = gsap.utils.toArray('.section-header-lecrance');
    sectionHeaders.forEach(function (header) {
        gsap.from(header, {
            opacity: 0,
            y: 40,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: header,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    // ── SMOOTH SCROLL VOOR ANCHOR LINKS ──
    var anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href === '#') return;
            
            var target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                gsap.to(window, {
                    duration: 1.2,
                    scrollTo: {
                        y: target,
                        offsetY: 80
                    },
                    ease: 'power3.inOut'
                });
            }
        });
    });

    // ── PARALLAX VOOR HERO/CTA/CRAFT IMAGES ──
    var parallaxImages = gsap.utils.toArray('[data-parallax]');
    parallaxImages.forEach(function (img) {
        var speed = parseFloat(img.getAttribute('data-parallax')) || 0.2;
        
        gsap.to(img, {
            y: function () {
                return 100 * speed;
            },
            ease: 'none',
            scrollTrigger: {
                trigger: img.closest('section'),
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });
    });

    console.log('GSAP animaties geïnitialiseerd');
})();
