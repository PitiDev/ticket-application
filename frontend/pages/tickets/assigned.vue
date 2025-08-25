// pages/tickets/assigned.vue
<script setup>
// Add route middleware
definePageMeta({
  middleware: ['auth']
})
import { ref, onMounted } from "vue";
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

const filteredTickets = computed(() => {
  if (!searchQuery.value) return tickets.value;
  const query = searchQuery.value.toLowerCase();
  return tickets.value.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(query) ||
      ticket.ticket_number.toLowerCase().includes(query) ||
      ticket.created_by_name.toLowerCase().includes(query)
  );
});

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
  <div class="min-h-screen to-red-50">
    <!-- Modern Header with Gold/Red Gradient -->
    <div class="bg-white border-b border-amber-200 rounded-lg shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex-1">
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent"
            >
              Assigned Tickets
            </h1>
            <p class="mt-2 text-gray-600">
              Track and manage your team's assigned support tickets
            </p>
          </div>
          <div class="flex items-center gap-4">
            <div class="relative flex-1 md:w-64">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <MagnifyingGlassIcon class="h-5 w-5 text-amber-400" />
              </div>
              <input
                v-model="searchQuery"
                type="text"
                class="block w-full pl-10 pr-3 py-2 border border-amber-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="Search tickets..."
              />
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
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Modern Assignee Selector -->
      <div class="mb-8">
        <div class="relative">
          <select
            id="assignee"
            v-model="selectedAssignee"
            @change="handleAssigneeChange($event.target.value)"
            class="block w-full md:w-64 pl-4 pr-10 py-3 text-base border-2 border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent rounded-xl shadow-sm bg-white hover:border-amber-300 transition-all appearance-none"
          >
            <option value="">Select team member</option>
            <option v-for="user in assignees" :key="user.id" :value="user.id">
              {{ user.username }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <UserIcon class="h-5 w-5 text-amber-400" />
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
          class="bg-white rounded-xl shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="p-6">
            <div class="flex items-center gap-4">
              <div class="flex-shrink-0">
                <div class="p-3 rounded-xl" :class="stat.iconBg">
                  <component :is="stat.icon" class="h-6 w-6" :class="stat.color" />
                </div>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-500">{{ stat.label }}</p>
                <p class="mt-1 text-2xl font-bold text-gray-900">{{ stat.value }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modern Tickets List -->
      <div class="bg-white rounded-xl shadow-lg border border-amber-100 overflow-hidden">
        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-16">
          <ArrowPathIcon class="w-12 h-12 animate-spin text-amber-600" />
          <p class="mt-4 text-gray-600">Loading assigned tickets...</p>
        </div>

        <!-- Content -->
        <div v-else>
          <!-- Tickets Table -->
          <div v-if="filteredTickets.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-amber-100">
              <thead>
                <tr class="bg-gradient-to-r from-amber-50 to-red-50">
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
                    class="px-6 py-4 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider"
                  >
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-amber-50">
                <tr
                  v-for="ticket in filteredTickets"
                  :key="ticket.id"
                  class="hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-red-50/50 transition-all duration-200 cursor-pointer transform hover:scale-[1.01]"
                  @click="router.push(`/tickets/${ticket.id}`)"
                >
                  <td class="px-6 py-4">
                    <div>
                      <div class="font-bold text-amber-700 hover:text-red-600 transition-colors">
                        {{ ticket.ticket_number }}
                      </div>
                      <div class="mt-1 text-sm text-gray-900 font-medium">{{ ticket.title }}</div>
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
                      <UserIcon class="h-4 w-4 text-amber-500" />
                      <span class="text-sm text-gray-900 font-medium">{{
                        ticket.created_by_name
                      }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <BuildingOfficeIcon class="h-4 w-4 text-amber-500" />
                      <span class="text-sm text-gray-900 font-medium">{{
                        ticket.department_name
                      }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600 font-medium">
                    {{ formatDate(ticket.created_at) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Modern Empty State -->
          <div v-else-if="selectedAssignee" class="text-center py-16">
            <div class="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-amber-100 to-red-100 flex items-center justify-center">
              <ExclamationCircleIcon class="h-8 w-8 text-amber-600" />
            </div>
            <h3 class="mt-6 text-xl font-bold text-gray-900">No tickets found</h3>
            <p class="mt-2 text-gray-500 max-w-sm mx-auto">
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
            <div class="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-amber-100 to-red-100 flex items-center justify-center">
              <UserIcon class="h-8 w-8 text-amber-600" />
            </div>
            <h3 class="mt-6 text-xl font-bold text-gray-900">Select a team member</h3>
            <p class="mt-2 text-gray-500 max-w-sm mx-auto">
              Choose a team member from the dropdown above to view their assigned tickets and track progress.
            </p>
            <div class="mt-6">
              <button
                @click="$refs.assigneeSelect?.focus()"
                class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 transition-all"
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