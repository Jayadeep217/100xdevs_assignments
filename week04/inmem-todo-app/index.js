const express = require("express");
const nanoid = require("nanoid");
const app = express();

const PORT = 3000;

const tasks = [];

//route handlers
app.get("/", function (req, res) {
  res.send(`
    TO-DO App 🚀🚀🚀‼️
    1. Add task
    2. Update task
    3. Delete task
    4. Search task
    5. list all task
    `);
});

app.post("/search", function (req, res) {
  const task_id = req.query.id;
  res.send("Task not found or Task id not provided ❌");
});

app.post("/add-task", function (req, res) {
  const task_id = autoGenerateTaskId();
  const task_title = req.query.title;
  const task_desc = req.query.desc;
  const task = {
    task_id: task_id,
    task_title: task_title,
    task_desc: task_desc,
  };
  tasks.push(task);

  res.send(`Task added ✅. Task ID is "${task_id}"`);
});

app.post("/update-task", function (req, res) {
  if (req.query.id) {
    const task_id = req.query.id;
    const task_title = req.query.title;
    const task_desc = req.query.desc;
    tasks.forEach((task) => {
      if (task.task_id === task_id) {
        task.task_title = task_title;
        task.task_desc = task_desc;
      }
    });
    res.send("Task updated ✅ ");
  } else {
    res.send("Task id not provided ❌ ");
  }
});

app.delete("/delete-task", function (req, res) {
  const task_id = req.query.id;
  res.send("Task delete ❌ ");
});

app.get("/list", function (req, res) {
  res.send(tasks);
});

app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}`);
});

function autoGenerateTaskId() {
  return nanoid.customAlphabet(
    "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    8
  )();
}
