# Admin Controls Implementation Plan

## Phase 1 — Reason Capture
- Require a non-empty reason for sensitive actions: Suspend, Unsuspend, Delete users, and System Settings changes.
- Add reason inputs to dialogs for single actions and bulk actions.
- Persist `Reason` in `admin_audit_log` via `metadata.reason` on all relevant mutations.
- Block confirmations until a reason is provided.

## Phase 2 — RBAC Hardening
- Enforce `super_admin` visibility and enablement for destructive/system actions (user delete, system settings).
- Add role helpers for fine-grained checks and apply across admin UI.

## Phase 3 — Bulk Unsuspend
- Add `useBulkUnsuspendUsers` and UI to unsuspend multiple users with required reason.
- Log each unsuspend action with reason in audit trail.

## Phase 4 — Revert/Restore
- Users: implement soft-delete with restore flow and audit.
- Blog posts: introduce versioning with revert and unpublish controls.
- System settings: record change history and provide revert UI with audit.

## Phase 5 — Audit Log Viewer
- Build `/admin/audit` with filters (actor, action, time) and CSV export.
- Display `Who`, `What`, `When`, `Reason`, and metadata.

## Phase 6 — Overrides & Moderation
- Entitlement overrides (temporary boosts) with audit.
- Trade copier moderation: suspend master and close-all actions with reason logging.

## Phase 7 — Tests & CI
- Unit tests for hooks and mutations.
- Integration tests for dialogs, RBAC visibility, and revert workflows.
- E2E tests for admin flows; ensure CI gates block on failures.
