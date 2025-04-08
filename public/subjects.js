document.addEventListener("DOMContentLoaded", () => {
  const subjectForm = document.getElementById("subjectForm");
  const subjectsBody = document.getElementById("subjectsBody");

  const API_BASE_URL = "http://localhost:5000/api/subjects";

  // Fetch and display all subjects
  async function fetchSubjects() {
    try {
      const res = await fetch(API_BASE_URL);
      if (!res.ok) throw new Error("Failed to fetch subjects");

      const subjects = await res.json();
      subjectsBody.innerHTML = ""; // Clear table before adding new data

      subjects.forEach(subject => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${subject.name}</td>
          <td>${subject.subjectCode}</td>
          <td>
            <button class="edit-button" data-id="${subject._id}" data-name="${subject.name}" data-credit="${subject.credit || 3}">Edit</button>
            <button class="delete-button" data-id="${subject._id}">Delete</button>
          </td>
        `;
        subjectsBody.appendChild(row);
      });
    } catch (err) {
      console.error("Error fetching subjects:", err);
      alert("Error fetching subjects. Please check the server.");
    }
  }

  // Handle form submission
  subjectForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("subjectName").value.trim();
    const subjectCode = document.getElementById("subjectCode").value.trim();
    const credit = 3; // Default credit value

    if (!name || !subjectCode) {
      alert("All fields are required!");
      return;
    }

    try {
      const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subjectCode, credit })
      });

      if (res.ok) {
        alert("Subject added successfully");
        subjectForm.reset();
        fetchSubjects();
      } else {
        const errorData = await res.json();
        alert("Error adding subject: " + errorData.error);
      }
    } catch (error) {
      console.error("Error adding subject:", error);
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
        try {
          const res = await fetch(`${API_BASE_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName, credit: parseInt(newCredit) })
          });

          if (res.ok) {
            alert("Subject updated successfully");
            fetchSubjects();
          } else {
            const errorData = await res.json();
            alert("Error updating subject: " + errorData.error);
          }
        } catch (error) {
          console.error("Error updating subject:", error);
        }
      }
    }

    if (target.classList.contains("delete-button")) {
      if (confirm("Are you sure you want to delete this subject?")) {
        try {
          const res = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });

          if (res.ok) {
            alert("Subject deleted successfully");
            fetchSubjects();
          } else {
            const errorData = await res.json();
            alert("Error deleting subject: " + errorData.error);
          }
        } catch (error) {
          console.error("Error deleting subject:", error);
        }
      }
    }
  });

  // Initial fetch
  fetchSubjects();
});
