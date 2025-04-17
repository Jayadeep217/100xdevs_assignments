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
    4. Search task (GET /search-task?id=TaskID)
    5. List all tasks (GET /list)
    `);
});

app.get("/search-task", function (req, res) {
  if (req.query.id) {
    const task_id = req.query.id;
    const search_idx = tasks.findIndex((task) => task.task_id === task_id);
    if (search_idx !== -1) {
      res.status(200).json({ message: `${tasks[search_idx]}` });
    } else {
      res.status(404).json({ error: "Task not found ❌" });
    }
  } else {
    res.status(400).json({ error: "Task id not provided ❌" });
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
    res.status(200).json({ message: `Task added ✅. Task ID is ${task_id}` });
  } else {
    res.status(400).json({ error: "Task Not added ❌. Task is not provided!" });
  }
});

app.post("/update-task", function (req, res) {
  if (req.query.id) {
    const task_id = req.query.id;
    const task_title = req.query.title;
    const task_desc = req.query.desc;
    const update_idx = tasks.findIndex((task) => task.task_id === task_id);
    if (update_idx !== -1) {
      if (task_title !== undefined) {
        tasks[update_idx].task_title = task_title;
      }
      if (task_desc !== undefined) {
        tasks[update_idx].task_desc = task_desc;
      }
      res
        .status(200)
        .json({ message: "Task updated ✅ ", data: `${tasks[update_idx]}` });
    } else {
      res.status(404).json({ error: "Task not found ❌" });
    }
  } else {
    res.status(400).json({ error: "Task id not provided ❌ " });
  }
});

app.delete("/delete-task", function (req, res) {
  if (req.query.id) {
    const task_id = req.query.id;
    const delete_idx = tasks.findIndex((task) => task.task_id === task_id);
    tasks.splice(delete_idx, 1);
    res.status(200).json({ message: "Task delete successfully ✅ " });
  } else {
    res.status(400).json({ error: "Task id not provided ❌ " });
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
