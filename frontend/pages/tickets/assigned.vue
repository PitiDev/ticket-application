// pages/tickets/assigned.vue
<script setup>
// Add route middleware
definePageMeta({
  middleware: ['auth']
})
import { ref, onMounted, computed } from "vue";
import {
  UserIcon,
  ClockIcon,
  TagIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
  FlagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/outline";

const config = useRuntimeConfig();
const auth = useAuth();
const toast = useToast();
const router = useRouter();

const tickets = ref([]);
const stats = ref(null);
const loading = ref(true);
const selectedAssignee = ref(null);
const assignees = ref([]);
const searchQuery = ref("");
const selectedStatus = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const pageSizeOptions = [10, 25, 50, 100];

// Available status options
const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "New", label: "New" },
  { value: "In Progress", label: "In Progress" },
  { value: "Pending", label: "Pending" },
  { value: "Resolved", label: "Resolved" },
  { value: "Closed", label: "Closed" },
];

// Status and priority colors with gold/red theme
const statusColors = {
  New: "bg-amber-100 text-amber-800 ring-amber-600/20",
  "In Progress": "bg-yellow-100 text-yellow-800 ring-yellow-600/20",
  "Pending": "bg-orange-100 text-orange-800 ring-orange-600/20",
  "Resolved": "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  "Closed": "bg-gray-100 text-gray-800 ring-gray-600/20",
};

const priorityColors = {
  Low: "bg-gray-100 text-gray-800 ring-gray-600/20",
  Medium: "bg-amber-100 text-amber-800 ring-amber-600/20",
  High: "bg-red-100 text-red-800 ring-red-600/20",
  Critical: "bg-red-200 text-red-900 ring-red-300 font-bold",
};

// Filtered tickets based on search and status
const filteredTickets = computed(() => {
  let result = tickets.value;

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(query) ||
        ticket.ticket_number.toLowerCase().includes(query) ||
        ticket.created_by_name.toLowerCase().includes(query)
    );
  }

  // Filter by status
  if (selectedStatus.value) {
    result = result.filter((ticket) => ticket.status_name === selectedStatus.value);
  }

  return result;
});

// Paginated tickets
const paginatedTickets = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTickets.value.slice(start, end);
});

// Pagination info
const totalPages = computed(() => Math.ceil(filteredTickets.value.length / pageSize.value));
const showingFrom = computed(() => {
  if (filteredTickets.value.length === 0) return 0;
  return (currentPage.value - 1) * pageSize.value + 1;
});
const showingTo = computed(() => {
  const to = currentPage.value * pageSize.value;
  return to > filteredTickets.value.length ? filteredTickets.value.length : to;
});

// Pagination functions
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const handlePageSizeChange = () => {
  currentPage.value = 1; // Reset to first page when page size changes
};

const handleFilterChange = () => {
  currentPage.value = 1; // Reset to first page when filters change
};

// Fetch assignees
async function fetchAssignees() {
  try {
    const { data, error } = await useFetch(
      `${config.public.apiBase}/tickets/assigned/assignees`,
      {
        headers: { Authorization: `Bearer ${auth.token}` },
      }
    );

    if (error.value) throw error.value;
    assignees.value = data.value || [];

    // Set current user as default selected assignee
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      selectedAssignee.value = user.id;
      fetchAssignedTickets(user.id);
    }
  } catch (error) {
    console.error("Error fetching assignees:", error);
    toast.error("Failed to load assignees");
  }
}

