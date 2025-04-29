const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

function getCurrentDateTime() {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year}T${hours}:${minutes}:${seconds}`;
}

function requestInfoLogger(req, res, next) {
  console.log(req.method, req.url, getCurrentDateTime());
  next();
}

app.use(requestInfoLogger);

app.get("/", function (req, res) {
  res.json({
    message: "CORS TESTING",
  });
});

app.post("/sum", function (req, res) {
  const a = parseInt(req.body.a);
  const b = parseInt(req.body.b);

  res.json({
    ans: a + b,
  });
});

app.listen(3120, () => {
  console.log("Server listening on port 3120");
});
