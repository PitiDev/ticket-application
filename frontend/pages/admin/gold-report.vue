<template>
    <div class="gold-report">
        <!-- Customer ID Search -->
        <section class="bg-white rounded-xl p-6 shadow-md mb-8">
            <div class="flex flex-col md:flex-row md:items-center gap-4">
                <div class="flex-1">
                    <label for="customer-id" class="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
                    <div class="relative rounded-md shadow-sm">
                        <input type="text" id="customer-id" v-model="searchCustomerId"
                            placeholder="Enter customer ID (e.g. 2508-0000002-xxxx)"
                            class="block w-full rounded-md border-gray-300 pl-4 pr-12 py-3 focus:border-amber-500 focus:ring-amber-500 text-gray-900"
                            :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': inputError }" />
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <p v-if="inputError" class="mt-1 text-sm text-red-600">{{ inputError }}</p>
                </div>
                <div class="mt-2 md:mt-7">
                    <button @click="searchCustomer"
                        class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        :disabled="loading">
                        <span v-if="loading" class="mr-2">
                            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                        </span>
                        {{ loading ? 'Loading...' : 'Search' }}
                    </button>
                </div>
            </div>

            <!-- Recent searches (optional) -->
            <div v-if="recentSearches.length > 0" class="mt-4">
                <h3 class="text-sm font-medium text-gray-500 mb-2">Recent searches:</h3>
                <div class="flex flex-wrap gap-2">
                    <button v-for="(search, index) in recentSearches" :key="index" @click="loadRecentSearch(search)"
                        class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200">
                        {{ search }}
                    </button>
                </div>
            </div>
        </section>

        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center items-center h-96">
            <div class="animate-pulse text-center">
                <div class="text-2xl font-bold mb-2">Loading your gold report</div>
                <div
                    class="inline-block w-12 h-12 border-4 border-t-amber-400 border-amber-200 rounded-full animate-spin">
                </div>
            </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="bg-red-50 p-6 rounded-lg mb-6">
            <h3 class="text-red-800 font-bold mb-2">Error loading report</h3>
            <p class="text-red-600">{{ error }}</p>
            <button @click="fetchData(searchCustomerId)"
                class="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Try Again
            </button>
        </div>

        <!-- No results state -->
        <div v-else-if="dataLoaded && !hasData" class="bg-amber-50 p-6 rounded-lg mb-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-amber-500 mx-auto mb-4" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="text-lg font-bold text-amber-800 mb-2">No Gold Investment Found</h3>
            <p class="text-amber-700">No gold investment data found for customer ID: {{ searchCustomerId }}</p>
            <p class="text-amber-600 mt-2">Please check the customer ID and try again.</p>
        </div>

        <!-- Report content -->
        <div v-else-if="dataLoaded && hasData" class="space-y-8" ref="reportContent">
            <!-- Header with current gold price and customer accounts -->
            <section class="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl p-6 shadow-lg text-white">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 class="text-3xl font-bold">Gold Investment Report</h1>
                        <p class="opacity-90 mb-2">Customer ID: {{ goldData.summary?.customer_id }}</p>
                        <div v-if="customerAccounts.accounts && customerAccounts.accounts.length > 0"
                            class="bg-white/20 backdrop-blur p-3 rounded-lg">
                            <h3 class="text-sm uppercase tracking-wide mb-2">Customer Accounts</h3>
                            <div class="space-y-1">
                                <div v-for="(account, index) in customerAccounts.accounts" :key="index"
                                    class="flex text-sm">
                                    <span class="font-medium">{{ account.account_no }}</span>
                                    <span class="mx-2 opacity-70">|</span>
                                    <span>{{ account.account_currency }}</span>
                                    <span class="mx-2 opacity-70">|</span>
                                    <span class="opacity-80">{{ account.account_type }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white/20 backdrop-blur p-4 rounded-lg text-center">
                        <div class="text-sm uppercase tracking-wide mb-1">Current Gold Price</div>
                        <div class="text-2xl font-bold">{{ goldData.summary?.current_gold_price?.buy_rate }}</div>
                        <div class="text-xs">Updated {{ goldData.summary?.current_gold_price?.date }}</div>
                    </div>
                </div>
            </section>

            <!-- Summary cards -->
            <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white rounded-xl p-6 shadow-md">
                    <div class="flex justify-between">
                        <div>
                            <div class="text-gray-500 text-sm">Total Investment</div>
                            <div class="text-2xl font-bold">{{ goldData.summary?.total_investment }}</div>
                        </div>
                        <div class="bg-amber-100 p-3 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-500" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl p-6 shadow-md">
                    <div class="flex justify-between">
                        <div>
                            <div class="text-gray-500 text-sm">Current Value</div>
                            <div class="text-2xl font-bold">{{ goldData.summary?.total_current_value }}</div>
                        </div>
                        <div class="bg-emerald-100 p-3 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-emerald-500" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl p-6 shadow-md">
                    <div class="flex justify-between">
                        <div>
                            <div class="text-gray-500 text-sm">Profit/Loss</div>
                            <div
                                :class="{ 'text-2xl font-bold': true, 'text-green-600': goldData.summary?.is_overall_profitable, 'text-red-600': !goldData.summary?.is_overall_profitable }">
                                {{ goldData.summary?.total_profit_loss }} ({{
                                    goldData.summary?.total_profit_loss_percentage }})
                            </div>
                        </div>
                        <div
                            :class="{ 'p-3 rounded-full': true, 'bg-green-100': goldData.summary?.is_overall_profitable, 'bg-red-100': !goldData.summary?.is_overall_profitable }">
                            <svg v-if="goldData.summary?.is_overall_profitable" xmlns="http://www.w3.org/2000/svg"
                                class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Portfolio stats and chart -->
            <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-white rounded-xl p-6 shadow-md">
                    <h2 class="text-xl font-bold mb-4">Investment Performance</h2>
                    <div class="h-64">
                        <ClientOnly>
                            <GoldPerformanceChart :transactions="goldData.transactions || []"
                                :currentPrice="goldData.summary?.current_gold_price?.buy_rate" />
                        </ClientOnly>
                    </div>
                </div>
                <div class="bg-white rounded-xl p-6 shadow-md">
                    <h2 class="text-xl font-bold mb-4">Portfolio Stats</h2>
                    <div class="space-y-4">
                        <div class="flex justify-between">
                            <span class="text-gray-500">Total Gold</span>
                            <span class="font-medium">{{ goldData.summary?.total_gold_weight }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">Transactions</span>
                            <span class="font-medium">{{ goldData.summary?.total_transactions }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">Profitable</span>
                            <span class="font-medium">{{ goldData.summary?.profitable_transactions }}</span>
                        </div>
                        <div class="h-36 mt-4">
                            <ClientOnly>
                                <GoldPortfolioDonut :totalGold="parseFloat(goldData.summary?.total_gold_weight)"
                                    :profitableWeight="parseFloat(goldData.recommendations?.[1]?.profitable_gold_weight)" />
                            </ClientOnly>
                        </div>
                    </div>
                </div>
            </section>

            <!-- P2P Gold Transfers -->
            <section v-if="hasP2PData" class="bg-white rounded-xl p-6 shadow-md">
                <h2 class="text-xl font-bold mb-4">P2P Gold Transfers</h2>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="bg-indigo-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-600 mb-1">Total Transfers</div>
                        <div class="text-xl font-bold text-indigo-800">{{ p2pGoldData.summary?.total_transactions }}
                        </div>
                    </div>
                    <div class="bg-indigo-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-600 mb-1">Total Gold Transferred</div>
                        <div class="text-xl font-bold text-indigo-800">{{ p2pGoldData.summary?.total_gold_weight }}
                        </div>
                    </div>
                    <div class="bg-indigo-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-600 mb-1">Received / Sent</div>
                        <div class="text-xl font-bold text-indigo-800">{{ getP2PTransferCounts.received }} / {{
                            getP2PTransferCounts.sent }}</div>
                    </div>
                </div>

                <div class="overflow-x-auto mt-6">
                    <h3 class="text-lg font-medium mb-3">Transfer Transactions</h3>
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    #</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Transaction ID</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Gold Weight</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    From Account</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    To Account</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="(transaction, index) in p2pGoldData.transactions" :key="index"
                                class="hover:bg-gray-50">
                                <td class="px-1 py-1 whitespace-nowrap text-sm font-medium text-gray-900">{{
                                    index + 1 }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{
                                    transaction.transaction_id }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{
                                    transaction.transfer_date }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ transaction.gold_weight
                                    }}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span :class="{
                                        'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                                        'bg-green-100 text-green-800': isIncomingTransfer(transaction),
                                        'bg-blue-100 text-blue-800': !isIncomingTransfer(transaction)
                                    }">
                                        {{ isIncomingTransfer(transaction) ? 'Received' : 'Sent' }}
                                        ({{ isIncomingTransfer(transaction) ? 'Incoming' : 'Outgoing' }})
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <span
                                        :class="{ 'text-gray-500': true, 'font-semibold': isMyAccount(transaction.debit_account) }">
                                        {{ transaction.debit_account }}
                                        <span v-if="isMyAccount(transaction.debit_account)"
                                            class="text-xs text-blue-600 ml-1">(My Account)</span>
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <span
                                        :class="{ 'text-gray-500': true, 'font-semibold': isMyAccount(transaction.credit_account) }">
                                        {{ transaction.credit_account }}
                                        <span v-if="isMyAccount(transaction.credit_account)"
                                            class="text-xs text-blue-600 ml-1">(My Account)</span>
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Sell Gold Data -->
            <section v-if="hasSellData" class="bg-white rounded-xl p-6 shadow-md">
                <h2 class="text-xl font-bold mb-4">Gold Selling Summary</h2>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="bg-amber-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-600 mb-1">Total Transactions</div>
                        <div class="text-xl font-bold text-amber-800">{{ sellGoldData.summary?.total_transactions }}
                        </div>
                    </div>
                    <div class="bg-amber-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-600 mb-1">Total Gold Sold</div>
                        <div class="text-xl font-bold text-amber-800">{{ sellGoldData.summary?.total_gold_weight }}
                        </div>
                    </div>
                    <div class="bg-amber-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-600 mb-1">Total Amount</div>
                        <div class="text-xl font-bold text-amber-800">{{ sellGoldData.summary?.total_sold_amount }}
                        </div>
                    </div>
                </div>

                <div class="overflow-x-auto mt-6">
                    <h3 class="text-lg font-medium mb-3">Sell Transactions</h3>
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Transaction ID</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Account</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Gold Weight</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price/Gram</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Amount</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="(transaction, index) in sellGoldData.transactions" :key="index"
                                class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{
                                    transaction.transaction_id }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ transaction.sale_date
                                    }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <span
                                        :class="{ 'text-gray-500': true, 'font-semibold': isMyAccount(transaction.account_no) }">
                                        {{ transaction.account_no }}
                                        <span v-if="isMyAccount(transaction.account_no)"
                                            class="text-xs text-blue-600 ml-1">(My Account)</span>
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ transaction.gold_weight
                                    }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{
                                    transaction.price_per_gram }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{{
                                    transaction.total_amount }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Net Position -->
            <section v-if="hasSellData || hasP2PData" class="bg-white rounded-xl p-6 shadow-md">
                <h2 class="text-xl font-bold mb-4">Net Gold Position</h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-5 rounded-lg">
                        <div class="text-sm opacity-80 mb-1">Net Gold Weight</div>
                        <div class="text-3xl font-bold">{{ calculateTotalNetWeight }}</div>
                        <div class="mt-2 text-sm opacity-80">
                            Buy: {{ goldData.summary?.total_gold_weight }}
                            {{ hasSellData ? `| Sell: ${sellGoldData.summary?.total_gold_weight}` : '' }}
                            {{ hasP2PData ? `| P2P Net: ${calculateP2PNetWeight}` : '' }}
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-5 rounded-lg">
                        <div class="text-sm opacity-80 mb-1">Net Position Value</div>
                        <div class="text-3xl font-bold">{{ calculateTotalNetAmount }}</div>
                        <div class="mt-2 text-sm opacity-80">
                            Current Value: {{ goldData.summary?.total_current_value }}
                            {{ hasSellData ? `| Sold: ${sellGoldData.summary?.total_sold_amount}` : '' }}
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <!-- Current Value of Net Gold Weight -->
                    <div class="bg-gradient-to-r from-amber-500 to-yellow-600 text-white p-5 rounded-lg">
                        <div class="text-sm opacity-80 mb-1">Current Value of Net Gold</div>
                        <div class="flex items-center justify-between">
                            <div class="text-3xl font-bold">{{ formatNetGoldValue }}</div>
                            <div class="text-sm px-3 py-1 bg-white/20 rounded-lg">
                                {{ parseFloat(calculateTotalNetWeight) }} grams × {{ formatCurrentPrice }}
                            </div>
                        </div>
                        <div class="mt-2 text-sm opacity-80">
                            Based on current gold price: {{ goldData.summary?.current_gold_price?.buy_rate }}
                            ({{ goldData.summary?.current_gold_price?.date }})
                        </div>
                    </div>

                    <!-- Profit/Loss on Net Position -->
                    <div :class="{
                        'p-5 rounded-lg text-white': true,
                        'bg-gradient-to-r from-green-500 to-emerald-600': netPositionProfitLoss.isProfit,
                        'bg-gradient-to-r from-red-500 to-rose-600': !netPositionProfitLoss.isProfit
                    }">
                        <div class="text-sm opacity-80 mb-1">Profit/Loss on Net Position</div>
                        <div class="flex items-center justify-between">
                            <div class="text-3xl font-bold">{{ netPositionProfitLoss.formattedValue }}</div>
                            <div class="text-sm px-3 py-1 bg-white/20 rounded-lg">
                                {{ netPositionProfitLoss.percentage }}%
                            </div>
                        </div>
                        <div class="mt-2 text-sm opacity-80">
                            Original investment: {{ netPositionProfitLoss.originalInvestment }}
                            | Current value: {{ formatNetGoldValue }}
                        </div>
                    </div>
                </div>
            </section>


            <!-- Gemini AI Analysis -->
            <section class="bg-white rounded-xl p-6 shadow-md">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                        <h2 class="text-xl font-bold">AI ວິເຄາະການລົງທຶນຄຳ / Gold Investment Analysis</h2>
                        <div class="ml-2 text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path
                                    d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                        </div>
                    </div>
                    <button v-if="!aiAnalysisLoading && aiAnalysis" @click="getGeminiAnalysis"
                        class="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        ວິເຄາະຄືນໃໝ່ / Regenerate
                    </button>
                </div>

                <div v-if="aiAnalysisLoading" class="flex items-center justify-center h-48">
                    <div class="animate-pulse text-center">
                        <div class="text-sm mb-2">ກຳລັງວິເຄາະຂໍ້ມູນການລົງທຶນຄຳຂອງທ່ານ...</div>
                        <div class="text-sm mb-4">Analyzing your gold investment data...</div>
                        <div
                            class="inline-block w-8 h-8 border-2 border-t-blue-400 border-blue-200 rounded-full animate-spin">
                        </div>
                    </div>
                </div>

                <div v-else-if="!aiAnalysis && !aiAnalysisLoading"
                    class="flex flex-col items-center justify-center h-48">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-amber-400 mb-4" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p class="text-gray-600 mb-2">ຍັງບໍ່ມີການວິເຄາະ AI</p>
                    <p class="text-gray-600 mb-4">No AI analysis generated yet</p>
                    <button @click="getGeminiAnalysis"
                        class="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors">
                        ສ້າງການວິເຄາະ / Generate Analysis
                    </button>
                </div>

                <div v-else-if="aiError" class="bg-red-50 p-4 rounded-lg">
                    <p class="text-red-600">{{ aiError }}</p>
                </div>

                <div v-else class="prose max-w-none">
                    <div v-html="aiAnalysis"></div>
                    <div class="text-right text-sm text-gray-500 mt-4">
                        ວິເຄາະເມື່ອ / Analyzed on: {{ aiAnalysisTimestamp }}
                    </div>
                </div>
            </section>

            <!-- Recommendations -->
            <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div v-if="goldData.recommendations?.[0]" class="bg-white rounded-xl p-6 shadow-md">
                    <h2 class="text-xl font-bold mb-4">{{ goldData.recommendations[0].type.replace('_', ' ') }}</h2>
                    <p class="mb-4">{{ goldData.recommendations[0].message }}</p>
                    <p class="text-sm text-gray-500 mb-3">{{ goldData.recommendations[0].details }}</p>

                    <div class="bg-amber-50 border border-amber-100 rounded-lg p-4">
                        <table class="min-w-full">
                            <thead>
                                <tr>
                                    <th
                                        class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                                        Date</th>
                                    <th
                                        class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                                        Weight</th>
                                    <th
                                        class="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                                        Profit</th>
                                    <th
                                        class="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                                        %</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(transaction, index) in goldData.recommendations[0].transactions"
                                    :key="index" class="border-t border-amber-100">
                                    <td class="py-2 text-sm">{{ transaction.purchase_date }}</td>
                                    <td class="py-2 text-sm">{{ transaction.gold_weight }}</td>
                                    <td class="py-2 text-sm text-right font-medium text-green-600">{{ transaction.profit
                                        }}</td>
                                    <td class="py-2 text-sm text-right font-medium text-green-600">{{
                                        transaction.profit_percentage }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div v-if="goldData.recommendations?.[1]" class="bg-white rounded-xl p-6 shadow-md">
                    <h2 class="text-xl font-bold mb-4">Market Trend Analysis</h2>
                    <p class="mb-4">{{ goldData.recommendations[1].message }}</p>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-amber-50 rounded-lg p-4 text-center">
                            <div class="text-3xl font-bold text-amber-600">{{
                                goldData.recommendations[1].overall_profit_percentage }}</div>
                            <div class="text-sm text-gray-600">Overall Profit</div>
                        </div>
                        <div class="bg-amber-50 rounded-lg p-4 text-center">
                            <div class="text-3xl font-bold text-amber-600">{{
                                goldData.recommendations[1].total_gold_weight }}</div>
                            <div class="text-sm text-gray-600">Total Gold</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Transactions Table -->
            <section class="bg-white rounded-xl p-6 shadow-md">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold">All Transactions</h2>
                    <div class="flex space-x-4">
                        <button @click="toggleAllTransactions" class="text-sm text-blue-600 hover:text-blue-800">
                            {{ showAllTransactions ? 'Show Less' : 'Show All' }}
                        </button>
                        <button @click="exportToPDF"
                            class="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export PDF
                        </button>
                        <button @click="exportToExcel"
                            class="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export Excel
                        </button>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    #</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Transaction ID</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Gold</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Purchase Price</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Current Value</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Profit/Loss</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="(transaction, index) in displayedTransactions" :key="index"
                                class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{
                                    index + 1 }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{
                                    transaction.transaction_id }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{
                                    transaction.purchase_date }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ transaction.gold_weight
                                    }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{
                                    transaction.purchase_price_per_gram }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{
                                    transaction.current_price_per_gram }}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span
                                        :class="{ 'text-sm font-medium': true, 'text-green-600': transaction.is_profitable, 'text-red-600': !transaction.is_profitable }">
                                        {{ transaction.profit_loss }} ({{ transaction.profit_loss_percentage }})
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'

