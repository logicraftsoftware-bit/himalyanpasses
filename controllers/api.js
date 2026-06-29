(function () {
  // ================= GLOBAL =================
  let sliderData = [];
  let current = 0;
  let interval = null;
  let certificateSwiper = null;
  let swiperAssetsPromise = null;

  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === "true") {
          resolve();
          return;
        }
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => {
        script.dataset.loaded = "true";
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function loadStyleOnce(href) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`link[href="${href}"]`);
      if (existing) {
        resolve();
        return;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  function loadSwiperAssets() {
    if (!swiperAssetsPromise) {
      swiperAssetsPromise = Promise.all([
        loadStyleOnce("https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"),
        loadScriptOnce("https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js")
      ]);
    }

    return swiperAssetsPromise;
  }

  function runWhenIdle(callback, timeout = 2500) {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(callback, { timeout });
    } else {
      setTimeout(callback, Math.min(timeout, 1200));
    }
  }

  // ================= SLIDER =================
  async function loadSliders() {
    try {
      const endpoint = "/api/sliders";
      const url = API_CONFIG.getUrl(endpoint);

      const res = await fetch(url);
      const data = await res.json();

      const container = document.getElementById(
        "slider-container",
      );
      if (!container) return;

      const fallbackSlide = container.querySelector(".slide");
      sliderData = [];

      if (!Array.isArray(data)) return;

      // flatten all images
      data.forEach((item) => {
        console.log("Processing slider item:", item);
        if (!item.active || !item.imageUrls) return;

        item.imageUrls.forEach((url) => {
          sliderData.push({
            image: url,
            heading: item.heading || "",
            subType: item.subType || "",
            announcement: item.announcement || "",
            link: item.link || "#",
          });
        });
      });

      if (!sliderData.length) return;

      const createSlide = (item, i) => {
        if (i === 0 && fallbackSlide) {
          fallbackSlide.alt = item.heading || "Himalayan Passes";
          return;
        }

        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.heading || "Himalayan Passes";
        img.width = 1920;
        img.height = 900;
        img.decoding = "async";
        if (i === 0) {
          img.fetchPriority = "high";
        } else {
          img.loading = "lazy";
          img.fetchPriority = "low";
        }
        img.className =
          "slide absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 " +
          (i === 0 ? "opacity-100" : "opacity-0");

        container.appendChild(img);
      };

      createSlide(sliderData[0], 0);

      const loadDeferredSlides = () => {
        sliderData.slice(1).forEach((item, index) => {
          createSlide(item, index + 1);
        });
        startSlider();
      };

      runWhenIdle(loadDeferredSlides);

      current = 0;
      updateSliderText();
    } catch (err) {
      console.error("Slider error:", err);
    }
  }

  function updateSliderText() {
    if (!sliderData.length) return;

    const item = sliderData[current];

    const h = document.getElementById("slider-heading");
    if (h) h.innerText = item.heading;

    const s = document.getElementById("slider-subtype");
    if (s) s.innerText = item.subType;

    // const a1 = document.getElementById("slider-announcement-1");

    // if (a1) a1.innerText = item.announcement;

    // const a2 = document.getElementById("slider-announcement-2");
   
    // if (a2) a2.innerText = item.announcement;
    const bookBtn = document.getElementById("book-now-btn");
    if (bookBtn) bookBtn.href = item.link ? item.link : "#";
  }
  async function loadAnnouncement() {
    try {
      const endpoint = "/api/announcements";
      const url = API_CONFIG.getUrl(endpoint);
      const res = await fetch(url);
      const data = await res.json();
      // Process the announcement data as needed
      const a1 = document.getElementById(
        "announcement-heading",
      );
      if (a1) a1.innerHTML = data[0].heading;
     
      const a2 = document.getElementById(
        "announcement-content",
      );
      if (a2) a2.innerHTML = data[0].description;
     
    } catch (err) {
      console.error("Announcement error:", err);
    }
  }

  function startSlider() {
    const slides = document.querySelectorAll(".slide");
    if (!slides.length) return;

    if (interval) clearInterval(interval);

    interval = setInterval(() => {
      slides[current].classList.remove("opacity-100");
      slides[current].classList.add("opacity-0");

      current = (current + 1) % slides.length;

      slides[current].classList.remove("opacity-0");
      slides[current].classList.add("opacity-100");

      updateSliderText();
    }, 3000);
  }

  // ================= CERTIFICATES =================
  async function loadCertificates() {
    try {
      await loadSwiperAssets();

      const endpoint = "/api/certificates";
      const url = API_CONFIG.getUrl(endpoint);

      const res = await fetch(url);
      const data = await res.json();

      const wrapper = document.getElementById(
        "certificateWrapper",
      );
      if (!wrapper) return;

      wrapper.innerHTML = "";

      if (!Array.isArray(data)) return;

      data.forEach((item) => {
        if (!item.imageUrls) return;

        item.imageUrls.forEach((url) => {
          wrapper.insertAdjacentHTML(
            "beforeend",
            `
                        <div class="swiper-slide">
                            <button class="certificate-open w-full" data-img="${url}">
                                <img src="${url}" width="320" height="220" loading="lazy" decoding="async" class="w-full object-contain" />
                            </button>
                        </div>
                    `,
          );
        });
      });

      initSwiper();
    } catch (err) {
      console.error("Certificate error:", err);
    }
  }

  // ================= SWIPER =================
  function initSwiper() {
    if (typeof Swiper === "undefined") {
      console.error("Swiper not loaded");
      return;
    }

    if (certificateSwiper) {
      certificateSwiper.destroy(true, true);
    }

    certificateSwiper = new Swiper(".certificateSlider", {
      loop: false,
      spaceBetween: 24,
      navigation: {
        nextEl: ".certificate-next",
        prevEl: ".certificate-prev",
      },
      pagination: {
        el: ".certificate-pagination",
        clickable: true,
      },
      breakpoints: {
        0: { slidesPerView: 1 },
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 4 },
      },
    });
  }

  // ================= LIGHTBOX =================
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".certificate-open");
    if (btn) {
      const img = btn.getAttribute("data-img");

      const box = document.getElementById(
        "certificateLightbox",
      );
      const boxImg = document.getElementById(
        "certificateLightboxImage",
      );

      if (box && boxImg) {
        boxImg.src = img;
        box.classList.remove("hidden");
        box.classList.add("flex");
      }
      return;
    }

    if (e.target.id === "closeCertificateLightbox") {
      document
        .getElementById("certificateLightbox")
        .classList.add("hidden");
    }

    const box = document.getElementById(
      "certificateLightbox",
    );
    if (box && e.target === box) {
      box.classList.add("hidden");
    }
  });

  // ================= INIT =================
  function initHomeApi() {
    loadSliders();
    loadAnnouncement();
    runWhenIdle(loadCertificates);
    runWhenIdle(() => loadScriptOnce("https://elfsightcdn.com/platform.js"), 4500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHomeApi, { once: true });
  } else {
    initHomeApi();
  }
})();
