# Jeffrey Chang — an index

A personal site. Three fonts, one accent, the rest is empty paper.

Single-page, hand-written HTML / CSS / JavaScript. No framework, no build step,
no tracker. Serves directly from GitHub Pages.

## Structure

```
.
├── index.html      five acts: threshold, origin, instruments, currently, reach
├── styles.css      three fonts (Fraunces, Inter Tight, JetBrains Mono), one accent
├── script.js       custom cursor, reveals, two clocks, a console hello
└── README.md       you are here
```

## Run locally

It is a static site. Open `index.html` directly, or run any small server:

```sh
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

GitHub Pages, from the `main` branch root. Anything you push lives at
`https://<username>.github.io/<repo>/` within a minute.

## Credits

Type — [Fraunces](https://fonts.google.com/specimen/Fraunces) by Phaedra Charles
and Devin Carter. [Inter Tight](https://fonts.google.com/specimen/Inter+Tight)
by Rasmus Andersson. [JetBrains Mono](https://www.jetbrains.com/lp/mono/) by
JetBrains.

Words and code — Jeffrey Chang.
