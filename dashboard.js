

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

  // safety check
  if (!window.maxPagesByGrade) {
    document.getElementById('main-content').innerHTML =
      `<p>Error: grade data not loaded</p>`;
    return;
  }

  let dashboardContent = `
    <h2>📊 Dashboard: Overall Subject Progress</h2>
    <div class="dashboard-container">
  `;

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

  dashboardContent += `
    </div>
  `;

  const main = document.getElementById('main-content');
  if (main) {
    main.innerHTML = dashboardContent;
  }

  const progressContainer = document.getElementById('grade-progress-bar');
  if (progressContainer) {
    progressContainer.innerHTML = '';
  }

  // =====================================================
  // ⏱️ ADDITION: DELAY DETECTION (SAFE - NO CHANGES ABOVE)
  // =====================================================

  const today = new Date().toISOString().split("T")[0];

  const plan = JSON.parse(localStorage.getItem("todayPlan") || "[]");
  const logs = JSON.parse(localStorage.getItem("dailyStudyLog") || "{}");
  const todayLog = logs[today] || {};

  function detectDelays(plan, todayLog) {
    const delays = [];

    plan.forEach(p => {
      const grade = p.grade;
      const subjectsPlan = p.subjects;

      const actual = todayLog[grade] || {};

      Object.keys(subjectsPlan).forEach(subject => {
        const planned = subjectsPlan[subject];
        const done = actual[subject] || 0;

        if (done < planned) {
          delays.push({
            grade,
            subject,
            missing: planned - done
          });
        }
      });
    });

    return delays;
  }

  const delays = detectDelays(plan, todayLog);

  let delayHTML = `
    <div class="delay-section">
      <h2>⏱️ Today's Delay Report</h2>
  `;

  if (delays.length === 0) {
    delayHTML += `<p>✅ No delays today. You are on track.</p>`;
  } else {
    delays.forEach(d => {
      delayHTML += `
        <p>📉 Grade ${d.grade} - ${d.subject}: 
        <b>${d.missing} pages behind</b></p>
      `;
    });
  }

  delayHTML += `</div>`;

  if (main) {
    main.innerHTML += delayHTML;
  }
}

// Expose globally
window.loadDashboard = loadDashboard;
