function loadInclude(file, elementId) {
  return fetch(file)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById(elementId).innerHTML = data;

      if (elementId === "header") {
        initMobileMenu();
      }
    })
    .catch((error) => console.error(`Error loading ${file}:`, error));
}
function initMobileMenu() {
  const mobileSlider = document.getElementById("mobileSlider");
  const menuOverlay = document.getElementById("menuOverlay");

  function openMenu() {
    if (mobileSlider && menuOverlay) {
      mobileSlider.classList.remove("translate-x-full");
      menuOverlay.classList.remove("opacity-0", "invisible");
      document.body.classList.add("overflow-hidden");
    }
  }

  function closeMenu() {
    if (mobileSlider && menuOverlay) {
      mobileSlider.classList.add("translate-x-full");
      menuOverlay.classList.add("opacity-0", "invisible");
      document.body.classList.remove("overflow-hidden");
    }
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("#menuBtn")) openMenu();
    if (e.target.closest("#closeMenu") || e.target.id === "menuOverlay")
      closeMenu();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });
}

// MMOBILE MENU drop down modaL

document.addEventListener("click", function (e) {
  const btn = e.target.closest(".dropdown-btn");

  if (!btn) return;

  console.log("Clicked:", btn.innerText);

  const parent = btn.closest(".mobile-dropdown");
  const content = parent.querySelector(".dropdown-content");
  const arrow = btn.querySelector(".arrow");

  // close other dropdowns
  document.querySelectorAll(".mobile-dropdown").forEach((item) => {
    if (item !== parent) {
      item.querySelector(".arrow").textContent = "+";
    }
  });

  // toggle current
  if (
    content.style.display === "block" ||
    window.getComputedStyle(content).display === "block"
  ) {
    content.style.display = "none";
    arrow.textContent = "+";
    console.log("closed");
  } else {
    content.style.display = "block";
    arrow.textContent = "−";
    console.log("opened");
  }
});



// Quick Enquiry Modal
document.addEventListener("click", function (e) {
  const modal = document.getElementById("enquiryModal");
  const overlay = document.getElementById("enquiryOverlay");
  const modalBox = document.getElementById("enquiryModalBox");

  if (!modal || !overlay || !modalBox) return;

  // Open Modal
  if (e.target.closest("#openEnquiry")) {
    modal.classList.remove("opacity-0", "invisible");
    overlay.classList.remove("opacity-0", "invisible");
    modalBox.classList.remove("scale-95");
    modalBox.classList.add("scale-100");
    document.body.classList.add("overflow-hidden");
  }

  // Close Modal
  if (e.target.closest("#closeEnquiry") || e.target.id === "enquiryOverlay") {
    modal.classList.add("opacity-0", "invisible");
    overlay.classList.add("opacity-0", "invisible");
    modalBox.classList.add("scale-95");
    modalBox.classList.remove("scale-100");
    document.body.classList.remove("overflow-hidden");
  }
});

document.addEventListener("keydown", function (e) {
  const modal = document.getElementById("enquiryModal");
  const overlay = document.getElementById("enquiryOverlay");
  const modalBox = document.getElementById("enquiryModalBox");

  if (e.key === "Escape" && modal && overlay && modalBox) {
    modal.classList.add("opacity-0", "invisible");
    overlay.classList.add("opacity-0", "invisible");
    modalBox.classList.add("scale-95");
    modalBox.classList.remove("scale-100");
    document.body.classList.remove("overflow-hidden");
  }
});

//readMoreBtn
document.addEventListener("click", function (e) {
  if (e.target.closest("#readMoreBtn")) {
    const moreContent = document.getElementById("moreContent");
    const btnText = document.getElementById("btnText");

    if (moreContent.classList.contains("hidden")) {
      moreContent.classList.remove("hidden");
      btnText.innerText = "Read Less";
    } else {
      moreContent.classList.add("hidden");
      btnText.innerText = "Read More";
    }
  }
});

// ================= FAQ TOGGLE =================
function initFaqToggle() {
  const items = document.querySelectorAll(".faq-item");

  items.forEach((item) => {
    const btn = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    const icon = item.querySelector(".faq-icon");

    btn.addEventListener("click", () => {
      const isOpen = answer.classList.contains("open");

      // Close all
      document.querySelectorAll(".faq-answer").forEach((el) => {
        el.style.maxHeight = null;
        el.classList.remove("open");
      });

      document.querySelectorAll(".faq-icon").forEach((ic) => {
        ic.style.transform = "rotate(0deg)";
      });

      // Open current (toggle)
      if (!isOpen) {
        answer.style.maxHeight = answer.scrollHeight + "px";
        answer.classList.add("open");
        icon.style.transform = "rotate(45deg)";
      }
    });
  });
}
//word limite
function limitWords(text, limit) {
  if (!text) return "";

  const words = text.split(" ");
  if (words.length <= limit) return text;

  return words.slice(0, limit).join(" ") + "...";
}

//load privacy policy
// async function loadTermsPolicy() {
//   const container = document.getElementById("termsContent");

//   if (!container) return;

//   try {
//     const endpoint =
//       API_CONFIG?.ENDPOINTS?.TERMS || "/api/policies";
//     const url = API_CONFIG.getUrl(endpoint);
//     response = await fetch(url);
//     if (!response.ok) throw new Error("Primary failed");
//   } catch (err) {
//     console.warn("Fallback API used");
//   }

//   const data = await response.json();

//   if (!Array.isArray(data)) {
//     container.innerHTML = "<p>No data found.</p>";
//     return;
//   }

//   // ✅ Filter ONLY terms
//   const terms = data.find((item) => item.type === "terms");

//   if (!terms) {
//     container.innerHTML =
//       "<p>Terms & Conditions not available.</p>";
//     return;
//   }

//   container.innerHTML = terms.content;
// }

//load privacy policy
// async function loadPrivacyPolicy() {
//   const container = document.getElementById(
//     "privacyContent",
//   );

//   if (!container) return;

//   try {
//     const endpoint =
//       API_CONFIG?.ENDPOINTS?.TERMS || "/api/policies";
//     const url = API_CONFIG.getUrl(endpoint);
//     response = await fetch(url);
//     if (!response.ok) throw new Error("Primary failed");
//   } catch (err) {
//     console.warn("Fallback API used");
//   }

//   const data = await response.json();

//   if (!Array.isArray(data)) {
//     container.innerHTML = "<p>No data found.</p>";
//     return;
//   }

//   // ✅ Filter ONLY terms
//   const terms = data.find(
//     (item) => item.type === "privacy",
//   );

//   if (!terms) {
//     container.innerHTML =
//       "<p>Privacy Policy not available.</p>";
//     return;
//   }

//   container.innerHTML = terms.content;
// }
