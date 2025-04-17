const express = require("express");
const nanoid = require("nanoid");
const app = express();

const PORT = 3000;

const tasks = [];

app.get("/", function (req, res) {
  res.send(`
    TO-DO App 🚀🚀🚀‼️
    1. Add task (POST /add-task?title=TaskTitle&desc=TaskDescription)
    2. Update task (POST /update-task?id=TaskID&title=NewTaskTitle&desc=NewTaskDescription)
    3. Delete task (DELETE /delete-task?id=TaskID)
    4. Search task (GET /search?id=TaskID)
    5. List all tasks (GET /list)
    `);
});

app.get("/search", function (req, res) {
  if (req.query.id) {
    const task_id = req.query.id;
    let search_idx = -1;
    tasks.forEach((task, index) => {
      if (task.task_id === task_id) {
        search_idx = index;
      } else {
        res.send("Task not found ❌");
      }
    });
    res.send(tasks[search_idx]);
  } else {
    res.send("Task id not provided ❌");
  }
});

app.post("/add-task", function (req, res) {
  if (req.query.title) {
    const task_id = autoGenerateTaskId();
    const task_title = req.query.title;
    const task_desc = req.query.desc;
    const task = {
      task_id: task_id,
      task_title: task_title,
      task_desc: task_desc,
    };
    tasks.push(task);
    res.status(200).json({ message: `Task added ✅. Task ID is "${task_id}"` });
  } else {
    res.status(400).json({ error: "Task Not added ❌. Task is not provided!" });
  }
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
      } else {
        res.send("Task not found ❌");
      }
    });
    res.send("Task updated ✅ ");
  } else {
    res.send("Task id not provided ❌ ");
  }
});

app.delete("/delete-task", function (req, res) {
  if (req.query.id) {
    const task_id = req.query.id;
    let delete_idx = -1;
    tasks.forEach((task, index) => {
      if (task.task_id === task_id) {
        delete_idx = index;
      }
    });
    tasks.splice(delete_idx, 1);
    res.send("Task delete ❌ ");
  } else {
    res.send("Task id not provided ❌ ");
  }
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
