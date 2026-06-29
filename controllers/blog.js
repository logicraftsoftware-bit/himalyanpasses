//Load All Blogs
async function loadBlogs(page = 1) {
  try {
    // const endpoint = API_CONFIG?.ENDPOINTS?.BLOGS || "/api/blogs";
    const endpoint = `/api/blogs?page=${page}&limit=12`;
    const url = API_CONFIG.getUrl(endpoint);
    const response = await fetch(url);
    // console.log("Fetch Response:", response);
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}`,
      );
    }
    const data = await response.json();
    console.log("Fetched Blogs Data:", data.blogs);
    const blogGrid = document.getElementById("blogGrid");
    blogGrid.innerHTML = "";
    data.blogs.forEach((blog) => {
      //   const blogCategories = blog.category;
      //   blogCategories.forEach(category => {
      //     console.log("Blog Category:", category.name);
      // const categoryLink = `<a href="/blog?category=${encodeURIComponent(category)}" class="text-sm text-slate-500 hover:text-slate-900 transition-colors duration-300">${category}</a>`;
      // allCategory.innerHTML += categoryLink + " ";
      //   });
      //   console.log("Blog Category:", blogCategories);
      if (!blog.active) {
        return; // Skip this blog if it's not active
      }
      const createdAt = new Date(blog.publishDate);
      const options = {
        year: "numeric",
        month: "short",
        day: "2-digit",
      };
      const formattedDate = createdAt.toLocaleDateString(
        "en-US",
        options,
      );
      const words = blog.content.trim().split(/\s+/).length;
      const readTimes = Math.ceil(words / 200);
      //   console.log("Read Time:", readTimes, "minutes");
      const title = limitWords(blog.heading, 8);
      const description = limitWords(
        blog.metaDescription,
        15,
      );
      const card = `
<article class="w-[75%] sm:w-[55%] md:w-auto flex-shrink-0 snap-start blog-card h-full bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">

    <!-- Image -->
    <div class="overflow-hidden">
        <img src="${blog.thumbnail.url || "./images/blog1.webp"}" width="420" height="260" loading="lazy" decoding="async"
             class="w-full h-44 sm:h-52 md:h-60 object-cover group-hover:scale-105 transition duration-700">
    </div>

    <!-- Content -->
    <div class="p-5 flex flex-col flex-1">

        <!-- Meta -->
        <div class="flex items-center gap-3 text-slate-500 text-sm mb-4">
            <span>${formattedDate || "N/A"}</span>
            <span>•</span>
            <span>${readTimes || "2 "} min</span>
        </div>

        <!-- Text -->
        <div class="flex flex-col flex-1">
            <h3 class="text-xl font-semibold text-slate-900 leading-snug min-h-[72px]">
                ${title || "No Title"}
            </h3>

            <p class="text-slate-600 leading-7 text-sm mt-3 min-h-[84px]">
                ${description || ""}
            </p>
        </div>

        <!-- Button -->
        <div class="pt-4 mt-auto">
            <a href="/blog/${blog.slug}" 
               class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#d5e880] text-slate-900 text-sm font-semibold uppercase border hover:bg-white transition-all duration-300">
                Read Article →
            </a>
        </div>

    </div>
</article>
`;

      blogGrid.innerHTML += card;
    });

    loadLimitedBlog(1);
    renderPagination(data.pages, data.page);
  } catch (error) {
    console.error("Error fetching blogs data:", error);
  }
}
async function loadBlogCategories() {
  const params = new URLSearchParams(
    window.location.search,
  );
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const currentSlug =
    params.get("slug") ||
    (pathParts[0] === "category" ? pathParts[1] : null);
  try {
    const endpoint = `/api/blog-categories`;
    const url = API_CONFIG.getUrl(endpoint);
    const response = await fetch(url);
    // console.log("Fetch Response:", response);
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}`,
      );
    }
    const categories = await response.json();
    console.log("Fetched Categories Data:", categories);
    const allCategory =
      document.getElementById("allCategory");
    allCategory.innerHTML = "";
    categories.forEach((category) => {
      const isActive =
        category.slug === currentSlug ? "active" : "";
      const categoryLink = `<a href="/category/${encodeURIComponent(category.slug)}" >
     
     <div  class="category-card ${isActive}"> ${category.name}
        </div></a>`;
      allCategory.innerHTML += categoryLink + " ";
    });

    // categorySelect.innerHTML = `<option value="">All Categories</option>`;
    // data.categories.forEach((category) => {
    //   const option = `<option value="${category.name}">${category.name}</option>`;
    //   categorySelect.innerHTML += option;
    // });
  } catch (error) {
    console.error("Error fetching categories data:", error);
  }
}
// function handleCategoryChange() {
//       const categorySelect = document.getElementById("categorySelect");
//       const category = categorySelect.value;
//       loadBlogs(1, category);
// }

