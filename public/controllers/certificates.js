async function loadCertificates() {
    try {
        // const url = API_CONFIG?.getUrl(API_CONFIG.ENDPOINTS.CERTIFICATES);
        const endpoint = API_CONFIG?.ENDPOINTS?.CERTIFICATES || "/api/certificates";
        const url = API_CONFIG.getUrl(endpoint);

        const response = await fetch(url);
        const data = await response.json();

        // console.log("Certificate API Response:", data);

        const wrapper = document.getElementById('certificateWrapper');
        if (!wrapper) return;

        wrapper.innerHTML = '';

        if (Array.isArray(data) && data.length > 0) {
            data.forEach(function (item) {

                const images = Array.isArray(item.imageUrls)
                    ? item.imageUrls
                    : [item.imageUrls];

                images.forEach(function (img) {

                    const slide = `
                        <div class="swiper-slide">
                            <button type="button" 
                                class="certificate-open block w-full bg-white rounded-lg border shadow-sm overflow-hidden" 
                                data-image="${img}">
                                
                                <img src="${img}" 
                                     class="w-full h-auto object-contain" 
                                     alt="Certificate Image">
                            </button>
                        </div>
                    `;

                    wrapper.insertAdjacentHTML('beforeend', slide);
                });
            });

            // if (typeof initSwiper === 'function') {
            //     initSwiper();
            // } else {
            //     console.warn("initSwiper function not found");
            // }

        } else {
            console.warn("No certificates found");
        }

    } catch (error) {
        console.error("Error fetching certificates:", error);
    }
}