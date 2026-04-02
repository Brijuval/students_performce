/**
 * Students page — uses Django API via ApiClient.
 */
document.addEventListener("DOMContentLoaded", () => {
  const studentForm = document.getElementById("studentForm");
  const studentsBody = document.getElementById("studentsBody");
  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");

  if (!studentForm || !studentsBody || !loadingMessage || !errorMessage) {
    console.error("❌ Required elements not found.");
    return;
  }

  async function fetchStudents() {
    loadingMessage.style.display = "block";
    errorMessage.style.display = "none";

    try {
      const data = await ApiClient.getStudents();
      const students = data.students || data.results || data;

      studentsBody.innerHTML = "";
      if (!Array.isArray(students) || students.length === 0) {
        studentsBody.innerHTML = '<tr><td colspan="5">No students found.</td></tr>';
        return;
      }

      students.forEach((student) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${student.name || "N/A"}</td>
          <td>${student.roll_number || "N/A"}</td>
          <td>${student.department || "N/A"}</td>
          <td>${student.cgpa !== undefined ? Number(student.cgpa).toFixed(2) : "N/A"}</td>
          <td>
            <button class="edit-button"
              data-id="${student.id}"
              data-name="${student.name}"
              data-department="${student.department}"
              data-year="${student.year}"
              data-roll="${student.roll_number}">
              Edit
            </button>
            <button class="delete-button" data-id="${student.id}">Delete</button>
          </td>
        `;
        studentsBody.appendChild(row);
      });
    } catch (err) {
      console.error("❌ Error fetching students:", err.message);
      errorMessage.textContent = `Error: ${err.message}`;
      errorMessage.style.display = "block";
    } finally {
      loadingMessage.style.display = "none";
    }
  }

  studentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const rollNumber = document.getElementById("rollNumber").value.trim();
    const department = document.getElementById("department").value.trim();
    const year = parseInt(document.getElementById("year").value.trim(), 10);

    if (!name || !rollNumber || !department || isNaN(year)) {
      alert("❌ Please fill all fields correctly");
      return;
    }

    try {
      await ApiClient.createStudent({ name, roll_number: rollNumber, department, year });
      alert("✅ Student added successfully!");
      studentForm.reset();
      fetchStudents();
    } catch (error) {
      console.error("❌ Error adding student:", error.message);
      alert(`Error adding student: ${error.message}`);
    }
  });

  studentsBody.addEventListener("click", async (e) => {
    const target = e.target;
    const id = target.dataset.id;
    if (!id) return;

    if (target.classList.contains("edit-button")) {
      const newName = prompt("Enter new name:", target.dataset.name);
      const newDepartment = prompt("Enter new department:", target.dataset.department);
      const newYear = prompt("Enter new year:", target.dataset.year);
      const newRoll = prompt("Enter new roll number:", target.dataset.roll);

      if (newName && newDepartment && newYear && newRoll) {
        try {
          await ApiClient.updateStudent(id, {
            name: newName.trim(),
            roll_number: newRoll.trim(),
            department: newDepartment.trim(),
            year: parseInt(newYear.trim(), 10),
          });
          alert("✅ Student updated successfully!");
          fetchStudents();
        } catch (error) {
          console.error("❌ Error updating student:", error.message);
          alert(error.message);
        }
      }
    }

    if (target.classList.contains("delete-button")) {
      if (confirm("⚠️ Are you sure you want to delete this student?")) {
        try {
          await ApiClient.deleteStudent(id);
          alert("✅ Student deleted successfully!");
          fetchStudents();
        } catch (error) {
          console.error("❌ Error deleting student:", error.message);
          alert(`Error deleting student: ${error.message}`);
        }
      }
    }
  });

  fetchStudents();
});
