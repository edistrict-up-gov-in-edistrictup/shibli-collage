import { db } from "./firebase-config.js";
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

let loginCaptchaAnswer = 0;

function generateCaptcha() {
    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;
    loginCaptchaAnswer = num1 + num2;
    document.getElementById('login-captcha-text').innerText = `${num1} + ${num2} =`;
}

window.onload = generateCaptcha;

// REGISTER LOGIC
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

    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("mobile", "==", mobile));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return Swal.fire('Alert!', 'This Mobile Number is already registered. Please Login.', 'warning');
        }

        await addDoc(usersRef, {
            fullName: name, dob: dob, mobile: mobile, password: pass, createdAt: new Date()
        });

        Swal.fire({
            title: 'Successfully Registered!',
            text: 'You can now login with your mobile number.',
            icon: 'success'
        }).then(() => {
            document.getElementById('register-box').style.display = 'none';
            document.getElementById('login-box').style.display = 'block';
        });

    } catch (error) {
        console.error("Registration Error: ", error);
        Swal.fire('Error', 'Database error. Check console for details.', 'error');
    }
});

// LOGIN LOGIC
document.getElementById('login-btn').addEventListener('click', async () => {
    const mobile = document.getElementById('login-mobile').value;
    const pass = document.getElementById('login-password').value;
    const captchaInput = parseInt(document.getElementById('login-captcha-input').value);

    if (!mobile || !pass || isNaN(captchaInput)) {
        return Swal.fire('Error', 'Please fill all fields & Captcha!', 'error');
    }

    if (captchaInput !== loginCaptchaAnswer) {
        generateCaptcha(); 
        document.getElementById('login-captcha-input').value = '';
        return Swal.fire('Error', 'Wrong Math Captcha!', 'error');
    }

    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("mobile", "==", mobile), where("password", "==", pass));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            sessionStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'dashboard.html';
        } else {
            generateCaptcha();
            Swal.fire('Error', 'Invalid Mobile Number or Password!', 'error');
        }
    } catch (error) {
        console.error("Login Error: ", error);
        Swal.fire('Error', 'Database error during login.', 'error');
    }
});
