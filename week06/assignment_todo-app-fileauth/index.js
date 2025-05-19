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
const TODOID_SIZE = 8;
const ALLOWED_STATUSES = ["todo", "in-progress", "done"];

const DATA_DIR = path.join(__dirname, "data");
const TODOS_FILE = path.join(DATA_DIR, "todos.json");

const data = {};
let logger;

app.use(express.json());

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

function internalServerError(res, funcName, error) {
  logger.error(`${funcName} failed: ` + error);
  res.status(500).json({ error: "Internal Server Error" });
}

function generateRandomID(size) {
  return nanoid(size);
}

async function saveToFile() {
  try {
    const temp_file = `${TODOS_FILE}.tmp`;
    await fs.writeFile(temp_file, JSON.stringify(data, null, 2));
    await fs.rename(temp_file, TODOS_FILE);
  } catch (error) {
    logger.error("Failed to save tasks:", error);
  }
}

async function registerUser(req, res) {
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

    const userID = generateRandomID(USERID_SIZE);
    data[userID] = { username, password, todos: {} };
    await fs.writeFile(TODOS_FILE, JSON.stringify(data, null, 2));
    res.status(200).json({ message: "user signup successful" });
  } catch (error) {
    internalServerError(res, "registerUser", error);
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
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const [userId, userData] = userEntry;
    const authToken = jwt.sign(
      { userId, username: userData.username },
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
    internalServerError(res, "loginUser", error);
  }
}

//middleware
function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    const token = jwt.verify(authHeader, JWT_SECRET);
    req.userId = token.userId;
    req.username = token.username;
    next();
  } catch (error) {
    logger.error("Authentication failure:" + error);
    res.status(403).json({ error: error });
  }
}

function getUserProfile(req, res) {
  res.status(200).json({ userId: req.userId, username: req.username });
}

function getTodoList(req, res) {
  try {
    let todos = data[req.userId]["todos"];
    res.status(200).json(todos);
  } catch (error) {
    internalServerError(res, "getUserProfile", error);
  }
}

function searchTodos(req, res) {
  try {
    const userId = req.userId;
    const { todoId, title } = req.body;

    if (!todoId && !title)
      return res.status(400).json({ error: "Todo ID or title is required!" });

    const userTodos = data[userId]?.todos;

    if (!userTodos)
      return res.status(404).json({ error: "Todo not found for this user" });

    let todo;
    if (todoId) {
      todo = userTodos[todoId];
      if (!todo) {
        return res.status(404).json({ error: "Todo not found for this user" });
      }
    } else if (title) {
      todo = Object.values(userTodos).find((item) => item.title === title);
      if (!todo) {
        return res
          .status(404)
          .json({ error: "Todo with that title not found" });
      }
    }
    res.status(200).json(todo);
  } catch (error) {
    internalServerError(res, "searchTodos", error);
  }
}

async function addTodoItem(req, res) {
  try {
    const userId = req.userId;
    const { title, desc, status } = req.body;

    if (!title)
      return res.status(400).json({ error: "Todo title is not provided!" });

    const newTodoId = generateRandomID(TODOID_SIZE);
    data[userId]["todos"][newTodoId] = {
      title: title,
      desc: desc || "",
      status:
        status !== undefined && ALLOWED_STATUSES.includes(status)
          ? status
          : "todo",
    };

    await saveToFile();
    res
      .status(200)
      .json({ message: "New task added successfully", todoId: newTodoId });
  } catch (error) {
    internalServerError(res, "addTodoItem", error);
  }
}

async function updateTodoItem(req, res) {
  try {
    const userId = req.userId;
    const { todoId } = req.body;

    if (!todoId) return res.status(400).json({ error: "TodoId is required!" });

    const userTodos = data[userId]?.todos;

    if (!userTodos || !userTodos[todoId])
      return res.status(404).json({ error: "Todo not found for this user" });

    const updates = {};

    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.desc !== undefined) updates.desc = req.body.desc;
    if (req.body.status !== undefined) {
      if (!ALLOWED_STATUSES.includes(req.body.status)) {
        return res.status(400).json({ error: "Invalid status provided!" });
      }
      updates.status = req.body.status;
    }
    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields provided for update" });
    }

    Object.assign(userTodos[todoId], updates);

    await saveToFile();
    res.status(200).json({ message: "Todo Updated successfully" });
  } catch (error) {
    internalServerError(res, "updateTodoItem", error);
  }
}

async function deleteTodoItem(req, res) {
  try {
    const userId = req.userId;
    const { todoId } = req.body;

    if (!todoId) return res.status(400).json({ error: "TodoId is required!" });

    const userTodos = data[userId]?.todos;

    if (!userTodos || !userTodos[todoId])
      return res.status(404).json({ error: "Todo not found for this user" });

    delete userTodos[todoId];

    await saveToFile();
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    internalServerError(res, "deleteTodoItem", error);
  }
}

app.post("/auth/signup", requestInfoLogger, registerUser);
app.post("/auth/signin", requestInfoLogger, loginUser);
app.get("/users/me", requestInfoLogger, authenticateToken, getUserProfile);
app.get("/todos/search", requestInfoLogger, authenticateToken, searchTodos);
app.get("/todos/list", requestInfoLogger, authenticateToken, getTodoList);
app.post("/todos/new", requestInfoLogger, authenticateToken, addTodoItem);
app.put("/todos/update", requestInfoLogger, authenticateToken, updateTodoItem);
app.delete(
  "/todos/delete",
  requestInfoLogger,
  authenticateToken,
  deleteTodoItem
);

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
