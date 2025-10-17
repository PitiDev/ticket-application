<template>
  <div ref="reportContent" class="min-h-screen from-gray-50 to-gray-100">
    <div>
      <!-- Header -->
      <div class="bg-gradient-to-r rounded-lg from-red-500 via-red-400 to-amber-500 shadow-xl shadow-yello-500/20">
        <div class="px-6 py-8 text-center">
          <h1 class="flex items-center justify-center gap-3 text-3xl font-bold text-white drop-shadow-lg">
            <span class="text-4xl">
              <img src="assets/images/lbb_plus_gold.png" alt="" class="w-12 h-12">
            </span>
            LBB Plus Banking Report
          </h1>
          <p class="mt-2 text-yellow-100 font-medium">ລາຍງານພາບລວມຂອງທຸລະກຳຜ່ານ LBB Plus Mobile Application</p>
        </div>
      </div>
      <br>

      <!-- Date Range Controls -->
      <div class="bg-white border-b border-gray-200 shadow-sm sticky rounded-lg">
        <div class="px-6 py-4 max-w-7xl mx-auto">
          <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div class="flex flex-col sm:flex-row gap-4 items-center">
              <!-- Quick Presets -->
              <div class="flex flex-wrap gap-2">
                <button v-for="preset in datePresets" :key="preset.label" @click="setDatePreset(preset)" :class="[
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200',
                  selectedPreset === preset.label
                    ? 'bg-yellow-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700'
                ]">
                  {{ preset.label }}
                </button>
              </div>
            </div>

            <!-- Custom Date Inputs -->
            <div class="flex flex-col sm:flex-row gap-3 items-center">
              <div class="flex items-center gap-2">
                <label class="text-sm font-medium text-gray-700 whitespace-nowrap">Start Date:</label>
                <input v-model="startDate" type="date" @change="onDateChange"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
              </div>
              <div class="flex items-center gap-2">
                <label class="text-sm font-medium text-gray-700 whitespace-nowrap">End Date:</label>
                <input v-model="endDate" type="date" @change="onDateChange"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
              </div>
              <button @click="applyDateFilter" :disabled="loading || !startDate || !endDate"
                class="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                🔍 Apply Filter
              </button>
            </div>
          </div>

          <!-- Date Range Display -->
          <div v-if="startDate && endDate" class="mt-3 flex items-center justify-center">
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm">
              <span class="text-yellow-800 font-medium">
                📊 Showing data from {{ formatDateDisplay(startDate) }} to {{ formatDateDisplay(endDate) }}
              </span>
              <span class="ml-2 text-yellow-600">({{ getDateRangeDays() }} days)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 px-5">
        <div class="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
        <p class="text-gray-600 text-lg">Loading filtered reports...</p>
        <p class="text-gray-500 text-sm">{{ loadingMessage }}</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="flex flex-col items-center justify-center py-20 px-5 text-center">
        <div class="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <p class="text-red-600 mb-4 font-medium">{{ error }}</p>
          <button @click="fetchAllData"
            class="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200">
            🔄 Retry
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div v-if="isLoggedIn && !loading && !error" class="p-6 space-y-8 max-w-7xl mx-auto">

        <!-- Summary Stats Bar -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div class="space-y-2">
              <div class="text-2xl font-bold text-green-800">
                {{ (transactionStatusSummary?.buyCompleted || 0) + (transactionStatusSummary?.sellCompleted || 0) }}
              </div>
              <div class="text-sm text-green-600 font-medium">COMPLETED Transactions</div>
              <div class="text-xs text-gray-500">
                Buy: {{ transactionStatusSummary?.buyCompleted || 0 }} |
                Sell: {{ transactionStatusSummary?.sellCompleted || 0 }}
              </div>
            </div>
            <div class="space-y-2">
              <div class="text-2xl font-bold text-blue-800">{{ formatCurrency(calculateCompletedAmount(buyTransactions)
                +
                calculateTotalAmount(sellTransactions)) }}</div>
              <div class="text-sm text-blue-600 font-medium">COMPLETED Amount</div>
              <div class="text-xs text-gray-500">Total completed transaction value</div>
            </div>
            <div class="space-y-2">
              <div class="text-2xl font-bold text-purple-800">{{ formatWeight(calculateCompletedWeight(buyTransactions)
                +
                calculateTotalWeight(sellTransactions)) }}g</div>
              <div class="text-sm text-purple-600 font-medium">COMPLETED Gold Weight</div>
              <div class="text-xs text-gray-500">Total completed gold processed</div>
            </div>
            <div class="space-y-2">
              <div class="text-2xl font-bold text-amber-800">{{ transactionStatusSummary?.buySuccessRate || 0 }}%</div>
              <div class="text-sm text-amber-600 font-medium">Buy Success Rate</div>
              <div class="text-xs text-gray-500">{{ transactionStatusSummary?.buyCompleted || 0 }} completed of {{
                transactionStatusSummary?.buyTotal || 0 }}</div>
            </div>
          </div>
        </div>

        <!-- Overview Summary Cards -->
        <div class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <!-- Buy Gold Card -->
            <div
              class="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div class="flex items-center justify-between mb-4">
                <div
                  class="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center text-2xl">
                  🪙
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500 font-medium">Buy Gold (COMPLETED)</p>
                  <p class="text-2xl font-bold text-green-700">{{ countCompleted(buyTransactions) }}</p>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">COMPLETED Gold:</span>
                  <span class="text-lg font-bold text-yellow-600">{{
                    formatWeight(calculateCompletedWeight(buyTransactions)) }}g</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Transaction Count:</span>
                  <span class="text-lg font-bold text-green-600">{{ countCompleted(buyTransactions) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">COMPLETED Amount:</span>
                  <span class="text-sm font-semibold text-yellow-700">{{
                    formatCurrency(calculateCompletedAmount(buyTransactions)) }}</span>
                </div>
              </div>
              <div class="mt-4 bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg p-3 border border-green-100">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-green-700">Success Rate:</span>
                  <span class="text-sm font-bold text-green-800">{{ calculateSuccessRate(buyTransactions) }}%</span>
                </div>
                <div class="flex justify-between items-center mt-1">
                  <span class="text-xs text-orange-700">Pending:</span>
                  <span class="text-sm font-bold text-orange-800">{{ countPending(buyTransactions) }}</span>
                </div>
              </div>
            </div>

            <!-- Sell Gold Card -->
            <div
              class="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div class="flex items-center justify-between mb-4">
                <div
                  class="w-12 h-12 bg-gradient-to-r from-red-400 to-red-500 rounded-xl flex items-center justify-center text-2xl">
                  💰
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500 font-medium">Sell Gold</p>
                  <p class="text-2xl font-bold text-gray-800">{{ sellTransactions.length }}</p>
                </div>
              </div>
              <div class="space-y-1">
                <p class="text-sm text-gray-600">{{ formatWeight(calculateTotalWeight(sellTransactions)) }}g total</p>
                <p class="text-sm font-semibold text-red-600">{{ formatCurrency(calculateTotalAmount(sellTransactions))
                  }}
                </p>
              </div>
              <div class="mt-4 bg-red-50 rounded-lg p-3">
                <p class="text-xs text-red-700">Average: {{ formatWeight(calculateAverageWeight(sellTransactions)) }}g
                </p>
              </div>
            </div>

            <!-- KYC Card -->
            <div
              class="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div class="flex items-center justify-between mb-4">
                <div
                  class="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center text-2xl">
                  📋
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500 font-medium">KYC Applications</p>
                  <p class="text-2xl font-bold text-gray-800">{{ kycDateRangeData.TOTAL_KYC_COUNT || 0 }}</p>
                </div>
              </div>
              <div class="space-y-1">
                <p class="text-sm text-green-600">{{ kycDateRangeData.APPROVED || 0 }} approved</p>
                <p class="text-sm text-green-300">{{ kycDateRangeData.PRE_APPROVED || 0 }} pre_approved</p>

                <p class="text-sm font-semibold text-blue-600">{{ kycDateRangeData.PROCESSING || 0 }} processing</p>
                <p class="text-sm font-semibold text-yellow-600">{{ kycDateRangeData.PENDING || 0 }} pending</p>
                <p class="text-sm font-semibold text-yellow-400">{{ kycDateRangeData.VERIFY || 0 }} verify</p>
                <p class="text-sm font-semibold text-blue-400">{{ kycDateRangeData.ADJUST || 0 }} adjust</p>
                <p class="text-sm font-semibold text-gray-400">{{ kycDateRangeData.NONE || 0 }} none</p>

              </div>
              <div class="mt-4 bg-red-50 rounded-lg p-3">
                <p class="text-xs text-red-700 text-bold">{{ kycDateRangeData.REJECTED || 0 }} rejected</p>
              </div>
            </div>

            <!-- Top-up Card -->
            <div
              class="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div class="flex items-center justify-between mb-4">
                <div
                  class="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center text-2xl">
                  💳
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500 font-medium">Top-ups</p>
                  <p class="text-2xl font-bold text-gray-800">{{ topupDateRangeData.overall?.totalCount || 0 }}</p>
                </div>
              </div>
              <div class="space-y-1">
                <p class="text-sm text-gray-600">LDB: {{ topupDateRangeData.overall?.ldbCount || 0 }}</p>
                <p class="text-sm font-semibold text-green-600">PSV: {{ topupDateRangeData.overall?.psvCount || 0 }}</p>
              </div>
              <div class="mt-4 bg-green-50 rounded-lg p-3">
                <p class="text-xs text-green-700">Amount: {{ formatCurrency(topupDateRangeData.overall?.totalAmount) ||
                  0
                  }}</p>
              </div>
            </div>

            <!-- NEW: App Downloads Card -->
            <div
              class="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div class="flex items-center justify-between mb-4">
                <div
                  class="w-12 h-12 bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-xl flex items-center justify-center text-2xl">
                  📱
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500 font-medium">App Downloads</p>
                  <p class="text-2xl font-bold text-gray-800">{{ formatNumber((appDownloads.ios || 0) +
                    (appDownloads.android || 0)) }}
                  </p>
                </div>
              </div>
              <div class="space-y-1">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-blue-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 24 24"
                      fill="currentColor">
                      <path
                        d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                    </svg>
                    iOS:
                  </span>
                  <span class="text-lg font-bold text-blue-700">{{ formatNumber(appDownloads.ios || 0) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-green-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 24 24"
                      fill="currentColor">
                      <path
                        d="M7.2,16.8H9.3V14.7H7.2M12.5,4.8C12.5,4.8 5.4,4.8 5.4,4.8C4.6,4.8 4,5.4 4,6.2V17.8C4,18.6 4.6,19.2 5.4,19.2H14.7C15.5,19.2 16.1,18.6 16.1,17.8V9.4L12.5,4.8M14.7,17.8H5.4V6.2H11.5V10.4H14.7V17.8M11.5,14.7V16.8H13.6V14.7H11.5Z" />
                    </svg>
                    Android:
                  </span>
                  <span class="text-lg font-bold text-green-700">{{ formatNumber(appDownloads.android || 0) }}</span>
                </div>
              </div>
              <div class="mt-4 bg-indigo-50 rounded-lg p-3">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-indigo-700">Last Updated:</span>
                  <span class="text-xs font-medium text-indigo-800">{{ formatDatetime(appDownloads.update_date)
                    }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Buy vs Sell Chart -->
          <div class="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100">
            <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              📈 Buy COMPLETED vs Sell Daily Comparison
            </h3>
            <div class="h-64">
              <canvas ref="buyVsSellChart"></canvas>
            </div>
          </div>

          <!-- Transaction Status Chart -->
          <div class="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100">
            <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              🎯 Transaction Status Distribution
            </h3>
            <div class="h-64">
              <canvas ref="transactionStatusChart"></canvas>
            </div>

            <!-- Add summary stats below the chart -->
            <div v-if="transactionStatusSummary" class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div class="bg-green-50 rounded-lg p-3">
                <div class="text-lg font-bold text-green-800">{{ transactionStatusSummary.buyCompleted }}</div>
                <div class="text-xs text-green-600">Buy Completed</div>
              </div>
              <div class="bg-yellow-50 rounded-lg p-3">
                <div class="text-lg font-bold text-yellow-800">{{ transactionStatusSummary.buyPending }}</div>
                <div class="text-xs text-yellow-600">Buy Pending</div>
              </div>
              <div class="bg-red-50 rounded-lg p-3">
                <div class="text-lg font-bold text-red-800">{{ transactionStatusSummary.buyFailed }}</div>
                <div class="text-xs text-red-600">Buy Failed</div>
              </div>
              <div class="bg-purple-50 rounded-lg p-3">
                <div class="text-lg font-bold text-purple-800">{{ transactionStatusSummary.sellCompleted }}</div>
                <div class="text-xs text-purple-600">Sell Completed</div>
              </div>
            </div>

          </div>

          <!-- Daily Trends Line Chart -->
          <div class="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 lg:col-span-2">
            <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              📊 Daily Transaction Trends (Buy COMPLETED vs Sell)
            </h3>
            <div class="h-80">
              <canvas ref="dailyTrendsChart"></canvas>
            </div>
          </div>

          <!-- KYC Status Chart -->
          <div class="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100">
            <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              📋 KYC Applications Status
            </h3>
            <div class="h-64">
              <canvas ref="kycStatusChart"></canvas>
            </div>
          </div>

          <!-- Top-up Distribution Chart -->
          <div class="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100">
            <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              💳 Top-up Provider Distribution
            </h3>
            <div class="h-64">
              <canvas ref="topupChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Detailed Analysis Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Buy Gold Analysis -->
          <div class="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100">
            <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              🪙 Buy Gold Analysis
            </h3>
            <div class="space-y-4">
              <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-green-700 font-medium">COMPLETED Transactions</span>
                  <span class="text-2xl font-bold text-green-800">{{ countCompleted(buyTransactions) }}</span>
                </div>
              </div>
              <div class="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-100">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-yellow-700 font-medium">COMPLETED Gold Weight</span>
                  <span class="text-xl font-bold text-yellow-800">{{
                    formatWeight(calculateCompletedWeight(buyTransactions)) }}g</span>
                </div>
              </div>
              <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-orange-700 font-medium">Pending</span>
                  <span class="text-2xl font-bold text-orange-800">{{ countPending(buyTransactions) }}</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">COMPLETED Amount:</span>
                  <span class="font-bold text-green-600">{{ formatCurrency(calculateCompletedAmount(buyTransactions))
                    }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Success Rate:</span>
                  <span class="font-bold text-green-600">{{ calculateSuccessRate(buyTransactions) }}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Avg COMPLETED Weight:</span>
                  <span class="font-bold text-yellow-600">{{ countCompleted(buyTransactions) > 0 ?
                    formatWeight(calculateCompletedWeight(buyTransactions) / countCompleted(buyTransactions)) : '0.00'
                    }}g</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Avg COMPLETED Amount:</span>
                  <span class="font-bold text-green-600">{{ countCompleted(buyTransactions) > 0 ?
                    formatCurrency(calculateCompletedAmount(buyTransactions) / countCompleted(buyTransactions)) :
                    formatCurrency(0) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Sell Gold Analysis -->
          <div class="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100">
            <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              💰 Sell Gold Analysis
            </h3>
            <div class="space-y-4">
              <div class="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-100">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-red-700 font-medium">Total Transactions</span>
                  <span class="text-2xl font-bold text-red-800">{{ sellTransactions.length }}</span>
                </div>
              </div>
              <div class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-purple-700 font-medium">Total Weight</span>
                  <span class="text-xl font-bold text-purple-800">{{
                    formatWeight(calculateTotalWeight(sellTransactions))
                    }}g</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Total Amount:</span>
                  <span class="font-bold text-gray-800">{{ formatCurrency(calculateTotalAmount(sellTransactions))
                    }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Average Amount:</span>
                  <span class="font-bold text-gray-800">{{ formatCurrency(calculateAverageAmount(sellTransactions))
                    }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Average Weight:</span>
                  <span class="font-bold text-gray-800">{{ formatWeight(calculateAverageWeight(sellTransactions))
                    }}g</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Transactions/Day:</span>
                  <span class="font-bold text-blue-600">{{ (sellTransactions.length / Math.max(getDateRangeDays(),
                    1)).toFixed(1) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Net Position Analysis -->
          <div class="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100">
            <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              ⚖️ Net Position Analysis (COMPLETED)
            </h3>
            <div class="space-y-4">
              <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div class="text-center">
                  <p class="text-sm text-blue-700 font-medium mb-1">Net COMPLETED Amount</p>
                  <p class="text-2xl font-bold" :class="netAmount >= 0 ? 'text-green-800' : 'text-red-800'">
                    {{ formatCurrency(netAmount) }}
                  </p>
                </div>
              </div>
              <div class="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
                <div class="text-center">
                  <p class="text-sm text-teal-700 font-medium mb-1">Net COMPLETED Weight</p>
                  <p class="text-2xl font-bold" :class="netWeight >= 0 ? 'text-green-800' : 'text-red-800'">
                    {{ formatWeight(netWeight) }}g
                  </p>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Buy COMPLETED Volume:</span>
                  <span class="font-bold text-yellow-600">{{ formatCurrency(calculateCompletedAmount(buyTransactions))
                    }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Sell Volume:</span>
                  <span class="font-bold text-red-600">{{ formatCurrency(calculateTotalAmount(sellTransactions))
                    }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Position Status:</span>
                  <span class="font-bold" :class="netAmount >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ netAmount >= 0 ? 'Positive' : 'Negative' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">COMPLETED Buy Count:</span>
                  <span class="font-bold text-green-600">{{ countCompleted(buyTransactions) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bank Distribution Card -->
        <div class="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100">
          <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            🏦 Buy Gold Transactions by Bank
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- BCEL Bank -->
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                <h4 class="font-bold text-green-800">{{ buyTransactionsByBank.bcel.name }}</h4>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-600">Transactions:</span>
                  <span class="text-lg font-bold text-green-700">{{ buyTransactionsByBank.bcel.count }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-600">Amount:</span>
                  <span class="text-sm font-semibold text-green-600">{{ formatCurrency(buyTransactionsByBank.bcel.amount) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-600">Weight:</span>
                  <span class="text-sm font-semibold text-green-600">{{ formatWeight(buyTransactionsByBank.bcel.weight) }}g</span>
                </div>
              </div>
            </div>

            <!-- LDB Bank -->
            <div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                <h4 class="font-bold text-purple-800">{{ buyTransactionsByBank.ldb.name }}</h4>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-600">Transactions:</span>
                  <span class="text-lg font-bold text-purple-700">{{ buyTransactionsByBank.ldb.count }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-600">Amount:</span>
                  <span class="text-sm font-semibold text-purple-600">{{ formatCurrency(buyTransactionsByBank.ldb.amount) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-600">Weight:</span>
                  <span class="text-sm font-semibold text-purple-600">{{ formatWeight(buyTransactionsByBank.ldb.weight) }}g</span>
                </div>
              </div>
            </div>

            <!-- PSV Bank -->
            <div class="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-3 h-3 rounded-full bg-orange-500"></div>
                <h4 class="font-bold text-orange-800">{{ buyTransactionsByBank.psv.name }}</h4>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-600">Transactions:</span>
                  <span class="text-lg font-bold text-orange-700">{{ buyTransactionsByBank.psv.count }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-600">Amount:</span>
                  <span class="text-sm font-semibold text-orange-600">{{ formatCurrency(buyTransactionsByBank.psv.amount) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-600">Weight:</span>
                  <span class="text-sm font-semibold text-orange-600">{{ formatWeight(buyTransactionsByBank.psv.weight) }}g</span>
                </div>
              </div>
            </div>

            <!-- LBB Bank -->
            <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                <h4 class="font-bold text-blue-800">{{ buyTransactionsByBank.lbb.name }}</h4>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-600">Transactions:</span>
                  <span class="text-lg font-bold text-blue-700">{{ buyTransactionsByBank.lbb.count }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-600">Amount:</span>
                  <span class="text-sm font-semibold text-blue-600">{{ formatCurrency(buyTransactionsByBank.lbb.amount) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-600">Weight:</span>
                  <span class="text-sm font-semibold text-blue-600">{{ formatWeight(buyTransactionsByBank.lbb.weight) }}g</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Recent Sell Transactions -->
          <div class="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100">
            <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              🔄 Recent Sell Transactions
              <span class="text-sm font-normal text-gray-500">({{ sellTransactions.length }} total)</span>
            </h3>
            <div class="space-y-4 max-h-96 overflow-y-auto">
              <div v-for="transaction in sellTransactions.slice(0, 10)" :key="transaction.TRANSACTION_ID"
                class="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-100 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <p class="text-xs font-mono text-red-600 mb-1">{{ transaction.TRANSACTION_ID }}</p>
                    <p class="text-sm text-gray-700 mb-1">Customer: <span class="font-medium">{{ transaction.CUSTOMER_ID
                        }}</span></p>
                    <p class="text-xs text-gray-500">{{ formatDate(transaction.CREATED_AT) }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-lg font-bold text-red-600">{{ formatCurrency(transaction.TOTAL_AMOUNT) }}</p>
                    <p class="text-sm text-gray-600">{{ formatWeight(transaction.GOLD_WEIGHT) }}g</p>
                    <div v-if="transaction.FEE_AMOUNT > 0" class="text-xs text-gray-500">
                      Fee: {{ formatCurrency(transaction.FEE_AMOUNT) }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="sellTransactions.length === 0" class="text-center py-8 text-gray-500">
                No sell transactions found for the selected date range
              </div>
            </div>
          </div>

          <!-- Recent Buy Transactions -->
          <div class="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100">
            <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              🔄 Recent Buy Transactions
              <span class="text-sm font-normal text-gray-500">({{ buyTransactions.length }} total)</span>
            </h3>
            <div class="space-y-4 max-h-96 overflow-y-auto">
              <div v-for="transaction in buyTransactions.slice(0, 10)" :key="transaction.ID"
                class="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-100 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <p class="text-sm text-yellow-700 font-medium mb-1">ID: {{ transaction.ID }}</p>
                    <p class="text-sm text-gray-700 mb-1">Customer: <span class="font-medium">{{ transaction.CUSTOMER_ID
                        }}</span></p>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs text-gray-500">Status:</span>
                      <span class="px-2 py-1 rounded-full text-xs font-medium" :class="transaction.STATUS && transaction.STATUS.toLowerCase() === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'">
                        {{ transaction.STATUS || 'N/A' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs text-gray-500">Bank:</span>
                      <span class="px-2 py-1 rounded-full text-xs font-medium" :class="{
                        'bg-green-100 text-green-700': getBankFromDeeplink(transaction.DEEPLINK).color === 'green',
                        'bg-purple-100 text-purple-700': getBankFromDeeplink(transaction.DEEPLINK).color === 'purple',
                        'bg-orange-100 text-orange-700': getBankFromDeeplink(transaction.DEEPLINK).color === 'orange',
                        'bg-blue-100 text-blue-700': getBankFromDeeplink(transaction.DEEPLINK).color === 'blue'
                      }">
                        {{ getBankFromDeeplink(transaction.DEEPLINK).name }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500">{{ formatDate(transaction.CREATED_AT) }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-lg font-bold text-yellow-600">{{ formatCurrency(transaction.TOTAL_AMOUNT) }}</p>
                    <p class="text-sm text-gray-600">{{ formatWeight(transaction.GOLD_WEIGHT) }}g</p>
                    <p class="text-xs text-gray-500">{{ transaction.DR_CURRENCY_CODE || 'LAK' }}</p>
                  </div>
                </div>
              </div>
              <div v-if="buyTransactions.length === 0" class="text-center py-8 text-gray-500">
                No buy transactions found for the selected date range
              </div>
            </div>
          </div>
        </div>

        <!-- AI Analytics Section -->
        <div class="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-8 shadow-xl">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
              🤖 AI Analytics - ການວິເຄາະດ້ວຍປັນຍາປະດິດ
            </h2>
            <p class="text-gray-600">Smart insights and analysis powered by Google Gemini AI</p>
          </div>

          <!-- AI Analysis Control -->
          <div class="text-center mb-8">
            <button @click="generateAIAnalysis" :disabled="aiLoading || !hasData"
              class="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto">
              <span v-if="!aiLoading" class="text-2xl">🧠</span>
              <div v-else class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {{ aiLoading ? 'ກຳລັງວິເຄາະ...' : 'ສ້າງການວິເຄາະດ້ວຍ AI' }}
            </button>
            <p v-if="!hasData" class="text-sm text-gray-500 mt-2">
              ຕ້ອງມີຂໍ້ມູນກ່ອນຈຶ່ງສາມາດວິເຄາະໄດ້
            </p>
          </div>

          <!-- AI Error State -->
          <div v-if="aiError" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 text-center">
            <div class="text-red-600 font-medium mb-2">❌ ຜິດພາດໃນການວິເຄາະ</div>
            <p class="text-red-500 text-sm">{{ aiError }}</p>
            <button @click="generateAIAnalysis"
              class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              ລອງໃໝ່
            </button>
          </div>

          <!-- AI Analysis Results -->
          <div v-if="aiAnalysis && !aiLoading" class="space-y-6">
            <!-- Market Overview -->
            <div class="bg-white rounded-xl p-6 border border-purple-100 shadow-md">
              <h3 class="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                📊 ພາບລວມຕະຫຼາດ - Market Overview
              </h3>
              <div class="prose max-w-none text-gray-700 leading-relaxed">
                <div v-html="formatAIText(aiAnalysis.market_overview)"></div>
              </div>
            </div>

            <!-- Performance Analysis -->
            <div class="bg-white rounded-xl p-6 border border-purple-100 shadow-md">
              <h3 class="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                📈 ການວິເຄາະການປະຕິບັດງານ - Performance Analysis
              </h3>
              <div class="prose max-w-none text-gray-700 leading-relaxed">
                <div v-html="formatAIText(aiAnalysis.performance_analysis)"></div>
              </div>
            </div>

            <!-- Key Insights -->
            <div class="bg-white rounded-xl p-6 border border-purple-100 shadow-md">
              <h3 class="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                💡 ຂໍ້ມູນສຳຄັນ - Key Insights
              </h3>
              <div class="prose max-w-none text-gray-700 leading-relaxed">
                <div v-html="formatAIText(aiAnalysis.key_insights)"></div>
              </div>
            </div>

            <!-- Recommendations -->
            <div class="bg-white rounded-xl p-6 border border-purple-100 shadow-md">
              <h3 class="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                🎯 ຄຳແນະນຳ - Recommendations
              </h3>
              <div class="prose max-w-none text-gray-700 leading-relaxed">
                <div v-html="formatAIText(aiAnalysis.recommendations)"></div>
              </div>
            </div>

            <!-- Risk Analysis -->
            <div class="bg-white rounded-xl p-6 border border-purple-100 shadow-md">
              <h3 class="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                ⚠️ ການວິເຄາະຄວາມສ່ຽງ - Risk Analysis
              </h3>
              <div class="prose max-w-none text-gray-700 leading-relaxed">
                <div v-html="formatAIText(aiAnalysis.risk_analysis)"></div>
              </div>
            </div>

            <!-- Future Outlook -->
            <div class="bg-white rounded-xl p-6 border border-purple-100 shadow-md">
              <h3 class="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                🔮 ທັດສະນະອະນາຄົດ - Future Outlook
              </h3>
              <div class="prose max-w-none text-gray-700 leading-relaxed">
                <div v-html="formatAIText(aiAnalysis.future_outlook)"></div>
              </div>
            </div>

            <!-- Analysis Timestamp -->
            <div class="text-center text-sm text-gray-500 bg-purple-50 rounded-lg p-3">
              ວິເຄາະເມື່ອ: {{ aiAnalysisTimestamp }} | Powered by Google Gemini AI
            </div>
          </div>
        </div>

      </div>

      <!-- Floating Refresh Button -->
      <button @click="fetchAllData" :disabled="loading"
        class="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-full shadow-xl shadow-yellow-500/30 hover:shadow-2xl hover:scale-110 transition-all duration-300 z-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
        <span v-if="!loading" class="text-2xl">🔄</span>
        <div v-else class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </button>


      <div class="flex justify-end gap-4 mt-6">
        <button @click="exportToPDF" :disabled="loading || !hasData"
          class="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          📄 Export to PDF
        </button>
        <button @click="exportToExcel" :disabled="loading || !hasData"
          class="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          📊 Export to Excel
        </button>
      </div>

    </div>


    <!-- Login Modal - Add this after the header div -->
    <div v-if="showLoginModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div class="text-center mb-6">
          <div
            class="w-16 h-16 bg-gradient-to-r from-red-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">LBB PLUS Access</h2>
          <p class="text-gray-600">Please login to access the banking report</p>
        </div>

        <!-- Login Error -->
        <div v-if="loginError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p class="text-red-600 text-sm">{{ loginError }}</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input v-model="loginForm.email" type="email" required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your email" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input v-model="loginForm.password" type="password" required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your password" />
          </div>

          <button type="submit" :disabled="loginLoading"
            class="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            <div v-if="loginLoading" class="flex items-center justify-center">
              <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Logging in...
            </div>
            <span v-else>🔓 Login to Access Report</span>
          </button>
        </form>

        <div class="text-center mt-6">
          <p class="text-xs text-gray-500">
            Secure access to LBB Plus Banking Analytics
            <br>
            <b>Development by LBB IT Department</b>
          </p>
        </div>
      </div>
    </div>



  </div>
</template>


<script>

definePageMeta({
  layout: 'empty',
});

import { ref, onMounted, nextTick, computed } from 'vue'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'

export default {
  name: 'MobileReport',
  setup() {
    const loading = ref(false)
    const error = ref('')
    const loadingMessage = ref('')
    const selectedPreset = ref('')

    // AI Analysis state
    const aiLoading = ref(false)
    const aiError = ref('')
    const aiAnalysis = ref(null)
    const aiAnalysisTimestamp = ref('')

    // Date range state
    const startDate = ref('')
    const endDate = ref('')

    // Chart refs
    const buyVsSellChart = ref(null)
    const transactionStatusChart = ref(null)
    const dailyTrendsChart = ref(null)
    const kycStatusChart = ref(null)
    const topupChart = ref(null)

    const reportContent = ref(null)

    // Chart instances
    let buyVsSellChartInstance = null
    let transactionStatusChartInstance = null
    let dailyTrendsChartInstance = null
    let kycStatusChartInstance = null
    let topupChartInstance = null

    // Data refs
    const buyTransactions = ref([])
    const sellTransactions = ref([])
    const kycDateRangeData = ref({})
    const topupDateRangeData = ref({})
    const transactionStatusData = ref({})
    const appDownloads = ref({}) // New state for app downloads


    const isLoggedIn = ref(false)
    const showLoginModal = ref(false)
    const loginLoading = ref(false)
    const loginError = ref('')
    const authToken = ref('')
    const loginForm = ref({
      email: '', // Pre-filled
      password: ''
    })

    const baseURL = 'http://202.62.106.154:5173/api'
    const appDownloadsURL = 'http://202.62.106.154:5173/apis/downloads/lbbplus' // New API URL for app downloads

    // Gemini API Configuration
    const GEMINI_API_KEY = 'AIzaSyAaAY5zRiBbiNFQ3v3ipUyWc5-py96qwjo' // Replace with your actual API key
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'

    // Date presets
    const datePresets = [
      {
        label: 'Today',
        getDates: () => {
          // สำหรับ "วันนี้" เราต้องสร้างวันพรุ่งนี้เป็น endDate
          const today = new Date().toISOString().split('T')[0]
          const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          return { startDate: today, endDate: tomorrow }
        }
      },
      {
        label: 'Last 7 Days',
        getDates: () => {
          // เพิ่ม 1 วันให้กับ endDate
          const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          const startDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          return { startDate, endDate }
        }
      },
      {
        label: 'Last 30 Days',
        getDates: () => {
          // เพิ่ม 1 วันให้กับ endDate
          const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          const startDate = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          return { startDate, endDate }
        }
      },
      {
        label: 'This Month',
        getDates: () => {
          const now = new Date()
          const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
          // เพิ่ม 1 วันให้กับ endDate
          const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          return { startDate, endDate: tomorrow }
        }
      },
      {
        label: 'Last Month',
        getDates: () => {
          const now = new Date()
          const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
          // สำหรับเดือนที่แล้ว เราใช้วันที่ 1 ของเดือนนี้เป็น endDate
          const endDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
          return { startDate, endDate }
        }
      },
      {
        label: 'Last 3 Months',
        getDates: () => {
          // เพิ่ม 1 วันให้กับ endDate
          const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          const startDate = new Date(Date.now() - 89 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          return { startDate, endDate }
        }
      }
    ]

    // Computed properties
    const totalTransactions = computed(() => buyTransactions.value.length + sellTransactions.value.length)
    const totalCompletedTransactions = computed(() => countCompleted(buyTransactions.value) + sellTransactions.value.length)
    const totalAmount = computed(() => calculateTotalAmount(buyTransactions.value) + calculateTotalAmount(sellTransactions.value))
    const totalCompletedAmount = computed(() => calculateCompletedAmount(buyTransactions.value) + calculateTotalAmount(sellTransactions.value))
    const totalGoldWeight = computed(() => calculateTotalWeight(buyTransactions.value) + calculateTotalWeight(sellTransactions.value))
    const totalCompletedWeight = computed(() => calculateCompletedWeight(buyTransactions.value) + calculateTotalWeight(sellTransactions.value))
    const netAmount = computed(() => calculateCompletedAmount(buyTransactions.value) - calculateTotalAmount(sellTransactions.value))
    const netWeight = computed(() => calculateCompletedWeight(buyTransactions.value) - calculateTotalWeight(sellTransactions.value))

    const hasData = computed(() => {
      return buyTransactions.value.length > 0 ||
        sellTransactions.value.length > 0 ||
        (kycDateRangeData.value.TOTAL && kycDateRangeData.value.TOTAL > 0) ||
        (topupDateRangeData.value.overall && topupDateRangeData.value.overall.totalCount > 0)
    })

    const kycApprovalRate = computed(() => {
      const total = kycDateRangeData.value.TOTAL
      if (!total || total === 0) return 0
      return Math.round(((kycDateRangeData.value.APPROVED || 0) / total) * 100)
    })

    const buyTransactionsByBank = computed(() => {
      const bankStats = {
        bcel: { name: 'BCEL Bank', count: 0, amount: 0, weight: 0, color: 'green' },
        ldb: { name: 'LDB Bank', count: 0, amount: 0, weight: 0, color: 'purple' },
        psv: { name: 'PSV Bank', count: 0, amount: 0, weight: 0, color: 'orange' },
        lbb: { name: 'LBB Bank', count: 0, amount: 0, weight: 0, color: 'blue' }
      }

      buyTransactions.value.forEach(transaction => {
        const bank = getBankFromDeeplink(transaction.DEEPLINK)
        let key = 'lbb'

        if (bank.name === 'BCEL Bank') key = 'bcel'
        else if (bank.name === 'LDB Bank') key = 'ldb'
        else if (bank.name === 'PSV Bank') key = 'psv'

        bankStats[key].count++
        bankStats[key].amount += transaction.TOTAL_AMOUNT || 0
        bankStats[key].weight += transaction.GOLD_WEIGHT || 0
      })

      return bankStats
    })

    // Login API call
    const handleLogin = async () => {
      loginLoading.value = true
      loginError.value = ''

      try {
        const response = await fetch('http://202.62.106.154:5173/apis/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: loginForm.value.email,
            password: loginForm.value.password
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Invalid credentials')
        }

        // Store auth data
        authToken.value = data.token
        if (typeof window !== 'undefined') {
          localStorage.setItem('lbb_auth_token', data.token)
          localStorage.setItem('lbb_user', JSON.stringify(data.user))
          localStorage.setItem('lbb_login_completed', 'true') // One-time flag
        }

        // Update login state
        isLoggedIn.value = true
        showLoginModal.value = false

        // Load report data
        fetchAllData()

      } catch (err) {
        loginError.value = err.message || 'Login failed'
        console.error('Login error:', err)
      } finally {
        loginLoading.value = false
      }
    }

    // Check if already logged in (one-time check)
    const checkAuthStatus = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('lbb_auth_token')
        const loginCompleted = localStorage.getItem('lbb_login_completed')

        if (token && loginCompleted) {
          authToken.value = token
          isLoggedIn.value = true
        } else {
          showLoginModal.value = true
        }
      }
    }

    // New function to fetch app download statistics
    const fetchAppDownloads = async () => {
      try {
        loadingMessage.value = 'Loading app download statistics...'
        const response = await fetch(appDownloadsURL)
        const data = await response.json()
        if (data && data.length > 0) {
          appDownloads.value = data[0] || {}
          console.log('✅ App download data loaded:', appDownloads.value)
        }
      } catch (err) {
        console.error('Error fetching app download statistics:', err)
        appDownloads.value = { ios: 0, android: 0, update_date: new Date().toISOString() }
      }
    }

    // Add this method with your other fetch methods
    const fetchTransactionStatusDistribution = async () => {
      try {
        loadingMessage.value = 'Loading transaction status distribution...'
        const response = await fetch(`${baseURL}/gold/transaction-status-distribution?startDate=${startDate.value}&endDate=${endDate.value}`)
        const data = await response.json()
        if (data.success) {
          transactionStatusData.value = data.data || {}
          console.log('✅ Transaction status data loaded:', transactionStatusData.value)
        }
      } catch (err) {
        console.error('Error fetching transaction status distribution:', err)
        transactionStatusData.value = {}
      }
    }

    const transactionStatusSummary = computed(() => {
      if (!transactionStatusData.value || !transactionStatusData.value.totalTransactions) {
        return {
          buyCompleted: 0,
          buyPending: 0,
          buyFailed: 0,
          sellCompleted: 0,
          buyTotal: 0,
          totalTransactions: 0,
          buySuccessRate: 0
        }
      }

      return {
        buyCompleted: transactionStatusData.value.buyCompleted || 0,
        buyPending: transactionStatusData.value.buyPending || 0,
        buyFailed: transactionStatusData.value.buyFailed || 0,
        sellCompleted: transactionStatusData.value.sellCompleted || 0,
        buyTotal: transactionStatusData.value.buyTotal || 0,
        totalTransactions: transactionStatusData.value.totalTransactions || 0,
        buySuccessRate: transactionStatusData.value.buySuccessRate || 0
      }
    })

    const exportToPDF = async () => {
      if (!reportContent.value) return

      try {
        // Capture the DOM as a canvas
        const canvas = await html2canvas(reportContent.value, {
          scale: 2, // High resolution
          useCORS: true, // For external images
          logging: false
        })

        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF({
          orientation: 'portrait', // Changed to portrait
          unit: 'pt', // Points for A4
          format: 'a4' // Standard A4 size (595 x 842 pt)
        })

        const pageWidth = 595 // A4 width in points
        const pageHeight = 842 // A4 height in points
        const imgWidth = pageWidth - 40 // Margins (20pt each side)
        const imgHeight = (canvas.height * imgWidth) / canvas.width // Maintain aspect ratio
        let heightLeft = imgHeight
        let position = 0

        // Add first page
        pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight)
        heightLeft -= pageHeight - 40 // Account for top/bottom margins

        // Add additional pages if content exceeds one page
        while (heightLeft > 0) {
          pdf.addPage()
          position -= pageHeight - 40
          pdf.addImage(imgData, 'PNG', 20, position + 20, imgWidth, imgHeight)
          heightLeft -= pageHeight - 40
        }

        pdf.save(`LBB_Plus_Report_${startDate.value}_to_${endDate.value}.pdf`)
      } catch (err) {
        console.error('PDF Export Error:', err)
        error.value = 'Failed to export PDF. Please try again.'
      }
    }

    const exportToExcel = () => {
      if (!process.client) return // Ensure client-side only

      const wb = XLSX.utils.book_new()

      // Helper to format numbers for Excel
      const formatNumber = (value, type = 'number') => {
        if (type === 'currency') return { v: value, t: 'n', z: '#,##0' }
        if (type === 'weight') return { v: value, t: 'n', z: '0.00' }
        if (type === 'percent') return { v: value / 100, t: 'n', z: '0.00%' }
        return { v: value, t: 'n' }
      }

      // Sheet 1: Summary
      const summaryData = [
        ['LBB Plus Banking Report Summary', null],
        ['Date Range', `${formatDateDisplay(startDate.value)} to ${formatDateDisplay(endDate.value)} (${getDateRangeDays()} days)`],
        ['Completed Transactions', countCompleted(buyTransactions.value) + sellTransactions.value.length],
        ['Completed Amount', formatNumber(calculateCompletedAmount(buyTransactions.value) + calculateTotalAmount(sellTransactions.value), 'currency')],
        ['Completed Gold Weight', formatNumber(calculateCompletedWeight(buyTransactions.value) + calculateTotalWeight(sellTransactions.value), 'weight')],
        ['KYC Approval Rate', formatNumber(kycApprovalRate.value, 'percent')],
        ['Net Amount', formatNumber(netAmount.value, 'currency')],
        ['Net Weight', formatNumber(netWeight.value, 'weight')],
        ['App Downloads (iOS)', appDownloads.value.ios || 0],
        ['App Downloads (Android)', appDownloads.value.android || 0],
        []
      ]
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }]
      summarySheet['A1'] = { v: 'LBB Plus Banking Report Summary', t: 's', s: { font: { bold: true, sz: 14 } } }
      for (let i = 2; i <= 10; i++) {
        summarySheet[`A${i}`] = { v: summaryData[i - 1][0], t: 's', s: { font: { bold: true } } }
      }
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary')

      // Sheet 2: Buy Transactions
      const buyData = [['ID', 'Customer ID', 'Status', 'Total Amount', 'Gold Weight', 'Currency', 'Created At']]
      buyTransactions.value
        .filter(t => t.STATUS === 'COMPLETED')
        .forEach(t => {
          buyData.push([
            t.ID,
            t.CUSTOMER_ID,
            t.STATUS,
            formatNumber(t.TOTAL_AMOUNT, 'currency'),
            formatNumber(t.GOLD_WEIGHT, 'weight'),
            t.DR_CURRENCY_CODE || 'LAK',
            formatDate(t.CREATED_AT)
          ])
        })
      const buySheet = XLSX.utils.aoa_to_sheet(buyData)
      buySheet['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 20 }]
      for (let col of ['A', 'B', 'C', 'D', 'E', 'F', 'G']) {
        buySheet[`${col}1`] = { v: buyData[0][['A', 'B', 'C', 'D', 'E', 'F', 'G'].indexOf(col)], t: 's', s: { font: { bold: true } } }
      }
      XLSX.utils.book_append_sheet(wb, buySheet, 'Buy Transactions')

      // Sheet 3: Sell Transactions
      const sellData = [['Transaction ID', 'Customer ID', 'Total Amount', 'Gold Weight', 'Fee Amount', 'Created At']]
      sellTransactions.value.forEach(t => {
        sellData.push([
          t.TRANSACTION_ID,
          t.CUSTOMER_ID,
          formatNumber(t.TOTAL_AMOUNT, 'currency'),
          formatNumber(t.GOLD_WEIGHT, 'weight'),
          formatNumber(t.FEE_AMOUNT, 'currency'),
          formatDate(t.CREATED_AT)
        ])
      })
      const sellSheet = XLSX.utils.aoa_to_sheet(sellData)
      sellSheet['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 }]
      for (let col of ['A', 'B', 'C', 'D', 'E', 'F']) {
        sellSheet[`${col}1`] = { v: sellData[0][['A', 'B', 'C', 'D', 'E', 'F'].indexOf(col)], t: 's', s: { font: { bold: true } } }
      }
      XLSX.utils.book_append_sheet(wb, sellSheet, 'Sell Transactions')

      // Sheet 4: KYC
      const kycData = [
        ['KYC Applications', null],
        ['Total', kycDateRangeData.value.TOTAL || 0],
        ['Approved', kycDateRangeData.value.APPROVED || 0],
        ['Processing', kycDateRangeData.value.PROCESSING || 0],
        ['Rejected', kycDateRangeData.value.REJECTED || 0]
      ]
      const kycSheet = XLSX.utils.aoa_to_sheet(kycData)
      kycSheet['!cols'] = [{ wch: 20 }, { wch: 15 }]
      kycSheet['A1'] = { v: 'KYC Applications', t: 's', s: { font: { bold: true, sz: 14 } } }
      for (let i = 2; i <= 5; i++) {
        kycSheet[`A${i}`] = { v: kycData[i - 1][0], t: 's', s: { font: { bold: true } } }
      }
      XLSX.utils.book_append_sheet(wb, kycSheet, 'KYC')

      // Sheet 5: Top-ups
      const topupData = [
        ['Top-up Transactions', null],
        ['Total Count', topupDateRangeData.value.overall?.totalCount || 0],
        ['LDB Count', topupDateRangeData.value.overall?.ldbCount || 0],
        ['PSV Count', topupDateRangeData.value.overall?.psvCount || 0],
        ['Total Amount', formatNumber(topupDateRangeData.value.overall?.totalAmount || 0, 'currency')]
      ]
      const topupSheet = XLSX.utils.aoa_to_sheet(topupData)
      topupSheet['!cols'] = [{ wch: 20 }, { wch: 15 }]
      topupSheet['A1'] = { v: 'Top-up Transactions', t: 's', s: { font: { bold: true, sz: 14 } } }
      for (let i = 2; i <= 5; i++) {
        topupSheet[`A${i}`] = { v: topupData[i - 1][0], t: 's', s: { font: { bold: true } } }
      }
      XLSX.utils.book_append_sheet(wb, topupSheet, 'Top-ups')

      // Sheet 6: App Downloads
      const appDownloadsData = [
        ['App Downloads Statistics', null],
        ['iOS Downloads', appDownloads.value.ios || 0],
        ['Android Downloads', appDownloads.value.android || 0],
        ['Total Downloads', (appDownloads.value.ios || 0) + (appDownloads.value.android || 0)],
        ['Last Updated', formatDatetime(appDownloads.value.update_date)]
      ]
      const appDownloadsSheet = XLSX.utils.aoa_to_sheet(appDownloadsData)
      appDownloadsSheet['!cols'] = [{ wch: 25 }, { wch: 25 }]
      appDownloadsSheet['A1'] = { v: 'App Downloads Statistics', t: 's', s: { font: { bold: true, sz: 14 } } }
      for (let i = 2; i <= 5; i++) {
        appDownloadsSheet[`A${i}`] = { v: appDownloadsData[i - 1][0], t: 's', s: { font: { bold: true } } }
      }
      XLSX.utils.book_append_sheet(wb, appDownloadsSheet, 'App Downloads')

      // Download
      XLSX.writeFile(wb, `LBB_Plus_Report_${startDate.value}_to_${endDate.value}.xlsx`)
    }

    // AI Analysis Functions
    const generateAIAnalysis = async () => {
      if (!hasData.value) {
        aiError.value = 'ບໍ່ມີຂໍ້ມູນເພື່ອວິເຄາະ - No data available for analysis'
        return
      }

      aiLoading.value = true
      aiError.value = ''
      aiAnalysis.value = null

      try {
        const analysisData = prepareDataForAnalysis()
        const prompt = createAnalysisPrompt(analysisData)

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.4,
              topK: 32,
              topP: 1,
              maxOutputTokens: 4096,
            }
          })
        })

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }

        const result = await response.json()

        if (result.candidates && result.candidates[0] && result.candidates[0].content) {
          const analysisText = result.candidates[0].content.parts[0].text
          aiAnalysis.value = parseAIResponse(analysisText)
          aiAnalysisTimestamp.value = new Date().toLocaleString('lo-LA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        } else {
          throw new Error('Invalid API response')
        }

      } catch (err) {
        console.error('AI Analysis Error:', err)
        aiError.value = 'ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ກັບ AI - Error connecting to AI service'
      } finally {
        aiLoading.value = false
      }
    }

    const prepareDataForAnalysis = () => {
      return {
        dateRange: {
          startDate: startDate.value,
          endDate: endDate.value,
          days: getDateRangeDays()
        },
        buyTransactions: {
          total: buyTransactions.value.length,
          completed: countCompleted(buyTransactions.value),
          pending: countPending(buyTransactions.value),
          completedAmount: calculateCompletedAmount(buyTransactions.value),
          completedWeight: calculateCompletedWeight(buyTransactions.value),
          successRate: calculateSuccessRate(buyTransactions.value)
        },
        sellTransactions: {
          total: sellTransactions.value.length,
          totalAmount: calculateTotalAmount(sellTransactions.value),
          totalWeight: calculateTotalWeight(sellTransactions.value),
          averageAmount: calculateAverageAmount(sellTransactions.value),
          averageWeight: calculateAverageWeight(sellTransactions.value)
        },
        kyc: {
          total: kycDateRangeData.value.TOTAL || 0,
          approved: kycDateRangeData.value.APPROVED || 0,
          processing: kycDateRangeData.value.PROCESSING || 0,
          rejected: kycDateRangeData.value.REJECTED || 0,
          approvalRate: kycApprovalRate.value
        },
        topup: {
          total: topupDateRangeData.value.overall?.totalCount || 0,
          ldb: topupDateRangeData.value.overall?.ldbCount || 0,
          psv: topupDateRangeData.value.overall?.psvCount || 0,
          totalAmount: topupDateRangeData.value.overall?.totalAmount || 0
        },
        appDownloads: {
          ios: appDownloads.value.ios || 0,
          android: appDownloads.value.android || 0,
          total: (appDownloads.value.ios || 0) + (appDownloads.value.android || 0),
          lastUpdated: formatDatetime(appDownloads.value.update_date)
        },
        netPosition: {
          amount: netAmount.value,
          weight: netWeight.value
        }
      }
    }

    const createAnalysisPrompt = (data) => {
      return `
ທ່ານເປັນນັກວິເຄາະທາງການເງິນທີ່ຊ່ຽວຊານໃນການວິເຄາະຂໍ້ມູນທຸລະກຳຄຳຂອງທະນາຄານຄຳລາວ ແອັບ LBB Plus ໃນປະເທດລາວ. 
ກະລຸນາວິເຄາະຂໍ້ມູນຕໍ່ໄປນີ້ແລະໃຫ້ຄຳຄິດເຫັນເປັນພາສາລາວ:

**ຂໍ້ມູນທຸລະກຳ (${data.dateRange.startDate} ຫາ ${data.dateRange.endDate} - ${data.dateRange.days} ວັນ):**

**ການຊື້ຄຳ:**
- ທຸລະກຳທັງໝົດ: ${data.buyTransactions.total}
- ສຳເລັດແລ້ວ: ${data.buyTransactions.completed}
- ລໍຖ້າ: ${data.buyTransactions.pending}
- ມູນຄ່າສຳເລັດ: ${formatCurrency(data.buyTransactions.completedAmount)}
- ນ້ຳໜັກຄຳສຳເລັດ: ${formatWeight(data.buyTransactions.completedWeight)}g
- ອັດຕາສຳເລັດ: ${data.buyTransactions.successRate}%

**ການຂາຍຄຳ:**
- ທຸລະກຳທັງໝົດ: ${data.sellTransactions.total}
- ມູນຄ່າທັງໝົດ: ${formatCurrency(data.sellTransactions.totalAmount)}
- ນ້ຳໜັກຄຳທັງໝົດ: ${formatWeight(data.sellTransactions.totalWeight)}g
- ມູນຄ່າສະເລ່ຍ: ${formatCurrency(data.sellTransactions.averageAmount)}
- ນ້ຳໜັກສະເລ່ຍ: ${formatWeight(data.sellTransactions.averageWeight)}g

**KYC:**
- ຄຳຮ້ອງທັງໝົດ: ${data.kyc.total}
- ຜ່ານແລ້ວ: ${data.kyc.approved}
- ກຳລັງດຳເນີນການ: ${data.kyc.processing}
- ປະຕິເສດ: ${data.kyc.rejected}
- ອັດຕາຜ່ານ: ${data.kyc.approvalRate}%

**ເຕີມເງິນ:**
- ທັງໝົດ: ${data.topup.total}
- LDB: ${data.topup.ldb}
- PSV: ${data.topup.psv}
- ມູນຄ່າທັງໝົດ: ${formatCurrency(data.topup.totalAmount)}

**ດາວໂຫລດແອັບ:**
- iOS: ${formatNumber(data.appDownloads.ios)}
- Android: ${formatNumber(data.appDownloads.android)}
- ລວມທັງໝົດ: ${formatNumber(data.appDownloads.total)}
- ອັບເດດລ່າສຸດ: ${data.appDownloads.lastUpdated}

**ສະຖານະສຸດທິ:**
- ມູນຄ່າສຸດທິ: ${formatCurrency(data.netPosition.amount)}
- ນ້ຳໜັກສຸດທິ: ${formatWeight(data.netPosition.weight)}g

ກະລຸນາໃຫ້ການວິເຄາະແບບຄົບຖ້ວນທີ່ປະກອບມີ:

**MARKET_OVERVIEW:**
[ພາບລວມຂອງຕະຫຼາດແລະການດຳເນີນທຸລະກິດໃນຊ່ວງເວລານີ້]

**PERFORMANCE_ANALYSIS:**
[ການວິເຄາະປະສິດທິພາບຂອງແຕ່ລະບໍລິການ]

**KEY_INSIGHTS:**
[ຂໍ້ສັງເກດແລະຈຸດເດັ່ນທີ່ສຳຄັນ]

**RECOMMENDATIONS:**
[ຄຳແນະນຳເພື່ອປັບປຸງແລະພັດທະນາ]

**RISK_ANALYSIS:**
[ການວິເຄາະຄວາມສ່ຽງແລະຈຸດທີ່ຄວນກັງວົນ]

**FUTURE_OUTLOOK:**
[ທັດສະນະແລະຄາດການໃນອະນາຄົດ]

ກະລຸນາຕອບໃນຮູບແບບ JSON ທີ່ມີໂຄງສ້າງດັ່ງນີ້:
{
  "market_overview": "...",
  "performance_analysis": "...",
  "key_insights": "...",
  "recommendations": "...",
  "risk_analysis": "...",
  "future_outlook": "..."
}

ການວິເຄາະຄວນເປັນພາສາລາວທີ່ເຂົ້າໃຈງ່າຍ, ມີເຫດຜົນ, ແລະເປັນປະໂຫຍດຕໍ່ການຕັດສິນໃຈທາງທຸລະກິດ.
`
    }

    const parseAIResponse = (responseText) => {
      try {
        // Try to extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }

        // If no JSON found, try to parse it manually
        const sections = {
          market_overview: extractSection(responseText, 'MARKET_OVERVIEW'),
          performance_analysis: extractSection(responseText, 'PERFORMANCE_ANALYSIS'),
          key_insights: extractSection(responseText, 'KEY_INSIGHTS'),
          recommendations: extractSection(responseText, 'RECOMMENDATIONS'),
          risk_analysis: extractSection(responseText, 'RISK_ANALYSIS'),
          future_outlook: extractSection(responseText, 'FUTURE_OUTLOOK')
        }

        return sections
      } catch (err) {
        console.error('Error parsing AI response:', err)
        return {
          market_overview: 'ບໍ່ສາມາດແປງຂໍ້ມູນການວິເຄາະໄດ້',
          performance_analysis: responseText,
          key_insights: '',
          recommendations: '',
          risk_analysis: '',
          future_outlook: ''
        }
      }
    }

    const extractSection = (text, sectionName) => {
      const regex = new RegExp(`\\*\\*${sectionName}:\\*\\*([\\s\\S]*?)(?=\\*\\*|$)`, 'i')
      const match = text.match(regex)
      return match ? match[1].trim() : ''
    }

    const formatAIText = (text) => {
      if (!text) return ''

      return text
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^\s*-\s+/gm, '• ')
        .replace(/^(.*)$/gm, '<p>$1</p>')
        .replace(/<p><\/p>/g, '')
    }

    // Initialize default date range (Last 30 days)
    const initializeDateRange = () => {
      const defaultPreset = datePresets.find(p => p.label === 'Last 30 Days')
      if (defaultPreset) {
        const dates = defaultPreset.getDates()
        startDate.value = dates.startDate
        endDate.value = dates.endDate
        selectedPreset.value = defaultPreset.label
      }
    }

    // Set date preset
    const setDatePreset = (preset) => {
      const dates = preset.getDates()
      startDate.value = dates.startDate
      endDate.value = dates.endDate
      selectedPreset.value = preset.label
      applyDateFilter()
    }

    // Date change handler
    const onDateChange = () => {
      selectedPreset.value = '' // Clear preset selection when custom dates are used
    }

    // Apply date filter
    const applyDateFilter = () => {
      if (startDate.value && endDate.value) {
        fetchAllData()
      }
    }

    // Get date range days
    const getDateRangeDays = () => {
      if (!startDate.value || !endDate.value) return 0
      const start = new Date(startDate.value)
      const end = new Date(endDate.value)
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    }

    // Format date for display
    const formatDateDisplay = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    // Format datetime for display
    const formatDatetime = (dateStr) => {
      if (!dateStr) return 'N/A'
      return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Format number with thousands separator
    const formatNumber = (num) => {
      if (!num && num !== 0) return '0'
      return new Intl.NumberFormat('en-US').format(num)
    }

    // Load Chart.js
    const loadChart = async () => {
      if (typeof window !== 'undefined' && !window.Chart) {
        const chartModule = await import('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/auto/+esm')
        window.Chart = chartModule.default
      }
    }

    // Calculation helpers
    const calculateTotalAmount = (transactions) => {
      return transactions.reduce((sum, t) => sum + (t.TOTAL_AMOUNT || 0), 0)
    }

    const calculateTotalWeight = (transactions) => {
      return transactions.reduce((sum, t) => sum + (t.GOLD_WEIGHT || 0), 0)
    }

    const calculateAverageAmount = (transactions) => {
      return transactions.length > 0 ? calculateTotalAmount(transactions) / transactions.length : 0
    }

    const calculateAverageWeight = (transactions) => {
      return transactions.length > 0 ? calculateTotalWeight(transactions) / transactions.length : 0
    }

    const countCompleted = (transactions) => {
      return transactions.filter(t => t.STATUS === 'COMPLETED').length
    }

    const countPending = (transactions) => {
      return transactions.filter(t => t.STATUS === 'PENDING').length
    }

    const calculateSuccessRate = (transactions) => {
      if (transactions.length === 0) return 0
      return Math.round((countCompleted(transactions) / transactions.length) * 100)
    }

    const calculateCompletedWeight = (transactions) => {
      return transactions
        .filter(t => t.STATUS === 'COMPLETED')
        .reduce((sum, t) => sum + (t.GOLD_WEIGHT || 0), 0)
    }

    const calculateCompletedAmount = (transactions) => {
      return transactions
        .filter(t => t.STATUS === 'COMPLETED')
        .reduce((sum, t) => sum + (t.TOTAL_AMOUNT || 0), 0)
    }

    // Group transactions by date
    const groupByDate = (transactions) => {
      const groups = {}
      transactions.forEach(t => {
        const date = new Date(t.CREATED_AT).toISOString().split('T')[0]
        if (!groups[date]) {
          groups[date] = { buy: 0, sell: 0, buyAmount: 0, sellAmount: 0 }
        }
      })
      return groups
    }

    // API calls with date filtering
    const fetchBuyTransactions = async () => {
      try {
        loadingMessage.value = 'Loading buy transactions...'
        const response = await fetch(`${baseURL}/gold/transactions?startDate=${startDate.value}&endDate=${endDate.value}`, {
          // headers: getAuthHeaders()
        })
        const data = await response.json()
        if (data.success) {
          buyTransactions.value = data.data || []
        }
      } catch (err) {
        console.error('Error fetching buy transactions:', err)
        buyTransactions.value = []
      }
    }

    const fetchSellTransactions = async () => {
      try {
        loadingMessage.value = 'Loading sell transactions...'
        const response = await fetch(`${baseURL}/sell-gold/transactions?startDate=${startDate.value}&endDate=${endDate.value}`)
        const data = await response.json()
        if (data.success) {
          sellTransactions.value = data.data || []
        }
      } catch (err) {
        console.error('Error fetching sell transactions:', err)
        sellTransactions.value = []
      }
    }

    const fetchKYCDateRange = async () => {
      try {
        loadingMessage.value = 'Loading KYC applications...'
        const response = await fetch(`${baseURL}/application-reports/status-counts/date-range?startDate=${startDate.value}&endDate=${endDate.value}`)
        const data = await response.json()
        if (data.success) {
          kycDateRangeData.value = data.data || {}
        }
      } catch (err) {
        console.error('Error fetching KYC date range:', err)
        kycDateRangeData.value = {}
      }
    }

    const fetchTopupDateRange = async () => {
      try {
        loadingMessage.value = 'Loading top-up transactions...'
        const response = await fetch(`${baseURL}/topup-transactions/report/count?startDate=${startDate.value}&endDate=${endDate.value}`)
        const data = await response.json()
        if (data.success) {
          topupDateRangeData.value = data.data || {}
        }
      } catch (err) {
        console.error('Error fetching top-up date range:', err)
        topupDateRangeData.value = {}
      }
    }

    const fetchAllData = async () => {
      if (!startDate.value || !endDate.value) {
        error.value = 'Please select both start and end dates'
        return
      }

      loading.value = true
      error.value = ''

      try {
        await Promise.all([
          fetchBuyTransactions(),
          fetchSellTransactions(),
          fetchKYCDateRange(),
          fetchTopupDateRange(),
          fetchTransactionStatusDistribution(),
          fetchAppDownloads() // Added app downloads fetch
        ])

        // Initialize charts after data is loaded
        await nextTick()
        setTimeout(() => {
          initializeCharts()
        }, 300)

      } catch (err) {
        error.value = 'Failed to load filtered data. Please try again.'
        console.error('Error fetching filtered data:', err)
      } finally {
        loading.value = false
        loadingMessage.value = ''
      }
    }

    // Initialize charts with filtered data
    const initializeCharts = async () => {
      await loadChart()
      await nextTick()

      // Buy vs Sell Daily Chart
      if (buyVsSellChart.value) {
        const ctx = buyVsSellChart.value.getContext('2d')
        if (buyVsSellChartInstance) {
          buyVsSellChartInstance.destroy()
        }

        // Group transactions by date
        const dateGroups = {}
        const allDates = []

        // Process COMPLETED buy transactions only
        buyTransactions.value
          .filter(t => t.STATUS === 'COMPLETED')
          .forEach(t => {
            const date = new Date(t.CREATED_AT).toISOString().split('T')[0]
            if (!dateGroups[date]) {
              dateGroups[date] = { buy: 0, sell: 0 }
              allDates.push(date)
            }
            dateGroups[date].buy += t.TOTAL_AMOUNT || 0
          })

        // Process sell transactions (all sell transactions are considered completed)
        sellTransactions.value.forEach(t => {
          const date = new Date(t.CREATED_AT).toISOString().split('T')[0]
          if (!dateGroups[date]) {
            dateGroups[date] = { buy: 0, sell: 0 }
            allDates.push(date)
          }
          dateGroups[date].sell += t.TOTAL_AMOUNT || 0
        })

        const uniqueDates = [...new Set(allDates)].sort()

        buyVsSellChartInstance = new window.Chart(ctx, {
          type: 'bar',
          data: {
            labels: uniqueDates.map(date => formatDateDisplay(date)),
            datasets: [
              {
                label: 'Buy COMPLETED Amount',
                data: uniqueDates.map(date => dateGroups[date]?.buy || 0),
                backgroundColor: 'rgba(251, 191, 36, 0.8)',
                borderColor: 'rgb(251, 191, 36)',
                borderWidth: 2
              },
              {
                label: 'Sell Amount',
                data: uniqueDates.map(date => dateGroups[date]?.sell || 0),
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function (value) {
                    return new Intl.NumberFormat('en-US', {
                      notation: 'compact',
                      maximumFractionDigits: 1
                    }).format(value)
                  }
                }
              }
            }
          }
        })
      }

      // Transaction Status Chart
      if (transactionStatusChart.value && transactionStatusData.value.pieChartData) {
        const ctx = transactionStatusChart.value.getContext('2d')
        if (transactionStatusChartInstance) {
          transactionStatusChartInstance.destroy()
        }

        const chartData = transactionStatusData.value.pieChartData

        transactionStatusChartInstance = new window.Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: chartData.labels,
            datasets: [{
              data: chartData.values,
              backgroundColor: chartData.colors,
              borderColor: chartData.colors.map(color => color.replace('0.8', '1')),
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const label = context.label || ''
                    const value = context.parsed
                    const total = transactionStatusData.value.totalTransactions || 0
                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0
                    return `${label}: ${value} (${percentage}%)`
                  }
                }
              }
            }
          }
        })
      }

      // Daily Trends Line Chart
      if (dailyTrendsChart.value) {
        const ctx = dailyTrendsChart.value.getContext('2d')
        if (dailyTrendsChartInstance) {
          dailyTrendsChartInstance.destroy()
        }

        // Group by date for trends
        const dateGroups = {}
        const allDates = []

        // Process COMPLETED buy transactions only
        buyTransactions.value
          .filter(t => t.STATUS === 'COMPLETED')
          .forEach(t => {
            const date = new Date(t.CREATED_AT).toISOString().split('T')[0]
            if (!dateGroups[date]) {
              dateGroups[date] = { buyCount: 0, sellCount: 0 }
              allDates.push(date)
            }
            dateGroups[date].buyCount++
          })

        sellTransactions.value.forEach(t => {
          const date = new Date(t.CREATED_AT).toISOString().split('T')[0]
          if (!dateGroups[date]) {
            dateGroups[date] = { buyCount: 0, sellCount: 0 }
            allDates.push(date)
          }
          dateGroups[date].sellCount++
        })

        const uniqueDates = [...new Set(allDates)].sort()

        dailyTrendsChartInstance = new window.Chart(ctx, {
          type: 'line',
          data: {
            labels: uniqueDates.map(date => formatDateDisplay(date)),
            datasets: [
              {
                label: 'Buy COMPLETED Transactions',
                data: uniqueDates.map(date => dateGroups[date]?.buyCount || 0),
                borderColor: 'rgb(35 162 91)',
                backgroundColor: 'rgba(35, 162, 91, 0.1)',
                tension: 0.4,
                fill: true
              },
              {
                label: 'Sell Transactions',
                data: uniqueDates.map(date => dateGroups[date]?.sellCount || 0),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        })
      }

      // KYC Status Chart
      if (kycStatusChart.value) {
        const ctx = kycStatusChart.value.getContext('2d')
        if (kycStatusChartInstance) {
          kycStatusChartInstance.destroy()
        }

        // Log the KYC data to debug
        console.log('KYC Data for chart:', kycDateRangeData.value)

        // Fix: Don't make chart initialization dependent on TOTAL property
        // Create an array of KYC statuses and their counts
        const kycData = [
          { label: 'Approved', value: kycDateRangeData.value.APPROVED || 0, color: 'rgba(34, 197, 94, 0.8)', border: 'rgb(34, 197, 94)' },
          { label: 'Processing', value: kycDateRangeData.value.PROCESSING || 0, color: 'rgba(251, 191, 36, 0.8)', border: 'rgb(251, 191, 36)' },
          { label: 'Pending', value: kycDateRangeData.value.PENDING || 0, color: 'rgba(251, 191, 36, 0.2)', border: 'rgb(251, 191, 36)' },
          { label: 'Pre-approved', value: kycDateRangeData.value.PRE_APPROVED || 0, color: 'rgba(59, 130, 246, 0.8)', border: 'rgb(59, 130, 246)' },
          { label: 'Rejected', value: kycDateRangeData.value.REJECTED || 0, color: 'rgba(239, 68, 68, 0.8)', border: 'rgb(239, 68, 68)' },
          { label: 'Verify', value: kycDateRangeData.value.VERIFY || 0, color: 'rgba(239, 68, 68, 0.2)', border: 'rgb(239, 68, 68)' },
          { label: 'Adjust', value: kycDateRangeData.value.ADJUST || 0, color: 'rgba(239, 68, 68, 0.2)', border: 'rgb(239, 68, 68)' },
          { label: 'None', value: kycDateRangeData.value.NONE || 0, color: 'rgba(156, 163, 175, 0.8)', border: 'rgb(156, 163, 175)' }
        ]

        // Filter out statuses with zero values if needed
        const filteredData = kycData.filter(item => item.value > 0)

        // If no data after filtering, add a placeholder
        if (filteredData.length === 0) {
          filteredData.push({
            label: 'No Data',
            value: 1,
            color: 'rgba(209, 213, 219, 0.8)',
            border: 'rgb(209, 213, 219)'
          })
        }

        kycStatusChartInstance = new window.Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: filteredData.map(item => item.label),
            datasets: [{
              data: filteredData.map(item => item.value),
              backgroundColor: filteredData.map(item => item.color),
              borderColor: filteredData.map(item => item.border),
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const label = context.label || '';
                    const value = context.parsed;
                    const total = filteredData.reduce((sum, item) => sum + item.value, 0);
                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          }
        })
      }

      // Top-up Chart
      if (topupChart.value && topupDateRangeData.value.overall) {
        const ctx = topupChart.value.getContext('2d')
        if (topupChartInstance) {
          topupChartInstance.destroy()
        }

        topupChartInstance = new window.Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['LDB', 'PSV', 'Other'],
            datasets: [{
              data: [
                topupDateRangeData.value.overall.ldbCount || 0,
                topupDateRangeData.value.overall.psvCount || 0,
                topupDateRangeData.value.overall.otherCount || 0
              ],
              backgroundColor: [
                'rgb(15 128 205)',
                'rgb(28 195 118)',
                'rgba(156, 163, 175, 0.8)'
              ],
              borderColor: [
                'rgb(5 74 131)',
                'rgb(25 135 84)',
                'rgb(156, 163, 175)'
              ],
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              }
            }
          }
        })
      }
    }

    // Utility functions
    const formatCurrency = (amount) => {
      if (!amount && amount !== 0) return '₭0'
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'LAK',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    }

    const formatWeight = (weight) => {
      if (!weight && weight !== 0) return '0.00'
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(weight)
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getBankFromDeeplink = (deeplink) => {
      if (!deeplink) return { name: 'LBB Bank', color: 'blue' }

      const deeplinkStr = String(deeplink).toLowerCase()

      if (deeplinkStr.includes('onepay:')) {
        return { name: 'BCEL Bank', color: 'green' }
      } else if (deeplinkStr.includes('ldbpay:')) {
        return { name: 'LDB Bank', color: 'purple' }
      } else if (deeplinkStr.includes('la.com.psvbhi.hiapp:')) {
        return { name: 'PSV Bank', color: 'orange' }
      } else {
        return { name: 'LBB Bank', color: 'blue' }
      }
    }

    onMounted(() => {
      checkAuthStatus() // Check login first
      initializeDateRange()

      // Only load data if already logged in
      if (isLoggedIn.value) {
        fetchAllData()
      }
    })

    return {
      loading,
      error,
      loadingMessage,
      selectedPreset,
      startDate,
      endDate,
      datePresets,
      buyTransactions,
      sellTransactions,
      kycDateRangeData,
      topupDateRangeData,
      totalTransactions,
      totalCompletedTransactions,
      totalAmount,
      totalCompletedAmount,
      totalGoldWeight,
      totalCompletedWeight,
      netAmount,
      netWeight,
      kycApprovalRate,
      buyTransactionsByBank,
      hasData,
      aiLoading,
      aiError,
      aiAnalysis,
      aiAnalysisTimestamp,
      appDownloads, // New state for app downloads
      setDatePreset,
      onDateChange,
      applyDateFilter,
      getDateRangeDays,
      formatDateDisplay,
      formatDatetime, // Format datetime for display
      formatNumber, // Format number with thousands separator
      fetchAllData,
      generateAIAnalysis,
      formatAIText,
      calculateTotalAmount,
      calculateTotalWeight,
      calculateAverageAmount,
      calculateAverageWeight,
      countCompleted,
      countPending,
      calculateSuccessRate,
      calculateCompletedWeight,
      calculateCompletedAmount,
      formatCurrency,
      formatWeight,
      formatDate,
      getBankFromDeeplink,
      buyVsSellChart,
      transactionStatusChart,
      dailyTrendsChart,
      kycStatusChart,
      topupChart,
      reportContent,
      exportToPDF,
      exportToExcel,
      transactionStatusData,
      fetchTransactionStatusDistribution,
      transactionStatusSummary,
      isLoggedIn,
      showLoginModal,
      loginLoading,
      loginError,
      loginForm,
      handleLogin,
      checkAuthStatus
    }
  }
}
</script>