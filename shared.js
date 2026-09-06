// Rail builder
!function(){
  var r=document.getElementById('railTrack');
  if(!r)return;
  var f=document.createDocumentFragment();
  for(var i=0;i<60;i++){var s=document.createElement('span');f.appendChild(s)}
  r.appendChild(f);
}();

// Ticker builder
!function(){
  var t=document.getElementById('tickerTrack');
  if(!t)return;
  var items=['Brand Films','Video Ads','Social Media Content','Documentaries','Campaign Strategy','Institutional Videos','Creative Campaigns','Kochi, Kerala'];
  var f=document.createDocumentFragment();
  items.concat(items,items).forEach(function(tx){
    var s=document.createElement('span');s.className='t-item';s.textContent=tx;f.appendChild(s);
  });
  t.appendChild(f);
}();

// Mobile menu
!function(){
  var btn=document.getElementById('menuBtn');
  var menu=document.getElementById('mobMenu');
  var nav=document.getElementById('mainNav');
  if(!btn||!menu)return;
  function openMenu(){
    menu.style.paddingTop=(nav.offsetHeight+24)+'px';
    menu.classList.add('open');btn.classList.add('open');
    btn.setAttribute('aria-expanded','true');
    document.body.style.overflow='hidden';
  }
  function closeMenu(){
    menu.classList.remove('open');btn.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
    document.body.style.overflow='';
  }
  btn.addEventListener('click',function(){menu.classList.contains('open')?closeMenu():openMenu()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu()});
  menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',closeMenu)});
}();

// Scroll reveal
!function(){
  var els=document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){els.forEach(function(el){el.classList.add('visible')});return}
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}});
  },{threshold:.07,rootMargin:'0px 0px -32px 0px'});
  els.forEach(function(el){io.observe(el)});
}();

// Filmstrip drag + navigate to services
!function(){
  var strip=document.getElementById('filmstrip');
  if(!strip)return;
  var down=false,startX,sl,moved=false;
  strip.addEventListener('mousedown',function(e){
    down=true;moved=false;
    startX=e.pageX-strip.getBoundingClientRect().left;
    sl=strip.scrollLeft;strip.style.userSelect='none';
  });
  window.addEventListener('mouseup',function(){down=false;strip.style.userSelect='';});
  strip.addEventListener('mousemove',function(e){
    if(!down)return;e.preventDefault();
    if(Math.abs(e.pageX-strip.getBoundingClientRect().left-startX)>5)moved=true;
    strip.scrollLeft=sl-(e.pageX-strip.getBoundingClientRect().left-startX)*1.4;
  });
  strip.addEventListener('click',function(e){
    if(moved){moved=false;return;}
    if(e.target.closest('.work-card'))window.location.href='services.html';
  });
  strip.addEventListener('touchstart',function(){moved=false;},{passive:true});
  strip.addEventListener('touchmove',function(){moved=true;},{passive:true});
  strip.addEventListener('touchend',function(e){
    if(moved)return;
    if(e.target.closest('.work-card'))window.location.href='services.html';
  });
}();
