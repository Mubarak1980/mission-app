function loadWeeklyTimetable() {

  const pages = window.maxPagesByGrade;

  const gradeDays = {
    9: 17, 10: 22, 11: 27, 12: 24
  };

  const container = document.getElementById("main-content");
  if (!container) return;

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

  const current = window.currentGrade;

  const progress = JSON.parse(
    localStorage.getItem(`grade_${current}_progress`) || "{}"
  );

  const gradeData = pages[current] || {};

  const backlog = {};
  let totalBacklog = 0;

  SUBJECTS.forEach(s => {
    const remaining = Math.max((gradeData[s] || 0) - (progress[s] || 0), 0);
    backlog[s] = remaining;
    totalBacklog += remaining;
  });

  window.studyBacklog = backlog;

  function weight(subject, base) {
    if (totalBacklog === 0) return base;

    const pressure = backlog[subject] / totalBacklog;
    return Math.round(base + pressure * DAILY_TARGET * 0.2);
  }

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

    let vals = SUBJECTS.map(s =>
      Math.round((d[s]/total)*DAILY_TARGET)
    );

    if (g === current) {
      vals = SUBJECTS.map((s,i) =>
        weight(s, vals[i])
      );
    }

    const sum = vals.reduce((a,b)=>a+b,0);

    html += `
      <tr>
        <td>${g}</td>
        <td>${gradeDays[g]}</td>
        <td>${vals[0]}</td>
        <td>${vals[1]}</td>
        <td>${vals[2]}</td>
        <td>${vals[3]}</td>
        <td>${vals[4]}</td>
        <td><b>${sum}</b></td>
        <td><b>${total}</b></td>
      </tr>
    `;
  });

  html += `</tbody></table>`;

  container.innerHTML = html;
}

window.loadWeeklyTimetable = loadWeeklyTimetable;
