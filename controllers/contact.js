async function loadContactInfo() {
  try {
    const endpoint =
      API_CONFIG?.ENDPOINTS?.SETTINGS || "/api/settings";
    const url = API_CONFIG.getUrl(endpoint);
    const response = await fetch(url);
    const data = await response.json();

    document.getElementById("address").textContent =
      data.address;
    document.getElementById("phone").textContent =
      data.contactNumber;
    document.getElementById("whatsapp").textContent =
      data.whatsappNumber;
    document.getElementById("email").textContent =
      data.emailId;
    document.getElementById("gMap").innerHTML =
      data.mapIframe;
  } catch (error) {
    console.error("Error loading contact info:", error);
  }
}

//contact form submit
document.addEventListener("DOMContentLoaded", function () {
  const contactForm =
    document.getElementById("contactForm");

  if (!contactForm) {
    console.error("Contact form not found ❌");
    return;
  }

  contactForm.addEventListener(
    "submit",
    async function (e) {
      e.preventDefault();

      // console.log("Contact form submit working ✅");

      const fullName = contactForm.fullName.value;
      const email = contactForm.email.value;
      const phone = contactForm.phone.value;
      const message = contactForm.message.value;

      // console.log("Form Data:", { fullName, email, phone, password });

      // API body
      const payload = {
        name: fullName,
        email: email,
        phoneNumber: phone,
        message: message,
      };

      // console.log("Sending Data:", payload);

      try {
        const endpoint = "/api/contacts";
        const url = API_CONFIG.getUrl(endpoint);
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        console.log("Response:", data);

        if (res.ok) {
          alert("From Submited ✅");
          contactForm.reset();
          // 🔥 redirect
          window.location.href = "/contact";
        } else {
          alert(
            data.message || "contact Form Submit Failed ❌",
          );
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong ❌");
      }
    },
  );
});
