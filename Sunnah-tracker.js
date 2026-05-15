

// ===============================
// Sunnah-tracker.js (CORRECTED)
// ===============================

const totalQuranPages = 604;
const totalJuz = 30;

// ===============================
// Helper
// ===============================
function getDaysSinceStart(startDate) {
    const today = new Date();
    const start = new Date(startDate);
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return diff + 1;
}

// ===============================
// MAIN FUNCTION
// ===============================
function loadSunnahTracker() {
    let saved = {};

    try {
        saved = JSON.parse(localStorage.getItem('sunnah_progress')) || {};
    } catch (e) {
        saved = {};
    }

    let startDate = saved.startDate || new Date().toISOString().split('T')[0];

    if (!saved.startDate) {
        saved.startDate = startDate;
        localStorage.setItem('sunnah_progress', JSON.stringify(saved));
    }

    let daysSinceStart = getDaysSinceStart(startDate);
    let expectedPages = Math.min(daysSinceStart, totalQuranPages);
    let actualPages = Number(saved.pages) || 0;

    let calculatedJuz = Math.floor((actualPages / totalQuranPages) * totalJuz);

    let status =
        actualPages === expectedPages ? '🟢 On Track' :
        actualPages > expectedPages ? '🟩 Ahead' : '🟠 Behind';

    let content = `
        <h2>🕌 Weekly Sunnah Tracker</h2>

        <div class="quran-progress">
            <h3>Qur'an Reading Progress (1 page/day)</h3>

            <p><strong>Started on:</strong> ${startDate}</p>
            <p><strong>Today is Day:</strong> ${daysSinceStart}</p>
            <p><strong>Expected Page:</strong> ${expectedPages}</p>
            <p><strong>Status:</strong> ${status}</p>

            <label>Pages Read:</label>
            <input id="quran-pages" type="number"
                min="0" max="${totalQuranPages}" value="${actualPages}" />

            <progress id="quran-pages-progress"
                max="${totalQuranPages}" value="${actualPages}"></progress>

            <p>${Math.round((actualPages / totalQuranPages) * 100)}% complete</p>

            <label>Juz Completed:</label>
            <input id="quran-juz" type="number"
                min="0" max="${totalJuz}" value="${calculatedJuz}" readonly />

            <progress id="quran-juz-progress"
                max="${totalJuz}" value="${calculatedJuz}"></progress>

            <p>${Math.round((calculatedJuz / totalJuz) * 100)}% complete</p>
        </div>
    `;

    const container = document.getElementById('main-content');
    if (!container) return;

    container.innerHTML = content;

    const pagesInput = document.getElementById('quran-pages');

    if (pagesInput) {
        pagesInput.addEventListener('input', () => {
            let pages = Math.max(0, Math.min(Number(pagesInput.value) || 0, totalQuranPages));
            let newJuz = Math.floor((pages / totalQuranPages) * totalJuz);

            pagesInput.value = pages;

            const pagesProgress = document.getElementById('quran-pages-progress');
            const juzInput = document.getElementById('quran-juz');
            const juzProgress = document.getElementById('quran-juz-progress');

            if (pagesProgress) pagesProgress.value = pages;
            if (juzInput) juzInput.value = newJuz;
            if (juzProgress) juzProgress.value = newJuz;

            saveSunnahProgress({ pages, juz: newJuz, startDate });
        });
    }
}

// ===============================
// SAVE
// ===============================
function saveSunnahProgress(data) {
    try {
        const saved = JSON.parse(localStorage.getItem('sunnah_progress')) || {};
        localStorage.setItem('sunnah_progress', JSON.stringify({ ...saved, ...data }));
    } catch (e) {
        console.warn("Failed to save sunnah progress:", e);
    }
}

// ===============================
// GLOBAL
// ===============================
window.loadSunnahTracker = loadSunnahTracker;
