
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
        const scrollTop = window.scrollY;
        const docHeight =
            document.documentElement.scrollHeight - window.innerHeight;

        const scrollPercent = scrollTop / docHeight;
        const offset = circumference - (scrollPercent * circumference);

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

    scrollToTopBtn.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    window.addEventListener("scroll", updateScrollProgress);
    updateScrollProgress();
});