// ===============================
// 📊 WEEKLY TIMETABLE MODULE
// ===============================

const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English"];

// -------------------------------
// MAIN FUNCTION
// -------------------------------
function loadWeeklyTimetable() {

  const pages = window.maxPagesByGrade;

  const gradeDays = {
    9: 17,
    10: 22,
    11: 27,
    12: 24
  };

  const container = document.getElementById("main-content");
  if (!container) return;

  // -------------------------------
  // SMART STATE
  // -------------------------------
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  let state = JSON.parse(localStorage.getItem("studyState") || "{}");

  if (!state.startDate) {
    state.startDate = todayStr;
    state.lastVisit = todayStr;
    state.missedDays = 0;
  }

  const diff = (a, b) =>
    Math.floor((new Date(b) - new Date(a)) / 86400000);

  const missed = diff(state.lastVisit, todayStr);

  if (missed > 1) state.missedDays += (missed - 1);

  state.lastVisit = todayStr;
  localStorage.setItem("studyState", JSON.stringify(state));

  const BASE = 64;
  const DAILY = BASE + state.missedDays * 8;

  const grade = window.currentGrade || 9;

  const progress = JSON.parse(
    localStorage.getItem(`grade_${grade}_progress`) || "{}"
  );

  const gradeData = pages[grade] || {};

  // -------------------------------
  // BACKLOG
  // -------------------------------
  const backlog = {};
  let totalBacklog = 0;

  SUBJECTS.forEach((s) => {
    const remaining = Math.max(
      (gradeData[s] || 0) - (progress[s] || 0),
      0
    );

    backlog[s] = remaining;
    totalBacklog += remaining;
  });

  window.studyBacklog = backlog;

  function weight(subject, base) {
    if (!totalBacklog) return base;

    const pressure = backlog[subject] / totalBacklog;
    return Math.round(base + pressure * DAILY * 0.2);
  }

  // -------------------------------
  // TABLE UI
  // -------------------------------
  let html = `
    <h2>📊 Smart 90-Day Study Plan</h2>

    <div class="weekly-info">
      <p>📅 Today: ${today.toDateString()}</p>
      <p>🔥 Catch-up Level: ${state.missedDays}</p>
      <p>📈 Daily Target: ${DAILY}</p>
    </div>

    <table class="weekly-table">
      <thead>
        <tr>
          <th>Grade</th><th>Days</th>
          <th>Math</th><th>Physics</th><th>Chemistry</th><th>Biology</th><th>English</th>
          <th>Total/Day</th><th>Total</th>
        </tr>
      </thead>
      <tbody>
  `;

  [9,10,11,12].forEach(g => {

    const d = pages[g];
    if (!d) return;

    const total = SUBJECTS.reduce((a,s)=>a+(d[s]||0),0);

    let values = SUBJECTS.map(s =>
      Math.round((d[s]/total)*DAILY)
    );

    if (g === grade) {
      values = SUBJECTS.map((s,i)=>weight(s, values[i]));
    }

    const sum = values.reduce((a,b)=>a+b,0);

    html += `
      <tr>
        <td>${g}</td>
        <td>${gradeDays[g]}</td>
        <td>${values[0]}</td>
        <td>${values[1]}</td>
        <td>${values[2]}</td>
        <td>${values[3]}</td>
        <td>${values[4]}</td>
        <td><b>${sum}</b></td>
        <td><b>${total}</b></td>
      </tr>
    `;
  });

  html += `</tbody></table>`;

  container.innerHTML = html;
}

// -------------------------------
// EXPORT
// -------------------------------
window.loadWeeklyTimetable = loadWeeklyTimetable;
