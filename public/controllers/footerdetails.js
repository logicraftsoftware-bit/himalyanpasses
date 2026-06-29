// ================= SETTINGS =================
async function loadSettings() {
    const facebookIcon = document.getElementById("facebookIcon");
    const instragramIcon = document.getElementById("instragramIcon");
    const youtbeIcon = document.getElementById("youtbeIcon");
    try {
        const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.SETTINGS));

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        // console.log("Settings:", data);

        if (!data) return;

        // Example usage (customize based on your API)

        // Logo
        if (data.logo) {
            const logo = document.getElementById('siteLogo');
            if (logo) logo.src = data.logo;
        }

        // Phone (footer)
        if (data.contactNumber) {
            // For old usage
            document.querySelectorAll('.site-phone').forEach(el => {
                el.textContent = data.contactNumber;
            });
            // For footer
            const phone = document.getElementById('contact-phone');
            if (phone) {
                phone.innerText = data.contactNumber;
                phone.href = `tel:${data.contactNumber}`;
            }
        }

        // Email (footer)
        if (data.emailId) {
            document.querySelectorAll('.site-email').forEach(el => {
                el.textContent = data.emailId;
            });
            const email = document.getElementById('contact-email');
            if (email) {
                email.textContent = data.emailId;
                email.href = `mailto:${data.emailId}`;
            }
        }

        // Address (footer)
        if (data.address) {
            const addr = document.getElementById('siteAddress');
            if (addr) addr.textContent = data.address;
            const contactAddr = document.getElementById('contact-address');
            if (contactAddr) contactAddr.textContent = data.address;
        }

        // WhatsApp (footer)
        if (data.whatsappNumber) {
            const whatsapp = document.getElementById('contact-whatsapp');
            if (whatsapp) {
                whatsapp.href = `https://wa.me/${data.whatsappNumber}`;
            }
        }
        //const whatsapp = document.getElementById('contact-whatsapp');
        //whatsapp.href = "https://wa.me/919999999999";
        // console.log("facebookIcon:", facebookIcon); // debug
        // console.log("instragramIcon:", instragramIcon); // debug
        // console.log("youtbeIcon:", youtbeIcon); // debug

        if (data.socialLinks) {
            data.socialLinks.forEach((link) => {
                const platform = link.platform.toLowerCase();

                if (platform.includes("facebook") && facebookIcon) {
                    facebookIcon.href = link.url;
                    facebookIcon.target = "_blank";
                }

                if (platform.includes("instagram") && instragramIcon) {
                    instragramIcon.href = link.url;
                    instragramIcon.target = "_blank";
                }

                if (platform.includes("you tube") && youtbeIcon) {
                    youtbeIcon.href = link.url;
                    youtbeIcon.target = "_blank";
                }
            });
        }

    } catch (error) {
        console.error("Error loading settings:", error);
    }
}

async function footerCategoryList() {
  const footerCategory = document.getElementById(
    "footerCategory",
  );

  footerCategory.innerHTML = "";

  try {
    const endpoint = "/api/categories";
    const url = API_CONFIG.getUrl(endpoint);

    const response = await fetch(url);
    const trekCategories = await response.json();

    trekCategories.forEach((category, index) => {
      if (category.showInFooter == true) {
        const isActive = index === 0;
        const href = `/${category.slug}`;
        const html = `<a href="${href}" class=" ${isActive ? "active-tab" : ""}  hover:text-[#d5e880]   hover:after:w-full text-sm md:text-md  font-semibold">${category.name}</a>`;
        footerCategory.insertAdjacentHTML("beforeend", html);
        // const button = document.createElement("button");
        // button.type = "button";
        // button.className = `pricing-tab ${isActive ? "active-tab" : ""} whitespace-nowrap text-sm md:text-md px-5 py-3 rounded-full border font-semibold`;
        // button.setAttribute("data-id", category._id);
        // button.innerText = category.name;

        // button.addEventListener("click", () => {
        //   document
        //     .querySelectorAll(".pricing-tab")
        //     .forEach((btn) =>
        //       btn.classList.remove("active-tab"),
        //     );
        //   button.classList.add("active-tab");

        //   fetchPackagesByCategory(category._id);
        // });

        // footerCategory.appendChild(button);
      }
    });

    if (trekCategories.length > 0) {
      fetchPackagesByCategory(trekCategories[0]._id);
    }
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

async function footerUpcomingDropdown(){
     try {
   const endpoint = "/api/more-treks";
    const url = API_CONFIG.getUrl(endpoint);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    // console.log("upcoming", data);

    
    const footerUpcomingTrekDropDown = document.getElementById(
      "footerUpcomingTrekDropDown",
    );
 
    footerUpcomingTrekDropDown.innerHTML='';
 data.data.forEach((item) => {
    item.packages.forEach((packagesData)=>{
        const link=`<a href="/${packagesData.slug}" 
                                    class="block px-4 py-3 text-slate-700 hover:bg-[#d5e880]/20">
                                    ${limitWords(packagesData.packageName,2)}
                                    </a>`;
        
         if(item.type== "Upcoming"){
            footerUpcomingTrekDropDown.innerHTML +=link;
         }
    })
    
    
    });
  } catch (error) {
    console.error("Error fetching Upcoming data:", error);
  }

}



// back to top button script
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




