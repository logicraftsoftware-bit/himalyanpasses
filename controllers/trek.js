//For Single Trek Page
async function loadTrekDetails(slug) {
  try {
    let trekData = null;
    const cachedRouteData = sessionStorage.getItem(`route:data:${slug}`);
    if (cachedRouteData) {
      const cached = JSON.parse(cachedRouteData);
      if (cached.kind === "trek-category" || cached.kind === "tour-category") {
        trekData = cached.data;
        sessionStorage.removeItem(`route:data:${slug}`);
      }
    }

    if (!trekData) {
      const endpoint = "/api/categories";
      const url = API_CONFIG.getUrl(endpoint);
      const response = await fetch(url + `/${slug}`);
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}`,
        );
      }
      trekData = await response.json();
    }
    const ladakhTrack =
      document.getElementById("ladakhTrack");
    ladakhTrack.innerHTML = "";
    const faqContainer =
      document.getElementById("faqContainer");
    const trekBannerHeading=document.getElementById("trekBannerHeading");
    const trekBannerSecondHeading=document.getElementById("trekBannerSecondHeading");
    trekBannerHeading.innerText="";
    trekBannerSecondHeading.innerText="";
    faqContainer.innerHTML = "";
    console.log("Fetched Trek Data:", trekData);
    const pagecontent =
      document.getElementById("pagecontent");
    const bannerHeading =
      document.getElementById("bannerHeading");
    const ladakhSlider =
      document.getElementById("ladakhSlider");
    const heroImage = document.getElementById("heroImage");
    const bannerImage = trekData.bannerItems || "";
    const packages = trekData.packages;
    const packageFAQ = trekData.faqs;
    // console.log("Banner Image:", bannerImage);
    // console.log("packages:", packages);
    // console.log("FAQ:", packageFAQ);
    bannerHeading.innerText = "";
    pagecontent.innerHTML = "";
    // ladakhSlider.innerHTML = "";
    const cleanContent = trekData.pageContent.replace(
      /&nbsp;/g,
      " ",
    );
    if (bannerImage.length > 0) {
      heroImage.src = bannerImage[0];
    } else {
      heroImage.src = "./images/blog-banner.webp";
    }
    const trekName = trekData.name
    ? trekData.name.charAt(0).toUpperCase() + trekData.name.slice(1)
    : "";

    trekBannerHeading.innerText=trekName || "";
    trekBannerSecondHeading.innerText=trekName || "";
    bannerHeading.innerText = trekName || "Trek Title";
    pagecontent.innerHTML =
      cleanContent || "<p>No content available.</p>";
    // bannerImage.forEach((image) => {
    //   console.log("Banner Image Data:", image);
    //   ladakhSlider.innerHTML += `
    //   <div class="min-w-full h-[420px] relative snap-start">
    //                 <img src="${image || "p"}" class="w-full h-full object-cover" alt="trek">

    //                 <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
    //             </div>`;
    // }
    // );
    // const img = document.createElement("img");
    // img.src = image.data || "./images/trek.webp";
    //     if (packages.length === 0) {
    //   ladakhTrack.innerHTML = `
    //     <div class="bg-white border rounded-2xl p-6 text-center">
    //       <h3 class="text-xl font-semibold text-slate-800">
    //         No Packages Available
    //       </h3>
    //       <p class="text-slate-500 mt-2">
    //         Please check back later or explore other treks.
    //       </p>
    //     </div>
    //   `;
    // } else {
    for (const pkg of packages) {
    //   console.log("Package ID:", pkg);
      try {
        const endpoint = "/api/packages";
        const url = API_CONFIG.getUrl(endpoint);

        const response = await fetch(url + `/${pkg}`);
        if (!response.ok) {
          console.warn("Package not found:", pkg);
          continue; // 🔥 skip this
        }

        const packageData = await response.json();
        // console.log("Fetched Package Data:", packageData);
        const packageTitle = limitWords(
          packageData.packageName,
          3,
        );
        const packageDescription = limitWords(
          packageData.shortDescription,
          8,
        );
        const price = packageData.offerPriceINR 
    ? packageData.offerPriceINR 
    : packageData.originalPriceINR;


        // const singlePackageEndpoint="/api/categories";

        // const singlePackageurl = API_CONFIG.getUrl(singlePackageEndpoint);
        // console.log(singlePackageurl);
        // console.log("Package ID2:" ,pkg);
        // const singleresponse = await fetch(singlePackageurl + `/${pkg}`);
        // const singleData= await singleresponse.json();
        // console.log("check similer package parent name", singleData);
        // const similerPackageId=singleData.name;

        
        ladakhTrack.innerHTML += `
       <div
                        class="ladakh-card snap-start group w-[88%] sm:w-[70%] md:w-[48%] lg:w-[31.8%] xl:w-[23.5%] shrink-0 h-full flex flex-col overflow-hidden rounded-[24px] border border-[#e7eddc] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                        <div class="relative overflow-hidden">
                            <img src="${packageData.thumbnail ? packageData.thumbnail : "./images/trek.webp"}" width="420" height="260" alt="Nun Kun Ladakh" loading="lazy" decoding="async"
                                decoding="async"
                                class="h-44 w-full object-cover transition duration-500 group-hover:scale-105">
                            <div
                                class="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent">
                            </div>
                            <span
                                class="absolute left-3 top-3 rounded-full bg-[#d5e880] px-3 py-1 text-[11px] font-semibold text-slate-900 shadow-sm plus-jakarta-sans">
                                Popular
                            </span>
                        </div>

                        <div class="grid grid-cols-2 gap-2 p-3 pb-0">
                            <div
                                class="flex items-center gap-2 rounded-xl border border-[#edf2e5] bg-[#f8faf7] px-3 py-2.5">
                                <div
                                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#d5e880]/30 text-[#7f9732]">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="5" width="18" height="16" rx="3"></rect>
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 3v4M8 3v4M3 10h18">
                                        </path>
                                    </svg>
                                </div>
                                <div class="flex flex-col leading-tight">
                                    <span
                                        class="plus-jakarta-sans text-[10px] font-medium uppercase tracking-[1.2px] text-slate-500">Duration</span>
                                    <span class="plus-jakarta-sans text-xs font-semibold text-slate-800">${packageData.duration}</span>
                                </div>
                            </div>

                            <div
                                class="flex items-center gap-2 rounded-xl border border-[#edf2e5] bg-[#f8faf7] px-3 py-2.5">
                                <div
                                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#d5e880]/30 text-[#7f9732]">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M3 20h18M6 20l5.5-9 3 5 2-3 1.5 2.5"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M14 8l1.5-2 2 3"></path>
                                    </svg>
                                </div>
                                <div class="flex flex-col leading-tight">
                                    <span
                                        class="plus-jakarta-sans text-[10px] font-medium uppercase tracking-[1.2px] text-slate-500">Altitude</span>
                                    <span class="plus-jakarta-sans text-xs font-semibold text-slate-800">${packageData.highestAltitude}</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-1 flex-col gap-4 p-4">
                            <div class="space-y-2">
                                <h3 class="gloock-regular text-xl leading-tight text-slate-900">${packageTitle}</h3>
                                <p class="text-sm leading-6 text-slate-600 plus-jakarta-sans">
                                   ${packageDescription}
                                </p>
                            </div>
                            
                            <div
                                class="flex items-end justify-between rounded-2xl border border-[#e7eddc] bg-gradient-to-r from-[#f8faf7] to-white px-4 py-3 shadow-sm">
                                <div class="flex flex-col gap-1">
                                    <span
                                        class="text-[10px] uppercase tracking-[1.2px] text-slate-500 plus-jakarta-sans">
                                        Package Price
                                    </span>

                                    <div class="flex items-center gap-2 flex-wrap">
                                        <span class="text-sm font-medium text-slate-400 line-through plus-jakarta-sans">
                                            ₹${packageData.originalPriceINR}
                                        </span>

                                        <span
                                            class="rounded-full bg-[#d5e880]/40 px-2.5 py-1 text-xl font-bold text-slate-900 plus-jakarta-sans">
                                            ₹${packageData.offerPriceINR}
                                        </span>
                                    </div>
                                </div>

                                <div class="flex flex-col items-end leading-tight">
                                    <span class="text-[11px] font-medium text-slate-500 plus-jakarta-sans">
                                        per person
                                    </span>
                                    <span class="text-[11px] text-[#7f9732] plus-jakarta-sans">
                                        Limited offer
                                    </span>
                                </div>
                            </div>

                            <div class=" abc mt-auto grid grid-cols-2 gap-2.5">
                                <a href="/${pkg}"
                                    class="inline-flex items-center justify-center rounded-l-full rounded-r-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-300 hover:border-[#d5e880] hover:bg-[#d5e880] hover:text-slate-900 plus-jakarta-sans">
                                    View
                                </a>
                                <a href="/booking?price=${price}&id=${packageData._id}&name=${packageData.packageName}"
                                    class="inline-flex items-center justify-center rounded-l-2xl rounded-r-full border border-[#d5e880] bg-[#d5e880] px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md plus-jakarta-sans">
                                    Book
                                </a>
                            </div>
                            
                        </div>
                    </div>
      `;
        // render
      } catch (err) {
        console.error("Package error:", err);
      }
    }

    packageFAQ.forEach((faq) => {
      faqContainer.innerHTML += `
      <div class="faq-item bg-white border border-slate-200 rounded-2xl p-5 pl-6 transition-all duration-300">
                    <button class="faq-question flex justify-between items-center w-full text-left">
                        <h3 class="text-lg md:text-xl font-semibold text-slate-900 plus-jakarta-sans">
                            ${faq.heading}
                        </h3>

                        <span
                            class="faq-icon-wrapper w-10 h-10 rounded-full bg-[#f1f6d8] flex items-center justify-center shrink-0 transition-all duration-300">
                            <svg class="faq-icon w-5 h-5 text-[#8aa43c] transition-transform duration-300" fill="none"
                                stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" />
                            </svg>
                        </span>
                    </button>

                    <div class="faq-answer max-h-0 overflow-hidden transition-all duration-300">
                        <p class="pt-4 text-slate-600 leading-7 plus-jakarta-sans">
                          ${faq.content}                        </p>
                    </div>
                </div>
      `;
    });
    // }
  } catch (error) {
    console.error("Error fetching trek details:", error);
  }


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
        answer.style.maxHeight = answer.scrollHeight + "px";
        answer.classList.add("open");
        icon.style.transform = "rotate(45deg)";
      }
    });
  });

}


