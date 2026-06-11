local capability = {
  id = "windows-lua-scripting",
  languages = { "Lua", "PowerShell", "Rust", "SQL" },
  quality_gates = {
    "lua_syntax_when_available",
    "windows_path_safety",
    "permission_scope",
    "offline_fallback",
    "event_log_awareness"
  },
  offline_helper = true,
  remote_bridge = true
}

return capability
