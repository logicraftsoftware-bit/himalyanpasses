
// faq script
const faqItems = document.querySelectorAll(".faq-item");

if (faqItems.length) {
    faqItems.forEach((item) => {
        const question = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");
        const icon = item.querySelector(".faq-icon");
        const iconWrapper = item.querySelector(".faq-icon-wrapper");

        if (question && answer && icon && iconWrapper) {
            question.addEventListener("click", () => {
                const isOpen = answer.style.maxHeight && answer.style.maxHeight !== "0px";

                faqItems.forEach((faq) => {
                    faq.classList.remove("border-l-4", "border-l-[#8aa43c]", "shadow-lg", "bg-[#fbfdf4]");

                    const faqAnswer = faq.querySelector(".faq-answer");
                    const faqIcon = faq.querySelector(".faq-icon");
                    const faqIconWrapper = faq.querySelector(".faq-icon-wrapper");

                    if (faqAnswer) faqAnswer.style.maxHeight = null;
                    if (faqIcon) faqIcon.classList.remove("rotate-45");
                    if (faqIconWrapper) {
                        faqIconWrapper.classList.remove("bg-[#d5e880]");
                        faqIconWrapper.classList.add("bg-[#f1f6d8]");
                    }
                });

                if (!isOpen) {
                    answer.style.maxHeight = answer.scrollHeight + "px";
                    item.classList.add("border-l-4", "border-l-[#8aa43c]", "shadow-lg", "bg-[#fbfdf4]");
                    icon.classList.add("rotate-45");
                    iconWrapper.classList.remove("bg-[#f1f6d8]");
                    iconWrapper.classList.add("bg-[#d5e880]");
                }
            });
        }
    });
}

// google review slider
if (document.querySelector(".googleReviewSlider")) {
    new Swiper(".googleReviewSlider", {
        loop: true,
        speed: 800,
        spaceBetween: 24,
        autoplay: {
            delay: 2500,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".google-review-next",
            prevEl: ".google-review-prev",
        },
        pagination: {
            el: ".google-review-pagination",
            clickable: true,
        },
        breakpoints: {
            0: { slidesPerView: 1 },
            640: { slidesPerView: 1.2 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
        },
    });
}

// package slider
if (document.querySelector(".packageSlider")) {
    new Swiper(".packageSlider", {
        loop: true,
        spaceBetween: 24,
        speed: 800,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        breakpoints: {
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
        },
    });
}

// click select packages pages
const packageCards = document.querySelectorAll(".package-card");

if (packageCards.length) {
    packageCards.forEach((card) => {
        card.addEventListener("click", () => {
            packageCards.forEach((item) => item.classList.remove("active-package"));
            card.classList.add("active-package");
        });
    });
}

// about us slider
const aboutSlides = document.querySelectorAll(".about-slide");
const aboutDots = document.querySelectorAll(".about-dot");
let aboutCurrent = 0;

if (aboutSlides.length && aboutDots.length) {
    function showAboutSlide(index) {
        aboutSlides.forEach((slide, i) => {
            slide.classList.toggle("opacity-100", i === index);
            slide.classList.toggle("opacity-0", i !== index);
        });

        aboutDots.forEach((dot, i) => {
            dot.classList.toggle("bg-white", i === index);
            dot.classList.toggle("bg-white/50", i !== index);
        });
    }

    function nextAboutSlide() {
        aboutCurrent = (aboutCurrent + 1) % aboutSlides.length;
        showAboutSlide(aboutCurrent);
    }

    aboutDots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            aboutCurrent = index;
            showAboutSlide(aboutCurrent);
        });
    });

    showAboutSlide(aboutCurrent);
    setInterval(nextAboutSlide, 3500);
}

// upcoming content script
document.addEventListener("DOMContentLoaded", function () {
    const upcomingBtn = document.getElementById("upcomingBtn");
    const trendingBtn = document.getElementById("trendingBtn");
    const upcomingContent = document.getElementById("upcomingContent");
    const trendingContent = document.getElementById("trendingContent");

    upcomingBtn.addEventListener("click", function () {
        upcomingContent.classList.remove("hidden");
        trendingContent.classList.add("hidden");

        upcomingBtn.classList.remove("bg-white", "text-slate-700");
        upcomingBtn.classList.add("bg-[#d5e880]", "text-slate-900", "shadow-md");

        trendingBtn.classList.remove("bg-[#d5e880]", "text-slate-900", "shadow-md");
        trendingBtn.classList.add("bg-white", "text-slate-700");
    });

    trendingBtn.addEventListener("click", function () {
        trendingContent.classList.remove("hidden");
        upcomingContent.classList.add("hidden");

        trendingBtn.classList.remove("bg-white", "text-slate-700");
        trendingBtn.classList.add("bg-[#d5e880]", "text-slate-900", "shadow-md");

        upcomingBtn.classList.remove("bg-[#d5e880]", "text-slate-900", "shadow-md");
        upcomingBtn.classList.add("bg-white", "text-slate-700");
    });
});

// hero slider
const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");
let currentSlide = 0;

if (slides.length && dots.length) {
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle("opacity-100", i === index);
            slide.classList.toggle("opacity-0", i !== index);
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle("bg-[#d5e880]", i === index);
            dot.classList.toggle("bg-white/50", i !== index);
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });

    showSlide(currentSlide);
    setInterval(nextSlide, 4000);
}

// read more and read less script
const readMoreBtn = document.getElementById("readMoreBtn");
const moreContent = document.getElementById("moreContent");
const btnText = document.getElementById("btnText");
const btnArrow = document.getElementById("btnArrow");