// Component imports will be auto-imported by Nuxt
// Wrap charts in <ClientOnly> tags to avoid SSR issues

const route = useRoute()
const router = useRouter()

// For customer ID input and search
const searchCustomerId = ref('')
const inputError = ref(null)
const recentSearches = ref([])
const dataLoaded = ref(false)
const hasData = ref(false)

// Data refs
const loading = ref(false)
const error = ref(null)
const goldData = ref({})
const goldPrice = ref({})
const purchases = ref([])
const sellGoldData = ref({})
const p2pGoldData = ref({})
const customerAccounts = ref({})
const showAllTransactions = ref(false)
const reportContent = ref(null)

// AI Analysis state
const aiAnalysisLoading = ref(false)
const aiError = ref('')
const aiAnalysis = ref('')
const aiAnalysisTimestamp = ref('')

// Computed properties
const displayedTransactions = computed(() => {
    if (!goldData.value.transactions) return []
    return showAllTransactions.value ? goldData.value.transactions : goldData.value.transactions.slice(0, 5)
})

const hasSellData = computed(() => {
    return sellGoldData.value?.summary?.total_transactions > 0
})

const hasP2PData = computed(() => {
    return p2pGoldData.value?.summary?.total_transactions > 0
})

const getP2PTransferCounts = computed(() => {
    if (!hasP2PData.value || !p2pGoldData.value.transactions) {
        return { received: 0, sent: 0 }
    }

    let received = 0
    let sent = 0

    p2pGoldData.value.transactions.forEach(transaction => {
        if (isIncomingTransfer(transaction)) {
            received++
        } else {
            sent++
        }
    })

    return { received, sent }
})

