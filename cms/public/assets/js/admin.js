(function () {
  var CMS_PASSWORD = 'admin123';
  var API_BASE = '/api';

  var loginScreen = document.getElementById('loginScreen');
  var cmsApp = document.getElementById('cmsApp');
  var loginForm = document.getElementById('loginForm');
  var loginError = document.getElementById('loginError');
  var btnLogout = document.getElementById('btnLogout');
  var togglePassword = document.getElementById('togglePassword');
  var passwordInput = document.getElementById('password');

  // Check session
  if (sessionStorage.getItem('cms_auth') === 'true') {
    showDashboard();
  }

  // Toggle password visibility
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
      var type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // Toggle icons
      var eyeIcon = togglePassword.querySelector('.eye-icon');
      var eyeOffIcon = togglePassword.querySelector('.eye-off-icon');
      
      if (eyeIcon && eyeOffIcon) {
        if (type === 'text') {
          eyeIcon.style.display = 'none';
          eyeOffIcon.style.display = 'block';
          togglePassword.setAttribute('aria-label', 'Verberg wachtwoord');
        } else {
          eyeIcon.style.display = 'block';
          eyeOffIcon.style.display = 'none';
          togglePassword.setAttribute('aria-label', 'Toon wachtwoord');
        }
      }
    });
  }

  // Login
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var pw = document.getElementById('password').value;
    if (pw === CMS_PASSWORD) {
      sessionStorage.setItem('cms_auth', 'true');
      loginError.textContent = '';
      showDashboard();
    } else {
      loginError.textContent = 'Ongeldig wachtwoord';
    }
  });

  // Logout
  btnLogout.addEventListener('click', function () {
    sessionStorage.removeItem('cms_auth');
    cmsApp.style.display = 'none';
    loginScreen.style.display = 'flex';
    document.getElementById('password').value = '';
  });

  function showDashboard() {
    loginScreen.style.display = 'none';
    cmsApp.style.display = 'block';
    loadSettings();
  }

  // Load settings from API
  function loadSettings() {
    fetch(API_BASE + '/settings')
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.success && res.data) {
          var d = res.data;
          // Contact fields
          if (d.contact) {
            document.getElementById('settTelefoon').value = d.contact.telefoon || '';
            document.getElementById('settEmail').value = d.contact.email || '';
            document.getElementById('settOndernemingsnummer').value = d.contact.ondernemingsnummer || '';
          }
          // Image previews
          if (d.images) {
            setPreview('hero', d.images.hero);
            setPreview('stickyCircle', d.images.stickyCircle);
            setPreview('overOns', d.images.overOns);
            setPreview('cta', d.images.cta);
            if (d.images.aanbod) {
              Object.keys(d.images.aanbod).forEach(function (key) {
                setPreview('aanbod-' + key, d.images.aanbod[key]);
              });
            }
          }
        }
      })
      .catch(function (err) {
        console.error('Settings laden mislukt:', err);
      });
  }

  function setPreview(id, url) {
    var el = document.getElementById('preview-' + id);
    if (!el || !url) return;
    while (el.firstChild) { el.removeChild(el.firstChild); }
    var img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.onerror = function() {
      console.error('Afbeelding laden mislukt:', url);
    };
    el.appendChild(img);
  }

  // Save contact settings
  var contactForm = document.getElementById('contactSettingsForm');
  var contactStatus = document.getElementById('contactStatus');

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {
      contact: {
        telefoon: document.getElementById('settTelefoon').value,
        email: document.getElementById('settEmail').value,
        ondernemingsnummer: document.getElementById('settOndernemingsnummer').value
      }
    };

    fetch(API_BASE + '/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.success) {
          showStatus(contactStatus, 'Opgeslagen');
        }
      })
      .catch(function () {
        showStatus(contactStatus, 'Fout bij opslaan');
      });
  });

  function showStatus(el, text) {
    el.textContent = text;
    el.classList.add('visible');
    setTimeout(function () {
      el.classList.remove('visible');
    }, 2500);
  }

  // Image uploads
  var fileInputs = document.querySelectorAll('.cms-file-input');
  fileInputs.forEach(function (input) {
    input.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;

      var target = input.getAttribute('data-target');
      var card = input.closest('.cms-image-card');
      card.classList.add('uploading');

      var reader = new FileReader();
      reader.onload = function (ev) {
        var base64 = ev.target.result;

        // Upload to Cloudinary via API
        fetch(API_BASE + '/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, folder: 'gordijnstudio' })
        })
          .then(function (r) { return r.json(); })
          .then(function (res) {
            card.classList.remove('uploading');
            if (res.success && res.data) {
              // Update preview
              var previewId = target.replace('.', '-');
              setPreview(previewId, res.data.url);

              // Save URL to settings
              saveImageUrl(target, res.data.url);
            }
          })
          .catch(function (err) {
            card.classList.remove('uploading');
            console.error('Upload mislukt:', err);
          });
      };
      reader.readAsDataURL(file);
    });
  });

  function saveImageUrl(target, url) {
    // First get current settings
    fetch(API_BASE + '/settings')
      .then(function (r) { return r.json(); })
      .then(function (res) {
        var settings = res.data || {};
        if (!settings.images) settings.images = {};

        var parts = target.split('.');
        if (parts.length === 2) {
          // Nested: aanbod.overgordijnen
          if (!settings.images[parts[0]]) settings.images[parts[0]] = {};
          settings.images[parts[0]][parts[1]] = url;
        } else {
          settings.images[target] = url;
        }

        return fetch(API_BASE + '/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: settings.images })
        });
      })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.success) {
          console.log('Afbeelding opgeslagen:', target);
        }
      })
      .catch(function (err) {
        console.error('Afbeelding opslaan mislukt:', err);
      });
  }

  // ════════════════════════════════════════════════════════════
  // MEDIA LIBRARY
  // ════════════════════════════════════════════════════════════
  var mediaLibraryModal = document.getElementById('mediaLibraryModal');
  var closeMediaLibrary = document.getElementById('closeMediaLibrary');
  var cancelMediaLibrary = document.getElementById('cancelMediaLibrary');
  var selectMediaLibrary = document.getElementById('selectMediaLibrary');
  var mediaLibraryGrid = document.getElementById('mediaLibraryGrid');
  var libraryUploadInput = document.getElementById('libraryUploadInput');
  var uploadZone = document.getElementById('uploadZone');
  
  var currentImageTarget = null;
  var selectedLibraryImage = null;
  var libraryImages = [];

  // Open media library when clicking on image cards
  var imageCards = document.querySelectorAll('.cms-image-card');
  imageCards.forEach(function(card) {
    card.addEventListener('click', function(e) {
      // Don't open if clicking on delete button
      if (e.target.closest('.delete-btn')) return;
      
      currentImageTarget = card.getAttribute('data-key');
      openMediaLibrary();
    });
  });

  function openMediaLibrary() {
    selectedLibraryImage = null;
    mediaLibraryModal.classList.add('active');
    loadMediaLibrary();
  }

  function closeMediaLibraryModal() {
    mediaLibraryModal.classList.remove('active');
    currentImageTarget = null;
    selectedLibraryImage = null;
  }

  closeMediaLibrary.addEventListener('click', closeMediaLibraryModal);
  cancelMediaLibrary.addEventListener('click', closeMediaLibraryModal);
  mediaLibraryModal.querySelector('.media-library-overlay').addEventListener('click', closeMediaLibraryModal);

  // Select image
  selectMediaLibrary.addEventListener('click', function() {
    if (selectedLibraryImage && currentImageTarget) {
      // Update preview
      var previewId = currentImageTarget.replace('.', '-');
      setPreview(previewId, selectedLibraryImage.url);
      
      // Save URL to settings
      saveImageUrl(currentImageTarget, selectedLibraryImage.url);
      
      closeMediaLibraryModal();
    }
  });

  // Load media library
  function loadMediaLibrary() {
    mediaLibraryGrid.innerHTML = '<p class="media-library-empty">Laden...</p>';
    
    fetch(API_BASE + '/library')
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.success) {
          libraryImages = res.data || [];
          renderMediaLibrary();
        }
      })
      .catch(function(err) {
        console.error('Media library laden mislukt:', err);
        mediaLibraryGrid.innerHTML = '<p class="media-library-empty">Fout bij laden</p>';
      });
  }

  function renderMediaLibrary() {
    if (libraryImages.length === 0) {
      mediaLibraryGrid.innerHTML = 
        '<div class="media-library-empty">' +
        '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>' +
        '<p>Geen afbeeldingen in bibliotheek</p>' +
        '</div>';
      return;
    }

    mediaLibraryGrid.innerHTML = '';
    libraryImages.forEach(function(image) {
      var item = document.createElement('div');
      item.className = 'media-library-item';
      item.setAttribute('data-id', image.id);
      item.innerHTML = 
        '<img src="' + image.thumbnail + '" alt="">' +
        '<button class="delete-btn" data-id="' + image.id + '">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
        '</button>' +
        '<div class="select-indicator">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
        '</div>';
      
      // Select image
      item.addEventListener('click', function(e) {
        if (e.target.closest('.delete-btn')) {
          deleteLibraryImage(image.id);
          return;
        }
        
        // Deselect previous
        document.querySelectorAll('.media-library-item').forEach(function(el) {
          el.classList.remove('selected');
        });
        
        // Select this one
        item.classList.add('selected');
        selectedLibraryImage = image;
      });

      mediaLibraryGrid.appendChild(item);
    });
  }

  // Delete library image
  function deleteLibraryImage(id) {
    if (!confirm('Afbeelding verwijderen?')) return;
    
    fetch(API_BASE + '/library/' + encodeURIComponent(id), {
      method: 'DELETE'
    })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.success) {
          loadMediaLibrary();
        }
      })
      .catch(function(err) {
        console.error('Verwijderen mislukt:', err);
      });
  }

  // Upload to library
  libraryUploadInput.addEventListener('change', function(e) {
    var files = e.target.files;
    if (!files.length) return;
    
    // Validate file type
    var file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Alleen afbeeldingen zijn toegestaan');
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Bestand is te groot. Maximum 10MB.');
      return;
    }
    
    uploadToLibrary(file);
    
    // Reset input so same file can be selected again
    libraryUploadInput.value = '';
  });

  // Drag and drop
  uploadZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });

  uploadZone.addEventListener('dragleave', function() {
    uploadZone.classList.remove('dragover');
  });

  uploadZone.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    
    var files = e.dataTransfer.files;
    if (files.length) {
      var file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Alleen afbeeldingen zijn toegestaan');
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Bestand is te groot. Maximum 10MB.');
        return;
      }
      
      uploadToLibrary(file);
    }
  });

  function uploadToLibrary(file) {
    // Show loading state
    uploadZone.classList.add('uploading');
    uploadZone.style.pointerEvents = 'none';
    
    var reader = new FileReader();
    
    reader.onerror = function() {
      alert('Fout bij lezen van bestand');
      uploadZone.classList.remove('uploading');
      uploadZone.style.pointerEvents = '';
    };
    
    reader.onload = function(ev) {
      fetch(API_BASE + '/library/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: ev.target.result })
      })
        .then(function(r) { 
          if (!r.ok) {
            return r.json().then(function(err) { throw new Error(err.error || 'Upload mislukt'); });
          }
          return r.json(); 
        })
        .then(function(res) {
          if (res.success) {
            loadMediaLibrary();
          } else {
            throw new Error(res.error || 'Upload mislukt');
          }
        })
        .catch(function(err) {
          console.error('Upload mislukt:', err);
          alert('Upload mislukt: ' + err.message);
        })
        .finally(function() {
          uploadZone.classList.remove('uploading');
          uploadZone.style.pointerEvents = '';
        });
    };
    
    reader.readAsDataURL(file);
  }
})();
