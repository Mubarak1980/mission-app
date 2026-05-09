// dashboard.js

function loadDashboard() {
  currentSection = 'dashboard';

  if (typeof updateNavButtons === 'function') {
    updateNavButtons();
  }

  // Hide grade navigation on dashboard
  if (typeof nav !== 'undefined' && nav) {
    nav.style.display = 'none';
  }

  const subjects = ['Math', 'Physics', 'Chemistry', 'Biology', 'English'];
  const grades = [9, 10, 11, 12];

  // safety check (VERY IMPORTANT for offline)
  if (!window.maxPagesByGrade) {
    document.getElementById('main-content').innerHTML =
      `<p>Error: grade data not loaded</p>`;
    return;
  }

  let dashboardContent =
    `<h2>📊 Dashboard: Overall Subject Progress</h2>
     <div class="dashboard-container">`;

  subjects.forEach(subject => {
    let totalPercent = 0;
    let count = 0;

    grades.forEach(grade => {
      const saved = (typeof loadProgress === 'function')
        ? loadProgress(grade)
        : {};

      const pagesRead = saved?.[subject] || 0;
      const maxPages = window.maxPagesByGrade?.[grade]?.[subject] || 0;

      if (maxPages > 0) {
        totalPercent += (pagesRead / maxPages) * 100;
        count++;
      }
    });

    const avgPercent = count ? Math.round(totalPercent / count) : 0;

    dashboardContent += `
      <div class="dashboard-subject">
        <h3>${subject}</h3>

        <progress value="${avgPercent}" max="100"></progress>

        <p>${avgPercent}% progress in ${subject} (Grades 9–12)</p>
      </div>
    `;
  });

  dashboardContent += `</div>`;

  const main = document.getElementById('main-content');
  if (main) {
    main.innerHTML = dashboardContent;
  }

  const progressContainer = document.getElementById('grade-progress-bar');
  if (progressContainer) {
    progressContainer.innerHTML = '';
  }
}

// Expose globally
window.loadDashboard = loadDashboard;
