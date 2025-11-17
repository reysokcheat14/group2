// ==================== CONFIGURATION ====================

// Sample user database for login
const userDatabase = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@school.edu",
    password: "admin123",
    role: "admin",
  },
  {
    id: 2,
    name: "John Smith",
    email: "john@school.edu",
    password: "teacher123",
    role: "teacher",
  },
  {
    id: 3,
    name: "Sarah Johnson",
    email: "sarah@school.edu",
    password: "teacher123",
    role: "teacher",
  },
  {
    id: 4,
    name: "Mike Davis",
    email: "mike@school.edu",
    password: "student123",
    role: "student",
  },
  {
    id: 5,
    name: "Emily Wilson",
    email: "emily@school.edu",
    password: "student123",
    role: "student",
  },
  {
    id: 6,
    name: "Rey Sokcheat",
    email: "reysokcheat2823@rupp.edu.kh",
    password: "test123",
    role: "admin",
  },
];

// Sample data for demonstration
const sampleData = {
  users: [
    {
      id: 1,
      name: "John Smith",
      email: "john@school.edu",
      role: "teacher",
      status: "active",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@school.edu",
      role: "teacher",
      status: "active",
    },
    {
      id: 3,
      name: "Mike Davis",
      email: "mike@school.edu",
      role: "student",
      status: "active",
    },
    {
      id: 4,
      name: "Emily Wilson",
      email: "emily@school.edu",
      role: "student",
      status: "active",
    },
    {
      id: 5,
      name: "Admin User",
      email: "admin@school.edu",
      role: "admin",
      status: "active",
    },
  ],
  classes: [
    {
      id: 1,
      name: "Mathematics 101",
      teacher: "John Smith",
      code: "MATH101",
      studentCount: 24,
    },
    {
      id: 2,
      name: "Science 202",
      teacher: "Sarah Johnson",
      code: "SCI202",
      studentCount: 18,
    },
    {
      id: 3,
      name: "History 150",
      teacher: "John Smith",
      code: "HIST150",
      studentCount: 22,
    },
  ],
  assignments: [
    {
      id: 1,
      title: "Algebra Homework",
      class: "Mathematics 101",
      dueDate: "2023-10-15",
      submissions: 20,
      totalStudents: 24,
    },
    {
      id: 2,
      title: "Science Lab Report",
      class: "Science 202",
      dueDate: "2023-10-20",
      submissions: 15,
      totalStudents: 18,
    },
    {
      id: 3,
      title: "History Essay",
      class: "History 150",
      dueDate: "2023-10-25",
      submissions: 18,
      totalStudents: 22,
    },
  ],
  submissions: [
    {
      id: 1,
      assignment: "Algebra Homework",
      class: "Mathematics 101",
      submitted: "2023-10-14",
      grade: "A",
      status: "Graded",
    },
    {
      id: 2,
      assignment: "Science Lab Report",
      class: "Science 202",
      submitted: "2023-10-19",
      grade: "B+",
      status: "Graded",
    },
    {
      id: 3,
      assignment: "History Essay",
      class: "History 150",
      submitted: "2023-10-24",
      grade: "Pending",
      status: "Submitted",
    },
  ],
};

// ==================== DOM ELEMENTS ====================

// Current user state
let currentUser = null;

// DOM Elements
const loginSection = document.getElementById("login-section");
const loginForm = document.getElementById("login-form");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const roleSelection = document.getElementById("role-selection");
const adminDashboard = document.getElementById("admin-dashboard");
const teacherDashboard = document.getElementById("teacher-dashboard");
const studentDashboard = document.getElementById("student-dashboard");
const currentUserElement = document.getElementById("current-user");
const currentRoleElement = document.getElementById("current-role");
const logoutBtn = document.getElementById("logout-btn");

// ==================== INITIALIZATION ====================

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  showLogin();
  setupEventListeners();
});

// ==================== LOGIN & NAVIGATION ====================

function showLogin() {
  hideAllDashboards();
  loginSection.classList.remove("hidden");
  currentUser = null;
}

function hideAllDashboards() {
  loginSection.classList.add("hidden");
  roleSelection.classList.add("hidden");
  adminDashboard.classList.add("hidden");
  teacherDashboard.classList.add("hidden");
  studentDashboard.classList.add("hidden");
}

function handleLogin(event) {
  event.preventDefault();

  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  // Find user in database
  const user = userDatabase.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Clear login form
    loginForm.reset();

    // Update display and show appropriate dashboard
    updateUserDisplay();

    // Go directly to the dashboard for the user's role
    switch (currentUser.role) {
      case "admin":
        adminDashboard.classList.remove("hidden");
        loadAdminDashboard();
        break;
      case "teacher":
        teacherDashboard.classList.remove("hidden");
        loadTeacherDashboard();
        break;
      case "student":
        studentDashboard.classList.remove("hidden");
        loadStudentDashboard();
        break;
    }
  } else {
    alert("Invalid email or password! Please try again.");
  }
}