//diierent trek 

async function loadDifferentTrek(){
    try{
        
    const endpoint = "/api/more-treks";
    const url = API_CONFIG.getUrl(endpoint);
    const response = await fetch(url);
    const upcommingTrek= document.getElementById("upcomingCard");
    const trendingTrek= document.getElementById("trendingCard");
     upcommingTrek.innerHTML= '';
     trendingTrek.innerHTML='';
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}`,
      );
    }
    const diffrentTrekRecord = await response.json();

    console.log('different trek', diffrentTrekRecord); 
    diffrentTrekRecord.data.forEach((trecrecord) => {
        trecrecord.packages.forEach((singlepackage)=>{
            const packageName = limitWords(singlepackage.packageName, 3);
            const price = singlepackage.offerPriceINR 
    ? singlepackage.offerPriceINR 
    : singlepackage.originalPriceINR;
                const card=`
        
                    <!-- card 1 -->
                    <div
                        class="group relative shrink-0 snap-start w-[88%] sm:w-[70%] md:w-auto overflow-hidden rounded-[24px] min-h-[420px] shadow-xl">
                        <img src="${singlepackage.thumbnail || './images/affortable package.webp'}" width="420" height="520" loading="lazy" decoding="async" alt="Goechala Trek"
                            class="w-full h-full absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-110">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent"></div>

                        <div class="relative z-10 flex flex-col justify-end h-full p-6">
                            <div>
                                <h3 class="gloock-regular text-white text-3xl mb-2">${packageName}</h3>
                                <div class="flex flex-col gap-2 text-white/95 plus-jakarta-sans text-lg mb-3">
                                    <p class="flex items-center gap-2"><span class="text-xl">📍</span> ${singlepackage.region}</p>
                                    <p class="flex items-center gap-2"><span class="text-xl">🕒</span> 6 Days - 5 Nights
                                    </p>
                                    <p class="flex items-center gap-2"><span class="text-xl">⛰️</span> Altitude: ${singlepackage.highestAltitude}</p>
                                    <p class="flex items-center gap-2"><span class="text-xl">🌿</span> Best Season: ${singlepackage.bestTime}</p>
                                </div>
                                <div class="grid grid-cols-2 gap-3">
                                    <a href="/${singlepackage.slug}"
                                        class="inline-flex w-full items-center justify-center rounded-l-full rounded-r-2xl border border-slate-200 bg-white px-5 py-3.5 font-semibold text-slate-800 shadow-sm transition-all duration-300 hover:border-[#d5e880] hover:bg-[#d5e880] hover:text-slate-900 plus-jakarta-sans">
                                        View
                                    </a>
                                    <a href="/booking?price=${price}&id=${singlepackage._id}&name=${singlepackage.packageName}"
                                        class="inline-flex w-full items-center justify-center rounded-l-2xl rounded-r-full border border-[#d5e880] bg-[#d5e880] px-5 py-3.5 font-semibold text-slate-900 shadow-sm transition-all duration-300 hover:bg-white plus-jakarta-sans">
                                        Book
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

            
        `;
        
       
        if(trecrecord.type == "Trending Trekking"){
            trendingTrek.innerHTML += card;
        }
        if(trecrecord.type == "Upcoming"){
            upcommingTrek.innerHTML += card;
        }
        })
    });
    // const type= diffrentTrekRecord.data.type;

    }catch(error){
        console.error("trek load error", error)
    }
}


//============= home page trek category tab =============


// const BASE_URL = "https://glacier-treks-adventures-admin-back.vercel.app";
async function loadTrekCategoryTab() {
    const homeTrekCategoryTabs = document.getElementById("homeTrekCategoryTabs");
    const pricingContentContainer = document.querySelector(".pricing-scroll"); 
    
    homeTrekCategoryTabs.innerHTML = '';

    try {
        const endpoint = "/api/categories";
    const url = API_CONFIG.getUrl(endpoint);

        const response = await fetch(url);
        const trekCategories = await response.json();
        
        trekCategories.forEach((category, index) => {
            if(category.showInHome == true){
            const isActive = index === 0;
            const button = document.createElement('button');
            button.type = "button";
            button.className = `pricing-tab ${isActive ? 'active-tab' : ''} whitespace-nowrap text-sm md:text-md px-5 py-3 rounded-full border font-semibold`;
            button.setAttribute('data-id', category._id); 
            button.innerText = category.name;

            
            button.addEventListener('click', () => {
                
                document.querySelectorAll('.pricing-tab').forEach(btn => btn.classList.remove('active-tab'));
                button.classList.add('active-tab');
                
               
                fetchPackagesByCategory(category._id);
            });

            homeTrekCategoryTabs.appendChild(button);
         }
        });

        
        if (trekCategories.length > 0) {
            fetchPackagesByCategory(trekCategories[0]._id);
        }
    

    } catch (error) {
        console.error("Error loading categories:", error);
    }
}


async function fetchPackagesByCategory(categoryId) {
    const pricingContentContainer = document.querySelector(".pricing-scroll");
    pricingContentContainer.innerHTML = '<p class="text-center w-full">Loading packages...</p>';

    try {
        const endpoint = "/api/categories";
        const url = API_CONFIG.getUrl(endpoint);

        const response = await fetch(`${url}/${categoryId}`);
        // const response = await fetch(`${BASE_URL}/api/categories/${categoryId}`);
        const data = await response.json();
        
        const packages = data.packages || data; 
        // console.log("Fetched Packages for Category:", packages);

        pricingContentContainer.innerHTML = ''; 

        if (!packages || packages.length === 0) {
            console.warn("No packages found for this category.");
            // pricingContentContainer.innerHTML = '<p class="text-center w-full">No packages found for this category.</p>';
            return;
        }

        // packages.forEach(pkg => {
              for (const pkgId of packages) {

           console.log("Fetched Packages id:", pkgId);
            const packageendpoint = "/api/packages";
            const packageurl = API_CONFIG.getUrl(packageendpoint);
            const singleResponse = await  fetch(`${packageurl}/${pkgId}`);
             const pkg = await  singleResponse.json();
                // console.log("Fetched Package Data:", pkg);
                const price = pkg.offerPriceINR ? pkg.offerPriceINR : pkg.originalPriceINR;
                const title = limitWords(pkg.packageName, 3);
                const description = limitWords(pkg.shortDescription, 5);
            pricingContentContainer.innerHTML += `
                <div class="ladakh-card snap-start w-[280px] sm:w-[320px] lg:w-[340px] flex-shrink-0 group h-full flex flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                    <div class="relative overflow-hidden">
                        <img src="${pkg.thumbnail || './images/affortable package.webp'}" width="420" height="260" loading="lazy" decoding="async" alt="${pkg.name}" class="h-60 w-full object-cover transition duration-700 group-hover:scale-110" />
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent"></div>
                        <span class="absolute left-4 top-4 rounded-full bg-[#d5e880] px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-md">${pkg.parentCategory ? pkg.parentCategory.name.charAt(0).toUpperCase() + pkg.parentCategory.name.slice(1) : 'Uncategorized'}</span>
                        <span class="absolute right-4 bottom-4 rounded-full bg-white/95 backdrop-blur-md border border-[#e7eddc] px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg">₹${price ? price.toLocaleString('en-IN') : 'N/A'}</span>
                    </div>
                    <div class="grid grid-cols-2 gap-3 p-4 pb-0">
                        <div class="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-1 py-3">
                            <div class="flex flex-col ml-2">
                                <span class="text-xs font-medium uppercase text-slate-500">Duration</span>
                                <span class="text-sm font-semibold text-slate-800">${pkg.duration || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-1 py-3">
                            <div class="flex flex-col ml-2">
                                <span class="text-xs font-medium uppercase text-slate-500">Altitude</span>
                                <span class="text-sm font-semibold text-slate-800">${pkg.highestAltitude || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-1 flex-col gap-5 px-4 py-4">
                        <div class="space-y-3">
                            <h3 class="text-2xl font-bold text-slate-900">${title}</h3>
                            <p class="text-sm leading-6 text-slate-600 line-clamp-3">${description}</p>
                        </div>
                        <div class="mt-auto grid grid-cols-2 gap-3">
                            <a href="/${pkg.slug}" class="inline-flex items-center justify-center rounded-l-full rounded-r-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 hover:bg-[#d5e880]">View</a>
                            <a href="/booking?price=${price}&id=${pkg._id}&name=${pkg.packageName}" class="inline-flex items-center justify-center rounded-l-2xl rounded-r-full bg-[#d5e880] py-3 text-sm font-semibold text-slate-900">Book</a>
                        </div>
                    </div>
                </div>
            `;
        // });
              }
    } catch (error) {
        console.error("Error fetching packages:", error);
        console.warn("Failed to load packages. Please check the API endpoint and data structure.");
    }
}
