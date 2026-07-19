// js/upload.js

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("uploadForm");
    const input = document.getElementById("resumeFile");
    const dropArea = document.getElementById("dropArea");
    const selectedFile = document.getElementById("selectedFile");
    const progressContainer = document.querySelector(".progress-container");
    const progressBar = document.getElementById("progressBar");

    // Click Upload Box
    dropArea.addEventListener("click", () => {
        input.click();
    });

    input.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    // File Selected
    input.addEventListener("change", () => {
        showFile(input.files[0]);
    });

    // Drag Events

    ["dragenter","dragover"].forEach(eventName => {
        dropArea.addEventListener(eventName,e=>{
            e.preventDefault();
            dropArea.style.borderColor="#2563EB";
        });
    });

    ["dragleave","drop"].forEach(eventName=>{
        dropArea.addEventListener(eventName,e=>{
            e.preventDefault();
            dropArea.style.borderColor="rgba(255,255,255,.15)";
        });
    });

    dropArea.addEventListener("drop",(e)=>{

        const file=e.dataTransfer.files[0];

        input.files=e.dataTransfer.files;

        showFile(file);

    });

    function showFile(file){

        if(!file)return;

        const allowed=[
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];
        const fileExt = file.name.split('.').pop().toLowerCase();
        const allowedExts = ["pdf", "doc", "docx"];

        if(!allowed.includes(file.type) && !allowedExts.includes(fileExt)){

            toast("Only PDF, DOC and DOCX files allowed","error");

            input.value="";

            return;

        }

        if(file.size>5*1024*1024){

            toast("Maximum file size is 5MB","error");

            input.value="";

            return;

        }

        selectedFile.innerHTML=`
            <i class="fas fa-file"></i>
            ${file.name}
        `;

    }

    // Submit

    form.addEventListener("submit",uploadResume);

    async function uploadResume(e){

        e.preventDefault();

        const file=input.files[0];

        if(!file){

            toast("Please select a resume.","error");

            return;

        }

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.id) {
            toast("Please login first.", "error");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
            return;
        }

        progressContainer.style.display="block";

        progressBar.style.width="10%";

        showLoader();

        const formData=new FormData();

        formData.append("resume",file);
        formData.append("user_id", user.id);

        try{

            // Progress Animation

            let progress=10;

            const interval=setInterval(()=>{

                progress+=10;

                progressBar.style.width=progress+"%";

                if(progress>=90){

                    clearInterval(interval);

                }

            },200);

            const response=await fetch(`${API_BASE_URL}/upload`,{

                method:"POST",

                body:formData

            });

            clearInterval(interval);

            progressBar.style.width="100%";

            hideLoader();

            if(response.ok){

                const result = await response.json();
                localStorage.setItem("last_resume_id", result.resume_id);
                toast("Resume Uploaded Successfully","success");

                setTimeout(()=>{

                    window.location.href="result.html";

                },1500);

            }

            else{

                const result = await response.json().catch(() => ({}));
                toast(result.message || "Upload Failed","error");

            }

        }

        catch(err){

            console.log(err);

            hideLoader();

            toast("Server Connection Failed","error");

        }

    }

});