const calculateP2PNetWeight = computed(() => {
    if (!hasP2PData.value) return "0.00 grams"

    let incomingWeight = 0
    let outgoingWeight = 0

    p2pGoldData.value.transactions.forEach(transaction => {
        // Extract weight as a number
        const weight = parseFloat(transaction.gold_weight?.replace(/[^\d.-]/g, '') || 0)

        if (isIncomingTransfer(transaction)) {
            incomingWeight += weight
        } else {
            outgoingWeight += weight
        }
    })

    const netWeight = incomingWeight - outgoingWeight
    return `${netWeight.toFixed(2)} grams`
})

const calculateTotalNetAmount = computed(() => {
    const buyAmount = parseFloat(goldData.value.summary?.total_current_value?.replace(/[^\d.-]/g, '') || 0)
    const sellAmount = parseFloat(sellGoldData.value.summary?.total_sold_amount?.replace(/[^\d.-]/g, '') || 0)
    return formatCurrency(buyAmount - sellAmount)
})

const calculateTotalNetWeight = computed(() => {
    const buyWeight = parseFloat(goldData.value.summary?.total_gold_weight?.replace(/[^\d.-]/g, '') || 0)
    const sellWeight = parseFloat(sellGoldData.value.summary?.total_gold_weight?.replace(/[^\d.-]/g, '') || 0)

    // Include P2P transfers in net weight calculation
    let p2pWeight = 0
    if (hasP2PData.value) {
        const p2pNetWeightStr = calculateP2PNetWeight.value
        p2pWeight = parseFloat(p2pNetWeightStr.replace(/[^\d.-]/g, '') || 0)
    }

    return `${(buyWeight - sellWeight + p2pWeight).toFixed(2)} grams`
})