async function loadCategoriesBlogs(slug) {
  try {
    // const endpoint = API_CONFIG?.ENDPOINTS?.BLOGS || "/api/blogs";
    const endpoint = `/api/blogs/category/${slug || "all"}`;
    const url = API_CONFIG.getUrl(endpoint);
    const response = await fetch(url);
    // console.log("Fetch Response:", response);
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}`,
      );
    }
    const data = await response.json();
    console.log("Fetched category wise Blogs Data:", data);
    const blogGrid = document.getElementById("blogGrid");
    blogGrid.innerHTML = "";
    data.blogs.forEach((blog) => {
      if (!blog.active) {
        return; // Skip this blog if it's not active
      }
      const createdAt = new Date(blog.publishDate);
      const options = {
        year: "numeric",
        month: "short",
        day: "2-digit",
      };
      const formattedDate = createdAt.toLocaleDateString(
        "en-US",
        options,
      );
      const words = blog.content.trim().split(/\s+/).length;
      const readTimes = Math.ceil(words / 200);
      const title = limitWords(blog.heading, 8);
      const description = limitWords(
        blog.metaDescription,
        15,
      );
      const card = `
<article class="w-[75%] sm:w-[55%] md:w-auto flex-shrink-0 snap-start blog-card h-full bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">

    <!-- Image -->
    <div class="overflow-hidden">
        <img src="${blog.thumbnail.url || "./images/blog1.webp"}" width="420" height="260" loading="lazy" decoding="async"
             class="w-full h-44 sm:h-52 md:h-60 object-cover group-hover:scale-105 transition duration-700">
    </div>

    <!-- Content -->
    <div class="p-5 flex flex-col flex-1">

        <!-- Meta -->
        <div class="flex items-center gap-3 text-slate-500 text-sm mb-4">
            <span>${formattedDate || "N/A"}</span>
            <span>•</span>
            <span>${readTimes || "2 "} min</span>
        </div>

        <!-- Text -->
        <div class="flex flex-col flex-1">
            <h3 class="text-xl font-semibold text-slate-900 leading-snug min-h-[72px]">
                ${title || "No Title"}
            </h3>

            <p class="text-slate-600 leading-7 text-sm mt-3 min-h-[84px]">
                ${description || ""}
            </p>
        </div>

        <!-- Button -->
        <div class="pt-4 mt-auto">
            <a href="/blog/${blog.slug}" 
               class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#d5e880] text-slate-900 text-sm font-semibold uppercase border hover:bg-white transition-all duration-300">
                Read Article →
            </a>
        </div>

    </div>
</article>
`;

      blogGrid.innerHTML += card;
    });
    renderPagination(data.pages, data.page);
  } catch (error) {
    console.error("Error fetching blogs data:", error);
  }
}

async function loadLimitedBlog(limit) {
  try {
    // const endpoint = API_CONFIG?.ENDPOINTS?.BLOGS || "/api/blogs";
    const endpoint =
      "/api/blogs/recent/list?limit=" + limit;
    const url = API_CONFIG.getUrl(endpoint);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();

    // console.log("Limited Blogs:", data);
    const limitedBlog =
      document.getElementById("limitedBlog");
    limitedBlog.innerHTML = "";
    // ✅ EMPTY CHECK
    if (!Array.isArray(data) || data.length === 0) {
      limitedBlog.innerHTML = `
                        <div class="col-span-full text-center py-10">
                            <p class="text-slate-500 text-lg plus-jakarta-sans">
                                No Blogs Found 😢
                            </p>
                        </div>
                    `;
      return;
    }

    data.forEach((blog) => {
      if (!blog.active) {
        return; // Skip this blog if it's not active
      }
      const createdAt = new Date(blog.createdAt);
      const options = {
        year: "numeric",
        month: "short",
        day: "2-digit",
      };
      const formattedDate = createdAt.toLocaleDateString(
        "en-US",
        options,
      );
      const words = blog.content.trim().split(/\s+/).length;
      const readTimes = Math.ceil(words / 200);
      // console.log("Read Time:", readTimes, "minutes");
      const title = limitWords(blog.heading, 8);
      const description = limitWords(
        blog.metaDescription,
        15,
      );
      const card = `


                       <article class="group cursor-pointer">
                    <div class="relative overflow-hidden rounded-[32px] aspect-[16/10] mb-6">
                        <img src="${blog.thumbnail.url || "./images/blog1.webp"}" width="420" height="260" loading="lazy" decoding="async" alt="Article 1"
                            class="w-full h-full object-cover transition duration-700 group-hover:scale-110">
                        <div class="absolute top-4 left-4">
                            <span
                                class="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-sm">${formattedDate || "N/A"}</span>
                        </div>
                    </div>
                    <h4
                        class="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors gloock-regular leading-tight">
                        ${title || "No Title"}</h4>
                    <p class="text-slate-500 line-clamp-2 plus-jakarta-sans leading-relaxed mb-4">${description || ""}</p>
                    <a href="/blog/${blog.slug}"
                        class="text-slate-900 font-extrabold text-sm uppercase tracking-widest inline-flex items-center gap-2 group/link">
                        Read Full Article
                        <svg class="w-4 h-4 group-hover/link:translate-x-2 transition-transform" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </article>

            `;

      limitedBlog.innerHTML += card;
    });
  } catch (error) {
    console.error("Error fetching About Us data:", error);
  }
}
