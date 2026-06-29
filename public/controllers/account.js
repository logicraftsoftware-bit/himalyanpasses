const acoountForm = document.getElementById("acoountForm");

// ================= PHOTO PREVIEW =================
document
  .getElementById("photoInput")
  .addEventListener("change", function () {

    const file = this.files[0];

    if (file) {
      document.getElementById("photo").src =
        URL.createObjectURL(file);
    }
  });

// ================= USER DATA =================
const user = JSON.parse(localStorage.getItem("user"));

const userId = user.id;

console.log("User ID:", userId);

// ================= UPDATE PROFILE =================
// acoountForm.addEventListener(
//   "submit",
//   async function (e) {

//     e.preventDefault();

//     const fullName = acoountForm.fullName.value;
//     const email = acoountForm.email.value;
//     const mobile = acoountForm.phone.value;
//     const location = acoountForm.location.value;

//     const photoFile =
//       document.getElementById("photoInput").files[0];

//     // ================= FORMDATA =================
//     const formData = new FormData();

//     formData.append("fullName", fullName);
//     formData.append("email", email);
//     formData.append("mobile", mobile);
//     formData.append("location", location);

//     // Laravel PUT workaround
//     formData.append("_method", "PUT");

//     if (photoFile) {
//       formData.append("photo", photoFile);
//     }

//     // ================= DEBUG =================
//     for (let pair of formData.entries()) {
//       console.log(pair[0], pair[1]);
//     }

//     try {

//       const endpoint = `/api/users/${userId}`;

//       const url = API_CONFIG.getUrl(endpoint);

//       const token = localStorage.getItem("token");

//       const res = await fetch(url, {
//         method: "PUT",
//         body: formData
//       });

//       const data = await res.json();

//       console.log("Response:", data);

//       if (res.ok) {

//         alert("Profile Updated ✅");

//         // ================= UPDATE UI =================
//         document.getElementById(
//           "loggedinUserName"
//         ).innerText = fullName;

//         // update image preview
//         if (photoFile) {

//           document.getElementById("photo").src =
//             URL.createObjectURL(photoFile);
//         }

//         // ================= UPDATE LOCALSTORAGE =================
//         const updatedUser = {
//           ...user,
//           fullName,
//           email,
//           mobile,
//           location,
//           photo: data?.user?.photo || user.photo
//         };

//         localStorage.setItem(
//           "user",
//           JSON.stringify(updatedUser)
//         );

//         console.log("Updated User:", updatedUser);

//         // ================= RESET FORM =================
//         // acoountForm.reset();

//         // redirect if needed
//         // window.location.href = "/contact";

//       } else {

//         alert(
//           data.message || "Update Failed ❌"
//         );
//       }

//     } catch (error) {

//       console.error("Error:", error);

//       alert("Something went wrong ❌");
//     }
//   }
// );