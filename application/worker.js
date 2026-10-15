
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700&display=swap" rel="stylesheet">
<style>
:root{--ink:#2b2620;--muted:#8a8172;--accent:#e2582f;--accent-dark:#c74722;--accent-soft:#fdeae2;--paper:#faf6ef;--card:#fffdf9;--line:#e9e1d2;--green:#2f7d4f;--green-soft:#e8f3ec}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;font-family:"Nunito Sans","Segoe UI",sans-serif;color:var(--ink);background:radial-gradient(ellipse 60% 40% at 85% -10%,#fdeee2 0%,transparent 70%),radial-gradient(ellipse 50% 35% at 0% 0%,#fdf3e0 0%,transparent 70%),var(--paper)}
h1,h2,button,.eyebrow,.stat-card strong{font-family:"Sora","Segoe UI",sans-serif}
.container{width:min(100% - 32px,720px);margin:auto;padding:56px 0 32px}
header{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:28px}
.eyebrow{color:var(--accent);font-size:12px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;margin:0}
h1{font-size:clamp(34px,6vw,52px);margin:8px 0 4px;letter-spacing:-1.5px;line-height:1.05}
h1 span{color:var(--accent)}
.subtitle{color:var(--muted);margin:0;font-size:15px}
.date{text-align:right;font-size:13px;color:var(--muted);font-weight:600;white-space:nowrap}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}
.stat-card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px;box-shadow:0 2px 8px rgba(120,96,60,.06)}
.stat-card span{font-size:12.5px;font-weight:600;color:var(--muted)}
.stat-card strong{display:block;margin-top:6px;font-size:26px;letter-spacing:-.5px}
.panel{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:26px;box-shadow:0 4px 20px rgba(120,96,60,.07)}
h2{font-size:16px;margin:0;letter-spacing:-.3px}
form{display:flex;gap:10px;margin:16px 0 28px}
input,select,button{font:inherit;border-radius:12px}
input[type=text]{flex:1;min-width:0;border:1.5px solid var(--line);background:#fff;padding:13px 16px;outline:none;transition:border-color .15s ease,box-shadow .15s ease}
input::placeholder{color:#b8ae9c}
input[type=text]:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
button{border:0;background:var(--accent);color:#fff;font-weight:700;font-size:14.5px;padding:13px 20px;cursor:pointer;transition:background .15s ease,transform .1s ease}
button:hover{background:var(--accent-dark)}
button:active{transform:scale(.98)}
.toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;border-top:1px dashed var(--line);padding-top:20px}
select{background:#fff;border:1.5px solid var(--line);padding:9px 12px;font-size:14px;font-weight:600;color:var(--ink);cursor:pointer;outline:none}
select:focus{border-color:var(--accent)}
#status{font-size:13px;color:var(--muted);font-weight:600;min-height:18px;margin:12px 0 4px}
.task-list{display:grid;gap:10px}
.task{display:flex;align-items:center;gap:14px;border:1px solid var(--line);border-radius:12px;padding:14px 16px;background:#fff;transition:border-color .15s ease}
.task:hover{border-color:#ddd1b8}
.task input[type=checkbox]{width:20px;height:20px;accent-color:var(--green);cursor:pointer}
.task.completed{background:var(--green-soft);border-color:#cfe4d6}
.task-title{flex:1;overflow-wrap:anywhere;font-weight:600}
.task.completed .task-title{color:var(--muted);text-decoration:line-through;font-weight:400}
.delete{background:transparent;color:#b3513b;font-size:13px;padding:7px 12px}
.delete:hover{background:var(--accent-soft)}
.empty{text-align:center;padding:32px 12px;color:var(--muted);font-weight:600}
footer{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;color:var(--muted);font-size:12px;font-weight:600;margin-top:26px}
@media(max-width:600px){.container{padding-top:32px}header{align-items:flex-start;flex-direction:column}.date{text-align:left}.stats{gap:8px}.stat-card{padding:12px 14px}.stat-card strong{font-size:22px}form{flex-direction:column}form button{width:100%}.panel{padding:18px}}
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
