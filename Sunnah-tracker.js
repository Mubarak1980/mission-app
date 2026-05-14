// ===============================
// Sunnah-tracker.js (CORRECTED)
// ===============================

const totalQuranPages = 604;
const totalJuz = 30;

// Helper to calculate days passed since starting the challenge
function getDaysSinceStart(startDate) {
    const today = new Date();
    const start = new Date(startDate);
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return diff + 1; // Include the current day
}

function loadSunnahTracker() {
    let saved = JSON.parse(localStorage.getItem('sunnah_progress')) || {};
    
    // Default start date to today if not set
    let startDate = saved.startDate || new Date().toISOString().split('T')[0];
    
    if (!saved.startDate) {
        saved.startDate = startDate;
        localStorage.setItem('sunnah_progress', JSON.stringify(saved));
    }

    let daysSinceStart = getDaysSinceStart(startDate);
    let expectedPages = Math.min(daysSinceStart, totalQuranPages);
    let actualPages = Number(saved.pages) || 0;
    
    // Calculate progress for Juz (approximate)
    let calculatedJuz = Math.floor((actualPages / totalQuranPages) * totalJuz);
    
    // Determine status based on page count vs days passed
    let status = actualPages === expectedPages ? '🟢 On Track' : 
                 actualPages > expectedPages ? '🟩 Ahead' : '🟠 Behind';

    // FIXED: Used backticks for the multiline HTML template
    let content = `
        <h2>🕌 Weekly Sunnah Tracker</h2>
        <div class="quran-progress">  
            <h3>Qur'an Reading Progress (1 page/day)</h3>  
            <p><strong>Started on:</strong> ${startDate}</p>  
            <p><strong>Today is Day:</strong> ${daysSinceStart}</p>  
            <p><strong>Expected Page:</strong> ${expectedPages}</p>  
            <p><strong>Status:</strong> ${status}</p>  
            
            <label>Pages Read:</label>  
            <input id="quran-pages" type="number" min="0" max="${totalQuranPages}" value="${actualPages}" />  
            <progress id="quran-pages-progress" max="${totalQuranPages}" value="${actualPages}"></progress>  
            <p>${Math.round((actualPages / totalQuranPages) * 100)}% complete</p>  
            
            <label>Juz Completed:</label>  
            <input id="quran-juz" type="number" min="0" max="${totalJuz}" value="${calculatedJuz}" readonly />  
            <progress id="quran-juz-progress" max="${totalJuz}" value="${calculatedJuz}"></progress>  
            <p>${Math.round((calculatedJuz / totalJuz) * 100)}% complete</p>
        </div>`;

    document.getElementById('main-content').innerHTML = content;

    // Listener for live updates
    const pagesInput = document.getElementById('quran-pages');
    if (pagesInput) {
        pagesInput.addEventListener('input', () => {
            let pages = Math.max(0, Math.min(Number(pagesInput.value) || 0, totalQuranPages));
            let newJuz = Math.floor((pages / totalQuranPages) * totalJuz);
            
            // Update UI elements live
            pagesInput.value = pages;
            document.getElementById('quran-pages-progress').value = pages;
            document.getElementById('quran-juz').value = newJuz;
            document.getElementById('quran-juz-progress').value = newJuz;
            
            // Save updated state
            saveSunnahProgress({ pages, juz: newJuz, startDate });
        });
    }
}

function saveSunnahProgress(data) {
    const saved = JSON.parse(localStorage.getItem('sunnah_progress')) || {};
    localStorage.setItem('sunnah_progress', JSON.stringify({ ...saved, ...data }));
}

// Ensure global accessibility
window.loadSunnahTracker = loadSunnahTracker;
