function toggleBtn() {
  const loginBtn = document.getElementById("login-btn");
  const looutBtn = document.getElementById("logout-btn");

  const isLoggedIn = localStorage.getItem("loggedIn");
  // console.log("Login status:", isLoggedIn);

  if (isLoggedIn === "true") {
    console.log("Welcome back! You are logged in.");
    // alert("Welcome back! You are logged in.");
    loginBtn.classList.add("hidden");
    looutBtn.classList.remove("hidden");
  } else {
    console.log(
      "You are not logged in. Please sign in to access your account.",
    );
    // alert("You are not logged in. Please sign in to access your account.");
    loginBtn.classList.remove("hidden");
    looutBtn.classList.add("hidden");
  }
}

async function loadCategory() {
  try {
    const endpoint = "/api/categories";
    const url = API_CONFIG.getUrl(endpoint);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    // console.log("Categories:", data);

    const trekkingDropdown = document.getElementById(
      "trekkingDropdown",
    );
    const tourDropdown =
      document.getElementById("tourDropdown");
    const expeditionDropdown = document.getElementById(
      "expeditionDropdown",
    );

    //mobile dropdown
    const mobileTrekkingDropdown = document.getElementById(
      "mobileTrekkingDropdown",
    );
    const mobileTourDropdown =
      document.getElementById("mobileTourDropdown");
    const mobileExpeditionDropdown = document.getElementById(
      "mobileExpeditionDropdown",
    );
    
    trekkingDropdown.innerHTML = "";
    tourDropdown.innerHTML = "";
    expeditionDropdown.innerHTML = "";

    //mobile dropdown
    mobileTrekkingDropdown.innerHTML = "";
    mobileTourDropdown.innerHTML = "";
    mobileExpeditionDropdown.innerHTML = "";

    data.forEach((item) => {
      let pageLink = "";

      // ✅ page decide based on type
      if (item.categoryType === "Trek") {
        pageLink = "/trek";
      }

      if (item.categoryType === "Tour") {
        pageLink = "/single-tour";
      }

      if (item.categoryType === "Expedition") {
        pageLink = "/trek";
      }

      const link = `
                                    <a href="/${item.slug}" 
                                    class="block px-4 py-3 text-slate-700 hover:bg-[#d5e880]/20">
                                    ${item.name}
                                    </a>
                                `;
      const mobilelink = `
                                    <a href="/${item.slug}" 
                                    class="block text-slate-700 text-sm font-semibold">
                                    ${item.name}
                                    </a>
                                `;

      // ✅ condition per category
      if (item.categoryType === "Trek") {
        trekkingDropdown.innerHTML += link;
        mobileTrekkingDropdown.innerHTML += mobilelink;
      }

      if (item.categoryType === "Tour") {
        tourDropdown.innerHTML += link;
        mobileTourDropdown.innerHTML += mobilelink;
      }

      if (item.categoryType === "Expedition") {
        expeditionDropdown.innerHTML += link;
        mobileExpeditionDropdown.innerHTML += mobilelink;
      }
    });
  } catch (error) {
    console.error("Error fetching About Us data:", error);
  }
}

async function upcomingdropdown(){
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

    
    const upcomingTrekDropDown = document.getElementById(
      "upcomingTrekDropDown",
    );
    const mobileupcomingTrekDropDown = document.getElementById(
      "mobileupcomingTrekDropDown",
    );
    upcomingTrekDropDown.innerHTML='';
    mobileupcomingTrekDropDown.innerHTML='';
 data.data.forEach((item) => {
    item.packages.forEach((packagesData)=>{
        const link=`<a href="/${packagesData.slug}" 
                                    class="block px-4 py-3 text-slate-700 hover:bg-[#d5e880]/20">
                                    ${limitWords(packagesData.packageName,2)}
                                    </a>`;
        const mobilelink=`<a href="/${packagesData.slug}" 
                                    class="block text-slate-700 text-sm font-semibold">
                                    ${limitWords(packagesData.packageName,2)}
                                    </a>`;
         if(item.type== "Upcoming"){
            upcomingTrekDropDown.innerHTML +=link;
            mobileupcomingTrekDropDown.innerHTML +=mobilelink;
         }
    })
    
    
    });
  } catch (error) {
    console.error("Error fetching Upcoming data:", error);
  }

}


async function loadAboutusToggle() {

  const aboutUsToggle = document.getElementById(
    "aboutusDropdown"
  );
  //mobile dropdown 
  const mobileAboutUsDropdown = document.getElementById(
    "mobileAboutUsDropdown"
  );

  if (!aboutUsToggle || !mobileAboutUsDropdown) {
    console.error("Dropdown element not found");
    return;
  }
  mobileAboutUsDropdown.innerHTML = "";
  aboutUsToggle.innerHTML = "";

  try {
    const endpoint = "/api/about-us-sections";
    const url = API_CONFIG.getUrl(endpoint);

    const response = await fetch(url);

    const data = await response.json();

    // console.log(data);

    data.forEach((item) => {

      const link = `
        <a href="/whychoose?slug=${item.slug}" 
           class="block px-4 py-3 text-slate-700 hover:bg-[#d5e880]/20">
           ${item.pageName}
        </a>
      `;
      const mobilelink = `
        <a href="/whychoose?slug=${item.slug}" 
           class="block text-slate-700 text-sm font-semibold">
           ${item.pageName}
        </a>
      `;

      aboutUsToggle.innerHTML += link;
      mobileAboutUsDropdown.innerHTML += mobilelink;

    });

  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("submit", function (e) {
  if (e.target.id === "enquiryForm") {
    e.preventDefault();

    const form = e.target;

    const data = {
      fullName: form.name.value,
      contactNumber: form.phone.value,
      email: form.email.value,
      numberOfPerson: form.numberOfPersons.value,
      message: form.message.value,
    };

    // console.log("Sending:", data);
    const endpoint =
      (typeof API_CONFIG !== "undefined" && API_CONFIG?.ENDPOINTS?.ENQUIRIES) || "/api/enquiries";
     const url = API_CONFIG.getUrl(endpoint);

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    .then(res => res.json())
    .then(res => {
      // console.log(res);
      alert("Submitted ✅");
      form.reset();
    })
    .catch(err => console.error(err));
  }
});
