<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import {
  ChartBarIcon,
  UserGroupIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  TrophyIcon,
  ExclamationCircleIcon
} from '@heroicons/vue/24/outline';

definePageMeta({
  middleware: 'auth'
});

const config = useRuntimeConfig();
const auth = useAuth();
const toast = useToast();

// State
const loading = ref(true);
const reportData = ref(null);
const selectedTimeframe = ref('all');
const selectedView = ref('overview'); // 'overview', 'assignees', 'reporters'

// Chart refs
const assigneeChartRef = ref(null);
const reporterChartRef = ref(null);
const departmentChartRef = ref(null);
const performanceChartRef = ref(null);
const chartsLoaded = ref(false);

// Timeframe options
const timeframeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'Last 7 Days' },
  { value: 'monthly', label: 'Last 30 Days' }
];

// View options
const viewOptions = [
  { value: 'overview', label: 'Overview', icon: ChartBarIcon },
  { value: 'assignees', label: 'Assignees', icon: UserGroupIcon },
  { value: 'reporters', label: 'Reporters', icon: UserIcon }
];

// Chart colors
const chartColors = {
  primary: 'rgba(234, 179, 8, 0.8)',
  secondary: 'rgba(239, 68, 68, 0.8)',
  success: 'rgba(34, 197, 94, 0.8)',
  info: 'rgba(59, 130, 246, 0.8)',
  warning: 'rgba(249, 115, 22, 0.8)',
};

// Fetch report data
const fetchReportData = async () => {
  try {
    loading.value = true;

    const token = auth.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${config.public.apiBase}/reports/users?timeframe=${selectedTimeframe.value}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch report data');
    }

    const data = await response.json();
    reportData.value = data;

    // Initialize charts after data is loaded
    if (process.client) {
      await nextTick();
      loadChartJs();
    }
  } catch (error) {
    console.error('Error fetching reports:', error);
    toast.error('Failed to load reports');
  } finally {
    loading.value = false;
  }
};

