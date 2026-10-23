const loginForm = document.querySelector("#login-form");
const loginStatus = document.querySelector("#login-status");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loginStatus.textContent = "Sign-in is not connected in this demo yet.";
  loginStatus.hidden = false;
});
