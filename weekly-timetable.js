function loadWeeklyTimetable() {
  const tableData = {
    '9':  { days: 18, math: 18, physics: 18, chemistry: 10, biology: 10, english: 10, total: 64, score: 1152 },
    '10': { days: 22, math: 22, physics: 17, chemistry: 9, biology: 11, english: 9, total: 64, score: 1408 },
    '11': { days: 28, math: 28, physics: 19, chemistry: 11, biology: 11, english: 10, total: 64, score: 1792 },
    '12': { days: 22, math: 22, physics: 18, chemistry: 9, biology: 12, english: 11, total: 64, score: 1408 }
  };

  const container = document.getElementById("main-content");
  if (!container) return;

  let html = `
    <h2>📊 Weekly Timetable</h2>

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
          <th>Total / Day</th>
          <th>Total Pages</th>
        </tr>
      </thead>

      <tbody>
  `;

  Object.entries(tableData).forEach(([grade, r]) => {
    html += `
      <tr>
        <td><b>${grade}</b></td>
        <td>${r.days}</td>
        <td>${r.math}</td>
        <td>${r.physics}</td>
        <td>${r.chemistry}</td>
        <td>${r.biology}</td>
        <td>${r.english}</td>
        <td><b>${r.total}</b></td>
        <td><b>${r.score}</b></td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}
