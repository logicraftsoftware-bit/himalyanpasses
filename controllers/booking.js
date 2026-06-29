async function submitBookingData(
  packageId,
  price,
  packageName,
  fromDate,
  toDate,
) {
  const payBtn = document.getElementById("step4");

  if (!payBtn) {
    console.error("Pay button not found");
    return;
  }
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login to book a package!");
    return;
  }

  if (fromDate && toDate) {
    document.getElementById("from-date").value = fromDate;
    document.getElementById("to-date").value = toDate;
  }

  payBtn.addEventListener("click", async () => {
    // 🔥 Step 1 data
    const fullName =
      document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const contactNumber =
      document.getElementById("phone").value;
    const groupType =
      document.getElementById("group-type").value;
    const numberOfPeople = document.getElementById(
      "participantCount",
    ).value;
    const fromDate =
      document.getElementById("from-date").value;
    const toDate = document.getElementById("to-date").value;
    const address =
      document.getElementById("address").value;
    const GST = 1.05; // 5% GST
    if (
      !fullName ||
      !email ||
      !contactNumber ||
      !groupType ||
      !numberOfPeople ||
      !fromDate ||
      !toDate ||
      !address
    ) {
      alert("Please fill all required fields ❌");
      return;
    }
    // 🔥 Participants data
    const participants = [];
    const additionals = [];
    let addOnTotal = 0;
    document
      .querySelectorAll(".addon-checkbox:checked")
      .forEach((cb) => {
        const addonPrice = Number(cb.dataset.price);
        addOnTotal += addonPrice;

        additionals.push({
          additionalId: cb.id, // ✅ backend id
          name: cb.dataset.name, // ✅ addon name (important)
          price: addonPrice,
        });
      });

    console.log("Final Additionals:", additionals);
    const blocks = document.querySelectorAll(
      ".participant-block",
    );

    blocks.forEach((block) => {
      const name = block.querySelector(
        "#participantName",
      ).value;
      const email = block.querySelector(
        "#participantEmail",
      ).value;
      const phone = block.querySelector(
        "#participantPhone",
      ).value;

      participants.push({
        fullName: name,
        email: email,
        phone: phone,
      });
    });

   
    console.log("Total Addon Price:", addOnTotal);
    // 🔥 Final payload
    const baseAmount =
      Number(price) * Number(numberOfPeople);
    const total = (baseAmount + addOnTotal) * GST;
    const payload = {
      packageId: packageId,
      packageName: packageName,
      fullName: fullName,
      email: email,
      contactNumber: contactNumber,
      groupType: groupType,
      numberOfPeople: Number(numberOfPeople),
      fromDate: fromDate,
      toDate: toDate,
      address: address,
      gstPercent: 5,
      pricePerPerson: price,
      participants: participants,
      additionals: additionals,
      subtotal: baseAmount,
    };

    try {
       const endpoint = "/api/bookings";
        const url = API_CONFIG.getUrl(endpoint);
      const res = await fetch(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      console.log("✅ Response:", data);

      if (res.ok) {
        alert("Booking Successful ✅");
        window.location.href = "/thank-you"; // optional redirect
      } else {
        // alert("Booking Failed ❌");
        return Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: data.message || "Invalid input",
        });
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("Something went wrong!");
    }
  });
}

