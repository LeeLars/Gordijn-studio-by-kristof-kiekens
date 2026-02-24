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
    loadGallery();
    loadInquiries();
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
            setPreview('overOnsSecondary', d.images.overOnsSecondary);
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
  // GALLERY MANAGER
  // ════════════════════════════════════════════════════════════
  var galleryList = document.getElementById('galleryList');
  var addGalleryImage = document.getElementById('addGalleryImage');
  var currentGalleryImages = [];
  var currentGalleryIndex = null;

  // Load gallery from settings
  function loadGallery() {
    if (!galleryList) return;
    
    fetch(API_BASE + '/settings')
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.success && res.data) {
          currentGalleryImages = res.data.gallery || [];
          renderGallery();
        }
      })
      .catch(function(err) {
        console.error('Gallery laden mislukt:', err);
      });
  }

  // Drag & Drop voor gallery herordenening
  var dragSrcEl = null;
  var dragSrcIndex = null;

  function renderGallery() {
    if (!galleryList) return;
    
    while (galleryList.firstChild) {
      galleryList.removeChild(galleryList.firstChild);
    }
    
    if (currentGalleryImages.length === 0) {
      var emptyMsg = document.createElement('p');
      emptyMsg.className = 'cms-image-empty';
      emptyMsg.style.gridColumn = '1 / -1';
      emptyMsg.textContent = 'Geen gallery afbeeldingen. Klik "Afbeelding toevoegen" om te beginnen.';
      galleryList.appendChild(emptyMsg);
      return;
    }
    
    currentGalleryImages.forEach(function(url, idx) {
      var card = document.createElement('div');
      card.className = 'gallery-item-card';
      card.setAttribute('data-index', idx);
      card.setAttribute('draggable', 'true');
      
      var img = document.createElement('img');
      img.src = url;
      img.alt = 'Gallery afbeelding ' + (idx + 1);
      card.appendChild(img);
      
      var indexLabel = document.createElement('span');
      indexLabel.className = 'gallery-index';
      indexLabel.textContent = (idx + 1);
      card.appendChild(indexLabel);
      
      var deleteBtn = document.createElement('button');
      deleteBtn.className = 'gallery-delete';
      deleteBtn.title = 'Verwijderen';
      
      var deleteSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      deleteSvg.setAttribute('width', '16');
      deleteSvg.setAttribute('height', '16');
      deleteSvg.setAttribute('viewBox', '0 0 24 24');
      deleteSvg.setAttribute('fill', 'none');
      deleteSvg.setAttribute('stroke', 'currentColor');
      deleteSvg.setAttribute('stroke-width', '2');
      
      var deletePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      deletePath.setAttribute('d', 'M18 6L6 18M6 6l12 12');
      deleteSvg.appendChild(deletePath);
      deleteBtn.appendChild(deleteSvg);
      card.appendChild(deleteBtn);
      
      // Drag & Drop events
      card.addEventListener('dragstart', function(e) {
        dragSrcEl = card;
        dragSrcIndex = idx;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', card.innerHTML);
      });
      
      card.addEventListener('dragend', function() {
        card.classList.remove('dragging');
        document.querySelectorAll('.gallery-item-card').forEach(function(el) {
          el.classList.remove('drag-over');
        });
      });
      
      card.addEventListener('dragover', function(e) {
        if (e.preventDefault) {
          e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        card.classList.add('drag-over');
        return false;
      });
      
      card.addEventListener('dragleave', function() {
        card.classList.remove('drag-over');
      });
      
      card.addEventListener('drop', function(e) {
        if (e.stopPropagation) {
          e.stopPropagation();
        }
        
        if (dragSrcEl !== card) {
          // Herorden de array
          var draggedItem = currentGalleryImages[dragSrcIndex];
          currentGalleryImages.splice(dragSrcIndex, 1);
          currentGalleryImages.splice(idx, 0, draggedItem);
          
          // Save en re-render
          saveGallery();
          renderGallery();
        }
        
        return false;
      });
      
      // Click to change image
      card.addEventListener('click', function(e) {
        if (e.target.closest('.gallery-delete')) {
          e.stopPropagation();
          if (confirm('Afbeelding verwijderen?')) {
            currentGalleryImages.splice(idx, 1);
            saveGallery();
            renderGallery();
          }
          return;
        }
        
        currentGalleryIndex = idx;
        currentImageTarget = 'gallery:' + idx;
        openMediaLibrary();
      });
      
      galleryList.appendChild(card);
    });
  }

  // Add new gallery image - MULTI SELECT MODE
  if (addGalleryImage) {
    addGalleryImage.addEventListener('click', function() {
      if (currentGalleryImages.length >= 10) {
        alert('Maximum 10 afbeeldingen toegestaan');
        return;
      }
      currentImageTarget = 'gallery:multi';
      selectedLibraryImages = []; // Array voor multi-select
      openMediaLibrary(true); // true = multi select mode
    });
  }

  // Save gallery to settings
  function saveGallery() {
    fetch(API_BASE + '/settings')
      .then(function(r) { return r.json(); })
      .then(function(res) {
        var settings = res.data || {};
        settings.gallery = currentGalleryImages;
        
        return fetch(API_BASE + '/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gallery: settings.gallery })
        });
      })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.success) {
          console.log('Gallery opgeslagen');
        }
      })
      .catch(function(err) {
        console.error('Gallery opslaan mislukt:', err);
      });
  }

  // Initialize gallery
  loadGallery();

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
  var selectedLibraryImages = []; // Voor multi-select gallery
  var isMultiSelectMode = false;
  var libraryImages = [];

  // Open media library when clicking on image cards
  var imageCards = document.querySelectorAll('.cms-image-card');
  imageCards.forEach(function(card) {
    card.addEventListener('click', function(e) {
      // Check if delete button was clicked - don't open modal
      if (e.target.closest('.cms-image-delete')) {
        e.stopPropagation();
        e.preventDefault();
        
        var target = card.getAttribute('data-key');
        if (confirm('Afbeelding verwijderen?')) {
          // Clear the preview
          var previewId = target.replace('.', '-');
          var previewEl = document.getElementById('preview-' + previewId);
          if (previewEl) {
            previewEl.innerHTML = '<span class="cms-image-empty">Geen afbeelding</span>';
          }
          // Clear from settings
          saveImageUrl(target, '');
        }
        return;
      }
      
      // Open modal for image selection
      currentImageTarget = card.getAttribute('data-key');
      openMediaLibrary();
    });
  });

  function openMediaLibrary(multiSelect) {
    selectedLibraryImage = null;
    selectedLibraryImages = [];
    isMultiSelectMode = multiSelect || false;
    mediaLibraryModal.classList.add('active');
    if (isMultiSelectMode) {
      mediaLibraryModal.classList.add('multi-select');
    } else {
      mediaLibraryModal.classList.remove('multi-select');
    }
    loadMediaLibrary();
  }

  function closeMediaLibraryModal() {
    mediaLibraryModal.classList.remove('active');
    mediaLibraryModal.classList.remove('multi-select');
    currentImageTarget = null;
    selectedLibraryImage = null;
    selectedLibraryImages = [];
    isMultiSelectMode = false;
  }

  closeMediaLibrary.addEventListener('click', closeMediaLibraryModal);
  cancelMediaLibrary.addEventListener('click', closeMediaLibraryModal);
  mediaLibraryModal.querySelector('.media-library-overlay').addEventListener('click', closeMediaLibraryModal);

  // Select image - SINGLE en MULTI mode
  selectMediaLibrary.addEventListener('click', function() {
    // GALLERY MULTI SELECT MODE
    if (currentImageTarget === 'gallery:multi') {
      if (selectedLibraryImages.length === 0) {
        alert('Selecteer minstens 1 afbeelding');
        return;
      }
      // Voeg alle geselecteerde afbeeldingen toe aan gallery
      var addedCount = 0;
      selectedLibraryImages.forEach(function(img) {
        if (currentGalleryImages.length < 10) {
          currentGalleryImages.push(img.url);
          addedCount++;
        }
      });
      if (addedCount < selectedLibraryImages.length) {
        alert('Er zijn maar ' + addedCount + ' afbeeldingen toegevoegd (maximum 10 bereikt)');
      }
      saveGallery();
      renderGallery();
      closeMediaLibraryModal();
      return;
    }
    
    // SINGLE SELECT MODE (normale images)
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
      
      // Calculate selection index for display
      var selectionIndex = selectedLibraryImages.indexOf(image);
      var indexDisplay = selectionIndex > -1 ? '<span class="select-number">' + (selectionIndex + 1) + '</span>' : '';
      
      var img = document.createElement('img');
      img.src = image.thumbnail;
      img.alt = '';
      item.appendChild(img);

      var deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.setAttribute('data-id', image.id);
      deleteBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
      item.appendChild(deleteBtn);

      var selectIndicator = document.createElement('div');
      selectIndicator.className = 'select-indicator';
      if (selectionIndex > -1) {
        var numSpan = document.createElement('span');
        numSpan.className = 'select-number';
        numSpan.textContent = selectionIndex + 1;
        selectIndicator.appendChild(numSpan);
      }
      selectIndicator.innerHTML += '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
      item.appendChild(selectIndicator);
      
      // If already selected, mark it
      if (selectionIndex > -1) {
        item.classList.add('selected');
      }
      
      // Select image - toggle voor multi-select
      item.addEventListener('click', function(e) {
        // Check if delete button was clicked
        if (e.target.closest('.delete-btn')) {
          e.stopPropagation();
          e.preventDefault();
          deleteLibraryImage(image.id);
          return;
        }
        
        if (isMultiSelectMode) {
          // MULTI SELECT: toggle selectie
          var idx = selectedLibraryImages.indexOf(image);
          if (idx > -1) {
            selectedLibraryImages.splice(idx, 1);
            item.classList.remove('selected');
          } else {
            selectedLibraryImages.push(image);
            item.classList.add('selected');
          }
          // Re-render to update indices
          renderMediaLibrary();
        } else {
          // SINGLE SELECT: alleen 1 selectie
          document.querySelectorAll('.media-library-item').forEach(function(el) {
            el.classList.remove('selected');
          });
          item.classList.add('selected');
          selectedLibraryImage = image;
        }
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

  // Upload to library - MULTI FILE SUPPORT
  libraryUploadInput.addEventListener('change', function(e) {
    var files = e.target.files;
    if (!files.length) return;
    
    // Upload alle geselecteerde files
    var uploadCount = 0;
    var errorCount = 0;
    var totalFiles = files.length;
    
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Alleen afbeeldingen zijn toegestaan: ' + file.name);
        continue;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Bestand te groot (max 10MB): ' + file.name);
        continue;
      }
      
      uploadToLibrary(file, function() {
        uploadCount++;
        if (uploadCount + errorCount === totalFiles) {
          loadMediaLibrary();
        }
      }, function() {
        errorCount++;
        if (uploadCount + errorCount === totalFiles) {
          loadMediaLibrary();
        }
      });
    }
    
    // Reset input so same file can be selected again
    libraryUploadInput.value = '';
  });

  // Drag and drop - MULTI FILE SUPPORT
  uploadZone.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    
    var files = e.dataTransfer.files;
    if (!files.length) return;
    
    var uploadCount = 0;
    var errorCount = 0;
    var totalFiles = files.length;
    
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Alleen afbeeldingen zijn toegestaan: ' + file.name);
        continue;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Bestand te groot (max 10MB): ' + file.name);
        continue;
      }
      
      uploadToLibrary(file, function() {
        uploadCount++;
        if (uploadCount + errorCount === totalFiles) {
          loadMediaLibrary();
        }
      }, function() {
        errorCount++;
        if (uploadCount + errorCount === totalFiles) {
          loadMediaLibrary();
        }
      });
    }
  });

  function uploadToLibrary(file, onSuccess, onError) {
    // Show loading state
    uploadZone.classList.add('uploading');
    uploadZone.style.pointerEvents = 'none';
    
    var reader = new FileReader();
    
    reader.onerror = function() {
      alert('Fout bij lezen van bestand: ' + file.name);
      uploadZone.classList.remove('uploading');
      uploadZone.style.pointerEvents = '';
      if (onError) onError();
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
            if (onSuccess) onSuccess();
          } else {
            throw new Error(res.error || 'Upload mislukt');
          }
        })
        .catch(function(err) {
          console.error('Upload mislukt:', err);
          alert('Upload mislukt voor ' + file.name + ': ' + err.message);
          if (onError) onError();
        })
        .finally(function() {
          uploadZone.classList.remove('uploading');
          uploadZone.style.pointerEvents = '';
        });
    };
    
    reader.readAsDataURL(file);
  }

  // Load and display inquiries
  loadInquiries();

  function loadInquiries() {
    fetch(API_BASE + '/inquiries')
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.success) {
          displayInquiries(res.data || []);
        }
      })
      .catch(function(err) {
        console.error('Error loading inquiries:', err);
      });
  }

  function displayInquiries(inquiries) {
    const listEl = document.getElementById('inquiryList');
    const statTotal = document.getElementById('statTotal');
    const statMonth = document.getElementById('statMonth');
    const statUnread = document.getElementById('statUnread');

    if (!listEl) return;

    // Update stats
    if (statTotal) statTotal.textContent = inquiries.length;
    
    const now = new Date();
    const thisMonth = inquiries.filter(function(i) {
      const d = new Date(i.datum);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    if (statMonth) statMonth.textContent = thisMonth.length;

    const unread = inquiries.filter(function(i) { return !i.gelezen; });
    if (statUnread) statUnread.textContent = unread.length;

    // Display list
    if (inquiries.length === 0) {
      listEl.innerHTML = '<p class="inquiry-empty">Geen aanvragen gevonden</p>';
      return;
    }

    listEl.innerHTML = '';
    inquiries.forEach(function(inquiry) {
      const date = new Date(inquiry.datum);
      const dateStr = date.toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' });

      var item = document.createElement('div');
      item.className = 'inquiry-item' + (inquiry.gelezen ? '' : ' unread');
      item.setAttribute('data-id', inquiry.id);

      var header = document.createElement('div');
      header.className = 'inquiry-header';
      var nameEl = document.createElement('span');
      nameEl.className = 'inquiry-name';
      nameEl.textContent = inquiry.naam;
      var dateEl = document.createElement('span');
      dateEl.className = 'inquiry-date';
      dateEl.textContent = dateStr;
      header.appendChild(nameEl);
      header.appendChild(dateEl);

      var preview = document.createElement('div');
      preview.className = 'inquiry-preview';
      preview.textContent = inquiry.voorkeur || 'Geen voorkeurmoment opgegeven';

      var detail = document.createElement('div');
      detail.className = 'inquiry-detail';

      function makeField(label, valueEl) {
        var field = document.createElement('div');
        field.className = 'inquiry-field';
        var lbl = document.createElement('div');
        lbl.className = 'inquiry-field-label';
        lbl.textContent = label;
        var val = document.createElement('div');
        val.className = 'inquiry-field-value';
        val.appendChild(valueEl);
        field.appendChild(lbl);
        field.appendChild(val);
        return field;
      }

      var emailLink = document.createElement('a');
      emailLink.href = 'mailto:' + inquiry.email;
      emailLink.textContent = inquiry.email;
      detail.appendChild(makeField('E-mail', emailLink));

      var telEl;
      if (inquiry.telefoon) {
        telEl = document.createElement('a');
        telEl.href = 'tel:' + inquiry.telefoon.replace(/\s/g, '');
        telEl.textContent = inquiry.telefoon;
      } else {
        telEl = document.createElement('span');
        telEl.textContent = 'Niet opgegeven';
      }
      detail.appendChild(makeField('Telefoon', telEl));

      var voorkeurSpan = document.createElement('span');
      voorkeurSpan.textContent = inquiry.voorkeur || 'Niet opgegeven';
      detail.appendChild(makeField('Voorkeurmoment', voorkeurSpan));

      item.appendChild(header);
      item.appendChild(preview);
      item.appendChild(detail);
      listEl.appendChild(item);
    });

    // Add click handlers
    listEl.querySelectorAll('.inquiry-item').forEach(function(item) {
      item.addEventListener('click', function() {
        const isExpanded = this.classList.contains('expanded');
        
        // Close all others
        listEl.querySelectorAll('.inquiry-item').forEach(function(i) {
          i.classList.remove('expanded');
        });
        
        if (!isExpanded) {
          this.classList.add('expanded');
          // Mark as read
          const id = this.getAttribute('data-id');
          if (id) {
            markAsRead(id);
            this.classList.remove('unread');
            if (statUnread) {
              const current = parseInt(statUnread.textContent, 10) || 0;
              if (current > 0) statUnread.textContent = current - 1;
            }
          }
        }
      });
    });
  }

  function markAsRead(id) {
    fetch(API_BASE + '/inquiries/' + id + '/read', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }).catch(function(err) {
      console.error('Error marking as read:', err);
    });
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
