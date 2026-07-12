#!/usr/bin/env ruby

require "fileutils"
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

Dir.mktmpdir("seis-ecosystem-foundation-baseline-") do |directory|
  prepare_fixture(directory)
  stdout, stderr, status = run_validator(directory)
  unless status.success?
    warn stdout
    warn stderr
    abort "baseline ecosystem foundation fixture must pass"
  end
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

assert_rejected("Goal without rollback", "missing required field rollback") do |directory|
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  goal.delete("rollback")
  write_yaml(directory, GOAL_RELATIVE_PATH, goal)
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

puts "Ecosystem foundation tests passed: repository-scoped ownership was preserved; duplicate ownership, missing rollback, unknown observed metadata, visibility mismatch, dangling Goal references, illegal lifecycle histories, invalid blocked state, and unsupported completion were rejected."
