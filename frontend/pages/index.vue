<script setup>
import { useAuth } from '~/composables/useAuth'
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import {
  TicketIcon,
  FolderOpenIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  FireIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/vue/24/outline'

const config = useRuntimeConfig()
const auth = useAuth()
const route = useRoute()

// Safe default structure
const dashboardData = ref({
  summary: {
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0
  },
  recentTickets: [],
  ticketsByStatus: [],
  ticketsByPriority: [],
  ticketsByDepartment: [],
  ticketsByDate: [],
  userInfo: {
    id: null,
    role: '',
    timeframe: 'all'
  }
})

// For charts
const chartData = ref({
  statusData: { labels: [], values: [] },
  priorityData: { labels: [], values: [] },
  timelineData: { labels: [], values: [] }
})

// Timeframe options
const selectedTimeframe = ref('all')
const timeframeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'Last 7 Days' },
  { value: 'monthly', label: 'Last 30 Days' }
]

const loading = ref(true)
const error = ref(null)

// Chart refs for accessing in methods
const statusChartRef = ref(null)
const priorityChartRef = ref(null)
const timelineChartRef = ref(null)
const chartsInitialized = ref(false)
const chartLoaded = ref(false) // Track if Chart.js has been loaded

// Modern chart colors with gold theme
const chartColors = {
  status: {
    backgroundColor: [
      'rgba(234, 179, 8, 0.85)',     // Gold (for New)
      'rgba(59, 130, 246, 0.85)',    // Blue (for In Progress)
      'rgba(249, 115, 22, 0.85)',    // Orange (for Pending)
      'rgba(16, 185, 129, 0.85)',    // Emerald (for Resolved)
      'rgba(107, 114, 128, 0.85)',   // Gray (for Closed)
    ],
    borderColor: [
      'rgb(234, 179, 8)',            // Gold
      'rgb(59, 130, 246)',           // Blue
      'rgb(249, 115, 22)',           // Orange
      'rgb(16, 185, 129)',           // Emerald
      'rgb(107, 114, 128)',          // Gray
    ],
    hoverBackgroundColor: [
      'rgba(234, 179, 8, 1)',        // Gold (brighten on hover)
      'rgba(59, 130, 246, 1)',       // Blue
      'rgba(249, 115, 22, 1)',       // Orange
      'rgba(16, 185, 129, 1)',       // Emerald
      'rgba(107, 114, 128, 1)',      // Gray
    ],
    hoverBorderColor: [
      'rgb(254, 240, 138)',          // Gold highlight
      'rgb(147, 197, 253)',          // Blue highlight
      'rgb(254, 215, 170)',          // Orange highlight
      'rgb(167, 243, 208)',          // Emerald highlight
      'rgb(209, 213, 219)',          // Gray highlight
    ]
  },
  priority: {
    backgroundColor: [
      'rgba(220, 38, 38, 0.85)',     // Red (for Critical)
      'rgba(234, 179, 8, 0.85)',     // Gold (for High)
      'rgba(249, 115, 22, 0.85)',    // Orange (for Medium)
      'rgba(16, 185, 129, 0.85)',    // Emerald (for Low)
    ],
    borderColor: [
      'rgb(220, 38, 38)',            // Red
      'rgb(234, 179, 8)',            // Gold
      'rgb(249, 115, 22)',           // Orange
      'rgb(16, 185, 129)',           // Emerald
    ],
    hoverBackgroundColor: [
      'rgba(220, 38, 38, 1)',        // Red (brighten on hover)
      'rgba(234, 179, 8, 1)',        // Gold
      'rgba(249, 115, 22, 1)',       // Orange
      'rgba(16, 185, 129, 1)',       // Emerald
    ],
    hoverBorderColor: [
      'rgb(254, 202, 202)',          // Red highlight
      'rgb(254, 240, 138)',          // Gold highlight
      'rgb(254, 215, 170)',          // Orange highlight
      'rgb(167, 243, 208)',          // Emerald highlight
    ]
  },
  timeline: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',  // Gold background with low opacity
    borderColor: 'rgb(234, 179, 8)',             // Gold line
    pointBackgroundColor: 'rgb(234, 179, 8)',    // Gold points
    pointBorderColor: 'white'                    // White border for points
  }
}

