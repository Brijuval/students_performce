/**
 * Analytics page — uses Django API via ApiClient.
 */
document.addEventListener("DOMContentLoaded", () => {
  const subjectAnalysisDiv = document.getElementById("subjectAnalysis");
  const cgpaPieChartCanvas = document.getElementById("cgpaPieChart")?.getContext("2d");
  const subjectAverageBarChartCanvas = document
    .getElementById("subjectAverageBarChart")
    ?.getContext("2d");
  const cgpaOverviewChartCanvas = document
    .getElementById("cgpaOverviewChart")
    ?.getContext("2d");
  const cgpaStatsDiv = document.getElementById("cgpaStats");
  const passFailTableBody = document.getElementById("passFailTableBody");
  const cgpaOverviewMessage = document.getElementById("cgpaOverviewMessage");

  function generateRandomColors(n) {
    return Array.from({ length: n }, () => {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      return `rgba(${r}, ${g}, ${b}, 0.7)`;
    });
  }

  async function fetchSubjectAnalysisAndCreateChart() {
    if (!subjectAnalysisDiv) return;
    subjectAnalysisDiv.innerHTML = "<p>Loading Subject Performance Analysis...</p>";
    try {
      const data = await ApiClient.getSubjectAnalysis();
      const averages = data.all_subject_averages || [];

      if (averages.length > 0) {
        subjectAnalysisDiv.innerHTML = "<h2>Subject Performance Analysis</h2>";
        const labels = averages.map((item) => item.subject_name);
        const chartData = averages.map((item) => item.average_marks);
        const colors = generateRandomColors(labels.length);

        if (cgpaPieChartCanvas) {
          new Chart(cgpaPieChartCanvas, {
            type: "pie",
            data: {
              labels,
              datasets: [{ label: "Average Marks", data: chartData, backgroundColor: colors, borderWidth: 1 }],
            },
            options: { responsive: true, maintainAspectRatio: false },
          });
        }

        if (subjectAverageBarChartCanvas) {
          new Chart(subjectAverageBarChartCanvas, {
            type: "bar",
            data: {
              labels,
              datasets: [
                {
                  label: "Average Marks",
                  data: chartData,
                  backgroundColor: "rgba(75, 192, 192, 0.8)",
                  borderColor: "rgba(75, 192, 192, 1)",
                  borderWidth: 1,
                },
              ],
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } },
          });
        }

        const ul = document.createElement("ul");
        averages.forEach((item) => {
          const li = document.createElement("li");
          li.textContent = `${item.subject_name}: ${item.average_marks} (Count: ${item.count})`;
          ul.appendChild(li);
        });
        subjectAnalysisDiv.appendChild(ul);
      } else {
        subjectAnalysisDiv.innerHTML = "<p>No subject performance data available.</p>";
      }
    } catch (error) {
      console.error("Error fetching subject analysis:", error);
      subjectAnalysisDiv.innerHTML = `<p>Error loading subject analysis: ${error.message}</p>`;
    }
  }

  async function fetchAllCgpaAndCreateBarChart() {
    if (!cgpaOverviewChartCanvas) return;
    try {
      const data = await ApiClient.getPassFail();
      const students = data.students || [];

      if (students.length > 0) {
        const labels = students.map((s) => s.name);
        const chartData = students.map((s) => s.cgpa);

        new Chart(cgpaOverviewChartCanvas, {
          type: "bar",
          data: {
            labels,
            datasets: [
              {
                label: "Student CGPA",
                data: chartData,
                backgroundColor: "rgba(54, 162, 235, 0.8)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } },
          },
        });
      } else if (cgpaOverviewMessage) {
        cgpaOverviewMessage.innerHTML = "<p>No CGPA data available.</p>";
      }
    } catch (error) {
      console.error("Error fetching CGPA overview:", error);
      if (cgpaOverviewMessage) {
        cgpaOverviewMessage.innerHTML = `<p>Error loading CGPA overview: ${error.message}</p>`;
      }
    }
  }

  async function fetchCgpaStatsAndUpdateDiv() {
    if (!cgpaStatsDiv) return;
    try {
      const stats = await ApiClient.getCgpaStats();
      cgpaStatsDiv.innerHTML = `
        <p>📊 Average CGPA: <strong>${stats?.average_cgpa?.toFixed(2) ?? "N/A"}</strong></p>
        <p>🏆 Highest CGPA: <strong>${stats?.highest_cgpa?.toFixed(2) ?? "N/A"}</strong></p>
        <p>✅ Pass Rate: <strong>${stats?.pass_percentage?.toFixed(2) ?? "N/A"}%</strong></p>
      `;
    } catch (err) {
      console.error("Failed to load CGPA stats", err);
      cgpaStatsDiv.innerHTML = "<p>Failed to load CGPA statistics.</p>";
    }
  }

  async function fetchPassFailDataAndUpdateTable() {
    if (!passFailTableBody) return;
    try {
      const data = await ApiClient.getPassFail();
      passFailTableBody.innerHTML = "";
      (data.students || []).forEach((student) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${student.name}</td>
          <td>${student.roll_number}</td>
          <td>${student.cgpa ?? "N/A"}</td>
          <td>${student.status === "Pass" ? "✅ Pass" : "❌ Fail"}</td>
        `;
        passFailTableBody.appendChild(row);
      });
    } catch (err) {
      console.error("Failed to load pass/fail data", err);
      passFailTableBody.innerHTML =
        '<tr><td colspan="4">Failed to load pass/fail data.</td></tr>';
    }
  }

  fetchSubjectAnalysisAndCreateChart();
  fetchAllCgpaAndCreateBarChart();
  fetchCgpaStatsAndUpdateDiv();
  fetchPassFailDataAndUpdateTable();
});
