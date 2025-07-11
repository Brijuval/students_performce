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

    try {
      const res = await fetch(`http://localhost:5000/api/analytics/performance/${rollNumber}`);
      const data = await res.json();

      if (!res.ok || !data.subjectPerformance || !data.subjectPerformance.length) {
        studentInfo.textContent = "No data found for this student.";
        return;
      }

      studentInfo.textContent = `${data.name} (${data.rollNumber}) - ${data.department}`;

      const labels = data.subjectPerformance.map(s => s.subject);
      const marks = data.subjectPerformance.map(s => s.marks);

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

    try {
      const res = await fetch(`http://localhost:5000/api/analytics/compare?student1=${s1}&student2=${s2}`);
      const data = await res.json();

      if (!Array.isArray(data) || data.length !== 2) {
        compareTable.innerHTML = "Both students must exist and have results!";
        return;
      }

      // Merge all subjects
      const labels = Array.from(new Set([...data[0].subjects.map(x=>x.subject), ...data[1].subjects.map(x=>x.subject)]));
      const marks1 = labels.map(l => (data[0].subjects.find(s => s.subject === l) || {}).marks || 0);
      const marks2 = labels.map(l => (data[1].subjects.find(s => s.subject === l) || {}).marks || 0);

      // Draw chart
      compareChartObj = new Chart(compareBarChart, {
        type: "bar",
        data: {
          labels,
          datasets: [
            { label: data[0].name, data: marks1, backgroundColor: "rgba(54,162,235,0.7)" },
            { label: data[1].name, data: marks2, backgroundColor: "rgba(255,99,132,0.7)" }
          ]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
      });

      // Comparison Table
      let html = `<table><tr><th>Subject</th><th>${data[0].name}</th><th>${data[1].name}</th></tr>`;
      labels.forEach((subj,i) => {
        html += `<tr><td>${subj}</td><td>${marks1[i]}</td><td>${marks2[i]}</td></tr>`;
      });
      html += "</table>";
      compareTable.innerHTML = html;
    } catch (err) {
      compareTable.innerHTML = "Error loading comparison.";
    }
  };
});