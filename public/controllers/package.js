// For Single Package Page
let allAddOns = [];

// const urlParams = new URLSearchParams(
//   window.location.search,
// );
// const packageId = urlParams.get("slug") || "N/A"; // default to some package if slug missing
let packageId = null;
const packagePathParts = window.location.pathname.split("/").filter(Boolean);
if (packagePathParts[0] === "package") {
  packageId = packagePathParts[1];
} else if (packagePathParts.length === 1 && !packagePathParts[0].includes(".")) {
  packageId = packagePathParts[0];
}

// Fallback for old URL
if (!packageId) {
  const urlParams = new URLSearchParams(
    window.location.search,
  );
  packageId = urlParams.get("slug");
}

async function loadPackageDetails(slug) {
  try {
    let packageData = null;
    const cachedRouteData = sessionStorage.getItem(`route:data:${slug}`);
    if (cachedRouteData) {
      const cached = JSON.parse(cachedRouteData);
      if (cached.kind === "package" || cached.kind === "tour-package") {
        packageData = cached.data;
        sessionStorage.removeItem(`route:data:${slug}`);
      }
    }

    if (!packageData) {
      const endpoint = "/api/packages";
      const url = API_CONFIG.getUrl(endpoint);
      const response = await fetch(url + `/${slug}`);
      console.log(
        "Fetching package details from:",
        url + `/${slug}`,
      );
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}`,
        );
      }
      packageData = await response.json();
    }
    console.log("Fetched Package Data:", packageData);

    const facts = document.getElementById("facts");
    const overview = document.getElementById("overview");
    const itineraryContent = document.getElementById(
      "itineraryContent",
    );
    const dayTabsWrapper = document.getElementById(
      "dayTabsWrapper",
    );
    const faqs = document.getElementById("faqs");
    const faqItem = document.getElementById("faq-item");
    const inclusionsContent = document.getElementById(
      "inclusionsContent",
    );
    const trekFess = document.getElementById("trekFess");
    const availableDate =
      document.getElementById("availableDate");
    const packageHeading = document.getElementById(
      "packageHeading",
    );
    const packageShortDescription = document.getElementById(
      "packageShortDescription",
    );
    const packageBanner =
      document.getElementById("packageBanner");

    const readMoreBtn =
      document.getElementById("toggleBtn");
    const toggleText =
      document.getElementById("toggleText");

    facts.innerHTML = ``;
    faqItem.innerHTML = "";

    // overview.innerHTML = ``;
    itineraryContent.innerHTML = ``;
    dayTabsWrapper.innerHTML = ``;
    faqs.innerHTML = ``;
    trekFess.innerHTML = ``;
    inclusionsContent.innerHTML = ``;
    availableDate.innerHTML = ``;
    packageHeading.innerText = ``;
    packageShortDescription.innerText = ``;
    packageHeading.innerText = packageData.packageName || "N/A";
    packageShortDescription.innerText = packageData.shortDescription || "N/A";
    packageBanner.src =
      packageData.gallery[0].url ||
      "./images/account-banner.webp";
    const itinerary = packageData.itineraries || [];
    const inclusionsData = packageData.otherOptions || [];
    const faqData = packageData.faqs || [];
    if (packageData) {
      const region = packageData.region || "N/A";
      const duration = packageData.duration || "N/A";
      const distance = packageData.trekDistance || "N/A";
      const bestSeason = packageData.bestTime || "N/A";
      const suitableFor = packageData.suitableFor || "N/A";
      const altitude = packageData.highestAltitude || "N/A";

      //trip facts section
      facts.innerHTML = `
                    <!-- REGION -->
                    <div class="flex flex-col items-center gap-2">
                        <img src="https://img.icons8.com/color/48/mountain.png" class="w-8 h-8" />
                        <p class="text-xs text-slate-500 uppercase tracking-wide">Region</p>
                        <p class="text-sm font-semibold text-slate-900">${region}</p>
                    </div>

                    <!-- DURATION -->
                    <div class="flex flex-col items-center gap-2">
                        <img src="https://img.icons8.com/color/48/time.png" class="w-8 h-8" />
                        <p class="text-xs text-slate-500 uppercase tracking-wide">Duration</p>
                        <p class="text-sm font-semibold text-slate-900">${duration}</p>
                    </div>

                    <!-- DIFFICULTY -->
                    <div class="flex flex-col items-center gap-2">
                        <img src="https://img.icons8.com/color/48/trekking.png" class="w-8 h-8" />
                        <p class="text-xs text-slate-500 uppercase tracking-wide">Distance</p>
                        <p class="text-sm font-semibold text-slate-900">${distance}</p>
                    </div>

                    <!-- ALTITUDE -->
                    <div class="flex flex-col items-center gap-2">
                        <svg class="w-7 h-7 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 20h18L14 4l-3 5-2-3-6 14z" />
                        </svg>
                        <p class="text-xs text-slate-500 uppercase tracking-wide">Max Altitude</p>
                        <p class="text-sm font-semibold text-slate-900">${altitude}</p>
                    </div>

                    <!-- START -->
                    <div class="flex flex-col items-center gap-2">
                        <img src="https://img.icons8.com/color/48/marker.png" class="w-8 h-8" />
                        <p class="text-xs text-slate-500 uppercase tracking-wide">suitable</p>
                        <p class="text-sm font-semibold text-slate-900">${suitableFor}</p>
                    </div>

                    <!-- END -->
                    <div class="flex flex-col items-center gap-2">
                        <img src="https://img.icons8.com/color/48/finish-flag.png" class="w-8 h-8" />
                        <p class="text-xs text-slate-500 uppercase tracking-wide">best Time</p>
                        <p class="text-sm font-semibold text-slate-900">${bestSeason}</p>
                    </div>
      `;

      // overview

      // overview.innerHTML =
      //   packageData.overview.replace(/&nbsp;/g, " ") ||
      //   "N/A";

      const fullContent = packageData.overview
        ? packageData.overview
        : "N/A";
      // const fullContent =
      //   packageData.overview?.replace(/&nbsp;/g, " ") ||
      //   "N/A";

      const words = fullContent.split(" ");
      const shortContent = words.slice(0, 100).join(" ");

      let expanded = false;

      // 🔥 condition
      if (words.length > 100) {
        overview.innerHTML = shortContent + "...";
        readMoreBtn.classList.remove("hidden"); // show button

        readMoreBtn.addEventListener("click", () => {
          if (!expanded) {
            overview.innerHTML = fullContent;
            toggleText.innerText = "See Less";
            expanded = true;
          } else {
            overview.innerHTML = shortContent + "...";
            toggleText.innerText = "See More";
            expanded = false;
          }
        });
      } else {
        overview.innerHTML = fullContent;
        readMoreBtn.classList.add("hidden"); // hide button if small content
      }
      //book now section
      const price = packageData.offerPriceINR
        ? packageData.offerPriceINR
        : packageData.originalPriceINR;
      const formattedPrice =
        Number(price).toLocaleString("en-IN");

      // ================= ADDONS API =================
      let addOnsHTML = "";
      let showMoreButton = "";

      try {
        const endpoint = "/api/additionals";
        const url = API_CONFIG.getUrl(endpoint);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status}`,
          );
        }

        const additionals = await response.json();
        allAddOns = additionals;
        // only first 2 show
        const visibleAddOns = additionals.slice(0, 2);

        visibleAddOns.forEach((addOn) => {
          addOnsHTML += `
                    <p>
                        ₹${Number(addOn.priceINR).toLocaleString("en-IN")} ${addOn.name}
                    </p>
                `;
        });

        // button only if more than 2 items
        if (additionals.length > 2) {
          showMoreButton = `
                    <button
                        onclick="openAddonsModal()"
                        class="text-[#0f172a] font-semibold underline"
                    >
                        Show More
                    </button>
                `;
        }
      } catch (error) {
        console.error("Addons Fetch Error:", error);
      }

      trekFess.innerHTML += `<div class="p-5 md:p-6 space-y-4">

  <!-- Header -->
  <div class="md-text-left pb-4 border-b border-[#f0f1e8]">
    <h3 class="gloock-regular text-3xl text-slate-900 text-center md:text-left mb-1">
      Trek Fee
    </h3>
    <p class="text-sm text-slate-500 font-medium plus-jakarta-sans">
      Safe and Secure Booking
    </p>
  </div>

  <!-- Price Section -->
  <div class="flex flex-col gap-3 bg-[#f8faf4] p-2 md:p-4 rounded-2xl border border-[#e7eddc]">

    <!-- Price + Details -->
    <div class="flex flex-col md:flex-row md:justify-between gap-4">

      <!-- Left -->
      <div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl md:text-4xl font-extrabold text-[#243146] plus-jakarta-sans">
            ₹ ${formattedPrice}
          </span>
        </div>
        <p class="text-sm text-slate-600 mt-1 plus-jakarta-sans">
          ${region}
        </p>
      </div>

      <!-- Right -->
      <div class="text-sm text-slate-700 plus-jakarta-sans space-y-1">
        <p>+ 5% GST</p>
        <p>+ ₹300 Trek Insurance</p>
        <p>+ ₹3,000 for transport to and from base camp</p>
      </div>

    </div>

    <!-- Optional Additions -->
   <div class="text-sm text-slate-700 space-y-1 plus-jakarta-sans">
      ${addOnsHTML}

    ${showMoreButton}
    </div>
    </div>

    <!-- Info Notes -->

    <!-- Links -->
    <div class="pt-3 border-t border-[#e7eddc] grid grid-cols-2 gap-2 text-sm font-semibold plus-jakarta-sans">
  <a href="javascript:void(0)" onclick="scrollToInclusion()"  class="text-[#243146] hover:underline">Inclusions & Exclusions</a>
  <a href="/termmndcondition" class="text-[#243146] hover:underline">Terms & Conditions</a>
  <a href="/refund" class="text-[#243146] hover:underline">Refund Policy</a>

  <a href="javascript:void(0)"
     onclick="openScholarshipModal()"
     class="text-[#243146] hover:underline">
     Scholarships & Waivers
  </a>
</div>

  </div>

  <!-- Button -->
 <a href="/booking?price=${price}&id=${packageData._id}&name=${packageData.packageName}" class="pt-2 md:pt-3 block text-center">
  <button
    class="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-3 rounded-2xl bg-slate-900 text-[#d5e880] text-sm md:text-md font-bold shadow-xl hover:bg-[#d5e880] hover:text-slate-900 transition-all duration-300 uppercase tracking-widest plus-jakarta-sans">
    Book Now
  </button>
</a>

  <!-- Footer -->
  <div class="text-center space-y-2">
    <p class="text-[11px] text-slate-500 font-medium plus-jakarta-sans">
      Free cancellation up to 30 days before
    </p>
    <a href="#" class="text-xs font-bold text-[#b5c742] hover:underline plus-jakarta-sans">
      View Refund Policy →
    </a>
  </div>
</div>`;
    }

    // ----======= GALLERY TAB ======----

    const galleryContainer = document.getElementById(
      "galleryContainer",
    );

    const galleryData = packageData.gallery || [];

    const groupedGallery = {};

    // group by tab
    galleryData.forEach((img) => {
      const tab = img.tab?.trim().toLowerCase();

      if (!groupedGallery[tab]) {
        groupedGallery[tab] = [];
      }

      groupedGallery[tab].push(img);
    });
    window.groupedGallery = groupedGallery;
    console.log(groupedGallery);
    // dynamic tab buttons
    const tabWrapper =
      document.getElementById("galleryTabs");

    tabWrapper.innerHTML = "";

    Object.keys(groupedGallery).forEach((tab, index) => {
      tabWrapper.innerHTML += `
    <button
      onclick="showGallery('${tab}')"
      id="${tab}Btn"
      class="gallery-tab ${index === 0 ? "active-tab" : ""
        } px-6 py-3 rounded-full whitespace-nowrap"
    >
      ${tab.charAt(0).toUpperCase() + tab.slice(1)}
    </button>
  `;
    });

    function renderGallery(images) {
      galleryContainer.innerHTML = "";

      if (images.length === 0) {
        galleryContainer.innerHTML = `
      <p class="col-span-full text-center text-slate-500">
        No images available
      </p>
    `;
        return;
      }

      images.forEach((img, index) => {
        galleryContainer.innerHTML += `
      <div class="overflow-hidden rounded-[20px]">
        <img
          src="${img.url}"
          class="gallery-img"
          onclick="openLightbox('${currentTab}', ${index})"
        />
      </div>
    `;
      });
    }

    let currentTab = "";

    window.showGallery = function (tab) {
      currentTab = tab;

      renderGallery(groupedGallery[tab]);

      document
        .querySelectorAll(".gallery-tab")
        .forEach((btn) => {
          btn.classList.remove("active-tab");
        });

      document
        .getElementById(`${tab}Btn`)
        .classList.add("active-tab");
    };

    const firstTab = Object.keys(groupedGallery)[0];

    if (firstTab) {
      showGallery(firstTab);
    }

    let currentGallery = [];
    let currentIndex = 0;

    window.openLightbox = function (tab, index) {
      console.log("TAB:", tab);
      console.log("INDEX:", index);

      currentGallery = window.groupedGallery[tab] || [];

      console.log("GALLERY:", currentGallery);

      currentIndex = index;

      const lightbox = document.getElementById("lightbox");

      const lightboxImage =
        document.getElementById("lightboxImage");

      if (!currentGallery[currentIndex]) return;

      lightbox.style.display = "flex";

      lightboxImage.src = currentGallery[currentIndex].url;

      document.body.style.overflow = "hidden";
    };

    window.closeLightbox = function () {
      const lightbox = document.getElementById("lightbox");

      lightbox.style.display = "none";

      document.body.style.overflow = "auto";
    };
    window.nextImage = function () {
      if (currentGallery.length === 0) return;

      currentIndex++;

      if (currentIndex >= currentGallery.length) {
        currentIndex = 0;
      }

      document.getElementById("lightboxImage").src =
        currentGallery[currentIndex].url;
    };

    window.prevImage = function () {
      if (currentGallery.length === 0) return;

      currentIndex--;

      if (currentIndex < 0) {
        currentIndex = currentGallery.length - 1;
      }

      document.getElementById("lightboxImage").src =
        currentGallery[currentIndex].url;
    };

    const availableDateData =
      packageData.departureDates &&
        packageData.departureDates.length > 0
        ? packageData.departureDates
        : [];

    availableDate.innerHTML = "";

    // Group dates by REAL month from fromDate
    const groupedDates = {};
    if (availableDateData && availableDateData.length > 0) {
      availableDateData.forEach((date) => {
        if (!date.fromDate || !date.toDate) return;

        const from = new Date(date.fromDate);

        // Skip invalid dates
        if (isNaN(from.getTime())) return;

        const month = from.toLocaleString("en-US", {
          month: "long",
        });

        const year = from.getFullYear();

        const key = `${month} ${year}`;

        if (!groupedDates[key]) {
          groupedDates[key] = [];
        }

        groupedDates[key].push(date);
      });
    } else {
      availableDate.innerHTML = `
          <div class="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <p class="text-sm text-slate-600 plus-jakarta-sans mb-4">
              No departure dates available at the moment. Please fill out the form below and we'll contact you.
            </p>

            <form id="availabilityForm" class="space-y-4">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Enter your name"
                  class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d5e880]"
                  required
                />
              </div>

              <!-- Phone -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  placeholder="Enter phone number"
                  class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d5e880]"
                  required
                />
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Enter email address"
                  class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d5e880]"
                  required
                />
              </div>

              <!-- Date Fields -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">From Date</label>
                  <input 
                    type="date" 
                    name="fromDate"
                    class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d5e880]"
                    required
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">To Date</label>
                  <input 
                    type="date" 
                    name="toDate"
                    class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d5e880]"
                    required
                  />
                </div>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit"
                class="w-full bg-[#d5e880] text-slate-900 py-3 rounded-lg font-semibold hover:bg-[#c4d96c] transition"
              >
                Submit Inquiry
              </button>
            </form>
          </div>
        `;
    }

    //setup form submission

    // IMPORTANT
    const availabilityForm = document.getElementById(
      "availabilityForm",
    );
    if (availabilityForm) {
      availabilityForm.addEventListener(
        "submit",
        async function (e) {
          e.preventDefault();

          // =========================
          // Get Values
          // =========================
          const fullName =
            availabilityForm.name.value.trim();
          const contactNumber =
            availabilityForm.phone.value.trim();
          const email = availabilityForm.email.value.trim();
          const fromDate = availabilityForm.fromDate.value;
          const toDate = availabilityForm.toDate.value;

          // =========================
          // Validation Regex
          // =========================

          // Only letters and spaces
          const nameRegex = /^[A-Za-z\s]+$/;

          // Exactly 10 digits
          const phoneRegex = /^[0-9]{10}$/;

          // Email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

          // =========================
          // Full Name Validation
          // =========================
          if (!nameRegex.test(fullName)) {
            alert("Full name should contain only letters");
            return;
          }

          // =========================
          // Phone Validation
          // =========================
          if (!phoneRegex.test(contactNumber)) {
            alert("Phone number must be exactly 10 digits");
            return;
          }

          // =========================
          // Email Validation
          // =========================
          if (!emailRegex.test(email)) {
            alert("Please enter a valid email address");
            return;
          }

          // =========================
          // Date Validation
          // =========================
          const from = new Date(fromDate);
          const to = new Date(toDate);

          if (to <= from) {
            alert("To Date must be greater than From Date");
            return;
          }

          const formData = {
            packageId: packageId,
            fullName: fullName,
            contactNumber: contactNumber,
            email: email,
            fromDate: fromDate,
            toDate: toDate,
          };

          console.log("package enquiry data:", formData);

          try {
            const endpoint = "/api/package-enquiries";
            const url = API_CONFIG.getUrl(endpoint);
            const response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
              alert("Inquiry submitted successfully!");
              availabilityForm.reset();
            } else {
              alert(data.message || "Something went wrong");
            }
          } catch (error) {
            console.error(error);
            alert("Server Error");
          }
        },
      );
    }

    // Sort groups by real date
    const sortedGroups = Object.keys(groupedDates).sort(
      (a, b) => {
        const firstDateA = new Date(
          groupedDates[a][0].fromDate,
        );
        const firstDateB = new Date(
          groupedDates[b][0].fromDate,
        );

        return firstDateA - firstDateB;
      },
    );

    // Render UI
    sortedGroups.forEach((groupKey) => {
      let allDatesHtml = "";

      // Sort dates inside group
      groupedDates[groupKey].sort((a, b) => {
        return new Date(a.fromDate) - new Date(b.fromDate);
      });

      groupedDates[groupKey].forEach((date) => {
        // console.log("Processing Date:", date);
        const from = new Date(date.fromDate);
        const to = new Date(date.toDate);

        // Fix invalid toDate
        const safeTo = to < from ? from : to;

        const fromDate = from.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        const toDate = safeTo.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        allDatesHtml += `
      <div class="flex items-center justify-between p-3 rounded-xl border border-[#edf2e5] hover:bg-[#f8faf7] transition">

        <span class="text-sm font-medium text-slate-700 plus-jakarta-sans">
          ${fromDate} - ${toDate}
        </span>

        <a href="/booking?price=${packageData.offerPriceINR
            ? packageData.offerPriceINR
            : packageData.originalPriceINR
          }&id=${packageData._id}&name=${packageData.packageName
          }&fromDate=${date.fromDate}&toDate=${date.toDate}">

          <span class="text-[10px] font-bold text-white bg-[#12b85c] px-2 py-0.5 rounded uppercase plus-jakarta-sans">
            AVBL
          </span>

        </a>
      </div>
    `;
      });

      availableDate.innerHTML += `
    <div class="overflow-hidden mb-2 rounded-2xl border border-[#e5e6dc] bg-[#fbfcf8]">

      <button type="button"
        class="date-accordion-btn flex w-full items-center justify-between px-5 py-4 text-left hover:bg-[#f8faf4] transition-colors">

        <div class="flex items-center gap-2">

          <svg class="accordion-icon h-4 w-4 text-slate-400 transition-transform duration-300"
            fill="currentColor"
            viewBox="0 0 20 20">

            <path fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd" />
          </svg>

          <span class="font-bold text-slate-700 plus-jakarta-sans">
            ${groupKey}
          </span>

        </div>

      </button>

      <div class="accordion-content hidden border-t border-[#e5e6dc] bg-white p-2 space-y-2">
        ${allDatesHtml}
      </div>

    </div>
  `;
    });

    // itinerary section
    itinerary.forEach((day, index) => {
      dayTabsWrapper.innerHTML += `
                              <button type="button"
                            class="day-tab px-4 py-2 md:px-6 md:py-3 rounded-full text-[#243146] font-bold border 
                            ${index === 0
          ? "active-day-tab bg-[#cddc67] border-[#cddc67]"
          : "bg-white border-[#e5e6dc]"
        }
                            "
                            data-day="day${index + 1}">
                            ${day.heading}
                          </button>


                            
                       
      `;
      itineraryContent.innerHTML += `
      
                            <div id="day${index + 1}" class="${index !== 0 ? "day-content hidden" : "day-content"} p-1 md:p-6">
                                <div class="text-xl font-bold text-[#243146] mb-3"> ${day.subheading}</div>
                                <div class="text-slate-600 leading-8">${day.content ? day.content : "N/A"}</div>
                            </div>
                            
                       
      `;
    });
    //inclusion section
    inclusionsData.forEach((inclusion) => {
      inclusionsContent.innerHTML += ` <div class="package-accordion-item overflow-hidden border-b border-[#d5e880]">
                    <button type="button"
                        class="inclusions-btn bg-[#eef3e8]
                            hover:bg-[#e6eddc] flex w-full items-center justify-between px-3 md:px-6 py-2 text-left">
                        <div >
                            <h4 class="text-[20px] md:text-[22px] font-[600] text-[#243146] plus-jakarta-sans">${inclusion.name}</h4>
                        </div>
                        <svg class="accordion-icon h-7 w-7 text-slate-700 transition-transform duration-300" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.3">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div class="accordion-content hidden px-3 md:px-6 py-3 bg-[#eef3e8]
         hover:bg-[#e6eddc]">
    <div id="inclusionsPera" class="w-full ">
        <p  class="flex items-start gap-3 plus-jakarta-sans text-slate-700 leading-7 ">
            ${inclusion.content ? inclusion.content : "N/A"}
        </p>
    </div>
</div>
                </div>`;
    });

    // faq section

    faqData.forEach((faq) => {
      faqItem.innerHTML += `
        <div  class="faq-item bg-white border border-slate-200 rounded-2xl p-5 pl-6 transition-all duration-300">
                    
         <div id="faq-content" class="faq-question flex justify-between items-center w-full text-left">
                        <h3 class="text-lg md:text-xl font-semibold text-slate-900">
                           ${faq.heading}
                        </h3>

                        <span class="faq-icon-wrapper w-10 h-10 rounded-full bg-[#f1f6d8] flex items-center justify-center">
                            <svg class="faq-icon w-5 h-5 text-[#8aa43c] transition-transform duration-300" fill="none"
                                stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14"/>
                            </svg>
                        </span>
                    </div>

                    <div class="faq-answer max-h-0 overflow-hidden transition-all duration-300">
                        <p class="pt-4 text-slate-600">
                           ${faq.content}
                        </p>
                    </div>
                    </div>
        `;
    });

    // ================= FAQ TOGGLE =================
    const items = document.querySelectorAll(".faq-item");

    items.forEach((item) => {
      const btn = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");
      const icon = item.querySelector(".faq-icon");

      btn.addEventListener("click", () => {
        const isOpen = answer.classList.contains("open");

        // Close all
        document
          .querySelectorAll(".faq-answer")
          .forEach((el) => {
            el.style.maxHeight = null;
            el.classList.remove("open");
          });

        document
          .querySelectorAll(".faq-icon")
          .forEach((ic) => {
            ic.style.transform = "rotate(0deg)";
          });

        // Open current (toggle)
        if (!isOpen) {
          answer.style.maxHeight =
            answer.scrollHeight + "px";
          answer.classList.add("open");
          icon.style.transform = "rotate(45deg)";
        }
      });
    });

    // ================= Gallery Tab Logic =================

    const seasonTabs =
      document.querySelectorAll(".season-tab");
    const galleryItems =
      document.querySelectorAll(".gallery-item");

    seasonTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const season = tab.dataset.season;

        // Update Tab Styles
        seasonTabs.forEach((btn) => {
          btn.classList.remove(
            "bg-slate-900",
            "text-[#d5e880]",
            "border-slate-900",
          );
          btn.classList.add(
            "bg-white",
            "text-slate-600",
            "border-[#e5e6dc]",
          );
        });
        tab.classList.add(
          "bg-slate-900",
          "text-[#d5e880]",
          "border-slate-900",
        );
        tab.classList.remove(
          "bg-white",
          "text-slate-600",
          "border-[#e5e6dc]",
        );

        // Update Gallery Items
        galleryItems.forEach((item) => {
          if (item.classList.contains(season)) {
            item.classList.remove("hidden");
            setTimeout(
              () => item.classList.add("opacity-100"),
              10,
            );
          } else {
            item.classList.add("hidden");
            item.classList.remove("opacity-100");
          }
        });
      });
    });
  } catch (error) {
    console.error("Error fetching package details:", error);
  }
}
//==================find  Inclusions & Exclusions ==================
function scrollToInclusion() {
  const headings = [
    ...document.querySelectorAll("#inclusionsContent h4"),
  ];

  const matchedHeading = headings.find((heading) => {
    const text = heading.innerText.trim().toLowerCase();

    return (
      text.includes("inclusion") ||
      text.includes("exclusion")
    );
  });

  if (matchedHeading) {
    console.log("Matched!");

    // scroll
    matchedHeading.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    // accordion open
    const accordion = matchedHeading.closest(
      ".overflow-hidden",
    );

    const content = accordion.querySelector(
      ".accordion-content",
    );

    if (content) {
      content.classList.remove("hidden");
    }
  }
}

