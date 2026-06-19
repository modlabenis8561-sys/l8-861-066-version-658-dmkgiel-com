(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMenu() {
        var button = $('[data-menu-button]');
        var menu = $('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var stage = $('[data-hero-stage]');
        if (!stage) {
            return;
        }
        var slides = $all('[data-hero-slide]', stage);
        var dots = $all('[data-hero-dot]', stage);
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        setInterval(function () {
            show(index + 1);
        }, 5800);
    }

    function setupScrollRows() {
        $all('[data-scroll-wrap]').forEach(function (wrap) {
            var row = $('[data-scroll-row]', wrap);
            if (!row) {
                return;
            }
            $all('[data-scroll]', wrap).forEach(function (button) {
                button.addEventListener('click', function () {
                    var dir = button.getAttribute('data-scroll') === 'left' ? -1 : 1;
                    row.scrollBy({ left: dir * 420, behavior: 'smooth' });
                });
            });
        });
    }

    function setupFilters() {
        $all('[data-filter-root]').forEach(function (root) {
            var search = $('[data-filter-search]', root);
            var type = $('[data-filter-type]', root);
            var region = $('[data-filter-region]', root);
            var year = $('[data-filter-year]', root);
            var cards = $all('[data-card]', root);
            var empty = $('[data-empty-state]', root);
            function apply() {
                var q = normalize(search && search.value);
                var t = normalize(type && type.value);
                var r = normalize(region && region.value);
                var y = normalize(year && year.value);
                var shown = 0;
                cards.forEach(function (card) {
                    var hay = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-genre'));
                    var ok = true;
                    if (q && hay.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (t && normalize(card.getAttribute('data-type')) !== t) {
                        ok = false;
                    }
                    if (r && normalize(card.getAttribute('data-region')) !== r) {
                        ok = false;
                    }
                    if (y && normalize(card.getAttribute('data-year')) !== y) {
                        ok = false;
                    }
                    card.style.display = ok ? '' : 'none';
                    if (ok) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', shown === 0);
                }
            }
            [search, type, region, year].forEach(function (input) {
                if (input) {
                    input.addEventListener('input', apply);
                    input.addEventListener('change', apply);
                }
            });
        });
    }

    window.initMoviePlayer = function (id, url) {
        var video = document.getElementById(id);
        var layer = document.querySelector('[data-play-for="' + id + '"]');
        var loaded = false;
        if (!video) {
            return;
        }
        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new Hls({ enableWorker: true });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }
        function start() {
            load();
            if (layer) {
                layer.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }
        if (layer) {
            layer.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            if (layer) {
                layer.classList.add('is-hidden');
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupScrollRows();
        setupFilters();
    });
})();
