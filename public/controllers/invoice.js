 // Fetch site details and populate the invoice
async function populateSiteDetails() {
    try {
        const endpoint = "/api/settings";
        const url = API_CONFIG.getUrl(endpoint);
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch site details");
        }

        const userDetails = await response.json();

        // Populate invoice fields
        document.getElementById("address").innerText = userDetails.address ? userDetails.address : "Yuksom Bazar Main Road Near Hotel Yangri Gang, West Sikkim, Pin no - 737113";
        document.getElementById("phone").innerText = userDetails.contactNumber ? userDetails.contactNumber : "+91 7407248200";
        document.getElementById("email").innerText = userDetails.emailId ? userDetails.emailId : "kiran.yuksom@gmail.com";
        document.getElementById("bottom_email").innerText = userDetails.emailId ? userDetails.emailId : "kiran.yuksom@gmail.com";


    } catch (error) {
        console.error("Error fetching User data:", error);
    }
}




async function populateInvoiceDetails(bookingId) {
    // Here you can fetch and populate other invoice details like client info, invoice items, etc.
    try {
        const endpoint = `/api/bookings/${bookingId}`;
        const url = API_CONFIG.getUrl(endpoint);
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch invoice details");
        }
        const bookingDetails = await response.json();
        const data = bookingDetails.data;

        const additionals = data.additionals ? data.additionals : [];
        additionals.forEach((item, index) => {
            const row = document.createElement("tr");
            row.classList.add("total-bg");
            row.innerHTML = `
                <td colspan="3" class="right"><strong>${item.name}</strong></td>
                <td class="center">₹${item.price}</td>
            `;
            // Insert the additional item row before the subtotal row
            const subtotalRow = document.getElementById("subtotal").closest("tr");
            subtotalRow.parentNode.insertBefore(row, subtotalRow);
        });

        const createdAt = new Date(data.createdAt);
        const options = { year: "numeric", month: "short", day: "2-digit" };
        const formattedDate = createdAt.toLocaleDateString(
            "en-US",
            options,
        );

        // console.log("Fetched Booking Details:", bookingDetails);
        // Populate invoice fields with booking details
        document.getElementById("client-name").innerText = data.fullName ? data.fullName : "Client Name";
        document.getElementById("client-email").innerText = data.email ? data.email : "Client Email";
        document.getElementById("client-phone").innerText = data.contactNumber ? data.contactNumber : "+91 XXXXX XXXXX";
        document.getElementById("invoice-number").innerText = data._id ? "#"+data._id : "INV-001"; // Assuming booking ID is used as invoice number
        document.getElementById("invoice-date").innerText = formattedDate ? formattedDate : "N/A";
        document.getElementById("packageName").innerText = data.packageName ? data.packageName : "Package Name";
        document.getElementById("numberOfPeople").innerText = data.numberOfPeople ? data.numberOfPeople : "1";
        document.getElementById("price").innerText = data.pricePerPerson ? "₹" + data.pricePerPerson.toLocaleString("en-IN") : "₹0";
        document.getElementById("total").innerText = data.pricePerPerson * data.numberOfPeople ? "₹" + (data.pricePerPerson * data.numberOfPeople).toLocaleString("en-IN") : "₹0";
        document.getElementById("subtotal").innerText = data.subtotal ? "₹" + data.subtotal.toLocaleString("en-IN") : "₹0";
        document.getElementById("taxLabel").innerText = data.gstPercent? "Tax (" + data.gstPercent + "%)" : "Tax (0%)";
        document.getElementById("gst").innerText = data.gstAmount ? "₹" + data.gstAmount.toLocaleString("en-IN") : "₹0";
        document.getElementById("totalAmount").innerText = data.totalAmount ? "₹" + data.totalAmount.toLocaleString("en-IN") : "₹0";
    } catch (error) {
        console.error("Error fetching invoice details:", error);
    }
}
 
