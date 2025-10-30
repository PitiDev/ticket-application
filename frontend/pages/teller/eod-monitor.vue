<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">EOD Monitoring Dashboard</h1>
    
    <!-- Date Range Selector -->
    <div class="mb-6 bg-white shadow rounded-lg p-4">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex flex-col">
          <label for="startDate" class="mb-1 text-sm font-medium">Start Date</label>
          <input 
            type="date" 
            id="startDate" 
            v-model="startDate" 
            class="border rounded p-2"
            :max="today"
          />
        </div>
        
        <div class="flex flex-col">
          <label for="endDate" class="mb-1 text-sm font-medium">End Date</label>
          <input 
            type="date" 
            id="endDate" 
            v-model="endDate" 
            class="border rounded p-2"
            :max="today"
          />
        </div>
        
        <button 
          @click="fetchDateRangeData" 
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          :disabled="loading"
        >
          <span v-if="loading">Loading...</span>
          <span v-else>Generate Report</span>
        </button>
        
        <div class="flex gap-2">
          <button 
            @click="setLastWeek" 
            class="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300"
          >
            Last Week
          </button>
          
          <button 
            @click="setLastMonth" 
            class="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300"
          >
            Last Month
          </button>
        </div>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    
    <!-- Error Message -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>
    
    <!-- Stats Grid -->
    <div v-if="rangeData && !loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-2">Total Sessions</h3>
        <p class="text-3xl font-bold">
          {{ rangeData.sessions.length }}
        </p>
        <p class="text-sm text-gray-500 mt-2">
          {{ startDate }} to {{ endDate }}
        </p>
      </div>
      
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-2">Completion Rate</h3>
        <p class="text-3xl font-bold text-green-600">
          {{ overallCompletionRate }}%
        </p>
        <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            class="bg-green-500 h-2 rounded-full" 
            :style="{ width: overallCompletionRate + '%' }"
          ></div>
        </div>
      </div>
      
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-2">Branch Completion</h3>
        <p class="text-3xl font-bold text-blue-600">
          {{ completedBranchCount }}
        </p>
        <p class="text-sm text-gray-500 mt-2">
          of {{ totalBranchCount }} branches
        </p>
      </div>
      
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-2">Days Monitored</h3>
        <p class="text-3xl font-bold text-purple-600">
          {{ daysCount }}
        </p>
        <p class="text-sm text-gray-500 mt-2">
          in selected range
        </p>
      </div>
    </div>
    
    <!-- Session Completion Chart -->
    <div v-if="rangeData && rangeData.sessions && !loading" class="bg-white shadow rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold mb-4">Daily EOD Session Completion</h3>
      <div class="h-80">
        <canvas ref="sessionChart"></canvas>
      </div>
    </div>
    
    <!-- Branch Performance -->
    <div v-if="rangeData && rangeData.branchStats && !loading" class="bg-white shadow rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold mb-4">Branch Performance</h3>
      
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-100">
            <tr>
              <th class="py-3 px-4 text-left">Branch</th>
              <th class="py-3 px-4 text-left">Code</th>
              <th class="py-3 px-4 text-left">Total Sessions</th>
              <th class="py-3 px-4 text-left">Completed Sessions</th>
              <th class="py-3 px-4 text-left">Completion Rate</th>
              <th class="py-3 px-4 text-left">Avg. Completion %</th>
              <th class="py-3 px-4 text-left">Performance</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="branch in rangeData.branchStats" :key="branch.id" class="border-b">
              <td class="py-3 px-4 font-medium">{{ branch.branch_name }}</td>
              <td class="py-3 px-4">{{ branch.branch_code }}</td>
              <td class="py-3 px-4">{{ branch.total_sessions }}</td>
              <td class="py-3 px-4 font-medium text-green-600">{{ branch.completed_sessions }}</td>
              <td class="py-3 px-4">
                {{ calculatePercentage(branch.completed_sessions, branch.total_sessions) }}%
              </td>
              <td class="py-3 px-4">{{ formatPercentage(branch.avg_completion_percentage) }}%</td>
              <td class="py-3 px-4">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-green-500 h-2 rounded-full" 
                    :style="{ width: formatPercentage(branch.avg_completion_percentage) + '%' }"
                  ></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Ticket Statistics Chart -->
    <div v-if="rangeData && rangeData.ticketStats && !loading" class="bg-white shadow rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold mb-4">Daily Ticket Statistics</h3>
      <div class="h-80">
        <canvas ref="ticketChart"></canvas>
      </div>
    </div>
    
    <!-- User Performance (EOD) -->
    <div v-if="userPerformance && userPerformance.eodUserStats && !loading" class="bg-white shadow rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold mb-4">User EOD Performance</h3>
      
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-100">
            <tr>
              <th class="py-3 px-4 text-left">User</th>
              <th class="py-3 px-4 text-left">Role</th>
              <th class="py-3 px-4 text-left">Branch</th>
              <th class="py-3 px-4 text-left">Assigned</th>
              <th class="py-3 px-4 text-left">Completed</th>
              <th class="py-3 px-4 text-left">In Progress</th>
              <th class="py-3 px-4 text-left">Pending</th>
              <th class="py-3 px-4 text-left">Avg. Completion %</th>
              <th class="py-3 px-4 text-left">Avg. Time (min)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in userPerformance.eodUserStats" :key="user.id" class="border-b">
              <td class="py-3 px-4 font-medium">{{ user.full_name }}</td>
              <td class="py-3 px-4">{{ formatRole(user.role) }}</td>
              <td class="py-3 px-4">{{ user.branch_name || 'N/A' }}</td>
              <td class="py-3 px-4">{{ user.total_assigned }}</td>
              <td class="py-3 px-4 text-green-600 font-medium">{{ user.completed }}</td>
              <td class="py-3 px-4 text-blue-600">{{ user.in_progress }}</td>
              <td class="py-3 px-4 text-yellow-600">{{ user.pending }}</td>
              <td class="py-3 px-4">{{ formatPercentage(user.avg_completion_percentage) }}%</td>
              <td class="py-3 px-4">{{ formatMinutes(user.avg_completion_time_minutes) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- User Performance (Tickets) -->
    <div v-if="userPerformance && userPerformance.ticketUserStats && !loading" class="bg-white shadow rounded-lg p-6">
      <h3 class="text-xl font-semibold mb-4">User Ticket Performance</h3>
      
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-100">
            <tr>
              <th class="py-3 px-4 text-left">User</th>
              <th class="py-3 px-4 text-left">Role</th>
              <th class="py-3 px-4 text-left">Total Assigned</th>
              <th class="py-3 px-4 text-left">Resolved</th>
              <th class="py-3 px-4 text-left">In Progress</th>
              <th class="py-3 px-4 text-left">Pending</th>
              <th class="py-3 px-4 text-left">New</th>
              <th class="py-3 px-4 text-left">Resolution Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in userPerformance.ticketUserStats" :key="user.id" class="border-b">
              <td class="py-3 px-4 font-medium">{{ user.full_name }}</td>
              <td class="py-3 px-4">{{ formatRole(user.role) }}</td>
              <td class="py-3 px-4">{{ user.total_assigned_tickets }}</td>
              <td class="py-3 px-4 text-green-600 font-medium">{{ user.resolved_tickets }}</td>
              <td class="py-3 px-4 text-blue-600">{{ user.in_progress_tickets }}</td>
              <td class="py-3 px-4 text-yellow-600">{{ user.pending_tickets }}</td>
              <td class="py-3 px-4 text-purple-600">{{ user.new_tickets }}</td>
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-green-500 h-2 rounded-full" 
                      :style="{ width: calculatePercentage(user.resolved_tickets, user.total_assigned_tickets) + '%' }"
                    ></div>
                  </div>
                  <span>{{ calculatePercentage(user.resolved_tickets, user.total_assigned_tickets) }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useToast } from '@/composables/useToast';
import Chart from 'chart.js/auto';

// State
const startDate = ref('');
const endDate = ref('');
const rangeData = ref(null);
const userPerformance = ref(null);
const loading = ref(false);
const error = ref('');
const sessionChart = ref(null);
const ticketChart = ref(null);
const sessionChartInstance = ref(null);
const ticketChartInstance = ref(null);
const { showToast } = useToast();

// Computed
const today = computed(() => {
  const date = new Date();
  return date.toISOString().split('T')[0];
});

const daysCount = computed(() => {
  if (!rangeData.value || !rangeData.value.sessions) return 0;
  return rangeData.value.sessions.length;
});

const overallCompletionRate = computed(() => {
  if (!rangeData.value || !rangeData.value.sessions) return 0;
  
  let totalBranches = 0;
  let completedBranches = 0;
  
  rangeData.value.sessions.forEach(session => {
    totalBranches += session.total_branches || 0;
    completedBranches += session.completed_branches || 0;
  });
  
  if (totalBranches === 0) return 0;
  return Math.round((completedBranches / totalBranches) * 100);
});

const totalBranchCount = computed(() => {
  if (!rangeData.value || !rangeData.value.branchStats) return 0;
  return rangeData.value.branchStats.length;
});

const completedBranchCount = computed(() => {
  if (!rangeData.value || !rangeData.value.branchStats) return 0;
  
  return rangeData.value.branchStats.filter(branch => 
    branch.completed_sessions > 0
  ).length;
});

// Methods
const fetchDateRangeData = async () => {
  if (!startDate.value || !endDate.value) {
    error.value = 'Please select both start and end dates';
    return;
  }
  
  if (new Date(startDate.value) > new Date(endDate.value)) {
    error.value = 'Start date cannot be after end date';
    return;
  }
  
  error.value = '';
  loading.value = true;
  
  try {
    // Fetch range data
    const rangeResponse = await fetch(`https://ticket.laobullionbank.com/api/eod/range?startDate=${startDate.value}&endDate=${endDate.value}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const rangeResult = await rangeResponse.json();
    
    if (!rangeResponse.ok) {
      throw new Error(rangeResult.message || 'Failed to fetch EOD range data');
    }
    
    rangeData.value = rangeResult.data;
    
    // Fetch user performance data
    const perfResponse = await fetch(`https://ticket.laobullionbank.com/api/eod/performance?startDate=${startDate.value}&endDate=${endDate.value}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const perfResult = await perfResponse.json();
    
    if (!perfResponse.ok) {
      throw new Error(perfResult.message || 'Failed to fetch user performance data');
    }
    
    userPerformance.value = perfResult.data;
    
    showToast('EOD monitoring data loaded successfully', 'success');
    
    // Render charts after data is loaded
    nextTick(() => {
      renderSessionChart();
      renderTicketChart();
    });
  } catch (err) {
    error.value = err.message;
    showToast(err.message, 'error');
  } finally {
    loading.value = false;
  }
};

const renderSessionChart = () => {
  if (!rangeData.value || !rangeData.value.sessions || rangeData.value.sessions.length === 0) return;
  
  if (sessionChartInstance.value) {
    sessionChartInstance.value.destroy();
  }
  
  const ctx = sessionChart.value.getContext('2d');
  
  const labels = rangeData.value.sessions.map(session => formatDateShort(session.date));
  const completedData = rangeData.value.sessions.map(session => session.completed_branches || 0);
  const inProgressData = rangeData.value.sessions.map(session => session.in_progress_branches || 0);
  const pendingData = rangeData.value.sessions.map(session => session.pending_branches || 0);
  
  sessionChartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Completed',
          data: completedData,
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1
        },
        {
          label: 'In Progress',
          data: inProgressData,
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        },
        {
          label: 'Pending',
          data: pendingData,
          backgroundColor: 'rgba(234, 179, 8, 0.7)',
          borderColor: 'rgba(234, 179, 8, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Branches'
          }
        }
      }
    }
  });
};

