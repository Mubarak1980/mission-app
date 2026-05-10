// ===============================
// 📌 MAIN.JS (CLEAN + SAFE)
// ===============================

let currentGrade = 9;
let currentSection = "study";

window.currentGrade = currentGrade;

// -------------------------------
// UI ELEMENTS
// -------------------------------
let nav, prevBtn, nextBtn;

// -------------------------------
// SYNC STATE
// -------------------------------
function syncGlobalState() {
  window.currentGrade = currentGrade;
}

// -------------------------------
// NAV BUTTON UPDATE
// -------------------------------
function updateNavButtons() {
  if (!nav || !prevBtn || !nextBtn) return;

  nav.style.display = "flex";

  prevBtn.disabled = currentGrade <= 9;
  nextBtn.disabled = currentGrade >= 12;
}

// -------------------------------
// ROUTER
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
      console.warn("⚠️ loadStudySection not loaded");
    }
  }

  if (type === "timetable") {
    if (typeof window.loadWeeklyTimetable === "function") {
      window.loadWeeklyTimetable(grade); // ✅ FIXED (pass grade)
    } else {
      console.warn("⚠️ loadWeeklyTimetable not loaded");
    }
  }
}

// -------------------------------
// NAVIGATION
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
// INIT
// -------------------------------
window.addEventListener("load", () => {
  nav = document.getElementById("grade-nav");
  prevBtn = document.getElementById("prev-btn");
  nextBtn = document.getElementById("next-btn");

  if (!nav || !prevBtn || !nextBtn) {
    console.warn("⚠️ Navigation buttons missing in HTML");
    return;
  }

  syncGlobalState();
  updateNavButtons();

  loadSection("study", currentGrade);
});

// -------------------------------
// EXPORTS
// -------------------------------
window.nextGrade = nextGrade;
window.previousGrade = previousGrade;
window.loadSection = loadSection;
