# Notifications Page Documentation

## Overview

The notifications page (`/notifications`) provides a comprehensive view of all user notifications with filtering, pagination, and management capabilities.

## Features

### 1. Statistics Dashboard
Three stats cards displaying:
- **Total Notifications**: Total count of all notifications
- **Unread**: Count of unread notifications (highlighted in blue)
- **Read**: Count of read notifications

### 2. Filtering
Filter dropdown with three options:
- **All Notifications**: Shows all notifications (read and unread)
- **Unread Only**: Shows only unread notifications
- **Read Only**: Shows only read notifications

### 3. Notification List
Each notification displays:
- **Icon**: Color-coded icon based on notification type
  - Amber/Gold: Ticket assigned
  - Blue: Ticket updated
  - Green: Ticket commented
- **Title**: Bold notification title
- **Message**: Detailed notification message
- **Metadata**:
  - Timestamp (formatted with date and time)
  - Ticket number (if applicable)
  - "New" badge for unread notifications
- **Actions**:
  - ✓ Mark as read (for unread notifications)
  - 🗑️ Delete notification

### 4. Pagination
- Shows 10 notifications per page (configurable)
- Page navigation with Previous/Next buttons
- Numbered page buttons (shows up to 5 visible pages)
- Display counter: "Showing X to Y of Z notifications"

### 5. Bulk Actions
- **Mark All as Read**: Button appears when there are unread notifications

### 6. Interactive Features
- Click on any notification to:
  - Mark it as read (if unread)
  - Navigate to the associated ticket
- Hover effects on notifications
- Smooth transitions and animations

## User Interface

