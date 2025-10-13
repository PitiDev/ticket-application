<template>
    <div class="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50 py-12 px-4">
        <div class="max-w-6xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1
                    class="text-5xl font-bold bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent mb-4">
                    LBB PLUS
                </h1>
                <p class="text-gray-600 text-lg">Download Statistics Report</p>
            </div>

            <!-- Loading State -->
            <div v-if="pending" class="text-center py-20">
                <div
                    class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent">
                </div>
                <p class="mt-4 text-gray-600">Loading data...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                <p class="text-red-600 text-lg">Failed to load download statistics</p>
                <p class="text-red-500 mt-2">{{ error.message }}</p>
            </div>

            <!-- Data Display -->
            <div v-else-if="data && data[0]" class="space-y-8">
                <!-- Stats Cards -->
                <div class="grid md:grid-cols-2 gap-6">
                    <!-- iOS Card -->
                    <div
                        class="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div class="flex items-center justify-between mb-6">
                            <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4">
                                <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                                </svg>
                            </div>
                            <div class="text-right">
                                <p class="text-gray-500 text-sm font-medium uppercase tracking-wider">iOS Downloads</p>
                                <p
                                    class="text-5xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent mt-2">
                                    {{ formatNumber(data[0].ios) }}
                                </p>
                            </div>
                        </div>
                        <div class="h-2 bg-gradient-to-r from-red-500 to-red-400 rounded-full"></div>
                    </div>

                    <!-- Android Card -->
                    <div
                        class="bg-white rounded-2xl shadow-xl p-8 border-2 border-amber-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div class="flex items-center justify-between mb-6">
                            <div class="bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl p-4">
                                <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M17.6 9.48L16.85 8.73L15.5 9.48V7.73L14.73 6.98L12 4.98L9.27 6.98L8.5 7.73V9.48L7.15 8.73L6.4 9.48L4 11.88V19.58C4 20.92 5.08 22 6.42 22H17.58C18.92 22 20 20.92 20 19.58V11.88L17.6 9.48ZM7.5 18.08V13.58L9.07 15.15L7.5 18.08ZM8.93 11.38L12 8.31L15.07 11.38L12 14.45L8.93 11.38ZM16.5 18.08L14.93 15.15L16.5 13.58V18.08Z" />
                                    <path d="M18 6.08L16.66 4.74L15.32 6.08L16.66 7.42L18 6.08Z" />
                                    <path d="M8.68 6.08L7.34 4.74L6 6.08L7.34 7.42L8.68 6.08Z" />
                                </svg>
                            </div>
                            <div class="text-right">
                                <p class="text-gray-500 text-sm font-medium uppercase tracking-wider">Android Downloads
                                </p>
                                <p
                                    class="text-5xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent mt-2">
                                    {{ formatNumber(data[0].android) }}
                                </p>
                            </div>
                        </div>
                        <div class="h-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"></div>
                    </div>
                </div>

                <!-- Total Summary Card -->
                <div class="bg-gradient-to-r from-red-600 to-amber-500 rounded-2xl shadow-2xl p-8 text-white">
                    <div class="flex flex-col md:flex-row items-center justify-between">
                        <div>
                            <p class="text-red-100 text-sm font-medium uppercase tracking-wider mb-2">Total Downloads
                            </p>
                            <p class="text-6xl font-bold">{{ formatNumber(totalDownloads) }}</p>
                        </div>
                        <div class="mt-6 md:mt-0 text-center md:text-right">
                            <p class="text-red-100 text-sm font-medium uppercase tracking-wider mb-2">Last Updated</p>
                            <p class="text-2xl font-semibold">{{ formatDate(data[0].update_date) }}</p>
                        </div>
                    </div>
                </div>

                <!-- Breakdown Chart Visual -->
                <div class="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
                    <h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">Platform Distribution</h3>
                    <div class="space-y-4">
                        <div>
                            <div class="flex justify-between mb-2">
                                <span class="text-gray-700 font-medium">iOS</span>
                                <span class="text-red-600 font-bold">{{ iosPercentage }}%</span>
                            </div>
                            <div class="h-6 bg-gray-200 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-1000"
                                    :style="{ width: iosPercentage + '%' }"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between mb-2">
                                <span class="text-gray-700 font-medium">Android</span>
                                <span class="text-amber-600 font-bold">{{ androidPercentage }}%</span>
                            </div>
                            <div class="h-6 bg-gray-200 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-1000"
                                    :style="{ width: androidPercentage + '%' }"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>

definePageMeta({
    layout: 'empty',
});
// Fetch data from API
const { data, pending, error } = await useFetch('http://202.62.106.154:5173/apis/downloads/lbbplus')

// Computed properties
const totalDownloads = computed(() => {
    if (!data.value || !data.value[0]) return 0
    return data.value[0].ios + data.value[0].android
})

const iosPercentage = computed(() => {
    if (!data.value || !data.value[0]) return 0
    const total = totalDownloads.value
    return total > 0 ? ((data.value[0].ios / total) * 100).toFixed(1) : 0
})

const androidPercentage = computed(() => {
    if (!data.value || !data.value[0]) return 0
    const total = totalDownloads.value
    return total > 0 ? ((data.value[0].android / total) * 100).toFixed(1) : 0
})

// Helper functions
const formatNumber = (num) => {
    return num.toLocaleString()
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}
</script>