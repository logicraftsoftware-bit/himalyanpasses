


// Simple About Section Slider Logic
function initAboutSliderSection() {
    const slides = document.querySelectorAll('.about-slide');
    const dots = document.querySelectorAll('.about-dot');
    let current = 0;
    if (!slides.length || !dots.length) return;

    function showSlide(idx) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('opacity-100', i === idx);
            slide.classList.toggle('opacity-0', i !== idx);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('bg-white', i === idx);
            dot.classList.toggle('bg-white/50', i !== idx);
        });
        current = idx;
    }

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => showSlide(idx));
    });

    // Optional: auto-slide every 4 seconds
    let interval = setInterval(() => {
        let next = (current + 1) % slides.length;
        showSlide(next);
    }, 4000);

    // Pause on hover
    slides.forEach(slide => {
        slide.addEventListener('mouseenter', () => clearInterval(interval));
        slide.addEventListener('mouseleave', () => {
            interval = setInterval(() => {
                let next = (current + 1) % slides.length;
                showSlide(next);
            }, 4000);
        });
    });

    showSlide(0);
}
async function loadAboutUsSection() {
    try {
        const endpoint = API_CONFIG?.ENDPOINTS?.ABOUT || "/api/about-us";
        const url = API_CONFIG.getUrl(endpoint);
        // console.log("Fetching About Us from:", url);

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        console.log("About Us Data:", data);

        document.getElementById("aboutHeading").innerText = data.heading || "Glacier Treks And Adventure";
   
        const cleanContent = data.content ? data.content : "";
        // const cleanContent = data.content ? data.content.replace(/&nbsp;/g, " ") : "";
        document.getElementById("aboutContent").innerHTML = cleanContent;

        const moreContentDiv = document.getElementById("moreContent");
        moreContentDiv.innerHTML = Array.isArray(data.moreContent)
            ? data.moreContent.map(p => `<p class="plus-jakarta-sans text-base md:text-lg leading-8 text-slate-600 mt-4">${p}</p>`).join("")
            : "";

        const sliderContainer = document.getElementById("aboutSliderContainerSection");
        let images = Array.isArray(data.images) && data.images.length > 0 ? data.images : [
            { url: "./images/about-us1.webp" }
        ];
        if (sliderContainer) {
            sliderContainer.innerHTML = `
                ${images.map((img, index) => `
                    <img 
                        src="${img.url}" 
                        alt="About Image ${index + 1}"
                        class="about-slide absolute inset-0 w-full h-full object-cover z-0 ${index === 0 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000"
                    >
                `).join("")}

                <div class="absolute inset-0 bg-black/20 z-10"></div>

                <div class="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-20 gap-3">
                    ${images.map((_, index) => `
                        <button class="about-dot w-3 h-3 rounded-full ${index === 0 ? 'bg-white' : 'bg-white/50'}"></button>
                    `).join("")}
                </div>
            `;
            initAboutSliderSection();
        }



        // =========================
        // HIGHLIGHTS
        // =========================
        const highlightsContainer = document.getElementById("highlightsContainer");
        highlightsContainer.innerHTML = "";

        data.highlights?.forEach((item, index) => {
            const rotate = index % 2 === 0 ? "hover:rotate-[-2deg]" : "hover:rotate-[2deg]";

            highlightsContainer.innerHTML += `
                <div class="group bg-white border border-[#d5e880] rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:bg-[#d5e880] hover:-translate-y-2 ${rotate} hover:shadow-2xl transition-all duration-500">

                    <div class="w-16 h-16 rounded-2xl bg-[#f7fbdf] group-hover:bg-white flex items-center justify-center">
                        <img src="${item.iconUrl}" 
                             class="w-8 h-8 object-contain group-hover:rotate-[12deg]"
                             onerror="this.onerror=null;this.src='./images/about-icon.png'">
                    </div>

                    <h3 class="gloock-regular text-2xl md:text-3xl font-semibold text-slate-900">
                        ${item.subheading}
                    </h3>

                    <p class="plus-jakarta-sans text-base md:text-lg text-slate-700">
                        ${item.text}
                    </p>
                </div>
            `;
        });


        
        // =========================
        // MISSION & VISION
        // =========================
        const missionVisionContainer = document.getElementById("missionVisionContainer");
        missionVisionContainer.innerHTML='';
          
        data.missionVision.forEach((result)=>{
            missionVisionCard=`
            <div
                    class="group relative overflow-hidden bg-white border border-[#e7eddc] rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">

                    <!-- soft top shape -->
                    <div
                        class="absolute top-0 right-0 w-36 h-36 bg-[#d5e880]/10 rounded-full blur-3xl opacity-70 group-hover:scale-125 transition duration-500">
                    </div>

                    <div class="relative z-10 flex items-center gap-4 mb-6">
                        <div
                            class="w-16 h-16 rounded-2xl bg-[#d5e880]/20 flex items-center justify-center group-hover:bg-[#d5e880]/30 transition duration-300 shadow-sm">
                            <img src="${result.iconUrl}" alt="Our Mission" class="w-8 h-8 object-contain">
                        </div>
                        <div>
                            <p class="plus-jakarta-sans text-sm font-semibold tracking-[2px] uppercase text-[#6b7d22]">
                                Glacier Treks
                            </p>
                            <h3 class="gloock-regular text-2xl md:text-3xl text-slate-900">
                               ${result.heading}
                            </h3>
                        </div>
                    </div>

                    <div class="relative z-10 space-y-4">
                        <p class="plus-jakarta-sans text-base md:text-lg leading-8 text-slate-600">
                             ${result.text}
                        </p>

                        
                    </div>
                </div>`;

            missionVisionContainer.innerHTML +=missionVisionCard;


        })

    } catch (err) {
        console.error("Error loading About Us:", err);
    }
}
