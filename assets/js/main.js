/* ==========================================================================
   David Bakyelle portfolio. Vanilla JavaScript, no dependencies.
   Handles: header state, scroll progress, active section, mobile navigation,
   reveal animations, live Kumasi clock, copy email, contact form, year.
   ========================================================================== */

(() => {
  "use strict";

  const CONTACT_EMAIL = "dbakyelle13@gmail.com";

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  const header = $("[data-header]");
  const progressBar = $("[data-progress]");
  const railFill = $("[data-rail-fill]");
  const navLinks = $$("[data-nav]");
  const railNodes = $$("[data-rail]");
  const sections = ["about", "skills", "work", "experience", "credentials", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  let sectionTops = [];
  let activeSection = null;
  let scrollQueued = false;

  /* Header, progress, active section ------------------------------------- */

  function measureSections() {
    sectionTops = sections.map((section) => ({
      id: section.id,
      top: section.getBoundingClientRect().top + window.scrollY,
    }));
  }

  function setActiveSection(id) {
    if (id === activeSection) return;
    activeSection = id;

    navLinks.forEach((link) => {
      const isActive = link.dataset.nav === id;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    railNodes.forEach((node) => {
      const isActive = node.dataset.rail === id;
      node.classList.toggle("is-active", isActive);
      if (isActive) {
        node.setAttribute("aria-current", "location");
      } else {
        node.removeAttribute("aria-current");
      }
    });
  }

  function updateScroll() {
    scrollQueued = false;
    if (!header) return;

    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 12);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(1, Math.max(0, y / docHeight)) : 0;

    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    if (railFill) railFill.style.transform = `scaleY(${progress})`;

    if (!sectionTops.length) return;

    const probe = y + window.innerHeight * 0.36;
    let current = null;

    sectionTops.forEach((section) => {
      if (section.top <= probe) current = section.id;
    });

    if (y + window.innerHeight >= document.documentElement.scrollHeight - 8) {
      current = "contact";
    }

    setActiveSection(current);
  }

  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(updateScroll);
  }

  function refreshMeasurements() {
    measureSections();
    onScroll();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", refreshMeasurements, { passive: true });
  window.addEventListener("load", refreshMeasurements);
  window.addEventListener("hashchange", () => window.setTimeout(refreshMeasurements, 40));

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refreshMeasurements).catch(() => {});
  }

  refreshMeasurements();

  /* Mobile navigation ---------------------------------------------------- */

  const nav = $("#site-nav");
  const menuToggle = $(".menu-toggle");
  const menuLabel = $(".menu-label");
  const mobileQuery = window.matchMedia("(max-width: 960px)");
  let menuOpen = false;

  function menuFocusables() {
    return [$(".brand"), ...$$("a", nav), menuToggle].filter(Boolean);
  }

  function setMenu(open, restoreFocus = false) {
    if (!nav || !menuToggle) return;
    if (open && !mobileQuery.matches) return;

    menuOpen = open;
    nav.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (menuLabel) menuLabel.textContent = open ? "Close" : "Menu";
    document.body.classList.toggle("menu-open", open);

    if (open) {
      window.setTimeout(() => {
        const firstLink = nav.querySelector("a");
        if (firstLink) firstLink.focus();
      }, 60);
    } else {
      if (restoreFocus) menuToggle.focus();
      nav.scrollTop = 0;
    }
  }

  if (nav && menuToggle) {
    menuToggle.addEventListener("click", () => setMenu(!menuOpen));

    nav.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link || !mobileQuery.matches) return;

      const href = link.getAttribute("href");
      setMenu(false);

      if (href && href.startsWith("#")) {
        const target = document.querySelector(href);
        if (target) {
          target.setAttribute("tabindex", "-1");
          window.setTimeout(() => target.focus({ preventScroll: true }), 30);
        }
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!menuOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        setMenu(false, true);
        return;
      }

      if (event.key !== "Tab") return;

      const focusables = menuFocusables();
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    mobileQuery.addEventListener("change", (event) => {
      if (!event.matches && menuOpen) setMenu(false);
    });
  }

  /* Skip link ------------------------------------------------------------ */

  const skipLink = $(".skip-link");
  const main = $("#main");

  if (skipLink && main) {
    skipLink.addEventListener("click", () => {
      main.setAttribute("tabindex", "-1");
      window.requestAnimationFrame(() => main.focus({ preventScroll: true }));
    });
  }

  /* Scroll reveals ------------------------------------------------------- */

  const revealTargets = $$(
    ".section-rail, .section-head, .about-prose, .facts, .skill-group, .project, " +
    ".timeline-item, .credential-feature, .training, .contact-copy, .contact-form-wrap, " +
    ".footer-top, .footer-wordmark"
  );

  if ("IntersectionObserver" in window && revealTargets.length) {
    revealTargets.forEach((element) => element.classList.add("reveal"));

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.04 }
    );

    revealTargets.forEach((element) => revealObserver.observe(element));

    /* Never leave content invisible if the observer misses something. */
    window.setTimeout(() => {
      revealTargets.forEach((element) => element.classList.add("is-visible"));
    }, 4500);
  }

  /* Kumasi clock, UTC+0 -------------------------------------------------- */

  const clocks = $$("[data-clock]");

  if (clocks.length) {
    try {
      const timeFormatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Accra",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      });

      const updateClock = () => {
        const now = new Date();
        const time = timeFormatter.format(now);
        clocks.forEach((clock) => {
          clock.textContent = time;
          clock.setAttribute("datetime", now.toISOString());
        });
      };

      updateClock();
      window.setInterval(updateClock, 30000);
    } catch (error) {
      /* Leave the fallback time in place if Intl is unavailable. */
    }
  }

  /* Copy email ----------------------------------------------------------- */

  const copyButton = $("[data-copy-email]");

  if (copyButton) {
    const copyLabel = $("[data-copy-label]", copyButton);
    const copyStatus = document.createElement("span");
    copyStatus.className = "sr-only";
    copyStatus.setAttribute("role", "status");
    copyStatus.setAttribute("aria-live", "polite");
    copyButton.parentElement.appendChild(copyStatus);

    let resetTimer = null;

    const showCopyResult = (success) => {
      window.clearTimeout(resetTimer);
      copyButton.classList.toggle("is-copied", success);
      if (copyLabel) copyLabel.textContent = success ? "Copied" : "Copy";
      copyStatus.textContent = success
        ? "Email address copied to the clipboard."
        : "Could not copy automatically. Select the address and copy it manually.";

      resetTimer = window.setTimeout(() => {
        copyButton.classList.remove("is-copied");
        if (copyLabel) copyLabel.textContent = "Copy";
        copyStatus.textContent = "";
      }, 2400);
    };

    const fallbackCopy = (text) => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      let success = false;

      try {
        success = document.execCommand("copy");
      } catch (error) {
        success = false;
      }

      textarea.remove();
      showCopyResult(success);
    };

    copyButton.addEventListener("click", async () => {
      const email = copyButton.dataset.copyEmail;
      if (!email) return;

      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(email);
          showCopyResult(true);
          return;
        } catch (error) {
          /* Fall through to the selection method. */
        }
      }

      fallbackCopy(email);
    });
  }

  /* Contact form --------------------------------------------------------- */

  const form = $("[data-contact-form]");

  if (form) {
    const nameField = $("#name");
    const emailField = $("#email");
    const subjectField = $("#subject");
    const messageField = $("#message");
    const honeypot = $("#company");
    const submitButton = $('button[type="submit"]', form);
    const submitLabel = submitButton ? $("span", submitButton) : null;
    const statusElement = $("[data-form-status]", form);
    const originalSubmitLabel = submitLabel ? submitLabel.textContent : "Send message";

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const messages = {
      name: "Please add your name.",
      email: "Please enter a valid email address.",
      subject: "Please choose a subject.",
      message: "Please add a message of at least 10 characters.",
    };

    let submitted = false;

    const fieldFor = (key) => {
      if (key === "name") return nameField;
      if (key === "email") return emailField;
      if (key === "subject") return subjectField;
      if (key === "message") return messageField;
      return null;
    };

    const errorFor = (key) => form.querySelector(`[data-error-for="${key}"]`);

    const setFieldError = (key, message) => {
      const field = fieldFor(key);
      if (!field) return;
      const errorElement = errorFor(key);
      field.classList.toggle("is-invalid", Boolean(message));
      field.setAttribute("aria-invalid", message ? "true" : "false");
      if (errorElement) errorElement.textContent = message || "";
    };

    const validateField = (key) => {
      let message = "";

      if (key === "name") {
        if (!nameField.value.trim() || nameField.value.trim().length < 2) message = messages.name;
      } else if (key === "email") {
        if (!emailPattern.test(emailField.value.trim())) message = messages.email;
      } else if (key === "subject") {
        if (!subjectField.value) message = messages.subject;
      } else if (key === "message") {
        if (messageField.value.trim().length < 10) message = messages.message;
      }

      setFieldError(key, message);
      return !message;
    };

    const validateAll = () => {
      const results = ["name", "email", "subject", "message"].map(validateField);
      return results.every(Boolean);
    };

    const setStatus = (message, isError = false) => {
      if (!statusElement) return;
      statusElement.textContent = message;
      statusElement.classList.toggle("is-error", isError);
    };

    const setSending = (sending) => {
      if (!submitButton) return;
      submitButton.disabled = sending;
      submitButton.setAttribute("aria-busy", String(sending));
      if (submitLabel) submitLabel.textContent = sending ? "Sending..." : originalSubmitLabel;
    };

    ["name", "email", "subject", "message"].forEach((key) => {
      const field = fieldFor(key);
      if (!field) return;

      const eventName = field.tagName === "SELECT" ? "change" : "input";

      field.addEventListener(eventName, () => {
        if (!submitted) return;
        validateField(key);
        if (!form.querySelector(".is-invalid") && statusElement) {
          statusElement.textContent = "";
          statusElement.classList.remove("is-error");
        }
      });

      field.addEventListener("blur", () => {
        if (field.value) validateField(key);
      });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      submitted = true;
      setStatus("");

      if (!validateAll()) {
        setStatus("Please check the highlighted fields.", true);
        const firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      /* Honeypot: a real visitor never fills this. */
      if (honeypot && honeypot.value.trim()) {
        setStatus("Thanks, your message has been sent. I will reply as soon as I can.");
        form.reset();
        return;
      }

      const endpoint = (form.dataset.endpoint || "").trim();

      if (!endpoint) {
        const subject = `Portfolio enquiry: ${subjectField.value}`;
        const body = [
          `Name: ${nameField.value.trim()}`,
          `Email: ${emailField.value.trim()}`,
          "",
          messageField.value.trim(),
        ].join("\n");

        setStatus(`Opening your email app with the message ready. If it does not open, write to ${CONTACT_EMAIL}.`);
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        return;
      }

      setSending(true);
      setStatus("Sending your message...");

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error(`Form endpoint returned ${response.status}`);

        setStatus("Thanks, your message has been sent. I will reply as soon as I can.");
        form.reset();
        ["name", "email", "subject", "message"].forEach((key) => setFieldError(key, ""));
      } catch (error) {
        setStatus(`Something went wrong. Please email ${CONTACT_EMAIL} instead.`, true);
      } finally {
        setSending(false);
      }
    });
  }

  /* Footer year ---------------------------------------------------------- */

  $$("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
})();
