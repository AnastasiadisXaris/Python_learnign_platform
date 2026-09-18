# Python Playground

Εκπαιδευτική πλατφόρμα για την εκμάθηση της Python, οργανωμένη σε τρεις βαθμίδες
εκπαίδευσης: **Γυμνάσιο**, **Λύκειο**, **Πανεπιστήμιο**. Κάθε βαθμίδα περιλαμβάνει
εκπαιδευτικό υλικό, quizzes και ένα περιβάλλον εξάσκησης όπου ο χρήστης γράφει και
τρέχει πραγματικό κώδικα Python μέσα στον browser (μέσω [Pyodide](https://pyodide.org)).

Στατικό site (HTML/CSS/JS) — δεν χρειάζεται backend ή build step. Λειτουργεί απευθείας
από GitHub Pages ή οποιονδήποτε static host.

## Τι άλλαξε σε αυτή την αναβάθμιση

**Visual**
- Πλήρες redesign: νέα ταυτότητα εμπνευσμένη από terminal/code-editor (dark theme by
  default, με πλήρες light theme toggle), τυπογραφία Space Grotesk / Inter / JetBrains
  Mono, breadcrumb πλοήγηση σε στυλ file-path.
- Responsive σε όλα τα breakpoints, ορατό focus state για πληκτρολόγιο, σεβασμός στο
  `prefers-reduced-motion`.

**Λειτουργικά**
- **Ενοποιημένη δομή**: αντί για ξεχωριστό σύνολο HTML/JS ανά βαθμίδα
  (`gymnasio_index.html`, `material_gymnasio.js`, …), υπάρχουν πλέον 5 γενικές σελίδες
  (`index.html`, `level.html`, `material.html`, `quizzes.html`, `exercises.html`) που
  οδηγούνται από το query param `?level=gymnasio|lykeio|panepistimio`. Τα δεδομένα κάθε
  βαθμίδας ζουν σε `data/<level>/{material,quizzes,exercises}.json`.
- **Διόρθωση bugs**: τα παλιά `material.js`/`quizzes.js` περιείχαν τριπλό,
  σχεδόν-πανομοιότυπο κώδικα (ένα block ανά βαθμίδα) που έκανε άσκοπα fetch requests σε
  αρχεία που δεν υπήρχαν στην τρέχουσα σελίδα. Αντικαταστάθηκαν από ένα γενικό
  `assets/js/content.js`.
- **Καλύτερο editor εξάσκησης**: το textarea αντικαταστάθηκε από CodeMirror (syntax
  highlighting, αρίθμηση γραμμών, matching brackets), σε layout τύπου IDE (λίστα
  ασκήσεων + editor + console) αντί για modal.
- **Progress tracking**: η πρόοδος του χρήστη (ποιο υλικό άνοιξε, ποια άσκηση έτρεξε
  επιτυχώς) αποθηκεύεται στο `localStorage` και εμφανίζεται ως progress bar στην αρχική
  σελίδα, στο hub κάθε βαθμίδας και ως ένδειξη ✓ σε κάθε κάρτα/άσκηση.
- Τα ενσωματωμένα διαδραστικά quiz του Πανεπιστημίου (`quiz_1`, `quiz_2`) διάβαζαν πριν
  hardcoded, διπλά αντίγραφα των ερωτήσεων μέσα στο `.js` τους· τώρα κάνουν πραγματικό
  `fetch` στο αντίστοιχο `.json`.

## Δομή φακέλων

```
index.html            Αρχική σελίδα (hero + επιλογή βαθμίδας)
level.html             Hub βαθμίδας (Υλικό / Quizzes / Εξάσκηση) — ?level=...
material.html          Λίστα εκπαιδευτικού υλικού — ?level=...
quizzes.html           Λίστα quiz — ?level=...
exercises.html         Περιβάλλον εξάσκησης (CodeMirror + Pyodide) — ?level=...

assets/
  css/style.css         Ενιαίο design system (tokens + components)
  js/main.js            Θέμα, breadcrumb, toasts, terminal typing animation
  js/progress.js         Παρακολούθηση προόδου (localStorage)
  js/content.js           Γενικός loader για Υλικό/Quizzes
  js/exercises.js          Γενικός loader για το περιβάλλον εξάσκησης
  img/                     Εικόνες/εικονίδια

data/
  gymnasio/{material,quizzes,exercises}.json
  lykeio/{material,quizzes,exercises}.json
  panepistimio/{material,quizzes,exercises}.json
  panepistimio/quiz_1/   Διαδραστικό quiz κώδικα #1
  panepistimio/quiz_2/   Διαδραστικό quiz κώδικα #2
  panepistimio/quiz-runner.js   Κοινός κώδικας για τα δύο παραπάνω
```

## Προσθήκη νέου περιεχομένου

Δεν χρειάζεται καμία αλλαγή σε HTML/JS. Απλώς επεξεργαστείτε το αντίστοιχο JSON:

- **Μάθημα**: προσθέστε αντικείμενο στο `data/<level>/material.json` →
  `{ "title", "description", "image", "resources": { "pdf", "video", "interactive" } }`
- **Quiz**: προσθέστε αντικείμενο στο `data/<level>/quizzes.json` →
  `{ "title", "description", "image", "resources": { "Quiz_1": "...", ... } }`
- **Άσκηση**: προσθέστε αντικείμενο στο `data/<level>/exercises.json` →
  `{ "question", "hint", "starterCode" }` (το `id` δίνεται αυτόματα αν λείπει).

## Τοπική εκτέλεση

Static site — αρκεί ένας οποιοσδήποτε static server, π.χ.:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Deploy σε GitHub Pages

Το repo δεν χρειάζεται build step: ενεργοποιήστε GitHub Pages στο branch `main`
(root folder) από τα Settings → Pages του repository.
