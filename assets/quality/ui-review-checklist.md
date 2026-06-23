# UI Review Checklist

## Purpose

Provide a reusable review checklist for evaluating UI work before human
approval or protected-branch push.

## Checklist

### Structure and Hierarchy

- [ ] The main purpose of the screen or component is visually obvious
- [ ] Headings, controls, and supporting text have a clear reading order
- [ ] Primary and secondary actions are visually distinct

### Spacing and Alignment

- [ ] Spacing feels consistent across similar elements
- [ ] Padding and margins follow a visible rhythm
- [ ] Alignment is clean and not drifting between related components

### Component Reuse

- [ ] Reusable components were preferred over one-off implementations
- [ ] New variants exist only when configuration could not reasonably solve the need
- [ ] Similar component instances behave consistently

### State Coverage

- [ ] Empty, loading, success, and error states were considered where relevant
- [ ] Disabled and active states are understandable
- [ ] Important interactions provide clear feedback

### Responsiveness

- [ ] The UI remains coherent on mobile and desktop or the supported breakpoints
- [ ] Layout changes feel intentional rather than broken
- [ ] Controls and content remain usable when space is constrained

### Accessibility and Legibility

- [ ] Text remains readable against its background
- [ ] Controls are discoverable and operable
- [ ] Interaction targets are comfortably usable
- [ ] Meaning is not conveyed by color alone

### Code and Contract Quality

- [ ] The UI component is self-contained and testable
- [ ] Visual components did not absorb unrelated business logic
- [ ] Component APIs remain coherent and reusable

### Verification

- [ ] Relevant automated tests were run
- [ ] Visual or browser-based checks were performed where needed
- [ ] No linting, build, or test failures remain
