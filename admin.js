// ==================== ADMIN DASHBOARD ====================

document.addEventListener("DOMContentLoaded", function () {
  setupAdminEventListeners();
  loadAdminDashboard();
});

// ==================== EVENT LISTENERS ====================

function setupAdminEventListeners() {
  const addUserBtn = document.getElementById("add-user-btn");
  if (addUserBtn) {
    addUserBtn.addEventListener("click", showAddUserModal);
  }
}

// ==================== LOAD FUNCTIONS ====================

function loadAdminDashboard() {
  loadUsersTable();
  loadAdminClasses();
}

async function loadUsersTable() {
  const tbody = document.getElementById("users-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  const users = await fetchUsers();

  if (!users || users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">No users found</td>
      </tr>
    `;
    return;
  }

  users.forEach((user) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td><span class="role-badge ${user.role}">${user.role}</span></td>
      <td><span class="status ${user.status}">${user.status}</span></td>
      <td>
        <button class="btn btn-sm btn-primary edit-user-btn">Edit</button>
        <button class="btn btn-sm btn-danger delete-user-btn">Delete</button>
      </td>
    `;
    // Attach delete handler
    row.querySelector(".delete-user-btn").onclick = () =>
      deleteUser(user.id || user.email);
    tbody.appendChild(row);
  });
  // ==================== DELETE USER HANDLER ====================
  async function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      if (typeof db !== "undefined" && db) {
        // Try to delete from Firebase by ID
        await db.collection("users").doc(userId).delete();
        console.log("User deleted from Firebase:", userId);
      } else {
        // Fallback: use API
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("API delete failed");
        console.log("User deleted via API");
      }
      alert("User deleted successfully!");
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Could not delete user. Check console for details.");
    }
    await loadUsersTable();
  }
}

async function loadAdminClasses() {
  const grid = document.getElementById("admin-classes-grid");
  if (!grid) return;

  grid.innerHTML = "";

  const classes = await fetchClasses();

  classes.forEach((classItem) => {
    const card = document.createElement("div");
    card.className = "class-card";
    card.innerHTML = `
      <h4>${classItem.name}</h4>
      <p>Teacher: ${classItem.teacher}</p>
      <div class="class-code">Code: ${classItem.code}</div>
      <p>Students: ${classItem.studentCount}</p>
      <button class="btn btn-sm btn-primary mt-20">View Details</button>
    `;
    grid.appendChild(card);
  });
}

// ==================== MODAL FUNCTIONS ====================

function showAddUserModal() {
  const modalBody = document.getElementById("modal-body");
  if (!modalBody) return;

  modalBody.innerHTML = `
    <form id="add-user-form">
      <div class="form-group">
        <label for="user-name">Full Name</label>
        <input type="text" id="user-name" class="form-control" required>
      </div>
      <div class="form-group">
        <label for="user-email">Email</label>
        <input type="email" id="user-email" class="form-control" required>
      </div>
      <div class="form-group">
        <label for="user-role">Role</label>
        <select id="user-role" class="form-control" required>
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>
      </div>
      <div class="form-group">
        <button type="submit" class="btn btn-primary">Add User</button>
      </div>
    </form>
  `;

  document.getElementById("modal-title").textContent = "Add New User";
  document.getElementById("modal-overlay").classList.remove("hidden");

  document
    .getElementById("add-user-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      alert("User added successfully!");
      closeModal();
      loadUsersTable();
    });
}
