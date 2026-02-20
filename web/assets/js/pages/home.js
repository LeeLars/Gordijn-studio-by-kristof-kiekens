// Gordijn Studio - Home pagina logica

(function () {
    // Loading screen animatie sequentie
    var loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        // Stap 1: Na 300ms - toon logo (achter zwarte panelen)
        setTimeout(function () {
            loadingScreen.classList.add('show-logo');
        }, 300);

        // Stap 2: Na 1s - start schrijfeffect
        setTimeout(function () {
            loadingScreen.classList.add('show-script');
        }, 1000);

        // Stap 3: Na 3.5s - split de zwarte panelen open
        setTimeout(function () {
            loadingScreen.classList.add('split');
        }, 3500);

        // Stap 4: Na 5s - verwijder loading screen uit DOM
        setTimeout(function () {
            loadingScreen.classList.add('done');
            setTimeout(function () {
                if (loadingScreen && loadingScreen.parentNode) {
                    loadingScreen.parentNode.removeChild(loadingScreen);
                }
            }, 500);
        }, 5000);
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
