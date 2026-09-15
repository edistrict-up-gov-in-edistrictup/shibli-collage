import { db } from "./firebase-config.js";
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// === Math Captcha Logic ===
let loginCaptchaAnswer = 0;

function generateCaptcha() {
    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;
    loginCaptchaAnswer = num1 + num2;
    document.getElementById('login-captcha-text').innerText = `${num1} + ${num2} =`;
}

// Page load hone par captcha generate karein
window.onload = generateCaptcha;

// === REGISTRATION LOGIC ===
document.getElementById('register-btn').addEventListener('click', async () => {
    const name = document.getElementById('reg-name').value;
    const dob = document.getElementById('reg-dob').value;
    const mobile = document.getElementById('reg-mobile').value;
    const pass = document.getElementById('reg-pass').value;
    const confirmPass = document.getElementById('reg-confirm-pass').value;

    if (!name || !dob || !mobile || !pass || !confirmPass) {
        return Swal.fire('Error', 'Please fill all details!', 'error');
    }
    
    if (pass !== confirmPass) {
        return Swal.fire('Error', 'Passwords do not match!', 'error');
    }

    // Check if Mobile Number already exists
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("mobile", "==", mobile));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        // Same number se login (register) nahi hoga, Alert aayega
        return Swal.fire('Alert!', 'This Mobile Number is already registered. Please Login.', 'warning');
    }

    // Save new user to Firestore
    try {
        await addDoc(usersRef, {
            fullName: name,
            dob: dob,
            mobile: mobile,
            password: pass, // Note: In production, hash passwords. For basic portal, this is fine.
            createdAt: new Date()
        });

        // Success Popup
        Swal.fire({
            title: 'Successfully Registered!',
            text: 'You can now login with your mobile number.',
            icon: 'success',
            confirmButtonText: 'OK'
        }).then(() => {
            // Registration form se login form par switch karein
            document.getElementById('register-box').style.display = 'none';
            document.getElementById('login-box').style.display = 'block';
        });

    } catch (error) {
        Swal.fire('Error', 'Something went wrong. Please try again.', 'error');
    }
});

// === LOGIN LOGIC ===
document.getElementById('login-btn').addEventListener('click', async () => {
    const mobile = document.getElementById('login-mobile').value;
    const pass = document.getElementById('login-password').value;
    const captchaInput = parseInt(document.getElementById('login-captcha-input').value);

    if (!mobile || !pass || isNaN(captchaInput)) {
        return Swal.fire('Error', 'Please fill all fields & Captcha!', 'error');
    }

    if (captchaInput !== loginCaptchaAnswer) {
        generateCaptcha(); // Wrong captcha par naya generate karein
        document.getElementById('login-captcha-input').value = '';
        return Swal.fire('Error', 'Wrong Math Captcha!', 'error');
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("mobile", "==", mobile), where("password", "==", pass));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        // Login Success
        sessionStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'dashboard.html';
    } else {
        generateCaptcha(); // Failed attempt par naya captcha
        Swal.fire('Error', 'Invalid Mobile Number or Password!', 'error');
    }
});