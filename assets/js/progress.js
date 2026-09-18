/* ==========================================================================
   Progress tracking — αποθήκευση προόδου ανά βαθμίδα/ενότητα στο localStorage
   Δομή: { gymnasio: { material: {id:true}, quizzes: {...}, exercises: {...} }, ... }
   ========================================================================== */

const Progress = (() => {
  const STORAGE_KEY = "pp-progress";

  function readAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function writeAll(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function ensurePath(data, level, category) {
    data[level] = data[level] || {};
    data[level][category] = data[level][category] || {};
    return data;
  }

  function isDone(level, category, id) {
    const data = readAll();
    return !!(data[level] && data[level][category] && data[level][category][id]);
  }

  function toggle(level, category, id) {
    const data = readAll();
    ensurePath(data, level, category);
    const current = !!data[level][category][id];
    if (current) {
      delete data[level][category][id];
    } else {
      data[level][category][id] = true;
    }
    writeAll(data);
    return !current;
  }

  function markDone(level, category, id) {
    const data = readAll();
    ensurePath(data, level, category);
    data[level][category][id] = true;
    writeAll(data);
  }

  function countDone(level, category) {
    const data = readAll();
    if (!data[level] || !data[level][category]) return 0;
    return Object.keys(data[level][category]).length;
  }

  function percent(level, category, total) {
    if (!total) return 0;
    return Math.round((countDone(level, category) / total) * 100);
  }

  function levelPercent(level, totals) {
    // totals: {material: n, quizzes: n, exercises: n}
    const keys = Object.keys(totals);
    let done = 0, total = 0;
    keys.forEach((k) => {
      done += countDone(level, k);
      total += totals[k];
    });
    return total ? Math.round((done / total) * 100) : 0;
  }

  return { isDone, toggle, markDone, countDone, percent, levelPercent };
})();
