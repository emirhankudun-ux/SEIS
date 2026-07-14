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
  "scripts/validate-ecosystem-foundation.rb",
  "package.json"
].freeze
FIXTURE_GOAL_FILES = Dir.glob(
  "goals/{active,backlog,blocked,completed,archived}/*.yaml",
  base: ROOT
).freeze
FIXTURE_GIT_ENV = {
  "GIT_CONFIG_NOSYSTEM" => "1",
  "GIT_CONFIG_GLOBAL" => File::NULL,
  "GIT_CONFIG_SYSTEM" => File::NULL,
  "GIT_CONFIG" => nil,
  "GIT_CONFIG_PARAMETERS" => nil,
  "GIT_CONFIG_COUNT" => nil,
  "GIT_DIR" => nil,
  "GIT_WORK_TREE" => nil,
  "GIT_COMMON_DIR" => nil,
  "GIT_INDEX_FILE" => nil,
  "GIT_OBJECT_DIRECTORY" => nil,
  "GIT_ALTERNATE_OBJECT_DIRECTORIES" => nil
}.freeze

def prepare_fixture(directory)
  (FIXTURE_FILES + FIXTURE_GOAL_FILES).each do |relative_path|
    source = File.join(ROOT, relative_path)
    target = File.join(directory, relative_path)
    FileUtils.mkdir_p(File.dirname(target))
    FileUtils.cp(source, target)
  end

  run_fixture_command!(directory, "git", "init", "--quiet")
  run_fixture_command!(directory, "git", "add", "--all")
end

def run_fixture_command!(directory, *command, environment: FIXTURE_GIT_ENV, stdin_data: "")
  stdout, stderr, status = Open3.capture3(environment, *command, chdir: directory, stdin_data: stdin_data)
  return stdout if status.success?

  warn stdout
  warn stderr
  abort "fixture command failed: #{command.join(" ")}"
end

