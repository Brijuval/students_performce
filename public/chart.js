document.addEventListener("DOMContentLoaded", async function () {
    const ctx = document.getElementById("cgpaChart").getContext("2d");
  
    // Add an event listener to the student buttons
    document.addEventListener("click", async (event) => {
      if (event.target.classList.contains("student-button")) {
        const studentID = event.target.dataset.studentId;
  
        try {
          const response = await fetch(`/api/analytics/cgpa/${studentID}`);
  
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error ${response.status}: ${errorText}`);
          }
  
          const data = await response.json();
          console.log("📊 CGPA Data:", data);
  
          if (!data || !data.cgpa) {
            throw new Error("Invalid API response: No CGPA data found.");
          }
  
          // Create a single-bar chart for the student's CGPA
          new Chart(ctx, {
            type: "bar",
            data: {
              labels: [studentID], // Use student ID as label
              datasets: [
                {
                  label: "CGPA",
                  data: [data.cgpa], // CGPA value
                  backgroundColor: "rgba(54, 162, 235, 0.6)",
                  borderColor: "rgba(54, 162, 235, 1)",
                  borderWidth: 1,
                },
              ],
            },
            options: {
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            },
          });
        } catch (error) {
          console.error("❌ Error loading CGPA data:", error);
          document.getElementById("cgpaStats").innerHTML = `<p>Error: ${error.message}</p>`;
        }
      }
    });
  });