const renderTicketChart = () => {
  if (!rangeData.value || !rangeData.value.ticketStats || rangeData.value.ticketStats.length === 0) return;
  
  if (ticketChartInstance.value) {
    ticketChartInstance.value.destroy();
  }
  
  const ctx = ticketChart.value.getContext('2d');
  
  const labels = rangeData.value.ticketStats.map(day => formatDateShort(day.date));
  const resolvedData = rangeData.value.ticketStats.map(day => day.resolved_tickets || 0);
  const newData = rangeData.value.ticketStats.map(day => day.new_tickets || 0);
  const inProgressData = rangeData.value.ticketStats.map(day => day.in_progress_tickets || 0);
  const pendingData = rangeData.value.ticketStats.map(day => day.pending_tickets || 0);
  
  ticketChartInstance.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Total Tickets',
          data: rangeData.value.ticketStats.map(day => day.total_tickets || 0),
          borderColor: 'rgba(107, 114, 128, 1)',
          backgroundColor: 'rgba(107, 114, 128, 0.2)',
          borderWidth: 2,
          tension: 0.1,
          fill: false
        },
        {
          label: 'Resolved',
          data: resolvedData,
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderWidth: 2,
          tension: 0.1,
          fill: false
        },
        {
          label: 'New',
          data: newData,
          borderColor: 'rgba(168, 85, 247, 1)',
          backgroundColor: 'rgba(168, 85, 247, 0.2)',
          borderWidth: 2,
          tension: 0.1,
          fill: false
        },
        {
          label: 'In Progress',
          data: inProgressData,
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderWidth: 2,
          tension: 0.1,
          fill: false
        },
        {
          label: 'Pending',
          data: pendingData,
          borderColor: 'rgba(234, 179, 8, 1)',
          backgroundColor: 'rgba(234, 179, 8, 0.2)',
          borderWidth: 2,
          tension: 0.1,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Tickets'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        }
      }
    }
  });
};

