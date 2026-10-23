const serviceCatalog = {
  Catering: {
    description: "Choose the kind of food service you would like for your event.",
    options: ["Traditional Sadya", "Buffet", "Snacks & beverages"],
  },
  "Travel & Bus": {
    description: "Choose a guest transport option to discuss for your event.",
    options: ["Mini bus", "30-seater bus", "50-seater bus"],
  },
  "Bridal Beauty": {
    description: "Choose a bridal beauty service to discuss for your celebration.",
    options: ["Bridal makeup", "Family makeup", "Hair styling"],
  },
  "Digital Invites": {
    description: "Choose a digital invitation format for your event.",
    options: ["Animated video invite", "Digital invitation card", "Save-the-date card"],
  },
};

const params = new URLSearchParams(window.location.search);
const category = params.get("category");
const service = serviceCatalog[category];
const status = document.querySelector("#service-status");

if (!service) {
  window.location.replace("./index.html");
} else {
  document.title = `${category} — Weddings & Events Booking`;
  document.querySelector("#service-title").textContent = category;
  document.querySelector("#service-heading").textContent = `${category} options`;
  document.querySelector("#service-description").textContent = service.description;
  document.querySelector("#service-options-label").textContent = `Select a ${category.toLowerCase()} option`;
  document.querySelector("#service-location").value =
    params.get("location") || localStorage.getItem("mandap-venues-location") || "Kannur, Kerala";

  const optionsContainer = document.querySelector("#service-options");
  service.options.forEach((option, index) => {
    const label = document.createElement("label");
    label.className = "service-option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "serviceOption";
    input.value = option;
    input.required = true;
    input.checked = index === 0;

    const copy = document.createElement("span");
    copy.textContent = option;
    label.append(input, copy);
    optionsContainer.append(label);
  });

  document.querySelector("#service-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;

    const formData = new FormData(event.currentTarget);
    const selection = {
      category,
      option: formData.get("serviceOption"),
      eventDate: formData.get("eventDate"),
      location: formData.get("location").trim(),
      savedAt: new Date().toISOString(),
    };
    const savedSelections = JSON.parse(localStorage.getItem("event-service-selections") || "[]");
    savedSelections.push(selection);
    localStorage.setItem("event-service-selections", JSON.stringify(savedSelections));
    localStorage.setItem("mandap-venues-location", selection.location);
    status.textContent = `${selection.option} saved for ${selection.location}. This selection is stored on this device only.`;
    status.hidden = false;
  });
}
