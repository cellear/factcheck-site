# .scrum/events.csv — schema

Append-only log of project state changes, one row per event. Exists so a demo animation can
replay the project's history; nothing reads it otherwise. The wizard referenced a
`DOC/event-log-schema.md` that does not exist in the kit, so the schema is defined here.

| Column | Meaning |
|---|---|
| `timestamp` | ISO 8601, UTC, e.g. `2026-08-25T00:00:00Z` |
| `event` | `project_created`, `sprint_created`, `story_created`, `story_state`, `sprint_accepted`, `sprint_rejected`, `fix_story_created`, `persona_hired` |
| `entity_type` | `project`, `sprint`, `story`, `persona` |
| `entity_id` | `factcheck-site`, `sprint-1`, `S1-2`, `nadia`, … |
| `from_state` | Previous state, or empty |
| `to_state` | New state (`backlog`, `in-progress`, `finished`, `accepted`, `rejected`), or empty |
| `actor` | Persona name |
| `source` | `wizard` or `manual` |
| `note` | Free text, optional |

Per-story sessions append `story_state` rows: `backlog→in-progress` at session start,
`in-progress→finished` at session end. Nadia appends `sprint_accepted` / `sprint_rejected`.
