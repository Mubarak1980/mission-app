// ===============================
// Dashboard.js (FINAL ENHANCED)
// ===============================

function loadDashboard() {
    const subjects = ['Math', 'Physics', 'Chemistry', 'Biology', 'English'];
    const grades = [9, 10, 11, 12];
    const main = document.getElementById('main-content');
    
    // Ensure the main container and global data exist before running
    if (!main || !window.maxPagesByGrade) {
        console.error("Dashboard failed to load: Missing container or maxPagesByGrade data.");
        return;
    }

    let html = `
        <div class="top-student-container">
            <h2>📊 Overall Academic Progress</h2>
            <p class="top-student-intro">This dashboard shows your average completion across all grades (9-12).</p>
        </div>
        <div class="dashboard-container">`;

    subjects.forEach(subject => {
        let totalPercent = 0;
        let count = 0;

        grades.forEach(grade => {
            // Retrieve saved progress for the specific grade
            const storageKey = `grade_${grade}_progress`;
            const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
            
            const pagesRead = Number(saved[subject]) || 0;
            const maxPages = window.maxPagesByGrade[grade][subject] || 0;

            if (maxPages > 0) {
                // Calculate percentage for this specific grade and subject
                totalPercent += (pagesRead / maxPages) * 100;
                count++;
            }
        });

        // Calculate average percentage across all available grades
        const avgPercent = count ? Math.round(totalPercent / count) : 0;

        // Generate the dashboard card for the subject
        html += `
            <div class="dashboard-subject">
                <h3>${subject}</h3>
                <progress value="${avgPercent}" max="100"></progress>
                <p>${avgPercent}% Overall</p>
            </div>`;
    });

    html += `</div>`;
    
    // Inject into the DOM
    main.innerHTML = html;

    // Remove the grade-specific progress bar since this is a global view
    const gradeBar = document.getElementById('grade-progress-bar');
    if (gradeBar) {
        gradeBar.innerHTML = '';
    }
}

// Ensure the function is available globally for the navigation system
window.loadDashboard = loadDashboard;