// Helper functions for account checking
function isMyAccount(accountNumber) {
    if (!accountNumber || !customerAccounts.value.accounts) return false

    return customerAccounts.value.accounts.some(account => account.account_no === accountNumber)
}

function isIncomingTransfer(transaction) {
    if (!transaction) return false

    // Check if any of my accounts is the credit account (receiving gold)
    return isMyAccount(transaction.credit_account)
}

// Toggle showing all transactions
function toggleAllTransactions() {
    showAllTransactions.value = !showAllTransactions.value
}

// Validate customer ID format
function validateCustomerId(id) {
    // Basic validation - you can enhance this based on your specific format
    // This checks for a pattern like XXXX-XXXXXXX-X
    const pattern = /^\d{4}-\d{7}-\d{1}$/
    return pattern.test(id)
}

// Search for customer
function searchCustomer() {
    inputError.value = null

    if (!searchCustomerId.value.trim()) {
        inputError.value = 'Please enter a customer ID'
        return
    }

    // Optional: Add validation
    if (!validateCustomerId(searchCustomerId.value)) {
        inputError.value = 'Invalid customer ID format. Expected format: XXXX-XXXXXXX-X'
        return
    }

    // Add to recent searches if not already there
    if (!recentSearches.value.includes(searchCustomerId.value)) {
        recentSearches.value.unshift(searchCustomerId.value)
        // Keep only the last 5 searches
        if (recentSearches.value.length > 5) {
            recentSearches.value = recentSearches.value.slice(0, 5)
        }
        // Save to localStorage
        localStorage.setItem('recentGoldSearches', JSON.stringify(recentSearches.value))
    }

    // Fetch data for the customer
    fetchData(searchCustomerId.value)
}

