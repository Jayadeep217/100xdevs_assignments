const express = require("express");
const mongoose = require("mongoose");
const {
  initLogger,
  closeLogger,
  getISTFormattedDateTime,
} = require("./logger");
const { User, Todo } = require("./db");
const { error } = require("winston");

const PORT = 4676;
const MONGODB_IP = "127.0.0.1";
const MONGODB_PORT = "27017";
const DB_NAME = "todo-app";
const MONGODB_URI = `mongodb://${MONGODB_IP}:${MONGODB_PORT}/${DB_NAME}`;

const app = express();
let logger, server;

app.use(express.json());

async function initDBConnection() {
  logger.info("Connecting to mongodb...");
  mongoose
    .connect(MONGODB_URI)
    .then(() => logger.info("✅ MongoDB connected"))
    .catch((err) => logger.error("❌ MongoDB error:", err));
}

async function startServer() {
  try {
    logger = await initLogger();
    logger.info("Logger initialized successfully");

    await initDBConnection();

    server = app.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`);
    });

    server.on("error", () => {
      logger.error("Server failed to started: ", error);
    });
  } catch (error) {
    logger.error("Server failed to started: ", error);
  }
}

async function shutdown(params) {
  logger.info("Shutting down the server");
  try {
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          return reject(err);
        }
        logger.info("Http Server stopped!");
        resolve();
      });
    });
    await mongoose.disconnect();
    logger.info("DB connection closed!");
    await closeLogger(logger);
    console.log(getISTFormattedDateTime() + " - INFO - logger closed!");
    console.log(
      getISTFormattedDateTime() + " - INFO - Server shutdown successful"
    );
    process.exit(0);
  } catch (error) {
    const message = "Error during graceful shutdown:";
    if (logger) {
      logger.error(message, error);
    } else {
      console.error(message, error);
    }
    process.exit(1);
  }
}

function registerUser(req, res) {
  res.status(501).json({ message: "Not implemented yet" });
}

function loginUser(req, res) {
  res.status(501).json({ message: "Not implemented yet" });
}

function getUserProfile(req, res) {
  res.status(501).json({ message: "Not implemented yet" });
}

function getTodoList(req, res) {
  res.status(501).json({ message: "Not implemented yet" });
}

function addTodoItem(req, res) {
  res.status(501).json({ message: "Not implemented yet" });
}

function getTodoById(req, res) {
  res.status(501).json({ message: "Not implemented yet" });
}

function updateTodoItem(req, res) {
  res.status(501).json({ message: "Not implemented yet" });
}

function deleteTodoItem(req, res) {
  res.status(501).json({ message: "Not implemented yet" });
}

//auth routes
app.post("/auth/signup", registerUser);
app.post("/auth/signin", loginUser);

//users routes
app.get("/users/me", getUserProfile);

//todo routes
app.get("/todos", getTodoList);
app.post("/todos", addTodoItem);
app.get("/todos/:todoId", getTodoById);
app.put("/todos/:todoId", updateTodoItem);
app.delete("/todos/:todoId", deleteTodoItem);

startServer();
// Listen for termination signals
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
