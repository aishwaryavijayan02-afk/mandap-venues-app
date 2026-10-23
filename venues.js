const venueResults = document.querySelector("#venue-results");
const resultCards = [...document.querySelectorAll(".result-card")];
const resultCount = document.querySelector("#result-count");
const emptyResults = document.querySelector("#empty-results");
const toast = document.querySelector("#toast");
const filterDialog = document.querySelector("#filter-dialog");
const filterInputs = {
  ac: document.querySelector("#ac-filter"),
  capacity: document.querySelector("#capacity-filter"),
  budget: document.querySelector("#budget-filter"),
  certified: document.querySelector("#certified-filter"),
};
const pageParams = new URLSearchParams(window.location.search);
const searchQuery = pageParams.get("q")?.trim().toLowerCase() ?? "";
const locationSelect = document.querySelector("#event-location-input");
const customLocationField = document.querySelector("#custom-event-location-field");
const customLocationInput = document.querySelector("#custom-event-location-input");
const requestedLocation = pageParams.get("location")?.trim();
const storedLocation = localStorage.getItem("mandap-venues-location");
const initialLocation = (requestedLocation && requestedLocation.length <= 80 && requestedLocation !== "__add_location__"
  ? requestedLocation
  : storedLocation && storedLocation.length <= 80 && storedLocation !== "__add_location__"
    ? storedLocation
    : "Kannur, Kerala");
let toastTimeout;

function addLocationOption(location) {
  const existingOption = [...locationSelect.options].find((option) => option.value === location);
  if (existingOption) return existingOption;

  const option = new Option(location, location);
  locationSelect.add(option, locationSelect.querySelector('option[value="__add_location__"]'));
  return option;
}

document.querySelector("#summary-location").textContent = initialLocation;
addLocationOption(initialLocation);
locationSelect.value = initialLocation;
localStorage.setItem("mandap-venues-location", initialLocation);

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 2400);
}

function updateFilters() {
  const filters = Object.fromEntries(
    Object.entries(filterInputs).map(([name, input]) => [name, input.checked]),
  );

  document.querySelectorAll(".filter-chip").forEach((chip) => {
    const active = filters[chip.dataset.filter];
    chip.classList.toggle("active", active);
    chip.setAttribute("aria-pressed", String(active));
    const state = chip.querySelector(".chip-state");
    state.textContent = active ? (chip.dataset.filter === "ac" ? "✓" : "×") : "+";
  });

  const activeCount = Object.values(filters).filter(Boolean).length;
  document.querySelector("#filter-count").textContent = String(activeCount);
  document.querySelector("#apply-count").textContent = String(
    resultCards.filter((card) => matchesFilters(card, filters)).length,
  );

  return filters;
}

function matchesFilters(card, filters) {
  const capacity = Number(card.dataset.capacity);
  const price = Number(card.dataset.price);
  const matchesSearch = !searchQuery || `${card.dataset.name} ${card.querySelector(".result-address").textContent}`.toLowerCase().includes(searchQuery);

  if (!matchesSearch) return false;
  if (filters.capacity && capacity < 500) return false;
  if (filters.budget && price >= 60000) return false;
  if (filters.certified && !card.classList.contains("certified-venue")) return false;
  if (filters.ac && card.dataset.ac === "false") return false;
  return true;
}

function renderResults(applyActiveFilters = true) {
  const filters = updateFilters();
  const sort = document.querySelector("#sort-select").value;
  const visibleCards = resultCards.filter((card) => {
    const matchesSearch = !searchQuery || `${card.dataset.name} ${card.querySelector(".result-address").textContent}`.toLowerCase().includes(searchQuery);
    return matchesSearch && (!applyActiveFilters || matchesFilters(card, filters));
  });

  const sorters = {
    recommended: (a, b) => Number(b.classList.contains("featured-card")) - Number(a.classList.contains("featured-card")),
    "price-asc": (a, b) => Number(a.dataset.price) - Number(b.dataset.price),
    "rating-desc": (a, b) => Number(b.dataset.rating) - Number(a.dataset.rating),
    "distance-asc": (a, b) => Number.parseFloat(a.querySelector(".distance").textContent.split("•")[1]) - Number.parseFloat(b.querySelector(".distance").textContent.split("•")[1]),
  };
  visibleCards.sort(sorters[sort]);

  visibleCards.forEach((card) => venueResults.append(card));
  resultCards.filter((card) => !visibleCards.includes(card)).forEach((card) => venueResults.append(card));
  resultCards.forEach((card) => {
    card.hidden = !visibleCards.includes(card);
  });
  resultCount.textContent = String(visibleCards.length);
  emptyResults.hidden = visibleCards.length > 0;
}

