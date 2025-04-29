const express = require("express");

const app = express();
const PORT = 3000;

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

app.get("/addition", function (req, res) {
  const a = parseInt(req.query.a);
  const b = parseInt(req.query.b);
  const ans = a + b;
  res.json({
    ans: ans,
  });
});

app.get("/subtraction", function (req, res) {
  const a = parseInt(req.query.a);
  const b = parseInt(req.query.b);
  const ans = a - b;
  res.json({
    ans: ans,
  });
});

app.get("/multiplication", function (req, res) {
  const a = parseInt(req.query.a);
  const b = parseInt(req.query.b);
  const ans = a * b;
  res.json({
    ans: ans,
  });
});

app.get("/division", function (req, res) {
  const a = parseInt(req.query.a);
  const b = parseInt(req.query.b);
  const ans = a / b;
  res.json({
    ans: ans,
  });
});

// Start the server
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
