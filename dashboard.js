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

  if (!window.maxPagesByGrade) {
    document.getElementById('main-content').innerHTML =
      `<p>Error: grade data not loaded</p>`;
    return;
  }

  let dashboardContent = `
    <h2>📊 Dashboard: Overall Subject Progress</h2>
    <div class="dashboard-container">
  `;

  // ===============================
  // 📊 SUBJECT PERFORMANCE ENGINE
  // ===============================
  subjects.forEach(subject => {
    let totalPercent = 0;
    let count = 0;

    grades.forEach(grade => {
      const saved = loadProgress?.(grade) || {};
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

  const main = document.getElementById('main-content');
  if (main) main.innerHTML = dashboardContent;

  const progressContainer = document.getElementById('grade-progress-bar');
  if (progressContainer) progressContainer.innerHTML = '';

  // =====================================================
  // ⏱️ STEP 4 — HYBRID DELAY ENGINE (FIXED + STABLE)
  // =====================================================

  const today = new Date().toISOString().split("T")[0];

  const plan = JSON.parse(localStorage.getItem("todayPlan") || "[]");
  const logs = JSON.parse(localStorage.getItem("dailyStudyLog") || "{}");
  const todayLog = logs[today] || {};

  let delayHTML = `
    <div class="delay-section">
      <h2>⏱️ Delay Report</h2>
  `;

  // ===============================
  // CASE 1: DAILY PLAN SYSTEM
  // ===============================
  if (Array.isArray(plan) && plan.length > 0) {

    let delays = [];

    plan.forEach(p => {
      if (!p.grade || !p.subjects) return;

      const actual = todayLog[p.grade] || {};

      Object.keys(p.subjects).forEach(subject => {
        const planned = Number(p.subjects[subject]) || 0;
        const done = Number(actual[subject]) || 0;

        if (done < planned) {
          delays.push({
            grade: p.grade,
            subject,
            missing: planned - done
          });
        }
      });
    });

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

  }

  // ===============================
  // CASE 2: FALLBACK (90-DAY ENGINE)
  // ===============================
  else if (typeof getDelayStatus === "function") {

    const cycle = getDelayStatus();

    delayHTML += `
      <p>📅 Cycle Day: ${cycle.cycleDay}/90</p>
      <p>📊 Expected Pages: ${cycle.expectedPages}</p>
      <p>📚 Actual Pages: ${cycle.actualPages}</p>
      <p>⚖️ Gap: ${cycle.gap}</p>
      <p><b>🚦 Status: ${cycle.status}</b></p>
    `;
  }

  // ===============================
  // CASE 3: NO DATA
  // ===============================
  else {
    delayHTML += `<p>⚠️ No tracking data available</p>`;
  }

  delayHTML += `</div>`;

  if (main) main.innerHTML += delayHTML;
}

window.loadDashboard = loadDashboard;