function updateUserDisplay() {
  if (currentUser) {
    currentUserElement.textContent = currentUser.name;
    currentRoleElement.textContent =
      currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    currentRoleElement.className = "role-badge " + currentUser.role;
  }
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
  // Login form
  loginForm.addEventListener("submit", handleLogin);

  // Logout button
  logoutBtn.addEventListener("click", function () {
    showLogin();
  });

  // Modal close button
  document.getElementById("modal-close").addEventListener("click", closeModal);

  // Modal overlay click to close
  document
    .getElementById("modal-overlay")
    .addEventListener("click", function (e) {
      if (e.target === this) {
        closeModal();
      }
    });

  // Admin buttons
  document
    .getElementById("add-user-btn")
    .addEventListener("click", function () {
      showAddUserModal();
    });

  // Teacher buttons
  document
    .getElementById("create-class-btn")
    .addEventListener("click", function () {
      showCreateClassModal();
    });

  document
    .getElementById("create-assignment-btn")
    .addEventListener("click", function () {
      showCreateAssignmentModal();
    });

  // Student buttons
  document
    .getElementById("join-class-btn")
    .addEventListener("click", function () {
      joinClass();
    });
}

// ==================== ADMIN DASHBOARD ====================

function loadAdminDashboard() {
  loadUsersTable();
  loadAdminClasses();
}

async function loadUsersTable() {
  const tbody = document.getElementById("users-table-body");
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
        <button class="btn btn-sm btn-primary">Edit</button>
        <button class="btn btn-sm btn-danger">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function loadAdminClasses() {
  const grid = document.getElementById("admin-classes-grid");
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

function showAddUserModal() {
  const modalBody = document.getElementById("modal-body");
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
    });
}

// ==================== TEACHER DASHBOARD ====================

async function loadTeacherDashboard() {
  // Load teacher classes, assignments and analytics
  const grid = document.getElementById("teacher-classes-grid");
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

  // Load other teacher sections
  loadTeacherAssignments();
  loadTeacherAnalytics();
}

function loadTeacherAssignments() {
  const list = document.getElementById("teacher-assignments-list");
  list.innerHTML = "";

  sampleData.assignments.forEach((assignment) => {
    const card = document.createElement("div");
    card.className = "assignment-card";
    card.innerHTML = `
      <div class="assignment-info">
        <h4>${assignment.title}</h4>
        <div class="assignment-meta">
          ${assignment.class} • Due: ${assignment.dueDate}
        </div>
        <div>Submissions: ${assignment.submissions}/${assignment.totalStudents}</div>
      </div>
      <div class="assignment-actions">
        <button class="btn btn-sm btn-primary">Grade</button>
        <button class="btn btn-sm btn-warning">Edit</button>
        <button class="btn btn-sm btn-danger">Delete</button>
      </div>
    `;
    list.appendChild(card);
  });
}

function loadTeacherAnalytics() {
  const progressBars = document.querySelector(".progress-bars");
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

function showCreateClassModal() {
  const modalBody = document.getElementById("modal-body");
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
    .addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Class created successfully!");
      closeModal();
    });
}

function showCreateAssignmentModal() {
  const modalBody = document.getElementById("modal-body");
  modalBody.innerHTML = `
    <form id="create-assignment-form">
      <div class="form-group">
        <label for="assignment-title">Assignment Title</label>
        <input type="text" id="assignment-title" class="form-control" required>
      </div>
      <div class="form-group">
        <label for="assignment-class">Class</label>
        <select id="assignment-class" class="form-control" required>
          <option value="">Select Class</option>
          ${sampleData.classes
            .map((c) => `<option value="${c.id}">${c.name}</option>`)
            .join("")}
        </select>
      </div>
      <div class="form-group">
        <label for="assignment-due">Due Date</label>
        <input type="date" id="assignment-due" class="form-control" required>
      </div>
      <div class="form-group">
        <label for="assignment-description">Description</label>
        <textarea id="assignment-description" class="form-control" rows="4"></textarea>
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
    .addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Assignment created successfully!");
      closeModal();
    });
}

// Note: Student dashboard functions moved to student.js for better organization

// ==================== MODAL FUNCTIONS ====================

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
}

// ==================== API FUNCTIONS ====================

async function fetchUsers() {
  try {
    const response = await fetch("/api/users");
    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return sampleData.users;
  }
}

async function fetchClasses() {
  try {
    const response = await fetch("/api/classes");
    return await response.json();
  } catch (error) {
    console.error("Error fetching classes:", error);
    return sampleData.classes;
  }
}

async function addUser(userData) {
  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding user:", error);
    return null;
  }
}

async function addClass(classData) {
  try {
    const response = await fetch("/api/classes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(classData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding class:", error);
    return null;
  }
}
