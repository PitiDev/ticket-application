<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Check EOD Status</h1>

    <!-- Date Selector -->
    <div class="mb-6 flex items-center gap-4">
      <div class="flex flex-col">
        <label for="date" class="mb-1 text-sm font-medium">Select Date</label>
        <input type="date" id="date" v-model="selectedDate" class="border rounded p-2" :max="today" />
      </div>

      <button @click="fetchEodData" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-6">
        Check EOD
      </button>

      <button @click="fetchCurrentDay" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-6">
        Today's EOD
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <!-- No EOD Session Message -->
    <div v-if="eodData && !eodData.session && !loading"
      class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
      No EOD session found for {{ formatDate(selectedDate) }}.
      <NuxtLink to="/teller/create-eod-session">
        <button class="underline ml-2">Create EOD Session</button>
      </NuxtLink>

    </div>

    <!-- EOD Session Summary Card -->
    <div v-if="eodData && eodData.session && !loading" class="mb-8">
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-semibold">
            EOD Session: {{ formatDate(eodData.session.session_date) }}
          </h2>
          <span class="px-3 py-1 rounded-full text-sm font-medium" :class="{
            'bg-green-100 text-green-800': eodData.session.status === 'completed',
            'bg-blue-100 text-blue-800': eodData.session.status === 'in_progress',
            'bg-yellow-100 text-yellow-800': eodData.session.status === 'pending',
            'bg-red-100 text-red-800': eodData.session.status === 'cancelled'
          }">
            {{ formatStatus(eodData.session.status) }}
          </span>
        </div>

        <div class="mb-4">
          <p class="text-sm text-gray-600 mb-1">Template: {{ eodData.session.template_name }}</p>
          <p class="text-sm text-gray-600">{{ eodData.session.template_description }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p class="text-sm text-gray-500">Started by</p>
            <p>{{ eodData.session.started_by_name || 'Not started yet' }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ eodData.session.started_at ?
              formatDateTime(eodData.session.started_at) : '' }}</p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Completed by</p>
            <p>{{ eodData.session.completed_by_name || 'Not completed yet' }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ eodData.session.completed_at ?
              formatDateTime(eodData.session.completed_at) : '' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-gray-100 p-4 rounded-lg text-center">
            <p class="text-sm text-gray-500">Total Branches</p>
            <p class="text-2xl font-bold">{{ eodData.summary.total_branches }}</p>
          </div>

          <div class="bg-green-100 p-4 rounded-lg text-center">
            <p class="text-sm text-gray-500">Completed</p>
            <p class="text-2xl font-bold text-green-600">{{ eodData.summary.completed_branches }}</p>
          </div>

          <div class="bg-blue-100 p-4 rounded-lg text-center">
            <p class="text-sm text-gray-500">In Progress</p>
            <p class="text-2xl font-bold text-blue-600">{{ eodData.summary.in_progress_branches }}</p>
          </div>

          <div class="bg-yellow-100 p-4 rounded-lg text-center">
            <p class="text-sm text-gray-500">Pending</p>
            <p class="text-2xl font-bold text-yellow-600">{{ eodData.summary.pending_branches }}</p>
          </div>
        </div>

        <!-- Completion Rate Card -->
        <div class="bg-white border rounded-lg p-4 mb-6">
          <h3 class="text-lg font-semibold mb-2">Completion Rate</h3>
          <div class="w-full bg-gray-200 rounded-full h-4">
            <div class="bg-green-500 h-4 rounded-full" :style="{ width: completionRate + '%' }"></div>
          </div>
          <p class="text-right mt-1 text-sm">{{ completionRate }}%</p>
        </div>

        <!-- Notes -->
        <div v-if="eodData.session.notes" class="mb-6">
          <h3 class="text-lg font-semibold mb-2">Notes</h3>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p>{{ eodData.session.notes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Ticket Statistics Card -->
    <div v-if="eodData && eodData.ticketStats && !loading" class="mb-8">
      <h3 class="text-xl font-semibold mb-4">Ticket Statistics</h3>
      <div class="bg-white shadow rounded-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div class="bg-gray-100 p-4 rounded-lg text-center">
            <p class="text-sm text-gray-500">Total Tickets</p>
            <p class="text-2xl font-bold">{{ eodData.ticketStats.total_tickets }}</p>
          </div>

          <div class="bg-green-100 p-4 rounded-lg text-center">
            <p class="text-sm text-gray-500">Resolved</p>
            <p class="text-2xl font-bold text-green-600">{{ eodData.ticketStats.resolved_tickets }}</p>
          </div>

          <div class="bg-blue-100 p-4 rounded-lg text-center">
            <p class="text-sm text-gray-500">In Progress</p>
            <p class="text-2xl font-bold text-blue-600">{{ eodData.ticketStats.in_progress_tickets }}</p>
          </div>

          <div class="bg-yellow-100 p-4 rounded-lg text-center">
            <p class="text-sm text-gray-500">Pending</p>
            <p class="text-2xl font-bold text-yellow-600">{{ eodData.ticketStats.pending_tickets }}</p>
          </div>

          <div class="bg-purple-100 p-4 rounded-lg text-center">
            <p class="text-sm text-gray-500">New</p>
            <p class="text-2xl font-bold text-purple-600">{{ eodData.ticketStats.new_tickets }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Branch Checklists Table -->
    <div v-if="eodData && eodData.branchChecklists && eodData.branchChecklists.length > 0 && !loading">
      <h3 class="text-xl font-semibold mb-4">Branch Checklists ({{ eodData.branchChecklists.length }})</h3>

      <div class="overflow-x-auto">
        <table class="min-w-full bg-white rounded-lg overflow-hidden shadow">
          <thead class="bg-gray-100">
            <tr>
              <th class="py-3 px-4 text-left">Branch</th>
              <th class="py-3 px-4 text-left">Status</th>
              <th class="py-3 px-4 text-left">Completion</th>
              <th class="py-3 px-4 text-left">Assigned To</th>
              <th class="py-3 px-4 text-left">Completed By</th>
              <th class="py-3 px-4 text-left">Started At</th>
              <th class="py-3 px-4 text-left">Completed At</th>
              <th class="py-3 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="checklist in eodData.branchChecklists" :key="checklist.id" class="border-b hover:bg-gray-50">
              <td class="py-3 px-4">
                <div class="font-medium">{{ checklist.branch_name }}</div>
                <div class="text-xs text-gray-500">{{ checklist.branch_code }}</div>
              </td>
              <td class="py-3 px-4">
                <span :class="{
                  'bg-green-100 text-green-800': checklist.status === 'completed',
                  'bg-blue-100 text-blue-800': checklist.status === 'in_progress',
                  'bg-yellow-100 text-yellow-800': checklist.status === 'pending'
                }" class="px-2 py-1 rounded text-xs font-medium">
                  {{ formatStatus(checklist.status) }}
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div class="bg-green-500 h-2 rounded-full" :style="{ width: checklist.completion_percentage + '%' }">
                  </div>
                </div>
                <div class="text-xs text-center">
                  {{ checklist.completed_items }}/{{ checklist.total_items }} ({{ checklist.completion_percentage }}%)
                </div>
              </td>
              <td class="py-3 px-4">{{ checklist.assigned_to_name || 'Not assigned' }}</td>
              <td class="py-3 px-4">{{ checklist.completed_by_name || 'Not completed' }}</td>
              <td class="py-3 px-4">{{ formatDateTime(checklist.started_at) }}</td>
              <td class="py-3 px-4">{{ checklist.completed_at ? formatDateTime(checklist.completed_at) : 'Not completed'
              }}</td>
              <td class="py-3 px-4">
                <button @click="viewChecklistDetails(checklist.id)" class="text-blue-500 hover:text-blue-700">
                  View Details
                </button>

                <router-link :to="`/teller/update-checklist/${checklist.id}`"
                  class="text-green-500 hover:text-green-700">
                  Update
                </router-link>

              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- No checklists message -->
      <div v-if="eodData.branchChecklists.length === 0" class="text-center p-8 bg-gray-50 rounded-lg">
        <p class="text-gray-500">No branch checklists found for this date.</p>
      </div>
    </div>

    <!-- Checklist Detail Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Checklist Details</h2>
            <button @click="showModal = false" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div v-if="checklistLoading" class="flex justify-center my-8">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>

          <div v-else-if="checklistDetails">
            <div class="mb-6">
              <div class="flex justify-between items-center mb-2">
                <h3 class="text-lg font-medium">{{ checklistDetails.checklist.branch_name }}</h3>
                <span :class="{
                  'bg-green-100 text-green-800': checklistDetails.checklist.status === 'completed',
                  'bg-blue-100 text-blue-800': checklistDetails.checklist.status === 'in_progress',
                  'bg-yellow-100 text-yellow-800': checklistDetails.checklist.status === 'pending'
                }" class="px-2 py-1 rounded text-xs font-medium">
                  {{ formatStatus(checklistDetails.checklist.status) }}
                </span>
              </div>
              <div class="text-sm text-gray-500 mb-2">{{ checklistDetails.checklist.branch_code }}</div>
              <div class="mb-4">
                <div class="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div class="bg-green-500 h-2 rounded-full"
                    :style="{ width: checklistDetails.checklist.completion_percentage + '%' }"></div>
                </div>
                <div class="text-xs text-center">
                  {{ checklistDetails.checklist.completed_items }}/{{ checklistDetails.checklist.total_items }}
                  ({{ checklistDetails.checklist.completion_percentage }}%)
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p class="text-sm text-gray-500">Assigned To</p>
                  <p>{{ checklistDetails.checklist.assigned_to_name || 'Not assigned' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Completed By</p>
                  <p>{{ checklistDetails.checklist.completed_by_name || 'Not completed' }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p class="text-sm text-gray-500">Started At</p>
                  <p>{{ formatDateTime(checklistDetails.checklist.started_at) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Completed At</p>
                  <p>{{ checklistDetails.checklist.completed_at ?
                    formatDateTime(checklistDetails.checklist.completed_at) : 'Not completed' }}</p>
                </div>
              </div>

              <div v-if="checklistDetails.checklist.notes" class="mt-4">
                <p class="text-sm text-gray-500">Notes</p>
                <p class="bg-gray-50 p-3 rounded mt-1">{{ checklistDetails.checklist.notes }}</p>
              </div>
            </div>

            <h4 class="text-lg font-medium mb-4">Checklist Items</h4>
            <div class="space-y-4">
              <div v-for="item in checklistDetails.items" :key="item.id" class="border rounded-lg p-4" :class="{
                'border-green-200 bg-green-50': item.is_completed,
                'border-gray-200': !item.is_completed
              }">
                <div class="flex items-start">
                  <div class="flex-shrink-0 mt-0.5">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center" :class="{
                      'bg-green-500 text-white': item.is_completed,
                      'bg-gray-200': !item.is_completed
                    }">
                      <svg v-if="item.is_completed" class="w-4 h-4" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-3 flex-1">
                    <div class="flex justify-between items-start">
                      <h5 class="text-base font-medium">{{ item.item_name }}</h5>
                      <div v-if="item.required_role !== 'both'"
                        class="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                        {{ formatRole(item.required_role) }}
                      </div>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">{{ item.description }}</p>

                    <div v-if="item.is_completed" class="mt-3">
                      <div class="flex items-center text-sm text-gray-500">
                        <span>Completed by {{ item.completed_by_name }}</span>
                        <span class="mx-2">•</span>
                        <span>{{ formatDateTime(item.completed_at) }}</span>
                      </div>

                      <div v-if="item.completion_notes" class="mt-2">
                        <p class="text-xs text-gray-500">Notes:</p>
                        <p class="text-sm mt-1 bg-white p-2 rounded">{{ item.completion_notes }}</p>
                      </div>

                      <div v-if="item.attachment_url" class="mt-2">
                        <a :href="item.attachment_url" target="_blank" class="text-blue-500 text-sm flex items-center">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13">
                            </path>
                          </svg>
                          View Attachment
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div class="flex justify-end mt-4">
          <router-link v-if="checklistDetails" :to="`/teller/update-checklist/${checklistDetails.checklist.id}`"
            class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2">
            Update
          </router-link>
        </div>

        <br>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from '@/composables/useToast';

// State
const selectedDate = ref('');
const eodData = ref(null);
const loading = ref(false);
const error = ref('');
const showModal = ref(false);
const checklistDetails = ref(null);
const checklistLoading = ref(false);
const { showToast } = useToast();

// Computed
const today = computed(() => {
  const date = new Date();
  return date.toISOString().split('T')[0];
});

const completionRate = computed(() => {
  if (!eodData.value || !eodData.value.summary) return 0;

  const { total_branches, completed_branches } = eodData.value.summary;
  if (total_branches === 0) return 0;

  return Math.round((completed_branches / total_branches) * 100);
});

// Methods
const fetchEodData = async () => {
  if (!selectedDate.value) {
    error.value = 'Please select a date';
    return;
  }

  error.value = '';
  loading.value = true;

  try {
    const response = await fetch(`http://172.16.4.62:9000/api/eod/date/${selectedDate.value}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch EOD data');
    }

    eodData.value = data.data;
    showToast('EOD data loaded successfully', 'success');
  } catch (err) {
    error.value = err.message;
    showToast(err.message, 'error');
  } finally {
    loading.value = false;
  }
};

const fetchCurrentDay = async () => {
  error.value = '';
  loading.value = true;

  try {
    const response = await fetch('http://172.16.4.62:9000/api/eod/current', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch current day EOD data');
    }

    eodData.value = data.data;
    selectedDate.value = data.data.date;
    showToast('Today\'s EOD data loaded successfully', 'success');
  } catch (err) {
    error.value = err.message;
    showToast(err.message, 'error');
  } finally {
    loading.value = false;
  }
};

const viewChecklistDetails = async (checklistId) => {
  checklistLoading.value = true;
  showModal.value = true;
  checklistDetails.value = null;

  try {
    const response = await fetch(`http://172.16.4.62:9000/api/eod/checklist/${checklistId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch checklist details');
    }

    checklistDetails.value = data.data;
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    checklistLoading.value = false;
  }
};

// Format functions
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateTimeString).toLocaleString(undefined, options);
};

const formatStatus = (status) => {
  if (!status) return '';

  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatRole = (role) => {
  if (!role) return '';

  switch (role) {
    case 'teller':
      return 'Teller';
    case 'branch_manager':
      return 'Branch Manager';
    case 'both':
      return 'Both';
    default:
      return role;
  }
};

// Initialize
onMounted(() => {
  // Set today's date as default
  selectedDate.value = today.value;
  // Fetch current day EOD data on load
  fetchCurrentDay();
});
</script>

<style scoped>
/* Add any additional component-specific styles here */
</style>