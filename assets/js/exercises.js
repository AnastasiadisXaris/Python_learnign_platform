/* ==========================================================================
   Περιβάλλον Εξάσκησης — μία γενική υλοποίηση για όλες τις βαθμίδες
   (αντικαθιστά τα ξεχωριστά exercises_<level>.js με πανομοιότυπη λογική)
   ========================================================================== */

let cmEditor = null;
let pyodideInstance = null;
let pyodideReady = false;
let exercises = [];
let activeIndex = -1;
let currentLevel = null;

async function initExercises(level) {
  currentLevel = level;
  const sidebar = document.getElementById("ide-sidebar-list");
  const promptTitle = document.getElementById("ide-question");
  const promptHint = document.getElementById("ide-hint");

  try {
    const res = await fetch(`data/${level}/exercises.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    exercises = data.exercises || [];
  } catch (err) {
    console.error("Σφάλμα φόρτωσης ασκήσεων:", err);
    sidebar.innerHTML = `<div class="empty-state">Η φόρτωση των ασκήσεων απέτυχε.</div>`;
    return;
  }

  renderSidebar();
  initEditor();
  loadPyodideInBackground();

  document.getElementById("run-btn").addEventListener("click", runCode);
  document.getElementById("mark-done-btn").addEventListener("click", () => {
    if (activeIndex < 0) return;
    const ex = exercises[activeIndex];
    Progress.markDone(currentLevel, "exercises", ex.id);
    renderSidebar();
    showToast("✓ Η άσκηση σημειώθηκε ως ολοκληρωμένη", "success");
  });

  if (exercises.length) selectExercise(0);
}

function renderSidebar() {
  const sidebar = document.getElementById("ide-sidebar-list");
  sidebar.innerHTML = "";
  exercises.forEach((ex, i) => {
    const done = Progress.isDone(currentLevel, "exercises", ex.id);
    const item = document.createElement("div");
    item.className = "ide-item" + (i === activeIndex ? " is-active" : "") + (done ? " is-done" : "");
    item.innerHTML = `
      <span class="ide-item__num">${String(i + 1).padStart(2, "0")}</span>
      <span class="ide-item__label">${ex.question}</span>
      <span class="ide-item__dot" title="${done ? "Ολοκληρωμένη" : "Εκκρεμεί"}"></span>
    `;
    item.addEventListener("click", () => selectExercise(i));
    sidebar.appendChild(item);
  });
  updateLevelProgressUI(currentLevel);
}

function selectExercise(index) {
  activeIndex = index;
  const ex = exercises[index];
  document.getElementById("ide-question").textContent = ex.question;
  document.getElementById("ide-hint").innerHTML = ex.hint ? `<strong>Υπόδειξη:</strong> ${ex.hint}` : "";
  cmEditor.setValue(ex.starterCode || "");
  setConsole("", "empty");
  renderSidebar();
}

function initEditor() {
  const textarea = document.getElementById("editor");
  cmEditor = CodeMirror.fromTextArea(textarea, {
    mode: "python",
    theme: "material-darker",
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    matchBrackets: true,
    viewportMargin: Infinity,
  });
}

function setConsole(text, state) {
  const body = document.getElementById("console-body");
  body.classList.remove("is-error", "is-empty");
  if (state === "empty") {
    body.textContent = "Η έξοδος θα εμφανιστεί εδώ...";
    body.classList.add("is-empty");
    return;
  }
  if (state === "error") body.classList.add("is-error");
  body.textContent = text;
}

async function loadPyodideInBackground() {
  const runBtn = document.getElementById("run-btn");
  runBtn.disabled = true;
  runBtn.textContent = "Φόρτωση Python…";
  try {
    pyodideInstance = await loadPyodide();
    pyodideReady = true;
    runBtn.disabled = false;
    runBtn.textContent = "▶ Εκτέλεση";
  } catch (err) {
    console.error("Σφάλμα φόρτωσης Pyodide:", err);
    runBtn.textContent = "Μη διαθέσιμο";
  }
}

async function runCode() {
  if (!pyodideReady || activeIndex < 0) return;
  const code = cmEditor.getValue();
  const runBtn = document.getElementById("run-btn");
  runBtn.disabled = true;
  const prevLabel = runBtn.textContent;
  runBtn.textContent = "Εκτέλεση…";

  try {
    pyodideInstance.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
    `);
    await pyodideInstance.runPythonAsync(code);
    const output = pyodideInstance.runPython("sys.stdout.getvalue()");

    if (!output || output.trim() === "") {
      setConsole("Ο κώδικας εκτελέστηκε χωρίς έξοδο (print).", "empty");
    } else {
      setConsole(output, "ok");
    }

    const ex = exercises[activeIndex];
    if (!Progress.isDone(currentLevel, "exercises", ex.id)) {
      Progress.markDone(currentLevel, "exercises", ex.id);
      renderSidebar();
      showToast("✓ Άσκηση ολοκληρώθηκε", "success");
    }
  } catch (err) {
    let errorOutput = "";
    try {
      errorOutput = pyodideInstance.runPython("sys.stderr.getvalue()");
    } catch {
      errorOutput = String(err);
    }
    setConsole(errorOutput || String(err), "error");
  } finally {
    runBtn.disabled = false;
    runBtn.textContent = prevLabel;
  }
}
