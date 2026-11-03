const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

document.querySelectorAll(".year").forEach((el) => (el.textContent = new Date().getFullYear()));

/* Theme toggle (remembers choice) */
(function theme() {
  const root = document.documentElement;
  const icon = $("#themeIcon");
  const apply = (t) => {
    root.setAttribute("data-theme", t);
    icon.className = t === "light" ? "bi bi-sun" : "bi bi-moon-stars";
  };
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  apply(saved || "dark");
  $("#themeToggle").addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    apply(next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
})();

/* Scroll progress bar */
(function progress() {
  const bar = $("#progress");
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener("scroll", update, { passive: true });
  update();
})();

/* Typewriter role line */
(function roles() {
  const el = $("#roleText");
  const list = ["Software Developer", "Video Editor", "Graphic Designer", "Multimedia Creator"];
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let i = 0, c = 0, del = false;
  function step() {
    const word = list[i];
    el.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(step, 1600); }
    if (del && c === 0) { del = false; i = (i + 1) % list.length; }
    c += del ? -1 : 1;
    setTimeout(step, del ? 35 : 70);
  }
  step();
})();

/* Thumbnails + scrolling video grid */
const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
$$(".clip").forEach((c) => { $("img", c).src = thumb(c.dataset.yt); });

(function marquee() {
  // Each row holds 4 identical sets so the CSS loop (-25%) is seamless on any screen width.
  $$(".vrow__track").forEach((track) => {
    const originals = Array.from(track.children);
    for (let n = 1; n < 4; n++) {
      originals.forEach((c) => {
        const k = c.cloneNode(true);
        k.classList.add("is-clone");
        k.setAttribute("aria-hidden", "true");
        k.tabIndex = -1;
        track.appendChild(k);
      });
    }
  });
})();

/* Lightbox player */
const lb = $("#lightbox"), lbBox = $("#lbBox"), lbFrame = $("#lbFrame"), lbTitle = $("#lbTitle"), lbImg = $("#lbImg");
let lastFocus = null;
function openVideo(clip) {
  lastFocus = document.activeElement;
  lbBox.classList.remove("image");
  lbBox.classList.toggle("vertical", clip.dataset.v === "1");
  lbTitle.textContent = clip.dataset.title;
  lbFrame.src = `https://www.youtube-nocookie.com/embed/${clip.dataset.yt}?autoplay=1&rel=0`;
  lb.classList.add("open");
  document.body.style.overflow = "hidden";
  $("#lbClose").focus();
}
function openImage(img) {
  lastFocus = document.activeElement;
  lbBox.classList.remove("vertical");
  lbBox.classList.add("image");
  lbTitle.textContent = img.alt;
  lbFrame.src = "";
  lbImg.src = img.src;
  lb.classList.add("open");
  document.body.style.overflow = "hidden";
  $("#lbClose").focus();
}
function closeVideo() {
  lb.classList.remove("open");
  lbFrame.src = "";
  lbImg.removeAttribute("src");
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}
$("#vgrid").addEventListener("click", (e) => { const c = e.target.closest(".clip"); if (c) openVideo(c); });
$$(".browser .carousel-min__slide img").forEach((im) => im.addEventListener("click", () => openImage(im)));
$("#lbClose").addEventListener("click", closeVideo);
lb.addEventListener("click", (e) => { if (e.target === lb) closeVideo(); });
addEventListener("keydown", (e) => { if (e.key === "Escape" && lb.classList.contains("open")) closeVideo(); });

/* Scroll reveal */
(function reveal() {
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window)) return items.forEach((i) => i.classList.add("in"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => io.observe(el));
})();

/* Carousels */
(function carousels() {
  $$("[data-carousel]").forEach((carousel) => {
    const track = $(".carousel-min__track", carousel);
    const slides = Array.from(track.children);
    const dotsWrap = $(".carousel-min__dots", carousel);
    const prev = $('[data-action="prev"]', carousel);
    const next = $('[data-action="next"]', carousel);
    const loop = carousel.dataset.loop === "true";
    let index = 0;

    slides.forEach((_, i) => {
      const d = document.createElement("button");
      d.className = "carousel-min__dot";
      d.setAttribute("aria-label", `Go to slide ${i + 1}`);
      d.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(d);
    });
    const dots = Array.from(dotsWrap.children);

    function update() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, i) => d.setAttribute("aria-current", i === index ? "true" : "false"));
      if (!loop) { prev.disabled = index === 0; next.disabled = index === slides.length - 1; }
    }
    function goTo(i) {
      index = loop ? (i + slides.length) % slides.length : Math.max(0, Math.min(i, slides.length - 1));
      update();
    }
    prev.addEventListener("click", () => goTo(index - 1));
    next.addEventListener("click", () => goTo(index + 1));
    carousel.setAttribute("tabindex", "0");
    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    });
    let x0 = null;
    track.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const d = e.changedTouches[0].clientX - x0;
      if (Math.abs(d) > 40) goTo(d < 0 ? index + 1 : index - 1);
      x0 = null;
    });
    update();
  });
})();
