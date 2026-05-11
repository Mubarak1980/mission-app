// =====================================================
// ⏱️ UNIFIED SYSTEM INTEGRATION (STEP 6 ENGINE)
// =====================================================

const system = typeof getSystemSnapshot === "function"
  ? getSystemSnapshot()
  : null;

const snapshot = system || (typeof getSystemStatus === "function"
  ? getSystemStatus()
  : null);

let delayHTML = `
  <div class="delay-section">
    <h2>⏱️ System Status</h2>
`;

// CASE 1: FULL SYSTEM AVAILABLE
if (system) {

  delayHTML += `
    <p>📅 Cycle Day: ${system.time.cycleDay}/90</p>
    <p>📊 Expected Pages: ${system.progress.expected}</p>
    <p>📚 Actual Pages: ${system.progress.actual}</p>
    <p>⚖️ Gap: ${system.progress.gap}</p>
    <p><b>🚦 Status: ${snapshot.cycle.status}</b></p>

    <hr/>

    <p>📌 Daily Issues: ${system.alerts.delayCount}</p>
  `;
}

// CASE 2: FALLBACK SYSTEM
else if (snapshot) {

  delayHTML += `
    <p>📊 Expected: ${snapshot.cycle.expectedPages}</p>
    <p>📚 Actual: ${snapshot.cycle.actualPages}</p>
    <p>⚖️ Gap: ${snapshot.cycle.gap}</p>
    <p><b>🚦 Status: ${snapshot.cycle.status}</b></p>
  `;
}

// CASE 3: NO SYSTEM
else {
  delayHTML += `<p>⚠️ System not initialized</p>`;
}

delayHTML += `</div>`;
main.innerHTML += delayHTML;
