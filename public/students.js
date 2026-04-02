document.addEventListener("DOMContentLoaded", () => {
  const studentForm = document.getElementById("studentForm");
  const studentsBody = document.getElementById("studentsBody");
  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");

  if (!studentForm || !studentsBody || !loadingMessage || !errorMessage) {
      console.error("❌ Required elements not found.");
      return;
  }

  async function fetchStudents(params = {}) {
      loadingMessage.style.display = "block";
      errorMessage.style.display = "none";
      showLoading();

      try {
          const result = await api.getStudents(params);

          if (!result.success) {
              throw new Error(result.message);
          }

          const students = Array.isArray(result.data)
              ? result.data
              : (result.data?.results || result.data?.students || []);

          studentsBody.innerHTML = "";
          students.forEach(student => {
              const row = document.createElement("tr");
              row.innerHTML = `
                  <td>${student.name || "N/A"}</td>
                  <td>${student.rollNumber || student.roll_number || "N/A"}</td>
                  <td>${student.department || "N/A"}</td>
                  <td>${student.cgpa != null ? Number(student.cgpa).toFixed(2) : "N/A"}</td>
                  <td>
                      <button class="edit-button" data-id="${student.id || student._id}"
                              data-name="${student.name}"
                              data-department="${student.department || ''}"
                              data-year="${student.year || ''}"
                              data-roll="${student.rollNumber || student.roll_number || ''}">
                          Edit
                      </button>
                      <button class="delete-button" data-id="${student.id || student._id}">Delete</button>
                  </td>
              `;
              studentsBody.appendChild(row);
          });
      } catch (err) {
          console.error("❌ Error fetching students:", err.message);
          errorMessage.textContent = `Error: ${err.message}`;
          errorMessage.style.display = "block";
          showNotification(err.message, 'error');
      } finally {
          loadingMessage.style.display = "none";
          hideLoading();
      }
  }

  async function isRollNumberUnique(rollNumber) {
      try {
          const result = await api.getStudents({ search: rollNumber });
          if (!result.success) return true;
          const students = Array.isArray(result.data)
              ? result.data
              : (result.data?.results || result.data?.students || []);
          return !students.some(s => (s.rollNumber || s.roll_number) === rollNumber);
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
          showNotification("❌ Please fill all fields correctly", 'error');
          return;
      }

      if (!(await isRollNumberUnique(rollNumber))) {
          showNotification("❌ This roll number is already taken!", 'error');
          return;
      }

      const studentData = { name, rollNumber, department, year };
      showLoading();

      try {
          const result = await api.createStudent(studentData);

          if (!result.success) {
              throw new Error(result.message);
          }

          showNotification("✅ Student added successfully!", 'success');
          studentForm.reset();
          fetchStudents();
      } catch (error) {
          console.error("❌ Error adding student:", error.message);
          showNotification(`Error adding student: ${error.message}`, 'error');
      } finally {
          hideLoading();
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
              showLoading();
              try {
                  const result = await api.updateStudent(id, {
                      name: newName.trim(),
                      department: newDepartment.trim(),
                      year: parseInt(newYear.trim(), 10),
                      rollNumber: newRoll.trim()
                  });

                  if (!result.success) {
                      throw new Error(result.message);
                  }

                  showNotification("✅ Student updated successfully!", 'success');
                  fetchStudents();
              } catch (error) {
                  console.error("❌ Error updating student:", error.message);
                  showNotification(error.message, 'error');
              } finally {
                  hideLoading();
              }
          }
      }

      if (target.classList.contains("delete-button")) {
          if (confirm("⚠️ Are you sure you want to delete this student?")) {
              showLoading();
              try {
                  const result = await api.deleteStudent(id);

                  if (!result.success) {
                      throw new Error(result.message);
                  }

                  showNotification("✅ Student deleted successfully!", 'success');
                  fetchStudents();
              } catch (error) {
                  console.error("❌ Error deleting student:", error.message);
                  showNotification(`Error deleting student: ${error.message}`, 'error');
              } finally {
                  hideLoading();
              }
          }
      }
  });

  fetchStudents();
});
