<script setup>
import { ref, onMounted, computed, watch } from "vue";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption
} from "@headlessui/vue";

import {
  PlusIcon,
  ArrowRightIcon,
  XMarkIcon,
  InboxIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  PaperClipIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  UserGroupIcon,
  FunnelIcon,
  ArrowPathIcon,
} from "@heroicons/vue/24/outline";

import { ChevronDownIcon } from '@heroicons/vue/24/solid';



const config = useRuntimeConfig();
const auth = useAuth();
const { user } = auth;

const tickets = ref([]);
const users = ref([]);
const loading = ref(true);
const showCreateModal = ref(false);
const formSubmitting = ref(false);
const searchQuery = ref("");
const selectedStatus = ref("all");
const selectedPriority = ref("all");
const selectedDepartment = ref("all");
const selectedFiles = ref([]);
const uploadProgress = ref(0);
const dragOver = ref(false);

// Reference data
const categories = ref([]);
const priorities = ref([]);
const departments = ref([]);
const existingTickets = ref([]);

// Pagination states
const pagination = ref({
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
});
const availableLimits = [5, 10, 20, 50];

const toast = useToast();

// Computed properties for pagination
const paginationRange = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.limit + 1;
  const end = Math.min(
    start + pagination.value.limit - 1,
    pagination.value.totalItems
  );
  return `${start}-${end} of ${pagination.value.totalItems}`;
});

const paginationPages = computed(() => {
  const total = pagination.value.totalPages;
  const current = pagination.value.page;

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '...', total];
  }

  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
});

// เพิ่มตัวแปรสำหรับการค้นหาผู้ใช้
const userQuery = ref('');
const filteredUsers = computed(() => {
  if (userQuery.value === '') {
    return users.value;
  }

  return users.value.filter(user => {
    const searchText = userQuery.value.toLowerCase();
    return (
      (user.full_name && user.full_name.toLowerCase().includes(searchText)) ||
      user.username.toLowerCase().includes(searchText) ||
      (user.email && user.email.toLowerCase().includes(searchText))
    );
  });
});

// Stats
const stats = computed(() => [
  {
    name: "Total Tickets",
    value: pagination.value.totalItems,
    icon: InboxIcon,
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
  },
  {
    name: "In Progress",
    value: tickets.value.filter((t) => t.status_name === "In Progress").length,
    icon: ClockIcon,
    color: "bg-amber-500",
    lightColor: "bg-amber-50",
  },
  {
    name: "Resolved",
    value: tickets.value.filter((t) => t.status_name === "Resolved").length,
    icon: CheckCircleIcon,
    color: "bg-green-500",
    lightColor: "bg-green-50",
  },
  {
    name: "High Priority",
    value: tickets.value.filter((t) => t.priority_name === "High").length,
    icon: ExclamationCircleIcon,
    color: "bg-red-500",
    lightColor: "bg-red-50",
  },
]);

const newTicket = ref({
  title: "",
  description: "",
  category_id: "",
  priority_id: "",
  department_id: "",
  due_date: "",
  is_private: false,
  parent_ticket_id: "",
  assigned_to: "",
});

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

// Pagination functions
const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page;
    fetchTickets();
    window.scrollTo(0, 0); // Scroll to top when changing page
  }
};

const nextPage = () => {
  if (pagination.value.hasNextPage) {
    goToPage(pagination.value.page + 1);
  }
};

const prevPage = () => {
  if (pagination.value.hasPrevPage) {
    goToPage(pagination.value.page - 1);
  }
};

const firstPage = () => {
  goToPage(1);
};

const lastPage = () => {
  goToPage(pagination.value.totalPages);
};

const changeLimit = (newLimit) => {
  pagination.value.limit = newLimit;
  pagination.value.page = 1; // Reset to first page when changing limit
  fetchTickets();
};

// File handling functions
function handleFileSelect(event) {
  const files = event.target.files;
  addFiles(files);
}

