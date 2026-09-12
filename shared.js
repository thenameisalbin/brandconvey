/* ── HTML escape helper ─────────────────────────────────────── */
function _esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Deep path helpers (used by admin.js) ───────────────────── */
function _getPath(obj, path) {
  return path.split('.').reduce(function(o,k){ return o != null ? o[k] : undefined; }, obj);
}
function _setPath(obj, path, val) {
  var keys = path.split('.'), last = keys.pop();
  var parent = keys.reduce(function(o,k){ return o[k]; }, obj);
  parent[last] = val;
}

/* ── SVG icon constants ─────────────────────────────────────── */
var _SVG = {
  ig15:  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>',
  ig16:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>',
  ig18:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>',
  fb15:  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 8h-2a2 2 0 0 0-2 2v3H9v3h2v6h3v-6h2.5l.5-3H14v-2.2c0-.6.2-1 1-1h1.5V8z"/></svg>',
  fb18:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 8h-2a2 2 0 0 0-2 2v3H9v3h2v6h3v-6h2.5l.5-3H14v-2.2c0-.6.2-1 1-1h1.5V8z"/></svg>',
  email16: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m2 7 10 7 10-7"/></svg>',
  email17: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m2 7 10 7 10-7"/></svg>',
  user17:  '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
  loc17:   '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  screen:  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  arrow:   '<svg class="gallery-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>'
};

/* ── Build: work card ───────────────────────────────────────── */
function _buildWorkCard(card, idx) {
  var p = 'work.cards.' + idx;
  var url = card.watchUrl && card.watchUrl !== '#' ? card.watchUrl : '';
  return '<div class="work-card"' + (url ? ' data-url="' + _esc(url) + '"' : '') + ' data-array="work.cards" data-idx="' + idx + '">' +
    '<div class="work-thumb">' +
      (card.image ? '<img class="work-thumb-img" src="' + _esc(card.image) + '" alt="' + _esc(card.client) + '" style="object-position:' + _esc(card.imagePosition || 'center center') + '" onerror="this.style.opacity=\'0\'">' : '') +
      '<div class="work-thumb-grain"></div>' +
      '<div class="work-thumb-vignette"></div>' +
      '<span class="work-tag" data-edit-path="' + p + '.tag">' + _esc(card.tag) + '</span>' +
      '<div class="play-btn"><div class="play-btn-arrow"></div></div>' +
      '<span class="work-num" data-edit-path="' + p + '.num">' + _esc(card.num) + '</span>' +
    '</div>' +
    '<div class="work-info">' +
      '<div class="work-client" data-edit-path="' + p + '.client">' + _esc(card.client) + '</div>' +
      '<h3 data-edit-path="' + p + '.title">' + _esc(card.title) + '</h3>' +
      '<p data-edit-path="' + p + '.desc">' + _esc(card.desc) + '</p>' +
      (url ? '<span class="card-link">↗ Click to watch</span>' : '') +
    '</div>' +
  '</div>';
}

/* ── Build: originals card ──────────────────────────────────── */
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
      '<span class="orig-watch" data-edit-path="' + p + '.watchUrl" data-edit-type="url">' + (hasUrl ? '↗ Watch the film' : 'Coming soon') + '</span>' +
    '</div>' +
  '</div>';
}

/* ── Build: services grid ───────────────────────────────────── */
function _buildSvcCell(item, idx) {
  var p = 'services.items.' + idx;
  var num = ('0' + (idx + 1)).slice(-2);
  return '<div class="svc-cell" data-array="services.items" data-idx="' + idx + '">' +
    '<div class="svc-idx">' + num + '</div>' +
    '<h3 data-edit-path="' + p + '.title">' + _esc(item.title) + '</h3>' +
    '<p data-edit-path="' + p + '.desc">' + _esc(item.desc) + '</p>' +
  '</div>';
}

/* ── Build: process step ────────────────────────────────────── */
function _buildProcessStep(step, idx) {
  var p = 'process.steps.' + idx;
  var num = ('0' + (idx + 1)).slice(-2);
  var delay = idx > 0 && idx < 4 ? ' d' + idx : '';
  return '<div class="process-step reveal' + delay + '" data-array="process.steps" data-idx="' + idx + '">' +
    '<div class="proc-n">' + num + '</div>' +
    '<div class="proc-body">' +
      '<h3 data-edit-path="' + p + '.title">' + _esc(step.title) + '</h3>' +
      '<p data-edit-path="' + p + '.desc">' + _esc(step.desc) + '</p>' +
    '</div>' +
  '</div>';
}

