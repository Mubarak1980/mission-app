// ===============================  
// main.js (FIXED & ROBUST)  
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

  requestAnimationFrame(() => {

    if (type === "study") {
      window.loadStudySection?.(grade);
    }

    if (type === "timetable") {
      window.loadWeeklyTimetable?.();
    }

    if (type === "dashboard") {
      window.loadDashboard?.();
    }

  });
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
// INIT (FIXED SAFE BOOTSTRAP)  
// ===============================  
window.addEventListener("load", () => {

  nav = document.getElementById("grade-nav");
  prevBtn = document.getElementById("prev-btn");
  nextBtn = document.getElementById("next-btn");

  // 🔥 FIX: wait until data exists (prevents false crash)
  const waitForData = setInterval(() => {

    if (window.maxPagesByGrade) {

      clearInterval(waitForData);

      syncGlobalState();
      updateNavButtons();

      loadSection("study", currentGrade);
    }

  }, 50);

  // 🔥 safety timeout fallback (debug help)
  setTimeout(() => {
    if (!window.maxPagesByGrade) {
      console.error("❌ STILL NO maxPagesByGrade — check settings.js load order!");
    }
  }, 2000);

});

// ===============================  
// EXPORTS  
// ===============================  
window.nextGrade = nextGrade;
window.previousGrade = previousGrade;
window.loadSection = loadSection;
