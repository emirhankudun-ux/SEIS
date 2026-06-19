# SEIS Technology Stack

- Generated: 2026-06-12
- Mode: source_languages_plus_ecosystem_stack
- Source languages: 60
- Ecosystem groups: 7
- Ecosystem technologies: 143

## Principle

Only real source languages belong in the GitHub language surface; frameworks, clouds, products, and tools belong in the ecosystem stack.

## GitHub Source Languages

| # | language | layer | GitHub bytes | entrypoints |
| ---: | --- | --- | ---: | --- |
| 1 | JavaScript | frontend-and-experience | 1716677 | apps/web/src/scripts/motion-system.js, apps/web/src/scripts/gallery-system.js, apps/web/src/scripts/i18n-system.js, polyglot/javascript/plugin-source-runtime.js |
| 2 | TypeScript | frontend-and-experience | 411787 | polyglot/typescript/seis_config_validator.ts, polyglot/typescript/language-split-contract.ts, packages/seis-ai/types/seis-ai.d.ts |
| 3 | Objective-C | mobile-and-native | 8447 | polyglot/objective-c/SEISReleasePolicy.h, polyglot/objective-c/SEISLanguageDistributionContract.h, polyglot/objective-c/SEISLanguageDistributionContract.m |
| 4 | Python | backend-and-api | 507345 | polyglot/python/seis_manifest.py, polyglot/python/seis_image_audit.py, polyglot/python/seis_icon_gen.py, polyglot/python/seis_color_contrast.py, polyglot/python/seis_sw_cache_audit.py, server/python/verify_release.py |
| 5 | Swift | mobile-and-native | 574078 | polyglot/swift/SEISMotionPolicy.swift |
| 6 | Go | backend-and-api | 16806 | polyglot/go/health_contract.go, polyglot/go/cmd/seis-serve/main.go, polyglot/go/cmd/seis-jsonld/main.go |
| 7 | Rust | mobile-and-native | 12286 | polyglot/rust/performance_budget.rs, polyglot/rust/seis-link-audit/src/main.rs |
| 8 | Java | backend-and-api | 16392 | polyglot/java/SeisDeployReadiness.java, polyglot/java/DrawingsChecksum.java, polyglot/java/CssMediaQueryAudit.java |
| 9 | Kotlin | mobile-and-native | 1406 | polyglot/kotlin/SeisMotionPolicy.kt, polyglot/kotlin/seis_css_font_audit.kts |
| 10 | Dart | mobile-and-native | 532 | polyglot/dart/seis_motion_policy.dart |
| 11 | PHP | backend-and-api | 8768 | polyglot/php/contact-endpoint.php, server/php/health.php, server/php/router.php |
| 12 | Ruby | backend-and-api | 13677 | polyglot/ruby/verify_release.rb, polyglot/ruby/i18n_stats.rb, polyglot/ruby/html_heading_audit.rb, polyglot/ruby/favicon_audit.rb |
| 13 | C | mobile-and-native | 5440 | polyglot/c/readiness_contract.h, polyglot/c/seis_utf8_check.c |
| 14 | C++ | mobile-and-native | 11206 | polyglot/cpp/readiness_contract.hpp, polyglot/cpp/seis_translations_lint.cpp |
| 15 | C# | backend-and-api | 2973 | polyglot/csharp/SeisReleaseContract.cs |
| 16 | SQL | database-and-data | 8752 | polyglot/sql/audit_ledger.sqlite.sql |
| 17 | Shell | cloud-devops-and-config | 97083 | polyglot/bash/deploy_guard.sh, scripts/polyglot-check.sh |
| 18 | PowerShell | cloud-devops-and-config | 2427 | polyglot/powershell/SeisReleasePolicy.ps1 |
| 19 | Lua | security-policy-and-governance | 6948 | polyglot/lua/seis_i18n_attr_audit.lua |
| 20 | R | database-and-data | 7953 | polyglot/r/seis_translation_stats.R |
| 21 | Julia | database-and-data | 595 | polyglot/julia/readiness_metrics.jl |
| 22 | Perl | security-policy-and-governance | 13916 | polyglot/perl/readiness_guard.pl, polyglot/perl/hygiene_lint.pl, polyglot/perl/robots_txt_audit.pl |
| 23 | Haskell | research-legacy-and-lab | 0 | polyglot/haskell/CalmReleasePolicy.hs, polyglot/haskell/seis_css_unit_audit.hs |
| 24 | Scala | backend-and-api | 660 | polyglot/scala/SeisReleasePolicy.scala |
| 25 | Elixir | backend-and-api | 582 | polyglot/elixir/calm_release_policy.ex, polyglot/elixir/seis_html_anchor_audit.exs |
| 26 | Erlang | backend-and-api | 560 | polyglot/erlang/calm_release_policy.erl |
| 27 | Clojure | backend-and-api | 569 | polyglot/clojure/readiness_policy.clj |
| 28 | F# | backend-and-api | 1592 | polyglot/fsharp/SeisReleasePolicy.fs |
| 29 | OCaml | research-legacy-and-lab | 7550 | polyglot/ocaml/release_policy.ml, polyglot/ocaml/seis_css_selector_stats.ml |
| 30 | Nim | mobile-and-native | 5452 | polyglot/nim/readiness_policy.nim, polyglot/nim/seis_html_img_audit.nim |
| 31 | Zig | mobile-and-native | 711 | polyglot/zig/readiness_contract.zig |
| 32 | Groovy | backend-and-api | 5362 | polyglot/groovy/SeisReleasePolicy.groovy, polyglot/groovy/seis_json_files_check.groovy |
| 33 | Crystal | mobile-and-native | 594 | polyglot/crystal/readiness_policy.cr |
| 34 | D | mobile-and-native | 455 | polyglot/d/readiness_policy.d |
| 35 | V | mobile-and-native | 572 | polyglot/v/readiness_policy.v |
| 36 | Fortran | research-legacy-and-lab | 528 | polyglot/fortran/readiness_policy.f90 |
| 37 | COBOL | research-legacy-and-lab | 723 | polyglot/cobol/readiness-policy.cob |
| 38 | Pascal | mobile-and-native | 858 | polyglot/pascal/release_policy.pas |
| 39 | Racket | research-legacy-and-lab | 7245 | polyglot/racket/readiness-policy.rkt, polyglot/racket/seis_pwa_manifest_audit.rkt |
| 40 | Scheme | research-legacy-and-lab | 15747 | polyglot/scheme/readiness-policy.scm |
| 41 | Prolog | research-legacy-and-lab | 0 | polyglot/prolog/readiness_policy.pl, polyglot/prolog/seis_html_tabindex_audit.pl |
| 42 | Tcl | research-legacy-and-lab | 7290 | polyglot/tcl/seis_meta_tags_check.tcl |
| 43 | AWK | research-legacy-and-lab | 1595 | polyglot/awk/css_var_histogram.awk |
| 44 | Common Lisp | research-legacy-and-lab | 5908 | polyglot/common-lisp/release-policy.lisp, polyglot/common-lisp/seis_html_id_uniqueness.lisp |
| 45 | Emacs Lisp | research-legacy-and-lab | 310 | polyglot/emacs-lisp/release-policy.el |
| 46 | Smalltalk | research-legacy-and-lab | 382 | polyglot/smalltalk/ReleasePolicy.st |
| 47 | Ada | mobile-and-native | 779 | polyglot/ada/seis_release_policy.ads |
| 48 | Visual Basic | research-legacy-and-lab | 992 | polyglot/vb/SeisReleasePolicy.vb |
| 49 | Batchfile | cloud-devops-and-config | 282 | polyglot/windows/scripting/seis_windows_platform.bat |
| 50 | MATLAB | database-and-data | 365 | polyglot/matlab/readiness_policy.m |
| 51 | HTML | frontend-and-experience | 139289 | apps/web/index.html, apps/web/seis-cockpit.html |
| 52 | CSS | frontend-and-experience | 287432 | apps/web/style.css, apps/web/styles.css |
| 53 | Solidity | security-policy-and-governance | 869 | polyglot/solidity/SeisReleasePolicy.sol |
| 54 | Move | security-policy-and-governance | 843 | polyglot/move/release_policy.move |
| 55 | Cairo | security-policy-and-governance | 649 | polyglot/cairo/release_policy.cairo |
| 56 | Hack | security-policy-and-governance | 772 | polyglot/hack/SeisReleasePolicy.hack |
| 57 | Apex | security-policy-and-governance | 0 | polyglot/apex/SeisReleasePolicy.cls |
| 58 | ABAP | security-policy-and-governance | 778 | polyglot/abap/readiness_policy.abap |
| 59 | Q# | security-policy-and-governance | 594 | polyglot/qsharp/ReleasePolicy.qs |
| 60 | Make | cloud-devops-and-config | 246 | polyglot/make/release-policy.mk |

