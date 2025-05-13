const express = require("express");
const fs = require("fs").promises;
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");
const path = require("path");

const app = express();
const PORT = 54676;
const JWT_SECRET = "SECRET_RSDZJt_6578";
const USERID_SIZE = 12;

const DATA_DIR = path.join(__dirname, "data");
const TODOS_FILE = path.join(DATA_DIR, "todos.json");

const data = {};

app.use(express.json());

//* functions
function getCurrentDateTime() {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); //Month is 0-indexed
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}/${month}/${day}T${hours}:${minutes}:${seconds}`;
}

async function initStorage() {
  console.info(getCurrentDateTime() + " - Storage Initialization...");
  try {
    console.info(getCurrentDateTime() + " - Data dir creation in progress...");
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      console.info(getCurrentDateTime() + " - Checking access to data...");
      await fs.access(TODOS_FILE);
      console.info(
        getCurrentDateTime() + " - Data file accessible. Loading Data..."
      );
    } catch {
      console.warn(
        getCurrentDateTime() + " - Data file not found! Starting afresh!"
      );
      await fs.writeFile(TODOS_FILE, JSON.stringify(data)); // Create with empty object if doesn't exist
    }
  } catch (error) {
    console.error("Failed to initialize storage", error);
    process.exit(1); // Exit if storage can't be initialized
  }
}

function requestInfoLogger(req, res, next) {
  console.log(getCurrentDateTime(), req.method, req.url);
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
  if (authUID) {
    const authToken = jwt.verify({ username: username }, JWT_SECRET);
    res.status(200).json({
      message: "Login successful!",
      authToken: authToken,
    });
  }
}

function authenticateToken(req, res, next) {}

function getUserProfile(req, res) {}

function getTodoList(req, res) {}

function addTodoItem(req, res) {}

function updateTodoItem(req, res) {}

function deleteTodoItem(req, res) {}

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

async function startServer() {
  try {
    await initStorage();
    app.listen(PORT, () => {
      console.log(getCurrentDateTime() + ` - App listening on port ${PORT}`);
    });
  } catch (error) {
    console.error(getCurrentDateTime() + " - Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
