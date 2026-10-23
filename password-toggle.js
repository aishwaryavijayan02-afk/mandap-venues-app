document.querySelectorAll("[data-password-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const passwordInput = button.parentElement.querySelector("input");
    const showPassword = passwordInput.type === "password";

    passwordInput.type = showPassword ? "text" : "password";
    button.textContent = showPassword ? "Hide" : "Show";
    button.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");
    button.setAttribute("aria-pressed", String(showPassword));
  });
});
