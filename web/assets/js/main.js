// Gordijn Studio by Kristof Kiekens - globale JS

(function () {
    // Header scroll effect
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', function () {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // Mobiel menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navWrapper = document.getElementById('navLinks'); // Dit is nu de wrapper (die ID navLinks behield)

    if (menuToggle && navWrapper) {
        menuToggle.addEventListener('click', function () {
            menuToggle.classList.toggle('active');
            navWrapper.classList.toggle('open');
            if (menuToggle.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Sluit menu bij klik op link
        navWrapper.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                menuToggle.classList.remove('active');
                navWrapper.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // Actieve nav-link op basis van scroll positie
    const sections = document.querySelectorAll('section[id]');
    function updateActiveNav() {
        var scrollY = window.scrollY + 120;
        sections.forEach(function (section) {
            var top = section.offsetTop;
            var height = section.offsetHeight;
            var id = section.getAttribute('id');
            var link = document.querySelector('.nav-links a[href="#' + id + '"]');
            if (link) {
                if (scrollY >= top && scrollY < top + height) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
        });
    }
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();
})();
