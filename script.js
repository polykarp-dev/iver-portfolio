 
document.getElementById("year").textContent = new Date().getFullYear();


(function themeToggle() {
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");
  const label = document.getElementById("themeLabel");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (theme === "light") {
      icon.className = "bi bi-sun";
    } else {
      icon.className = "bi bi-moon-stars";
    }
  }
 
  applyTheme(root.getAttribute("data-theme") || "dark");

  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
  });
})();
 
(function carousels() {
  const carousels = document.querySelectorAll("[data-carousel]");

  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".carousel-min__track");
    const slides = Array.from(track.children);
    const dotsWrap = carousel.querySelector(".carousel-min__dots");
    const prevBtn = carousel.querySelector('[data-action="prev"]');
    const nextBtn = carousel.querySelector('[data-action="next"]');
    const loop = carousel.dataset.loop === "true";

    let index = 0;

    // Build dot indicators
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "carousel-min__dot";
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function update() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, i) => d.setAttribute("aria-current", i === index ? "true" : "false"));
      if (!loop) {
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === slides.length - 1;
      }
    }

    function goTo(i) {
      if (loop) {
        index = (i + slides.length) % slides.length;
      } else {
        index = Math.max(0, Math.min(i, slides.length - 1));
      }
      update();
    }

    prevBtn.addEventListener("click", () => goTo(index - 1));
    nextBtn.addEventListener("click", () => goTo(index + 1));

    // Keyboard support
    carousel.setAttribute("tabindex", "0");
    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    });

    // Touch swipe support
    let startX = null;
    track.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", (e) => {
      if (startX === null) return;
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 40) {
        goTo(diff < 0 ? index + 1 : index - 1);
      }
      startX = null;
    });

    update();
  });
})();