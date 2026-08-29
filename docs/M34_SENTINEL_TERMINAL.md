# M34 — Área L: SENTINEL Terminal

## Scope

M34 completes Part 3 (`O Despertar`) inside the existing 39th-floor Security Center. It starts only after M33 returns Bruno to the room with Nascimento's notebook and preserves the M32 camera/override interactions unchanged.

## Canon sequence

1. `SENTINEL v9.4.1` boots with the canonical 61% sensor state, 12 cameras offline, synchronized `23:47` system clock, one open incident and no operator.
2. Bruno opens Nascimento's paper notebook and finds `NASCIMENTO1994+ANO ATUAL`; SENTINEL records the identity-hygiene lesson.
3. The player types `SENTINEL --maintenance --operator=4471` on the real keyboard. Incorrect input is rejected and can be corrected with Backspace.
4. Incident `#0001` identifies badge 4471 / PAULON, B. as a compromised identity and marks the player as the potential suspect.
5. TRAINING MODE accepts Y/N. N is canonically recorded as YES and persists `training_forced`; Y persists `training_accepted`.
6. The first query is typed line-by-line. TAB accepts gray scaffold/autocomplete, Backspace corrects errors, a one-edit typo offers `DID YOU MEAN...? [Y/N]`, and BPM-driven hand tremor can duplicate a character.
7. Results stream line-by-line with procedural terminal beeps. BPM falls from ~110 to 90 during Bruno's canonical realization.
8. CAM 37-BREAKROOM replay exposes the seven missing seconds and the 1.2-second OK gesture before the cut. `seven_seconds_seen` and `he_knew` persist.
9. `log_vision` unlocks permanently. Sensor records are world-space Three.js text with depth testing, not a flat HUD.
10. SENTINEL presents the 06:00 police ETA, 39% system state and basement camera incident. Choice 1 stores `choice_basement_now`; choice 2 stores `choice_logs_first`.
11. ShadowByte closes the part over Nascimento's radio and the canonical Part 3 end card is shown.

## Physical / first-person implementation

- The existing security console remains the interaction anchor; no artificial area transition is introduced.
- A procedural physical keyboard is mounted on the L-console. Every accepted key event emits a pulse that depresses one 3D key and releases it with damped motion.
- The terminal emits a phosphor-green point light into the hand/notebook zone while the session is active.
- Nascimento's notebook remains physically present beside the keyboard while typing.
- Log Vision labels use depth-tested world geometry so walls and scene objects occlude records normally.
- No external assets, paid services or runtime dependencies were added.

## Persistence / telemetry

Persistent checkpoints include:

- `sentinel-terminal-seat`
- `sentinel-credential-found`
- `sentinel-login`
- `sentinel-training-mode`
- `sentinel-query-complete`
- `sentinel-seven-seconds`
- `sentinel-log-vision`
- `part3-terminal-complete`

Gameplay telemetry records terminal entry, rejected/accepted login, ghost autocomplete, query correction/rejection, replay, Log Vision unlock and the final action-vs-data triage choice. Existing Mongo save/telemetry transport remains unchanged and receives the new flags/checkpoints through the established generic persistence contract.

## Regression boundaries

M34 must not alter:

- M1–M17 true-first-person/cinematic interaction contracts;
- M18–M30 Part 2 route and blackout handoff;
- M31 awakening/stairwell continuity;
- M32 CAM 02, Observation #1 and FIREMAN'S OVERRIDE;
- M33 Nascimento dialogue, notebook transfer, ShadowByte first contact and elevator return;
- serialized subtitle progression (`subtitleQueue` + SPACE dismissal).

`npm run check:acceptance` now includes `scripts/acceptance-m34.mjs`. The repository CI continues to run acceptance, server syntax, backend offline fallback, Mongo persistence/telemetry smoke, TypeScript/Vite build and production-preview smoke before integration.
