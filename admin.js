/* ── BrandConvey Admin Layer ────────────────────────────────── */
!function() {

var _CONFIG = {
  owner:        'thenameisalbin',
  repo:         'brandconvey',
  branch:       'v2',
  passwordHash: '1de2bb1378e029b8df258778671545419ac6f35dbe9653ede6192efc8162eac0'
};

/* ── Item schemas for "Add" modal ───────────────────────────── */
var _ITEM_SCHEMAS = {
  'work.cards': [
    { key: 'client',   label: 'Client name' },
    { key: 'title',    label: 'Project title' },
    { key: 'desc',     label: 'Description', type: 'textarea' },
    { key: 'tag',      label: 'Tag (e.g. Brand Film, Documentary)' },
    { key: 'watchUrl', label: 'YouTube / Watch URL' },
    { key: 'image',    label: 'Thumbnail', type: 'upload', hint: '16 : 9 · Recommended 1280 × 720 px', prefix: 'work', slugFrom: 'client' },
  ],
  'originals.films': [
    { key: 'client',   label: 'Client / Brand name' },
    { key: 'title',    label: 'Film title' },
    { key: 'image',    label: 'Thumbnail', type: 'upload', hint: '16 : 9 · Recommended 1280 × 720 px', prefix: 'orig', slugFrom: 'client' },
    { key: 'watchUrl', label: 'YouTube / Watch URL' },
  ],
  'services.items': [
    { key: 'title', label: 'Service title' },
    { key: 'desc',  label: 'Description', type: 'textarea' },
  ],
  'process.steps': [
    { key: 'title', label: 'Step title' },
    { key: 'desc',  label: 'Description', type: 'textarea' },
  ],
  'team.members': [
    { key: 'name',  label: 'Full name' },
    { key: 'role',  label: 'Role / Title' },
    { key: 'bio',   label: 'Short bio', type: 'textarea' },
    { key: 'photo', label: 'Photo', type: 'upload', hint: 'Square · Recommended 800 × 800 px', prefix: 'team', slugFrom: 'name' },
    { key: 'email', label: 'Email address' },
  ],
  'contact.founders': [
    { key: 'name',  label: 'Founder name' },
    { key: 'email', label: 'Email address' },
  ],
};

var _ITEM_TITLES = {
  'work.cards':       'Add Work Card',
  'originals.films':  'Add Original Film',
  'services.items':   'Add Service',
  'process.steps':    'Add Process Step',
  'team.members':     'Add Team Member',
  'contact.founders': 'Add Founder',
};

var _ITEM_LABELS = {
  'work.cards':       'work card',
  'originals.films':  'film',
  'services.items':   'service',
  'process.steps':    'step',
  'team.members':     'team member',
  'contact.founders': 'founder',
};

/* ── Wait for content to be ready ──────────────────────────── */
function _adminInit(data) {
  _showPasswordModal(data);
}
window._adminInit = _adminInit;
if (window._contentData) _adminInit(window._contentData);

/* ── Password modal ─────────────────────────────────────────── */
function _showPasswordModal(data) {
  var overlay = document.createElement('div');
  overlay.id = 'adminOverlay';
  overlay.innerHTML =
    '<div class="admin-modal">' +
      '<div class="admin-modal-logo">Admin Mode</div>' +
      '<p class="admin-modal-sub">Enter the admin password to enable editing.</p>' +
      '<input class="admin-modal-input" type="password" id="adminPwInput" placeholder="Password" autocomplete="current-password">' +
      '<div class="admin-modal-err" id="adminPwErr"></div>' +
      '<button class="admin-modal-btn" id="adminPwBtn">Unlock</button>' +
    '</div>';
  document.body.appendChild(overlay);

  var input = document.getElementById('adminPwInput');
  var btn   = document.getElementById('adminPwBtn');
  var err   = document.getElementById('adminPwErr');

  function attempt() {
    var pw = input.value;
    if (!pw) return;
    btn.textContent = 'Checking…'; btn.disabled = true;
    _sha256(pw).then(function(hash) {
      if (hash === _CONFIG.passwordHash) {
        overlay.remove();
        _activateAdmin(data);
      } else {
        err.textContent = 'Incorrect password.';
        input.value = '';
        btn.textContent = 'Unlock'; btn.disabled = false;
        input.focus();
      }
    });
  }

  btn.addEventListener('click', attempt);
  input.addEventListener('keydown', function(e) { if (e.key === 'Enter') attempt(); });
  setTimeout(function() { input.focus(); }, 80);
}

/* ── SHA-256 helper ─────────────────────────────────────────── */
function _sha256(str) {
  var buf = new TextEncoder().encode(str);
  return crypto.subtle.digest('SHA-256', buf).then(function(hash) {
    return Array.from(new Uint8Array(hash)).map(function(b){ return ('00' + b.toString(16)).slice(-2); }).join('');
  });
}

/* ── Activate admin mode ────────────────────────────────────── */
function _activateAdmin(data) {
  var unsaved = false;

  /* Toolbar --------------------------------------------------- */
  var bar = document.createElement('div');
  bar.id = 'adminBar';
  bar.innerHTML =
    '<span class="ab-label">Admin Mode</span>' +
    '<div class="ab-pat-wrap">' +
      '<input class="ab-pat" type="password" id="adminPat" placeholder="GitHub PAT (repo:write)" autocomplete="off">' +
      '<span class="ab-conn" id="adminConn">Not connected</span>' +
    '</div>' +
    '<span class="ab-unsaved" id="adminUnsaved" style="display:none">● Unsaved changes</span>' +
    '<button class="ab-publish" id="adminPublish">Publish</button>' +
    '<button class="ab-exit" id="adminExit" title="Exit admin mode">✕</button>';
  document.body.insertBefore(bar, document.body.firstChild);
  document.body.classList.add('admin-mode');

  var patInput   = document.getElementById('adminPat');
  var connStatus = document.getElementById('adminConn');
  var unsavedEl  = document.getElementById('adminUnsaved');
  var publishBtn = document.getElementById('adminPublish');

  /* Restore saved PAT from sessionStorage */
  var storedPat = sessionStorage.getItem('_bc_pat');
  if (storedPat) { patInput.value = storedPat; connStatus.textContent = 'PAT set'; connStatus.className = 'ab-conn ok'; }

  patInput.addEventListener('change', function() {
    sessionStorage.setItem('_bc_pat', patInput.value);
    connStatus.textContent = patInput.value ? 'PAT set' : 'Not connected';
    connStatus.className = 'ab-conn' + (patInput.value ? ' ok' : '');
  });

  document.getElementById('adminExit').addEventListener('click', function() {
    if (!unsaved || confirm('You have unsaved changes. Exit anyway?')) {
      window.location.search = '';
    }
  });

  publishBtn.addEventListener('click', function() { _publish(patInput.value, publishBtn, connStatus); });

  function markUnsaved() {
    unsaved = true;
    unsavedEl.style.display = '';
    publishBtn.classList.add('has-changes');
  }

  /* Set up edit affordances ----------------------------------- */
  _setupInlineEdits(markUnsaved);
  _setupArrayControls(markUnsaved);
  _setupImageEdits(markUnsaved);
}

/* ── Hint bar ────────────────────────────────────────────────── */
var _hint = null;
function _showHint(msg) {
  if (!_hint) {
    _hint = document.createElement('div');
    _hint.id = 'adminEditHint';
    document.body.appendChild(_hint);
  }
  _hint.innerHTML = msg;
  _hint.classList.add('visible');
}
function _hideHint() { if (_hint) _hint.classList.remove('visible'); }

/* ── Inline text editing ────────────────────────────────────── */
function _setupInlineEdits(markUnsaved) {
  document.querySelectorAll('[data-edit-path]').forEach(function(el) {
    if (el.dataset._adminBound) return;
    el.dataset._adminBound = '1';

    var type = el.getAttribute('data-edit-type') || 'text';
    var path = el.getAttribute('data-edit-path');

    el.addEventListener('click', function(e) {
      e.stopPropagation();
      if (type === 'text') {
        _startTextEdit(el, path, markUnsaved);
      } else if (type === 'url') {
        _startUrlEdit(el, path, markUnsaved);
      } else if (type === 'tags') {
        _startTagsEdit(el, path, markUnsaved);
      } else if (type === 'creds') {
        _startCredsEdit(el, path, markUnsaved);
      } else if (type === 'image') {
        _startImageEdit(el, path, markUnsaved);
      }
    });
  });
}

function _startTextEdit(el, path, markUnsaved) {
  if (el.getAttribute('contenteditable')) return;
  el.setAttribute('contenteditable', 'true');
  el.classList.add('editing');
  el.focus();
  _showHint('✎ Editing — <kbd>Enter</kbd> to save &nbsp;·&nbsp; <kbd>Esc</kbd> to cancel');

  var range = document.createRange(), sel = window.getSelection();
  range.selectNodeContents(el); range.collapse(false);
  sel.removeAllRanges(); sel.addRange(range);

  function finish() {
    el.removeAttribute('contenteditable');
    el.classList.remove('editing');
    _hideHint();
    var val = el.innerText.trim();
    _setPath(window._contentData, path, val);
    markUnsaved();
    el.removeEventListener('blur', finish);
    el.removeEventListener('keydown', onKey);
  }
  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); el.blur(); }
    if (e.key === 'Escape') { el.blur(); }
  }
  el.addEventListener('blur', finish);
  el.addEventListener('keydown', onKey);
}

