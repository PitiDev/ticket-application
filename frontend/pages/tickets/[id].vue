<!-- pages/tickets/[id].vue -->
<script setup>
import { ref, onMounted, computed, watch } from "vue";
import {
  UserIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  PaperClipIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  TagIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  PencilIcon,
  CheckIcon,
  UserCircleIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  DocumentTextIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDoubleUpIcon,
  ChevronDoubleDownIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";

import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/vue";

// Use Nuxt's composables for routing and configuration
const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const auth = useAuth();
const toast = useToast();

// State management
const ticket = ref(null);
const comments = ref([]);
const history = ref([]);
const loading = ref(true);
const error = ref(null);
const newComment = ref("");
const submittingComment = ref(false);
const attachments = ref([]);
const users = ref([]);

// Dialog state
const showUpdateDialog = ref(false);
const selectedStatus = ref(null);
const selectedAssignee = ref(null);
const updatingTicket = ref(false);
const userQuery = ref('');

const currentUser = ref(null);
const showDeleteDialog = ref(false); // State for delete confirmation dialog
const deletingTicket = ref(false); // State for delete operation in progress

// Tab management
const activeTab = ref('comments');

// Status and priority colors with gold/red theme
const statusColors = {
  New: "bg-amber-100 text-amber-800 ring-amber-600/20",
  "In Progress": "bg-yellow-100 text-yellow-800 ring-yellow-600/20",
  "Pending": "bg-orange-100 text-orange-800 ring-orange-600/20",
  "Resolved": "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  "Closed": "bg-gray-100 text-gray-800 ring-gray-600/20",
};

const priorityBadgeColors = {
  Low: "bg-gray-100 text-gray-800",
  Medium: "bg-amber-100 text-amber-800",
  High: "bg-red-100 text-red-800",
  Critical: "bg-red-200 text-red-900 font-bold ring-2 ring-red-300",
};

const priorityTextColors = {
  Low: "text-gray-600",
  Medium: "text-amber-600",
  High: "text-red-600",
  Critical: "text-red-700 font-bold",
};

const statuses = ref([
  { id: 1, name: "New", icon: DocumentTextIcon, color: "text-amber-600" },
  { id: 2, name: "In Progress", icon: ArrowPathIcon, color: "text-yellow-600" },
  { id: 3, name: "Pending", icon: ClockIcon, color: "text-orange-600" },
  { id: 4, name: "Resolved", icon: CheckIcon, color: "text-emerald-600" },
  { id: 5, name: "Closed", icon: XMarkIcon, color: "text-gray-600" },
]);

const isTicketCreator = computed(() => {
  if (!ticket.value || !currentUser.value) return false;
  return ticket.value.created_by === currentUser.value.id;
});

const getCurrentUser = () => {
  if (process.client) {
    const userData = localStorage.getItem("user");
    if (userData) {
      currentUser.value = JSON.parse(userData);
    }
  }
};

// Computed property for filtered users
const filteredUsers = computed(() => {
  if (userQuery.value === '') {
    return users.value;
  }

  return users.value.filter(user => {
    const searchText = userQuery.value.toLowerCase();
    return (
      (user.full_name && user.full_name.toLowerCase().includes(searchText)) ||
      (user.username && user.username.toLowerCase().includes(searchText)) ||
      (user.email && user.email.toLowerCase().includes(searchText))
    );
  });
});

// Computed property for assignee name
const currentAssigneeName = computed(() => {
  if (!ticket.value || !ticket.value.assigned_to) return 'Not assigned';

  const assignee = users.value.find(u => u.id === ticket.value.assigned_to);
  return assignee ? (assignee.full_name || assignee.username) : 'Unknown';
});

// Check if we have a valid token
const hasValidToken = computed(() => {
  // Only run on client-side
  if (process.client) {
    const token = auth.getToken();
    return !!token;
  }
  return false;
});

// Watch for route changes to refresh data
watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    initData();
  }
});

