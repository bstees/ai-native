# Architecture Capture Processing Research Plan

This plan exists to answer one open decision from [architecture-capture-app-intake.md](/Users/bstees/Documents/AI Native/planning/architecture-capture-app-intake.md:1): should v1 processing be mostly on-device or hybrid?

The goal is not to build the product yet. The goal is to gather enough evidence to choose the right processing model for the first implementation slice.

## Research Goal

Determine whether an iPhone 17 Pro-class device running iOS 26 can produce a minimum-design-grade, furniture-excluded, room-envelope export that is usable in SketchUp and Blender without requiring cloud post-processing for v1 quality.

## Questions To Answer

1. What geometry and structure can RoomPlan produce on-device by default?
2. How much additional value can ARKit scene geometry add beyond RoomPlan alone?
3. Can furniture be excluded cleanly enough on-device while preserving walls, openings, floors, and ceilings?
4. Can one or two user-confirmed measurements materially improve accuracy on difficult rooms?
5. Can the phone generate exports that remain usable in SketchUp and Blender without a cloud cleanup pass?
6. If the answer is "not fully," which specific steps still need cloud help: cleanup, correction, conversion, or packaging?

## Success Criteria

The research supports a `mostly on-device` decision only if all of these are true:

- capture works on the chosen iPhone 17 Pro-class baseline with acceptable reliability
- the resulting model is room-envelope-first and excludes furniture from the deliverable
- user-confirmed calibration improves weak scans in a predictable way
- export opens successfully in SketchUp and Blender
- the imported result is usable as a redesign starting point without full redraw
- processing time stays within a practical mobile workflow

If any of those fail, the default decision should move toward `hybrid`.

## Suggested Spike Experiments

### Experiment 1: RoomPlan Baseline

Use RoomPlan alone on a small set of representative rooms:

- simple bedroom
- furnished living room
- small office

Capture outputs to inspect:

- raw room representation
- exported `USD` / `USDZ`
- recognized structural elements
- recognized furniture/object elements

Question answered:

- how close native RoomPlan gets to the desired v1 output with no custom processing

### Experiment 2: Occlusion And Furniture Exclusion

Test rooms where furniture blocks portions of walls, corners, and openings.

Inspect:

- whether peeking around furniture is enough for a good room shell
- whether furniture can simply be dropped from the final deliverable
- where dropping furniture leaves holes, distortions, or missing wall/opening geometry

Question answered:

- whether furniture exclusion is mostly a UX/coaching problem or a geometry-cleanup problem

### Experiment 3: Calibration Assist

Add one or two known measurements after capture:

- wall length
- doorway width

Inspect:

- whether calibration improves global scale only
- whether it can improve local geometry enough to matter
- whether the interaction is simple enough for normal users

Question answered:

- whether calibration is a meaningful v1 correction lever or just a small patch

### Experiment 4: Export Viability

Take the best on-device outputs and import them into:

- SketchUp
- Blender
- optional spot-check: Shapr3D

Inspect:

- import success
- scale/orientation correctness
- geometry cleanliness
- ease of using the model as a starting point

Question answered:

- whether the exported model is genuinely useful downstream, not just technically importable

### Experiment 5: ARKit Augmentation

Compare:

- RoomPlan only
- RoomPlan plus custom ARKit capture/context

Inspect:

- whether ARKit scene geometry or custom session data materially improves results
- whether the added complexity is justified for v1

Question answered:

- whether a richer on-device pipeline can close the gap enough to avoid cloud processing

## Evidence To Collect

- sample captures from each room type
- side-by-side exported results before and after furniture exclusion
- dimension comparisons against manually measured references
- import screenshots or notes from SketchUp and Blender
- processing time observations
- failure cases and repeatability notes

## Decision Rule

Choose `mostly on-device` if:

- RoomPlan plus light custom on-device processing reaches minimum design-grade consistently enough across the sample set
- furniture exclusion works without breaking the room shell
- calibration meaningfully rescues weak scans
- exports are usable in SketchUp and Blender without cloud cleanup

Choose `hybrid` if any of these remain true:

- furniture exclusion needs heavier geometry cleanup
- calibration requires non-trivial model correction logic
- exported files need normalization or repair before import
- multi-room merging or structural cleanup is too fragile on-device
- performance or battery cost is too high for a normal user workflow

## Recommended Output Of The Research

Produce a short decision memo with:

- chosen processing model: `mostly on-device` or `hybrid`
- evidence summary
- failed assumptions
- v1 implications for architecture and cost
- any changes required to the intake package
