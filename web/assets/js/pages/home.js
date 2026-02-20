// Gordijn Studio - Home pagina logica

(function () {
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

    // Contact formulier basis handling
    var form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var btn = form.querySelector('.btn');
            btn.textContent = 'Verzonden!';
            btn.style.background = 'var(--color-primary)';
            setTimeout(function () {
                btn.textContent = 'Verstuur';
                btn.style.background = '';
                form.reset();
            }, 2500);
        });
    }
})();
