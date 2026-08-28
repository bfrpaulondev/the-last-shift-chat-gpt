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

## Clock integration

The concurrent clock work was reviewed and retained because it is directly useful to Part 2:

- `ShiftClockController` is mounted once in `App`;
- the HUD reads the shared shift clock;
- `worldMinute` and `lastRoutineMinute` are persisted with the save;
- the separate duplicate clock driver created during M19 was removed;
- routine-boundary tracking is limited to later work/elevator areas.

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
