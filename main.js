// ===============================
// REAL MAX PAGES (SOURCE OF TRUTH)
// ===============================
window.maxPagesByGrade = {
  9: { Math: 363, Physics: 174, Chemistry: 175, Biology: 164, English: 223 },
  10: { Math: 385, Physics: 249, Chemistry: 298, Biology: 174, English: 316 },
  11: { Math: 479, Physics: 329, Chemistry: 330, Biology: 284, English: 283 },
  12: { Math: 416, Physics: 177, Chemistry: 287, Biology: 354, English: 263 }
};

// ===============================
// GLOBAL STATE
// ===============================
let currentGrade = 9;
let currentSection = "study";

let nav, prevBtn, nextBtn;

// ===============================
// NAV BUTTONS
// ===============================
function updateNavButtons() {
  if (!nav || !prevBtn || !nextBtn) return;

  nav.style.display = "flex";
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

  if (type === "study") {
    loadStudySection(grade);
  }

  if (type === "timetable") {
    // SAFE: grade passed for future smart logic
    loadWeeklyTimetable(grade);
  }
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
  loadSection("study", currentGrade);
});

// ===============================
// EXPORTS
// ===============================
window.nextGrade = nextGrade;
window.previousGrade = previousGrade;
window.loadSection = loadSection;
