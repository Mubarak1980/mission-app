// =====================================================
// 📊 DASHBOARD (FINAL CLEAN + NON-CONFLICT VERSION)
// =====================================================

function loadDashboard() {
    // Set section state
    window.currentSection = 'dashboard';

    // Update navigation if function exists
    if (typeof updateNavButtons === 'function') {
        updateNavButtons();
    }

    // Hide sub-nav (Grade 9, 10, etc.) on Dashboard
    const nav = document.querySelector('.section-buttons'); 
    if (nav) nav.style.display = 'none';

    const subjects = ['Math', 'Physics', 'Chemistry', 'Biology', 'English'];
    const grades = [9, 10, 11, 12];

    const main = document.getElementById('main-content');
    if (!main) return;

    // Check for global data
    if (!window.maxPagesByGrade) {
        main.innerHTML = `<p>Error: grade data not loaded</p>`;
        return;
    }

    // ===============================
    // SAFE LOAD PROGRESS
    // ===============================
    const safeLoadProgress = (grade) => {
        try {
            // Checks if a global loadProgress exists, otherwise hits localStorage
            return (typeof loadProgress === 'function') ? loadProgress(grade) : 
                   JSON.parse(localStorage.getItem(`grade_${grade}_progress`) || "{}");
        } catch (e) {
            return {};
        }
    };

    // ===============================
    // BUILD HTML (Top Section)
    // ===============================
    let html = `<h2>📊 Dashboard: Overall Subject Progress</h2><div class="dashboard-container">`;

    // ===============================
    // SUBJECT PROGRESS CARDS
    // ===============================
    subjects.forEach(subject => {
        let totalPercent = 0;
        let count = 0;

        grades.forEach(grade => {  
            const saved = safeLoadProgress(grade);  
            const pagesRead = Number(saved[subject]) || 0;  
            const maxPages = window.maxPagesByGrade[grade]?.[subject] || 0;  

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
            </div>`;
    });

    html += `</div>`;

    // ===============================
    // CYCLE INFO (Display Only)
    // ===============================
    // Check if getSystemSnapshot is defined in main.js
    const system = (typeof getSystemSnapshot === 'function') ? getSystemSnapshot() : null;

    if (system && system.time) {
        html += `
            <div class="delay-section">
                <h2>⏱️ Cycle Info</h2>
                <p>📅 Day: ${system.time.cycleDay}/90</p>
            </div>`;
    }

    // ===============================
    // 🧠 SMART CYCLE (THE TRUTH DISPLAY)
    // ===============================
    // Check if getSmartCycle is defined in main.js
    const smart = (typeof getSmartCycle === 'function') ? getSmartCycle() : null;

    if (smart && smart.expected !== undefined) {
        const progressRate = smart.expected > 0 ? ((smart.actual / smart.expected) * 100).toFixed(1) : 0;  

        html += `  
            <div class="top-student-card highlight-card" style="margin-top: 20px;">  
                <h2>🧠 Smart Study Engine</h2>  
                <p>📊 Expected: <b>${smart.expected}</b> pages</p>  
                <p>📚 Progress: <b>${smart.actual}</b> pages</p>  
                <p>⚖️ Difference (Gap): <b>${smart.gap}</b></p>  
                <p>📈 Progress Rate: <b>${progressRate}%</b></p>  
                <hr style="border:0; border-top: 1px solid rgba(255,255,255,0.2); margin: 10px 0;"/>  
                <p>🚀 Catch-up Plan: <b>${smart.catchUpPerDay ?? 0}</b> pages/day</p>  
                <p>🛡️ Safe Limit: <b>${smart.dailyLimit?.target ?? 0}</b> pages/day</p>  
                <p>⚠️ Burnout Risk: <b>${smart.dailyLimit?.warning ? "🔴 HIGH" : "🟢 SAFE"}</b></p>  
            </div>`;
    }

    // FINAL RENDER
    main.innerHTML = html;

    // Clear the small grade bar if it exists
    const bar = document.getElementById('grade-progress-bar');
    if (bar) bar.innerHTML = '';
}

window.loadDashboard = loadDashboard;
            
