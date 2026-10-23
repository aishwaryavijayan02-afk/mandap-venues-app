const themeStorageKey = "mandap-venues-theme";
const savedTheme = localStorage.getItem(themeStorageKey);
document.documentElement.dataset.theme = savedTheme === "dark" ? "dark" : "light";
const themeColor = document.querySelector('meta[name="theme-color"]');

if (themeColor) {
  themeColor.content = document.documentElement.dataset.theme === "dark" ? "#10121b" : "#f7f8ff";
}

function updateThemeControls() {
  const isDark = document.documentElement.dataset.theme === "dark";

  if (themeColor) {
    themeColor.content = isDark ? "#10121b" : "#f7f8ff";
  }

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    const label = isDark ? "Switch to light mode" : "Switch to dark mode";
    button.setAttribute("aria-label", label);
    button.title = label;
    button.setAttribute("aria-pressed", String(isDark));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateThemeControls();

  document.querySelectorAll("[data-login-link]").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = "./login.html";
    });
  });

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = nextTheme;
      localStorage.setItem(themeStorageKey, nextTheme);
      updateThemeControls();
    });
  });
});

window.addEventListener("storage", (event) => {
  if (event.key === themeStorageKey && (event.newValue === "light" || event.newValue === "dark")) {
    document.documentElement.dataset.theme = event.newValue;
    updateThemeControls();
  }
});
