
const { io } = require("socket.io-client");

const token = process.env.TEST_JWT;

if (!token) {
  console.error("Please provide the responder's JWT in TEST_JWT");
  process.exit(1);
}

const socket = io("http://localhost:5000", {
  auth: { token },
  reconnection: false,
  timeout: 5000,
});

socket.on("connect", () => {
  console.log("Responder connected:", socket.id);
  console.log("Waiting for incident notifications...");
});

// Listen for new incident assignments
socket.on("incident:assigned", (data) => {
  console.log("\nREAL-TIME ASSIGNMENT RECEIVED!");
  console.log(JSON.stringify(data, null, 2));
});

// Listen for incident status updates
socket.on("incident:status_updated", (data) => {
  console.log("\nREAL-TIME STATUS UPDATE RECEIVED!");
  console.log(JSON.stringify(data, null, 2));
});

socket.on("connect_error", (error) => {
  console.error("Connection failed:", error.message);
  process.exitCode = 1;
});

socket.on("disconnect", (reason) => {
  console.log("Responder disconnected:", reason);
});
