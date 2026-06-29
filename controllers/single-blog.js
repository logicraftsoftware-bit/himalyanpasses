function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

//For Single Blog Page
async function loadBlogDetails(slug) {
  try {
    const endpoint = "/api/blogs";
    const url = API_CONFIG.getUrl(endpoint);
    const response = await fetch(url + `/${slug}`);

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}`,
      );
    }
    const blogData = await response.json();
    // console.log("Fetched Blog Data:", blogData);

    const createdAt = new Date(blogData.createdAt);
    const options = {
      year: "numeric",
      month: "short",
      day: "2-digit",
    };
    const formattedDate = createdAt.toLocaleDateString(
      "en-US",
      options,
    );
    const cleanContent = blogData.content.replace(
      /&nbsp;/g,
      " ",
    );
    // const cleanContent = decodeHTML(blogData.content);
    const words = blogData.content
      .trim()
      .split(/\s+/).length;
    const read_time = Math.ceil(words / 200); // Assuming 200 words per minute

    const blogGrid = document.getElementById("blogGrid");
    blogGrid.innerHTML = "";
    const blogCategory =
      document.getElementById("blogCategory");
    blogCategory.innerHTML = "";
    if (blogData.category) {
      blogData.category.forEach((category) => {
        const categoryLink = `
        
         <a
                    href="/category/${encodeURIComponent(category.slug)}"
                    class="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-50 hover:bg-[#d5e880]/20 transition"
                  >
                    <span class="text-slate-700">${category.name}</span>
                  </a>`;

        blogCategory.innerHTML += categoryLink + " ";
      });
    }

    const metaTitle = document.getElementById("metaTitle");

    metaTitle.innerText =
      blogData.metaTitle ||
      "Glacier Treks & Adventure Blog";

    document
      .querySelector('meta[name="description"]')
      .setAttribute(
        "content",
        blogData.metaDescription || "",
      );

    document
      .querySelector('meta[name="keywords"]')
      .setAttribute("content", blogData.metaKeywords || "");

    if (blogGrid) {
      const tagsHTML = blogData.tags
        ? blogData.tags
            .map(
              (tag) =>
                `<span class="tag-item">${tag}</span>`,
            )
            .join("")
        : "";

      blogGrid.innerHTML = `
                     <article class="xl:col-span-8" >

                    <!-- Featured Image -->
                    <div class="overflow-hidden rounded-[30px] mb-8 shadow-sm border border-slate-200">
                        <img src="${blogData.thumbnail.url || "./images/blog1.webp"}" alt="Blog Cover"
                            class="w-full h-[260px] sm:h-[380px] md:h-[500px] object-cover">
                    </div>

                    <!-- Meta -->
                    <div class="flex flex-wrap items-center gap-4 mb-6 plus-jakarta-sans">
                        <span
                            class="inline-flex items-center px-3 py-1 rounded-full bg-[#d5e880]/20 text-[#6b7d22] text-xs font-semibold tracking-wide uppercase border border-[#d5e880]/30">
                            Featured Article
                        </span>

                        <span class="inline-flex items-center gap-2 text-slate-500 text-sm font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-[#8aa43c]" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z" />
                            </svg>
                            ${formattedDate || "N/A"}
                        </span>

                        <span class="inline-flex items-center gap-2 text-slate-500 text-sm font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-[#8aa43c]" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ${read_time || "2"} Min Read
                        </span>
                    </div>

                    <!-- Title -->
                    <h1 class="gloock-regular text-3xl md:text-5xl leading-tight text-slate-900 mb-6">
                         ${blogData.heading || "No Title"}
                    </h1>

                    <div class="space-y-6 plus-jakarta-sans text-slate-700 text-base md:text-lg leading-8 ">
                        ${cleanContent || ""}
                    </div>
                <!-- TAGS SECTION -->
                  <div class="mt-10">
                      <h3 class="text-lg font-semibold text-[#0F5C53] mb-3 plus-jakarta-sans">
                          Tagged
                      </h3>

                      <div class="flex flex-wrap gap-2">
                          
                          <!-- TAG ITEM -->
                         ${tagsHTML}

                      </div>
                  </div>
                </article>
                        
                    `;
    }
    console.log("Fetched Blog Data:", blogData);

    const socialLink =
      document.getElementById("socialLink");
    socialLink.innerHTML = "";
    const socialEndpoint = "/api/settings";
    const socialurl = API_CONFIG.getUrl(socialEndpoint);
    const socialresponse = await fetch(socialurl);
    if (!socialresponse.ok) {
      throw new Error(
        `HTTP error! status: ${socialresponse.status}`,
      );
    }
    const socialData = await socialresponse.json();
    console.log("socialresponse", socialData);
    socialLink.innerHTML = `
    <span class="plus-jakarta-sans text-sm font-semibold text-slate-900">Share:</span>

                            <a href="${socialData.socialLinks[0].url}" target="_blank"
                                class="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-[#d5e880] hover:text-slate-900 transition duration-300">
                                f
                            </a>
                            <a href="${socialData.socialLinks[1].url}" target="_blank"
                                class="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-[#d5e880] hover:text-slate-900 transition duration-300">
                                x
                            </a>
                            <a href="${socialData.socialLinks[2].url}" target="_blank"
                                class="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-[#d5e880] hover:text-slate-900 transition duration-300">
                                in
                            </a>`;
  } catch (error) {
    console.error("Error fetching blog details:", error);
  }
}

//recent blogs in single blog page
async function loadRecentBlogs(limit = 5) {
  try {
    const endpoint = "/api/blogs/recent/list?limit=" + limit;
    const url = API_CONFIG.getUrl(endpoint);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}`,
      );
    }
    const data = await response.json();
    const recentblog =
      document.getElementById("recentblog");

    recentblog.innerHTML = "";

    data.forEach((post) => {
      const createdAt = new Date(post.createdAt);
      const options = {
        year: "numeric",
        month: "short",
        day: "2-digit",
      };
      const formattedDate = createdAt.toLocaleDateString(
        "en-US",
        options,
      );

      const title = limitWords(post.heading, 8);

      recentblog.innerHTML += `
                     <a href="/blog/${post.slug}" class="group flex gap-4">
                                    <img src="${post.thumbnail.url || "./images/blog1.webp"}" alt="recent"
                                        class="w-20 h-20 rounded-2xl object-cover">
                                    <div>
                                        <h4
                                            class="text-slate-900 font-semibold plus-jakarta-sans leading-6 group-hover:text-[#6b7d22] transition">
                                           ${title || "No Title"}
                                        </h4>
                                        <p class="text-slate-500 text-sm plus-jakarta-sans mt-1">${formattedDate || "N/A"}</p>
                                    </div>
                                </a>
                   
            `;
    });
  } catch (error) {
    console.error("Error fetching About Us data:", error);
  }
}
