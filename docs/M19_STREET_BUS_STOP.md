# M19 — Rua / Ponto 214

M19 implements Part 2 Area A as the first fully streamed environment after the apartment.

## Narrative role

This area deliberately stays calm. It is the last piece of Bruno's ordinary world before the bus introduces TRIAGEM. The tension target is low; the scene earns atmosphere through rain, early-morning light, physical wear and the distant scale of Meridian Tower rather than a scare.

The clock continuity is normalized to the existing Part 1 objective: street arrival is anchored at approximately 05:55 and the highlighted bus is 06:05. The original Part 2 brief's later street timestamp is treated as a continuity typo rather than changing the already implemented apartment objective.

## Environment

- wet Portuguese-style stone pavement generated procedurally;
- wet asphalt road with physically based clearcoat response;
- layered city silhouette and Meridian Tower as a distant landmark;
- only a small number of tower windows are lit;
- metal/polycarbonate bus shelter;
- amber sodium street light mixed with cold dawn ambience;
- shelter fluorescent follows the recurring 3-short / 1-long signature;
- trash bags, street wear and curb detail;
- two puddles, including an interactable tower-reflection puddle;
- 520 instanced rain streaks to keep draw-call cost bounded.

No paid or external binary assets are required.

## Interactions

### Route board

`route-214`

Shows the timetable and highlights 06:05. Sets `route_214_checked`.

### Corvus flyer

`corvus-flyer`

Wet recruitment flyer for CORVUS FACILITY GROUP. Sets `corvus_flyer_seen`.

### Meridian puddle

`tower-puddle`

Bruno comments on the upside-down tower reflection. Sets `meridian_puddle_seen`.

### Bus boarding

The 214 enters the street after the player has had time to orient and stops at the shelter. Arrival sets `bus_arrived`. The bus door becomes interactable only once parked.

Boarding:

1. player reaches the door/validator area;
2. validator feedback plays;
3. `bus_boarded` is set;
4. narrative clock is aligned to 06:05;
5. M18 streaming transitions to `bus-214 / bus-boarded`;
6. street area unmounts and only the bus area remains active.

M20 replaces the current bus standby with the complete bus interior.

## Global shift clock and 15-minute routine

The shift clock is a shared persistent system, not a HUD-only timer.

The authoritative cadence is:

`ROUTINE_INTERVAL_MINUTES = 15`

Routine boundaries are aligned to the quarter hour:

- 08:00
- 08:15
- 08:30
- 08:45
- 09:00
- and so on.

With the current time scale, `GAME_SECONDS_PER_MINUTE = 10`, so one 15-minute in-game routine interval corresponds to 150 seconds / 2m30s of real play while the clock is running normally.

The routine trigger is enabled only in work/elevator areas (`service-elevator`, `work-floor-22`, `work-floor-30`, `cafeteria`, `floor-37`). Street, bus, plaza, lobby and locker areas advance time but do not trigger cleaning-routine cycles.

`worldMinute` and `lastRoutineMinute` are persisted with the save. This prevents a reload on a quarter-hour boundary from repeating a routine cycle that already happened.

## Clock integration

- `ShiftClockController` is mounted once in `App`;
- the HUD reads the shared shift clock;
- street arrival is raised to at least 05:55;
- boarding aligns the story to 06:05;
- save hydration reanchors the real-time clock so a loaded time is not overwritten;
- the separate duplicate clock driver created during M19 was removed.

## Performance boundaries

- one active streamed area at a time;
- rain uses a single instanced mesh;
- background buildings are static and non-interactable;
- only the main dawn directional light casts a shadow map;
- most decorative elements disable or avoid gameplay raycasts;
- no planar-reflection pass is introduced for puddles;
- existing PBR environment and post-processing are reused rather than duplicated.

## Regression boundaries

M19 must not change:

- Part 1 checklist or exit prerequisites;
- M9 dialogue serialization;
- M16 true-first-person body;
- M17 apartment interaction choreography;
- player radius;
- Mongo save/telemetry behavior other than the intentional clock fields;
- M18 area/checkpoint streaming contract.
