// Utility to generate random pastel color
function randomColor() {
  const h = Math.floor(Math.random() * 360);
  return `hsl(${h}, 70%, 80%)`;
}

document.addEventListener("DOMContentLoaded", function() {
  // Single Student Performance
  let barChartObj = null;
  const studentForm = document.getElementById("single-student-form");
  const studentIDInput = document.getElementById("studentIDInput");
  const studentInfo = document.getElementById("studentInfo");
  const barChartCanvas = document.getElementById("subjectBarChart");

  studentForm.onsubmit = async function(e) {
    e.preventDefault();
    const rollNumber = studentIDInput.value.trim();
    if (!rollNumber) return;

    studentInfo.textContent = "Loading...";
    if (barChartObj) barChartObj.destroy();
    showLoading();

    try {
      const result = await api.getStudentPerformance(rollNumber);

      if (!result.success) {
        studentInfo.textContent = "No data found for this student.";
        showNotification(result.message, 'error');
        return;
      }

      const data = result.data;

      if (!data || (!data.subjectPerformance?.length && !data.subject_performance?.length)) {
        studentInfo.textContent = "No data found for this student.";
        return;
      }

      const performance = data.subjectPerformance || data.subject_performance || [];
      studentInfo.textContent = `${data.name || ''} (${data.rollNumber || data.roll_number || rollNumber}) - ${data.department || ''}`;

      const labels = performance.map(s => s.subject || s.subject_name || '');
      const marks = performance.map(s => s.marks || s.marks_obtained || 0);

      barChartObj = new Chart(barChartCanvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Marks',
            data: marks,
            backgroundColor: labels.map(() => randomColor())
          }]
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true, max: 100 } }
        }
      });
    } catch (err) {
      studentInfo.textContent = "Error loading performance.";
      showNotification("Error loading performance: " + err.message, 'error');
    } finally {
      hideLoading();
    }
  };

  // Compare Two Students
  let compareChartObj = null;
  const compareForm = document.getElementById("compare-form");
  const student1Input = document.getElementById("student1Input");
  const student2Input = document.getElementById("student2Input");
  const compareBarChart = document.getElementById("compareBarChart");
  const compareTable = document.getElementById("compareTable");

  compareForm.onsubmit = async function(e) {
    e.preventDefault();
    const s1 = student1Input.value.trim();
    const s2 = student2Input.value.trim();
    if (!s1 || !s2) return;

    compareTable.innerHTML = "Loading...";
    if (compareChartObj) compareChartObj.destroy();
    showLoading();

    try {
      const [result1, result2] = await Promise.all([
        api.getStudentPerformance(s1),
        api.getStudentPerformance(s2)
      ]);

      if (!result1.success || !result2.success) {
        compareTable.innerHTML = "Both students must exist and have results!";
        showNotification("Could not load student data for comparison.", 'error');
        return;
      }

      const data = [result1.data, result2.data];

      if (!Array.isArray(data) || data.length !== 2) {
        compareTable.innerHTML = "Both students must exist and have results!";
        return;
      }

      const getSubjects = (d) => d.subjectPerformance || d.subject_performance || d.subjects || [];
      const getSubjectName = (s) => s.subject || s.subject_name || '';
      const getMarks = (s) => s.marks || s.marks_obtained || 0;

      // Merge all subjects using Maps for O(1) lookup
      const subjects1 = getSubjects(data[0]);
      const subjects2 = getSubjects(data[1]);
      const marks1Map = new Map(subjects1.map(s => [getSubjectName(s), getMarks(s)]));
      const marks2Map = new Map(subjects2.map(s => [getSubjectName(s), getMarks(s)]));

      const labels = Array.from(new Set([
        ...subjects1.map(getSubjectName),
        ...subjects2.map(getSubjectName)
      ]));
      const marks1 = labels.map(l => marks1Map.get(l) || 0);
      const marks2 = labels.map(l => marks2Map.get(l) || 0);

      // Draw chart
      compareChartObj = new Chart(compareBarChart, {
        type: "bar",
        data: {
          labels,
          datasets: [
            { label: data[0].name || s1, data: marks1, backgroundColor: "rgba(54,162,235,0.7)" },
            { label: data[1].name || s2, data: marks2, backgroundColor: "rgba(255,99,132,0.7)" }
          ]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
      });

      // Comparison Table
      let html = `<table><tr><th>Subject</th><th>${data[0].name || s1}</th><th>${data[1].name || s2}</th></tr>`;
      labels.forEach((subj, i) => {
        html += `<tr><td>${subj}</td><td>${marks1[i]}</td><td>${marks2[i]}</td></tr>`;
      });
      html += "</table>";
      compareTable.innerHTML = html;
    } catch (err) {
      compareTable.innerHTML = "Error loading comparison.";
      showNotification("Error loading comparison: " + err.message, 'error');
    } finally {
      hideLoading();
    }
  };
});
