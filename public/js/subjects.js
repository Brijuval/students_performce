/**
 * Subjects page — uses Django API via ApiClient.
 */
document.addEventListener("DOMContentLoaded", () => {
  const subjectForm = document.getElementById("subjectForm");
  const subjectsBody = document.getElementById("subjectsBody");

  async function fetchSubjects() {
    try {
      const subjects = await ApiClient.getSubjects();
      const list = Array.isArray(subjects) ? subjects : subjects.results || [];
      subjectsBody.innerHTML = "";

      if (list.length === 0) {
        subjectsBody.innerHTML = '<tr><td colspan="3">No subjects found.</td></tr>';
        return;
      }

      list.forEach((subject) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${subject.name}</td>
          <td>${subject.subject_code}</td>
          <td>
            <button class="edit-button"
              data-id="${subject.id}"
              data-name="${subject.name}"
              data-credit="${subject.credit || 3}">
              Edit
            </button>
            <button class="delete-button" data-id="${subject.id}">Delete</button>
          </td>
        `;
        subjectsBody.appendChild(row);
      });
    } catch (err) {
      console.error("Error fetching subjects:", err);
      alert("Error fetching subjects. Please check the server.");
    }
  }

  subjectForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("subjectName").value.trim();
    const subject_code = document.getElementById("subjectCode").value.trim();
    const credit = 3;

    if (!name || !subject_code) {
      alert("All fields are required!");
      return;
    }

    try {
      await ApiClient.createSubject({ name, subject_code, credit });
      alert("Subject added successfully");
      subjectForm.reset();
      fetchSubjects();
    } catch (error) {
      console.error("Error adding subject:", error);
      alert("Error adding subject: " + error.message);
    }
  });

  subjectsBody.addEventListener("click", async (e) => {
    const target = e.target;
    const id = target.dataset.id;

    if (target.classList.contains("edit-button")) {
      const newName = prompt("Enter new subject name:", target.dataset.name);
      const newCredit = prompt("Enter new credit value:", target.dataset.credit || 3);

      if (newName && newCredit) {
        try {
          await ApiClient.patchSubject(id, {
            name: newName,
            credit: parseInt(newCredit),
          });
          alert("Subject updated successfully");
          fetchSubjects();
        } catch (error) {
          console.error("Error updating subject:", error);
          alert("Error updating subject: " + error.message);
        }
      }
    }

    if (target.classList.contains("delete-button")) {
      if (confirm("Are you sure you want to delete this subject?")) {
        try {
          await ApiClient.deleteSubject(id);
          alert("Subject deleted successfully");
          fetchSubjects();
        } catch (error) {
          console.error("Error deleting subject:", error);
          alert("Error deleting subject: " + error.message);
        }
      }
    }
  });

  fetchSubjects();
});
