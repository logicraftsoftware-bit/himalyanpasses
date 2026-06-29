let allGroupedData = {};
async function loadGroupedData() {
      const endpoint =`/api/packages/grouped-data`;

    const url =API_CONFIG.getUrl(endpoint);
    const response = await fetch(url);

    const data = await response.json();

    allGroupedData = data;
    console.log("Grouped Data:", allGroupedData);
    renderSeason(data.bySeason);
    renderMonth(data.byMonth);
    renderDuration(data.byDuration);
    renderDifficulty(data.byDifficulty);
    renderRegion(data.byRegion);
}



function renderSeason(seasons) {

    const seasonList = document.getElementById("tourSeasonList");

    seasonList.innerHTML = "";

    Object.keys(seasons).forEach((seasonName) => {

        seasonList.innerHTML += `
            <li>
                <a href="/listing?type=season&value=${encodeURIComponent(seasonName)}"
                   class="hover:text-red-500 transition-colors">
                   ${seasonName}
                </a>
            </li>
        `;
    });
}



function renderMonth(months) {

    const monthList = document.getElementById("tourMonthList");

    monthList.innerHTML = "";

    Object.keys(months).forEach((monthName) => {

        monthList.innerHTML += `
            <a href="/listing?type=month&value=${encodeURIComponent(monthName)}"
               class="hover:text-red-500 transition-colors">
               ${monthName}
            </a>
        `;
    });
}



function renderDifficulty(difficulties) {

    const difficultyList = document.getElementById("tourDifficultyList");

    difficultyList.innerHTML = "";

    Object.keys(difficulties).forEach((difficultyName) => {

        difficultyList.innerHTML += `
            <li>
                <a href="/listing?type=difficulty&value=${encodeURIComponent(difficultyName)}"
                   class="hover:text-red-500 transition-colors">
                   ${difficultyName}
                </a>
            </li>
        `;
    });
}






function renderDuration(durations) {

    const durationList = document.getElementById("tourDurationList");

    durationList.innerHTML = "";

    Object.keys(durations).forEach((durationName) => {

        durationList.innerHTML += `
            <li>
                <a href="/listing?type=duration&value=${encodeURIComponent(durationName)}"
                   class="hover:text-red-500 transition-colors">
                   ${durationName}
                </a>
            </li>
        `;
    });
}






function renderRegion(regions) {

    const regionList = document.getElementById("tourRegionList");

    regionList.innerHTML = "";

    Object.keys(regions).forEach((regionName) => {

        regionList.innerHTML += `
            <li>
                <a href="/listing?type=region&value=${encodeURIComponent(regionName)}"
                   class="hover:text-red-500 transition-colors">
                   ${regionName}
                </a>
            </li>
        `;
    });
}





function renderPackages(packages) {

    const container = document.getElementById("packageContainer");

    container.innerHTML = "";

    packages.forEach((pkg) => {
        console.log("Rendering Package:", pkg);

        container.innerHTML += `
         
              <article
                        class="blog-card  h-full bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">

                        <!-- Image -->
                        <div class="overflow-hidden">
                            <img src="${pkg.gallery[0]?.url || './images/blog1.webp'}" width="420" height="260" loading="lazy" decoding="async" alt="blog1"
                                class="w-full h-60 object-cover group-hover:scale-105 transition duration-700">
                        </div>

                        <!-- Content -->
                        <div class="p-5 flex flex-col flex-1">

                            <!-- Meta (Updated) -->
                            <div class="flex flex-wrap items-center gap-3 plus-jakarta-sans mb-4">

                                <!-- Duration -->
                                <span
                                    class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d5e880]/20 text-[#6b7d22] text-xs font-semibold border border-[#d5e880]/30">
                                    ⏳ ${pkg.duration || 'N/A'}
                                </span>

                                <!-- Altitude -->
                                <span
                                    class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                                    🏔️ ${pkg.highestAltitude || 'N/A'}
                                </span>

                            </div>

                            <!-- Text Area Same Height -->
                            <div class="flex flex-col flex-1">
                                <h3
                                    class="text-xl font-semibold text-slate-900 leading-snug plus-jakarta-sans min-h-[50px]">
                                     ${pkg.packageName}
                                </h3>

                                <p class="text-slate-600 plus-jakarta-sans leading-7 text-sm mt-3 min-h-[84px]">
                                   ${pkg.shortDescription}
                                </p>
                            </div>

                            <!-- CTA -->
                            <div class="pt-4 mt-auto">
                                <a href="${pkg.slug ? `/${pkg.slug}` : '#'}"
                                    class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#d5e880] text-slate-900 text-sm font-semibold tracking-[1.5px] uppercase plus-jakarta-sans border border-[#d5e880] hover:bg-white hover:text-slate-900 hover:border-[#d5e880] transition-all duration-300 shadow-sm">
                                    <span>View & Book</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </a>
                            </div>

                        </div>
                    </article>
        `;
    });
}



async function loadFilteredPackages() {

    const params = new URLSearchParams(window.location.search);

    const type = params.get("type");
    const value = params.get("value");
     const endpoint =`/api/packages/grouped-data`;

    const url =API_CONFIG.getUrl(endpoint);
    const response = await fetch(url);

    const data = await response.json();

    let packages = [];

    if (type === "season") {
        packages = data.bySeason[value];
    }

    if (type === "month") {
        packages = data.byMonth[value];
    }

    if (type === "duration") {
        packages = data.byDuration[value];
    }

    if (type === "difficulty") {
        packages = data.byDifficulty[value];
    }

    if (type === "region") {
        packages = data.byRegion[value];
    }

    renderPackages(packages);
}

// loadFilteredPackages();
