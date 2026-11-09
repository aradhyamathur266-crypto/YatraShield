/** type: "success" | "error" | "info" */
export function toast(message, type = "success") {
  window.dispatchEvent(new CustomEvent("ys-toast", { detail: { message, type } }));
}

/** Ask the app shell to show the logout confirmation. */
export function requestLogout() {
  window.dispatchEvent(new Event("ys-logout"));
}

/** Open the command palette from anywhere. */
export function openPalette() {
  window.dispatchEvent(new Event("ys-palette"));
}
