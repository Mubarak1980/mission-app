function loadWeeklyTimetable() {

  const pages = window.maxPagesByGrade;

  const gradeDays = {
    9: 17,
    10: 22,
    11: 27,
    12: 24
  };

  const BASE_TARGET = 64;

  // ===============================
  // 🧠 STORAGE SYSTEM
  // ===============================
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  let state = JSON.parse(localStorage.getItem("studyState") || "{}");

  if (!state.startDate) {
    state.startDate = todayStr;
    state.lastVisit = todayStr;
    state.missedDays = 0;
    state.history = {}; // daily tracking
  }

  // ===============================
  // 🧠 SAFE MISS DETECTION
  // ===============================
  function dayDiff(a, b) {
    const ms = 1000 * 60 * 60 * 24;
    return Math.floor((new Date(b) - new Date(a)) / ms);
  }

  const gap = dayDiff(state.lastVisit, todayStr);

  // Only count missed if gap > 1 day
  if (gap > 1) {
    state.missedDays += (gap - 1);
  }

  state.lastVisit = todayStr;

  // ===============================
  // 📊 DAILY COMPLETION LOGIC
  // ===============================
  if (!state.history[todayStr]) {
    state.history[todayStr] = {
      completed: 0
    };
  }

  // ===============================
  // 🔥 SMART TARGET SYSTEM
  // ===============================
  const DAILY_TARGET = BASE_TARGET + (state.missedDays * 6);

  // Completion percentage (for future upgrade)
  const completedToday = state.history[todayStr].completed || 0;
  const progressPercent = Math.min(
    Math.round((completedToday / DAILY_TARGET) * 100),
    100
  );

  // ===============================
  // ⏳ FINISH DATE PREDICTION
  // ===============================
  const remainingPages =
    Object.values(pages[12] || {}).reduce((a, b) => a + b, 0);

  const estimatedDaysLeft = Math.ceil(
    remainingPages / DAILY_TARGET
  );

  const finishDate = new Date();
  finishDate.setDate(finishDate.getDate() + estimatedDaysLeft);

  // Save state
  localStorage.setItem("studyState", JSON.stringify(state));

  // ===============================
  // UI
  // ===============================
  const container = document.getElementById("main-content");
  if (!container) return;

  let html = `
    <h2>📊 Smart Weekly Tracker</h2>

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

      <p>✅ Today Progress: ${completedToday} / ${DAILY_TARGET}</p>

      <p>📊 Completion: ${progressPercent}%</p>

      <p>⏳ Estimated Finish: ${finishDate.toDateString()}</p>

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
  // TABLE LOGIC
  // ===============================
  [9, 10, 11, 12].forEach(g => {

    const d = pages[g];
    if (!d) return;

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
        <td>${gradeDays[g]}</td>
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
