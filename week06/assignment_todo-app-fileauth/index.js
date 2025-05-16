const express = require("express");
const fs = require("fs").promises;
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");
const path = require("path");
const { initLogger, getISTTimestamp } = require("./logger");

const app = express();
const PORT = 4676;
const JWT_SECRET = "SECRET_RSDZJt_6578";
const USERID_SIZE = 12;

const DATA_DIR = path.join(__dirname, "data");
const TODOS_FILE = path.join(DATA_DIR, "todos.json");

const data = {};
let logger;

app.use(express.json());

//* functions
async function initStorage() {
  logger.info("Storage Initialization...");
  try {
    logger.info("Data dir creation in progress...");
    await fs.mkdir(DATA_DIR, { recursive: true });

    try {
      logger.info("Checking access to data...");
      await fs.access(TODOS_FILE);
      logger.info("Data file accessible. Loading Data...");
    } catch {
      logger.warn("Data file not found! Starting afresh!");
      await fs.writeFile(TODOS_FILE, JSON.stringify(data));
    }
  } catch (error) {
    logger.error("Failed to initialize storage", error);
    process.exit(1);
  }
}

function requestInfoLogger(req, res, next) {
  logger.info(`${req.method} ${req.url}`);
  next();
}

function generateRandomUserID() {
  return nanoid(USERID_SIZE);
}

function registerUser(req, res) {
  const { username, password } = req.body;
  const userID = generateRandomUserID().toString();
  data[userID] = { username, password };
  res.status(200).json({ message: "user signup successful" });
}

function loginUser(req, res) {
  const { username, password } = req.body;
  const authUID = Object.keys(data).filter(
    (key) => data[key].username === username && data[key].password === password
  );
  if (authUID.length > 0) {
    const authToken = jwt.sign({ username: username }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({
      message: "Login successful!",
      authToken: authToken,
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function getUserProfile(req, res) {
  res.json({ message: "User profile route - not yet implemented" });
}

function getTodoList(req, res) {
  res.json({ message: "Get todos - not yet implemented" });
}

function addTodoItem(req, res) {
  res.json({ message: "Add todo - not yet implemented" });
}

function updateTodoItem(req, res) {
  res.json({ message: "Update todo - not yet implemented" });
}

function deleteTodoItem(req, res) {
  res.json({ message: "Delete todo - not yet implemented" });
}

//* Routes
app.post("/auth/signup", requestInfoLogger, registerUser);
app.post("/auth/signin", requestInfoLogger, loginUser);
app.get("/users/me", requestInfoLogger, authenticateToken, getUserProfile);
app.get("/todos", requestInfoLogger, authenticateToken, getTodoList);
app.post("/todos", requestInfoLogger, authenticateToken, addTodoItem);
app.put("/todos/:todoId", requestInfoLogger, authenticateToken, updateTodoItem);
app.delete(
  "/todos/:todoId",
  requestInfoLogger,
  authenticateToken,
  deleteTodoItem
);

//* Boot Sequence
async function startServer() {
  try {
    logger = await initLogger();
    logger.info("Logger initialized");

    await initStorage();
    app.listen(PORT, () => {
      logger.info(`App listening on port ${PORT}`);
    });
  } catch (error) {
    console.error(getISTTimestamp() + " - Fatal startup error:", error);
    process.exit(1);
  }
}

startServer();
