function initMoviePlayer(streamUrl) {
  var video = document.getElementById('movie-player');
  var button = document.querySelector('[data-play-button]');
  var hlsInstance = null;
  var ready = false;

  function startVideo() {
    if (!video || !streamUrl) {
      return;
    }

    if (!ready) {
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.play().catch(function () {});
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = streamUrl;
        video.play().catch(function () {});
      }
    } else if (video.paused) {
      video.play().catch(function () {});
    }

    if (button) {
      button.classList.add('is-hidden');
    }
  }

  if (button) {
    button.addEventListener('click', startVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
