const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

app.get("/", (req, res) => {
    res.send("<center><h1>Chat server is running </h1></center>");
  });
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // React frontend URL
    methods: ["GET", "POST"],
  },
});

let users = {};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("joined", (name) => {
    users[socket.id] = name;
    socket.broadcast.emit("userJoined", `${name} joined the chat.`);
    console.log(`${name} connected.`);
  });

  socket.on("message", (messageData) => {
    io.emit("message", messageData);
  });

  socket.on("disconnect", () => {
    const name = users[socket.id];
    if (name) {
      socket.broadcast.emit("userLeft", `${name} left the chat.`);
      console.log(`${name} disconnected.`);
      delete users[socket.id];
    }
  });
});

const PORT = 5002; // Different port from the auth backend
server.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
});
