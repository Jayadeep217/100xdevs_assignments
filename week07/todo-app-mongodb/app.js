const express = require("express");
const { mongoose, ObjectId } = require("mongoose");

const { User, Todo } = require("./db");
const { authenticateToken, generateToken } = require("./auth");

const PORT = 4676;
const MONGODB_IP = "127.0.0.1";
const MONGODB_PORT = "27017";
const DB_NAME = "todo-app-mongodb";
const MONGODB_URI = `mongodb://${MONGODB_IP}:${MONGODB_PORT}/${DB_NAME}`;
const TODO_STATUS = { done: 0, todo: 1, "in-progress": 2 };

const app = express();

app.use(express.json());

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

async function registerUser(req, res) {
  try {
    const { email, username, password } = req.body;
    await User.insertOne({
      email: email,
      username: username,
      password: password,
    });
    res.json({ message: "SignUp successful" });
  } catch (error) {
    console.error("Signup failed!\n", error);
    res.status(403).json({ message: "SignUp Failed!" });
  }
}

async function loginUser(req, res) {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      username: username,
      password: password,
    });

    const authToken = generateToken(user._id.toString());

    res.status(200).json({
      message: "Login successful!",
      authToken: authToken,
    });
  } catch (error) {
    console.error("Login failed!\n", error);
    res.status(403).json({ message: "Login Failed!" });
  }
}

async function getUserProfile(req, res) {
  try {
    const profile = await User.findById(req.userid);
    res.json(profile);
  } catch (error) {
    console.error("getUserProfile failed!\n", error);
    res.status(403).json({ message: "getUserProfile Failed!" });
  }
}

async function createTodo(req, res) {
  try {
    const { title, description, status } = req.body;

    const todo = await Todo.insertOne({
      title: title,
      description: description,
      status: TODO_STATUS[status],
      userid: req.userid,
    });

    res.status(200).json({
      message: "Todo added successfully!",
      todo: todo,
    });
  } catch (error) {
    console.error("Create Todo failed!\n", error);
    res.status(403).json({ message: "Create Todo Failed!" });
  }
}

async function getTodos(req, res) {
  try {
    const todos = await Todo.find({ userid: req.userid });
    res.status(200).json(todos);
  } catch (error) {
    console.error("Get all Todos failed!\n", error);
    res.status(403).json({ message: "Get all Todos Failed!" });
  }
}

app.post("/auth/signup", registerUser);
app.post("/auth/signin", loginUser);
app.get("/users/me", authenticateToken, getUserProfile);
app.post("/todos/new", authenticateToken, createTodo);
app.get("/todos/list", authenticateToken, getTodos);

app.listen(PORT, function (error) {
  if (error) {
    console.error("startup failed!", error);
  } else {
    console.info(`App started on port ${PORT}`);
  }
});