function handleDrop(event) {
  event.preventDefault();
  dragOver.value = false;
  const files = event.dataTransfer.files;
  addFiles(files);
}

function addFiles(files) {
  for (let file of files) {
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      toast.error(`File ${file.name} is too large. Maximum size is 10MB`);
      continue;
    }
    selectedFiles.value.push({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: formatFileSize(file.size),
      progress: 0,
    });
  }
}

function removeFile(fileId) {
  selectedFiles.value = selectedFiles.value.filter((f) => f.id !== fileId);
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// API functions
async function fetchReferenceData() {
  try {
    loading.value = true;

    // ใช้ $fetch แทน useFetch เมื่อ component mounted แล้ว
    const [categoriesData, prioritiesData, departmentsData, usersData] = await Promise.all([
      $fetch(`${config.public.apiBase}/categories`, {
        headers: {
          'Authorization': `Bearer ${auth.getToken()}`
        }
      }),
      $fetch(`${config.public.apiBase}/priorities`, {
        headers: {
          'Authorization': `Bearer ${auth.getToken()}`
        }
      }),
      $fetch(`${config.public.apiBase}/departments`, {
        headers: {
          'Authorization': `Bearer ${auth.getToken()}`
        }
      }),
      $fetch(`${config.public.apiBase}/users`, {
        headers: {
          'Authorization': `Bearer ${auth.getToken()}`
        }
      })
    ]);

    categories.value = categoriesData || [];
    priorities.value = prioritiesData || [];
    departments.value = departmentsData || [];
    users.value = usersData || [];

    // ใช้ $fetch เพื่อดึงข้อมูลตั๋วที่มีอยู่
    const ticketsResponse = await $fetch(`${config.public.apiBase}/tickets`, {
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`
      }
    });

    existingTickets.value = ticketsResponse.data || [];
  } catch (error) {
    console.error("Error fetching reference data:", error);
    toast.error("Failed to load form options");
  } finally {
    loading.value = false;
  }
}

// Fetch tickets with pagination and filters
async function fetchTickets() {
  try {
    loading.value = true;

    // สร้าง query parameters
    const params = new URLSearchParams();
    params.append('page', pagination.value.page);
    params.append('limit', pagination.value.limit);

    if (searchQuery.value) {
      params.append('search', searchQuery.value);
    }

    if (selectedStatus.value !== 'all') {
      params.append('status', selectedStatus.value);
    }

    if (selectedPriority.value !== 'all') {
      params.append('priority', selectedPriority.value);
    }

    if (selectedDepartment.value !== 'all') {
      params.append('department', selectedDepartment.value);
    }

    // ถ้าเป็น user ธรรมดาให้เห็นเฉพาะตั๋วของตัวเอง
    if (user?.role === 'user') {
      params.append('createdBy', user.id);
    }

    // ใช้ $fetch แทน useFetch
    const response = await $fetch(`${config.public.apiBase}/tickets?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`
      }
    });

    if (response) {
      tickets.value = response.data || [];
      pagination.value = response.pagination || {
        page: 1,
        limit: 10,
        totalItems: tickets.value.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      };
    }
  } catch (error) {
    console.error("Error fetching tickets:", error);
    toast.error("Failed to load tickets");
  } finally {
    loading.value = false;
  }
}

// Create ticket
async function handleSubmit() {
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  if (!user || formSubmitting.value) {
    toast.error("User information not available");
    return;
  }

  try {
    formSubmitting.value = true;

    // Format date to ISO string if present
    const ticketData = {
      ...newTicket.value,
      due_date: newTicket.value.due_date
        ? new Date(newTicket.value.due_date).toISOString()
        : null,
      created_by: user.id,
    };

    // First create the ticket using $fetch
    const ticketResponse = await $fetch(`${config.public.apiBase}/tickets`, {
      method: "POST",
      body: ticketData,
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`
      }
    });

    // Then upload files if any
    if (selectedFiles.value.length > 0 && ticketResponse?.id) {
      for (let fileObj of selectedFiles.value) {
        const formData = new FormData();
        formData.append("file", fileObj.file);
        formData.append("ticket_id", ticketResponse.id);
        formData.append("user_id", user.id);

        try {
          await $fetch(`${config.public.apiBase}/attachments/upload`, {
            method: "POST",
            body: formData,
            headers: {
              'Authorization': `Bearer ${auth.getToken()}`
            }
          });
        } catch (fileError) {
          toast.error(`Failed to upload ${fileObj.name}`);
          console.error("File upload error:", fileError);
        }
      }
    }

    showCreateModal.value = false;
    toast.success("Ticket created successfully");
    resetForm();
    await fetchTickets();
  } catch (error) {
    console.error("Error creating ticket:", error);
    toast.error(error.message || "Failed to create ticket");
  } finally {
    formSubmitting.value = false;
  }
}