// For user role display
const userRole = computed(() => {
  if (!dashboardData.value?.userInfo) return 'all';
  return dashboardData.value.userInfo.role === 'user' ? 'your' : 'all';
})

// Clean up charts when component unmounts or before recreating
const destroyCharts = () => {
  if (!process.client) return;
  
  try {
    // Check if status chart exists
    if (statusChartRef.value && statusChartRef.value._chart) {
      statusChartRef.value._chart.destroy();
      statusChartRef.value._chart = null;
    }
    
    // Check if priority chart exists
    if (priorityChartRef.value && priorityChartRef.value._chart) {
      priorityChartRef.value._chart.destroy();
      priorityChartRef.value._chart = null;
    }
    
    // Check if timeline chart exists
    if (timelineChartRef.value && timelineChartRef.value._chart) {
      timelineChartRef.value._chart.destroy();
      timelineChartRef.value._chart = null;
    }
    
    chartsInitialized.value = false;
  } catch (err) {
    console.error("Error destroying charts:", err);
  }
}

// Update charts when data changes
const updateCharts = () => {
  destroyCharts();
  
  // Re-initialize charts
  initializeCharts();
}

// Fetch dashboard data with timeframe
const fetchDashboardData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Check for token
    const token = auth.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    // API call
    const response = await fetch(`${config.public.apiBase}/dashboard?timeframe=${selectedTimeframe.value}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    // Process the response
    const data = await response.json();
    
    // Extract and process the data with safe defaults
    const processedData = {
      summary: {
        total: data.summary?.total || 0,
        open: data.summary?.open || 0,
        inProgress: data.summary?.inProgress || 0,
        closed: data.summary?.closed || 0
      },
      recentTickets: Array.isArray(data.recentTickets) ? data.recentTickets : [],
      ticketsByStatus: Array.isArray(data.ticketsByStatus) ? data.ticketsByStatus : [],
      ticketsByPriority: Array.isArray(data.ticketsByPriority) ? data.ticketsByPriority : [],
      ticketsByDepartment: Array.isArray(data.ticketsByDepartment) ? data.ticketsByDepartment : [],
      ticketsByDate: Array.isArray(data.ticketsByDate) ? data.ticketsByDate : [],
      userInfo: data.userInfo || { id: null, role: '', timeframe: selectedTimeframe.value }
    };
    
    // If no timeline data, generate sample data
    if (!processedData.ticketsByDate.length) {
      processedData.ticketsByDate = generateSampleTimelineData(selectedTimeframe.value, processedData.summary.total);
    }
    
    // Update the reactive state
    dashboardData.value = processedData;
    
    // Prepare chart data
    prepareChartData();
    
    // Initialize or update charts
    if (process.client) {
      if (chartLoaded.value) {
        // If Chart.js is already loaded, just update the charts
        if (chartsInitialized.value) {
          updateCharts();
        } else {
          initializeCharts();
        }
      } else {
        // If Chart.js isn't loaded yet, load it (it will initialize charts on load)
        loadChartJs();
      }
    }
  } catch (err) {
    error.value = err.message || 'An error occurred';
    console.error('Dashboard error:', err);
    if (err.message === 'Not authenticated') {
      auth.logout();
    }
  } finally {
    loading.value = false;
  }
};

// Prepare data for charts
const prepareChartData = () => {
  // Status chart data
  if (dashboardData.value.ticketsByStatus?.length) {
    chartData.value.statusData = {
      labels: dashboardData.value.ticketsByStatus.map(item => item.status || 'Unknown'),
      values: dashboardData.value.ticketsByStatus.map(item => item.count || 0)
    };
  }
  
  // Priority chart data
  if (dashboardData.value.ticketsByPriority?.length) {
    chartData.value.priorityData = {
      labels: dashboardData.value.ticketsByPriority.map(item => item.priority || 'Unknown'),
      values: dashboardData.value.ticketsByPriority.map(item => item.count || 0)
    };
  }
  
  // Timeline chart data
  if (dashboardData.value.ticketsByDate?.length) {
    chartData.value.timelineData = {
      labels: dashboardData.value.ticketsByDate.map(item => item.date || ''),
      values: dashboardData.value.ticketsByDate.map(item => item.count || 0)
    };
  }
};

// Generate sample timeline data
const generateSampleTimelineData = (timeframe, totalTickets = 10) => {
  const data = [];
  const today = new Date();
  
  let days = 30;
  if (timeframe === 'daily') days = 1;
  if (timeframe === 'weekly') days = 7;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate some random data
    const count = Math.floor(Math.random() * (Math.max(totalTickets, 10) / days)) + 1;
    
    data.push({
      date: formatDate(date),
      count: count
    });
  }
  
  return data;
};

// Load Chart.js
const loadChartJs = () => {
  if (!process.client) return;
  
  // Skip if already loaded
  if (window.Chart) {
    chartLoaded.value = true;
    initializeCharts();
    return;
  }
  
  // Create script element
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
  script.async = true;
  script.onload = () => {
    // Register necessary components
    window.Chart.register(
      window.Chart.CategoryScale,
      window.Chart.LinearScale,
      window.Chart.PointElement,
      window.Chart.LineElement,
      window.Chart.ArcElement,
      window.Chart.Tooltip,
      window.Chart.Legend,
      window.Chart.Filler
    );
    
    // Set chart loaded flag
    chartLoaded.value = true;
    
    // Initialize charts
    initializeCharts();
  };
  
  // Append script to document
  document.head.appendChild(script);
};

// Initialize charts
const initializeCharts = () => {
  if (!process.client || !window.Chart) return;
  
  try {
    // Status chart
    if (statusChartRef.value && chartData.value.statusData.labels.length) {
      // Destroy existing chart if any
      if (statusChartRef.value._chart) {
        statusChartRef.value._chart.destroy();
      }
      
      statusChartRef.value._chart = new window.Chart(statusChartRef.value, {
        type: 'doughnut',
        data: {
          labels: chartData.value.statusData.labels,
          datasets: [{
            data: chartData.value.statusData.values,
            backgroundColor: chartColors.status.backgroundColor,
            borderColor: chartColors.status.borderColor,
            hoverBackgroundColor: chartColors.status.hoverBackgroundColor,
            hoverBorderColor: chartColors.status.hoverBorderColor,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 15,
                padding: 15,
                font: { 
                  size: 12,
                  weight: 'bold'
                },
                color: '#334155' // slate-700
              }
            },
            tooltip: {
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
              titleFont: { size: 14, weight: 'bold' },
              bodyFont: { size: 13 },
              bodySpacing: 4,
              padding: 12,
              displayColors: true,
              boxWidth: 10,
              boxHeight: 10,
              boxPadding: 3,
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          },
          cutout: '65%',
          animation: {
            animateScale: true,
            animateRotate: true,
            duration: 800,
            easing: 'easeOutQuart'
          }
        }
      });
    }
    
    // Priority chart
    if (priorityChartRef.value && chartData.value.priorityData.labels.length) {
      // Destroy existing chart if any
      if (priorityChartRef.value._chart) {
        priorityChartRef.value._chart.destroy();
      }
      
      priorityChartRef.value._chart = new window.Chart(priorityChartRef.value, {
        type: 'doughnut',
        data: {
          labels: chartData.value.priorityData.labels,
          datasets: [{
            data: chartData.value.priorityData.values,
            backgroundColor: chartColors.priority.backgroundColor,
            borderColor: chartColors.priority.borderColor,
            hoverBackgroundColor: chartColors.priority.hoverBackgroundColor,
            hoverBorderColor: chartColors.priority.hoverBorderColor,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 15,
                padding: 15,
                font: { 
                  size: 12,
                  weight: 'bold' 
                },
                color: '#334155' // slate-700
              }
            },
            tooltip: {
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
              titleFont: { size: 14, weight: 'bold' },
              bodyFont: { size: 13 },
              bodySpacing: 4,
              padding: 12,
              displayColors: true,
              boxWidth: 10,
              boxHeight: 10,
              boxPadding: 3,
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          },
          cutout: '65%',
          animation: {
            animateScale: true,
            animateRotate: true,
            duration: 800,
            easing: 'easeOutQuart'
          }
        }
      });
    }
    
    // Timeline chart
    if (timelineChartRef.value && chartData.value.timelineData.labels.length) {
      // Destroy existing chart if any
      if (timelineChartRef.value._chart) {
        timelineChartRef.value._chart.destroy();
      }
      
      timelineChartRef.value._chart = new window.Chart(timelineChartRef.value, {
        type: 'line',
        data: {
          labels: chartData.value.timelineData.labels,
          datasets: [{
            label: 'Tickets Created',
            data: chartData.value.timelineData.values,
            backgroundColor: chartColors.timeline.backgroundColor,
            borderColor: chartColors.timeline.borderColor,
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: chartColors.timeline.pointBackgroundColor,
            pointBorderColor: chartColors.timeline.pointBorderColor,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: chartColors.timeline.borderColor,
            pointHoverBorderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
              titleFont: { size: 14, weight: 'bold' },
              bodyFont: { size: 13 },
              padding: 12,
              callbacks: {
                label: function(context) {
                  return `Tickets: ${context.raw}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { 
                display: false,
                drawBorder: false
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                color: '#64748b', // slate-500
                font: {
                  size: 11
                }
              }
            },
            y: {
              beginAtZero: true,
              grid: { 
                color: 'rgba(226, 232, 240, 0.6)',
                drawBorder: false
              },
              ticks: { 
                precision: 0,
                color: '#64748b', // slate-500
                font: {
                  size: 11
                },
                padding: 8
              }
            }
          },
          interaction: {
            mode: 'index',
            intersect: false
          },
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          }
        }
      });
    }
    
    chartsInitialized.value = true;
  } catch (err) {
    console.error('Error initializing charts:', err);
  }
};

