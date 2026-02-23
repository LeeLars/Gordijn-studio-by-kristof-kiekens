// Gordijn Studio - Home pagina logica

(function () {
    // Loading screen animatie sequentie:
    // 1. Zwart scherm (0.6s)
    // 2. Panelen schuiven open, onthullen Logo animatie.png (0.6s -> 1.4s)
    // 3. Fill animatie Logo.svg (mask schuift weg van L naar R) (1.4s -> 3.9s)
    // 4. Hele scherm fadet uit (5s -> 5.8s)
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

            // Phase 2: Na 1.4s - fill animatie (mask schuift weg van L naar R)
            setTimeout(function () {
                ls.classList.add('phase-write');
            }, 1400);

            // Phase 3: Na 4s - tekenbord wisser veegt alles weg
            setTimeout(function () {
                ls.classList.add('phase-wipe');
            }, 4000);

            // Phase 4: Na 5.2s - loading screen verwijderd uit DOM
            setTimeout(function () {
                if (ls.parentNode) {
                    ls.parentNode.removeChild(ls);
                }
            }, 5200);
        }
    }

    // Alle reveal/scroll animaties worden afgehandeld door GSAP (zie gsap-animations.js)

    // Contact formulier met API integratie
    var form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            var btn = form.querySelector('.btn-submit');
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
