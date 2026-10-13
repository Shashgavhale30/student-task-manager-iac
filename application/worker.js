
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Student Task Manager</title>
<style>
:root{font-family:Inter,"Segoe UI",Arial,sans-serif;color:#20253a;background:#f5f6fb}
*{box-sizing:border-box}
body{margin:0;min-height:100vh}
.container{width:min(100% - 32px,960px);margin:auto;padding:44px 0 24px}
header{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:28px}
.eyebrow{color:#6558e8;font-size:12px;font-weight:800;letter-spacing:2px}
h1{font-size:clamp(32px,5vw,46px);margin:8px 0;letter-spacing:-1.5px}
h1 span{color:#7568ed}
.subtitle,.date,.stat-card span{color:#777e91}
.subtitle{margin:0}
.date{text-align:right;font-size:13px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px}
.stat-card,.panel{background:white;border:1px solid #e9eaf2;border-radius:16px;padding:22px}
.stat-card span{font-size:13px}
.stat-card strong{display:block;margin-top:10px;font-size:30px}
h2{font-size:18px;margin:0}
form{display:flex;gap:12px;margin:18px 0 30px}
input,select,button{font:inherit;border-radius:10px}
input[type=text]{flex:1;min-width:0;border:1px solid #dfe1ec;padding:14px}
button{border:0;background:#6558e8;color:white;font-weight:700;padding:13px 18px;cursor:pointer}
button:hover{background:#5145d0}
.toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px}
select{background:white;border:1px solid #dfe1ec;padding:10px}
#status{font-size:13px;color:#777e91;min-height:18px}
.task-list{display:grid;gap:12px}
.task{display:flex;align-items:center;gap:12px;border:1px solid #ececf4;border-radius:12px;padding:14px}
.task input{width:18px;height:18px;accent-color:#6558e8}
.task-title{flex:1;overflow-wrap:anywhere}
.task.completed .task-title{color:#999;text-decoration:line-through}
.delete{background:#fff0f0;color:#bd3636;padding:8px 12px}
.empty{text-align:center;padding:28px 12px;color:#777e91}
footer{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;color:#8a8fa0;font-size:12px;margin-top:22px}
@media(max-width:600px){.container{padding-top:28px}header{align-items:flex-start;flex-direction:column}.date{text-align:left}.stats{gap:8px}.stat-card{padding:14px}.stat-card strong{font-size:24px}form{flex-direction:column}.panel{padding:16px}}
</style>
</head>
<body>
<main class="container">
<header>
<div>
<p class="eyebrow">STUDENT PRODUCTIVITY</p>
<h1>My Tasks <span>✦</span></h1>
<p class="subtitle">Plan your work. Make progress every day.</p>
</div>
<div class="date" id="today"></div>
</header>
<section class="stats">
<article class="stat-card"><span>Total tasks</span><strong id="total">0</strong></article>
<article class="stat-card"><span>Completed</span><strong id="completed">0</strong></article>
<article class="stat-card"><span>Remaining</span><strong id="remaining">0</strong></article>
</section>
<section class="panel">
<h2>Add a new task</h2>
<form id="form">
<input id="taskInput" type="text" maxlength="200" placeholder="e.g. Complete Terraform assignment" required>
<button type="submit">+ Add task</button>
</form>
<div class="toolbar">
<h2>Your task list</h2>
<select id="filter" aria-label="Filter tasks">
<option value="all">All tasks</option>
<option value="pending">Pending</option>
<option value="completed">Completed</option>
</select>
</div>
<p id="status" role="status"></p>
<div id="tasks" class="task-list"></div>
</section>
<footer><span>Student Task Manager</span><span>Cloudflare Workers + KV + Terraform</span></footer>
</main>
<script>
const API="/api/tasks";
let tasks=[];
const $=id=>document.getElementById(id);
$("today").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric",year:"numeric"});

async function request(url,options){
  const response=await fetch(url,options||{});
  if(!response.ok){
    const error=await response.json().catch(()=>({}));
    throw new Error(error.error||"Request failed: "+response.status);
  }
  return response.json();
}

async function loadTasks(){
  $("status").textContent="Loading tasks...";
  try{
    tasks=await request(API);
    render();
    $("status").textContent="";
  }catch(error){
    $("status").textContent="Could not load tasks. "+error.message;
  }
}

function render(){
  $("total").textContent=tasks.length;
  $("completed").textContent=tasks.filter(t=>t.completed).length;
  $("remaining").textContent=tasks.filter(t=>!t.completed).length;
  const filter=$("filter").value;
  const visible=tasks.filter(t=>filter==="all"||(filter==="pending"&&!t.completed)||(filter==="completed"&&t.completed));
  const list=$("tasks");
  list.replaceChildren();

  if(!visible.length){
    const empty=document.createElement("div");
    empty.className="empty";
    empty.textContent=tasks.length?"No tasks match this filter.":"No tasks yet. Add your first task above!";
    list.appendChild(empty);
    return;
  }

  visible.forEach(task=>{
    const row=document.createElement("div");
    row.className="task"+(task.completed?" completed":"");

    const checkbox=document.createElement("input");
    checkbox.type="checkbox";
    checkbox.checked=task.completed;
    checkbox.setAttribute("aria-label","Complete "+task.title);
    checkbox.addEventListener("change",()=>updateTask(task,{completed:checkbox.checked}));

    const title=document.createElement("span");
    title.className="task-title";
    title.textContent=task.title;

    const del=document.createElement("button");
    del.className="delete";
    del.textContent="Delete";
    del.addEventListener("click",()=>deleteTask(task));

    row.append(checkbox,title,del);
    list.appendChild(row);
  });
}

$("form").addEventListener("submit",async event=>{
  event.preventDefault();
  const title=$("taskInput").value.trim();
  if(!title)return;
  $("status").textContent="Adding task...";
  try{
    await request(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title})});
    $("taskInput").value="";
    await loadTasks();
    $("status").textContent="Task added successfully.";
  }catch(error){$("status").textContent="Could not add task. "+error.message;}
});

async function updateTask(task,changes){
  try{
    await request(API+"/"+encodeURIComponent(task.id),{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(changes)});
    await loadTasks();
  }catch(error){$("status").textContent="Could not update task. "+error.message;render();}
}

async function deleteTask(task){
  if(!confirm('Delete "'+task.title+'"?'))return;
  try{
    await request(API+"/"+encodeURIComponent(task.id),{method:"DELETE"});
    await loadTasks();
    $("status").textContent="Task deleted successfully.";
  }catch(error){$("status").textContent="Could not delete task. "+error.message;}
}

$("filter").addEventListener("change",render);
loadTasks();
</script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Serve the web interface
    if (path === "/" && request.method === "GET") {
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8"
        }
      });
    }

    try {
      // List tasks
      if (path === "/api/tasks" && request.method === "GET") {
        const tasks = await env.TASKS_KV.get("tasks", "json") || [];
        return jsonResponse(tasks);
      }

      // Create task
      if (path === "/api/tasks" && request.method === "POST") {
        const body = await request.json();
        const title = typeof body.title === "string" ? body.title.trim() : "";

        if (!title) {
          return jsonResponse({ error: "Task title is required" }, 400);
        }

        const tasks = await env.TASKS_KV.get("tasks", "json") || [];
        const task = {
          id: crypto.randomUUID(),
          title,
          completed: false,
          createdAt: new Date().toISOString()
        };

        tasks.push(task);
        await env.TASKS_KV.put("tasks", JSON.stringify(tasks));
        return jsonResponse(task, 201);
      }

      // Update or delete task by ID
      const match = path.match(/^\/api\/tasks\/([^/]+)$/);

      if (match) {
        const id = decodeURIComponent(match[1]);
        const tasks = await env.TASKS_KV.get("tasks", "json") || [];
        const index = tasks.findIndex(task => task.id === id);

        if (index === -1) {
          return jsonResponse({ error: "Task not found" }, 404);
        }

        if (request.method === "PUT") {
          const body = await request.json();

          if (typeof body.title === "string") {
            const title = body.title.trim();
            if (!title) {
              return jsonResponse({ error: "Task title cannot be empty" }, 400);
            }
            tasks[index].title = title;
          }

          if (typeof body.completed === "boolean") {
            tasks[index].completed = body.completed;
          }

          await env.TASKS_KV.put("tasks", JSON.stringify(tasks));
          return jsonResponse(tasks[index]);
        }

        if (request.method === "DELETE") {
          const deleted = tasks.splice(index, 1)[0];
          await env.TASKS_KV.put("tasks", JSON.stringify(tasks));
          return jsonResponse({ message: "Task deleted successfully", task: deleted });
        }

        if (request.method === "GET") {
          return jsonResponse(tasks[index]);
        }
      }

      return jsonResponse({ error: "Route not found" }, 404);
    } catch (error) {
      return jsonResponse({ error: "Internal server error" }, 500);
    }
  }
};
