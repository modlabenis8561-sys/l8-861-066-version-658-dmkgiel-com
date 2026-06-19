(function () {
  function showStatus(box, text) {
    if (!box) return;
    box.textContent = text;
    box.classList.add('is-visible');
    setTimeout(function () {
      box.classList.remove('is-visible');
    }, 2600);
  }

  function playVideo(video, status) {
    var started = video.play();
    if (started && typeof started.catch === 'function') {
      started.catch(function () {
        showStatus(status, '点击画面继续播放');
      });
    }
  }

  function prepare(video, url, status) {
    if (video.dataset.ready === '1') {
      playVideo(video, status);
      return;
    }
    video.dataset.ready = '1';
    video.controls = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      playVideo(video, status);
      return;
    }
    try {
      var Hls = window.Hls;
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        video._hls = hls;
        var events = Hls.Events || {};
        if (events.MEDIA_ATTACHED) {
          hls.on(events.MEDIA_ATTACHED, function () {
            hls.loadSource(url);
          });
        } else {
          hls.loadSource(url);
        }
        if (events.MANIFEST_PARSED) {
          hls.on(events.MANIFEST_PARSED, function () {
            playVideo(video, status);
          });
        } else {
          video.addEventListener('loadedmetadata', function () {
            playVideo(video, status);
          }, { once: true });
        }
        hls.attachMedia(video);
        setTimeout(function () {
          if (video.paused) playVideo(video, status);
        }, 900);
      } else {
        video.src = url;
        playVideo(video, status);
      }
    } catch (err) {
      video.src = url;
      playVideo(video, status);
    }
  }

  document.querySelectorAll('.js-player').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var status = player.querySelector('.player-status');
    if (!video) return;
    var url = video.getAttribute('data-m3u8');
    var start = function () {
      if (cover) cover.classList.add('is-hidden');
      prepare(video, url, status);
    };
    if (cover) cover.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.dataset.ready !== '1') {
        start();
      }
    });
  });
})();
