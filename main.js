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

  const render = () => {
    if (type === "study" && typeof window.loadStudySection === "function") {
      window.loadStudySection(grade);
    }

    if (type === "timetable" && typeof window.loadWeeklyTimetable === "function") {
      window.loadWeeklyTimetable(grade); // ✅ FIX: pass grade
    }

    if (type === "dashboard" && typeof window.loadDashboard === "function") {
      window.loadDashboard(grade); // ✅ FIX: pass grade
    }
  };

  // ===============================
  // SAFER LOADING (NO INFINITE LOOP)
  // ===============================
  let attempts = 0;
  const maxAttempts = 100; // ~3 seconds

  if (window.maxPagesByGrade && window.loadStudySection) {
    render();
  } else {
    const check = setInterval(() => {
      attempts++;

      if (window.maxPagesByGrade && window.loadStudySection) {
        clearInterval(check);
        render();
      }

      if (attempts > maxAttempts) {
        clearInterval(check);
        console.error("❌ Failed to load dependencies");
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
    loadSection(currentSection, currentGrade); // ✅ FIX: keep same section
  }
}

function previousGrade() {
  if (currentGrade > 9) {
    currentGrade--;
    loadSection(currentSection, currentGrade); // ✅ FIX: keep same section
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

  loadSection("study", currentGrade);
});

// ===============================  
// EXPORTS  
// ===============================  
window.nextGrade = nextGrade;
window.previousGrade = previousGrade;
window.loadSection = loadSection;
