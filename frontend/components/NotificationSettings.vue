<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-amber-100 dark:border-gray-700 p-6 transition-colors duration-200">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <BellIcon class="h-6 w-6 text-amber-600 dark:text-amber-400" />
          Browser Notifications
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Get desktop notifications for new ticket assignments
        </p>
      </div>
    </div>

    <!-- Browser Support Check -->
    <div v-if="!isSupported" class="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
      <div class="flex items-start gap-3">
        <ExclamationCircleIcon class="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 class="text-sm font-medium text-red-800 dark:text-red-300">Not Supported</h4>
          <p class="text-sm text-red-700 dark:text-red-400 mt-1">
            Your browser does not support push notifications. Please use a modern browser like Chrome, Firefox, or Edge.
          </p>
        </div>
      </div>
    </div>

    <!-- HTTP Warning (Local Network) -->
    <div v-else-if="isHttpWarning" class="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
      <div class="flex items-start gap-3">
        <InformationCircleIcon class="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 class="text-sm font-medium text-amber-800 dark:text-amber-300">Limited Support on HTTP</h4>
          <p class="text-sm text-amber-700 dark:text-amber-400 mt-1">
            Browser push notifications work best with HTTPS. You're currently on HTTP (local network).
            You'll still receive in-app notifications, toast messages, and sound alerts.
          </p>
          <div class="mt-3 text-xs text-amber-600 dark:text-amber-400">
            <p class="font-semibold mb-1">To enable full browser notifications:</p>
            <ul class="list-disc list-inside space-y-1 ml-2">
              <li>Access via <code class="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">http://localhost</code> if on same machine</li>
              <li>Or deploy with HTTPS in production</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Permission Status -->
    <div v-else class="space-y-4">
      <!-- Current Status -->
      <div class="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div class="flex items-center gap-3">
          <div
            :class="[
              'h-10 w-10 rounded-full flex items-center justify-center',
              permissionStatusConfig.bgColor
            ]"
          >
            <component :is="permissionStatusConfig.icon" :class="['h-5 w-5', permissionStatusConfig.color]" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ permissionStatusConfig.label }}
            </p>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ permissionStatusConfig.description }}
            </p>
          </div>
        </div>

        <!-- Toggle/Enable Button -->
        <button
          v-if="permission === 'default'"
          @click="handleEnableNotifications"
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
          Enable Notifications
        </button>

        <button
          v-else-if="permission === 'denied'"
          @click="showInstructions = !showInstructions"
          class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
        >
          <Cog6ToothIcon class="h-4 w-4 mr-2" />
          Instructions
        </button>

        <div v-else class="flex items-center gap-2">
          <CheckCircleIcon class="h-5 w-5 text-green-600 dark:text-green-400" />
          <span class="text-sm font-medium text-green-700 dark:text-green-400">Active</span>
        </div>
      </div>

      <!-- Instructions for re-enabling (if denied) -->
      <div v-if="showInstructions && permission === 'denied'" class="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
        <div class="flex items-start gap-3">
          <InformationCircleIcon class="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
              How to Enable Notifications Again
            </h4>
            <ol class="text-sm text-blue-700 dark:text-blue-400 space-y-2 list-decimal list-inside">
              <li>Click the lock icon <span class="inline-block mx-1">🔒</span> in your browser's address bar</li>
              <li>Find "Notifications" in the permissions list</li>
              <li>Change the setting from "Block" to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </div>

      <!-- Test Notification Button -->
      <div v-if="permission === 'granted'" class="pt-2">
        <button
          @click="sendTestNotification"
          :disabled="testLoading"
          class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 border border-amber-200 dark:border-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span v-if="testLoading" class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent mr-2"></span>
          <BellAlertIcon v-else class="h-4 w-4 mr-2" />
          Send Test Notification
        </button>
      </div>

      <!-- Additional Info -->
      <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-start gap-3 text-xs text-gray-600 dark:text-gray-400">
          <InformationCircleIcon class="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>
            You'll receive browser notifications even when this tab is in the background or minimized.
            Notifications will automatically appear on your desktop when you're assigned a new ticket.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  BellIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline';
import { useToast } from '~/composables/useToast';

const toast = useToast();

const isSupported = ref(false);
const permission = ref('default');
const loading = ref(false);
const testLoading = ref(false);
const showInstructions = ref(false);
const isHttpWarning = ref(false);

// Check browser support and current permission
onMounted(() => {
  if (process.client && 'Notification' in window) {
    isSupported.value = true;
    permission.value = Notification.permission;

    // Check if on HTTP (not localhost)
    const isHttp = window.location.protocol === 'http:';
    const isLocalhost = window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '[::1]';

    // Show warning if HTTP and not localhost
    if (isHttp && !isLocalhost) {
      isHttpWarning.value = true;
    }
  }
});

// Permission status configuration
const permissionStatusConfig = computed(() => {
  switch (permission.value) {
    case 'granted':
      return {
        label: 'Notifications Enabled',
        description: 'You will receive desktop notifications',
        icon: CheckCircleIcon,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
      };
    case 'denied':
      return {
        label: 'Notifications Blocked',
        description: 'Please allow notifications in browser settings',
        icon: XCircleIcon,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
      };
    default:
      return {
        label: 'Notifications Not Set',
        description: 'Click to enable desktop notifications',
        icon: ClockIcon,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-700',
      };
  }
});

// Request notification permission
const handleEnableNotifications = async () => {
  if (!isSupported.value) return;

  loading.value = true;

  try {
    const result = await Notification.requestPermission();
    permission.value = result;

    if (result === 'granted') {
      toast.success('Notifications enabled successfully!');

      // Save preference
      localStorage.setItem('browserNotificationsEnabled', 'true');

      // Show a welcome notification
      setTimeout(() => {
        sendTestNotification();
      }, 500);
    } else if (result === 'denied') {
      toast.error('Notification permission denied');
      showInstructions.value = true;
    }
  } catch (error) {
    console.error('Error requesting permission:', error);
    toast.error('Failed to request notification permission');
  } finally {
    loading.value = false;
  }
};

// Send test notification
const sendTestNotification = () => {
  if (permission.value !== 'granted') return;

  testLoading.value = true;

  try {
    const notification = new Notification('🎫 Test Notification', {
      body: 'This is how you\'ll be notified when a new ticket is assigned to you!',
      icon: '/notification-icon.png',
      badge: '/notification-badge.png',
      vibrate: [200, 100, 200],
      tag: 'test-notification',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    setTimeout(() => {
      notification.close();
    }, 5000);

    toast.success('Test notification sent!');
  } catch (error) {
    console.error('Error sending test notification:', error);
    toast.error('Failed to send test notification');
  } finally {
    testLoading.value = false;
  }
};
</script>