function _startUrlEdit(el, path, markUnsaved) {
  var current = _getPath(window._contentData, path) || '';
  _showPopover(el, 'URL / path', current, function(val) {
    _setPath(window._contentData, path, val);
    if (el.tagName === 'A') {
      el.setAttribute('href', val.indexOf('@') > -1 ? 'mailto:' + val : val);
    } else if (el.classList.contains('card-link') || el.classList.contains('orig-watch')) {
      var hasUrl = val && val !== '#';
      el.textContent = hasUrl ? '↗ Watch URL · click to edit' : '+ Set watch URL';
      /* Update data-url on the parent card for click-to-open */
      var card = el.closest('[data-array]');
      if (card) {
        if (hasUrl) card.setAttribute('data-url', val);
        else card.removeAttribute('data-url');
      }
    } else {
      el.textContent = val;
    }
    markUnsaved();
  });
}

function _startTagsEdit(el, path, markUnsaved) {
  var arr = _getPath(window._contentData, path) || [];
  _showPopover(el, 'Tags (comma-separated)', arr.join(', '), function(val) {
    var tags = val.split(',').map(function(t){ return t.trim(); }).filter(Boolean);
    _setPath(window._contentData, path, tags);
    el.innerHTML = tags.map(function(t){ return '<span>' + _esc(t) + '</span>'; }).join('');
    markUnsaved();
  });
}

function _startCredsEdit(el, path, markUnsaved) {
  var arr = _getPath(window._contentData, path) || [];
  _showPopover(el, 'Credentials (comma-separated)', arr.join(', '), function(val) {
    var creds = val.split(',').map(function(c){ return c.trim(); }).filter(Boolean);
    _setPath(window._contentData, path, creds);
    el.innerHTML = creds.map(function(c){ return '<span>' + _esc(c) + '</span>'; }).join('');
    markUnsaved();
  });
}

function _startImageEdit(el, path, markUnsaved) {
  var pathParts = path.split('.');
  var section = pathParts[0] + '.' + pathParts[1];
  var idx = parseInt(pathParts[2], 10);
  var prefixMap = { 'work.cards': 'work', 'originals.films': 'orig', 'team.members': 'team' };
  var slugMap   = { 'work.cards': 'client', 'originals.films': 'client', 'team.members': 'name' };
  var prefix  = prefixMap[section] || 'img';
  var item    = (_getPath(window._contentData, section) || [])[idx] || {};
  var slugVal = item[slugMap[section] || 'name'] || '';
  var inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*'; inp.style.display = 'none';
  document.body.appendChild(inp);
  inp.addEventListener('change', function() {
    var file = inp.files[0];
    inp.remove();
    if (!file) return;
    var pat = (document.getElementById('adminPat') || {}).value || '';
    var filename = _genFilename({ prefix: prefix, slugFrom: '__s__' }, { __s__: slugVal }, file);
    var thumb = el.closest('.work-thumb, .orig-thumb, .team-card');
    function doImgUpload(usePat) {
      if (thumb) thumb.classList.add('admin-uploading');
      _uploadImageToGitHub(usePat, file, filename)
      .then(function(dataUrl) {
        _setPath(window._contentData, path, filename);
        if (thumb) thumb.classList.remove('admin-uploading');
        _rerenderSection(section, markUnsaved);
        markUnsaved();
        var card = document.querySelector('[data-array="' + section + '"][data-idx="' + idx + '"]');
        if (card && dataUrl) {
          var img = card.querySelector('img.avatar-photo, img.work-thumb-img, .orig-thumb img');
          if (img) { img.src = dataUrl; img.style.opacity = '1'; }
        }
      })
      .catch(function(err) {
        if (thumb) thumb.classList.remove('admin-uploading');
        alert('Upload failed: ' + err.message);
      });
    }
    if (!pat) {
      _showPatModal(function(newPat) { doImgUpload(newPat); });
    } else {
      doImgUpload(pat);
    }
  });
  inp.click();
}

