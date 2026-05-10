// ===============================
// 📘 SUBJECT STANDARD (FIXED)
// ===============================
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
  const percent = maxPages
    ? Math.round((savedPages / maxPages) * 100)
    : 0;

  return `
    <div class="subject ${percent === 100 ? "complete" : ""}">
      <h3>${name}</h3>

      <input class="subject-progress"
        type="number"
        min="0"
        max="${maxPages}"
        value="${savedPages}"
        data-subject="${name}"
        data-maxpages="${maxPages}" />

      <progress value="${savedPages}" max="${maxPages}"></progress>
      <p>${percent}% complete</p>
    </div>
  `;
}

// ===============================
// LIVE UPDATE UI
// ===============================
function updateSubjectProgressUI(input) {
  let value = Math.max(0, Number(input.value) || 0);
  const max = Number(input.dataset.maxpages);

  if (value > max) value = max;
  input.value = value;

  const percent = max ? Math.round((value / max) * 100) : 0;

  const container = input.closest(".subject");
  if (!container) return;

  container.querySelector("progress").value = value;
  container.querySelector("p").textContent = `${percent}% complete`;

  container.classList.toggle("complete", percent === 100);
}

// ===============================
// LOAD STUDY SECTION (SAFE)
// ===============================
function loadStudySection(grade) {
  const container = document.getElementById("main-content");

  if (!container) {
    console.error("❌ main-content not found");
    return;
  }

  const data = window.maxPagesByGrade?.[grade];

  if (!data) {
    container.innerHTML = `<p style="color:red;">⚠️ Grade data not loaded</p>`;
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
// SUMMARY (SAFE)
// ===============================
function updateGradeSummary(grade) {
  const saved = loadProgress(grade);
  const data = window.maxPagesByGrade?.[grade];

  if (!data) return;

  let done = 0;
  let total = 0;

  SUBJECTS.forEach(s => {
    done += Math.min(saved[s] || 0, data[s]);
    total += data[s];
  });

  const percent = total ? Math.round((done / total) * 100) : 0;

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
