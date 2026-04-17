## Factual mismatches against the actual repo

- playwright.config.ts at the repo root is not new. The repo already ships one, and e2e/ already exists as a directory. The §4.2 "New files" listing presents both as greenfield, which will confuse an executor. Reframe as "extended" vs "new" files, and say what the existing playwright.config.ts currently does and which keys you're changing.
- Same for the e2e/fixtures/ path — worth checking whether auth.ts already exists from prior work and, if so, whether this sub-branch reuses it or replaces it. The design implicitly assumes greenfield.

## Correctness gaps the design should close before plan execution

### Path scheme invalidation on mutation. 

selectedPath and expandedPaths use /states/<name>/transitions/<index>. When the user:

renames a state → all descendant paths under /states/<oldName> are stale
deletes transition 0 → transition 1 becomes 0, so every selectedPath/expandedPaths entry pointing at indices ≥ the deleted one shifts
deletes a processor → same problem one level down

The store actions (renameState, deleteTransition, deleteProcessor) need to rewrite selectedPath and expandedPaths atomically, or transitions/processors need client-only stable _uid fields stripped on save. The spec is silent on this; it's a guaranteed bug otherwise and the unit test plan in §4.1 doesn't catch it.

### Post-save navigation for /new is not specified. 
After a successful saveWorkflow, the URL is still /workflow/:entity/:version/new but the workflow now has a name and an identity. Do you redirect to /workflow/:entity/:version/:newName? If you don't, a browser refresh on that URL will re-scaffold an empty doc and the user has lost nothing but also has no way back to their saved workflow from this tab. The standard fix is a navigate(..., { replace: true }) in the save success branch. §3.8 should call this out and §4.2's create.spec.ts should assert it.

### Re-fetch / accept-pristine race in §3.8. 
The sequence is gateway.saveWorkflow → queryClient.invalidateQueries → acceptCurrentAsPristine(). But invalidateQueries is async; the re-fetch will later call hydrate(data) (or whatever the success handler is), which will overwrite both pristine and current. If the user edits during the invalidation window, those edits are wiped. Either (a) await the refetch, then hydrate once with server truth (skip acceptCurrentAsPristine in favor of fresh hydration), or (b) skip the refetch and trust your local copy + acceptCurrentAsPristine. Doing both is a race.

### Validator re-runs after failed save. 
§3.2 says errors are populated on Save attempt "and when current changes after a failed Save." Fine in principle, but §3.8's save flow only shows setErrors(validateWorkflowDoc(current)) at click time. Pick one and wire the subscription explicitly — right now two different parts of the spec disagree on when validation runs.

### QueryConditionEditor type switching silently destroys subtrees. 
Changing a group with five nested conditions to simple throws those five away. The test plan asserts "switching type clears node-specific fields," which is consistent with the data-loss behavior, but this is the kind of thing a user will do once by accident and then be angry about. Either confirm before destructive switches or preserve the subtree in-memory until save (so Ctrl-Z style recovery is possible when undo lands later). At minimum, call the decision out explicitly in §3.6.

## UX decisions worth reconsidering

### Rename doesn't cascade next or initialState refs. 
I'd accept the argument for next (refactor-by-hand is honest). But initialState is singular and almost never intentionally orphaned; rewriting it on state rename is probably the right default. The spec groups them, which feels like an over-application of the principle.

### value as plain string with no JSON coercion. 
This will silently send "123" when the backend JSON Path target is numeric, and the failure mode is a query that matches nothing rather than an error. If coercion really is out of scope for this sub-branch, put a small helper text under the input ("values are compared as strings — use a function condition for typed comparisons") and add it to §5 Risks. Right now §3.6 drops it in one sentence and moves on.

### AntD static message.error / message.success calls. 
AntD v5 emits a deprecation warning for static message API because it bypasses ConfigProvider. The design uses static calls throughout §3.8. Either switch to App.useApp()'s message or explicitly accept the warning in Risks.
OperatorType enum flat Select. The OpenAPI enum has string ops, numeric ops, and collection ops mixed. A flat Select is hard to scan. Consider optGroups, or at least note the decision.

### active: false on a fresh scaffold isn't possible — the scaffold sets active: true. 
But the design mentions handling MustHaveActiveWorkflowError on save. That error path is only reachable from an edit of an existing workflow, not from /new. Worth clarifying the error's trigger condition in §3.8 so the test case in §4.2 (there isn't one, incidentally) is well-defined.

## Missing specifics

### AntD <Tree virtual> requires a fixed height prop. 
Not specified; layout section should say how the tree consumes vertical space in the page shell.

### Error bubbling semantics for tree-node red dots. 
The design says "red dot on nodes whose path appears in validator output," but validator paths are more specific than tree nodes (e.g. /states/draft/transitions/0/next vs. tree node /states/draft/transitions/0). The rule should be spelled out: a tree node gets a dot iff some error's path has that node's path as a prefix. The unit test in §4.1 for WorkflowTree.test.tsx asserts on this — make the rule explicit so the test is unambiguous.

### modelRef = { modelVersion: Number(modelVersion) }. Number('abc') → NaN silently. 
Decide: 404 the route, or let the gateway error bubble. Either way, say so.

### Transition name uniqueness (rule 8) is validated per-state. 
Processor names: unique per transition? Per workflow? The design doesn't say. If the backend enforces uniqueness, the validator should too, or at minimum the gateway's error message should be surfaced verbatim (which the fallback already does — but worth making explicit).

### Dirty check via reference equality (current !== pristine). 
Immer produces new references on any change, including changes that are then reverted. So typing x then backspace leaves isDirty = true with structurally-identical state. Probably acceptable; note it.

## Testing gaps

- No test for the /new post-save redirect (because the redirect is unspecified — see above).
- No test that rename/delete don't corrupt selectedPath/expandedPaths (because the store action contract doesn't say they handle this — see above).
- The Playwright dirty-guard test covers sidebar click but not browser back button; useBlocker handles both, so asserting both is cheap.
- §4.1 lists a test for QueryConditionEditor "nested group with two simples round-trips through value/onChange" — good, but round-trips should also cover the type-switch data-loss behavior (assert it explicitly so a future change can't regress it silently).
- No perf check for the "hundreds of states" claim. A Vitest microbenchmark on validateWorkflowDoc against a 500-state fixture would take ten minutes to write and catch any O(n²) regression.

## Minor

- §3.1 file layout shows QueryConditionEditor.test.tsx co-located but not tests for nodes/*. Either colocate all or move all under __tests__/.
- §2's in-scope list mixes architectural items with tiny implementation details (scaffold doc contents). Consider moving the scaffold into §3.
- The reference to CLAUDE-MD-style guidance and "subagent-driven-development" in §6 reads like internal shorthand that's fine for you but opaque to any outside reviewer — worth a one-line gloss if this spec travels.

Nothing here blocks the approach. The architecture is sound; the gaps are mostly "decisions not yet written down" rather than "wrong decisions." I'd prioritize the path-invalidation bug (store actions must rewrite selection/expansion state) and the post-save navigation for /new before plan execution starts, because both are easy to bake in correctly up front and ugly to retrofit.