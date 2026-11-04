## Code quality guidance

- Tie changes to a required outcome and observable completion criteria; routine work needs only
  a sentence. Treat code as an ongoing liability: minimize maintained concepts, states, interfaces,
  dependencies, and execution paths rather than raw line count.
- Before choosing an implementation, inspect relevant repository code, native platform or harness
  capabilities, and installed or pinned tools. Prefer supported configuration and direct use of
  existing capabilities, adding only necessary integration. Justify custom logic with a specific
  unmet requirement, documented limitation, or observed failure; performance objections need
  task-relevant evidence. Compare integration and maintenance costs, not just functionality.
- Organize by reasons to change: cohesive responsibilities, explicit ownership and dependencies,
  deliberate dependency direction, and one authoritative home per policy. Hide volatile design
  decisions behind narrow interfaces. Favor local reasoning, visible side effects, straightforward
  control flow, precise names, and error semantics callers cannot accidentally ignore.
- Add guards, fallbacks, compatibility paths, wrappers, or abstractions only for required behavior
  or concrete risks. Do not duplicate a tool's validation, lifecycle, or error handling without a
  specific gap. An additional check must catch a distinct failure, observe a meaningfully different
  state, or enable necessary recovery. Preserve supported contracts without inventing hypothetical
  consumers or environments. Avoid duplicated policy, speculative flexibility, global state,
  pass-through layers, and mode flags joining distinct behaviors. Favor cohesive modules over
  fragmented micro-files; comments explain non-obvious intent.
- Treat tests as maintained code: behavior-focused, deterministic, readable, and close to their owner.
- Use approximately 500 human-authored lines as a responsibility-review trigger, not a size gate.
  When a change creates, materially grows, or adds a concern to such a file, inspect its cohesion,
  coupling, and navigation. Split only when stable responsibility boundaries reduce cognitive load
  and change blast radius. Generated, vendored, or cohesive declarative code may justify exceptions.
- For refactors over that scale, automate the mechanical work where practical and separate it from
  semantic edits. Judge large diffs by conceptual risk and reviewability; deletions and trustworthy
  generated changes need not carry the same cost as handwritten logic.
- Apply this guidance within approved scope and to code the change materially worsens, without
  drive-by cleanup or replacing repository conventions.
