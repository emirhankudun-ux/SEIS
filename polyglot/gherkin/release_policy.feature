# SEIS Release Policy — Gherkin BDD
# Feature specifications for release gate and motion mode behaviour

Feature: SEIS Release Gate
  As a SEIS maintainer
  I want automated release gate validation
  So that only deployment-ready builds reach production

  Background:
    Given the SEIS polyglot surface is at version "v2.4.0"
    And the deploy environment is "production"

  # ─── Release Gate — Happy Path ──────────────────────────────────────────
  Scenario: All checks pass — gate opens
    Given all of the following checks are passing:
      | Check                 |
      | typecheck             |
      | lint                  |
      | content validation    |
      | accessibility audit   |
      | reduced-motion tests  |
    When the release gate is evaluated
    Then the release status should be "ready"
    And deployment to production should be authorised
    And the release badge should display "READY" in green

  # ─── Release Gate — Blocked ──────────────────────────────────────────────
  Scenario: Accessibility check fails — gate blocks
    Given the following checks are passing:
      | Check              |
      | typecheck          |
      | lint               |
      | content validation |
    And the following checks are failing:
      | Check               |
      | accessibility audit |
    When the release gate is evaluated
    Then the release status should be "blocked"
    And deployment to production should be prohibited
    And the release badge should display "BLOCKED" in red
    And the blocked reason should contain "accessibility audit"

  # ─── Release Gate — Multiple Failures ────────────────────────────────────
  Scenario Outline: Multiple check failures block the gate
    Given the check "<check>" is failing
    When the release gate is evaluated
    Then the release status should be "blocked"

    Examples:
      | check                |
      | typecheck            |
      | lint                 |
      | content validation   |
      | accessibility audit  |
      | reduced-motion tests |

  # ─── Motion Mode ─────────────────────────────────────────────────────────
  Rule: SEIS Motion Mode Policy

    Scenario: System prefers-reduced-motion is active — durations collapse
      Given the user's system has "prefers-reduced-motion: reduce" enabled
      When the SEIS motion policy is evaluated
      Then the motion mode should be "reduced"
      And the fast duration should be "0ms"
      And the standard duration should be "0ms"
      And the cinematic duration should be "0ms"
      And no CSS keyframe animations should be active

    Scenario: System allows full motion — standard durations apply
      Given the user's system has "prefers-reduced-motion: no-preference"
      When the SEIS motion policy is evaluated
      Then the motion mode should be "full"
      And the fast duration should be "150ms"
      And the standard duration should be "300ms"
      And the cinematic duration should be "800ms"

    Scenario: User manually enables low-motion via toggle
      Given the user's system has "prefers-reduced-motion: no-preference"
      And the user has activated the manual low-motion toggle
      When the SEIS motion policy is evaluated
      Then the motion mode should be "manual-low"
      And the standard duration should be "0ms"
      And the page should display a motion-reduced notice

    Scenario Outline: Motion duration by token and mode
      Given the motion mode is "<mode>"
      When the duration for token "<token>" is resolved
      Then the result should be "<expected_ms>"

      Examples:
        | token     | mode    | expected_ms |
        | instant   | full    | 0ms         |
        | fast      | full    | 150ms       |
        | standard  | full    | 300ms       |
        | slow      | full    | 500ms       |
        | cinematic | full    | 800ms       |
        | instant   | reduced | 0ms         |
        | fast      | reduced | 0ms         |
        | standard  | reduced | 0ms         |
        | slow      | reduced | 0ms         |
        | cinematic | reduced | 0ms         |

  # ─── Accessibility Gate ──────────────────────────────────────────────────
  Rule: SEIS Accessibility Requirements

    Scenario: Homepage passes axe-core audit
      Given the SEIS homepage is loaded
      When an axe-core accessibility scan is performed
      Then there should be zero critical violations
      And there should be zero serious violations

    Scenario: Release gate page is keyboard navigable
      Given the release gate page is loaded
      When the user navigates using only the keyboard Tab key
      Then all interactive elements should receive focus in a logical order
      And the focus indicator should be visible at each step
