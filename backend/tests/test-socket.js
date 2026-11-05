
const { io } = require("socket.io-client");

const token = process.env.TEST_JWT;

if (!token) {
  console.error("Please provide TEST_JWT");
  process.exit(1);
}

const socket = io("http://localhost:5000", {
  auth: { token },
  reconnection: false,
  timeout: 5000,
});

socket.on("connect", () => {
  console.log("SUCCESS: Authenticated socket connected!");
  console.log("Socket ID:", socket.id);
  socket.disconnect();
});

socket.on("connect_error", (error) => {
  console.error("CONNECTION FAILED:", error.message);
  process.exitCode = 1;
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});
