(function () {
  var EASE_SOFT = "power3.out";
  var EASE_SUBTLE = "power2.out";
  var DURATION_SHORT = 0.55;
  var DURATION_BASE = 0.8;
  var STAGGER_FAST = 0.06;
  var STAGGER_BASE = 0.08;

  function ensureVisibleBaseState() {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
      el.style.opacity = "";
      el.style.transform = "";
    });
  }

  function registerScrollTriggers(options) {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      ensureVisibleBaseState();
      return;
    }

    if (options && options.reducedMotion) {
      ensureVisibleBaseState();
      // Also disable any existing ScrollTriggers if they were created
      if (ScrollTrigger.getAll) {
        ScrollTrigger.getAll().forEach(function (st) {
          st.disable(false);
        });
      }
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    animationRegistry.sectionReveal();
    animationRegistry.gridStagger();
    animationRegistry.mediaScaleIn();
    animationRegistry.heroParallax();
  }

  var animationRegistry = {
    sectionReveal: function () {
      var sections = document.querySelectorAll("[data-reveal='section']");
      sections.forEach(function (el) {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 40 },
          {
            duration: DURATION_BASE,
            autoAlpha: 1,
            y: 0,
            ease: EASE_SOFT,
            overwrite: "auto",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              end: "bottom 65%",
              scrub: false,
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    },

    gridStagger: function () {
      var grids = document.querySelectorAll("[data-reveal='grid']");
      grids.forEach(function (grid) {
        var items = grid.querySelectorAll("[data-reveal-item]");
        if (!items.length) return;

        gsap.fromTo(
          items,
          { autoAlpha: 0, y: 26 },
          {
            duration: DURATION_SHORT,
            autoAlpha: 1,
            y: 0,
            ease: EASE_SUBTLE,
            stagger: STAGGER_FAST,
            overwrite: "auto",
            scrollTrigger: {
              trigger: grid,
              start: "top 85%",
              end: "bottom 70%",
              scrub: false,
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    },

    mediaScaleIn: function () {
      var mediaBlocks = document.querySelectorAll("[data-scale-media]");
      mediaBlocks.forEach(function (el) {
        gsap.fromTo(
          el,
          { autoAlpha: 0, scale: 0.96, y: 18 },
          {
            duration: DURATION_BASE,
            autoAlpha: 1,
            scale: 1,
            y: 0,
            ease: EASE_SOFT,
            overwrite: "auto",
            scrollTrigger: {
              trigger: el,
              start: "top 82%",
              end: "bottom 62%",
              scrub: false,
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    },

    heroEntrance: function (options) {
      if (typeof gsap === "undefined") return;
      if (options && options.reducedMotion) return;

      var hero = document.querySelector("#hero");
      var copy = hero && hero.querySelector(".hero-copy");
      var lozenges = copy && copy.querySelectorAll(".hero-lozenge");
      var eyebrow = copy && copy.querySelector(".eyebrow");
      var headline = copy && copy.querySelector(".hero-title");
      var subcopy = copy && copy.querySelector(".hero-subtitle");
      var ctas = copy && copy.querySelector(".hero-ctas");
      var sliderCard = hero ? hero.querySelector(".hero-slider-card") : null;

      if (!hero || !copy) return;

      var tl = gsap.timeline({
        defaults: { ease: EASE_SOFT },
      });

      if (lozenges && lozenges.length) {
        tl.fromTo(
          lozenges,
          { autoAlpha: 0, y: 16 },
          {
            duration: DURATION_SHORT,
            autoAlpha: 1,
            y: 0,
            stagger: STAGGER_FAST,
          }
        );
      }

      if (eyebrow) {
        tl.fromTo(
          eyebrow,
          { autoAlpha: 0, y: 12 },
          { duration: DURATION_SHORT, autoAlpha: 1, y: 0 },
          lozenges && lozenges.length ? "-=0.2" : 0
        );
      }

      if (headline) {
        tl.fromTo(
          headline,
          { autoAlpha: 0, y: 24 },
          { duration: DURATION_BASE, autoAlpha: 1, y: 0 },
          "-=0.35"
        );
      }

      if (subcopy) {
        tl.fromTo(
          subcopy,
          { autoAlpha: 0, y: 18 },
          { duration: DURATION_SHORT, autoAlpha: 1, y: 0 },
          "-=0.35"
        );
      }

      if (ctas) {
        tl.fromTo(
          ctas,
          { autoAlpha: 0, y: 20 },
          { duration: DURATION_SHORT, autoAlpha: 1, y: 0 },
          "-=0.25"
        );
      }

      if (sliderCard) {
        tl.fromTo(
          sliderCard,
          { autoAlpha: 0, y: 40, scale: 1.02 },
          {
            duration: DURATION_BASE,
            autoAlpha: 1,
            y: 0,
            scale: 1,
          },
          "-=0.35"
        );
      }
    },

    heroParallax: function () {
      if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

      var layers = document.querySelectorAll("[data-parallax]");
      if (!layers.length) return;

      layers.forEach(function (layer, index) {
        var yTarget = index === 0 ? -4 : -9;

        gsap.to(layer, {
          yPercent: yTarget,
          ease: "none",
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.3,
          },
        });
      });
    },
  };

  function tagRevealElements() {
    // Hero is animated on load by heroEntrance(), not by scroll reveal — do not tag .hero-copy

    // Add .reveal to all elements that have data-reveal or data-reveal-item (for initial hidden state)
    document.querySelectorAll("[data-reveal='section'], [data-reveal='grid']").forEach(function (el) {
      el.classList.add("reveal");
    });
    document.querySelectorAll("[data-reveal-item]").forEach(function (el) {
      el.classList.add("reveal");
    });
  }

  function init(options) {
    var safeOptions = options || {};

    tagRevealElements();

    if (safeOptions.reducedMotion) {
      ensureVisibleBaseState();
      return;
    }

    animationRegistry.heroEntrance(safeOptions);
    registerScrollTriggers(safeOptions);
  }

  window.HenHouseAnimations = {
    init: init,
  };
})();

