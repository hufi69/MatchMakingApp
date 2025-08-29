require("dotenv").config();
const config = require("./config");
const express = require("express");
const mongoose = require("mongoose");
const setupApp = require("./app.config");
const AppSocketService = require("./socket");

const app = express();

setupApp(app);

const server = app.listen(config.port, () => {
    console.log("server is running on port", config.port);
});

// Initialize socket service
const socketService = new AppSocketService();
socketService.start(server);

// Make socket service available globally
global.socketService = socketService;

const gracefulShutdown = (signal) => {
    console.log(`Received ${signal}, shutting down gracefully`);
    server.close(async () => {
        console.log("Server closed");
        await mongoose.connection.close();
        console.log("Database connection closed");
        process.exit(0);
    });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGUSR2", () => gracefulShutdown("SIGUSR2"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));


module.exports = server;