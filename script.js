(function(){
  'use strict';

  /* ---------------- Sticky header background on scroll ---------------- */
  var header = document.getElementById('siteHeader');
  function onScroll(){
    if(window.scrollY > 40){ header.classList.add('scrolled'); }
    else{ header.classList.remove('scrolled'); }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });

  /* ---------------- Mobile menu (isolated, structurally correct) ---------------- */
  var menuBtn = document.getElementById('menuBtn');
  var mobilePanel = document.getElementById('mobilePanel');
  var mobileBackdrop = document.getElementById('mobileBackdrop');
  var mobileClose = document.getElementById('mobileClose');
  var mobileLinks = mobilePanel ? mobilePanel.querySelectorAll('a') : [];

  function openMenu(){
    mobilePanel.classList.add('open');
    mobileBackdrop.classList.add('open');
    menuBtn.setAttribute('aria-expanded','true');
    document.body.classList.add('menu-open');
    var firstLink = mobilePanel.querySelector('a');
    if(firstLink) firstLink.focus({preventScroll:true});
  }
  function closeMenu(){
    mobilePanel.classList.remove('open');
    mobileBackdrop.classList.remove('open');
    menuBtn.setAttribute('aria-expanded','false');
    document.body.classList.remove('menu-open');
    menuBtn.focus({preventScroll:true});
  }
  function toggleMenu(){
    var isOpen = mobilePanel.classList.contains('open');
    if(isOpen){ closeMenu(); } else { openMenu(); }
  }

  if(menuBtn){
    menuBtn.addEventListener('click', toggleMenu);
  }
  if(mobileClose){ mobileClose.addEventListener('click', closeMenu); }
  if(mobileBackdrop){ mobileBackdrop.addEventListener('click', closeMenu); }
  mobileLinks.forEach(function(a){ a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && mobilePanel.classList.contains('open')){ closeMenu(); }
  });

  // If viewport is resized up to desktop while menu open, close it (prevents any odd overlap state)
  var mq = window.matchMedia('(min-width:1024px)');
  function handleMQ(e){ if(e.matches){ closeMenu(); } }
  if(mq.addEventListener) mq.addEventListener('change', handleMQ);
  else if(mq.addListener) mq.addListener(handleMQ);

  /* ---------------- Reveal on scroll ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.12, rootMargin:'0px 0px -60px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---------------- Service tabs ---------------- */
  var tabs = document.querySelectorAll('.service-tab');
  var panels = document.querySelectorAll('.service-panel');
  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      var target = tab.getAttribute('data-tab');
      tabs.forEach(function(t){ t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected','true');
      panels.forEach(function(p){
        p.classList.toggle('active', p.getAttribute('data-panel') === target);
      });
    });
  });

  /* ---------------- Gallery filter ---------------- */
  var filters = document.querySelectorAll('.gallery-filter');
  var galleryItems = document.querySelectorAll('.gallery-item');
  filters.forEach(function(btn){
    btn.addEventListener('click', function(){
      var cat = btn.getAttribute('data-filter');
      filters.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      galleryItems.forEach(function(item){
        var itemCat = item.getAttribute('data-cat');
        var show = (cat === 'all' || itemCat === cat);
        item.classList.toggle('hide', !show);
      });
    });
  });

  /* ---------------- Lightbox ---------------- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var lbTriggers = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  var currentIndex = 0;

  function getVisibleTriggers(){
    // Only cycle through currently visible (non-hidden) items for gallery context
    return lbTriggers.filter(function(el){ return !el.closest('.gallery-item.hide'); });
  }

  function openLightbox(el){
    var list = getVisibleTriggers();
    currentIndex = list.indexOf(el);
    if(currentIndex === -1){ currentIndex = 0; list = [el]; }
    showImage(list);
  }
  function showImage(list){
    var el = list[currentIndex];
    var src = el.getAttribute('data-full') || el.querySelector('img').src;
    var cap = el.getAttribute('data-caption') || '';
    lbImg.src = src;
    lbImg.alt = cap;
    lbCap.textContent = cap;
    lightbox.classList.add('open');
    document.body.classList.add('menu-open');
    lightbox.setAttribute('aria-hidden','false');
    lightbox.dataset.list = JSON.stringify(list.map(function(e){return list.indexOf(e);}));
    lightbox._list = list;
    lbClose.focus();
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    document.body.classList.remove('menu-open');
    lightbox.setAttribute('aria-hidden','true');
  }
  function navigate(dir){
    var list = lightbox._list || getVisibleTriggers();
    currentIndex = (currentIndex + dir + list.length) % list.length;
    showImage(list);
  }

  lbTriggers.forEach(function(el){
    el.addEventListener('click', function(){ openLightbox(el); });
    el.setAttribute('tabindex','0');
    el.setAttribute('role','button');
    el.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openLightbox(el); }
    });
  });
  if(lbClose) lbClose.addEventListener('click', closeLightbox);
  if(lbPrev) lbPrev.addEventListener('click', function(){ navigate(-1); });
  if(lbNext) lbNext.addEventListener('click', function(){ navigate(1); });
  if(lightbox){
    lightbox.addEventListener('click', function(e){ if(e.target === lightbox){ closeLightbox(); } });
  }
  document.addEventListener('keydown', function(e){
    if(!lightbox.classList.contains('open')) return;
    if(e.key === 'Escape') closeLightbox();
    if(e.key === 'ArrowRight') navigate(1);
    if(e.key === 'ArrowLeft') navigate(-1);
  });

  // basic touch swipe support
  var touchStartX = 0;
  if(lightbox){
    lightbox.addEventListener('touchstart', function(e){ touchStartX = e.changedTouches[0].screenX; }, {passive:true});
    lightbox.addEventListener('touchend', function(e){
      var diff = e.changedTouches[0].screenX - touchStartX;
      if(Math.abs(diff) > 50){ navigate(diff > 0 ? -1 : 1); }
    }, {passive:true});
  }

  /* ---------------- Smooth anchor scroll fallback (older browsers) ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href');
      if(id.length > 1){
        var target = document.querySelector(id);
        if(target){
          e.preventDefault();
          var top = target.getBoundingClientRect().top + window.pageYOffset;
          var headerH = window.innerWidth >= 1024 ? 84 : 64;
          window.scrollTo({ top: top - headerH - 16, behavior:'smooth' });
        }
      }
    });
  });

  /* ---------------- Current year ---------------- */
  var yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

})();
