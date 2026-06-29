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
     Custom cursor + aura — soft gradient orb trails
     a few frames behind the precise dot, both follow
     the mouse on a lerp. The aura is what gives the
     page its "alive" feel; the cursor stays sharp.
     ────────────────────────────────────────────── */
  function initCursor() {
    if (isTouch || prefersReduced) return;

    const cursor = document.querySelector(".cursor");
    const aura   = document.querySelector(".aura");
    if (!cursor) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx, cy = my;
    let ax = mx, ay = my;

    window.addEventListener("pointermove", (e) => {
      mx = e.clientX;
      my = e.clientY;
    }, { passive: true });

    window.addEventListener("pointerdown", () => cursor.classList.add("is-down"));
    window.addEventListener("pointerup",   () => cursor.classList.remove("is-down"));
    window.addEventListener("pointerleave",() => cursor.classList.remove("is-hover"));

    const hoverables = "a, button, [data-cursor='hover'], .instrument, .reach-link, .principle, .stat";
    document.addEventListener("pointerover", (e) => {
      if (e.target.closest(hoverables)) cursor.classList.add("is-hover");
    });
    document.addEventListener("pointerout", (e) => {
      if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest(hoverables)) {
        cursor.classList.remove("is-hover");
      }
    });

    function loop() {
      cx += (mx - cx) * 0.24;
      cy += (my - cy) * 0.24;
      ax += (mx - ax) * 0.06;   // aura lags further behind, feels thoughtful
      ay += (my - ay) * 0.06;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      if (aura) aura.style.transform = `translate3d(${ax}px, ${ay}px, 0)`;
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
    document.querySelectorAll(".principle").forEach(el => io.observe(el));

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
     Split the hero into individual characters so
     each one can choreograph its own entrance.
     ────────────────────────────────────────────── */
  function initLetterSplit() {
    // Latin display — split per character, preserve the .period span
    document.querySelectorAll("[data-split]").forEach((root) => {
      const lines = root.querySelectorAll(".display-line");
      let i = 0;
      const start = prefersReduced ? 0 : 700; // wait for curtain
      const step  = prefersReduced ? 0 : 55;
      lines.forEach((line) => {
        const periodEl = line.querySelector(".period");
        const text = periodEl ? line.firstChild.textContent : line.textContent;
        line.textContent = "";
        for (const ch of text) {
          const s = document.createElement("span");
          s.className = "char";
          s.textContent = ch === " " ? " " : ch;
          s.style.setProperty("--char-delay", (start + i * step) + "ms");
          i++;
          line.appendChild(s);
        }
        if (periodEl) {
          const p = document.createElement("span");
          p.className = "char period";
          p.textContent = ".";
          p.style.setProperty("--char-delay", (start + i * step + 80) + "ms");
          line.appendChild(p);
          i++;
        }
      });
    });

    // CJK — one span per grapheme
    document.querySelectorAll("[data-split-cjk]").forEach((root) => {
      const text = root.textContent;
      const start = prefersReduced ? 0 : 1700;
      const step  = prefersReduced ? 0 : 130;
      root.textContent = "";
      let i = 0;
      for (const ch of text) {
        const s = document.createElement("span");
        s.className = "char-cjk";
        s.textContent = ch;
        s.style.setProperty("--char-delay", (start + i * step) + "ms");
        i++;
        root.appendChild(s);
      }
    });
  }

  /* ──────────────────────────────────────────────
     Stat counters — count up from zero when their
     parent section enters the viewport.
     ────────────────────────────────────────────── */
  function initStats() {
    const stats = document.querySelectorAll(".stat-num[data-count]");
    if (!stats.length) return;

    stats.forEach((el) => {
      const suffix = el.getAttribute("data-suffix") || "";
      const target = parseInt(el.getAttribute("data-count"), 10) || 0;
      el.textContent = "";
      const numSpan = document.createElement("span");
      numSpan.className = "stat-num-value";
      numSpan.textContent = prefersReduced ? String(target) : "0";
      const sufSpan = document.createElement("span");
      sufSpan.className = "stat-num-suffix";
      sufSpan.textContent = suffix.trim();
      el.appendChild(numSpan);
      if (suffix.trim()) el.appendChild(sufSpan);

      if (prefersReduced) return;
      el._countTarget = target;
      el._numSpan = numSpan;
    });

    if (prefersReduced) return;

    const counted = new WeakSet();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll(".stat-num[data-count]").forEach((el) => {
          if (counted.has(el)) return;
          counted.add(el);
          const target = el._countTarget;
          const numSpan = el._numSpan;
          if (!numSpan) return;
          const dur = 1400;
          const t0 = performance.now() + 500;
          function tick(now) {
            const t = Math.min(1, Math.max(0, (now - t0) / dur));
            const eased = 1 - Math.pow(1 - t, 4);
            numSpan.textContent = String(Math.round(target * eased));
            if (t < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      });
    }, { threshold: 0.2 });
    document.querySelectorAll(".act-threshold").forEach((s) => io.observe(s));
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
    const small = "%c\n an index — built by hand, served on paper.\n if you read source for a living, hello.\n jsc323 [at] ic.ac.uk\n\n there are seven instruments on this page.\n there is an eighth, hidden behind a small door.\n the door listens for a number.\n";
    console.log(
      big + small,
      "font: italic 700 22px/1 Georgia, serif; color: #F4EFE6; background: #1F3E5C; padding: 6px 14px; border-radius: 2px;",
      "font: 12px ui-monospace, monospace; color: #6E6862;"
    );
  }

  /* ──────────────────────────────────────────────
     The door + the puzzle + the cabinet.
     A small brainteaser: 2^64 - 1 (the chess + rice
     problem, with the chessboard hint deliberately
     baked into the prose so search engines can't
     trivially fingerprint it). Accept several formats.
     ────────────────────────────────────────────── */
  function initPuzzle() {
    const door     = document.getElementById("door");
    const trigger  = document.getElementById("doorTrigger");
    const puzzle   = document.getElementById("puzzle");
    const closeBtn = puzzle && puzzle.querySelector(".puzzle-close");
    const form     = document.getElementById("puzzleForm");
    const input    = document.getElementById("puzzleInput");
    const hint     = document.getElementById("puzzleHint");
    const cabinet  = document.getElementById("cabinet");
    if (!door || !puzzle || !form || !input || !hint || !cabinet) return;

    const ANSWER = 18446744073709551615n; // 2^64 - 1
    const SOLVED_KEY = "jc-cabinet-open";

    function open() {
      puzzle.classList.add("is-open");
      puzzle.setAttribute("aria-hidden", "false");
      setTimeout(() => input.focus(), 200);
    }
    function close() {
      puzzle.classList.remove("is-open");
      puzzle.setAttribute("aria-hidden", "true");
    }
    function unlock(silent) {
      door.classList.add("is-opened");
      cabinet.classList.add("is-open", "in-view");
      cabinet.setAttribute("aria-hidden", "false");
      try { localStorage.setItem(SOLVED_KEY, "1"); } catch (_) {}
      if (!silent) {
        // Update door tip to mark the threshold crossed.
        const tip = trigger.querySelector(".door-tip");
        if (tip) tip.textContent = "the cabinet is open";
        setTimeout(() => {
          close();
          cabinet.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
        }, 700);
      }
    }

    // Restore previous unlock on revisit.
    try { if (localStorage.getItem(SOLVED_KEY) === "1") unlock(true); } catch (_) {}

    trigger.addEventListener("click", open);
    closeBtn && closeBtn.addEventListener("click", close);
    puzzle.addEventListener("click", (e) => { if (e.target === puzzle) close(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && puzzle.classList.contains("is-open")) close();
    });

    function normalise(raw) {
      return (raw || "")
        .toLowerCase()
        .replaceAll(/[\s,_'`]+/g, "")
        .replaceAll("**", "^")
        .replaceAll("×", "*")
        .replaceAll(/−/g, "-");
    }

    function tryParseBigInt(s) {
      // Plain number, possibly scientific.
      if (/^\d+$/.test(s)) {
        try { return BigInt(s); } catch (_) { return null; }
      }
      // Expressions: 2^64-1, 2^64, (2^64)-1, etc.
      const m = s.match(/^\(?2\^?(\d+)\)?(?:-1)?$/);
      if (m) {
        const exp = Number(m[1]);
        if (exp >= 1 && exp <= 256) {
          const v = 1n << BigInt(exp);
          return s.endsWith("-1") ? v - 1n : v;
        }
      }
      return null;
    }

    function check(raw) {
      const s = normalise(raw);
      if (!s) return "empty";

      // Famous wrong-but-close answers — give a warm hint.
      const closeWrongs = new Set(["64", "65", "2^64", "264"]);
      const parsed = tryParseBigInt(s);
      if (parsed !== null) {
        if (parsed === ANSWER) return "right";
        if (parsed === ANSWER + 1n) return "warm"; // off-by-one — common!
        if (parsed === 64n || parsed === 1n << 64n) return "warm";
      }
      if (closeWrongs.has(s)) return "warm";
      // Worded answer
      if (s.includes("morethanthere") || s.includes("infinity") || s.includes("infinite"))
        return "warm";
      return "cold";
    }

    let warmCount = 0;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const verdict = check(input.value);
      form.classList.remove("is-wrong", "is-right");
      hint.classList.remove("is-warm", "is-right");

      if (verdict === "right") {
        form.classList.add("is-right");
        hint.classList.add("is-right");
        hint.textContent = "the door yields.";
        unlock(false);
        return;
      }
      if (verdict === "warm") {
        warmCount++;
        form.classList.add("is-wrong");
        hint.classList.add("is-warm");
        hint.textContent = warmCount >= 2
          ? "closer. the sum of a doubling: subtract one from the next."
          : "warmer. but count the grains, not the squares.";
      } else if (verdict === "empty") {
        hint.textContent = "a number — or the expression that names it";
      } else {
        form.classList.add("is-wrong");
        hint.textContent = "try again. a number, or the expression that names it.";
      }
      input.select();
    });

    // Expose a callable for console solvers.
    window.unlock = function (answer) {
      const v = check(String(answer));
      if (v === "right") { unlock(false); return "the cabinet is open."; }
      if (v === "warm")  { return "warmer. but not quite."; }
      return "cold.";
    };
  }

  /* ──────────────────────────────────────────────
     Boot.
     ────────────────────────────────────────────── */
  function boot() {
    initLetterSplit();
    initStats();
    initCursor();
    initProgress();
    initReveals();
    initClocks();
    initYear();
    initDisplayAxis();
    initAnchors();
    initSignature();
    initPuzzle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
