const totalQuranPages = 604;
const totalJuz = 30;

// ===============================
// DATE HELP
// ===============================
function getDaysSinceStart(startDate) {
const today = new Date();
const start = new Date(startDate);

const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
return diff + 1;
}

// ===============================
// MAIN TRACKER
// ===============================
function loadSunnahTracker() {
let saved = JSON.parse(localStorage.getItem('sunnah_progress')) || {};

// ===============================
// FIX 1: ensure startDate is stable (DO NOT reset daily offline)
// ===============================
let startDate = saved.startDate;

if (!startDate) {
startDate = new Date().toISOString().split('T')[0];
saved.startDate = startDate;
localStorage.setItem('sunnah_progress', JSON.stringify(saved));
}

let daysSinceStart = getDaysSinceStart(startDate);

let expectedPages = Math.min(daysSinceStart, totalQuranPages);

let actualPages = Number(saved.pages) || 0;

let calculatedJuz = Math.floor((actualPages / totalQuranPages) * totalJuz);

let status =
actualPages === expectedPages
? '🟢 On Track'
: actualPages > expectedPages
? '🟩 Ahead'
: '🟠 Behind';

// ===============================
// UI
// ===============================
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

`;

if (actualPages < expectedPages) {
content += <p style="color:red;"><strong>Don’t forget today’s page 📖</strong></p>;
} else if (actualPages === expectedPages) {
content += <p style="color:green;"><strong>On track 💪</strong></p>;
} else {
content += <p style="color:blue;"><strong>Ahead 🚀</strong></p>;
}

content += </div>;

document.getElementById('main-content').innerHTML = content;

// ===============================
// INPUT HANDLING (FIXED SAFETY)
// ===============================
const pagesInput = document.getElementById('quran-pages');
const pagesProgress = document.getElementById('quran-pages-progress');
const juzInput = document.getElementById('quran-juz');
const juzProgress = document.getElementById('quran-juz-progress');

if (!pagesInput) return;

pagesInput.addEventListener('input', () => {
let pages = Number(pagesInput.value) || 0;

pages = Math.max(0, Math.min(pages, totalQuranPages));  

let newJuz = Math.floor((pages / totalQuranPages) * totalJuz);  

pagesInput.value = pages;  
pagesProgress.value = pages;  

juzInput.value = newJuz;  
juzProgress.value = newJuz;  

saveSunnahProgress({  
  pages,  
  juz: newJuz,  
  startDate  
});

});
}

// ===============================
// SAVE FUNCTION (CLEAN + STABLE)
// ===============================
function saveSunnahProgress(data) {
const saved = JSON.parse(localStorage.getItem('sunnah_progress')) || {};

const updated = {
...saved,
...data
};

localStorage.setItem('sunnah_progress', JSON.stringify(updated));
}

// ===============================
// EXPORT
// ===============================
window.loadSunnahTracker = loadSunnahTracker;
