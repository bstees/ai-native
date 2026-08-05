# Architecture Capture Processing Decision Memo

Date: 2026-07-07

Status: provisional planning recommendation, pending hands-on feasibility validation

Related artifacts:

- [architecture-capture-app-intake.md](/Users/bstees/Documents/AI Native/planning/architecture-capture-app-intake.md:1)
- [architecture-capture-processing-research-plan.md](/Users/bstees/Documents/AI Native/planning/architecture-capture-processing-research-plan.md:1)
- [architecture-capture-new-repo-kickoff-package.md](/Users/bstees/Documents/AI Native/planning/architecture-capture-new-repo-kickoff-package.md:1)

## Decision

Use a `hybrid` processing model for the current v1 plan.

Interpretation:

- on-device first for capture, coaching, live preview, and lightweight correction inputs
- cloud-assisted for any heavier cleanup, furniture suppression, model correction, export normalization, and packaging that cannot be proven reliable on-device

This is the recommended planning baseline until the feasibility spike proves that a `mostly on-device` pipeline can satisfy the v1 quality bar.

## Why This Is The Right Default

### What Apple Already Gives Us On Device

Apple’s current stack is strong for native capture:

- RoomPlan provides LiDAR-backed room scanning with structural recognition and `USD` / `USDZ` output
- RoomPlan supports walls, windows, doors, openings, and room-defining objects
- RoomPlan can be combined with a custom `ARSession`
- MultiRoom support exists for merging room scans into a larger structure

This is enough to justify an iOS-first product and a serious on-device-first feasibility slice.

### What Is Still Unproven

The product does not stop at capture.

The v1 promise also requires:

- furniture excluded from the deliverable
- minimum design-grade usefulness
- optional user-confirmed calibration corrections
- exports that open cleanly in SketchUp and Blender

Current Apple platform evidence does not prove that all of that can be done entirely on-device at acceptable quality and repeatability.

### Why Apple Intelligence Does Not Change The Core Call

Apple Intelligence and the Foundation Models framework are useful for:

- capture guidance
- multimodal reasoning
- intelligent UI flows
- possible classification and correction assistance

They do not remove the need for a geometry pipeline. They are not a substitute for reconstruction cleanup, geometry normalization, or downstream-tool export conditioning.

## Evidence Summary

This recommendation is based on current Apple platform research:

- RoomPlan is explicitly positioned for real estate, architecture, and interior-design-adjacent workflows and outputs `USD` / `USDZ`
- RoomPlan recognizes structural components and furniture/object types
- RoomPlan supports more advanced workflows through custom AR sessions and MultiRoom merging
- ARKit scene understanding can enrich on-device spatial context
- Apple Intelligence adds on-device and Private Cloud Compute reasoning, but not a specialized room-model export pipeline

## Failed Assumptions Avoided

This recommendation avoids several premature assumptions:

- that latest iPhone hardware automatically makes cloud processing unnecessary
- that Apple Intelligence is equivalent to a geometry-processing engine
- that RoomPlan export quality is automatically good enough for downstream design-tool use
- that furniture exclusion is a simple toggle instead of a geometry-quality problem

## Implications For V1 Architecture

The architecture should remain biased toward eventual on-device strength, but not depend on it from day one.

Practical implication:

- keep capture and coaching native and local
- keep the backend small
- design the processing boundary so cloud-assisted cleanup can be removed later if on-device feasibility proves strong enough
- avoid locking the product into a heavy centralized pipeline before the feasibility spike

## What Would Change This Decision

Switch the recommendation from `hybrid` to `mostly on-device` only if the feasibility work shows all of the following on iPhone 17 Pro-class hardware:

- reliable capture across the sample room set
- room-envelope output that excludes furniture without damaging structural usability
- meaningful improvement from one or two user-confirmed measurements
- successful import into SketchUp and Blender without cloud repair
- acceptable processing time and battery cost in a normal user session

If any of those fail, stay with `hybrid`.

## Next Step

Create the dedicated app repo using [architecture-capture-new-repo-kickoff-package.md](/Users/bstees/Documents/AI Native/planning/architecture-capture-new-repo-kickoff-package.md:1), then run the focused feasibility work defined in [architecture-capture-processing-research-plan.md](/Users/bstees/Documents/AI Native/planning/architecture-capture-processing-research-plan.md:1). Replace this memo with a final decision memo once actual capture results exist.
