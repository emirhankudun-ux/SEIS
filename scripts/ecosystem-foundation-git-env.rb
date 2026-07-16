# frozen_string_literal: true

module EcosystemFoundationGitEnvironment
  # Keep every Git subprocess used by ecosystem-foundation validation isolated
  # from caller-controlled configuration, worktree, index, and object overrides.
  SAFE = {
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
end
