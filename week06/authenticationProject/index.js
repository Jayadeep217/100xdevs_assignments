const express = require("express");

const app = express();
const PORT = 32121;
const users = [
  {
    username: "3245ewtesdf",
    password: "dfg43twerta",
  },
  {
    username: "4536dfgh456",
    password: "fgedrfg346gdsrf36",
  },
  {
    username: "gjhy8jyt8jyt65",
    password: "dfhterbtbwerb3645q",
  },
];

app.use(express.json());

function signupHandler(req, res) {
  const { username, password } = req.query;
  users.push({ username, password });
  res.status(200).json({ mesage: "user signup successful" });
}

function signinHandler(req, res) {
  const { username } = req.query;
  const authUser = users.filter((user) => {
    return user.username === username;
  });
  res.status(200).json({ message: `${authUser} is authenticated` });
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
