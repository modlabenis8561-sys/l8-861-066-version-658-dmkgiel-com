(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  ready(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuToggle && mobilePanel) {
      menuToggle.addEventListener('click', function () {
        mobilePanel.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        if (!query) {
          event.preventDefault();
          window.location.href = './search.html';
          return;
        }
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(query);
      });
    });

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function activate(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
          slide.classList.toggle('is-active', current === index);
        });
        dots.forEach(function (dot, current) {
          dot.classList.toggle('is-active', current === index);
        });
      }

      function start() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          activate(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          activate(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          activate(index + 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          activate(Number(dot.getAttribute('data-hero-dot')) || 0);
          start();
        });
      });

      activate(0);
      start();
    });

    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        var poster = image.closest('.poster');
        if (poster) {
          poster.classList.add('image-missing');
        }
        image.removeAttribute('src');
      });
    });

    document.querySelectorAll('[data-filter-page]').forEach(function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var section = panel.closest('.content-section') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
      var empty = section.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q') || '';

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function applyFilter() {
        var query = normalize(input ? input.value : '');
        var selectedType = normalize(type ? type.value : '');
        var selectedYear = normalize(year ? year.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matched = true;

          if (query && text.indexOf(query) === -1) {
            matched = false;
          }

          if (selectedType && cardType !== selectedType) {
            matched = false;
          }

          if (selectedYear && cardYear !== selectedYear) {
            matched = false;
          }

          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });

      applyFilter();
    });

    document.querySelectorAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.player-cover');
      var message = shell.querySelector('[data-player-message]');
      var player = null;

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function playVideo() {
        if (!video) {
          return;
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setMessage('点击视频控件继续播放');
          });
        }
      }

      function recoverPlayer(errorData) {
        if (!player || !window.Hls || !errorData || !errorData.fatal) {
          return;
        }
        if (errorData.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          player.startLoad();
        } else if (errorData.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          player.recoverMediaError();
        } else {
          player.destroy();
          player = null;
          setMessage('播放加载失败，请稍后重试');
        }
      }

      function startPlayer() {
        var url = shell.getAttribute('data-video-url');
        if (!video || !url) {
          setMessage('播放加载失败，请稍后重试');
          return;
        }

        shell.classList.add('is-playing');
        setMessage('正在加载');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          video.addEventListener('loadedmetadata', function () {
            setMessage('');
            playVideo();
          }, { once: true });
          video.load();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (player) {
            player.destroy();
          }
          player = new window.Hls({ enableWorker: true });
          player.loadSource(url);
          player.attachMedia(video);
          player.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setMessage('');
            playVideo();
          });
          player.on(window.Hls.Events.ERROR, function (eventName, errorData) {
            recoverPlayer(errorData);
          });
          return;
        }

        video.src = url;
        video.addEventListener('loadedmetadata', function () {
          setMessage('');
          playVideo();
        }, { once: true });
        video.load();
      }

      if (button) {
        button.addEventListener('click', startPlayer);
      }
    });
  });
}());
