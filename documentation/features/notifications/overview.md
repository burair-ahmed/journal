# Notification System Architecture

## Overview
The Notification System provides real-time and persistent notifications to users. It is built with a scalable backend service in FastAPI and a reactive frontend hook in React.

## Backend Architecture
**File:** `app/services/notification_service.py`

The backend uses a standard service pattern.
- **Service Class:** `NotificationService`
- **Database Model:** `Notification` (SQLAlchemy / Supabase)

### Key Methods
- `get_user_notifications(user_id, limit, offset)`: Fetches paginated notifications.
- `mark_as_read(notification_id)`: Updates status to read.
- `mark_all_as_read(user_id)`: Batch update.
- `create_notification(user_id, title, message, type)`: Generates new alerts.

### Database Schema (`notifications`)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key to Users |
| `title` | TEXT | Short header |
| `message` | TEXT | Body content |
| `type` | TEXT | 'info', 'success', 'warning', 'error' |
| `is_read` | BOOLEAN | Read status |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

## Frontend implementation
**File:** `frontend/src/hooks/useNotifications.ts`

The frontend uses `tanstack-query` for state management and polling/caching.

### `useNotifications` Hook
- **Fetching:** Automatically fetches unread count and latest notifications.
- **Mutations:** `markAsRead`, `markAllAsRead`.
- **UI Integration:** Designed to work with the `Sidebar` or `TopNavbar` bell icon.

## Future Enhancements (Planned)
- WebSocket integration for true real-time push.
- Email digest integration.
