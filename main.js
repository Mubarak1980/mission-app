// ===============================
// Main.js
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
// SAFE STORAGE HELPERS
// ===============================
function safeJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (e) {
    return fallback;
  }
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

// ===============================
// CYCLE ENGINE
// ===============================
function getCycleState() {
  const todayStr = todayISO();
  const state = safeJSON("cycleState", {});

  if (!state.startDate) state.startDate = todayStr;

  const start = new Date(state.startDate);
  const now = new Date();

  // FIXED: timezone-safe calculation
  const diff = Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
     Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / 86400000
  );

  state.cycleDay = Math.min(diff + 1, TOTAL_DAYS);
  state.remainingDays = Math.max(0, TOTAL_DAYS - state.cycleDay);

  localStorage.setItem("cycleState", JSON.stringify(state));
  return state;
}

// ===============================
// TODAY DATA
// ===============================
function getTodayKey() {
  return todayISO();
}

function getTodayPlan() {
  const plan = safeJSON("todayPlan", {});
  return plan[getTodayKey()] || [];
}

function getTodayLog() {
  const logs = safeJSON("dailyStudyLog", {});
  return logs[getTodayKey()] || {};
}

// ===============================
// PROGRESS ENGINE
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
// ACTUAL PROGRESS
// ===============================
function getActualProgress() {
  const grades = [9, 10, 11, 12];
  const subjects = ["Math", "Physics", "Chemistry", "Biology", "English"];

  let total = 0;

  for (let i = 0; i < grades.length; i++) {
    const saved = safeJSON(`grade_${grades[i]}_progress`, {});

    for (let j = 0; j < subjects.length; j++) {
      total += Number(saved[subjects[j]]) || 0;
    }
  }

  return { actualPages: total };
}

// ===============================
// DELAY ENGINE
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
// DAILY DELAY ENGINE
// ===============================
function getPlannedVsActual() {
  const plan = getTodayPlan();
  const todayLog = getTodayLog();

  const delays = [];

  if (!Array.isArray(plan)) return delays;

  for (let i = 0; i < plan.length; i++) {
    const p = plan[i];
    if (!p?.grade || !p?.subjects) continue;

    const actual = todayLog[p.grade] || {};
    const subjects = Object.keys(p.subjects);

    for (let j = 0; j < subjects.length; j++) {
      const subject = subjects[j];

      const planned = Number(p.subjects[subject]) || 0;
      const done = Number(actual[subject]) || 0;

      if (done < planned) {
        delays.push({
          grade: p.grade,
          subject,
          missing: planned - done
        });
      }
    }
  }

  return delays;
}

// ===============================
// SYSTEM STATUS
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
// SNAPSHOT
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

// ===============================
// SMART CYCLE
// ===============================
function getSmartCycle() {
  const cycle = getDelayStatus();
  const actualTotal = getActualProgress().actualPages;

  const expected = cycle.expectedPages;
  const gap = actualTotal - expected;

  const remainingDays = Math.max(1, TOTAL_DAYS - cycle.cycleDay);

  let catchUpPerDay = gap < 0 ? Math.ceil(Math.abs(gap) / remainingDays) : 0;
  catchUpPerDay = Math.min(catchUpPerDay, 60);

  const baseDaily = TOTAL_PAGES / TOTAL_DAYS;

  let target = baseDaily + catchUpPerDay;

  target = Math.min(Math.max(target, 25), 85);

  return {
    expected: Math.round(expected),
    actual: Math.round(actualTotal),
    gap: Math.round(gap),
    status: gap >= 0 ? "AHEAD / ON TRACK" : "BEHIND",
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
// PERSIST UI STATE
// ===============================
function saveUIState() {
  localStorage.setItem("ui_state", JSON.stringify({
    grade: currentGrade,
    section: currentSection
  }));
}

function loadUIState() {
  const saved = safeJSON("ui_state", null);
  if (!saved) return;

  currentGrade = saved.grade || 9;
  currentSection = saved.section || "study";
}

// ===============================
// NAV
// ===============================
function updateNavButtons() {
  if (!nav || !prevBtn || !nextBtn) return;

  nav.style.display = "flex";
  prevBtn.disabled = currentGrade <= 9;
  nextBtn.disabled = currentGrade >= 12;
}

// ===============================
// ROUTER
// ===============================
function loadSection(type, grade) {
  currentSection = type;
  currentGrade = grade;

  saveUIState();

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
function initApp() {
  if (document.body.dataset.initialized) return;

  document.body.dataset.initialized = "true";

  nav = document.getElementById("grade-nav");
  prevBtn = document.getElementById("prev-btn");
  nextBtn = document.getElementById("next-btn");

  loadUIState();

  updateNavButtons();
  getCycleState();
  loadSection("study", currentGrade);
}

window.addEventListener("load", initApp);

// ===============================
// EXPORTS
// ===============================
window.nextGrade = nextGrade;
window.previousGrade = previousGrade;
window.loadSection = loadSection;

// ===============================
// SYNC SYSTEM
// ===============================
let syncInterval = null;

function sync() {
  const lastUpdate = localStorage.getItem("study_last_update");
  if (!lastUpdate) return;

  if (window.__syncLock === lastUpdate) return;
  window.__syncLock = lastUpdate;

  if (currentSection === "study") updateGradeSummary?.(currentGrade);
  if (currentSection === "timetable") loadWeeklyTimetable?.();
}

function startSync() {
  if (syncInterval) return;
  syncInterval = setInterval(sync, 5000);
}

function stopSync() {
  clearInterval(syncInterval);
  syncInterval = null;
}

window.addEventListener("focus", startSync);
window.addEventListener("blur", stopSync);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopSync();
  else startSync();
});
