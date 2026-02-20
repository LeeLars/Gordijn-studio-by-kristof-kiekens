// Gordijn Studio - Home pagina logica

(function () {
    // Loading screen animatie sequentie:
    // 1. Zwart scherm (0.5s)
    // 2. Panelen schuiven open, onthullen logo (0.5s -> 1.7s)
    // 3. Schrijfeffect "by Kristof Kiekens" (2s -> 4.5s)
    // 4. Hele scherm fadet uit (5s -> 5.8s)
    var ls = document.getElementById('loading-screen');
    if (ls) {
        // Phase 1: Na 0.5s - panelen schuiven open, logo wordt zichtbaar
        setTimeout(function () {
            ls.classList.add('phase-split');
        }, 500);

        // Phase 2: Na 2s - schrijfeffect start (panelen zijn dan open)
        setTimeout(function () {
            ls.classList.add('phase-write');
        }, 2000);

        // Phase 3: Na 5s - alles fadet uit
        setTimeout(function () {
            ls.classList.add('phase-fade');
        }, 5000);

        // Cleanup: verwijder uit DOM
        setTimeout(function () {
            if (ls.parentNode) {
                ls.parentNode.removeChild(ls);
            }
        }, 6000);
    }

    // Scroll-in animaties via IntersectionObserver
    var fadeElements = document.querySelectorAll(
        '.about-grid, .service-card, .gallery-item, .contact-info, .contact-form-wrapper'
    );

    fadeElements.forEach(function (el) {
        el.classList.add('fade-in');
    });

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );

        fadeElements.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        fadeElements.forEach(function (el) {
            el.classList.add('visible');
        });
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
                    email: document.getElementById('email').value,
                    telefoon: document.getElementById('telefoon').value,
                    bericht: document.getElementById('bericht').value
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
