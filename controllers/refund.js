        async function loadRefundPolicy() {

            const container = document.getElementById("refundContent");
            let response;

            if (!container) return;


            try {
                const endpoint = API_CONFIG?.ENDPOINTS?.TERMS || "/api/policies";
                const url = API_CONFIG.getUrl(endpoint);
                response = await fetch(url);
                if (!response.ok) throw new Error("Primary failed");
            } catch (err) {
                console.warn("Fallback API used");
            }

            const data = await response.json();


            if (!Array.isArray(data)) {
                container.innerHTML = "<p>No data found.</p>";
                return;
            }

            // ✅ Filter ONLY terms
            const terms = data.find(item => item.type === "refund");

            if (!terms) {
                container.innerHTML = "<p>Refund Policy not available.</p>";
                return;
            }
            const cleanContent = terms.content ? terms.content.replace(/&nbsp;/gi, " ") : "";

            container.innerHTML = cleanContent || "<p>Refund Policy content not available.</p>";


        }
