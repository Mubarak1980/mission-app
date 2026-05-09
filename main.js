// ===============================
// MAX PAGES CONFIG
// ===============================
window.maxPagesByGrade = window.maxPagesByGrade || {
  9:  { Math: 300, Physics: 200, Chemistry: 180, Biology: 160, English: 250 },
  10: { Math: 280, Physics: 210, Chemistry: 190, Biology: 170, English: 240 },
  11: { Math: 320, Physics: 230, Chemistry: 200, Biology: 180, English: 260 },
  12: { Math: 350, Physics: 250, Chemistry: 220, Biology: 200, English: 270 },
};

let currentGrade = 9;
let currentSection = 'study';

let nav, prevBtn, nextBtn;

const maxPagesByGrade = window.maxPagesByGrade;

// ===============================
// NAV BUTTONS
// ===============================
function updateNavButtons() {
  if (!nav || !prevBtn || !nextBtn) return;

  nav.style.display = 'flex';
  prevBtn.disabled = currentGrade === 9;
  nextBtn.disabled = currentGrade === 12;
}

// ===============================
// SAVE / LOAD PROGRESS
// ===============================
function saveProgress(grade) {
  const subjectInputs = document.querySelectorAll('.subject-progress');
  const saved = {};

  subjectInputs.forEach(input => {
    saved[input.dataset.subject] = Number(input.value) || 0;
  });

  localStorage.setItem(`grade_${grade}_progress`, JSON.stringify(saved));
  updateGradeSummary();
}

function loadProgress(grade) {
  try {
    return JSON.parse(localStorage.getItem(`grade_${grade}_progress`) || "{}");
  } catch {
    return {};
  }
}

// ===============================
// STUDY TRACKER UI
// ===============================
function createSubject(name, maxPages, savedPages) {
  const percent = maxPages > 0
    ? Math.round((savedPages / maxPages) * 100)
    : 0;

  return `
    <div class="subject">
      <h3>${name}</h3>

      <input class="subject-progress"
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

function loadStudySection(grade) {
  const subjects = ['Math', 'Physics', 'Chemistry', 'Biology', 'English'];
  const saved = loadProgress(grade);

  let html = `
    <h2>📘 Grade ${grade} Study Tracker</h2>
    <div class="subjects-container">
  `;

  subjects.forEach(s => {
    const max = maxPagesByGrade?.[grade]?.[s] || 0;
    html += createSubject(s, max, saved[s] || 0);
  });

  html += `</div>`;

  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = html;

  document.querySelectorAll('.subject-progress').forEach(input => {
    input.addEventListener('input', () => {
      let val = Math.max(
        0,
        Math.min(Number(input.value) || 0, Number(input.dataset.maxpages))
      );

      input.value = val;
      saveProgress(currentGrade);
    });
  });
}

// ===============================
// SUMMARY
// ===============================
function updateGradeSummary() {
  const subjects = ['Math', 'Physics', 'Chemistry', 'Biology', 'English'];
  const saved = loadProgress(currentGrade);

  let total = 0;
  let count = 0;

  subjects.forEach(s => {
    const max = maxPagesByGrade?.[currentGrade]?.[s];
    if (!max) return;

    total += ((saved[s] || 0) / max) * 100;
    count++;
  });

  const avg = count ? Math.round(total / count) : 0;

  const el = document.getElementById('grade-progress-bar');
  if (el) {
    el.innerHTML = `
      <label>📘 Overall Progress: ${avg}%</label>
      <progress value="${avg}" max="100"></progress>
    `;
  }
}

// ===============================
// NAVIGATION
// ===============================
function nextGrade() {
  if (currentGrade < 12) {
    saveProgress(currentGrade);
    currentGrade++;
    loadSection('study', currentGrade);
  }
}

function previousGrade() {
  if (currentGrade > 9) {
    saveProgress(currentGrade);
    currentGrade--;
    loadSection('study', currentGrade);
  }
}

function loadSection(type, grade) {
  currentSection = type;

  updateNavButtons();

  if (type === 'study') {
    loadStudySection(grade);
    updateGradeSummary();
  }
}

// ===============================
// WEEKLY TABLE
// ===============================
function loadWeeklyTimetable() {
  const tableData = {
    '9':  { days: 18, math: 18, physics: 18, chemistry: 10, biology: 10, english: 10, total: 64, score: 1152 },
    '10': { days: 22, math: 22, physics: 17, chemistry: 9, biology: 11, english: 9, total: 64, score: 1408 },
    '11': { days: 28, math: 28, physics: 19, chemistry: 11, biology: 11, english: 10, total: 64, score: 1792 },
    '12': { days: 22, math: 22, physics: 18, chemistry: 9, biology: 12, english: 11, total: 64, score: 1408 }
  };

  let html = `
    <h2>📊 Weekly Timetable</h2>
    <table class="weekly-table">
      <thead>
        <tr>
          <th>Grade</th>
          <th>Days</th>
          <th>Math</th>
          <th>Physics</th>
          <th>Chemistry</th>
          <th>Biology</th>
          <th>English</th>
          <th>Total Pages/Day</th>
          <th>Phase Total Pages</th>
        </tr>
      </thead>
      <tbody>
  `;

  Object.entries(tableData).forEach(([grade, g]) => {
    html += `
      <tr>
        <td>${grade}</td>
        <td>${g.days}</td>
        <td>${g.math}</td>
        <td>${g.physics}</td>
        <td>${g.chemistry}</td>
        <td>${g.biology}</td>
        <td>${g.english}</td>
        <td>${g.total}</td>
        <td>${g.score}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;

  const main = document.getElementById('main-content');
  if (main) main.innerHTML = html;
}

// ===============================
// INIT (SAFE)
// ===============================
window.addEventListener('load', () => {
  nav = document.getElementById('grade-nav');
  prevBtn = document.getElementById('prev-btn');
  nextBtn = document.getElementById('next-btn');

  if (typeof loadSection === 'function') {
    loadSection('study', currentGrade);
  }
});

// ===============================
// EXPORT
// ===============================
window.nextGrade = nextGrade;
window.previousGrade = previousGrade;
window.loadSection = loadSection;
window.loadWeeklyTimetable = loadWeeklyTimetable;

// ===============================
// SERVICE WORKER
// ===============================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
    }
