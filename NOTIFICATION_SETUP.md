# Realtime Notification System - Setup Guide

This guide explains how to set up and use the new realtime notification system for ticket assignments.

## What Was Added

### Backend Changes

1. **Database Schema** (`database/notifications_schema.sql`)
   - New `notifications` table to store all notifications
   - Indexes for optimal query performance
   - Foreign keys to users and tickets tables

2. **Notification Controller** (`backend/src/controllers/notificationController.js`)
   - `getUserNotifications()` - Get user's notifications
   - `getUnreadCount()` - Get count of unread notifications
   - `markAsRead()` - Mark single notification as read
   - `markAllAsRead()` - Mark all user notifications as read
   - `createNotification()` - Helper to create new notifications
   - `deleteNotification()` - Delete a notification

3. **Notification Routes** (`backend/src/routes/notificationRoutes.js`)
   - `GET /api/notifications` - Get notifications
   - `GET /api/notifications/unread-count` - Get unread count
   - `PUT /api/notifications/:id/read` - Mark as read
   - `PUT /api/notifications/mark-all-read` - Mark all as read
   - `DELETE /api/notifications/:id` - Delete notification

4. **Socket.IO Integration** (`backend/src/socket/index.js`)
   - Enhanced to support user-specific rooms
   - Events: `joinUser`, `leaveUser`, `joinTicket`, `leaveTicket`
   - Realtime notification broadcasting

5. **Updated Ticket Controller** (`backend/src/controllers/ticketController.js`)
   - Creates notifications when tickets are assigned
   - Emits Socket.IO events to notify users in realtime
   - Integrated in: `createTicket()`, `updateTicket()`, `assignTicket()`

6. **Server Configuration** (`backend/server.js`)
   - Initialize Socket.IO server
   - Make Socket.IO available to all routes

### Frontend Changes

1. **Notification Store** (`frontend/stores/notifications.ts`)
   - Pinia store for managing notification state
   - Actions: `fetchNotifications`, `fetchUnreadCount`, `markAsRead`, `markAllAsRead`, `deleteNotification`
   - Computed properties for unread notifications

2. **Notification Dropdown Component** (`frontend/components/NotificationDropdown.vue`)
   - Beautiful dropdown UI with notifications list
   - Shows notification count badge
   - Mark as read, mark all as read, delete actions
   - Click notification to navigate to ticket
   - Time-ago formatting

3. **Socket.IO Plugin** (`frontend/plugins/socket.client.ts`)
   - Auto-connects when user is logged in
   - Joins user-specific room for notifications
   - Listens for `notification`, `ticketAssigned`, `ticketUpdated` events
   - Shows toast notifications for new notifications
   - Updates notification store in realtime

4. **Layout Update** (`frontend/layouts/default.vue`)
   - Replaced static bell icon with NotificationDropdown component
   - Integrated with Socket.IO for realtime updates

## Installation Steps

### 1. Database Setup

Run the SQL schema to create the notifications table:

```bash
mysql -u your_username -p your_database < database/notifications_schema.sql
```

Or manually execute the SQL in your database management tool.

### 2. Backend Dependencies

Socket.IO is already installed. No additional backend dependencies needed.

### 3. Frontend Dependencies

Socket.IO client has been installed:

```bash
cd frontend
npm install socket.io-client
```

### 4. Environment Configuration

Make sure your `.env` files are configured correctly:

**Backend** (`backend/.env`):
```env
PORT=9000
FRONTEND_URL=http://localhost:3000
# ... other settings
```

**Frontend** (`frontend/.env`):
```env
NUXT_PUBLIC_API_BASE=http://localhost:9000/api
```

### 5. Start the Servers

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## How It Works

### When a Ticket is Assigned:

1. **Backend Process:**
   - Ticket controller creates/updates ticket in database
   - Creates a notification record in `notifications` table
   - Emits Socket.IO event to user-specific room: `user-{userId}`
   - Sends email notification (existing functionality)

2. **Frontend Process:**
   - Socket.IO plugin receives the `notification` event
   - Adds notification to Pinia store
   - Shows toast notification to user
   - Updates notification badge count
   - User can click bell icon to see all notifications

