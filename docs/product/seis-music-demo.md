# SEIS Music Demo

`apps/web/seis-music.html` is a standalone browser-local SEIS Music demo.

## Purpose

SEIS Music is part of the required SEIS creative operating system ecosystem. This page turns Music from planned scope into a real local artifact without pretending to stream audio or call live recommendation providers.

## Working interactions

- Play/pause state.
- Next and previous track controls.
- Playlist track selection.
- Mood filters.
- Track search.
- Album cards.
- Waveform visualizer.
- AI recommendation mock safe mode.
- Reset local Music state.
- Persist selected track, play state, and mood filter in `localStorage` only.

## Catalog coverage

- Tracks: Orbiting Graphite, Glass Kernel, Demo Runway, Terminal Rain, Canvas Bloom, Searchlight Index.
- Albums: Command Focus, Launch Sequence, Design Studio, Knowledge System.
- Recommendations: For deep work, For demo review, For design critique.

## State semantics

- `real`: standalone page, player controls, playlist interactions, filters, waveform visual, and local persistence.
- `mock`: AI recommendations are static mock safe mode.
- `planned`: real audio streaming, account sync, provider-backed recommendations, and licensing remain future work.

## Safety boundary

- No API keys are required.
- No audio stream is started.
- No SSH is executed.
- No GitHub mutation is performed.
- No deployment is triggered.
- No AI provider call is performed.
- No branch protection is changed.
- No private keys, tokens, passwords, cookies, service accounts, or `.env` values are read or stored.

## Validation

Run:

```bash
node scripts/check-seis-music-demo.mjs
```

The validator checks the page, player controls, playlist entries, album/recommendation coverage, localStorage boundary, state labels, and safety wording.
