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

  localStorage.setItem(`grade_${grade}_progress`, JSON.stringify(saved));
  updateGradeSummary(grade);
}

// ===============================
// UI CREATION
// ===============================
function createSubject(name, maxPages, savedPages) {
  const percent =
    maxPages > 0 ? Math.round((savedPages / maxPages) * 100) : 0;

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
// LIVE UPDATE
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
// LOAD STUDY SECTION
// ===============================
function loadStudySection(grade) {
  const data = window.maxPagesByGrade?.[grade];
  if (!data) return;

  const saved = loadProgress(grade);

  let html = `<h2>📘 Grade ${grade} Study Tracker</h2>
  <div class="subjects-container">`;

  SUBJECTS.forEach((subject) => {
    html += createSubject(subject, data[subject], saved[subject] || 0);
  });

  html += `</div>`;

  document.getElementById("main-content").innerHTML = html;

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
// SUMMARY
// ===============================
function updateGradeSummary(grade) {
  const saved = loadProgress(grade);
  const data = window.maxPagesByGrade?.[grade];
  if (!data) return;

  let totalDone = 0;
  let totalPages = 0;

  SUBJECTS.forEach((s) => {
    totalDone += Math.min(saved[s] || 0, data[s]);
    totalPages += data[s];
  });

  const percent = Math.round((totalDone / totalPages) * 100);

  const el = document.getElementById("grade-progress-bar");
  if (el) {
    el.innerHTML = `
      <label>📘 Overall Progress (Grade ${grade}): ${percent}%</label>
      <progress value="${percent}" max="100"></progress>
    `;
  }
}

// ===============================
// 🔗 CONNECTION API (IMPORTANT)
// ===============================
function getStudyState(grade) {
  const saved = loadProgress(grade);
  const data = window.maxPagesByGrade?.[grade];
  if (!data) return null;

  let weak = [];
  let totalDone = 0;
  let totalPages = 0;

  const subjects = {};

  SUBJECTS.forEach((s) => {
    const done = saved[s] || 0;
    const total = data[s];

    const ratio = total ? done / total : 0;

    subjects[s] = { done, total, ratio };

    totalDone += Math.min(done, total);
    totalPages += total;

    if (ratio < 0.5) weak.push(s);
  });

  return {
    subjects,
    weakSubjects: weak,
    overallPercent: totalPages ? totalDone / totalPages : 0
  };
}

// expose
window.getStudyState = getStudyState;

// exports
window.loadStudySection = loadStudySection;
window.saveStudyProgress = saveStudyProgress;
window.updateGradeSummary = updateGradeSummary;
