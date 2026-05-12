// =====================================================
// 📊 DASHBOARD (SAFE + STEP 7 + SMART CYCLE FIXED)
// =====================================================

function loadDashboard() {
  currentSection = 'dashboard';

  updateNavButtons?.();

  if (nav) nav.style.display = 'none';

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
  const safeLoadProgress = (grade) => {
    try {
      return loadProgress?.(grade) ||
        JSON.parse(localStorage.getItem(`grade_${grade}_progress`) || "{}");
    } catch {
      return {};
    }
  };

  // ===============================
  // BUILD SINGLE HTML OUTPUT
  // ===============================
  let html = `
    <h2>📊 Dashboard: Overall Subject Progress</h2>
    <div class="dashboard-container">
  `;

  // ===============================
  // SUBJECT PROGRESS ENGINE
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

    html += `
      <div class="dashboard-subject">
        <h3>${subject}</h3>
        <progress value="${avgPercent}" max="100"></progress>
        <p>${avgPercent}% progress in ${subject}</p>
      </div>
    `;
  });

  html += `</div>`;

  // ===============================
  // STEP 7 SYSTEM STATUS (SAFE)
  // ===============================
  const system = getSystemSnapshot?.();

  if (system?.time) {
    html += `
      <div class="delay-section">
        <h2>⏱️ System Status</h2>
        <p>📅 Cycle Day: ${system.time.cycleDay}/90</p>
        <p>📊 Expected Pages: ${system.progress?.expected ?? 0}</p>
        <p>📚 Actual Pages: ${system.progress?.actual ?? 0}</p>
        <p>⚖️ Gap: ${system.progress?.gap ?? 0}</p>
        <p><b>Status: ${system.alerts?.isOnTrack ? "ON TRACK" : "NEEDS ATTENTION"}</b></p>
        <p>📌 Daily Issues: ${system.alerts?.delayCount ?? 0}</p>
      </div>
    `;
  }

  // ===============================
  // SMART CYCLE PANEL (SAFE)
  // ===============================
  const smart = getSmartCycle?.();

  if (smart?.expected !== undefined) {
    html += `
      <div class="smart-cycle-section">
        <h2>🧠 Smart Cycle</h2>

        <p>📊 Expected (weighted): ${smart.expected ?? 0}</p>
        <p>📚 Actual (weighted): ${smart.actual ?? 0}</p>
        <p>⚖️ Gap: ${smart.gap ?? 0}</p>

        <hr/>

        <p>🚀 Catch-up Needed: ${smart.catchUpPerDay ?? 0} pages/day</p>
        <p>🛡️ Safe Daily Limit: ${smart.dailyLimit?.target ?? 0}</p>

        <p>
          ⚠️ Burnout Risk:
          <b>${smart.dailyLimit?.warning ? "HIGH" : "SAFE"}</b>
        </p>
      </div>
    `;
  }

  // ===============================
  // FINAL RENDER (ONLY ONCE)
  // ===============================
  main.innerHTML = html;

  const bar = document.getElementById('grade-progress-bar');
  if (bar) bar.innerHTML = '';
}

window.loadDashboard = loadDashboard;
