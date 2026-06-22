(module
  (func $deploy_safe (param $has_domain i32) (param $has_ledger i32) (result i32)
    local.get $has_domain
    local.get $has_ledger
    i32.and)
  (export "deploy_safe" (func $deploy_safe)))
