const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public")));

// Sample data (in a real app, this would be a database)
let users = [
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
];

let classes = [
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
];

let assignments = [];
let submissions = [];

// Routes
app.get("/api/users", (req, res) => {
  res.json(users);
});

app.get("/api/classes", (req, res) => {
  res.json(classes);
});

app.post("/api/users", (req, res) => {
  const newUser = {
    id: users.length + 1,
    ...req.body,
    status: "active",
  };
  users.push(newUser);
  res.json(newUser);
});

app.post("/api/classes", (req, res) => {
  const newClass = {
    id: classes.length + 1,
    ...req.body,
  };
  classes.push(newClass);
  res.json(newClass);
});

app.get("/api/assignments", (req, res) => {
  res.json(assignments);
});

app.post("/api/assignments", (req, res) => {
  const newAssignment = {
    id: assignments.length + 1,
    ...req.body,
  };
  assignments.push(newAssignment);
  res.json(newAssignment);
});

app.get("/api/submissions", (req, res) => {
  res.json(submissions);
});

app.post("/api/submissions", (req, res) => {
  const newSubmission = {
    id: submissions.length + 1,
    ...req.body,
  };
  submissions.push(newSubmission);
  res.json(newSubmission);
});

// Serve the login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
