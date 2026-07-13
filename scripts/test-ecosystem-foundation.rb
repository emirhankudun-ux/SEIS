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
  "data/evidence/ECO-GOAL-0001-private-manifest-review.yaml",
  "data/evidence/ECO-GOAL-0001-greek-repository-target-attestation.yaml",
  "data/evidence/ECO-GOAL-0001-completion-audit.yaml",
  ".github/workflows/foundation-check.yml",
  "docs/ECOSYSTEM_GOAL_TRACKING.md",
  "docs/REPOSITORY_OWNERSHIP.md",
  "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md",
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

def configure_public_consumer_evidence(directory, artifact_url)
  revision = "f772b6f364e49d438113b2d51f2e20027ae9f6b4"
  attestation_path = "data/evidence/public-consumer-url-fixture.yaml"
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  consumer = ownership["modules"]
    .find { |candidate| candidate["id"] == "ecosystem-governance-bootstrap" }["consumers"].first
  consumer["repository"] = "seis"
  consumer["status"] = "observed"
  consumer["compatibility"] = "compatible"
  consumer["evidence"] = [
    {
      "kind" => "public-distribution-attestation",
      "artifact_url" => artifact_url,
      "attestation_path" => attestation_path,
      "revision" => revision,
      "revision_digest" => nil
    }
  ]
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
  FileUtils.mkdir_p(File.dirname(File.join(directory, attestation_path)))
  write_yaml(directory, attestation_path, {
    "schema_version" => 1,
    "kind" => "consumer-distribution",
    "classification" => "public-evidence",
    "module_id" => "ecosystem-governance-bootstrap",
    "consumer_repository" => "seis",
    "consumer_path" => "project.ecosystem.yaml",
    "distribution_mode" => "manual-adoption",
    "compatibility" => "compatible",
    "artifact_url" => artifact_url,
    "revision" => revision,
    "revision_digest" => nil,
    "observed_at" => "2026-07-13",
    "limitations" => ["point-in-time-observation"]
  })
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

assert_rejected("ownership registry with scalar repository record", "data/repository-ownership.yaml.repositories[0]: expected object, got String") do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["repositories"][0] = "invalid-repository"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected("duplicate owned path", "case-folded path apps / apps has duplicate canonical owners") do |directory|
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

