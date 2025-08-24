<script setup>
import { useAuth } from '~/composables/useAuth'
import {
  TicketIcon,
  FolderOpenIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  AdjustmentsHorizontalIcon, // เพิ่มไอคอนสำหรับตัวกรอง
  CalendarIcon // เพิ่มไอคอนสำหรับปฏิทิน
} from '@heroicons/vue/24/outline'

const config = useRuntimeConfig()
const auth = useAuth()

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
  userInfo: {
    id: null,
    role: '',
    timeframe: 'all'
  }
})

// เพิ่มตัวแปรสำหรับจัดการตัวกรองเวลา
const selectedTimeframe = ref('all')
const timeframeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'Last 7 Days' },
  { value: 'monthly', label: 'Last 30 Days' }
]

const loading = ref(true)
const error = ref(null)

// Fetch dashboard data with timeframe
const fetchDashboardData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const token = auth.getToken()
    if (!token) {
      throw new Error('Not authenticated')
    }

    // เพิ่ม parameter timeframe ในการเรียก API
    const response = await fetch(`${config.public.apiBase}/dashboard?timeframe=${selectedTimeframe.value}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data')
    }

    const data = await response.json()
    dashboardData.value = data
  } catch (err) {
    error.value = err.message
    console.error('Dashboard error:', err)
    if (err.message === 'Not authenticated') {
      auth.logout()
    }
  } finally {
    loading.value = false
  }
}

// แสดงผลรายละเอียดของข้อมูลตามเวลาที่เลือก
const getTimeframeLabel = () => {
  const option = timeframeOptions.find(opt => opt.value === selectedTimeframe.value)
  return option ? option.label : 'All Time'
}

// เมื่อมีการเปลี่ยนตัวกรองเวลา
const handleTimeframeChange = () => {
  fetchDashboardData()
}

// Format date helper
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Status color helper
const getStatusColor = (status) => {
  const colors = {
    'New': 'bg-blue-50 text-blue-700 ring-blue-600/20',
    'In Progress': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    'Pending': 'bg-orange-50 text-orange-700 ring-orange-600/20',
    'Closed': 'bg-gray-50 text-gray-700 ring-gray-600/20',
    'Resolved': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
  }
  return colors[status] || 'bg-gray-50 text-gray-700 ring-gray-600/20'
}

// Priority color helper
const getPriorityColor = (priority) => {
  const colors = {
    'High': 'text-rose-600',
    'Medium': 'text-amber-600',
    'Low': 'text-emerald-600',
    'Critical': 'text-red-600'
  }
  return colors[priority] || 'text-gray-600'
}

// Add route middleware
definePageMeta({
  middleware: ['auth']
})

// Fetch data on mount
onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Modern Header with Gradient -->
    <div class="bg-white border-b border-gray-200 rounded-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-2">
            <h1 class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p class="text-gray-600">
              {{ dashboardData.userInfo && dashboardData.userInfo.role === 'user' ? 'Your' : 'All' }} support ticket metrics
            </p>
          </div>
          
          <!-- Timeframe Filter -->
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <CalendarIcon class="h-5 w-5" />
              <span>Time Period:</span>
            </div>
            <select
              v-model="selectedTimeframe"
              @change="handleTimeframeChange"
              class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
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
      <div v-if="loading" 
           class="flex items-center justify-center min-h-[400px]">
        <div class="flex flex-col items-center gap-4">
          <ArrowPathIcon class="w-12 h-12 animate-spin text-indigo-600" />
          <p class="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" 
           class="mt-6 bg-red-50 border border-red-200 p-6 rounded-xl">
        <p class="text-red-700 font-medium">{{ error }}</p>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="space-y-8">
        <!-- Selected Timeframe Display -->
        <div class="bg-indigo-50 rounded-lg p-3 flex items-center">
          <ClockIcon class="h-5 w-5 text-indigo-600 mr-2" />
          <span class="text-indigo-700 font-medium">Showing data for: {{ getTimeframeLabel() }}</span>
        </div>
        
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total Tickets -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div class="p-6">
              <div class="flex items-center gap-4">
                <div class="flex-shrink-0">
                  <div class="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                    <TicketIcon class="h-6 w-6 text-white" />
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-500">Total Tickets</p>
                  <p class="mt-1 text-2xl font-semibold text-gray-900">
                    {{ dashboardData.summary.total }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Open Tickets -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div class="p-6">
              <div class="flex items-center gap-4">
                <div class="flex-shrink-0">
                  <div class="p-3 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600">
                    <FolderOpenIcon class="h-6 w-6 text-white" />
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-500">Open Tickets</p>
                  <p class="mt-1 text-2xl font-semibold text-gray-900">
                    {{ dashboardData.summary.open }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- In Progress -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div class="p-6">
              <div class="flex items-center gap-4">
                <div class="flex-shrink-0">
                  <div class="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                    <ArrowPathIcon class="h-6 w-6 text-white" />
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-500">In Progress</p>
                  <p class="mt-1 text-2xl font-semibold text-gray-900">
                    {{ dashboardData.summary.inProgress }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Closed -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div class="p-6">
              <div class="flex items-center gap-4">
                <div class="flex-shrink-0">
                  <div class="p-3 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600">
                    <CheckCircleIcon class="h-6 w-6 text-white" />
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-500">Closed Tickets</p>
                  <p class="mt-1 text-2xl font-semibold text-gray-900">
                    {{ dashboardData.summary.closed }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Tickets -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-900">Recent Tickets</h2>
            
            <!-- Ownership Label -->
            <div v-if="dashboardData.userInfo && dashboardData.userInfo.role !== 'admin' && dashboardData.userInfo.role !== 'super_admin'" 
                 class="text-sm bg-indigo-50 text-indigo-700 py-1 px-3 rounded-full">
              Your Tickets Only
            </div>
          </div>
          
          <!-- No Tickets Message -->
          <div v-if="dashboardData.recentTickets.length === 0" class="p-6 text-center text-gray-500">
            <p>No tickets found for the selected time period.</p>
          </div>
          
          <div v-else class="divide-y divide-gray-100">
            <div v-for="ticket in dashboardData.recentTickets" 
                 :key="ticket.id" 
                 class="p-6 hover:bg-gray-50/50 transition-colors">
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
                  <span :class="getPriorityColor(ticket.priority)" 
                        class="text-sm font-medium">
                    {{ ticket.priority }}
                  </span>
                  <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Data Distribution Charts (สามารถเพิ่ม chart หรือ visualization ตรงนี้) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Status Distribution -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Tickets by Status</h2>
            <!-- ตรงนี้สามารถเพิ่ม chart แสดงการกระจายตัวของ ticket ตาม status -->
            <div v-if="dashboardData.ticketsByStatus.length === 0" class="text-center text-gray-500 py-8">
              <p>No data available for the selected time period.</p>
            </div>
            <div v-else>
              <div v-for="status in dashboardData.ticketsByStatus" :key="status.status" 
                   class="flex items-center justify-between mb-2 p-2 rounded-lg" 
                   :class="getStatusColor(status.status)">
                <span>{{ status.status }}</span>
                <span class="font-semibold">{{ status.count }}</span>
              </div>
            </div>
          </div>
          
          <!-- Priority Distribution -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Tickets by Priority</h2>
            <!-- ตรงนี้สามารถเพิ่ม chart แสดงการกระจายตัวของ ticket ตาม priority -->
            <div v-if="dashboardData.ticketsByPriority.length === 0" class="text-center text-gray-500 py-8">
              <p>No data available for the selected time period.</p>
            </div>
            <div v-else>
              <div v-for="priority in dashboardData.ticketsByPriority" :key="priority.priority" 
                   class="flex items-center justify-between mb-2 p-2 rounded-lg bg-gray-50">
                <span :class="getPriorityColor(priority.priority)">{{ priority.priority }}</span>
                <span class="font-semibold">{{ priority.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>