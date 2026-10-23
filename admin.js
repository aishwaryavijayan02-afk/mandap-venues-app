const demoAdmin = {
  email: "admin@demo.com",
  password: "Admin123!",
};
const loginKey = "mandap-demo-admin-session";
const imageStorageKey = "mandap-venue-images";
const loginForm = document.querySelector("#admin-login-form");
const editor = document.querySelector("#admin-editor");
const statusMessage = document.querySelector("#admin-status");
const venueSelect = document.querySelector("#venue-select");
const imageFile = document.querySelector("#venue-image-file");
const preview = document.querySelector("#venue-image-preview");
const removeButton = document.querySelector("#remove-venue-image");
const defaultImages = {
  "malabar-grand": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1100&q=90",
  "grace-convention": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1100&q=90",
  "green-valley": "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1100&q=90",
};

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.hidden = !message;
  statusMessage.style.color = isError ? "#a14328" : "";
}

function readSavedImages() {
  const rawImages = localStorage.getItem(imageStorageKey);
  if (!rawImages) return {};

  const images = JSON.parse(rawImages);
  if (!images || typeof images !== "object" || Array.isArray(images)) {
    throw new Error("Saved auditorium images are unreadable. Remove the invalid browser data and try again.");
  }
  return images;
}

function showEditor(isLoggedIn) {
  loginForm.hidden = isLoggedIn;
  document.querySelector(".demo-credentials").hidden = isLoggedIn;
  editor.hidden = !isLoggedIn;
  if (isLoggedIn) updatePreview();
}

function updatePreview() {
  try {
    const savedImages = readSavedImages();
    const venueId = venueSelect.value;
    const uploadedImage = savedImages[venueId];
    preview.src = typeof uploadedImage === "string" ? uploadedImage : defaultImages[venueId];
    removeButton.hidden = typeof uploadedImage !== "string";
  } catch (error) {
    setStatus(error.message, true);
  }
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const email = String(formData.get("email")).trim().toLowerCase();
  const password = String(formData.get("password"));

  if (email !== demoAdmin.email || password !== demoAdmin.password) {
    setStatus("Email or password is incorrect. Use the demo login shown above.", true);
    return;
  }

  sessionStorage.setItem(loginKey, "true");
  setStatus("");
  showEditor(true);
});

venueSelect.addEventListener("change", () => {
  imageFile.value = "";
  updatePreview();
});

imageFile.addEventListener("change", () => {
  const file = imageFile.files[0];
  if (!file) {
    updatePreview();
    return;
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    imageFile.value = "";
    setStatus("Choose a JPG, PNG, or WebP image.", true);
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    imageFile.value = "";
    setStatus("Image is too large. Choose an image under 10 MB.", true);
    return;
  }
  preview.src = URL.createObjectURL(file);
  removeButton.hidden = true;
  setStatus("Image preview ready. Save to update this auditorium.");
});

async function createOptimizedImage(file) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();

    const scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser could not prepare the image. Try a different browser.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const optimizedImage = canvas.toDataURL("image/jpeg", 0.78);
    if (optimizedImage.length > 2_000_000) {
      throw new Error("The compressed image is still too large. Choose a smaller image.");
    }
    return optimizedImage;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

document.querySelector("#save-venue-image").addEventListener("click", async () => {
  const file = imageFile.files[0];
  if (!file) {
    setStatus("Choose an auditorium image before saving.", true);
    imageFile.focus();
    return;
  }

  try {
    const savedImages = readSavedImages();
    savedImages[venueSelect.value] = await createOptimizedImage(file);
    localStorage.setItem(imageStorageKey, JSON.stringify(savedImages));
    imageFile.value = "";
    updatePreview();
    setStatus("Auditorium photo saved. Refresh the auditorium list to see the update.");
  } catch (error) {
    setStatus(error instanceof DOMException && error.name === "QuotaExceededError"
      ? "Browser storage is full. Remove an old photo or choose a smaller image."
      : error instanceof Error
        ? error.message
        : "Unable to save this image. Try a different file.", true);
  }
});

removeButton.addEventListener("click", () => {
  try {
    const savedImages = readSavedImages();
    delete savedImages[venueSelect.value];
    localStorage.setItem(imageStorageKey, JSON.stringify(savedImages));
    imageFile.value = "";
    updatePreview();
    setStatus("Default auditorium photo restored.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Unable to restore the default photo.", true);
  }
});

document.querySelector("#admin-logout").addEventListener("click", () => {
  sessionStorage.removeItem(loginKey);
  setStatus("");
  showEditor(false);
  loginForm.reset();
});

showEditor(sessionStorage.getItem(loginKey) === "true");
