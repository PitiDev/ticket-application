export const useBrowserNotification = () => {
  const isSupported = ref(false);
  const permission = ref<NotificationPermission>('default');

  // Check if browser supports notifications
  onMounted(() => {
    if (process.client) {
      isSupported.value = 'Notification' in window;
      if (isSupported.value) {
        permission.value = Notification.permission;
      }
    }
  });

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported.value) {
      console.warn('Browser notifications are not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      permission.value = result;

      // Save preference to localStorage
      if (process.client) {
        localStorage.setItem('browserNotificationsEnabled', result === 'granted' ? 'true' : 'false');
      }

      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Show browser notification
  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported.value || permission.value !== 'granted') {
      console.warn('Cannot show notification: permission not granted');
      return null;
    }

    try {
      const defaultOptions: NotificationOptions = {
        icon: '/icon.png',
        badge: '/badge.png',
        vibrate: [200, 100, 200],
        requireInteraction: false,
        ...options,
      };

      const notification = new Notification(title, defaultOptions);

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  };

  // Show ticket notification
  const showTicketNotification = (ticketData: {
    title: string;
    message: string;
    ticketNumber?: string;
    ticketId?: number;
    type?: string;
  }) => {
    const { title, message, ticketNumber, ticketId, type } = ticketData;

    const notificationTitle = `🎫 ${title}`;
    const notificationBody = ticketNumber
      ? `${ticketNumber}\n${message}`
      : message;

    const notification = showNotification(notificationTitle, {
      body: notificationBody,
      tag: ticketId ? `ticket-${ticketId}` : undefined,
      icon: '/notification-icon.png',
      badge: '/notification-badge.png',
      data: {
        ticketId,
        ticketNumber,
        type,
        url: ticketId ? `/tickets/${ticketId}` : '/tickets',
      },
    });

    // Handle notification click
    if (notification) {
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();

        // Navigate to ticket if we have the data
        if (notification.data?.url) {
          window.location.href = notification.data.url;
        }

        notification.close();
      };
    }

    return notification;
  };

  // Check if notifications are enabled
  const isEnabled = computed(() => {
    return isSupported.value && permission.value === 'granted';
  });

  // Check if user has previously enabled notifications
  const checkSavedPreference = (): boolean => {
    if (process.client) {
      const saved = localStorage.getItem('browserNotificationsEnabled');
      return saved === 'true';
    }
    return false;
  };

  return {
    isSupported,
    permission,
    isEnabled,
    requestPermission,
    showNotification,
    showTicketNotification,
    checkSavedPreference,
  };
};