def run_validator(directory, environment = {})
  Open3.capture3(
    environment,
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

assert_rejected("Goal with malformed scope", ".scope: expected object, got String") do |directory|
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  goal["scope"] = "invalid-scope"
  write_yaml(directory, GOAL_RELATIVE_PATH, goal)
end

assert_rejected(
  "Goal with escaping scope path",
  "scope path \"../../private-vault\" must remain a nonempty repository-relative path"
) do |directory|
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  goal["scope"]["paths"] = ["../../private-vault"]
  write_yaml(directory, GOAL_RELATIVE_PATH, goal)
end

assert_rejected(
  "Goal with absolute scope path",
  "scope path \"/Users/example/private-vault\" must remain a nonempty repository-relative path"
) do |directory|
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  goal["scope"]["paths"] = ["/Users/example/private-vault"]
  write_yaml(directory, GOAL_RELATIVE_PATH, goal)
end

assert_rejected(
  "Goal with NUL-containing scope path",
  "scope path \"a\\u0000b\" must remain a nonempty repository-relative path"
) do |directory|
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  goal["scope"]["paths"] = ["a\0b"]
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
  "observed repository seis has invalid remote metadata"
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["repositories"].find { |repository| repository["id"] == "seis" }["remote"] = "unknown"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected(
  "observed repository with malformed remote metadata",
  "observed repository seis has invalid remote metadata"
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["repositories"].find { |repository| repository["id"] == "seis" }["remote"] = "definitely-not-a-github-remote"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

["owner-/repo", "owner--name/repo"].each do |remote|
  assert_rejected(
    "observed repository with invalid GitHub owner #{remote}",
    "observed repository seis has invalid remote metadata"
  ) do |directory|
    ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
    ownership["repositories"].find { |repository| repository["id"] == "seis" }["remote"] = remote
    write_yaml(directory, "data/repository-ownership.yaml", ownership)
  end
end

assert_rejected(
  "observed repository with malformed default branch metadata",
  "observed repository seis has invalid default_branch metadata"
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["repositories"].find { |repository| repository["id"] == "seis" }["default_branch"] = "main..shadow"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected(
  "observed repository with reserved HEAD default branch metadata",
  "observed repository seis has invalid default_branch metadata"
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["repositories"].find { |repository| repository["id"] == "seis" }["default_branch"] = "HEAD"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected(
  "observed repository with fully qualified default branch metadata",
  "observed repository seis has invalid default_branch metadata"
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["repositories"].find { |repository| repository["id"] == "seis" }["default_branch"] = "refs/heads/main"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected(
  "observed repository with object-ID-like default branch metadata",
  "observed repository seis has invalid default_branch metadata"
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["repositories"].find { |repository| repository["id"] == "seis" }["default_branch"] = "a" * 40
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

assert_rejected(
  "passed evidence with an untracked artifact",
  "passed evidence ECO3-EVIDENCE-001 must include an existing repository artifact, a valid HTTPS artifact, or a successful command with exit code 0"
) do |directory|
  artifact_path = "reports/untracked-evidence.md"
  FileUtils.mkdir_p(File.join(directory, "reports"))
  File.write(File.join(directory, artifact_path), "synthetic untracked fixture\n")
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  evidence = goal["evidence_records"].find { |record| record["id"] == "ECO3-EVIDENCE-001" }
  evidence["command"] = nil
  evidence["exit_code"] = nil
  evidence["artifact"] = artifact_path
  write_yaml(directory, GOAL_RELATIVE_PATH, goal)
end

assert_rejected(
  "passed evidence with Git metadata artifact",
  "passed evidence ECO3-EVIDENCE-001 must include an existing repository artifact, a valid HTTPS artifact, or a successful command with exit code 0"
) do |directory|
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  evidence = goal["evidence_records"].find { |record| record["id"] == "ECO3-EVIDENCE-001" }
  evidence["command"] = nil
  evidence["exit_code"] = nil
  evidence["artifact"] = ".git/config"
  write_yaml(directory, GOAL_RELATIVE_PATH, goal)
end

assert_rejected(
  "passed evidence with tracked symlink to untracked target",
  "passed evidence ECO3-EVIDENCE-001 must include an existing repository artifact, a valid HTTPS artifact, or a successful command with exit code 0"
) do |directory|
  target_path = File.join(directory, "reports", "untracked-symlink-target.md")
  link_relative_path = "docs/tracked-evidence-link.md"
  link_path = File.join(directory, link_relative_path)
  FileUtils.mkdir_p(File.dirname(target_path))
  File.write(target_path, "synthetic untracked target\n")
  File.symlink("../reports/untracked-symlink-target.md", link_path)
  run_fixture_command!(directory, "git", "add", "--", link_relative_path)
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  evidence = goal["evidence_records"].find { |record| record["id"] == "ECO3-EVIDENCE-001" }
  evidence["command"] = nil
  evidence["exit_code"] = nil
  evidence["artifact"] = link_relative_path
  write_yaml(directory, GOAL_RELATIVE_PATH, goal)
end

assert_rejected(
  "passed evidence through tracked path under replaced symlink parent",
  "passed evidence ECO3-EVIDENCE-001 must include an existing repository artifact, a valid HTTPS artifact, or a successful command with exit code 0"
) do |directory|
  artifact_relative_path = "docs/tracked-parent/evidence.md"
  artifact_path = File.join(directory, artifact_relative_path)
  FileUtils.mkdir_p(File.dirname(artifact_path))
  File.write(artifact_path, "tracked baseline evidence\n")
  run_fixture_command!(directory, "git", "add", "--", artifact_relative_path)
  FileUtils.rm_rf(File.join(directory, "docs", "tracked-parent"))
  replacement_directory = File.join(directory, "reports", "untracked-parent")
  FileUtils.mkdir_p(replacement_directory)
  File.write(File.join(replacement_directory, "evidence.md"), "synthetic untracked replacement\n")
  File.symlink("../reports/untracked-parent", File.join(directory, "docs", "tracked-parent"))
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  evidence = goal["evidence_records"].find { |record| record["id"] == "ECO3-EVIDENCE-001" }
  evidence["command"] = nil
  evidence["exit_code"] = nil
  evidence["artifact"] = artifact_relative_path
  write_yaml(directory, GOAL_RELATIVE_PATH, goal)
end

assert_rejected(
  "Git index with a nonzero-stage artifact",
  "Git-tracked repository artifacts include unmerged index entries"
) do |directory|
  artifact_relative_path = "docs/unmerged-index-artifact.md"
  File.write(File.join(directory, artifact_relative_path), "synthetic unmerged evidence\n")
  object_id = run_fixture_command!(
    directory,
    "git", "hash-object", "-w", "--", artifact_relative_path
  ).strip
  run_fixture_command!(
    directory,
    "git", "update-index", "--index-info",
    stdin_data: "100644 #{object_id} 1\t#{artifact_relative_path}\n"
  )
end

assert_rejected(
  "Git index with a missing stage-zero blob",
  "Git-tracked repository artifacts reference missing or non-blob objects"
) do |directory|
  artifact_relative_path = "docs/missing-blob-artifact.md"
  File.write(File.join(directory, artifact_relative_path), "synthetic missing blob evidence\n")
  run_fixture_command!(
    directory,
    "git", "update-index", "--add", "--info-only", "--cacheinfo",
    "100644,#{"1" * 40},#{artifact_relative_path}"
  )
end

assert_rejected(
  "Git intent-to-add artifact",
  "Git-tracked repository artifacts include intent-to-add entries"
) do |directory|
  artifact_relative_path = "docs/intent-to-add-artifact.md"
  File.write(File.join(directory, artifact_relative_path), "synthetic intent-to-add evidence\n")
  run_fixture_command!(directory, "git", "add", "--intent-to-add", "--", artifact_relative_path)
end

[
  "schemas/project-ecosystem.schema.json",
  "schemas/repository-ownership.schema.json",
  "schemas/ecosystem-goal.schema.json"
].each do |schema_path|
  assert_rejected("scalar schema root in #{schema_path}", "#{schema_path}: expected JSON object/hash at root") do |directory|
    File.write(File.join(directory, schema_path), "false\n")
  end
end

assert_rejected("empty object schema root", "schemas/ecosystem-goal.schema.json: $schema must equal") do |directory|
  File.write(File.join(directory, "schemas/ecosystem-goal.schema.json"), "{}\n")
end

assert_rejected("newline-suffixed schema pattern value", ".github.commit_sha: does not match") do |directory|
  goal = YAML.safe_load(File.read(File.join(directory, GOAL_RELATIVE_PATH)))
  goal["github"]["commit_sha"] = "cf972f6\nnotasha"
  write_yaml(directory, GOAL_RELATIVE_PATH, goal)
end

[false, 1].each do |invalid_pattern|
  assert_rejected(
    "malformed nested schema pattern #{invalid_pattern.inspect}",
    "schemas/ecosystem-goal.schema.json.properties.github.properties.commit_sha.pattern: must be a string"
  ) do |directory|
    schema_path = File.join(directory, "schemas/ecosystem-goal.schema.json")
    schema = JSON.parse(File.read(schema_path))
    schema["properties"]["github"]["properties"]["commit_sha"]["pattern"] = invalid_pattern
    File.write(schema_path, JSON.pretty_generate(schema))
  end
end

assert_rejected(
  "schema reference with a scalar target",
  "schemas/ecosystem-goal.schema.json.properties.project.$ref: schema reference \"#/properties/schema_version/const\" must resolve to an object"
) do |directory|
  schema_path = File.join(directory, "schemas/ecosystem-goal.schema.json")
  schema = JSON.parse(File.read(schema_path))
  schema["properties"]["project"] = { "$ref" => "#/properties/schema_version/const" }
  File.write(schema_path, JSON.pretty_generate(schema))
end

assert_rejected(
  "schema reference with a non-string value",
  "schemas/ecosystem-goal.schema.json.properties.project.$ref: must be a string"
) do |directory|
  schema_path = File.join(directory, "schemas/ecosystem-goal.schema.json")
  schema = JSON.parse(File.read(schema_path))
  schema["properties"]["project"]["$ref"] = false
  File.write(schema_path, JSON.pretty_generate(schema))
end

assert_rejected(
  "self-referential schema definition",
  "schemas/ecosystem-goal.schema.json: cyclic schema reference graph is not supported"
) do |directory|
  schema_path = File.join(directory, "schemas/ecosystem-goal.schema.json")
  schema = JSON.parse(File.read(schema_path))
  schema["$defs"]["text"] = { "$ref" => "#/$defs/text" }
  File.write(schema_path, JSON.pretty_generate(schema))
end

assert_rejected(
  "schema reference with assertion sibling",
  "schemas/ecosystem-goal.schema.json.properties.project.$ref: assertion siblings are not supported: [\"minLength\"]"
) do |directory|
  schema_path = File.join(directory, "schemas/ecosystem-goal.schema.json")
  schema = JSON.parse(File.read(schema_path))
  schema["properties"]["project"]["minLength"] = 1
  File.write(schema_path, JSON.pretty_generate(schema))
end

assert_rejected(
  "schema with invalid regular expression",
  "schemas/ecosystem-goal.schema.json.$defs.nullableHttpsUrl.pattern: invalid regular expression"
) do |directory|
  schema_path = File.join(directory, "schemas/ecosystem-goal.schema.json")
  schema = JSON.parse(File.read(schema_path))
  schema["$defs"]["nullableHttpsUrl"]["pattern"] = "["
  File.write(schema_path, JSON.pretty_generate(schema))
end


Dir.mktmpdir("seis-ecosystem-foundation-git-config-") do |directory|
  prepare_fixture(directory)
  marker = File.join(directory, "fsmonitor-helper-ran")
  run_fixture_command!(directory, "git", "config", "core.fsmonitor", "touch #{marker}")
  environment = {
    "GIT_CONFIG_COUNT" => "1",
    "GIT_CONFIG_KEY_0" => "core.fsmonitor",
    "GIT_CONFIG_VALUE_0" => "touch #{marker}"
  }
  stdout, stderr, status = run_validator(directory, environment)
  unless status.success?
    warn stdout
    warn stderr
    abort "hostile Git configuration fixture must pass with helpers disabled"
  end
  abort "Git-tracked artifact enumeration must not execute fsmonitor helpers" if File.exist?(marker)
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

puts "Ecosystem foundation tests passed: repository-scoped ownership was preserved; empty or malformed YAML and schema roots, duplicate, non-normalized, escaping, or cross-platform absolute ownership and Goal scope paths, contradictory or malformed repository observations, escaping, untracked, Git-metadata, or nonexistent evidence and decision paths, missing or mismatched validated manifests, unquoted dates, full-string schema pattern bypasses, missing rollback, visibility mismatch, dangling Goal and blocker references, incomplete quality gates, proofless or contradictory passed evidence, illegal lifecycle histories, invalid blocked state, and unsupported completion or release-note state were rejected."
