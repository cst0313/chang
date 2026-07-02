# Image-generation prompt pack — jeffreychang / "an index"

These prompts are written for any capable image model (Midjourney v6+, Flux, DALL·E 3,
Imagen). They are engineered for THIS site's pipeline, not for standalone wall art.

## How the site consumes images (read before generating)

Every image is post-processed by CSS before a visitor sees it:

- converted to grayscale (`filter: grayscale(1)`)
- blended into cream paper with `mix-blend-mode: multiply` at 20–35% opacity
- edge-masked with radial + linear gradients that dissolve into `#F4EFE6`

Therefore:

1. **Tonal contrast is everything; color is irrelevant.** A muddy mid-gray image
   disappears. Strong darks against pale grounds survive.
2. **Compose for dissolving edges.** Subject mass in the center or lower third;
   edges should already trail off toward pale/white. Avoid frames, borders, vignettes
   that darken corners.
3. **Texture must read as paper, not photo gloss.** Ask for lithograph, etching,
   ink-wash, engraving, silver-gelatin grain — never HDR, never glossy 3D render.
4. **No text, no watermarks, no signatures** — add this to every negative prompt.

## Global style block (append to every prompt)

> monochrome ink on warm cream paper, antique lithograph / etching texture,
> heavy paper grain, high tonal contrast, edges dissolving into pale blank paper,
> generous negative space, editorial book-plate composition, quiet and precise,
> no text, no watermark, no border, no frame
> — negative: color, HDR, glossy, 3D render, cartoon, low contrast, dark corners,
> vignette, text, watermark, signature, busy background

Aspect ratios: backgrounds 16:9 or 3:2 at ≥1600px wide; portrait accents 4:5.

---

## 01 · Threshold (hero background — replaces `city-fog.jpg`)

**Prompt:** Hong Kong island skyline seen from Victoria Peak at dawn, towers
piercing through a sea of low fog, only the tallest silhouettes visible, two tiny
birds crossing the empty sky, rendered as a fine 19th-century lithograph in black
ink on cream paper, upper two-thirds almost blank paper, fog dissolving the city
into the page + global style block. — 16:9

**Role:** sits behind the name at 20% opacity. The blank upper region is where
"Jeffrey Chang." lands — keep it near-empty.

## 02 · Origin (background — replaces `harbour-fog.jpg`)

**Prompt:** A single Star Ferry crossing Victoria Harbour in dense morning fog,
water rendered in fine etched horizontal strokes, the far shore barely suggested,
boat small and low in the frame, vast pale sky, antique maritime engraving in ink
on cream paper + global style block. — 3:2

**Role:** the literal harbour meeting the literal city, behind the headline that
says it. Boat lower-left or lower-center; everything above midline near-blank.

## 03 · Instruments — one plate per instrument (inline accents or hover reveals)

These work as small book-plates (4:5) that could appear beside each numbered entry
or as full-width transition strips (16:9, subject low, 70% blank paper).

**I. Olympiads:** Three overlapping hand-drawn geometric constructions on cream
paper — a compass-drawn circle proof, a physics vector diagram of a projectile,
and a flowchart of nested branching paths — drawn in one continuous confident pen
line, schoolbook marginalia style + global style block.

**II. NVIDIA at seventeen:** A dense field of fine parallel flow-lines bending
around an invisible obstacle, like a fluid simulation etched by hand, one thin
line diverging and highlighted, Victorian scientific-plate engraving + global
style block. *(This is the site's only permitted blue accent: if the model
supports spot color, allow ONE line in deep marine blue #1F3E5C; otherwise pure
monochrome.)*

**III. Project Oyster:** Ocean swell seen from above in fine etched line-work,
wind direction shown as faint hatched arrows, one region of the sea where the wave
lines visibly compress and flatten, drawn like an antique admiralty chart's sea
texture + global style block.

**IV. Quantum chess:** A single chess knight rendered twice on the same square —
one solid ink, one dissolving into fine stipple dots that scatter across the empty
board, etched chessboard fading to blank paper at the edges + global style block.

**V. Price of weather:** A barometer and a column of coins merged into one
instrument, drawn as a cutaway technical illustration from a Victorian economics
textbook, fine cross-hatching, floating on blank paper + global style block.

**VI. 0.1% doors:** A long corridor of identical closed doors receding to a
vanishing point, etched in fine line, only the nearest door ajar with light
spilling out as blank unprinted paper + global style block.

**VII. Zürich:** The ETH Zürich main building silhouette above the Limmat,
Swiss Alps as two faint etched lines on the horizon, mostly blank sky, tiny tram
crossing lower frame, alpine crispness, engraved postcard style + global style
block.

## 04 · Method (section background, extremely faint)

**Prompt:** A sheet of hand-drawn geometric constructions — circles, crosshairs,
a sine wave, a target grid, a cancelled circle — scattered like a mathematician's
worksheet, extremely light pencil-gray ink on cream, as if seen through tracing
paper + global style block. — 16:9, will run at ~10% opacity.

## 05 · Currently (background strip)

**Prompt:** A mountain ridgeline trail at dawn drawn in one continuous thin ink
line, a single tiny runner silhouette mid-ridge, sea visible far below on one
side, vast blank sky above, Chinese landscape-painting economy of line meets
European etching + global style block. — 21:9 wide strip, subject in lower third.

## 06 · Reach (background, near-invisible)

**Prompt:** Open water horizon with faint etched wave lines fading to nothing,
a single small lighthouse beam drawn as two straight unprinted rays across the
paper, 90% blank cream paper + global style block. — 16:9, runs at ~12% opacity.

## 07 · Cabinet (hidden section — reward image)

**Prompt:** An opened antique specimen cabinet drawn in fine ink, its drawers
containing not specimens but tiny etched instruments — a chess knight, a wave
gauge, a neural lattice, a running shoe — one drawer still closed with a small
keyhole, Victorian natural-history plate style + global style block. — 4:5.

---

## Integration notes (for whoever wires these in)

- Export/downscale to ≤1600px wide, JPEG q80 + WebP q82, target <150KB each.
- Keep the CSS treatment: `grayscale(1) contrast(1.05)`, multiply blend,
  20–35% opacity, radial + linear cream masks (see `.act-origin::before/::after`
  in `styles.css` for the reference implementation).
- Do not exceed two background images per viewport height — the paper must win.
- If an image arrives with dark corners, mask harder or regenerate; the dissolve
  into `#F4EFE6` is what makes the page feel printed rather than decorated.
