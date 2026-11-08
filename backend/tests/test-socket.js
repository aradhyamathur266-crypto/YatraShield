const {io} = require("socket.io-client");
const token = process.env.TEST_JWT;

if(!token){
  console.error("Please provide TEST_JWT");
  process.exit(1);
}

const socket = io("http://localhost:5000", {
  auth: { token },
  reconnection: false,
  timeout: 5000,
});

socket.on("connect", () => {
  console.log("SUCCESS: Authenticated admin socket connected!");
  console.log("Socket ID:", socket.id);
  console.log("Listening for incident:escalated...");
});

socket.on("incident:escalated", (notification) => {
  console.log("SUCCESS: Escalation notification received!");
  console.log(notification);
  socket.disconnect();
});

socket.on("incident:reassigned", (data) => {
  console.log("SUCCESS: Reassignment notification received!");
  console.log(data);
});

socket.on("connect_error", (error) => {
  console.error("CONNECTION FAILED:", error.message);
  process.exitCode = 1;
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});

socket.on("connect_timeout", () => {
  console.error("Socket connection timed out");
  process.exitCode = 1;
});
