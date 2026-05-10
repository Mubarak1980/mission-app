function loadWeeklyTimetable() {

  const pages = window.maxPagesByGrade;

  const gradeDays = {
    9: 22,
    10: 22,
    11: 23,
    12: 23
  };

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
          <th>Total Pages</th>
        </tr>
      </thead>
      <tbody>
  `;

  [9, 10, 11, 12].forEach(g => {

    const d = pages[g];
    if (!d) return;

    const days = gradeDays[g];

    // DAILY per subject
    const math = Math.ceil(d.Math / days);
    const physics = Math.ceil(d.Physics / days);
    const chemistry = Math.ceil(d.Chemistry / days);
    const biology = Math.ceil(d.Biology / days);
    const english = Math.ceil(d.English / days);

    const total =
      d.Math +
      d.Physics +
      d.Chemistry +
      d.Biology +
      d.English;

    html += `
      <tr>
        <td><b>${g}</b></td>
        <td>${days}</td>
        <td>${math}</td>
        <td>${physics}</td>
        <td>${chemistry}</td>
        <td>${biology}</td>
        <td>${english}</td>
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
