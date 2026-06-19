(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var menu = document.querySelector('.mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('.js-hero');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-rail-target]').forEach(function (button) {
    button.addEventListener('click', function () {
      var rail = document.querySelector(button.getAttribute('data-rail-target'));
      if (!rail) {
        return;
      }
      var direction = button.getAttribute('data-rail-direction') === 'left' ? -1 : 1;
      rail.scrollBy({ left: direction * 420, behavior: 'smooth' });
    });
  });

  var filterPanel = document.querySelector('.filter-panel');
  if (filterPanel) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var input = filterPanel.querySelector('.js-filter-input');
    var region = filterPanel.querySelector('.js-region-filter');
    var type = filterPanel.querySelector('.js-type-filter');
    var year = filterPanel.querySelector('.js-year-filter');
    var empty = document.querySelector('.no-results');
    var params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) {
      input.value = params.get('q');
    }
    var apply = function () {
      var q = input ? input.value.trim().toLowerCase() : '';
      var r = region ? region.value : '';
      var t = type ? type.value : '';
      var y = year ? year.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.tags].join(' ').toLowerCase();
        var ok = true;
        if (q && haystack.indexOf(q) === -1) ok = false;
        if (r && card.dataset.region !== r) ok = false;
        if (t && card.dataset.type !== t) ok = false;
        if (y && card.dataset.year !== y) ok = false;
        card.classList.toggle('hidden-card', !ok);
        if (ok) visible += 1;
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };
    [input, region, type, year].forEach(function (el) {
      if (!el) return;
      el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', apply);
    });
    apply();
  }
})();
