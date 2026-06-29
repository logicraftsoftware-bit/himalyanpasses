async function loadFaqs() {
    try {
        // const endpoint = API_CONFIG.ENDPOINTS.FAQS;

         const endpoint = API_CONFIG?.ENDPOINTS?.FAQS || "/api/faqs";
         

        if (!endpoint) {
            console.error("FAQ endpoint NOT FOUND in API_CONFIG");
            return;
        }

        // const url = API_CONFIG.getUrl(endpoint);
        const url = API_CONFIG.getUrl(endpoint);
        // console.log("Fetching FAQs:", url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("HTTP error: " + response.status);
        }

        // ✅ SAFE PARSE (fixes <!DOCTYPE error)
        const text = await response.text();

        // console.log("RAW FAQ RESPONSE:", text);

        if (text.startsWith("<")) {
            console.error("❌ API returned HTML instead of JSON. Check URL:", url);
            return;
        }

        const data = JSON.parse(text);
        // console.log("Parsed FAQ Data:", data);

        const container = document.getElementById('faq-container');

        if (!container) {
            console.error("faq-container NOT FOUND");
            return;
        }

        container.innerHTML = '';

        if (!Array.isArray(data)) {
            console.error("Invalid FAQ data format");
            return;
        }

        data.forEach(item => {

            if (!item.isActive) return;

            const html = `
                <div class="faq-item bg-white border border-slate-200 rounded-2xl p-5 pl-6 transition-all duration-300">
                    
                    <button class="faq-question flex justify-between items-center w-full text-left">
                        <h3 class="text-lg md:text-[24px] font-semibold text-slate-900 w-[90%]">
                            ${item.question}
                        </h3>

                        <span class="faq-icon-wrapper w-[25px] h-[25px] rounded-full bg-[#f1f6d8] flex items-center justify-center">
                            <svg class="faq-icon w-[15px] h-[15px] text-[#8aa43c] transition-transform duration-300" fill="none"
                                stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14"/>
                            </svg>
                        </span>
                    </button>

                    <div class="faq-answer max-h-0 overflow-hidden transition-all duration-300">
                        <p class="pt-4 text-slate-600 text-[16px]">
                            ${item.answer.replace(/\\n/g, "<br>")}
                        </p>
                    </div>
                </div>
            `;

            container.insertAdjacentHTML('beforeend', html);
        });

        // ✅ Apply toggle AFTER rendering
        initFaqToggle();

    } catch (error) {
        console.error("FAQ ERROR:", error);
    }
}