//
async function viewInvoiceDetails(bookingId) {
      try {

          const endpoint = `/api/bookings/${bookingId}`;
          const url = API_CONFIG.getUrl(endpoint);
          const response = await fetch(url, {
              method: "GET",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
          });
          if (!response.ok) {
              throw new Error("Failed to fetch invoice details");
          }
          const data = await response.json();
          const bookingData = data.data;

          console.log("API Response:", bookingData);


          console.log("Booking Data:", bookingData);
          if (bookingData) {
              // Populate Customer Info
              document.getElementById("client-name").innerText = bookingData.fullName || "Client Name";
              document.getElementById("client-email").innerText = bookingData.email || "Client Email";
              document.getElementById("client-phone").innerText = bookingData.contactNumber || "+91 XXXXX XXXXX";
              document.getElementById("client-address").innerText = bookingData.address || "N/A";

              // Populate Package Info
              document.getElementById("package-name").innerText = bookingData.packageName || "Package Name";
              document.getElementById("package-group").innerText = bookingData.groupType ? `Group: ${bookingData.groupType}` : "Group: N/A";
              document.getElementById("package-people").innerText = bookingData.numberOfPeople ? `People: ${bookingData.numberOfPeople}` : "People: N/A";

              const fromDate = bookingData.fromDate ? new Date(bookingData.fromDate) : null;
              const toDate = bookingData.toDate ? new Date(bookingData.toDate) : null;
              const options = { day: '2-digit', month: 'short', year: 'numeric' };

              document.getElementById("package-from").innerText = fromDate ? `From: ${fromDate.toLocaleDateString('en-US', options)}` : "From: N/A";
              document.getElementById("package-to").innerText = toDate ? `To: ${toDate.toLocaleDateString('en-US', options)}` : "To: N/A";

              // Populate Financials
              const perPersonPrice = bookingData.pricePerPerson.toLocaleString("en-IN") || 0;
              const numberOfPeople = bookingData.numberOfPeople || 0;
              const subtotal = bookingData.subtotal ? bookingData.subtotal.toLocaleString("en-IN") : "₹0";
              const gstAmount = bookingData.gstAmount.toLocaleString("en-IN") || 0; // Assuming GST is 5%
              const totalAmount = bookingData.totalAmount.toLocaleString("en-IN") || 0;

              document.getElementById("per-person-price").innerText = `Per Person: ₹${perPersonPrice}`;
              document.getElementById("subtotal").innerText = `Subtotal: ₹${subtotal}`;
              document.getElementById("gst-amount").innerText = `GST (5%): ₹${gstAmount}`;
              document.getElementById("total-amount").innerText = `Total: ₹${totalAmount}`;
              const participantsContainer = document.getElementById("participantsContainer");
              participantsContainer.innerHTML = ""; // Clear previous participants
              if (bookingData.participants && bookingData.participants.length > 0) {
                  bookingData.participants.forEach((participant, index) => {
                      const participantDiv = document.createElement("div");
                      participantDiv.classList.add("rounded-2xl", "border", "border-slate-200", "bg-slate-50", "px-4", "py-4");

                      participantDiv.innerHTML = `
                          <h5 class="plus-jakarta-sans font-semibold text-slate-900 mb-2">
                              ${index + 1}. ${participant.fullName || "Participant Name"}
                          </h5>
                          <div class="flex flex-wrap items-center gap-4 plus-jakarta-sans text-sm text-slate-600">
                              <span class="inline-flex items-center gap-2">
                                  <span>📞</span>
                                  <span>${participant.phone || "+91 XXXXX XXXXX"}</span>
                              </span>
                              <span class="inline-flex items-center gap-2">
                                  <span>✉️</span>
                                  <span>${participant.email || "Email"}</span>
                              </span>
                          </div>
                      `;
                      participantsContainer.appendChild(participantDiv);
                  });
              }
          }
      } catch (error) {
          console.error("Error populating invoice details:", error);
      }
  }
   