function loadWeeklyTimetable() {

  const pages = window.maxPagesByGrade;

  const gradeDays = {
    9: 17,
    10: 22,
    11: 27,
    12: 24
  };

  // ===============================
  // 🧠 SMART SYSTEM
  // ===============================

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  let state = JSON.parse(localStorage.getItem("studyState") || "{}");

  if (!state.startDate) {
    state.startDate = todayStr;
    state.lastVisit = todayStr;
    state.missedDays = 0;
  }

  function daysBetween(a, b) {
    return Math.floor((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
  }

  const missed = daysBetween(state.lastVisit, todayStr);

  if (missed > 1) {
    state.missedDays += (missed - 1);
  }

  state.lastVisit = todayStr;
  localStorage.setItem("studyState", JSON.stringify(state));

  // 🔥 ADAPTIVE DAILY TARGET
  const BASE_TARGET = 64;
  const DAILY_TARGET = BASE_TARGET + (state.missedDays * 8);

  // ===============================
  // UI CONTAINER
  // ===============================
  const container = document.getElementById("main-content");
  if (!container) return;

  // ===============================
  // HEADER INFO (SMART PANEL)
  // ===============================
  let html = `
    <h2>📊 Smart 90-Day Study Plan</h2>

    <div style="
      background: var(--card);
      padding: 12px;
      border-radius: 12px;
      border: 1px solid var(--border);
      margin-bottom: 12px;
    ">
      <p>📅 Today: ${today.toDateString()}</p>
      <p>🔥 Catch-up Level: ${state.missedDays}</p>
      <p>📈 Daily Target: ${DAILY_TARGET} pages</p>
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
  // TABLE LOGIC (UNCHANGED CORE)
  // ===============================
  [9, 10, 11, 12].forEach(g => {

    const d = pages[g];
    if (!d) return;

    const days = gradeDays[g];

    const total =
      d.Math +
      d.Physics +
      d.Chemistry +
      d.Biology +
      d.English;

    const math = Math.round((d.Math / total) * DAILY_TARGET);
    const physics = Math.round((d.Physics / total) * DAILY_TARGET);
    const chemistry = Math.round((d.Chemistry / total) * DAILY_TARGET);
    const biology = Math.round((d.Biology / total) * DAILY_TARGET);

    const english =
      DAILY_TARGET - (math + physics + chemistry + biology);

    html += `
      <tr>
        <td><b>${g}</b></td>
        <td>${days}</td>
        <td>${math}</td>
        <td>${physics}</td>
        <td>${chemistry}</td>
        <td>${biology}</td>
        <td>${english}</td>
        <td><b>${DAILY_TARGET}</b></td>
        <td><b>${total}</b></td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}
