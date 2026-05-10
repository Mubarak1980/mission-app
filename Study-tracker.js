// ===============================  
// 📘 Study-tracker.js 
// ===============================  

(function () {

  const maxPagesByGrade = {
    9: { Math: 120, Physics: 100, Chemistry: 90, Biology: 80, English: 70 },
    10: { Math: 130, Physics: 110, Chemistry: 95, Biology: 85, English: 75 },
    11: { Math: 140, Physics: 120, Chemistry: 100, Biology: 90, English: 80 },
    12: { Math: 150, Physics: 130, Chemistry: 110, Biology: 95, English: 85 }
  };

  // 🔥 GLOBAL SAFE EXPORT
  window.maxPagesByGrade = maxPagesByGrade;

  console.log("✅ maxPagesByGrade loaded successfully");

})();
