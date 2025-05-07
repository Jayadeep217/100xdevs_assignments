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

function aboutMe(req, res) {
  const authToken = req.headers["authtoken"];
  const verifyToken = jwt.verify(authToken, JWT_SECRET);

  const auth_username =  verifyToken.username;
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

app.post("/signup", signupHandler);
app.post("/signin", signinHandler);
app.get("/users", displayAllUsers);
app.get("/me", aboutMe);

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
