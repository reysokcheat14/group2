// ==================== SUBMISSION DETAIL PAGE ====================

document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in (dashboard.js handles this)
  const userJson = localStorage.getItem("currentUser");
  if (!userJson) {
    window.location.href = "login.html";
    return;
  }

  // Add fade-in animation
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.3s ease-in";

  setTimeout(() => {
    document.body.style.opacity = "1";
    setupSubmissionDetailEventListeners();
    loadSubmissionDetail();
  }, 100);
});

// ==================== EVENT LISTENERS ====================

function setupSubmissionDetailEventListeners() {
  const backBtn = document.getElementById("back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      document.body.style.opacity = "0";
      document.body.style.transition = "opacity 0.3s ease-out";
      setTimeout(() => {
        window.location.href = "student.html";
      }, 300);
    });
  }

  const downloadBtn = document.getElementById("download-btn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadSubmission);
  }

  // Also handle the back link
  const backLink = document.querySelector(
    '.submission-header a[href="student.html"]'
  );
  if (backLink) {
    backLink.addEventListener("click", (e) => {
      e.preventDefault();
      document.body.style.opacity = "0";
      document.body.style.transition = "opacity 0.3s ease-out";
      setTimeout(() => {
        window.location.href = "student.html";
      }, 300);
    });
  }
}

// ==================== LOAD FUNCTIONS ====================

async function loadSubmissionDetail() {
  // Get submission data from URL parameters or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const submissionId = urlParams.get("id");

  let submission = null;

  if (submissionId) {
    // Fetch from Firebase if ID is provided
    try {
      if (typeof db !== "undefined" && db) {
        const doc = await db.collection("submissions").doc(submissionId).get();
        if (doc.exists) {
          submission = { id: doc.id, ...doc.data() };
        }
      }
    } catch (err) {
      console.error("Error fetching submission:", err);
    }
  } else {
    // Get from localStorage (session data) if no ID parameter
    const submissionJson = sessionStorage.getItem("lastSubmission");
    if (submissionJson) {
      submission = JSON.parse(submissionJson);
    }
  }

  if (!submission) {
    document.getElementById("submission-details-section").innerHTML =
      '<div class="container"><p>No submission data found. <a href="student.html">Return to dashboard</a></p></div>';
    return;
  }

  // Populate the details
  populateSubmissionDetails(submission);
}

function populateSubmissionDetails(submission) {
  // Show success message
  const successMsg = document.getElementById("success-message");
  if (successMsg) {
    successMsg.classList.remove("hidden");
  }

  // Populate submission info
  document.getElementById("detail-assignment-title").textContent =
    submission.assignmentTitle || "-";
  document.getElementById("detail-class").textContent = submission.class || "-";
  document.getElementById("detail-due-date").textContent =
    submission.dueDate || "-";
  document.getElementById("detail-submission-date").textContent =
    submission.submittedDate || new Date().toISOString().split("T")[0];
  document.getElementById("detail-file-name").textContent =
    submission.fileName || "-";
  document.getElementById("detail-notes").textContent =
    submission.note || "No notes provided";
  document.getElementById("detail-assignment-description").textContent =
    submission.description || "No description provided";

  // Set status
  const statusElement = document.getElementById("detail-status");
  if (statusElement) {
    statusElement.innerHTML = `<span class="status ${(
      submission.status || "pending"
    ).toLowerCase()}">${submission.status || "Pending Review"}</span>`;
  }

  // Set grade
  const gradeElement = document.getElementById("detail-grade");
  if (submission.grade && submission.grade !== null) {
    gradeElement.innerHTML = `<span class="status graded">${submission.grade}</span>`;
  } else {
    gradeElement.innerHTML = '<span class="status">Not Graded Yet</span>';
  }

  // Show feedback section if graded
  if (submission.grade || submission.feedback) {
    showFeedbackSection(submission);
  }

  // Store submission data globally for download
  window.currentSubmission = submission;
}

function showFeedbackSection(submission) {
  const feedbackSection = document.getElementById("feedback-section");
  if (feedbackSection) {
    feedbackSection.classList.remove("hidden");

    if (submission.grade) {
      document.getElementById("feedback-grade").textContent = submission.grade;
    }

    if (submission.feedback) {
      document.getElementById("feedback-comments").textContent =
        submission.feedback;
    }
  }
}

// ==================== DOWNLOAD FUNCTION ====================

function downloadSubmission() {
  const submission = window.currentSubmission;
  if (!submission || !submission.fileName) {
    alert("No file to download");
    return;
  }

  // In a real implementation, this would download the actual file
  // For now, create a text file with submission details
  const content = `
SUBMISSION DETAILS
==================

Assignment: ${submission.assignmentTitle}
Class: ${submission.class}
Submitted Date: ${submission.submittedDate}
Status: ${submission.status}
Grade: ${submission.grade || "Not Graded"}

STUDENT NOTES:
${submission.note || "No notes"}

FILE: ${submission.fileName}
  `;

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(content)
  );
  element.setAttribute(
    "download",
    `submission-${submission.assignmentTitle.replace(/\s+/g, "-")}.txt`
  );
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
