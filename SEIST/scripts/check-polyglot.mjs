import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "polyglot/manifest.json",
  "polyglot/contracts/seis-experience-contract.json",
  "polyglot/javascript/plugin-source-runtime.js",
  "polyglot/node/requested_stack_readiness.mjs",
  "polyglot/mysql/plugin_source_registry.mysql.sql",
  "polyglot/react/PluginSourceDashboard.tsx",
  "polyglot/python/seis_manifest.py",
  "polyglot/go/health_contract.go",
  "polyglot/rust/performance_budget.rs",
  "polyglot/swift/SEISMotionPolicy.swift",
  "polyglot/kotlin/SeisMotionPolicy.kt",
  "polyglot/typescript/release-contract.ts",
  "polyglot/typescript/fullstack-plugin-contract.ts",
  "polyglot/ruby/verify_release.rb",
  "polyglot/dart/seis_motion_policy.dart",
  "polyglot/bash/deploy_guard.sh",
  "polyglot/java/SeisDeployReadiness.java",
  "polyglot/csharp/SeisReleaseContract.cs",
  "polyglot/sql/release_readiness_schema.sql",
  "polyglot/lua/calm_motion_policy.lua",
  "polyglot/yaml/deploy-governance.yml",
  "polyglot/c/readiness_contract.h",
  "polyglot/cpp/readiness_contract.hpp",
  "polyglot/elixir/calm_release_policy.ex",
  "polyglot/erlang/calm_release_policy.erl",
  "polyglot/haskell/CalmReleasePolicy.hs",
  "polyglot/scala/SeisReleasePolicy.scala",
  "polyglot/r/readiness_metrics.R",
  "polyglot/julia/readiness_metrics.jl",
  "polyglot/perl/readiness_guard.pl",
  "polyglot/zig/readiness_contract.zig",
  "polyglot/clojure/readiness_policy.clj",
  "polyglot/fsharp/SeisReleasePolicy.fs",
  "polyglot/powershell/SeisReleasePolicy.ps1",
  "polyglot/toml/deploy-governance.toml",
  "polyglot/xml/release-policy.xml",
  "polyglot/ocaml/release_policy.ml",
  "polyglot/reason/ReleasePolicy.re",
  "polyglot/nim/readiness_policy.nim",
  "polyglot/crystal/readiness_policy.cr",
  "polyglot/groovy/SeisReleasePolicy.groovy",
  "polyglot/objective-c/SEISReleasePolicy.h",
  "polyglot/vb/SeisReleasePolicy.vb",
  "polyglot/matlab/readiness_policy.m",
  "polyglot/fortran/readiness_policy.f90",
  "polyglot/cobol/readiness-policy.cob",
  "polyglot/racket/readiness-policy.rkt",
  "polyglot/scheme/readiness-policy.scm",
  "polyglot/prolog/readiness_policy.pl",
  "polyglot/d/readiness_policy.d",
  "polyglot/v/readiness_policy.v",
  "polyglot/graphql/release-policy.graphql",
  "polyglot/openapi/release-health.openapi.yaml",
  "polyglot/json-schema/release-policy.schema.json",
  "polyglot/wat/readiness_policy.wat",
  "polyglot/hcl/release-governance.hcl",
  "polyglot/protobuf/release_policy.proto",
  "polyglot/avro/release-policy.avsc",
  "polyglot/asyncapi/release-events.asyncapi.yaml",
  "polyglot/jsonld/release-policy.jsonld",
  "polyglot/ini/release-policy.ini",
  "polyglot/solidity/SeisReleasePolicy.sol",
  "polyglot/move/release_policy.move",
  "polyglot/cairo/release_policy.cairo",
  "polyglot/hack/SeisReleasePolicy.hack",
  "polyglot/elm/ReleasePolicy.elm",
  "polyglot/purescript/ReleasePolicy.purs",
  "polyglot/rescript/ReleasePolicy.res",
  "polyglot/qsharp/ReleasePolicy.qs",
  "polyglot/apex/SeisReleasePolicy.cls",
  "polyglot/abap/readiness_policy.abap",
  "polyglot/plsql/readiness_policy.sql",
  "polyglot/tsql/readiness_policy.sql",
  "polyglot/bicep/release-governance.bicep",
  "polyglot/nix/release-policy.nix",
  "polyglot/cue/release_policy.cue",
  "polyglot/turtle/release-policy.ttl",
  "polyglot/sparql/release-policy-check.rq",
  "polyglot/mermaid/release-flow.mmd",
  "polyglot/plantuml/release-flow.puml",
  "polyglot/csv/release-policy.csv",
  "polyglot/ada/seis_release_policy.ads",
  "polyglot/pascal/release_policy.pas",
  "polyglot/tcl/release_policy.tcl",
  "polyglot/awk/release_policy.awk",
  "polyglot/forth/release_policy.fs",
  "polyglot/common-lisp/release-policy.lisp",
  "polyglot/emacs-lisp/release-policy.el",
  "polyglot/smalltalk/ReleasePolicy.st",
  "polyglot/gdscript/release_policy.gd",
  "polyglot/glsl/release_policy.glsl",
  "polyglot/wgsl/release_policy.wgsl",
  "polyglot/rego/release_policy.rego",
  "polyglot/cel/release_policy.cel",
  "polyglot/jsonnet/release-policy.jsonnet",
  "polyglot/dhall/release-policy.dhall",
  "polyglot/starlark/release_policy.star",
  "polyglot/kdl/release-policy.kdl",
  "polyglot/hocon/release-policy.conf",
  "polyglot/properties/release-policy.properties",
  "polyglot/dotenv/release-policy.env",
  "polyglot/make/release-policy.mk",
  "polyglot/cmake/release-policy.cmake",
  "polyglot/meson/release-policy.meson",
  "polyglot/just/release-policy.just",
  "polyglot/taskfile/release-policy.taskfile.yml",
  "server/php/health.php",
  "server/node/static-server.mjs",
  "server/express/plugin-source-routes.mjs",
  "server/edge/cloudflare-worker.js",
  "server/docker/Dockerfile",
  "deploy/server-targets.json",
  "docs/polyglot/software-language-branch.md"
];

const failures = [];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    failures.push(`missing polyglot file: ${file}`);
  }
}

if (existsSync("polyglot/manifest.json")) {
  const manifest = JSON.parse(readFileSync("polyglot/manifest.json", "utf8"));
  const languages = manifest.languages || [];
  if (languages.length < 105) {
    failures.push("polyglot manifest must include at least 105 language/config surfaces");
  }
  for (const language of languages) {
    for (const entrypoint of language.entrypoints || []) {
      if (!existsSync(entrypoint)) {
        failures.push(`polyglot manifest references missing entrypoint: ${entrypoint}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error("SEIS polyglot check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS polyglot check passed.");
