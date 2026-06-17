const ROUTE_HINTS = [
  {
    tool: "ollama",
    hints: [ "local", "offline", "private", "on-device", "llama", "ollama" ]
  },
  {
    tool: "gemini",
    hints: [ "browser", "search", "research", "compare docs", "web", "source lookup" ]
  },
  {
    tool: "interpreter",
    hints: [ "csv", "spreadsheet", "dataset", "json transform", "log analysis", "trace" ]
  },
  {
    tool: "aider",
    hints: [ "quick patch", "repo patch", "small patch", "refactor", "rename", "edit existing file", "diff" ]
  },
  {
    tool: "claude",
    hints: [ "brainstorm", "naming", "ux copy", "editorial", "narrative", "strategy memo" ]
  },
  {
    tool: "kimi",
    hints: [ "translation", "translate", "localize", "multilingual", "polyglot" ]
  }
];

function chooseAutoTool( userIntent ) {
  const text = String( userIntent || "" ).trim().toLowerCase();
  if ( !text ) return "codex";

  for ( const route of ROUTE_HINTS ) {
    if ( route.hints.some( hint => text.includes( hint ) ) ) {
      return route.tool;
    }
  }

  // Default to the safest generalist for repo, governance, accessibility, release, and architecture work.
  return "codex";
}

module.exports = { chooseAutoTool };