//  day1 day2 day3 tabs
async function loadSimilarPackages() {
  // console.log("currentPackageId", currentPackageId);
  try {
    const endpoint = "/api/packages";
    const url = API_CONFIG.getUrl(endpoint);
    const response = await fetch(url);
    const pkgdata = await response.json();
    console.log("similer package", pkgdata);
    const packages = pkgdata.data;
    const similarTrack =
      document.getElementById("similarTrack");
    similarTrack.innerHTML = ``;
    // for (const packageData of data) {
    packages.forEach((packageData) => {
      try {
        const params = new URLSearchParams(
          window.location.search,
        );
        // const currentPackageSlug = params.get("slug");
        let currentPackageId = null;

        // SEO URL
        const currentPathParts = window.location.pathname.split("/").filter(Boolean);
        if (currentPathParts[0] === "package") {
          currentPackageId = currentPathParts[1];
        } else if (currentPathParts.length === 1 && !currentPathParts[0].includes(".")) {
          currentPackageId = currentPathParts[0];
        }

        // Old URL fallback
        if (!currentPackageId) {
          const params = new URLSearchParams(
            window.location.search,
          );
          currentPackageId = params.get("slug");
        }

        console.log("Current Package:", currentPackageId);
        if (
          packageData.slug === currentPackageId ||
          packageData._id === currentPackageId
        ) {
          return; // skip current package
        }

        const packageTitle = limitWords(
          packageData.packageName,
          3,
        );
        const packageDescription = limitWords(
          packageData.shortDescription,
          8,
        );
        // const price = packageData.offerPriceINR
        //   ? packageData.offerPriceINR
        //   : packageData.originalPriceINR;

        similarTrack.innerHTML += `
         <article
                        class="similar-card group w-[88%] sm:w-[82%] md:w-[48%] lg:w-[31.8%] xl:w-[23.5%] shrink-0 overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-[#e9efdf] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl snap-start">
                        <div class="relative h-[220px] md:h-[240px] overflow-hidden">
                            <img src="${packageData.gallery && packageData.gallery.length > 0 ? packageData.gallery[0].url : "./images/trek.webp"}" alt="Goenchala Trek"
                                class="w-full h-full object-cover transition duration-700 group-hover:scale-110">
                            <div
                                class="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent">
                            </div>

                            
                        </div>

                        <div class="p-5 md:p-6">
                            <div class="flex items-start justify-between gap-3 mb-4">
                                <h4 class="text-xl font-bold text-slate-900 plus-jakarta-sans">${packageTitle}</h4>

                                <span
                                    class="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#d5e880]/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[1px] text-slate-800 plus-jakarta-sans">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                                    </svg>
                                    ${packageData.region ? packageData.region : "N/A"}
                                </span>
                            </div>

                            <div class="grid grid-cols-2 gap-2 mb-5">
                                <div class="rounded-2xl bg-[#f8faf7] px-3 py-3">
                                    <p
                                        class="text-[10px] font-semibold uppercase tracking-[1.1px] text-slate-500 plus-jakarta-sans">
                                        Duration</p>
                                    <p class="text-sm font-semibold text-slate-800 plus-jakarta-sans mt-1">${packageData.duration ? packageData.duration : "N/A"}</p>
                                </div>
                                <div class="rounded-2xl bg-[#f8faf7] px-3 py-3">
                                    <p
                                        class="text-[10px] font-semibold uppercase tracking-[1.1px] text-slate-500 plus-jakarta-sans">
                                        Grade</p>
                                    <p class="text-sm font-semibold text-slate-800 plus-jakarta-sans mt-1">${packageData.difficulty ? packageData.difficulty : "N/A"}
                                    </p>
                                </div>
                            </div>

                            <a href="/${packageData.slug}"
                                class="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.6px] text-slate-800 shadow-sm transition-all duration-300 hover:border-[#d5e880] hover:bg-[#d5e880] hover:text-slate-900 plus-jakarta-sans">
                                View Trek Details
                            </a>
                        </div>
                    </article>
      `;
        // render
      } catch (err) {
        console.error("Package error:", err);
      }
    });
  } catch (error) {
    console.log("error", error);
  }
}