/* ── Popover for non-text fields ────────────────────────────── */
function _showPopover(anchor, label, current, onSave) {
  document.querySelectorAll('.edit-popover').forEach(function(p){ p.remove(); });
  var pop = document.createElement('div');
  pop.className = 'edit-popover';
  pop.innerHTML =
    '<label class="ep-label">' + _esc(label) + '</label>' +
    '<input class="ep-input" type="text" value="' + _esc(current) + '">' +
    '<div class="ep-btns">' +
      '<button class="ep-save" type="button">Save</button>' +
      '<button class="ep-cancel" type="button">Cancel</button>' +
    '</div>';
  anchor.parentNode.insertBefore(pop, anchor.nextSibling);

  var inp = pop.querySelector('.ep-input');
  inp.focus(); inp.select();

  pop.querySelector('.ep-save').addEventListener('click', function() {
    onSave(inp.value); pop.remove();
  });
  pop.querySelector('.ep-cancel').addEventListener('click', function() { pop.remove(); });
  inp.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { onSave(inp.value); pop.remove(); }
    if (e.key === 'Escape') pop.remove();
  });

  setTimeout(function() {
    document.addEventListener('click', function dismiss(e) {
      if (!pop.contains(e.target) && e.target !== anchor) {
        pop.remove(); document.removeEventListener('click', dismiss);
      }
    });
  }, 0);
}

/* ── Array item management (add / delete / reorder) ──────────── */
function _setupArrayControls(markUnsaved) {
  var pagePath = window.location.pathname;
  var isWorkGallery      = pagePath.indexOf('work-gallery') > -1;
  var isOriginalsGallery = pagePath.indexOf('originals-gallery') > -1;

  /* Delete / edit buttons */
  document.querySelectorAll('[data-array]').forEach(function(item) {
    var arrayPath = item.getAttribute('data-array');
    var noDelete = (arrayPath === 'work.cards' && !isWorkGallery) ||
                   (arrayPath === 'originals.films' && !isOriginalsGallery);
    if (!noDelete && !item.querySelector('.admin-delete-btn')) {
      _addDeleteBtn(item, markUnsaved);
    }
    if (!item.querySelector('.admin-edit-btn')) {
      _addEditBtn(item, markUnsaved);
    }
  });

  /* "+" add button after each array container */
  var containers = {};
  document.querySelectorAll('[data-array]').forEach(function(item) {
    var key = item.getAttribute('data-array');
    if (!containers[key]) containers[key] = item.parentNode;
  });
  Object.keys(containers).forEach(function(arrayPath) {
    var parent = containers[arrayPath];
    if (parent.querySelector('.admin-add-btn[data-array-path="' + arrayPath + '"]')) return;
    var addBtn = document.createElement('button');
    addBtn.className = 'admin-add-btn';
    addBtn.setAttribute('type', 'button');
    addBtn.setAttribute('data-array-path', arrayPath);
    addBtn.innerHTML = '+ Add ' + (_ITEM_LABELS[arrayPath] || 'item');
    addBtn.addEventListener('click', function() { _showAddModal(arrayPath, markUnsaved); });
    parent.appendChild(addBtn);
  });

  /* Drag-to-reorder only on dedicated gallery pages */
  if (isWorkGallery)      _setupDragToReorder('work.cards', markUnsaved);
  if (isOriginalsGallery) _setupDragToReorder('originals.films', markUnsaved);
}

function _setupDragToReorder(arrayPath, markUnsaved) {
  var items = Array.from(document.querySelectorAll('[data-array="' + arrayPath + '"]'));
  if (items.length < 2) return;
  var dragSrc = null;
  var dragSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8.5 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm7 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8.5 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm7 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8.5 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm7 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>';

  items.forEach(function(item) {
    var thumb = item.querySelector('.work-thumb, .orig-thumb');
    if (!thumb) return;

    /* Add drag handle inside thumbnail area */
    if (!thumb.querySelector('.admin-drag-handle')) {
      var handle = document.createElement('button');
      handle.className = 'admin-drag-handle';
      handle.type = 'button';
      handle.title = 'Drag to reorder';
      handle.innerHTML = dragSvg;
      thumb.appendChild(handle);
      handle.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        item.setAttribute('draggable', 'true');
      });
    }

    if (item.dataset._dragBound) return;
    item.dataset._dragBound = '1';
    item.setAttribute('draggable', 'false');

    item.addEventListener('dragstart', function(e) {
      dragSrc = item;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', item.getAttribute('data-idx'));
      setTimeout(function() { item.classList.add('drag-source'); }, 0);
    });

    item.addEventListener('dragend', function() {
      item.classList.remove('drag-source');
      item.setAttribute('draggable', 'false');
      document.querySelectorAll('[data-array="' + arrayPath + '"]').forEach(function(i) {
        i.classList.remove('drag-over');
      });
    });

    item.addEventListener('dragover', function(e) {
      if (!dragSrc || item === dragSrc) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      document.querySelectorAll('[data-array="' + arrayPath + '"]').forEach(function(i) {
        i.classList.remove('drag-over');
      });
      item.classList.add('drag-over');
    });

    item.addEventListener('dragleave', function(e) {
      if (!item.contains(e.relatedTarget)) item.classList.remove('drag-over');
    });

    item.addEventListener('drop', function(e) {
      e.preventDefault();
      if (!dragSrc || item === dragSrc) return;
      item.classList.remove('drag-over');
      var fromIdx = parseInt(dragSrc.getAttribute('data-idx'), 10);
      var toIdx   = parseInt(item.getAttribute('data-idx'), 10);
      var arr = (_getPath(window._contentData, arrayPath) || []).slice();
      var moved = arr.splice(fromIdx, 1)[0];
      arr.splice(toIdx, 0, moved);
      _setPath(window._contentData, arrayPath, arr);
      markUnsaved();
      _rerenderSection(arrayPath, markUnsaved);
    });
  });
}

function _setupImageEdits(markUnsaved) {
  var camSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';

  document.querySelectorAll('.work-thumb, .orig-thumb').forEach(function(thumb) {
    if (thumb.querySelector('.admin-img-btn')) return;
    var card = thumb.closest('[data-array]');
    if (!card) return;
    var arrayPath = card.getAttribute('data-array');
    var idx = card.getAttribute('data-idx');
    if (idx === null) return;
    var imgPath = arrayPath + '.' + idx + '.image';
    var btn = document.createElement('button');
    btn.className = 'admin-img-btn';
    btn.type = 'button';
    btn.title = 'Upload / replace thumbnail';
    btn.innerHTML = camSvg;
    thumb.appendChild(btn);
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      _startImageEdit(btn, imgPath, markUnsaved);
    });
  });

  document.querySelectorAll('.team-card').forEach(function(card) {
    if (card.querySelector('.admin-photo-btn')) return;
    var arrayPath = card.getAttribute('data-array');
    var idx = card.getAttribute('data-idx');
    if (!arrayPath || idx === null) return;
    var photoPath = arrayPath + '.' + idx + '.photo';
    var btn = document.createElement('button');
    btn.className = 'admin-img-btn admin-photo-btn';
    btn.type = 'button';
    btn.title = 'Upload / replace photo';
    btn.innerHTML = camSvg;
    card.appendChild(btn);
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      _startImageEdit(btn, photoPath, markUnsaved);
    });
  });
}

