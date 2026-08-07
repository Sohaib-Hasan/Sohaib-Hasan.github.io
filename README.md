# sohaib-hasan.github.io

Personal site for **Sohaib Hasan** — Mathematics Lecturer & Head of Department, and creator of [PlotLab](https://sohaib-hasan.github.io/plotlab.html). Built as a static site on GitHub Pages: no framework, no build step, no dependencies beyond a handful of CDN fonts and three third-party embeds.

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
| JS | Single vanilla `script.js` (nav toggle, current year, etc.), no build tooling |
| Fonts | Fraunces (serif, headings), Inter (sans, body), JetBrains Mono (mono accents) — loaded from Google Fonts |

Only the **blog** (`blog.html`, `_posts/`, `_layouts/post.html`) goes through Jekyll's Liquid + kramdown pipeline. Every other `.html` file has no front matter, so Jekyll copies it to the output untouched — this is deliberate, it keeps the rest of the site simple to edit by hand.

---

## Site structure

```
├── index.html              Home — hero + numbered section previews of every other page
├── about.html               
├── teaching.html            
├── research.html            
├── plotlab.html              "Animations" — PlotLab work
├── notes.html                Notes library (links to /notes PDFs)
├── work-with-me.html         Services: tutoring, animation commissions, custom projects
├── contact.html
├── resources.html            Utility page — noindexed (see robots.txt)
├── viewer.html                Generic PDF viewer utility — noindexed
├── style.css                 All site styling — design tokens at the top
├── script.js                 Nav toggle, footer year, scroll-in animation, etc.
├── sitemap.xml / robots.txt   SEO plumbing
├── googled83bbc5219d8eb40.html   Google Search Console ownership verification
│
├── blog.html                  Blog index (Jekyll — lists posts from _posts)
├── _config.yml                 Jekyll config
├── _layouts/post.html          Single blog-post template (includes KaTeX for math)
├── _posts/                     One Markdown file per post (see workflow below)
│
├── cv/Sohaib-Hasan-CV.pdf
├── notes/                      Downloadable subject notes (PDFs), linked from notes.html
├── images/                     profile.png, og-image.jpg, post diagrams
├── favicon.ico, favicon-*.png, apple-touch-icon.png
└── .github/workflows/link-check.yml   Runs lychee on every push to main, fails on broken links
```

---

## Pages map

| Page | Purpose | Indexed? |
|---|---|---|
| `index.html` | Home — hero, then a numbered teaser of every section (About → Teaching → Research → Animations → Notes → Blog → Newsletter → Work With Me → Contact) | Yes |
| `about.html` | Bio | Yes |
| `teaching.html` | Teaching background | Yes |
| `research.html` | Research & achievements | Yes |
| `plotlab.html` | PlotLab / animation work | Yes |
| `notes.html` | Notes library | Yes |
| `blog.html` | Blog index | Yes |
| `work-with-me.html` | Tutoring, animation commissions, custom projects — each with a mailto CTA | Yes |
| `contact.html` | General contact | Yes |
| `resources.html`, `viewer.html` | Internal utility pages | No (`robots.txt`) |

---

## Design system

Every color and font lives as a CSS custom property at the top of `style.css` — change it once, it updates everywhere.

```css
--board:        #1c2b26   /* base background */
--board-deep:   #12201b   /* darkest surface */
--board-light:  #24382f   /* card / panel background */
--chalk:        #f2ede1   /* primary text */
--chalk-dim:    #b9c2bb   /* secondary text */
--chalk-faint:  #8a9890   /* tertiary / muted text */
--gold:         #e8b04b   /* accent — links, buttons, highlights */
--ink:          #7ca6a8   /* secondary accent — tags, labels */
--line:         rgba(242,237,225,0.12)   /* borders/dividers */
```

Fonts: **Fraunces** for headings (`h1`–`h3`, `.block-title`), **Inter** for body text, **JetBrains Mono** for small mono labels (`.card-tag`, `.block-num`).

Reusable component classes: `.card` / `.card-grid` (project & service cards), `.block` (a numbered homepage/page section), `.btn.primary` (gold CTA button), `.page-header` (top-of-page title block used on every non-home page).

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

Then write normal Markdown below it. A few things specific to this site's setup:

- Code blocks use **three tildes** (`~~~`), not backticks — that's what kramdown (this site's Markdown engine) is configured to expect.
- Math works via KaTeX, already wired into `_layouts/post.html`: use `\[ ... \]` for display math and `\( ... \)` for inline math (not `$$...$$` — the auto-render delimiters are configured specifically for the bracket forms).
- The post's URL is auto-generated from the filename per `permalink: /blog/:title/` in `_config.yml`.

Once the file is pushed to `main`, it appears on `blog.html` automatically at the next successful Pages build.

### Adding a new notes PDF

1. Drop the PDF into `/notes/`.
2. Add a card/link to it on `notes.html` (same pattern as the existing entries).

### Updating the CV

Replace `/cv/Sohaib-Hasan-CV.pdf` with the new file, same filename — every link on the site keeps working.

---

## Integrations

| Service | What it does | Where it lives |
|---|---|---|
| **Cloudflare Web Analytics** | Privacy-friendly visitor analytics (no cookies of its own) | One `<script>` beacon tag before `</body>` on every page |
| **Google Search Console** | Search visibility, indexing, sitemap submission | `googled83bbc5219d8eb40.html` (ownership proof) + `sitemap.xml` |
| **Kit (ConvertKit) newsletter** | Email list signup, independent of social media reach | Embedded form in the "Newsletter" section of `index.html` only |

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

**A page looks fine on desktop but content is missing/invisible on mobile:** check `script.js`'s scroll-in animation (`will-animate` / `in-view` classes). It uses an `IntersectionObserver` with a threshold — very tall elements (long blog posts, especially on narrow mobile viewports where text wraps into many more lines) can fail to ever cross that threshold and stay stuck at `opacity:0`. Long-form article content (`<article class="block">`) is deliberately excluded from this animation for exactly this reason — keep it that way if the pattern is reused elsewhere.

---

## Performance

Current Lighthouse scores (mobile):

| Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|
| 98 | 98 | 100 | 100 |

---

## Roadmap history

Rough build order, for reference:

1. **Core site** — all main pages, dark chalkboard design system, PDF notes library, CV, blog (Jekyll + KaTeX).
2. **Google Search Console** — ownership verification, sitemap submission.
3. **Cloudflare Web Analytics** — visitor tracking, no code footprint beyond one script tag per page.
4. **Work With Me page** — dedicated services page (tutoring, animation commissions, open-ended projects), linked from nav and a homepage teaser section.
5. **Newsletter** — Kit-powered email signup on the homepage, later optimized to lazy-load for privacy/performance.
6. **Mobile scroll-animation fix** — long-form blog posts excluded from the fade-in-on-scroll effect after it was found to leave post bodies stuck invisible on narrow viewports.

---

*Content and code © Sohaib Hasan.*
