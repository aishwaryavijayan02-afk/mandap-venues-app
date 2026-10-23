const params = new URLSearchParams(window.location.search);
const requestId = params.get("request");
const requestData = sessionStorage.getItem("demo-reservation-request");
const request = requestData ? JSON.parse(requestData) : null;
const toast = document.querySelector("#toast");
let toastTimeout;

const venues = {
  "malabar-grand": {
    name: "Malabar Grand Auditorium & Convention Hall",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=85",
  },
  "grace-convention": {
    name: "Grace Convention Centre",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=85",
  },
  "green-valley": {
    name: "Green Valley Auditorium & Lawn",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=85",
  },
};
const fallback = {
  id: requestId ?? "DEMO-PREVIEW",
  venue: "Grace Convention Centre",
  venueId: "grace-convention",
  date: "2025-11-12",
  location: "Kannur, Kerala",
  guestCount: 500,
  eventType: "Wedding & Reception",
  hallSetup: "Central AC",
  session: "full-day",
  price: 45000,
};
const reservation = request?.id === requestId ? request : fallback;
const venue = venues[reservation.venueId] ?? venues["grace-convention"];
const money = new Intl.NumberFormat("en-IN");

function formatPrice(value) {
  return `₹${money.format(value)}`;
}

function formatDate(value, options = { weekday: "long", day: "numeric", month: "short", year: "numeric" }) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Date to be confirmed";
  return new Intl.DateTimeFormat("en-GB", options).format(date);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 2200);
}

const sessionNames = {
  "full-day": "Full Day (8:00 AM–10:00 PM)",
  morning: "Morning (8:00 AM–2:00 PM)",
  evening: "Evening (4:00 PM–10:00 PM)",
};
const requestUrl = new URL("./reservation.html", window.location.href);
requestUrl.searchParams.set("venue", reservation.venueId);
requestUrl.searchParams.set("date", reservation.date);
requestUrl.searchParams.set("location", reservation.location);
requestUrl.searchParams.set("guests", String(reservation.guestCount));
document.querySelector("#back-to-reservation").href = requestUrl.href;

document.title = `Request Summary — ${venue.name}`;
document.querySelector("#receipt-venue-image").src = venue.image;
document.querySelector("#receipt-venue-image").alt = venue.name;
document.querySelector("#receipt-venue-name").textContent = reservation.venue ?? venue.name;
document.querySelector("#request-id").textContent = reservation.id;
document.querySelector("#event-date").textContent = formatDate(reservation.date);
document.querySelector("#event-session").textContent = sessionNames[reservation.session] ?? sessionNames["full-day"];
document.querySelector("#event-location").textContent = reservation.location;
document.querySelector("#event-setup").textContent = reservation.hallSetup ?? "Venue team to confirm setup";
document.querySelector("#event-guests").textContent = `${reservation.eventType ?? "Event"} · ${Number(reservation.guestCount || 0).toLocaleString("en-US")} Guests`;
document.querySelector("#total-rent").textContent = formatPrice(reservation.price);
document.querySelector("#advance-due").textContent = formatPrice(Math.round(reservation.price * 0.2));
document.querySelector("#balance-due").textContent = formatPrice(Math.round(reservation.price * 0.8));
document.querySelector("#customer-name").textContent = reservation.name
  ? `Contact: ${reservation.name}`
  : "Customer contact is available in the reservation form";

document.querySelector("#copy-request-id").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(reservation.id);
    showToast("Demo reference copied");
  } catch {
    showToast(`Reference: ${reservation.id}`);
  }
});

document.querySelector("#download-receipt").addEventListener("click", () => {
  window.print();
});

document.querySelector("#share-summary").addEventListener("click", async () => {
  const shareData = {
    title: `Demo request for ${venue.name}`,
    text: `Reservation request preview ${reservation.id}. This is not a confirmed booking.`,
    url: window.location.href,
  };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") showToast("Unable to share this request");
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
    showToast("Demo request details copied");
  } catch {
    showToast("Use your browser address bar to share this demo");
  }
});

document.querySelector("#share-request").addEventListener("click", () => {
  document.querySelector("#share-summary").click();
});
