# Phase 5 — Audit Log Viewer

## Summary
Built an admin-facing audit viewer with filters and CSV export to review all sensitive actions (`Who`, `What`, `When`, `Reason`, metadata).

## Features
- Filters: admin actor, action type, date range
- Table view with truncation for metadata
- CSV export of filtered results

## Affected Files
- `frontend/src/views/admin/AuditLog.tsx`
- `frontend/src/components/admin/AdminLayout.tsx`
- `frontend/src/App.tsx`
- `frontend/src/hooks/useAdmin.ts` (added `useAuditLog`)

## Notes
- Export uses `papaparse`
- Data joins admin identity via `users` on `admin_user_id`
- Reason displayed from `metadata.reason`