if (readMoreBtn && moreContent && btnText && btnArrow) {
    readMoreBtn.addEventListener("click", function () {
        moreContent.classList.toggle("hidden");

        if (moreContent.classList.contains("hidden")) {
            btnText.textContent = "Read More";
            btnArrow.textContent = "→";
        } else {
            btnText.textContent = "Read Less";
            btnArrow.textContent = "↑";
        }
    });
}

// affortable packages script

const pricingTabs = document.querySelectorAll(".pricing-tab");
const pricingContents = document.querySelectorAll(".pricing-content");

pricingTabs.forEach(tab => {
    tab.addEventListener("click", function () {
        const target = this.getAttribute("data-tab");

        pricingContents.forEach(content => {
            content.classList.add("hidden");
        });

        pricingTabs.forEach(btn => {
            btn.classList.remove("bg-[#d5e880]", "text-slate-900", "border-[#d5e880]", "shadow-md");
            btn.classList.add("bg-white", "text-slate-700", "border-slate-200");
        });

        document.getElementById(target).classList.remove("hidden");

        this.classList.remove("bg-white", "text-slate-700", "border-slate-200");
        this.classList.add("bg-[#d5e880]", "text-slate-900", "border-[#d5e880]", "shadow-md");
    });
});

// account section
const accountTabs = document.querySelectorAll(".account-tab");
const accountContents = document.querySelectorAll(".account-content");

accountTabs.forEach(tab => {
    tab.addEventListener("click", function () {
        const target = this.getAttribute("data-tab");

        accountContents.forEach(content => {
            content.classList.add("hidden");
        });

        accountTabs.forEach(btn => {
            btn.classList.remove("bg-[#d5e880]", "text-slate-900", "border-[#d5e880]", "shadow-sm");
            btn.classList.add("bg-white", "text-slate-700", "border-slate-200");
        });

        document.getElementById(target).classList.remove("hidden");

        this.classList.remove("bg-white", "text-slate-700", "border-slate-200");
        this.classList.add("bg-[#d5e880]", "text-slate-900", "border-[#d5e880]", "shadow-sm");
    });
});

// modal for accout details booker

document.addEventListener("click", function (e) {
    const modal = document.getElementById("bookingModal");
    const overlay = document.getElementById("bookingModalOverlay");
    const modalBox = document.getElementById("bookingModalBox");

    if (!modal || !overlay || !modalBox) return;

    if (e.target.closest(".openBookingModalBtn")) {
        modal.classList.remove("opacity-0", "invisible");
        overlay.classList.remove("opacity-0", "invisible");
        modalBox.classList.remove("scale-95");
        modalBox.classList.add("scale-100");
        document.body.classList.add("overflow-hidden");
    }

    if (e.target.closest("#closeBookingModal") || e.target.id === "bookingModalOverlay") {
        modal.classList.add("opacity-0", "invisible");
        overlay.classList.add("opacity-0", "invisible");
        modalBox.classList.add("scale-95");
        modalBox.classList.remove("scale-100");
        document.body.classList.remove("overflow-hidden");
    }
});

// Mobile Menubar Script
document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        const dropdowns = document.querySelectorAll(".mobile-dropdown");

        dropdowns.forEach((dropdown) => {
            const btn = dropdown.querySelector(".dropdown-btn");

            btn.addEventListener("click", () => {
                dropdowns.forEach((item) => {
                    if (item !== dropdown) {
                        item.classList.remove("active");
                    }
                });

                dropdown.classList.toggle("active");
            });
        });
    }, 500);
});

// New Mobile Menubar Script
document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        const dropdowns = document.querySelectorAll(".mobile-dropdown");

        dropdowns.forEach((dropdown) => {
            const btn = dropdown.querySelector(".dropdown-btn");
            const arrow = dropdown.querySelector(".arrow");

            btn.addEventListener("click", () => {

                dropdowns.forEach((item) => {
                    if (item !== dropdown) {
                        item.classList.remove("active");

                        const otherArrow = item.querySelector(".arrow");
                        if (otherArrow) {
                            otherArrow.textContent = "+";
                        }
                    }
                });

                dropdown.classList.toggle("active");

                if (dropdown.classList.contains("active")) {
                    arrow.textContent = "✕"; // Cross icon
                } else {
                    arrow.textContent = "+"; // Plus icon
                }
            });
        });
    }, 500);
});

// back to top script
window.addEventListener("load", function () {
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");
    const progressCircle = document.getElementById("progressCircle");

    if (!scrollToTopBtn || !progressCircle) {
        console.error("Back to top button not found");
        return;
    }

    const radius = 52;
    const circumference = 2 * Math.PI * radius;

    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = circumference;

    function updateScrollProgress() {
        const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;

        const docHeight =
            document.documentElement.scrollHeight - window.innerHeight;

        const scrollPercent =
            docHeight > 0 ? scrollTop / docHeight : 0;

        const offset =
            circumference - scrollPercent * circumference;

        progressCircle.style.strokeDashoffset = offset;

        if (scrollTop > 300) {
            scrollToTopBtn.classList.remove(
                "opacity-0",
                "invisible",
                "translate-y-4"
            );
            scrollToTopBtn.classList.add(
                "opacity-100",
                "visible",
                "translate-y-0"
            );
        } else {
            scrollToTopBtn.classList.add(
                "opacity-0",
                "invisible",
                "translate-y-4"
            );
            scrollToTopBtn.classList.remove(
                "opacity-100",
                "visible",
                "translate-y-0"
            );
        }
    }

    function scrollTopAction(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    /* desktop */
    scrollToTopBtn.addEventListener(
        "click",
        scrollTopAction
    );

    /* mobile */
    scrollToTopBtn.addEventListener(
        "touchstart",
        scrollTopAction,
        { passive: false }
    );

    window.addEventListener(
        "scroll",
        updateScrollProgress
    );

    updateScrollProgress();
});