function _addDeleteBtn(item, markUnsaved) {
  var btn = document.createElement('button');
  btn.className = 'admin-delete-btn';
  btn.setAttribute('type', 'button');
  btn.innerHTML = '✕';
  btn.setAttribute('aria-label', 'Delete item');
  item.appendChild(btn);
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!confirm('Delete this item?')) return;
    var arrayPath = item.getAttribute('data-array');
    var idx = parseInt(item.getAttribute('data-idx'), 10);
    var arr = _getPath(window._contentData, arrayPath);
    arr.splice(idx, 1);
    _setPath(window._contentData, arrayPath, arr);
    markUnsaved();
    _rerenderSection(arrayPath, markUnsaved);
  });
}

function _addEditBtn(item, markUnsaved) {
  var pencilSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  var btn = document.createElement('button');
  btn.className = 'admin-edit-btn';
  btn.setAttribute('type', 'button');
  btn.innerHTML = pencilSvg;
  btn.setAttribute('aria-label', 'Edit item');
  item.appendChild(btn);
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    var arrayPath = item.getAttribute('data-array');
    var idx = parseInt(item.getAttribute('data-idx'), 10);
    _showEditModal(arrayPath, idx, markUnsaved);
  });
}

var _ITEM_EDIT_TITLES = {
  'work.cards':       'Edit Work Card',
  'originals.films':  'Edit Original Film',
  'services.items':   'Edit Service',
  'process.steps':    'Edit Process Step',
  'team.members':     'Edit Team Member',
  'contact.founders': 'Edit Founder',
};

function _showEditModal(arrayPath, idx, markUnsaved) {
  var schema = _ITEM_SCHEMAS[arrayPath];
  if (!schema) { alert('No schema defined for ' + arrayPath); return; }
  var arr = _getPath(window._contentData, arrayPath) || [];
  var existing = arr[idx] || {};

  var overlay = document.createElement('div');
  overlay.className = 'aaf-overlay';

  var fields = schema.map(function(f) {
    if (f.type === 'upload') {
      var hasExisting = existing[f.key];
      return '<div class="aaf-field">' +
        '<label class="aaf-label">' + _esc(f.label) + '</label>' +
        (f.hint ? '<div class="aaf-hint">' + _esc(f.hint) + '</div>' : '') +
        (hasExisting ? '<div class="aaf-hint aaf-existing-img">Current: ' + _esc(existing[f.key]) + '</div>' : '') +
        '<label class="aaf-upload-zone" id="aaf_zone_' + f.key + '">' +
          '<input class="aaf-file-inp" type="file" id="aaf_' + f.key + '" accept="image/*">' +
          '<div class="aaf-upload-idle" id="aaf_idle_' + f.key + '">' +
            '<span class="aaf-upload-icon">↑</span>' +
            '<span>' + (hasExisting ? 'Upload a new image to replace' : 'Click or drag an image here') + '</span>' +
          '</div>' +
          '<div class="aaf-upload-preview" id="aaf_prev_' + f.key + '" style="display:none">' +
            '<img class="aaf-thumb" id="aaf_thumb_' + f.key + '" alt="preview">' +
            '<span class="aaf-fname" id="aaf_fname_' + f.key + '"></span>' +
          '</div>' +
        '</label>' +
      '</div>';
    }
    var value = existing[f.key];
    if (value == null) value = '';
    var inputEl = f.type === 'textarea'
      ? '<textarea class="aaf-input aaf-textarea" id="aaf_' + f.key + '" placeholder="' + _esc(f.label) + '">' + _esc(String(value)) + '</textarea>'
      : '<input class="aaf-input" type="text" id="aaf_' + f.key + '" value="' + _esc(String(value)) + '" placeholder="' + _esc(f.label) + '">';
    return '<div class="aaf-field">' +
      '<label class="aaf-label" for="aaf_' + f.key + '">' + _esc(f.label) + '</label>' +
      inputEl +
    '</div>';
  }).join('');

  overlay.innerHTML =
    '<div class="aaf-modal">' +
      '<div class="aaf-header">' +
        '<span class="aaf-title">' + _esc(_ITEM_EDIT_TITLES[arrayPath] || 'Edit Item') + '</span>' +
        '<button class="aaf-close" type="button" aria-label="Close">✕</button>' +
      '</div>' +
      '<div class="aaf-body">' + fields + '</div>' +
      '<div class="aaf-footer">' +
        '<button class="aaf-cancel" type="button">Cancel</button>' +
        '<button class="aaf-save" type="button">Save Changes</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);

  /* Wire up image preview for upload fields */
  schema.filter(function(f){ return f.type === 'upload'; }).forEach(function(f) {
    var inp = overlay.querySelector('#aaf_' + f.key);
    inp.addEventListener('change', function() {
      var file = inp.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(e) {
        overlay.querySelector('#aaf_idle_' + f.key).style.display = 'none';
        overlay.querySelector('#aaf_thumb_' + f.key).src = e.target.result;
        overlay.querySelector('#aaf_fname_' + f.key).textContent = file.name;
        overlay.querySelector('#aaf_prev_' + f.key).style.display = '';
      };
      reader.readAsDataURL(file);
    });
  });

  function close() { overlay.remove(); }
  overlay.querySelector('.aaf-close').addEventListener('click', close);
  overlay.querySelector('.aaf-cancel').addEventListener('click', close);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
  overlay.addEventListener('keydown', function(e) { if (e.key === 'Escape') close(); });

  overlay.querySelector('.aaf-save').addEventListener('click', function() {
    var saveBtn = overlay.querySelector('.aaf-save');

    /* Start from a copy of existing item to preserve fields not in schema (num, imagePosition, initials, etc.) */
    var updatedItem = {};
    var ex = (_getPath(window._contentData, arrayPath) || [])[idx] || {};
    Object.keys(ex).forEach(function(k) { updatedItem[k] = ex[k]; });

    /* Collect text fields */
    schema.filter(function(f){ return f.type !== 'upload'; }).forEach(function(f) {
      var el = overlay.querySelector('#aaf_' + f.key);
      if (el) updatedItem[f.key] = el.value;
    });

    /* Check for new image uploads */
    var uploadFields = schema.filter(function(f){ return f.type === 'upload'; });
    var hasNewFile = uploadFields.some(function(f){ var i = overlay.querySelector('#aaf_' + f.key); return i && i.files[0]; });

    if (!hasNewFile) {
      _finalizeEditItem(arrayPath, idx, updatedItem, markUnsaved);
      close();
      return;
    }

    var pat = (document.getElementById('adminPat') || {}).value || '';
    if (!pat) {
      _showPatModal(function(newPat) { pat = newPat; doEditUpload(); });
      return;
    }
    doEditUpload();
    function doEditUpload() {
      saveBtn.textContent = 'Uploading image…'; saveBtn.disabled = true;
      var uploads = uploadFields.map(function(f) {
        var inp = overlay.querySelector('#aaf_' + f.key);
        var file = inp && inp.files[0];
        if (!file) return Promise.resolve(null);
        var slugObj = {};
        slugObj[f.slugFrom || 'client'] = updatedItem[f.slugFrom || 'client'] || '';
        var filename = _genFilename(f, slugObj, file);
        updatedItem[f.key] = filename;
        return _uploadImageToGitHub(pat, file, filename);
      });
      Promise.all(uploads)
        .then(function(dataUrls) {
          close();
          _finalizeEditItem(arrayPath, idx, updatedItem, markUnsaved);
          var card = document.querySelector('[data-array="' + arrayPath + '"][data-idx="' + idx + '"]');
          if (card) {
            dataUrls.forEach(function(dataUrl) {
              if (!dataUrl) return;
              var img = card.querySelector('img.avatar-photo, img.work-thumb-img, .orig-thumb img');
              if (img) { img.src = dataUrl; img.style.opacity = '1'; }
            });
          }
        })
        .catch(function(err) {
          saveBtn.textContent = 'Save Changes'; saveBtn.disabled = false;
          alert('Image upload failed: ' + err.message);
        });
    }
  });

  setTimeout(function() {
    var first = overlay.querySelector('.aaf-input');
    if (first) first.focus();
  }, 60);
}

