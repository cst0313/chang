/* ──────────────────────────────────────────────────────────────────
   Jeffrey Chang — an index
   script.js

   Small, vanilla, no build step, no tracking.
   Each function does one thing and stops talking.
   ────────────────────────────────────────────────────────────────── */

(() => {
  "use strict";

  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ──────────────────────────────────────────────
     Custom cursor — eased follow + hover state.
     ────────────────────────────────────────────── */
  function initCursor() {
    if (isTouch || prefersReduced) return;

    const cursor = document.querySelector(".cursor");
    if (!cursor) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx;
    let cy = my;

    window.addEventListener("pointermove", (e) => {
      mx = e.clientX;
      my = e.clientY;
    }, { passive: true });

    window.addEventListener("pointerdown", () => cursor.classList.add("is-down"));
    window.addEventListener("pointerup", () => cursor.classList.remove("is-down"));
    window.addEventListener("pointerleave", () => cursor.classList.remove("is-hover"));

    const hoverables = "a, button, [data-cursor='hover'], .instrument, .reach-link";
    document.addEventListener("pointerover", (e) => {
      if (e.target.closest(hoverables)) cursor.classList.add("is-hover");
    });
    document.addEventListener("pointerout", (e) => {
      if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest(hoverables)) {
        cursor.classList.remove("is-hover");
      }
    });

    function loop() {
      cx += (mx - cx) * 0.22;
      cy += (my - cy) * 0.22;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ──────────────────────────────────────────────
     Scroll progress — single hairline at top.
     ────────────────────────────────────────────── */
  function initProgress() {
    const bar = document.querySelector(".progress-bar");
    const frame = document.querySelector(".frame");
    if (!bar) return;
    let ticking = false;
    function update() {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = p.toFixed(2) + "%";
      if (frame) frame.classList.toggle("is-scrolled", h.scrollTop > 12);
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* ──────────────────────────────────────────────
     Reveals — each act marks itself in-view once.
     Also tracks active section for the nav.
     ────────────────────────────────────────────── */
  function initReveals() {
    if (prefersReduced) {
      document.querySelectorAll(".act, .instrument").forEach(el => el.classList.add("in-view"));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    document.querySelectorAll(".act").forEach(el => io.observe(el));
    document.querySelectorAll(".instrument").forEach(el => io.observe(el));

    // Active nav highlight as the reader passes each act.
    const navLinks = document.querySelectorAll(".frame-nav a");
    const activeIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(a => {
            a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    document.querySelectorAll(".act").forEach(el => activeIO.observe(el));
  }

  /* ──────────────────────────────────────────────
     Clocks — London + Hong Kong, second by minute.
     ────────────────────────────────────────────── */
  function initClocks() {
    const targets = [
      { sel: '[data-time="london"]', tz: "Europe/London" },
      { sel: '[data-time="hk"]',     tz: "Asia/Hong_Kong" },
    ];
    function paint() {
      const now = new Date();
      targets.forEach(t => {
        const el = document.querySelector(t.sel);
        if (!el) return;
        try {
          el.textContent = new Intl.DateTimeFormat("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: t.tz,
          }).format(now);
        } catch (_) {
          el.textContent = "--:--";
        }
      });
    }
    paint();
    setInterval(paint, 1000 * 15);
  }

  /* ──────────────────────────────────────────────
     Year stamp.
     ────────────────────────────────────────────── */
  function initYear() {
    const el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ──────────────────────────────────────────────
     Variable-font axis play on display headline.
     A tiny weight oscillation on hover — barely
     perceptible, but the kind of detail you feel.
     ────────────────────────────────────────────── */
  function initDisplayAxis() {
    if (prefersReduced) return;
    const display = document.querySelector(".display");
    if (!display) return;

    let target = { wght: 360, soft: 30 };
    let current = { wght: 360, soft: 30 };
    let raf = null;

    function step() {
      current.wght += (target.wght - current.wght) * 0.12;
      current.soft += (target.soft - current.soft) * 0.12;
      display.style.fontVariationSettings =
        `"opsz" 144, "wght" ${current.wght.toFixed(1)}, "SOFT" ${current.soft.toFixed(1)}`;
      if (Math.abs(target.wght - current.wght) > 0.2 || Math.abs(target.soft - current.soft) > 0.2) {
        raf = requestAnimationFrame(step);
      } else {
        raf = null;
      }
    }
    function set(t) {
      target = t;
      if (!raf) raf = requestAnimationFrame(step);
    }

    display.addEventListener("pointermove", (e) => {
      const r = display.getBoundingClientRect();
      const y = (e.clientY - r.top) / r.height;       // 0..1
      const wght = 320 + (1 - y) * 220;               // top heavier
      const soft = 20 + y * 90;                       // bottom softer
      set({ wght, soft });
    });
    display.addEventListener("pointerleave", () => set({ wght: 360, soft: 30 }));
  }

  /* ──────────────────────────────────────────────
     Soft-scroll to anchors honouring sticky header.
     ────────────────────────────────────────────── */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href").slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 12;
        window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
        history.replaceState(null, "", "#" + id);
      });
    });
  }

  /* ──────────────────────────────────────────────
     A small console signature, for the curious.
     ────────────────────────────────────────────── */
  function initSignature() {
    if (!window.console) return;
    const big = "%c jeffrey chang ";
    const small = "%c\n an index — built by hand, served on paper.\n if you read source for a living, hello.\n jsc323 [at] ic.ac.uk\n";
    console.log(
      big + small,
      "font: italic 700 22px/1 Georgia, serif; color: #F4EFE6; background: #1F3E5C; padding: 6px 14px; border-radius: 2px;",
      "font: 12px ui-monospace, monospace; color: #6E6862;"
    );
  }

  /* ──────────────────────────────────────────────
     Boot.
     ────────────────────────────────────────────── */
  function boot() {
    initCursor();
    initProgress();
    initReveals();
    initClocks();
    initYear();
    initDisplayAxis();
    initAnchors();
    initSignature();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
