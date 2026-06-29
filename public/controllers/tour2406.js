// For Single Package Page
async function loadPackageDetails(slug) {
  try {
    const endpoint = "/api/packages";
    const url = API_CONFIG.getUrl(endpoint);
    const response = await fetch(url + `/${slug}`);

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}`,
      );
    }
    const packageData = await response.json();

    console.log("Fetched Package Data:", packageData);

    // const overview = document.getElementById("overviewText");
    const overviewText =
      document.getElementById("overviewText");
    const readMoreBtn =
      document.getElementById("readMoreBtn");
    // safety check
    if (!overviewText) {
      console.error("overviewText not found ❌");
      return;
    }

    const photoTypeTab =
      document.getElementById("photoTypeTab");
    const galleryGrid =
      document.getElementById("galleryGrid");
    const faqItem = document.getElementById("faq-item");
    const packageHeading = document.getElementById(
      "packageHeading",
    );

    const packageDurationTop = document.getElementById(
      "packageDurationTop",
    );
    const packageRegion =
      document.getElementById("packageRegion");
    const packageHighestAltitude = document.getElementById(
      "packageHighestAltitude",
    );

    const packageShortInfo = document.getElementById(
      "packageShortInfo",
    );
    const packageSubheading = document.getElementById(
      "packageSubheading",
    );
    const packageDuration = document.getElementById(
      "packageDuration",
    );
    const dayTabsWrapper = document.getElementById(
      "dayTabsWrapper",
    );
    const itineraryContent = document.getElementById(
      "itineraryContent",
    );
    const otherOptions =
      document.getElementById("otherOptions");

    const otherOptionsContent = document.getElementById(
      "otherOptionsContent",
    );
    const priceInfo = document.getElementById("priceInfo");
    const availableDate =
      document.getElementById("availableDate");
    //  const discountPercentage= document.getElementById("discountPercentage");

    // const originalPriceINR = document.getElementById("originalPriceINR");
    // const discountedPriceINR = document.getElementById("discountedPriceINR");
    // const basicPrice = document.getElementById("oldPrice");
    // const offerPrice = document.getElementById("basicPriceDisplay");
    // const discountedPriceDisplay = document.getElementById("discountedPriceDisplay");
    // const totalPriceDisplay = document.getElementById("totalPriceDisplay");

    const bookingSummary = document.getElementById(
      "bookingSummary",
    );

    packageHeading.innerText = "";
    packageShortInfo.innerText = "";
    packageSubheading.innerText = "";

    packageDurationTop.innerText = "";
    packageRegion.innerText = "";
    packageHighestAltitude.innerText = "";
    packageDuration.innerText = "";
    overviewText.innerHTML = "";
    photoTypeTab.innerHTML = "";
    galleryGrid.innerHTML = "";
    faqItem.innerHTML = "";
    dayTabsWrapper.innerHTML = "";
    itineraryContent.innerHTML = "";
    otherOptions.innerHTML = "";
    otherOptionsContent.innerHTML = "";
    priceInfo.innerHTML = "";
    // discountPercentage.innerHTML = "";
    availableDate.innerHTML = "";

    // originalPriceINR.innerText = "";
    // discountedPriceINR.innerText = "";
    // basicPrice.innerText = "";
    // offerPrice.innerText = "";
    // discountedPriceDisplay.innerText = "";
    // totalPriceDisplay.innerText = "";

    const faqData = packageData.faqs || [];
    const itinerary = packageData.itineraries || [];
    // const inclusionsData = packageData.otherOptions || [];
    const otherOptionsData = packageData.otherOptions || [];
    const tourPrice =
      packageData.offerPriceINR ||
      packageData.originalPriceINR ||
      0;

    // Calculate Discount Percentage
    const original = Number(packageData.originalPriceINR);
    const offer = Number(packageData.offerPriceINR);

    let discountPercent = 0;

    if (original && offer) {
      discountPercent = Math.round(
        ((original - offer) / original) * 100,
      );
    }
    // if (discountPercentage) {
    //   discountPercentage.innerText = discountPercent > 0 ? `${discountPercent}% OFF` : "";
    // }

    if (packageData) {
      packageDurationTop.innerText =
        packageData.duration || "N/A";
      packageRegion.innerText = packageData.region || "N/A";
      packageHighestAltitude.innerText =
        packageData.highestAltitude
          ? `Highest Altitude: ${packageData.highestAltitude}`
          : "N/A";
      packageHeading.innerText =
        packageData.packageName || "N/A";
      packageShortInfo.innerText =
        packageData.shortDescription || "N/A";
      packageSubheading.innerText =
        packageData.packageName || "N/A";
      packageDuration.innerText =
        "Duration: " + (packageData.duration || "N/A");
      // originalPriceINR.innerText = packageData.originalPriceINR  ? `₹ ${Number(packageData.originalPriceINR).toLocaleString("en-IN")}` : "N/A";
      // discountedPriceINR.innerText = packageData.offerPriceINR  ? `₹ ${Number(packageData.offerPriceINR).toLocaleString("en-IN")}` : "N/A";
      // basicPrice.innerText = packageData.originalPriceINR  ? `₹ ${Number(packageData.originalPriceINR).toLocaleString("en-IN")}` : "N/A";
      // offerPrice.innerText = packageData.offerPriceINR  ? `₹ ${Number(packageData.offerPriceINR).toLocaleString("en-IN")}` : "N/A";
      // discountedPriceDisplay.innerText = (packageData.originalPriceINR - packageData.offerPriceINR) ? `₹ ${Number(packageData.originalPriceINR - packageData.offerPriceINR).toLocaleString("en-IN")}` : "N/A";
      // totalPriceDisplay.innerText = packageData.offerPriceINR  ? `₹ ${Number(packageData.offerPriceINR).toLocaleString("en-IN")}` : "N/A";
      //================itinerary ===============
      const itinerary = packageData.itineraries || [];
      //=======overview section with read more logic ==========
      const fullContent = packageData.overview
        ? packageData.overview
        : "N/A";
      // const fullContent =
      //   packageData.overview?.replace(/&nbsp;/g, " ") ||
      //   "N/A";

      // 👉 words split
      const words = fullContent.split(" ");
      const shortContent = words.slice(0, 350).join(" ");

      // clear old
      overviewText.innerHTML = "";
      readMoreBtn.classList.add("hidden");

      if (words.length > 40) {
        overviewText.innerHTML = shortContent + "...";
        readMoreBtn.classList.remove("hidden");

        let expanded = false;

        readMoreBtn.onclick = () => {
          if (!expanded) {
            overviewText.innerHTML = fullContent;
            readMoreBtn.innerText = "Read Less";
            expanded = true;
          } else {
            overviewText.innerHTML = shortContent + "...";
            readMoreBtn.innerText = "Read More";
            expanded = false;
          }
        };
      } else {
        overviewText.innerHTML = fullContent;
      }
      //=======overview section with read more logic END ==========

      // ============ GALLERY TAB ==============
      packageData.tabs.forEach((pkgtab, index) => {
        const galaryTabBtn = `<button class="season-tab px-8 py-3 rounded-xl transition-all duration-300 font-bold border-2 ${index === 0 ? "active-season-tab bg-slate-900 text-[#d5e880]" : "bg-white text-slate-600 border-[#e5e6dc] hover:border-slate-900 hover:text-slate-900"} "
        data-season="${pkgtab}">${pkgtab}</button>`;
        photoTypeTab.innerHTML += galaryTabBtn;

        // gallery wrapper (one per tab)
        const images = packageData.gallery.filter(
          (img) => img.tab === pkgtab,
        );
        // first 4 image
        const bigImg = images[0];
        const small1 = images[1];
        const small2 = images[2];
        const small3 = images[3];

        const hasBig = bigImg?.url;
        const hasSmall1 = small1?.url;
        const hasSmall2 = small2?.url;
        const hasSmall3 = small3?.url;

        const extraCount = Math.max(images.length - 3, 0);

        let imagesHTML = "";

        images.forEach((img) => {
          imagesHTML += `
            <div class="col-span-1 md:col-span-4">
                <img src="${img.url}" class="w-full h-[250px] object-cover rounded-xl"/>
            </div>
        `;
        });

        const safeTab = pkgtab.replace(/\s+/g, "-");

        const galaryPhotos = `
          <div class="gallery-item ${safeTab} ${index !== 0 ? "hidden" : ""} col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-5">

    <!-- BIG IMAGE -->
    ${
      hasBig
        ? `
    <div class="md:col-span-7 group relative overflow-hidden rounded-[32px] h-[400px] md:h-[600px]">
        <img src="${bigImg.url}" class="w-full h-full object-cover">
    </div>`
        : ""
    }

        <!-- RIGHT SIDE -->
      <div class="md:col-span-5 grid grid-cols-2 gap-5">

        ${
          hasSmall1
            ? `
        <div class="col-span-2 group relative overflow-hidden rounded-[32px] h-[290px]">
            <img src="${small1.url}" class="w-full h-full object-cover">
        </div>`
            : ""
        }

        ${
          hasSmall2
            ? `
        <div class="group relative overflow-hidden rounded-[32px] h-[290px]">
            <img src="${small2.url}" class="w-full h-full object-cover">
        </div>`
            : ""
        }

        ${
          hasSmall3
            ? `
        <div class="group relative overflow-hidden rounded-[32px] h-[290px]">
            <img src="${small3.url}" class="w-full h-full object-cover">

            ${
              extraCount > 0
                ? `
            <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span class="text-white text-2xl font-bold">
                    + ${extraCount} Photos
                </span>
            </div>`
                : ""
            }
        </div>`
            : ""
        }

    </div>
     </div>
           `;
        galleryGrid.innerHTML += galaryPhotos;
      });
    }

    //priceInfo 1st card

    // priceInfo.innerHTML = `
    // <span class="text-sm md:text-base font-semibold text-slate-500">
    //                                 Starts From:
    //                             </span>

    //                             <span id="originalPriceINR" class="text-lg font-semibold text-red-500 line-through">
    //                                 ${packageData.originalPriceINR ? `₹ ${Number(packageData.originalPriceINR).toLocaleString("en-IN")}` : "N/A"}
    //                             </span>

    //                             <span id="discountedPriceINR" class="text-xl md:text-2xl font-bold text-[#243146]">
    //                                 ${packageData.offerPriceINR ? `₹ ${Number(packageData.offerPriceINR).toLocaleString("en-IN")}` : "N/A"}
    //                             </span>
    // `;

    //availableDate section

    const availableDateData =
      packageData.departureDates &&
      packageData.departureDates.length > 0
        ? packageData.departureDates
        : [];
    const hasAvailableDates = availableDateData.length > 0;
    availableDate.innerHTML = "";
    console.log("Available Dates:", availableDateData);
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

        <a href="/booking?price=${
          packageData.offerPriceINR
            ? packageData.offerPriceINR
            : packageData.originalPriceINR
        }&id=${packageData._id}&name=${
          packageData.packageName
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

    //booking summery

    bookingSummary.innerHTML = `
                                    <!-- Price Row -->
                                    <div class="flex items-start justify-between gap-3">
                                        <div class="flex flex-col gap-2">
                                            <h4  class="text-base md:text-lg font-semibold text-[#243146]">
                                                Basic Price
                                            </h4>

                                            <span id="offerPrice"
                                                class="inline-flex w-fit items-center rounded-lg bg-[#243146] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#d5e880]">
                                                Offer Price
                                            </span>
                                        </div>

                                        <div class="text-right">
                                            <p id="oldPrice" class="text-base font-semibold text-red-500 line-through">
                                                ${packageData.originalPriceINR ? `₹ ${Number(packageData.originalPriceINR).toLocaleString("en-IN")}` : "N/A"}
                                            </p>
                                            <p id="basicPriceDisplay"
                                                class="mt-1 text-2xl md:text-3xl leading-none font-bold text-[#243146]">
                                                ${packageData.offerPriceINR ? `₹ ${Number(packageData.offerPriceINR).toLocaleString("en-IN")}` : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <!-- Discount Card -->
                                    <div class="rounded-[18px] border border-[#cfe4b5] bg-[#f6fbef] px-4 py-4">
                                        <div class="flex flex-col gap-3">
                                           

                                            <div class="flex items-center justify-between gap-3">
                                                <span class="text-base font-medium text-slate-600">
                                                    Discounted Price
                                                </span>
                                                <span id="discountedPriceDisplay"
                                                    class="text-xl font-bold text-[#243146]">
                                                    ${packageData.originalPriceINR - packageData.offerPriceINR ? `₹ ${Number(packageData.originalPriceINR - packageData.offerPriceINR).toLocaleString("en-IN")}` : "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Divider -->
                                    <div class="h-px w-full bg-[#e5e6dc]"></div>

                                    <!-- Total Box -->
                                    <div class="rounded-[18px] border border-[#e5e6dc] bg-[#fbfcf8] px-4 py-4">
                                        <div class="flex flex-col gap-3">

                                            <div class="flex items-center justify-between gap-3">
                                                <span class="text-base md:text-lg font-medium text-[#243146]">
                                                    Total Price (incl. charges)
                                                </span>
                                                <span id="totalPriceDisplay" class="text-xl font-bold text-[#243146]">
                                                    ${packageData.offerPriceINR ? `₹ ${Number(packageData.offerPriceINR).toLocaleString("en-IN")}` : "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Bottom Buttons -->
                                    ${
                                      hasAvailableDates
                                        ? `
                                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          <a href="/booking?price=${tourPrice}&id=${packageData._id}&name=${packageData.packageName}">
                                              <button
                                                  class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d5e880] px-4 py-3 text-sm md:text-base font-semibold text-[#243146]">
                                                  Book Tour
                                              </button>
                                          </a>
                                      </div>
                                      `
                                        : ""
                                    }
    `;

    itinerary.forEach((day, index) => {
      dayTabsWrapper.innerHTML += `

                       <button type="button"
      class="day-tab px-4 py-2 md:px-6 md:py-3 rounded-full text-[#243146] font-bold border 
      ${
        index === 0
          ? "active-day-tab bg-[#cddc67] border-[#cddc67]"
          : "bg-white border-[#e5e6dc]"
      }
      "
      data-day="day${index + 1}">
      ${day.heading}
    </button>

  `;
      //       itineraryContent.innerHTML += `

      //                       <div id="day${index + 1}" class="${index !== 0 ? "day-content hidden" : "day-content"} p-1 md:p-6">
      //                           <h5 class="text-xl font-bold text-[#243146] mb-3"> ${day.subheading}</h5>
      //                           <p class="text-slate-600 leading-8">${day.content.replace(/&nbsp;/g, " ")}</p>
      //                       </div>

      // `;
      itineraryContent.innerHTML += `
<div id="day${index + 1}" class="${index !== 0 ? "day-content hidden" : "day-content"} rounded-[20px] border border-[#e5e6dc] bg-[#f8faf7]  p-1 md:p-6 ">

    <div class="flex items-center gap-3 mb-3">
        <!-- ✅ NUMBER BOX -->
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#d5e880] text-[#243146] text-sm font-bold">
            ${index + 1}
        </span>

        <!-- ✅ DAY TITLE -->
        <h4 class="text-base md:text-lg font-semibold text-[#243146]">
            ${day.heading}
        </h4>
    </div>

    <!-- ✅ CONTENT -->
    <p class="text-sm md:text-[15px] leading-7 text-slate-600">
        ${day.content.replace(/&nbsp;/g, " ")}
    </p>

</div>
`;
    });
    otherOptionsData.forEach((inclusion) => {
      otherOptions.innerHTML += `
        <button data-tab="inclusion${inclusion._id}"
                            class="tab-btn whitespace-nowrap px-4 md:px-5 py-2.5 md:py-3 rounded-xl text-sm md:text-xl font-semibold border border-[#e5e6dc] bg-white text-[#243146] transition-all duration-300">
                            ${inclusion.name}
                        </button>

      `;
      otherOptionsContent.innerHTML += `
      <div class="tab-content hidden" id="inclusion${inclusion._id}">
                    <div>${inclusion.content.replace(/&nbsp;/g, " ")}</div>
                    </div>
      `;
    });
    //     // 🔥 ADD THIS HERE
    // const tabButtons = document.querySelectorAll(".tab-btn");
    // const tabContents = document.querySelectorAll("#otherOptionsContent .tab-content");

    // tabButtons.forEach((btn) => {
    //   btn.addEventListener("click", () => {
    //     const target = btn.getAttribute("data-tab");

    //     // সব content hide
    //     tabContents.forEach((content) => {
    //       content.classList.add("hidden");
    //     });

    //     // শুধু selected show
    //     const activeContent = document.getElementById(target);
    //     if (activeContent) {
    //       activeContent.classList.remove("hidden");
    //     }
    //   });
    // });
    const tabs = document.querySelectorAll(".tab-btn");
    const contents =
      document.querySelectorAll(".tab-content");

    tabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        // remove active
        tabs.forEach((b) => b.classList.remove("active"));

        // add active
        btn.classList.add("active");

        // hide all content
        contents.forEach((c) => c.classList.add("hidden"));

        // show selected
        document
          .getElementById(btn.dataset.tab)
          .classList.remove("hidden");
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

    // faq section
    faqData.forEach((faq) => {
      faqItem.innerHTML += `

       <div class="faq-item bg-white border border-slate-200 rounded-2xl p-5 pl-6 transition-all duration-300">

                    <button class="faq-question flex justify-between items-center w-full text-left">
                        <h3 class="text-lg md:text-xl font-semibold text-slate-900">
                            ${faq.heading}
                        </h3>

                        <span
                            class="faq-icon-wrapper w-10 h-10 rounded-full bg-[#f1f6d8] flex items-center justify-center">
                            <svg class="faq-icon w-5 h-5 text-[#8aa43c] transition-transform duration-300" fill="none"
                                stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" />
                            </svg>
                        </span>
                    </button>

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

    //  day1 day2 day3 tabs
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
        const icon = button.querySelector(
          ".accordion-icon",
        );

        document
          .querySelectorAll(".accordion-content")
          .forEach((item) => {
            if (item !== content)
              item.classList.add("hidden");
          });

        document
          .querySelectorAll(".accordion-icon")
          .forEach((ic) => {
            if (ic !== icon)
              ic.classList.remove("rotate-180");
          });

        content.classList.toggle("hidden");
        icon.classList.toggle("rotate-180");
      }
    });

    // ✅ VIEW ALL BUTTON LOGIC
    const viewAllBtn =
      document.getElementById("viewAllDays");

    viewAllBtn.addEventListener("click", () => {
      const allContents =
        document.querySelectorAll(".day-content");

      allContents.forEach((content) => {
        content.classList.remove("hidden");
      });

      document
        .querySelectorAll(".day-tab")
        .forEach((btn) => {
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
    });
  } catch (error) {
    console.error("Error fetching package details:", error);
  }
}

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
