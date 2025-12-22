# Phase 6 — Overrides & Moderation

## Summary
Introduced admin-side hooks and audit logging for:
- Entitlement overrides (temporary boosts)
- Trade copier moderation (suspend master, close-all)

## Changes
- Hooks in `frontend/src/hooks/useAdmin.ts`:
  - `useGrantEntitlementOverride`: Upserts to `entitlement_overrides` when available, always logs audit with `reason`.
  - `useSuspendCopierMaster`: Logs suspend action and user activity with context.
  - `useCloseAllMasterTrades`: Logs close-all action for a master and user activity.
- RBAC enforced: admin or super-admin required.
- Reason capture enforced via hook arguments.

## Notes
- If `entitlement_overrides` table is absent, hooks fall back to audit-only logging.
- UI integration can be added to Admin User Detail or a Copier Admin page.