/* ── Build: team card ───────────────────────────────────────── */
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
      '<a href="' + _esc(member.instagram) + '" target="_blank" rel="noopener" aria-label="' + _esc(member.name) + ' on Instagram">' + _SVG.ig16 + '</a>' +
      '<a href="mailto:' + _esc(member.email) + '" aria-label="Email ' + _esc(member.name) + '">' + _SVG.email16 + '</a>' +
    '</div>' +
  '</div>';
}

/* ── Build: contact cards (shared between pages) ────────────── */
function _buildContactCards(contact) {
  var founders = (contact.founders || []).map(function(f, i) {
    var p = 'contact.founders.' + i;
    var last = i === (contact.founders.length - 1);
    return '<div data-array="contact.founders" data-idx="' + i + '" style="display:flex;flex-direction:column;gap:4px;padding:10px 0' + (last ? '' : ';border-bottom:1px solid var(--rule)') + '">' +
      '<div class="cc-founder-name" data-edit-path="' + p + '.name">' + _esc(f.name) + '</div>' +
      '<a href="mailto:' + _esc(f.email) + '" data-edit-path="' + p + '.email" data-edit-type="url">' + _esc(f.email) + '</a>' +
    '</div>';
  }).join('');
  var addr = _esc(contact.address || '').replace(/\n/g, '<br>');
  return (
    '<div class="contact-card">' +
      '<div class="cc-icon">' + _SVG.email17 + '</div>' +
      '<div class="cc-label">General Enquiries</div>' +
      '<div class="cc-value">' +
        '<a href="mailto:' + _esc(contact.generalEmail) + '" data-edit-path="contact.generalEmail" data-edit-type="url">' + _esc(contact.generalEmail) + '</a>' +
        '<a href="' + _esc(contact.phoneHref) + '" data-edit-path="contact.phone" data-edit-type="url">' + _esc(contact.phone) + '</a>' +
      '</div>' +
    '</div>' +
    '<div class="contact-card">' +
      '<div class="cc-icon">' + _SVG.user17 + '</div>' +
      '<div class="cc-label">Founders</div>' +
      '<div class="cc-value">' + founders + '</div>' +
    '</div>' +
    '<div class="contact-card">' +
      '<div class="cc-icon">' + _SVG.loc17 + '</div>' +
      '<div class="cc-label">Our Location</div>' +
      '<div class="cc-value"><address data-edit-path="contact.address">' + addr + '</address></div>' +
    '</div>'
  );
}