async function bookingHistory() {
  const token = localStorage.getItem("token");
  // const user = JSON.parse(localStorage.getItem("user"));
  // const userId = user.id;
  const bookingHistory = document.getElementById(
    "bookingHistory",
  );
  bookingHistory.innerHTML =
    "<tr></tr><td colspan='5'>Loading...</td></tr>";
  if (!token) {
    console.error("No token found. Please login.");
    return;
  }

  try {
     const endpoint = "/api/bookings/my-bookings";
        const url = API_CONFIG.getUrl(endpoint);
    const res = await fetch(
      url,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );



     
    const data = await res.json();
    console.log("Booking History:", data);
    bookingHistory.innerHTML = "";

      


    if (res.ok) {
      if (data.data.length === 0) {
        bookingHistory.innerHTML =
          "<tr><td colspan='5'>No bookings found.</td></tr>";
        return;
      } else {
        data.data.forEach((booking) => {
          const fromDate = new Date(booking.fromDate);
      const options = {
        year: "numeric",
        month: "short",
        day: "2-digit",
      };
      const formattedFromDate = fromDate.toLocaleDateString(
        "en-US",
        options,
      );

      
      const toDate = new Date(booking.toDate);
      const options2 = {
        year: "numeric",
        month: "short",
        day: "2-digit",
      };
      const formattedToDate = toDate.toLocaleDateString(
        "en-US",
        options2,
      );
     
          const row = document.createElement("tr"); 
          row.innerHTML = `
      

            <tr class="bg-[#f8faf7] rounded-2xl shadow-sm">
                                        <td class="px-4 py-4 plus-jakarta-sans text-slate-700 font-medium">#${booking._id}</td>
                                        <td class="px-4 py-4 plus-jakarta-sans text-slate-700">${booking.packageName}</td>
                                        <td class="px-4 py-4">
                                            <div class="flex flex-col gap-2 plus-jakarta-sans text-sm">

                                                <div class="inline-flex items-center gap-2 text-slate-700">
                                                    <svg xmlns="http://www.w3.org/2000/svg"
                                                        class="w-4 h-4 text-[#8aa43c]" fill="none" viewBox="0 0 24 24"
                                                        stroke="currentColor" stroke-width="2">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z" />
                                                    </svg>
                                                    <span class="font-semibold text-slate-900">From:</span>
                                                    <span>${formattedFromDate}</span>
                                                </div>

                                                <div class="inline-flex items-center gap-2 text-slate-700">
                                                    <svg xmlns="http://www.w3.org/2000/svg"
                                                        class="w-4 h-4 text-[#8aa43c]" fill="none" viewBox="0 0 24 24"
                                                        stroke="currentColor" stroke-width="2">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z" />
                                                    </svg>
                                                    <span class="font-semibold text-slate-900">To:</span>
                                                    <span>${formattedToDate}</span>
                                                </div>

                                            </div>
                                        </td>
                                        <td class="px-4 py-4">
                                            <div class="flex flex-col gap-2">

                                            
                                                <span
                                                    class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold plus-jakarta-sans bg-green-100 text-green-700 w-fit">
                                                   
                                                    <span class="w-2 h-2 rounded-full bg-green-500"></span>
                                                    Booking: ${booking.bookingStatus}
                                                </span>
                                                <span
                                                    class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold plus-jakarta-sans bg-yellow-100 text-yellow-700 w-fit">
                                                  
                                                    <span class="w-2 h-2 rounded-full bg-yellow-500"></span>

                                                    Payment: Pending
                                                </span>
                                            </div>
                                        </td>
                                        <td class="px-4 py-4">
                                            <div class="flex items-center gap-2">

                                                <button type="button" data-bookingId="${booking._id}"
                                                    class="openBookingModalBtn group inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-[#d5e880] hover:text-slate-900 hover:border-[#d5e880] transition-all duration-300 shadow-sm"
                                                    aria-label="View">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
                                                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>

                                                <a href="/invoice?bookingId=${booking._id}"><button type="button"
                                                    class="group inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-[#d5e880] hover:text-slate-900 hover:border-[#d5e880] transition-all duration-300 shadow-sm"
                                                    aria-label="Download">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
                                                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1" />
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            d="M12 4v12m0 0l-4-4m4 4l4-4" /></a>
                                                    </svg>
                                                </button>

                                            </div>
                                        </td>
                                    </tr>





            
          `;
          bookingHistory.appendChild(row);
        });
      }
    }else {
      bookingHistory.innerHTML =
        "<tr><td colspan='5'>Failed to load bookings.</td></tr>";
    }
  } catch (error) {
    console.error("❌ Error:", error);
    alert("Something went wrong!");
  }
}
