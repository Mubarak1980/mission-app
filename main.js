// ===============================
// 📌 MAIN CONTROLLER
// ===============================

let currentGrade = 9;
let currentSection = "study";

window.currentGrade = currentGrade;

let nav, prevBtn, nextBtn;

// -------------------------------
function sync() {
  window.currentGrade = currentGrade;
}

// -------------------------------
function updateNavButtons() {
  if (!nav || !prevBtn || !nextBtn) return;

  nav.style.display = "flex";
  prevBtn.disabled = currentGrade === 9;
  nextBtn.disabled = currentGrade === 12;
}

// -------------------------------
function loadSection(type, grade) {
  currentSection = type;
  currentGrade = grade;

  sync();
  updateNavButtons();

  if (type === "study") {
    window.loadStudySection?.(grade);
  }

  if (type === "timetable") {
    window.loadWeeklyTimetable?.();
  }
}

// -------------------------------
function nextGrade() {
  if (currentGrade < 12) {
    currentGrade++;
    sync();
    loadSection("study", currentGrade);
  }
}

// -------------------------------
function previousGrade() {
  if (currentGrade > 9) {
    currentGrade--;
    sync();
    loadSection("study", currentGrade);
  }
}

// -------------------------------
window.addEventListener("load", () => {
  nav = document.getElementById("grade-nav");
  prevBtn = document.getElementById("prev-btn");
  nextBtn = document.getElementById("next-btn");

  sync();
  updateNavButtons();

  loadSection("study", currentGrade);
});

// -------------------------------
window.nextGrade = nextGrade;
window.previousGrade = previousGrade;
window.loadSection = loadSection;
