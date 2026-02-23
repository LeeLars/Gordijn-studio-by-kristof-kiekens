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

    // ════════════════════════════════════════════════════════════
    // GALLERY - Dynamisch laden uit CMS + Swipe functionaliteit
    // ════════════════════════════════════════════════════════════
    var API_BASE = window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api'
        : 'https://gordijn-studio-by-kristof-kiekens-production.up.railway.app/api';
    
    var galleryTrack = document.getElementById('galleryTrack');
    var galleryWrapper = document.getElementById('galleryWrapper');
    
    // Laad gallery afbeeldingen uit CMS
    function loadGallery() {
        if (!galleryTrack) return;
        
        fetch(API_BASE + '/settings')
            .then(function (r) { return r.json(); })
            .then(function (res) {
                if (res.success && res.data && res.data.gallery && res.data.gallery.length > 0) {
                    var images = res.data.gallery;
                    renderGallery(images);
                } else {
                    // Fallback: standaard afbeeldingen
                    renderGalleryFallback();
                }
            })
            .catch(function () {
                renderGalleryFallback();
            });
    }
    
    function renderGallery(images) {
        var html = '';
        images.forEach(function (img, idx) {
            html += '<div class="gallery-item">' +
                '<img src="' + img + '" alt="Gordijn project ' + (idx + 1) + '" />' +
            '</div>';
        });
        // Duplicaten voor naadloze scroll
        images.forEach(function (img, idx) {
            html += '<div class="gallery-item">' +
                '<img src="' + img + '" alt="Gordijn project ' + (idx + 1) + '" />' +
            '</div>';
        });
        galleryTrack.innerHTML = html;
    }
    
    function renderGalleryFallback() {
        var fallbackImages = [
            '../assets/images/image-aalter.jpg',
            '../assets/images/image-knesselare.jpg',
            '../assets/images/paneelgordijn.jpg',
            '../assets/images/rolgordijnen.jpg',
            '../assets/images/shutters.jpg',
            '../assets/images/image-knesselare-2.jpg'
        ];
        renderGallery(fallbackImages);
    }
    
    // Swipe / Drag functionaliteit
    var isDragging = false;
    var startX;
    var scrollLeft;
    
    if (galleryWrapper) {
        galleryWrapper.addEventListener('mousedown', function (e) {
            isDragging = true;
            galleryWrapper.classList.add('grabbing');
            startX = e.pageX - galleryWrapper.offsetLeft;
            scrollLeft = galleryWrapper.scrollLeft;
            galleryTrack.style.animationPlayState = 'paused';
        });
        
        galleryWrapper.addEventListener('mouseleave', function () {
            isDragging = false;
            galleryWrapper.classList.remove('grabbing');
            galleryTrack.style.animationPlayState = 'running';
        });
        
        galleryWrapper.addEventListener('mouseup', function () {
            isDragging = false;
            galleryWrapper.classList.remove('grabbing');
            galleryTrack.style.animationPlayState = 'running';
        });
        
        galleryWrapper.addEventListener('mousemove', function (e) {
            if (!isDragging) return;
            e.preventDefault();
            var x = e.pageX - galleryWrapper.offsetLeft;
            var walk = (x - startX) * 2;
            galleryWrapper.scrollLeft = scrollLeft - walk;
        });
        
        // Touch events voor mobile
        galleryWrapper.addEventListener('touchstart', function (e) {
            startX = e.touches[0].pageX - galleryWrapper.offsetLeft;
            scrollLeft = galleryWrapper.scrollLeft;
            galleryTrack.style.animationPlayState = 'paused';
        }, { passive: true });
        
        galleryWrapper.addEventListener('touchend', function () {
            galleryTrack.style.animationPlayState = 'running';
        }, { passive: true });
        
        galleryWrapper.addEventListener('touchmove', function (e) {
            var x = e.touches[0].pageX - galleryWrapper.offsetLeft;
            var walk = (x - startX) * 2;
            galleryWrapper.scrollLeft = scrollLeft - walk;
        }, { passive: true });
    }
    
    // Initialiseer gallery
    loadGallery();

    // ════════════════════════════════════════════════════════════
    // LIGHTBOX - Gallery afbeeldingen in het groot bekijken
    // ════════════════════════════════════════════════════════════
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightboxImg');
    var lightboxClose = document.querySelector('.lightbox-close');
    var lightboxPrev = document.querySelector('.lightbox-prev');
    var lightboxNext = document.querySelector('.lightbox-next');
    var currentGalleryImages = [];
    var currentImageIndex = 0;

    function openLightbox(index) {
        if (currentGalleryImages.length === 0) return;
        currentImageIndex = index;
        lightboxImg.src = currentGalleryImages[index];
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
        lightboxImg.src = currentGalleryImages[currentImageIndex];
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % currentGalleryImages.length;
        lightboxImg.src = currentGalleryImages[currentImageIndex];
    }

    // Event listeners voor lightbox
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', function(e) {
            e.stopPropagation();
            showPrevImage();
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', function(e) {
            e.stopPropagation();
            showNextImage();
        });
    }

    // Sluiten bij klikken op achtergrond
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
                closeLightbox();
            }
        });
    }

    // Toetsenbord navigatie
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            showPrevImage();
        } else if (e.key === 'ArrowRight') {
            showNextImage();
        }
    });

    // Gallery items klikbaar maken na render
    function makeGalleryClickable() {
        var items = document.querySelectorAll('.gallery-item img');
        currentGalleryImages = [];
        
        items.forEach(function(img, index) {
            // Alleen unieke afbeeldingen toevoegen (niet de duplicaten voor scroll)
            if (index < items.length / 2) {
                currentGalleryImages.push(img.src);
            }
            
            img.addEventListener('click', function() {
                var actualIndex = index % (items.length / 2);
                openLightbox(actualIndex);
            });
        });
    }

    // Maak gallery klikbaar na laden
    setTimeout(makeGalleryClickable, 500);

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