// Load a recent search
function loadRecentSearch(customerId) {
    searchCustomerId.value = customerId
    searchCustomer()
}

// Fetch all required data
async function fetchData(customerId) {
    loading.value = true
    error.value = null
    dataLoaded.value = false
    hasData.value = false

    try {
        // Fetch all reports in parallel
        const [reportResponse, priceResponse, purchasesResponse, sellingReportResponse, p2pReportResponse, customerAccountsResponse] = await Promise.all([
            fetch(`http://172.16.0.46:3000/api/gold/report/${customerId}`),
            fetch('http://172.16.0.46:3000/api/gold/price'),
            fetch(`http://172.16.0.46:3000/api/gold/purchases/${customerId}`),
            fetch(`http://172.16.0.46:3000/api/gold/selling-report/${customerId}`),
            fetch(`http://172.16.0.46:3000/api/gold/p2p-report/${customerId}`),
            fetch(`http://172.16.0.46:3000/api/accounts/customer/${customerId}`)
        ]);

        // Check report response
        if (!reportResponse.ok) {
            if (reportResponse.status === 404) {
                dataLoaded.value = true
                hasData.value = false
                return
            }
            throw new Error(`Failed to fetch gold report: ${reportResponse.statusText}`)
        }

        // Process all responses
        const reportData = await reportResponse.json()
        const priceData = await priceResponse.json()
        const purchasesData = await purchasesResponse.json()

        // Handle selling report (might not exist for all customers)
        let sellingData = { data: { summary: { total_transactions: 0 }, transactions: [] } }
        if (sellingReportResponse.ok) {
            sellingData = await sellingReportResponse.json()
        }

        // Handle P2P report (might not exist for all customers)
        let p2pData = { data: { summary: { total_transactions: 0 }, transactions: [] } }
        if (p2pReportResponse.ok) {
            p2pData = await p2pReportResponse.json()
        }

        // Handle customer accounts (might not exist for all customers)
        let accountsData = { data: { customer_info: { total_accounts: 0 }, accounts: [] } }
        if (customerAccountsResponse.ok) {
            accountsData = await customerAccountsResponse.json()
        }

        // Check if there's actual data
        if (!reportData.data || !reportData.data.summary) {
            dataLoaded.value = true
            hasData.value = false
            return
        }

        // Set data
        goldData.value = reportData.data
        goldPrice.value = priceData.data
        purchases.value = purchasesData.data.purchases
        sellGoldData.value = sellingData.data
        p2pGoldData.value = p2pData.data
        customerAccounts.value = accountsData.data

        // Update data status - consider data available if either buying or selling exists
        dataLoaded.value = true
        hasData.value = true

    } catch (err) {
        console.error('Error fetching data:', err)
        error.value = err.message
        dataLoaded.value = true
        hasData.value = false
    } finally {
        loading.value = false
    }
}

