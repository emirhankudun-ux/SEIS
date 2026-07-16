#!/usr/bin/env ruby

require "fileutils"
require "json"
require "open3"
require "tmpdir"
require "yaml"

ROOT = File.expand_path("..", __dir__)
GOAL_RELATIVE_PATH = "goals/active/ECO-GOAL-0003--goal-schema-validation-and-ci.yaml"
FIXTURE_FILES = [
  "project.ecosystem.yaml",
  "data/repository-ownership.yaml",
  ".github/workflows/foundation-check.yml",
  "docs/ECOSYSTEM_GOAL_TRACKING.md",
  "docs/REPOSITORY_OWNERSHIP.md",
  "docs/seis-canonical-github-hub.md",
  "docs/adr/0002-ecosystem-governance-bootstrap-ownership.md",
  "schemas/project-ecosystem.schema.json",
  "schemas/repository-ownership.schema.json",
  "schemas/ecosystem-goal.schema.json",
  "packages/seis_platform_swift/Package.swift",
  "scripts/validate-ecosystem-foundation.rb",
  "package.json"
].freeze
FIXTURE_GOAL_FILES = Dir.glob(
  "goals/{active,backlog,blocked,completed,archived}/*.yaml",
  base: ROOT
).freeze

def prepare_fixture(directory)
  (FIXTURE_FILES + FIXTURE_GOAL_FILES).each do |relative_path|
    source = File.join(ROOT, relative_path)
    target = File.join(directory, relative_path)
    FileUtils.mkdir_p(File.dirname(target))
    FileUtils.cp(source, target)
  end
end

def run_validator(directory)
  Open3.capture3(
    "ruby",
    "scripts/validate-ecosystem-foundation.rb",
    chdir: directory
  )
end

def write_yaml(directory, relative_path, value)
  File.write(File.join(directory, relative_path), YAML.dump(value))
end

def assert_rejected(label, expected_error)
  Dir.mktmpdir("seis-ecosystem-foundation-") do |directory|
    prepare_fixture(directory)
    yield directory
    stdout, stderr, status = run_validator(directory)
    if status.success?
      abort "#{label} fixture must fail validation"
    end
    unless stderr.include?(expected_error)
      warn stdout
      warn stderr
      abort "#{label} failure must include #{expected_error.inspect}"
    end
  end
end

def assert_accepted(label)
  Dir.mktmpdir("seis-ecosystem-foundation-") do |directory|
    prepare_fixture(directory)
    yield directory
    stdout, stderr, status = run_validator(directory)
    unless status.success?
      warn stdout
      warn stderr
      abort "#{label} fixture must pass validation"
    end
  end
end

def assert_rejected_with_parent(label, expected_error)
  Dir.mktmpdir("seis-ecosystem-foundation-parent-") do |parent|
    directory = File.join(parent, "repository")
    FileUtils.mkdir_p(directory)
    prepare_fixture(directory)
    yield directory, parent
    stdout, stderr, status = run_validator(directory)
    if status.success?
      abort "#{label} fixture must fail validation"
    end
    unless stderr.include?(expected_error)
      warn stdout
      warn stderr
      abort "#{label} failure must include #{expected_error.inspect}"
    end
  end
end

Dir.mktmpdir("seis-ecosystem-foundation-baseline-") do |directory|
  prepare_fixture(directory)
  stdout, stderr, status = run_validator(directory)
  unless status.success?
    warn stdout
    warn stderr
    abort "baseline ecosystem foundation fixture must pass"
  end
end

assert_rejected("empty project manifest", "project.ecosystem.yaml: expected object, got NilClass") do |directory|
  File.write(File.join(directory, "project.ecosystem.yaml"), "")
end

assert_rejected("manifest with malformed project object", "project.ecosystem.yaml.project: expected object, got String") do |directory|
  manifest = YAML.safe_load(File.read(File.join(directory, "project.ecosystem.yaml")))
  manifest["project"] = "invalid-project"
  write_yaml(directory, "project.ecosystem.yaml", manifest)
end

