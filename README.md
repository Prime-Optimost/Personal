# David Bakyelle — portfolio

A single-page portfolio for David Bakyelle ("Prime"), a BSc Information Technology student at the
University of Energy and Natural Resources, based in Kumasi, Ghana. Built with plain HTML, CSS and
JavaScript: no build step, no dependencies, no framework.

**Concept:** *Prime Meridian.* Ghana sits on the prime meridian and David's handle is Prime, so
the page uses one hairline meridian, survey coordinates, numbered sections and a live Kumasi
clock as its visual language. The full design rationale is in [DESIGN.md](DESIGN.md), and the
build log is in [PROGRESS.md](PROGRESS.md).

---

## Before you publish

The personal content now comes from David's LinkedIn CV and public GitHub repositories. The
remaining items are infrastructure placeholders:

| What | Where | Notes |
| --- | --- | --- |
| Domain | `index.html`, `robots.txt`, `sitemap.xml`, `README.md` | Currently `davidbakyelle.com`. Replace with the real domain. |
| Form endpoint | `index.html` | `data-endpoint=""` on the contact form. |
| AWS credential ID | `index.html`, `cv.html` | Not in the source CV; the site says "available on request". |
| CV portfolio URL | `cv.html` | Uses the same placeholder domain in the Details block. |

A full checklist lives in `PROGRESS.md`.

---

## Preview locally

Any static file server works. Opening `index.html` directly also works, but the contact form and
relative paths behave more like production when served over HTTP.

```powershell
# Python (usually already installed)
python -m http.server 8000

# or Node
npx serve .
```

Then open <http://localhost:8000>.

---

## Deploy

Everything needed is static. No build command, no output directory.

### GitHub Pages

1. Push the folder to a repository.
2. **Settings → Pages → Build and deployment → Deploy from a branch**.
3. Choose `main` and `/ (root)`, then save.

The `.nojekyll` file stops GitHub from running Jekyll, which would otherwise ignore some files.
All asset paths are relative, so a project site at `username.github.io/repo/` works. If you use a
project subpath, the 404 page's absolute links (`/`, `/assets/...`) need the repo prefix or a
custom domain.

### Netlify

Drag the folder onto <https://app.netlify.com/drop>, or connect the repository with:

- Build command: *(leave empty)*
- Publish directory: `.`

`404.html` is picked up automatically.

### Vercel

Import the repository and deploy as a static site:

- Framework preset: **Other**
- Build command: *(leave empty)*
- Output directory: `.`

Or from the CLI: `npx vercel --prod`.

### Custom domain

After pointing the domain at your host, update the canonical, Open Graph and Twitter URLs in
`index.html`, plus `robots.txt` and `sitemap.xml`. They all currently say
`https://davidbakyelle.com/`.

---

## How to update content

### Replace the portrait

The current photo is `assets/img/portrait.jpg` (1200 × 1600, 3:4).

1. Crop to a 3:4 portrait and export as JPEG or WebP, ideally under 250 KB.
2. Save it as `assets/img/portrait.jpg` (or `.webp`).
3. In `index.html`, update the `<img src="assets/img/portrait.jpg" ...>` path and the `alt` text,
   for example `alt="David Bakyelle, photographed in Kumasi"`.
4. Also update the JSON-LD `image` URL and rebuild `assets/img/og-image.png`.

Keep the 3:4 aspect ratio or the frame will crop the image.

### Add or edit a project

Project cards are plain markup inside `.project-grid`. Copy an existing `<article class="project ...">`
block and change:

- `project-no` — the displayed number (`07`)
- `project-type` — `Health tech`, `Web`, `Software`, `Productivity`, `Cloud`
- the inline SVG in `.project-plate` — decorative; any of the existing diagrams can be reused
- `h3`, paragraph and the `.tags` list
- the GitHub URL, and add a second `.project-links a` for a live demo if there is one
- `aria-label`/`.sr-only` text so screen readers know where each link goes

Grid classes control size: `project-lg` (7 columns), `project-sm` (5), `project-third` (4) and
`project-wide` (12, split layout). On tablet they collapse to halves, on phones to full width.

### Update skills

