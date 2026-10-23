const venues = {
  "malabar-grand": {
    name: "Malabar Grand Auditorium & Convention Hall",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=90",
    imageAlt: "A chandelier-lit auditorium prepared for a wedding",
    area: "Thottada, Kannur, Kerala",
    mapQuery: "Thottada%2C+Kannur%2C+Kerala",
    capacity: 800,
    climate: "Central AC",
    parking: "200 Cars",
    catering: "In & External Allowed",
    price: 55000,
    distance: "Thottada Beach Rd, 4.2 km from Kannur South",
    amenities: [
      "Spacious AC Hall with 800 banquet chairs",
      "2 Private Bridal Dressing Suites with mirrors",
      "24/7 Power Backup with silent generator",
      "Ample Secured Parking with valet lane",
      "Modern Audio System & Stage Lighting truss",
    ],
  },
  "grace-convention": {
    name: "Grace Convention Centre",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=90",
    imageAlt: "Grace Convention Centre decorated for a wedding",
    area: "Thottada, Kannur, Kerala",
    mapQuery: "Thottada%2C+Kannur%2C+Kerala",
    capacity: 500,
    climate: "Central AC",
    parking: "200 Cars",
    catering: "In & External Allowed",
    price: 45000,
    distance: "Thottada Beach Rd, 4.2 km from Kannur South",
    amenities: [
      "Spacious AC Hall with 500 banquet chairs",
      "2 Private Bridal Dressing Suites with mirrors",
      "24/7 Power Backup (125kVA Silent Genset)",
      "Ample Secured Parking with valet lane",
      "Modern Audio System & Stage Lighting truss",
    ],
  },
  "green-valley": {
    name: "Green Valley Auditorium & Lawn",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=90",
    imageAlt: "An outdoor wedding venue glowing under evening lights",
    area: "Alavil, Kannur, Kerala",
    mapQuery: "Alavil%2C+Kannur%2C+Kerala",
    capacity: 350,
    climate: "AC Hall",
    parking: "150 Cars",
    catering: "In & External Allowed",
    price: 32000,
    distance: "Alavil, 6.1 km from Kannur",
    amenities: [
      "Air-conditioned hall for up to 350 guests",
      "Open lawn with optional outdoor seating",
      "Dedicated bridal changing suite",
      "On-site parking for 150 cars",
      "Sound system and garden lighting",
    ],
  },
};

const query = new URLSearchParams(window.location.search);
const venue = venues[query.get("venue")] ?? venues["grace-convention"];
const savedImages = JSON.parse(localStorage.getItem("mandap-venue-images") || "{}");
if (typeof savedImages[query.get("venue")] === "string") {
  venue.image = savedImages[query.get("venue")];
}
const toast = document.querySelector("#toast");
const dateInput = query.get("date");
const locationInput = query.get("location");
const guestsInput = query.get("guests");
const initialDate = dateInput && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
  ? new Date(`${dateInput}T00:00:00`)
  : new Date(2025, 10, 12);
let visibleMonth = new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
let selectedDate = new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate());
let toastTimeout;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 2400);
}

