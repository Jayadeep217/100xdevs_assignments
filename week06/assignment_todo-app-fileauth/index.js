const express = require("express");
const fs = require("fs").promises;
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");
const path = require("path");
const initLogger = require("./logger");

const app = express();
const PORT = 4676;
const JWT_SECRET = "Sa2d@-#RSDZJt_657as8";
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

      const fileContent = await fs.readFile(TODOS_FILE, "utf-8");
      const parsedData = JSON.parse(fileContent);
      Object.assign(data, parsedData);
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
  logger.info(`${req.method} - ${req.url}`);
  next();
}

function generateRandomUserID() {
  return nanoid(USERID_SIZE);
}

function registerUser(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password both are required" });
    }

    const usernameExists = Object.entries(data).some(
      ([, value]) => value.username === username
    );
    if (usernameExists) {
      return res.status(400).json({ message: "Username already exists." });
    }

    const userID = generateRandomUserID();
    data[userID] = { username, password, todos: [] };
    console.log(data);
    return res.status(200).json({ message: "user signup successful" });
  } catch (error) {
    logger.error("signup failed: " + error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

function loginUser(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password both are required" });
    }

    const userEntry = Object.entries(data).find(
      ([, value]) => value.username === username && value.password === password
    );

    if (!userEntry) {
      res.status(401).json({ message: "Invalid credentials" });
    }

    const authToken = jwt.sign(
      { username: username, userid: userEntry },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      message: "Login successful!",
      authToken: authToken,
    });
  } catch (error) {
    logger.error("Login failed: " + error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or malformed Authorization header" });
    }

    const token = authHeader.split(" ")[1];

    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

function getUserProfile(req, res) {
  res.json({ message: "User authenticated" });
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
    app.listen(PORT, function (error) {
      if (error) {
        logger.error("Server startup failed!", error);
      } else {
        logger.info(`App listening on port ${PORT}`);
      }
    });
  } catch (error) {
    logger.error("Fatal startup error:", error);
    process.exit(1);
  }
}

startServer();
