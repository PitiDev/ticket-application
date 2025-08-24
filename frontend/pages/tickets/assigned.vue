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

// Status and priority colors
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
  <div class="min-h-screen ">
    <!-- Modern Header with Gradient -->
    <div class="bg-white border-b border-gray-200 rounded-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex-1">
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
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
                <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
              </div>
              <input
                v-model="searchQuery"
                type="text"
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Search tickets..."
              />
            </div>
            <NuxtLink
              to="/tickets"
              class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-sm transition-all duration-200 ease-in-out"
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
        <select
          id="assignee"
          v-model="selectedAssignee"
          @change="handleAssigneeChange($event.target.value)"
          class="block w-full md:w-64 pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent rounded-lg shadow-sm bg-white"
        >
          <option value="">Select team member</option>
          <option v-for="user in assignees" :key="user.id" :value="user.id">
            {{ user.username }}
          </option>
        </select>
      </div>

      <!-- Modern Stats Cards -->
      <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div
          v-for="(stat, index) in [
            {
              icon: ChartBarIcon,
              label: 'Total Tickets',
              value: stats.total_tickets,
              color: 'text-gray-400',
            },
            {
              icon: ExclamationCircleIcon,
              label: 'New Tickets',
              value: stats.new_tickets,
              color: 'text-blue-400',
            },
            {
              icon: ArrowPathIcon,
              label: 'In Progress',
              value: stats.in_progress_tickets,
              color: 'text-amber-400',
            },
            {
              icon: FlagIcon,
              label: 'Resolved',
              value: stats.resolved_tickets,
              color: 'text-emerald-400',
            },
          ]"
          :key="index"
          class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
        >
          <div class="p-6">
            <div class="flex items-center gap-4">
              <div class="flex-shrink-0">
                <component :is="stat.icon" class="h-8 w-8" :class="stat.color" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-500">{{ stat.label }}</p>
                <p class="mt-1 text-2xl font-semibold text-gray-900">{{ stat.value }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modern Tickets List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-16">
          <ArrowPathIcon class="w-10 h-10 animate-spin text-indigo-600" />
        </div>

        <!-- Content -->
        <div v-else>
          <!-- Tickets Table -->
          <div v-if="filteredTickets.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr class="bg-gray-50">
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
                    class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="ticket in filteredTickets"
                  :key="ticket.id"
                  class="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  @click="router.push(`/tickets/${ticket.id}`)"
                >
                  <td class="px-6 py-4">
                    <div>
                      <div class="font-medium text-indigo-600">
                        {{ ticket.ticket_number }}
                      </div>
                      <div class="mt-1 text-sm text-gray-900">{{ ticket.title }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset"
                      :class="statusColors[ticket.status_name]"
                    >
                      {{ ticket.status_name }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset"
                      :class="priorityColors[ticket.priority_name]"
                    >
                      {{ ticket.priority_name }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <UserIcon class="h-4 w-4 text-gray-400" />
                      <span class="text-sm text-gray-900">{{
                        ticket.created_by_name
                      }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <BuildingOfficeIcon class="h-4 w-4 text-gray-400" />
                      <span class="text-sm text-gray-900">{{
                        ticket.department_name
                      }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    {{ formatDate(ticket.created_at) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Modern Empty State -->
          <div v-else-if="selectedAssignee" class="text-center py-16">
            <ExclamationCircleIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-4 text-lg font-medium text-gray-900">No tickets found</h3>
            <p class="mt-2 text-gray-500">
              There are currently no tickets assigned to this team member.
            </p>
          </div>

          <!-- Modern No Selection State -->
          <div v-else class="text-center py-16">
            <UserIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-4 text-lg font-medium text-gray-900">Select a team member</h3>
            <p class="mt-2 text-gray-500">
              Choose a team member from the dropdown above to view their assigned tickets.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
