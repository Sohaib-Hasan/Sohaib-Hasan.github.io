# sohaib-hasan.github.io

Personal site for **Sohaib Hasan** — mathematics educator, section leader for Stanford's Probability for AI, and creator of [PlotLab](https://sohaib-hasan.github.io/plotlab.html). Built as a static site on GitHub Pages: no framework, no build step, self-hosted fonts, and three third-party embeds.

**Live site:** https://sohaib-hasan.github.io

---

## Table of contents

- [Tech stack](#tech-stack)
- [Site structure](#site-structure)
- [Pages map](#pages-map)
- [Design system](#design-system)
- [Content workflows](#content-workflows)
  - [Publishing a blog post](#publishing-a-blog-post)
  - [Adding a new notes PDF](#adding-a-new-notes-pdf)
  - [Updating the CV](#updating-the-cv)
- [Integrations](#integrations)
- [Local development](#local-development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Performance](#performance)
- [Roadmap history](#roadmap-history)

---

## Tech stack

| Layer | Choice |
|---|---|
| Hosting | GitHub Pages (user site, served from `main` branch, root) |
| Static site generator | Jekyll (GitHub Pages' built-in build — used **only** for the blog) |
| Markup | Plain HTML5 — every non-blog page is hand-written, no templating |
| Styling | Single hand-written `style.css`, no framework |
| JS | Vanilla `script.js` on every page (nav, counters, filters, video toggles) plus `hero.js` on the home page only (the Fourier-epicycle animation). No libraries, no build tooling |
| Fonts | Self-hosted subset `woff2` files in the repo root (about 80 KB total): Latin Modern Roman / Italic / Caps for headings and labels, a tiny Latin Modern Math subset for symbols in the drawings, Inter for body text. No Google Fonts requests |

Only the **blog** (`blog.html`, `_posts/`, `_layouts/post.html`) goes through Jekyll's Liquid + kramdown pipeline. Every other `.html` file has no front matter, so Jekyll copies it to the output untouched — this is deliberate, it keeps the rest of the site simple to edit by hand.

---

## Site structure

```
├── index.html              Home — hero with the animated Fourier "S", then about, teaching, research, PlotLab, notes, latest blog posts (Liquid; the file starts with empty `---` front matter on purpose)
├── about.html               
├── teaching.html            
├── research.html            
├── plotlab.html              "Animations" — PlotLab work
├── notes.html                Notes library landing page (four folders)
├── notes-mathematics.html    Folder: free course notes (links to /notes PDFs)
├── notes-statistics.html     Folder: statistics notes (empty until the first note is added)
├── notes-stanford-pai.html   Folder: Stanford Probability for AI, one card per week (PDF + video), buttons for Video Animations and PDFs
├── notes-stanford-pai-pdfs.html   Sub-folder: every Stanford PDF as a View / Download card
├── notes-igcse.html          Folder: premium IGCSE packs (Gumroad links)
├── work-with-me.html         Services: tutoring, animation commissions, custom projects
├── contact.html
├── resources.html            Utility page — noindexed (see robots.txt)
├── viewer.html                Generic PDF viewer utility — noindexed
├── style.css                 All site styling — design tokens at the top
├── script.js                 Nav, footer year, stat counters, pointer glow, video toggles, notes filters
├── hero.js                   Home-page hero animation (canvas, pauses when off-screen)
├── font-lm-roman.woff2, font-lm-italic.woff2, font-lm-caps.woff2, font-lm-math.woff2, font-inter.woff2   Self-hosted fonts (keep in the repo root)
├── sitemap.xml / robots.txt   SEO plumbing
├── googled83bbc5219d8eb40.html   Google Search Console ownership verification
│
├── blog.html                  Blog index (Jekyll — lists posts from _posts)
├── _config.yml                 Jekyll config
├── _layouts/post.html          Single blog-post template (includes KaTeX for math)
├── _posts/                     One Markdown file per post (see workflow below)
│
├── cv/Sohaib-Hasan-CV.pdf
├── notes/                      Downloadable notes (PDFs), linked from the notes-*.html folder pages
│   └── stanford-pai/           Weekly Stanford notes: week-1.pdf, week-2.pdf, week-3.pdf, ...
├── images/                     profile.png, og-image.jpg, post diagrams
│   └── blog/                   Square thumbnails for blog posts (see "Publishing a blog post")
├── favicon.ico, favicon-*.png, apple-touch-icon.png
└── .github/workflows/link-check.yml   Runs lychee on every push to main, fails on broken links
```

---

## Pages map

| Page | Purpose | Indexed? |
|---|---|---|
| `index.html` | Home — hero, then a numbered teaser of every section (About → Teaching → Research → Animations → Notes → Blog → Work With Me → Contact) | Yes |
| `about.html` | Bio | Yes |
| `teaching.html` | Teaching background | Yes |
| `research.html` | Research & achievements | Yes |
| `plotlab.html` | PlotLab / animation work | Yes |
| `notes.html` | Notes library landing page with four folder cards | Yes |
| `notes-mathematics.html`, `notes-statistics.html`, `notes-stanford-pai.html`, `notes-igcse.html` | The four notes folders | Yes |
| `notes-stanford-pai-pdfs.html` | PDFs sub-folder inside the Stanford folder | Yes |
| `blog.html` | Blog index | Yes |
| `work-with-me.html` | Tutoring, animation commissions, custom projects — each with a mailto CTA | Yes |
| `contact.html` | General contact | Yes |
| `resources.html`, `viewer.html` | Internal utility pages | No (`robots.txt`) |

---

## Design system

**Concept:** a chalkboard drawn like a Manim scene and typeset like a LaTeX paper. Deep green board, gold / Manim-blue / teal accents, Latin Modern headings, Inter body text. One memorable moment (the hero animation); everything else is quiet.

Every color and font lives as a CSS custom property at the top of `style.css`:

```css
--bg:          #0f1b17   /* page background */
--bg-deep:     #0a1310   /* darkest surface */
--surface:     #172620   /* card / panel background */
--chalk:       #f3eee2   /* primary text */
--chalk-dim:   #c1cbc3   /* secondary text */
--chalk-faint: #97a89d   /* tertiary / muted text */
--gold:        #ecb44e   /* accent: buttons, links, highlights */
--blue:        #58c4dd   /* Manim blue: curves in drawings */
--teal:        #5cd0b3   /* secondary drawing colour */
--ink:         #8dbabc   /* labels, small-caps eyebrows */
```

Fonts: `--f-display` (Latin Modern Roman, headings), `--f-caps` (Latin Modern Caps, small labels, written lowercase and rendered as small caps), `--f-body` (Inter). Each has a metric-matched fallback `@font-face`, so nothing jumps while the font files load.

Reusable pieces: `.block` + `.block-head` / `.block-title` (a page section), `.card` / `.card-grid`, `.folder-card`, `.post-row`, `.btn.primary` (gold CTA), `.page-header` (title block of every sub-page), `.page-art` (the animated math drawing inside a sub-page header: pure inline SVG + CSS, with a small caption and a glowing tracer dot; beside the title on screens 1100 px and wider, below the intro text on tablets and phones), `.site-footer`.

**Page transitions:** a "circle reveal". When you click a link to another page on the site, the new page opens inside a circle that grows from the exact spot you clicked, with a thin gold edge and a soft glow, while the old page sinks back and fades. The logo and menu button stay in place, then the new page's text rises in. It uses the browser's built-in cross-page View Transitions (Chrome, Edge, Safari), so it is smooth and costs almost nothing: `@view-transition` and the `vt-*` rules in `style.css`, a one-line script in the `<head>` of every page that passes the click point to the CSS (`--vx`, `--vy`, `--vr`), and a hidden `<i class="vt-ring">` element after `<body>` that draws the gold edge. Browsers without it (Firefox) get a short fade instead (`script.js`). It is skipped for `prefers-reduced-motion` users, PDFs, downloads, links that open a new tab and Ctrl/Cmd-clicks; the back and forward buttons use a quick cross-fade. To make it slower or faster change `--vt-time` (default `.9s`) in `style.css`. Pages are also prefetched when you hover a link, so they open instantly.

**Type scale:** headings were tuned to stay calm. The home name is `clamp(3rem, 6.1vw, 5.3rem)` and stays on one line on every phone; sub-page titles are `clamp(2.2rem, 4.9vw, 3.7rem)`. Change these two lines in `style.css` (`.hero h1`, `.page-header h1`) if you want them bigger or smaller.

**Accessibility:** every page has a skip link and a `<main id="main">` landmark, headings run in order, in-text links are underlined, and everything respects `prefers-reduced-motion`. An axe-core audit of all pages came back with 0 violations.

---

## Content workflows

### Publishing a blog post

No HTML editing needed. Add one Markdown file to `_posts/`, named:

```
YYYY-MM-DD-your-title.md
```

The date in the filename **is** the publish date. Front matter is just:

```
---
layout: post
title: "Your Post Title Here"
---
```

**Optional thumbnail.** To show a square (1:1) thumbnail next to the post's title on the blog page, upload an image to `/images/blog/` and add one line to the front matter:

```
---
layout: post
title: "Your Post Title Here"
thumbnail: /images/blog/your-post.png
---
```

Use a square image, resized to about **480 x 480 px and saved as a JPEG under ~100 KB**. A 2 MB original makes the blog page slow, because every thumbnail is downloaded. The file name in the front matter must match the uploaded file **exactly**, letter for letter (`Blog-aug7.jpg` is not `Blog-7aug.jpg`, and `.png` is not `.jpg`). Any other shape still works, because the blog page crops it to a centred square. A post with no `thumbnail` line shows the site icon (`/apple-touch-icon.png`) instead, so the list always stays aligned. The thumbnail appears only on the blog index and the home page, not on the post page itself.

Then write normal Markdown below it. A few things specific to this site's setup:

- Code blocks use **three tildes** (`~~~`), not backticks — that's what kramdown (this site's Markdown engine) is configured to expect.
- Math works via KaTeX, already wired into `_layouts/post.html`: use `\[ ... \]` for display math and `\( ... \)` for inline math (not `$$...$$` — the auto-render delimiters are configured specifically for the bracket forms).
- The post's URL is auto-generated from the filename per `permalink: /blog/:title/` in `_config.yml`.

Once the file is pushed to `main`, it appears on `blog.html` automatically at the next successful Pages build.

### Adding a new notes PDF

1. Drop the PDF into `/notes/`.
2. Add a card/link to it on the matching folder page (`notes-mathematics.html` or `notes-statistics.html`), copying the pattern of the existing cards. `notes-statistics.html` has the card template in an HTML comment.

### Adding a Stanford Probability for AI week

1. Upload the week's notes PDF to `/notes/stanford-pai/` as `week-N.pdf` (for example `week-4.pdf`).
2. Open `notes-stanford-pai.html`, copy one whole `<article class="week-card">` block, paste it at the bottom of the list, and change the week number, title, description, the two file names, and `data-video`.
3. `data-video` takes a YouTube link or just the 11-character video ID. Leave it empty and the button reads "Video coming soon". The player only loads when a visitor clicks it.
4. Add a matching card for the same PDF on `notes-stanford-pai-pdfs.html` (copy an existing card and change the tag, title, description and file names).

Upload the PDF in the same commit as the page: the link checker runs on every push and fails on a link to a file that does not exist yet.

### Where to upload files

| What | Upload to | File name |
|---|---|---|
| Stanford weekly notes (PDF) | `notes/stanford-pai/` | `week-1.pdf`, `week-2.pdf`, `week-3.pdf`, `week-4.pdf`, ... |
| Blog post thumbnails (square) | `images/blog/` | the name written in that post's `thumbnail:` line, see the table below |
| Other course notes (PDF) | `notes/` | any name, then add a card on the matching folder page |

Blog thumbnail names (already written into each post's front matter, `.png` or `.jpg` both work):

| Post | File name |
|---|---|
| Inside the AIMO3 pipeline (Aug 7) | `aimo3-pipeline` |
| Classroom AI assistant (Aug 19) | `classroom-ai-assistant` |
| 40,000 Facebook followers (Sep 1) | `facebook-40k-followers` |
| Prediction apps / linear regression (Oct 18) | `linear-regression-apps` |
| Stanford Probability for AI (Oct 24) | `stanford-probability-for-ai` |

Until a file is uploaded, that post simply shows the site icon.

### Link preview image

The picture that appears when the site link is pasted into WhatsApp, LinkedIn, Facebook and similar apps is `images/og-image.jpg` (1200 x 630 px). Every page points to it as `og-image.jpg?v=2`. When you replace the picture, also bump the number in all pages (`?v=3`), otherwise those apps keep showing the old cached one:

```
sed -i 's/og-image.jpg?v=2/og-image.jpg?v=3/g' *.html _layouts/post.html
```

Then ask Facebook's Sharing Debugger and LinkedIn's Post Inspector to fetch the page again.

### Updating the CV

Replace `/cv/Sohaib-Hasan-CV.pdf` with the new file, same filename — every link on the site keeps working.

---

## Integrations

| Service | What it does | Where it lives |
|---|---|---|
| **Cloudflare Web Analytics** | Privacy-friendly visitor analytics (no cookies of its own) | One `<script>` beacon tag before `</body>` on every page |
| **Google Search Console** | Search visibility, indexing, sitemap submission | `googled83bbc5219d8eb40.html` (ownership proof) + `sitemap.xml` |
| **Kit (ConvertKit) newsletter** | Email list signup, independent of social media reach | Embedded form at the bottom of each blog post (`_layouts/post.html`). Removed from the home page in Oct 2026 |

The Kit script is **lazy-loaded** — it only fetches `ck.5.js` when a visitor actually interacts with the form (hover, tap, or focus), not on page load. This was a deliberate fix: loading it eagerly caused a third-party cookie (`__cf_bm`, set by Cloudflare on Kit's CDN) that Lighthouse flagged under Best Practices. Deferring the load to real interaction keeps the automated audit clean without changing anything for actual subscribers.

---

## Local development

This is a Jekyll site, so it can be previewed locally with Jekyll installed (Ruby required):

```bash
bundle exec jekyll serve
```

This only really matters for testing blog changes — every other page is static HTML and can just be opened directly in a browser.

---

## Deployment

Pushing to `main` triggers GitHub Pages' built-in Jekyll build automatically — no CI/CD config needed beyond that. Changes have mostly been pushed via GitHub's web "Add file → Upload files" flow rather than `git push` from a local clone; both work identically since Pages only cares about what lands on `main`.

Separately, `.github/workflows/link-check.yml` runs [lychee](https://github.com/lycheeverse/lychee-action) on every push to `main` and fails the check if it finds a broken link anywhere in the `.html` files (a few known-flaky external domains — LinkedIn, Instagram, Facebook, Google Drive, Gumroad, `tel:` links — are excluded from the check).

## Troubleshooting

**A push succeeded but the live site didn't change:** this has happened before — GitHub Pages can stop rebuilding for several commits in a row, so the source is correct but the live site stays on an old build. `git push` (or a web upload) succeeding only means GitHub *received* the commit, not that Pages successfully rebuilt from it. After any deploy, spot-check the **live URL** itself, not just the repo.

Where to look if this happens again:
1. Repo → **Settings → Pages** — a red/yellow banner shows the last build error, if any.
2. Repo homepage → right sidebar → **Environments / github-pages** — shows deployment history and logs.
3. The GitHub-linked email inbox (check spam) — GitHub emails a "Page build failure" notice automatically when a build fails.
4. If nothing points to an error, a trivial re-commit (even a one-character edit) usually forces a fresh rebuild attempt.

**I changed `style.css` or `script.js` but the live site still looks old:** the pages load them as `/style.css?v=5`, `/script.js?v=5` and `/hero.js?v=5`. Browsers cache those files for a while. After a CSS or JS change, bump the number (`?v=6`, `?v=7`, ...) in every HTML file, including `_layouts/post.html`. A hard refresh on your own device (Ctrl+Shift+R) also works.

**Text suddenly shows in Georgia or a system font:** the five `font-*.woff2` files (roman, italic, caps, inter and the tiny `font-lm-math.woff2` used for Greek letters, ∫ and ∩ inside the drawings) must sit in the repo root next to `index.html`. If one is missing, the browser falls back to a similar-sized system font.

**Content missing on mobile:** the redesign no longer hides anything until it scrolls into view (the old `will-animate` effect was removed), so missing content is a markup problem. Open the page in the browser's mobile view and check the HTML.

---

## Performance

The redesign was built to stay light:

- **Fonts:** five subset `woff2` files (about 83 KB; the math one is 2.7 KB and only downloads when a drawing needs a Greek letter), only the two used above the fold are preloaded, `font-display:swap`, metric-matched fallbacks (no layout shift).
- **JS:** `script.js` is about 7 KB and `hero.js` loads on the home page only. Nothing runs while it is off-screen: the hero animation pauses outside the viewport and when the tab is hidden, scroll handlers are passive and `requestAnimationFrame`-throttled.
- **CSS:** one stylesheet (about 12 KB gzipped). Icons are CSS masks, the background is a single static layer, effects use `transform` and `opacity` only.
- **Sub-page drawings:** inline SVG, drawn once with CSS and a few finite SMIL tracer dots, no libraries and no extra requests. The only JS is a few lines of pointer parallax on desktop.
- **Page transition and reveals:** native View Transitions (no JS animation), scroll reveals use native scroll-driven animation where the browser supports it (nothing is hidden where it does not), and everything is switched off for `prefers-reduced-motion`.
- **Local test numbers** (Chromium, mobile viewport, 4x CPU throttle): LCP about 0.4 s, CLS 0, no console errors.

These are local numbers. After each deploy, run Lighthouse on the live URL and compare.

---

## Roadmap history

Rough build order, for reference:

1. **Core site** — all main pages, dark chalkboard design system, PDF notes library, CV, blog (Jekyll + KaTeX).
2. **Google Search Console** — ownership verification, sitemap submission.
3. **Cloudflare Web Analytics** — visitor tracking, no code footprint beyond one script tag per page.
4. **Work With Me page** — dedicated services page (tutoring, animation commissions, open-ended projects), linked from nav and a homepage teaser section.
5. **Newsletter** — Kit-powered email signup on the homepage, later optimized to lazy-load for privacy/performance.
6. **Mobile scroll-animation fix** — long-form blog posts excluded from the fade-in-on-scroll effect after it was found to leave post bodies stuck invisible on narrow viewports.
7. **Redesign (Oct 2026)** — new design system (Latin Modern + Inter, self-hosted), animated Fourier hero, new home layout, per-page math drawings, new footer, accessibility pass (skip link, landmarks, heading order). The old scroll-in animation was removed.
8. **Polish pass (Nov 2026)** — calmer type scale, one-line home name on phones, circle-reveal page transitions, arch-framed portrait, richer captioned drawings with tracers on every page and every screen size.

---

*Content and code © Sohaib Hasan.*
