# Code Review — Login Form
## Security & Performance Analysis

**Files reviewed:** `index.html`, `styles.css`, `login.js`
**Review date:** 2026-02-18
**Overall assessment:** Solid foundation with good security instincts. Several gaps to address
before production use, none catastrophic. Issues are ranked High / Medium / Low.

---

## Summary Scorecard

| Area | Rating | Notes |
|---|---|---|
| XSS protection | Good | `textContent` used throughout; no `innerHTML` |
| CSRF protection | Partial | Wired correctly, but no guard if token is empty |
| User enumeration | Good | Generic auth error message |
| Input validation | Partial | Missing `maxlength` on both fields |
| Request handling | Needs work | No timeout, no double-submit guard |
| Accessibility | Good | ARIA labels, live regions, focus management |
| Responsive design | Good | Mobile breakpoint, reduced-motion query |
| CSS consistency | Minor issue | One hardcoded color outside design token system |
| JS architecture | Good | `use strict`, clean separation of concerns |

---

## Security Findings

### HIGH — No maximum input length (`index.html` / `login.js`)

**Problem:** Neither the email nor password field has a `maxlength` attribute. An attacker can
submit an arbitrarily long password string. If the server uses bcrypt for hashing (standard
practice), bcrypt has a 72-byte hard limit and silently truncates beyond it — but the CPU work
to hash a 10,000-character string is still significant and can be used for DoS.

**Fix — HTML:**
```html
<!-- Email: 254 is the RFC 5321 maximum -->
<input ... type="email" maxlength="254" />

<!-- Password: 72 matches bcrypt's effective limit; 128 is a safe upper bound -->
<input ... type="password" maxlength="128" />
```

**Fix — JS:** Add a max-length check in `getPasswordError`:
```js
const MAX_PASSWORD_LENGTH = 128;

function getPasswordError(value) {
  if (!value) return "Password is required.";
  if (value.length < MIN_PASSWORD_LENGTH)
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (value.length > MAX_PASSWORD_LENGTH)
    return `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer.`;
  return "";
}
```

---

### HIGH — No fetch timeout (`login.js` line 155)

**Problem:** If the server hangs or responds slowly, the user sees an infinite spinner with no
way to cancel or retry. A 15–30 second timeout is appropriate for an auth endpoint.

**Fix:**
```js
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 15_000);

try {
  const response = await fetch(form.action, {
    signal: controller.signal,
    // ... rest of options
  });
  clearTimeout(timeoutId);
  // ... handle response
} catch (err) {
  if (err.name === "AbortError") {
    showBanner("The request timed out. Please try again.");
  } else {
    showBanner("We couldn't connect to the server. Please check your connection and try again.");
  }
}
```

---

### HIGH — No guard against double submission (`login.js` line 131)

**Problem:** `submitBtn.disabled = true` is set inside `setLoading`, which is called after
validation passes. There is a small but real race window where a fast double-click can fire
two `submit` events before the first `setLoading(true)` disables the button. This can result
in two simultaneous requests to the auth endpoint.

**Fix:** Add a module-level flag to guard against concurrent submissions:
```js
let isSubmitting = false;

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isSubmitting) return;
  // ...
  isSubmitting = true;
  setLoading(true);
  try {
    // ... fetch
  } finally {
    isSubmitting = false;
    setLoading(false);
  }
});
```

---

### MEDIUM — CSRF token is not validated client-side before sending (`login.js` line 161)

**Problem:** The CSRF token hidden input starts empty (`value=""`). If the server fails to
inject it (template error, caching misconfiguration), the fetch will silently send an empty
token. The server will reject the request, but the user gets a confusing error with no
diagnostic path.

**Fix:** Check the token is non-empty before submitting:
```js
const csrfToken = form.querySelector('[name="_csrf"]').value;
if (!csrfToken) {
  showBanner("Session error — please refresh the page and try again.");
  return;
}
```

---

### MEDIUM — Password visible toggle has no auto-hide timeout (`login.js` line 118)

**Problem:** Once the user reveals their password, it stays visible indefinitely. If they walk
away from the screen or share their screen unexpectedly, the password remains in plain text.

**Fix:** Auto-revert to hidden after 30 seconds:
```js
let passwordVisibilityTimer = null;

toggleBtn.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  // ... existing aria/icon updates

  clearTimeout(passwordVisibilityTimer);
  if (isHidden) {
    passwordVisibilityTimer = setTimeout(() => {
      passwordInput.type = "password";
      toggleBtn.setAttribute("aria-label", "Show password");
      toggleBtn.setAttribute("aria-pressed", "false");
      toggleBtn.querySelector(".icon--show").style.display = "";
      toggleBtn.querySelector(".icon--hide").style.display = "none";
    }, 30_000);
  }
});
```

---

### MEDIUM — Missing security headers in comment (`index.html` lines 7–13)

**Problem:** The comment lists four server headers but omits two critical ones:
- `Strict-Transport-Security` (HSTS) — forces HTTPS, prevents SSL stripping attacks
- `Permissions-Policy` — disables browser features the page doesn't use (camera, mic, etc.)

**Fix:** Update the comment:
```html
<!--
  Security headers — set these on the server, not in meta tags.
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  Permissions-Policy: camera=(), microphone=(), geolocation=()
-->
```

---

### LOW — Login page should be excluded from search indexing (`index.html`)

