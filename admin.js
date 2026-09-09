/* ── BrandConvey Admin Layer ────────────────────────────────── */
!function() {

var _CONFIG = {
  owner:        'thenameisalbin',
  repo:         'brandconvey',
  branch:       'v2',
  /* SHA-256 of "admin2026" — change by visiting ?setup on any page */
  passwordHash: '6051fc84a7a0d74c225fb18a496b09952da5642e60723ecae543298edd7d82d6'
};

/* ── Setup mode: generate a new password hash ────────────────── */
if (window.location.search.indexOf('setup') > -1) {
  _showSetupModal(); return;
}

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

/* ── Setup modal (hash generator) ──────────────────────────── */
function _showSetupModal() {
  var overlay = document.createElement('div');
  overlay.id = 'adminOverlay';
  overlay.innerHTML =
    '<div class="admin-modal">' +
      '<div class="admin-modal-logo">Hash Generator</div>' +
      '<p class="admin-modal-sub">Type a new password to get its SHA-256 hash.<br>Paste the result into admin.js CONFIG.passwordHash.</p>' +
      '<input class="admin-modal-input" type="password" id="adminPwInput" placeholder="New password">' +
      '<div class="admin-hash-out" id="adminHashOut" style="display:none"></div>' +
      '<button class="admin-modal-btn" id="adminPwBtn">Generate hash</button>' +
    '</div>';
  document.body.appendChild(overlay);
  document.getElementById('adminPwBtn').addEventListener('click', function() {
    _sha256(document.getElementById('adminPwInput').value).then(function(h) {
      var out = document.getElementById('adminHashOut');
      out.textContent = h; out.style.display = 'block';
      out.onclick = function() {
        navigator.clipboard && navigator.clipboard.writeText(h);
        out.textContent = 'Copied!';
        setTimeout(function() { out.textContent = h; }, 1200);
      };
    });
  });
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
}

/* ── Inline text editing ────────────────────────────────────── */
function _setupInlineEdits(markUnsaved) {
  document.querySelectorAll('[data-edit-path]').forEach(function(el) {
    var type = el.getAttribute('data-edit-type') || 'text';

    /* Wrap element in edit-host, inject pencil ─────────────── */
    var host = document.createElement('span');
    host.className = 'edit-host';
    el.parentNode.insertBefore(host, el);
    host.appendChild(el);

    var pencil = document.createElement('button');
    pencil.className = 'edit-pencil';
    pencil.innerHTML = '✎';
    pencil.setAttribute('aria-label', 'Edit');
    pencil.setAttribute('type', 'button');
    host.appendChild(pencil);

    var path = el.getAttribute('data-edit-path');

    pencil.addEventListener('click', function(e) {
      e.stopPropagation();
      if (type === 'text') {
        _startTextEdit(el, path, markUnsaved, pencil);
      } else if (type === 'url') {
        _startUrlEdit(el, path, markUnsaved, pencil);
      } else if (type === 'tags') {
        _startTagsEdit(el, path, markUnsaved, pencil);
      } else if (type === 'creds') {
        _startCredsEdit(el, path, markUnsaved, pencil);
      }
    });
  });
}

function _startTextEdit(el, path, markUnsaved, pencil) {
  if (el.getAttribute('contenteditable')) return;
  el.setAttribute('contenteditable', 'true');
  el.classList.add('editing');
  pencil.style.display = 'none';
  el.focus();

  /* Move cursor to end */
  var range = document.createRange(), sel = window.getSelection();
  range.selectNodeContents(el); range.collapse(false);
  sel.removeAllRanges(); sel.addRange(range);

  function finish() {
    el.removeAttribute('contenteditable');
    el.classList.remove('editing');
    pencil.style.display = '';
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

function _startUrlEdit(el, path, markUnsaved, pencil) {
  var current = _getPath(window._contentData, path) || '';
  _showPopover(pencil, 'URL / path', current, function(val) {
    _setPath(window._contentData, path, val);
    if (el.tagName === 'A') el.setAttribute('href', val.indexOf('@') > -1 ? 'mailto:' + val : val);
    else el.textContent = val;
    markUnsaved();
  });
}

function _startTagsEdit(el, path, markUnsaved, pencil) {
  var arr = _getPath(window._contentData, path) || [];
  var current = arr.join(', ');
  _showPopover(pencil, 'Tags (comma-separated)', current, function(val) {
    var tags = val.split(',').map(function(t){ return t.trim(); }).filter(Boolean);
    _setPath(window._contentData, path, tags);
    el.innerHTML = tags.map(function(t){ return '<span>' + _esc(t) + '</span>'; }).join('');
    markUnsaved();
  });
}

function _startCredsEdit(el, path, markUnsaved, pencil) {
  var arr = _getPath(window._contentData, path) || [];
  var current = arr.join(', ');
  _showPopover(pencil, 'Credentials (comma-separated)', current, function(val) {
    var creds = val.split(',').map(function(c){ return c.trim(); }).filter(Boolean);
    _setPath(window._contentData, path, creds);
    el.innerHTML = creds.map(function(c){ return '<span>' + _esc(c) + '</span>'; }).join('');
    markUnsaved();
  });
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
  anchor.closest('.edit-host').appendChild(pop);

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

  /* Dismiss on outside click */
  setTimeout(function() {
    document.addEventListener('click', function dismiss(e) {
      if (!pop.contains(e.target) && e.target !== anchor) { pop.remove(); document.removeEventListener('click', dismiss); }
    });
  }, 0);
}

/* ── Array item management (add / delete) ─────────────────── */
function _setupArrayControls(markUnsaved) {
  /* Add delete buttons to existing array items */
  document.querySelectorAll('[data-array]').forEach(function(item) {
    _addDeleteBtn(item, markUnsaved);
  });

  /* Add "+" button after each array container */
  var containers = {};
  document.querySelectorAll('[data-array]').forEach(function(item) {
    var key = item.getAttribute('data-array');
    if (!containers[key]) containers[key] = item.parentNode;
  });

  Object.keys(containers).forEach(function(arrayPath) {
    var parent = containers[arrayPath];
    var addBtn = document.createElement('button');
    addBtn.className = 'admin-add-btn';
    addBtn.setAttribute('type', 'button');
    addBtn.innerHTML = '+ Add item';
    addBtn.addEventListener('click', function() {
      _addArrayItem(arrayPath, parent, markUnsaved);
    });
    parent.appendChild(addBtn);
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
    /* Re-render the section */
    _rerenderSection(arrayPath);
    _setupArrayControls(markUnsaved);
  });
}

function _addArrayItem(arrayPath, parent, markUnsaved) {
  var arr = _getPath(window._contentData, arrayPath);
  var template = JSON.parse(JSON.stringify(arr[0] || {}));
  /* Blank out the template values */
  Object.keys(template).forEach(function(k) {
    if (Array.isArray(template[k])) template[k] = [];
    else template[k] = '';
  });
  if (template.num !== undefined) template.num = ('0' + (arr.length + 1)).slice(-2);
  arr.push(template);
  _setPath(window._contentData, arrayPath, arr);
  markUnsaved();
  _rerenderSection(arrayPath);
  _setupArrayControls(markUnsaved);
}

function _rerenderSection(arrayPath) {
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
      h += '<div class="orig-card-placeholder reveal d2"><div class="orig-placeholder-label">In production</div><div class="orig-placeholder-sub">Coming soon to this screen</div></div>';
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
  }
  /* Re-attach edit affordances */
  _setupInlineEdits(function(){});
}

/* ── Publish to GitHub ──────────────────────────────────────── */
function _publish(pat, btn, statusEl) {
  if (!pat) { alert('Enter your GitHub PAT first.'); return; }
  btn.textContent = 'Publishing…'; btn.disabled = true;
  statusEl.textContent = 'Connecting…'; statusEl.className = 'ab-conn';

  var apiBase = 'https://api.github.com/repos/' + _CONFIG.owner + '/' + _CONFIG.repo + '/contents/content.json';
  var headers = { 'Authorization': 'token ' + pat, 'Content-Type': 'application/json' };

  /* 1. GET current SHA from the correct branch (undefined if file doesn't exist yet) */
  fetch(apiBase + '?ref=' + _CONFIG.branch, { headers: headers })
    .then(function(r) {
      if (r.status === 401) throw new Error('Invalid PAT — check permissions (needs repo Contents: write).');
      if (r.status === 404) return { sha: null };
      if (!r.ok) throw new Error('GitHub API error: ' + r.status);
      return r.json();
    })
    .then(function(meta) {
      /* 2. Encode new content */
      var json = JSON.stringify(window._contentData, null, 2);
      var encoded = btoa(unescape(encodeURIComponent(json)));

      /* 3. PUT (create or update) */
      var body = {
        message: 'Update site content via admin CMS',
        content: encoded,
        branch: _CONFIG.branch
      };
      if (meta.sha) body.sha = meta.sha;

      return fetch(apiBase, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(body)
      });
    })
    .then(function(r) {
      if (!r.ok) return r.json().then(function(e){ throw new Error(e.message || r.status); });
      return r.json();
    })
    .then(function() {
      btn.textContent = 'Published ✓'; btn.disabled = false; btn.classList.remove('has-changes');
      statusEl.textContent = 'Published'; statusEl.className = 'ab-conn ok';
      document.getElementById('adminUnsaved').style.display = 'none';
      setTimeout(function() { btn.textContent = 'Publish'; }, 3000);
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
  return '<div class="work-card" data-array="work.cards" data-idx="' + idx + '">' +
    '<div class="work-thumb">' +
      '<img class="work-thumb-img" src="' + _esc(card.image) + '" alt="' + _esc(card.client) + '" style="object-position:' + _esc(card.imagePosition || 'center center') + '">' +
      '<div class="work-thumb-grain"></div><div class="work-thumb-vignette"></div>' +
      '<span class="work-tag" data-edit-path="' + p + '.tag">' + _esc(card.tag) + '</span>' +
      '<div class="play-btn"><div class="play-btn-arrow"></div></div>' +
      '<span class="work-num" data-edit-path="' + p + '.num">' + _esc(card.num) + '</span>' +
    '</div>' +
    '<div class="work-info">' +
      '<div class="work-client" data-edit-path="' + p + '.client">' + _esc(card.client) + '</div>' +
      '<h3 data-edit-path="' + p + '.title">' + _esc(card.title) + '</h3>' +
      '<p data-edit-path="' + p + '.desc">' + _esc(card.desc) + '</p>' +
      '<a class="card-link" href="services.html">View details →</a>' +
    '</div></div>';
}

function _buildOrigCard(film, idx) {
  var p = 'originals.films.' + idx;
  return '<div class="orig-card reveal" data-array="originals.films" data-idx="' + idx + '">' +
    '<div class="orig-thumb">' +
      '<span class="orig-client-badge" data-edit-path="' + p + '.client">' + _esc(film.client) + '</span>' +
      '<img src="' + _esc(film.image) + '" alt="' + _esc(film.title) + '">' +
    '</div>' +
    '<div class="orig-info">' +
      '<div class="orig-title" data-edit-path="' + p + '.title">' + _esc(film.title) + '</div>' +
      '<a class="orig-watch" href="' + _esc(film.watchUrl) + '" data-edit-path="' + p + '.watchUrl" data-edit-type="url">Watch the film →</a>' +
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
    '<img class="avatar-photo" src="' + _esc(member.photo) + '" alt="' + _esc(member.name) + '" onerror="this.classList.add(\'broken\')">' +
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
