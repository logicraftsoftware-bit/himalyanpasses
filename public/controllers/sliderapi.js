var sliderData = [];
var current = 0;
var interval = null;

async function loadSliders() {
    try {

        const url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.SLIDERS);

        const response = await fetch(url);

        const data = await response.json();

        sliderData = data.filter(function (item) {
            return item.active === true ; 
        });


        if (sliderData.length === 0) {
            console.warn("No active sliders found.");
            return;
        }

        const container = document.getElementById("slider-container");

        if (!container) {
            console.error("Slider container not found.");
            return;
        }

        container.innerHTML = "";

        sliderData.forEach(function (item, i) {
            let imageUrl = "";

            if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
                imageUrl = item.imageUrls[0];
            } else if (item.imageUrls) {
                imageUrl = item.imageUrls;
            } else if (item.image) {
                imageUrl = item.image;
            }

            if (!imageUrl) return;

            const img = document.createElement("img");
            img.src = imageUrl;
            img.alt = item.title || "Slider Image";
            img.className =
                "slide absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 " +
                (i === 0 ? "opacity-100" : "opacity-0");

            container.appendChild(img);
        });

        current = 0;
        startSlider();

    } catch (error) {
        console.error("Error loading slider:", error);
    }
}

function startSlider() {
    const slides = document.querySelectorAll(".slide");

    if (slides.length === 0) return;

    if (interval) clearInterval(interval);

    interval = setInterval(function () {
        slides[current].classList.remove("opacity-100");
        slides[current].classList.add("opacity-0");

        current = (current + 1) % slides.length;

        slides[current].classList.remove("opacity-0");
        slides[current].classList.add("opacity-100");
    }, 3000);
}

document.addEventListener("DOMContentLoaded", function () {
    loadSliders();
});