function _finalizeEditItem(arrayPath, idx, updatedItem, markUnsaved) {
  var arr = _getPath(window._contentData, arrayPath) || [];
  arr[idx] = updatedItem;
  _setPath(window._contentData, arrayPath, arr);
  markUnsaved();
  _rerenderSection(arrayPath, markUnsaved);
}

function _showAddModal(arrayPath, markUnsaved) {
  var schema = _ITEM_SCHEMAS[arrayPath];
  if (!schema) { alert('No schema defined for ' + arrayPath); return; }

  var overlay = document.createElement('div');
  overlay.className = 'aaf-overlay';

  var fields = schema.map(function(f) {
    if (f.type === 'upload') {
      return '<div class="aaf-field">' +
        '<label class="aaf-label">' + _esc(f.label) + '</label>' +
        (f.hint ? '<div class="aaf-hint">' + _esc(f.hint) + '</div>' : '') +
        '<label class="aaf-upload-zone" id="aaf_zone_' + f.key + '">' +
          '<input class="aaf-file-inp" type="file" id="aaf_' + f.key + '" accept="image/*">' +
          '<div class="aaf-upload-idle" id="aaf_idle_' + f.key + '">' +
            '<span class="aaf-upload-icon">↑</span>' +
            '<span>Click or drag an image here</span>' +
          '</div>' +
          '<div class="aaf-upload-preview" id="aaf_prev_' + f.key + '" style="display:none">' +
            '<img class="aaf-thumb" id="aaf_thumb_' + f.key + '" alt="preview">' +
            '<span class="aaf-fname" id="aaf_fname_' + f.key + '"></span>' +
          '</div>' +
        '</label>' +
      '</div>';
    }
    var inputEl = f.type === 'textarea'
      ? '<textarea class="aaf-input aaf-textarea" id="aaf_' + f.key + '" placeholder="' + _esc(f.label) + '"></textarea>'
      : '<input class="aaf-input" type="text" id="aaf_' + f.key + '" placeholder="' + _esc(f.label) + '">';
    return '<div class="aaf-field">' +
      '<label class="aaf-label" for="aaf_' + f.key + '">' + _esc(f.label) + '</label>' +
      inputEl +
    '</div>';
  }).join('');

  overlay.innerHTML =
    '<div class="aaf-modal">' +
      '<div class="aaf-header">' +
        '<span class="aaf-title">' + _esc(_ITEM_TITLES[arrayPath] || 'Add Item') + '</span>' +
        '<button class="aaf-close" type="button" aria-label="Close">✕</button>' +
      '</div>' +
      '<div class="aaf-body">' + fields + '</div>' +
      '<div class="aaf-footer">' +
        '<button class="aaf-cancel" type="button">Cancel</button>' +
        '<button class="aaf-save" type="button">Add Item</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);

  /* Wire up image preview for each upload field */
  schema.filter(function(f){ return f.type === 'upload'; }).forEach(function(f) {
    var inp = overlay.querySelector('#aaf_' + f.key);
    inp.addEventListener('change', function() {
      var file = inp.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(e) {
        overlay.querySelector('#aaf_idle_' + f.key).style.display = 'none';
        var prev = overlay.querySelector('#aaf_prev_' + f.key);
        overlay.querySelector('#aaf_thumb_' + f.key).src = e.target.result;
        overlay.querySelector('#aaf_fname_' + f.key).textContent = file.name;
        prev.style.display = '';
      };
      reader.readAsDataURL(file);
    });
  });

  function close() { overlay.remove(); }
  overlay.querySelector('.aaf-close').addEventListener('click', close);
  overlay.querySelector('.aaf-cancel').addEventListener('click', close);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
  overlay.addEventListener('keydown', function(e) { if (e.key === 'Escape') close(); });

  overlay.querySelector('.aaf-save').addEventListener('click', function() {
    var saveBtn = overlay.querySelector('.aaf-save');
    var newItem = {};

    /* Collect text fields */
    schema.filter(function(f){ return f.type !== 'upload'; }).forEach(function(f) {
      var val = (overlay.querySelector('#aaf_' + f.key) || {}).value || '';
      newItem[f.key] = val;
    });

    /* Auto-fill defaults */
    if (arrayPath === 'work.cards') {
      newItem.imagePosition = 'center center';
      newItem.num = ('0' + ((_getPath(window._contentData, arrayPath) || []).length + 1)).slice(-2);
    }
    if (arrayPath === 'team.members') {
      newItem.initials = (newItem.name || '').split(/\s+/).map(function(w){ return w[0] || ''; }).join('').toUpperCase().slice(0, 2);
      newItem.instagram = '';
      newItem.creds = [];
    }

    /* Upload any images then finalise */
    var uploadFields = schema.filter(function(f){ return f.type === 'upload'; });
    var hasFile = uploadFields.some(function(f){ var i = overlay.querySelector('#aaf_' + f.key); return i && i.files[0]; });

    if (!hasFile) {
      uploadFields.forEach(function(f){ newItem[f.key] = ''; });
      _finalizeAddItem(arrayPath, newItem, markUnsaved);
      close();
      return;
    }

    var pat = (document.getElementById('adminPat') || {}).value || '';
    if (!pat) {
      _showPatModal(function(newPat) {
        pat = newPat;
        doUpload();
      });
      return;
    }
    doUpload();
    function doUpload() {
    saveBtn.textContent = 'Uploading image…';
    saveBtn.disabled = true;

    var uploads = uploadFields.map(function(f) {
      var inp = overlay.querySelector('#aaf_' + f.key);
      var file = inp && inp.files[0];
      if (!file) { newItem[f.key] = ''; return Promise.resolve(); }
      var filename = _genFilename(f, newItem, file);
      newItem[f.key] = filename;
      return _uploadImageToGitHub(pat, file, filename);
    });

    var newIdx = (_getPath(window._contentData, arrayPath) || []).length;
    Promise.all(uploads)
      .then(function(dataUrls) {
        close();
        _finalizeAddItem(arrayPath, newItem, markUnsaved);
        /* Patch the newly rendered card's img src with data URL for immediate preview */
        var card = document.querySelector('[data-array="' + arrayPath + '"][data-idx="' + newIdx + '"]');
        if (card) {
          dataUrls.forEach(function(dataUrl) {
            if (!dataUrl) return;
            var img = card.querySelector('img.avatar-photo, img.work-thumb-img, .orig-thumb img');
            if (img) { img.src = dataUrl; img.style.opacity = '1'; }
          });
        }
      })
      .catch(function(err) {
        saveBtn.textContent = 'Add Item'; saveBtn.disabled = false;
        alert('Image upload failed: ' + err.message);
      });
    } /* end doUpload */
  });

  setTimeout(function() {
    var first = overlay.querySelector('.aaf-input, .aaf-file-inp');
    if (first && first.classList.contains('aaf-input')) first.focus();
  }, 60);
}

