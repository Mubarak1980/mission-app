// =====================================================
// 📊 DASHBOARD (SAFE + STEP 7 + SMART CYCLE FIXED)
// =====================================================

function loadDashboard() {
  currentSection = 'dashboard';

  if (typeof updateNavButtons === 'function') {
    updateNavButtons();
  }

  if (typeof nav !== 'undefined' && nav) {
    nav.style.display = 'none';
  }

  const subjects = ['Math', 'Physics', 'Chemistry', 'Biology', 'English'];
  const grades = [9, 10, 11, 12];

  const main = document.getElementById('main-content');
  if (!main) return;

  if (!window.maxPagesByGrade) {
    main.innerHTML = `<p>Error: grade data not loaded</p>`;
    return;
  }

  // ===============================
  // SAFE LOAD PROGRESS
  // ===============================
  function safeLoadProgress(grade) {
    try {
      if (typeof loadProgress === "function") {
        return loadProgress(grade) || {};
      }

      return JSON.parse(
        localStorage.getItem(`grade_${grade}_progress`) || "{}"
      );
    } catch (e) {
      return {};
    }
  }

  let dashboardContent = `
    <h2>📊 Dashboard: Overall Subject Progress</h2>
    <div class="dashboard-container">
  `;

  // ===============================
  // SUBJECT PROGRESS
  // ===============================
  subjects.forEach(subject => {
    let totalPercent = 0;
    let count = 0;

    grades.forEach(grade => {
      const saved = safeLoadProgress(grade);

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
        <p>${avgPercent}% progress in ${subject}</p>
      </div>
    `;
  });

  dashboardContent += `</div>`;

  main.innerHTML = dashboardContent;

  const progressContainer = document.getElementById('grade-progress-bar');
  if (progressContainer) progressContainer.innerHTML = '';

  // ===============================
  // STEP 7 SYSTEM STATUS
  // ===============================
  try {
    const system = typeof getSystemSnapshot === "function"
      ? getSystemSnapshot()
      : null;

    if (system) {
      main.innerHTML += `
        <div class="delay-section">
          <h2>⏱️ System Status</h2>
          <p>📅 Cycle Day: ${system.time.cycleDay}/90</p>
          <p>📊 Expected Pages: ${system.progress.expected}</p>
          <p>📚 Actual Pages: ${system.progress.actual}</p>
          <p>⚖️ Gap: ${system.progress.gap}</p>
          <p><b>Status: ${system.alerts.isOnTrack ? "ON TRACK" : "NEEDS ATTENTION"}</b></p>
          <p>📌 Daily Issues: ${system.alerts.delayCount}</p>
        </div>
      `;
    }
  } catch (e) {}

  // ===============================
  // 🧠 SMART CYCLE PANEL (FIXED POSITION)
  // ===============================
  try {
    if (typeof getSmartCycle === "function") {

      const smart = getSmartCycle();

      main.innerHTML += `
        <div class="smart-cycle-section">
          <h2>🧠 Smart Cycle</h2>

          <p>📊 Expected (weighted): ${smart.expected}</p>
          <p>📚 Actual (weighted): ${smart.actual}</p>
          <p>⚖️ Gap: ${smart.gap}</p>

          <hr/>

          <p>🚀 Catch-up Needed: ${smart.catchUpPerDay} pages/day</p>
          <p>🛡️ Safe Daily Limit: ${smart.dailyLimit.target}</p>

          <p>
            ⚠️ Burnout Risk:
            <b>${smart.dailyLimit.warning ? "HIGH" : "SAFE"}</b>
          </p>
        </div>
      `;
    }
  } catch (e) {}

}

window.loadDashboard = loadDashboard;