// Watch for authentication status
watch(hasValidToken, (isValid) => {
  if (isValid && route.params.id) {
    initData();
  }
});

// Initialize data
function initData() {
  if (!hasValidToken.value) {
    // Redirect to login if no token
    router.push('/login');
    return;
  }

  loading.value = true;
  error.value = null;

  // Run these in parallel
  Promise.all([
    fetchUsers(),
    fetchTicketDetails(),
    fetchAttachments()
  ]).catch(err => {
    console.error("Error initializing data:", err);
    error.value = "Failed to load ticket data. Please try again.";
  }).finally(() => {
    loading.value = false;
  });
}

function openDeleteDialog() {
  if (!isTicketCreator.value) {
    toast.error("Only the ticket creator can delete this ticket");
    return;
  }
  showDeleteDialog.value = true;
}

// Fetch all users with better error handling
async function fetchUsers() {
  try {
    const token = auth.getToken();
    if (!token) throw new Error("No authentication token");

    const response = await $fetch(`${config.public.apiBase}/users`, {
      headers: { Authorization: `Bearer ${token}` },
      retry: 2, // Retry up to 2 times
    });

    users.value = response || [];
    return response;
  } catch (error) {
    console.error("Error fetching users:", error);
    toast.error("Failed to load users");
    throw error;
  }
}

// Fetch ticket details with improved error handling
async function fetchTicketDetails() {
  try {
    const token = auth.getToken();
    if (!token) throw new Error("No authentication token");

    // Fetch ticket data, comments, and history in parallel
    const [ticketData, commentsData, historyData] = await Promise.all([
      $fetch(`${config.public.apiBase}/tickets/${route.params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        retry: 2,
      }),
      $fetch(`${config.public.apiBase}/tickets/${route.params.id}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
        retry: 2,
      }),
      $fetch(`${config.public.apiBase}/tickets/${route.params.id}/history`, {
        headers: { Authorization: `Bearer ${token}` },
        retry: 2,
      }),
    ]);

    // Update reactive state
    ticket.value = ticketData;
    comments.value = commentsData || [];
    history.value = historyData || [];

    // Set form values for update dialog
    selectedStatus.value = ticket.value.status_id;
    selectedAssignee.value = ticket.value.assigned_to;

    return { ticket: ticketData, comments: commentsData, history: historyData };
  } catch (error) {
    console.error("Error fetching ticket details:", error);
    toast.error("Failed to load ticket details");
    throw error;
  }
}

