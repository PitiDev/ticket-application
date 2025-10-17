<template>
  <div
    v-if="shouldShow"
    class="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4 shadow-lg transition-all duration-200"
  >
    <div class="flex items-start gap-4">
      <!-- Icon -->
      <div class="flex-shrink-0">
        <div class="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-md">
          <BellAlertIcon class="h-6 w-6 text-white" />
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Enable Desktop Notifications
        </h3>
        <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
          Get instant alerts when new tickets are assigned to you - even when you're on a different tab or window.
        </p>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <button
            @click="handleEnable"
            :disabled="loading"
            class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
            <BellIcon v-else class="h-4 w-4 mr-2" />
            Enable Notifications
          </button>

          <button
            @click="handleDismiss"
            class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition-all"
          >
            Not Now
          </button>

          <NuxtLink
            to="/notifications"
            class="text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline transition-colors"
          >
            Learn More →
          </NuxtLink>
        </div>
      </div>

      <!-- Close Button -->
      <button
        @click="handleDismiss"
        class="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  BellIcon,
  BellAlertIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline';
import { useToast } from '~/composables/useToast';

const toast = useToast();
const emit = defineEmits(['granted', 'dismissed']);

const shouldShow = ref(false);
const loading = ref(false);

onMounted(() => {
  if (process.client && 'Notification' in window) {
    // Check if on HTTPS or localhost
    const isSecure = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '[::1]';

    // Don't show banner on HTTP (not localhost)
    if (!isSecure && !isLocalhost) {
      shouldShow.value = false;
      return;
    }

    // Only show if permission is default (not granted or denied)
    if (Notification.permission === 'default') {
      // Check if user dismissed it recently
      const dismissedAt = localStorage.getItem('notificationPromptDismissed');
      if (dismissedAt) {
        const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed >= 7) {
          shouldShow.value = true;
        }
      } else {
        shouldShow.value = true;
      }
    }
  }
});

const handleEnable = async () => {
  loading.value = true;

  try {
    const result = await Notification.requestPermission();

    if (result === 'granted') {
      toast.success('Desktop notifications enabled!');
      localStorage.setItem('browserNotificationsEnabled', 'true');
      shouldShow.value = false;
      emit('granted');

      // Show a welcome notification
      setTimeout(() => {
        new Notification('🎫 Notifications Enabled', {
          body: 'You\'ll now receive desktop notifications for new ticket assignments!',
          icon: '/notification-icon.png',
        });
      }, 500);
    } else {
      toast.error('Notification permission denied');
      shouldShow.value = false;
      emit('dismissed');
    }
  } catch (error) {
    console.error('Error requesting permission:', error);
    toast.error('Failed to enable notifications');
  } finally {
    loading.value = false;
  }
};

const handleDismiss = () => {
  localStorage.setItem('notificationPromptDismissed', Date.now().toString());
  shouldShow.value = false;
  emit('dismissed');
};
</script>
