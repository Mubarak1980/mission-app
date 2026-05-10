// ===============================
// 📌 GLOBAL STATE (SINGLE SOURCE)
// ===============================
let currentGrade = 9;
let currentSection = "study";

window.currentGrade = currentGrade;

// ===============================
// 📌 NAV ELEMENTS
// ===============================
let nav, prevBtn, nextBtn;

// ===============================
// 📌 SYNC STATE
// ===============================
function syncGlobalState() {
  window.currentGrade = currentGrade;
}

// ===============================
// 📌 NAV UPDATE
// ===============================
function updateNavButtons() {
  if (!nav || !prevBtn || !nextBtn) return;

  nav.style.display = "flex";
  prevBtn.disabled = currentGrade <= 9;
  nextBtn.disabled = currentGrade >= 12;
}

// ===============================
// 📌 SECTION ROUTER (FIXED)
// ===============================
function loadSection(type, grade) {
  currentSection = type;
  currentGrade = grade;

  syncGlobalState();
  updateNavButtons();

  // IMPORTANT: delay ensures data is loaded
  setTimeout(() => {
    if (type === "study") {
      if (typeof window.loadStudySection === "function") {
        window.loadStudySection(grade);
      }
    }

    if (type === "timetable") {
      if (typeof window.loadWeeklyTimetable === "function") {
        window.loadWeeklyTimetable();
      }
    }

    if (type === "dashboard") {
      if (typeof window.loadDashboard === "function") {
        window.loadDashboard();
      }
    }
  }, 10);
}

// ===============================
// 📌 GRADE NAVIGATION
// ===============================
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

// ===============================
// 📌 INIT (SAFE LOAD)
// ===============================
window.addEventListener("load", () => {
  nav = document.getElementById("grade-nav");
  prevBtn = document.getElementById("prev-btn");
  nextBtn = document.getElementById("next-btn");

  if (!window.maxPagesByGrade) {
    console.error("❌ maxPagesByGrade not loaded!");
    return;
  }

  syncGlobalState();
  updateNavButtons();

  loadSection("study", currentGrade);
});

// ===============================
// 📌 EXPORTS
// ===============================
window.nextGrade = nextGrade;
window.previousGrade = previousGrade;
window.loadSection = loadSection;