assert_rejected("duplicate owned path", "path apps has duplicate canonical owners") do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["modules"] << {
    "id" => "duplicate-path-fixture",
    "canonical_repo" => "seis",
    "decision_status" => "proposed",
    "decision_record" => "docs/adr/0002-ecosystem-governance-bootstrap-ownership.md",
    "paths" => ["apps"],
    "consumers" => [],
    "sync_direction" => "canonical-only"
  }
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_accepted("same path in a different canonical repository") do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["modules"] << {
    "id" => "cross-repository-path-fixture",
    "canonical_repo" => "eleni-neferi",
    "decision_status" => "proposed",
    "decision_record" => "docs/adr/0002-ecosystem-governance-bootstrap-ownership.md",
    "paths" => ["apps"],
    "consumers" => [],
    "sync_direction" => "canonical-only"
  }
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected("non-normalized owned path", "path \"apps/\" must be normalized as \"apps\"") do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["modules"].find { |mod| mod["id"] == "seis-product-platform" }["paths"][0] = "apps/"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected("escaping owned path", "must remain a nonempty repository-relative path") do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["modules"].find { |mod| mod["id"] == "seis-product-platform" }["paths"][0] = "../private"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected("Windows drive ownership path", "must remain a nonempty repository-relative path") do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["modules"].find { |mod| mod["id"] == "seis-product-platform" }["paths"][0] = "C:/private"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected("Windows UNC ownership path", "must remain a nonempty repository-relative path") do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["modules"].find { |mod| mod["id"] == "seis-product-platform" }["paths"][0] = "\\\\server\\share"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected("Goal without rollback", "missing required field rollback") do |directory|
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  goal.delete("rollback")
  write_yaml(directory, GOAL_RELATIVE_PATH, goal)
end

assert_rejected("Goal with scalar YAML root", "expected YAML object/hash at root") do |directory|
  File.write(File.join(directory, GOAL_RELATIVE_PATH), "--- invalid-goal-root\n")
end

assert_rejected("Goal with empty YAML document", "expected YAML object/hash at root") do |directory|
  File.write(File.join(directory, GOAL_RELATIVE_PATH), "")
end

assert_rejected("Goal with multiple YAML documents", "expected exactly one document") do |directory|
  path = File.join(directory, GOAL_RELATIVE_PATH)
  canonical = File.read(path)
  File.write(path, "#{canonical.rstrip}\n---\n#{canonical}")
end

assert_rejected("Goal with malformed scope", ".scope: expected object, got String") do |directory|
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  goal["scope"] = "invalid-scope"
  write_yaml(directory, GOAL_RELATIVE_PATH, goal)
end

assert_rejected("Goal with unquoted date", "invalid YAML in #{GOAL_RELATIVE_PATH}") do |directory|
  path = File.join(directory, GOAL_RELATIVE_PATH)
  content = File.read(path)
  unquoted = content.sub(/start: '(\d{4}-\d{2}-\d{2})'/, 'start: \1')
  abort "unquoted date fixture could not locate a quoted target_window.start" if unquoted == content
  File.write(path, unquoted)
end

assert_rejected(
  "package with malformed scripts",
  "package.json: check:ecosystem-foundation must equal"
) do |directory|
  path = File.join(directory, "package.json")
  package_json = JSON.parse(File.read(path))
  package_json["scripts"] = "invalid-scripts"
  File.write(path, JSON.pretty_generate(package_json))
end

