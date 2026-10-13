
variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "worker_name" {
  description = "Student task manager Worker name"
  type        = string
  default     = "student-task-manager"
}

variable "kv_namespace_name" {
  description = "Workers KV namespace name"
  type        = string
  default     = "student-task-storage"
}
