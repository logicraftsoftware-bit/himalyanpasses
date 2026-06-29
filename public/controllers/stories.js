async function loadStories() {
  try {
  
        
    const endpoint =
      (typeof API_CONFIG !== "undefined" && API_CONFIG?.ENDPOINTS?.STORIES) || "/api/customer-stories";
     const url = API_CONFIG.getUrl(endpoint);

    const response = await fetch(url);
    const data = await response.json();

    const container = document.getElementById(
      "stories-container",
    );
    container.innerHTML = "";

    data.forEach((item) => {
      const videoId = extractYouTubeId(item.youtubeLink);

      if (!videoId) return;

      const html = `
                <div class="w-[85%] sm:w-1/2 md:w-full flex-shrink-0 md:flex-shrink bg-white rounded-2xl shadow-md hover:shadow-lg transition">
                    <div class="aspect-video">
                        <iframe class="w-full h-full"
                            src="https://www.youtube.com/embed/${videoId}"
                            frameborder="0"
                            allowfullscreen>
                        </iframe>
                    </div>
                    <div class="p-3">
                        <h3 class="text-base font-semibold line-clamp-1">${item.title || ""}</h3>
                        <p class="text-gray-600 mt-1 text-xs line-clamp-2">${item.description || ""}</p>
                    </div>
                </div>
            `;
      container.insertAdjacentHTML("beforeend", html);
    });
  } catch (error) {
    console.error(error);
  }
}

// ✅ STRONG YOUTUBE FIX (IMPORTANT)
function extractYouTubeId(url) {
  if (!url) return "";

  const match = url.match(
    /(?:v=|youtu\.be\/|embed\/)([^&\n?#]+)/,
  );
  return match ? match[1] : "";
}
