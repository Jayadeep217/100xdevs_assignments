const express = require("express");
const { customAlphabet } = require("nanoid");

const app = express();
const PORT = 32121;
const TOKEN_SIZE = 14;
const users = [
  {
    username: "user",
    password: "pass",
  },
  {
    username: "user1",
    password: "pass@123",
  },
  {
    username: "guser65",
    password: "password65",
  },
];

app.use(express.json());

function generateRandomToken() {
  return customAlphabet(
    "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    TOKEN_SIZE
  )();
}

function signupHandler(req, res) {
  const { username, password } = req.body;
  users.push({ username, password });
  res.status(200).json({ mesage: "user signup successful" });
}

function signinHandler(req, res) {
  const { username, password } = req.body;
  const authUser = users.find(
    (user) => user.username === username && user.password === password
  )[0];
  if (authUser) {
    authUser.token = generateRandomToken();
    res.status(200).json({
      message: authUser.username + " is authenticated",
      authToken: authUser.token,
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
}

function displayAllUsers(req, res) {
  res.status(200).json({ users: users });
}

app.post("/signup", signupHandler);
app.post("/signin", signinHandler);
app.get("/users", displayAllUsers);

function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
