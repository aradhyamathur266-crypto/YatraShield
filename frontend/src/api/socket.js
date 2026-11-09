import { io } from "socket.io-client";
import { SOCKET_URL, getToken } from "./api.js";

let socket = null;
let connectedToken = null;

export function getSocket() {
  const token = getToken();
  if (!token) return null;

  if (!socket || connectedToken !== token) {
    disconnectSocket();
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
    });
    connectedToken = token;
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    connectedToken = null;
  }
}

/**
 * Listen for real-time incident events.
 * @param {Object} handlers - { [eventName]: (payload) => void }
 * Events: "incident:status_updated", "incident:assigned", "incident:reassigned"
 * @returns {() => void} unsubscribe function
 */
export function subscribeToIncidentEvents(handlers = {}) {
  const s = getSocket();
  if (!s) return () => {};

  const eventTypes = Object.keys(handlers);
  eventTypes.forEach((event) => s.on(event, handlers[event]));

  return () => {
    eventTypes.forEach((event) => s.off(event, handlers[event]));
  };
}