// Load Chart.js
const loadChartJs = async () => {
  if (!process.client) return;

  if (window.Chart) {
    chartsLoaded.value = true;
    await nextTick();
    await initializeCharts();
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
  script.async = true;
  script.onload = async () => {
    window.Chart.register(
      window.Chart.CategoryScale,
      window.Chart.LinearScale,
      window.Chart.PointElement,
      window.Chart.LineElement,
      window.Chart.BarElement,
      window.Chart.ArcElement,
      window.Chart.Tooltip,
      window.Chart.Legend,
      window.Chart.Filler
    );

    chartsLoaded.value = true;

    // Wait for next tick to ensure DOM is ready
    await nextTick();

    // Initialize charts with retry
    await initializeCharts();
  };
  document.head.appendChild(script);
};

// Initialize charts with retry logic
const initializeCharts = async (retryCount = 0) => {
  if (!process.client || !window.Chart || !reportData.value) return;

  await nextTick();

  const maxRetries = 3;
  const canvasRefsReady = assigneeChartRef.value && reporterChartRef.value && departmentChartRef.value;

  if (!canvasRefsReady && retryCount < maxRetries) {
    console.log(`Charts not ready, retrying... (attempt ${retryCount + 1}/${maxRetries})`);
    setTimeout(() => initializeCharts(retryCount + 1), 100);
    return;
  }

  try {
    // Top Assignees Chart
    if (assigneeChartRef.value && reportData.value.assignees?.length) {
      // Ensure the canvas is in the DOM
      if (!document.contains(assigneeChartRef.value)) {
        console.warn('Assignee chart canvas not yet in DOM');
        if (retryCount < maxRetries) {
          setTimeout(() => initializeCharts(retryCount + 1), 100);
        }
        return;
      }

      const top10Assignees = reportData.value.assignees.slice(0, 10);

      if (assigneeChartRef.value._chart) {
        assigneeChartRef.value._chart.destroy();
      }

      assigneeChartRef.value._chart = new window.Chart(assigneeChartRef.value, {
        type: 'bar',
        data: {
          labels: top10Assignees.map(a => a.full_name || a.username),
          datasets: [{
            label: 'Total Tickets',
            data: top10Assignees.map(a => a.total_tickets),
            backgroundColor: chartColors.primary,
            borderColor: 'rgb(234, 179, 8)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              bodySpacing: 4
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 }
            }
          }
        }
      });
    }

    // Top Reporters Chart
    if (reporterChartRef.value && reportData.value.reporters?.length) {
      // Ensure the canvas is in the DOM
      if (!document.contains(reporterChartRef.value)) {
        console.warn('Reporter chart canvas not yet in DOM');
        if (retryCount < maxRetries) {
          setTimeout(() => initializeCharts(retryCount + 1), 100);
        }
        return;
      }

      const top10Reporters = reportData.value.reporters.slice(0, 10);

      if (reporterChartRef.value._chart) {
        reporterChartRef.value._chart.destroy();
      }

      reporterChartRef.value._chart = new window.Chart(reporterChartRef.value, {
        type: 'bar',
        data: {
          labels: top10Reporters.map(r => r.full_name || r.username),
          datasets: [{
            label: 'Tickets Created',
            data: top10Reporters.map(r => r.total_tickets),
            backgroundColor: chartColors.secondary,
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              bodySpacing: 4
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 }
            }
          }
        }
      });
    }

    // Department Performance Chart
    if (departmentChartRef.value && reportData.value.departments?.length) {
      // Ensure the canvas is in the DOM
      if (!document.contains(departmentChartRef.value)) {
        console.warn('Department chart canvas not yet in DOM');
        if (retryCount < maxRetries) {
          setTimeout(() => initializeCharts(retryCount + 1), 100);
        }
        return;
      }

      if (departmentChartRef.value._chart) {
        departmentChartRef.value._chart.destroy();
      }

      departmentChartRef.value._chart = new window.Chart(departmentChartRef.value, {
        type: 'doughnut',
        data: {
          labels: reportData.value.departments.map(d => d.department_name || 'Unknown'),
          datasets: [{
            data: reportData.value.departments.map(d => d.total_tickets),
            backgroundColor: [
              chartColors.primary,
              chartColors.secondary,
              chartColors.success,
              chartColors.info,
              chartColors.warning
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { padding: 15, font: { size: 12 } }
            }
          }
        }
      });
    }

    chartsLoaded.value = true;
  } catch (error) {
    console.error('Error initializing charts:', error);
  }
};

// Format numbers
const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num || 0);
};

// Format hours to readable time
const formatHours = (hours) => {
  if (!hours) return 'N/A';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

// Get user initials
const getUserInitials = (user) => {
  if (user.full_name) {
    const names = user.full_name.split(' ');
    return names.map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2);
  }
  return user.username.charAt(0).toUpperCase();
};

// Handle timeframe change
const handleTimeframeChange = async () => {
  await fetchReportData();
};

// Watch reportData for changes and reinitialize charts
watch(() => reportData.value, async (newData) => {
  if (newData && process.client && window.Chart) {
    await nextTick();
    await initializeCharts();
  }
}, { deep: true });

