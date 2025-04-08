document.addEventListener("DOMContentLoaded", () => {
  const studentForm = document.getElementById("studentForm");
  const studentsBody = document.getElementById("studentsBody");
  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");

  if (!studentForm || !studentsBody || !loadingMessage || !errorMessage) {
      console.error("❌ Required elements not found.");
      return;
  }

  const API_BASE_URL = "http://localhost:5000/api/students";

  async function fetchStudents() {
      loadingMessage.style.display = "block";
      errorMessage.style.display = "none";

      try {
          const res = await fetch(API_BASE_URL);
          if (!res.ok) throw new Error(`Server error: ${res.status}`);

          const data = await res.json();
          console.log("📩 API Response:", data);

          if (!data || !Array.isArray(data.students)) {
              throw new Error("Invalid API response: Expected 'students' array");
          }

          studentsBody.innerHTML = "";
          data.students.forEach(student => {
              const row = document.createElement("tr");
              row.innerHTML = `
                  <td>${student.name || "N/A"}</td>
                  <td>${student.rollNumber || "N/A"}</td>
                  <td>${student.department || "N/A"}</td>
                  <td>${student.cgpa ? student.cgpa.toFixed(2) : "N/A"}</td>
                  <td>
                      <button class="edit-button" data-id="${student._id}" 
                              data-name="${student.name}" 
                              data-department="${student.department}" 
                              data-year="${student.year}" 
                              data-roll="${student.rollNumber}">
                          Edit
                      </button>
                      <button class="delete-button" data-id="${student._id}">Delete</button>
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

  async function isRollNumberUnique(rollNumber) {
      try {
          const response = await fetch(API_BASE_URL);
          const data = await response.json();
          return !data.students.some(student => student.rollNumber === rollNumber);
      } catch (error) {
          console.error("❌ Error checking roll number uniqueness:", error);
          return false;
      }
  }

  studentForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const name = document.getElementById("name").value.trim();
      const rollNumber = document.getElementById("rollNumber").value.trim();
      const department = document.getElementById("department").value.trim();
      const year = parseInt(document.getElementById("year").value.trim(), 10);

      if (!name || !rollNumber || !department || isNaN(year)) {
          alert("❌ Please fill all fields correctly");
          return;
      }

      if (!(await isRollNumberUnique(rollNumber))) {
          alert("❌ This roll number is already taken!");
          return;
      }

      const studentData = { name, rollNumber, department, year };

      try {
          const response = await fetch(API_BASE_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(studentData)
          });

          if (!response.ok) {
              const contentType = response.headers.get("content-type");
              if (contentType && contentType.includes("application/json")) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || "Failed to add student");
              } else {
                  const errorText = await response.text();
                  throw new Error(errorText || "Failed to add student");
              }
          }

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
          const currentName = target.dataset.name;
          const currentDepartment = target.dataset.department;
          const currentYear = target.dataset.year;
          const currentRoll = target.dataset.roll;

          const newName = prompt("Enter new name:", currentName);
          const newDepartment = prompt("Enter new department:", currentDepartment);
          const newYear = prompt("Enter new year:", currentYear);
          const newRoll = prompt("Enter new roll number:", currentRoll);

          if (newName && newDepartment && newYear && newRoll) {
              try {
                  const res = await fetch(`${API_BASE_URL}/${id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                          name: newName.trim(),
                          department: newDepartment.trim(),
                          year: parseInt(newYear.trim(), 10),
                          rollNumber: newRoll.trim()
                      })
                  });

                  if (!res.ok) {
                      const errorData = await res.json();
                      throw new Error(errorData.error || "Error updating student");
                  }

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
                  const res = await fetch(`${API_BASE_URL}/${id}`, {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" }
                  });

                  if (!res.ok) {
                      const errorData = await res.json();
                      throw new Error(errorData.error || "Error deleting student");
                  }

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