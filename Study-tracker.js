// ===============================
// Study-tracker.js (CORRECTED)
// ===============================

const SUBJECTS = ['Math', 'Physics', 'Chemistry', 'Biology', 'English'];

// ===============================
// LOAD SAVED PROGRESS
// ===============================
function loadProgress(grade) {
    try {
        // FIXED: Added backticks for template literal to correctly access localStorage keys
        return JSON.parse(localStorage.getItem(`grade_${grade}_progress`) || "{}");
    } catch (e) {
        return {};
    }
}

// ===============================
// SAVE PROGRESS
// ===============================
function saveStudyProgress(grade) {
    const inputs = document.querySelectorAll('.subject-progress');
    const saved = {};

    inputs.forEach(input => {
        const subject = input.dataset.subject;
        const value = Math.max(0, Number(input.value) || 0);
        saved[subject] = value;
    });

    // FIXED: Added backticks for template literal to save to the specific grade key
    localStorage.setItem(`grade_${grade}_progress`, JSON.stringify(saved));
    updateGradeSummary(grade);
}

// ===============================
// SUBJECT UI GENERATOR
// ===============================
function createSubject(name, maxPages, savedPages) {
    const percent = maxPages > 0 ? Math.round((savedPages / maxPages) * 100) : 0;

    // FIXED: Used backticks for the multiline HTML structure
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

// ===============================
// UPDATE UI LIVE
// ===============================
function updateSubjectProgressUI(input) {
    let value = Math.max(0, Number(input.value) || 0);
    const max = Number(input.dataset.maxpages);

    if (value > max) value = max;
    input.value = value;

    const percent = max ? Math.round((value / max) * 100) : 0;
    const container = input.closest('.subject');
    
    if (!container) return;

    container.querySelector('progress').value = value;
    // FIXED: Added backticks for template literal
    container.querySelector('p').textContent = `${percent}% complete`;
    container.classList.toggle('complete', percent === 100);
}

// ===============================
// MAIN LOADER
// ===============================
function loadStudySection(grade) {
    // Ensure the data exists in main.js
    if (!window.maxPagesByGrade?.[grade]) {
        // FIXED: Added backticks for template literal
        document.getElementById('main-content').innerHTML = `<p>Missing data for Grade ${grade}</p>`;
        return;
    }

    const saved = loadProgress(grade);
    // FIXED: Added backticks for template literal
    let html = `<h2>📘 Grade ${grade} Study Tracker</h2><div class="subjects-container">`;

    SUBJECTS.forEach(subject => {
        const max = window.maxPagesByGrade[grade][subject] || 0;
        const done = saved[subject] || 0;
        html += createSubject(subject, max, done);
    });

    html += `</div>`;
    document.getElementById('main-content').innerHTML = html;

    // Attach event listeners to all inputs for automatic saving
    document.querySelectorAll('.subject-progress').forEach(input => {
        input.addEventListener('input', function () {
            updateSubjectProgressUI(this);
            saveStudyProgress(grade);
        });
    });

    updateGradeSummary(grade);
}

// ===============================
// OVERALL GRADE SUMMARY
// ===============================
function updateGradeSummary(grade) {
    const saved = loadProgress(grade);
    const data = window.maxPagesByGrade?.[grade];

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
        // FIXED: Used backticks for summary label and values
        el.innerHTML = `
            <label>📘 Overall Progress (Grade ${grade}): ${percent}%</label>
            <progress value="${percent}" max="100"></progress>`;
    }
}

// EXPORTS to ensure main.js can access these functions
window.loadStudySection = loadStudySection;
window.updateGradeSummary = updateGradeSummary;
            
