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
  BuildingOfficeIcon
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
  ticketsByDepartment: []
})

const loading = ref(true)
const error = ref(null)

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const token = auth.getToken()
    if (!token) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`${config.public.apiBase}/dashboard`, {
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
  <div class="min-h-screen ">
    <!-- Modern Header with Gradient -->
    <div class="bg-white border-b border-gray-200 rounded-lg" >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col gap-2">
          <h1 class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p class="text-gray-600">
            Monitor and manage your support ticket metrics
          </p>
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
          <div class="p-6 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">Recent Tickets</h2>
          </div>
          <div class="divide-y divide-gray-100">
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
      </div>
    </div>
  </div>
</template>