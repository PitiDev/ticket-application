import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as any[],
    unreadCount: 0,
    loading: false,
  }),

  getters: {
    unreadNotifications: (state) => {
      return state.notifications.filter(n => !n.is_read);
    },
    hasUnread: (state) => {
      return state.unreadCount > 0;
    },
  },

  actions: {
    async fetchNotifications(userId: number, unreadOnly = false) {
      this.loading = true;
      const config = useRuntimeConfig();

      try {
        const { data, error } = await useFetch(
          `${config.public.apiBase}/notifications`,
          {
            params: { userId, unreadOnly, limit: 50 },
          }
        );

        if (error.value) throw error.value;
        this.notifications = data.value || [];
      } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchUnreadCount(userId: number) {
      const config = useRuntimeConfig();

      try {
        const { data, error } = await useFetch(
          `${config.public.apiBase}/notifications/unread-count`,
          {
            params: { userId },
          }
        );

        if (error.value) throw error.value;
        this.unreadCount = data.value?.count || 0;
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    },

    async markAsRead(notificationId: number, userId: number) {
      const config = useRuntimeConfig();

      try {
        await $fetch(
          `${config.public.apiBase}/notifications/${notificationId}/read`,
          {
            method: 'PUT',
            body: { userId },
          }
        );

        // Update local state
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.is_read = true;
          notification.read_at = new Date().toISOString();
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
    },

    async markAllAsRead(userId: number) {
      const config = useRuntimeConfig();

      try {
        await $fetch(
          `${config.public.apiBase}/notifications/mark-all-read`,
          {
            method: 'PUT',
            body: { userId },
          }
        );

        // Update local state
        this.notifications.forEach(n => {
          n.is_read = true;
          n.read_at = new Date().toISOString();
        });
        this.unreadCount = 0;
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }
    },

    async deleteNotification(notificationId: number, userId: number) {
      const config = useRuntimeConfig();

      try {
        await $fetch(
          `${config.public.apiBase}/notifications/${notificationId}`,
          {
            method: 'DELETE',
            body: { userId },
          }
        );

        // Remove from local state
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index > -1) {
          const notification = this.notifications[index];
          if (!notification.is_read) {
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
          this.notifications.splice(index, 1);
        }
      } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
      }
    },

    addNotification(notification: any) {
      // Add to beginning of array
      this.notifications.unshift(notification);

      // Increment unread count if notification is unread
      if (!notification.is_read) {
        this.unreadCount++;
      }
    },

    clearNotifications() {
      this.notifications = [];
      this.unreadCount = 0;
    },
  },
});
