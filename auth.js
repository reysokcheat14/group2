// ==================== CONFIGURATION ====================

// Fallback sample user database (used if Firebase is not available)
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

// ==================== DOM ELEMENTS ====================

const loginForm = document.getElementById("login-form");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");

// ==================== INITIALIZATION ====================

document.addEventListener("DOMContentLoaded", function () {
  setupEventListeners();
});

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
  loginForm.addEventListener("submit", handleLogin);
  // Signup flow elements
  const signupForm = document.getElementById("signup-form");
  const showSignup = document.getElementById("show-signup");
  const showLogin = document.getElementById("show-login");
  if (signupForm) signupForm.addEventListener("submit", handleSignup);
  if (showSignup)
    showSignup.addEventListener("click", function (e) {
      e.preventDefault();
      toggleForms(true);
    });
  if (showLogin)
    showLogin.addEventListener("click", function (e) {
      e.preventDefault();
      toggleForms(false);
    });
}

function toggleForms(showSignupForm) {
  const loginFormEl = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const toggleToSignup = document.getElementById("toggle-to-signup");
  if (showSignupForm) {
    if (loginFormEl) loginFormEl.classList.add("hidden");
    if (signupForm) signupForm.classList.remove("hidden");
    if (toggleToSignup) toggleToSignup.classList.add("hidden");
  } else {
    if (loginFormEl) loginFormEl.classList.remove("hidden");
    if (signupForm) signupForm.classList.add("hidden");
    if (toggleToSignup) toggleToSignup.classList.remove("hidden");
  }
}

// ==================== SIGNUP HANDLER ====================

async function handleSignup(event) {
  event.preventDefault();

  const nameEl = document.getElementById("signup-name");
  const emailEl = document.getElementById("signup-email");
  const passEl = document.getElementById("signup-password");
  const roleEl = document.getElementById("signup-role");
  if (!emailEl || !passEl) return;

  const name = nameEl ? nameEl.value.trim() : "";
  const email = emailEl.value.trim();
  const password = passEl.value.trim();
  const role = roleEl ? roleEl.value : "student";

  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalText = submitBtn ? submitBtn.textContent : null;
  if (submitBtn) {
    submitBtn.textContent = "Creating account...";
    submitBtn.disabled = true;
  }

  // Try Firebase signup
  if (typeof auth !== "undefined" && auth) {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Save user profile to Firestore under users/{uid}
      try {
        await db
          .collection("users")
          .doc(firebaseUser.uid)
          .set({
            name: name || email.split("@")[0],
            email: email,
            role: role,
            createdAt: new Date(),
          });
      } catch (firestoreError) {
        console.warn(
          "Could not write user profile to Firestore:",
          firestoreError.message
        );
      }

      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: firebaseUser.uid,
          name: name || email.split("@")[0],
          email: email,
          role: role,
        })
      );

      alert("Account created — you are now signed in");
      redirectByRole(role);
      return;
    } catch (signupError) {
      console.warn("Firebase signup error:", signupError.message);
      alert("Signup error: " + signupError.message);
      if (submitBtn) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
      return;
    }
  }

  // Fallback (local DB) - add to local array and sign in
  const newId = userDatabase.length + 1;
  const newUser = {
    id: newId,
    name: name || email.split("@")[0],
    email,
    password,
    role,
  };
  userDatabase.push(newUser);
  localStorage.setItem(
    "currentUser",
    JSON.stringify({ id: newId, name: newUser.name, email, role })
  );
  alert("Account created locally (Firebase unavailable). Signed in.");
  redirectByRole(role);
}

// ==================== LOGIN HANDLER ====================

async function handleLogin(event) {
  event.preventDefault();

  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  console.log("handleLogin: attempting login for", email);
  // Show loading state
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Logging in...";
  submitBtn.disabled = true;

  // Try Firebase Authentication first
  if (typeof auth !== "undefined" && auth) {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Get user role from Firestore. First try users/{uid}; if missing, query by email.
      try {
        let userData = null;
        const userDocRef = db.collection("users").doc(firebaseUser.uid);
        const userDoc = await userDocRef.get();

        if (userDoc.exists) {
          userData = userDoc.data();
        } else {
          // Fallback: query users collection by email (in case docs are keyed by auto-id)
          try {
            const q = await db
              .collection("users")
              .where("email", "==", firebaseUser.email)
              .limit(1)
              .get();
            if (!q.empty) {
              userData = q.docs[0].data();
              console.log("Found user profile by email fallback.");
            }
          } catch (queryErr) {
            console.warn("Error querying users by email:", queryErr.message);
          }
        }

        if (userData) {
          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              id: firebaseUser.uid,
              name: userData.name || firebaseUser.email.split("@")[0],
              email: firebaseUser.email,
              role: userData.role || "student",
            })
          );

          console.log("Logged in via Firebase:", firebaseUser.email);
          redirectByRole(userData.role || "student");
          return;
        }
      } catch (firestoreError) {
        console.warn("Firestore fetch error:", firestoreError.message);
        // Still log in even if we can't get role from Firestore
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: firebaseUser.uid,
            name: firebaseUser.email.split("@")[0],
            email: firebaseUser.email,
            role: "student",
          })
        );
        redirectByRole("student");
        return;
      }
    } catch (firebaseError) {
      console.warn("Firebase auth error:", firebaseError.message);
      // Show the Firebase error to the user and stop — common causes: user not found, wrong password, auth not enabled
      alert("Firebase authentication error: " + firebaseError.message);
      // restore submit button
      if (submitBtn) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
      return;
    }
  }

  // Fallback: Use local user database if Firebase is not available
  const user = userDatabase.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })
    );

    console.log("Logged in via local database:", email);
    redirectByRole(user.role);
  } else {
    alert("Invalid email or password! Please try again.");
    loginForm.reset();
    if (submitBtn) {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }
}

function redirectByRole(role) {
  switch (role) {
    case "admin":
      window.location.href = "admin.html";
      break;
    case "teacher":
      window.location.href = "teacher.html";
      break;
    case "student":
      window.location.href = "student.html";
      break;
    default:
      window.location.href = "student.html";
  }
}
