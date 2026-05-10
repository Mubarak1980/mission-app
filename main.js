// ===============================
// Main.js
// ===============================
window.maxPagesByGrade = {
  9: {
    Math: 363,
    Physics: 174,
    Chemistry: 175,
    Biology: 164,
    English: 223
  },

  10: {
    Math: 385,
    Physics: 249,
    Chemistry: 298,
    Biology: 174,
    English: 316
  },

  11: {
    Math: 479,
    Physics: 329,
    Chemistry: 330,
    Biology: 284,
    English: 283
  },

  12: {
    Math: 416,
    Physics: 177,
    Chemistry: 287,
    Biology: 354,
    English: 263
  }
};

// ===============================
// GLOBAL STATE
// ===============================
let currentGrade = 9;
let currentSection = 'study';

let nav, prevBtn, nextBtn;

// ===============================
// NAV BUTTONS
// ===============================
function updateNavButtons() {
  if (!nav || !prevBtn || !nextBtn) return;

  nav.style.display = 'flex';
  prevBtn.disabled = currentGrade === 9;
  nextBtn.disabled = currentGrade === 12;
}

// ===============================
// SECTION CONTROLLER
// ===============================
function loadSection(type, grade) {
  currentSection = type;
  currentGrade = grade;

  updateNavButtons();

  if (type === 'study') {
    loadStudySection(grade);
  }

  if (type === 'timetable') {
    loadWeeklyTimetable();
  }
}

// ===============================
// NAVIGATION
// ===============================
function nextGrade() {
  if (currentGrade < 12) {
    currentGrade++;
    loadSection('study', currentGrade);
  }
}

function previousGrade() {
  if (currentGrade > 9) {
    currentGrade--;
    loadSection('study', currentGrade);
  }
}

// ===============================
// INIT
// ===============================
window.addEventListener('load', () => {
  nav = document.getElementById('grade-nav');
  prevBtn = document.getElementById('prev-btn');
  nextBtn = document.getElementById('next-btn');

  updateNavButtons();

  loadSection('study', currentGrade);
});

// ===============================
// EXPORTS
// ===============================
window.nextGrade = nextGrade;
window.previousGrade = previousGrade;
window.loadSection = loadSection;


// =======================================================
// 🔥 SAFE SYNC SYSTEM (ADDED - NO CONFLICT WITH ENGINE)
// Study ↔ Weekly Timetable Bridge
// =======================================================

(function initSmartSync() {

  function sync() {
    const lastUpdate = localStorage.getItem("study_last_update");
    if (!lastUpdate) return;

    // prevent repeated sync loops
    if (window.__syncLock === lastUpdate) return;
    window.__syncLock = lastUpdate;

    // If weekly timetable is open → refresh it
    if (currentSection === "timetable" && typeof loadWeeklyTimetable === "function") {
      loadWeeklyTimetable();
    }

    // If study section is open → refresh summary
    if (currentSection === "study" && typeof updateGradeSummary === "function") {
      updateGradeSummary(currentGrade);
    }
  }

  // When user returns to tab
  window.addEventListener("focus", sync);

  // When tab becomes visible again
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) sync();
  });

  // Safety interval sync
  setInterval(sync, 5000);

})();