// Get AI analysis from Gemini
async function getGeminiAnalysis() {
    if (!goldData.value || !goldData.value.summary) {
        aiError.value = 'ບໍ່ມີຂໍ້ມູນພຽງພໍສຳລັບການວິເຄາະ / Not enough data for analysis'
        return
    }

    aiAnalysisLoading.value = true
    aiError.value = ''

    try {
        // Call Gemini API for analysis
        const response = await fetch('/api/gemini-analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                goldData: goldData.value,
                goldPrice: goldPrice.value,
                sellGoldData: sellGoldData.value,
                p2pGoldData: p2pGoldData.value,
                customerAccounts: customerAccounts.value,
                hasSellingData: hasSellData.value,
                hasP2PData: hasP2PData.value,
                p2pTransferCounts: getP2PTransferCounts.value,
                netPosition: {
                    weight: calculateTotalNetWeight.value,
                    value: calculateTotalNetAmount.value,
                    p2pNetWeight: calculateP2PNetWeight.value
                }
            })
        })

        if (!response.ok) throw new Error('Failed to get AI analysis')
        const data = await response.json()

        // Set AI analysis with formatted HTML
        aiAnalysis.value = data.analysis

        // Format timestamp for display
        const now = new Date()
        aiAnalysisTimestamp.value = now.toLocaleString('lo-LA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch (err) {
        console.error('Error getting AI analysis:', err)
        aiError.value = 'ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ກັບ AI / Error connecting to AI service'
    } finally {
        aiAnalysisLoading.value = false
    }
}

// Export functions
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

        pdf.save(`Gold_Report_${searchCustomerId.value}.pdf`)
    } catch (err) {
        console.error('PDF Export Error:', err)
        error.value = 'Failed to export PDF. Please try again.'
    }
}

