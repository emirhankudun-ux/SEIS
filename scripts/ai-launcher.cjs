#!/usr/bin/env node

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");
const { chooseAutoRoute } = require("./ai-routing-policy.cjs");

const ROUTES = {
  "seis-agent": { command: "npm", argsPrefix: [ "run", "seis:agent", "--" ], aliases: [ "seis", "agent", "policy" ] },
  codex: { command: "codex", aliases: [ "code" ] },
  antigravity: { command: "open", appPath: appBundlePath( "Antigravity.app" ), aliases: [ "antigravity-2", "antigravity2" ], healthCheck: () => checkAppBundle( "Antigravity.app" ) },
  "antigravity-ide": { command: "open", appPath: appBundlePath( "Antigravity IDE.app" ), aliases: [ "ag-ide" ], healthCheck: () => checkAppBundle( "Antigravity IDE.app" ) },
  cursor: { command: "open", appPath: appBundlePath( "Cursor.app" ), aliases: [ "cursor-editor" ], healthCheck: () => checkAppBundle( "Cursor.app" ) },
  xcode: { command: "open", appPath: appBundlePath( "Xcode.app" ), aliases: [ "apple-ide" ], healthCheck: () => checkAppBundle( "Xcode.app" ) },
  openai: { command: "openai", aliases: [ "gpt" ], credential: "OPENAI_API_KEY", online: true },
  claude: { command: "claude", aliases: [ "anthropic" ], credential: "ANTHROPIC_API_KEY", online: true },
  gemini: { command: "gemini", aliases: [ "google" ], credential: "GEMINI_API_KEY", online: true },
  qwen: { command: "qwen", aliases: [ "qwen-cli" ] },
  kimi: { command: "kimi", aliases: [ "moonshot" ], online: true },
  ollama: { command: "ollama", aliases: [ "local" ], healthCheck: checkOllamaHealth },
  opencode: { command: "opencode", aliases: [ "terminal" ] },
  aider: { command: "aider", aliases: [ "pair" ] },
  interpreter: { command: "interpreter", aliases: [ "oi", "open-interpreter" ] },
  hermes: { command: "hermes", aliases: [ "hermes-agent" ] },
  goose: { command: "goose", aliases: [ "automation-agent" ] },
  "open-design": { command: "open", appPath: openDesignAppPath(), aliases: [ "opendesign" ], healthCheck: checkOpenDesignApp }
};

const ROLE_TARGETS = new Set([ "designer", "engineer", "software" ]);

function hasCommand( command ) {
  const result = spawnSync( "bash", [ "-c", `command -v ${command}` ], {
    stdio: "ignore"
  } );
  return result.status === 0;
}

function checkOllamaHealth() {
  if ( !hasCommand( "ollama" ) ) return false;
  const result = spawnSync( "bash", [ "-c", "ollama list" ], {
    stdio: "ignore"
  } );
  return result.status === 0;
}

function appBundlePath( bundleName ) {
  const homeCandidate = path.join( os.homedir(), "Applications", bundleName );
  if ( fs.existsSync( homeCandidate ) ) return homeCandidate;
  return path.join( "/Applications", bundleName );
}

function checkAppBundle( bundleName ) {
  return fs.existsSync( appBundlePath( bundleName ) );
}

function openDesignAppPath() {
  return appBundlePath( "Open Design.app" );
}

function checkOpenDesignApp() {
  return fs.existsSync( openDesignAppPath() );
}

function routeIssue( route ) {
  if ( !hasCommand( route.command ) ) return "missing-command";
  if ( route.credential && !process.env[ route.credential ] ) return `missing-${route.credential}`;
  if ( route.healthCheck && !route.healthCheck() ) return "runtime-not-ready";
  return null;
}

function shouldForceOffline() {
  return process.env.AI_FORCE_OFFLINE === "1" && process.env.AI_FORCE_ONLINE !== "1";
}

function resolveAutoFallback( selectedName ) {
  const route = resolveRoute( selectedName );
  if ( !route ) return "seis-agent";

  const issue = routeIssue( route );
  if ( !issue && !( shouldForceOffline() && route.online ) ) return selectedName;

  const ollamaRoute = resolveRoute( "ollama" );
  if ( shouldForceOffline() && ollamaRoute && !routeIssue( ollamaRoute ) ) {
    return "ollama";
  }

  return "seis-agent";
}

