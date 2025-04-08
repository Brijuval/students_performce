document.addEventListener("DOMContentLoaded", async () => {
    const cgpaDataDiv = document.getElementById("cgpaData");

    async function fetchCgpaStats() {
        cgpaDataDiv.innerHTML = `<p>Loading CGPA Statistics...</p>`; // Loading indicator
        try {
            const res = await fetch("http://localhost:5000/api/students/cgpa-analytics"); // Corrected API Endpoint
            if (!res.ok) throw new Error(`Failed to fetch CGPA stats: ${res.status} ${res.statusText}`);

            const stats = await res.json();
            console.log("API Response:", stats); // Log the response for debugging

            // Update UI with CGPA Stats (adjust based on your actual response)
            if (stats && stats.passRate !== undefined) {
                cgpaDataDiv.innerHTML = `
                    <p><strong>Pass Percentage:</strong> ${stats.passRate}%</p>
                `;
            } else {
                cgpaDataDiv.innerHTML = `<p>Error: Invalid response data.</p>`;
            }

        } catch (error) {
            console.error("Error fetching CGPA stats:", error);
            cgpaDataDiv.innerHTML = `<p>Error loading CGPA statistics. Please try again later. Details: ${error.message}</p>`;
        }
    }

    fetchCgpaStats(); // Fetch data on page load
});