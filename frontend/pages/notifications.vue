<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 border-b border-amber-200 dark:border-gray-700 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex-1">
            <h1 class="text-3xl font-bold bg-gradient-to-r from-amber-600 to-red-600 dark:from-amber-400 dark:to-red-400 bg-clip-text text-transparent">
              Notifications
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-300">
              Stay updated with all your ticket assignments and updates
            </p>
          </div>
          <div class="flex items-center gap-3">
            <!-- Filter Dropdown -->
            <select
              v-model="filter"
              class="px-4 py-2 border-2 border-amber-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-medium"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>

            <!-- Mark All as Read Button -->
            <button
              v-if="notificationStore.hasUnread"
              @click="markAllAsRead"
              class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              <CheckCircleIcon class="h-5 w-5 mr-2" />
              Mark All as Read
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-amber-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow">
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0 p-3 bg-amber-100 dark:bg-amber-900 rounded-xl">
              <BellIcon class="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ totalCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-blue-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow">
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <ExclamationCircleIcon class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Unread</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ notificationStore.unreadCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-green-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow">
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0 p-3 bg-green-100 dark:bg-green-900 rounded-xl">
              <CheckCircleIcon class="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Read</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ readCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Browser Notification Settings -->
      <div class="mb-8">
        <NotificationSettings />
      </div>

      <!-- Notifications List -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-amber-100 dark:border-gray-700 overflow-hidden">
        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-16">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-200 dark:border-amber-800 border-t-amber-600 dark:border-t-amber-400"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-300">Loading notifications...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredNotifications.length === 0" class="text-center py-16">
          <div class="mx-auto h-24 w-24 rounded-full bg-gradient-to-r from-amber-100 to-red-100 dark:from-amber-900 dark:to-red-900 flex items-center justify-center mb-6">
            <BellIcon class="h-12 w-12 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No notifications found</h3>
          <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            {{ filter === 'unread' ? "You're all caught up! No unread notifications." : "You don't have any notifications yet." }}
          </p>
          <NuxtLink
            to="/tickets"
            class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 transition-all"
          >
            View Tickets
          </NuxtLink>
        </div>

        <!-- Notifications List -->
        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="notification in paginatedNotifications"
            :key="notification.id"
            @click="handleNotificationClick(notification)"
            :class="[
              !notification.is_read ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-amber-50',
              'p-6 cursor-pointer transition-all duration-200 transform hover:scale-[1.01]'
            ]"
          >
            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div
                class="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center"
                :class="getNotificationIconBg(notification.type)"
              >
                <component
                  :is="getNotificationIcon(notification.type)"
                  class="h-6 w-6"
                  :class="getNotificationIconColor(notification.type)"
                />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {{ notification.title }}
                    </h3>
                    <p class="text-gray-700 dark:text-gray-300 mb-2">{{ notification.message }}</p>

                    <!-- Metadata -->
                    <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span class="flex items-center gap-1">
                        <ClockIcon class="h-4 w-4" />
                        {{ formatDateTime(notification.created_at) }}
                      </span>
                      <span v-if="notification.ticket_number" class="flex items-center gap-1">
                        <TicketIcon class="h-4 w-4" />
                        {{ notification.ticket_number }}
                      </span>
                      <span
                        v-if="!notification.is_read"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        New
                      </span>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center gap-2">
                    <button
                      v-if="!notification.is_read"
                      @click.stop="markAsRead(notification.id)"
                      class="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400 transition-colors"
                      title="Mark as read"
                    >
                      <CheckIcon class="h-5 w-5" />
                    </button>
                    <button
                      @click.stop="deleteNotification(notification.id)"
                      class="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition-colors"
                      title="Delete notification"
                    >
                      <TrashIcon class="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div
          v-if="filteredNotifications.length > itemsPerPage"
          class="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700 dark:text-gray-300">
              Showing
              <span class="font-medium">{{ startItem }}</span>
              to
              <span class="font-medium">{{ endItem }}</span>
              of
              <span class="font-medium">{{ filteredNotifications.length }}</span>
              notifications
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                :class="[
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-amber-600 hover:bg-amber-50',
                  'px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium transition-colors'
                ]"
              >
                Previous
              </button>
              <div class="flex items-center gap-1">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="currentPage = page"
                  :class="[
                    currentPage === page
                      ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-amber-50',
                    'px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium transition-colors'
                  ]"
                >
                  {{ page }}
                </button>
              </div>
              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                :class="[
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-amber-600 hover:bg-amber-50',
                  'px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium transition-colors'
                ]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  BellIcon,
  CheckCircleIcon,
  CheckIcon,
  TrashIcon,
  ClockIcon,
  TicketIcon,
  ExclamationCircleIcon,
  UserIcon,
} from '@heroicons/vue/24/outline';
import { useNotificationStore } from '~/stores/notifications';
import { useToast } from '~/composables/useToast';

definePageMeta({
  middleware: ['auth']
});

const notificationStore = useNotificationStore();
const toast = useToast();
const router = useRouter();

const loading = ref(true);
const filter = ref('all');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const user = ref(null);

// Computed properties
const filteredNotifications = computed(() => {
  if (filter.value === 'unread') {
    return notificationStore.notifications.filter(n => !n.is_read);
  } else if (filter.value === 'read') {
    return notificationStore.notifications.filter(n => n.is_read);
  }
  return notificationStore.notifications;
});

const totalCount = computed(() => notificationStore.notifications.length);
const readCount = computed(() => notificationStore.notifications.filter(n => n.is_read).length);

const totalPages = computed(() => Math.ceil(filteredNotifications.value.length / itemsPerPage.value));

const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredNotifications.value.slice(start, end);
});

const startItem = computed(() => {
  if (filteredNotifications.value.length === 0) return 0;
  return (currentPage.value - 1) * itemsPerPage.value + 1;
});

const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage.value;
  return Math.min(end, filteredNotifications.value.length);
});

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// Methods
onMounted(async () => {
  const userData = localStorage.getItem('user');
  if (userData) {
    user.value = JSON.parse(userData);
    await loadNotifications();
  }
});

const loadNotifications = async () => {
  if (!user.value?.id) return;

  loading.value = true;
  try {
    await notificationStore.fetchNotifications(user.value.id, false);
    await notificationStore.fetchUnreadCount(user.value.id);
  } catch (error) {
    console.error('Error loading notifications:', error);
    toast.error('Failed to load notifications');
  } finally {
    loading.value = false;
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
    toast.success('Marked as read');
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

    // Adjust current page if needed
    if (paginatedNotifications.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
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

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Watch filter changes to reset pagination
watch(filter, () => {
  currentPage.value = 1;
});
</script>
