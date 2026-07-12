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
  "observed-local-and-remote" => ["local-git-and-authenticated-github-connector"],
  "observed-remote" => ["authenticated-github-connector"],
  "repository-metadata-invalid" => ["local-git", "not-observed"],
  "proposed" => ["not-observed"]
}.freeze

repositories.each do |repository|
  next unless repository.is_a?(Hash)

  repository_id = repository["id"]
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
    if repository["observed_at"].nil? || verification_method == "not-observed"
      ERRORS << "#{OWNERSHIP_PATH}: observed repository #{repository_id} must record observation date and method"
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
  if repository["manifest_status"] == "present-validated"
    manifest_path = repository["manifest_path"]
    manifest_is_local = repository["local_worktree"] == "valid" && existing_repository_artifact?(manifest_path)
    unless manifest_is_local
      ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} present-validated manifest #{manifest_path.inspect} must be an existing file in a valid local worktree"
    end
    if manifest_is_local
      claimed_manifest = read_yaml(manifest_path)
      validate_schema(claimed_manifest, manifest_schema, manifest_schema, manifest_path) if manifest_schema
      if claimed_manifest.is_a?(Hash)
        claimed_project = claimed_manifest["project"]
        claimed_ecosystem = claimed_manifest["ecosystem"]
        claimed_security = claimed_manifest["security"]
        claimed_project_id = claimed_project["id"] if claimed_project.is_a?(Hash)
        claimed_owner_id = claimed_ecosystem["canonical_owner_repo"] if claimed_ecosystem.is_a?(Hash)
        claimed_visibility = claimed_project["visibility"] if claimed_project.is_a?(Hash)
        claimed_public_repo = claimed_security["public_repo"] if claimed_security.is_a?(Hash)
        expected_visibilities = repository["visibility"] == "public" ? ["public-safe"] : ["private", "mixed"]
        expected_public_repo = repository["visibility"] == "public"

        unless claimed_project_id == repository_id && claimed_owner_id == repository_id
          ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} manifest identity must match its canonical repository id"
        end
        unless expected_visibilities.include?(claimed_visibility) && claimed_public_repo == expected_public_repo
          ERRORS << "#{OWNERSHIP_PATH}: repository #{repository_id} manifest visibility must match repository visibility #{repository["visibility"].inspect}"
        end
      end
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
  Array(mod["consumers"]).each do |consumer|
    ERRORS << "#{OWNERSHIP_PATH}: #{mod["id"]} has unknown consumer #{consumer}" unless repository_ids.include?(consumer)
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
owned_paths.group_by { |owner, path, _module_id| [owner, path] }.each do |(owner, path), entries|
  next if entries.length == 1
  ERRORS << "#{OWNERSHIP_PATH}: path #{path} has duplicate canonical owners in repository #{owner}: #{entries.map(&:last).join(", ")}"
end
owned_paths.combination(2).each do |left, right|
  left_owner, left_path, left_module = left
  right_owner, right_path, right_module = right
  next unless left_owner == right_owner
  next if left_path == right_path
  next unless left_path.start_with?("#{right_path}/") || right_path.start_with?("#{left_path}/")
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
  *goal_paths.map { |path| path.delete_prefix("#{ROOT}/") }
]
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