/* ── Render: populate all data-section containers ───────────── */
function _renderContent(data) {
  window._contentData = data;

  /* Nav + footer global links --------------------------------- */
  document.querySelectorAll('a.nav-cta-sm').forEach(function(a) {
    a.setAttribute('href', data.global.phoneHref);
    a.textContent = data.global.phone;
  });
  document.querySelectorAll('a.mob-cta').forEach(function(a) {
    if (a.getAttribute('href') && a.getAttribute('href').indexOf('tel:') === 0) {
      a.setAttribute('href', data.global.phoneHref);
      a.textContent = data.global.phone;
    }
  });
  document.querySelectorAll('a[href^="tel:"]').forEach(function(a) {
    if (!a.classList.contains('mob-cta') && !a.classList.contains('nav-cta-sm') && !a.classList.contains('btn')) {
      a.setAttribute('href', data.global.phoneHref);
      if (a.closest('.foot-links')) a.textContent = data.global.phone;
    }
  });
  document.querySelectorAll('a[aria-label="Instagram"]').forEach(function(a) { a.setAttribute('href', data.global.instagram); });
  document.querySelectorAll('a[aria-label="Facebook"]').forEach(function(a)  { a.setAttribute('href', data.global.facebook); });
  document.querySelectorAll('.foot-links a').forEach(function(a) {
    if ((a.getAttribute('href') || '').indexOf('instagram') > -1) a.setAttribute('href', data.global.instagram);
    if ((a.getAttribute('href') || '').indexOf('facebook') > -1)  a.setAttribute('href', data.global.facebook);
  });
  var fc = document.querySelector('.foot-copy');
  if (fc) fc.textContent = data.global.footerCopyright;

  /* Hero text (index.html only) ------------------------------- */
  var heroEyebrow = document.querySelector('.hero-eyebrow');
  if (heroEyebrow) {
    heroEyebrow.setAttribute('data-edit-path', 'hero.eyebrow');
    heroEyebrow.textContent = data.hero.eyebrow;
  }
  var heroH1 = document.querySelector('.hero h1');
  if (heroH1) {
    heroH1.innerHTML = _esc(data.hero.h1Plain) + '<br><em data-edit-path="hero.h1Em">' + _esc(data.hero.h1Em) + '</em>' + _esc(data.hero.h1Suffix);
    heroH1.setAttribute('data-edit-path', 'hero.h1Plain');
  }
  var heroStatus = document.querySelector('.hero-status');
  if (heroStatus) {
    heroStatus.innerHTML = '<span class="status-dot"></span><span data-edit-path="hero.statusText">' + _esc(data.hero.statusText) + '</span>';
  }
  var hCards = document.querySelectorAll('.h-card');
  if (hCards[0]) {
    var lbl1 = hCards[0].querySelector('.h-card-label');
    var tgl1 = hCards[0].querySelector('.h-tagline');
    if (lbl1) { lbl1.setAttribute('data-edit-path', 'hero.card1Label'); lbl1.textContent = data.hero.card1Label; }
    if (tgl1) { tgl1.setAttribute('data-edit-path', 'hero.card1TaglinePlain'); tgl1.innerHTML = _esc(data.hero.card1TaglinePlain) + '<em data-edit-path="hero.card1TaglineEm">' + _esc(data.hero.card1TaglineEm) + '</em>'; }
  }
  if (hCards[1]) {
    var lbl2 = hCards[1].querySelector('.h-card-label');
    var tags = hCards[1].querySelector('.hero-tags');
    if (lbl2) { lbl2.setAttribute('data-edit-path', 'hero.card2Label'); lbl2.textContent = data.hero.card2Label; }
    if (tags) {
      tags.setAttribute('data-edit-path', 'hero.card2Tags');
      tags.setAttribute('data-edit-type', 'tags');
      tags.innerHTML = data.hero.card2Tags.map(function(t){ return '<span>' + _esc(t) + '</span>'; }).join('');
    }
  }

  /* Ticker ---------------------------------------------------- */
  var tickerTrack = document.getElementById('tickerTrack');
  if (tickerTrack) {
    tickerTrack.innerHTML = '';
    var items = data.ticker.items;
    var f = document.createDocumentFragment();
    items.concat(items, items).forEach(function(tx) {
      var s = document.createElement('span'); s.className = 't-item'; s.textContent = tx; f.appendChild(s);
    });
    tickerTrack.appendChild(f);
  }

  /* Work filmstrip (index.html) ------------------------------- */
  var filmstrip = document.querySelector('[data-section="work-filmstrip"]');
  if (filmstrip) {
    var html = data.work.cards.map(_buildWorkCard).join('');
    html += '<div class="work-upcoming">' +
      '<div class="plus-ring">+</div>' +
      '<h3>More on the way</h3>' +
      '<p>Currently in production — check back soon.</p>' +
    '</div>';
    filmstrip.innerHTML = html;
  }

  /* Work gallery (work-gallery.html) -------------------------- */
  var wgrid = document.querySelector('[data-section="work-gallery"]');
  if (wgrid) {
    wgrid.innerHTML = data.work.cards.map(function(card, idx) {
      return _buildWorkCard(card, idx).replace('class="work-card"', 'class="work-card reveal' + (idx > 0 && idx < 4 ? ' d' + idx : '') + '"');
    }).join('');
  }

  /* Originals grid (index.html + originals-gallery.html) ------ */
  document.querySelectorAll('[data-section="originals"]').forEach(function(grid) {
    var html = data.originals.films.map(_buildOrigCard).join('');
    html += '<div class="orig-card-placeholder reveal d3">' +
      '<svg class="slate-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 2l-4 5-4-5"/><line x1="2" y1="7" x2="22" y2="7"/><line x1="7" y1="2" x2="7" y2="7"/><line x1="12" y1="2" x2="12" y2="7"/><line x1="17" y1="2" x2="17" y2="7"/></svg>' +
      '<div class="orig-placeholder-label">Coming soon</div>' +
      '<div class="orig-placeholder-sub">A new project is in the works</div>' +
    '</div>';
    grid.innerHTML = html;
  });

  /* Services grid (services.html) ----------------------------- */
  var svgrid = document.querySelector('[data-section="services"]');
  if (svgrid) svgrid.innerHTML = data.services.items.map(_buildSvcCell).join('');

  /* Process list (services.html) ------------------------------ */
  var proclist = document.querySelector('[data-section="process"]');
  if (proclist) proclist.innerHTML = data.process.steps.map(_buildProcessStep).join('');

  /* Team grid (about.html) ------------------------------------ */
  var teamgrid = document.querySelector('[data-section="team"]');
  if (teamgrid) teamgrid.innerHTML = data.team.members.map(_buildTeamCard).join('');

  /* Contact cards (index.html bottom) ------------------------- */
  var cc = document.querySelector('[data-section="contact-cards"]');
  if (cc) cc.innerHTML = _buildContactCards(data.contact);

  /* Contact sidebar (contact.html) ---------------------------- */
  var cs = document.querySelector('[data-section="contact-sidebar"]');
  if (cs) cs.innerHTML = _buildContactCards(data.contact);

  /* Page heroes, section heads, CTAs ------------------------- */
  var _p = data.pages || {};
  function _hero(key) {
    var pg = _p[key]; if (!pg) return;
    var el = document.querySelector('[data-section="page-hero-' + key + '"]');
    if (!el) return;
    el.innerHTML =
      '<div class="eyebrow" data-edit-path="pages.' + key + '.heroEyebrow">' + _esc(pg.heroEyebrow) + '</div>' +
      '<h1 data-edit-path="pages.' + key + '.heroH1">' + _esc(pg.heroH1) + '</h1>' +
      '<p data-edit-path="pages.' + key + '.heroSub">' + _esc(pg.heroSub) + '</p>';
  }
  function _shead(section, pathKey, eyebrowKey, h2Key, subKey) {
    var pg = _p[pathKey]; if (!pg) return;
    var el = document.querySelector('[data-section="section-head-' + section + '"]');
    if (!el) return;
    el.innerHTML =
      '<div class="section-eyebrow" data-edit-path="pages.' + pathKey + '.' + eyebrowKey + '">' + _esc(pg[eyebrowKey]) + '</div>' +
      '<h2 data-edit-path="pages.' + pathKey + '.' + h2Key + '">' + _esc(pg[h2Key]) + '</h2>' +
      '<p data-edit-path="pages.' + pathKey + '.' + subKey + '">' + _esc(pg[subKey]) + '</p>';
  }
  function _cta(key) {
    var pg = _p[key]; if (!pg || !pg.ctaH2) return;
    var el = document.querySelector('[data-section="cta-' + key + '"]');
    if (!el) return;
    el.innerHTML =
      '<h2 class="reveal" data-edit-path="pages.' + key + '.ctaH2">' + _esc(pg.ctaH2) + '</h2>' +
      '<p class="reveal d1" data-edit-path="pages.' + key + '.ctaSub">' + _esc(pg.ctaSub) + '</p>';
  }
  _hero('services'); _hero('about'); _hero('contact'); _hero('work'); _hero('originals');
  _shead('svc',     'services', 'svcEyebrow',     'svcH2',     'svcSub');
  _shead('process', 'services', 'processEyebrow', 'processH2', 'processSub');
  _shead('team',    'about',    'teamEyebrow',     'teamH2',    'teamSub');
  _cta('services'); _cta('about'); _cta('work'); _cta('originals');

  /* Re-run scroll reveal on newly created .reveal elements ---- */
  _initReveal();

  /* Notify admin.js when ready -------------------------------- */
  if (typeof _adminInit === 'function') _adminInit(data);
}

