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

The user chose a dedicated archivist to centralize discovery and writing rather than injecting
ADR lifecycle procedures into every role. Other workers receive compact source-linked decision
briefs; ADR maintenance guidance loads only in documentation assignments. This adds a bounded
handoff when needed and keeps documentation ownership separate from decision authority.

## Reconsideration

Revisit if relevant records cannot be found reliably, maintenance loses important reasoning, or
historical audit needs justify an immutable convention. Material reversals need approval unless
already authorized; faithful compaction does not.
