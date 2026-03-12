"use strict";

// ============================================================
// Constants
// ============================================================

const MIN_PASSWORD_LENGTH = 8;

const RATE_LIMIT_MESSAGE =
  "Too many requests. Please wait a moment before trying again.";

const GENERIC_ERROR_MESSAGE =
  "Something went wrong. Please try again.";

// ============================================================
// Element references
// ============================================================

const form                = document.getElementById("registerForm");
const fullNameInput       = document.getElementById("fullName");
const emailInput          = document.getElementById("email");
const passwordInput       = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const toggleBtn           = document.getElementById("togglePassword");
const toggleConfirmBtn    = document.getElementById("toggleConfirmPassword");
const submitBtn           = document.getElementById("submitBtn");
const btnLabel            = submitBtn.querySelector(".btn__label");
const btnSpinner          = submitBtn.querySelector(".btn__spinner");
const formBanner          = document.getElementById("formBanner");
const formBannerText      = document.getElementById("formBannerText");
const successMessage      = document.getElementById("successMessage");

// ============================================================
// Validation helpers
// ============================================================

function isValidEmail(value) {
  // RFC 5322-inspired pattern — intentionally simple; server validates fully.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getFullNameError(value) {
  if (!value.trim()) return "Full name is required.";
  return "";
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

function getConfirmPasswordError(value) {
  if (!value) return "Please confirm your password.";
  if (value !== passwordInput.value) return "Passwords do not match.";
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
  btnLabel.textContent = loading ? "Submitting…" : "Request access";
  btnSpinner.hidden = !loading;
}

// ============================================================
// Inline validation — fires on blur so errors appear after
// the user leaves a field, not while typing.
// ============================================================

fullNameInput.addEventListener("blur", () => {
  setFieldError("fullNameGroup", "fullNameError", getFullNameError(fullNameInput.value));
});

fullNameInput.addEventListener("input", () => {
  if (document.getElementById("fullNameGroup").classList.contains("form__group--error")) {
    setFieldError("fullNameGroup", "fullNameError", getFullNameError(fullNameInput.value));
  }
  hideBanner();
});

emailInput.addEventListener("blur", () => {
  setFieldError("emailGroup", "emailError", getEmailError(emailInput.value));
});

emailInput.addEventListener("input", () => {
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
  // Re-validate confirm field if it already has an error, since the reference value changed
  if (document.getElementById("confirmPasswordGroup").classList.contains("form__group--error")) {
    setFieldError("confirmPasswordGroup", "confirmPasswordError", getConfirmPasswordError(confirmPasswordInput.value));
  }
  hideBanner();
});

confirmPasswordInput.addEventListener("blur", () => {
  setFieldError("confirmPasswordGroup", "confirmPasswordError", getConfirmPasswordError(confirmPasswordInput.value));
});

confirmPasswordInput.addEventListener("input", () => {
  if (document.getElementById("confirmPasswordGroup").classList.contains("form__group--error")) {
    setFieldError("confirmPasswordGroup", "confirmPasswordError", getConfirmPasswordError(confirmPasswordInput.value));
  }
  hideBanner();
});

// ============================================================
// Password visibility toggles
// ============================================================

toggleBtn.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  toggleBtn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  toggleBtn.setAttribute("aria-pressed", isHidden ? "true" : "false");
  toggleBtn.querySelector(".icon--show").style.display = isHidden ? "none" : "";
  toggleBtn.querySelector(".icon--hide").style.display = isHidden ? "" : "none";
});

toggleConfirmBtn.addEventListener("click", () => {
  const isHidden = confirmPasswordInput.type === "password";
  confirmPasswordInput.type = isHidden ? "text" : "password";
  toggleConfirmBtn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  toggleConfirmBtn.setAttribute("aria-pressed", isHidden ? "true" : "false");
  toggleConfirmBtn.querySelector(".icon--show").style.display = isHidden ? "none" : "";
  toggleConfirmBtn.querySelector(".icon--hide").style.display = isHidden ? "" : "none";
});

// ============================================================
// Form submission
// ============================================================

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideBanner();

  // Validate all fields before submitting
  const fullNameError       = getFullNameError(fullNameInput.value);
  const emailError          = getEmailError(emailInput.value);
  const passwordError       = getPasswordError(passwordInput.value);
  const confirmPasswordError = getConfirmPasswordError(confirmPasswordInput.value);

  setFieldError("fullNameGroup",       "fullNameError",       fullNameError);
  setFieldError("emailGroup",          "emailError",          emailError);
  setFieldError("passwordGroup",       "passwordError",       passwordError);
  setFieldError("confirmPasswordGroup", "confirmPasswordError", confirmPasswordError);

  if (fullNameError || emailError || passwordError || confirmPasswordError) {
    // Move focus to the first invalid field
    if (fullNameError) {
      fullNameInput.focus();
    } else if (emailError) {
      emailInput.focus();
    } else if (passwordError) {
      passwordInput.focus();
    } else {
      confirmPasswordInput.focus();
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
        fullName: fullNameInput.value.trim(),
        email:    emailInput.value.trim(),
        password: passwordInput.value,
      }),
    });

    if (response.ok) {
      form.hidden = true;
      successMessage.hidden = false;
      return;
    }

    if (response.status === 429) {
      showBanner(RATE_LIMIT_MESSAGE);
      return;
    }

    showBanner(GENERIC_ERROR_MESSAGE);

  } catch {
    // Network error or server unreachable
    showBanner(
      "We couldn't connect to the server. Please check your connection and try again."
    );
  } finally {
    setLoading(false);
  }
});
