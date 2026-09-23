# Repository memory

- `MEMORY.md` is compact living context, not history: keep entries dense, merge or remove stale guidance, add at most three durable choices per shipped task, and defer to `AGENTS.md` on every conflict.
- FEATURE work is product-first: the analyst owns confidence-driven feature definition and may request high-level discovery evidence, while the planner owns repository-specific exploration questions, architecture, and implementation slicing only after definition approval.
- Runtime work identity uses stable feature-named `.ai/work/<work-id>.md` state independent of branch names; branch-named files remain legacy-readable, and multiple work items may coexist without weakening worktree or write-ownership isolation.
- Planned work keeps architecture decisions, a dependency-aware task graph, integration verification, and the commit plan in the canonical work file while coordinators give each worker only a minimal role-specific projection of that state.
- One focused commit remains the default, but the planner may define an ordered comprehensible commit series that the reviewer validates against the final diff and the Git-only shipper executes without inventing boundaries.
- Planning, implementation, and review treat code as ongoing liability: prefer the smallest maintainable surface that fully satisfies approved behavior, minimizing concepts and parallel paths rather than raw line count; approximately 500 human-authored lines in one source file or refactor trigger responsibility and reviewability assessment, never automatic rejection.
