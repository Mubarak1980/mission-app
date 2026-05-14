// ===============================
// Dashboard.js (FIXED WITH BOTTOM INFO)
// ===============================

function loadDashboard() {
    const subjects = ['Math', 'Physics', 'Chemistry', 'Biology', 'English'];
    const grades = [9, 10, 11, 12];
    const main = document.getElementById('main-content');
    
    if (!main || !window.maxPagesByGrade) return;

    // 1. Get the Smart Cycle data from main.js
    const smart = typeof getSmartCycle === 'function' ? getSmartCycle() : null;

    let html = `
        <div class="top-student-container">
            <h2>📊 Overall Academic Progress</h2>
            <p class="top-student-intro">This dashboard shows your average completion across all grades (9-12).</p>
        </div>
        <div class="dashboard-container">`;

    // 2. Build Subject Cards
    subjects.forEach(subject => {
        let totalPercent = 0;
        let count = 0;

        grades.forEach(grade => {
            const saved = JSON.parse(localStorage.getItem(`grade_${grade}_progress`) || "{}");
            const pagesRead = Number(saved[subject]) || 0;
            const maxPages = window.maxPagesByGrade[grade][subject] || 0;

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
                <p>${avgPercent}% Overall</p>
            </div>`;
    });

    html += `</div>`;

    // 3. ADD THE BOTTOM INFORMATION (Cycle Status)
    if (smart) {
        html += `
            <div class="top-student-card highlight-card" style="margin-top: 25px;">
                <h3>📉 90-Day Cycle Status</h3>
                <div style="display: flex; justify-content: space-between; font-size: 14px;">
                    <span>Actual: <b>${smart.actual}</b> pages</span>
                    <span>Expected: <b>${smart.expected}</b></span>
                </div>
                <div style="margin-top: 10px; font-size: 14px;">
                    <p>Status: <b>${smart.status}</b> (${smart.gap} pages)</p>
                    <p>Remaining Days: <b>${smart.remainingDays}</b></p>
                    <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.2); margin: 10px 0;">
                    <p style="font-size: 16px;">🔥 New Daily Target: <b>${smart.dailyLimit.target} pages/day</b></p>
                </div>
            </div>
        `;
    }

    main.innerHTML = html;

    const gradeBar = document.getElementById('grade-progress-bar');
    if (gradeBar) gradeBar.innerHTML = '';
}

window.loadDashboard = loadDashboard;
                       
