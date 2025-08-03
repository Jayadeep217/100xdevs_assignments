const express = require("express");
const { initLogger } = require("./logger");

const app = express();

app.use(express.json());

function registerUser() {}
function loginUser() {}
function getUserProfile() {}
function getTodoList() {}
function addTodoItem() {}
function getTodoById() {}
function updateTodoItem() {}
function deleteTodoItem() {}

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

const logger = await initLogger();
await closeLogger(logger);