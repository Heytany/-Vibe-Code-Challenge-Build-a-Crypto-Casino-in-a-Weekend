# Iterations workflow (mandatory)

**Human-readable reports:** [`iterations/`](../../iterations/) (Russian)  
**Cursor rule:** [`.cursor/rules/iterations-workflow.mdc`](../../.cursor/rules/iterations-workflow.mdc)

## Rule

One iteration = one git commit + one markdown report in `iterations/`.

## Agent checklist (end of iteration)

- [ ] Write `iterations/NN-*.md` (Russian, see template in `iterations/README.md`)
- [ ] Update `iterations/README.md` git table
- [ ] Update `ai/CONTEXT.md` (iteration number + status)
- [ ] Append `ai/DISCUSSION_LOG.md` if decisions changed
- [ ] Single commit: `feat: iteration N — summary`

## Architect reminder to PO

Before committing, Cursor must prompt PO to review the iteration report for consistency.

## Report footer metrics

| Field | Source |
|-------|--------|
| Tokens | Cursor → Settings → Usage (agent estimates if exact N/A) |
| USD | Cursor billing / usage dashboard |
| PO time | PO self-report; default note: manual mode, watching agent logs |
