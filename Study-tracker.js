// ===============================  
// 📘 Study Tracker 
// ===============================  

(function () {

  const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English"];

  // ===============================  
  // LOAD PROGRESS  
  // ===============================  
  function loadProgress(grade) {
    try {
      return JSON.parse(localStorage.getItem(`grade_${grade}_progress`) || "{}");
    } catch {
      return {};
    }
  }

  // ===============================  
  // SAVE PROGRESS  
  // ===============================  
  function saveStudyProgress(grade) {
    const inputs = document.querySelectorAll(".subject-progress");
    const saved = {};

    inputs.forEach(input => {
      saved[input.dataset.subject] = Math.max(0, Number(input.value) || 0);
    });

    localStorage.setItem(`grade_${grade}_progress`, JSON.stringify(saved));
    updateGradeSummary(grade);
  }

  // ===============================  
  // CREATE SUBJECT CARD  
  // ===============================  
  function createSubject(name, maxPages, savedPages) {
    const safeMax = Number(maxPages) || 0;
    const safeSaved = Number(savedPages) || 0;

    const percent =
      safeMax > 0 ? Math.round((safeSaved / safeMax) * 100) : 0;

    return `
      <div class="subject ${percent === 100 ? "complete" : ""}">
        <h3>${name}</h3>

        <input class="subject-progress"
          type="number"
          min="0"
          max="${safeMax}"
          value="${safeSaved}"
          data-subject="${name}"
          data-maxpages="${safeMax}" />

        <progress value="${safeSaved}" max="${safeMax}"></progress>

        <p>${percent}% complete</p>
      </div>
    `;
  }

  // ===============================  
  // LIVE UPDATE UI  
  // ===============================  
  function updateSubjectProgressUI(input) {
    let value = Math.max(0, Number(input.value) || 0);
    const max = Number(input.dataset.maxpages) || 0;

    if (value > max) value = max;
    input.value = value;

    const percent =
      max > 0 ? Math.round((value / max) * 100) : 0;

    const container = input.closest(".subject");
    if (!container) return;

    const progress = container.querySelector("progress");
    const text = container.querySelector("p");

    if (progress) progress.value = value;
    if (text) text.textContent = `${percent}% complete`;

    container.classList.toggle("complete", percent === 100);
  }

  // ===============================  
  // LOAD STUDY SECTION (FIXED SAFE VERSION)  
  // ===============================  
  function loadStudySection(grade) {

    const container = document.getElementById("main-content");

    if (!container) {
      console.error("❌ main-content not found");
      return;
    }

    // 🔥 SAFE WAIT CHECK (prevents race condition crash)
    const pages = window.maxPagesByGrade;

    if (!pages || typeof pages !== "object") {
      container.innerHTML = `<p style="color:red;">⚠️ Loading grade data...</p>`;
      return;
    }

    const data = pages[grade];

    if (!data) {
      container.innerHTML = `<p style="color:red;">⚠️ Grade ${grade} data missing</p>`;
      return;
    }

    const saved = loadProgress(grade);

    let html = `
      <h2>📘 Grade ${grade} Study Tracker</h2>
      <div class="subjects-container">
    `;

    SUBJECTS.forEach(sub => {
      html += createSubject(sub, data[sub], saved[sub] || 0);
    });

    html += `</div>`;

    container.innerHTML = html;

    document.querySelectorAll(".subject-progress").forEach(input => {
      updateSubjectProgressUI(input);

      input.addEventListener("input", () => {
        updateSubjectProgressUI(input);
        saveStudyProgress(grade);
      });
    });

    updateGradeSummary(grade);
  }

  // ===============================  
  // SUMMARY  
  // ===============================  
  function updateGradeSummary(grade) {

    const pages = window.maxPagesByGrade;
    if (!pages || !pages[grade]) return;

    const saved = loadProgress(grade);
    const data = pages[grade];

    let done = 0;
    let total = 0;

    SUBJECTS.forEach(s => {
      const max = data[s] || 0;
      const val = saved[s] || 0;

      done += Math.min(val, max);
      total += max;
    });

    const percent =
      total > 0 ? Math.round((done / total) * 100) : 0;

    const el = document.getElementById("grade-progress-bar");

    if (el) {
      el.innerHTML = `
        <label>📘 Overall Progress (Grade ${grade}): ${percent}%</label>
        <progress value="${percent}" max="100"></progress>
      `;
    }
  }

  // ===============================  
  // EXPORTS  
  // ===============================  
  window.loadStudySection = loadStudySection;
  window.saveStudyProgress = saveStudyProgress;
  window.updateGradeSummary = updateGradeSummary;

  console.log("✅ Study Tracker loaded successfully");

})();
