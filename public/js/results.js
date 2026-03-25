/**
 * Results page — uses Django API via ApiClient.
 */
document.addEventListener("DOMContentLoaded", () => {
  const resultForm = document.getElementById("resultForm");
  const resultsBody = document.getElementById("resultsBody");

  async function fetchResults() {
    try {
      const results = await ApiClient.getResults();
      const list = Array.isArray(results) ? results : results.results || [];
      resultsBody.innerHTML = "";

      if (list.length === 0) {
        resultsBody.innerHTML = '<tr><td colspan="5">No results found.</td></tr>';
        return;
      }

      list.forEach((result) => {
        const row = document.createElement("tr");

        const studentCell = document.createElement("td");
        studentCell.textContent = result.student_roll || result.student;
        row.appendChild(studentCell);

        const subjectCell = document.createElement("td");
        subjectCell.textContent = result.subject_code || result.subject;
        row.appendChild(subjectCell);

        const marksCell = document.createElement("td");
        marksCell.textContent = result.marks;
        row.appendChild(marksCell);

        const gradeCell = document.createElement("td");
        gradeCell.textContent = result.grade || "N/A";
        row.appendChild(gradeCell);

        const actionsCell = document.createElement("td");

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("edit-button");
        editBtn.addEventListener("click", async () => {
          const newMarks = prompt("Enter new marks:", result.marks);
          if (newMarks !== null && newMarks.trim() !== "") {
            try {
              await ApiClient.patchResult
                ? ApiClient.patchResult(result.id, { marks: Number(newMarks) })
                : ApiClient.put(`/results/${result.id}/`, { ...result, marks: Number(newMarks) });
              alert("Result updated successfully");
              fetchResults();
            } catch (error) {
              console.error("Error updating result:", error);
              alert("Error updating result: " + error.message);
            }
          }
        });
        actionsCell.appendChild(editBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-button");
        deleteBtn.addEventListener("click", async () => {
          if (confirm("Are you sure you want to delete this result?")) {
            try {
              await ApiClient.deleteResult(result.id);
              alert("Result deleted successfully");
              fetchResults();
            } catch (error) {
              console.error("Error deleting result:", error);
              alert("Error deleting result: " + error.message);
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

  fetchResults();

  resultForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const studentRoll = document.getElementById("studentID").value;
    const subjectCode = document.getElementById("subjectCode").value;
    const marks = document.getElementById("marks").value;

    // Resolve student id from roll number
    try {
      const studentsData = await ApiClient.getStudents(`?search=${studentRoll}`);
      const students = studentsData.students || studentsData.results || studentsData;
      const student = Array.isArray(students)
        ? students.find((s) => s.roll_number === studentRoll)
        : null;

      if (!student) {
        alert("Student with roll number '" + studentRoll + "' not found.");
        return;
      }

      const subjectsData = await ApiClient.getSubjects(`?search=${subjectCode}`);
      const subjectList = Array.isArray(subjectsData)
        ? subjectsData
        : subjectsData.results || [];
      const subject = subjectList.find((s) => s.subject_code === subjectCode);

      if (!subject) {
        alert("Subject with code '" + subjectCode + "' not found.");
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      await ApiClient.createResult({
        student: student.id,
        subject: subject.id,
        marks: Number(marks),
        exam_date: today,
      });
      alert("Result added successfully");
      resultForm.reset();
      fetchResults();
    } catch (error) {
      console.error("Error adding result:", error);
      alert("Error adding result: " + error.message);
    }
  });
});