const exportToExcel = () => {
    if (typeof window === 'undefined') return // Ensure client-side only

    const wb = XLSX.utils.book_new()

    // Helper to format numbers for Excel
    const formatNumber = (value, type = 'number') => {
        if (type === 'currency') return { v: parseFloat(value.replace(/[^\d.-]/g, '')), t: 'n', z: '#,##0' }
        if (type === 'weight') return { v: parseFloat(value), t: 'n', z: '0.00' }
        if (type === 'percent') return { v: parseFloat(value) / 100, t: 'n', z: '0.00%' }
        return { v: value, t: 'n' }
    }

    // Sheet 1: Summary
    const summaryData = [
        ['Gold Investment Report Summary', null],
        ['Customer ID', goldData.value.summary?.customer_id],
        ['Customer Name', customerAccounts.value.accounts?.[0]?.account_name || 'N/A'],
        ['Total Accounts', customerAccounts.value.customer_info?.total_accounts || 0],
        ['', ''],
        ['Gold Investment', null],
        ['Total Transactions', goldData.value.summary?.total_transactions],
        ['Total Gold Weight', goldData.value.summary?.total_gold_weight],
        ['Total Investment', goldData.value.summary?.total_investment],
        ['Current Value', goldData.value.summary?.total_current_value],
        ['Profit/Loss', goldData.value.summary?.total_profit_loss],
        ['Profit/Loss Percentage', goldData.value.summary?.total_profit_loss_percentage],
        ['Current Gold Price (Buy)', goldData.value.summary?.current_gold_price?.buy_rate],
        ['Current Gold Price (Sell)', goldData.value.summary?.current_gold_price?.sell_rate],
        ['Last Updated', goldData.value.summary?.current_gold_price?.date]
    ]

    // Add selling data if available
    if (hasSellData.value) {
        summaryData.push(['', ''])
        summaryData.push(['Selling Summary', null])
        summaryData.push(['Total Sell Transactions', sellGoldData.value.summary?.total_transactions])
        summaryData.push(['Total Gold Sold', sellGoldData.value.summary?.total_gold_weight])
        summaryData.push(['Total Sold Amount', sellGoldData.value.summary?.total_sold_amount])
        summaryData.push(['Average Price Per Gram', sellGoldData.value.summary?.average_price_per_gram])
    }

    // Add P2P data if available
    if (hasP2PData.value) {
        summaryData.push(['', ''])
        summaryData.push(['P2P Transfers Summary', null])
        summaryData.push(['Total P2P Transactions', p2pGoldData.value.summary?.total_transactions])
        summaryData.push(['Total Gold Transferred', p2pGoldData.value.summary?.total_gold_weight])
        summaryData.push(['Transfers Received', getP2PTransferCounts.value.received])
        summaryData.push(['Transfers Sent', getP2PTransferCounts.value.sent])
        summaryData.push(['P2P Net Weight', calculateP2PNetWeight.value])
    }

    // Add net position if available
    if (hasSellData.value || hasP2PData.value) {
        summaryData.push(['', ''])
        summaryData.push(['Net Position', null])
        summaryData.push(['Net Gold Weight', calculateTotalNetWeight.value])
        if (hasSellData.value) {
            summaryData.push(['Net Position Value', calculateTotalNetAmount.value])
        }
    }

    // Add customer accounts
    if (customerAccounts.value.accounts && customerAccounts.value.accounts.length > 0) {
        summaryData.push(['', ''])
        summaryData.push(['Customer Accounts', null])
        customerAccounts.value.accounts.forEach((account, index) => {
            summaryData.push([`Account ${index + 1}`, `${account.account_no} (${account.account_currency} - ${account.account_type})`])
        })
    }

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary')

    // Sheet 2: Buy Transactions
    const transactionHeaders = [
        'Transaction ID',
        'Date',
        'Gold Weight',
        'Purchase Price',
        'Current Price',
        'Total Purchase',
        'Current Value',
        'Profit/Loss',
        'P/L %',
        'Profitable'
    ]

    const transactionData = [transactionHeaders]

    if (goldData.value.transactions) {
        goldData.value.transactions.forEach(t => {
            transactionData.push([
                t.transaction_id,
                t.purchase_date,
                t.gold_weight,
                t.purchase_price_per_gram,
                t.current_price_per_gram,
                t.total_purchase_amount,
                t.current_value,
                t.profit_loss,
                t.profit_loss_percentage,
                t.is_profitable ? 'Yes' : 'No'
            ])
        })
    }

    const transactionSheet = XLSX.utils.aoa_to_sheet(transactionData)
    XLSX.utils.book_append_sheet(wb, transactionSheet, 'Buy Transactions')

    // Sheet 3: Sell Transactions (if available)
    if (hasSellData.value && sellGoldData.value.transactions.length > 0) {
        const sellTransactionHeaders = [
            'Transaction ID',
            'Date',
            'Account',
            'Is My Account',
            'Gold Weight',
            'Price Per Gram',
            'Total Amount',
            'Currency'
        ]

        const sellTransactionData = [sellTransactionHeaders]

        sellGoldData.value.transactions.forEach(t => {
            sellTransactionData.push([
                t.transaction_id,
                t.sale_date,
                t.account_no,
                isMyAccount(t.account_no) ? 'Yes' : 'No',
                t.gold_weight,
                t.price_per_gram,
                t.total_amount,
                t.currency
            ])
        })

        const sellTransactionSheet = XLSX.utils.aoa_to_sheet(sellTransactionData)
        XLSX.utils.book_append_sheet(wb, sellTransactionSheet, 'Sell Transactions')
    }

    // Sheet 4: P2P Transactions (if available)
    if (hasP2PData.value && p2pGoldData.value.transactions.length > 0) {
        const p2pTransactionHeaders = [
            'Transaction ID',
            'Date',
            'Gold Weight',
            'Direction',
            'Type',
            'From Account',
            'Is My Account (From)',
            'To Account',
            'Is My Account (To)',
            'Reference'
        ]

        const p2pTransactionData = [p2pTransactionHeaders]

        p2pGoldData.value.transactions.forEach(t => {
            p2pTransactionData.push([
                t.transaction_id,
                t.transfer_date,
                t.gold_weight,
                isIncomingTransfer(t) ? 'Incoming' : 'Outgoing',
                isIncomingTransfer(t) ? 'Received' : 'Sent',
                t.debit_account,
                isMyAccount(t.debit_account) ? 'Yes' : 'No',
                t.credit_account,
                isMyAccount(t.credit_account) ? 'Yes' : 'No',
                t.core_banking_ref
            ])
        })

        const p2pTransactionSheet = XLSX.utils.aoa_to_sheet(p2pTransactionData)
        XLSX.utils.book_append_sheet(wb, p2pTransactionSheet, 'P2P Transfers')
    }

    // Sheet 5: Customer Accounts
    if (customerAccounts.value.accounts && customerAccounts.value.accounts.length > 0) {
        const accountHeaders = [
            'Account Number',
            'Account Name',
            'Account Type',
            'Currency'
        ]

        const accountData = [accountHeaders]

        customerAccounts.value.accounts.forEach(account => {
            accountData.push([
                account.account_no,
                account.account_name,
                account.account_type,
                account.account_currency
            ])
        })

        const accountSheet = XLSX.utils.aoa_to_sheet(accountData)
        XLSX.utils.book_append_sheet(wb, accountSheet, 'Customer Accounts')
    }

    // Sheet 6: Recommendations
    if (goldData.value.recommendations && goldData.value.recommendations.length > 0) {
        const recommendationData = [
            ['Recommendations', null],
            ['Type', goldData.value.recommendations[0].type],
            ['Message', goldData.value.recommendations[0].message],
            ['Details', goldData.value.recommendations[0].details],
            ['', ''],
            ['High Profit Transactions', null],
            ['Transaction ID', 'Date', 'Gold Weight', 'Profit', 'Profit %']
        ]

        if (goldData.value.recommendations[0].transactions) {
            goldData.value.recommendations[0].transactions.forEach(t => {
                recommendationData.push([
                    t.transaction_id,
                    t.purchase_date,
                    t.gold_weight,
                    t.profit,
                    t.profit_percentage
                ])
            })
        }

        const recommendationSheet = XLSX.utils.aoa_to_sheet(recommendationData)
        XLSX.utils.book_append_sheet(wb, recommendationSheet, 'Recommendations')
    }

    // Download
    XLSX.writeFile(wb, `Gold_Report_${searchCustomerId.value}.xlsx`)
}