### Notification Types:

- `ticket_assigned` - When a ticket is assigned to you
- `ticket_updated` - When ticket status/details change (can be extended)
- `ticket_commented` - When someone comments on your ticket (can be extended)

## API Endpoints

### Get Notifications
```
GET /api/notifications?userId={userId}&unreadOnly=true&limit=20
```

### Get Unread Count
```
GET /api/notifications/unread-count?userId={userId}
```

### Mark as Read
```
PUT /api/notifications/{id}/read
Body: { "userId": 123 }
```

### Mark All as Read
```
PUT /api/notifications/mark-all-read
Body: { "userId": 123 }
```

### Delete Notification
```
DELETE /api/notifications/{id}
Body: { "userId": 123 }
```

## Socket.IO Events

### Client to Server:
- `joinUser(userId)` - Join user's notification room
- `leaveUser(userId)` - Leave user's notification room
- `joinTicket(ticketId)` - Join ticket's room for updates
- `leaveTicket(ticketId)` - Leave ticket's room

### Server to Client:
- `notification` - New notification received
- `ticketAssigned` - Ticket assigned to you
- `ticketUpdated` - Ticket details updated

## Testing

### Test the Notification System:

1. **Login with two different users** in different browser windows
2. **Create a ticket** with User A
3. **Assign the ticket to User B**
4. **User B should:**
   - See notification badge update immediately
   - Receive a toast notification
   - See the notification in the dropdown
   - Receive an email (existing functionality)

### Check Logs:

**Backend Console:**
- Look for "Client connected" and "User X joined their notification room"
- Check for "Notification created" and "Socket event emitted"

**Frontend Console:**
- Look for "Socket.IO connected"
- Check for "Received notification" with notification data

## Troubleshooting

### Notifications Not Appearing:

1. **Check Socket.IO Connection:**
   - Open browser console
   - Look for "Socket.IO connected" message
   - If not connected, check FRONTEND_URL in backend .env

2. **Check Backend Logs:**
   - Ensure Socket.IO server is running
   - Look for connection and room join messages

3. **Check Database:**
   - Verify notifications table exists
   - Check if notifications are being created: `SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10`

4. **Check CORS:**
   - Ensure Socket.IO CORS is configured correctly in `backend/src/socket/index.js`

### Port Conflicts:

If backend is running on a different port, update:
- Backend `.env` PORT
- Frontend `.env` NUXT_PUBLIC_API_BASE

## Future Enhancements

Potential features to add:

1. **More Notification Types:**
   - Comment notifications
   - Status change notifications
   - Due date reminders
   - @mentions in comments

2. **Notification Preferences:**
   - User settings for which notifications to receive
   - Email vs push notification preferences

3. **Push Notifications:**
   - Browser push notifications using Web Push API
   - Mobile push notifications

4. **Notification History Page:**
   - Dedicated page to view all notifications
   - Search and filter capabilities

5. **Sound Preferences:**
   - Custom notification sounds
   - Sound on/off toggle

## Files Modified/Created

### Created:
- `database/notifications_schema.sql`
- `backend/src/controllers/notificationController.js`
- `backend/src/routes/notificationRoutes.js`
- `frontend/stores/notifications.ts`
- `frontend/components/NotificationDropdown.vue`
- `frontend/plugins/socket.client.ts`
- `NOTIFICATION_SETUP.md` (this file)

### Modified:
- `backend/server.js` - Added Socket.IO initialization
- `backend/src/socket/index.js` - Enhanced with user rooms
- `backend/src/routes/index.js` - Added notification routes
- `backend/src/controllers/ticketController.js` - Added notification creation
- `frontend/layouts/default.vue` - Integrated NotificationDropdown
- `backend/package.json` - Socket.IO dependency (already existed)
- `frontend/package.json` - Added socket.io-client

## Support

For issues or questions:
1. Check the console logs (backend and frontend)
2. Verify database schema is created
3. Test Socket.IO connection manually
4. Check CORS and environment variables

Happy coding!
