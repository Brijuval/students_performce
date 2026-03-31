document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("passFailStats");

    try {
        const res = await fetch("http://localhost:5000/api/analytics/cgpa/pass-fail");
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        const total = data.students.length;
        const passed = data.students.filter(s => s.status === "Pass").length;
        const failed = total - passed;

        container.innerHTML = `
            <p>🎓 Total Students: <strong>${total}</strong></p>
            <p>✅ Passed: <strong>${passed}</strong></p>
            <p>❌ Failed: <strong>${failed}</strong></p>
        `;
    } catch (err) {
        console.error("❌ Error loading pass/fail stats:", err.message);
    }
});
