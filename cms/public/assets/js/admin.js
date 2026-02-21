(function () {
  var CMS_PASSWORD = 'gordijnstudio2026';
  var API_BASE = '/api';

  var loginScreen = document.getElementById('loginScreen');
  var cmsApp = document.getElementById('cmsApp');
  var loginForm = document.getElementById('loginForm');
  var loginError = document.getElementById('loginError');
  var btnLogout = document.getElementById('btnLogout');

  // Check session
  if (sessionStorage.getItem('cms_auth') === 'true') {
    showDashboard();
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
})();
