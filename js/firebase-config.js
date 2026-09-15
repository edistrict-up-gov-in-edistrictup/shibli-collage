import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyBhH4Um5AUqY9-b8Ls966t7GGbhHM3zemo",
    authDomain: "shibli-collage.firebaseapp.com",
    projectId: "shibli-collage",
    storageBucket: "shibli-collage.firebasestorage.app",
    messagingSenderId: "381888344569",
    appId: "1:381888344569:web:e33390484db5e3e8d68d28",
    measurementId: "G-Q56TY4QJ76"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
