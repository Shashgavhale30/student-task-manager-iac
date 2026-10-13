
const API_URL =
  "https://student-task-manager.co-2023-srgavhale.workers.dev/api/tasks";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const statusMessage = document.getElementById("statusMessage");
const filterTasks = document.getElementById("filterTasks");

let tasks = [];

document.getElementById("today").textContent =
  new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function loadTasks() {
  statusMessage.textContent = "Loading tasks…";

  try {
    tasks = await apiRequest(API_URL);
    renderTasks();
    statusMessage.textContent = "";
  } catch (error) {
    statusMessage.textContent =
      "Could not load tasks. Check your connection and try again.";
  }
}

function updateStats() {
  const completed = tasks.filter(task => task.completed).length;

  document.getElementById("totalCount").textContent = tasks.length;
  document.getElementById("completedCount").textContent = completed;
  document.getElementById("remainingCount").textContent =
    tasks.length - completed;
}

function renderTasks() {
  taskList.replaceChildren();
  updateStats();

  const filter = filterTasks.value;
  const visibleTasks = tasks.filter(task => {
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  if (visibleTasks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = tasks.length === 0
      ? "No tasks yet. Add your first task above!"
      : "No tasks match this filter.";
    taskList.appendChild(empty);
    return;
  }

  visibleTasks.forEach(task => {
    const item = document.createElement("div");
    item.className = `task-item${task.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete ${task.title}`);
    checkbox.addEventListener("change", () => toggleTask(task));

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteTask(task));

    item.append(checkbox, title, deleteButton);
    taskList.appendChild(item);
  });
}

taskForm.addEventListener("submit", async event => {
  event.preventDefault();

  const title = taskInput.value.trim();
  if (!title) return;

  statusMessage.textContent = "Adding task…";

  try {
    await apiRequest(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });

    taskInput.value = "";
    await loadTasks();
    statusMessage.textContent = "Task added successfully.";
  } catch (error) {
    statusMessage.textContent = "Could not add task. Please try again.";
  }
});

async function toggleTask(task) {
  try {
    await apiRequest(`${API_URL}/${encodeURIComponent(task.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed })
    });

    await loadTasks();
  } catch (error) {
    statusMessage.textContent = "Could not update task.";
  }
}

async function deleteTask(task) {
  if (!confirm(`Delete "${task.title}"?`)) return;

  try {
    await apiRequest(`${API_URL}/${encodeURIComponent(task.id)}`, {
      method: "DELETE"
    });

    await loadTasks();
    statusMessage.textContent = "Task deleted successfully.";
  } catch (error) {
    statusMessage.textContent = "Could not delete task.";
  }
}

filterTasks.addEventListener("change", renderTasks);

loadTasks();
