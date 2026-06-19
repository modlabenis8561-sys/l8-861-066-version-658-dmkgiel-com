document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  const prev = document.querySelector('[data-hero-prev]');
  const next = document.querySelector('[data-hero-next]');
  let current = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  function startTimer() {
    if (timer) {
      clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    showSlide(0);
    startTimer();
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        startTimer();
      });
    });
  }

  const list = document.querySelector('.filter-list');
  if (list) {
    const cards = Array.from(list.querySelectorAll('.movie-card'));
    const keyword = document.querySelector('[data-filter-keyword]');
    const type = document.querySelector('[data-filter-type]');
    const year = document.querySelector('[data-filter-year]');
    const category = document.querySelector('[data-filter-category]');
    const empty = document.querySelector('[data-empty-state]');

    function valueOf(control) {
      return control ? control.value.trim().toLowerCase() : '';
    }

    function filterCards() {
      const q = valueOf(keyword);
      const t = valueOf(type);
      const y = valueOf(year);
      const c = valueOf(category);
      let shown = 0;
      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.type,
          card.dataset.year,
          card.textContent
        ].join(' ').toLowerCase();
        const matchedKeyword = !q || haystack.indexOf(q) !== -1;
        const matchedType = !t || (card.dataset.type || '').toLowerCase() === t;
        const matchedYear = !y || (card.dataset.year || '').toLowerCase() === y;
        const matchedCategory = !c || (card.dataset.category || '').toLowerCase() === c;
        const visible = matchedKeyword && matchedType && matchedYear && matchedCategory;
        card.style.display = visible ? '' : 'none';
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', shown === 0);
      }
    }

    [keyword, type, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    const params = new URLSearchParams(window.location.search);
    if (keyword && params.get('q')) {
      keyword.value = params.get('q');
    }
    filterCards();
  }
});
