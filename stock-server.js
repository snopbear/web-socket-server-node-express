const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const randomStockObject = require("./random-stock-values");

// Create Express app
const app = express();

// Enable CORS to allow Angular app to communicate with this server
app.use(
  cors({
    // origin: "http://localhost:4200", // Replace with the Angular app's URL
    origin: "https://snopbear.github.io", // Replace with the Angular app's URL
    methods: ["GET", "POST"],
  })
);

// Create HTTP server and wrap it with Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // origin: "http://localhost:4200",
    origin: "https://snopbear.github.io",
    methods: ["GET", "POST"],
  },
});

// Define port
const port = process.env.PORT || 9091;


io.use((socket, next) => {
  console.log("Default Namespace!");
  next();
});

io.on("connection", (socket) => {
  console.log("Default Namespace Connection!");
});


// Socket.IO connection event
io.of("/live").on("connection", (socket) => {
    console.log("Connected to live namespace!!!");

   let intervalId ;
  socket.on("joinSocketsRoom", (room) => {
    if (room == "stocks") {
      socket.join("stocks");

      // Send stock values every 5 seconds
      intervalId = setInterval(() => {
        io.of("/live").to("stocks").emit("liveStocks",[
          randomStockObject.getAppleStockValues(),
          randomStockObject.getGoogleStockValues(),
          randomStockObject.getMicrosoftStockValues()

        ]);
      }, 5000);
    }
  });


  
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(intervalId); // Clear the interval when the client disconnects
  });
});

// Function to emit stock values to the connected client
// Start the server
server.listen(port, () => {
  console.log(`The stock server is listening on PORT - ${port}`);
});
