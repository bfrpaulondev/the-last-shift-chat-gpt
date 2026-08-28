# M18 — Part / Area Flow, Streaming and Persistent Location

M18 is the runtime foundation for Part 2. It changes the game from a single apartment scene into a persistent sequence of independently mounted areas.

## Core rule

Only the active heavy area is mounted. `AreaDirector` owns the active scene boundary and unmounts the apartment when the player leaves it. Future Part 2 areas replace the lightweight streaming standby one by one without keeping previous environments resident.

## Canonical Part 2 route

`apartment -> street -> bus-214 -> meridian-plaza -> lobby -> locker-b1 -> service-elevator -> work-floor-22 -> work-floor-30 -> cafeteria -> floor-37 -> blackout`

The service elevator is intentionally represented as its own area because later milestones use the closed cabin as a diegetic streaming/loading boundary.

## Persistent location

A save now stores:

- `part`
- `area`
- `checkpoint`
- optional player spawn (`x`, `y`, `z`, `yaw`)
- `schemaVersion`

Flags remain persisted exactly as before. Location changes trigger the same debounced autosave path as flag changes.

## Backward compatibility

Old saves without a `location` field still load:

- `left_home === true` migrates to `part-2 / street / street-arrival`;
- otherwise the save resumes in the apartment.

The old Part 1 door still calls `endDemo()` internally. M18 deliberately keeps that M17 interaction code untouched: `endDemo()` recognizes the completed apartment exit and converts it into the Part 2 street transition. The true demo ending remains available for the later blackout/final card.

## Transition behavior

`requestAreaTransition()`:

1. locks interaction/cinematic input;
2. starts a black fade;
3. swaps the active location near the middle of full black;
4. unmounts the previous area and mounts the next area;
5. marks location dirty for persistence;
6. clears the transition and restores interaction.

The DOM overlay uses the Web Animations API and does not add a rendering pass to Three.js.

## Backend

Mongo saves accept structured location data and schema version 2. The server validates known parts, known areas, checkpoint text and finite spawn coordinates. Location remains optional at the API layer so older clients/saves remain compatible.

## Regression boundaries

M18 does not alter:

- Part 1 collisions;
- M17 hand choreography;
- dialogue serialization;
- coffee/badge/faucet logic;
- rat scare;
- PBR/weather/interior rendering;
- telemetry event shape.

Both the legacy acceptance suite and `acceptance-m18.mjs` run in CI.
