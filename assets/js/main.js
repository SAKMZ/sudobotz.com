/*
	SudoBotz - Simple Page JavaScript
	Minimal JS for animations and smooth loading
*/

(function () {
  "use strict";

  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", function () {
    // Remove preload class after page loads
    window.addEventListener("load", function () {
      setTimeout(function () {
        document.body.classList.remove("is-preload");
      }, 100);
    });

    // Add smooth scrolling for hash links only
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");

        // Only handle internal hash links
        if (href !== "#" && href.length > 1) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }
      });
    });

    // Animate stats on scroll
    const stats = document.querySelectorAll(".stat-number");
    const statsObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateNumber(entry.target);
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    stats.forEach(function (stat) {
      statsObserver.observe(stat);
    });

    // Number animation function
    function animateNumber(element) {
      const originalText = element.textContent;

      // Skip animation for text that contains "/" (like "24/7")
      if (originalText.includes("/")) {
        return;
      }

      const target = parseInt(originalText.replace(/[^\d]/g, ""));
      const increment = target / 50;
      let current = 0;

      const timer = setInterval(function () {
        current += increment;
        if (current >= target) {
          element.textContent = originalText.replace(/\d+/, target);
          clearInterval(timer);
        } else {
          element.textContent = originalText.replace(
            /\d+/,
            Math.floor(current)
          );
        }
      }, 30);
    }

    // Add hover effects to cards
    const cards = document.querySelectorAll(
      ".service-card, .team-member, .tech-item"
    );
    cards.forEach(function (card) {
      card.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-8px)";
      });

      card.addEventListener("mouseleave", function () {
        this.style.transform = "translateY(0)";
      });
    });

    // Parallax effect for hero section
    window.addEventListener("scroll", function () {
      const scrolled = window.pageYOffset;
      const hero = document.querySelector(".hero-section");

      if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - scrolled / window.innerHeight;
      }
    });

    // Add loading animation delay for elements
    const animatedElements = document.querySelectorAll(
      ".service-card, .team-member, .tech-item"
    );
    animatedElements.forEach(function (element, index) {
      element.style.animationDelay = index * 0.1 + "s";
    });
  });
})();
