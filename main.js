// ===============================
// Main.js (FINAL STABLE + SMART CYCLE PRO)
// ===============================



// ===============================
// MAX PAGES DATA
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
// 🧠 CYCLE ENGINE
// ===============================
function getCycleState() {
  let state = JSON.parse(localStorage.getItem("cycleState") || "{}");

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  if (!state.startDate) state.startDate = todayStr;

  const start = new Date(state.startDate);
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));

  state.cycleDay = Math.min(diff + 1, TOTAL_DAYS);
  state.remainingDays = TOTAL_DAYS - state.cycleDay;

  localStorage.setItem("cycleState", JSON.stringify(state));
  return state;
}



// ===============================
// 📅 DAILY SYSTEM
// ===============================
function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getTodayPlan() {
  const today = getTodayKey();
  const plan = JSON.parse(localStorage.getItem("todayPlan") || "{}");
  return plan[today] || [];
}

function getTodayLog() {
  const today = getTodayKey();
  const logs = JSON.parse(localStorage.getItem("dailyStudyLog") || "{}");
  return logs[today] || {};
}



// ===============================
// 📈 EXPECTED PROGRESS
// ===============================
function getExpectedProgress() {
  const cycle = getCycleState();

  const expectedPages = (cycle.cycleDay / TOTAL_DAYS) * TOTAL_PAGES;

  return {
    cycleDay: cycle.cycleDay,
    remainingDays: cycle.remainingDays,
    expectedPages: Math.round(expectedPages)
  };
}



// ===============================
// 📊 ACTUAL PROGRESS
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
// ⚖️ DELAY ENGINE
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
// ⚖️ DAILY DELAY ENGINE
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
// 🧠 SYSTEM STATUS
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
// 🧠 SYSTEM SNAPSHOT
// ===============================
function getSystemSnapshot() {
  const status = getSystemStatus();
  const cycle = status.cycle;

  return {
    time: {
      cycleDay: cycle.cycleDay,
      remainingDays: TOTAL_DAYS - cycle.cycleDay
    },

    progress: {
      actual: cycle.actualPages,
      expected: cycle.expectedPages,
      gap: cycle.gap
    },

    alerts: {
      isOnTrack: status.isOnTrack,
      hasDailyIssues: status.dailyDelays.length > 0,
      delayCount: status.dailyDelays.length
    }
  };
}


//SMART CYCLE ENGINE//

function getSmartCycle() {
  const cycle = getDelayStatus();

  const grades = [9, 10, 11, 12];
  const subjects = ['Math', 'Physics', 'Chemistry', 'Biology', 'English'];

  // ===============================
  // 📊 REAL TOTAL (TRUTH ONLY)
  // ===============================
  let actualTotal = 0;

  grades.forEach(grade => {
    const saved = JSON.parse(
      localStorage.getItem(`grade_${grade}_progress`) || "{}"
    );

    subjects.forEach(subject => {
      actualTotal += Number(saved[subject]) || 0;
    });
  });

  // ===============================
  // 📈 EXPECTED (90-DAY SYSTEM TRUTH)
  // ===============================
  const expected = cycle.expectedPages;

  // ===============================
  // ⚖️ GAP (STANDARDIZED LOGIC)
  // positive = ahead, negative = behind
  // ===============================
  const gap = actualTotal - expected;

  const remainingDays = Math.max(1, TOTAL_DAYS - cycle.cycleDay);

  // ===============================
  // 🚀 CATCH-UP LOGIC (ONLY IF BEHIND)
  // ===============================
  let catchUpPerDay = 0;

  if (gap < 0) {
    catchUpPerDay = Math.ceil(Math.abs(gap) / remainingDays);
    catchUpPerDay = Math.min(catchUpPerDay, 60);
  }

  // ===============================
  // 🛡️ SAFE DAILY LIMIT SYSTEM
  // ===============================
  const baseDaily = TOTAL_PAGES / TOTAL_DAYS;

  let target = baseDaily + catchUpPerDay;

  if (target > 85) target = 85;
  if (target < 25) target = 25;

  return {
    expected: Math.round(expected),
    actual: Math.round(actualTotal),
    gap: Math.round(gap),

    status: gap >= 0 ? "AHEAD" : "BEHIND",

    catchUpPerDay,
    remainingDays,

    dailyLimit: {
      target: Math.round(target),
      safe: target <= 70,
      warning: target > 70
    }
  };
}


// ===============================
// UI STATE
// ===============================
let currentGrade = 9;
let currentSection = "study";

let nav, prevBtn, nextBtn;



// ===============================
// NAV UI
// ===============================
function updateNavButtons() {
  if (!nav || !prevBtn || !nextBtn) return;

  nav.style.display = "flex";
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

  if (type === "study") loadStudySection?.(grade);
  else if (type === "timetable") loadWeeklyTimetable?.();
  else if (type === "dashboard") loadDashboard?.();
}



// ===============================
// NAVIGATION
// ===============================
function nextGrade() {
  if (currentGrade < 12) {
    currentGrade++;
    loadSection("study", currentGrade);
  }
}

function previousGrade() {
  if (currentGrade > 9) {
    currentGrade--;
    loadSection("study", currentGrade);
  }
}



// ===============================
// INIT
// ===============================
window.addEventListener("load", () => {
  nav = document.getElementById("grade-nav");
  prevBtn = document.getElementById("prev-btn");
  nextBtn = document.getElementById("next-btn");

  updateNavButtons();
  getCycleState();
  loadSection("study", currentGrade);
});



// ===============================
// EXPORTS
// ===============================
window.nextGrade = nextGrade;
window.previousGrade = previousGrade;
window.loadSection = loadSection;



// ===============================
// UI CONNECTOR
// ===============================
function getUIState() {
  return {
    mode: currentSection,
    grade: currentGrade,
    system: getSystemSnapshot(),
    status: getSystemStatus(),
    smart: getSmartCycle(),
    isDashboard: currentSection === "dashboard",
    isStudy: currentSection === "study",
    isTimetable: currentSection === "timetable"
  };
}

function refreshUI() {
  const state = getUIState();

  if (state.isStudy && typeof updateGradeSummary === "function") {
    updateGradeSummary(state.grade);
  }
}



// ===============================
// SAFE SYNC SYSTEM
// ===============================
(function initSmartSync() {

  function sync() {
    const lastUpdate = localStorage.getItem("study_last_update");
    if (!lastUpdate) return;

    if (window.__syncLock === lastUpdate) return;
    window.__syncLock = lastUpdate;

    if (currentSection === "study") updateGradeSummary?.(currentGrade);
    if (currentSection === "timetable") loadWeeklyTimetable?.();
  }

  window.addEventListener("focus", sync);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) sync();
  });

  setInterval(sync, 5000);
})();