## Ecosystem Stack

| group | technologies |
| --- | --- |
| Core Languages & Logic | Python, JavaScript, TypeScript, Objective-C, Swift, Go, Rust, Java, Kotlin, C, C++, C#, PHP, Ruby, R, Lua, Scala, Haskell, Elixir, Dart, F#, Perl, Shell, PowerShell, SQL |
| Web, Mobile & Runtimes | React, Next.js, Angular, Vue, Svelte, Astro, Node.js, Express.js, Django, Flask, Laravel, Ruby on Rails, WordPress, GraphQL, REST, Tailwind CSS, Bootstrap, Sass, jQuery, Flutter, React Native, Expo, Android, SwiftUI, UIKit, AppKit, Web Components, Progressive Web Apps |
| AI, Data & Intelligence | TensorFlow, PyTorch, OpenCV, scikit-learn, Pandas, NumPy, Jupyter, Matplotlib, D3.js, Chart.js, OpenAI APIs, Agents SDK, MCP, AGI System Contract, Agent Memory, Agent Planning, Multi-Agent Coordination, Research Automation, Token Efficiency, RAG, Embeddings, Model Evaluation |
| Infra, Cloud & DevOps | Docker, Kubernetes, Git, GitHub, GitHub Actions, GitLab, Jenkins, AWS, Google Cloud, Azure, Cloudflare, Firebase, Vercel, Netlify, Render, Heroku, Nginx, Terraform, Ansible, Prometheus, Grafana, Sentry, Datadog |
| Databases & Storage | PostgreSQL, MySQL, MariaDB, MongoDB, SQLite, Redis, Cassandra, DynamoDB, Supabase, Firebase Realtime Database, Cloudinary, Object Storage |
| Tools & Design Suite | Antigravity IDE, Xcode, Android Studio, JetBrains Toolbox, Vim, Neovim, Sublime Text, Figma, Adobe Photoshop, Adobe Illustrator, Adobe After Effects, Adobe Premiere Pro, Adobe XD, Blender, Postman, npm, pnpm, Bun, Obsidian, Notion, Discord |
| Meta & Productivity | Stack Overflow, GitHub Discussions, GitLab Issues, Bitbucket, LinkedIn, X / Twitter, Markdown, Mermaid, Graphviz, Readwise, Zotero, NotebookLM |

## Governance

- Keep GitHub Linguist honest: source languages are counted from real files and language overrides only clarify true source identity.
- Do not add placeholder code to inflate a language percentage.
- Represent frameworks, SDKs, cloud providers, databases, design tools, and productivity surfaces in the ecosystem stack instead of the language bar.
- Default editor guidance remains Antigravity IDE, Xcode for Apple work, Android Studio for Android work, and terminal/Codex for repo automation.
