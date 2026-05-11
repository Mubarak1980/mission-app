// ===============================
// Main.js (CLEAN SYSTEM CORE)
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

const TOTAL_DAYS = 90;
const TOTAL_PAGES = 5705;



// ===============================
// 🧠 CYCLE ENGINE (LONG TERM SYSTEM)
// ===============================
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
// 📅 DAILY PLAN ENGINE
// ===============================
function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getTodayPlan() {
  const today = getTodayKey();
  const plan = JSON.parse(localStorage.getItem("todayPlan") || "{}");
  return plan[today] || [];
}

function saveTodayPlan(planData) {
  const today = getTodayKey();
  const plan = JSON.parse(localStorage.getItem("todayPlan") || "{}");

  plan[today] = planData;
  localStorage.setItem("todayPlan", JSON.stringify(plan));
}



// ===============================
// 📊 DAILY LOG ENGINE
// ===============================
function getTodayLog() {
  const today = getTodayKey();
  const logs = JSON.parse(localStorage.getItem("dailyStudyLog") || "{}");
  return logs[today] || {};
}

function saveTodayLog(grade, subject, pages) {
  const today = getTodayKey();
  const logs = JSON.parse(localStorage.getItem("dailyStudyLog") || "{}");

  if (!logs[today]) logs[today] = {};
  if (!logs[today][grade]) logs[today][grade] = {};

  logs[today][grade][subject] = pages;
  localStorage.setItem("dailyStudyLog", JSON.stringify(logs));
}



// ===============================
// 📈 EXPECTED PROGRESS (90-DAY MODEL)
// ===============================
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



// ===============================
// 📊 ACTUAL PROGRESS (STUDY TRACKER)
// ===============================
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

  return { actualPages: total };
}



// ===============================
// ⚖️ DELAY ENGINE (CORE LOGIC)
// ===============================
function getDelayStatus() {
  const expected = getExpectedProgress();
  const actual = getActualProgress();

  const gap = actual.actualPages - expected.expectedPages;

  let status = "🟢 AHEAD / ON TRACK";

  if (gap < 0) status = "🟡 SLIGHTLY BEHIND";
  if (gap < -200) status = "🔴 SERIOUSLY BEHIND";

  return {
    cycleDay: expected.cycleDay,
    expectedPages: expected.expectedPages,
    actualPages: actual.actualPages,
    gap,
    status
  };
}



// ===============================
// ⚖️ DAILY PLAN vs ACTUAL (SAFE)
// ===============================
function getPlannedVsActual() {
  const plan = getTodayPlan();
  const todayLog = getTodayLog();

  let delays = [];

  if (!Array.isArray(plan)) return delays;

  plan.forEach(p => {
    if (!p?.grade || !p?.subjects) return;

    const actual = todayLog[p.grade] || {};

    Object.keys(p.subjects).forEach(subject => {
      const planned = Number(p.subjects[subject]) || 0;
      const done = Number(actual[subject]) || 0;

      if (done < planned) {
        delays.push({
          grade: p.grade,
          subject,
          missing: planned - done
        });
      }
    });
  });

  return delays;
}



// ===============================
// 🧠 SYSTEM BRAIN (UNIFIED STATE)
// ===============================
function getSystemStatus() {
  const cycle = getDelayStatus();
  const dailyDelays = getPlannedVsActual();

  return {
    cycle,
    dailyDelays,
    isOnTrack: cycle.gap >= 0 && dailyDelays.length === 0
  };
}

// ===============================
// 🧠 STEP 6: SYSTEM CONTROL LAYER
// ===============================

function getSystemSnapshot() {
  const system = getSystemStatus();

  const cycle = system.cycle;
  const daily = system.dailyDelays;

  const totalPages = getActualProgress().actualPages;
  const expectedPages = cycle.expectedPages || 0;

  return {
    time: {
      cycleDay: cycle.cycleDay,
      remainingDays: TOTAL_DAYS - cycle.cycleDay
    },

    progress: {
      actual: totalPages,
      expected: expectedPages,
      gap: system.cycle.gap
    },

    alerts: {
      isOnTrack: system.isOnTrack,
      hasDailyIssues: daily.length > 0,
      delayCount: daily.length
    }
  };
}

// ===============================
// UI STATE
// ===============================
let currentGrade = 9;
let currentSection = 'study';

let nav, prevBtn, nextBtn;



// ===============================
// NAV UI
// ===============================
function updateNavButtons() {
  if (!nav || !prevBtn || !nextBtn) return;

  nav.style.display = 'flex';
  prevBtn.disabled = currentGrade === 9;
  nextBtn.disabled = currentGrade === 12;
}



// ===============================
// ROUTER
// ===============================
function loadSection(type, grade) {
  currentSection = type;
  currentGrade = grade;

  updateNavButtons();

  if (type === 'study') loadStudySection(grade);
  if (type === 'timetable') loadWeeklyTimetable();
  if (type === 'dashboard') loadDashboard();
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

  getCycleState();
  loadSection('study', currentGrade);
});



// ===============================
// EXPORTS
// ===============================
window.nextGrade = nextGrade;
window.previousGrade = previousGrade;
window.loadSection = loadSection;



// ===============================
// SYNC SYSTEM
// ===============================
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

    if (currentSection === "dashboard" && typeof loadDashboard === "function") {
      loadDashboard();
    }
  }

  window.addEventListener("focus", sync);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) sync();
  });

  setInterval(sync, 5000);

})();
