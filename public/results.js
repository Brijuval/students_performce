document.addEventListener("DOMContentLoaded", () => {
    const resultForm = document.getElementById("resultForm");
    const resultsBody = document.getElementById("resultsBody");

    // Function to fetch and display all results
    async function fetchResults(params = {}) {
      showLoading();
      try {
        const result = await api.getResults(params);

        if (!result.success) {
          throw new Error(result.message);
        }

        const results = Array.isArray(result.data)
          ? result.data
          : (result.data?.results || []);

        resultsBody.innerHTML = "";

        results.forEach(item => {
          const row = document.createElement("tr");

          // Student ID cell
          const studentIDCell = document.createElement("td");
          studentIDCell.textContent = item.studentID || item.student || item.student_id || '';
          row.appendChild(studentIDCell);

          // Subject Code cell
          const subjectCell = document.createElement("td");
          subjectCell.textContent = item.subjectCode || item.subject || item.subject_code || '';
          row.appendChild(subjectCell);

          // Marks cell
          const marksCell = document.createElement("td");
          marksCell.textContent = item.marks || item.marks_obtained || '';
          row.appendChild(marksCell);

          // Actions cell (Edit & Delete buttons)
          const actionsCell = document.createElement("td");
          const itemId = item.id || item._id;

          // Edit Button
          const editBtn = document.createElement("button");
          editBtn.textContent = "Edit";
          editBtn.classList.add("edit-button");
          editBtn.addEventListener("click", async () => {
              const currentMarks = item.marks || item.marks_obtained || '';
              const newMarks = prompt("Enter new marks:", currentMarks);
              if (newMarks !== null && newMarks.trim() !== "") {
                  showLoading();
                  try {
                      const updateResult = await api.updateResult(itemId, {
                          marks: Number(newMarks),
                          marks_obtained: Number(newMarks)
                      });
                      if (!updateResult.success) {
                          throw new Error(updateResult.message);
                      }
                      showNotification("Result updated successfully", 'success');
                      fetchResults();
                  } catch (error) {
                      console.error("Error updating result:", error);
                      showNotification("Error updating result: " + error.message, 'error');
                  } finally {
                      hideLoading();
                  }
              }
          });
          actionsCell.appendChild(editBtn);

          // Delete Button
          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "Delete";
          deleteBtn.classList.add("delete-button");
          deleteBtn.addEventListener("click", async () => {
              if (confirm("Are you sure you want to delete this result?")) {
                  showLoading();
                  try {
                      const deleteResult = await api.deleteResult(itemId);
                      if (!deleteResult.success) {
                          throw new Error(deleteResult.message);
                      }
                      showNotification("Result deleted successfully", 'success');
                      fetchResults();
                  } catch (error) {
                      console.error("Error deleting result:", error);
                      showNotification("Error deleting result: " + error.message, 'error');
                  } finally {
                      hideLoading();
                  }
              }
          });
          actionsCell.appendChild(deleteBtn);

          row.appendChild(actionsCell);
          resultsBody.appendChild(row);
        });
      } catch (err) {
        console.error("Error fetching results:", err);
        showNotification("Error fetching results: " + err.message, 'error');
      } finally {
        hideLoading();
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

      const resultData = {
          studentID,
          subjectCode,
          marks: Number(marks),
          marks_obtained: Number(marks)
      };
      console.log("Sending result data:", resultData);

      showLoading();
      try {
        const result = await api.createResult(resultData);

        if (!result.success) {
          throw new Error(result.message);
        }

        console.log("Result added:", result.data);
        showNotification("Result added successfully", 'success');
        resultForm.reset();
        fetchResults();
      } catch (error) {
        console.error("Error adding result:", error);
        showNotification("Error adding result: " + error.message, 'error');
      } finally {
        hideLoading();
      }
    });
});
