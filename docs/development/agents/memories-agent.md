# Memories Child-Agent Intake

Status: planned child-agent intake
Source repository: `emirhankudun-ux/memories`
Canonical surface: `emirhankudun-ux/SEIS`
Rollback owner: `emirhankudun-ux`

## Purpose

`memories` is currently treated as a public non-SEIS source that must not stay
as a separate public-facing surface without an explicit decision. Its future
state should be one of:

- imported or snapshotted into SEIS as a verified source record
- represented by a SEIS child agent with clear scope and commands
- made private, archived, transferred, deleted, or explicitly retained only
  after maintainer confirmation

## Scope

The child agent should govern memory and knowledge-management workflows only
after the source has been reviewed for sensitive content, provenance, and
publication safety.

## Safety Gate

No GitHub visibility mutation is allowed from this manifest. Archive, private,
transfer, delete, or force-push actions require a dry-run plan, live GitHub
evidence, rollback owner confirmation, and explicit maintainer approval.