assert_rejected(
  "observed repository with unknown metadata",
  "observed repository seis has unknown remote metadata"
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["repositories"].find { |repository| repository["id"] == "seis" }["remote"] = "unknown"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected(
  "remote observation with local-only verification method",
  "repository eleni-neferi verification \"observed-remote\" cannot use method \"local-git\""
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["repositories"].find { |repository| repository["id"] == "eleni-neferi" }["verification_method"] = "local-git"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected_with_parent(
  "observed repository with escaping verification evidence",
  "observed repository seis evidence \"../outside-evidence.md\" is missing or outside the repository"
) do |directory, parent|
  File.write(File.join(parent, "outside-evidence.md"), "existing out-of-repository evidence\n")
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["repositories"].find { |repository| repository["id"] == "seis" }["verification_evidence"] = "../outside-evidence.md"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected(
  "present-validated repository with missing manifest",
  "repository seis present-validated manifest \"missing-project.ecosystem.yaml\" must be an existing file in a valid local worktree"
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["repositories"].find { |repository| repository["id"] == "seis" }["manifest_path"] = "missing-project.ecosystem.yaml"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected(
  "present-validated repository with another repository manifest",
  "repository eleni-neferi manifest identity must match its canonical repository id"
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  repository = ownership["repositories"].find { |candidate| candidate["id"] == "eleni-neferi" }
  repository["local_worktree"] = "valid"
  repository["manifest_status"] = "present-validated"
  repository["manifest_path"] = "project.ecosystem.yaml"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected_with_parent(
  "decision record symlink escaping the repository",
  "decision record \"docs/adr/outside-link.md\" is missing or outside the repository"
) do |directory, parent|
  outside_record = File.join(parent, "outside-decision.md")
  File.write(outside_record, "existing out-of-repository decision\n")
  link_path = File.join(directory, "docs/adr/outside-link.md")
  FileUtils.mkdir_p(File.dirname(link_path))
  File.symlink(outside_record, link_path)
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["modules"].find { |mod| mod["id"] == "ecosystem-governance-bootstrap" }["decision_record"] = "docs/adr/outside-link.md"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected(
  "manifest visibility mismatch",
  "security.public_repo must match repository visibility \"private\""
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["repositories"].find { |repository| repository["id"] == "seis" }["visibility"] = "private"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected("Goal with dangling dependency", "dependencies references unknown Goal ECO-GOAL-9999") do |directory|
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  goal["dependencies"] = ["ECO-GOAL-9999"]
  write_yaml(directory, GOAL_RELATIVE_PATH, goal)
end

assert_rejected("Goal with dangling Goal blocker", "blocked_by references unknown Goal ECO-GOAL-9999") do |directory|
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  goal["blocked_by"] = [
    {
      "type" => "goal",
      "reference" => "ECO-GOAL-9999",
      "reason" => "Fixture references a Goal that does not exist.",
      "unblock_condition" => "The missing Goal reaches completed."
    }
  ]
  write_yaml(directory, GOAL_RELATIVE_PATH, goal)
end

assert_rejected("Goal without canonical DevOps gate", "missing required field devops") do |directory|
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  goal["quality_gates"].delete("devops")
  write_yaml(directory, GOAL_RELATIVE_PATH, goal)
end

assert_rejected(
  "passed evidence without proof",
  "passed evidence ECO3-EVIDENCE-001 must include an existing repository artifact, a valid HTTPS artifact, or a successful command with exit code 0"
) do |directory|
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  evidence = goal["evidence_records"].find { |record| record["id"] == "ECO3-EVIDENCE-001" }
  evidence["command"] = nil
  evidence["exit_code"] = nil
  evidence["artifact"] = nil
  write_yaml(directory, GOAL_RELATIVE_PATH, goal)
end

assert_rejected(
  "passed evidence with a nonexistent artifact",
  "passed evidence ECO3-EVIDENCE-001 must include an existing repository artifact, a valid HTTPS artifact, or a successful command with exit code 0"
) do |directory|
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  evidence = goal["evidence_records"].find { |record| record["id"] == "ECO3-EVIDENCE-001" }
  evidence["command"] = nil
  evidence["exit_code"] = nil
  evidence["artifact"] = "reports/nonexistent-evidence.txt"
  write_yaml(directory, GOAL_RELATIVE_PATH, goal)
end

assert_rejected("passed command evidence with a failed exit code", "passed evidence ECO3-EVIDENCE-002 command exit code must equal 0") do |directory|
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  evidence = goal["evidence_records"].find { |record| record["id"] == "ECO3-EVIDENCE-002" }
  evidence["exit_code"] = 1
  write_yaml(directory, GOAL_RELATIVE_PATH, goal)
end

assert_rejected("passed evidence exit code without command", "passed evidence ECO3-EVIDENCE-005 exit code requires a command") do |directory|
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  evidence = goal["evidence_records"].find { |record| record["id"] == "ECO3-EVIDENCE-005" }
  evidence["exit_code"] = 0
  write_yaml(directory, GOAL_RELATIVE_PATH, goal)
end

assert_rejected("Goal with illegal lifecycle jump", "illegal Goal status transition backlog -> completed") do |directory|
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  goal["status_history"] = [
    {
      "status" => "backlog",
      "at" => "2026-07-10",
      "reason" => "Fixture starts in backlog.",
      "evidence_refs" => []
    },
    {
      "status" => "completed",
      "at" => "2026-07-11",
      "reason" => "Fixture attempts an unsupported direct completion.",
      "evidence_refs" => []
    },
    {
      "status" => "in-progress",
      "at" => "2026-07-12",
      "reason" => "Fixture keeps the latest history entry aligned with current status.",
      "evidence_refs" => []
    }
  ]
  write_yaml(directory, GOAL_RELATIVE_PATH, goal)
end

assert_rejected(
  "Goal history without an allowed initial state",
  "status history must begin with backlog, proposed, or planned"
) do |directory|
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  goal["status_history"] = [
    {
      "status" => "in-progress",
      "at" => "2026-07-12",
      "reason" => "Fixture omits the required initial lifecycle state.",
      "evidence_refs" => []
    }
  ]
  write_yaml(directory, GOAL_RELATIVE_PATH, goal)
end

assert_rejected("blocked Goal without blocker", "blocked Goal must identify at least one blocker") do |directory|
  source = File.join(directory, GOAL_RELATIVE_PATH)
  blocked_relative_path = GOAL_RELATIVE_PATH.sub("goals/active/", "goals/blocked/")
  target = File.join(directory, blocked_relative_path)
  FileUtils.mkdir_p(File.dirname(target))
  goal = YAML.safe_load(File.read(source))
  goal["status"] = "blocked"
  goal["blocked_by"] = []
  FileUtils.mv(source, target)
  write_yaml(directory, blocked_relative_path, goal)
end

assert_rejected("completed Goal without evidence", "completed Goal must contain passed evidence records") do |directory|
  source = File.join(directory, GOAL_RELATIVE_PATH)
  completed_relative_path = GOAL_RELATIVE_PATH.sub("goals/active/", "goals/completed/")
  target = File.join(directory, completed_relative_path)
  FileUtils.mkdir_p(File.dirname(target))
  goal = YAML.safe_load(File.read(source))
  goal["status"] = "completed"
  goal["blocked_by"] = []
  goal["quality_gates"].transform_values! { |result| result == "not-applicable" ? result : "passed" }
  goal["evidence_records"] = []
  FileUtils.mv(source, target)
  write_yaml(directory, completed_relative_path, goal)
end

assert_rejected("completed Goal without required release note", "completed Goal requires a valid HTTPS GitHub field release_note_url") do |directory|
  source = File.join(directory, GOAL_RELATIVE_PATH)
  completed_relative_path = GOAL_RELATIVE_PATH.sub("goals/active/", "goals/completed/")
  target = File.join(directory, completed_relative_path)
  FileUtils.mkdir_p(File.dirname(target))
  goal = YAML.safe_load(File.read(source))
  goal["status"] = "completed"
  goal["blocked_by"] = []
  goal["quality_gates"].transform_values! { |result| result == "not-applicable" ? result : "passed" }
  goal["github"]["release_note_required"] = true
  goal["github"]["release_note_url"] = nil
  goal["status_history"] << {
    "status" => "completed",
    "at" => "2026-07-13",
    "reason" => "Fixture reaches completion without its required release note.",
    "evidence_refs" => ["ECO3-EVIDENCE-003"]
  }
  FileUtils.mv(source, target)
  write_yaml(directory, completed_relative_path, goal)
end


assert_rejected("completed Goal with invalid release-note URL", "completed Goal requires a valid HTTPS GitHub field release_note_url") do |directory|
  source = File.join(directory, GOAL_RELATIVE_PATH)
  completed_relative_path = GOAL_RELATIVE_PATH.sub("goals/active/", "goals/completed/")
  target = File.join(directory, completed_relative_path)
  FileUtils.mkdir_p(File.dirname(target))
  goal = YAML.safe_load(File.read(source))
  goal["status"] = "completed"
  goal["blocked_by"] = []
  goal["quality_gates"].transform_values! { |result| result == "not-applicable" ? result : "passed" }
  goal["github"]["release_note_required"] = true
  goal["github"]["release_note_url"] = "not-a-url"
  goal["status_history"] << {
    "status" => "completed",
    "at" => "2026-07-13",
    "reason" => "Fixture reaches completion with malformed release-note evidence.",
    "evidence_refs" => ["ECO3-EVIDENCE-003"]
  }
  FileUtils.mv(source, target)
  write_yaml(directory, completed_relative_path, goal)
end

puts "Ecosystem foundation tests passed: repository-scoped ownership was preserved; empty or malformed YAML, duplicate, non-normalized, or cross-platform absolute ownership paths, contradictory repository observations, escaping evidence and decision paths, missing or mismatched validated manifests, unquoted dates, missing rollback, unknown observed metadata, visibility mismatch, dangling Goal and blocker references, incomplete quality gates, proofless, nonexistent, or contradictory passed evidence, illegal lifecycle histories, invalid blocked state, and unsupported completion or release-note state were rejected."
