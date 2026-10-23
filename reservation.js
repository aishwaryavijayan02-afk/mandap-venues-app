const venues = {
  "malabar-grand": {
    name: "Malabar Grand Auditorium & Convention Hall",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=160&h=160&q=80",
    imageAlt: "Malabar Grand Auditorium",
    price: 55000,
    hallSetup: "Central AC",
  },
  "grace-convention": {
    name: "Grace Convention Centre",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=160&h=160&q=80",
    imageAlt: "Grace Convention Centre",
    price: 45000,
    hallSetup: "Central AC",
  },
  "green-valley": {
    name: "Green Valley Auditorium & Lawn",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=160&h=160&q=80",
    imageAlt: "Green Valley Auditorium and Lawn",
    price: 32000,
    hallSetup: "AC Hall + Lawn",
  },
};

const params = new URLSearchParams(window.location.search);
const venueId = params.get("venue") ?? "grace-convention";
const venue = venues[venueId] ?? venues["grace-convention"];
const selectedDate = params.get("date") ?? "2025-11-12";
const priceFormat = new Intl.NumberFormat("en-IN");
const toast = document.querySelector("#toast");
let toastTimeout;
const contactName = sessionStorage.getItem("reservation-name");
const contactPhone = sessionStorage.getItem("reservation-phone");
if (contactName) document.querySelector("#customer-name").value = contactName;
if (contactPhone) document.querySelector("#customer-phone").value = contactPhone;
sessionStorage.removeItem("reservation-name");
sessionStorage.removeItem("reservation-phone");

function formatPrice(amount) {
  return `₹${priceFormat.format(amount)}`;
}

function formatEventDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "12 Nov 2025";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 2400);
}

function updatePaymentMethod() {
  const selected = document.querySelector('input[name="payment"]:checked');
  document.querySelectorAll(".payment-option").forEach((option) => {
    option.classList.toggle("selected", option.dataset.payment === selected.value);
  });
  const isUpi = selected.value === "upi";
  document.querySelector("#upi-selection").hidden = !isUpi;
}

document.title = `Reserve ${venue.name} — Mandap & Venues`;
document.querySelector("#selected-venue-image").src = venue.image;
document.querySelector("#selected-venue-image").alt = venue.imageAlt;
document.querySelector("#selected-venue-name").textContent = venue.name;
document.querySelector("#event-date-label").textContent = formatEventDate(selectedDate);
document.querySelector("#event-location-label").textContent = (params.get("location") ?? "Kannur, Kerala").split(",")[0];
document.querySelector("#guest-count").value = params.get("guests") ?? "500";
document.querySelector("#hall-setup").value = venue.hallSetup;
document.querySelector("#total-rent").textContent = formatPrice(venue.price);
document.querySelector("#balance-rent").textContent = formatPrice(Math.round(venue.price * 0.8));
document.querySelector("#advance-rent").textContent = formatPrice(Math.round(venue.price * 0.2));

const venueUrl = new URL("./venue.html", window.location.href);
venueUrl.searchParams.set("venue", venueId);
venueUrl.searchParams.set("date", selectedDate);
venueUrl.searchParams.set("location", params.get("location") ?? "Kannur, Kerala");
venueUrl.searchParams.set("guests", params.get("guests") ?? "500");
document.querySelector("#back-to-venue").href = venueUrl.href;
document.querySelector("#step-venue").href = venueUrl.href;
document.querySelector("#edit-venue-link").href = venueUrl.href;

document.querySelectorAll('input[name="payment"]').forEach((input) => {
  input.addEventListener("change", updatePaymentMethod);
});

document.querySelectorAll(".upi-app-button").forEach((button) => {
  button.addEventListener("click", () => {
    const currentApp = document.querySelector("#selected-upi-app").textContent;
    const apps = ["Google Pay (GPay)", "PhonePe", "Paytm", "BHIM UPI"];
    const nextApp = apps[(apps.indexOf(currentApp) + 1) % apps.length];
    document.querySelector("#selected-upi-app").textContent = nextApp;
    showToast(`${nextApp} selected for UPI`);
  });
});

document.querySelector("#reservation-form").addEventListener("submit", (event) => {
  event.preventDefault();
});

document.querySelector("#pay-confirm").addEventListener("click", () => {
  const form = document.querySelector("#reservation-form");
  if (!form.reportValidity()) {
    const firstInvalid = form.querySelector(":invalid");
    firstInvalid?.focus();
    showToast("Please complete the required contact and event details");
    return;
  }
  const formData = new FormData(document.querySelector("#reservation-form"));
  const requestId = `DEMO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const request = {
    id: requestId,
    venue: venue.name,
    venueId,
    date: selectedDate,
    location: params.get("location") ?? "Kannur, Kerala",
    guestCount: Number(formData.get("guests")),
    eventType: formData.get("eventType"),
    hallSetup: formData.get("hallSetup"),
    session: formData.get("session"),
    notes: formData.get("notes"),
    whatsapp: formData.has("whatsapp"),
    email: formData.get("email"),
    name: formData.get("name"),
    paymentMethod: formData.get("payment"),
    paymentApp: document.querySelector("#selected-upi-app").textContent,
    price: venue.price,
  };
  sessionStorage.setItem("demo-reservation-request", JSON.stringify(request));
  window.location.href = `./confirmation.html?request=${encodeURIComponent(requestId)}`;
});

document.querySelector("#share-reservation").addEventListener("click", async () => {
  const shareData = {
    title: `Reserve ${venue.name}`,
    text: `Review my reservation details for ${venue.name}.`,
    url: window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") showToast("Unable to share reservation details");
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(shareData.url);
    showToast("Reservation link copied");
  } catch {
    showToast("Use your browser address bar to share this reservation");
  }
});