**Problem:** No robots directive. Search engines may index the login page, and it can appear
in site search results. It also leaks that `/api/auth/login` is an endpoint.

**Fix:** Add to `<head>`:
```html
<meta name="robots" content="noindex, nofollow" />
```

---

### LOW — `rememberMe` cookie security (server-side note)

**Problem:** The "remember me" checkbox is sent to the server, but the security of the
resulting long-lived session token depends entirely on server-side cookie configuration.

**Requirement for the server:** Any persistent session cookie set by the remember-me flow
must have all of the following attributes:
- `HttpOnly` — not accessible to JavaScript
- `Secure` — only sent over HTTPS
- `SameSite=Strict` — not sent on cross-site requests
- An explicit, appropriate `Max-Age` (e.g., 30 days = `2592000`)

---

## Performance Findings

### MEDIUM — `document.getElementById` called on every keystroke (`login.js` lines 97, 108)

**Problem:** The `input` event listener for each field calls `document.getElementById` on
every keypress to check the error class. These DOM lookups are redundant — the elements are
already available as module-level constants or can be resolved once.

**Current code:**
```js
emailInput.addEventListener("input", () => {
  if (document.getElementById("emailGroup").classList.contains(...)) { // lookup every keystroke
```

**Fix:** Cache the group elements alongside the other element references at the top of the file:
```js
const emailGroup    = document.getElementById("emailGroup");
const passwordGroup = document.getElementById("passwordGroup");

emailInput.addEventListener("input", () => {
  if (emailGroup.classList.contains("form__group--error")) {
    setFieldError("emailGroup", "emailError", getEmailError(emailInput.value));
  }
  hideBanner();
});
```

---

### MEDIUM — Script should be loaded as a module (`index.html` line 125)

**Problem:** The script is loaded as a classic script, meaning all `const` declarations in
`login.js` are module-level but still technically leak into the global scope under some
bundler configurations. More importantly, a module script is deferred automatically — no
need to place the tag at the end of `<body>` as a workaround.

**Fix:**
```html
<!-- In <head> — no need to place at bottom of body -->
<script type="module" src="login.js"></script>
```

This also enables top-level `await` if needed in future and makes `"use strict"` implicit.

---

### LOW — Hardcoded color outside design token system (`styles.css` line 212)

**Problem:** The hover state for `.form__input` uses a hardcoded hex value that is not defined
as a CSS custom property, breaking the design token consistency established in `:root`.

**Current:**
```css
.form__input:hover:not(:disabled) {
  border-color: #a0aec0;
}
```

**Fix:** Add a token to `:root` and use it:
```css
/* In :root */
--color-border-hover: #a0aec0;

/* In .form__input rule */
.form__input:hover:not(:disabled) {
  border-color: var(--color-border-hover);
}
```

---

### LOW — No `will-change` hint on spinner (`styles.css` line 398)

**Problem:** The `.btn__spinner` runs a continuous CSS `transform` animation. Without a
`will-change` hint, some browsers may animate this on the main thread rather than the
compositor thread, causing jank during the in-flight request period.

**Fix:**
```css
.btn__spinner {
  will-change: transform;
  /* ... existing properties */
}
```

Remove `will-change` once the spinner is hidden to release the compositor layer:
```js
function setLoading(loading) {
  submitBtn.disabled = loading;
  btnLabel.textContent = loading ? "Signing in…" : "Sign in";
  btnSpinner.hidden = !loading;
  btnSpinner.style.willChange = loading ? "transform" : "auto";
}
```

---

### LOW — Redundant `aria-required` attribute (`index.html` lines 47, 68)

**Problem:** Both inputs have both `required` and `aria-required="true"`. Modern screen readers
derive `aria-required` from the native `required` attribute automatically. The explicit
`aria-required` is harmless but unnecessary noise.

**Fix:** Remove `aria-required="true"` from both inputs — `required` alone is sufficient.

---

## Prioritised Fix Order

| Priority | Finding | Effort |
|---|---|---|
| 1 | Add `maxlength` to both inputs | 5 min |
| 2 | Add fetch timeout with `AbortController` | 15 min |
| 3 | Add double-submission guard flag | 5 min |
| 4 | Guard against empty CSRF token | 5 min |
| 5 | Password toggle auto-hide after 30s | 15 min |
| 6 | Add missing security headers to comment | 5 min |
| 7 | Add `noindex` robots meta tag | 2 min |
| 8 | Cache group element references | 5 min |
| 9 | Switch script to `type="module"` | 2 min |
| 10 | Move hardcoded hover color to CSS token | 5 min |
| 11 | Add `will-change` to spinner | 5 min |
| 12 | Remove redundant `aria-required` | 2 min |

---

## What's Already Done Well

- `textContent` used exclusively for dynamic content — no XSS risk from `innerHTML`
- Generic auth error message — no user enumeration
- `credentials: "same-origin"` on fetch — correct
- `location.replace()` on success — login page not in browser history
- `429` handled separately from other auth failures
- Validation fires on `blur`, clears on `input` — correct UX pattern
- `prefers-reduced-motion` media query present
- `focus-visible` used instead of `focus` — no outline flash on mouse click
- Custom checkbox is keyboard-accessible
- `autocomplete` attributes correct on both fields
- Password toggle updates `aria-label` and `aria-pressed` correctly
