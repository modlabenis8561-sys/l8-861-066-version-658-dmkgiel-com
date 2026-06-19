(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var localInput = document.querySelector('[data-local-filter]');
  var localYear = document.querySelector('[data-filter-year]');
  var localRegion = document.querySelector('[data-filter-region]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyLocalFilter() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(localInput && localInput.value);
    var year = normalize(localYear && localYear.value);
    var region = normalize(localRegion && localRegion.value);

    cards.forEach(function (card) {
      var text = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.type
      ].join(' '));
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchYear = !year || normalize(card.dataset.year) === year;
      var matchRegion = !region || normalize(card.dataset.region) === region;
      card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchRegion));
    });
  }

  [localInput, localYear, localRegion].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyLocalFilter);
      control.addEventListener('change', applyLocalFilter);
    }
  });

  function getParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  var searchPage = document.querySelector('[data-search-page]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchYear = document.querySelector('[data-search-year]');
  var searchRegion = document.querySelector('[data-search-region]');
  var searchGenre = document.querySelector('[data-search-genre]');
  var searchResults = document.querySelector('[data-search-results]');

  function resultCard(movie) {
    return [
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '">',
      '<a href="' + escapeHtml(movie.url) + '" class="movie-link" aria-label="观看' + escapeHtml(movie.title) + '">',
      '<div class="poster-wrap">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="play-badge">▶</span>',
      '<span class="rating-badge">' + escapeHtml(movie.rating) + '分</span>',
      '</div>',
      '<div class="movie-card-body">',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p class="movie-card-desc">' + escapeHtml(movie.description) + '</p>',
      '<div class="movie-meta-line">',
      '<span>' + escapeHtml(movie.genre) + '</span>',
      '<span>' + escapeHtml(movie.year) + '</span>',
      '<span>' + escapeHtml(movie.region) + '</span>',
      '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function applySearch() {
    if (!searchPage || !searchResults || !Array.isArray(window.SEARCH_MOVIES)) {
      return;
    }

    var keyword = normalize(searchInput && searchInput.value);
    var year = normalize(searchYear && searchYear.value);
    var region = normalize(searchRegion && searchRegion.value);
    var genre = normalize(searchGenre && searchGenre.value);

    var results = window.SEARCH_MOVIES.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.year,
        movie.genre,
        movie.type,
        movie.tags,
        movie.description
      ].join(' '));
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchYear = !year || normalize(movie.year) === year;
      var matchRegion = !region || normalize(movie.region) === region;
      var matchGenre = !genre || normalize(movie.genre) === genre;
      return matchKeyword && matchYear && matchRegion && matchGenre;
    }).slice(0, 240);

    searchResults.innerHTML = results.map(resultCard).join('');
  }

  if (searchPage && searchInput) {
    searchInput.value = getParam('q');
    [searchInput, searchYear, searchRegion, searchGenre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applySearch);
        control.addEventListener('change', applySearch);
      }
    });
    applySearch();
  }
}());
