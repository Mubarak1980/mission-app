// Study-tracker.js

// ===============================
// LOAD SAVED PROGRESS
// ===============================
function loadProgress(grade) {
  const saved = localStorage.getItem(`grade_${grade}_progress`);
  return saved ? JSON.parse(saved) : {};
}

// ===============================
// SAVE PROGRESS
// ===============================
function saveStudyProgress(grade) {
  const subjectInputs = document.querySelectorAll('.subject-progress');
  const saved = {};

  subjectInputs.forEach(input => {
    const subject = input.dataset.subject;
    const value = Number(input.value) || 0;
    saved[subject] = value;
  });

  localStorage.setItem(`grade_${grade}_progress`, JSON.stringify(saved));

  updateGradeSummary(grade);
}

// ===============================
// CREATE SUBJECT BLOCK
// ===============================
function createSubject(name, maxPages, savedPages) {
  const progressPercent =
    maxPages > 0 ? Math.round((savedPages / maxPages) * 100) : 0;

  const completeClass = progressPercent === 100 ? 'complete' : '';

  return `
    <div class="subject ${completeClass}">
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

      <p>${progressPercent}% complete</p>
    </div>
  `;
}

// ===============================
// UPDATE SINGLE INPUT UI
// ===============================
function updateSubjectProgressUI(input) {
  let pages = Number(input.value) || 0;
  const maxPages = Number(input.dataset.maxpages);

  if (pages > maxPages) pages = maxPages;
  if (pages < 0) pages = 0;

  input.value = pages;

  const percent =
    maxPages > 0 ? Math.round((pages / maxPages) * 100) : 0;

  const container = input.closest('.subject');

  if (container) {
    const progress = container.querySelector('progress');
    const text = container.querySelector('p');

    if (progress) progress.value = pages;
    if (text) text.textContent = `${percent}% complete`;

    if (percent === 100) {
      container.classList.add('complete');
    } else {
      container.classList.remove('complete');
    }
  }
}

// ===============================
// LOAD STUDY SECTION
// ===============================
function loadStudySection(grade) {
  const subjects = ['Math', 'Physics', 'Chemistry', 'Biology', 'English'];

  if (!window.maxPagesByGrade || !window.maxPagesByGrade[grade]) {
    document.getElementById('main-content').innerHTML =
      `<p>Error: missing data for Grade ${grade}</p>`;
    return;
  }

  const savedProgress = loadProgress(grade);

  let content =
    `<h2>📘 Grade ${grade} Study Tracker</h2>
     <div class="subjects-container">`;

  subjects.forEach(subject => {
    const maxPages = window.maxPagesByGrade[grade][subject] || 0;
    const savedPages = savedProgress[subject] || 0;

    content += createSubject(subject, maxPages, savedPages);
  });

  content += `</div>`;

  document.getElementById('main-content').innerHTML = content;

  document.querySelectorAll('.subject-progress').forEach(input => {
    updateSubjectProgressUI(input);

    input.addEventListener('input', function () {
      updateSubjectProgressUI(this);
      saveStudyProgress(grade);
    });
  });

  updateGradeSummary(grade);
}

// ===============================
// SUMMARY BAR
// ===============================
function updateGradeSummary(grade) {
  const subjects = ['Math', 'Physics', 'Chemistry', 'Biology', 'English'];

  const saved = loadProgress(grade);

  let totalPercent = 0;
  let count = 0;

  if (!window.maxPagesByGrade || !window.maxPagesByGrade[grade]) return;

  subjects.forEach(subject => {
    const maxPages = window.maxPagesByGrade[grade][subject] || 0;
    const pages = saved[subject] || 0;

    if (maxPages > 0) {
      totalPercent += (pages / maxPages) * 100;
      count++;
    }
  });

  const avg = count ? Math.round(totalPercent / count) : 0;

  const el = document.getElementById('grade-progress-bar');

  if (el) {
    el.innerHTML = `
      <label>📘 Overall Progress for Grade ${grade}: ${avg}%</label>
      <progress value="${avg}" max="100"></progress>
    `;
  }
}

// ===============================
// GLOBAL EXPORT
// ===============================
window.loadStudySection = loadStudySection;
window.saveStudyProgress = saveStudyProgress;
window.updateGradeSummary = updateGradeSummary;