Each skill is one `<li class="skill" data-level="3">`. Valid levels are 1–5 and light up that many
bars. Update the `<span class="sr-only">` text to match ("Working level, 3 of 5"). Keep the levels
honest; employers ask about them.

### Update the timeline or certifications

Timeline entries are `<li class="timeline-item">` with a date, type, title, organisation and an
optional bullet list. Certifications live in two places: the featured AWS card and the
`training-list` beside it.

### Rebuild the CV

`assets/cv/cv.html` is a print stylesheet for A4. Edit it, then generate the PDF:

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --headless=new --disable-gpu --no-pdf-header-footer `
  --virtual-time-budget=7000 `
  --print-to-pdf="assets/cv/David-Bakyelle-CV.pdf" `
  "file:///C:/Users/Prime/personal/assets/cv/cv.html"
```

You can also open the file in a browser and use **Print → Save as PDF** (A4, margins: none,
background graphics on). Keep it to one page if possible.

`cv.html` prints at A4 and collapses to a single readable column below 760px, so it is safe to
open on a phone. The PDF is still the better link to share.

### Activate the contact form

The form works with no backend: it validates, then opens the visitor's mail app with the message
pre-filled. To receive submissions directly:

1. Create a form on [Formspree](https://formspree.io/) (or a similar service).
2. In `index.html`, set the form's `data-endpoint` to the endpoint URL, for example
   `data-endpoint="https://formspree.io/f/abcdwxyz"`.
3. Leave the honeypot field (`#company`) in place.

On success the form shows a confirmation and resets. On failure it tells the visitor to email
directly. There is no data stored anywhere on this site.

---

## Design system

| Token | Value | Use |
| --- | --- | --- |
| `--ground` | `#060a12` | Page background |
| `--surface` | `#0b1220` | Cards, panels |
| `--surface-2` | `#0e1727` | Inputs, art plates |
| `--ink` | `#eef2f8` | Headings and body |
| `--muted` | `#9dabc0` | Secondary copy |
| `--faint` | `#7b8aa0` | Metadata (meets 4.5:1) |
| `--accent` | `#f0a63a` | One accent, used sparingly |
| `--line` | `#1d293c` | Hairlines |

Type: **Archivo** for display and body, **JetBrains Mono** for labels, numbers and coordinates.
Radii are 2 px. Spacing uses `clamp()` so the layout breathes on large screens and tightens on
phones. Motion is CSS plus one `requestAnimationFrame`-throttled scroll listener; everything
respects `prefers-reduced-motion`.

---

## Accessibility and performance notes

- Semantic landmarks, one `h1`, a skip link, visible focus styles and a focus trap in the mobile menu.
- Form fields have labels, inline errors, `aria-invalid`, and a polite live status region.
- Contrast was checked with axe-core at 1440 / 768 / 390 px; body copy, metadata and tags pass AA.
- Decorative SVG art is hidden from assistive technology; the wordmark in the footer is an image,
  not low-contrast text.
- Fonts are self-hosted in `assets/fonts` (two WOFF2 subsets each) and declared in
  `assets/css/fonts.css`, with `font-display: swap` and a preload for the main Archivo file. The
  page does not contact Google Fonts.
- No JavaScript is required to read the page. Reveal animations are additive: without
  `IntersectionObserver`, all content remains visible.

---

## File map

```
index.html                  All page content and metadata
404.html                    Self-contained not-found page
site.webmanifest            Installable icon + theme data
robots.txt, sitemap.xml     Crawler hints
.nojekyll                   GitHub Pages: skip Jekyll
assets/css/styles.css       Tokens, layout, components, responsive, print
assets/js/main.js           Navigation, reveals, clock, copy, form
assets/img/                 Portrait (portrait.jpg), favicon, wordmark, PNG icons, OG image
assets/cv/cv.html           Print source for the CV
assets/cv/David-Bakyelle-CV.pdf
DESIGN.md                   Concept and art direction
PROGRESS.md                 Build log, QA results, next steps
```

---

## Credits

Design and build: David Bakyelle, with an AI pair. Fonts: Archivo and JetBrains Mono (SIL Open
Font License), self-hosted from Google Fonts. No analytics, no trackers, no cookies.