// Fetch assigned tickets
async function fetchAssignedTickets(userId) {
  if (!userId) return;

  try {
    loading.value = true;
    const { data, error } = await useFetch(
      `${config.public.apiBase}/tickets/assigned/list?userId=${userId}`,
      {
        headers: { Authorization: `Bearer ${auth.token}` },
      }
    );

    if (error.value) throw error.value;
    tickets.value = data.value.tickets || [];
    stats.value = data.value.stats;
  } catch (error) {
    console.error("Error fetching assigned tickets:", error);
    toast.error("Failed to load assigned tickets");
  } finally {
    loading.value = false;
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

// Handle assignee change
function handleAssigneeChange(userId) {
  selectedAssignee.value = userId;

  // Reset filters and pagination
  searchQuery.value = "";
  selectedStatus.value = "";
  currentPage.value = 1;

  if (userId) {
    fetchAssignedTickets(userId);
  } else {
    tickets.value = [];
    stats.value = null;
  }
}

onMounted(() => {
  fetchAssignees();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 to-red-50 transition-colors duration-200">
    <!-- Modern Header with Gold/Red Gradient -->
    <div class="bg-white dark:bg-gray-800 border-b border-amber-200 dark:border-gray-700 rounded-lg shadow-sm transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex-1">
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent"
            >
              Assigned Tickets
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-300">
              Track and manage your team's assigned support tickets
            </p>
          </div>
          <NuxtLink
            to="/tickets"
            class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            View All Tickets
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Modern Assignee Selector -->
      <div class="mb-6">
        <div class="relative">
          <select
            id="assignee"
            v-model="selectedAssignee"
            @change="handleAssigneeChange($event.target.value)"
            class="block w-full md:w-64 pl-4 pr-10 py-3 text-base border-2 border-amber-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent rounded-xl shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:border-amber-300 dark:hover:border-gray-500 transition-all appearance-none"
          >
            <option value="">Select team member</option>
            <option v-for="user in assignees" :key="user.id" :value="user.id">
              {{ user.username }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <UserIcon class="h-5 w-5 text-amber-400 dark:text-amber-500" />
          </div>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div v-if="selectedAssignee && tickets.length > 0" class="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-amber-100 dark:border-gray-700 p-4 transition-colors duration-200">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search Input -->
          <div class="flex-1 relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon class="h-5 w-5 text-amber-400 dark:text-amber-500" />
            </div>
            <input
              v-model="searchQuery"
              @input="handleFilterChange"
              type="text"
              class="block w-full pl-10 pr-3 py-2.5 border border-amber-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="Search by ticket number, title, or creator..."
            />
          </div>

          <!-- Status Filter -->
          <div class="relative w-full md:w-56">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon class="h-5 w-5 text-amber-400 dark:text-amber-500" />
            </div>
            <select
              v-model="selectedStatus"
              @change="handleFilterChange"
              class="block w-full pl-10 pr-3 py-2.5 border border-amber-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all appearance-none"
            >
              <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>

          <!-- Results Count -->
          <div class="flex items-center px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <span class="text-sm font-medium text-amber-700 dark:text-amber-300">
              {{ filteredTickets.length }} {{ filteredTickets.length === 1 ? 'ticket' : 'tickets' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Modern Stats Cards with Gold/Red Theme -->
      <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div
          v-for="(stat, index) in [
            {
              icon: ChartBarIcon,
              label: 'Total Tickets',
              value: stats.total_tickets,
              color: 'text-amber-500',
              bgColor: 'from-amber-50 to-amber-100',
              iconBg: 'bg-amber-100',
            },
            {
              icon: ExclamationCircleIcon,
              label: 'New Tickets',
              value: stats.new_tickets,
              color: 'text-blue-500',
              bgColor: 'from-blue-50 to-blue-100',
              iconBg: 'bg-blue-100',
            },
            {
              icon: ArrowPathIcon,
              label: 'In Progress',
              value: stats.in_progress_tickets,
              color: 'text-yellow-500',
              bgColor: 'from-yellow-50 to-yellow-100',
              iconBg: 'bg-yellow-100',
            },
            {
              icon: FlagIcon,
              label: 'Resolved',
              value: stats.resolved_tickets,
              color: 'text-emerald-500',
              bgColor: 'from-emerald-50 to-emerald-100',
              iconBg: 'bg-emerald-100',
            },
          ]"
          :key="index"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-amber-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="p-6">
            <div class="flex items-center gap-4">
              <div class="flex-shrink-0">
                <div class="p-3 rounded-xl" :class="stat.iconBg">
                  <component :is="stat.icon" class="h-6 w-6" :class="stat.color" />
                </div>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
                <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{{ stat.value }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modern Tickets List -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-amber-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-16">
          <ArrowPathIcon class="w-12 h-12 animate-spin text-amber-600 dark:text-amber-500" />
          <p class="mt-4 text-gray-600 dark:text-gray-400">Loading assigned tickets...</p>
        </div>

        <!-- Content -->
        <div v-else>
          <!-- Tickets Table -->
          <div v-if="filteredTickets.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-amber-100 dark:divide-gray-700">
              <thead>
                <tr class="bg-gradient-to-r from-amber-50 to-red-50 dark:from-gray-700 dark:to-gray-700">
                  <th
                    v-for="header in [
                      'Ticket',
                      'Status',
                      'Priority',
                      'Created By',
                      'Department',
                      'Created At',
                    ]"
                    :key="header"
                    class="px-6 py-4 text-left text-xs font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider"
                  >
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-amber-50 dark:divide-gray-700">
                <tr
                  v-for="ticket in paginatedTickets"
                  :key="ticket.id"
                  class="hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-red-50/50 dark:hover:from-gray-700/50 dark:hover:to-gray-700/50 transition-all duration-200 cursor-pointer transform hover:scale-[1.01]"
                  @click="router.push(`/tickets/${ticket.id}`)"
                >
                  <td class="px-6 py-4">
                    <div>
                      <div class="font-bold text-amber-700 dark:text-amber-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        {{ ticket.ticket_number }}
                      </div>
                      <div class="mt-1 text-sm text-gray-900 dark:text-gray-100 font-medium">{{ ticket.title }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset"
                      :class="statusColors[ticket.status_name]"
                    >
                      {{ ticket.status_name }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset"
                      :class="priorityColors[ticket.priority_name]"
                    >
                      {{ ticket.priority_name }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <UserIcon class="h-4 w-4 text-amber-500 dark:text-amber-400" />
                      <span class="text-sm text-gray-900 dark:text-gray-100 font-medium">{{
                        ticket.created_by_name
                      }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <BuildingOfficeIcon class="h-4 w-4 text-amber-500 dark:text-amber-400" />
                      <span class="text-sm text-gray-900 dark:text-gray-100 font-medium">{{
                        ticket.department_name
                      }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-medium">
                    {{ formatDate(ticket.created_at) }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination Controls -->
            <div v-if="totalPages > 0" class="bg-gradient-to-r from-amber-50 to-red-50 dark:from-gray-700 dark:to-gray-700 px-6 py-4 border-t border-amber-100 dark:border-gray-600">
              <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <!-- Showing Info and Page Size Selector -->
                <div class="flex flex-col sm:flex-row items-center gap-4">
                  <div class="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span class="font-semibold text-amber-600 dark:text-amber-400">{{ showingFrom }}</span> to
                    <span class="font-semibold text-amber-600 dark:text-amber-400">{{ showingTo }}</span> of
                    <span class="font-semibold text-amber-600 dark:text-amber-400">{{ filteredTickets.length }}</span> results
                  </div>
                  <div class="flex items-center gap-2">
                    <label class="text-sm text-gray-700 dark:text-gray-300">Per page:</label>
                    <select
                      v-model.number="pageSize"
                      @change="handlePageSizeChange"
                      class="border border-amber-200 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
                    </select>
                  </div>
                </div>

                <!-- Page Navigation -->
                <div v-if="totalPages > 1" class="flex items-center gap-2">
                  <button
                    @click="goToPage(currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="p-2 rounded-lg border border-amber-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    :class="{ 'hover:border-amber-300': currentPage !== 1 }"
                  >
                    <ChevronLeftIcon class="h-5 w-5" />
                  </button>

                  <div class="flex items-center gap-1">
                    <button
                      v-for="page in totalPages"
                      :key="page"
                      v-show="page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)"
                      @click="goToPage(page)"
                      class="px-3 py-1 rounded-lg border transition-all"
                      :class="
                        page === currentPage
                          ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white border-amber-600 font-semibold'
                          : 'border-amber-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-gray-700 hover:border-amber-300'
                      "
                    >
                      {{ page }}
                    </button>
                  </div>

                  <button
                    @click="goToPage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="p-2 rounded-lg border border-amber-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    :class="{ 'hover:border-amber-300': currentPage !== totalPages }"
                  >
                    <ChevronRightIcon class="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Modern Empty State -->
          <div v-else-if="selectedAssignee" class="text-center py-16">
            <div class="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-amber-100 to-red-100 dark:from-amber-900/30 dark:to-red-900/30 flex items-center justify-center">
              <ExclamationCircleIcon class="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 class="mt-6 text-xl font-bold text-gray-900 dark:text-gray-100">No tickets found</h3>
            <p class="mt-2 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              There are currently no tickets assigned to this team member. Check back later or assign some tickets.
            </p>
            <div class="mt-6">
              <NuxtLink
                to="/tickets"
                class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 transition-all"
              >
                View All Tickets
              </NuxtLink>
            </div>
          </div>

          <!-- Modern No Selection State -->
          <div v-else class="text-center py-16">
            <div class="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-amber-100 to-red-100 dark:from-amber-900/30 dark:to-red-900/30 flex items-center justify-center">
              <UserIcon class="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 class="mt-6 text-xl font-bold text-gray-900 dark:text-gray-100">Select a team member</h3>
            <p class="mt-2 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Choose a team member from the dropdown above to view their assigned tickets and track progress.
            </p>
            <div class="mt-6">
              <button
                @click="$refs.assigneeSelect?.focus()"
                class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all"
              >
                <UserIcon class="h-4 w-4 mr-2" />
                Choose Team Member
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>