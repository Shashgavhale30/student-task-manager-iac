
output "worker_name" {
  value = cloudflare_workers_script.task_manager.script_name
}

output "kv_namespace_id" {
  value = cloudflare_workers_kv_namespace.tasks.id
}
