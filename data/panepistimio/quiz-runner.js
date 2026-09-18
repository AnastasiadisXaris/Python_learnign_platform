/* Κοινός runner για τα διαδραστικά quiz κώδικα (quiz_1, quiz_2).
   Ρυθμίζεται μέσω του window.QUIZ_CONFIG = { file, key, backHref } στη σελίδα. */

(function () {
  const cfg = window.QUIZ_CONFIG;
  if (!cfg) return;

  let questions = [];
  let currentIndex = 0;
  let score = 0;

  const questionEl = document.getElementById("question-container");
  const optionsEl = document.getElementById("options-container");
  const feedbackEl = document.getElementById("feedback-container");
  const submitBtn = document.getElementById("submit-btn");
  const progressEl = document.getElementById("quiz-progress");

  async function init() {
    try {
      const res = await fetch(cfg.file);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const group = data[cfg.key] || [];
      questions = (group[0] && group[0].questions) || [];
      if (!questions.length) throw new Error("Δεν βρέθηκαν ερωτήσεις");
      loadQuestion();
    } catch (err) {
      console.error("Σφάλμα φόρτωσης quiz:", err);
      questionEl.textContent = "Η φόρτωση του quiz απέτυχε.";
    }
  }

  function loadQuestion() {
    const q = questions[currentIndex];
    questionEl.textContent = q.question;
    optionsEl.innerHTML = "";
    q.options.forEach((option, i) => {
      const row = document.createElement("label");
      row.className = "quiz-option";
      row.innerHTML = `<input type="radio" name="quiz-option" value="${i}"> <span>${option}</span>`;
      optionsEl.appendChild(row);
    });
    feedbackEl.textContent = "";
    feedbackEl.className = "quiz-feedback";
    submitBtn.disabled = false;
    submitBtn.textContent = "Υποβολή Απάντησης";
    if (progressEl) progressEl.textContent = `Ερώτηση ${currentIndex + 1} / ${questions.length}`;
  }

  submitBtn.addEventListener("click", () => {
    const selected = document.querySelector('input[name="quiz-option"]:checked');
    if (!selected) {
      feedbackEl.textContent = "Παρακαλώ επιλέξτε μία απάντηση.";
      feedbackEl.className = "quiz-feedback is-warn";
      return;
    }
    const q = questions[currentIndex];
    const chosen = q.options[Number(selected.value)];
    const correct = chosen === q.correctAnswer;

    if (correct) {
      score++;
      feedbackEl.textContent = "Σωστή απάντηση!";
      feedbackEl.className = "quiz-feedback is-correct";
    } else {
      feedbackEl.textContent = `Λάθος. Η σωστή απάντηση είναι: ${q.correctAnswer}`;
      feedbackEl.className = "quiz-feedback is-wrong";
    }

    submitBtn.disabled = true;
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        currentIndex++;
        loadQuestion();
      } else {
        questionEl.textContent = "Ολοκληρώσατε το quiz! 🎉";
        optionsEl.innerHTML = "";
        feedbackEl.textContent = `Σκορ: ${score} / ${questions.length}`;
        feedbackEl.className = "quiz-feedback is-correct";
        submitBtn.style.display = "none";
      }
    }, 1400);
  });

  document.getElementById("back-btn").addEventListener("click", () => {
    window.location.href = cfg.backHref || "../quizzes.html?level=panepistimio";
  });

  init();
})();
