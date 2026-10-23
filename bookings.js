const bookingList = document.querySelector("#booking-list");
const requestData = sessionStorage.getItem("demo-reservation-request");

function renderEmptyState() {
  bookingList.innerHTML = `
    <div class="empty-panel">
      <span class="empty-icon" aria-hidden="true">▦</span>
      <h3>No booking requests yet</h3>
      <p>When you submit a reservation request, it will appear here for this browser session.</p>
      <a class="secondary-action" href="./venues.html">Explore venues</a>
    </div>
  `;
}

if (!requestData) {
  renderEmptyState();
} else {
  try {
    const request = JSON.parse(requestData);
    if (!request || typeof request.id !== "string" || typeof request.venue !== "string") {
      throw new Error("Saved reservation request has an invalid format.");
    }

    const date = new Date(`${request.date}T00:00:00`);
    const dateLabel = Number.isNaN(date.getTime())
      ? "Event date to be confirmed"
      : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
    const card = document.createElement("article");
    card.className = "booking-card";

    const heading = document.createElement("h3");
    heading.textContent = request.venue;
    const status = document.createElement("span");
    status.className = "booking-status";
    status.textContent = "Demo request · Not confirmed";
    const details = document.createElement("p");
    details.textContent = `${dateLabel} · ${request.location || "Location not set"} · ${Number(request.guestCount) || 0} guests`;
    const link = document.createElement("a");
    link.className = "secondary-action";
    link.href = `./confirmation.html?request=${encodeURIComponent(request.id)}`;
    link.textContent = "View request summary";

    card.append(status, heading, details, link);
    bookingList.replaceChildren(card);
  } catch (error) {
    console.error("Unable to display saved booking request.", error);
    renderEmptyState();
  }
}

const serviceSelectionList = document.querySelector("#service-selection-list");
const serviceSelectionData = localStorage.getItem("event-service-selections");

if (!serviceSelectionData) {
  const emptyMessage = document.createElement("p");
  emptyMessage.className = "secondary-intro";
  emptyMessage.textContent = "No service selections saved yet.";
  serviceSelectionList.replaceChildren(emptyMessage);
} else {
  try {
    const selections = JSON.parse(serviceSelectionData);
    if (!Array.isArray(selections)) {
      throw new Error("Saved service selections have an invalid format.");
    }

    const cards = selections
      .filter((selection) => selection && typeof selection.category === "string" && typeof selection.option === "string")
      .map((selection) => {
        const card = document.createElement("article");
        card.className = "booking-card";
        const category = document.createElement("span");
        category.className = "booking-status";
        category.textContent = selection.category;
        const heading = document.createElement("h3");
        heading.textContent = selection.option;
        const date = new Date(`${selection.eventDate}T00:00:00`);
        const dateLabel = Number.isNaN(date.getTime())
          ? "Date not set"
          : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
        const details = document.createElement("p");
        details.textContent = `${dateLabel} · ${selection.location || "Location not set"}`;
        card.append(category, heading, details);
        return card;
      });

    if (cards.length) {
      serviceSelectionList.replaceChildren(...cards);
    } else {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "secondary-intro";
      emptyMessage.textContent = "No service selections saved yet.";
      serviceSelectionList.replaceChildren(emptyMessage);
    }
  } catch (error) {
    console.error("Unable to display saved service selections.", error);
    const errorMessage = document.createElement("p");
    errorMessage.className = "secondary-intro";
    errorMessage.textContent = "Saved service selections could not be displayed.";
    serviceSelectionList.replaceChildren(errorMessage);
  }
}