// Lifecycle
onMounted(() => {
  fetchReportData();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-amber-200 dark:border-gray-700 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-300">
              User performance and ticket statistics
            </p>
          </div>

          <!-- Timeframe Selector -->
          <div class="flex items-center gap-3 bg-amber-50 dark:bg-gray-700 rounded-lg border border-amber-200 dark:border-gray-600 p-2">
            <CalendarIcon class="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <select
              v-model="selectedTimeframe"
              @change="handleTimeframeChange"
              class="rounded-lg border-0 bg-transparent text-gray-900 dark:text-gray-100 text-sm font-medium focus:ring-2 focus:ring-amber-500 transition-colors"
            >
              <option v-for="option in timeframeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="flex flex-col items-center gap-3">
          <ArrowPathIcon class="w-12 h-12 animate-spin text-amber-600 dark:text-amber-500" />
          <p class="text-gray-600 dark:text-gray-400">Loading reports...</p>
        </div>
      </div>

      <!-- Report Content -->
      <div v-else-if="reportData" class="space-y-8">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total Assignees -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-amber-100 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Active Assignees</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {{ formatNumber(reportData.summary?.total_assignees) }}
                </p>
              </div>
              <div class="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <UserGroupIcon class="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          <!-- Total Reporters -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-100 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Reporters</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {{ formatNumber(reportData.summary?.total_reporters) }}
                </p>
              </div>
              <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <UserIcon class="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <!-- Avg Response Time -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-blue-100 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Response Time</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {{ formatHours(reportData.summary?.avg_resolution_time_hours) }}
                </p>
              </div>
              <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ClockIcon class="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <!-- Resolution Rate -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-green-100 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Resolution Rate</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {{ Math.round(reportData.summary?.resolution_rate || 0) }}%
                </p>
              </div>
              <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircleIcon class="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Top Assignees Chart -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-amber-100 dark:border-gray-700 overflow-hidden">
            <div class="p-6 border-b border-gray-100 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <TrophyIcon class="h-6 w-6 text-amber-600 dark:text-amber-400" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Top 10 Assignees</h3>
              </div>
            </div>
            <div class="p-6">
              <div class="h-80">
                <canvas ref="assigneeChartRef"></canvas>
              </div>
            </div>
          </div>

          <!-- Top Reporters Chart -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-100 dark:border-gray-700 overflow-hidden">
            <div class="p-6 border-b border-gray-100 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <UserIcon class="h-6 w-6 text-red-600 dark:text-red-400" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Top 10 Reporters</h3>
              </div>
            </div>
            <div class="p-6">
              <div class="h-80">
                <canvas ref="reporterChartRef"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Department Distribution -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-amber-100 dark:border-gray-700 overflow-hidden">
          <div class="p-6 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-3">
              <BuildingOfficeIcon class="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Tickets by Department</h3>
            </div>
          </div>
          <div class="p-6">
            <div class="h-80">
              <canvas ref="departmentChartRef"></canvas>
            </div>
          </div>
        </div>

        <!-- Detailed Tables -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Assignee Details -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-amber-100 dark:border-gray-700 overflow-hidden">
            <div class="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Assignee Performance</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resolved</th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Time</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="assignee in reportData.assignees?.slice(0, 10)" :key="assignee.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-3">
                        <div class="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 flex items-center justify-center">
                          <span class="text-sm font-medium text-amber-800 dark:text-amber-300">
                            {{ getUserInitials(assignee) }}
                          </span>
                        </div>
                        <div>
                          <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {{ assignee.full_name || assignee.username }}
                          </div>
                          <div class="text-xs text-gray-500 dark:text-gray-400">{{ assignee.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ assignee.total_tickets }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <span class="text-sm text-green-600 dark:text-green-400 font-medium">{{ assignee.resolved_tickets }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <span class="text-sm text-gray-600 dark:text-gray-300">{{ formatHours(assignee.avg_response_time_hours) }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Reporter Details -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-100 dark:border-gray-700 overflow-hidden">
            <div class="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Reporters</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resolved</th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">High Priority</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="reporter in reportData.reporters?.slice(0, 10)" :key="reporter.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-3">
                        <div class="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 flex items-center justify-center">
                          <span class="text-sm font-medium text-red-800 dark:text-red-300">
                            {{ getUserInitials(reporter) }}
                          </span>
                        </div>
                        <div>
                          <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {{ reporter.full_name || reporter.username }}
                          </div>
                          <div class="text-xs text-gray-500 dark:text-gray-400">{{ reporter.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ reporter.total_tickets }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <span class="text-sm text-green-600 dark:text-green-400 font-medium">{{ reporter.resolved_tickets }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <span class="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400 font-medium">
                        <ExclamationCircleIcon class="h-4 w-4" />
                        {{ reporter.high_priority_count }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background-color: #f3f4f6;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #d97706, #b45309);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #b45309, #92400e);
}

/* Dark mode scrollbar */
.dark ::-webkit-scrollbar-track {
  background-color: #374151;
}
</style>
