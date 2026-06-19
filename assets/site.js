(() => {
  const ready = (handler) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", handler);
    } else {
      handler();
    }
  };

  const normalize = (value) => (value || "").toString().trim().toLowerCase();

  ready(() => {
    const toggle = document.querySelector("[data-nav-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", () => {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        const input = form.querySelector("input[name='q']");
        if (input && !input.value.trim()) {
          event.preventDefault();
          window.location.href = "search.html";
        }
      });
    });

    setupHeroSlider();
    setupCardFilters();
    setupPlayers();
    setupSearchPage();
  });

  function setupHeroSlider() {
    const slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    const next = slider.querySelector("[data-hero-next]");
    const prev = slider.querySelector("[data-hero-prev]");
    let index = 0;
    let timer = null;

    const activate = (target) => {
      index = (target + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => activate(index + 1), 5200);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => {
        activate(dotIndex);
        start();
      });
    });

    if (next) {
      next.addEventListener("click", () => {
        activate(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", () => {
        activate(index - 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function setupCardFilters() {
    document.querySelectorAll("[data-card-search]").forEach((input) => {
      const scope = input.closest("section") || document;
      const cards = Array.from(scope.querySelectorAll("[data-card]"));

      input.addEventListener("input", () => {
        const query = normalize(input.value);
        cards.forEach((card) => {
          const haystack = normalize([
            card.dataset.title,
            card.dataset.tags,
            card.dataset.genre,
            card.dataset.year,
            card.dataset.region
          ].join(" "));
          card.classList.toggle("is-hidden", query && !haystack.includes(query));
        });
      });
    });
  }

  function setupPlayers() {
    document.querySelectorAll("[data-player]").forEach((player) => {
      const video = player.querySelector("video");
      const button = player.querySelector(".player-cover");
      const source = player.dataset.source;
      let initialized = false;
      let hlsInstance = null;

      if (!video || !button || !source) {
        return;
      }

      const attachSource = () => {
        if (initialized) {
          return;
        }
        initialized = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          return;
        }

        video.src = source;
      };

      const play = () => {
        attachSource();
        player.classList.add("is-playing");
        video.controls = true;
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(() => {
            player.classList.remove("is-playing");
          });
        }
      };

      button.addEventListener("click", play);
      video.addEventListener("click", () => {
        if (video.paused) {
          play();
        }
      });

      window.addEventListener("pagehide", () => {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  function setupSearchPage() {
    const results = document.querySelector("[data-search-results]");
    const input = document.querySelector("[data-search-input]");
    const status = document.querySelector("[data-search-status]");

    if (!results || !input || !Array.isArray(window.MOVIE_SEARCH_DATA)) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";
    input.value = initialQuery;

    const render = () => {
      const query = normalize(input.value);
      const source = window.MOVIE_SEARCH_DATA;
      const matches = source.filter((movie) => {
        if (!query) {
          return true;
        }
        return normalize([
          movie.title,
          movie.tags,
          movie.genre,
          movie.year,
          movie.region,
          movie.category
        ].join(" ")).includes(query);
      }).slice(0, query ? 240 : 120);

      results.innerHTML = matches.map((movie) => `
        <a class="movie-card" href="${escapeAttribute(movie.file)}" data-card>
          <span class="poster-frame">
            <img src="${escapeAttribute(movie.cover)}" alt="${escapeAttribute(movie.title)}" loading="lazy">
          </span>
          <span class="movie-card-body">
            <strong>${escapeHtml(movie.title)}</strong>
            <em>${escapeHtml(movie.year)} · ${escapeHtml(movie.region)} · ${escapeHtml(movie.type)}</em>
            <span class="movie-card-desc">${escapeHtml(movie.oneLine)}</span>
            <span class="tag-row">${tagHtml(movie.tags)}</span>
          </span>
        </a>
      `).join("");

      if (status) {
        status.textContent = query ? "以下影片与你的搜索匹配。" : "热门影片已为你准备好，也可以输入关键词继续筛选。";
      }
    };

    input.addEventListener("input", render);
    render();
  }

  function tagHtml(tags) {
    return (tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  }

  function escapeHtml(value) {
    return (value || "").toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }
})();
