// js/top-student-mode.js

function loadTopStudentMode() {
  const mainContent = document.getElementById('main-content');

  if (!mainContent) {
    console.error('Main content container not found');
    return;
  }

  // Safe grade fallback (prevents "undefined" bugs)
  const grade =
    (typeof window.currentGrade === 'number' &&
      window.currentGrade >= 9 &&
      window.currentGrade <= 12)
      ? window.currentGrade
      : 12;

  mainContent.innerHTML = `
    <div class="top-student-container">
      <h2>🎓 Top Student Mode - Grade ${grade}</h2>

      <p class="top-student-intro">
        Upgrade your study performance with focused strategies.
      </p>

      <div class="top-student-card">
        <h3>📌 Daily Strategy</h3>
        <ul>
          <li>Study 2–3 subjects daily (no multitasking overload)</li>
          <li>Revise before sleeping (memory reinforcement)</li>
          <li>Use active recall instead of reading only</li>
        </ul>
      </div>

      <div class="top-student-card">
        <h3>📊 Score Strategy</h3>
        <ul>
          <li>Focus on weak subjects first</li>
          <li>Track progress every day</li>
          <li>Complete at least 70% revision before exams</li>
        </ul>
      </div>

      <div class="top-student-card">
        <h3>🚀 Motivation Rule</h3>
        <p>
          Consistency beats intelligence. Small daily progress = top rank.
        </p>
      </div>
    </div>
  `;
}

// Expose globally
window.loadTopStudentMode = loadTopStudentMode;
