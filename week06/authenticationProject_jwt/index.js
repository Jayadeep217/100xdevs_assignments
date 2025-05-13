const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();

const JWT_SECRET = "sdfsdfdfdsfdsf";
const PORT = 32121;
const users = [
  { username: "user", password: "pass" },
  { username: "user1", password: "pass@123" },
  { username: "guser65", password: "password65" },
];

app.use(express.json());

function getCurrentDateTime() {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year}T${hours}:${minutes}:${seconds}`;
}

function requestInfoLogger(req, res, next) {
  console.log(req.method, req.url, getCurrentDateTime());
  next();
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
  );
  if (authUser) {
    const authToken = jwt.sign({ username: username }, JWT_SECRET);
    res.status(200).json({
      message: authUser.username + " is authenticated",
      authToken: authToken,
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
}

function displayAllUsers(req, res) {
  res.status(200).json({ users: users });
}

function checkAuthorization(req, res, next) {
  const authToken = req.headers["authtoken"];
  if (authToken) {
    const verifyToken = jwt.verify(authToken, JWT_SECRET);
    if (verifyToken) {
      req.username = verifyToken.username;
      next();
    } else {
      res.status(401).send({
        message: "Unauthorized",
      });
    }
  } else {
    res.status(401).send({
      message: "Authorisation token not provided.",
    });
  }
}

function aboutMe(req, res) {
  const auth_username = req.username;
  const authUser = users.find((user) => user.username === auth_username);
  if (authUser) {
    res.status(200).json({
      username: authUser.username,
      password: authUser.password,
    });
  } else {
    res.status(401).json({ message: "unauthorised" });
  }
}

app.post("/signup", requestInfoLogger, signupHandler);
app.post("/signin", requestInfoLogger, signinHandler);
app.get("/users", requestInfoLogger, displayAllUsers);
app.get("/me", requestInfoLogger, checkAuthorization, aboutMe);

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
