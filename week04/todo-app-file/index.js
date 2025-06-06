const express = require("express");
const { customAlphabet } = require("nanoid");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, "data");
const TASKS_FILE = path.join(DATA_DIR, "todo.json");
let tasks = [];

app.use(express.json());

// Initialize storage directory and file
async function initStorage() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(TASKS_FILE);
    } catch {
      await fs.writeFile(TASKS_FILE, "[]"); // Create with empty array if doesn't exist
    }
  } catch (error) {
    console.error("Failed to initialize storage:", error);
    process.exit(1); // Exit if storage can't be initialized
  }
}

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
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Task id not provided" });

  const task = tasks.find((task) => task.task_id === id);
  if (task) {
    res.status(200).json({ task });
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

app.post("/add-task", async (req, res) => {
  const { title, desc } = req.query;
  if (!title)
    return res
      .status(400)
      .json({ error: "Task Not added. Task is not provided!" });

  const task = {
    task_id: generateTaskId(),
    task_title: title,
    task_desc: desc || "",
  };

  tasks.push(task);
  await saveTasksToFile();
  res.status(200).json({ message: `Task added. Task ID is ${task.task_id}` });
});

app.post("/update-task", async (req, res) => {
  const { id, title, desc } = req.query;
  if (!id) return res.status(400).json({ error: "Task id not provided" });

  const index = tasks.findIndex((task) => task.task_id === id);
  if (index === -1) return res.status(404).json({ error: "Task not found" });

  if (title !== undefined) tasks[index].task_title = title;
  if (desc !== undefined) tasks[index].task_desc = desc;
  await saveTasksToFile();

  res.status(200).json({ message: "Task updated", task: tasks[index] });
});

app.delete("/delete-task", async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Task id not provided" });

  const index = tasks.findIndex((task) => task.task_id === id);
  if (index === -1) return res.status(404).json({ error: "Task not found" });

  tasks.splice(index, 1);
  await saveTasksToFile();
  res.status(200).json({ message: "Task deleted successfully" });
});

app.get("/list", function (req, res) {
  res.status(200).json(tasks);
});

async function loadTasksFromFile() {
  try {
    const data = await fs.readFile(TASKS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log("No valid task data found, starting with empty list");
    return [];
  }
}

async function saveTasksToFile() {
  try {
    const tempFile = `${TASKS_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(tasks, null, 2));
    await fs.rename(tempFile, TASKS_FILE);
  } catch (error) {
    console.error("Failed to save tasks:", error);
    throw error;
  }
}

function generateTaskId() {
  return customAlphabet(
    "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    8
  )();
}

// Start the server
async function startServer() {
  try {
    await initStorage();
    tasks = await loadTasksFromFile();
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
