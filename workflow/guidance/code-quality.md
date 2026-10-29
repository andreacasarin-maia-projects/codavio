## Code quality guidance

- Treat code as an ongoing liability. Minimize maintained concepts, states, interfaces, dependencies,
  and execution paths rather than raw line count. Add no speculative flexibility.
- Organize by reasons to change: cohesive responsibilities, explicit ownership and dependencies,
  deliberate dependency direction, and one authoritative home per policy. Hide volatile design
  decisions behind narrow interfaces. Favor local reasoning, visible side effects, straightforward
  control flow, precise names, and error semantics callers cannot accidentally ignore.
- Make abstractions remove concepts or change coupling. Avoid duplicated policy, premature
  generalization, global state, pass-through layers, and mode flags joining distinct behaviors.
  Cohesive modules are preferable to fragmented micro-files. Comments explain non-obvious intent.
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