// Get timeframe label for display
const getTimeframeLabel = () => {
  const option = timeframeOptions.find(opt => opt.value === selectedTimeframe.value);
  return option ? option.label : 'All Time';
};

// Handle timeframe change
const handleTimeframeChange = () => {
  fetchDashboardData();
};

// Format date helper
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Status color helper
const getStatusColor = (status) => {
  const colors = {
    'New': 'bg-blue-50 text-blue-700 ring-blue-600/20',
    'In Progress': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    'Pending': 'bg-orange-50 text-orange-700 ring-orange-600/20',
    'Closed': 'bg-gray-50 text-gray-700 ring-gray-600/20',
    'Resolved': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
  };
  return colors[status] || 'bg-gray-50 text-gray-700 ring-gray-600/20';
};

// Priority color helper
const getPriorityColor = (priority) => {
  const colors = {
    'High': 'text-rose-600',
    'Medium': 'text-amber-600',
    'Low': 'text-emerald-600',
    'Critical': 'text-red-600'
  };
  return colors[priority] || 'text-gray-600';
};

// Add watch for timeframe changes
watch(selectedTimeframe, () => {
  handleTimeframeChange();
});

// Update data when page becomes visible again
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    // Only reload if we're on dashboard route
    if (route.name === 'dashboard' || route.path === '/dashboard') {
      fetchDashboardData();
    }
  }
};

