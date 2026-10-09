# Living ADRs and documentation

Scope: durable project decisions, discovery, approval, and technical documentation.

## Decision

Store durable project decisions in living ADRs, using existing repository locations or
`.ai/adrs/` by default. Keep one stable file per significant decision or tightly related concern
and update it when an approved choice changes. Preserve relevant changing rationale without
appending a chronology; Git holds revision history. Load only task-relevant records.

## Context and rationale

The previous memory file compacted current choices, but combined unrelated concerns into one
context payload. The user chose recognizable ADR structure with mutable current content to
support changing decisions without a second historical log. Discover prior decisions in relevant
project documentation even before an ADR collection exists.

## Alternatives and consequences

An immutable ADR log preserves historical reasoning directly, but requires supersession chains.
A single memory file is simpler to load but couples unrelated context. Living ADRs permit focused
reads and require review to keep rationale and implementation aligned. Memory is a migration
source only. `AGENTS.md` remains instruction policy when present, not a project memory store.

The designer and analyst own reasoning, the coordinator routes existing approval, and the
archivist retrieves relevant documented choices and maintains approved files. The reviewer
checks consistency, and the shipper includes approved documentation. Keep
README, usage, and maintenance documentation useful to humans and AI; ADRs do not replace it.
Before final review, explicitly assess both documentation and ADR impact and record completed
required paths or a concrete reason each category needs no changes. Designed or analyzed work
uses an archivist assessment; an obvious direct-builder change may record no impact directly.
Missing assessment or an unfinished required record blocks final closeout. Ordinary implementation
details do not require ADRs, and documentation adds no separate approval gate.
The shared feature document supplies approved decisions, their rationale, and resolved edge
cases for this closeout. Extract significant project choices and constraints useful beyond the
feature; retain feature-specific task and delivery detail in the feature document. Do not invent
an ADR by copying a PRD or task plan wholesale.

The user chose a dedicated archivist to centralize discovery and writing rather than injecting
ADR lifecycle procedures into every role. Other workers receive compact source-linked decision
briefs; ADR maintenance guidance loads only in documentation assignments. This adds a bounded
handoff when needed and keeps documentation ownership separate from decision authority.

## Reconsideration

Revisit if relevant records cannot be found reliably, maintenance loses important reasoning, or
historical audit needs justify an immutable convention. Material reversals need approval unless
already authorized; faithful compaction does not.