/* ── Image upload helpers ────────────────────────────────────── */
function _slugify(str) {
  return String(str || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';
}

function _genFilename(field, item, file) {
  var ext = '.' + (file.name.split('.').pop() || 'jpg').toLowerCase();
  var base = _slugify(item[field.slugFrom] || '');
  var date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return field.prefix + '-' + base + '-' + date + ext;
}

function _uploadImageToGitHub(pat, file, filename) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onerror = function() { reject(new Error('Could not read file')); };
    reader.onload = function(e) {
      var dataUrl = e.target.result;
      var base64  = dataUrl.split(',')[1];
      var apiUrl  = 'https://api.github.com/repos/' + _CONFIG.owner + '/' + _CONFIG.repo + '/contents/' + filename;
      var headers = { 'Authorization': 'token ' + pat, 'Content-Type': 'application/json' };
      /* Check for existing file (need its SHA to overwrite) */
      fetch(apiUrl + '?ref=' + _CONFIG.branch, { headers: headers })
        .then(function(r) { return r.ok ? r.json() : { sha: null }; })
        .then(function(meta) {
          var body = { message: 'Upload image: ' + filename, content: base64, branch: _CONFIG.branch };
          if (meta.sha) body.sha = meta.sha;
          return fetch(apiUrl, { method: 'PUT', headers: headers, body: JSON.stringify(body) });
        })
        .then(function(r) {
          if (!r.ok) return r.json().then(function(j){ throw new Error(j.message || r.status); });
          /* Save locally so the image persists across reloads on the dev server */
          var host = window.location.hostname;
          if (host === 'localhost' || host === '127.0.0.1') {
            fetch('/' + filename, { method: 'PUT', body: file }).catch(function() {});
          }
          resolve(dataUrl); /* resolve with data URL for immediate local preview */
        })
        .catch(reject);
    };
    reader.readAsDataURL(file);
  });
}

function _finalizeAddItem(arrayPath, newItem, markUnsaved) {
  var arr = _getPath(window._contentData, arrayPath) || [];
  arr.push(newItem);
  _setPath(window._contentData, arrayPath, arr);
  markUnsaved();
  _rerenderSection(arrayPath, markUnsaved);
}

function _rerenderSection(arrayPath, markUnsaved) {
  var mu = markUnsaved || function(){};
  var top = arrayPath.split('.')[0];
  var data = window._contentData;
  if (top === 'work') {
    var fs = document.querySelector('[data-section="work-filmstrip"]');
    if (fs) {
      var html = data.work.cards.map(function(c,i){ return _buildWorkCard(c,i); }).join('');
      html += '<div class="work-upcoming"><div class="plus-ring">+</div><h3>More on the way</h3><p>Currently in production — check back soon.</p></div>';
      fs.innerHTML = html;
    }
    var wg = document.querySelector('[data-section="work-gallery"]');
    if (wg) wg.innerHTML = data.work.cards.map(function(c,i){ return _buildWorkCard(c,i); }).join('');
  } else if (top === 'originals') {
    document.querySelectorAll('[data-section="originals"]').forEach(function(g) {
      var h = data.originals.films.map(function(f,i){ return _buildOrigCard(f,i); }).join('');
      h += '<div class="orig-card-placeholder reveal d3"><div class="orig-placeholder-label">Coming soon</div><div class="orig-placeholder-sub">A new project is in the works</div></div>';
      g.innerHTML = h;
    });
  } else if (top === 'services') {
    var sg = document.querySelector('[data-section="services"]');
    if (sg) sg.innerHTML = data.services.items.map(function(item,i){ return _buildSvcCell(item,i); }).join('');
  } else if (top === 'process') {
    var pl = document.querySelector('[data-section="process"]');
    if (pl) pl.innerHTML = data.process.steps.map(function(s,i){ return _buildProcessStep(s,i); }).join('');
  } else if (top === 'team') {
    var tg = document.querySelector('[data-section="team"]');
    if (tg) tg.innerHTML = data.team.members.map(function(m,i){ return _buildTeamCard(m,i); }).join('');
  } else if (top === 'contact') {
    var contactHtml = _buildContactCards(data.contact);
    var cc = document.querySelector('[data-section="contact-cards"]');
    if (cc) cc.innerHTML = contactHtml;
    var cs = document.querySelector('[data-section="contact-sidebar"]');
    if (cs) cs.innerHTML = contactHtml;
  }
  /* Re-attach edit and array affordances on newly rendered elements */
  _setupInlineEdits(mu);
  _setupArrayControls(mu);
  _setupImageEdits(mu);
}

/* ── Image path helpers for orphan detection ─────────────────── */
function _getImagePaths(data) {
  var paths = [];
  if (!data) return paths;
  (data.work && data.work.cards || []).forEach(function(c) { if (c.image) paths.push(c.image); });
  (data.originals && data.originals.films || []).forEach(function(f) { if (f.image) paths.push(f.image); });
  (data.team && data.team.members || []).forEach(function(m) { if (m.photo) paths.push(m.photo); });
  return paths;
}

