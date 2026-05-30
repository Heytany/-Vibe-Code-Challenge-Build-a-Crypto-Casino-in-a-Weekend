# ADR-010: Iterations workflow (RU reports + commit)

**Status:** accepted  
**Date:** 2026-05-30

## Decision

Each iteration = one git commit + one Russian report in `iterations/` with infographics and resource footer (tokens, USD, PO time).

## Rationale

PO works in manual mode; Claude needs human-readable continuity beyond `ai/` technical docs.

## Enforcement

- `.cursor/rules/iterations-workflow.mdc` (alwaysApply)
- `ai/specs/iterations-workflow.md`
- Architect reminds PO to review report before commit
