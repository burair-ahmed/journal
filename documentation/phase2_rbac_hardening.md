# Phase 2 — RBAC Hardening

## Summary
Destructive and system-level operations are restricted to `super_admin`. UI reflects role-based visibility; hooks enforce permissions.

## Affected Areas
- User deletion visibility and execution
- Bulk deletion visibility and execution
- System Settings toggles and saves
- Role utilities for consistent checks

## UI Changes
- User Detail: Delete button shown only to `super_admin`.
- User Directory: “Delete Selected” hidden unless `super_admin`.
- System Settings: reason input and toggles disabled for non-`super_admin`.

## Hook Changes
- `useDeleteUser` and `useBulkDeleteUsers` verify `super_admin` before executing.
- `useUpdateSystemSetting` verifies `super_admin`.
- Added role utilities: `useCurrentRole`, `useHasRole`.

## References
- `frontend/src/views/admin/UserDetail.tsx`
- `frontend/src/views/admin/UserDirectory.tsx`
- `frontend/src/components/admin/BulkActionsToolbar.tsx`
- `frontend/src/views/admin/SystemSettings.tsx`
- `frontend/src/hooks/useAdmin.ts`
