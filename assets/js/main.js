/*
	SudoBotz - Enhanced Modern JavaScript
	Elite automation website with professional interactions
*/

(function ($) {
  var $window = $(window),
    $body = $("body"),
    $wrapper = $("#wrapper"),
    $header = $("#header"),
    $footer = $("#footer"),
    $main = $("#main"),
    $main_articles = $main.children("article");

  // Settings
  var settings = {
    // Delays.
    delay: 325,
    // Transitions.
    transitions: true,
  };

  // Methods.
  var methods = {
    // Initial.
    initial: function () {
      // Disable transitions until the page has fully loaded.
      methods.ie();
      methods.main();
      methods.articles();
      methods.nav();
      methods.stats();
      methods.scrollEffects();
      methods.modernInteractions();
      methods.typewriterEffect();
      methods.parallaxEffects();
      methods.performanceOptimizations();

      // Initialize immediately.
      $window.on("load", function () {
        window.setTimeout(function () {
          $body.removeClass("is-preload");
          window.setTimeout(function () {
            methods.play();
          }, 150);
        }, 100);
      });
    },

    // IE.
    ie: function () {
      var $main = $(".main");

      if (browser.name == "ie") {
        // Submit.
        $main.on("click", ".close", function () {
          $main.removeClass("visible");
        });
      }
    },

    // Articles.
    articles: function () {
      var $this = $main_articles,
        $timeout;

      // No articles? Bail.
      if ($this.length == 0) return;

      // Handle.
      $this.each(function () {
        var $article = $(this);

        // Close.
        $('<div class="close">Close</div>')
          .appendTo($article)
          .on("click", function () {
            location.hash = "";
          });

        // Prevent clicks from inside the article from bubbling.
        $article.on("click", function (event) {
          event.stopPropagation();
        });
      });

      // Events.
      $body.on("click", function (event) {
        // Article visible? Hide.
        if ($body.hasClass("is-article-visible")) $main._hide(true);
      });

      // Expose method.
      $main._show = function (id, initial) {
        var $article = $main_articles.filter("#" + id);

        // No such article? Bail.
        if ($article.length == 0) return;

        // Handle.
        clearTimeout($timeout);

        // Article already visible? Just switch to it.
        if ($body.hasClass("is-article-visible")) {
          // Hide current article.
          $main_articles.removeClass("active");

          // Show new article after a short delay.
          $timeout = setTimeout(function () {
            $article.addClass("active");
            $window.scrollTop(0).triggerHandler("resize.flexbox-fix");
          }, settings.delay);
        }

        // Otherwise, handle as normal.
        else {
          // Mark as visible.
          $body.addClass("is-article-visible");

          // Show article.
          $timeout = setTimeout(function () {
            // Hide header, footer.
            $header.hide();
            $footer.hide();

            // Show main, article.
            $main.show();
            $article.addClass("active");

            // Unlock.
            $body.addClass("is-locked");

            // Trigger resize event.
            $window.scrollTop(0).triggerHandler("resize.flexbox-fix");
          }, settings.delay);
        }
      };

      $main._hide = function (addState) {
        var $article = $main_articles.filter(".active");

        // Article not visible? Bail.
        if (!$body.hasClass("is-article-visible")) return;

        // Add state?
        if (typeof addState == "undefined") addState = false;

        // Handle.
        clearTimeout($timeout);

        // Hide article.
        $article.removeClass("active");

        // Hide main.
        $timeout = setTimeout(function () {
          // Mark as not visible.
          $body.removeClass("is-article-visible");

          // Show header, footer.
          $header.show();
          $footer.show();

          // Hide main.
          $main.hide();

          // Unlock.
          $body.removeClass("is-locked");

          // Unset hash.
          if (addState)
            history.pushState(
              "",
              document.title,
              window.location.pathname + window.location.search
            );

          // Trigger resize event.
          $window.triggerHandler("resize.flexbox-fix");
        }, settings.delay);
      };

      // Articles.
      $main_articles.each(function () {
        var $this = $(this);

        // Close.
        $this.on("click", ".close", function () {
          location.hash = "";
        });

        // Prevent clicks from inside the article from bubbling.
        $this.on("click", function (event) {
          event.stopPropagation();
        });
      });
    },

    // Main.
    main: function () {
      var $this = $main,
        $trigger = $window,
        $inner = $this.children(".inner");

      // Disable main on <=large.
      breakpoints.on("<=large", function () {
        settings.transitions = false;
      });

      breakpoints.on(">large", function () {
        settings.transitions = true;
      });

      // Fix: Placeholder polyfill.
      if (browser.name == "ie" || browser.mobile) {
        $window.on("resize", function () {
          window.setTimeout(function () {
            $window.triggerHandler("refreshFixedElement");
          }, 0);
        });
      }

      // Play initial animations on load.
      $window.on("load", function () {
        window.setTimeout(function () {
          $body.removeClass("is-preload");
        }, 100);
      });
    },

    // Nav.
    nav: function () {
      var $this = $header.children("nav"),
        $list = $this.find("ul"),
        $items = $list.find("li");

      // Main links.
      $items.each(function () {
        var $this = $(this),
          $a = $this.children("a"),
          href = $a.attr("href");

        // Skip external links and non-hash links
        if (
          typeof href == "undefined" ||
          href.substr(0, 1) != "#" ||
          href.indexOf("http") === 0
        )
          return;

        // Override href for internal navigation only
        $a.on("click", function (event) {
          // Prevent default.
          event.preventDefault();
          event.stopPropagation();

          // Show article.
          if (href == "#") {
            // Hide articles.
            $main._hide();
          } else {
            // Show article.
            $main._show(href.substr(1));
          }
        });
      });

      // Handle CTA button separately - don't override external links
      $(".cta-button a").on("click", function (event) {
        const href = $(this).attr("href");

        // Only handle internal navigation
        if (href && href.startsWith("#")) {
          event.preventDefault();
          event.stopPropagation();
          $main._show(href.substr(1));
        }
        // Let external links work normally
      });
    },

    // Stats counter animation
    stats: function () {
      function animateStats() {
        $(".stat-number").each(function () {
          const $this = $(this);
          const finalValue = $this.text();

          // Only animate if not already animated
          if (!$this.hasClass("animated")) {
            $this.addClass("animated");
            const isPercentage = finalValue.includes("%");
            const isPlusSign = finalValue.includes("+");
            const isSlash = finalValue.includes("/");

            let numericValue = parseInt(finalValue.replace(/[^\d]/g, ""));

            $({ counter: 0 }).animate(
              { counter: numericValue },
              {
                duration: 2000,
                easing: "swing",
                step: function () {
                  let current = Math.ceil(this.counter);
                  let displayValue = current;

                  if (isPercentage) {
                    displayValue = current + "%";
                  } else if (isPlusSign) {
                    displayValue = current + "+";
                  } else if (isSlash) {
                    displayValue = current + "/7";
                  }

                  $this.text(displayValue);
                },
              }
            );
          }
        });
      }

      // Trigger animation when stats come into view
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                animateStats();
              }
            });
          },
          { threshold: 0.5 }
        );

        const statsGrid = document.querySelector(".stats-grid");
        if (statsGrid) {
          observer.observe(statsGrid);
        }
      } else {
        // Fallback for older browsers
        animateStats();
      }
    },

    // Modern scroll effects
    scrollEffects: function () {
      if ("IntersectionObserver" in window) {
        const observerOptions = {
          threshold: 0.1,
          rootMargin: "0px 0px -50px 0px",
        };

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("animate-in");
            }
          });
        }, observerOptions);

        // Observe service cards
        document
          .querySelectorAll(
            ".service-card, .portfolio-item, .team-member, .testimonial, .process-step, .faq-item"
          )
          .forEach((el) => {
            observer.observe(el);
          });
      }

      // Add scroll-triggered fade-ins
      $window.on("scroll", function () {
        const scrolled = $window.scrollTop();
        const windowHeight = $window.height();

        // Parallax background effect
        $("#bg").css("transform", `translateY(${scrolled * 0.3}px)`);

        // Header background opacity on scroll
        if (scrolled > 100) {
          $header.addClass("scrolled");
        } else {
          $header.removeClass("scrolled");
        }
      });
    },

    // Modern interactions
    modernInteractions: function () {
      // Service card interactions
      $(".service-card")
        .on("mouseenter", function () {
          $(this).addClass("hovered");
        })
        .on("mouseleave", function () {
          $(this).removeClass("hovered");
        });

      // Portfolio item interactions
      $(".portfolio-item").on("click", function () {
        const $this = $(this);
        $this.toggleClass("expanded");
      });

      // FAQ toggle functionality
      $(".faq-item").on("click", function () {
        const $this = $(this);
        const $content = $this.find("p");

        // Close other FAQ items
        $(".faq-item").not($this).removeClass("open");
        $(".faq-item").not($this).find("p").slideUp(300);

        // Toggle current item
        $this.toggleClass("open");
        if ($this.hasClass("open")) {
          $content.slideDown(300);
        } else {
          $content.slideUp(300);
        }
      });

      // Tech stack hover effects
      $(".tech-icons img")
        .on("mouseenter", function () {
          $(this).addClass("tech-hover");
          // Show tooltip if title exists
          const title = $(this).attr("title");
          if (title) {
            $('<div class="tech-tooltip">' + title + "</div>")
              .appendTo("body")
              .fadeIn(200);
          }
        })
        .on("mouseleave", function () {
          $(this).removeClass("tech-hover");
          $(".tech-tooltip").remove();
        })
        .on("mousemove", function (e) {
          $(".tech-tooltip").css({
            left: e.pageX + 10,
            top: e.pageY - 30,
          });
        });

      // Enhanced button interactions
      $(".button, .contact-link, .profile-link")
        .on("mouseenter", function () {
          $(this).addClass("button-hover");
        })
        .on("mouseleave", function () {
          $(this).removeClass("button-hover");
        });

      // Contact card interactions
      $(".contact-card")
        .on("mouseenter", function () {
          $(this).addClass("card-hover");
        })
        .on("mouseleave", function () {
          $(this).removeClass("card-hover");
        });
    },

    // Typewriter effect for hero text
    typewriterEffect: function () {
      const heroTitle = document.querySelector("#header .content h1");
      if (!heroTitle) return;

      const originalText = heroTitle.textContent;
      heroTitle.textContent = "";
      heroTitle.style.borderRight = "3px solid var(--primary-color)";

      let i = 0;
      function typeChar() {
        if (i < originalText.length) {
          heroTitle.textContent += originalText.charAt(i);
          i++;
          setTimeout(typeChar, 100);
        } else {
          setTimeout(() => {
            heroTitle.style.borderRight = "none";
          }, 500);
        }
      }

      // Start typewriter effect after a delay
      setTimeout(typeChar, 1000);
    },

    // Parallax effects
    parallaxEffects: function () {
      let ticking = false;

      function updateParallax() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;

        // Background parallax
        const bg = document.getElementById("bg");
        if (bg) {
          bg.style.transform = `translateY(${rate}px)`;
        }

        ticking = false;
      }

      function requestTick() {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      }

      window.addEventListener("scroll", requestTick);
    },

    // Performance optimizations
    performanceOptimizations: function () {
      // Lazy load images
      if ("IntersectionObserver" in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.classList.add("loaded");
                imageObserver.unobserve(img);
              }
            }
          });
        });

        document.querySelectorAll("img[data-src]").forEach((img) => {
          imageObserver.observe(img);
        });
      }

      // Preload critical resources
      const criticalResources = ["assets/css/main.css", "assets/js/main.js"];

      criticalResources.forEach((resource) => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.href = resource;
        link.as = resource.endsWith(".css") ? "style" : "script";
        document.head.appendChild(link);
      });

      // Optimize scroll performance
      let scrollTimeout;
      $window.on("scroll", function () {
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => {
          // Scroll operations here
        }, 16); // ~60fps
      });
    },

    // Play.
    play: function () {
      // Turn off transitions.
      settings.transitions = false;

      // Turn on transitions.
      window.setTimeout(function () {
        settings.transitions = true;
      }, settings.delay);
    },
  };

  // Initialize.
  methods.initial();

  // Additional modern features
  $(document).ready(function () {
    // Enhanced keyboard navigation
    $(document).on("keydown", function (e) {
      if (e.key === "Escape") {
        $main._hide(true);
      }
    });

    // Add focus management for accessibility
    $("a, button, input, textarea, select")
      .on("focus", function () {
        $(this).addClass("focused");
      })
      .on("blur", function () {
        $(this).removeClass("focused");
      });

    // Progressive enhancement for contact forms
    $("form").on("submit", function (e) {
      const $form = $(this);
      const $submitBtn = $form.find('[type="submit"]');

      $submitBtn.text("Sending...").prop("disabled", true);

      // Re-enable after timeout (for demo)
      setTimeout(() => {
        $submitBtn.text("Send Message").prop("disabled", false);
      }, 2000);
    });

    // Service worker registration for PWA
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered: ", registration);
          })
          .catch((registrationError) => {
            console.log("SW registration failed: ", registrationError);
          });
      });
    }
  });
})(jQuery);

// Additional utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