function _deleteOrphanedImages(pat, oldPaths, newPaths, isLocal) {
  var orphans = oldPaths.filter(function(p) { return p && newPaths.indexOf(p) === -1; });
  if (!orphans.length) return;
  var headers = { 'Authorization': 'token ' + pat, 'Content-Type': 'application/json' };
  var apiBase = 'https://api.github.com/repos/' + _CONFIG.owner + '/' + _CONFIG.repo + '/contents/';
  orphans.forEach(function(imgPath) {
    fetch(apiBase + imgPath + '?ref=' + _CONFIG.branch, { headers: headers })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(meta) {
        if (!meta || !meta.sha) return;
        return fetch(apiBase + imgPath, {
          method: 'DELETE',
          headers: headers,
          body: JSON.stringify({ message: 'Delete image: ' + imgPath, sha: meta.sha, branch: _CONFIG.branch })
        });
      })
      .catch(function() {});
    if (isLocal) fetch('/' + imgPath, { method: 'DELETE' }).catch(function() {});
  });
}

/* SHA returned by the last successful publish — reused to skip the GET on repeat publishes */
var _publishedSha = null;

/* ── PAT collection modal (shown when publish is clicked without a token) ── */
function _showPatModal(onConfirm) {
  var overlay = document.createElement('div');
  overlay.className = 'aaf-overlay';
  overlay.innerHTML =
    '<div class="aaf-modal" style="max-width:420px">' +
      '<div class="aaf-header">' +
        '<span class="aaf-title">GitHub Access Token</span>' +
        '<button class="aaf-close" type="button" aria-label="Close">✕</button>' +
      '</div>' +
      '<div class="aaf-body">' +
        '<div class="aaf-field">' +
          '<label class="aaf-label">Personal Access Token</label>' +
          '<div class="aaf-hint">Needs Contents: write permission on this repository.</div>' +
          '<input class="aaf-input" type="password" id="patModalInp" placeholder="github_pat_…" autocomplete="off">' +
        '</div>' +
      '</div>' +
      '<div class="aaf-footer">' +
        '<button class="aaf-cancel" type="button">Cancel</button>' +
        '<button class="aaf-save" type="button">Publish now</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);
  var inp = overlay.querySelector('#patModalInp');
  setTimeout(function() { inp.focus(); }, 60);
  function dismiss() { overlay.remove(); }
  function submit() {
    var val = inp.value.trim();
    if (!val) { inp.focus(); return; }
    dismiss();
    /* Save to bar + sessionStorage so subsequent publishes don't re-ask */
    var barPat = document.getElementById('adminPat');
    if (barPat) {
      barPat.value = val;
      barPat.dispatchEvent(new Event('change'));
    }
    onConfirm(val);
  }
  overlay.querySelector('.aaf-close').addEventListener('click', dismiss);
  overlay.querySelector('.aaf-cancel').addEventListener('click', dismiss);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) dismiss(); });
  overlay.querySelector('.aaf-save').addEventListener('click', submit);
  inp.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') dismiss();
  });
}

/* ── Publish to GitHub ──────────────────────────────────────── */
function _publish(pat, btn, statusEl) {
  if (!pat) {
    _showPatModal(function(newPat) { _publish(newPat, btn, statusEl); });
    return;
  }
  btn.textContent = 'Publishing…'; btn.disabled = true;
  statusEl.textContent = 'Connecting…'; statusEl.className = 'ab-conn';

  var json      = JSON.stringify(window._contentData, null, 2);
  var isLocal   = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  var apiBase   = 'https://api.github.com/repos/' + _CONFIG.owner + '/' + _CONFIG.repo + '/contents/content.json';
  var headers   = { 'Authorization': 'token ' + pat, 'Content-Type': 'application/json' };
  var oldImagePaths = [];

  /* Fetch current metadata — always cache-busted so GitHub never serves a stale SHA */
  function fetchMeta() {
    return fetch(apiBase + '?ref=' + _CONFIG.branch + '&_=' + Date.now(), { headers: headers })
      .then(function(r) {
        if (r.status === 401) throw new Error('Invalid PAT — check permissions (needs repo Contents: write).');
        if (r.status === 404) return { sha: null, content: null };
        if (!r.ok) throw new Error('GitHub API error: ' + r.status);
        return r.json();
      });
  }

  /* GET then PUT; on SHA-mismatch clear cached SHA and retry once with fresh GET */
  function attempt(sha, content) {
    if (content) {
      try {
        var oldJson = decodeURIComponent(escape(atob(content.replace(/\n/g, ''))));
        oldImagePaths = _getImagePaths(JSON.parse(oldJson));
      } catch(e) {}
    }
    var encoded = btoa(unescape(encodeURIComponent(json)));
    var body = { message: 'Update site content via admin CMS', content: encoded, branch: _CONFIG.branch };
    if (sha) body.sha = sha;
    return fetch(apiBase, { method: 'PUT', headers: headers, body: JSON.stringify(body) })
      .then(function(r) {
        if (!r.ok) {
          return r.json().then(function(j) {
            var msg = j.message || String(r.status);
            if (msg.indexOf('does not match') > -1) {
              /* SHA was stale — discard cache, GET fresh, retry */
              _publishedSha = null;
              return fetchMeta().then(function(m) { return attempt(m.sha, m.content); });
            }
            throw new Error(msg);
          });
        }
        return r.json().then(function(result) {
          /* Cache the new SHA so the next publish skips the GET */
          if (result && result.content && result.content.sha) _publishedSha = result.content.sha;
          return result;
        });
      });
  }

  /* Always GET fresh remote state so we can detect divergence before overwriting */
  var start = fetchMeta().then(function(m) {
    /* Divergence guard — warn if remote has MORE array items than local session */
    var warnings = [];
    if (m.content) {
      try {
        var remote = JSON.parse(decodeURIComponent(escape(atob(m.content.replace(/\n/g, '')))));
        var local  = window._contentData;
        var checks = [
          { label: 'Work cards',    r: ((remote.work    || {}).cards   || []).length, l: ((local.work    || {}).cards   || []).length },
          { label: 'Originals',     r: ((remote.originals || {}).films  || []).length, l: ((local.originals || {}).films  || []).length },
          { label: 'Services',      r: ((remote.services || {}).items  || []).length, l: ((local.services || {}).items  || []).length },
          { label: 'Team members',  r: ((remote.team    || {}).members || []).length, l: ((local.team    || {}).members || []).length },
          { label: 'Process steps', r: ((remote.process || {}).steps   || []).length, l: ((local.process || {}).steps   || []).length },
        ];
        checks.forEach(function(c) {
          if (c.r > c.l) warnings.push('  • ' + c.label + ': remote has ' + c.r + ', your session has ' + c.l);
        });
      } catch(e) {}
    }
    if (warnings.length) {
      var proceed = window.confirm(
        '⚠️ Remote content has more items than your current session:\n\n' +
        warnings.join('\n') +
        '\n\nThis usually means you\'re working from a stale tab.\n' +
        'Publishing now will DELETE those extra remote items.\n\n' +
        'Cancel → close this tab, reopen the page fresh, then edit.\n' +
        'OK → overwrite anyway (only if you intentionally removed them).'
      );
      if (!proceed) {
        btn.textContent = 'Publish'; btn.disabled = false;
        statusEl.textContent = 'Publish cancelled'; statusEl.className = 'ab-conn';
        return Promise.resolve(null);
      }
    }
    return attempt(m.sha, m.content);
  });

  start
    .then(function(result) {
      if (!result) return; /* cancelled by divergence guard */
      btn.textContent = 'Published ✓'; btn.disabled = false; btn.classList.remove('has-changes');
      statusEl.textContent = 'Published'; statusEl.className = 'ab-conn ok';
      document.getElementById('adminUnsaved').style.display = 'none';
      setTimeout(function() { btn.textContent = 'Publish'; }, 3000);

      if (isLocal) {
        fetch('/content.json', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: json });
      }
      _deleteOrphanedImages(pat, oldImagePaths, _getImagePaths(window._contentData), isLocal);
    })
    .catch(function(err) {
      btn.textContent = 'Publish'; btn.disabled = false;
      statusEl.textContent = 'Error: ' + err.message; statusEl.className = 'ab-conn err';
      alert('Publish failed: ' + err.message);
    });
}

