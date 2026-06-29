// Simple About Section Slider Logic
function initAboutSlider() {
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
async function loadAboutUs() {
    try {
        const endpoint = API_CONFIG?.ENDPOINTS?.ABOUT || "/api/about-us";
        const url = API_CONFIG.getUrl(endpoint);

        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        // Heading
        document.getElementById("aboutHeading").innerText =
            data.heading || "Glacier Treks And Adventure";

        // Elements
        const readMoreBtn = document.getElementById("readMoreBtn");
        const aboutContent = document.getElementById("aboutContent");
        const btnText = document.getElementById("btnText");

        // Content
        const fullContent = data.content || "N/A";

        // Remove &nbsp;
        // const cleanContent = fullContent;
        const cleanContent = fullContent
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
        // const cleanContent = fullContent.replace(/&nbsp;/g, " ");

        // Split words
        const words = cleanContent.split(" ");

        // Short text
        const shortContent = words.slice(0, 60).join(" ");

        // Reset
        aboutContent.innerHTML = "";
        readMoreBtn.classList.add("hidden");

        // Toggle logic
        if (words.length > 60) {
            aboutContent.innerHTML = shortContent + "...";

            readMoreBtn.classList.remove("hidden");

            let expanded = false;

            readMoreBtn.onclick = function () {
                if (!expanded) {
                    aboutContent.innerHTML = cleanContent;
                    btnText.innerText = "Read Less";
                    expanded = true;
                } else {
                    aboutContent.innerHTML = shortContent + "...";
                    btnText.innerText = "Read More";
                    expanded = false;
                }
            };
        } else {
            aboutContent.innerHTML = cleanContent;
        }

        // More Content
        const moreContentDiv = document.getElementById("moreContent");

        moreContentDiv.innerHTML = Array.isArray(data.moreContent)
            ? data.moreContent
                  .map(
                      (p) => `
                <p class="plus-jakarta-sans text-base md:text-lg leading-8 text-slate-600 mt-4">
                    ${p}
                </p>
            `
                  )
                  .join("")
            : "";

        // Images
        const sliderContainer = document.getElementById(
            "aboutSliderContainer"
        );

        let images =
            Array.isArray(data.images) && data.images.length > 0
                ? data.images
                : [{ url: "./images/about-us1.webp" }];

        if (sliderContainer) {
            sliderContainer.innerHTML = `
                ${images
                    .map(
                        (img, index) => `
                    <img 
                        src="${img.url}" 
                        alt="About Image ${index + 1}"
                        class="about-slide absolute inset-0 w-full h-full object-cover z-0 ${
                            index === 0 ? "opacity-100" : "opacity-0"
                        } transition-opacity duration-1000"
                    >
                `
                    )
                    .join("")}

                <div class="absolute inset-0 bg-black/20 z-10"></div>

                <div class="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-20 gap-3">
                    ${images
                        .map(
                            (_, index) => `
                        <button class="about-dot w-3 h-3 rounded-full ${
                            index === 0 ? "bg-white" : "bg-white/50"
                        }"></button>
                    `
                        )
                        .join("")}
                </div>
            `;

            initAboutSlider();
        }
    } catch (err) {
        console.error("Error loading About Us:", err);
    }
}
// async function loadAboutUs() {
//     try {
//         const endpoint = API_CONFIG?.ENDPOINTS?.ABOUT || "/api/about-us";
//         const url = API_CONFIG.getUrl(endpoint);
//         // console.log("Fetching About Us from:", url);

//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

//         const data = await res.json();
//         // console.log("About Us Data:", data);

//         document.getElementById("aboutHeading").innerText = data.heading || "Glacier Treks And Adventure";
   
//         // const cleanContent = data.content ? data.content.replace(/&nbsp;/g, " ") : "";
//         const readMoreBtn =
//       document.getElementById("readMoreBtn");

//        const aboutContent= document.getElementById("aboutContent");
//               const fullContent =
//         data.content? data.content:
//         "N/A";
//     //    const aboutContent= document.getElementById("aboutContent");
//     //           const fullContent =
//     //     data.content?.replace(/&nbsp;/g, " ") ||
//     //     "N/A";

//       // 👉 words split
//       const words = fullContent.split(" ");
//       const shortContent = words.slice(0, 60).join(" ");

//       // clear old
//       aboutContent.innerHTML = "";
//       readMoreBtn.classList.add("hidden");

//       if (words.length > 40) {
//         aboutContent.innerHTML = shortContent + "...";
//         readMoreBtn.classList.remove("hidden");

//         let expanded = false;

//         readMoreBtn.onclick = () => {
//           if (!expanded) {
//             aboutContent.innerHTML = fullContent;
//             readMoreBtn.innerText = "Read Less";
//             expanded = true;
//           } else {
//             aboutContent.innerHTML = shortContent + "...";
//             readMoreBtn.innerText = "Read More";
//             expanded = false;
//           }
//         };
//          } else {
//         aboutContent.innerHTML = fullContent;
//       }





        


//         const moreContentDiv = document.getElementById("moreContent");
//         moreContentDiv.innerHTML = Array.isArray(data.moreContent)
//             ? data.moreContent.map(p => `<p class="plus-jakarta-sans text-base md:text-lg leading-8 text-slate-600 mt-4">${p}</p>`).join("")
//             : "";

//         const sliderContainer = document.getElementById("aboutSliderContainer");
//         let images = Array.isArray(data.images) && data.images.length > 0 ? data.images : [
//             { url: "./images/about-us1.webp" }
//         ];
//         if (sliderContainer) {
//             sliderContainer.innerHTML = `
//                 ${images.map((img, index) => `
//                     <img 
//                         src="${img.url}" 
//                         alt="About Image ${index + 1}"
//                         class="about-slide absolute inset-0 w-full h-full object-cover z-0 ${index === 0 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000"
//                     >
//                 `).join("")}

//                 <div class="absolute inset-0 bg-black/20 z-10"></div>

//                 <div class="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-20 gap-3">
//                     ${images.map((_, index) => `
//                         <button class="about-dot w-3 h-3 rounded-full ${index === 0 ? 'bg-white' : 'bg-white/50'}"></button>
//                     `).join("")}
//                 </div>
//             `;
//             initAboutSlider();
//         }

//     } catch (err) {
//         console.error("Error loading About Us:", err);
//     }
// }