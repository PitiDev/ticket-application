// pages/tickets/[id].vue
<script setup>
import { ref, onMounted } from "vue";
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
} from "@heroicons/vue/24/outline";

import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

const route = useRoute();
const config = useRuntimeConfig();
const auth = useAuth();
const toast = useToast();

const ticket = ref(null);
const comments = ref([]);
const history = ref([]);
const loading = ref(true);
const newComment = ref("");
const submittingComment = ref(false);
const attachments = ref([]);

const showStatusDialog = ref(false);
const selectedStatus = ref(null);
const updatingStatus = ref(false);

// Status and priority colors (same as main page)
const statusColors = {
  New: "bg-blue-100 text-blue-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Resolved: "bg-green-100 text-green-800",
  Closed: "bg-gray-100 text-gray-800",
};

const priorityColors = {
  Low: "bg-gray-100 text-gray-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
  Critical: "bg-red-100 text-red-800",
};

const statuses = ref([
  { id: 1, name: "New" },
  { id: 2, name: "In Progress" },
  { id: 3, name: "Pending" },
  { id: 4, name: "Resolved" },
  { id: 5, name: "Closed" },
]);

async function fetchAttachments() {
  try {
    const { data, error } = await useFetch(
      `${config.public.apiBase}/attachments/ticket/${route.params.id}`,
      {
        headers: { Authorization: `Bearer ${auth.token}` },
      }
    );

    if (error.value) throw error.value;
    attachments.value = data.value || [];
  } catch (error) {
    console.error("Error fetching attachments:", error);
    toast.error("Failed to load attachments");
  }
}

// Add function to determine if file is an image
function isImageFile(fileType) {
  return ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(fileType);
}

