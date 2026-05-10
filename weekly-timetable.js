function loadWeeklyTimetable() {

  const pages = window.maxPagesByGrade;

  const gradeDays = {
    9: 17,
    10: 22,
    11: 27,
    12: 24
  };

  const DAILY_TARGET = 64;

  const container = document.getElementById("main-content");
  if (!container) return;

  let html = `
    <h2>📊 90-Day Study Plan (Exact Daily Targets)</h2>

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

  [9, 10, 11, 12].forEach(g => {

    const d = pages[g];
    if (!d) return;

    const days = gradeDays[g];

    // TOTAL PAGES IN THIS GRADE
    const total =
      d.Math +
      d.Physics +
      d.Chemistry +
      d.Biology +
      d.English;

    // PROPORTIONAL DISTRIBUTION
    const math = Math.round((d.Math / total) * DAILY_TARGET);
    const physics = Math.round((d.Physics / total) * DAILY_TARGET);
    const chemistry = Math.round((d.Chemistry / total) * DAILY_TARGET);
    const biology = Math.round((d.Biology / total) * DAILY_TARGET);

    // Fix rounding drift → English absorbs difference
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
