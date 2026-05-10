// ===============================
// 📊 WEEKLY TIMETABLE (FIXED STABLE VERSION)
// ===============================

function loadWeeklyTimetable() {

  const pages = window.maxPagesByGrade;

  const container = document.getElementById("main-content");
  if (!container) return;

  if (!pages) {
    container.innerHTML = `<p style="color:red;">⚠️ Grade data not loaded</p>`;
    return;
  }

  const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English"];

  const gradeDays = {
    9: 17,
    10: 22,
    11: 27,
    12: 24
  };

  const today = new Date();

  let state = JSON.parse(localStorage.getItem("studyState") || "{}");

  if (!state.missedDays) state.missedDays = 0;

  const BASE_TARGET = 64;
  const DAILY_TARGET = BASE_TARGET + state.missedDays * 8;

  const current = window.currentGrade || 9;

  const gradeData = pages[current];

  if (!gradeData) {
    container.innerHTML = `<p style="color:red;">⚠️ Invalid grade</p>`;
    return;
  }

  const progress = JSON.parse(
    localStorage.getItem(`grade_${current}_progress`) || "{}"
  );

  const backlog = {};
  let totalBacklog = 0;

  SUBJECTS.forEach(s => {
    const remaining = Math.max((gradeData[s] || 0) - (progress[s] || 0), 0);
    backlog[s] = remaining;
    totalBacklog += remaining;
  });

  function weight(subject, base) {
    if (totalBacklog === 0) return base;

    const pressure = backlog[subject] / totalBacklog;
    return Math.round(base + pressure * DAILY_TARGET * 0.2);
  }

  let html = `
    <h2>📊 Smart Weekly Plan</h2>
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
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
  `;

  [9, 10, 11, 12].forEach(g => {

    const d = pages[g];
    if (!d) return;

    const days = gradeDays[g] || 0;

    const totalPages = SUBJECTS.reduce((a, s) => a + (d[s] || 0), 0);

    let vals = SUBJECTS.map(s =>
      totalPages ? Math.round((d[s] / totalPages) * DAILY_TARGET) : 0
    );

    if (g === current) {
      vals = SUBJECTS.map((s, i) => weight(s, vals[i]));
    }

    const sum = vals.reduce((a, b) => a + b, 0);

    html += `
      <tr>
        <td>${g}</td>
        <td>${days}</td>
        <td>${vals[0]}</td>
        <td>${vals[1]}</td>
        <td>${vals[2]}</td>
        <td>${vals[3]}</td>
        <td>${vals[4]}</td>
        <td><b>${sum}</b></td>
      </tr>
    `;
  });

  html += `</tbody></table>`;

  container.innerHTML = html;
}

window.loadWeeklyTimetable = loadWeeklyTimetable;
