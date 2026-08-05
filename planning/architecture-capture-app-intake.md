# Architecture Capture App Intake

This intake follows [planning/new-app-intake-outline.md](/Users/bstees/Documents/AI Native/planning/new-app-intake-outline.md:1) and stays in planning mode. The product idea is large and ambiguous, so the goal here is the smallest useful plan that can support a safe start.

## Project Goal

Build a mobile-first architecture capture product that turns real-world spaces into editable 3D files that designers, contractors, real estate teams, and homeowners can open in mainstream 3D tools. For the first milestone, success means a user with a supported phone can capture one interior residential room or small connected space, receive a usable 3D model export, and open that export in at least two target tools without manual reconstruction from scratch.

Primary user:

- a design-adjacent operator who needs a fast as-built starting point rather than survey-grade BIM
- likely early adopters: interior designers, remodelers, home stagers, real estate media teams

## V1 Scope

### Core Problem

People who need a digital starting model of a physical space usually face a bad tradeoff: manual measurement is slow, pro scanning hardware is expensive, and phone-based capture output is often too noisy or too closed to use in normal design workflows.

### Smallest Useful V1

Constrain v1 to one clear job:

- capture interior spaces on the latest capable iPhone Pro-class hardware, starting with iPhone 17 Pro / Pro Max and newer supported models
- generate a room-scale or small multi-room structural model that excludes furniture from the intended output
- export into a short list of common exchange formats that downstream 3D tools can import

### Must-Have Features

- guided capture flow for interior scanning on supported devices
- capture instructions that steer users to room corners, openings, and occluded edges rather than furniture surfaces
- optional user-confirmed reference measurements so the model can be corrected when sensor-derived dimensions are weak
- cloud or hybrid processing that converts capture data into a cleaned 3D scene
- export package in a small set of formats, `GLB`, `USDZ`, and `OBJ`
- basic geometry cleanup so walls, openings, floors, and ceilings are materially more usable than a raw mesh dump
- furniture suppression or exclusion in the final exported model, even if furniture is seen during capture
- project record with preview, export status, and capture metadata

### Assumptions Shaping V1

- v1 is not trying to replace Matterport, laser scanning, or BIM authoring
- users value "editable starting point" over perfect dimensional fidelity
- export interoperability matters more than deep in-app editing
- the initial mobile baseline is the latest Apple stack, using the current iOS generation and the most capable current iPhone Pro hardware
- the most useful first output is the room shell and openings, not a furnished scene reconstruction

## Out Of Scope

- Android support
- non-Pro iPhones unless testing proves the capture quality bar can still be met
- full exterior building reconstruction
- large commercial buildings
- survey-grade accuracy guarantees
- automatic BIM / CAD semantics beyond a small, practical surface model
- furniture capture as retained geometry in the delivered model
- in-app floorplan editor, furniture planner, or renovation design suite
- collaboration, comments, approvals, or enterprise admin
- marketplace, lead-gen, or real-estate listing workflows
- direct plugins for every target 3D tool

## Critical Risks And Unknowns

### Highest Risks

- geometry usefulness risk: phone capture may produce models that technically export but are not clean enough for real downstream editing
- device capability risk: even within the latest iPhone line, capture quality may still force the product onto only Pro-class hardware
- processing cost risk: cloud reconstruction and cleanup may be too slow or expensive per scan
- interoperability risk: "works in top 3D tools" is not one requirement; each target tool has different format tolerance and cleanup expectations
- expectation risk: users may hear "3D model of a house" and expect complete, accurate, production-ready digital twins

### Unknowns To Resolve Early

- what minimum accuracy and cleanliness users actually need for first value
- whether the latest iOS capture APIs are enough or whether custom reconstruction is required
- which export formats deliver the best practical import path into SketchUp and one or two other target tools
- whether object segmentation is needed in v1 or whether envelope-first geometry is enough
- how reliably the pipeline can suppress furniture while preserving wall and opening accuracy
- how much improvement a small number of user-confirmed measurements can provide on difficult rooms
- how much of the cleanup pipeline can run on-device versus in the cloud

