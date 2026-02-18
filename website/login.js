"use strict";

// ============================================================
// Constants
// ============================================================

const MIN_PASSWORD_LENGTH = 8;

// Generic message — never reveal whether email or password was wrong
// to prevent user enumeration attacks.
const AUTH_ERROR_MESSAGE =
  "The email or password you entered is incorrect. Please try again.";

const RATE_LIMIT_MESSAGE =
  "Too many sign-in attempts. Please wait a moment before trying again.";

// ============================================================
// Element references
// ============================================================

const form          = document.getElementById("loginForm");
const emailInput    = document.getElementById("email");
const passwordInput = document.getElementById("password");
const toggleBtn     = document.getElementById("togglePassword");
const submitBtn     = document.getElementById("submitBtn");
const btnLabel      = submitBtn.querySelector(".btn__label");
const btnSpinner    = submitBtn.querySelector(".btn__spinner");
const formBanner    = document.getElementById("formBanner");
const formBannerText = document.getElementById("formBannerText");

// ============================================================
// Validation helpers
// ============================================================

function isValidEmail(value) {
  // RFC 5322-inspired pattern — intentionally simple; server validates fully.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getEmailError(value) {
  if (!value.trim()) return "Email address is required.";
  if (!isValidEmail(value)) return "Please enter a valid email address.";
  return "";
}

function getPasswordError(value) {
  if (!value) return "Password is required.";
  if (value.length < MIN_PASSWORD_LENGTH)
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  return "";
}

// ============================================================
// UI helpers
// ============================================================

function setFieldError(groupId, errorId, message) {
  const group = document.getElementById(groupId);
  const error = document.getElementById(errorId);

  if (message) {
    group.classList.add("form__group--error");
    error.textContent = message;
  } else {
    group.classList.remove("form__group--error");
    error.textContent = "";
  }
}

function showBanner(message) {
  formBannerText.textContent = message;
  formBanner.hidden = false;
}

function hideBanner() {
  formBanner.hidden = true;
  formBannerText.textContent = "";
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  btnLabel.textContent = loading ? "Signing in…" : "Sign in";
  btnSpinner.hidden = !loading;
}

// ============================================================
// Inline validation — fires on blur so errors appear after
// the user leaves a field, not while typing.
// ============================================================

emailInput.addEventListener("blur", () => {
  setFieldError("emailGroup", "emailError", getEmailError(emailInput.value));
});

emailInput.addEventListener("input", () => {
  // Clear error as soon as user starts correcting
  if (document.getElementById("emailGroup").classList.contains("form__group--error")) {
    setFieldError("emailGroup", "emailError", getEmailError(emailInput.value));
  }
  hideBanner();
});

passwordInput.addEventListener("blur", () => {
  setFieldError("passwordGroup", "passwordError", getPasswordError(passwordInput.value));
});

passwordInput.addEventListener("input", () => {
  if (document.getElementById("passwordGroup").classList.contains("form__group--error")) {
    setFieldError("passwordGroup", "passwordError", getPasswordError(passwordInput.value));
  }
  hideBanner();
});

// ============================================================
// Password visibility toggle
// ============================================================

toggleBtn.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  toggleBtn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  toggleBtn.setAttribute("aria-pressed", isHidden ? "true" : "false");
  toggleBtn.querySelector(".icon--show").style.display = isHidden ? "none" : "";
  toggleBtn.querySelector(".icon--hide").style.display = isHidden ? "" : "none";
});

// ============================================================
// Form submission
// ============================================================

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideBanner();

  // Validate all fields before submitting
  const emailError    = getEmailError(emailInput.value);
  const passwordError = getPasswordError(passwordInput.value);

  setFieldError("emailGroup",    "emailError",    emailError);
  setFieldError("passwordGroup", "passwordError", passwordError);

  if (emailError || passwordError) {
    // Move focus to the first invalid field
    if (emailError) {
      emailInput.focus();
    } else {
      passwordInput.focus();
    }
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(form.action, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Forward the CSRF token set by the server on page load.
        // Server must validate this header on every state-changing request.
        "X-CSRF-Token": form.querySelector('[name="_csrf"]').value,
      },
      // credentials: "same-origin" ensures cookies (session, CSRF) are sent.
      // Never use credentials: "include" unless cross-origin is explicitly required.
      credentials: "same-origin",
      body: JSON.stringify({
        email:      emailInput.value.trim(),
        password:   passwordInput.value,
        rememberMe: document.getElementById("rememberMe").checked,
      }),
    });

    if (response.ok) {
      // Redirect to the portal dashboard.
      // Using location.replace so the login page is not in browser history.
      window.location.replace("/dashboard");
      return;
    }

    if (response.status === 429) {
      showBanner(RATE_LIMIT_MESSAGE);
      return;
    }

    // 401 Unauthorized or any other failure — show generic error.
    // Never expose whether the email or password was specifically wrong.
    showBanner(AUTH_ERROR_MESSAGE);

  } catch {
    // Network error or server unreachable
    showBanner(
      "We couldn't connect to the server. Please check your connection and try again."
    );
  } finally {
    setLoading(false);
  }
});
