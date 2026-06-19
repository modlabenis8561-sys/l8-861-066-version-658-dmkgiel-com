(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-menu-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length === 0) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('[data-play-button]');
      var source = player.getAttribute('data-src');
      var hlsInstance = null;
      var started = false;

      function play() {
        if (!video || !source) {
          return;
        }
        player.classList.add('is-playing');
        if (!started) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
          } else {
            video.src = source;
          }
          started = true;
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            if (overlay) {
              player.classList.remove('is-playing');
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!started || video.paused) {
            play();
          }
        });
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
          hlsInstance.destroy();
        }
      });
    });
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function buildCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '  <a class="movie-cover-link" href="video/' + item.id + '.html" aria-label="观看 ' + escapeHtml(item.title) + '">',
      '    <img class="movie-cover" src="./' + item.cover + '.jpg" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="movie-badge">' + escapeHtml(item.type || '影视') + '</span>',
      '    <span class="movie-play">▶</span>',
      '  </a>',
      '  <div class="movie-body">',
      '    <h2 class="movie-title"><a href="video/' + item.id + '.html">' + escapeHtml(item.title) + '</a></h2>',
      '    <div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
      '    <p>' + escapeHtml(item.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearch() {
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');
    if (!input || !results || !window.SEARCH_DATA) {
      return;
    }

    function render(keyword) {
      var query = keyword.trim().toLowerCase();
      var list = window.SEARCH_DATA;
      if (query) {
        list = list.filter(function (item) {
          var text = [
            item.title,
            item.region,
            item.type,
            item.year,
            item.genre,
            item.oneLine,
            (item.tags || []).join(' ')
          ].join(' ').toLowerCase();
          return text.indexOf(query) !== -1;
        });
      }
      var limited = list.slice(0, 60);
      results.innerHTML = limited.map(buildCard).join('');
      if (status) {
        status.textContent = query ? '已显示相关影片' : '输入关键词可快速筛选影片';
      }
    }

    var initial = getQuery();
    if (initial) {
      input.value = initial;
    }
    input.addEventListener('input', function () {
      render(input.value);
    });
    render(input.value);
  }

  ready(function () {
    initMenu();
    initHero();
    initPlayers();
    initSearch();
  });
})();
