# SEIS Execution Runway

- Mode: `extreme_long_duration_execution_runway`
- Source packages: `seis-execution-packages`
- Weeks: 26
- Minimum focus hours: 780
- Phases: 4
- Slots: 60
- Checkpoints: 60
- Package coverage: 30
- Command coverage: 10
- Commit policy: `commit only after explicit user approval`
- Push policy: `push only after explicit user approval`

## Phases

| Phase | Weeks | Lane | Focus Hours |
| --- | --- | --- | ---: |
| Foundation Deepening | `01-06` | `now` | 180 |
| Apple Native Deepening | `07-13` | `next` | 210 |
| Windows Polyglot Deepening | `14-20` | `queued` | 210 |
| Cross Platform Hardening | `21-26` | `all` | 180 |

## Next 12 Slots

| Slot | Phase | Package | Focus Hours | Required Commands |
| --- | --- | --- | ---: | --- |
| `phase-01-foundation-deepening-slot-01` | `phase-01-foundation-deepening` | `packet-01-wave-01-foundation-m01-architecture-contract` | 18 | `npm run check:seis-nonjs-kernel`<br>`npm run check:workspace`<br>`npm run automation:refresh-seis-surface -- --summary` |
| `phase-01-foundation-deepening-slot-02` | `phase-01-foundation-deepening` | `packet-02-wave-01-foundation-m02-agent-policy` | 18 | `npm run check:seis-nonjs-kernel`<br>`npm run check:workspace`<br>`npm run automation:refresh-seis-surface -- --summary` |
| `phase-01-foundation-deepening-slot-03` | `phase-01-foundation-deepening` | `packet-03-wave-01-foundation-m03-platform-bridge` | 18 | `npm run check:seis-nonjs-kernel`<br>`npm run check:workspace`<br>`npm run automation:refresh-seis-surface -- --summary` |
| `phase-01-foundation-deepening-slot-04` | `phase-01-foundation-deepening` | `packet-04-wave-01-foundation-m04-data-plane` | 18 | `npm run check:seis-nonjs-kernel`<br>`npm run check:workspace`<br>`npm run automation:refresh-seis-surface -- --summary` |
| `phase-01-foundation-deepening-slot-05` | `phase-01-foundation-deepening` | `packet-05-wave-01-foundation-m05-design-engineering` | 18 | `npm run check:seis-nonjs-kernel`<br>`npm run check:workspace`<br>`npm run automation:refresh-seis-surface -- --summary` |
| `phase-01-foundation-deepening-slot-06` | `phase-01-foundation-deepening` | `packet-06-wave-01-foundation-m06-quality-gate` | 18 | `npm run check:seis-nonjs-kernel`<br>`npm run check:workspace`<br>`npm run automation:refresh-seis-surface -- --summary` |
| `phase-01-foundation-deepening-slot-07` | `phase-01-foundation-deepening` | `packet-07-wave-01-foundation-m07-security-governance` | 18 | `npm run check:seis-nonjs-kernel`<br>`npm run check:workspace`<br>`npm run automation:refresh-seis-surface -- --summary` |
| `phase-01-foundation-deepening-slot-08` | `phase-01-foundation-deepening` | `packet-08-wave-01-foundation-m08-llm-orchestration` | 18 | `npm run check:seis-nonjs-kernel`<br>`npm run check:workspace`<br>`npm run automation:refresh-seis-surface -- --summary` |
| `phase-01-foundation-deepening-slot-09` | `phase-01-foundation-deepening` | `packet-09-wave-01-foundation-m09-runtime-surface` | 18 | `npm run check:seis-nonjs-kernel`<br>`npm run check:workspace`<br>`npm run automation:refresh-seis-surface -- --summary` |
| `phase-01-foundation-deepening-slot-10` | `phase-01-foundation-deepening` | `packet-10-wave-01-foundation-m10-release-readiness` | 18 | `npm run check:seis-nonjs-kernel`<br>`npm run check:workspace`<br>`npm run automation:refresh-seis-surface -- --summary` |
| `phase-02-apple-native-deepening-slot-01` | `phase-02-apple-native-deepening` | `packet-11-wave-02-apple-native-m01-architecture-contract` | 21 | `xcode-select -p`<br>`xcodebuild -version`<br>`xcrun swift --version` |
| `phase-02-apple-native-deepening-slot-02` | `phase-02-apple-native-deepening` | `packet-12-wave-02-apple-native-m02-agent-policy` | 21 | `xcode-select -p`<br>`xcodebuild -version`<br>`xcrun swift --version` |
