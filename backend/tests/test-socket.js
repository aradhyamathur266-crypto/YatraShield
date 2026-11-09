const { io } = require("socket.io-client");
const token = process.env.TEST_JWT;
const expectedEvent = process.env.TEST_EVENT;

if(!token){
  console.error("Please provide TEST_JWT");
  process.exit(1);
}

const socket = io("http://localhost:5000",{
  auth: { token },
  reconnection: false,
  timeout: 5000,
});

const events = [
  "incident:assigned",
  "incident:escalated",
  "incident:reassigned",
  "incident:status_updated",
];

socket.on("connect", () => {
  console.log("SUCCESS: Authenticated socket connected!");
  console.log("Socket ID:", socket.id);
  console.log("Listening for:", expectedEvent || "all incident events");
});

events.forEach((eventName) => {
  socket.on(eventName, (data) => {
    console.log(`\nSUCCESS: Received ${eventName}`);
    console.log(JSON.stringify(data, null, 2));

    if(!expectedEvent || expectedEvent === eventName){
      socket.disconnect();
    }
  });
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
