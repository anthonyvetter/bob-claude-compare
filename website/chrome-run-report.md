# Chrome Run Report — Login Form
## Lighthouse Audit Results

**Test date:** 2026-02-18
**Tested URL:** http://localhost:8765/ (Python HTTP server, static files)
**Tool:** Lighthouse (via npx), headless Chrome
**Page:** `index.html`

---

## Lighthouse Scores

| Category | Score |
|---|---|
| Performance | 100 / 100 |
| Accessibility | 92 / 100 |
| Best Practices | 96 / 100 |
| SEO | 90 / 100 |

Performance is perfect. Three categories have actionable failures detailed below.

---

## Failures & Warnings

### [FAIL] Console Error — Missing favicon
**Category:** Best Practices
**Severity:** Low

Chrome logged a 404 error on page load:
```
Failed to load resource: the server responded with a status of 404 (File not found)
http://localhost:8765/favicon.ico
```
Browsers automatically request `/favicon.ico`. Without one, every page load produces a
console error and a wasted network request.

**Fix:** Add a favicon. Minimal approach — add a 32×32 `.ico` or `.png` file and link it:
```html
<link rel="icon" href="/favicon.ico" sizes="32x32" />
```

---

### [FAIL] Color Contrast — 5 elements below WCAG AA threshold
**Category:** Accessibility
**Severity:** High — WCAG 2.1 violation (Success Criterion 1.4.3)

The WCAG AA standard requires a minimum contrast ratio of **4.5:1** for normal text.
Lighthouse measured the following failures, all using brand blue `#4f6ef7` on white `#ffffff`
(actual ratio: **4.28:1** — just short of the requirement):

| Element | Selector | Actual Ratio | Required |
|---|---|---|---|
| Logo "CP" text | `div.logo` | 4.28:1 | 4.5:1 |
| Subtitle "Customer Portal" | `p.card__subtitle` | 2.97:1 | 4.5:1 |
| "Forgot password?" link | `a.form__link` (in password row) | 4.28:1 | 4.5:1 |
| "Sign in" button label | `button#submitBtn span.btn__label` | 4.28:1 | 4.5:1 |
| "Request access" link | `a.form__link` (in footer) | 4.28:1 | 4.5:1 |

The subtitle is the worst offender at 2.97:1 — it uses `--color-text-muted: #8a97a5`
on white, which fails comfortably.

**Fix:** Darken the brand blue and the muted text token in `styles.css`:

```css
:root {
  /* Darken from #4f6ef7 to #3d5ce6 — passes at 4.6:1 on white */
  --color-border-focus: #3d5ce6;
  --color-text-link:    #3d5ce6;
  --color-btn-bg:       #3d5ce6;
  --color-btn-hover:    #2d4dd4;
  --color-btn-active:   #2040c2;
  --color-logo-bg:      #3d5ce6;

  /* Darken from #8a97a5 to #6b7d8f — passes at 4.6:1 on white */
  --color-text-muted: #6b7d8f;
}
```

Verify with a contrast checker (e.g., WebAIM Contrast Checker) after any color change.

---

### [FAIL] Link in Text Block — "Request access" not distinguishable without color
**Category:** Accessibility
**Severity:** Serious — WCAG 2.1 violation (Success Criterion 1.4.1)

The "Request access" link in the card footer sits inline with surrounding grey text.
Lighthouse flagged two issues with it:
1. The contrast between the link color (`#4f6ef7`) and the surrounding text color
   (`#5a6a7a`) is only **1.29:1** — far below the 3:1 minimum for distinguishing links
   from body text by color alone.
2. The link has no underline or other non-color visual indicator.

Users who cannot distinguish colors have no way to identify this as a link.

**Fix:** Add a persistent underline to inline links in body text, and ensure sufficient
contrast between the link and surrounding text after the color fix above:

```css
/* In styles.css — scope to footer context only */
.card__footer a {
  text-decoration: underline;
  text-underline-offset: 2px;
}
```

---

### [FAIL] Missing Meta Description
**Category:** SEO
**Severity:** Low-Medium

The page has no `<meta name="description">` tag. This is less critical for a login page
than for public-facing pages, but it is still flagged.

**Fix:** Add to `<head>` in `index.html`:
```html
<meta name="description" content="Sign in to the Customer Portal to access your account, documents, and dashboard." />
```

Note: The `noindex` recommendation from the code review (preventing search engines from
indexing the login page) is still valid and should be added alongside this.

---

### [WARN] Render-Blocking Requests — `login.js` and `styles.css`
**Category:** Performance
**Estimated savings:** 280ms

Lighthouse flagged both resources as render-blocking. This means the browser cannot paint
anything until both files are downloaded and processed.

| Resource | Size | Blocked for |
|---|---|---|
| `login.js` | 6.7 KB | 301ms |
| `styles.css` | 9.5 KB | 151ms |

**For CSS:** Render-blocking is expected and largely unavoidable for a stylesheet that
controls layout. The 151ms cost is acceptable on a login page. No change needed unless
there is evidence of real-world paint delay.

**For JS:** This is addressable. Switching to `type="module"` (already recommended in
the code review) makes the script deferred by default, eliminating the 301ms block:

```html
<!-- In <head> instead of bottom of <body> -->
<script type="module" src="login.js"></script>
```

---

### [WARN] Unminified CSS and JavaScript
**Category:** Performance
**Estimated savings:** ~3 KB each (6 KB total)

The raw source files are served directly. For a production deployment, both should be
passed through a minifier.

**Fix:** Use a build step (esbuild, Vite, or a simple npm script) to minify before
deploying. Example with esbuild:
```bash
npx esbuild login.js --minify --outfile=login.min.js
npx esbuild styles.css --minify --outfile=styles.min.css
```

For a login page of this size, the impact is minor (~6 KB uncompressed), but it is
standard practice for any production deployment.

---

### [WARN] Cache Lifetime — Static assets not cached
**Category:** Performance
**Estimated savings:** 16 KB per repeat visit

The Python development server does not set `Cache-Control` headers. In production, static
assets (`styles.css`, `login.js`) should be cached aggressively since they change only on
deployment.

**Fix (server-side):** Set the following response header for CSS and JS assets:
```
Cache-Control: public, max-age=31536000, immutable
```
Use content-hashed filenames (e.g., `login.a3f9c2.js`) so cache-busting happens
automatically on deployment.

---

## Summary of Fixes

| Priority | Issue | File | Fix |
|---|---|---|---|
| 1 | Color contrast failures (5 elements) | `styles.css` | Darken `--color-btn-bg` and related tokens |
| 2 | Link not distinguishable by non-color cue | `styles.css` | Add underline to `.card__footer a` |
| 3 | `login.js` is render-blocking | `index.html` | Switch to `<script type="module">` in `<head>` |
| 4 | Missing favicon (console 404) | New file + `index.html` | Add `favicon.ico` and `<link rel="icon">` |
| 5 | Missing meta description | `index.html` | Add `<meta name="description">` |
| 6 | Unminified assets | Build step | Add minification to deployment pipeline |
| 7 | No cache headers | Server config | Set `Cache-Control` headers in production server |

---

## What Passed

- Performance score: **100 / 100** — no issues
- No JavaScript errors from application code
- Semantic HTML structure correct
- All interactive elements are keyboard accessible
- ARIA labels and live regions are functioning
- Form labels correctly associated with inputs
- Responsive layout renders correctly at mobile viewport
- `prefers-reduced-motion` respected