/* ── Load content.json and render ───────────────────────────── */
function _loadContent() {
  fetch('content.json?v=' + Date.now())
    .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(_renderContent)
    .catch(function() {});
}

/* ── Scroll reveal ──────────────────────────────────────────── */
function _initReveal() {
  var els = document.querySelectorAll('.reveal:not(.visible)');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function(el) { el.classList.add('visible'); }); return;
  }
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: .07, rootMargin: '0px 0px -32px 0px' });
  els.forEach(function(el) { io.observe(el); });
}

/* ── Rail builder ───────────────────────────────────────────── */
!function() {
  var r = document.getElementById('railTrack');
  if (!r) return;
  var f = document.createDocumentFragment();
  for (var i = 0; i < 60; i++) { var s = document.createElement('span'); f.appendChild(s); }
  r.appendChild(f);
}();

/* ── Mobile menu ────────────────────────────────────────────── */
!function() {
  var btn  = document.getElementById('menuBtn');
  var menu = document.getElementById('mobMenu');
  var nav  = document.getElementById('mainNav');
  if (!btn || !menu) return;
  function openMenu() {
    menu.style.paddingTop = (nav.offsetHeight + 24) + 'px';
    menu.classList.add('open'); btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menu.classList.remove('open'); btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  btn.addEventListener('click', function() { menu.classList.contains('open') ? closeMenu() : openMenu(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeMenu(); });
  menu.querySelectorAll('a').forEach(function(a) { a.addEventListener('click', closeMenu); });
}();

/* ── Filmstrip drag ─────────────────────────────────────────── */
!function() {
  var strip = document.getElementById('filmstrip');
  if (!strip) return;
  var down = false, startX, sl, moved = false;
  strip.addEventListener('mousedown', function(e) {
    down = true; moved = false;
    startX = e.pageX - strip.getBoundingClientRect().left;
    sl = strip.scrollLeft; strip.style.userSelect = 'none';
  });
  window.addEventListener('mouseup', function() { down = false; strip.style.userSelect = ''; });
  strip.addEventListener('mousemove', function(e) {
    if (!down) return; e.preventDefault();
    if (Math.abs(e.pageX - strip.getBoundingClientRect().left - startX) > 5) moved = true;
    strip.scrollLeft = sl - (e.pageX - strip.getBoundingClientRect().left - startX) * 1.4;
  });
  strip.addEventListener('click', function(e) {
    if (moved) { moved = false; return; }
    if (e.target.closest('.admin-delete-btn, .admin-edit-btn, .admin-drag-handle, .admin-img-btn, [data-edit-path]')) return;
    var card = e.target.closest('.work-card');
    if (card) {
      var url = card.getAttribute('data-url');
      if (url) window.open(url, '_blank', 'noopener');
    }
  });
  strip.addEventListener('touchstart', function() { moved = false; }, { passive: true });
  strip.addEventListener('touchmove', function() { moved = true; }, { passive: true });
  strip.addEventListener('touchend', function(e) {
    if (moved) return;
    var card = e.target.closest('.work-card');
    if (card) {
      var url = card.getAttribute('data-url');
      if (url) window.open(url, '_blank', 'noopener');
    }
  });
}();

/* ── Work gallery card click (work-gallery.html) ────────────── */
!function() {
  var grid = document.querySelector('[data-section="work-gallery"]');
  if (!grid) return;
  grid.addEventListener('click', function(e) {
    if (e.target.closest('.admin-delete-btn, .admin-edit-btn, .admin-drag-handle, .admin-img-btn, [data-edit-path]')) return;
    var card = e.target.closest('.work-card[data-url]');
    if (card) window.open(card.getAttribute('data-url'), '_blank', 'noopener');
  });
}();

/* ── Originals card click (index + originals-gallery) ────────── */
!function() {
  document.querySelectorAll('[data-section="originals"]').forEach(function(grid) {
    grid.addEventListener('click', function(e) {
      if (e.target.closest('.admin-delete-btn, .admin-edit-btn, .admin-drag-handle, .admin-img-btn, [data-edit-path]')) return;
      var card = e.target.closest('.orig-card[data-url]');
      if (card) window.open(card.getAttribute('data-url'), '_blank', 'noopener');
    });
  });
}();

/* ── Initial reveal pass ────────────────────────────────────── */
_initReveal();

/* ── Load admin layer if in edit mode ───────────────────────── */
if (window.location.search.indexOf('edit') > -1) {
  var _ac = document.createElement('link');
  var _cv = '?v=' + Date.now();
  _ac.rel = 'stylesheet'; _ac.href = 'admin.css' + _cv;
  document.head.appendChild(_ac);
  var _as = document.createElement('script');
  _as.src = 'admin.js' + _cv;
  document.head.appendChild(_as);
}

/* ── Kick off content load ──────────────────────────────────── */
_loadContent();
