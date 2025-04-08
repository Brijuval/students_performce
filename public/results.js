document.addEventListener("DOMContentLoaded", () => {
    const resultForm = document.getElementById("resultForm");
    const resultsBody = document.getElementById("resultsBody");
  
    // Function to fetch and display all results
    async function fetchResults() {
      try {
        const res = await fetch("http://localhost:5000/api/results");
        const results = await res.json();
        resultsBody.innerHTML = ""; // Clear the table body
  
        results.forEach(result => {
          const row = document.createElement("tr");
  
          // Student ID cell
          const studentIDCell = document.createElement("td");
          studentIDCell.textContent = result.studentID;
          row.appendChild(studentIDCell);
  
          // Subject Code cell
          const subjectCell = document.createElement("td");
          subjectCell.textContent = result.subjectCode;
          row.appendChild(subjectCell);
  
          // Marks cell
          const marksCell = document.createElement("td");
          marksCell.textContent = result.marks;
          row.appendChild(marksCell);
  
          // Actions cell (Edit & Delete buttons)
          const actionsCell = document.createElement("td");
  
         // Edit Button
const editBtn = document.createElement("button");
editBtn.textContent = "Edit";
editBtn.classList.add("edit-button");  // ✅ Add class for styling
editBtn.addEventListener("click", async () => {
    const newMarks = prompt("Enter new marks:", result.marks);
    if (newMarks !== null && newMarks.trim() !== "") {
        try {
            const res = await fetch(`http://localhost:5000/api/results/${result._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ marks: Number(newMarks) })
            });
            if (res.ok) {
                alert("Result updated successfully");
                fetchResults();
            } else {
                const errorData = await res.json();
                alert("Error updating result: " + errorData.error);
            }
        } catch (error) {
            console.error("Error updating result:", error);
        }
    }
});
actionsCell.appendChild(editBtn);

// Delete Button
const deleteBtn = document.createElement("button");
deleteBtn.textContent = "Delete";
deleteBtn.classList.add("delete-button");  // ✅ Add class for styling
deleteBtn.addEventListener("click", async () => {
    if (confirm("Are you sure you want to delete this result?")) {
        try {
            const res = await fetch(`http://localhost:5000/api/results/${result._id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                alert("Result deleted successfully");
                fetchResults();
            } else {
                const errorData = await res.json();
                alert("Error deleting result: " + errorData.error);
            }
        } catch (error) {
            console.error("Error deleting result:", error);
        }
    }
});
actionsCell.appendChild(deleteBtn);

  
          row.appendChild(actionsCell);
          resultsBody.appendChild(row);
        });
      } catch (err) {
        console.error("Error fetching results:", err);
      }
    }
  
    // Initial fetch on page load
    fetchResults();
  
    // Handle form submission to add a new result
    resultForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const studentID = document.getElementById("studentID").value;
      const subjectCode = document.getElementById("subjectCode").value;
      const marks = document.getElementById("marks").value;
  
      const resultData = { studentID, subjectCode, marks: Number(marks) };
      console.log("Sending result data:", resultData);
  
      try {
        const res = await fetch("http://localhost:5000/api/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(resultData)
        });
  
        if (res.ok) {
          const data = await res.json();
          console.log("Result added:", data);
          resultForm.reset();
          fetchResults(); // Refresh the list after adding
        } else {
          const errorResponse = await res.json();
          console.error("Error adding result:", errorResponse.error);
        }
      } catch (error) {
        console.error("Error adding result:", error);
      }
    });
  });
  