const setLastWeek = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);
  
  endDate.value = end.toISOString().split('T')[0];
  startDate.value = start.toISOString().split('T')[0];
  
  fetchDateRangeData();
};

const setLastMonth = () => {
  const end = new Date();
  const start = new Date();
  start.setMonth(end.getMonth() - 1);
  
  endDate.value = end.toISOString().split('T')[0];
  startDate.value = start.toISOString().split('T')[0];
  
  fetchDateRangeData();
};

const calculatePercentage = (value, total) => {
  if (!value || !total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

const formatPercentage = (value) => {
  if (!value) return 0;
  return Math.round(parseFloat(value));
};

const formatDateShort = (dateString) => {
  if (!dateString) return '';
  const options = { month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatMinutes = (minutes) => {
  if (!minutes) return 'N/A';
  return Math.round(parseFloat(minutes));
};

const formatRole = (role) => {
  if (!role) return '';
  
  switch (role) {
    case 'teller':
      return 'Teller';
    case 'branch_manager':
      return 'Branch Manager';
    case 'admin':
      return 'Admin';
    case 'super_admin':
      return 'Super Admin';
    case 'it_staff':
      return 'IT Staff';
    case 'user':
      return 'User';
    default:
      return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
};

// Initialize
onMounted(() => {
  // Set default date range to last 7 days
  setLastWeek();
});
</script>

<style scoped>
/* Add any additional component-specific styles here */
</style>