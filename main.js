// ===============================
// 📌 MAIN.JS
// ===============================


let currentGrade = 9;
let currentSection = "study";

window.currentGrade = currentGrade;

// -------------------------------
// UI ELEMENTS
// -------------------------------
let nav, prevBtn, nextBtn;

// -------------------------------
// SYNC FUNCTION (IMPORTANT)
// -------------------------------
function syncGlobalState() {
  window.currentGrade = currentGrade;
}

// -------------------------------
// NAV BUTTON CONTROL
// -------------------------------
function updateNavButtons() {
  if (!nav || !prevBtn || !nextBtn) return;

  nav.style.display = "flex";

  prevBtn.disabled = currentGrade <= 9;
  nextBtn.disabled = currentGrade >= 12;
}

// -------------------------------
// SECTION LOADER (ROUTER)
// -------------------------------
function loadSection(type, grade) {
  currentSection = type;
  currentGrade = grade;

  syncGlobalState();
  updateNavButtons();

  if (type === "study") {
    if (typeof window.loadStudySection === "function") {
      window.loadStudySection(grade);
    } else {
      console.warn("⚠️ loadStudySection not loaded yet");
    }
  }

  if (type === "timetable") {
    if (typeof window.loadWeeklyTimetable === "function") {
      window.loadWeeklyTimetable();
    } else {
      console.warn("⚠️ loadWeeklyTimetable not loaded yet");
    }
  }
}

// -------------------------------
// GRADE NAVIGATION
// -------------------------------
function nextGrade() {
  if (currentGrade < 12) {
    currentGrade++;
    syncGlobalState();
    loadSection("study", currentGrade);
  }
}

function previousGrade() {
  if (currentGrade > 9) {
    currentGrade--;
    syncGlobalState();
    loadSection("study", currentGrade);
  }
}

// -------------------------------
// INIT SYSTEM
// -------------------------------
window.addEventListener("load", () => {
  nav = document.getElementById("grade-nav");
  prevBtn = document.getElementById("prev-btn");
  nextBtn = document.getElementById("next-btn");

  syncGlobalState();
  updateNavButtons();

  // default start
  loadSection("study", currentGrade);
});

// -------------------------------
// GLOBAL EXPORTS
// -------------------------------
window.nextGrade = nextGrade;
window.previousGrade = previousGrade;
window.loadSection = loadSection;