// Lifecycle hooks
onMounted(() => {
  if (process.client) {
    fetchDashboardData();
    
    // Handle page visibility changes (when user returns to tab)
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
});

// Watch for route changes
watch(() => route.fullPath, () => {
  // Only refresh if we're on the dashboard route
  if (route.name === 'dashboard' || route.path === '/dashboard') {
    fetchDashboardData();
  }
});

// Cleanup when component is unmounted
onUnmounted(() => {
  destroyCharts();
  
  if (process.client) {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Modern Header with Gradient -->
    <div class="bg-white shadow-sm rounded-b-xl mb-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex flex-col gap-2">
            <h1 class="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Support Dashboard
            </h1>
            <p class="text-gray-600">
              {{ userRole }} support ticket metrics and analytics
            </p>
          </div>
          
          <!-- Timeframe Filter -->
          <div class="flex items-center gap-4 bg-white rounded-lg border border-yellow-200 p-2 shadow-sm">
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <CalendarIcon class="h-5 w-5 text-yellow-500" />
              <span>Time Period:</span>
            </div>
            <select
              v-model="selectedTimeframe"
              @change="handleTimeframeChange"
              class="rounded-lg border border-yellow-200 bg-white px-3 py-2 text-sm focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
            >
              <option v-for="option in timeframeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <!-- Loading State -->
      <div v-if="loading" 
           class="flex items-center justify-center min-h-[400px]">
        <div class="flex flex-col items-center gap-4">
          <div class="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p class="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" 
           class="mt-6 bg-red-50 border border-red-200 p-6 rounded-xl">
        <div class="flex items-start">
          <ExclamationCircleIcon class="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
          <div>
            <h3 class="text-lg font-medium text-red-800">An error occurred</h3>
            <p class="mt-1 text-red-700">{{ error }}</p>
            <button @click="fetchDashboardData" class="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              <ArrowPathIcon class="h-4 w-4 mr-1" />
              Retry
            </button>
          </div>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="space-y-8">
        <!-- Selected Timeframe Display -->
        <div class="bg-yellow-50 rounded-lg p-3 flex items-center border border-yellow-100">
          <ClockIcon class="h-5 w-5 text-yellow-600 mr-2" />
          <span class="text-yellow-700 font-medium">Showing data for: {{ getTimeframeLabel() }}</span>
        </div>
        
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <!-- Total Tickets -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
            <div class="p-5">
              <div class="flex items-center gap-4">
                <div class="flex-shrink-0">
                  <div class="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                    <TicketIcon class="h-6 w-6 text-white" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-500">Total Tickets</p>
                  <p class="mt-1 text-2xl font-semibold text-gray-900">
                    {{ dashboardData.summary.total }}
                  </p>
                </div>
              </div>
            </div>
            <div class="h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          </div>

          <!-- Open Tickets -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
            <div class="p-5">
              <div class="flex items-center gap-4">
                <div class="flex-shrink-0">
                  <div class="p-3 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                    <FolderOpenIcon class="h-6 w-6 text-white" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-500">Open Tickets</p>
                  <p class="mt-1 text-2xl font-semibold text-gray-900">
                    {{ dashboardData.summary.open }}
                  </p>
                </div>
              </div>
            </div>
            <div class="h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
          </div>

          <!-- In Progress -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
            <div class="p-5">
              <div class="flex items-center gap-4">
                <div class="flex-shrink-0">
                  <div class="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                    <ArrowPathIcon class="h-6 w-6 text-white" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-500">In Progress</p>
                  <p class="mt-1 text-2xl font-semibold text-gray-900">
                    {{ dashboardData.summary.inProgress }}
                  </p>
                </div>
              </div>
            </div>
            <div class="h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
          </div>

          <!-- Closed -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
            <div class="p-5">
              <div class="flex items-center gap-4">
                <div class="flex-shrink-0">
                  <div class="p-3 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg">
                    <CheckCircleIcon class="h-6 w-6 text-white" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-500">Closed Tickets</p>
                  <p class="mt-1 text-2xl font-semibold text-gray-900">
                    {{ dashboardData.summary.closed }}
                  </p>
                </div>
              </div>
            </div>
            <div class="h-1 bg-gradient-to-r from-gray-500 to-gray-600"></div>
          </div>
        </div>

        <!-- Ticket Timeline Chart -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-5 border-b border-gray-100 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <div class="p-1.5 bg-yellow-100 rounded-lg">
                <ChartBarIcon class="h-5 w-5 text-yellow-600" />
              </div>
              <h2 class="text-lg font-semibold text-gray-900">Ticket Timeline</h2>
            </div>
            <div class="flex items-center gap-1 text-sm text-yellow-600 font-medium">
              <ArrowTrendingUpIcon class="h-4 w-4" />
              <span>Ticket Volume Over Time</span>
            </div>
          </div>
          
          <div class="p-5">
            <div v-if="chartData.timelineData.labels.length === 0" class="text-center text-gray-500 py-8">
              <p>No timeline data available for the selected time period.</p>
            </div>
            <div v-else class="h-72">
              <canvas ref="timelineChartRef" width="400" height="200"></canvas>
            </div>
          </div>
        </div>

        <!-- Status and Priority Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Status Distribution -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-5 border-b border-gray-100">
              <div class="flex items-center gap-2">
                <div class="p-1.5 bg-yellow-100 rounded-lg">
                  <ChartBarIcon class="h-5 w-5 text-yellow-600" />
                </div>
                <h2 class="text-lg font-semibold text-gray-900">Tickets by Status</h2>
              </div>
            </div>
            
            <div class="p-5">
              <div v-if="chartData.statusData.labels.length === 0" class="text-center text-gray-500 py-8">
                <p>No data available for the selected time period.</p>
              </div>
              <div v-else class="h-64 relative">
                <!-- Gold decorative element -->
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div class="w-16 h-16 rounded-full bg-yellow-100 opacity-30"></div>
                </div>
                <!-- Chart -->
                <canvas ref="statusChartRef" width="400" height="200"></canvas>
              </div>
            </div>
          </div>
          
          <!-- Priority Distribution -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-5 border-b border-gray-100">
              <div class="flex items-center gap-2">
                <div class="p-1.5 bg-yellow-100 rounded-lg">
                  <FireIcon class="h-5 w-5 text-yellow-600" />
                </div>
                <h2 class="text-lg font-semibold text-gray-900">Tickets by Priority</h2>
              </div>
            </div>
            
            <div class="p-5">
              <div v-if="chartData.priorityData.labels.length === 0" class="text-center text-gray-500 py-8">
                <p>No data available for the selected time period.</p>
              </div>
              <div v-else class="h-64 relative">
                <!-- Gold decorative element -->
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div class="w-16 h-16 rounded-full bg-yellow-100 opacity-30"></div>
                </div>
                <!-- Chart -->
                <canvas ref="priorityChartRef" width="400" height="200"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Tickets -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-900">Recent Tickets</h2>
            
            <!-- Ownership Label -->
            <div v-if="dashboardData.userInfo && dashboardData.userInfo.role && dashboardData.userInfo.role !== 'admin' && dashboardData.userInfo.role !== 'super_admin'" 
                 class="text-sm bg-yellow-50 text-yellow-700 py-1 px-3 rounded-full border border-yellow-200">
              Your Tickets Only
            </div>
          </div>
          
          <!-- No Tickets Message -->
          <div v-if="!dashboardData.recentTickets || dashboardData.recentTickets.length === 0" class="p-6 text-center text-gray-500">
            <p>No tickets found for the selected time period.</p>
          </div>
          
          <div v-else class="divide-y divide-gray-100">
            <div v-for="ticket in dashboardData.recentTickets" 
                 :key="ticket.id" 
                 class="p-5 hover:bg-gray-50/50 transition-colors">
              <div class="flex items-center gap-6">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3">
                    <NuxtLink 
                      :to="`/tickets/${ticket.id}`" 
                      class="text-base font-medium text-indigo-600 hover:text-indigo-700 truncate">
                      {{ ticket.title }}
                    </NuxtLink>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset"
                          :class="getStatusColor(ticket.status)">
                      {{ ticket.status }}
                    </span>
                    
                    <!-- Priority Indicator -->
                    <span v-if="ticket.priority === 'High' || ticket.priority === 'Critical'" 
                          class="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                      <FireIcon class="h-3 w-3 mr-1" />
                      {{ ticket.priority }}
                    </span>
                  </div>
                  
                  <div class="mt-1 flex items-center gap-4 text-sm text-gray-500">
                    <div class="flex items-center gap-1.5">
                      <ClockIcon class="h-4 w-4" />
                      {{ formatDate(ticket.created_at) }}
                    </div>
                    <div class="flex items-center gap-1.5">
                      <UserIcon class="h-4 w-4" />
                      {{ ticket.created_by }}
                    </div>
                    <div class="flex items-center gap-1.5">
                      <BuildingOfficeIcon class="h-4 w-4" />
                      {{ ticket.department || 'General' }}
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center gap-4">
                  <span v-if="ticket.priority !== 'High' && ticket.priority !== 'Critical'"
                        :class="getPriorityColor(ticket.priority)" 
                        class="text-sm font-medium">
                    {{ ticket.priority }}
                  </span>
                  <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          
          <!-- View All Link -->
          <div class="bg-gray-50 px-5 py-3 text-center">
            <NuxtLink to="/tickets" class="text-sm text-indigo-600 font-medium hover:text-indigo-500">
              View all tickets
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations and transitions */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.pulse-animation {
  animation: pulse 2s infinite;
}

/* Gold shimmer animation */
@keyframes shimmer {
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.gold-shimmer {
  background: linear-gradient(90deg, 
    rgba(251, 191, 36, 0) 0%, 
    rgba(251, 191, 36, 0.4) 50%, 
    rgba(251, 191, 36, 0) 100%);
  background-size: 200% 100%;
  animation: shimmer 3s infinite;
}

/* Smoother transitions */
.transition-all {
  transition-duration: 300ms;
}

/* Better box shadows */
.shadow-custom {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Gradient text */
.gradient-text {
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  background-image: linear-gradient(to right, #f59e0b, #d97706);
}
</style>