document.addEventListener("click", function (e) {
  const tab = e.target.closest(".day-tab");
  if (!tab) return;

  const targetId = tab.dataset.day;

  const allTabs = document.querySelectorAll(".day-tab");
  const allContents =
    document.querySelectorAll(".day-content");

  // reset tabs
  allTabs.forEach((btn) => {
    btn.classList.remove(
      "bg-[#cddc67]",
      "text-[#243146]",
      "border-[#cddc67]",
    );
    btn.classList.add(
      "bg-white",
      "text-slate-700",
      "border-[#dfe3d3]",
    );
  });

  // hide all content
  allContents.forEach((content) =>
    content.classList.add("hidden"),
  );

  // active tab
  tab.classList.add(
    "bg-[#cddc67]",
    "text-[#243146]",
    "border-[#cddc67]",
  );
  tab.classList.remove(
    "bg-white",
    "text-slate-700",
    "border-[#dfe3d3]",
  );

  // show selected content
  const target = document.getElementById(targetId);
  if (target) target.classList.remove("hidden");
});

//available date accordion
document.addEventListener("click", function (e) {
  // 👉 accordion click handle
  const button = e.target.closest(".date-accordion-bt");

  if (button) {
    const content = button.nextElementSibling;
    const icon = button.querySelector(".accordion-icon");

    document
      .querySelectorAll(".accordion-content")
      .forEach((item) => {
        if (item !== content) item.classList.add("hidden");
      });

    document
      .querySelectorAll(".accordion-icon")
      .forEach((ic) => {
        if (ic !== icon) ic.classList.remove("rotate-180");
      });

    content.classList.toggle("hidden");
    icon.classList.toggle("rotate-180");
  }
});

