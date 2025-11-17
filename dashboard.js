// ==================== SAMPLE DATA ====================

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

// ==================== USER MANAGEMENT ====================

let currentUser = null;

document.addEventListener("DOMContentLoaded", function () {
  // Retrieve user from localStorage
  const userJson = localStorage.getItem("currentUser");
  if (!userJson) {
    // If no user logged in, redirect to login
    window.location.href = "login.html";
    return;
  }

  currentUser = JSON.parse(userJson);
  updateUserDisplay();
  setupCommonEventListeners();
});

function updateUserDisplay() {
  const currentUserElement = document.getElementById("current-user");
  const currentRoleElement = document.getElementById("current-role");

  if (currentUserElement && currentUser) {
    currentUserElement.textContent = currentUser.name;
  }

  if (currentRoleElement && currentUser) {
    currentRoleElement.textContent =
      currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    currentRoleElement.className = "role-badge " + currentUser.role;
  }
}

function setupCommonEventListeners() {
  // Logout button
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  // Modal close button
  const modalClose = document.getElementById("modal-close");
  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }

  // Modal overlay click to close
  const modalOverlay = document.getElementById("modal-overlay");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", function (e) {
      if (e.target === this) {
        closeModal();
      }
    });
  }
}

function handleLogout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

// ==================== MODAL FUNCTIONS ====================

function closeModal() {
  const modalOverlay = document.getElementById("modal-overlay");
  if (modalOverlay) {
    modalOverlay.classList.add("hidden");
  }
}

// ==================== API FUNCTIONS ====================

async function fetchUsers() {
  try {
    // Try to fetch from Firebase first
    if (typeof db !== "undefined" && db) {
      const usersSnapshot = await db.collection("users").get();
      const users = [];
      usersSnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      if (users.length > 0) {
        console.log("Fetched users from Firebase:", users);
        return users;
      }
    }
  } catch (firebaseError) {
    console.warn("Firebase fetch error:", firebaseError);
  }

  // Fallback to API if Firebase fails
  try {
    const response = await fetch("/api/users");
    const users = await response.json();
    console.log("Fetched users from API:", users);
    return users;
  } catch (apiError) {
    console.error("API fetch error:", apiError);
    return sampleData.users;
  }
}

async function fetchClasses() {
  try {
    // Try to fetch from Firebase first
    if (typeof db !== "undefined" && db) {
      const classesSnapshot = await db.collection("classes").get();
      const classes = [];
      classesSnapshot.forEach((doc) => {
        classes.push({ id: doc.id, ...doc.data() });
      });
      if (classes.length > 0) {
        console.log("Fetched classes from Firebase:", classes);
        return classes;
      }
    }
  } catch (firebaseError) {
    console.warn("Firebase fetch error:", firebaseError);
  }

  // Fallback to API if Firebase fails
  try {
    const response = await fetch("/api/classes");
    const classes = await response.json();
    console.log("Fetched classes from API:", classes);
    return classes;
  } catch (apiError) {
    console.error("API fetch error:", apiError);
    return sampleData.classes;
  }
}

async function addUser(userData) {
  try {
    // Try Firebase first
    if (typeof db !== "undefined" && db) {
      const docRef = await db.collection("users").add({
        ...userData,
        createdAt: new Date(),
      });
      console.log("User added to Firebase with ID:", docRef.id);
      return { id: docRef.id, ...userData };
    }
  } catch (firebaseError) {
    console.warn("Firebase add error:", firebaseError);
  }

  // Fallback to API
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
    // Try Firebase first
    if (typeof db !== "undefined" && db) {
      const docRef = await db.collection("classes").add({
        ...classData,
        createdAt: new Date(),
      });
      console.log("Class added to Firebase with ID:", docRef.id);
      return { id: docRef.id, ...classData };
    }
  } catch (firebaseError) {
    console.warn("Firebase add error:", firebaseError);
  }

  // Fallback to API
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
