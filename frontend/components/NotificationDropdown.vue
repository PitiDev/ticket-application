<template>
  <Menu as="div" class="relative">
    <MenuButton
      class="relative p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
    >
      <span class="sr-only">View notifications</span>
      <BellIcon class="h-6 w-6" />
      <span
        v-if="notificationStore.hasUnread"
        class="absolute top-1 right-1 bg-red-500 rounded-full h-5 w-5 flex items-center justify-center text-white text-xs font-bold animate-pulse"
      >
        {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
      </span>
    </MenuButton>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <MenuItems
        class="origin-top-right absolute right-0 mt-2 w-96 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 max-h-[32rem] overflow-hidden flex flex-col"
      >
        <!-- Header -->
        <div class="px-4 py-3 bg-gradient-to-r from-amber-50 to-red-50 border-b border-amber-100">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">Notifications</h3>
            <button
              v-if="notificationStore.hasUnread"
              @click="markAllAsRead"
              class="text-xs text-amber-600 hover:text-amber-700 font-medium"
            >
              Mark all as read
            </button>
          </div>
        </div>

        <!-- Notifications List -->
        <div class="overflow-y-auto flex-1 max-h-96">
          <div v-if="notificationStore.loading" class="p-8 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-200 border-t-amber-600"></div>
            <p class="mt-2 text-sm text-gray-500">Loading...</p>
          </div>

          <div v-else-if="notificationStore.notifications.length === 0" class="p-8 text-center">
            <BellIcon class="mx-auto h-12 w-12 text-gray-300" />
            <p class="mt-2 text-sm text-gray-500">No notifications</p>
          </div>

          <div v-else>
            <MenuItem
              v-for="notification in notificationStore.notifications"
              :key="notification.id"
              v-slot="{ active }"
            >
              <div
                @click="handleNotificationClick(notification)"
                :class="[
                  active ? 'bg-amber-50' : '',
                  !notification.is_read ? 'bg-blue-50' : 'bg-white',
                  'px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 hover:bg-amber-50',
                ]"
              >
                <div class="flex items-start gap-3">
                  <!-- Icon -->
                  <div
                    class="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
                    :class="getNotificationIconBg(notification.type)"
                  >
                    <component
                      :is="getNotificationIcon(notification.type)"
                      class="h-5 w-5"
                      :class="getNotificationIconColor(notification.type)"
                    />
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">
                      {{ notification.title }}
                    </p>
                    <p class="mt-1 text-sm text-gray-600 line-clamp-2">
                      {{ notification.message }}
                    </p>
                    <div class="mt-1 flex items-center gap-2">
                      <p class="text-xs text-gray-400">
                        {{ formatTimeAgo(notification.created_at) }}
                      </p>
                      <span
                        v-if="!notification.is_read"
                        class="inline-block h-2 w-2 rounded-full bg-blue-500"
                      ></span>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex-shrink-0 flex items-center gap-1">
                    <button
                      v-if="!notification.is_read"
                      @click.stop="markAsRead(notification.id)"
                      class="p-1 rounded hover:bg-amber-100 text-amber-600"
                      title="Mark as read"
                    >
                      <CheckIcon class="h-4 w-4" />
                    </button>
                    <button
                      @click.stop="deleteNotification(notification.id)"
                      class="p-1 rounded hover:bg-red-100 text-red-600"
                      title="Delete"
                    >
                      <XMarkIcon class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </MenuItem>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <NuxtLink
            to="/notifications"
            class="text-sm text-amber-600 hover:text-amber-700 font-medium text-center block hover:underline transition-all"
          >
            View all notifications →
          </NuxtLink>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script setup>
import { onMounted } from 'vue';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  TicketIcon,
  UserIcon,
  ExclamationCircleIcon,
} from '@heroicons/vue/24/outline';
import { useNotificationStore } from '~/stores/notifications';
import { useToast } from '~/composables/useToast';

const notificationStore = useNotificationStore();
const toast = useToast();
const router = useRouter();

const user = ref(null);

onMounted(() => {
  // Get user from localStorage
  const userData = localStorage.getItem('user');
  if (userData) {
    user.value = JSON.parse(userData);
    // Fetch notifications
    loadNotifications();
  }
});

const loadNotifications = async () => {
  if (!user.value?.id) return;

  try {
    await notificationStore.fetchNotifications(user.value.id);
    await notificationStore.fetchUnreadCount(user.value.id);
  } catch (error) {
    console.error('Error loading notifications:', error);
  }
};

const handleNotificationClick = async (notification) => {
  // Mark as read if unread
  if (!notification.is_read) {
    await markAsRead(notification.id);
  }

  // Navigate to ticket if ticket_id exists
  if (notification.ticket_id) {
    router.push(`/tickets/${notification.ticket_id}`);
  }
};

const markAsRead = async (notificationId) => {
  if (!user.value?.id) return;

  try {
    await notificationStore.markAsRead(notificationId, user.value.id);
  } catch (error) {
    toast.error('Failed to mark notification as read');
  }
};

const markAllAsRead = async () => {
  if (!user.value?.id) return;

  try {
    await notificationStore.markAllAsRead(user.value.id);
    toast.success('All notifications marked as read');
  } catch (error) {
    toast.error('Failed to mark all notifications as read');
  }
};

const deleteNotification = async (notificationId) => {
  if (!user.value?.id) return;

  try {
    await notificationStore.deleteNotification(notificationId, user.value.id);
    toast.success('Notification deleted');
  } catch (error) {
    toast.error('Failed to delete notification');
  }
};

const getNotificationIcon = (type) => {
  const iconMap = {
    ticket_assigned: TicketIcon,
    ticket_updated: ExclamationCircleIcon,
    ticket_commented: UserIcon,
  };
  return iconMap[type] || BellIcon;
};

const getNotificationIconBg = (type) => {
  const bgMap = {
    ticket_assigned: 'bg-amber-100',
    ticket_updated: 'bg-blue-100',
    ticket_commented: 'bg-green-100',
  };
  return bgMap[type] || 'bg-gray-100';
};

const getNotificationIconColor = (type) => {
  const colorMap = {
    ticket_assigned: 'text-amber-600',
    ticket_updated: 'text-blue-600',
    ticket_commented: 'text-green-600',
  };
  return colorMap[type] || 'text-gray-600';
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return then.toLocaleDateString();
};

// Expose refresh method for parent components
defineExpose({
  refresh: loadNotifications,
});
</script>
