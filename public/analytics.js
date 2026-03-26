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
        showLoading();
        try {
            const result = await api.getSubjectPerformance('all');
            hideLoading();

            if (!result.success) {
                throw new Error(result.message);
            }

            const data = result.data;
            console.log("Subject Analysis Data:", data);

            const allSubjectAverages = data?.allSubjectAverages || data?.subject_averages || [];

            if (allSubjectAverages.length > 0) {
                subjectAnalysisDiv.innerHTML = `<h2>Subject Performance Analysis</h2>`;
                const ul = document.createElement('ul');
                const labels = allSubjectAverages.map(item => item.subjectName || item.subject_name || item.name || '');
                const chartData = allSubjectAverages.map(item => item.averageMarks || item.average_marks || 0);
                const backgroundColors = generateRandomColors(labels.length);

                if (cgpaPieChartCanvas) {
                    new Chart(cgpaPieChartCanvas, {
                        type: 'pie',
                        data: { labels: labels, datasets: [{ label: 'Average Marks by Subject', data: chartData, backgroundColor: backgroundColors, borderWidth: 1 }] },
                        options: { responsive: true, maintainAspectRatio: false }
                    });
                }

                if (subjectAverageBarChartCanvas) {
                    new Chart(subjectAverageBarChartCanvas, {
                        type: 'bar',
                        data: { labels: labels, datasets: [{ label: 'Average Marks', data: chartData, backgroundColor: 'rgba(75, 192, 192, 0.8)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 }] },
                        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
                    });
                }

                allSubjectAverages.forEach(item => {
                    const li = document.createElement('li');
                    const name = item.subjectName || item.subject_name || item.name || '';
                    const avg = item.averageMarks || item.average_marks || 0;
                    const count = item.count || 0;
                    li.textContent = `${name}: ${avg} (Count: ${count})`;
                    ul.appendChild(li);
                });
                subjectAnalysisDiv.appendChild(ul);

            } else if (data?.message) {
                subjectAnalysisDiv.innerHTML = `<p>${data.message}</p>`;
            } else {
                subjectAnalysisDiv.innerHTML = "<p>No subject performance data available.</p>";
            }

        } catch (error) {
            hideLoading();
            console.error("Error fetching subject analysis:", error);
            subjectAnalysisDiv.innerHTML = `<p>Error loading subject performance analysis: ${error.message}</p>`;
            showNotification("Error loading subject analysis: " + error.message, 'error');
        }
    }

    async function fetchAllCgpaAndCreateBarChart() {
        if (!cgpaOverviewChartCanvas) return;
        showLoading();
        try {
            const result = await api.getClassReport();
            hideLoading();

            if (!result.success) {
                throw new Error(result.message);
            }

            const data = result.data;
            console.log("All CGPA Data:", data);

            const students = data?.students || data?.results || [];

            if (students.length > 0) {
                const labels = students.map(student => student.name || '');
                const chartData = students.map(student => student.cgpa || student.average_marks || 0);
                const backgroundColor = 'rgba(54, 162, 235, 0.8)';
                const borderColor = 'rgba(54, 162, 235, 1)';

                new Chart(cgpaOverviewChartCanvas, {
                    type: 'bar',
                    data: { labels: labels, datasets: [{ label: 'Student CGPA', data: chartData, backgroundColor: backgroundColor, borderColor: borderColor, borderWidth: 1 }] },
                    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
                });
            } else {
                if (cgpaOverviewMessage) {
                    cgpaOverviewMessage.innerHTML = '<p>No CGPA data available for overview chart.</p>';
                }
            }
        } catch (error) {
            hideLoading();
            console.error("Error fetching all CGPAs:", error);
            if (cgpaOverviewMessage) {
                cgpaOverviewMessage.innerHTML = `<p>Error loading CGPA overview chart data: ${error.message}</p>`;
            }
            showNotification("Error loading CGPA overview: " + error.message, 'error');
        }
    }

    async function fetchCgpaStatsAndUpdateDiv() {
        if (!cgpaStatsDiv) return;
        showLoading();
        try {
            const result = await api.getAnalyticsSummary();
            hideLoading();

            if (!result.success) {
                throw new Error(result.message);
            }

            const stats = result.data;
            cgpaStatsDiv.innerHTML = `
                <p>📊 Average CGPA: <strong>${stats?.averageCGPA?.toFixed(2) ?? stats?.average_cgpa?.toFixed(2) ?? 'N/A'}</strong></p>
                <p>🏆 Highest CGPA: <strong>${stats?.highestCGPA?.toFixed(2) ?? stats?.highest_cgpa?.toFixed(2) ?? 'N/A'}</strong></p>
                <p>✅ Pass Rate: <strong>${stats?.passPercentage?.toFixed(2) ?? stats?.pass_percentage?.toFixed(2) ?? 'N/A'}%</strong></p>
            `;
        } catch (err) {
            hideLoading();
            console.error("Failed to load CGPA stats", err);
            cgpaStatsDiv.innerHTML = "<p>Failed to load CGPA statistics.</p>";
            showNotification("Failed to load CGPA statistics: " + err.message, 'error');
        }
    }

    async function fetchPassFailDataAndUpdateTable() {
        if (!passFailTableBody) return;
        showLoading();
        try {
            const result = await api.getClassReport();
            hideLoading();

            if (!result.success) {
                throw new Error(result.message);
            }

            const data = result.data;
            const students = data?.students || data?.results || [];

            passFailTableBody.innerHTML = '';
            students.forEach(student => {
                const row = document.createElement("tr");
                const status = student.status || (student.cgpa >= ANALYTICS_CONFIG.PASS_CGPA_THRESHOLD ? "Pass" : "Fail");
                row.innerHTML = `<td>${student.name || ''}</td><td>${student.rollNumber || student.roll_number || ''}</td><td>${student.cgpa ?? 'N/A'}</td><td>${status === "Pass" ? "✅ Pass" : "❌ Fail"}</td>`;
                passFailTableBody.appendChild(row);
            });
        } catch (err) {
            hideLoading();
            console.error("Failed to load pass/fail data", err);
            passFailTableBody.innerHTML = '<tr><td colspan="4">Failed to load pass/fail data.</td></tr>';
            showNotification("Failed to load pass/fail data: " + err.message, 'error');
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