// Accordion Toggle (Itinerary, Inclusions, FAQs)

document.addEventListener("click", function (e) {
  const btn = e.target.closest(".inclusions-btn");
  if (!btn) return;

  const content = btn.nextElementSibling;
  const icon = btn.querySelector(".accordion-icon");

  // close others
  document
    .querySelectorAll(".inclusions-btn")
    .forEach((b) => {
      if (b !== btn) {
        b.nextElementSibling.classList.add("hidden");
        b.querySelector(
          ".accordion-icon",
        )?.classList.remove("rotate-180");
      }
    });

  content.classList.toggle("hidden");
  icon?.classList.toggle("rotate-180");
});

// available date accordion
document.addEventListener("click", function (e) {
  const datebtn = e.target.closest(".date-accordion-btn");
  if (!datebtn) return;

  const content = datebtn.nextElementSibling;
  const icon = datebtn.querySelector(".accordion-icon");

  // close others
  document
    .querySelectorAll(".date-accordion-btn")
    .forEach((b) => {
      if (b !== datebtn) {
        b.nextElementSibling.classList.add("hidden");
        b.querySelector(
          ".accordion-icon",
        )?.classList.remove("rotate-180");
      }
    });

  content.classList.toggle("hidden");
  icon?.classList.toggle("rotate-180");
});

function openAddonsModal() {
  console.log("openAddonsModal", allAddOns);

  const modal = document.getElementById("chargeModal");
  const modalContent = document.getElementById(
    "chargeModalContent",
  );

  if (!modal || !modalContent) {
    console.error("Modal element not found");
    return;
  }

  modalContent.innerHTML = "";

  if (!allAddOns || allAddOns.length === 0) {
    modalContent.innerHTML = `
            <p class="text-red-500">
                No add-ons found
            </p>
        `;
  } else {
    allAddOns.forEach((addOn) => {
      modalContent.innerHTML += `
                <div class="flex justify-between border p-3 rounded-xl">

                    <span class="font-medium">
                        ${addOn.name}
                    </span>

                    <span class="font-bold">
                        ₹${Number(addOn.priceINR).toLocaleString("en-IN")}
                    </span>

                </div>
            `;
    });
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  document.body.classList.add("overflow-hidden");
}

function closeChargeModal() {
  const modal = document.getElementById("chargeModal");

  modal.classList.add("hidden");
  modal.classList.remove("flex");

  document.body.classList.remove("overflow-hidden");
}
