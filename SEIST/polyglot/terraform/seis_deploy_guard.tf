variable "seis_server_target_confirmed" {
  type        = bool
  default     = false
  description = "SEIS live upload can proceed only after domain, host, path, and rollback are confirmed."
}

locals {
  seis_package_path = "dist/seis-static.zip"
  seis_live_upload_blocked = var.seis_server_target_confirmed ? false : true
}

output "seis_live_upload_blocked" {
  value = local.seis_live_upload_blocked
}
