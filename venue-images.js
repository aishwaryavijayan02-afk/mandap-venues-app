const uploadedVenueImages = JSON.parse(localStorage.getItem("mandap-venue-images") || "{}");

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".result-card[data-venue-id]").forEach((card) => {
    const uploadedImage = uploadedVenueImages[card.dataset.venueId];
    if (typeof uploadedImage !== "string") return;

    const image = card.querySelector(".result-photo img");
    image.src = uploadedImage;
  });
});
