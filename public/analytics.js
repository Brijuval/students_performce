document.addEventListener("DOMContentLoaded", () => {
    const subjectAnalysisDiv = document.getElementById("subjectAnalysis");
    const cgpaPieChartCanvas = document.getElementById("cgpaPieChart")?.getContext('2d');
    const subjectAverageBarChartCanvas = document.getElementById("subjectAverageBarChart")?.getContext('2d');
    const cgpaOverviewChartCanvas = document.getElementById("cgpaOverviewChart")?.getContext('2d');
    const cgpaStatsDiv = document.getElementById("cgpaStats");
    const passFailTableBody = document.getElementById("passFailTableBody");
    const cgpaOverviewMessage = document.getElementById("cgpaOverviewMessage");

    async function fetchSubjectAnalysisAndCreateChart() {
        if (!subjectAnalysisDiv) return;
        subjectAnalysisDiv.innerHTML = "<p>Loading Subject Performance Analysis...</p>";
        try {
            const response = await fetch("http://localhost:5000/api/analytics/cgpa/subject-analysis");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log("Subject Analysis Data:", data);

            if (data?.allSubjectAverages?.length > 0) {
                subjectAnalysisDiv.innerHTML = `<h2>Subject Performance Analysis</h2>`;
                const ul = document.createElement('ul');
                const labels = data.allSubjectAverages.map(item => item.subjectName);
                const chartData = data.allSubjectAverages.map(item => item.averageMarks);
                const backgroundColors = generateRandomColors(labels.length);

                new Chart(cgpaPieChartCanvas, {
                    type: 'pie',
                    data: { labels: labels, datasets: [{ label: 'Average Marks by Subject', data: chartData, backgroundColor: backgroundColors, borderWidth: 1 }] },
                    options: { responsive: true, maintainAspectRatio: false, title: { display: true, text: 'Average Marks by Subject' } }
                });

                new Chart(subjectAverageBarChartCanvas, {
                    type: 'bar',
                    data: { labels: labels, datasets: [{ label: 'Average Marks', data: chartData, backgroundColor: 'rgba(75, 192, 192, 0.8)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 }] },
                    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, title: { display: true, text: 'Average Marks by Subject' } }
                });

                data.allSubjectAverages.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = `${item.subjectName}: ${item.averageMarks} (Count: ${item.count})`;
                    ul.appendChild(li);
                });
                subjectAnalysisDiv.appendChild(ul);

            } else if (data?.message) {
                subjectAnalysisDiv.innerHTML = `<p>${data.message}</p>`;
            } else {
                subjectAnalysisDiv.innerHTML = "<p>No subject performance data available.</p>";
            }

        } catch (error) {
            console.error("Error fetching subject analysis:", error);
            subjectAnalysisDiv.innerHTML = `<p>Error loading subject performance analysis: ${error.message}</p>`;
        }
    }

    async function fetchAllCgpaAndCreateBarChart() {
        if (!cgpaOverviewChartCanvas) return;
        try {
            // <<<<< FIXED HERE
            const response = await fetch("http://localhost:5000/api/analytics/cgpa/pass-fail");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log("All CGPA Data:", data);

            if (data?.students?.length > 0) {
                const labels = data.students.map(student => student.name);
                const chartData = data.students.map(student => student.cgpa);
                const backgroundColor = 'rgba(54, 162, 235, 0.8)';
                const borderColor = 'rgba(54, 162, 235, 1)';

                new Chart(cgpaOverviewChartCanvas, {
                    type: 'bar',
                    data: { labels: labels, datasets: [{ label: 'Student CGPA', data: chartData, backgroundColor: backgroundColor, borderColor: borderColor, borderWidth: 1 }] },
                    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, title: { display: true, text: 'Student CGPA Overview' } }
                });
            } else {
                if (cgpaOverviewMessage) {
                    cgpaOverviewMessage.innerHTML = '<p>No CGPA data available for overview chart.</p>';
                }
            }
        } catch (error) {
            console.error("Error fetching all CGPAs:", error);
            if (cgpaOverviewMessage) {
                cgpaOverviewMessage.innerHTML = `<p>Error loading CGPA overview chart data: ${error.message}</p>`;
            }
        }
    }

    async function fetchCgpaStatsAndUpdateDiv() {
        if (!cgpaStatsDiv) return;
        try {
            const res = await fetch("http://localhost:5000/api/analytics/cgpa/cgpa-stats");
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const stats = await res.json();
            cgpaStatsDiv.innerHTML = `
                <p>📊 Average CGPA: <strong>${stats?.averageCGPA?.toFixed(2) ?? 'N/A'}</strong></p>
                <p>🏆 Highest CGPA: <strong>${stats?.highestCGPA?.toFixed(2) ?? 'N/A'}</strong></p>
                <p>✅ Pass Rate: <strong>${stats?.passPercentage?.toFixed(2) ?? 'N/A'}%</strong></p>
            `;
        } catch (err) {
            console.error("Failed to load CGPA stats", err);
            cgpaStatsDiv.innerHTML = "<p>Failed to load CGPA statistics.</p>";
        }
    }

    async function fetchPassFailDataAndUpdateTable() {
        if (!passFailTableBody) return;
        try {
            const res = await fetch("http://localhost:5000/api/analytics/cgpa/pass-fail");
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            passFailTableBody.innerHTML = '';
            data?.students?.forEach(student => {
                const row = document.createElement("tr");
                row.innerHTML = `<td>${student.name}</td><td>${student.rollNumber}</td><td>${student.cgpa ?? 'N/A'}</td><td>${student.status === "Pass" ? "✅ Pass" : "❌ Fail"}</td>`;
                passFailTableBody.appendChild(row);
            });
        } catch (err) {
            console.error("Failed to load pass/fail data", err);
            passFailTableBody.innerHTML = '<tr><td colspan="4">Failed to load pass/fail data.</td></tr>';
        }
    }

    // Call the functions
    fetchSubjectAnalysisAndCreateChart();
    fetchAllCgpaAndCreateBarChart();
    fetchCgpaStatsAndUpdateDiv();
    fetchPassFailDataAndUpdateTable();
});

function generateRandomColors(numColors) {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
    }
    return colors;
}