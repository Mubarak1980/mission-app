// ===============================
// Main.js
// ===============================



// ===============================
// MAX PAGES DATA (STATIC CONFIG)
// ===============================
window.maxPagesByGrade = {
  9: { Math: 363, Physics: 174, Chemistry: 175, Biology: 164, English: 223 },
  10: { Math: 385, Physics: 249, Chemistry: 298, Biology: 174, English: 316 },
  11: { Math: 479, Physics: 329, Chemistry: 330, Biology: 284, English: 283 },
  12: { Math: 416, Physics: 177, Chemistry: 287, Biology: 354, English: 263 }
};



// ===============================
// 🧠 90-DAY CYCLE ENGINE (CORE SYSTEM)
// ===============================
const TOTAL_DAYS = 90;
const TOTAL_PAGES = 5705;

function getCycleState() {
  let state = JSON.parse(localStorage.getItem("cycleState") || "{}");

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  if (!state.startDate) {
    state.startDate = todayStr;
  }

  const start = new Date(state.startDate);
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));

  state.cycleDay = Math.min(diff + 1, TOTAL_DAYS);
  state.remainingDays = TOTAL_DAYS - state.cycleDay;

  localStorage.setItem("cycleState", JSON.stringify(state));

  return state;
}



// ===============================
// 🔴 STEP 3: DELAY DETECTION ENGINE
// ===============================

// expected progress
function getExpectedProgress() {
  const cycle = getCycleState();

  const expectedPages =
    (cycle.cycleDay / TOTAL_DAYS) * TOTAL_PAGES;

  return {
    cycleDay: cycle.cycleDay,
    remainingDays: cycle.remainingDays,
    expectedPages: Math.round(expectedPages)
  };
}



// actual progress
function getActualProgress() {
  const grades = [9, 10, 11, 12];
  const subjects = ['Math', 'Physics', 'Chemistry', 'Biology', 'English'];

  let total = 0;

  grades.forEach(grade => {
    const saved = JSON.parse(
      localStorage.getItem(`grade_${grade}_progress`) || "{}"
    );

    subjects.forEach(subject => {
      total += Number(saved[subject]) || 0;
    });
  });

  return {
    actualPages: total
  };
}



// delay status engine (FIXED STRUCTURE)
function getDelayStatus() {
  const expected = getExpectedProgress();
  const actual = getActualProgress();

  const gap = actual.actualPages - expected.expectedPages;

  let status;

  if (gap >= 0) {
    status = "🟢 AHEAD / ON TRACK";
  } else if (gap > -200) {
    status = "🟡 SLIGHTLY BEHIND";
  } else {
    status = "🔴 SERIOUSLY BEHIND";
  }

  return {
    cycleDay: expected.cycleDay,
    expectedPages: expected.expectedPages,
    actualPages: actual.actualPages,
    gap,
    status
  };
}



// ===============================
// GLOBAL STATE (UI CONTROLLER)
// ===============================
let currentGrade = 9;
let currentSection = 'study';

let nav, prevBtn, nextBtn;



// ===============================
// NAV BUTTONS (UI LOGIC)
// ===============================
function updateNavButtons() {
  if (!nav || !prevBtn || !nextBtn) return;

  nav.style.display = 'flex';
  prevBtn.disabled = currentGrade === 9;
  nextBtn.disabled = currentGrade === 12;
}



// ===============================
// SECTION CONTROLLER (ROUTER)
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
// INIT (APP START)
// ===============================
window.addEventListener('load', () => {
  nav = document.getElementById('grade-nav');
  prevBtn = document.getElementById('prev-btn');
  nextBtn = document.getElementById('next-btn');

  updateNavButtons();

  // initialize cycle engine
  getCycleState();

  loadSection('study', currentGrade);
});



// ===============================
// EXPORTS
// ===============================
window.nextGrade = nextGrade;
window.previousGrade = previousGrade;
window.loadSection = loadSection;



// =======================================================
// 🔥 SAFE SYNC SYSTEM
// =======================================================
(function initSmartSync() {

  function sync() {
    const lastUpdate = localStorage.getItem("study_last_update");
    if (!lastUpdate) return;

    if (window.__syncLock === lastUpdate) return;
    window.__syncLock = lastUpdate;

    if (currentSection === "timetable" && typeof loadWeeklyTimetable === "function") {
      loadWeeklyTimetable();
    }

    if (currentSection === "study" && typeof updateGradeSummary === "function") {
      updateGradeSummary(currentGrade);
    }
  }

  window.addEventListener("focus", sync);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) sync();
  });

  setInterval(sync, 5000);

})();
