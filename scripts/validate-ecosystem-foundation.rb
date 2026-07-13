#!/usr/bin/env ruby

require "json"
require "pathname"
require "uri"
require "yaml"

ROOT = File.expand_path("..", __dir__)
ERRORS = []

MANIFEST_PATH = "project.ecosystem.yaml"
OWNERSHIP_PATH = "data/repository-ownership.yaml"
OWNERSHIP_DOC_PATH = "docs/REPOSITORY_OWNERSHIP.md"
GOAL_GLOB = "goals/{active,backlog,blocked,completed,archived}/*.yaml"

def absolute(relative_path)
  File.join(ROOT, relative_path)
end

def read_text(relative_path)
  path = absolute(relative_path)
  unless File.file?(path)
    ERRORS << "missing file: #{relative_path}"
    return ""
  end
  File.read(path)
rescue StandardError => error
  ERRORS << "could not read #{relative_path}: #{error.message}"
  ""
end

def read_yaml(relative_path)
  YAML.safe_load(
    read_text(relative_path),
    permitted_classes: [],
    permitted_symbols: [],
    aliases: false
  )
rescue Psych::Exception => error
  ERRORS << "invalid YAML in #{relative_path}: #{error.message}"
  nil
end

def read_json(relative_path)
  JSON.parse(read_text(relative_path))
rescue JSON::ParserError => error
  ERRORS << "invalid JSON in #{relative_path}: #{error.message}"
  nil
end

def valid_https_url?(value)
  return false unless value.is_a?(String) && !value.strip.empty?

  uri = URI.parse(value)
  uri.is_a?(URI::HTTPS) && !uri.host.to_s.empty? && uri.userinfo.nil?
rescue URI::InvalidURIError
  false
end

