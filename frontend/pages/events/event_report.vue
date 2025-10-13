<template>
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto">
            <!-- Header with Sync Button -->
            <div class="mb-8 flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">Event Registration Report</h1>
                    <p class="text-gray-600">View and manage all event registrations</p>
                </div>
                <button @click="syncAllStatus" :disabled="syncing"
                    class="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg">
                    <svg v-if="syncing" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    <svg v-else class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                            clip-rule="evenodd" />
                    </svg>
                    {{ syncing ? 'Syncing...' : 'Sync All Status' }}
                </button>
            </div>

            <!-- Sync Results Alert - SIMPLIFIED -->
            <div v-if="syncResults"
                class="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg animate-fade-in">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <svg class="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                        <div>
                            <h3 class="text-lg font-semibold text-green-900">Sync Results Successful!</h3>
                            <p class="text-sm text-green-700 mt-1">
                                {{ syncResults.matched }} of {{ syncResults.total }} records matched and updated
                            </p>
                        </div>
                    </div>
                    <button @click="syncResults = null" class="text-green-400 hover:text-green-600 transition">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Statistics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Total Registrations</p>
                            <p class="text-2xl font-bold text-gray-900 mt-2">{{ statistics.total }}</p>
                        </div>
                        <div class="bg-blue-100 rounded-full p-3">
                            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Completed</p>
                            <p class="text-2xl font-bold text-green-600 mt-2">{{ statistics.completed }}</p>
                        </div>
                        <div class="bg-green-100 rounded-full p-3">
                            <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Pending</p>
                            <p class="text-2xl font-bold text-yellow-600 mt-2">{{ statistics.pending }}</p>
                        </div>
                        <div class="bg-yellow-100 rounded-full p-3">
                            <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                    clip-rule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Today</p>
                            <p class="text-2xl font-bold text-purple-600 mt-2">{{ statistics.today }}</p>
                        </div>
                        <div class="bg-purple-100 rounded-full p-3">
                            <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                    clip-rule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Rest of the existing code (Filters, Table, etc.) -->
            <!-- ... keep all existing code below ... -->

            <!-- Filters and Search -->
            <div class="bg-white rounded-lg shadow mb-6 p-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <!-- Search -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input v-model="filters.search" type="text" placeholder="Search by name, ticket, phone..."
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                    </div>

                    <!-- Event Filter -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                        <select v-model="filters.event"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                            <option value="">All Events</option>
                            <option v-for="event in uniqueEvents" :key="event" :value="event">
                                {{ event }}
                            </option>
                        </select>
                    </div>

                    <!-- Status Filter -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Download Status</label>
                        <select v-model="filters.download_status"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                            <option value="">All Status</option>
                            <option value="true">True</option>
                            <option value="false">False</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-end gap-2">
                        <button @click="resetFilters"
                            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                            Reset
                        </button>
                        <button @click="exportToCSV"
                            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                    clip-rule="evenodd" />
                            </svg>
                            Export
                        </button>
                    </div>
                </div>
            </div>

            <!-- Data Table -->
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <!-- Loading State -->
                <div v-if="loading" class="text-center py-12">
                    <svg class="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    <p class="mt-4 text-gray-600">Loading data...</p>
                </div>

                <!-- Empty State -->
                <div v-else-if="filteredData.length === 0" class="text-center py-12">
                    <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p class="text-gray-600">No registrations found</p>
                </div>

                <!-- Table -->
                <div v-else class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ticket ID
                                </th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Full Name
                                </th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Phone
                                </th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Event
                                </th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created Date
                                </th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="item in paginatedData" :key="item.id" class="hover:bg-gray-50 transition">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {{ item.id }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="text-sm font-medium text-blue-600">{{ item.ticket_id }}</span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {{ item.fullname }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {{ item.phone }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <span class="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                        {{ item.event || 'N/A' }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span :class="{
                                        'bg-green-100 text-green-800': item.download_status === 'true' || item.download_status === 'completed',
                                        'bg-gray-100 text-gray-800': item.download_status === 'false' || item.download_status === 'pending'
                                    }" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                                        {{ item.download_status }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {{ formatDate(item.created_date) }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button @click="syncSingleItem(item.id)"
                                        class="text-purple-600 hover:text-purple-900 mr-3" title="Sync this item">
                                        Sync
                                    </button>
                                    <button @click="viewDetails(item)" class="text-blue-600 hover:text-blue-900 mr-3">
                                        View
                                    </button>
                                    <button @click="deleteItem(item.id)" class="text-red-600 hover:text-red-900">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div v-if="filteredData.length > 0" class="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="text-sm text-gray-700">
                            Showing <span class="font-medium">{{ startIndex + 1 }}</span> to
                            <span class="font-medium">{{ Math.min(endIndex, filteredData.length) }}</span> of
                            <span class="font-medium">{{ filteredData.length }}</span> results
                        </div>
                        <div class="flex gap-2">
                            <button @click="currentPage--" :disabled="currentPage === 1"
                                class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
                                Previous
                            </button>
                            <button v-for="page in displayPages" :key="page" @click="currentPage = page" :class="{
                                'bg-blue-600 text-white': currentPage === page,
                                'bg-white text-gray-700 hover:bg-gray-50': currentPage !== page
                            }" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition">
                                {{ page }}
                            </button>
                            <button @click="currentPage++" :disabled="currentPage === totalPages"
                                class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detail Modal (keep existing modal code) -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            @click="closeModal">
            <div @click.stop class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-6">
                        <h2 class="text-2xl font-bold text-gray-900">Registration Details</h2>
                        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    <div v-if="selectedItem" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-600">ID</label>
                                <p class="mt-1 text-lg font-semibold text-gray-900">{{ selectedItem.id }}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-600">Ticket ID</label>
                                <p class="mt-1 text-lg font-semibold text-blue-600">{{ selectedItem.ticket_id }}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-600">Full Name</label>
                                <p class="mt-1 text-lg text-gray-900">{{ selectedItem.fullname }}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-600">Phone Number</label>
                                <p class="mt-1 text-lg text-gray-900">{{ selectedItem.phone }}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-600">Event</label>
                                <p class="mt-1 text-lg text-gray-900">{{ selectedItem.event || 'N/A' }}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-600">Download Status</label>
                                <span :class="{
                                    'bg-green-100 text-green-800': selectedItem.download_status === 'true' || selectedItem.download_status === 'completed',
                                    'bg-gray-100 text-gray-800': selectedItem.download_status === 'false' || selectedItem.download_status === 'pending'
                                }" class="mt-1 inline-block px-3 py-1 text-sm font-semibold rounded-full">
                                    {{ selectedItem.download_status }}
                                </span>
                            </div>
                            <div class="col-span-2">
                                <label class="block text-sm font-medium text-gray-600">Created Date</label>
                                <p class="mt-1 text-lg text-gray-900">{{ formatDate(selectedItem.created_date) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

// API Base URL
const config = useRuntimeConfig();
const apiBase = 'http://localhost:9000/api'; //config.public.apiBase || 'http://localhost:9000/api';

// State
const loading = ref(false);
const syncing = ref(false);
const registrations = ref([]);
const filters = ref({
    search: '',
    event: '',
    download_status: ''
});

// Sync results
const syncResults = ref(null);
const showSyncDetails = ref(false);

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Modal
const showModal = ref(false);
const selectedItem = ref(null);

// Load data on mount
onMounted(() => {
    loadData();
});

// Watch filters and reset to page 1
watch(filters, () => {
    currentPage.value = 1;
}, { deep: true });

// Load registrations
const loadData = async () => {
    loading.value = true;
    try {
        const response = await fetch(`${apiBase}/events`);
        const data = await response.json();

        if (data.success) {
            registrations.value = data.data;
        }
    } catch (error) {
        console.error('Error loading data:', error);
    } finally {
        loading.value = false;
    }
};

// Sync all status
const syncAllStatus = async () => {
    if (!confirm('This will check all phone numbers against the external API and update statuses. Continue?')) {
        return;
    }

    syncing.value = true;
    syncResults.value = null;
    showSyncDetails.value = false;

    try {
        const response = await fetch(`${apiBase}/events/sync/all`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            syncResults.value = data.results;
            showSyncDetails.value = true;

            // Reload data to show updated statuses
            await loadData();
        } else {
            alert('Sync failed: ' + data.message);
        }
    } catch (error) {
        console.error('Error syncing:', error);
        alert('Error during sync process');
    } finally {
        syncing.value = false;
    }
};

// Sync single item
const syncSingleItem = async (id) => {
    try {
        const response = await fetch(`${apiBase}/events/sync/${id}`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            if (data.matched) {
                alert(`Phone matched! Status updated to completed.\nCustomer: ${data.customer.name}`);
            } else {
                alert('Phone not found in external system.');
            }

            // Reload data
            await loadData();
        } else {
            alert('Sync failed: ' + data.message);
        }
    } catch (error) {
        console.error('Error syncing:', error);
        alert('Error during sync');
    }
};

// Statistics
const statistics = computed(() => {
    const total = registrations.value.length;
    const completed = registrations.value.filter(r =>
        r.download_status === 'true' || r.download_status === 'completed'
    ).length;
    const pending = registrations.value.filter(r =>
        r.download_status === 'false' || r.download_status === 'pending'
    ).length;

    const today = new Date().toDateString();
    const todayCount = registrations.value.filter(r => {
        const regDate = new Date(r.created_date).toDateString();
        return regDate === today;
    }).length;

    return { total, completed, pending, today: todayCount };
});

// Unique events for filter
const uniqueEvents = computed(() => {
    const events = registrations.value
        .map(r => r.event)
        .filter(e => e);
    return [...new Set(events)];
});

// Filtered data
const filteredData = computed(() => {
    let data = [...registrations.value];

    // Search filter
    if (filters.value.search) {
        const search = filters.value.search.toLowerCase();
        data = data.filter(item =>
            item.fullname?.toLowerCase().includes(search) ||
            item.ticket_id?.toLowerCase().includes(search) ||
            item.phone?.toString().includes(search) ||
            item.event?.toLowerCase().includes(search)
        );
    }

    // Event filter
    if (filters.value.event) {
        data = data.filter(item => item.event === filters.value.event);
    }

    // Status filter
    if (filters.value.download_status) {
        data = data.filter(item => item.download_status === filters.value.download_status);
    }

    return data;
});

// Pagination
const totalPages = computed(() => {
    return Math.ceil(filteredData.value.length / itemsPerPage.value);
});

const startIndex = computed(() => {
    return (currentPage.value - 1) * itemsPerPage.value;
});

const endIndex = computed(() => {
    return startIndex.value + itemsPerPage.value;
});

const paginatedData = computed(() => {
    return filteredData.value.slice(startIndex.value, endIndex.value);
});

const displayPages = computed(() => {
    const pages = [];
    const maxPages = 5;
    let start = Math.max(1, currentPage.value - Math.floor(maxPages / 2));
    let end = Math.min(totalPages.value, start + maxPages - 1);

    if (end - start + 1 < maxPages) {
        start = Math.max(1, end - maxPages + 1);
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return pages;
});

// Reset filters
const resetFilters = () => {
    filters.value = {
        search: '',
        event: '',
        download_status: ''
    };
    currentPage.value = 1;
};

// Export to CSV
const exportToCSV = () => {
    const headers = ['ID', 'Ticket ID', 'Full Name', 'Phone', 'Event', 'Download Status', 'Created Date'];
    const csvContent = [
        headers.join(','),
        ...filteredData.value.map(item => [
            item.id,
            item.ticket_id,
            `"${item.fullname}"`,
            item.phone,
            `"${item.event || 'N/A'}"`,
            item.download_status,
            `"${formatDate(item.created_date)}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `event_registrations_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// View details
const viewDetails = (item) => {
    selectedItem.value = item;
    showModal.value = true;
};

// Close modal
const closeModal = () => {
    showModal.value = false;
    selectedItem.value = null;
};

// Delete item
const deleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this registration?')) {
        return;
    }

    try {
        const response = await fetch(`${apiBase}/events/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            alert('Registration deleted successfully');
            await loadData();
        } else {
            alert('Failed to delete registration');
        }
    } catch (error) {
        console.error('Error deleting:', error);
        alert('Error deleting registration');
    }
};

// Format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
</script>

<style scoped>
@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fade-in 0.3s ease-out;
}
</style>