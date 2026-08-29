# M19 — Bus boarding reachability regression fix

## Problem

The parked 214 bus door is physically beyond the street curb collider. The street interaction system previously used the same 2.45m raycast range for every interactable. Because the player cannot cross the curb collider, the visible bus door could remain outside the interaction range, preventing boarding during normal play.

## Fix

- preserve the existing 2.45m interaction range for the timetable, flyer and puddle;
- give only `bus-door` a 3.25m boarding range;
- allow the raycaster to inspect up to the bus boarding range, then enforce the per-interactable range before showing a prompt;
- preserve the existing `bus_arrived` gate, cinematic hand action, `bus_boarded` flag, 06:05 clock alignment and transition to `bus-214`.

## Regression protection

`acceptance-m19.mjs` now verifies that the dedicated bus range and per-interactable range check coexist with the curb collider, so a future generic interaction-range change cannot silently make the bus unreachable again.