### Color Scheme
- Primary: Amber/Gold gradient (#D97706 to #DC2626)
- Unread notifications: Light blue background (#DBEAFE)
- Read notifications: White background
- Hover states: Light amber (#FEF3C7)

### Responsive Design
- Works on desktop, tablet, and mobile
- Grid layout adjusts based on screen size
- Touch-friendly buttons and actions

## Page Sections

### Header Section
```
┌─────────────────────────────────────────────────────┐
│ Notifications                    [Filter] [Mark All]│
│ Stay updated with all your ticket assignments...    │
└─────────────────────────────────────────────────────┘
```

### Stats Section
```
┌──────────┬──────────┬──────────┐
│  Total   │  Unread  │   Read   │
│   25     │    8     │    17    │
└──────────┴──────────┴──────────┘
```

### Notifications List Section
```
┌─────────────────────────────────────────────────────┐
│ 🎫  New Ticket Assigned                        ✓ 🗑️│
│     You have been assigned to ticket TKT-2025-001   │
│     🕐 Dec 13, 2024, 10:30 AM  🎫 TKT-2025-001      │
├─────────────────────────────────────────────────────┤
│ 🎫  Ticket Assigned to You                     ✓ 🗑️│
│     You have been assigned to ticket TKT-2025-002   │
│     🕐 Dec 13, 2024, 09:15 AM  🎫 TKT-2025-002      │
└─────────────────────────────────────────────────────┘
```

### Pagination Section
```
┌─────────────────────────────────────────────────────┐
│ Showing 1 to 10 of 25 notifications                 │
│                      [◀] [1] [2] [3] [▶]            │
└─────────────────────────────────────────────────────┘
```

## Empty States

### No Notifications
When user has no notifications:
- Bell icon (large, centered)
- Message: "No notifications found"
- "View Tickets" button

### No Unread
When filtering by unread with no results:
- Bell icon
- Message: "You're all caught up! No unread notifications."
- "View Tickets" button

## Usage Guide

### Accessing the Page
1. Click the bell icon in the navbar
2. Click "View all notifications →" at the bottom of the dropdown
3. Or navigate directly to `/notifications`

### Managing Notifications

**Mark Single Notification as Read:**
1. Find the notification in the list
2. Click the checkmark (✓) button on the right

**Mark All as Read:**
1. Click "Mark All as Read" button in the header
2. Confirm in the toast notification

**Delete a Notification:**
1. Find the notification in the list
2. Click the trash (🗑️) button on the right
3. Confirm in the toast notification

**View Related Ticket:**
1. Click anywhere on the notification card
2. Will automatically navigate to the ticket page
3. Notification will be marked as read

**Filter Notifications:**
1. Use the dropdown in the header
2. Select: All / Unread Only / Read Only
3. List updates automatically

**Navigate Pages:**
1. Use Previous/Next buttons
2. Or click specific page numbers
3. Page state persists while filtering

## Technical Details

### Route
- Path: `/notifications`
- Middleware: `auth` (requires authentication)
- Component: `pages/notifications.vue`

### Store Integration
Uses the `useNotificationStore` Pinia store:
- `notifications` - Array of notification objects
- `unreadCount` - Number of unread notifications
- `loading` - Loading state

### API Calls
- **On Mount**: Fetches all notifications for the user
- **Mark as Read**: `PUT /api/notifications/:id/read`
- **Mark All as Read**: `PUT /api/notifications/mark-all-read`
- **Delete**: `DELETE /api/notifications/:id`

### Realtime Updates
Connected to Socket.IO:
- New notifications automatically appear in the list
- Unread count updates in realtime
- Badge on navbar updates automatically

## Notification Types

### ticket_assigned
- **Icon**: Ticket (Amber)
- **Title**: "New Ticket Assigned" or "Ticket Assigned to You"
- **Message**: "You have been assigned to ticket {ticket_number}: {title}"
- **Action**: Click to view ticket

### ticket_updated (Future)
- **Icon**: Exclamation Circle (Blue)
- **Title**: "Ticket Updated"
- **Message**: Details about what changed

### ticket_commented (Future)
- **Icon**: User (Green)
- **Title**: "New Comment"
- **Message**: Comment preview

## Performance Optimization

- **Pagination**: Only displays 10 items per page
- **Lazy Loading**: Could be implemented for very large lists
- **Computed Properties**: Efficient filtering without re-rendering
- **Local State**: Store maintains data to avoid unnecessary API calls

## Accessibility

- Keyboard navigation support
- Screen reader friendly labels
- ARIA attributes for interactive elements
- Focus states on all interactive elements
- Color contrast meets WCAG standards

## Future Enhancements

Potential improvements:
1. **Search Functionality**: Search notifications by title/message
2. **Date Range Filter**: Filter by date range
3. **Notification Types Filter**: Filter by type (assigned, updated, etc.)
4. **Bulk Selection**: Select multiple notifications to delete/mark as read
5. **Export**: Export notification history
6. **Keyboard Shortcuts**: Quick actions via keyboard
7. **Notification Preferences**: User settings for notification types
8. **Archive Feature**: Archive old notifications instead of deleting

## Screenshots Description

### Desktop View
- Full-width layout with three-column stats
- Spacious notification cards
- Visible pagination controls

### Tablet View
- Adjusted grid for stats (2 columns)
- Slightly narrower notification cards
- Optimized spacing

### Mobile View
- Single column layout
- Stacked stats cards
- Touch-optimized buttons
- Scrollable list

## Related Files

- `pages/notifications.vue` - Main page component
- `stores/notifications.ts` - Pinia store
- `components/NotificationDropdown.vue` - Navbar dropdown
- `plugins/socket.client.ts` - Socket.IO integration
- `backend/src/controllers/notificationController.js` - API controller

## Testing Checklist

- [ ] Notifications load on page mount
- [ ] Filtering works correctly (all/unread/read)
- [ ] Pagination works and updates correctly
- [ ] Mark as read updates the UI and database
- [ ] Mark all as read works correctly
- [ ] Delete removes notification from list
- [ ] Click notification navigates to ticket
- [ ] Stats cards show correct counts
- [ ] Responsive design works on all screen sizes
- [ ] Empty states display correctly
- [ ] Loading state displays correctly
- [ ] Toast notifications appear for actions
- [ ] Realtime updates work via Socket.IO

Enjoy your new notifications page! 🎉
