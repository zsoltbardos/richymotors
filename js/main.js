(function () {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");
  const navLinks = document.querySelectorAll(".site-nav a, .footer-nav a");
  const form = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");
  const formSubmit = document.getElementById("form-submit");
  const accessKeyInput = document.getElementById("form-access-key");
  const yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  if (accessKeyInput && window.RICHY_CONFIG) {
    accessKeyInput.value = window.RICHY_CONFIG.web3formsAccessKey || "";
  }

  function closeNav() {
    siteNav?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Open menu");
  }

  navToggle?.addEventListener("click", () => {
    const open = siteNav?.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (link.getAttribute("href")?.startsWith("#")) closeNav();
    });
  });

  document.addEventListener("click", (e) => {
    if (!siteNav?.classList.contains("is-open")) return;
    if (header?.contains(e.target)) return;
    closeNav();
  });

  function showFormStatus(message, type) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = "form-status " + type;
    formStatus.classList.remove("hidden");
  }

  function hideFormStatus() {
    formStatus?.classList.add("hidden");
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateForm() {
    let valid = true;
    const fields = form?.querySelectorAll("input[required], textarea[required]");
    fields?.forEach((field) => {
      field.classList.remove("invalid");
      const empty = !String(field.value).trim();
      const badEmail = field.type === "email" && !validateEmail(field.value);
      if (empty || badEmail) {
        field.classList.add("invalid");
        valid = false;
      }
    });
    return valid;
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideFormStatus();

    if (!validateForm()) {
      showFormStatus("Please fill in all required fields with a valid email.", "error");
      return;
    }

    const key = accessKeyInput?.value?.trim();
    if (!key || key === "YOUR_ACCESS_KEY_HERE") {
      showFormStatus(
        "Form is not configured yet. Add your Web3Forms access key in js/config.js (see README).",
        "error"
      );
      return;
    }

    formSubmit.disabled = true;
    formSubmit.textContent = "Sending…";

    const payload = {
      access_key: key,
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
    };

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        showFormStatus("Thank you — your message was sent. We will get back to you soon.", "success");
        form.reset();
        if (accessKeyInput) accessKeyInput.value = key;
      } else {
        showFormStatus(data.message || "Something went wrong. Please try again or email us directly.", "error");
      }
    } catch {
      showFormStatus("Network error. Please check your connection or email us directly.", "error");
    } finally {
      formSubmit.disabled = false;
      formSubmit.textContent = "Send message";
    }
  });

  window.RichyMain = {
    prefillInquiry(vehicleTitle) {
      const subject = document.getElementById("subject");
      const message = document.getElementById("message");
      if (subject) subject.value = "Inquiry: " + vehicleTitle;
      if (message) {
        message.value =
          "Hello,\n\nI am interested in the following vehicle:\n" +
          vehicleTitle +
          "\n\nPlease contact me with more details.\n\nThank you.";
      }
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      subject?.focus();
    },
  };
})();
