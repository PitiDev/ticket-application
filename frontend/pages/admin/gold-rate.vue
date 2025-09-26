<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white shadow-sm border-b">
            <div class="max-w-4xl mx-auto px-6 py-8">
                <h1 class="text-3xl font-bold text-gray-900 text-center">
                    Gold price on Database LBB PLUS
                </h1>
                <p class="text-center text-gray-600 mt-2">Real-time precious metal pricing</p>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-20">
            <div class="w-8 h-8 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin"></div>
            <p class="mt-4 text-gray-600">Loading current gold rates...</p>
        </div>

        <!-- Error State -->
        <div v-if="error && !loading" class="max-w-md mx-auto mt-16 px-6">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <h3 class="text-lg font-medium text-red-800 mb-2">Unable to Load Rates</h3>
                <p class="text-red-600 mb-4 text-sm">{{ error }}</p>
                <button @click="fetchGoldRate"
                    class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors">
                    Try Again
                </button>
            </div>
        </div>

        <!-- Main Content -->
        <div v-if="!loading && !error && goldData" class="max-w-4xl mx-auto px-6 py-8">

            <!-- Last Updated -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center bg-white rounded-lg px-4 py-2 shadow-sm border">
                    <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div>
                        <p class="text-sm text-gray-600">Last Updated</p>
                        <p class="text-sm font-medium text-gray-900">{{ goldData.date }}</p>
                    </div>
                </div>
            </div>

            <!-- Currency -->
            <div class="text-center mb-8">
                <span class="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
                    Currency: {{ goldData.currency }}
                </span>
            </div>

            <!-- Rate Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <!-- Buy Rate -->
                <div class="bg-white rounded-lg shadow-sm border p-6 text-center">
                    <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Buy Rate</h3>
                    <p class="text-sm text-gray-600 mb-4">We buy gold at</p>
                    <p class="text-2xl font-bold text-green-600">{{ goldData.buy_rate }}</p>
                </div>

                <!-- Mid Rate -->
                <div class="bg-white rounded-lg shadow-sm border p-6 text-center">
                    <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z">
                            </path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Mid Rate</h3>
                    <p class="text-sm text-gray-600 mb-4">Market average</p>
                    <p class="text-2xl font-bold text-amber-600">{{ goldData.mid_rate }}</p>
                </div>

                <!-- Sell Rate -->
                <div class="bg-white rounded-lg shadow-sm border p-6 text-center">
                    <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Sell Rate</h3>
                    <p class="text-sm text-gray-600 mb-4">We sell gold at</p>
                    <p class="text-2xl font-bold text-red-600">{{ goldData.sell_rate }}</p>
                </div>
            </div>
            <br>

            <!-- Gold Products for Sale -->
            <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <h3 class="text-lg font-medium text-gray-900 mb-6">Gold Products for Sale on LBB Plus</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <!-- 1 Gram -->
                    <div class="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-amber-200 p-4 text-center hover:shadow-md transition-shadow">
                        <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border">
                            <img 
                                src="https://www.laobullionbank.com/assets/1g-C1AmXkhF.png" 
                                alt="1 Gram Gold Bar" 
                                class="w-12 h-12 object-contain"
                                loading="lazy"
                            />
                        </div>
                        <h4 class="text-sm font-medium text-gray-900 mb-1">1 Gram Gold</h4>
                        <p class="text-xs text-gray-600 mb-3">Pure Gold Bar</p>
                        <p class="text-lg font-bold text-amber-700">{{ calculateProductPrice(1) }} KIP</p>
                    </div>

                    <!-- 7.5 Gram -->
                    <div class="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-amber-200 p-4 text-center hover:shadow-md transition-shadow">
                        <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border">
                            <img 
                                src="https://www.laobullionbank.com/assets/7.5g-C4JRkOmf.png" 
                                alt="7.5 Gram Gold Bar" 
                                class="w-12 h-12 object-contain"
                                loading="lazy"
                            />
                        </div>
                        <h4 class="text-sm font-medium text-gray-900 mb-1">7.5 Gram Gold</h4>
                        <p class="text-xs text-gray-600 mb-3">Premium Gold Bar</p>
                        <p class="text-lg font-bold text-amber-700">{{ calculateProductPrice(7.5) }} KIP</p>
                    </div>

                    <!-- 15 Gram -->
                    <div class="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-amber-200 p-4 text-center hover:shadow-md transition-shadow">
                        <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border">
                            <img 
                                src="https://www.laobullionbank.com/assets/15g-CGj_SW6L.png" 
                                alt="15 Gram Gold Bar" 
                                class="w-12 h-12 object-contain"
                                loading="lazy"
                            />
                        </div>
                        <h4 class="text-sm font-medium text-gray-900 mb-1">15 Gram Gold</h4>
                        <p class="text-xs text-gray-600 mb-3">Investment Gold Bar</p>
                        <p class="text-lg font-bold text-amber-700">{{ calculateProductPrice(15) }} KIP</p>
                    </div>

                    <!-- 30 Gram -->
                    <div class="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-amber-200 p-4 text-center hover:shadow-md transition-shadow">
                        <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border">
                            <img 
                                src="https://www.laobullionbank.com/assets/30g-CnlpE0US.png" 
                                alt="30 Gram Gold Bar" 
                                class="w-12 h-12 object-contain"
                                loading="lazy"
                            />
                        </div>
                        <h4 class="text-sm font-medium text-gray-900 mb-1">30 Gram Gold</h4>
                        <p class="text-xs text-gray-600 mb-3">Premium Investment Bar</p>
                        <p class="text-lg font-bold text-amber-700">{{ calculateProductPrice(30) }} KIP</p>
                    </div>
                </div>
                <div class="mt-4 text-center">
                </div>
            </div>

            <!-- Rate Analysis -->
            <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Rate Analysis</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-3">
                        <h4 class="text-sm font-medium text-gray-700">Spread Information</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-600">Buy-Sell Spread:</span>
                                <span class="font-medium text-gray-900">{{ calculateSpread() }}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-600">Spread Percentage:</span>
                                <span class="font-medium text-gray-900">{{ calculateSpreadPercentage() }}%</span>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <h4 class="text-sm font-medium text-gray-700">Market Status</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-600">Status:</span>
                                <span class="font-medium text-green-600">Active</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-600">Position:</span>
                                <span class="font-medium text-gray-900">Balanced</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Reactive data