// Add function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Add function to download file
async function downloadFile(attachmentId, fileName) {
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

// Fetch ticket details
async function fetchTicketDetails() {
  try {
    loading.value = true;
    const [ticketData, commentsData, historyData] = await Promise.all([
      useFetch(`${config.public.apiBase}/tickets/${route.params.id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      }),
      useFetch(`${config.public.apiBase}/tickets/${route.params.id}/comments`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      }),
      useFetch(`${config.public.apiBase}/tickets/${route.params.id}/history`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      }),
    ]);

    ticket.value = ticketData.data.value;
    comments.value = commentsData.data.value || [];
    history.value = historyData.data.value || [];
  } catch (error) {
    console.error("Error fetching ticket details:", error);
    toast.error("Failed to load ticket details");
  } finally {
    loading.value = false;
  }
}

// Function to update ticket status
async function updateTicketStatus() {
  if (!selectedStatus.value || updatingStatus.value) return;

  try {
    updatingStatus.value = true;
    const user = JSON.parse(localStorage.getItem("user")); // Get user from localStorage

    const { data, error } = await useFetch(
      `${config.public.apiBase}/tickets/${route.params.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          status_id: selectedStatus.value,
          user_id: user.id, // Add user_id to the request
        }),
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (error.value) {
      console.error("Update error:", error.value);
      throw error.value;
    }

    if (data.value) {
      ticket.value = data.value;
      showStatusDialog.value = false;
      toast.success("Ticket status updated successfully");
      await fetchTicketDetails();
    }
  } catch (error) {
    console.error("Error updating ticket status:", error);
    toast.error(error.message || "Failed to update ticket status");
  } finally {
    updatingStatus.value = false;
  }
}

// Initialize selected status when ticket loads
watch(
  () => ticket.value,
  (newTicket) => {
    if (newTicket) {
      selectedStatus.value = newTicket.status_id;
    }
  }
);

// Add comment
async function addComment() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!newComment.value.trim() || submittingComment.value) return;

  try {
    submittingComment.value = true;
    const { data, error } = await useFetch(
      `${config.public.apiBase}/tickets/${route.params.id}/comments`,
      {
        method: "POST",
        body: {
          content: newComment.value,
          is_private: false,
          created_by: user.id,
        },
        headers: { Authorization: `Bearer ${auth.token}` },
      }
    );

    if (error.value) throw error.value;

    if (data.value) {
      comments.value.unshift(data.value);
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

onMounted(() => {
  fetchTicketDetails();
  fetchAttachments();
});

</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Back button and breadcrumbs -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center space-x-2 text-sm">
        <NuxtLink to="/tickets" class="text-gray-500 hover:text-gray-700">
          Tickets
        </NuxtLink>
        <span class="text-gray-400">/</span>
        <span class="text-gray-900">{{ ticket?.ticket_number }}</span>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="flex justify-center py-12">
        <ArrowPathIcon class="w-8 h-8 animate-spin text-gray-500" />
      </div>

      <template v-else>
        <!-- Ticket Details -->
        <div class="grid grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="col-span-2 space-y-6">
            <!-- Header -->
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <h1 class="text-2xl font-bold text-gray-900">{{ ticket?.title }}</h1>
                <div class="flex items-center space-x-3">
                  <span
                    class="text-sm font-medium px-3 py-1 rounded-full"
                    :class="statusColors[ticket?.status_name]"
                  >
                    {{ ticket?.status_name }}
                  </span>
                  <span
                    class="text-sm font-medium px-3 py-1 rounded-full"
                    :class="priorityColors[ticket?.priority_name]"
                  >
                    {{ ticket?.priority_name }}
                  </span>

                  <button
                    @click="showStatusDialog = true"
                    class="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div class="prose max-w-none text-gray-700">
                {{ ticket?.description }}
              </div>
              <br />
              <hr />
              <br />
              <div v-if="attachments.length > 0">
                <h2 class="text-lg font-semibold text-gray-900 mb-6">Attachments</h2>
                <div class="space-y-4">
                  <div v-for="attachment in attachments" :key="attachment.id">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-2">
                        <a
                          :href="attachment.file_url"
                          target="_blank"
                          class="text-gray-500 hover:text-gray-700"
                        >
                          <PaperClipIcon class="h-4 w-4 text-gray-500" /> Click View
                          Attachment
                        </a>
                      </div>
                    </div>
                    <br />
                    <img
                      :src="attachment.file_url"
                      alt="Attachment"
                      class="text-gray-500 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div class="mt-6 flex items-center justify-between text-sm text-gray-500">
                <div class="flex items-center space-x-4">
                  <div class="flex items-center">
                    <UserIcon class="h-4 w-4 mr-1" />
                    Created by {{ ticket?.created_by_name }}
                  </div>
                  <div class="flex items-center">
                    <ClockIcon class="h-4 w-4 mr-1" />
                    {{ formatDate(ticket?.created_at) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Comments Section -->
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900 mb-6">Comments</h2>

              <!-- New Comment Form -->
              <div class="mb-6">
                <div class="mb-4">
                  <textarea
                    v-model="newComment"
                    rows="3"
                    class="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    placeholder="Add a comment..."
                  ></textarea>
                </div>
                <div class="flex justify-end">
                  <button
                    @click="addComment"
                    :disabled="submittingComment || !newComment.trim()"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
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
              <div class="space-y-6">
                <div
                  v-for="comment in comments"
                  :key="comment.id"
                  class="flex space-x-3 border-b border-gray-100 pb-6 last:border-0"
                >
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center space-x-2">
                        <span class="font-medium text-gray-900">{{
                          comment.user_name
                        }}</span>
                        <span class="text-gray-500">·</span>
                        <span class="text-gray-500">{{
                          formatRelativeTime(comment.created_at)
                        }}</span>
                      </div>
                    </div>
                    <div class="text-gray-700">{{ comment.content }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Details Card -->
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900 mb-6">Ticket Details</h2>

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
                  <span class="text-gray-500">Assigned To</span>
                  <span class="font-medium">{{ ticket?.assigned_to || "-" }}</span>
                </div>

                <div class="flex items-center justify-between" v-if="ticket?.due_date">
                  <span class="text-gray-500">Due Date</span>
                  <span class="font-medium">{{ formatDate(ticket.due_date) }}</span>
                </div>

                <div
                  class="flex items-center justify-between"
                  v-if="ticket?.parent_ticket_number"
                >
                  <span class="text-gray-500">Parent Ticket</span>
                  <NuxtLink
                    :to="`/tickets/${ticket.parent_ticket_id}`"
                    class="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    {{ ticket.parent_ticket_number }}
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Activity History -->
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900 mb-6">Activity History</h2>

              <div class="space-y-4">
                <div
                  v-for="(entry, index) in history"
                  :key="index"
                  class="flex items-start space-x-3"
                >
                  <div class="flex-1">
                    <div class="text-sm">
                      <span class="font-medium text-gray-900 mr-2">{{ entry.user_name }}</span>
                      <span class="text-gray-500"> {{ entry.action }} </span>
                      <span v-if="entry.field_name" class="text-gray-500">
                        {{ entry.field_name }} 
                        <template v-if="entry.old_value || entry.new_value">
                          from "{{ entry.old_value }}" to "{{ entry.new_value }}"
                        </template>
                      </span>
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ formatRelativeTime(entry.created_at) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Status Update Dialog -->
    <TransitionRoot appear :show="showStatusDialog" as="template">
      <Dialog as="div" class="relative z-10" @close="showStatusDialog = false">
        <TransitionChild
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              enter="ease-out duration-300"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Update Ticket Status
                </DialogTitle>

                <div class="mt-4 space-y-4">
                  <!-- Status Options -->
                  <div class="grid grid-cols-1 gap-3">
                    <div v-for="status in statuses" :key="status.id">
                      <button
                        :key="status.id"
                        @click="selectedStatus = status.id"
                        :class="[
                          'flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all duration-200',
                          selectedStatus === status.id
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-200',
                        ]"
                      >
                        <span class="font-medium" :class="statusColors[status.name]">
                          {{ status.name }}
                        </span>
                        <CheckIcon
                          v-if="selectedStatus === status.id"
                          class="h-5 w-5 text-indigo-600"
                        />
                      </button>
                    </div>
                  </div>

                  <!-- Dialog Actions -->
                  <div class="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      @click="showStatusDialog = false"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      class="inline-flex justify-center items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="!selectedStatus || updatingStatus"
                      @click="updateTicketStatus"
                    >
                      <ArrowPathIcon
                        v-if="updatingStatus"
                        class="animate-spin -ml-1 mr-2 h-4 w-4"
                      />
                      {{ updatingStatus ? "Updating..." : "Update Status" }}
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>
