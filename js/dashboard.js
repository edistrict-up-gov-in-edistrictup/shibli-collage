import { db } from "./firebase-config.js";
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Check Login Session
if (!sessionStorage.getItem('isLoggedIn')) {
    window.location.href = 'index.html';
}

// 60-Minute Countdown Timer
let timeLeft = 3600; 
const timerElem = document.getElementById('timer');
const countdown = setInterval(() => {
    timeLeft--;
    let m = Math.floor(timeLeft / 60);
    let s = timeLeft % 60;
    timerElem.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    if (timeLeft <= 0) {
        clearInterval(countdown);
        alert("Session Expired!");
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    }
}, 1000);

// Cloudinary Image Upload
async function uploadToCloudinary(file) {
    if (file.size > 500000) {
        Swal.fire('Error', 'Image size must be less than 500KB', 'error');
        return null;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');
    
    // Cloudinary details embedded
    const response = await fetch('https://api.cloudinary.com/v1_1/przyhc6d/image/upload', {
        method: 'POST',
        body: formData
    });
    const data = await response.json();
    return data.secure_url;
}

// Add Student Data
document.getElementById('add-student-btn').addEventListener('click', async () => {
    const btn = document.getElementById('add-student-btn');
    const name = document.getElementById('s-name').value;
    const father = document.getElementById('s-father').value;
    const mother = document.getElementById('s-mother').value;
    const school = document.getElementById('s-school').value;
    const course = document.getElementById('s-course').value;
    const imageFile = document.getElementById('s-image').files[0];

    if (!name || !father || !course || !imageFile) {
        return Swal.fire('Oops!', 'Please fill all details and select an image.', 'warning');
    }

    btn.innerText = "Uploading & Saving...";
    const imageUrl = await uploadToCloudinary(imageFile);
    
    if (imageUrl) {
        try {
            await addDoc(collection(db, "students"), {
                name, father, mother, school, course, photoUrl: imageUrl, timestamp: new Date()
            });
            Swal.fire('Success', 'Student Data Added!', 'success');
            loadStudents(); // Refresh List
        } catch (e) {
            Swal.fire('Error', 'Database error', 'error');
        }
    }
    btn.innerText = "Submit Student Data";
});

// Load and display Students
async function loadStudents() {
    const list = document.getElementById('student-list');
    list.innerHTML = '';
    const querySnapshot = await getDocs(collection(db, "students"));
    querySnapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.innerHTML += `
            <tr>
                <td>${d.name}</td>
                <td>${d.course}</td>
                <td>
                    <button class="action-btn btn-id" onclick='generateID("${docSnap.id}", ${JSON.stringify(d)})'>⬇ ID Card</button>
                    <button class="action-btn btn-delete" onclick="deleteStudent('${docSnap.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
}
window.loadStudents = loadStudents;

// Delete Student
window.deleteStudent = async (id) => {
    if(confirm("Are you sure you want to delete this student?")) {
        await deleteDoc(doc(db, "students", id));
        loadStudents();
    }
};

// Generate ID Card PDF & QR
window.generateID = (id, data) => {
    // Fill Template
    document.getElementById('id-name').innerText = data.name;
    document.getElementById('id-school').innerText = data.school;
    document.getElementById('id-father').innerText = data.father;
    document.getElementById('id-course').innerText = data.course;
    
    const photoImg = document.getElementById('id-photo');
    photoImg.crossOrigin = "Anonymous"; // Fix for html2canvas Cloudinary CORS
    photoImg.src = data.photoUrl;

    // Generate QR Code (Points to GitHub Page verify URL)
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = "";
    // Change domain below to your github pages repo link setup
    const verificationUrl = `https://your-github-username.github.io/repo/verify.html?id=${id}`; 
    new QRCode(qrContainer, {
        text: verificationUrl,
        width: 100, height: 100
    });

    // Wait slightly for QR & Image to render then capture PDF
    setTimeout(() => {
        const idCardElement = document.getElementById('id-card-template');
        idCardElement.style.display = 'block'; // Make visible temporarily
        
        const { jsPDF } = window.jspdf;
        html2canvas(idCardElement, { useCORS: true, scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            // Centering ID card on A4
            pdf.addImage(imgData, 'PNG', (pdfWidth-90)/2, 20, 90, 140);
            pdf.save(`${data.name}_ID_Card.pdf`);
            idCardElement.style.display = 'none'; // Hide again
        });
    }, 1000);
};

// Initial Load
loadStudents();