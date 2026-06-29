
async function loadSingleUser(userId) {
  try {
    const endpoint = "/api/users";
    const url = API_CONFIG.getUrl(endpoint);
    const response = await fetch(url + `/${userId}`);
    const fullName = document.getElementById("fullName");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const location = document.getElementById("location");
    const photo = document.getElementById("photo");
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}`,
      );
    }
    const userDetails = await response.json();
    fullName.value = userDetails.data.fullName;
    email.value = userDetails.data.email;
    phone.value = userDetails.data.mobile;
    location.value = userDetails.data.location;
    photo.src = userDetails.data.photo
      ? userDetails.data.photo
      : "images/profile.webp";
    console.log("Fetched User Data:", userDetails);
  } catch (error) {
    console.error("Error fetching User data:", error);
  }
}

function logout() {
  Swal.fire({
    title: "Logout?",
    text: "Do you really want to logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Logout",
    cancelButtonText: "Cancel",

    width: "360px",
    padding: "1.5rem",
    background: "#ffffff",
    backdrop: "rgba(0,0,0,0.4)",

    buttonsStyling: false, // 🔥 important (Tailwind use korbo)

    customClass: {
      popup: "rounded-2xl shadow-2xl",
      title: "text-lg font-bold text-slate-800",
      htmlContainer: "text-sm text-slate-500",

      confirmButton:
        "bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full font-semibold transition",

      cancelButton:
        "bg-gray-200 hover:bg-gray-300 text-slate-700 px-5 py-2 rounded-full font-semibold ml-2 transition",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("user");
      localStorage.removeItem("email");
      localStorage.removeItem("fullname");
      localStorage.removeItem("user_id");
      localStorage.removeItem("token");

      Swal.fire({
        icon: "success",
        title: "Logged Out!",
        text: "See you again 👋",
        timer: 2400,
        showConfirmButton: false,
        width: "300px",
        customClass: {
          popup: "rounded-xl",
        },
      });

      setTimeout(() => {
        window.location.href = "/signin";
      }, 1200);
    }
  });
}
