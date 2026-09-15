import { db } from "./firebase-config.js";
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

if (!sessionStorage.getItem('isLoggedIn')) { window.location.href = 'index.html'; }

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

async function uploadToCloudinary(file) {
    if (file.size > 500000) {
        Swal.fire('Error', 'Image size must be less than 500KB', 'error');
        return null;
    }
    
    Swal.fire({ title: 'Uploading Image...', allowOutsideClick: false });
    Swal.showLoading();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');
    
    try {
        const response = await fetch('https://api.cloudinary.com/v1_1/przyhc6d/image/upload', {
            method: 'POST', body: formData
        });
        const data = await response.json();
        Swal.close();
        return data.secure_url;
    } catch (error) {
        Swal.close();
        Swal.fire('Error', 'Failed to upload image to Cloudinary.', 'error');
        return null;
    }
}

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

    btn.innerText = "Uploading...";
    btn.disabled = true;

    const imageUrl = await uploadToCloudinary(imageFile);
    
    if (imageUrl) {
        try {
            await addDoc(collection(db, "students"), {
                name, father, mother, school, course, photoUrl: imageUrl, timestamp: new Date()
            });
            Swal.fire('Success', 'Student Data Added!', 'success');
            
            document.getElementById('s-name').value = '';
            document.getElementById('s-father').value = '';
            document.getElementById('s-mother').value = '';
            document.getElementById('s-course').value = '';
            document.getElementById('s-image').value = '';
            
            loadStudents();
        } catch (e) {
            console.error(e);
            Swal.fire('Error', 'Database error while saving.', 'error');
        }
    }
    btn.innerText = "Submit Student Data";
    btn.disabled = false;
});

async function loadStudents() {
    const list = document.getElementById('student-list');
    list.innerHTML = '<tr><td colspan="3">Loading data...</td></tr>';
    try {
        const querySnapshot = await getDocs(collection(db, "students"));
        list.innerHTML = '';
        querySnapshot.forEach((docSnap) => {
            const d = docSnap.data();
            list.innerHTML += `
                <tr>
                    <td>${d.name}</td>
                    <td>${d.course}</td>
                    <td>
                        <button class="action-btn btn-id" onclick='generateID("${docSnap.id}", ${JSON.stringify(d).replace(/'/g, "&apos;")})'>⬇ ID Card</button>
                        <button class="action-btn btn-delete" onclick="deleteStudent('${docSnap.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        console.error(e);
        list.innerHTML = '<tr><td colspan="3">Error loading data.</td></tr>';
    }
}
window.loadStudents = loadStudents;

window.deleteStudent = async (id) => {
    if(confirm("Are you sure you want to delete this student?")) {
        await deleteDoc(doc(db, "students", id));
        loadStudents();
    }
};

window.generateID = (id, data) => {
    document.getElementById('id-name').innerText = data.name;
    document.getElementById('id-school').innerText = data.school;
    document.getElementById('id-father').innerText = data.father;
    document.getElementById('id-course').innerText = data.course;
    
    const photoImg = document.getElementById('id-photo');
    photoImg.crossOrigin = "Anonymous"; 
    photoImg.src = data.photoUrl;

    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = "";
    
    // SMART DYNAMIC URL GENERATOR
    let currentHref = window.location.href.split('?')[0];
    let basePath = currentHref.substring(0, currentHref.lastIndexOf("/"));
    if(basePath === "") { basePath = window.location.origin; }
    
    const verificationUrl = `${basePath}/verify.html?id=${id}`; 

    new QRCode(qrContainer, {
        text: verificationUrl, width: 100, height: 100
    });

    setTimeout(() => {
        const idCardElement = document.getElementById('id-card-template');
        idCardElement.style.display = 'block'; 
        
        const { jsPDF } = window.jspdf;
        html2canvas(idCardElement, { useCORS: true, scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            pdf.addImage(imgData, 'PNG', (pdfWidth-90)/2, 20, 90, 140);
            pdf.save(`${data.name}_ID_Card.pdf`);
            idCardElement.style.display = 'none'; 
        });
    }, 1500);
};

loadStudents();
