const searchForm = document.querySelector(".search-bar");
const searchInput = document.querySelector("#venue-search");
const venueCards = [...document.querySelectorAll(".venue-card")];
const emptyState = document.querySelector("#empty-state");
const toast = document.querySelector("#toast");
let toastTimeout;
const locationSelect = document.querySelector("#location-select");
const locationAddRow = document.querySelector("#location-add-row");
const newLocationInput = document.querySelector("#new-location-input");

function addLocationOption(select, location) {
  const existingOption = [...select.options].find((option) => option.value === location);
  if (existingOption) return existingOption;

  const option = new Option(location, location);
  select.add(option, select.querySelector('option[value="__add_location__"]'));
  return option;
}

const savedLocation = localStorage.getItem("mandap-venues-location");
if (savedLocation && savedLocation !== "__add_location__") {
  locationSelect.value = addLocationOption(locationSelect, savedLocation).value;
}

function updateLocationHeading(location) {
  document.querySelector("#venues-heading").textContent = `Popular Auditoriums in ${location.split(",")[0]}`;
}

updateLocationHeading(locationSelect.value);

function saveLocation(location) {
  locationSelect.value = addLocationOption(locationSelect, location).value;
  locationAddRow.hidden = true;
  newLocationInput.value = "";
  localStorage.setItem("mandap-venues-location", location);
  updateLocationHeading(location);
  showToast(`Event location set to ${location}`);
}

function openVenues(query = "") {
  if (locationSelect.value === "__add_location__") {
    locationAddRow.hidden = false;
    showToast("Add your event location before continuing");
    newLocationInput.focus();
    return;
  }

  const url = new URL("./venues.html", window.location.href);
  if (query) url.searchParams.set("q", query);
  url.searchParams.set("location", locationSelect.value);
  window.location.href = url.href;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 2400);
}

function filterVenues() {
  const query = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  venueCards.forEach((card) => {
    const matches = card.dataset.search.includes(query);
    card.hidden = !matches;
    if (matches) visibleCount += 1;
  });

  emptyState.hidden = visibleCount > 0;
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  filterVenues();
  openVenues(searchInput.value.trim());
});
searchInput.addEventListener("input", filterVenues);

locationSelect.addEventListener("change", () => {
  if (locationSelect.value === "__add_location__") {
    locationAddRow.hidden = false;
    newLocationInput.focus();
    return;
  }
  saveLocation(locationSelect.value);
});

document.querySelector("#add-location-button").addEventListener("click", () => {
  const location = newLocationInput.value.trim().replace(/\s+/g, " ");
  if (!location || location === "__add_location__") {
    showToast("Enter a valid city or location");
    newLocationInput.focus();
    return;
  }
  saveLocation(location);
});

newLocationInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    document.querySelector("#add-location-button").click();
  }
});

document.querySelectorAll(".category-card").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".category-card").forEach((item) => {
      const selected = item === card;
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });

    const category = card.dataset.category;
    if (category === "Auditoriums") {
      openVenues();
      return;
    }

    const url = new URL("./services.html", window.location.href);
    url.searchParams.set("category", category);
    url.searchParams.set("location", locationSelect.value);
    window.location.href = url.href;
  });
});

document.querySelectorAll(".event-tag").forEach((tag) => {
  tag.addEventListener("click", () => {
    document.querySelectorAll(".event-tag").forEach((item) => item.classList.remove("active"));
    tag.classList.add("active");
  });
});

document.querySelectorAll(".favorite-button").forEach((button) => {
  button.addEventListener("click", () => {
    const favorite = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(favorite));
    const venue = button.closest(".venue-card").querySelector("h3").textContent;
    showToast(favorite ? `${venue} saved to favorites` : `${venue} removed from favorites`);
  });
});

document.querySelector("#date-tile").addEventListener("click", () => {
  showToast("Choose your event date: 12 Nov 2025");
});

document.querySelector("#capacity-tile").addEventListener("click", () => {
  const capacities = ["500+ Guests", "800+ Guests", "1,200+ Guests"];
  const capacity = document.querySelector("#event-capacity");
  const index = capacities.indexOf(capacity.textContent);
  capacity.textContent = capacities[(index + 1) % capacities.length];
  showToast(`Guest capacity set to ${capacity.textContent}`);
});

document.querySelector(".filter-button").addEventListener("click", () => {
  openVenues();
});

document.querySelector(".hero-cta").addEventListener("click", () => {
  openVenues();
});

document.querySelector("#see-all").addEventListener("click", () => {
  openVenues();
});

document.querySelectorAll(".availability-button").forEach((button) => {
  button.addEventListener("click", () => {
    openVenues();
  });
});

document.querySelectorAll("[data-toast]").forEach((button) => {
  button.addEventListener("click", () => showToast(button.dataset.toast));
});

document.querySelectorAll(".notification-button, .magic-button").forEach((button) => {
  button.addEventListener("click", () => {
    const message = button.classList.contains("notification-button")
      ? "You’re all caught up"
      : "Discover your next celebration";
    showToast(message);
  });
});
