// =====================================================
// 📊 DASHBOARD (FINAL CLEAN + NON-CONFLICT VERSION)
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
  // BUILD HTML
  // ===============================
  let html = `
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
  // CYCLE INFO (PURE DISPLAY ONLY)
  // ===============================
  const system = getSystemSnapshot?.();

  if (system?.time) {
    html += `
      <div class="delay-section">
        <h2>⏱️ Cycle Info</h2>
        <p>📅 Day: ${system.time.cycleDay}/90</p>
      </div>
    `;
  }

  // ===============================
  // 🧠 SMART CYCLE (CLEAR TRUTH DISPLAY)
  // ===============================
  const smart = getSmartCycle?.();

  if (smart && smart.expected !== undefined) {

    const progressRate =
      smart.expected > 0
        ? ((smart.actual / smart.expected) * 100).toFixed(1)
        : 0;

    html += `
      <div class="smart-cycle-section">
        <h2>🧠 Smart Study Engine</h2>

        <p>📊 Expected : ${smart.expected}</p>

        <p>📚 Progress: ${smart.actual}</p>

        <p>⚖️ Difference (Gap): ${smart.gap}</p>

        <p>📈 Progress Rate: ${progressRate}%</p>

        <hr/>

        <p>🚀 Catch-up Plan: ${smart.catchUpPerDay ?? 0} pages/day</p>

        <p>🛡️ Safe Limit: ${smart.dailyLimit?.target ?? 0} pages/day</p>

        <p>
          ⚠️ Burnout Risk:
          <b>${smart.dailyLimit?.warning ? "HIGH" : "SAFE"}</b>
        </p>
      </div>
    `;
  }

  // ===============================
  // FINAL RENDER
  // ===============================
  main.innerHTML = html;

  const bar = document.getElementById('grade-progress-bar');
  if (bar) bar.innerHTML = '';
}

window.loadDashboard = loadDashboard;
