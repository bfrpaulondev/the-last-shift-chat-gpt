# M16 — True First Person Body

This milestone replaces the old camera-overlay hand renderer with a world-space articulated body rig while preserving the existing gameplay, collisions, interaction rules, persistence and telemetry.

## Architecture

- `TrueFirstPersonBody.tsx` owns the visible torso, pelvis, legs, articulated arms and hands.
- The body root follows the player's world X/Z position and a damped yaw derived from the camera forward vector.
- The head is intentionally not rendered so the camera can occupy the natural eye position without clipping into face geometry.
- The torso and legs become visible after the player gets out of bed; arms remain available for the wake-up interaction.
- The camera near plane is `0.05` to allow the player to look down and see chest, waist and legs without aggressive clipping.

## Arms

Each arm is built as a connected shoulder → upper arm → elbow → forearm → wrist chain.

- Shoulder anchors are fixed on the body rig.
- Hands follow a camera-relative resting target.
- During interactions the right hand receives the world-space raycast point from `InteractionSystem`.
- Reach distance is clamped to 0.72 m so the arm cannot stretch unrealistically.
- Elbows bend outward/downward to keep a natural first-person silhouette.
- Arm and hand orientation are converted from camera world space into body-local space.

## Hands

Each hand contains:

- palm volume;
- wrist/cuff;
- four articulated fingers;
- proximal and distal finger segments;
- knuckle joints;
- articulated thumb;
- action-specific finger curl for reach, grab, press, turn, door, brace and startle.

The body uses normal depth testing. It is not an always-on-top overlay, so objects can occlude hands naturally.

## Locomotion

- Body yaw follows the camera with damping instead of snapping.
- Leg stride is driven by actual camera displacement.
- Knees bend on the recovery phase of each step.
- Torso has subtle breathing and micro sway.
- Existing movement speeds, head bob, footsteps and collision system are unchanged.

## Interaction targeting

`HandActionState` can now carry an optional `[x, y, z]` world-space target.

`InteractionSystem` stores the hit point of the currently valid center-screen raycast and passes it into the hand action. This gives the arm a spatially meaningful direction while keeping the original interaction range and occlusion rules.

## Constraints

- 100% code/procedural; no paid model or service.
- No extra collider is created for the body.
- Body meshes have interaction raycasts disabled.
- Existing gameplay M1–M15 remains the source of truth.