## Initial NFR Profile

The first pass should treat these as day-one NFRs.

| NFR | Why it matters | Minimum acceptable bar | Initial validation |
| --- | --- | --- | --- |
| Geometric usefulness | A model that imports but is unusable fails the product | Imported model is recognizable, reasonably aligned, excludes furniture from the deliverable, and is editable for a small interior space without full redraw | Test imports into SketchUp and Blender using 5 to 10 representative captures, then spot-check in Shapr3D |
| Export portability | The value proposition depends on downstream tool use | One export path reliably opens in SketchUp and Blender, with early spot-check validation in Shapr3D | Manual import test matrix for each release candidate |
| Capture reliability | Users will abandon after failed scans | Majority of supported-device test scans complete without crash or stuck processing | Structured device test runs on supported iPhone 17 Pro-class set |
| Accuracy | The product promise depends on the model being useful for real redesign work | Minimum design-grade accuracy, with user-confirmed calibration measurements available when sensor confidence is low | Compare captured dimensions against a measured room set with and without calibration inputs |
| Performance | Slow capture or multi-hour processing breaks the workflow | Small-space capture session feels real time; processed result available in minutes, not hours, including any manual calibration step | Measure capture duration, upload time, processing latency |
| Privacy and data handling | Users are scanning private homes and businesses | Explicit consent, encrypted transport/storage, no silent reuse of scan data for training | Threat-model review and storage/data-flow review before beta |
| Observability | Reconstruction failures will be hard to debug without strong signal | Capture, upload, processing, export, and failure states are traceable per project | Event instrumentation at each pipeline boundary |
| Cost efficiency | Per-scan compute cost can kill the business early | Feasibility target established and tracked for scan processing cost | Pilot cost model from early processing pipeline |
| Maintainability | Sensor-heavy products get brittle fast | Clear boundaries between mobile capture, processing, export, and account/project services | Architecture review before implementation expands beyond the first slice |

## Initial Architecture Direction

### Likely App Shape

A separate product repo should own the app. AI Native should remain the standards and governance source.

Likely system shape:

- iOS mobile client for guided capture, upload, preview, and export retrieval, targeting the latest iOS generation
- backend API for auth, project records, job orchestration, and export delivery
- processing pipeline for reconstruction, cleanup, format conversion, and asset packaging
- storage boundary for raw captures, processed models, and generated exports

### Likely Split

- frontend/runtime: native iOS first on the latest iOS generation, because sensor access and capture UX are core product concerns
- backend/runtime: service-oriented but still small, likely one API service plus one async processing worker to start
- data boundary: keep raw sensor/capture payloads separate from derived 3D assets and user/project metadata

### Tradeoffs

- on-device processing lowers cloud cost and privacy risk but may underperform on larger scans
- cloud processing improves flexibility and iteration speed but adds latency, cost, and data sensitivity
- generic mesh export is easier than semantic structured models, but less useful for advanced renovation workflows
- room-envelope output with furniture suppression is a better v1 fit than either a full furnished mesh or a richer BIM-like semantic model
- user-confirmed calibration can improve trust without requiring near-survey-grade autonomous sensing in v1

### Initial Direction

Start with hybrid processing:

- capture and light preview on device
- upload structured capture data
- run cleanup, furniture suppression, and export generation in the cloud

This keeps v1 technically realistic while preserving room to move more processing on-device later if cost or privacy pressures demand it.

## Recommended Repo Model

Recommended default:

- keep AI Native as the central standards, workflows, and governance repo
- create a dedicated app repo immediately for product work
- pull AI Native guidance into that repo through lightweight repo-local instructions and links to canonical assets
- feed implementation learnings, NFR adjustments, and workflow friction back into AI Native after human review

Reason:

- this app has its own platform, runtime, test matrix, assets, and delivery concerns
- building it inside AI Native would blur governance with product execution and make both repos worse

## First Execution Slice

The first slice should be a feasibility slice, not feature delivery.

### Slice Goal

Prove that an iPhone 17 Pro-class device can capture a small interior space and produce one exported structural room model, without furniture in the deliverable, that survives import into SketchUp and Blender with acceptable usefulness.

### Backlog For Slice 1

- lock target user and success criteria for the first milestone
- lock the supported device floor to iPhone 17 Pro / Pro Max and newer supported Pro-class models
- lock downstream validation targets: SketchUp and Blender as hard gates, with Shapr3D as an early soft validation target
- evaluate the latest iOS capture APIs versus custom capture needs
- define one canonical sample environment set for testing: simple bedroom, furnished living room, small office
- define the v1 capture coaching for corners, openings, and peeking around occlusions caused by furniture
- define the calibration interaction: when to ask for one or two reference measurements and how that correction is applied
- build a throwaway technical spike plan for capture -> processing -> export -> import validation
- define the scoring rubric for "usable model" before any implementation begins

### First Human Gates

- approve SketchUp and Blender as the initial hard compatibility targets, with Shapr3D as the early soft target
- approve the accuracy promise as minimum design-grade, with optional user-confirmed calibration measurements
- approve the v1 output promise as room-envelope-first with furniture excluded from the deliverable
- approve whether the feasibility slice justifies creating the dedicated app repo immediately

## Next Decision Points

Do not exit planning until these are explicit:

1. Processing placement: mostly cloud, mostly on-device, or hybrid.

## Accuracy Baseline Note

The current planning baseline is:

- target accuracy promise: `minimum design-grade`
- intended use: redesign starting point, layout planning, and space modeling
- excluded promise: final construction-grade or survey-grade measurement authority
- mitigation path: allow the user to confirm one or two known dimensions so the system can correct scale or local geometry when sensor confidence is weak

## Platform Baseline Note

As of July 7, 2026, the current Apple platform direction is iOS 26, introduced at WWDC26 on June 8, 2026, and the most capable current iPhone family is the iPhone 17 Pro line. For this planning package, the baseline should be:

- latest iOS generation: `iOS 26`
- starting hardware floor: `iPhone 17 Pro` and `iPhone 17 Pro Max`
- expansion path: newer Pro-class iPhones after validation, not older or non-Pro devices by default

## Processing Placement Research Note

The processing placement decision should remain open until a focused feasibility check is done.

Current evidence suggests:

- Apple provides strong on-device capture primitives through RoomPlan, ARKit scene understanding, and related LiDAR-backed APIs
- RoomPlan already produces parametric room output in `USD` / `USDZ`, including recognized components and dimensions
- Apple Intelligence and the Foundation Models framework improve on-device and Private Cloud Compute reasoning, but they are not a substitute for room-geometry reconstruction or CAD/export pipelines
- the likely uncertainty is not whether the phone can capture enough data, but whether the full cleanup, furniture suppression, correction, and cross-tool export pipeline can hit the v1 quality bar entirely on-device

Recommended research question before locking this decision:

- can an iPhone 17 Pro-class device, using current iOS 26 APIs, produce a minimum-design-grade room-envelope export with furniture excluded and calibration-aware corrections, without relying on cloud post-processing for quality?

Follow-up planning artifact:

- see [architecture-capture-processing-research-plan.md](/Users/bstees/Documents/AI Native/planning/architecture-capture-processing-research-plan.md:1)
- see [architecture-capture-processing-decision-memo.md](/Users/bstees/Documents/AI Native/planning/architecture-capture-processing-decision-memo.md:1)
- see [architecture-capture-new-repo-kickoff-package.md](/Users/bstees/Documents/AI Native/planning/architecture-capture-new-repo-kickoff-package.md:1)

If those decisions are made, the next planning step should be implementation planning in the new app repo, not coding inside AI Native.
