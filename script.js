// Shared site script: page transitions, footer year, nav, stat counters, video toggles, filters, pointer glow.
// Small on purpose: no libraries, passive listeners, work only when something is on screen.

// Page transitions. Chrome, Edge and Safari animate page changes natively (see "page transition" in style.css):
// all this script does is remember where you clicked, so the new page can open from that point. Other browsers
// get a short fade out here instead. Same-site links only, plain clicks only, nothing for reduced-motion users.
// Links are prefetched just before the click (speculation rules where supported) so the next page opens fast.
(function(){
  var html = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var native = !!window.CSSViewTransitionRule;
  // never leave the page faded out (back button / bfcache)
  window.addEventListener('pageshow', function(){ html.classList.remove('pt-out'); try { sessionStorage.removeItem('pt'); } catch(e){} });
  window.addEventListener('load', function(){ setTimeout(function(){ html.classList.remove('pt-in'); }, 2600); });

  if (window.HTMLScriptElement && HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
    var sr = document.createElement('script'); sr.type = 'speculationrules';
    sr.textContent = JSON.stringify({ prefetch: [{ where: { and: [{ href_matches: '/*' }, { not: { href_matches: '/*.pdf' } }, { not: { selector_matches: '[download],[target=_blank]' } }] }, eagerness: 'moderate' }] });
    document.head.appendChild(sr);
  } else {
    var warmed = {};
    var warm = function(e){
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if (!a || a.origin !== location.origin || warmed[a.href] || /\.(pdf|zip)(\?|#|$)/i.test(a.pathname)) return;
      warmed[a.href] = 1;
      var l = document.createElement('link'); l.rel = 'prefetch'; l.href = a.href; document.head.appendChild(l);
    };
    document.addEventListener('pointerover', warm, { passive: true });
    document.addEventListener('touchstart', warm, { passive: true });
  }
  if (reduce) return;

  var FILE = /\.(pdf|zip|png|jpe?g|gif|webp|svg|xml|txt|docx?|pptx?|xlsx?|mp4|mp3)(\?|#|$)/i;
  function eligible(a){
    if (!a || !a.href || a.hasAttribute('download')) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.origin !== location.origin || !/^https?:$/.test(a.protocol)) return false;
    if (FILE.test(a.pathname)) return false;
    if (a.pathname === location.pathname && a.search === location.search) return false; // same page or #anchor
    return true;
  }
  document.addEventListener('click', function(e){
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!eligible(a)) return;
    var x = e.clientX, y = e.clientY;
    if (!x && !y) { var r = a.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; } // keyboard "click"
    try { sessionStorage.setItem('pt', Math.round(x) + ',' + Math.round(y) + ',' + Date.now()); } catch(err){}
    if (native) return;                          // the browser does the animation
    e.preventDefault();
    if (html.classList.contains('pt-out')) return;
    html.classList.add('pt-out');
    setTimeout(function(){ location.href = a.href; }, 260);
  });
})();

// Header drawings drift a few pixels with the pointer (desktop only)
(function(){
  var art = document.querySelector('.page-art');
  if (!art || !window.matchMedia || !matchMedia('(hover: hover) and (min-width: 1100px) and (prefers-reduced-motion: no-preference)').matches) return;
  var raf = 0, x = 0, y = 0;
  document.addEventListener('pointermove', function(e){
    x = (e.clientX / window.innerWidth - .5) * 2; y = (e.clientY / window.innerHeight - .5) * 2;
    if (raf) return;
    raf = requestAnimationFrame(function(){
      raf = 0;
      art.style.setProperty('--px', (x * -9).toFixed(1) + 'px');
      art.style.setProperty('--py', (y * -7).toFixed(1) + 'px');
    });
  }, { passive: true });
})();

// Footer year
(function(){
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

// Nav: mobile drawer + a solid bar once the page has scrolled
(function(){
  var bar = document.querySelector('body > nav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  var backdrop = document.getElementById('navBackdrop');

  if (bar) {
    var ticking = false;
    var update = function(){ bar.classList.toggle('scrolled', window.scrollY > 12); ticking = false; };
    window.addEventListener('scroll', function(){
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  if (!toggle || !links) return;
  function closeMenu(){
    links.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    if (backdrop) backdrop.classList.remove('open');
  }
  function openMenu(){
    links.classList.add('open');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    if (backdrop) backdrop.classList.add('open');
  }
  toggle.addEventListener('click', function(){
    if (links.classList.contains('open')) closeMenu(); else openMenu();
  });
  if (backdrop) backdrop.addEventListener('click', closeMenu);
  links.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', function(){ if (window.innerWidth >= 960) closeMenu(); });
})();

// Animated stat counters: elements with [data-count] count up once when they scroll into view
(function(){
  var counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCount(el){
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    if (reduce) { el.textContent = target.toLocaleString(); return; }
    var duration = 1400, start = null;
    function step(ts){
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 4);
      var value = target * eased;
      el.textContent = (Number.isInteger(target) ? Math.round(value) : value.toFixed(1)).toLocaleString();
      if (progress < 1) requestAnimationFrame(step); else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) { counters.forEach(animateCount); return; }
  // Counters below the fold start from 0 (the final number stays in the HTML as the no-JS fallback)
  if (!reduce) counters.forEach(function(el){
    if (el.getBoundingClientRect().top > window.innerHeight) el.textContent = '0';
  });
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting) { animateCount(entry.target); io.unobserve(entry.target); }
    });
  }, { threshold: 0.6 });
  counters.forEach(function(el){ io.observe(el); });
})();

// Pointer glow on clickable surfaces (cards, folders, posts). One delegated listener.
(function(){
  if (!window.matchMedia || !matchMedia('(hover: hover)').matches) return;
  var sel = '.folder-card, .post-row, a.card, .platform-chip';
  var els = document.querySelectorAll(sel);
  els.forEach(function(el){ el.classList.add('spot'); });
  if (!els.length) return;
  var raf = 0, target = null, px = 0, py = 0;
  document.addEventListener('pointermove', function(e){
    var el = e.target.closest ? e.target.closest(sel) : null;
    if (!el) return;
    target = el; px = e.clientX; py = e.clientY;
    if (raf) return;
    raf = requestAnimationFrame(function(){
      raf = 0;
      var r = target.getBoundingClientRect();
      target.style.setProperty('--mx', (px - r.left) + 'px');
      target.style.setProperty('--my', (py - r.top) + 'px');
    });
  }, { passive: true });
})();

// Video toggles (weekly notes): a "Watch animation" button opens an inline YouTube player.
// The player is only created on click, so no YouTube code loads until a visitor asks for it.
// data-video accepts a plain 11-character YouTube ID or any normal YouTube link.
// Leave data-video empty and the button shows "Video coming soon".
(function(){
  var buttons = document.querySelectorAll('.video-toggle');
  if (!buttons.length) return;

  function youtubeId(value){
    if (!value) return null;
    value = value.trim();
    if (/^[\w-]{11}$/.test(value)) return value;
    var m = value.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/);
    return m ? m[1] : null;
  }

  buttons.forEach(function(btn){
    var id = youtubeId(btn.getAttribute('data-video'));
    var card = btn.closest('.week-card');
    var box = card ? card.querySelector('.video-embed') : null;
    var label = btn.textContent;

    if (!id || !box) {
      btn.disabled = true;
      btn.textContent = 'Video coming soon';
      return;
    }

    btn.addEventListener('click', function(){
      var open = !box.hasAttribute('hidden');
      if (open) {
        box.setAttribute('hidden', '');
        box.innerHTML = '';
        btn.textContent = label;
        btn.setAttribute('aria-expanded', 'false');
        return;
      }
      var frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&autoplay=1';
      frame.title = card.querySelector('h3') ? card.querySelector('h3').textContent + ' (animation)' : 'Animation video';
      frame.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      frame.setAttribute('allowfullscreen', '');
      frame.loading = 'lazy';
      box.appendChild(frame);
      box.removeAttribute('hidden');
      btn.textContent = 'Hide video';
      btn.setAttribute('aria-expanded', 'true');
    });
  });
})();

// Clickable category filter tags (Notes page, etc.)
(function(){
  var tags = document.querySelectorAll('.tag.filter[data-filter]');
  if (!tags.length) return;
  var cards = document.querySelectorAll('[data-category]');

  tags.forEach(function(tag){
    tag.style.cursor = 'pointer';
    tag.addEventListener('click', function(){
      var isActive = tag.classList.contains('active');
      tags.forEach(function(t){ t.classList.remove('active'); });

      if (isActive) {
        cards.forEach(function(c){ c.style.display = ''; });
        return;
      }

      tag.classList.add('active');
      var filter = tag.getAttribute('data-filter');
      cards.forEach(function(c){
        c.style.display = (c.getAttribute('data-category') === filter) ? '' : 'none';
      });
    });
  });
})();

// Work With Me: project brief form. With data-endpoint set (Web3Forms, Formspree, ...) it posts there;
// without one it opens the visitor's email app with the message already written, so it works from day one.
// Buttons with data-brief="tutoring|ai-tools|animation|other" jump to the form and pre-select that topic.
(function(){
  var f = document.getElementById('briefForm');
  if (!f) return;
  var out = f.querySelector('.brief-status'), sel = f.elements.namedItem('type'), to = f.getAttribute('data-mailto');
  function say(t, bad){ out.textContent = t; out.classList.toggle('err', !!bad); }
  function val(n){ return f.elements.namedItem(n).value.trim(); }
  document.addEventListener('click', function(e){
    var a = e.target.closest ? e.target.closest('[data-brief]') : null;
    if (a && sel) sel.value = a.getAttribute('data-brief');
  });
  f.addEventListener('submit', function(e){
    e.preventDefault();
    if (val('company')) return;                                   // hidden spam trap
    var label = sel.options[sel.selectedIndex].text, ep = f.getAttribute('data-endpoint');
    var subject = label + ' inquiry from ' + val('name');
    if (ep) {
      var btn = f.querySelector('[type=submit]'), d = new FormData(f);
      d.delete('company'); d.append('subject', subject); d.append('_subject', subject);
      btn.disabled = true; say('Sending...');
      fetch(ep, { method: 'POST', body: d, headers: { Accept: 'application/json' } })
        .then(function(r){ if (!r.ok) throw 0; f.reset(); say('Thank you, your message is on its way. I will reply by email.'); })
        .catch(function(){ say('That did not go through. Please email ' + to + ' directly.', true); })
        .then(function(){ btn.disabled = false; });
      return;
    }
    var body = val('message') + '\n\nName: ' + val('name') + '\nReply to: ' + val('email') + '\nTopic: ' + label + (val('deadline') ? '\nDeadline: ' + val('deadline') : '');
    var a = document.createElement('a');
    a.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    a.click();
    say('Your email app should open with the message ready to send. If it does not, write to ' + to + '.');
  });
})();

// Reel wall: every reel is just a poster until a visitor asks for it. The video file is fetched only when a reel
// starts: hover with a mouse, tap, or (on phones) scrolled to the middle of the screen. One reel plays at a time.
// With reduced motion, Data Saver or a very slow connection nothing starts by itself; a reel plays only when clicked.
(function(){
  var row = document.querySelector('.reel-row');
  if (!row) return;
  var reels = [].slice.call(row.querySelectorAll('.reel'));
  var mq = function(q){ return window.matchMedia && matchMedia(q).matches; };
  var conn = navigator.connection || {};
  var auto = !mq('(prefers-reduced-motion: reduce)') && !conn.saveData && !/2g/.test(conn.effectiveType || '');
  var touch = !mq('(hover: hover)');
  function frameOf(r){ return r.querySelector('.reel-frame'); }
  function video(r){
    var v = r.querySelector('video');
    if (!v) {
      v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
      v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
      v.addEventListener('error', function(){ v.remove(); r.classList.remove('on'); });
      v.src = r.getAttribute('data-src');
      frameOf(r).insertBefore(v, r.querySelector('.reel-play'));
    }
    return v;
  }
  function stop(r){ var v = r.querySelector('video'); if (v) v.pause(); r.classList.remove('on'); r.removeAttribute('data-pin'); frameOf(r).setAttribute('aria-pressed', 'false'); }
  function start(r){
    reels.forEach(function(o){ if (o !== r) stop(o); });
    var p = video(r).play();
    r.classList.add('on'); frameOf(r).setAttribute('aria-pressed', 'true');
    if (p && p.catch) p.catch(function(){ stop(r); });
  }
  var hoverMode = auto && !touch;
  reels.forEach(function(r){
    frameOf(r).addEventListener('click', function(e){
      var on = r.classList.contains('on');
      if (hoverMode && on && e.detail > 0 && !r.hasAttribute('data-pin')) { r.setAttribute('data-pin', ''); return; } // mouse click on a reel that is playing: keep it playing after the pointer leaves
      if (on) { stop(r); r.setAttribute('data-held', ''); }
      else { r.removeAttribute('data-held'); start(r); }
    });
    if (hoverMode) {
      frameOf(r).addEventListener('pointerenter', function(e){ if (e.pointerType === 'mouse' && !r.hasAttribute('data-held')) start(r); });
      frameOf(r).addEventListener('pointerleave', function(e){ if (e.pointerType === 'mouse' && !r.hasAttribute('data-pin')) stop(r); });
    }
  });
  if (auto && touch && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(en){
        var r = en.target.closest('.reel');
        if (en.isIntersecting) { if (!r.hasAttribute('data-held')) start(r); } else stop(r);
      });
    }, { threshold: 0.7 });
    reels.forEach(function(r){ io.observe(frameOf(r)); });
  }
  document.addEventListener('visibilitychange', function(){ if (document.hidden) reels.forEach(stop); });
})();
