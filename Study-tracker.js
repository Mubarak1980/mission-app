// ===============================
// Study-tracker.js (COMPLETE)
// ===============================

const SUBJECTS = ['Math', 'Physics', 'Chemistry', 'Biology', 'English'];

/**
 * Loads progress from localStorage for a specific grade.
 * Uses backticks for template literals to ensure the key is dynamic.
 */
function loadProgress(grade) {
    try {
        return JSON.parse(localStorage.getItem(`grade_${grade}_progress`) || "{}");
    } catch (e) {
        console.error("Error loading progress:", e);
        return {};
    }
}

/**
 * Saves current input values to localStorage and updates the top summary bar.
 */
function saveStudyProgress(grade) {
    const inputs = document.querySelectorAll('.subject-progress');
    const saved = {};

    inputs.forEach(input => {
        const subject = input.dataset.subject;
        const value = Math.max(0, Number(input.value) || 0);
        saved[subject] = value;
    });

    localStorage.setItem(`grade_${grade}_progress`, JSON.stringify(saved));
    updateGradeSummary(grade);
}

/**
 * Generates the HTML for a single subject card.
 */
function createSubject(name, maxPages, savedPages) {
    const percent = maxPages > 0 ? Math.round((savedPages / maxPages) * 100) : 0;

    return `
        <div class="subject ${percent === 100 ? 'complete' : ''}">
            <h3>${name}</h3>
            <input 
                class="subject-progress" 
                type="number" 
                min="0" 
                max="${maxPages}" 
                value="${savedPages}" 
                data-subject="${name}" 
                data-maxpages="${maxPages}" 
            />  
            <progress value="${savedPages}" max="${maxPages}"></progress>  
            <p>${percent}% complete</p>  
        </div>`;
}

/**
 * Updates the UI visuals (progress bar and percentage text) when an input changes.
 */
function updateSubjectProgressUI(input) {
    let value = Math.max(0, Number(input.value) || 0);
    const max = Number(input.dataset.maxpages);

    if (value > max) value = max;
    input.value = value;

    const percent = max ? Math.round((value / max) * 100) : 0;
    const container = input.closest('.subject');
    
    if (!container) return;

    const progressBar = container.querySelector('progress');
    const statusText = container.querySelector('p');

    if (progressBar) progressBar.value = value;
    if (statusText) statusText.textContent = `${percent}% complete`;
    
    container.classList.toggle('complete', percent === 100);
}

/**
 * The main entry point to render the study tracker for a specific grade.
 */
function loadStudySection(grade) {
    const mainContent = document.getElementById('main-content');
    
    // Ensure the global data from main.js is available
    if (!window.maxPagesByGrade || !window.maxPagesByGrade[grade]) {
        if (mainContent) {
            mainContent.innerHTML = `<p style="padding:20px; text-align:center;">Data for Grade ${grade} not found.</p>`;
        }
        return;
    }

    const saved = loadProgress(grade);
    let html = `<h2>📘 Grade ${grade} Study Tracker</h2><div class="subjects-container">`;

    SUBJECTS.forEach(subject => {
        const max = window.maxPagesByGrade[grade][subject] || 0;
        const done = saved[subject] || 0;
        html += createSubject(subject, max, done);
    });

    html += `</div>`;
    
    if (mainContent) {
        mainContent.innerHTML = html;

        // Attach event listeners for real-time updates and saving
        document.querySelectorAll('.subject-progress').forEach(input => {
            input.addEventListener('input', function () {
                updateSubjectProgressUI(this);
                saveStudyProgress(grade);
            });
        });
    }

    updateGradeSummary(grade);
}

/**
 * Updates the overall progress bar at the top of the app.
 */
function updateGradeSummary(grade) {
    const saved = loadProgress(grade);
    const data = window.maxPagesByGrade ? window.maxPagesByGrade[grade] : null;

    if (!data) return;

    let totalDone = 0;
    let totalPages = 0;

    SUBJECTS.forEach(subject => {
        const max = data[subject] || 0;
        const done = saved[subject] || 0;
        totalDone += Math.min(done, max);
        totalPages += max;
    });

    const percent = totalPages ? Math.round((totalDone / totalPages) * 100) : 0;
    const el = document.getElementById('grade-progress-bar');

    if (el) {
        el.innerHTML = `
            <label>📘 Grade ${grade} Overall Progress: ${percent}%</label>
            <progress value="${percent}" max="100"></progress>`;
    }
}

// Ensure the functions are available to main.js
window.loadStudySection = loadStudySection;
window.updateGradeSummary = updateGradeSummary;
