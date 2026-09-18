/* ==========================================================================
   Κοινές λειτουργίες: theme toggle, breadcrumbs, toasts, terminal hero
   ========================================================================== */

const LEVELS = {
  gymnasio:      { label: "Γυμνάσιο",      color: "var(--gymnasio)" },
  lykeio:        { label: "Λύκειο",        color: "var(--lykeio)" },
  panepistimio:  { label: "Πανεπιστήμιο",  color: "var(--panepistimio)" },
};

function getLevelFromURL() {
  const params = new URLSearchParams(window.location.search);
  const lvl = params.get("level");
  return LEVELS[lvl] ? lvl : null;
}

/* ---------- Theme ---------- */
function initTheme() {
  const saved = localStorage.getItem("pp-theme");
  const theme = saved || "dark";
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("pp-theme", next);
      btn.textContent = next === "dark" ? "☀️" : "🌙";
    });
  }
}

/* ---------- Πλοήγηση ---------- */
function goBack() {
  if (document.referrer && document.referrer.includes(window.location.host)) {
    window.history.back();
  } else {
    window.location.href = "index.html";
  }
}

function levelHref(page, level) {
  return `${page}?level=${level}`;
}

/* ---------- Toasts ---------- */
function ensureToastStack() {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  return stack;
}

function showToast(message, type = "") {
  const stack = ensureToastStack();
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  stack.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity .25s ease";
    setTimeout(() => toast.remove(), 250);
  }, 2600);
}

/* ---------- Breadcrumb (data-driven, ίδιο σε όλες τις σελίδες) ---------- */
function renderBreadcrumb(trail) {
  // trail: [{label, href}] — το τελευταίο δεν έχει href (τρέχουσα σελίδα)
  const el = document.querySelector("[data-breadcrumb]");
  if (!el) return;
  const parts = trail.map((item, i) => {
    const isLast = i === trail.length - 1;
    if (isLast || !item.href) {
      return `<span class="current">${item.label}</span>`;
    }
    return `<a href="${item.href}">${item.label}</a>`;
  });
  el.innerHTML = parts.join(`<span class="sep">/</span>`);
}

/* ---------- Terminal hero: μία ορχηστρωμένη typing animation ---------- */
function typeTerminal(el, lines, opts = {}) {
  const speed = opts.speed || 26;
  const lineDelay = opts.lineDelay || 380;
  let lineIndex = 0;

  el.innerHTML = "";
  const caret = document.createElement("span");
  caret.className = "terminal__caret";

  function typeLine() {
    if (lineIndex >= lines.length) {
      const last = el.lastElementChild;
      if (last) last.appendChild(caret);
      return;
    }
    const lineData = lines[lineIndex];
    const p = document.createElement("div");
    p.className = "terminal__line";
    el.appendChild(p);

    const raw = lineData.text;
    let charIndex = 0;

    function typeChar() {
      if (charIndex <= raw.length) {
        p.innerHTML = highlightPy(raw.slice(0, charIndex));
        charIndex++;
        setTimeout(typeChar, speed);
      } else {
        lineIndex++;
        setTimeout(typeLine, lineDelay);
      }
    }
    typeChar();
  }
  typeLine();
}

function highlightPy(text) {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/(#.*)$/, '<span class="cm">$1</span>')
    .replace(/\b(def|return|if|import|for|in|print)\b/g, '<span class="kw">$1</span>')
    .replace(/(".*?"|'.*?')/g, '<span class="str">$1</span>');
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav__actions");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => nav.classList.toggle("is-open"));
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMobileMenu();
});