assert_rejected("case-folded overlapping owned path", "owned paths apps (seis-product-platform) and Apps/web (case-fold-overlap-fixture) overlap") do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["modules"] << {
    "id" => "case-fold-overlap-fixture",
    "canonical_repo" => "seis",
    "decision_status" => "proposed",
    "decision_record" => "docs/adr/0002-ecosystem-governance-bootstrap-ownership.md",
    "paths" => ["Apps/web"],
    "consumers" => [],
    "sync_direction" => "canonical-only"
  }
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected("overlapping owned path", "owned paths apps (seis-product-platform) and apps/web (overlapping-path-fixture) overlap") do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["modules"] << {
    "id" => "overlapping-path-fixture",
    "canonical_repo" => "seis",
    "decision_status" => "proposed",
    "decision_record" => "docs/adr/0002-ecosystem-governance-bootstrap-ownership.md",
    "paths" => ["apps/web"],
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
    "paths" => ["packages"],
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

assert_rejected("duplicate structured consumer", "has duplicate consumer repository \"eleni-neferi\"") do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  mod = ownership["modules"].find { |candidate| candidate["id"] == "ecosystem-governance-bootstrap" }
  mod["consumers"] << Marshal.load(Marshal.dump(mod["consumers"].first))
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected("unknown structured consumer", "has unknown consumer repository \"unknown-repository\"") do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  consumer = ownership["modules"]
    .find { |candidate| candidate["id"] == "ecosystem-governance-bootstrap" }["consumers"].first
  consumer["repository"] = "unknown-repository"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected("absolute structured consumer path", "path \"/private/consumer\" must remain a nonempty repository-relative path") do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  consumer = ownership["modules"]
    .find { |candidate| candidate["id"] == "ecosystem-governance-bootstrap" }["consumers"].first
  consumer["consumer_path"] = "/private/consumer"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected("escaping structured consumer path", "path \"../private/consumer\" must remain a nonempty repository-relative path") do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  consumer = ownership["modules"]
    .find { |candidate| candidate["id"] == "ecosystem-governance-bootstrap" }["consumers"].first
  consumer["consumer_path"] = "../private/consumer"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected("observed structured consumer without evidence", "observed consumer \"eleni-neferi\" requires evidence") do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  consumer = ownership["modules"]
    .find { |candidate| candidate["id"] == "ecosystem-governance-bootstrap" }["consumers"].first
  consumer["status"] = "observed"
  consumer["compatibility"] = "compatible"
  consumer["evidence"] = []
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected("private observed consumer with operational URL evidence", "private consumer \"eleni-neferi\" evidence requires a public-safe revision digest and schema-bound attestation") do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  consumer = ownership["modules"]
    .find { |candidate| candidate["id"] == "ecosystem-governance-bootstrap" }["consumers"].first
  consumer["status"] = "observed"
  consumer["compatibility"] = "compatible"
  consumer["evidence"] = [
    {
      "kind" => "public-distribution-attestation",
      "artifact_url" => "https://example.invalid/unrelated",
      "attestation_path" => nil,
      "revision" => nil,
      "revision_digest" => nil
    }
  ]
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected("public observed consumer with unrelated GitHub evidence", "public consumer \"seis\" evidence must combine an exact repository-bound GitHub artifact, full revision, and schema-bound distribution attestation") do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  consumer = ownership["modules"]
    .find { |candidate| candidate["id"] == "ecosystem-governance-bootstrap" }["consumers"].first
  consumer["repository"] = "seis"
  consumer["status"] = "observed"
  consumer["compatibility"] = "compatible"
  consumer["evidence"] = [
    {
      "kind" => "public-distribution-attestation",
      "artifact_url" => "https://github.com/example/other/commit/#{"0" * 40}",
      "attestation_path" => nil,
      "revision" => "#{"0" * 40}",
      "revision_digest" => nil
    }
  ]
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

invalid_public_consumer_urls = {
  "unsupported valid release tag" => "https://github.com/emirhankudun-ux/SEIS/releases/tag/v1.0.0",
  "dot-segment release tag" => "https://github.com/emirhankudun-ux/SEIS/releases/tag/..",
  "double-dot release tag" => "https://github.com/emirhankudun-ux/SEIS/releases/tag/v..",
  "trailing-dot release tag" => "https://github.com/emirhankudun-ux/SEIS/releases/tag/v.",
  "lock-suffix release tag" => "https://github.com/emirhankudun-ux/SEIS/releases/tag/v.lock",
  "non-default HTTPS port" => "https://github.com:444/emirhankudun-ux/SEIS/commit/f772b6f364e49d438113b2d51f2e20027ae9f6b4",
  "explicit default HTTPS port" => "https://github.com:443/emirhankudun-ux/SEIS/commit/f772b6f364e49d438113b2d51f2e20027ae9f6b4",
  "zero-padded default HTTPS port" => "https://github.com:0443/emirhankudun-ux/SEIS/commit/f772b6f364e49d438113b2d51f2e20027ae9f6b4",
  "empty explicit HTTPS port" => "https://github.com:/emirhankudun-ux/SEIS/commit/f772b6f364e49d438113b2d51f2e20027ae9f6b4",
  "commit artifact revision mismatch" => "https://github.com/emirhankudun-ux/SEIS/commit/1111111111111111111111111111111111111111"
}.freeze
invalid_public_consumer_urls.each do |label, artifact_url|
  assert_rejected("public observed consumer with #{label}", "public consumer \"seis\" evidence must combine an exact repository-bound GitHub artifact, full revision, and schema-bound distribution attestation") do |directory|
    configure_public_consumer_evidence(directory, artifact_url)
  end
end

assert_accepted("private observed consumer with bound public-safe attestation") do |directory|
  digest = "sha256:#{"0" * 64}"
  attestation_path = "data/evidence/private-consumer-fixture.yaml"
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  consumer = ownership["modules"]
    .find { |candidate| candidate["id"] == "ecosystem-governance-bootstrap" }["consumers"].first
  consumer["status"] = "observed"
  consumer["compatibility"] = "compatible"
  consumer["evidence"] = [
    {
      "kind" => "public-safe-attestation",
      "artifact_url" => nil,
      "attestation_path" => attestation_path,
      "revision" => nil,
      "revision_digest" => digest
    }
  ]
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
  FileUtils.mkdir_p(File.dirname(File.join(directory, attestation_path)))
  write_yaml(directory, attestation_path, {
    "schema_version" => 1,
    "kind" => "consumer-distribution",
    "classification" => "public-safe-metadata-only",
    "module_id" => "ecosystem-governance-bootstrap",
    "consumer_repository" => "eleni-neferi",
    "consumer_path" => "project.ecosystem.yaml",
    "distribution_mode" => "manual-adoption",
    "compatibility" => "compatible",
    "artifact_url" => nil,
    "revision" => nil,
    "revision_digest" => digest,
    "observed_at" => "2026-07-13",
    "limitations" => ["point-in-time-observation", "private-identifiers-redacted"]
  })
end

assert_rejected("dynamic private consumer attestation comment with credential assignment", "data/evidence/private-consumer-secret-fixture.yaml: contains possible inline credential assignment") do |directory|
  digest = "sha256:#{"0" * 64}"
  attestation_path = "data/evidence/private-consumer-secret-fixture.yaml"
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  consumer = ownership["modules"]
    .find { |candidate| candidate["id"] == "ecosystem-governance-bootstrap" }["consumers"].first
  consumer["status"] = "observed"
  consumer["compatibility"] = "compatible"
  consumer["evidence"] = [
    {
      "kind" => "public-safe-attestation",
      "artifact_url" => nil,
      "attestation_path" => attestation_path,
      "revision" => nil,
      "revision_digest" => digest
    }
  ]
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
  FileUtils.mkdir_p(File.dirname(File.join(directory, attestation_path)))
  write_yaml(directory, attestation_path, {
    "schema_version" => 1,
    "kind" => "consumer-distribution",
    "classification" => "public-safe-metadata-only",
    "module_id" => "ecosystem-governance-bootstrap",
    "consumer_repository" => "eleni-neferi",
    "consumer_path" => "project.ecosystem.yaml",
    "distribution_mode" => "manual-adoption",
    "compatibility" => "compatible",
    "artifact_url" => nil,
    "revision" => nil,
    "revision_digest" => digest,
    "observed_at" => "2026-07-13",
    "limitations" => ["point-in-time-observation", "private-identifiers-redacted"]
  })
  File.open(File.join(directory, attestation_path), "a") { |file| file.write("\n# secret = \"fixture-secret-value\"\n") }
end

assert_accepted("public observed consumer with repository and distribution-bound attestation") do |directory|
  revision = "f772b6f364e49d438113b2d51f2e20027ae9f6b4"
  artifact_url = "https://github.com/emirhankudun-ux/SEIS/commit/#{revision}"
  attestation_path = "data/evidence/public-consumer-fixture.yaml"
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  consumer = ownership["modules"]
    .find { |candidate| candidate["id"] == "ecosystem-governance-bootstrap" }["consumers"].first
  consumer["repository"] = "seis"
  consumer["status"] = "observed"
  consumer["compatibility"] = "compatible"
  consumer["evidence"] = [
    {
      "kind" => "public-distribution-attestation",
      "artifact_url" => artifact_url,
      "attestation_path" => attestation_path,
      "revision" => revision,
      "revision_digest" => nil
    }
  ]
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
  FileUtils.mkdir_p(File.dirname(File.join(directory, attestation_path)))
  write_yaml(directory, attestation_path, {
    "schema_version" => 1,
    "kind" => "consumer-distribution",
    "classification" => "public-evidence",
    "module_id" => "ecosystem-governance-bootstrap",
    "consumer_repository" => "seis",
    "consumer_path" => "project.ecosystem.yaml",
    "distribution_mode" => "manual-adoption",
    "compatibility" => "compatible",
    "artifact_url" => artifact_url,
    "revision" => revision,
    "revision_digest" => nil,
    "observed_at" => "2026-07-13",
    "limitations" => ["point-in-time-observation", "compatibility-limited-to-recorded-contract"]
  })
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
  "private observed repository without a revision digest",
  "private observed repository eleni-neferi must publish only a SHA-256 revision digest"
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["repositories"].find { |repository| repository["id"] == "eleni-neferi" }["observed_revision_digest"] = nil
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected(
  "path-confused GitHub remote",
  "observed repository eleni-neferi remote must use an exact GitHub owner/repository identity"
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["repositories"].find { |repository| repository["id"] == "eleni-neferi" }["remote"] = "trusted/repo/../other"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected(
  "remote observation with local-only verification method",
  "repository eleni-neferi verification \"observed-local-and-remote\" cannot use method \"local-git\""
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
  "locally validated repository with missing manifest",
  "local repository seis review manifest \"missing-project.ecosystem.yaml\" must be an existing file in the current worktree"
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["repositories"].find { |repository| repository["id"] == "seis" }["manifest_validation"]["manifest_path"] = "missing-project.ecosystem.yaml"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected(
  "public review with mismatched pull-request head",
  "public repository seis review manifest requires revision-bound public commit, pull request, and CI evidence"
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  evidence = ownership["repositories"]
    .find { |candidate| candidate["id"] == "seis" }["manifest_validation"]["evidence"]
  evidence["pull_request_head_revision"] = "0123456789abcdef0123456789abcdef01234567"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected(
  "manifest lifecycle skips review",
  "repository eleni-neferi manifest history cannot transition from \"pending\" to \"validated\""
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  validation = ownership["repositories"]
    .find { |candidate| candidate["id"] == "eleni-neferi" }["manifest_validation"]
  validation["status"] = "validated"
  validation["status_history"] = [
    { "status" => "pending", "at" => "2026-07-13", "revision" => nil },
    { "status" => "validated", "at" => "2026-07-13", "revision" => validation["manifest_revision_digest"] }
  ]
  validation["evidence"]["pull_request_state"] = "merged"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected(
  "review manifest promoted before canonical revision refresh",
  "repository eleni-neferi validated manifest revision must match the observed canonical revision reference"
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  validation = ownership["repositories"]
    .find { |candidate| candidate["id"] == "eleni-neferi" }["manifest_validation"]
  validation["status"] = "validated"
  validation["canonical_manifest_revision_digest"] = validation["manifest_revision_digest"]
  validation["status_history"] << {
    "status" => "validated",
    "at" => "2026-07-13",
    "revision" => validation["manifest_revision_digest"]
  }
  validation["evidence"]["pull_request_state"] = "merged"
  validation["evidence"]["pull_request_draft"] = false
  validation["evidence"]["manifest_content_matches_review_at_canonical_revision"] = true
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected(
  "validated manifest with failed CI metadata",
  "repository seis validated manifest requires coherent pull-request state and successful completed pull-request CI"
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  repository = ownership["repositories"].find { |candidate| candidate["id"] == "seis" }
  validation = repository["manifest_validation"]
  canonical_revision = repository["observed_revision"]
  validation["status"] = "validated"
  validation["canonical_manifest_revision"] = canonical_revision
  validation["status_history"] << {
    "status" => "validated",
    "at" => "2026-07-13",
    "revision" => canonical_revision
  }
  validation["evidence"]["pull_request_state"] = "merged"
  validation["evidence"]["pull_request_draft"] = false
  validation["evidence"]["manifest_content_matches_review_at_canonical_revision"] = true
  validation["evidence"]["ci_conclusion"] = "failure"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_accepted("public validated manifest with separate review and canonical merge revisions") do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  repository = ownership["repositories"].find { |candidate| candidate["id"] == "seis" }
  validation = repository["manifest_validation"]
  canonical_revision = repository["observed_revision"]
  validation["status"] = "validated"
  validation["canonical_manifest_revision"] = canonical_revision
  validation["status_history"] << {
    "status" => "validated",
    "at" => "2026-07-13",
    "revision" => canonical_revision
  }
  validation["evidence"]["pull_request_state"] = "merged"
  validation["evidence"]["pull_request_draft"] = false
  validation["evidence"]["manifest_content_matches_review_at_canonical_revision"] = true
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_accepted("private validated manifest with status-specific merged attestation") do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  repository = ownership["repositories"].find { |candidate| candidate["id"] == "eleni-neferi" }
  validation = repository["manifest_validation"]
  canonical_digest = repository["observed_revision_digest"]
  validation["status"] = "validated"
  validation["canonical_manifest_revision_digest"] = canonical_digest
  validation["status_history"] << {
    "status" => "validated",
    "at" => "2026-07-13",
    "revision" => canonical_digest
  }
  validation["evidence"]["pull_request_state"] = "merged"
  validation["evidence"]["pull_request_draft"] = false
  validation["evidence"]["manifest_content_matches_review_at_canonical_revision"] = true
  attestation_path = File.join(directory, validation["evidence"]["attestation_path"])
  attestation = YAML.safe_load(File.read(attestation_path))
  entry = attestation["attestations"].find { |candidate| candidate["repository_id"] == "eleni-neferi" }
  entry["status_revision_digest"] = canonical_digest
  entry["canonical_manifest_revision_digest"] = canonical_digest
  entry["pull_request_state"] = "merged"
  entry["pull_request_draft"] = false
  entry["manifest_content_matches_review_at_canonical_revision"] = true
  entry["limitations"] = ["point-in-time-observation", "private-identifiers-redacted"]
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
  write_yaml(directory, validation["evidence"]["attestation_path"], attestation)
end

assert_rejected(
  "private rejected manifest with raw revision history",
  "private repository eleni-neferi manifest history must use only SHA-256 revision digests"
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  validation = ownership["repositories"]
    .find { |candidate| candidate["id"] == "eleni-neferi" }["manifest_validation"]
  raw_revision = "0123456789abcdef0123456789abcdef01234567"
  validation["status"] = "rejected"
  validation["manifest_revision"] = raw_revision
  validation["manifest_revision_digest"] = nil
  validation["status_history"] << {
    "status" => "rejected",
    "at" => "2026-07-13",
    "revision" => raw_revision
  }
  validation["evidence"]["pull_request_state"] = "closed"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected(
  "pending manifest claiming review evidence",
  "repository eleni-neferi pending manifest must not claim a revision or validation evidence"
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  validation = ownership["repositories"]
    .find { |candidate| candidate["id"] == "eleni-neferi" }["manifest_validation"]
  validation["status"] = "pending"
  validation["status_history"] = [
    { "status" => "pending", "at" => "2026-07-13", "revision" => nil }
  ]
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected(
  "private manifest review without public-safe attestation",
  "private repository eleni-neferi review manifest requires a public-safe revision digest and repository attestation without private operational URLs"
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  validation = ownership["repositories"]
    .find { |candidate| candidate["id"] == "eleni-neferi" }["manifest_validation"]
  validation["evidence"]["attestation_path"] = nil
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected(
  "private manifest attestation with mismatched digest",
  "private manifest attestation for eleni-neferi does not match the ownership record"
) do |directory|
  path = File.join(directory, "data/evidence/ECO-GOAL-0001-private-manifest-review.yaml")
  attestation = YAML.safe_load(File.read(path))
  attestation["attestations"].find { |entry| entry["repository_id"] == "eleni-neferi" }["review_revision_digest"] =
    "sha256:#{"0" * 64}"
  write_yaml(directory, "data/evidence/ECO-GOAL-0001-private-manifest-review.yaml", attestation)
end

assert_rejected(
  "private manifest attestation leaking an operational URL",
  "private manifest attestation must not publish operational URLs or raw revisions"
) do |directory|
  path = File.join(directory, "data/evidence/ECO-GOAL-0001-private-manifest-review.yaml")
  File.open(path, "a") { |file| file.write("\n# https://github.com/private/repository/pull/1\n") }
end

assert_rejected(
  "private manifest attestation comment with credential assignment",
  "data/evidence/ECO-GOAL-0001-private-manifest-review.yaml: contains possible inline credential assignment"
) do |directory|
  path = File.join(directory, "data/evidence/ECO-GOAL-0001-private-manifest-review.yaml")
  File.open(path, "a") { |file| file.write("\n# token = \"fixture-secret-value\"\n") }
end

assert_rejected(
  "private manifest attestation with unapproved skipped check",
  "private manifest attestation skipped checks must use the public-safe allowlist"
) do |directory|
  path = File.join(directory, "data/evidence/ECO-GOAL-0001-private-manifest-review.yaml")
  attestation = YAML.safe_load(File.read(path))
  attestation["attestations"].first["skipped_checks"] << "private-run-123"
  write_yaml(directory, "data/evidence/ECO-GOAL-0001-private-manifest-review.yaml", attestation)
end

assert_rejected(
  "private manifest attestation with unapproved limitation",
  "private manifest attestation for eleni-neferi does not match the ownership record"
) do |directory|
  path = File.join(directory, "data/evidence/ECO-GOAL-0001-private-manifest-review.yaml")
  attestation = YAML.safe_load(File.read(path))
  attestation["attestations"].first["limitations"] << "private-pr-2"
  write_yaml(directory, "data/evidence/ECO-GOAL-0001-private-manifest-review.yaml", attestation)
end

assert_rejected(
  "Greek target attestation claiming ambiguous identity alignment",
  "data/evidence/ECO-GOAL-0001-greek-repository-target-attestation.yaml: Greek target attestation must remain the canonical public-safe unresolved decision record"
) do |directory|
  path = "data/evidence/ECO-GOAL-0001-greek-repository-target-attestation.yaml"
  attestation = YAML.safe_load(File.read(File.join(directory, path)))
  attestation["ambiguous_candidate"]["identity_alignment"] = "verified"
  write_yaml(directory, path, attestation)
end

assert_rejected(
  "Goal evidence attestation comment with credential assignment",
  "data/evidence/ECO-GOAL-0001-greek-repository-target-attestation.yaml: contains possible inline credential assignment"
) do |directory|
  path = File.join(directory, "data/evidence/ECO-GOAL-0001-greek-repository-target-attestation.yaml")
  File.open(path, "a") { |file| file.write("\n# password = \"fixture-secret-value\"\n") }
end

assert_rejected(
  "Greek target attestation comment with private candidate identifier",
  "data/evidence/ECO-GOAL-0001-greek-repository-target-attestation.yaml: canonical Greek target attestation must not contain comments"
) do |directory|
  path = File.join(directory, "data/evidence/ECO-GOAL-0001-greek-repository-target-attestation.yaml")
  File.open(path, "a") { |file| file.write("\n# owner/private-candidate\n") }
end

assert_rejected(
  "Greek target attestation inline comment with private candidate identifier",
  "data/evidence/ECO-GOAL-0001-greek-repository-target-attestation.yaml: canonical Greek target attestation must not contain comments"
) do |directory|
  path = File.join(directory, "data/evidence/ECO-GOAL-0001-greek-repository-target-attestation.yaml")
  content = File.read(path)
  updated = content.sub("schema_version: 1", "schema_version: 1 # owner/private-candidate")
  abort "inline Greek target comment fixture could not locate schema version" if updated == content
  File.write(path, updated)
end

assert_rejected(
  "Greek target attestation comment with repository URL",
  "data/evidence/ECO-GOAL-0001-greek-repository-target-attestation.yaml: canonical Greek target attestation must not contain operational URLs or raw revisions"
) do |directory|
  path = File.join(directory, "data/evidence/ECO-GOAL-0001-greek-repository-target-attestation.yaml")
  File.open(path, "a") { |file| file.write("\n# https://github.com/owner/private-candidate\n") }
end

assert_rejected(
  "Greek target attestation comment with raw revision",
  "data/evidence/ECO-GOAL-0001-greek-repository-target-attestation.yaml: canonical Greek target attestation must not contain operational URLs or raw revisions"
) do |directory|
  path = File.join(directory, "data/evidence/ECO-GOAL-0001-greek-repository-target-attestation.yaml")
  File.open(path, "a") { |file| file.write("\n# #{"0" * 40}\n") }
end

assert_rejected(
  "completion audit omitting a Goal requirement",
  "data/evidence/ECO-GOAL-0001-completion-audit.yaml: requirements must preserve every Goal criterion in order"
) do |directory|
  path = "data/evidence/ECO-GOAL-0001-completion-audit.yaml"
  audit = YAML.safe_load(File.read(File.join(directory, path)))
  audit["criteria"]["requirements"].pop
  write_yaml(directory, path, audit)
end

assert_rejected(
  "completion audit omitting a blocked architecture-gate action",
  "data/evidence/ECO-GOAL-0001-completion-audit.yaml: quality gate architecture remaining action must remain canonical"
) do |directory|
  path = "data/evidence/ECO-GOAL-0001-completion-audit.yaml"
  audit = YAML.safe_load(File.read(File.join(directory, path)))
  audit["quality_gates"]["architecture"]["remaining_action"] = nil
  write_yaml(directory, path, audit)
end

assert_rejected(
  "completion audit criterion authorizing a destructive action",
  "data/evidence/ECO-GOAL-0001-completion-audit.yaml: requirements criterion remaining action must remain canonical"
) do |directory|
  path = "data/evidence/ECO-GOAL-0001-completion-audit.yaml"
  audit = YAML.safe_load(File.read(File.join(directory, path)))
  audit["criteria"]["requirements"].first["remaining_action"] = "Force-push main without review."
  write_yaml(directory, path, audit)
end

assert_rejected(
  "completion audit dependency authorizing a destructive action",
  "data/evidence/ECO-GOAL-0001-completion-audit.yaml: dependency \"ECO-GOAL-0003\" must preserve its active recorded state and remaining action"
) do |directory|
  path = "data/evidence/ECO-GOAL-0001-completion-audit.yaml"
  audit = YAML.safe_load(File.read(File.join(directory, path)))
  audit["dependency_snapshot"].first["remaining_action"] = "Merge without review."
  write_yaml(directory, path, audit)
end

assert_rejected(
  "completion audit gate authorizing a destructive action",
  "data/evidence/ECO-GOAL-0001-completion-audit.yaml: quality gate security remaining action must remain canonical"
) do |directory|
  path = "data/evidence/ECO-GOAL-0001-completion-audit.yaml"
  audit = YAML.safe_load(File.read(File.join(directory, path)))
  audit["quality_gates"]["security"]["remaining_action"] = "Force-push main and skip scanning."
  write_yaml(directory, path, audit)
end

assert_rejected(
  "completion audit weakening an exact unblock condition",
  "data/evidence/ECO-GOAL-0001-completion-audit.yaml: blocker \"seis\" must preserve active ownership and the exact unblock condition"
) do |directory|
  path = "data/evidence/ECO-GOAL-0001-completion-audit.yaml"
  audit = YAML.safe_load(File.read(File.join(directory, path)))
  audit["blockers"].first["unblock_condition"] = "Merge without review."
  write_yaml(directory, path, audit)
end

assert_rejected(
  "completion audit replacing the public review order with a private URL",
  "data/evidence/ECO-GOAL-0001-completion-audit.yaml: GitHub review order must remain the canonical pending human-controlled sequence"
) do |directory|
  path = "data/evidence/ECO-GOAL-0001-completion-audit.yaml"
  audit = YAML.safe_load(File.read(File.join(directory, path)))
  audit["github_review_order"].first["artifact"] = "https://github.com/private/repository/pull/1"
  write_yaml(directory, path, audit)
end

assert_rejected(
  "completion audit comment with private operational URL",
  "data/evidence/ECO-GOAL-0001-completion-audit.yaml: completion audit must not publish unapproved operational URLs"
) do |directory|
  path = File.join(directory, "data/evidence/ECO-GOAL-0001-completion-audit.yaml")
  File.open(path, "a") { |file| file.write("\n# https://github.com/private/repository/pull/1\n") }
end

assert_rejected(
  "completion audit criterion using circular self-evidence",
  "data/evidence/ECO-GOAL-0001-completion-audit.yaml: requirements criterion must reference unique, known, non-circular ECO-GOAL-0001 evidence"
) do |directory|
  path = "data/evidence/ECO-GOAL-0001-completion-audit.yaml"
  audit = YAML.safe_load(File.read(File.join(directory, path)))
  audit["criteria"]["requirements"].first["evidence_refs"] = ["ECO-EVIDENCE-012"]
  write_yaml(directory, path, audit)
end

assert_rejected(
  "completion audit criterion referencing failed evidence",
  "data/evidence/ECO-GOAL-0001-completion-audit.yaml: requirements criterion must reference unique, known, non-circular ECO-GOAL-0001 evidence"
) do |directory|
  goal_path = "goals/blocked/ECO-GOAL-0001--project-manifests-and-canonical-ownership.yaml"
  goal = YAML.safe_load(File.read(File.join(directory, goal_path)))
  goal["evidence_records"].find { |record| record["id"] == "ECO-EVIDENCE-001" }["status"] = "failed"
  write_yaml(directory, goal_path, goal)
end

assert_rejected(
  "completion audit dependency using circular self-evidence",
  "data/evidence/ECO-GOAL-0001-completion-audit.yaml: dependency \"ECO-GOAL-0003\" must reference unique, known, non-circular ECO-GOAL-0001 evidence"
) do |directory|
  path = "data/evidence/ECO-GOAL-0001-completion-audit.yaml"
  audit = YAML.safe_load(File.read(File.join(directory, path)))
  audit["dependency_snapshot"].first["evidence_refs"] = ["ECO-EVIDENCE-012"]
  write_yaml(directory, path, audit)
end

assert_rejected(
  "completion audit falsely satisfying a blocked manifest criterion",
  "data/evidence/ECO-GOAL-0001-completion-audit.yaml: definition_of_done criterion assessment must remain \"blocked\" while this snapshot is blocked"
) do |directory|
  path = "data/evidence/ECO-GOAL-0001-completion-audit.yaml"
  audit = YAML.safe_load(File.read(File.join(directory, path)))
  audit["criteria"]["definition_of_done"].first["assessment"] = "satisfied"
  audit["criteria"]["definition_of_done"].first["remaining_action"] = nil
  write_yaml(directory, path, audit)
end

assert_rejected(
  "completion audit falsely passing the required security gate",
  "data/evidence/ECO-GOAL-0001-completion-audit.yaml: quality gate security assessment must remain \"partial\" for declared state \"required\""
) do |directory|
  path = "data/evidence/ECO-GOAL-0001-completion-audit.yaml"
  audit = YAML.safe_load(File.read(File.join(directory, path)))
  audit["quality_gates"]["security"]["assessment"] = "passed"
  audit["quality_gates"]["security"]["remaining_action"] = nil
  write_yaml(directory, path, audit)
end

assert_rejected(
  "completion audit with a non-string root key",
  "data/evidence/ECO-GOAL-0001-completion-audit.yaml: completion audit fields must match the canonical contract"
) do |directory|
  path = "data/evidence/ECO-GOAL-0001-completion-audit.yaml"
  audit = YAML.safe_load(File.read(File.join(directory, path)))
  audit[1] = "unexpected"
  write_yaml(directory, path, audit)
end

assert_rejected(
  "completion audit remaining action with uppercase private URL",
  "data/evidence/ECO-GOAL-0001-completion-audit.yaml: completion audit must not publish unapproved operational URLs"
) do |directory|
  path = "data/evidence/ECO-GOAL-0001-completion-audit.yaml"
  audit = YAML.safe_load(File.read(File.join(directory, path)))
  audit["criteria"]["requirements"].last["remaining_action"] = "HTTPS://github.com/private/repository/pull/1"
  write_yaml(directory, path, audit)
end

assert_rejected(
  "completion audit remaining action with escaped private URL",
  "data/evidence/ECO-GOAL-0001-completion-audit.yaml: completion audit must not publish unapproved operational URLs"
) do |directory|
  path = File.join(directory, "data/evidence/ECO-GOAL-0001-completion-audit.yaml")
  content = File.read(path)
  marker = "remaining_action: The accountable human confirms the exact canonical target or explicitly defers Greek publication."
  updated = content.sub(marker, 'remaining_action: "HTTPS\\u003A//github.com/private/repository/pull/1"')
  abort "escaped audit URL fixture could not locate remaining action" if updated == content
  File.write(path, updated)
end

assert_rejected(
  "completion audit remaining action with protocol-relative GitHub reference",
  "data/evidence/ECO-GOAL-0001-completion-audit.yaml: completion audit must not publish bare or protocol-relative GitHub references"
) do |directory|
  path = "data/evidence/ECO-GOAL-0001-completion-audit.yaml"
  audit = YAML.safe_load(File.read(File.join(directory, path)))
  audit["criteria"]["requirements"].last["remaining_action"] = "//github.com/private/repository/pull/1"
  write_yaml(directory, path, audit)
end

{
  "protocol-relative GitHub reference with a port" => "//github.com:443/private/repository/pull/1",
  "protocol-relative GitHub reference with a trailing-dot host" => "//github.com./private/repository/pull/1",
  "protocol-relative GitHub reference with an encoded letter" => "//g%69thub.com/private/repository/pull/1",
  "protocol-relative GitHub reference with an encoded dot" => "//github%2ecom/private/repository/pull/1",
  "protocol-relative GitHub reference with a Unicode dot" => "//github。com/private/repository/pull/1"
}.each do |label, reference|
  assert_rejected(
    "completion audit remaining action with #{label}",
    "data/evidence/ECO-GOAL-0001-completion-audit.yaml: completion audit must not publish bare or protocol-relative GitHub references"
  ) do |directory|
    path = "data/evidence/ECO-GOAL-0001-completion-audit.yaml"
    audit = YAML.safe_load(File.read(File.join(directory, path)))
    audit["criteria"]["requirements"].last["remaining_action"] = reference
    write_yaml(directory, path, audit)
  end
end

assert_rejected(
  "completion decision packet with private operational URL",
  "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md: completion decision packet must not publish unapproved operational URLs"
) do |directory|
  path = File.join(directory, "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md")
  File.open(path, "a") { |file| file.write("\nHTTPS://github.com/private/repository/pull/1\n") }
end

assert_rejected(
  "completion decision packet with HTML-escaped private URL",
  "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md: completion decision packet must not publish unapproved operational URLs"
) do |directory|
  path = File.join(directory, "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md")
  File.open(path, "a") { |file| file.write("\nHTTPS&#58;//github.com/private/repository/pull/1\n") }
end

assert_rejected(
  "completion decision packet with unsupported named HTML entities",
  "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md: completion decision packet must not retain unsupported HTML entity escapes"
) do |directory|
  path = File.join(directory, "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md")
  File.open(path, "a") { |file| file.write("\nHTTPS&colon;&sol;&sol;github&period;com/private/repository/pull/1\n") }
end

assert_rejected(
  "completion decision packet with CommonMark-escaped private URL",
  "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md: completion decision packet must not publish unapproved operational URLs"
) do |directory|
  path = File.join(directory, "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md")
  File.open(path, "a") { |file| file.write("\nHTTPS\\://github.com/private/repository/pull/1\n") }
end

assert_rejected(
  "completion decision packet with HTML-escaped raw revision",
  "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md: completion decision packet must not publish raw revisions"
) do |directory|
  path = File.join(directory, "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md")
  File.open(path, "a") { |file| file.write("\n#{"0" * 39}&#48;\n") }
end

assert_rejected(
  "completion decision packet with bare GitHub reference",
  "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md: completion decision packet must not publish bare or protocol-relative GitHub references"
) do |directory|
  path = File.join(directory, "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md")
  File.open(path, "a") { |file| file.write("\ngithub.com/private/repository/pull/1\n") }
end

{
  "protocol-relative GitHub reference with a port" => "//github.com:443/private/repository/pull/1",
  "protocol-relative GitHub reference with a trailing-dot host" => "//github.com./private/repository/pull/1",
  "protocol-relative GitHub reference with an encoded host" => "//g%69thub%2ecom/private/repository/pull/1"
}.each do |label, reference|
  assert_rejected(
    "completion decision packet with #{label}",
    "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md: completion decision packet must not publish bare or protocol-relative GitHub references"
  ) do |directory|
    path = File.join(directory, "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md")
    File.open(path, "a") { |file| file.write("\n#{reference}\n") }
  end
end

assert_accepted("completion decision packet with CRLF checkout bytes") do |directory|
  path = File.join(directory, "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md")
  content = File.binread(path).gsub("\n", "\r\n")
  File.binwrite(path, content)
end

assert_rejected(
  "completion decision packet contradicting recorded CI satisfaction",
  "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md: missing \"| Passing CI | Satisfied as point-in-time evidence |\""
) do |directory|
  path = File.join(directory, "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md")
  content = File.read(path)
  updated = content.sub("| Passing CI | Satisfied as point-in-time evidence |", "| Passing CI | Partial |")
  abort "completion packet CI fixture could not locate satisfied assessment" if updated == content
  File.write(path, updated)
end

assert_rejected(
  "completion decision packet appending a completion-ready contradiction",
  "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md: completion decision packet content must match the canonical reviewed digest"
) do |directory|
  path = File.join(directory, "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md")
  File.open(path, "a") { |file| file.write("\nECO-GOAL-0001 is completion-ready.\n") }
end

assert_rejected(
  "completion decision packet appending a seventh destructive step",
  "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md: completion decision packet content must match the canonical reviewed digest"
) do |directory|
  path = File.join(directory, "docs/reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md")
  File.open(path, "a") { |file| file.write("\n7. Force-push main without review.\n") }
end

assert_rejected(
  "external manifest expected identity mismatch",
  "repository eleni-neferi manifest expected identity must match its canonical repository id"
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["repositories"]
    .find { |candidate| candidate["id"] == "eleni-neferi" }["manifest_validation"]["expected"]["project_id"] = "seis"
  write_yaml(directory, "data/repository-ownership.yaml", ownership)
end

assert_rejected(
  "external manifest expected visibility mismatch",
  "repository eleni-neferi manifest expected visibility must match repository visibility \"private\""
) do |directory|
  ownership = YAML.safe_load(File.read(File.join(directory, "data/repository-ownership.yaml")))
  ownership["repositories"]
    .find { |candidate| candidate["id"] == "eleni-neferi" }["manifest_validation"]["expected"]["visibility"] = "public-safe"
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
  "repository seis manifest expected visibility must match repository visibility \"private\""
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

puts "Ecosystem foundation tests passed: repository-scoped ownership was preserved; empty or malformed YAML, duplicate, overlapping, case-folded, non-normalized, or cross-platform absolute ownership paths, path-confused remotes, contradictory repository observations, escaping evidence and decision paths, false, unbound, leaking, or unevidenced manifest review, illegal manifest lifecycle transitions, impossible validated CI or canonical states, expected identity or visibility mismatches, duplicate or unknown consumers, private operational URLs, unrelated, noncanonical-port, unsupported-release, or revision-mismatched public artifacts, unbound distribution claims, unevidenced observed consumers, unsafe consumer paths, incomplete or weakened completion audits, unquoted dates, missing rollback, dangling Goal and blocker references, incomplete quality gates, proofless, nonexistent, or contradictory passed evidence, illegal Goal histories, invalid blocked state, and unsupported completion or release-note state were rejected; separate public merge revisions and bound public/private consumer attestations were accepted."
