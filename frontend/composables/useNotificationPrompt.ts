export const useNotificationPrompt = () => {
  const hasShownPrompt = ref(false);

  // Check if we should show the notification permission prompt
  const shouldShowPrompt = (): boolean => {
    if (!process.client || !('Notification' in window)) {
      return false;
    }

    // Don't show if already granted or denied
    if (Notification.permission !== 'default') {
      return false;
    }

    // Check if we've already shown the prompt in this session
    if (hasShownPrompt.value) {
      return false;
    }

    // Check if user dismissed it recently (within last 7 days)
    const dismissedAt = localStorage.getItem('notificationPromptDismissed');
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return false;
      }
    }

    return true;
  };

  // Show the prompt
  const showPrompt = async (): Promise<boolean> => {
    if (!shouldShowPrompt()) {
      return false;
    }

    hasShownPrompt.value = true;

    try {
      const result = await Notification.requestPermission();

      if (result === 'granted') {
        localStorage.setItem('browserNotificationsEnabled', 'true');
        return true;
      } else if (result === 'denied') {
        // User explicitly denied, don't ask again
        localStorage.setItem('notificationPromptDismissed', Date.now().toString());
      }

      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Dismiss the prompt (user clicked "Not now")
  const dismissPrompt = () => {
    hasShownPrompt.value = true;
    localStorage.setItem('notificationPromptDismissed', Date.now().toString());
  };

  return {
    shouldShowPrompt,
    showPrompt,
    dismissPrompt,
  };
};
