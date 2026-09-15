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
    
    // --- 100% WORKING DYNAMIC URL (404 ERROR FIX) ---
    // Yeh code aapke current URL ka base path nikalega aur verify.html jode ga
    let currentHref = window.location.href.split('?')[0];
    let basePath = currentHref.substring(0, currentHref.lastIndexOf("/"));
    
    // Agar link galti se localhost/ dikha raha ho bina file name ke
    if(basePath === "") {
        basePath = window.location.origin;
    }

    const verificationUrl = `${basePath}/verify.html?id=${id}`; 
    console.log("QR Code URL:", verificationUrl); // Console me check karne ke liye
    // ------------------------------------------------

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
