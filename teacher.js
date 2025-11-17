// ==================== TEACHER DASHBOARD ====================

document.addEventListener("DOMContentLoaded", function () {
  setupTeacherEventListeners();
  loadTeacherDashboard();
});

// ==================== EVENT LISTENERS ====================

function setupTeacherEventListeners() {
  const createClassBtn = document.getElementById("create-class-btn");
  if (createClassBtn) {
    createClassBtn.addEventListener("click", showCreateClassModal);
  }

  const createAssignmentBtn = document.getElementById("create-assignment-btn");
  if (createAssignmentBtn) {
    createAssignmentBtn.addEventListener("click", showCreateAssignmentModal);
  }
}

// ==================== LOAD FUNCTIONS ====================

function loadTeacherDashboard() {
  loadTeacherClasses();
  loadTeacherAssignments();
  loadTeacherAnalytics();
}

async function loadTeacherClasses() {
  const grid = document.getElementById("teacher-classes-grid");
  if (!grid) return;

  grid.innerHTML = "";

  const classes = await fetchClasses();

  classes.forEach((classItem) => {
    const card = document.createElement("div");
    card.className = "class-card";
    card.innerHTML = `
      <h4>${classItem.name}</h4>
      <div class="class-code">Join Code: ${classItem.code}</div>
      <p>Students: ${classItem.studentCount}</p>
      <div class="assignment-actions">
        <button class="btn btn-sm btn-primary">Manage</button>
        <button class="btn btn-sm btn-success">View Analytics</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

async function loadTeacherAssignments() {
  const list = document.getElementById("teacher-assignments-list");
  if (!list) return;

  list.innerHTML = "";

  // Fetch assignments (from Firebase or API)
  let assignments = [];
  try {
    if (typeof db !== "undefined" && db) {
      const snapshot = await db.collection("assignments").get();
      assignments = [];
      snapshot.forEach((doc) => {
        assignments.push({ id: doc.id, ...doc.data() });
      });
    }
  } catch (err) {
    console.warn("Firebase assignments fetch error:", err);
  }

  // Fallback to sampleData if no Firebase assignments
  if (assignments.length === 0) {
    assignments = sampleData.assignments;
  }

  // Get teacher's classes to filter assignments
  const classes = await fetchClasses();
  const classNames = classes.map((c) => c.name);

  // Display only assignments for classes this teacher teaches
  const teacherAssignments = assignments.filter(
    (a) => classNames.includes(a.class) || a.class === undefined
  );

  if (teacherAssignments.length === 0) {
    list.innerHTML = "<p>No assignments yet. Create one to get started!</p>";
    return;
  }

  teacherAssignments.forEach((assignment) => {
    const card = document.createElement("div");
    card.className = "assignment-card";
    card.innerHTML = `
      <div class="assignment-info">
        <h4>${assignment.title}</h4>
        <div class="assignment-meta">
          ${assignment.class} • Due: ${assignment.dueDate}
        </div>
        <div>Submissions: ${assignment.submissions || 0}/${
      assignment.totalStudents || "N/A"
    }</div>
      </div>
      <div class="assignment-actions">
        <button class="btn btn-sm btn-primary grade-btn" data-id="${
          assignment.id || assignment.title
        }">Grade</button>
        <button class="btn btn-sm btn-warning edit-btn" data-id="${
          assignment.id || assignment.title
        }">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn" data-id="${
          assignment.id || assignment.title
        }">Delete</button>
      </div>
    `;

    // Add event listeners to buttons
    const gradeBtn = card.querySelector(".grade-btn");
    const editBtn = card.querySelector(".edit-btn");
    const deleteBtn = card.querySelector(".delete-btn");

    if (gradeBtn)
      gradeBtn.addEventListener("click", () => showGradeModal(assignment));
    if (editBtn)
      editBtn.addEventListener("click", () =>
        showEditAssignmentModal(assignment)
      );
    if (deleteBtn)
      deleteBtn.addEventListener("click", () =>
        deleteAssignment(assignment.id || assignment.title)
      );

    list.appendChild(card);
  });
}

function loadTeacherAnalytics() {
  const progressBars = document.querySelector(".progress-bars");
  if (!progressBars) return;

  progressBars.innerHTML = "";

  sampleData.assignments.forEach((assignment) => {
    const percentage = Math.round(
      (assignment.submissions / assignment.totalStudents) * 100
    );
    const bar = document.createElement("div");
    bar.innerHTML = `
      <div>${assignment.title}</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${percentage}%"></div>
      </div>
      <div>${percentage}% (${assignment.submissions}/${assignment.totalStudents})</div>
    `;
    progressBars.appendChild(bar);
  });
}

// ==================== MODAL FUNCTIONS ====================

function showCreateClassModal() {
  const modalBody = document.getElementById("modal-body");
  if (!modalBody) return;

  modalBody.innerHTML = `
    <form id="create-class-form">
      <div class="form-group">
        <label for="class-name">Class Name</label>
        <input type="text" id="class-name" class="form-control" required>
      </div>
      <div class="form-group">
        <label for="class-subject">Subject</label>
        <input type="text" id="class-subject" class="form-control" required>
      </div>
      <div class="form-group">
        <label for="class-description">Description</label>
        <textarea id="class-description" class="form-control" rows="3"></textarea>
      </div>
      <div class="form-group">
        <button type="submit" class="btn btn-primary">Create Class</button>
      </div>
    </form>
  `;

  document.getElementById("modal-title").textContent = "Create New Class";
  document.getElementById("modal-overlay").classList.remove("hidden");

  document
    .getElementById("create-class-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = document.getElementById("class-name").value.trim();
      const subject = document.getElementById("class-subject").value.trim();
      const description = document
        .getElementById("class-description")
        .value.trim();

      if (!name || !subject) {
        alert("Please provide both class name and subject.");
        return;
      }

      const newClass = {
        name: name,
        subject: subject,
        description: description,
        code: (
          subject.slice(0, 3) + Math.floor(Math.random() * 900 + 100)
        ).toUpperCase(),
        studentCount: 0,
      };

      try {
        // Use shared helper to add class (tries Firebase first, then API)
        const created = await addClass(newClass);
        console.log("Class created:", created);
        alert("Class created successfully!");
      } catch (err) {
        console.error("Error creating class:", err);
        alert("Could not create class. Check console for details.");
      }

      closeModal();
      await loadTeacherClasses();
    });
}

async function showCreateAssignmentModal() {
  const modalBody = document.getElementById("modal-body");
  if (!modalBody) return;

  // Fetch the teacher's classes to populate the dropdown
  const classes = await fetchClasses();
  const classOptions = classes
    .map((c) => `<option value="${c.name}">${c.name}</option>`)
    .join("");

  modalBody.innerHTML = `
    <form id="create-assignment-form">
      <div class="form-group">
        <label for="assignment-title">Assignment Title</label>
        <input type="text" id="assignment-title" class="form-control" required>
      </div>
      <div class="form-group">
        <label for="assignment-class">Select Class</label>
        <select id="assignment-class" class="form-control" required>
          <option value="">-- Choose a class --</option>
          ${classOptions}
        </select>
      </div>
      <div class="form-group">
        <label for="assignment-due">Due Date</label>
        <input type="date" id="assignment-due" class="form-control" required>
      </div>
      <div class="form-group">
        <label for="assignment-description">Description</label>
        <textarea id="assignment-description" class="form-control" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label for="assignment-file">Attach File (PDF, DOC, etc.)</label>
        <input type="file" id="assignment-file" class="form-control">
        <small>Optional: Students will download this file</small>
      </div>
      <div class="form-group">
        <button type="submit" class="btn btn-primary">Create Assignment</button>
      </div>
    </form>
  `;

  document.getElementById("modal-title").textContent = "Create New Assignment";
  document.getElementById("modal-overlay").classList.remove("hidden");

  document
    .getElementById("create-assignment-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const title = document.getElementById("assignment-title").value.trim();
      const classSelected = document
        .getElementById("assignment-class")
        .value.trim();
      const dueDate = document.getElementById("assignment-due").value.trim();
      const description = document
        .getElementById("assignment-description")
        .value.trim();
      const fileInput = document.getElementById("assignment-file");

      if (!title || !classSelected || !dueDate) {
        alert("Please fill in all required fields.");
        return;
      }

      const newAssignment = {
        title: title,
        class: classSelected,
        dueDate: dueDate,
        description: description,
        submissions: 0,
        totalStudents: 0,
        fileName:
          fileInput && fileInput.files.length > 0
            ? fileInput.files[0].name
            : null,
        createdAt: new Date(),
      };

      try {
        // Try to save to Firebase first
        if (typeof db !== "undefined" && db) {
          const docRef = await db.collection("assignments").add(newAssignment);
          console.log("Assignment created in Firebase:", docRef.id);
        } else {
          // Fallback: POST to API
          const response = await fetch("/api/assignments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newAssignment),
          });
          if (!response.ok) throw new Error("API request failed");
          console.log("Assignment created via API");
        }
        alert("Assignment created successfully!");
      } catch (err) {
        console.error("Error creating assignment:", err);
        alert("Could not create assignment. Check console for details.");
      }

      closeModal();
      await loadTeacherAssignments();
    });
}

// ==================== GRADE/EDIT/DELETE HANDLERS ====================

function showGradeModal(assignment) {
  const modalBody = document.getElementById("modal-body");
  if (!modalBody) return;

  modalBody.innerHTML = `
    <div class="grade-modal">
      <h4>${assignment.title}</h4>
      <p><strong>Class:</strong> ${assignment.class}</p>
      <p><strong>Due Date:</strong> ${assignment.dueDate}</p>
      <p><strong>Submissions:</strong> ${assignment.submissions || 0}</p>
      
      <div style="margin-top: 20px;">
        <h5>Student Submissions</h5>
        <p style="color: #999; font-size: 14px;">
          Students who submitted assignments will appear here with their files for grading.
        </p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 4px;">
          <p>No submissions yet</p>
        </div>
      </div>
      
      <div style="margin-top: 15px;">
        <button class="btn btn-primary" onclick="closeModal()">Close</button>
      </div>
    </div>
  `;

  document.getElementById("modal-title").textContent = "Grade Assignment";
  document.getElementById("modal-overlay").classList.remove("hidden");
}

function showEditAssignmentModal(assignment) {
  const modalBody = document.getElementById("modal-body");
  if (!modalBody) return;

  modalBody.innerHTML = `
    <form id="edit-assignment-form">
      <div class="form-group">
        <label for="edit-title">Assignment Title</label>
        <input type="text" id="edit-title" class="form-control" value="${
          assignment.title
        }" required>
      </div>
      <div class="form-group">
        <label for="edit-due">Due Date</label>
        <input type="date" id="edit-due" class="form-control" value="${
          assignment.dueDate
        }" required>
      </div>
      <div class="form-group">
        <label for="edit-description">Description</label>
        <textarea id="edit-description" class="form-control" rows="3">${
          assignment.description || ""
        }</textarea>
      </div>
      <div class="form-group">
        <button type="submit" class="btn btn-primary">Save Changes</button>
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      </div>
    </form>
  `;

  document.getElementById("modal-title").textContent = "Edit Assignment";
  document.getElementById("modal-overlay").classList.remove("hidden");

  document
    .getElementById("edit-assignment-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const updatedAssignment = {
        ...assignment,
        title: document.getElementById("edit-title").value.trim(),
        dueDate: document.getElementById("edit-due").value.trim(),
        description: document.getElementById("edit-description").value.trim(),
      };

      try {
        if (typeof db !== "undefined" && db && assignment.id) {
          await db
            .collection("assignments")
            .doc(assignment.id)
            .update(updatedAssignment);
          console.log("Assignment updated in Firebase");
        }
        alert("Assignment updated successfully!");
      } catch (err) {
        console.error("Error updating assignment:", err);
        alert("Could not update assignment.");
      }

      closeModal();
      await loadTeacherAssignments();
    });
}

async function deleteAssignment(assignmentId) {
  if (!confirm("Are you sure you want to delete this assignment?")) return;

  try {
    if (typeof db !== "undefined" && db) {
      // Delete from Firebase by ID
      await db.collection("assignments").doc(assignmentId).delete();
      console.log("Assignment deleted from Firebase:", assignmentId);
    } else {
      // Fallback: use API
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("API delete failed");
      console.log("Assignment deleted via API");
    }
    alert("Assignment deleted successfully!");
  } catch (err) {
    console.error("Error deleting assignment:", err);
    alert("Could not delete assignment. Check console for details.");
  }

  closeModal();
  await loadTeacherAssignments();
}
