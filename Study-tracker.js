// ===============================
// SUBJECT STANDARD
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

  inputs.forEach((input) => {
    const subject = input.dataset.subject;
    const value = Math.max(0, Number(input.value) || 0);
    saved[subject] = value;
  });

  localStorage.setItem(
    `grade_${grade}_progress`,
    JSON.stringify(saved)
  );

  updateGradeSummary(grade);
}

// ===============================
// CREATE SUBJECT CARD
// ===============================
function createSubject(name, maxPages, savedPages) {
  const percent =
    maxPages > 0
      ? Math.round((savedPages / maxPages) * 100)
      : 0;

  return `
    <div class="subject ${percent === 100 ? "complete" : ""}">
      <h3>${name}</h3>

      <input 
        class="subject-progress"
        type="number"
        min="0"
        max="${maxPages}"
        value="${savedPages}"
        data-subject="${name}"
        data-maxpages="${maxPages}"
      />

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

  const progress = container.querySelector("progress");
  const text = container.querySelector("p");

  if (progress) progress.value = value;
  if (text) text.textContent = `${percent}% complete`;

  container.classList.toggle("complete", percent === 100);
}

// ===============================
// LOAD STUDY SECTION
// ===============================
function loadStudySection(grade) {
  const data = window.maxPagesByGrade?.[grade];

  if (!data) {
    document.getElementById("main-content").innerHTML =
      `<p>Missing data for Grade ${grade}</p>`;
    return;
  }

  const saved = loadProgress(grade);

  let html = `
    <h2>📘 Grade ${grade} Study Tracker</h2>
    <div class="subjects-container">
  `;

  SUBJECTS.forEach((subject) => {
    const max = data[subject] || 0;
    const done = saved[subject] || 0;

    html += createSubject(subject, max, done);
  });

  html += `</div>`;

  const container = document.getElementById("main-content");
  container.innerHTML = html;

  document.querySelectorAll(".subject-progress").forEach((input) => {
    updateSubjectProgressUI(input);

    input.addEventListener("input", function () {
      updateSubjectProgressUI(this);
      saveStudyProgress(grade);
    });
  });

  updateGradeSummary(grade);
}

// ===============================
// SUMMARY SYSTEM
// ===============================
function updateGradeSummary(grade) {
  const saved = loadProgress(grade);
  const data = window.maxPagesByGrade?.[grade];

  if (!data) return;

  let totalDone = 0;
  let totalPages = 0;

  SUBJECTS.forEach((subject) => {
    const max = data[subject] || 0;
    const done = saved[subject] || 0;

    totalDone += Math.min(done, max);
    totalPages += max;
  });

  const percent = totalPages
    ? Math.round((totalDone / totalPages) * 100)
    : 0;

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
