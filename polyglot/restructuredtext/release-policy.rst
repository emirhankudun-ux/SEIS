.. ============================================================
.. SEIS Release Policy — reStructuredText
.. ============================================================

==========================
SEIS Release Policy v2.4.0
==========================

:Project:     SEIS Polyglot Surface
:Author:      Emirhan Kudun
:Status:      Pending Review
:Version:     2.4.0
:Updated:     2026-06-07

.. contents:: Table of Contents
   :depth: 2
   :local:

Overview
--------

The SEIS release policy governs deploy readiness, motion mode
configuration, and accessibility standards for every surface
in the SEIS ecosystem.

Motion Mode Policy
------------------

All SEIS surfaces must respect the ``prefers-reduced-motion``
media query and provide a manual low-motion toggle.

.. list-table:: Motion Mode Configuration
   :header-rows: 1
   :widths: 20 20 20 40

   * - Mode
     - Duration Multiplier
     - Keyframes
     - Notes
   * - ``full``
     - 1×
     - Enabled
     - Default — cinematic pacing
   * - ``reduced``
     - 0×
     - Disabled
     - System preference detected
   * - ``manual-low``
     - 0×
     - Disabled
     - User explicitly toggled off

Motion Token Reference
~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: css

   :root {
     --motion-duration-instant:    0ms;
     --motion-duration-fast:     150ms;
     --motion-duration-standard: 300ms;
     --motion-duration-slow:     500ms;
     --motion-duration-cinematic: 800ms;
   }

   @media (prefers-reduced-motion: reduce) {
     :root {
       --motion-duration-fast:     0ms;
       --motion-duration-standard: 0ms;
       --motion-duration-slow:     0ms;
       --motion-duration-cinematic: 0ms;
     }
   }

Release Gate Checks
-------------------

Before any version is deployed to production, all of the
following gates must pass:

.. list-table:: Deploy Readiness Checks
   :header-rows: 1
   :widths: 30 15 55

   * - Check
     - Required
     - Description
   * - Type check (``typecheck``)
     - Yes
     - Zero TypeScript errors across all packages
   * - Lint (``lint``)
     - Yes
     - Zero ESLint errors
   * - Content validation (``check:content``)
     - Yes
     - All content files match their declared schemas
   * - Accessibility audit
     - Yes
     - Zero critical axe-core violations on all routes
   * - Reduced-motion tests
     - Yes
     - All animated components verified in both motion modes
   * - Source boundaries
     - Yes
     - No cross-package boundary violations

Release Status Values
---------------------

``ready``
    All checks pass. Deployment is authorised.

``pending``
    Checks are running or awaiting human approval.

``blocked``
    One or more checks failed. Deployment is prohibited.

``draft``
    Release branch is not yet in a reviewable state.

.. note::

   Never bypass the release gate for hotfixes. Always run
   ``npm run quality`` and ``npm test`` before any deploy,
   including patches to production.

Accessibility Requirements
--------------------------

Every release must satisfy:

- Zero WCAG 2.1 AA critical violations (axe-core)
- Keyboard navigation across all interactive components
- Screen reader announcements for dynamic status changes
- Colour contrast ratio ≥ 4.5:1 for normal text
- Focus indicators visible at all times

Related Documents
-----------------

- ``CLAUDE.md`` — AI operating instructions
- ``docs/governance/`` — governance documentation
- ``packages/runtime/`` — shared runtime utilities
