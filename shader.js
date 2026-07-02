/* ──────────────────────────────────────────────────────────────────
   Jeffrey Chang — an index
   shader.js

   Two living surfaces, powered by @paper-design/shaders — the
   vanilla WebGL engine behind paper-design/liquid-logo. Loaded
   as a module over esm.sh; if the network or WebGL says no, the
   page silently keeps its static ink. Nothing here is required.
   ────────────────────────────────────────────────────────────────── */

(async () => {
  "use strict";

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Cheap WebGL capability check before pulling the module.
  const probe = document.createElement("canvas");
  if (!probe.getContext("webgl2") && !probe.getContext("webgl")) return;

  let ShaderMount, grainGradientFragmentShader;
  try {
    ({ ShaderMount, grainGradientFragmentShader } =
      await import("https://esm.sh/@paper-design/shaders@0.0.46"));
  } catch (_) {
    return; // offline or CDN blocked — the paper stays paper
  }

  // Palette, as [r, g, b, a] floats — ink blues with one copper ember.
  const PAPER    = [0.957, 0.937, 0.902, 1];  // #F4EFE6
  const CURRENTS = [0.122, 0.243, 0.361, 1];  // #1F3E5C
  const CURRENTS_SOFT = [0.180, 0.353, 0.510, 1]; // #2E5A82
  const COPPER   = [0.659, 0.443, 0.294, 1];  // #A8714B

  const sizing = {
    u_scale: 1, u_rotation: 0, u_offsetX: 0, u_offsetY: 0,
    u_originX: 0.5, u_originY: 0.5, u_fit: 0,
    u_worldWidth: 0, u_worldHeight: 0,
  };

  function mountGrain(el, { colors, softness, intensity, noise, shape, speed, back = PAPER }) {
    try {
      return new ShaderMount(el, grainGradientFragmentShader, {
        u_colorBack: back,
        u_colors: colors,
        u_colorsCount: colors.length,
        u_softness: softness,
        u_intensity: intensity,
        u_noise: noise,
        u_shape: shape,
        ...sizing,
      }, undefined, speed);
    } catch (_) {
      return null;
    }
  }

  /* ────────────────────────────────────────────
     1 · The period after "Chang." — a drop of
     ink that never quite settles. The typeset
     glyph stays underneath as the fallback.
     ──────────────────────────────────────────── */
  function mountPeriod() {
    const period = document.querySelector(".display .period");
    if (!period) return;

    const host = document.createElement("span");
    host.className = "period-live";
    host.setAttribute("aria-hidden", "true");
    period.style.position = "relative";
    period.appendChild(host);

    const mounted = mountGrain(host, {
      back: CURRENTS,
      colors: [CURRENTS_SOFT, COPPER],
      softness: 0.9,
      intensity: 0.5,
      noise: 0.3,
      shape: 3,
      speed: 0.55,
    });
    if (mounted) period.classList.add("has-live-ink");
  }

  /* ────────────────────────────────────────────
     2 · The cabinet — the hidden room breathes.
     Mounted only when (if) the cabinet opens.
     ──────────────────────────────────────────── */
  function mountCabinet() {
    const cabinet = document.getElementById("cabinet");
    if (!cabinet || cabinet.dataset.shaderMounted) return;

    const host = document.createElement("div");
    host.className = "cabinet-shader";
    host.setAttribute("aria-hidden", "true");
    cabinet.prepend(host);

    mountGrain(host, {
      colors: [CURRENTS, CURRENTS_SOFT],
      softness: 0.95,
      intensity: 0.32,
      noise: 0.42,
      shape: 3,
      speed: 0.28,
    });
    cabinet.dataset.shaderMounted = "1";
  }

  function boot() {
    // Wait one frame so initLetterSplit has rebuilt the period span.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      mountPeriod();

      const cabinet = document.getElementById("cabinet");
      if (cabinet) {
        if (cabinet.classList.contains("is-open")) {
          mountCabinet();
        } else {
          new MutationObserver((_, obs) => {
            if (cabinet.classList.contains("is-open")) {
              mountCabinet();
              obs.disconnect();
            }
          }).observe(cabinet, { attributes: true, attributeFilter: ["class"] });
        }
      }
    }));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
