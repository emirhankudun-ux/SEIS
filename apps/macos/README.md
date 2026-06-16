# macOS Lane

The macOS lane is for local desktop tools around SEIS: repo inspection, archive audit, plugin management, and data review.

## Initial Direction

- use SwiftUI for first-party desktop surfaces
- keep shell commands and GitHub checks explicit
- avoid deleting repos or local archives from UI until verification gates are satisfied

## Plugin Stack

- Build macOS Apps
- GitHub
- SEIS plugin

## First Build Tasks

1. Define a small SwiftUI shell.
2. Show SEIS branch and repo visibility status.
3. Add plugin status and zip audit views.
4. Add export links to Drive docs and Calendar reviews.

## Native Language Boundary

The macOS lane is Apple-only by default: Swift, SwiftUI, Objective-C, Objective-C++, AppleScript, Metal Shading Language, and Apple platform metadata. Do not introduce JavaScript or Python code for the native shell unless a later decision record proves a product need, owner, runtime cost, and rollback path.

## Market-readiness Focus

A macOS SEIS surface should prove local privacy, accessibility, reduced-motion behavior, branch visibility, plugin trust status, and safe handoff before it becomes a distributable product.