function resetForm() {
  newTicket.value = {
    title: "",
    description: "",
    category_id: "",
    priority_id: "",
    department_id: "",
    due_date: "",
    is_private: false,
    parent_ticket_id: "",
    assigned_to: "",
  };
  selectedFiles.value = [];
  uploadProgress.value = 0;
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

// Function to refresh tickets
function refreshTickets() {
  fetchTickets();
  toast.success("Tickets refreshed!");
}

// เปลี่ยนจาก watching เป็น handleFilterChange function
function handleFilterChange() {
  pagination.value.page = 1; // Reset to first page
  fetchTickets();
}

// Navigation guard
definePageMeta({
  middleware: "auth",
});

// onMounted แบบปรับปรุงใหม่
onMounted(() => {
  fetchReferenceData();
  fetchTickets();
});

const isFormValid = computed(() => {
  return (
    newTicket.value.title &&
    newTicket.value.description &&
    newTicket.value.category_id &&
    newTicket.value.priority_id &&
    newTicket.value.department_id
  );
});
</script>

<template>
  <div class="min-h-screen">
    <!-- Top Header Bar -->
    <div class="sticky top-0 z-10 bg-white border-b border-gray-200 backdrop-blur-sm bg-white/80 rounded-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div class="flex h-16 items-center justify-between">
          <!-- Left side -->
          <div class="flex items-center">
            <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Help Desk
            </h1>
          </div>

          <!-- Search bar -->
          <div class="flex-1 max-w-2xl mx-8">
            <div class="relative">
              <MagnifyingGlassIcon class="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input type="text" v-model="searchQuery" @input="handleFilterChange"
                class="h-12 w-full rounded-full border-0 bg-gray-100 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                placeholder="Search tickets..." />
            </div>
          </div>

          <!-- Right side -->
          <div class="flex items-center space-x-4">
            <button @click="refreshTickets" class="text-gray-500 hover:text-indigo-600 transition-colors"
              title="Refresh tickets">
              <ArrowPathIcon class="h-6 w-6" />
            </button>

            <button @click="showCreateModal = true"
              class="inline-flex items-center px-4 py-2.5 rounded-full text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:shadow-indigo-500/50">
              <PlusIcon class="h-5 w-5 mr-1.5" />
              New Ticket
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div v-for="stat in stats" :key="stat.name"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
          <div class="flex items-center">
            <div :class="['rounded-xl p-3', stat.lightColor]">
              <component :is="stat.icon" :class="['h-6 w-6', stat.color.replace('bg-', 'text-')]" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">{{ stat.name }}</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stat.value }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <FunnelIcon class="h-5 w-5 text-gray-400" />
            <span class="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <div class="flex flex-wrap items-center gap-4">
            <select v-model="selectedStatus" @change="handleFilterChange"
              class="rounded-lg border-gray-200 text-sm focus:ring-indigo-500">
              <option value="all">All Status</option>
              <option>New</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>

            <select v-model="selectedPriority" @change="handleFilterChange"
              class="rounded-lg border-gray-200 text-sm focus:ring-indigo-500">
              <option value="all">All Priorities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <select v-model="selectedDepartment" @change="handleFilterChange"
              class="rounded-lg border-gray-200 text-sm focus:ring-indigo-500">
              <option value="all">All Departments</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.name">
                {{ dept.name }}
              </option>
            </select>
          </div>

          <div class="ml-auto flex items-center gap-2">
            <span class="text-sm text-gray-500">Show:</span>
            <select v-model="pagination.limit" @change="changeLimit(parseInt($event.target.value))"
              class="rounded-lg border-gray-200 text-sm focus:ring-indigo-500">
              <option v-for="limit in availableLimits" :key="limit" :value="limit">
                {{ limit }} items
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="flex flex-col items-center gap-3">
          <svg class="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p class="text-gray-600">Loading tickets...</p>
        </div>
      </div>

      <!-- No Results State -->
      <div v-else-if="tickets.length === 0"
        class="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
        <InboxIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-lg font-medium text-gray-900">No tickets found</h3>
        <p class="mt-1 text-sm text-gray-500">
          Try changing your search or filter criteria.
        </p>
        <div class="mt-6">
          <button @click="showCreateModal = true"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <PlusIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Create new ticket
          </button>
        </div>
      </div>

      <!-- Tickets Grid -->
      <div v-else>
        <!-- Enhanced Card Layout -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="ticket in tickets" :key="ticket.id"
            class="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden hover:scale-[1.02]">
            <!-- Ticket Header -->
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium text-gray-500">
                  {{ ticket.ticket_number }}
                </span>
                <div class="flex items-center space-x-2">
                  <span class="px-2.5 py-1 rounded-full text-xs font-medium" :class="statusColors[ticket.status_name]">
                    {{ ticket.status_name }}
                  </span>
                  <span class="px-2.5 py-1 rounded-full text-xs font-medium"
                    :class="priorityColors[ticket.priority_name]">
                    {{ ticket.priority_name }}
                  </span>
                </div>
              </div>

              <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                {{ ticket.title }}
              </h3>
              <p class="text-sm text-gray-600 line-clamp-2 mb-4">
                {{ ticket.description }}
              </p>

              <div class="flex items-center justify-between text-sm text-gray-500">
                <div class="flex items-center">
                  <UserGroupIcon class="h-4 w-4 mr-1.5" />
                  {{ ticket.department_name || 'General' }}
                </div>
                <div class="flex items-center">
                  <CalendarIcon class="h-4 w-4 mr-1.5" />
                  {{ formatDate(ticket.created_at) }}
                </div>
              </div>

              <!-- Assignee Badge -->
              <div v-if="ticket.assigned_to_name" class="mt-4 flex items-center gap-2">
                <div class="flex-shrink-0">
                  <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                    <span class="text-xs font-medium leading-none text-gray-700">
                      {{ ticket.assigned_to_name.charAt(0).toUpperCase() }}
                    </span>
                  </span>
                </div>
                <div class="text-sm text-gray-500">
                  Assigned to <span class="font-medium text-gray-900">{{ ticket.assigned_full_name ||
                    ticket.assigned_to_name }}</span>
                </div>
              </div>
            </div>

            <!-- Ticket Footer -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <NuxtLink :to="`/tickets/${ticket.id}`"
                class="flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 group-hover:text-indigo-700">
                View Details
                <ArrowRightIcon class="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Pagination Controls -->
        <div
          class="mt-8 flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-xl shadow-sm border border-gray-100">
          <div class="flex flex-1 justify-between sm:hidden">
            <button @click="prevPage" :disabled="!pagination.hasPrevPage" :class="[
              'relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium',
              pagination.hasPrevPage
                ? 'text-gray-700 hover:bg-gray-50 focus:z-10'
                : 'text-gray-300 cursor-not-allowed'
            ]">
              Previous
            </button>
            <button @click="nextPage" :disabled="!pagination.hasNextPage" :class="[
              'relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium',
              pagination.hasNextPage
                ? 'text-gray-700 hover:bg-gray-50 focus:z-10'
                : 'text-gray-300 cursor-not-allowed'
            ]">
              Next
            </button>
          </div>
          <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">{{ paginationRange }}</span> results
              </p>
            </div>
            <div>
              <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button @click="firstPage" :disabled="!pagination.hasPrevPage"
                  class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  :class="{ 'opacity-50 cursor-not-allowed': !pagination.hasPrevPage }">
                  <span class="sr-only">First page</span>
                  <ChevronDoubleLeftIcon class="h-5 w-5" aria-hidden="true" />
                </button>
                <button @click="prevPage" :disabled="!pagination.hasPrevPage"
                  class="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  :class="{ 'opacity-50 cursor-not-allowed': !pagination.hasPrevPage }">
                  <span class="sr-only">Previous</span>
                  <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
                </button>

                <!-- Page Numbers -->
                <template v-for="(page, index) in paginationPages" :key="index">
                  <span v-if="page === '...'"
                    class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                    ...
                  </span>
                  <button v-else @click="goToPage(page)" :class="[
                    'relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20',
                    page === pagination.page
                      ? 'bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                  ]">
                    {{ page }}
                  </button>
                </template>

                <button @click="nextPage" :disabled="!pagination.hasNextPage"
                  class="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  :class="{ 'opacity-50 cursor-not-allowed': !pagination.hasNextPage }">
                  <span class="sr-only">Next</span>
                  <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
                </button>
                <button @click="lastPage" :disabled="!pagination.hasNextPage"
                  class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  :class="{ 'opacity-50 cursor-not-allowed': !pagination.hasNextPage }">
                  <span class="sr-only">Last page</span>
                  <ChevronDoubleRightIcon class="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Ticket Modal (ส่วนนี้คงเดิม) -->
    <!-- Create Ticket Modal -->
    <TransitionRoot appear :show="showCreateModal" as="template">
      <Dialog as="div" class="relative z-10" @close="showCreateModal = false">
        <TransitionChild enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-gray-900/25 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full w-full items-center justify-center p-4 text-center">
            <TransitionChild enter="ease-out duration-300" enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100" leave="ease-in duration-200" leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95">
              <!-- Enhanced DialogPanel with complete ticket fields -->
              <DialogPanel
                class="w-full max-w-7xl transform overflow-hidden rounded-2xl bg-white p-10 text-left align-middle shadow-xl transition-all mx-4">
                <DialogTitle as="div" class="flex items-center justify-between mb-8">
                  <div>
                    <h3
                      class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                      Create New Ticket
                    </h3>
                    <p class="mt-2 text-lg text-gray-500">
                      Fill in the details for your support request
                    </p>
                  </div>
                  <button @click="showCreateModal = false"
                    class="text-gray-400 hover:text-red-500 focus:outline-none transition-colors duration-200">
                    <XMarkIcon class="h-8 w-8" />
                  </button>
                </DialogTitle>

                <form @submit.prevent="handleSubmit" class="space-y-8">
                  <div class="grid grid-cols-3 gap-8">
                    <!-- Left Column - Title & Description -->
                    <div class="col-span-2 space-y-8">
                      <!-- Title -->
                      <div>
                        <label for="title" class="block text-lg font-medium text-gray-700 mb-3">Title</label>
                        <div class="relative rounded-lg shadow-sm">
                          <input type="text" id="title" v-model="newTicket.title" required
                            class="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 hover:border-gray-400 transition-colors duration-200"
                            placeholder="Brief description of the issue" />
                        </div>
                      </div>

                      <!-- Description -->
                      <div>
                        <label for="description"
                          class="block text-lg font-medium text-gray-700 mb-3">Description</label>
                        <div class="relative rounded-lg shadow-sm">
                          <textarea id="description" v-model="newTicket.description" rows="12" required
                            class="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 hover:border-gray-400 transition-colors duration-200 resize-none"
                            placeholder="Detailed explanation of your issue"></textarea>
                        </div>
                      </div>

                      <!-- File Upload Section -->
                      <div class="mt-6">
                        <label class="block text-lg font-medium text-gray-700 mb-3">
                          Attachments
                        </label>

                        <!-- Drag & Drop Zone -->
                        <div @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false"
                          @drop.prevent="handleDrop" :class="[
                            'mt-2 flex justify-center rounded-lg border-2 border-dashed px-6 py-10',
                            dragOver
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-300 hover:border-indigo-400',
                          ]">
                          <div class="text-center">
                            <PaperClipIcon class="mx-auto h-12 w-12 text-gray-400" />
                            <div class="mt-4 flex text-sm leading-6 text-gray-600">
                              <label for="file-upload"
                                class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                                <span>Upload files</span>
                                <input id="file-upload" type="file" multiple class="sr-only"
                                  @change="handleFileSelect" />
                              </label>
                              <p class="pl-1">or drag and drop</p>
                            </div>
                            <p class="text-xs leading-5 text-gray-600">
                              Up to 10MB per file
                            </p>
                          </div>
                        </div>



                        <!-- File List -->
                        <div v-if="selectedFiles.length > 0" class="mt-4 space-y-2">
                          <div v-for="file in selectedFiles" :key="file.id"
                            class="flex items-center justify-between py-3 px-4 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                            <div class="flex items-center flex-1 min-w-0">
                              <PaperClipIcon class="h-5 w-5 flex-shrink-0 text-gray-400" />
                              <div class="ml-3 flex min-w-0 flex-1 gap-2">
                                <span class="truncate font-medium">{{ file.name }}</span>
                                <span class="flex-shrink-0 text-gray-500">{{ file.size }}</span>
                              </div>
                            </div>
                            <div class="ml-4 flex-shrink-0">
                              <button @click="removeFile(file.id)" type="button"
                                class="font-medium text-red-600 hover:text-red-500 transition-colors flex items-center">
                                <TrashIcon class="h-4 w-4 mr-1" />
                                Remove
                              </button>
                            </div>
                          </div>

                          <div class="mt-2 flex items-center justify-between text-sm text-gray-500">
                            <div>{{ selectedFiles.length }} {{ selectedFiles.length === 1 ? 'file' : 'files' }} selected
                            </div>
                            <button type="button" @click="selectedFiles = []"
                              class="text-indigo-600 hover:text-indigo-500 font-medium">
                              Clear all
                            </button>
                          </div>
                        </div>

                      </div>

                      <!-- Due Date and Privacy Settings -->
                      <div class="grid grid-cols-2 gap-6">
                        <!-- Due Date -->
                        <div>
                          <label for="dueDate" class="block text-lg font-medium text-gray-700 mb-3">Due Date</label>
                          <div class="relative rounded-lg shadow-sm">
                            <input type="datetime-local" id="dueDate" v-model="newTicket.due_date"
                              class="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 hover:border-gray-400 transition-colors duration-200" />
                          </div>
                        </div>

                        <!-- Privacy Toggle -->
                        <div class="flex items-center mt-8">
                          <div class="relative rounded-lg shadow-sm">
                            <label class="inline-flex items-center cursor-pointer">
                              <input type="checkbox" v-model="newTicket.is_private" class="sr-only peer" />
                              <div
                                class="relative w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600">
                              </div>
                              <span class="ml-3 text-lg font-medium text-gray-700">Private Ticket</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <!-- Parent Ticket Reference -->
                      <div>
                        <label for="parentTicket" class="block text-lg font-medium text-gray-700 mb-3">Parent Ticket
                          (Optional)</label>
                        <div class="relative rounded-lg shadow-sm">
                          <select id="parentTicket" v-model="newTicket.parent_ticket_id"
                            class="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 hover:border-gray-400 transition-colors duration-200">
                            <option value="">No parent ticket</option>
                            <option v-for="ticket in existingTickets" :key="ticket.id" :value="ticket.id">
                              {{ ticket.ticket_number }} - {{ ticket.title }}
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <!-- Right Column -->
                    <div class="space-y-8">
                      <!-- Priority Selection -->
                      <div>
                        <label class="block text-lg font-medium text-gray-700 mb-4">Priority Level</label>
                        <div class="space-y-4">
                          <button type="button" @click="newTicket.priority_id = priority.id"
                            v-for="priority in priorities" :key="priority.id" :class="[
                              'relative flex items-center w-full p-6 rounded-xl border-2 transition-all duration-200',
                              newTicket.priority_id === priority.id
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50',
                            ]">
                            <!-- Priority Icon -->
                            <div class="w-16 h-16 rounded-full flex items-center justify-center" :class="{
                              'bg-red-100': priority.name === 'High',
                              'bg-yellow-100': priority.name === 'Medium',
                              'bg-gray-100': priority.name === 'Low',
                            }">
                              <ExclamationCircleIcon v-if="priority.name === 'High'" class="h-10 w-10 text-red-600" />
                              <ClockIcon v-if="priority.name === 'Medium'" class="h-10 w-10 text-yellow-600" />
                              <InboxIcon v-if="priority.name === 'Low'" class="h-10 w-10 text-gray-600" />
                            </div>

                            <!-- Priority Details -->
                            <div class="ml-4 flex-1">
                              <span class="block text-xl font-medium" :class="{
                                'text-red-700': priority.name === 'High',
                                'text-yellow-700': priority.name === 'Medium',
                                'text-gray-700': priority.name === 'Low',
                              }">
                                {{ priority.name }}
                              </span>
                              <span class="text-base text-gray-500 mt-1 block">
                                {{ priority.description }}
                              </span>
                            </div>

                            <div v-if="newTicket.priority_id === priority.id"
                              class="absolute -top-2 -right-2 bg-indigo-600 rounded-full p-1.5">
                              <CheckCircleIcon class="h-6 w-6 text-white" />
                            </div>
                          </button>
                        </div>
                      </div>

                      <!-- Category -->
                      <div>
                        <label for="category" class="block text-lg font-medium text-gray-700 mb-3">Category</label>
                        <div class="relative rounded-lg shadow-sm">
                          <select id="category" v-model="newTicket.category_id" required
                            class="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 hover:border-gray-400 transition-colors duration-200 appearance-none">
                            <option value="">Select a category</option>
                            <option v-for="category in categories" :key="category.id" :value="category.id">
                              {{ category.name }}
                            </option>
                          </select>
                          <div
                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <ChevronDownIcon class="h-5 w-5" />
                          </div>
                        </div>
                      </div>

                      <!-- Department -->
                      <div>
                        <label for="department" class="block text-lg font-medium text-gray-700 mb-3">Department</label>
                        <div class="relative rounded-lg shadow-sm">
                          <select id="department" v-model="newTicket.department_id" required
                            class="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 hover:border-gray-400 transition-colors duration-200 appearance-none">
                            <option value="">Select department</option>
                            <option v-for="department in departments" :key="department.id" :value="department.id">
                              {{ department.name }}
                            </option>
                          </select>
                          <div
                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <ChevronDownIcon class="h-5 w-5" />
                          </div>
                        </div>
                      </div>

                      <!-- Assigned To -->


                      <!-- Assigned To with Search -->
                      <div>
                        <label for="assignedTo" class="block text-lg font-medium text-gray-700 mb-3">Assign To
                          (Optional)</label>
                        <Combobox v-model="newTicket.assigned_to">
                          <div class="relative">
                            <div
                              class="relative w-full rounded-lg border-2 border-gray-300 hover:border-gray-400 shadow-sm">
                              <ComboboxInput
                                class="w-full rounded-lg border-0 bg-white py-3 pl-4 pr-10 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                :displayValue="(id) => users.find(user => user.id === id)?.full_name || ''"
                                placeholder="Search for a user..." @change="userQuery = $event.target.value" />
                              <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                              </ComboboxButton>
                            </div>
                            <TransitionRoot leave="transition ease-in duration-100" leaveFrom="opacity-100"
                              leaveTo="opacity-0" @after-leave="userQuery = ''">
                              <ComboboxOptions
                                class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div v-if="filteredUsers.length === 0 && userQuery !== ''"
                                  class="relative cursor-default select-none py-2 px-4 text-gray-700">
                                  Nothing found.
                                </div>

                                <ComboboxOption v-for="user in filteredUsers" :key="user.id" :value="user.id"
                                  v-slot="{ selected, active }" as="template">
                                  <li class="relative cursor-default select-none py-2 pl-3 pr-9"
                                    :class="{ 'bg-indigo-600 text-white': active, 'text-gray-900': !active }">
                                    <div class="flex items-center">
                                      <span
                                        class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 mr-3">
                                        <span class="text-sm font-medium leading-none text-gray-700"
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
                                        :class="{ 'text-indigo-200': active, 'text-gray-500': !active }">
                                        {{ user.email }}
                                      </span>
                                    </div>

                                    <span v-if="selected" class="absolute inset-y-0 right-0 flex items-center pr-4"
                                      :class="{ 'text-white': active, 'text-indigo-600': !active }">
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
                  </div>

                  <!-- Ticket Preview - แสดงเมื่อกรอกข้อมูลครบถ้วน -->
                  <div v-if="isFormValid" class="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <h4 class="text-lg font-medium text-indigo-700 mb-2">Ticket Preview</h4>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p class="text-gray-500">Title:</p>
                        <p class="font-medium">{{ newTicket.title }}</p>
                      </div>
                      <div>
                        <p class="text-gray-500">Priority:</p>
                        <p class="font-medium">
                          {{priorities.find(p => p.id === newTicket.priority_id)?.name || 'Not selected'}}
                        </p>
                      </div>
                      <div>
                        <p class="text-gray-500">Category:</p>
                        <p class="font-medium">
                          {{categories.find(c => c.id === newTicket.category_id)?.name || 'Not selected'}}
                        </p>
                      </div>
                      <div>
                        <p class="text-gray-500">Department:</p>
                        <p class="font-medium">
                          {{departments.find(d => d.id === newTicket.department_id)?.name || 'Not selected'}}
                        </p>
                      </div>
                      <div>
                        <p class="text-gray-500">Assigned To:</p>
                        <p class="font-medium">
                          {{users.find(u => u.id === newTicket.assigned_to)?.full_name || 'Not assigned'}}
                        </p>
                      </div>
                      <div>
                        <p class="text-gray-500">Due Date:</p>
                        <p class="font-medium">
                          {{ newTicket.due_date ? new Date(newTicket.due_date).toLocaleString() : 'Not set' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Form Actions -->
                  <div class="mt-10 flex justify-end space-x-4">
                    <button type="button" @click="showCreateModal = false"
                      class="inline-flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200">
                      <XMarkIcon class="h-5 w-5 mr-2 -ml-1" />
                      Cancel
                    </button>
                    <button type="submit" :disabled="formSubmitting"
                      class="inline-flex items-center justify-center rounded-lg border-2 border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      <template v-if="formSubmitting">
                        <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                          fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                          </circle>
                          <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                          </path>
                        </svg>
                        Creating...
                      </template>
                      <template v-else>
                        <PlusIcon class="h-5 w-5 mr-2 -ml-1" />
                        Create Ticket
                      </template>
                    </button>
                  </div>


                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

  </div>
</template>

<style>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>