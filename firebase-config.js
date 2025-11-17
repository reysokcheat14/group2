// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALbZTBfpFkoI2MRdp-lDjgt9CgMQMwZds",
  authDomain: "groups-app-d0f49.firebaseapp.com",
  projectId: "groups-app-d0f49",
  storageBucket: "groups-app-d0f49.firebasestorage.app",
  messagingSenderId: "496002967017",
  appId: "1:496002967017:web:5930053cb46fe26ac7d778",
  measurementId: "G-ZHB5EGSEJ9",
};

// Initialize Firebase
let app = null;
let auth = null;
let db = null;

if (typeof firebase !== "undefined") {
  try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.warn("Firebase initialization error:", error.message);
  }
}
