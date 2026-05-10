// ===============================  
// main.js
// ===============================  

let currentGrade = 9;
let currentSection = "study";

window.currentGrade = currentGrade;

// ===============================  
// NAV ELEMENTS  
// ===============================  
let nav, prevBtn, nextBtn;

// ===============================  
// SYNC STATE  
// ===============================  
function syncGlobalState() {
  window.currentGrade = currentGrade;
}

// ===============================  
// NAV UPDATE  
// ===============================  
function updateNavButtons() {
  if (!nav || !prevBtn || !nextBtn) return;

  nav.style.display = "flex";
  prevBtn.disabled = currentGrade <= 9;
  nextBtn.disabled = currentGrade >= 12;
}

// ===============================  
// SECTION ROUTER  
// ===============================  
function loadSection(type, grade) {
  currentSection = type;
  currentGrade = grade;

  syncGlobalState();
  updateNavButtons();

  // safe rendering without race conditions
  const render = () => {
    if (type === "study" && typeof window.loadStudySection === "function") {
      window.loadStudySection(grade);
    }

    if (type === "timetable" && typeof window.loadWeeklyTimetable === "function") {
      window.loadWeeklyTimetable();
    }

    if (type === "dashboard" && typeof window.loadDashboard === "function") {
      window.loadDashboard();
    }
  };

  // wait until everything is available
  if (window.maxPagesByGrade && window.loadStudySection) {
    render();
  } else {
    const check = setInterval(() => {
      if (window.maxPagesByGrade && window.loadStudySection) {
        clearInterval(check);
        render();
      }
    }, 30);
  }
}

// ===============================  
// GRADE NAVIGATION  
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
// INIT  
// ===============================  
window.addEventListener("load", () => {

  nav = document.getElementById("grade-nav");
  prevBtn = document.getElementById("prev-btn");
  nextBtn = document.getElementById("next-btn");

  syncGlobalState();
  updateNavButtons();

  // safe boot (no crash if modules load late)
  loadSection("study", currentGrade);
});

// ===============================  
// EXPORTS  
// ===============================  
window.nextGrade = nextGrade;
window.previousGrade = previousGrade;
window.loadSection = loadSection;
