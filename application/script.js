
const API_URL =
  "https://student-task-manager.co-2023-srgavhale.workers.dev/api/tasks";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const deadlineInput = document.getElementById("deadlineInput");
const taskList = document.getElementById("taskList");
const statusMessage = document.getElementById("statusMessage");
const filterTasks = document.getElementById("filterTasks");

let tasks = [];

// ---- deadline-driven priority ----------------------------------------
// Returns days from today (0 = today, negative = overdue)
function daysUntil(dateString) {
  if (!dateString) return null;
  const due = new Date(dateString + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
}

// Priority is derived purely from the deadline:
// overdue or due today -> high, within 3 days -> medium, else low
function priorityFor(deadline) {
  const days = daysUntil(deadline);
  if (days === null) return "low";
  if (days <= 0) return "high";
  if (days <= 3) return "medium";
  return "low";
}

const PRIORITY_LABEL = { high: "🔴 High", medium: "🟡 Medium", low: "🟢 Low" };

function deadlineLabel(task) {
  const days = daysUntil(task.deadline);
  if (days === null) return null;
  const date = new Date(task.deadline + "T00:00:00");
  const formatted = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (days < 0) return { text: `⏰ Overdue · ${formatted} (${Math.abs(days)}d late)`, cls: "overdue" };
  if (days === 0) return { text: `⏰ Due today`, cls: "overdue" };
  if (days === 1) return { text: `⏰ Tomorrow · ${formatted}`, cls: "due-soon" };
  if (days <= 3) return { text: `⏰ ${days}d left · ${formatted}`, cls: "due-soon" };
  return { text: `📅 ${formatted}`, cls: "" };
}

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
  const urgent = tasks.filter(
    task => !task.completed && priorityFor(task.deadline) === "high"
  ).length;

  document.getElementById("totalCount").textContent = tasks.length;
  document.getElementById("completedCount").textContent = completed;
  document.getElementById("remainingCount").textContent =
    tasks.length - completed;
  document.getElementById("urgentCount").textContent = urgent;

  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  document.getElementById("progressPercent").textContent = `${percent}%`;
  document.getElementById("progressRing").style.strokeDashoffset =
    213.6 * (1 - percent / 100);
}

function renderTasks() {
  taskList.replaceChildren();
  updateStats();

  const filter = filterTasks.value;
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const visibleTasks = tasks
    .filter(task => {
      if (filter === "pending") return !task.completed;
      if (filter === "completed") return task.completed;
      return true;
    })
    // sort: incomplete first, then by priority (i.e. nearest deadline)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const pa = priorityOrder[priorityFor(a.deadline)];
      const pb = priorityOrder[priorityFor(b.deadline)];
      if (pa !== pb) return pa - pb;
      return 0;
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

    const priority = priorityFor(task.deadline);
    item.classList.add(`priority-${priority}`);
    if (!task.completed && daysUntil(task.deadline) !== null && daysUntil(task.deadline) <= 0) {
      item.classList.add("overdue");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete ${task.title}`);
    checkbox.addEventListener("change", () => toggleTask(task));

    const main = document.createElement("div");
    main.className = "task-main";

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const priorityBadge = document.createElement("span");
    priorityBadge.className = `badge ${priority}`;
    priorityBadge.textContent = PRIORITY_LABEL[priority];
    meta.appendChild(priorityBadge);

    const dl = deadlineLabel(task);
    if (dl) {
      const dlBadge = document.createElement("span");
      dlBadge.className = `badge deadline ${dl.cls}`;
      dlBadge.textContent = dl.text;
      meta.appendChild(dlBadge);
    }

    main.append(title, meta);

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteTask(task));

    item.append(checkbox, main, deleteButton);
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
      body: JSON.stringify({ title, deadline: deadlineInput.value || null })
    });

    taskInput.value = "";
    deadlineInput.value = "";
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
