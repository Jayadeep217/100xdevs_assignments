const express = require("express");
const { Usermodel, Todomodel } = require("./db");
const mongoose = require("mongoose");

const PORT = 32121;
const MONGODB_IP = "127.0.0.1";
const MONGODB_PORT = "27017";
const DB_NAME = "todo-app-mongodb";
const MONGODB_URI = `mongodb://${MONGODB_IP}:${MONGODB_PORT}/${DB_NAME}`;

const app = express();

app.use(express.json());

mongoose.connect(MONGODB_URI);

async function registerUser(req, res) {
  try {
    const { username, password, email } = req.body;
    Usermodel.insertOne({
      username: username,
      password: password,
      email: email,
    });
    res.json({ message: "SignUp successful" });
  } catch (error) {
    console.error("Signup failed!\n", error);
  }
}

function loginUser() {}
function createTodo() {
  Todomodel.insertOne();
}
function getTodos() {}

app.post("/signup", registerUser);
app.post("/signin", loginUser);
app.post("/todo", createTodo);
app.get("/todos", getTodos);

app.listen(PORT, function (error) {
  if (error) {
    console.error("startup failed!", error);
  } else {
    console.info(`App started on port ${PORT}`);
  }
});
