module SEIS
  module WindowsPlatform
    LANGUAGES = ["Ruby", "PowerShell", "Go", "SQL"].freeze
    QUALITY_GATES = [
      "ruby_syntax_when_available",
      "windows_path_safety",
      "permission_scope",
      "offline_fallback",
      "event_log_awareness"
    ].freeze

    def self.ready_for_seis_agent?
      LANGUAGES.length >= 4 && QUALITY_GATES.length >= 5
    end
  end
end
