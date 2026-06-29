

function submitEnqueryForm() {
    const form = document.getElementById("enquiryForm");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        console.log("Submit triggered ✅");
    });
}
// async function submitEnqueryForm() {
//     const form = document.getElementById("enquiryForm");

//     if (!form) {
//         console.error("Form not found!");
//         return;
//     }

//     form.addEventListener("submit", async function (e) {
//         e.preventDefault();

//         console.log("Form submit working ✅");

//         const submitBtn = document.getElementById("submitBtn");

//         if (submitBtn) {
//             submitBtn.innerText = "Submitting...";
//             submitBtn.disabled = true;
//         }

//         try {
//             const formData = new FormData(form);

//             const res = await fetch("https://glacier-treks-adventures-admin-back.vercel.app/api/enquiries", {
//                 method: "POST",
//                 body: formData
//             });

//             const data = await res.json();

//             console.log(data);

//             if (data.success) {
//                 alert("Success ✅");
//                 form.reset();
//             } else {
//                 alert("Failed ❌");
//             }

//         } catch (error) {
//             console.error(error);
//         }

//         if (submitBtn) {
//             submitBtn.innerText = "Submit Enquiry";
//             submitBtn.disabled = false;
//         }
//     });
// }



// async  function submitEnqueryForm(){
//         const form = document.getElementById("enquiryForm");

//     if (!form) {
//         console.error("Form not found!");
//         return;
//     }

//     form.addEventListener("submit", async function (e) {

//         e.preventDefault(); // 🚨 STOP URL REDIRECT

//         console.log("Form submit working ✅");

//         const submitBtn = document.getElementById("submitBtn");
//         submitBtn.innerText = "Submitting...";
//         submitBtn.disabled = true;

//         try {
//             const formData = new FormData(form);

//             // ✅ DIRECT API URL (NO API_CONFIG ISSUE)
//             const url = "https://glacier-treks-adventures-admin-back.vercel.app/api/enquiries";

//             const res = await fetch(url, {
//                 method: "POST",
//                 body: formData
//             });

//             const data = await res.json();

//             console.log(data);

//             if (data.success) {
//                 alert("Enquiry submitted successfully ✅");
//                 form.reset();
//             } else {
//                 alert(data.message || "Error occurred ❌");
//             }

//         } catch (error) {
//             console.error("Error:", error);
//             alert("Server error ❌");
//         }

//         submitBtn.innerText = "Submit Enquiry";
//         submitBtn.disabled = false;

//     });
// }