function formatDate(date, options = { day: "numeric", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-GB", options).format(date);
}

function updateVenueContent() {
  document.title = `${venue.name} — Venue Details`;
  document.querySelector("#venue-name").textContent = venue.name;
  document.querySelector("#venue-image").src = venue.image;
  document.querySelector("#venue-image").alt = venue.imageAlt;
  document.querySelector("#venue-area").textContent = venue.area;
  document.querySelector("#capacity-value").textContent = `${venue.capacity.toLocaleString("en-US")} Guests`;
  document.querySelector("#climate-value").textContent = venue.climate;
  document.querySelector("#parking-value").textContent = venue.parking;
  document.querySelector("#catering-value").textContent = venue.catering;
  document.querySelector("#hall-rent").textContent = formatPrice(venue.price);
  document.querySelector("#footer-rent").textContent = formatPrice(venue.price);
  document.querySelector("#directions-label").textContent = venue.distance;
  document.querySelector("#pricing-date").textContent = formatDate(selectedDate);
  if (locationInput) {
    document.querySelector("#directions-label").textContent = `${venue.area.split(",")[0]}, ${formatDistance(venue.distance)} from ${locationInput.split(",")[0]}`;
  }
  if (guestsInput && /^\d+$/.test(guestsInput)) {
    document.querySelector("#capacity-value").textContent = `${Number(guestsInput).toLocaleString("en-US")} Guests`;
  }

  const mapUrl = `https://maps.google.com/?q=${venue.mapQuery}`;
  document.querySelector("#maps-link").href = mapUrl;
  document.querySelector("#map-link").href = mapUrl;
  document.querySelector("#amenity-list").replaceChildren(
    ...venue.amenities.map((amenity) => {
      const item = document.createElement("li");
      const check = document.createElement("span");
      check.textContent = "✓";
      item.append(check, document.createTextNode(amenity));
      return item;
    }),
  );
  updatePrice();
}

function formatDistance(distance) {
  const match = distance.match(/\d+(?:\.\d+)? km/);
  return match ? match[0] : "nearby";
}

function formatPrice(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function updatePrice() {
  const advance = Math.round(venue.price * 0.2);
  document.querySelector("#hall-rent").textContent = formatPrice(venue.price);
  document.querySelector("#advance-amount").textContent = formatPrice(advance);
  document.querySelector("#footer-rent").textContent = formatPrice(venue.price);
  document.querySelector("#footer-advance").textContent = formatPrice(advance);
  document.querySelector("#pricing-date").textContent = formatDate(selectedDate);
}

function dayStatus(date) {
  const day = date.getDate();
  if ([1, 2, 6, 7, 8, 9, 14, 15, 16, 20, 21, 23, 29, 30].includes(day)) return "booked";
  if ([5, 22, 26].includes(day)) return "hold";
  return "available";
}

function isSameDay(first, second) {
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();
}

function updateSelectedDate() {
  document.querySelector("#selected-date-label").textContent = formatDate(selectedDate, {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const status = dayStatus(selectedDate);
  const selectedStatus = document.querySelector("#selected-date-status");
  const selectedPill = document.querySelector("#selected-pill");
  selectedStatus.textContent = status === "available"
    ? "Available for Full-Day Booking"
    : status === "hold"
      ? "Tentative hold — contact venue to confirm"
      : "This date is already booked";
  selectedStatus.classList.toggle("unavailable-text", status !== "available");
  selectedPill.textContent = status === "booked" ? "Unavailable" : status === "hold" ? "On hold" : "Selected";
  selectedPill.classList.toggle("unavailable-pill", status !== "available");
  document.querySelector("#proceed-booking").disabled = status === "booked";
  updatePrice();
}

function renderCalendar() {
  const grid = document.querySelector("#calendar-grid");
  const title = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(visibleMonth);
  document.querySelector("#calendar-title").textContent = title;
  document.querySelector("#month-short").textContent = new Intl.DateTimeFormat("en-US", { month: "short" }).format(visibleMonth);
  grid.replaceChildren();

  ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].forEach((day) => {
    const label = document.createElement("span");
    label.className = "weekday";
    label.textContent = day;
    label.setAttribute("aria-hidden", "true");
    grid.append(label);
  });

  const firstWeekday = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  for (let index = 0; index < firstWeekday; index += 1) {
    const blank = document.createElement("span");
    blank.className = "calendar-day empty";
    blank.setAttribute("aria-hidden", "true");
    grid.append(blank);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
    const status = dayStatus(date);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `calendar-day ${status}${isSameDay(date, selectedDate) ? " selected" : ""}`;
    button.setAttribute("aria-label", `${formatDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}, ${status}`);
    button.setAttribute("aria-pressed", String(isSameDay(date, selectedDate)));
    if (status === "booked") button.disabled = true;
    const number = document.createElement("span");
    number.textContent = String(day);
    const marker = document.createElement("i");
    marker.className = `day-marker ${status}`;
    marker.setAttribute("aria-hidden", "true");
    button.append(number, marker);
    button.addEventListener("click", () => {
      selectedDate = date;
      renderCalendar();
      updateSelectedDate();
    });
    grid.append(button);
  }
}

document.querySelector("#previous-month").addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
  renderCalendar();
});

document.querySelector("#next-month").addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
  renderCalendar();
});

document.querySelector("#favorite-venue").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const saved = button.getAttribute("aria-pressed") !== "true";
  button.setAttribute("aria-pressed", String(saved));
  showToast(saved ? "Venue saved to favorites" : "Venue removed from favorites");
});

document.querySelector("#deposit-info").addEventListener("click", () => {
  showToast("The ₹10,000 caution deposit is refundable after your event");
});

document.querySelector("#proceed-booking").addEventListener("click", () => {
  if (dayStatus(selectedDate) === "booked") {
    showToast("Please select an available date to continue");
    return;
  }
  const eventDate = [
    selectedDate.getFullYear(),
    String(selectedDate.getMonth() + 1).padStart(2, "0"),
    String(selectedDate.getDate()).padStart(2, "0"),
  ].join("-");
  const params = new URLSearchParams({
    venue: query.get("venue") ?? "grace-convention",
    date: eventDate,
    location: locationInput ?? "Kannur, Kerala",
    guests: guestsInput ?? String(venue.capacity),
  });
  window.location.href = `./reservation.html?${params}`;
});

document.querySelector("#share-venue").addEventListener("click", async () => {
  const shareData = {
    title: venue.name,
    text: `Check availability at ${venue.name}.`,
    url: window.location.href,
  };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") showToast("Unable to share this venue");
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(shareData.url);
    showToast("Venue link copied");
  } catch {
    showToast("Use your browser address bar to share this venue");
  }
});

updateVenueContent();
renderCalendar();
updateSelectedDate();
