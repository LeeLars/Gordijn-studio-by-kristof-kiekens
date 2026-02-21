// Gordijn Studio - Home pagina logica

(function () {
    // Loading screen animatie sequentie:
    // 1. Zwart scherm (0.6s)
    // 2. Panelen schuiven open, onthullen Logo animatie.png (0.6s -> 1.8s)
    // 3. Fill animatie Logo.svg (mask schuift weg van L naar R) (2.2s -> 4.7s)
    // 4. Hele scherm fadet uit (6s -> 6.8s)
    var ls = document.getElementById('loading-screen');
    if (ls) {
        // Laad de SVG en injecteer de paden
        var svgEl = ls.querySelector('.logo-script');
        if (svgEl) {
            var basePath = '';
            var scripts = document.querySelectorAll('script[src]');
            for (var i = 0; i < scripts.length; i++) {
                var src = scripts[i].getAttribute('src');
                if (src.indexOf('home.js') !== -1) {
                    basePath = src.replace('js/pages/home.js', '');
                    break;
                }
            }
            fetch(basePath + 'images/Logo.svg')
                .then(function (r) { return r.text(); })
                .then(function (svgText) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(svgText, 'image/svg+xml');
                    var paths = doc.querySelectorAll('path');
                    paths.forEach(function (p, idx) {
                        var clone = p.cloneNode(true);
                        clone.removeAttribute('fill-opacity');
                        clone.removeAttribute('fill');
                        clone.style.transitionDelay = (idx * 0.1) + 's';
                        svgEl.appendChild(clone);
                    });
                    startAnimation();
                })
                .catch(function () {
                    startAnimation();
                });
        } else {
            startAnimation();
        }

        function startAnimation() {
            // Phase 1: Na 0.6s - panelen schuiven open, logo wordt zichtbaar
            setTimeout(function () {
                ls.classList.add('phase-split');
            }, 600);

            // Phase 2: Na 2.2s - fill animatie (mask schuift weg van L naar R)
            setTimeout(function () {
                ls.classList.add('phase-write');
            }, 2200);

            // Phase 3: Na 5.5s - tekenbord wisser veegt alles weg
            setTimeout(function () {
                ls.classList.add('phase-wipe');
            }, 5500);

            // Phase 4: Na 6.7s - loading screen verwijderd uit DOM
            setTimeout(function () {
                if (ls.parentNode) {
                    ls.parentNode.removeChild(ls);
                }
            }, 6700);
        }
    }

    // Reveal animaties via IntersectionObserver
    var revealElements = document.querySelectorAll('[data-reveal]');

    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
        );

        revealElements.forEach(function (el) {
            revealObserver.observe(el);
        });
    } else {
        revealElements.forEach(function (el) {
            el.classList.add('revealed');
        });
    }

    // Parallax scroll effect & Parallax Mirror animatie
    var parallaxElements = document.querySelectorAll('[data-parallax]');
    var parallaxMirrorSection = document.querySelector('.parallax-mirror-section');
    var parallaxLayers = document.querySelectorAll('.parallax-layer');

    if (parallaxElements.length > 0 || parallaxMirrorSection) {
        var ticking = false;

        function updateScroll() {
            var windowH = window.innerHeight;
            var scrollY = window.scrollY;

            // Parallax logic voor hero/cta/craft images
            parallaxElements.forEach(function (el) {
                var speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
                var rect = el.getBoundingClientRect();
                
                if (rect.bottom > 0 && rect.top < windowH) {
                    var offset = (rect.top - windowH / 2) * speed;
                    el.style.transform = 'translateY(' + offset + 'px) scale(1.1)';
                }
            });

            // Parallax Mirror Logic - meerdere layers met verschillende snelheden
            if (parallaxMirrorSection && parallaxLayers.length > 0) {
                var rect = parallaxMirrorSection.getBoundingClientRect();
                var sectionHeight = parallaxMirrorSection.offsetHeight;
                
                // Bereken scroll progress binnen de sectie
                var progress = 0;
                
                if (rect.top <= 0 && rect.bottom >= windowH) {
                    var scrollableDistance = sectionHeight - windowH;
                    var scrolled = -rect.top;
                    progress = Math.min(Math.max(scrolled / scrollableDistance, 0), 1);
                    parallaxMirrorSection.classList.add('scrolling');
                } else if (rect.top > 0) {
                    progress = 0;
                    parallaxMirrorSection.classList.remove('scrolling');
                } else {
                    progress = 1;
                    parallaxMirrorSection.classList.add('scrolling');
                }

                // Animeer elke layer met verschillende snelheden
                parallaxLayers.forEach(function (layer) {
                    var speed = parseFloat(layer.getAttribute('data-speed')) || 0.5;
                    var layerProgress = progress * speed;
                    
                    // Layer 1: Achtergrond beweegt langzaam omhoog
                    if (layer.classList.contains('parallax-layer--1')) {
                        var translateY = -layerProgress * 100;
                        layer.style.transform = 'scale(1.2) translateY(' + translateY + 'px)';
                        layer.style.opacity = 0.4 + (progress * 0.2);
                    }
                    
                    // Layer 2: Midden layer fade in en beweegt
                    if (layer.classList.contains('parallax-layer--2')) {
                        var translateY = 50 - (layerProgress * 100);
                        layer.style.transform = 'scale(1.1) translateY(' + translateY + 'px)';
                        layer.style.opacity = progress * 0.6;
                    }
                    
                    // Layer 3: Voorgrond layer fade in en beweegt snel
                    if (layer.classList.contains('parallax-layer--3')) {
                        var translateY = 100 - (layerProgress * 150);
                        layer.style.transform = 'scale(1.05) translateY(' + translateY + 'px)';
                        layer.style.opacity = progress * 0.8;
                    }
                });
            }

            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(updateScroll);
                ticking = true;
            }
        }, { passive: true });

        updateScroll();
    }

    // Contact formulier met API integratie
    var form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            var btn = form.querySelector('.btn');
            var originalText = btn.textContent;
            btn.textContent = 'Versturen...';
            btn.disabled = true;

            try {
                var data = {
                    naam: document.getElementById('naam').value,
                    telefoon: document.getElementById('telefoon').value,
                    email: document.getElementById('email').value,
                    voorkeur: document.getElementById('voorkeur') ? document.getElementById('voorkeur').value : ''
                };

                var API_BASE = window.location.hostname === 'localhost'
                    ? 'http://localhost:3000/api'
                    : 'https://gordijn-studio-by-kristof-kiekens-production.up.railway.app/api';

                var response = await fetch(API_BASE + '/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                var result = await response.json();

                if (result.success) {
                    btn.textContent = 'Verzonden!';
                    btn.style.background = 'var(--color-primary)';
                    form.reset();
                } else {
                    throw new Error(result.error || 'Er ging iets mis');
                }
            } catch (err) {
                console.error(err);
                btn.textContent = 'Fout - probeer opnieuw';
                btn.style.background = '#c0392b';
            }

            setTimeout(function () {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.disabled = false;
            }, 3000);
        });
    }
})();
