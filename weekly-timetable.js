function loadWeeklyTimetable() {

  const pages = window.maxPagesByGrade;

  const container = document.getElementById("main-content");
  if (!container) return;

  const grades = [9, 10, 11, 12];

  let html = `
    <h2>📊 Weekly Study Distribution (Real Pages System)</h2>

    <table class="weekly-table">
      <thead>
        <tr>
          <th>Grade</th>
          <th>Total Pages</th>
          <th>Math</th>
          <th>Physics</th>
          <th>Chemistry</th>
          <th>Biology</th>
          <th>English</th>
          <th>Avg Pages / Day (90 days)</th>
        </tr>
      </thead>

      <tbody>
  `;

  grades.forEach(g => {

    const data = pages[g];

    if (!data) return;

    const total =
      data.Math +
      data.Physics +
      data.Chemistry +
      data.Biology +
      data.English;

    const perDay = Math.round(total / 90);

    html += `
      <tr>
        <td><b>${g}</b></td>
        <td><b>${total}</b></td>
        <td>${data.Math}</td>
        <td>${data.Physics}</td>
        <td>${data.Chemistry}</td>
        <td>${data.Biology}</td>
        <td>${data.English}</td>
        <td><b>${perDay}</b></td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}