function printUsage() {
  console.log( "AI launcher for this workspace" );
  console.log( "" );
  console.log( "Usage:" );
  console.log( "  npm run ai -- <tool> [args...]" );
  console.log( "  npm run ai -- auto <intent text>" );
  console.log( "  npm run ai -- auto <intent text> :: <tool args...>" );
  console.log( "  npm run ai -- designer|engineer|software <intent text>" );
  console.log( "  npm run ai -- list" );
  console.log( "" );
  console.log( "Tools:" );
  Object.entries( ROUTES ).forEach( ( [ name, route ] ) => {
    const status = routeIssue( route ) || "installed";
    const aliases = route.aliases.length ? ` (aliases: ${route.aliases.join( ", " )})` : "";
    console.log( `  - ${name}: ${route.command} [${status}]${aliases}` );
  } );
}

function resolveRoute( input ) {
  const normalized = ( input || "" ).trim().toLowerCase();
  if ( !normalized ) return undefined;

  for ( const [ name, route ] of Object.entries( ROUTES ) ) {
    if ( normalized === name || route.aliases.includes( normalized ) ) {
      return route;
    }
  }

  return undefined;
}

function launch( route, args ) {
  const commandArgs = route.appPath
    ? [ route.appPath, ...args ]
    : [ ...( route.argsPrefix || [] ), ...args ];
  const child = spawn( route.command, commandArgs, { stdio: "inherit" } );

  child.on( "exit", code => {
    process.exit( code ?? 0 );
  } );

  child.on( "error", error => {
    console.error( `failed to launch '${route.command}': ${error.message}` );
    process.exit( 1 );
  } );
}

const [ target, ...rest ] = process.argv.slice( 2 );
let forwardArgs = rest;
let isPolicySelected = false;

if ( !target || target === "list" || target === "--help" || target === "-h" ) {
  printUsage();
  process.exit( 0 );
}

let resolvedTarget = target;
let autoRoute = null;
if ( target === "auto" ) {
  const separatorIndex = rest.indexOf( "::" );
  const intentParts = separatorIndex >= 0 ? rest.slice( 0, separatorIndex ) : rest;
  forwardArgs = separatorIndex >= 0 ? rest.slice( separatorIndex + 1 ) : [];
  const intentText = intentParts.join( " " );
  autoRoute = chooseAutoRoute( intentText );
  resolvedTarget = autoRoute.tool;
  isPolicySelected = true;
} else if ( ROLE_TARGETS.has( target ) ) {
  const intentText = `${target}: ${rest.join( " " )}`;
  forwardArgs = rest;
  autoRoute = chooseAutoRoute( intentText, { preferredRole: target } );
  resolvedTarget = autoRoute.tool;
  isPolicySelected = true;
}

if ( isPolicySelected ) {
  resolvedTarget = resolveAutoFallback( resolvedTarget );
  console.log( `auto selected: ${resolvedTarget}` );
  if ( autoRoute?.laneId ) {
    console.log( `seis lane: ${autoRoute.laneId}` );
  }
  if ( resolvedTarget === "seis-agent" && autoRoute?.intent && forwardArgs.length === 0 ) {
    forwardArgs = [ formatSeisAgentIntent( autoRoute ) ];
  }
}

const route = resolveRoute( resolvedTarget );

if ( !route ) {
  console.error( `unknown tool '${target}'` );
  printUsage();
  process.exit( 1 );
}

const issue = routeIssue( route );
if ( issue ) {
  console.error( `'${route.command}' is not ready (${issue}).` );
  console.error( "Run list mode to see availability: npm run ai -- list" );
  process.exit( 1 );
}

launch( route, forwardArgs );

function formatSeisAgentIntent( route ) {
  const details = [
    `SEIS lane: ${route.laneId}`,
    route.defaultGate ? `default gate: ${route.defaultGate}` : null,
    route.integrationTool ? `integration tool: ${route.integrationTool}` : null
  ].filter( Boolean ).join( "; " );

  return `[${details}] ${route.intent}`;
}