/* ── Local helpers mirroring shared.js builders ─────────────── */
function _esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function _getPath(obj, path) {
  return path.split('.').reduce(function(o,k){ return o != null ? o[k] : undefined; }, obj);
}
function _setPath(obj, path, val) {
  var keys = path.split('.'), last = keys.pop();
  var parent = keys.reduce(function(o,k){ return o[k]; }, obj);
  parent[last] = val;
}

function _buildWorkCard(card, idx) {
  var p = 'work.cards.' + idx;
  var url = card.watchUrl && card.watchUrl !== '#' ? card.watchUrl : '';
  return '<div class="work-card"' + (url ? ' data-url="' + _esc(url) + '"' : '') + ' data-array="work.cards" data-idx="' + idx + '">' +
    '<div class="work-thumb">' +
      (card.image ? '<img class="work-thumb-img" src="' + _esc(card.image) + '" alt="' + _esc(card.client) + '" style="object-position:' + _esc(card.imagePosition || 'center center') + '" onerror="this.style.opacity=\'0\'">' : '') +
      '<div class="work-thumb-grain"></div><div class="work-thumb-vignette"></div>' +
      '<span class="work-tag" data-edit-path="' + p + '.tag">' + _esc(card.tag) + '</span>' +
      '<div class="play-btn"><div class="play-btn-arrow"></div></div>' +
      '<span class="work-num" data-edit-path="' + p + '.num">' + _esc(card.num) + '</span>' +
    '</div>' +
    '<div class="work-info">' +
      '<div class="work-client" data-edit-path="' + p + '.client">' + _esc(card.client) + '</div>' +
      '<h3 data-edit-path="' + p + '.title">' + _esc(card.title) + '</h3>' +
      '<p data-edit-path="' + p + '.desc">' + _esc(card.desc) + '</p>' +
      '<span class="card-link" data-edit-path="' + p + '.watchUrl" data-edit-type="url">' + (url ? '↗ Watch URL · click to edit' : '+ Set watch URL') + '</span>' +
    '</div></div>';
}

function _buildOrigCard(film, idx) {
  var p = 'originals.films.' + idx;
  var hasUrl = film.watchUrl && film.watchUrl !== '#';
  return '<div class="orig-card reveal" data-array="originals.films" data-idx="' + idx + '"' + (hasUrl ? ' data-url="' + _esc(film.watchUrl) + '"' : '') + '>' +
    '<div class="orig-thumb">' +
      '<span class="orig-client-badge" data-edit-path="' + p + '.client">' + _esc(film.client) + '</span>' +
      (film.image ? '<img src="' + _esc(film.image) + '" alt="' + _esc(film.title) + '" onerror="this.style.opacity=\'0\'">' : '') +
    '</div>' +
    '<div class="orig-info">' +
      '<div class="orig-title" data-edit-path="' + p + '.title">' + _esc(film.title) + '</div>' +
      '<span class="orig-watch" data-edit-path="' + p + '.watchUrl" data-edit-type="url">' + (hasUrl ? '↗ Watch URL · click to edit' : '+ Set watch URL') + '</span>' +
    '</div></div>';
}

function _buildSvcCell(item, idx) {
  var p = 'services.items.' + idx;
  var num = ('0' + (idx + 1)).slice(-2);
  return '<div class="svc-cell" data-array="services.items" data-idx="' + idx + '">' +
    '<div class="svc-idx">' + num + '</div>' +
    '<h3 data-edit-path="' + p + '.title">' + _esc(item.title) + '</h3>' +
    '<p data-edit-path="' + p + '.desc">' + _esc(item.desc) + '</p></div>';
}

function _buildProcessStep(step, idx) {
  var p = 'process.steps.' + idx;
  var num = ('0' + (idx + 1)).slice(-2);
  var delay = idx > 0 && idx < 4 ? ' d' + idx : '';
  return '<div class="process-step reveal' + delay + '" data-array="process.steps" data-idx="' + idx + '">' +
    '<div class="proc-n">' + num + '</div>' +
    '<div class="proc-body">' +
      '<h3 data-edit-path="' + p + '.title">' + _esc(step.title) + '</h3>' +
      '<p data-edit-path="' + p + '.desc">' + _esc(step.desc) + '</p>' +
    '</div></div>';
}

function _buildTeamCard(member, idx) {
  var p = 'team.members.' + idx;
  var delay = idx > 0 && idx < 4 ? ' d' + idx : '';
  var creds = (member.creds || []).map(function(c){ return '<span>' + _esc(c) + '</span>'; }).join('');
  return '<div class="team-card reveal' + delay + '" data-array="team.members" data-idx="' + idx + '">' +
    (member.photo ? '<img class="avatar-photo" src="' + _esc(member.photo) + '" alt="' + _esc(member.name) + '" onerror="this.classList.add(\'broken\')">' : '') +
    '<div class="avatar-fallback" data-edit-path="' + p + '.initials">' + _esc(member.initials) + '</div>' +
    '<h3 data-edit-path="' + p + '.name">' + _esc(member.name) + '</h3>' +
    '<div class="team-role" data-edit-path="' + p + '.role">' + _esc(member.role) + '</div>' +
    '<p class="team-bio" data-edit-path="' + p + '.bio">' + _esc(member.bio) + '</p>' +
    '<div class="creds" data-edit-path="' + p + '.creds" data-edit-type="creds">' + creds + '</div>' +
    '<div class="team-socials">' +
      '<a href="' + _esc(member.instagram) + '" target="_blank" rel="noopener">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>' +
      '</a>' +
      '<a href="mailto:' + _esc(member.email) + '">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m2 7 10 7 10-7"/></svg>' +
      '</a>' +
    '</div></div>';
}

}();
