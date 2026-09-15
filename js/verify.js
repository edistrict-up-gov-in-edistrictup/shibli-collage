import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

async function verifyStudent() {
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');

    const verifyBox = document.getElementById('verify-box');
    const errorBox = document.getElementById('error-box');

    if (!studentId) {
        errorBox.style.display = 'block';
        return;
    }

    Swal.fire({
        title: 'Verifying Data...',
        text: 'Please wait, fetching original records.',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    try {
        const docRef = doc(db, "students", studentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('v-photo').src = data.photoUrl;
            document.getElementById('v-name').innerText = data.name;
            document.getElementById('v-father').innerText = data.father;
            document.getElementById('v-mother').innerText = data.mother || "N/A"; 
            document.getElementById('v-school').innerText = data.school;
            document.getElementById('v-course').innerText = data.course;

            Swal.close();
            verifyBox.style.display = 'block';
        } else {
            Swal.close();
            errorBox.style.display = 'block';
        }
    } catch (error) {
        console.error("Error fetching document:", error);
        Swal.fire('Error', 'Network Error! Try again later.', 'error');
        errorBox.style.display = 'block';
    }
}
window.onload = verifyStudent;
