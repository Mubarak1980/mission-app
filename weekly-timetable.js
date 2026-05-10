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

  // ===============================
  // 🧠 SMART STATE SYSTEM
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

  const BASE_TARGET = 64;
  const DAILY_TARGET = BASE_TARGET + (state.missedDays * 8);

  // ===============================
  // 🔗 CONNECTED STUDY DATA
  // ===============================
  const currentGrade = window.currentGrade || 9;

  const progress = JSON.parse(
    localStorage.getItem(`grade_${currentGrade}_progress`) || "{}"
  );

  const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English"];

  const gradeData = pages[currentGrade] || {};

  // ===============================
  // 📊 BACKLOG ENGINE (CLEAN)
  // ===============================
  const backlog = {};
  let totalBacklog = 0;

  SUBJECTS.forEach(sub => {
    const done = progress[sub] || 0;
    const total = gradeData[sub] || 0;

    const remaining = Math.max(total - done, 0);

    backlog[sub] = remaining;
    totalBacklog += remaining;
  });

  window.studyBacklog = backlog;

  // ===============================
  // 🎯 WEIGHT SYSTEM (SAFE + BALANCED)
  // ===============================
  function weight(subject, base) {
    const remaining = backlog[subject] || 0;

    if (totalBacklog === 0) return base;

    const pressure = remaining / totalBacklog;

    // controlled boost (prevents overloading)
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
      <p>📈 Daily Target: ${DAILY_TARGET} pages</p>
    </div>

    <div class="weekly-table-wrapper">
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
  // TABLE LOGIC (FIXED + STABLE)
  // ===============================
  [9, 10, 11, 12].forEach(g => {

    const d = pages[g];
    if (!d) return;

    const days = gradeDays[g];

    const total =
      d.Math + d.Physics + d.Chemistry + d.Biology + d.English;

    // base distribution
    let math = Math.round((d.Math / total) * DAILY_TARGET);
    let physics = Math.round((d.Physics / total) * DAILY_TARGET);
    let chemistry = Math.round((d.Chemistry / total) * DAILY_TARGET);
    let biology = Math.round((d.Biology / total) * DAILY_TARGET);
    let english = Math.round((d.English / total) * DAILY_TARGET);

    // ONLY apply intelligence to current grade
    if (g === currentGrade) {
      math = weight("Math", math);
      physics = weight("Physics", physics);
      chemistry = weight("Chemistry", chemistry);
      biology = weight("Biology", biology);
      english = weight("English", english);
    }

    const adjustedTotal =
      math + physics + chemistry + biology + english;

    html += `
      <tr>
        <td><b>${g}</b></td>
        <td>${days}</td>
        <td>${math}</td>
        <td>${physics}</td>
        <td>${chemistry}</td>
        <td>${biology}</td>
        <td>${english}</td>
        <td><b>${adjustedTotal}</b></td>
        <td><b>${total}</b></td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}
