# Phase 3 — Bulk Unsuspend

## Summary
Admins can unsuspend multiple users at once. A non-empty reason is required and persisted to `admin_audit_log` (`metadata.reason`).

## UI Changes
- Added “Unsuspend Selected” action in Bulk Actions Toolbar with reason prompt.
- Confirmation disabled until a reason is provided.

## Hook Changes
- Added `useBulkUnsuspendUsers` to set role back to `user` for selected IDs and audit log each action with `{ bulk: true, reason }`.

## References
- `frontend/src/components/admin/BulkActionsToolbar.tsx`
- `frontend/src/views/admin/UserDirectory.tsx`
- `frontend/src/hooks/useAdmin.ts`
