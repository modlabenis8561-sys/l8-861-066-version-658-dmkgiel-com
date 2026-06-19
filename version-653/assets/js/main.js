(function () {
    function initMobileNav() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initSearch() {
        var input = document.querySelector('[data-search-input]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));
        if (!input && buttons.length === 0) {
            return;
        }
        var active = '全部';

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var byKeyword = !keyword || text.indexOf(keyword) !== -1;
                var byFilter = active === '全部' || text.indexOf(active.toLowerCase()) !== -1;
                card.classList.toggle('hidden', !(byKeyword && byFilter));
            });
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                active = button.getAttribute('data-filter-button') || '全部';
                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });
    }

    function initPlayer() {
        var video = document.querySelector('[data-player-video]');
        var button = document.querySelector('[data-player-start]');
        if (!video || !button) {
            return;
        }
        var url = button.getAttribute('data-video-url');
        var hls = null;
        var ready = false;

        function revealButton() {
            button.classList.remove('is-hidden');
        }

        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(revealButton);
            }
        }

        function start() {
            if (!url) {
                return;
            }
            button.classList.add('is-hidden');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (video.getAttribute('src') !== url) {
                    video.setAttribute('src', url);
                }
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!hls) {
                    hls = new window.Hls({ maxBufferLength: 30 });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        ready = true;
                        playVideo();
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            revealButton();
                        }
                    });
                } else if (ready) {
                    playVideo();
                }
                return;
            }
            if (video.getAttribute('src') !== url) {
                video.setAttribute('src', url);
            }
            playVideo();
        }

        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initHero();
        initSearch();
        initPlayer();
    });
}());
