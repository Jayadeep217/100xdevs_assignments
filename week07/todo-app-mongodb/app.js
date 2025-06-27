const express = require("express");
const mongoose = require("mongoose");

const { User, Todo } = require("./db");
const { authenticateToken } = require("./auth");

const PORT = 4676;
const MONGODB_IP = "127.0.0.1";
const MONGODB_PORT = "27017";
const DB_NAME = "todo-app-mongodb";
const MONGODB_URI = `mongodb://${MONGODB_IP}:${MONGODB_PORT}/${DB_NAME}`;

const app = express();

app.use(express.json());

mongoose.connect(MONGODB_URI);

async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;
    await User.insertOne({
      name: name,
      email: email,
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
    const { name, password } = req.body;
    await User.findOne({
      name: name,
      password: password,
    });
    res.json({ message: "Login successful" });
  } catch (error) {
    console.error("Login failed!\n", error);
    res.status(403).json({ message: "Login Failed!" });
  }
}

async function getUserProfile(req, res) {
  try {
    const { name, password } = req.body;
    await User.findOne({
      name: name,
      password: password,
    });
    res.json( );
  } catch (error) {
    console.error("Login failed!\n", error);
    res.status(403).json({ message: "Login Failed!" });
  }
}

async function createTodo() {
  try {
    const { title, status } = req.body;
    await Todo.insertOne({
      title: title,
      status: status,
      userid: ObjectId,
    });
  } catch (error) {}
}

async function getTodos() {
  try {
    Todo.find({});
  } catch (error) {}
}

app.post("/auth/signup", registerUser);
app.post("/auth/signin", loginUser);
app.post("/auth/me", authenticateToken, getUserProfile);
app.post("/todos/new", authenticateToken, createTodo);
app.get("/todos/list", authenticateToken, getTodos);

app.listen(PORT, function (error) {
  if (error) {
    console.error("startup failed!", error);
  } else {
    console.info(`App started on port ${PORT}`);
  }
});