const goldData = ref(null)
const loading = ref(false)
const error = ref('')
const refreshInterval = ref(null)

// API configuration
const API_URL = 'http://172.16.0.46:3000/api/gold/price'

// Fetch gold rate data
const fetchGoldRate = async () => {
    loading.value = true
    error.value = ''

    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.success) {
            goldData.value = result.data
        } else {
            throw new Error(result.message || 'Failed to fetch gold rates')
        }
    } catch (err) {
        console.error('Error fetching gold rates:', err)
        error.value = err.message || 'Failed to load gold rates. Please try again.'
    } finally {
        loading.value = false
    }
}

// Calculate spread between buy and sell rates
const calculateSpread = () => {
    if (!goldData.value) return 'N/A'

    const buyRate = parseFloat(goldData.value.buy_rate.replace(/[^\d.-]/g, ''))
    const sellRate = parseFloat(goldData.value.sell_rate.replace(/[^\d.-]/g, ''))

    const spread = sellRate - buyRate
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(spread).replace('$', 'LBI ')
}

// Calculate spread percentage
const calculateSpreadPercentage = () => {
    if (!goldData.value) return 'N/A'

    const buyRate = parseFloat(goldData.value.buy_rate.replace(/[^\d.-]/g, ''))
    const sellRate = parseFloat(goldData.value.sell_rate.replace(/[^\d.-]/g, ''))
    const midRate = parseFloat(goldData.value.mid_rate.replace(/[^\d.-]/g, ''))

    const spreadPercentage = ((sellRate - buyRate) / midRate) * 100
    return spreadPercentage.toFixed(2)
}

// Calculate product price based on weight and sell rate
const calculateProductPrice = (weightInGrams) => {
    if (!goldData.value) return 'N/A'

    // Extract numeric value from sell rate (assuming it's per gram)
    const sellRatePerGram = parseFloat(goldData.value.sell_rate.replace(/[^\d.-]/g, ''))

    // Calculate total price for the weight
    const totalPrice = sellRatePerGram * weightInGrams

    // Format as KIP currency
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(totalPrice)
}

// Auto-refresh every 5 minutes
const startAutoRefresh = () => {
    refreshInterval.value = setInterval(() => {
        fetchGoldRate()
    }, 5 * 60 * 1000) // 5 minutes
}

// Stop auto-refresh
const stopAutoRefresh = () => {
    if (refreshInterval.value) {
        clearInterval(refreshInterval.value)
        refreshInterval.value = null
    }
}

// Page meta
definePageMeta({
    layout: 'empty',
    title: 'Gold Price Database - LBB PLUS',
    description: 'Real-time gold prices from LBB PLUS database'
})

// Lifecycle hooks
onMounted(() => {
    fetchGoldRate()
    startAutoRefresh()
})

onUnmounted(() => {
    stopAutoRefresh()
})
</script>

<style scoped>
/* Clean, minimal styling with subtle shadows */
.shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Simple hover effects */
button:hover:not(:disabled) {
    transform: translateY(-1px);
}

button {
    transition: all 0.2s ease;
}

/* Image optimization */
img {
    transition: transform 0.2s ease;
}

.hover\:shadow-md:hover img {
    transform: scale(1.05);
}
</style>