// Format utilities
function formatDateDisplay(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'LAK',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}

const formatCurrentPrice = computed(() => {
    if (!goldData.value?.summary?.current_gold_price?.buy_rate) return 'N/A'

    // Extract just the numeric value from the price string
    const priceStr = goldData.value.summary.current_gold_price.buy_rate
    const match = priceStr.match(/[\d,]+\.\d+|\d+/)
    if (!match) return 'N/A'

    return new Intl.NumberFormat('en-US').format(parseFloat(match[0].replace(/,/g, '')))
})

const formatNetGoldValue = computed(() => {
    if (!goldData.value?.summary?.current_gold_price?.buy_rate) return 'N/A'

    // Extract net weight as a number
    const netWeightStr = calculateTotalNetWeight.value
    const netWeight = parseFloat(netWeightStr.replace(/[^\d.-]/g, '') || 0)

    // Extract price as a number
    const priceStr = goldData.value.summary.current_gold_price.buy_rate
    const match = priceStr.match(/[\d,]+\.\d+|\d+/)
    if (!match) return 'N/A'
    const price = parseFloat(match[0].replace(/,/g, ''))

    // Calculate value
    const value = netWeight * price

    return formatCurrency(value)
})

const netPositionProfitLoss = computed(() => {
    // Get current value of net gold
    const netWeightStr = calculateTotalNetWeight.value
    const netWeight = parseFloat(netWeightStr.replace(/[^\d.-]/g, '') || 0)

    // Get current gold price
    const priceStr = goldData.value?.summary?.current_gold_price?.buy_rate || '0'
    const priceMatch = priceStr.match(/[\d,]+\.\d+|\d+/)
    const currentPrice = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0

    // Calculate current value
    const currentValue = netWeight * currentPrice

    // Calculate average purchase price from buy transactions
    let totalInvestment = 0
    let totalWeight = 0

    if (goldData.value?.transactions) {
        goldData.value.transactions.forEach(t => {
            // Only count completed transactions
            if (t.profit_loss_percentage) {
                const weight = parseFloat(t.gold_weight.replace(/[^\d.-]/g, '') || 0)
                const purchasePrice = parseFloat(t.purchase_price_per_gram.replace(/[^\d.-]/g, '') || 0)
                totalInvestment += weight * purchasePrice
                totalWeight += weight
            }
        })
    }

    // Calculate average purchase price
    const avgPurchasePrice = totalWeight > 0 ? totalInvestment / totalWeight : 0

    // Calculate original investment for net gold
    const originalInvestment = netWeight * avgPurchasePrice

    // Calculate profit/loss
    const profitLoss = currentValue - originalInvestment
    const percentage = originalInvestment > 0 ? (profitLoss / originalInvestment) * 100 : 0

    return {
        originalInvestment: formatCurrency(originalInvestment),
        currentValue: formatCurrency(currentValue),
        profitLoss: profitLoss,
        formattedValue: formatCurrency(profitLoss),
        percentage: percentage.toFixed(2),
        isProfit: profitLoss >= 0
    }
})

// Initialize on mount
onMounted(() => {
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem('recentGoldSearches')
    if (savedSearches) {
        try {
            recentSearches.value = JSON.parse(savedSearches)
        } catch (e) {
            console.error('Error parsing saved searches', e)
        }
    }

    // Initialize with the default customer ID or from route
    const initialCustomerId = route.query.id || ''
    searchCustomerId.value = initialCustomerId

    // Fetch data for the initial customer ID
    fetchData(initialCustomerId)
})

// Update the URL when customer ID changes
watch(searchCustomerId, (newId) => {
    if (newId) {
        router.replace({ query: { id: newId } })
    }
})
</script>

<style scoped>
.gold-report {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

@media (max-width: 640px) {
    .gold-report {
        padding: 1rem 0.5rem;
    }
}

/* Fix for Tailwind border styles on inputs */
input {
    border-width: 1px;
}
</style>