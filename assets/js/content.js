/* ==========================================================================
   Generic loader για "Εκπαιδευτικό Υλικό" & "Quizzes"
   Μία υλοποίηση αντί για τρία σχεδόν-πανομοιότυπα αντίγραφα ανά βαθμίδα.
   ========================================================================== */

const RESOURCE_LABELS = {
  pdf: "PDF",
  video: "Βίντεο",
  interactive: "Διαδραστικό Υλικό",
};

function resourceLabel(key) {
  if (RESOURCE_LABELS[key]) return RESOURCE_LABELS[key];
  return key.replace(/_/g, " ");
}

function resourceIcon(url) {
  if (/\.pdf($|\?)/i.test(url)) return "📄";
  if (/\.mp4($|\?)/i.test(url) || /video/i.test(url)) return "🎬";
  if (/quiz_\d\/quiz_\d\.html/.test(url)) return "🧠";
  if (/forms\.gle|docs\.google/.test(url)) return "📝";
  return "🔗";
}

function buildResourceChips(resources) {
  const entries = Object.entries(resources || {}).filter(([, v]) => !!v);
  if (entries.length === 0) {
    return `<p class="empty-note">Δεν υπάρχει διαθέσιμο υλικό ακόμη.</p>`;
  }
  return entries
    .map(
      ([key, url]) =>
        `<a class="resource-chip" href="${url}" target="_blank" rel="noopener noreferrer">
           <span>${resourceIcon(url)}</span> ${resourceLabel(key)}
         </a>`
    )
    .join("");
}

async function loadContentList({ level, category, file, jsonKey, containerId }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const res = await fetch(`data/${level}/${file}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = data[jsonKey] || [];

    if (items.length === 0) {
      container.innerHTML = `<div class="empty-state">Δεν υπάρχει ακόμη περιεχόμενο για αυτή την ενότητα.</div>`;
      return;
    }

    container.innerHTML = "";
    items.forEach((item, index) => {
      const id = item.id || `${level}-${category}-${index + 1}`;
      const done = Progress.isDone(level, category, id);

      const card = document.createElement("article");
      card.className = "content-item";
      card.innerHTML = `
        <button class="content-item__head" aria-expanded="false">
          <span class="content-item__num">${String(index + 1).padStart(2, "0")}</span>
          <img class="content-item__thumb" src="${item.image || "assets/img/programming.png"}" alt="" />
          <span>
            <p class="content-item__title">${item.title}</p>
            <p class="content-item__desc">${item.description || ""}</p>
          </span>
          <span class="check-toggle${done ? " is-done" : ""}" title="${done ? "Ολοκληρωμένο" : "Δεν έχει ανοιχτεί ακόμη"}">✓</span>
          <span class="content-item__chev">⌄</span>
        </button>
        <div class="content-item__body">
          <div class="content-item__body-inner">
            ${buildResourceChips(item.resources)}
          </div>
        </div>
      `;

      const headBtn = card.querySelector(".content-item__head");
      const body = card.querySelector(".content-item__body");

      headBtn.addEventListener("click", () => {
        const isOpen = card.classList.toggle("is-open");
        headBtn.setAttribute("aria-expanded", String(isOpen));
        body.style.maxHeight = isOpen ? body.scrollHeight + "px" : "0px";
        if (isOpen && !Progress.isDone(level, category, id)) {
          Progress.markDone(level, category, id);
          headBtn.querySelector(".check-toggle").classList.add("is-done");
          updateLevelProgressUI(level);
        }
      });

      container.appendChild(card);
    });

    updateLevelProgressUI(level);
  } catch (err) {
    console.error(`Σφάλμα φόρτωσης ${category}:`, err);
    container.innerHTML = `
      <div class="empty-state">
        Η φόρτωση απέτυχε. Ελέγξτε τη σύνδεση ή δοκιμάστε ξανά αργότερα.
      </div>`;
  }
}

/* Ενημέρωση οποιασδήποτε μπάρας προόδου βαθμίδας υπάρχει στη σελίδα */
function updateLevelProgressUI(level) {
  const bar = document.querySelector(`[data-progress-for="${level}"]`);
  if (!bar) return;
  const totals = JSON.parse(bar.dataset.totals || "{}");
  const pct = Progress.levelPercent(level, totals);
  const fill = bar.querySelector(".progress-bar__fill");
  const label = bar.querySelector(".level-progress__label, .level-card__pct");
  if (fill) fill.style.width = pct + "%";
  if (label) label.textContent = pct + "% ολοκληρωμένα";
}
