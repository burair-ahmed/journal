# Phase 1 — Reason Capture

## Summary
Sensitive admin actions now require a non-empty reason and persist it to `admin_audit_log` under `metadata.reason`.

## Affected Areas
- Single user actions: Suspend, Unsuspend, Delete
- Bulk actions: Suspend Selected, Delete Selected
- System Settings: All toggle/save operations

## UI Changes
- Dialogs prompt for a reason and block confirmation until provided:
  - User Detail Suspend, Unsuspend, Delete
  - Bulk Actions Toolbar dialog for suspend/delete
- System Settings page adds a “Change reason” input and disables toggles/saves without a reason.

## Hook Changes
- Mutations accept `{ reason }` and log to `admin_audit_log`:
  - `useSuspendUser`, `useUnsuspendUser`, `useDeleteUser`
  - `useBulkSuspendUsers`, `useBulkDeleteUsers`
  - `useUpdateSystemSetting`

## References
- `frontend/src/views/admin/UserDetail.tsx`
- `frontend/src/views/admin/UserDirectory.tsx`
- `frontend/src/components/admin/BulkActionsToolbar.tsx`
- `frontend/src/views/admin/SystemSettings.tsx`
- `frontend/src/hooks/useAdmin.ts`
