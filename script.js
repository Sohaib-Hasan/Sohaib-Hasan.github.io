// Shared site script — footer year, mobile nav, scroll-in animation, stat counters

// Footer year
(function(){
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

// Mobile nav toggle
(function(){
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  var backdrop = document.getElementById('navBackdrop');
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
  links.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', closeMenu);
  });
  window.addEventListener('resize', function(){
    if (window.innerWidth >= 720) closeMenu();
  });
})();

// Scroll-in animation
(function(){
  var targets = document.querySelectorAll('.block, .page-header');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(function(el){ el.classList.add('in-view'); });
    return;
  }

  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(function(el){
    el.classList.add('will-animate');
    observer.observe(el);
  });
})();

// Animated stat counters — targets elements with [data-count], counts up when scrolled into view
(function(){
  var counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  function animateCount(el){
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var duration = 1300;
    var start = null;

    function step(timestamp){
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      el.textContent = (Number.isInteger(target) ? Math.round(value) : value.toFixed(1)).toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString();
      }
    }
    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCount);
    return;
  }

  var cObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting) {
        animateCount(entry.target);
        cObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function(el){ cObserver.observe(el); });
})();
