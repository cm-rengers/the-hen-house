(function () {
  var prefersReducedMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  var BOOKING_BASE_URLS = {
    airbnb: "https://www.airbnb.co.uk/rooms/1477403609287112139",
    booking:
      "https://www.booking.com/hotel/gb/the-hen-house-westmorland-and-furness.en-gb.html",
  };

  var BOOKING_UTM_STRING =
    "utm_source=henhouse_site&utm_medium=referral&utm_campaign=direct_booking";

  function withRafThrottle(fn) {
    var ticking = false;
    var lastArgs;

    return function () {
      lastArgs = arguments;
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(function () {
        fn.apply(null, lastArgs);
        ticking = false;
      });
    };
  }

  function buildTrackedUrl(baseUrl) {
    if (!baseUrl) return "";
    var separator = baseUrl.indexOf("?") === -1 ? "?" : "&";
    return baseUrl + separator + BOOKING_UTM_STRING;
  }

  function initSmoothScroll(root) {
    root = root || document;
    var links = root.querySelectorAll('a[href^="#"], [data-scroll-target]');

    function getTargetId(el) {
      if (el.hasAttribute("data-scroll-target")) {
        return el.getAttribute("data-scroll-target");
      }
      return el.getAttribute("href");
    }

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        var targetId = getTargetId(link);
        if (!targetId || targetId.charAt(0) !== "#") return;

        var target = document.querySelector(targetId);
        if (!target) return;

        event.preventDefault();

        var offset = document.querySelector(".site-header");
        var headerHeight = offset ? offset.offsetHeight : 0;
        var rect = target.getBoundingClientRect();
        var targetY = rect.top + window.scrollY - headerHeight - 16;

        window.scrollTo({
          top: targetY,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      });
    });
  }

  function initStickyHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    var handleScroll = withRafThrottle(function () {
      if (window.scrollY > 40) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  }

  function initMobileNav() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    var toggle = header.querySelector("[data-nav-toggle]");
    var backdrop = document.querySelector("[data-mobile-backdrop]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !backdrop || !panel) return;

    function openNav() {
      toggle.classList.add("is-active");
      backdrop.classList.add("is-visible");
      panel.classList.add("is-visible");
      document.body.classList.add("is-locked");
    }

    function closeNav() {
      toggle.classList.remove("is-active");
      backdrop.classList.remove("is-visible");
      panel.classList.remove("is-visible");
      document.body.classList.remove("is-locked");
    }

    toggle.addEventListener("click", function () {
      var isActive = toggle.classList.contains("is-active");
      if (isActive) {
        closeNav();
      } else {
        openNav();
      }
    });

    backdrop.addEventListener("click", closeNav);

    panel.addEventListener("click", function (event) {
      if (event.target.matches("a[href^='#']")) {
        closeNav();
      }
    });
  }

  function initHeaderBookingDropdown() {
    var wrapper = document.querySelector("[data-header-booking]");
    if (!wrapper) return;

    var toggle = wrapper.querySelector("[data-header-booking-toggle]");
    var menu = wrapper.querySelector("[data-header-booking-menu]");

    if (!toggle || !menu) return;

    function close() {
      wrapper.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    function open() {
      wrapper.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }

    toggle.addEventListener("click", function (event) {
      event.stopPropagation();
      var isOpen = wrapper.classList.contains("is-open");
      if (isOpen) {
        close();
      } else {
        open();
      }
    });

    menu.addEventListener("click", function (event) {
      if (event.target.matches("a[href]")) {
        close();
      }
    });

    document.addEventListener("click", function (event) {
      if (!wrapper.contains(event.target)) {
        close();
      }
    });
  }

  function initMobileBookBar() {
    var bar = document.querySelector("[data-mobile-book-bar]");
    if (!bar) return;

    var toggle = bar.querySelector("[data-mobile-book-bar-toggle]");
    if (!toggle) return;

    toggle.addEventListener("click", function () {
      var isOpen = bar.classList.contains("is-open");
      if (isOpen) {
        bar.classList.remove("is-open");
      } else {
        bar.classList.add("is-open");
      }
    });
  }

  function initHeroCardSlider() {
    var card = document.querySelector("[data-hero-card]");
    if (!card) return;
    var slides = card.querySelectorAll(".hero-card-slide");
    var prevBtn = card.querySelector("[data-hero-prev]");
    var nextBtn = card.querySelector("[data-hero-next]");
    var counterEl = card.querySelector("[data-hero-counter]");
    if (!slides.length || !prevBtn || !nextBtn || !counterEl) return;

    var total = slides.length;
    var current = 0;
    var autoplayMs = 5000;
    var autoplayTimer = null;

    function goTo(index) {
      if (index < 0) index = total - 1;
      if (index >= total) index = 0;
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      if (counterEl) counterEl.textContent = (current + 1) + " / " + total;
    }

    function startAutoplay() {
      if (prefersReducedMotion) return;
      stopAutoplay();
      autoplayTimer = setInterval(function () {
        goTo(current + 1);
      }, autoplayMs);
    }
    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    prevBtn.addEventListener("click", function () {
      stopAutoplay();
      goTo(current - 1);
      startAutoplay();
    });
    nextBtn.addEventListener("click", function () {
      stopAutoplay();
      goTo(current + 1);
      startAutoplay();
    });

    var touchStartX = 0;
    var touchEndX = 0;
    card.addEventListener(
      "touchstart",
      function (e) {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );
    card.addEventListener(
      "touchend",
      function (e) {
        touchEndX = e.changedTouches[0].screenX;
        var diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          stopAutoplay();
          goTo(diff > 0 ? current + 1 : current - 1);
          startAutoplay();
        }
      },
      { passive: true }
    );

    startAutoplay();
  }

  function initGalleryLightbox() {
    var gallery = document.querySelector(".gallery-grid");
    if (!gallery) return;

    var items = Array.prototype.slice.call(
      gallery.querySelectorAll(".gallery-item img")
    );
    if (!items.length) return;

    var backdrop = document.querySelector("[data-lightbox-backdrop]");
    var imageEl = backdrop && backdrop.querySelector("[data-lightbox-image]");
    var metaEl = backdrop && backdrop.querySelector("[data-lightbox-meta]");
    var counterEl = backdrop && backdrop.querySelector("[data-lightbox-counter]");
    var closeBtn = backdrop && backdrop.querySelector("[data-lightbox-close]");
    var prevBtn = backdrop && backdrop.querySelector("[data-lightbox-prev]");
    var nextBtn = backdrop && backdrop.querySelector("[data-lightbox-next]");

    if (!backdrop || !imageEl || !metaEl || !counterEl || !closeBtn || !prevBtn || !nextBtn) {
      return;
    }

    var currentIndex = 0;

    function openAt(index) {
      if (index < 0 || index >= items.length) return;
      currentIndex = index;

      var img = items[index];
      var src = img.getAttribute("src");
      var alt = img.getAttribute("alt") || "";

      imageEl.setAttribute("src", src);
      imageEl.setAttribute("alt", alt);
      metaEl.textContent = alt;
      counterEl.textContent = (index + 1) + " / " + items.length;

      backdrop.classList.add("is-visible");
      document.body.classList.add("is-locked");

      if (window.gsap) {
        gsap.fromTo(
          imageEl,
          { autoAlpha: 0, scale: 0.96, y: 20 },
          { duration: 0.5, autoAlpha: 1, scale: 1, y: 0, ease: "power3.out" }
        );
      }
    }

    function close() {
      backdrop.classList.remove("is-visible");
      document.body.classList.remove("is-locked");
    }

    function showNext() {
      var nextIndex = (currentIndex + 1) % items.length;
      openAt(nextIndex);
    }

    function showPrev() {
      var prevIndex = (currentIndex - 1 + items.length) % items.length;
      openAt(prevIndex);
    }

    items.forEach(function (img, index) {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", function () {
        openAt(index);
      });
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      showPrev();
    });
    nextBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      showNext();
    });

    backdrop.addEventListener("click", function (event) {
      if (event.target === backdrop) {
        close();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (!backdrop.classList.contains("is-visible")) return;

      if (event.key === "Escape") {
        close();
      } else if (event.key === "ArrowRight") {
        showNext();
      } else if (event.key === "ArrowLeft") {
        showPrev();
      }
    });
  }

  function initBookingLinks() {
    var links = document.querySelectorAll("[data-booking-link][data-booking-provider]");
    if (!links.length) return;

    links.forEach(function (link) {
      var provider = link.getAttribute("data-booking-provider");
      var baseUrl = BOOKING_BASE_URLS[provider];
      if (!baseUrl) return;

      var tracked = buildTrackedUrl(baseUrl);
      link.setAttribute("href", tracked);
    });
  }

  function initFaqAccordion() {
    var items = document.querySelectorAll("[data-faq-item]");
    if (!items.length) return;

    items.forEach(function (item) {
      var btn = item.querySelector("[data-faq-toggle]");
      var panel = item.querySelector(".faq-answer");
      if (!btn || !panel) return;

      btn.addEventListener("click", function () {
        var isOpen = btn.getAttribute("aria-expanded") === "true";
        var allOpen = document.querySelectorAll(".faq-item.is-open");
        allOpen.forEach(function (openItem) {
          var oBtn = openItem.querySelector("[data-faq-toggle]");
          var oPanel = openItem.querySelector(".faq-answer");
          if (oBtn && oPanel && openItem !== item) {
            oBtn.setAttribute("aria-expanded", "false");
            oPanel.hidden = true;
            openItem.classList.remove("is-open");
          }
        });
        if (isOpen) {
          btn.setAttribute("aria-expanded", "false");
          panel.hidden = true;
          item.classList.remove("is-open");
        } else {
          btn.setAttribute("aria-expanded", "true");
          panel.hidden = false;
          item.classList.add("is-open");
        }
      });
    });
  }

  function initAfterPartials() {
    initSmoothScroll(document);
    initStickyHeader();
    initMobileNav();
    initHeaderBookingDropdown();
    initBookingLinks();
    initMobileBookBar();
    initHeroCardSlider();
    initGalleryLightbox();
    initFaqAccordion();

    if (window.HenHouseAnimations && typeof window.HenHouseAnimations.init === "function") {
      window.HenHouseAnimations.init({
        reducedMotion: prefersReducedMotion,
      });
    }
  }

  document.addEventListener("partialsLoaded", initAfterPartials);
})();

