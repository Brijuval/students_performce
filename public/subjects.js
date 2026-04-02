document.addEventListener("DOMContentLoaded", () => {
  const subjectForm = document.getElementById("subjectForm");
  const subjectsBody = document.getElementById("subjectsBody");

  // Fetch and display all subjects
  async function fetchSubjects(params = {}) {
    showLoading();
    try {
      const result = await api.getSubjects(params);

      if (!result.success) {
        throw new Error(result.message);
      }

      const subjects = Array.isArray(result.data)
        ? result.data
        : (result.data?.results || result.data?.subjects || []);

      subjectsBody.innerHTML = "";

      subjects.forEach(subject => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${subject.name}</td>
          <td>${subject.subjectCode || subject.code || subject.subject_code || ''}</td>
          <td>
            <button class="edit-button" data-id="${subject.id || subject._id}"
                    data-name="${subject.name}"
                    data-credit="${subject.credit || 3}">Edit</button>
            <button class="delete-button" data-id="${subject.id || subject._id}">Delete</button>
          </td>
        `;
        subjectsBody.appendChild(row);
      });
    } catch (err) {
      console.error("Error fetching subjects:", err);
      showNotification("Error fetching subjects. Please check the server.", 'error');
    } finally {
      hideLoading();
    }
  }

  // Handle form submission
  subjectForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("subjectName").value.trim();
    const subjectCode = document.getElementById("subjectCode").value.trim();
    const credit = 3; // Default credit value

    if (!name || !subjectCode) {
      showNotification("All fields are required!", 'error');
      return;
    }

    showLoading();
    try {
      const result = await api.createSubject({ name, subjectCode, credit });

      if (!result.success) {
        throw new Error(result.message);
      }

      showNotification("Subject added successfully", 'success');
      subjectForm.reset();
      fetchSubjects();
    } catch (error) {
      console.error("Error adding subject:", error);
      showNotification("Error adding subject: " + error.message, 'error');
    } finally {
      hideLoading();
    }
  });

  // Event delegation for Edit & Delete
  subjectsBody.addEventListener("click", async (e) => {
    const target = e.target;
    const id = target.dataset.id;

    if (target.classList.contains("edit-button")) {
      const currentName = target.dataset.name;
      const currentCredit = target.dataset.credit || 3;

      const newName = prompt("Enter new subject name:", currentName);
      const newCredit = prompt("Enter new credit value:", currentCredit);

      if (newName && newCredit) {
        showLoading();
        try {
          const result = await api.updateSubject(id, {
            name: newName,
            credit: parseInt(newCredit)
          });

          if (!result.success) {
            throw new Error(result.message);
          }

          showNotification("Subject updated successfully", 'success');
          fetchSubjects();
        } catch (error) {
          console.error("Error updating subject:", error);
          showNotification("Error updating subject: " + error.message, 'error');
        } finally {
          hideLoading();
        }
      }
    }

    if (target.classList.contains("delete-button")) {
      if (confirm("Are you sure you want to delete this subject?")) {
        showLoading();
        try {
          const result = await api.deleteSubject(id);

          if (!result.success) {
            throw new Error(result.message);
          }

          showNotification("Subject deleted successfully", 'success');
          fetchSubjects();
        } catch (error) {
          console.error("Error deleting subject:", error);
          showNotification("Error deleting subject: " + error.message, 'error');
        } finally {
          hideLoading();
        }
      }
    }
  });

  // Initial fetch
  fetchSubjects();
});