def valid_github_repository_url?(value, remote, suffix_pattern)
  return false unless valid_https_url?(value)

  uri = URI.parse(value)
  return false unless uri.host.to_s.casecmp("github.com").zero?

  uri.path.match?(%r{\A/#{Regexp.escape(remote)}/#{suffix_pattern}\z}) && uri.query.nil? && uri.fragment.nil?
rescue URI::InvalidURIError
  false
end

def valid_github_remote?(value)
  return false unless value.is_a?(String)

  segments = value.split("/", -1)
  return false unless segments.length == 2

  owner, repository = segments
  return false unless owner.match?(/\A[A-Za-z0-9][A-Za-z0-9-]{0,38}\z/)
  return false unless repository.match?(/\A[A-Za-z0-9][A-Za-z0-9_.-]*\z/)

  ![".", ".."].include?(repository)
end

def sha256_digest?(value)
  value.is_a?(String) && value.match?(/\Asha256:[0-9a-f]{64}\z/)
end

def existing_repository_artifact?(value)
  return false unless value.is_a?(String) && !value.strip.empty?
  return false if value.start_with?(File::SEPARATOR)

  candidate = File.expand_path(value, ROOT)
  return false unless candidate.start_with?("#{ROOT}#{File::SEPARATOR}") && File.file?(candidate)

  real_root = File.realpath(ROOT)
  real_candidate = File.realpath(candidate)
  real_candidate.start_with?("#{real_root}#{File::SEPARATOR}") && File.file?(real_candidate)
rescue Errno::ENOENT, Errno::EACCES
  false
end

def normalized_repository_path(value)
  return nil unless value.is_a?(String) && !value.strip.empty?
  return nil if value.match?(/\A[A-Za-z]:/) || value.start_with?("\\", "//")

  path = Pathname.new(value)
  return nil if path.absolute?

  normalized = path.cleanpath.to_s.tr("\\", "/")
  return nil if normalized == "." || normalized == ".." || normalized.start_with?("../")

  normalized
end

def schema_type?(value, type)
  case type
  when "object" then value.is_a?(Hash)
  when "array" then value.is_a?(Array)
  when "string" then value.is_a?(String)
  when "integer" then value.is_a?(Integer)
  when "number" then value.is_a?(Numeric)
  when "boolean" then value == true || value == false
  when "null" then value.nil?
  else false
  end
end

def resolve_ref(root_schema, reference)
  return nil unless reference.start_with?("#/")

  reference.delete_prefix("#/").split("/").reduce(root_schema) do |value, token|
    break nil unless value.is_a?(Hash)
    value[token.gsub("~1", "/").gsub("~0", "~")]
  end
end

def validate_schema(value, schema, root_schema, label)
  return unless schema.is_a?(Hash)

  if schema["$ref"]
    resolved = resolve_ref(root_schema, schema["$ref"])
    if resolved
      validate_schema(value, resolved, root_schema, label)
    else
      ERRORS << "#{label}: unresolved schema reference #{schema["$ref"]}"
    end
    return
  end

  allowed_types = Array(schema["type"])
  unless allowed_types.empty? || allowed_types.any? { |type| schema_type?(value, type) }
    ERRORS << "#{label}: expected #{allowed_types.join(" or ")}, got #{value.class}"
    return
  end

  if schema.key?("const") && value != schema["const"]
    ERRORS << "#{label}: must equal #{schema["const"].inspect}"
  end
  if schema["enum"] && !schema["enum"].include?(value)
    ERRORS << "#{label}: must be one of #{schema["enum"].join(", ")}"
  end

  if value.is_a?(String)
    if schema["minLength"] && value.length < schema["minLength"]
      ERRORS << "#{label}: must contain at least #{schema["minLength"]} character(s)"
    end
    if schema["pattern"] && !Regexp.new(schema["pattern"]).match?(value)
      ERRORS << "#{label}: does not match #{schema["pattern"]}"
    end
  end

  if value.is_a?(Array)
    if schema["minItems"] && value.length < schema["minItems"]
      ERRORS << "#{label}: must contain at least #{schema["minItems"]} item(s)"
    end
    if schema["uniqueItems"] && value.uniq.length != value.length
      ERRORS << "#{label}: items must be unique"
    end
    value.each_with_index do |item, index|
      validate_schema(item, schema["items"], root_schema, "#{label}[#{index}]") if schema["items"]
    end
  end

  return unless value.is_a?(Hash)

  required = schema["required"] || []
  required.each do |key|
    ERRORS << "#{label}: missing required field #{key}" unless value.key?(key)
  end
  properties = schema["properties"] || {}
  value.each do |key, nested_value|
    nested_schema = properties[key]
    if nested_schema
      validate_schema(nested_value, nested_schema, root_schema, "#{label}.#{key}")
    elsif schema["additionalProperties"] == false
      ERRORS << "#{label}: unexpected field #{key}"
    end
  end
end

def duplicates(values)
  values.group_by(&:itself).select { |_value, matches| matches.length > 1 }.keys
end

manifest_schema = read_json("schemas/project-ecosystem.schema.json")
ownership_schema = read_json("schemas/repository-ownership.schema.json")
goal_schema = read_json("schemas/ecosystem-goal.schema.json")
manifest = read_yaml(MANIFEST_PATH)
ownership = read_yaml(OWNERSHIP_PATH)

validate_schema(manifest, manifest_schema, manifest_schema, MANIFEST_PATH) if manifest_schema
validate_schema(ownership, ownership_schema, ownership_schema, OWNERSHIP_PATH) if ownership_schema

repositories = ownership.is_a?(Hash) ? Array(ownership["repositories"]) : []
modules = ownership.is_a?(Hash) ? Array(ownership["modules"]) : []
repository_ids = repositories.map { |repository| repository["id"] if repository.is_a?(Hash) }.compact
module_ids = modules.map { |mod| mod["id"] if mod.is_a?(Hash) }.compact

duplicates(repository_ids).each { |id| ERRORS << "#{OWNERSHIP_PATH}: duplicate repository id #{id}" }
duplicates(module_ids).each { |id| ERRORS << "#{OWNERSHIP_PATH}: duplicate module id #{id}" }

registry = ownership.is_a?(Hash) ? ownership["registry"] : nil
coordinator = registry["canonical_coordinator_repo"] if registry.is_a?(Hash)
observed_repository_states = ["observed-local-and-remote", "observed-remote"]
verification_methods_by_state = {
  "observed-local-and-remote" => [
    "local-git-and-authenticated-github-connector",
    "fresh-clone-and-authenticated-github-connector"
  ],
  "observed-remote" => ["authenticated-github-connector"],
  "repository-metadata-invalid" => ["local-git", "not-observed"],
  "proposed" => ["not-observed"]
}.freeze

repositories.each do |repository|
  next unless repository.is_a?(Hash)

  repository_id = repository["id"]
  remote = repository["remote"]
  verification = repository["verification"]
  verification_method = repository["verification_method"]
  allowed_verification_methods = verification_methods_by_state[verification]
  if allowed_verification_methods && !allowed_verification_methods.include?(verification_method)
    ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} verification #{verification.inspect} cannot use method #{verification_method.inspect}"
  end
  if observed_repository_states.include?(verification)
    ["remote", "default_branch"].each do |field|
      value = repository[field]
      if !value.is_a?(String) || value.strip.empty? || value.strip.casecmp("unknown").zero?
        ERRORS << "#{OWNERSHIP_PATH}: observed repository #{repository_id} has unknown #{field} metadata"
      end
    end
    unless valid_github_remote?(remote)
      ERRORS << "#{OWNERSHIP_PATH}: observed repository #{repository_id} remote must use an exact GitHub owner/repository identity"
    end
    if repository["observed_at"].nil? || verification_method == "not-observed"
      ERRORS << "#{OWNERSHIP_PATH}: observed repository #{repository_id} must record observation date and method"
    end
    observed_revision = repository["observed_revision"]
    observed_revision_digest = repository["observed_revision_digest"]
    if repository["visibility"] == "private"
      unless observed_revision.nil? && sha256_digest?(observed_revision_digest)
        ERRORS << "#{OWNERSHIP_PATH}: private observed repository #{repository_id} must publish only a SHA-256 revision digest"
      end
    elsif !(observed_revision.is_a?(String) && observed_revision.match?(/\A[0-9a-f]{40}\z/) && observed_revision_digest.nil?)
      ERRORS << "#{OWNERSHIP_PATH}: public observed repository #{repository_id} must record a full lowercase revision without a digest surrogate"
    end
    evidence_path = repository["verification_evidence"]
    unless existing_repository_artifact?(evidence_path)
      ERRORS << "#{OWNERSHIP_PATH}: observed repository #{repository_id} evidence #{evidence_path.inspect} is missing or outside the repository"
    end
  end
  if repository["canonical"] == true && !observed_repository_states.include?(verification)
    ERRORS << "#{OWNERSHIP_PATH}: canonical repository #{repository_id} must have observed remote metadata"
  end
  if verification == "observed-local-and-remote" && repository["local_worktree"] != "valid"
    ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} marked observed-local-and-remote must have a valid local worktree"
  end
  manifest_validation = repository["manifest_validation"]
  next unless manifest_validation.is_a?(Hash)

  manifest_status = manifest_validation["status"]
  status_history = Array(manifest_validation["status_history"])
  manifest_path = manifest_validation["manifest_path"]
  manifest_revision = manifest_validation["manifest_revision"]
  manifest_revision_digest = manifest_validation["manifest_revision_digest"]
  canonical_manifest_revision = manifest_validation["canonical_manifest_revision"]
  canonical_manifest_revision_digest = manifest_validation["canonical_manifest_revision_digest"]
  expected = manifest_validation["expected"]
  evidence = manifest_validation["evidence"]
  history_transitions = {
    "pending" => ["review"],
    "review" => ["validated", "rejected"],
    "validated" => [],
    "rejected" => []
  }
  if status_history.empty? || status_history.first["status"] != "pending"
    ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} manifest history must start at pending"
  end
  if status_history.any? && status_history.last["status"] != manifest_status
    ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} manifest status must match its latest history entry"
  end
  status_history.each_cons(2) do |previous, current|
    allowed = history_transitions.fetch(previous["status"], [])
    unless allowed.include?(current["status"])
      ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} manifest history cannot transition from #{previous["status"].inspect} to #{current["status"].inspect}"
    end
    if previous["at"].is_a?(String) && current["at"].is_a?(String) && current["at"] < previous["at"]
      ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} manifest history dates must be nondecreasing"
    end
  end
  status_history.each do |history_entry|
    next unless history_entry.is_a?(Hash)

    history_revision = history_entry["revision"]
    if history_entry["status"] == "pending"
      ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} pending manifest history must not record a revision" unless history_revision.nil?
    elsif repository["visibility"] == "private"
      ERRORS << "#{OWNERSHIP_PATH}: private repository #{repository_id} manifest history must use only SHA-256 revision digests" unless sha256_digest?(history_revision)
    elsif !(history_revision.is_a?(String) && history_revision.match?(/\A[0-9a-f]{40}\z/))
      ERRORS << "#{OWNERSHIP_PATH}: public repository #{repository_id} manifest history must use full lowercase revisions"
    end
  end
  review_revision_reference = manifest_revision || manifest_revision_digest
  canonical_revision_reference = canonical_manifest_revision || canonical_manifest_revision_digest
  status_revision_reference = manifest_status == "validated" ? canonical_revision_reference : review_revision_reference
  if status_history.any? && status_history.last["revision"] != status_revision_reference
    ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} manifest revision must match its latest history entry"
  end
  review_history_entry = status_history.find { |entry| entry.is_a?(Hash) && entry["status"] == "review" }
  if review_history_entry && review_history_entry["revision"] != review_revision_reference
    ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} reviewed manifest revision must remain stable across later states"
  end
  normalized_manifest_path = normalized_repository_path(manifest_path)
  if normalized_manifest_path.nil?
    ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} manifest path #{manifest_path.inspect} must remain a nonempty repository-relative path"
  elsif normalized_manifest_path != manifest_path
    ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} manifest path #{manifest_path.inspect} must be normalized as #{normalized_manifest_path.inspect}"
  end

  if expected.is_a?(Hash)
    expected_visibility = repository["visibility"] == "public" ? "public-safe" : "private"
    expected_public_repo = repository["visibility"] == "public"
    unless expected["project_id"] == repository_id && expected["canonical_owner_repo"] == repository_id
      ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} manifest expected identity must match its canonical repository id"
    end
    unless expected["visibility"] == expected_visibility && expected["public_repo"] == expected_public_repo
      ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} manifest expected visibility must match repository visibility #{repository["visibility"].inspect}"
    end
  end

  evidence_detail_keys = %w[
    attestation_path observed_at commit_url pull_request_url ci_run_url
    pull_request_head_revision manifest_revision_ancestor_of_pull_request_head
    manifest_path_unchanged_at_pull_request_head
    manifest_content_matches_review_at_canonical_revision
    pull_request_state pull_request_draft
    ci_head_revision ci_status ci_conclusion ci_event
  ]
  evidence_values = evidence.is_a?(Hash) ? evidence_detail_keys.map { |key| evidence[key] } : []
  if manifest_status == "pending"
    unless manifest_revision.nil? && manifest_revision_digest.nil? &&
        canonical_manifest_revision.nil? && canonical_manifest_revision_digest.nil? &&
        evidence_values.all?(&:nil?)
      ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} pending manifest must not claim a revision or validation evidence"
    end
  elsif ["review", "validated", "rejected"].include?(manifest_status)
    public_evidence = repository["visibility"] == "public"
    if public_evidence
      revision_valid = manifest_revision.is_a?(String) && manifest_revision.match?(/\A[0-9a-f]{40}\z/) && manifest_revision_digest.nil?
      evidence_valid = evidence.is_a?(Hash) &&
        evidence["disclosure"] == "public-evidence" && evidence["attestation_path"].nil? &&
        valid_github_repository_url?(evidence["commit_url"], remote.to_s, "commit/#{Regexp.escape(manifest_revision.to_s)}") &&
        valid_github_repository_url?(evidence["pull_request_url"], remote.to_s, "pull/[1-9][0-9]*") &&
        valid_github_repository_url?(evidence["ci_run_url"], remote.to_s, "actions/runs/[1-9][0-9]*") &&
        evidence["observed_at"] == repository["observed_at"] &&
        evidence["pull_request_head_revision"].is_a?(String) &&
        evidence["ci_head_revision"] == evidence["pull_request_head_revision"] &&
        evidence["manifest_revision_ancestor_of_pull_request_head"] == true &&
        evidence["manifest_path_unchanged_at_pull_request_head"] == true
      unless revision_valid && evidence_valid
        ERRORS << "#{OWNERSHIP_PATH}: public repository #{repository_id} #{manifest_status} manifest requires revision-bound public commit, pull request, and CI evidence"
      end
    else
      attestation_path = evidence["attestation_path"] if evidence.is_a?(Hash)
      revision_valid = manifest_revision.nil? && sha256_digest?(manifest_revision_digest)
      evidence_valid = evidence.is_a?(Hash) && evidence["disclosure"] == "public-safe-attestation" &&
        existing_repository_artifact?(attestation_path) && evidence["commit_url"].nil? &&
        evidence["pull_request_url"].nil? && evidence["ci_run_url"].nil? &&
        evidence["pull_request_head_revision"].nil? && evidence["ci_head_revision"].nil? &&
        evidence["manifest_revision_ancestor_of_pull_request_head"].nil? &&
        evidence["manifest_path_unchanged_at_pull_request_head"].nil? &&
        evidence["observed_at"] == repository["observed_at"]
      unless revision_valid && evidence_valid
        ERRORS << "#{OWNERSHIP_PATH}: private repository #{repository_id} #{manifest_status} manifest requires a public-safe revision digest and repository attestation without private operational URLs"
      end
    end
    if manifest_status == "validated"
      if public_evidence
        canonical_reference_valid = canonical_manifest_revision.is_a?(String) &&
          canonical_manifest_revision.match?(/\A[0-9a-f]{40}\z/) && canonical_manifest_revision_digest.nil?
      else
        canonical_reference_valid = canonical_manifest_revision.nil? && sha256_digest?(canonical_manifest_revision_digest)
      end
      unless canonical_reference_valid && evidence.is_a?(Hash) &&
          evidence["manifest_content_matches_review_at_canonical_revision"] == true
        ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} validated manifest requires a canonical revision reference whose content matches the reviewed manifest"
      end
    elsif !(canonical_manifest_revision.nil? && canonical_manifest_revision_digest.nil? &&
        evidence.is_a?(Hash) && evidence["manifest_content_matches_review_at_canonical_revision"].nil?)
      ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} #{manifest_status} manifest must not claim canonical manifest evidence"
    end
    if evidence.is_a?(Hash) && ["review", "validated"].include?(manifest_status)
      expected_pull_request_state = manifest_status == "review" ? "open" : "merged"
      coherent_pull_request = evidence["pull_request_state"] == expected_pull_request_state
      coherent_pull_request &&= evidence["pull_request_draft"] == false if manifest_status == "validated"
      unless coherent_pull_request && evidence["ci_status"] == "completed" &&
          evidence["ci_conclusion"] == "success" && evidence["ci_event"] == "pull_request"
        ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} #{manifest_status} manifest requires coherent pull-request state and successful completed pull-request CI"
      end
    end
    observed_revision_reference = repository["observed_revision"] || repository["observed_revision_digest"]
    if manifest_status == "validated" && canonical_revision_reference != observed_revision_reference
      ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} validated manifest revision must match the observed canonical revision reference"
    end
    if evidence.is_a?(Hash) && manifest_status == "rejected" && evidence["pull_request_state"] != "closed"
      ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} rejected manifest requires a closed pull-request observation"
    end

    local_project = manifest["project"] if manifest.is_a?(Hash)
    local_manifest_id = local_project["id"] if local_project.is_a?(Hash)
    if repository_id == local_manifest_id
      manifest_is_local = repository["local_worktree"] == "valid" && existing_repository_artifact?(manifest_path)
      unless manifest_is_local
        ERRORS << "#{OWNERSHIP_PATH}: local repository #{repository_id} #{manifest_status} manifest #{manifest_path.inspect} must be an existing file in the current worktree"
      end
      if manifest_is_local && expected.is_a?(Hash)
        claimed_project = manifest["project"]
        claimed_ecosystem = manifest["ecosystem"]
        claimed_security = manifest["security"]
        unless claimed_project.is_a?(Hash) && claimed_ecosystem.is_a?(Hash) && claimed_security.is_a?(Hash) &&
            claimed_project["id"] == expected["project_id"] &&
            claimed_ecosystem["canonical_owner_repo"] == expected["canonical_owner_repo"] &&
            claimed_project["visibility"] == expected["visibility"] &&
            claimed_security["public_repo"] == expected["public_repo"]
          ERRORS << "#{OWNERSHIP_PATH}: local repository #{repository_id} manifest content must match recorded expected identity and visibility"
        end
      end
    end
  end
