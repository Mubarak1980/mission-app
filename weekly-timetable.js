// ===============================
// 📊 WEEKLY TIMETABLE (CLEAN VERSION)
// ===============================

function loadWeeklyTimetable() {

  const pages = window.maxPagesByGrade;

  // 🔥 safety check (FIXES YOUR ERROR)
  if (!pages) {
    document.getElementById("main-content").innerHTML =
      `<p style="color:red;">⚠️ Grade data not loaded</p>`;
    return;
  }

  const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English"];

  const gradeDays = {
    9: 17,
    10: 22,
    11: 27,
    12: 24
  };

  const container = document.getElementById("main-content");
  if (!container) return;

  // ===============================
  // 🧠 SMART STREAK SYSTEM
  // ===============================
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  let state = JSON.parse(localStorage.getItem("studyState") || "{}");

  if (!state.startDate) {
    state.startDate = todayStr;
    state.lastVisit = todayStr;
    state.missedDays = 0;
  }

  const daysBetween = (a, b) =>
    Math.floor((new Date(b) - new Date(a)) / 86400000);

  const missed = daysBetween(state.lastVisit, todayStr);

  if (missed > 1) state.missedDays += (missed - 1);

  state.lastVisit = todayStr;
  localStorage.setItem("studyState", JSON.stringify(state));

  const BASE_TARGET = 64;
  const DAILY_TARGET = BASE_TARGET + state.missedDays * 8;

  const current = window.currentGrade || 9;

  const progress = JSON.parse(
    localStorage.getItem(`grade_${current}_progress`) || "{}"
  );

  const gradeData = pages[current] || {};

  // ===============================
  // 📊 BACKLOG ENGINE
  // ===============================
  const backlog = {};
  let totalBacklog = 0;

  SUBJECTS.forEach(s => {
    const total = gradeData[s] || 0;
    const done = progress[s] || 0;

    const remaining = Math.max(total - done, 0);

    backlog[s] = remaining;
    totalBacklog += remaining;
  });

  window.studyBacklog = backlog;

  // ===============================
  // 🎯 WEIGHT SYSTEM
  // ===============================
  function weight(subject, base) {
    if (totalBacklog === 0) return base;

    const pressure = backlog[subject] / totalBacklog;
    return Math.round(base + pressure * DAILY_TARGET * 0.2);
  }

  // ===============================
  // UI HEADER
  // ===============================
  let html = `
    <h2>📊 Smart 90-Day Study Plan</h2>

    <div class="weekly-info">
      <p>📅 Today: ${today.toDateString()}</p>
      <p>🔥 Catch-up Level: ${state.missedDays}</p>
      <p>📈 Daily Target: ${DAILY_TARGET}</p>
    </div>

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
          <th>Total/Day</th>
          <th>Total Pages</th>
        </tr>
      </thead>
      <tbody>
  `;

  // ===============================
  // TABLE LOGIC (SAFE)
  // ===============================
  [9, 10, 11, 12].forEach(g => {

    const d = pages[g];
    if (!d) return;

    const days = gradeDays[g];

    const totalPages = SUBJECTS.reduce(
      (a, s) => a + (d[s] || 0),
      0
    );

    // 🔥 prevent divide-by-zero crash
    let vals = SUBJECTS.map(s => {
      if (totalPages === 0) return 0;
      return Math.round((d[s] / totalPages) * DAILY_TARGET);
    });

    // apply intelligence only to current grade
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
        <td><b>${totalPages}</b></td>
      </tr>
    `;
  });

  html += `</tbody></table>`;

  container.innerHTML = html;
}

// ===============================
// EXPORT
// ===============================
window.loadWeeklyTimetable = loadWeeklyTimetable;
