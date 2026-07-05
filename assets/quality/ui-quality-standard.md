# UI Quality Standard

## Purpose

Define a shared cross-repo standard for what "good" UI means before a repo has a
full design system or shared component library.

This standard is intentionally stronger than "looks acceptable" and lighter than
a full design system. It establishes the quality bar that agents should meet
when creating or modifying interfaces.

## Core Principle

UI quality should be judged by consistency, clarity, usability, and visual
coherence, not by novelty alone.

Reusable patterns should be preferred over one-off solutions unless there is a
clear reason not to reuse them.

## Standard

### 1. Clear Hierarchy

- The screen should have an obvious visual entry point.
- Headings, supporting text, controls, and secondary actions should read in a
  clear order.
- Typography scale should be intentional rather than accidental.
- Important actions should stand out without creating visual noise.

### 2. Consistent Spacing and Rhythm

- Spacing should follow a repeatable rhythm.
- Similar components should use similar internal padding and external spacing.
- Dense layouts are acceptable only when readability and interaction clarity are
  preserved.
- Random alignment, uneven gutters, and inconsistent padding are not acceptable.

### 3. Reusable Component Thinking

- UI should be built from reusable components whenever that is the better
  design.
- All meaningful mockups and implemented UI should be decomposed into
  components, even when a specific component is only used once.
- Components should be self-contained and independently testable.
- Components should keep their own responsibilities tight, including clear
  boundaries for markup, styling, copy/resources, tests, and visual review
  artifacts where appropriate.
- Avoid one-off variants when a configurable component would serve multiple
  cases.
- Existing components should be reused before new ones are introduced unless
  reuse would distort responsibility or clarity.
- Component instances should behave the same unless configuration intentionally
  changes the behavior.
- Designers should prefer component-based mockups that reflect likely
  implementation boundaries when the tooling supports it.

### 4. State Clarity

- Empty, loading, success, error, disabled, and interactive states should be
  understandable.
- Controls should communicate whether they can be used.
- Feedback after important interactions should be visible and unambiguous.

### 5. Responsive Behavior

- Layout should remain coherent on mobile and desktop.
- Components should not rely on a single viewport size to appear correct.
- Wrapping, stacking, and resizing should feel intentional.

### 6. Accessibility and Legibility

- Text must remain readable against its background.
- Controls must be discoverable and operable.
- Interaction targets should be large enough to use comfortably.
- Visual emphasis should not depend on color alone.

### 7. Contract Adherence

- UI components should respect their intended API and responsibilities.
- Data transformation logic should not leak into visual components without good
  reason.
- Business rules should remain in appropriate modules, not hidden inside view
  code.

## What To Gather Before Judging UI

Agents should gather evidence from:

- the existing repo's visual language
- the product's current component patterns
- design references explicitly provided by the user
- screenshots or browser inspection of the real result

Without a formal design system, the current product patterns should be treated
as the primary local source of truth.

## What This Standard Does Not Decide

This document does not force:

- a global component library
- a token system
- a design language across all products
- a specific aesthetic style

Those belong in a later design-system epic if needed.
