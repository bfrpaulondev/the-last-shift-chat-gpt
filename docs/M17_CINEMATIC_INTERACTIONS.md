# M17 — Cinematic Interaction Animations

M17 turns the M16 true-first-person rig into object-specific interaction choreography while preserving movement, collision, save, telemetry and dialogue serialization.

## Animation phases

Each cinematic interaction follows four phases:

1. approach — arm reaches a canonical physical anchor;
2. contact — fingers close around or brace against the prop;
3. manipulation — wrist and prop respond together;
4. release/transfer — hand returns or carries the item into a held position.

The arm still uses the M16 0.72 m physical reach clamp. Canonical anchors prevent the hand from reaching the center of a large interactable when the intended contact point is a small control such as a handle or button.

## Object choreography

### Door

The right hand reaches the real handle anchor, closes around it, rotates the wrist and drives a visible lever. A procedural metal/plastic click is synchronized with contact.

### Bathroom faucet

The hand reaches the valve anchor, wraps fingers around the cross handle and rotates the wrist while the visible valve rotates. The drip flag changes during the manipulation phase rather than at key-down.

### Coffee machine

The hand approaches palm-down, leaves the index finger comparatively extended, depresses a real button and drives the indicator lamp. Failure/success audio is delayed until after physical button contact.

### Phone

The phone is transferred from the bedside table into a camera-relative held position. The original table phone is hidden only after the hand makes contact. The reading overlay opens after the lift has become visible.

### Badge

Attempt one uses `badge-slip`: the hand pinches the badge, loses it and the proxy falls to the known floor position before the dropped badge state is committed.

Attempt two uses `badge-pickup`: the hand reaches the floor, pinches the badge and lifts it toward the body before the badge note opens.

## State contract

`HandActionState` carries:

- `kind` — generic hand family;
- `target` — world-space reach point;
- `objectId` — the concrete interactable;
- `variant` — cinematic sub-sequence such as `badge-slip`, `phone-lift` or `door-handle`.

## Prop response layer

`CinematicPropAnimations.tsx` adds response geometry without adding colliders or raycast blockers. Its meshes explicitly disable interaction raycasts.

## Audio

`InteractionFoley.ts` synthesizes short interaction sounds with Web Audio. No external sound files, paid assets or services are used.

## Safety / regression boundaries

- no new gameplay colliders;
- no changes to player radius;
- no changes to backend routes or persistence;
- SPACE-controlled dialogue serialization remains intact;
- notes/subtitles are intentionally delayed until the key visual contact is visible;
- bathroom navigation acceptance remains mandatory.