// Fetch attachments with improved error handling
async function fetchAttachments() {
  try {
    const token = auth.getToken();
    if (!token) throw new Error("No authentication token");

    const response = await $fetch(
      `${config.public.apiBase}/attachments/ticket/${route.params.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        retry: 2,
      }
    );

    attachments.value = response || [];
    return response;
  } catch (error) {
    console.error("Error fetching attachments:", error);
    toast.error("Failed to load attachments");
    throw error;
  }
}

// Check if file is an image
function isImageFile(fileType) {
  return ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(fileType);
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Download file
function downloadFile(attachmentId, fileName) {
  if (process.client) {
    try {
      window.open(
        `${config.public.apiBase}/attachments/download/${attachmentId}`,
        "_blank"
      );
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  }
}

// Update ticket
async function updateTicket() {
  if (updatingTicket.value) return;

  try {
    updatingTicket.value = true;

    // Get current user from localStorage (client-side only)
    let userId = null;
    if (process.client) {
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      userId = user?.id;
    }

    if (!userId) {
      toast.error("User information not available");
      return;
    }

    const token = auth.getToken();
    if (!token) throw new Error("No authentication token");

    // Create update data
    const updateData = {
      status_id: selectedStatus.value,
      assigned_to: selectedAssignee.value,
      user_id: userId,
    };

    // Update ticket
    const response = await $fetch(
      `${config.public.apiBase}/tickets/${route.params.id}`,
      {
        method: "PUT",
        body: updateData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response) {
      ticket.value = response;
      showUpdateDialog.value = false;
      toast.success("Ticket updated successfully");

      // Refresh ticket data
      await fetchTicketDetails();
    }
  } catch (error) {
    console.error("Error updating ticket:", error);
    toast.error(error.message || "Failed to update ticket");
  } finally {
    updatingTicket.value = false;
  }
}

// Delete ticket function
async function deleteTicket() {
  if (deletingTicket.value) return;

  try {
    deletingTicket.value = true;

    if (!isTicketCreator.value) {
      toast.error("You do not have permission to delete this ticket");
      return;
    }

    const token = auth.getToken();
    if (!token) throw new Error("No authentication token");

    const response = await $fetch(
      `${config.public.apiBase}/tickets/${route.params.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    toast.success("Ticket deleted successfully");

    // Redirect to tickets list
    router.push('/tickets');
  } catch (error) {
    console.error("Error deleting ticket:", error);
    toast.error(error.message || "Failed to delete ticket");
  } finally {
    deletingTicket.value = false;
    showDeleteDialog.value = false;
  }
}

// Add comment
async function addComment() {
  if (!newComment.value.trim() || submittingComment.value) return;

  try {
    submittingComment.value = true;

    // Get current user (client-side only)
    let userId = null;
    if (process.client) {
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      userId = user?.id;
    }

    if (!userId) {
      toast.error("User information not available");
      return;
    }

    const token = auth.getToken();
    if (!token) throw new Error("No authentication token");

    // Add comment
    const response = await $fetch(
      `${config.public.apiBase}/tickets/${route.params.id}/comments`,
      {
        method: "POST",
        body: {
          content: newComment.value,
          is_private: false,
          created_by: userId,
        },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response) {
      comments.value.unshift(response);
      newComment.value = "";
      toast.success("Comment added successfully");
    }
  } catch (error) {
    console.error("Error adding comment:", error);
    toast.error("Failed to add comment");
  } finally {
    submittingComment.value = false;
  }
}

// Format date
function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Format relative time
function formatRelativeTime(date) {
  if (!date) return '';

  const now = new Date();
  const past = new Date(date);
  const diffTime = Math.abs(now - past);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMinutes = Math.ceil(diffTime / (1000 * 60));
      return `${diffMinutes} minutes ago`;
    }
    return `${diffHours} hours ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(date);
}

// Open update dialog
function openUpdateDialog() {
  if (ticket.value) {
    selectedStatus.value = ticket.value.status_id;
    selectedAssignee.value = ticket.value.assigned_to;
    showUpdateDialog.value = true;
  }
}

// Handle page load
onMounted(() => {
  // Only initialize if we're in client-side
  if (process.client) {
    getCurrentUser();
    // Initialize data if we have a valid token
    if (hasValidToken.value) {
      initData();
    } else {
      // Redirect to login if no token
      router.push('/login');
    }
  }
});
</script>

<template>
  <div class="min-h-screen to-red-50">
    <!-- Back button and breadcrumbs -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center space-x-2 text-sm">
        <NuxtLink to="/tickets" class="text-gray-600 hover:text-amber-700 transition-colors">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="w-4 h-4 mr-1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Tickets
          </div>
        </NuxtLink>
        <span class="text-gray-400">/</span>
        <span class="text-gray-900 font-medium">{{ ticket?.ticket_number }}</span>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="flex flex-col items-center">
          <ArrowPathIcon class="w-12 h-12 animate-spin text-amber-600" />
          <p class="mt-4 text-gray-600">Loading ticket details...</p>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="rounded-md bg-red-50 p-4 my-6 border border-red-200">
        <div class="flex">
          <div class="flex-shrink-0">
            <ExclamationCircleIcon class="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
            <div class="mt-2">
              <button @click="initData" class="text-sm font-medium text-red-800 hover:text-red-700">
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Ticket content -->
      <template v-else-if="ticket">
        <!-- Ticket Details -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Header -->
            <div class="bg-white rounded-xl shadow-lg p-6 border border-amber-200/50">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h1 class="text-2xl font-bold text-gray-900">{{ ticket?.title }}</h1>
                <div class="flex items-center space-x-2">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset"
                    :class="statusColors[ticket?.status_name]">
                    {{ ticket?.status_name }}
                  </span>
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    :class="priorityBadgeColors[ticket?.priority_name]">
                    {{ ticket?.priority_name }}
                  </span>

                  <button @click="openUpdateDialog"
                    class="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors shadow-sm"
                    title="Update ticket">
                    <PencilIcon class="w-4 h-4" />
                  </button>



                </div>
              </div>

              <!-- Meta information -->
              <div class="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                <div class="flex items-center">
                  <UserIcon class="h-4 w-4 mr-1.5 text-amber-500" />
                  <span>Created by <span class="font-medium text-gray-800">{{ ticket?.created_by_name }}</span></span>
                </div>
                <div class="flex items-center">
                  <ClockIcon class="h-4 w-4 mr-1.5 text-amber-500" />
                  <span>{{ formatDate(ticket?.created_at) }}</span>
                </div>
                <div class="flex items-center">
                  <UserCircleIcon class="h-4 w-4 mr-1.5 text-amber-500" />
                  <span>Assigned to <span class="font-medium text-gray-800">{{ currentAssigneeName }}</span></span>
                </div>
                <div v-if="ticket?.due_date" class="flex items-center">
                  <CalendarIcon class="h-4 w-4 mr-1.5 text-red-500" />
                  <span>Due: <span class="font-medium text-red-700">{{ formatDate(ticket?.due_date) }}</span></span>
                </div>
              </div>

              <!-- Description -->
              <div class="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 mb-6 border border-amber-100">
                <h3 class="text-sm font-medium text-amber-700 mb-2">Description</h3>
                <div class="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                  {{ ticket?.description }}
                </div>
              </div>

              <!-- Category & Department -->
              <div class="flex flex-wrap gap-x-6 gap-y-3">
                <div class="flex items-center">
                  <TagIcon class="h-4 w-4 mr-1.5 text-amber-500" />
                  <span class="text-sm text-gray-600">Category: <span class="font-medium text-gray-800">{{
                    ticket?.category_name
                      }}</span></span>
                </div>
                <div class="flex items-center">
                  <BuildingOfficeIcon class="h-4 w-4 mr-1.5 text-amber-500" />
                  <span class="text-sm text-gray-600">Department: <span class="font-medium text-gray-800">{{
                    ticket?.department_name
                      }}</span></span>
                </div>
              </div>
            </div>

            <!-- Tabs for Comments, History, and Files -->
            <div class="bg-white rounded-xl shadow-lg border border-amber-200/50 overflow-hidden">
              <!-- Tab headers -->
              <div class="flex border-b border-amber-100">
                <button @click="activeTab = 'comments'"
                  class="flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors"
                  :class="activeTab === 'comments' ? 'text-amber-700 border-amber-600 bg-amber-50' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-amber-200'">
                  <ChatBubbleLeftIcon class="h-4 w-4 mr-2" />
                  Comments ({{ comments.length }})
                </button>

                <button @click="activeTab = 'history'"
                  class="flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors"
                  :class="activeTab === 'history' ? 'text-amber-700 border-amber-600 bg-amber-50' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-amber-200'">
                  <ClockIcon class="h-4 w-4 mr-2" />
                  History ({{ history.length }})
                </button>

                <button @click="activeTab = 'files'"
                  class="flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors"
                  :class="activeTab === 'files' ? 'text-amber-700 border-amber-600 bg-amber-50' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-amber-200'">
                  <PaperClipIcon class="h-4 w-4 mr-2" />
                  Files ({{ attachments.length }})
                </button>
              </div>

              <!-- Tab content -->
              <div class="p-6">
                <!-- Comments Tab -->
                <div v-if="activeTab === 'comments'">
                  <!-- New Comment Form -->
                  <div class="mb-6">
                    <div class="mb-3">
                      <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">Add a comment</label>
                      <textarea id="comment" v-model="newComment" rows="3"
                        class="block w-full rounded-lg border border-amber-200 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
                        placeholder="Type your comment here..."></textarea>
                    </div>
                    <div class="flex justify-end">
                      <button @click="addComment" :disabled="submittingComment || !newComment.trim()"
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                        <template v-if="submittingComment">
                          <ArrowPathIcon class="animate-spin h-4 w-4 mr-2" />
                          Posting...
                        </template>
                        <template v-else>
                          <ChatBubbleLeftIcon class="h-4 w-4 mr-2" />
                          Post Comment
                        </template>
                      </button>
                    </div>
                  </div>

                  <!-- Comments List -->
                  <div v-if="comments.length === 0" class="text-center py-8">
                    <ChatBubbleOvalLeftEllipsisIcon class="h-12 w-12 mx-auto text-amber-300" />
                    <h3 class="mt-2 text-sm font-medium text-gray-900">No comments</h3>
                    <p class="mt-1 text-sm text-gray-500">Be the first to comment on this ticket.</p>
                  </div>

                  <div v-else class="space-y-6">
                    <div v-for="comment in comments" :key="comment.id"
                      class="flex space-x-3 border-b border-amber-100 pb-6 last:border-0 last:pb-0">
                      <div class="flex-shrink-0">
                        <div
                          class="h-10 w-10 rounded-full bg-gradient-to-r from-amber-200 to-red-200 flex items-center justify-center shadow-sm">
                          <span class="text-amber-800 font-medium">{{ comment.user_name ?
                            comment.user_name.charAt(0).toUpperCase() : '?'
                          }}</span>
                        </div>
                      </div>

                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-2">
                          <div class="flex items-center space-x-2">
                            <span class="font-medium text-gray-900">{{ comment.user_name }}</span>
                            <span class="text-amber-500">·</span>
                            <span class="text-gray-500">{{ formatRelativeTime(comment.created_at) }}</span>
                          </div>
                        </div>
                        <div class="text-gray-700 whitespace-pre-line">{{ comment.content }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- History Tab -->
                <div v-if="activeTab === 'history'">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Activity History</h3>

                  <div v-if="history.length === 0" class="text-center py-8">
                    <ClockIcon class="h-12 w-12 mx-auto text-amber-300" />
                    <h3 class="mt-2 text-sm font-medium text-gray-900">No history</h3>
                    <p class="mt-1 text-sm text-gray-500">This ticket has no activity history yet.</p>
                  </div>

                  <div v-else class="space-y-4">
                    <div v-for="(entry, index) in history" :key="index"
                      class="flex items-start space-x-3 pb-4 border-b border-amber-100 last:border-0 last:pb-0">
                      <div class="flex-shrink-0 mt-0.5">
                        <div
                          class="h-8 w-8 rounded-full bg-gradient-to-r from-amber-100 to-red-100 flex items-center justify-center">
                          <span class="text-amber-700 font-medium text-xs">{{ entry.user_name ?
                            entry.user_name.charAt(0).toUpperCase() :
                            '?' }}</span>
                        </div>
                      </div>

                      <div class="flex-1">
                        <div class="text-sm">
                          <span class="font-medium text-gray-900 mr-2">{{ entry.user_name }}</span>
                          <span class="text-gray-700">{{ entry.action }}</span>
                          <span v-if="entry.field_name" class="text-gray-700">
                            {{ entry.field_name }}
                            <template v-if="entry.old_value || entry.new_value">
                              from <span class="font-medium">"{{ entry.old_value || 'none' }}"</span> to
                              <span class="font-medium">"{{ entry.new_value || 'none' }}"</span>
                            </template>
                          </span>
                        </div>
                        <div class="text-sm text-amber-600 mt-1">
                          {{ formatRelativeTime(entry.created_at) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Files Tab -->
                <div v-if="activeTab === 'files'">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Attachments</h3>

                  <div v-if="attachments.length === 0" class="text-center py-8">
                    <PaperClipIcon class="h-12 w-12 mx-auto text-amber-300" />
                    <h3 class="mt-2 text-sm font-medium text-gray-900">No attachments</h3>
                    <p class="mt-1 text-sm text-gray-500">There are no files attached to this ticket.</p>
                  </div>

                  <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div v-for="attachment in attachments" :key="attachment.id"
                      class="border border-amber-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <!-- Preview for images -->
                      <div v-if="isImageFile(attachment.file_type)"
                        class="aspect-video bg-gradient-to-br from-amber-50 to-red-50 flex items-center justify-center overflow-hidden">
                        <img :src="attachment.file_url" :alt="attachment.original_filename"
                          class="object-contain w-full h-full" />
                      </div>

                      <!-- Icon for non-images -->
                      <div v-else
                        class="aspect-video bg-gradient-to-br from-amber-50 to-red-50 flex items-center justify-center">
                        <DocumentTextIcon class="h-16 w-16 text-amber-400" />
                      </div>

                      <!-- File info -->
                      <div class="p-3 bg-white">
                        <p class="font-medium text-sm text-gray-900 truncate" :title="attachment.original_filename">
                          {{ attachment.original_filename }}
                        </p>
                        <div class="flex items-center justify-between mt-2">
                          <span class="text-xs text-gray-500">{{ formatFileSize(attachment.file_size) }}</span>

                          <a :href="attachment.file_url" target="_blank"
                            class="text-xs font-medium text-amber-700 hover:text-red-600 transition-colors">
                            View
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Quick Actions Card -->
            <div class="bg-white rounded-xl shadow-lg p-6 border border-amber-200/50">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>

              <div class="space-y-3">
                <button @click="openUpdateDialog"
                  class="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all">
                  <PencilIcon class="h-5 w-5 mr-2" />
                  Update Ticket
                </button>
              </div>
            </div>

            <!-- Details Card -->
            <div class="bg-white rounded-xl shadow-lg p-6 border border-amber-200/50">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Ticket Details</h2>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-gray-500">Ticket #</span>
                  <span class="font-medium">{{ ticket?.ticket_number }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-gray-500">Department</span>
                  <span class="font-medium">{{ ticket?.department_name }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-gray-500">Category</span>
                  <span class="font-medium">{{ ticket?.category_name }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-gray-500">Status</span>
                  <span class="font-medium px-2 py-0.5 rounded-full text-xs" :class="statusColors[ticket?.status_name]">
                    {{ ticket?.status_name }}
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-gray-500">Priority</span>
                  <span class="font-medium" :class="priorityTextColors[ticket?.priority_name]">
                    {{ ticket?.priority_name }}
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-gray-500">Assigned To</span>
                  <span class="font-medium">{{ currentAssigneeName }}</span>
                </div>

                <div class="flex items-center justify-between" v-if="ticket?.due_date">
                  <span class="text-gray-500">Due Date</span>
                  <span class="font-medium text-red-600">{{ formatDate(ticket.due_date) }}</span>
                </div>

                <div class="flex items-center justify-between" v-if="ticket?.parent_ticket_number">
                  <span class="text-gray-500">Parent Ticket</span>
                  <NuxtLink :to="`/tickets/${ticket.parent_ticket_id}`"
                    class="font-medium text-amber-600 hover:text-red-600 transition-colors">
                    {{ ticket.parent_ticket_number }}
                  </NuxtLink>
                </div>
              </div>
              <br>

              <!-- Delete button - only shown to ticket creator -->
              <button v-if="isTicketCreator" @click="openDeleteDialog"
                class="w-full flex items-center justify-center px-4 py-2.5 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all">
                <TrashIcon class="h-5 w-5 mr-2" />
                Delete Ticket
              </button>

            </div>
          </div>
        </div>
      </template>

      <!-- No ticket state -->
      <div v-else-if="!loading && !error"
        class="bg-white rounded-xl shadow-lg p-8 text-center border border-amber-200/50">
        <ExclamationCircleIcon class="h-12 w-12 mx-auto text-red-500" />
        <h3 class="mt-2 text-lg font-medium text-gray-900">Ticket not found</h3>
        <p class="mt-1 text-gray-500">The ticket you're looking for doesn't exist or you don't have permission to view
          it.</p>
        <div class="mt-6">
          <NuxtLink to="/tickets"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 transition-all">
            Return to tickets
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Update Ticket Dialog -->
    <TransitionRoot appear :show="showUpdateDialog" as="template">
      <Dialog as="div" class="relative z-10" @close="showUpdateDialog = false">
        <TransitionChild enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild enter="ease-out duration-300" enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100" leave="ease-in duration-200" leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95">
              <DialogPanel
                class="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all border border-amber-200">
                <DialogTitle as="h3" class="text-xl font-semibold leading-6 text-gray-900 mb-4">
                  Update Ticket
                </DialogTitle>

                <div class="mt-4 space-y-6">
                  <div class="grid grid-cols-2 gap-6">
                    <!-- Status Options -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <div class="grid grid-cols-1 gap-3">
                        <div v-for="status in statuses" :key="status.id">
                          <button type="button" @click="selectedStatus = status.id" :class="[
                            'flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all duration-200 w-full',
                            selectedStatus === status.id
                              ? 'border-amber-600 bg-amber-50'
                              : 'border-gray-200 hover:border-amber-200',
                          ]">
                            <div class="flex items-center">
                              <component :is="status.icon" class="h-5 w-5 mr-2" :class="status.color" />
                              <span class="font-medium text-gray-900">
                                {{ status.name }}
                              </span>
                            </div>
                            <CheckIcon v-if="selectedStatus === status.id" class="h-5 w-5 text-amber-600" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Assignee Selection -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Assign To
                      </label>
                      <Combobox v-model="selectedAssignee">
                        <div class="relative">
                          <div
                            class="relative w-full rounded-lg border-2 border-amber-200 hover:border-amber-300 shadow-sm">
                            <ComboboxInput
                              class="w-full rounded-lg border-0 bg-white py-2.5 pl-10 pr-10 text-sm focus:border-amber-500 focus:ring-amber-500"
                              :displayValue="(id) => users.find(user => user.id === id)?.full_name || users.find(user => user.id === id)?.username || 'Unassigned'"
                              placeholder="Search for a user..." @change="userQuery = $event.target.value" />
                            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <MagnifyingGlassIcon class="h-5 w-5 text-amber-400" />
                            </div>
                            <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                              <ChevronUpDownIcon class="h-5 w-5 text-amber-400" aria-hidden="true" />
                            </ComboboxButton>
                          </div>
                          <TransitionRoot leave="transition ease-in duration-100" leaveFrom="opacity-100"
                            leaveTo="opacity-0" @after-leave="userQuery = ''">
                            <ComboboxOptions
                              class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              <!-- Unassigned option -->
                              <ComboboxOption :value="null" v-slot="{ selected, active }" as="template">
                                <li class="relative cursor-default select-none py-2 pl-3 pr-9"
                                  :class="{ 'bg-amber-600 text-white': active, 'text-gray-900': !active }">
                                  <div class="flex items-center">
                                    <UserIcon class="h-5 w-5 text-gray-400 mr-3" :class="{ 'text-white': active }" />
                                    <span class="block truncate font-medium">
                                      Unassigned
                                    </span>
                                  </div>
                                  <span v-if="selected" class="absolute inset-y-0 right-0 flex items-center pr-4"
                                    :class="{ 'text-white': active, 'text-amber-600': !active }">
                                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                  </span>
                                </li>
                              </ComboboxOption>

                              <div v-if="filteredUsers.length === 0 && userQuery !== ''"
                                class="relative cursor-default select-none py-2 px-4 text-gray-700">
                                Nothing found.
                              </div>

                              <ComboboxOption v-for="user in filteredUsers" :key="user.id" :value="user.id"
                                v-slot="{ selected, active }" as="template">
                                <li class="relative cursor-default select-none py-2 pl-3 pr-9"
                                  :class="{ 'bg-amber-600 text-white': active, 'text-gray-900': !active }">
                                  <div class="flex items-center">
                                    <span
                                      class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 mr-3">
                                      <span class="text-sm font-medium leading-none text-amber-700"
                                        :class="{ 'text-white': active }">
                                        {{ user.full_name ? user.full_name.charAt(0).toUpperCase() :
                                          user.username.charAt(0).toUpperCase() }}
                                      </span>
                                    </span>
                                    <span class="block truncate"
                                      :class="{ 'font-medium': selected, 'font-normal': !selected }">
                                      {{ user.full_name || user.username }}
                                    </span>
                                    <span v-if="user.email" class="ml-2 truncate text-sm text-gray-500"
                                      :class="{ 'text-amber-200': active, 'text-gray-500': !active }">
                                      {{ user.email }}
                                    </span>
                                  </div>

                                  <span v-if="selected" class="absolute inset-y-0 right-0 flex items-center pr-4"
                                    :class="{ 'text-white': active, 'text-amber-600': !active }">
                                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                  </span>
                                </li>
                              </ComboboxOption>
                            </ComboboxOptions>
                          </TransitionRoot>
                        </div>
                      </Combobox>
                    </div>
                  </div>

                  <!-- Dialog Actions -->
                  <div class="mt-6 flex justify-end space-x-3">
                    <button type="button"
                      class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
                      @click="showUpdateDialog = false">
                      Cancel
                    </button>
                    <button type="button"
                      class="inline-flex justify-center items-center rounded-md border border-transparent bg-gradient-to-r from-amber-600 to-red-600 px-4 py-2 text-sm font-medium text-white hover:from-amber-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      :disabled="updatingTicket" @click="updateTicket">
                      <ArrowPathIcon v-if="updatingTicket" class="animate-spin -ml-1 mr-2 h-4 w-4" />
                      {{ updatingTicket ? "Updating..." : "Update Ticket" }}
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>


    <!-- Delete Confirmation Dialog -->
    <TransitionRoot appear :show="showDeleteDialog" as="template">
      <Dialog as="div" class="relative z-10" @close="showDeleteDialog = false">
        <TransitionChild enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild enter="ease-out duration-300" enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100" leave="ease-in duration-200" leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95">
              <DialogPanel
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-red-200">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                  <div class="flex items-center text-red-600">
                    <ExclamationCircleIcon class="h-6 w-6 mr-2" />
                    Delete Ticket
                  </div>
                </DialogTitle>

                <div class="mt-4">
                  <p class="text-sm text-gray-600">
                    Are you sure you want to delete ticket <span class="font-medium">{{ ticket?.ticket_number }}</span>?
                    This action cannot be undone.
                  </p>

                  <div class="bg-red-50 p-3 rounded-lg mt-3 border border-red-100">
                    <p class="text-sm text-red-700 font-medium">{{ ticket?.title }}</p>
                  </div>
                </div>

                <div class="mt-6 flex justify-end space-x-3">
                  <button type="button"
                    class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                    @click="showDeleteDialog = false">
                    Cancel
                  </button>
                  <button type="button"
                    class="inline-flex justify-center items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    :disabled="deletingTicket" @click="deleteTicket">
                    <ArrowPathIcon v-if="deletingTicket" class="animate-spin -ml-1 mr-2 h-4 w-4" />
                    {{ deletingTicket ? "Deleting..." : "Yes, Delete Ticket" }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>