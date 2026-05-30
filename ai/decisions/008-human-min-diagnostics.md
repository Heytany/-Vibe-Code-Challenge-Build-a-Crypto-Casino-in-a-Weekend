# ADR-008: Human-min diagnostics

**Status:** accepted | **Date:** 2026-05-30

## Decision

`.env.example` + zod schema + `pnpm test:env` + env-validation plugin + Playwright smoke.

Agents debug via env/tests before guessing UI bugs.
