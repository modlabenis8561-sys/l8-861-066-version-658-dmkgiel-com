(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
        button.setAttribute("aria-expanded", "true");
        button.textContent = "×";
      } else {
        panel.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
        button.textContent = "☰";
      }
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initFilters() {
    var grid = document.querySelector("[data-movie-grid]");
    if (!grid) {
      return;
    }
    var input = document.querySelector("[data-filter-input]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
    var activeChip = "";
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input && query) {
      input.value = query;
    }
    function cardText(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-tags")
      ].join(" "));
    }
    function apply() {
      var text = normalize(input ? input.value : "");
      var chip = normalize(activeChip);
      cards.forEach(function (card) {
        var source = cardText(card);
        var okText = !text || source.indexOf(text) !== -1;
        var okChip = !chip || source.indexOf(chip) !== -1;
        card.hidden = !(okText && okChip);
      });
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeChip = chip.getAttribute("data-filter-chip") || "";
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        apply();
      });
    });
    apply();
  }

  function initPlayer() {
    var video = document.querySelector(".js-video-player");
    if (!video) {
      return;
    }
    var cover = document.querySelector(".player-cover");
    var url = video.getAttribute("data-video-url");
    var hls = null;
    function attach() {
      if (!url || video.getAttribute("data-ready") === "1") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.setAttribute("data-ready", "1");
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        video.setAttribute("data-ready", "1");
        return;
      }
      video.src = url;
      video.setAttribute("data-ready", "1");
    }
    function play() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }
    if (cover) {
      cover.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
    video.addEventListener("ended", function () {
      if (hls) {
        hls.stopLoad();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
