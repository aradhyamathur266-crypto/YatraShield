export function toast(message, type = "success") {
  window.dispatchEvent(new CustomEvent("ys-toast", { detail: { message, type } }));
}
