#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");

const launcherPath = path.join( __dirname, "ai-launcher.cjs" );

const failures = [];

function makeTempBinDir() {
  const dir = fs.mkdtempSync( path.join( os.tmpdir(), "seis-ai-check-" ) );
  return dir;
}

function makeFakeCommand( dir, name, body ) {
  const filePath = path.join( dir, name );
  fs.writeFileSync( filePath, `#!/usr/bin/env sh\n${body}\n` );
  fs.chmodSync( filePath, 0o755 );
  return filePath;
}

function runWithEnv( commandLineArgs, extraEnv, pathExtensions = [] ) {
  const deterministicPath = [ ...pathExtensions, "/usr/bin", "/bin" ].join( path.delimiter );
  const env = {
    ...process.env,
    ...extraEnv,
    PATH: deterministicPath
  };

  const result = spawnSync( process.execPath, [ launcherPath, ...commandLineArgs ], {
    encoding: "utf8",
    cwd: path.resolve( __dirname, ".." ),
    env
  } );

  if ( result.error ) {
    throw result.error;
  }

  const combined = `${result.stdout || ""}${result.stderr || ""}`;
  const selectedLine = combined.split( "\n" ).find( line => line.startsWith( "auto selected:" ) );
  const selectedRoute = selectedLine ? selectedLine.replace( "auto selected:", "" ).trim() : undefined;
  const laneLine = combined.split( "\n" ).find( line => line.startsWith( "seis lane:" ) );
  const seisLane = laneLine ? laneLine.replace( "seis lane:", "" ).trim() : undefined;

  return { selectedRoute, seisLane };
}

function assertRoute( label, actual, expected ) {
  if ( actual === expected ) {
    return;
  }
  failures.push( `${label} expected ${expected}, got ${actual || "<not-selected>"}` );
}

function assertLane( label, actual, expected ) {
  if ( actual === expected ) {
    return;
  }
  failures.push( `${label} expected ${expected}, got ${actual || "<not-selected>"}` );
}

const defaultIntent = "browser research for docs mcp";
const tmpBase = makeTempBinDir();

// Scenario 1:
// Offline forced, selected helper unavailable, no Ollama command.
const scenario1 = runWithEnv(
  [ "auto", defaultIntent ],
  { AI_FORCE_OFFLINE: "1" },
  [ tmpBase ]
);
assertRoute( "offline force fallback -> no ollama", scenario1.selectedRoute, "seis-agent" );
assertLane( "offline force fallback -> SEIS research lane", scenario1.seisLane, "seis-research" );

// Scenario 2:
// Offline forced, selected helper unavailable, fake ollama list works and fallback should switch to ollama.
const tmpWithOllama = makeTempBinDir();
makeFakeCommand( tmpWithOllama, "gemini", "exit 1" );
makeFakeCommand( tmpWithOllama, "ollama", "if [ \"$1\" = \"list\" ]; then exit 0; fi\nexit 0" );
const scenario2 = runWithEnv(
  [ "auto", defaultIntent ],
  {
    AI_FORCE_OFFLINE: "1",
    OPENAI_API_KEY: "",
    ANTHROPIC_API_KEY: "",
    GEMINI_API_KEY: ""
  },
  [ tmpWithOllama ]
);
assertRoute( "offline force fallback -> ollama", scenario2.selectedRoute, "ollama" );
assertLane( "offline force fallback with ollama -> SEIS research lane", scenario2.seisLane, "seis-research" );

// Scenario 3:
// Online forced should keep remote helper behavior even if offline hints are set; gemini route should be selected from policy mapping.
const scenario3 = runWithEnv(
  [ "auto", defaultIntent ],
  {
    AI_FORCE_OFFLINE: "1",
    AI_FORCE_ONLINE: "1",
    GEMINI_API_KEY: "present-for-check"
  },
  [ tmpWithOllama ]
);
assertRoute( "online override should not force offline fallback", scenario3.selectedRoute, "gemini" );
assertLane( "online override -> SEIS research lane", scenario3.seisLane, "seis-research" );

// Scenario 4:
// Online forced with no key should fallback when remote helper not ready.
const scenario4 = runWithEnv(
  [ "auto", defaultIntent ],
  {
    AI_FORCE_OFFLINE: "1",
    AI_FORCE_ONLINE: "1",
    OPENAI_API_KEY: "",
    ANTHROPIC_API_KEY: "",
    GEMINI_API_KEY: ""
  },
  [ tmpWithOllama ]
);
assertRoute( "online override + offline key missing", scenario4.selectedRoute, "seis-agent" );
assertLane( "online override + offline key missing -> SEIS research lane", scenario4.seisLane, "seis-research" );

// Scenario 5:
// Role command should force role-aware helper selection.
const tmpWithRoleHelpers = makeTempBinDir();
makeFakeCommand( tmpWithRoleHelpers, "claude", "exit 0" );
makeFakeCommand( tmpWithRoleHelpers, "aider", "exit 0" );
makeFakeCommand( tmpWithRoleHelpers, "openai", "exit 0" );
makeFakeCommand( tmpWithRoleHelpers, "ollama", "if [ \"$1\" = \"list\" ]; then exit 0; fi\nexit 0" );
const scenario5 = runWithEnv(
  [ "designer", "hero alanı için mikrocopy düzenle" ],
  { OPENAI_API_KEY: "present-for-check", ANTHROPIC_API_KEY: "present-for-check", GEMINI_API_KEY: "present-for-check" },
  [ tmpWithRoleHelpers ]
);
assertRoute( "role command designer -> claude", scenario5.selectedRoute, "claude" );

const scenario6 = runWithEnv(
  [ "engineer", "build pipeline için patch hazırla" ],
  { OPENAI_API_KEY: "present-for-check", ANTHROPIC_API_KEY: "present-for-check" },
  [ tmpWithRoleHelpers ]
);
assertRoute( "role command engineer -> aider", scenario6.selectedRoute, "aider" );

const scenario7 = runWithEnv(
  [ "software", "mimari plan ve roadmap çıkar" ],
  { OPENAI_API_KEY: "present-for-check", ANTHROPIC_API_KEY: "present-for-check" },
  [ tmpWithRoleHelpers ]
);
assertRoute( "role command software -> openai", scenario7.selectedRoute, "openai" );

if ( failures.length > 0 ) {
  console.error( "AI launcher offline fallback checks failed:" );
  for ( const failure of failures ) {
    console.error( `- ${failure}` );
  }
  process.exit( 1 );
}

console.log( "AI launcher fallback checks passed." );