end

private_review_repositories = repositories.select do |repository|
  repository.is_a?(Hash) && repository["visibility"] == "private" &&
    ["review", "validated", "rejected"].include?(repository.dig("manifest_validation", "status"))
end
private_review_repositories.group_by { |repository| repository.dig("manifest_validation", "evidence", "attestation_path") }.each do |attestation_path, attested_repositories|
  next unless existing_repository_artifact?(attestation_path)

  attestation_text = read_text(attestation_path)
  attestation = read_yaml(attestation_path)
  attestation_root_keys = %w[
    schema_version id goal_id classification observed_at verification_method
    attestations
  ].sort
  unless attestation.is_a?(Hash) && attestation.keys.sort == attestation_root_keys &&
      attestation["schema_version"] == 1 &&
      attestation["id"] == "eco-goal-0001-private-manifest-review" &&
      attestation["goal_id"] == "ECO-GOAL-0001" &&
      attestation["classification"] == "public-safe-metadata-only" &&
      attestation["verification_method"] == "authenticated-read-only-github-observation"
    ERRORS << "#{attestation_path}: private manifest attestation metadata is invalid"
    next
  end
  if attestation_text.match?(%r{https?://|/pull/|/actions/runs/|\b[0-9a-f]{40}\b})
    ERRORS << "#{attestation_path}: private manifest attestation must not publish operational URLs or raw revisions"
  end
  entries = Array(attestation["attestations"])
  attestation_entry_keys = %w[
    repository_id visibility canonical_main_revision_digest review_revision_digest
    status_revision_digest canonical_manifest_revision_digest
    pull_request_state pull_request_draft pull_request_head_matches_review_revision
    manifest_revision_ancestor_of_pull_request_head manifest_path_unchanged_at_pull_request_head
    manifest_content_matches_review_at_canonical_revision
    ci_event ci_status ci_conclusion ci_head_matches_review_revision
    required_checks_passed skipped_checks limitations
  ].sort
  entries.each do |entry|
    unless entry.is_a?(Hash) && entry.keys.sort == attestation_entry_keys
      ERRORS << "#{attestation_path}: private manifest attestation entry has an unexpected shape"
    end
  end
  attested_repository_ids = entries.map { |entry| entry["repository_id"] if entry.is_a?(Hash) }.compact
  duplicates(attested_repository_ids).each do |repository_id|
    ERRORS << "#{attestation_path}: duplicate private manifest attestation for #{repository_id}"
  end
  expected_attested_repository_ids = attested_repositories.map { |repository| repository["id"] }.sort
  unless attested_repository_ids.sort == expected_attested_repository_ids
    ERRORS << "#{attestation_path}: private manifest attestation repository set does not match its ownership references"
  end
  allowed_skipped_checks = ["optional-paired-greek-repository-check"]
  entries.each do |entry|
    next unless entry.is_a?(Hash)

    skipped_checks = entry["skipped_checks"]
    unless skipped_checks.is_a?(Array) && skipped_checks.uniq == skipped_checks &&
        (skipped_checks - allowed_skipped_checks).empty?
      ERRORS << "#{attestation_path}: private manifest attestation skipped checks must use the public-safe allowlist"
    end
  end
  attested_repositories.each do |repository|
    repository_id = repository["id"]
    validation = repository["manifest_validation"]
    review_history_entry = Array(validation["status_history"]).find do |history_entry|
      history_entry.is_a?(Hash) && history_entry["status"] == "review"
    end
    evidence = validation["evidence"]
    expected_limitations = %w[point-in-time-observation private-identifiers-redacted]
    expected_limitations << "canonical-merge-not-proven" unless validation["status"] == "validated"
    entry = entries.find { |candidate| candidate.is_a?(Hash) && candidate["repository_id"] == repository_id }
    unless entry && entry["visibility"] == "private" &&
        attestation["observed_at"] == evidence["observed_at"] &&
        entry["canonical_main_revision_digest"] == repository["observed_revision_digest"] &&
        entry["review_revision_digest"] == review_history_entry&.dig("revision") &&
        entry["status_revision_digest"] == Array(validation["status_history"]).last&.dig("revision") &&
        entry["canonical_manifest_revision_digest"] == validation["canonical_manifest_revision_digest"] &&
        entry["pull_request_state"] == evidence["pull_request_state"] &&
        entry["pull_request_draft"] == evidence["pull_request_draft"] &&
        entry["manifest_revision_ancestor_of_pull_request_head"] == true &&
        entry["manifest_path_unchanged_at_pull_request_head"] == true &&
        entry["manifest_content_matches_review_at_canonical_revision"] == evidence["manifest_content_matches_review_at_canonical_revision"] &&
        entry["ci_event"] == evidence["ci_event"] && entry["ci_status"] == evidence["ci_status"] &&
        entry["ci_conclusion"] == evidence["ci_conclusion"] &&
        entry["pull_request_head_matches_review_revision"] == true &&
        entry["ci_head_matches_review_revision"] == true && entry["required_checks_passed"] == true &&
        entry["limitations"] == expected_limitations
      ERRORS << "#{attestation_path}: private manifest attestation for #{repository_id} does not match the ownership record"
    end
  end
end

canonical_repository_ids = repositories
  .select do |repository|
    repository.is_a?(Hash) && repository["canonical"] == true && observed_repository_states.include?(repository["verification"])
  end
  .map { |repository| repository["id"] }

unless canonical_repository_ids.include?(coordinator)
  ERRORS << "#{OWNERSHIP_PATH}: canonical coordinator #{coordinator.inspect} must be marked canonical with observed repository metadata"
end

if manifest.is_a?(Hash)
  project = manifest["project"]
  ecosystem = manifest["ecosystem"]
  security = manifest["security"]
  project_id = project["id"] if project.is_a?(Hash)
  owner_id = ecosystem["canonical_owner_repo"] if ecosystem.is_a?(Hash)
  ERRORS << "#{MANIFEST_PATH}: project id must be an observed canonical repository" unless canonical_repository_ids.include?(project_id)
  ERRORS << "#{MANIFEST_PATH}: canonical_owner_repo must match project.id in this repository" unless owner_id == project_id
  repository = repositories.find { |candidate| candidate.is_a?(Hash) && candidate["id"] == project_id }
  if repository
    public_repo = security["public_repo"] if security.is_a?(Hash)
    expected_public_repo = repository["visibility"] == "public"
    unless public_repo == expected_public_repo
      ERRORS << "#{MANIFEST_PATH}: security.public_repo must match repository visibility #{repository["visibility"].inspect}"
    end
  end
end

owned_paths = []
modules.each do |mod|
  next unless mod.is_a?(Hash)
  owner = mod["canonical_repo"]
  ERRORS << "#{OWNERSHIP_PATH}: #{mod["id"]} owner #{owner.inspect} is not an observed canonical repository" unless canonical_repository_ids.include?(owner)
  decision_record = mod["decision_record"]
  unless existing_repository_artifact?(decision_record)
    ERRORS << "#{OWNERSHIP_PATH}: #{mod["id"]} decision record #{decision_record.inspect} is missing or outside the repository"
  end
  consumer_repositories = []
  Array(mod["consumers"]).each do |consumer|
    next unless consumer.is_a?(Hash)

    consumer_repository = consumer["repository"]
    consumer_repositories << consumer_repository if consumer_repository
    unless repository_ids.include?(consumer_repository)
      ERRORS << "#{OWNERSHIP_PATH}: #{mod["id"]} has unknown consumer repository #{consumer_repository.inspect}"
    end
    consumer_path = consumer["consumer_path"]
    if consumer_path
      normalized_consumer_path = normalized_repository_path(consumer_path)
      if normalized_consumer_path.nil?
        ERRORS << "#{OWNERSHIP_PATH}: #{mod["id"]} consumer #{consumer_repository.inspect} path #{consumer_path.inspect} must remain a nonempty repository-relative path"
      elsif normalized_consumer_path != consumer_path
        ERRORS << "#{OWNERSHIP_PATH}: #{mod["id"]} consumer #{consumer_repository.inspect} path #{consumer_path.inspect} must be normalized as #{normalized_consumer_path.inspect}"
      end
    end
    consumer_evidence = Array(consumer["evidence"])
    if consumer["status"] == "observed" && consumer_evidence.empty?
      ERRORS << "#{OWNERSHIP_PATH}: #{mod["id"]} observed consumer #{consumer_repository.inspect} requires evidence"
    end
    if consumer["status"] == "observed" && consumer["compatibility"] == "not-validated"
      ERRORS << "#{OWNERSHIP_PATH}: #{mod["id"]} observed consumer #{consumer_repository.inspect} requires an evaluated compatibility state"
    end
    if consumer["status"] == "planned" && !consumer_evidence.empty?
      ERRORS << "#{OWNERSHIP_PATH}: #{mod["id"]} planned consumer #{consumer_repository.inspect} must not claim distribution evidence"
    end
    consumer_repository_record = repositories.find { |candidate| candidate.is_a?(Hash) && candidate["id"] == consumer_repository }
    consumer_remote = consumer_repository_record && consumer_repository_record["remote"]
    consumer_evidence.each do |evidence_ref|
      next unless evidence_ref.is_a?(Hash)

      next unless consumer_repository_record

      public_consumer = consumer_repository_record["visibility"] == "public"
      artifact_url = evidence_ref["artifact_url"]
      attestation_path = evidence_ref["attestation_path"]
      if public_consumer
        evidence_contract_valid = evidence_ref["kind"] == "public-distribution-attestation" &&
          evidence_ref["revision"].is_a?(String) && evidence_ref["revision"].match?(/\A[0-9a-f]{40}\z/) &&
          evidence_ref["revision_digest"].nil? && attestation_path.is_a?(String) &&
          attestation_path.start_with?("data/evidence/") && existing_repository_artifact?(attestation_path) &&
          valid_github_remote?(consumer_remote) && valid_github_repository_url?(
            artifact_url,
            consumer_remote,
            "(?:commit/[0-9a-f]{40}|pull/[1-9][0-9]*|actions/runs/[1-9][0-9]*|releases/tag/[A-Za-z0-9][A-Za-z0-9._-]*)"
          )
        unless evidence_contract_valid
          ERRORS << "#{OWNERSHIP_PATH}: #{mod["id"]} public consumer #{consumer_repository.inspect} evidence must combine an exact repository-bound GitHub artifact, full revision, and schema-bound distribution attestation"
          next
        end
      else
        evidence_contract_valid = evidence_ref["kind"] == "public-safe-attestation" &&
          artifact_url.nil? && evidence_ref["revision"].nil? && sha256_digest?(evidence_ref["revision_digest"]) &&
          attestation_path.is_a?(String) && attestation_path.start_with?("data/evidence/") &&
          existing_repository_artifact?(attestation_path)
        unless evidence_contract_valid
          ERRORS << "#{OWNERSHIP_PATH}: #{mod["id"]} private consumer #{consumer_repository.inspect} evidence requires a public-safe revision digest and schema-bound attestation"
          next
        end
      end

      attestation_text = read_text(attestation_path)
      attestation = read_yaml(attestation_path)
      allowed_consumer_limitations = %w[
        point-in-time-observation
        canonical-merge-not-proven
        compatibility-limited-to-recorded-contract
      ]
      allowed_consumer_limitations << "private-identifiers-redacted" unless public_consumer
      expected_keys = %w[
        schema_version kind classification module_id consumer_repository
        consumer_path distribution_mode compatibility artifact_url revision
        revision_digest observed_at limitations
      ].sort
      expected_classification = public_consumer ? "public-evidence" : "public-safe-metadata-only"
      fields_match = attestation.is_a?(Hash) && attestation.keys.sort == expected_keys &&
        attestation["schema_version"] == 1 && attestation["kind"] == "consumer-distribution" &&
        attestation["classification"] == expected_classification &&
        attestation["module_id"] == mod["id"] &&
        attestation["consumer_repository"] == consumer_repository &&
        attestation["consumer_path"] == consumer_path &&
        attestation["distribution_mode"] == consumer["distribution_mode"] &&
        attestation["compatibility"] == consumer["compatibility"] &&
        attestation["artifact_url"] == artifact_url &&
        attestation["revision"] == evidence_ref["revision"] &&
        attestation["revision_digest"] == evidence_ref["revision_digest"] &&
        attestation["observed_at"].is_a?(String) &&
        attestation["observed_at"].match?(/\A[0-9]{4}-[0-9]{2}-[0-9]{2}\z/) &&
        attestation["limitations"].is_a?(Array) &&
        attestation["limitations"].uniq == attestation["limitations"] &&
        (attestation["limitations"] - allowed_consumer_limitations).empty?
      if !public_consumer && attestation_text.match?(%r{https?://|/pull/|/actions/runs/|\b[0-9a-f]{40}\b})
        ERRORS << "#{attestation_path}: private consumer attestation must not publish operational URLs or raw revisions"
      end
      unless fields_match
        ERRORS << "#{attestation_path}: consumer attestation does not match #{mod["id"]} -> #{consumer_repository}"
      end
    end
  end
  duplicates(consumer_repositories).each do |consumer_repository|
    ERRORS << "#{OWNERSHIP_PATH}: #{mod["id"]} has duplicate consumer repository #{consumer_repository.inspect}"
  end
  Array(mod["paths"]).each do |path|
    normalized_path = normalized_repository_path(path)
    if normalized_path.nil?
      ERRORS << "#{OWNERSHIP_PATH}: #{mod["id"]} path #{path.inspect} must remain a nonempty repository-relative path"
      next
    end
    if normalized_path != path
      ERRORS << "#{OWNERSHIP_PATH}: #{mod["id"]} path #{path.inspect} must be normalized as #{normalized_path.inspect}"
    end
    owned_paths << [owner, normalized_path, mod["id"]]
  end
end
owned_paths.group_by { |owner, path, _module_id| [owner, path.downcase] }.each do |(owner, _path_key), entries|
  next if entries.length == 1
  ERRORS << "#{OWNERSHIP_PATH}: case-folded path #{entries.map { |entry| entry[1] }.join(" / ")} has duplicate canonical owners in repository #{owner}: #{entries.map(&:last).join(", ")}"
end
owned_paths.combination(2).each do |left, right|
  left_owner, left_path, left_module = left
  right_owner, right_path, right_module = right
  next unless left_owner == right_owner
  left_key = left_path.downcase
  right_key = right_path.downcase
  next if left_key == right_key
  next unless left_key.start_with?("#{right_key}/") || right_key.start_with?("#{left_key}/")
  ERRORS << "#{OWNERSHIP_PATH}: owned paths #{left_path} (#{left_module}) and #{right_path} (#{right_module}) overlap in repository #{left_owner}"
end

goal_paths = Dir.glob(absolute(GOAL_GLOB)).sort
ERRORS << "no ecosystem Goal YAML records found" if goal_paths.empty?
goal_ids = []
goals = []
status_by_directory = {
  "active" => ["in-progress", "review"],
  "backlog" => ["backlog", "proposed", "planned"],
  "blocked" => ["blocked"],
  "completed" => ["completed"],
  "archived" => ["archived", "cancelled"]
}
allowed_status_transitions = {
  "backlog" => ["proposed", "cancelled"],
  "proposed" => ["planned", "cancelled"],
  "planned" => ["in-progress", "blocked", "cancelled"],
  "in-progress" => ["review", "blocked"],
  "review" => ["completed", "blocked"],
  "blocked" => ["planned", "in-progress", "review"],
  "completed" => ["archived"],
  "archived" => [],
  "cancelled" => []
}

goal_paths.each do |absolute_goal_path|
  relative_goal_path = absolute_goal_path.delete_prefix("#{ROOT}/")
  goal = read_yaml(relative_goal_path)
  unless goal.is_a?(Hash)
    ERRORS << "#{relative_goal_path}: expected YAML object/hash at root"
    next
  end
  validate_schema(goal, goal_schema, goal_schema, relative_goal_path) if goal_schema
  goal_id = goal["id"]
  goal_ids << goal_id if goal_id
  goals << [relative_goal_path, goal]
  directory = relative_goal_path.split("/")[1]
  status = goal["status"]
  unless status_by_directory.fetch(directory, []).include?(status)
    ERRORS << "#{relative_goal_path}: status #{status.inspect} is invalid for goals/#{directory}"
  end
  unless File.basename(relative_goal_path).start_with?("#{goal_id}--")
    ERRORS << "#{relative_goal_path}: filename must start with #{goal_id}--"
  end
  unless canonical_repository_ids.include?(goal["canonical_owner_repo"])
    ERRORS << "#{relative_goal_path}: canonical owner must be an observed canonical repository"
  end
  scope = goal["scope"]
  scope_repositories = scope.is_a?(Hash) ? scope["repositories"] : nil
  Array(scope_repositories).each do |repository_id|
    ERRORS << "#{relative_goal_path}: scope references unknown repository #{repository_id}" unless repository_ids.include?(repository_id)
  end

  blockers = Array(goal["blocked_by"])
  if status == "blocked" && blockers.empty?
    ERRORS << "#{relative_goal_path}: blocked Goal must identify at least one blocker"
  end

  evidence_records = Array(goal["evidence_records"])
  evidence_records.each do |record|
    next unless record.is_a?(Hash) && record["status"] == "passed"

    artifact = record["artifact"]
    command = record["command"]
    exit_code = record["exit_code"]
    command_present = command.is_a?(String) && !command.strip.empty?
    if command_present && exit_code != 0
      ERRORS << "#{relative_goal_path}: passed evidence #{record["id"]} command exit code must equal 0"
    elsif !command_present && !exit_code.nil?
      ERRORS << "#{relative_goal_path}: passed evidence #{record["id"]} exit code requires a command"
    end
    reproducible_command = command_present && exit_code == 0
    durable_artifact = valid_https_url?(artifact) || existing_repository_artifact?(artifact)
    unless reproducible_command || durable_artifact
      ERRORS << "#{relative_goal_path}: passed evidence #{record["id"]} must include an existing repository artifact, a valid HTTPS artifact, or a successful command with exit code 0"
    end
  end

  if status == "completed"
    ERRORS << "#{relative_goal_path}: completed Goal must not retain blockers" unless blockers.empty?

    gates = goal["quality_gates"]
    if gates.is_a?(Hash)
      gates.each do |gate, result|
        unless ["passed", "not-applicable"].include?(result)
          ERRORS << "#{relative_goal_path}: completed Goal gate #{gate} must be passed or not-applicable"
        end
      end
    end

    if evidence_records.empty?
      ERRORS << "#{relative_goal_path}: completed Goal must contain passed evidence records"
    elsif evidence_records.any? { |record| !record.is_a?(Hash) || record["status"] != "passed" }
      ERRORS << "#{relative_goal_path}: completed Goal evidence records must all have passed status"
    end

    github = goal["github"]
    if github.is_a?(Hash)
      {
        "issue_required" => "issue_url",
        "branch_required" => "branch_name",
        "commit_required" => "commit_sha",
        "pull_request_required" => "pull_request_url",
        "release_note_required" => "release_note_url"
      }.each do |required_field, evidence_field|
        next unless github[required_field] == true
        value = github[evidence_field]
        if required_field == "release_note_required" && !valid_https_url?(value)
          ERRORS << "#{relative_goal_path}: completed Goal requires a valid HTTPS GitHub field #{evidence_field}"
        elsif required_field != "release_note_required" && (!value.is_a?(String) || value.strip.empty?)
          ERRORS << "#{relative_goal_path}: completed Goal requires GitHub field #{evidence_field}"
        end
      end
    end
  end

  evidence_ids = Array(goal["evidence_records"])
    .map { |record| record["id"] if record.is_a?(Hash) }
    .compact
  duplicates(evidence_ids).each do |evidence_id|
    ERRORS << "#{relative_goal_path}: duplicate evidence id #{evidence_id}"
  end
  status_history = Array(goal["status_history"])
  initial_status = status_history.first["status"] if status_history.first.is_a?(Hash)
  if status_history.empty?
    ERRORS << "#{relative_goal_path}: status history must contain at least one entry"
  elsif !["backlog", "proposed", "planned"].include?(initial_status)
    ERRORS << "#{relative_goal_path}: status history must begin with backlog, proposed, or planned"
  elsif status_history.last.is_a?(Hash) && status_history.last["status"] != status
    ERRORS << "#{relative_goal_path}: latest status history entry must match current status #{status.inspect}"
  end
  status_history.each_cons(2) do |previous, current|
    next unless previous.is_a?(Hash) && current.is_a?(Hash)
    previous_status = previous["status"]
    current_status = current["status"]
    next if Array(allowed_status_transitions[previous_status]).include?(current_status)
    ERRORS << "#{relative_goal_path}: illegal Goal status transition #{previous_status} -> #{current_status}"
  end
  status_history.each do |entry|
    next unless entry.is_a?(Hash)
    Array(entry["evidence_refs"]).each do |evidence_ref|
      unless evidence_ids.include?(evidence_ref)
        ERRORS << "#{relative_goal_path}: status history references unknown evidence #{evidence_ref}"
      end
    end
  end
end
duplicates(goal_ids).each { |id| ERRORS << "duplicate Goal id #{id}" }

goal_ids_set = goal_ids.compact.uniq
goals.each do |relative_goal_path, goal|
  references = []
  references << ["parent_goal", goal["parent_goal"]] if goal["parent_goal"]
  Array(goal["dependencies"]).each { |reference| references << ["dependencies", reference] }
  Array(goal["related_goals"]).each { |reference| references << ["related_goals", reference] }
  Array(goal["blocked_by"]).each do |blocker|
    next unless blocker.is_a?(Hash) && blocker["type"] == "goal"
    references << ["blocked_by", blocker["reference"]]
  end
  references.each do |field, reference|
    unless goal_ids_set.include?(reference)
      ERRORS << "#{relative_goal_path}: #{field} references unknown Goal #{reference}"
    end
  end
end

ownership_doc = read_text(OWNERSHIP_DOC_PATH)
for required_text in [OWNERSHIP_PATH, "ECO-GOAL-0001", "npm run check:ecosystem-foundation", "Rollback"]
  ERRORS << "#{OWNERSHIP_DOC_PATH}: missing #{required_text.inspect}" unless ownership_doc.include?(required_text)
end

package_json = read_json("package.json")
expected_script = "ruby scripts/validate-ecosystem-foundation.rb"
package_scripts = package_json.is_a?(Hash) ? package_json["scripts"] : nil
unless package_scripts.is_a?(Hash) && package_scripts["check:ecosystem-foundation"] == expected_script
  ERRORS << "package.json: check:ecosystem-foundation must equal #{expected_script.inspect}"
end

referenced_attestation_paths = repositories.map do |repository|
  repository.dig("manifest_validation", "evidence", "attestation_path") if repository.is_a?(Hash)
end
modules.each do |mod|
  next unless mod.is_a?(Hash)

  Array(mod["consumers"]).each do |consumer|
    next unless consumer.is_a?(Hash)

    Array(consumer["evidence"]).each do |evidence_ref|
      referenced_attestation_paths << evidence_ref["attestation_path"] if evidence_ref.is_a?(Hash)
    end
  end
end
referenced_attestation_paths = referenced_attestation_paths.compact.uniq.select do |relative_path|
  existing_repository_artifact?(relative_path)
end

scoped_files = [
  MANIFEST_PATH,
  OWNERSHIP_PATH,
  OWNERSHIP_DOC_PATH,
  "docs/ECOSYSTEM_GOAL_TRACKING.md",
  "docs/adr/0002-ecosystem-governance-bootstrap-ownership.md",
  ".github/workflows/foundation-check.yml",
  "schemas/project-ecosystem.schema.json",
  "schemas/repository-ownership.schema.json",
  "schemas/ecosystem-goal.schema.json",
  *referenced_attestation_paths,
  *goal_paths.map { |path| path.delete_prefix("#{ROOT}/") }
].uniq
secret_patterns = {
  "private key" => /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/,
  "OpenAI-style secret" => /\bsk-[A-Za-z0-9_-]{20,}/,
  "inline credential assignment" => /\b(?:password|token|secret)\s*=\s*["'][^"']+["']/i
}
scoped_files.each do |relative_path|
  text = read_text(relative_path)
  secret_patterns.each do |label, pattern|
    ERRORS << "#{relative_path}: contains possible #{label}" if pattern.match?(text)
  end
end

if ERRORS.any?
  warn "Ecosystem foundation check failed:"
  ERRORS.uniq.each { |error| warn "- #{error}" }
  exit 1
end

goal_label = goal_paths.length == 1 ? "Goal record" : "Goal records"
puts "Ecosystem foundation check passed: 1 manifest, #{repositories.length} repositories, #{modules.length} owned modules, #{goal_paths.length} #{goal_label}."
