package seis.capability

default allow := false

allow if {
  input.domain_id != ""
  input.lane != ""
  count(input.plugins) >= 3
  count(input.quality_gates) >= 5
  input.agent_role != ""
  input.user_approved == true
  input.authenticated == true
  input.permission_scope != "unknown"
}

deny contains reason if {
  count(input.plugins) < 3
  reason := "domain must route to at least three task-relevant plugins or tools"
}

deny contains reason if {
  count(input.quality_gates) < 5
  reason := "domain must define at least five quality gates"
}

deny contains reason if {
  input.user_approved != true
  reason := "activation requires explicit user approval"
}

deny contains reason if {
  input.permission_scope == "unknown"
  reason := "permission scope must be known before MCP/plugin/LLM activation"
}