document.querySelectorAll(".filter-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const input = filterInputs[chip.dataset.filter];
    input.checked = !input.checked;
    renderResults();
  });
});

document.querySelector("#open-filters").addEventListener("click", () => {
  filterDialog.showModal();
});

document.querySelector("#close-filters").addEventListener("click", () => {
  filterDialog.close();
});

document.querySelector("#apply-filters").addEventListener("click", () => {
  renderResults();
  filterDialog.close();
  showToast(`${resultCount.textContent} venues match your search`);
});

document.querySelector("#clear-filters").addEventListener("click", () => {
  Object.values(filterInputs).forEach((input) => {
    input.checked = false;
  });
  renderResults();
});

document.querySelector("#sort-select").addEventListener("change", renderResults);
Object.values(filterInputs).forEach((input) => input.addEventListener("change", renderResults));

document.querySelector("#edit-event").addEventListener("click", () => {
  const location = document.querySelector("#summary-location").textContent;
  addLocationOption(location);
  locationSelect.value = location;
  customLocationField.hidden = true;
  customLocationInput.value = "";
  document.querySelector("#event-date-input").value = document.querySelector("#summary-date").dataset.date;
  document.querySelector("#event-guests-input").value = document.querySelector("#summary-guests").textContent.replace(/[^\d]/g, "");
  document.querySelector("#event-dialog").showModal();
});

locationSelect.addEventListener("change", () => {
  const addCustomLocation = locationSelect.value === "__add_location__";
  customLocationField.hidden = !addCustomLocation;
  if (addCustomLocation) customLocationInput.focus();
});

function closeEventDialog() {
  document.querySelector("#event-dialog").close();
}

document.querySelector("#close-event").addEventListener("click", closeEventDialog);
document.querySelector("#cancel-event").addEventListener("click", closeEventDialog);
document.querySelector("#save-event").addEventListener("click", () => {
  let location = locationSelect.value;
  const dateValue = document.querySelector("#event-date-input").value;
  const guests = document.querySelector("#event-guests-input").value;

  if (!dateValue) {
    showToast("Choose an event date before saving");
    return;
  }

  if (location === "__add_location__") {
    location = customLocationInput.value.trim().replace(/\s+/g, " ");
    if (!location) {
      showToast("Enter a valid city or location");
      customLocationInput.focus();
      return;
    }
    addLocationOption(location);
    locationSelect.value = location;
  }

  const date = new Date(`${dateValue}T00:00:00`);
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
  document.querySelector("#summary-location").textContent = location;
  localStorage.setItem("mandap-venues-location", location);
  const summaryDate = document.querySelector("#summary-date");
  summaryDate.textContent = formattedDate;
  summaryDate.dataset.date = dateValue;
  document.querySelector("#summary-guests").textContent = `${Number(guests).toLocaleString("en-US")} Guests`;
  closeEventDialog();
  showToast(`Event details saved for ${location}`);
});

document.querySelectorAll(".favorite-button").forEach((button) => {
  button.addEventListener("click", () => {
    const saved = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(saved));
    const venue = button.closest(".result-card").dataset.name;
    showToast(saved ? `${venue} saved to favorites` : `${venue} removed from favorites`);
  });
});

document.querySelectorAll(".availability-button").forEach((button) => {
  button.addEventListener("click", () => {
    const url = new URL("./venue.html", window.location.href);
    url.searchParams.set("venue", button.closest(".result-card").dataset.venueId);
    url.searchParams.set("date", document.querySelector("#summary-date").dataset.date);
    url.searchParams.set("location", document.querySelector("#summary-location").textContent);
    url.searchParams.set("guests", document.querySelector("#summary-guests").textContent.replace(/[^\d]/g, ""));
    window.location.href = url.href;
  });
});

document.querySelector("#share-button").addEventListener("click", async () => {
  const location = document.querySelector("#summary-location").textContent;
  const shareData = {
    title: `Auditoriums in ${location.split(",")[0]}`,
    text: `Compare auditoriums for your event in ${location}.`,
    url: window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        showToast("Unable to share venue results");
      }
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(shareData.url);
    showToast("Venue results link copied");
  } catch {
    showToast("Use your browser address bar to share these results");
  }
});

renderResults(false);
