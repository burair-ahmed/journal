# Phase 4 — Revert & Restore

## Summary
Added reversible operations across admin controls:
- Soft delete for users with restore flow
- Blog post version tracking with revert and unpublish
- System settings change history with revert

## Changes
- Users
  - Soft delete via `users.deleted_at` instead of hard delete
  - Restore hook and UI on user detail
  - Fallback to permanent delete if column unavailable
  - Audit logs record `reason`, `deleted_at`, and operation type
- Blog
  - `useUpdatePost` records previous state to `admin_audit_log`
  - Revert mutation pulls last version and restores fields
  - Unpublish sets status to `draft` with audit entry
- Settings
  - `useUpdateSystemSetting` logs `before` and `after`
  - Revert mutation restores prior value from audit entries

## Affected Files
- `frontend/src/hooks/useAdmin.ts`
- `frontend/src/views/admin/UserDetail.tsx`
- `frontend/src/hooks/useBlog.ts`
- `frontend/src/views/admin/BlogList.tsx`
- `frontend/src/views/admin/SystemSettings.tsx`
- `frontend/src/views/admin/BlogEditor.tsx`

## Verification
- Updated users list excludes soft-deleted (`deleted_at IS NULL`)
- Revert and unpublish actions require reason and invalidate queries
- Settings UI shows “Revert” buttons next to controls

