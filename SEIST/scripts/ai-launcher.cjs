#!/usr/bin/env node

const { spawn, spawnSync } = require("node:child_process");
const { chooseAutoTool } = require("./ai-routing-policy.cjs");

const ROUTES = {
  codex: { command: "codex", aliases: [ "code" ] },
  claude: { command: "claude", aliases: [ "anthropic" ] },
  gemini: { command: "gemini", aliases: [ "google" ] },
  ollama: { command: "ollama", aliases: [ "local" ] },
  kimi: { command: "kimi", aliases: [ "moonshot" ] },
  aider: { command: "aider", aliases: [ "pair" ] },
  interpreter: { command: "interpreter", aliases: [ "oi", "open-interpreter" ] }
};

function hasCommand( command ) {
  const result = spawnSync( "bash", [ "-lc", `command -v ${command}` ], {
    stdio: "ignore"
  } );
  return result.status === 0;
}

function printUsage() {
  console.log( "AI launcher for this workspace" );
  console.log( "" );
  console.log( "Usage:" );
  console.log( "  npm run ai -- <tool> [args...]" );
  console.log( "  npm run ai -- auto <intent text>" );
  console.log( "  npm run ai -- auto <intent text> :: <tool args...>" );
  console.log( "  npm run ai -- list" );
  console.log( "" );
  console.log( "Tools:" );
  Object.entries( ROUTES ).forEach( ( [ name, route ] ) => {
    const status = hasCommand( route.command ) ? "installed" : "missing";
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

function launch( command, args ) {
  const child = spawn( command, args, { stdio: "inherit" } );

  child.on( "exit", code => {
    process.exit( code ?? 0 );
  } );

  child.on( "error", error => {
    console.error( `failed to launch '${command}': ${error.message}` );
    process.exit( 1 );
  } );
}

const [ target, ...rest ] = process.argv.slice( 2 );
let forwardArgs = rest;

if ( !target || target === "list" || target === "--help" || target === "-h" ) {
  printUsage();
  process.exit( 0 );
}

let resolvedTarget = target;
if ( target === "auto" ) {
  const separatorIndex = rest.indexOf( "::" );
  const intentParts = separatorIndex >= 0 ? rest.slice( 0, separatorIndex ) : rest;
  forwardArgs = separatorIndex >= 0 ? rest.slice( separatorIndex + 1 ) : [];
  const intentText = intentParts.join( " " );
  resolvedTarget = chooseAutoTool( intentText );
  console.log( `auto selected: ${resolvedTarget}` );
}

const route = resolveRoute( resolvedTarget );

if ( !route ) {
  console.error( `unknown tool '${target}'` );
  printUsage();
  process.exit( 1 );
}

if ( !hasCommand( route.command ) ) {
  console.error( `'${route.command}' is not installed or not in PATH.` );
  console.error( "Run list mode to see availability: npm run ai -- list" );
  process.exit( 1 );
}

launch( route.command, forwardArgs );
