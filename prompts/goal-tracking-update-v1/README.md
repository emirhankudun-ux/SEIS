# Goal Tracking Update Prompt Pack v1

This directory is the compact, reviewable source for a generated Goal Tracking
update corpus containing exactly 5,000,000 Unicode code points after NFC and LF
normalization. The generated prompt and its chunks are written below ignored
`build/`; they are not a second constitution and are not committed to Git.

Root `AGENTS.md`, the current `project.ecosystem.yaml`, the selected Goal YAML,
repository ownership, linked decisions, and current Git evidence remain the
runtime sources of truth. The generated corpus tells an operator how to inspect
and update those records; it does not freeze their current contents.

Commands:

```bash
npm run build:goal-tracking-mega-prompt
npm run check:goal-tracking-mega-prompt
npm run test:goal-tracking-mega-prompt
```

The build is content-addressed by the canonical prompt SHA-256. Each build has a
canonical `prompt.md`, a deterministic `manifest.json`, raw payload chunks that
reconstruct the prompt byte-for-byte, and contextual chunks for selective use.
Five million characters are not claimed to fit one model request; select only
the relevant bounded contextual chunks after checking the caller's supported
context window. Raw payload chunks are integrity and reconstruction artifacts,
not the preferred model-consumption surface.

Length is never reached with whitespace padding, repeated-character padding,
copied chapters, or mid-instruction truncation. The compiler expands unique
Goal scenarios and uses a fail-closed subset solver over unique semantic
directives for the exact final fit.

The inline public-safety scanner is a supplemental fail-closed guard for reviewed
prompt sources. It does not replace the repository's full secret, dependency,
license, SAST, or public-readiness checks.
