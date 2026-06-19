(function () {
  var menuButton = document.querySelector('.menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var heroIndex = 0;
  var heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === heroIndex);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === heroIndex);
    });
  }

  function startHero() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }

    if (slides.length > 1) {
      heroTimer = window.setInterval(function () {
        showHero(heroIndex + 1);
      }, 5200);
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
      startHero();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showHero(heroIndex - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showHero(heroIndex + 1);
      startHero();
    });
  }

  startHero();

  var rail = document.querySelector('[data-rail]');
  var railLeft = document.querySelector('[data-rail-left]');
  var railRight = document.querySelector('[data-rail-right]');

  function moveRail(direction) {
    if (!rail) {
      return;
    }

    rail.scrollBy({
      left: direction * Math.min(720, rail.clientWidth),
      behavior: 'smooth'
    });
  }

  if (railLeft) {
    railLeft.addEventListener('click', function () {
      moveRail(-1);
    });
  }

  if (railRight) {
    railRight.addEventListener('click', function () {
      moveRail(1);
    });
  }

  var searchInput = document.querySelector('#movieSearch') || document.querySelector('#categorySearch');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-library-grid] .movie-card'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var activeFilter = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-tags')
    ].join(' '));
  }

  function applyFilters() {
    var keyword = normalize(searchInput ? searchInput.value : '');

    cards.forEach(function (card) {
      var text = cardText(card);
      var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchesFilter = activeFilter === 'all' || text.indexOf(normalize(activeFilter)) !== -1;
      card.classList.toggle('is-filtered-out', !(matchesKeyword && matchesFilter));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter') || 'all';

      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });

      applyFilters();
    });
  });

  var player = document.querySelector('.video-player');
  var playLayer = document.querySelector('.play-layer');
  var attached = false;

  function attachStream() {
    if (!player || attached) {
      return;
    }

    var stream = player.getAttribute('data-stream');

    if (!stream) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(stream);
      hls.attachMedia(player);
      player._hlsInstance = hls;
      attached = true;
    } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
      player.src = stream;
      attached = true;
    }
  }

  function requestPlay() {
    attachStream();

    if (!player) {
      return;
    }

    var promise = player.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (playLayer && player) {
    playLayer.addEventListener('click', requestPlay);

    player.addEventListener('play', function () {
      playLayer.classList.add('is-hidden');
    });

    player.addEventListener('pause', function () {
      if (!player.ended) {
        playLayer.classList.remove('is-hidden');
      }
    });

    player.addEventListener('ended', function () {
      playLayer.classList.remove('is-hidden');
    });
  }
})();
