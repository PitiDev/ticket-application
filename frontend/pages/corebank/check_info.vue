<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">LBB Core Banking Check Info Customer</h1>
        <p class="text-gray-600">Search customer information using different methods</p>
      </div>

      <!-- Search Type Tabs -->
      <div class="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
            <button
              v-for="tab in searchTabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <div class="flex items-center gap-2">
                <component :is="tab.icon" class="h-5 w-5" />
                {{ tab.name }}
              </div>
            </button>
          </nav>
        </div>

        <!-- Search Forms -->
        <div class="p-6">
          <!-- Phone Number Search -->
          <div v-if="activeTab === 'phone'" class="space-y-4">
            <div>
              <label for="phoneNumber" class="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                v-model="searchData.phoneNumber"
                type="tel"
                placeholder="Enter phone number (e.g., 2097778968)"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-colors"
                @keyup.enter="searchClientInfo"
              />
            </div>
          </div>

          <!-- ID Card + Phone Search -->
          <div v-if="activeTab === 'idphone'" class="space-y-4">
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label for="globalId" class="block text-sm font-medium text-gray-700 mb-2">
                  Global ID (ID Card)
                </label>
                <input
                  id="globalId"
                  v-model="searchData.globalId"
                  type="text"
                  placeholder="Enter ID card number (e.g., PA0071xxx)"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-colors"
                  @keyup.enter="searchClientInfo"
                />
              </div>
              <div>
                <label for="phoneNumberCombo" class="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phoneNumberCombo"
                  v-model="searchData.phoneNumberCombo"
                  type="tel"
                  placeholder="Enter phone number (e.g., 2097778968)"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-colors"
                  @keyup.enter="searchClientInfo"
                />
              </div>
            </div>
          </div>

          <!-- Name Search -->
          <div v-if="activeTab === 'name'" class="space-y-4">
            <div>
              <label for="clientName" class="block text-sm font-medium text-gray-700 mb-2">
                Client Name
              </label>
              <input
                id="clientName"
                v-model="searchData.clientName"
                type="text"
                placeholder="Enter client name (e.g., chan)"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-colors"
                @keyup.enter="searchClientInfo"
              />
            </div>
          </div>

          <!-- Account Info Search -->
          <div v-if="activeTab === 'accounts'" class="space-y-4">
            <div>
              <label for="customerId" class="block text-sm font-medium text-gray-700 mb-2">
                Customer ID (CIF)
              </label>
              <input
                id="customerId"
                v-model="searchData.customerId"
                type="text"
                placeholder="Enter customer ID (e.g., 2000003)"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-colors"
                @keyup.enter="searchClientInfo"
              />
            </div>
          </div>

          <!-- Comparison Search -->
          <div v-if="activeTab === 'comparison'" class="space-y-4">
            <div>
              <label for="comparisonPhone" class="block text-sm font-medium text-gray-700 mb-2">
                Phone Number for Comparison
              </label>
              <input
                id="comparisonPhone"
                v-model="searchData.comparisonPhone"
                type="tel"
                placeholder="Enter phone number (e.g., 2056594991)"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-colors"
                @keyup.enter="searchClientInfo"
              />
            </div>
          </div>

          <!-- Search Button -->
          <div class="flex justify-center mt-6">
            <button
              @click="searchClientInfo"
              :disabled="pending || !isValidSearch"
              class="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-lg hover:from-amber-600 hover:to-yellow-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <svg v-if="pending" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              {{ pending ? 'Searching...' : 'Search Client' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center gap-2 text-red-800">
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <span class="font-medium">Error:</span>
          {{ error }}
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div class="flex items-center gap-2 text-green-800">
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <span class="font-medium">Success:</span>
          {{ successMessage }}
        </div>
      </div>

      <!-- Results -->
      <div v-if="clientData && !pending" class="space-y-6">
        <!-- Raw Data Processing Info (only show for accounts tab with raw format) -->
        <div v-if="activeTab === 'accounts' && clientData?.format === 'raw'" class="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-indigo-500">
          <div class="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4">
            <h2 class="text-lg font-semibold text-indigo-900 flex items-center gap-2">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Raw Data Processing Summary
            </h2>
          </div>
          <div class="p-6">
            <div class="grid md:grid-cols-4 gap-4 text-center">
              <div class="bg-blue-50 p-4 rounded-lg">
                <p class="text-2xl font-bold text-blue-600">{{ clientData.total_records }}</p>
                <p class="text-sm text-blue-700">Raw Records</p>
              </div>
              <div class="bg-green-50 p-4 rounded-lg">
                <p class="text-2xl font-bold text-green-600">{{ getAccountsData?.summary.total_accounts || 0 }}</p>
                <p class="text-sm text-green-700">Unique Accounts</p>
              </div>
              <div class="bg-purple-50 p-4 rounded-lg">
                <p class="text-2xl font-bold text-purple-600">{{ getAccountsData?.summary.total_contacts || 0 }}</p>
                <p class="text-sm text-purple-700">Unique Contacts</p>
              </div>
              <div class="bg-amber-50 p-4 rounded-lg">
                <p class="text-2xl font-bold text-amber-600">{{ Math.round(((getAccountsData?.summary.total_accounts || 0) / clientData.total_records) * 100) }}%</p>
                <p class="text-sm text-amber-700">Deduplication</p>
              </div>
            </div>
            <div class="mt-4 p-3 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-600">
                <span class="font-medium">Processing:</span> 
                {{ clientData.total_records }} raw SQL records with JOINs were processed and deduplicated into 
                {{ getAccountsData?.summary.total_accounts || 0 }} unique accounts and 
                {{ getAccountsData?.summary.total_contacts || 0 }} unique contacts.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Client Information -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white flex items-center gap-2">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Client Information
            </h2>
          </div>
          <div class="p-6">
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-gray-500">Client Number (CIF)</label>
                  <p class="text-lg font-semibold text-gray-900">{{ getClientInfo?.client_no || (activeTab === 'comparison' ? clientData.customer_info.core_banking.client_no : '') }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Client Name</label>
                  <p class="text-lg font-semibold text-gray-900">{{ getClientInfo?.client_name || (activeTab === 'comparison' ? clientData.customer_info.core_banking.client_name : '') }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Client ID</label>
                  <p class="text-lg font-semibold text-gray-900">{{ getClientInfo?.client_id || (activeTab === 'comparison' ? clientData.customer_info.core_banking.client_id : '') }}</p>
                </div>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-gray-500">Global ID Type</label>
                  <p class="text-lg font-semibold text-gray-900">{{ getClientInfo?.global_id_type || (activeTab === 'comparison' ? clientData.customer_info.core_banking.global_id_type : '') }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Global ID</label>
                  <p class="text-lg font-semibold text-gray-900">{{ getClientInfo?.global_id || (activeTab === 'comparison' ? clientData.customer_info.core_banking.global_id : '') }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Created By</label>
                  <p class="text-lg font-semibold text-gray-900">{{ getClientInfo?.created_by || (activeTab === 'comparison' ? clientData.customer_info.core_banking.created_by : '') }}</p>
                </div>
              </div>
            </div>
            
            <!-- Mobile Banking Info (only for comparison tab) -->
            <div v-if="activeTab === 'comparison'" class="mt-6 pt-6 border-t border-gray-200">
              <h3 class="text-lg font-semibold text-gray-800 mb-3">Mobile Banking Information</h3>
              <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <div>
                    <label class="text-sm font-medium text-gray-500">Customer ID</label>
                    <p class="text-lg font-semibold text-gray-900">{{ clientData.customer_info.mobile_banking.customer_id }}</p>
                  </div>
                </div>
                <div class="space-y-4">
                  <div>
                    <label class="text-sm font-medium text-gray-500">Total Accounts</label>
                    <p class="text-lg font-semibold text-gray-900">{{ clientData.customer_info.mobile_banking.total_accounts }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Issue and Expiry Dates (hide for comparison tab) -->
            <div v-if="activeTab !== 'comparison'" class="mt-6 pt-6 border-t border-gray-200">
              <div class="grid md:grid-cols-2 gap-6">
                <div class="flex items-center gap-3">
                  <div class="bg-amber-100 p-2 rounded-lg">
                    <svg class="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">Issue Date</label>
                    <p class="text-lg font-semibold text-gray-900">{{ getClientInfo?.issue_dt_formatted }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="bg-red-100 p-2 rounded-lg">
                    <svg class="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">Expiry Date</label>
                    <p class="text-lg font-semibold text-gray-900">{{ getClientInfo?.expiry_dt_formatted }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Summary Stats (for comparison tab) -->
        <div v-if="activeTab === 'comparison' && clientData.summary" class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white flex items-center gap-2">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              System Comparison Summary
            </h2>
          </div>
          <div class="p-6">
            <div class="grid md:grid-cols-4 gap-4 text-center">
              <div class="bg-blue-50 p-4 rounded-lg">
                <p class="text-2xl font-bold text-blue-600">{{ clientData.summary.total_accounts_in_mobile_banking }}</p>
                <p class="text-sm text-blue-700">Mobile Banking Accounts</p>
              </div>
              <div class="bg-green-50 p-4 rounded-lg">
                <p class="text-2xl font-bold text-green-600">{{ clientData.summary.total_accounts_in_core_banking }}</p>
                <p class="text-sm text-green-700">Core Banking Accounts</p>
              </div>
              <div class="bg-purple-50 p-4 rounded-lg">
                <p class="text-2xl font-bold text-purple-600">{{ clientData.summary.matching_accounts }}</p>
                <p class="text-sm text-purple-700">Matching Accounts</p>
              </div>
              <div class="bg-red-50 p-4 rounded-lg">
                <p class="text-2xl font-bold text-red-600">{{ clientData.summary.missing_in_mobile_banking }}</p>
                <p class="text-sm text-red-700">Missing in Mobile</p>
              </div>
            </div>
            
            <div class="mt-6 pt-4 border-t border-gray-200">
              <div class="flex gap-3 mb-3">
                <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  {{ Math.round((clientData.summary.matching_accounts / clientData.summary.total_accounts_in_core_banking) * 100) }}% Sync Rate
                </span>
                <span v-if="clientData.contact_details?.phone_number_match" class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Phone Number Match
                </span>
                <span v-else class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  Phone Number Mismatch
                </span>
              </div>
              
              <p class="text-sm text-gray-600">
                <span class="font-medium">Phone Queried:</span> 
                {{ clientData.contact_details?.mobile_banking_query_phone }}
              </p>
            </div>
          </div>
        </div>

        <!-- Account Summary (only show for accounts tab) -->
        <div v-if="activeTab === 'accounts' && clientData.summary" class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white flex items-center gap-2">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Account Summary
            </h2>
          </div>
          <div class="p-6">
            <div class="grid md:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="bg-blue-100 p-3 rounded-lg mb-2">
                  <svg class="h-8 w-8 text-blue-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <p class="text-2xl font-bold text-gray-900">{{ clientData.summary.total_accounts }}</p>
                <p class="text-sm text-gray-600">Total Accounts</p>
              </div>
              <div class="text-center">
                <div class="bg-green-100 p-3 rounded-lg mb-2">
                  <svg class="h-8 w-8 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p class="text-2xl font-bold text-gray-900">{{ clientData.summary.total_balance_formatted }}</p>
                <p class="text-sm text-gray-600">Total Balance</p>
              </div>
              <div class="text-center">
                <div class="bg-purple-100 p-3 rounded-lg mb-2">
                  <svg class="h-8 w-8 text-purple-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <p class="text-2xl font-bold text-gray-900">{{ clientData.summary.total_contacts }}</p>
                <p class="text-sm text-gray-600">Total Contacts</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Comparison (for comparison tab) -->
        <div v-if="activeTab === 'comparison' && clientData.AccountMobile && clientData.AccountCoreBank" class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white flex items-center gap-2">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              Account System Comparison
            </h2>
          </div>
          <div class="p-6">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Number</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <!-- Mobile Banking Accounts -->
                  <template v-for="(account, index) in clientData.AccountMobile.accounts" :key="`mobile-${index}`">
                    <tr class="bg-blue-50 hover:bg-blue-100 transition-colors">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ account.account_no }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ account.account_name }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ account.account_type }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ account.account_currency }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {{ account.status }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Mobile Banking
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <!-- No action needed for Mobile Banking accounts -->
                      </td>
                    </tr>
                  </template>
                  
                  <!-- Core Banking Accounts -->
                  <template v-for="(account, index) in clientData.AccountCoreBank.accounts" :key="`core-${index}`">
                    <tr :class="[
                      'hover:bg-green-100 transition-colors',
                      account.exists_in_mobile ? 'bg-green-50' : 'bg-red-50'
                    ]">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ account.account_no }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ account.account_name }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {{ account.account_type === 'C' ? 'CURRENT' : (account.account_type === 'T' ? 'TD12' : account.account_type) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ account.account_currency }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="[
                          'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                          account.status === 'A' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        ]">
                          {{ account.status === 'A' ? 'Active' : (account.status === 'N' ? 'New/Inactive' : account.status) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center gap-2">
                          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Core Banking
                          </span>
                          <span v-if="!account.exists_in_mobile" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Missing in Mobile
                          </span>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <!-- Add to Mobile Banking button only for accounts that don't exist in mobile -->
                        <button 
                          v-if="!account.exists_in_mobile" 
                          @click="addAccountToMobile(account)"
                          :disabled="addingAccount === account.account_no"
                          class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1 px-3 rounded-md flex items-center gap-1 transition-colors disabled:bg-indigo-400"
                        >
                          <svg v-if="addingAccount === account.account_no" class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <svg v-else class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          </svg>
                          {{ addingAccount === account.account_no ? 'Adding...' : 'Add to Mobile' }}
                        </button>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
              
              <!-- Legend -->
              <div class="mt-4 flex flex-wrap gap-3 text-xs text-gray-600">
                <span class="inline-flex items-center">
                  <span class="w-3 h-3 inline-block bg-green-50 mr-1"></span>
                  Account in both systems
                </span>
                <span class="inline-flex items-center">
                  <span class="w-3 h-3 inline-block bg-blue-50 mr-1"></span>
                  Mobile Banking record
                </span>
                <span class="inline-flex items-center">
                  <span class="w-3 h-3 inline-block bg-red-50 mr-1"></span>
                  Core Banking record not in Mobile
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Details (only show for accounts tab) -->
        <div v-if="activeTab === 'accounts' && clientData.accounts" class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white flex items-center gap-2">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              Account Details
            </h2>
          </div>
          <div class="p-6">
            <div v-if="clientData.accounts?.length > 0" class="space-y-3">
              <div
                v-for="account in clientData.accounts"
                :key="account.acct_no"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center gap-4">
                  <div class="bg-blue-100 p-2 rounded-lg">
                    <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">{{ account.acct_no }}</p>
                    <p class="text-sm text-gray-600">{{ account.ccy }} • {{ account.deposit_type === 'C' ? 'Current' : 'Term' }} | {{ getAccountTypeName(account.acct_type) }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-gray-900">{{ account.actual_bal_formatted }}</p>
                  <span 
                    :class="[
                      'text-xs font-medium px-2 py-1 rounded-full',
                      account.acct_status === 'A' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ account.acct_status === 'A' ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              <p class="mt-2">No accounts found</p>
            </div>
          </div>
        </div>

        <!-- Contact Details -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white flex items-center gap-2">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              Contact Details
            </h2>
          </div>
          <div class="p-6">
            <div v-if="getContactDetails?.length > 0" class="space-y-3">
              <div
                v-for="contact in getContactDetails"
                :key="contact.contact_ref_no || contact.contact_detail"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div class="bg-red-100 p-2 rounded-lg">
                    <svg class="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">{{ contact.contact_detail }}</p>
                    <p class="text-sm text-gray-600">{{ contact.contact_type }} {{ contact.contact_sub_type ? '- ' + contact.contact_sub_type : '' }}</p>
                  </div>
                </div>
                <span class="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              <p class="mt-2">No contact details found</p>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="searched && !clientData && !pending && !error" class="text-center py-12">
        <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0120 12c0-4.411-3.589-8-8-8s-8 3.589-8 8c0 2.152.851 4.165 2.343 5.657l1.414-1.414A6 6 0 0112 6a6 6 0 016 6 6 6 0 01-1.757 4.243l-1.414 1.414z"></path>
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No results found</h3>
        <p class="mt-2 text-gray-500">No client information found with the provided search criteria</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Page meta
definePageMeta({
  layout: 'empty',
});

// Icon components
const PhoneIcon = {
  template: `
    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
    </svg>
  `
};

const IdCardIcon = {
  template: `
    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
    </svg>
  `
};

const UserIcon = {
  template: `
    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
    </svg>
  `
};

const AccountIcon = {
  template: `
    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
    </svg>
  `
};

const ComparisonIcon = {
  template: `
    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
    </svg>
  `
};

// Reactive state
const activeTab = ref('phone');
const clientData = ref(null);
const error = ref(null);
const successMessage = ref(null);
const searched = ref(false);
const pending = ref(false);
const addingAccount = ref(null);

// Search data
const searchData = ref({
  phoneNumber: '',
  globalId: '',
  phoneNumberCombo: '20',
  clientName: '',
  customerId: '',
  comparisonPhone: ''
});

// Search tabs configuration
const searchTabs = [
  { id: 'phone', name: 'Phone Number', icon: PhoneIcon },
  { id: 'idphone', name: 'ID Card or Passport + Phone', icon: IdCardIcon },
  { id: 'name', name: 'Client Name', icon: UserIcon },
  { id: 'accounts', name: 'Account Info', icon: AccountIcon },
  { id: 'comparison', name: 'Mobile/Core Comparison', icon: ComparisonIcon }
];


// Account type mapping
const accountTypeMapping = {
  '101': 'Current Account',
  '102': 'Gold Savings Account',
  '103': 'Internal acct for gold selling',
  '104': 'Current - LAK',
  '105': 'Current - Gold',
  '106': 'Internal acct for Gold Trading',
  '199': 'ZZ CURRENT ACCOUNT',
  '201': 'TD6',
  '202': 'TD12',
  '203': 'Move New Deposit More You Get',
  '204': 'DEPOSIT FOR LOAN GRANTEE',
  '205': 'TD6',
  '206': 'TD12'
};
const getAccountTypeName = (acctType) => {
  return accountTypeMapping[acctType] || acctType;
};

// API configuration
const apiBaseUrl = 'http://172.16.0.46:3000';

// Computed properties
const isValidSearch = computed(() => {
  switch (activeTab.value) {
    case 'phone':
      return searchData.value.phoneNumber.trim().length > 0;
    case 'idphone':
      return searchData.value.globalId.trim().length > 0 && searchData.value.phoneNumberCombo.trim().length > 0;
    case 'name':
      return searchData.value.clientName.trim().length > 0;
    case 'accounts':
      return searchData.value.customerId.trim().length > 0;
    case 'comparison':
      return searchData.value.comparisonPhone.trim().length > 0;
    default:
      return false;
  }
});


const getClientInfo = computed(() => {
  if (!clientData.value) return null;
  
  if (clientData.value.customer_info && activeTab.value !== 'comparison') {
    return clientData.value.customer_info.core_banking || clientData.value.customer_info;
  }
  
  if (clientData.value.client_info) {
    return clientData.value.client_info;
  }
  
  return null;
});

const getContactDetails = computed(() => {
  if (!clientData.value) return [];
  
  if (activeTab.value === 'comparison' && clientData.value.contact_details?.core_banking) {
    return clientData.value.contact_details.core_banking;
  }
  
  if (clientData.value.contact_details && !Array.isArray(clientData.value.contact_details)) {
    return [];
  }
  
  return clientData.value.contact_details || [];
});

// Functions
const searchClientInfo = async () => {
  if (!isValidSearch.value) {
    error.value = 'Please fill in the required fields';
    return;
  }

  pending.value = true;
  error.value = null;
  successMessage.value = null;
  clientData.value = null;
  searched.value = false;

  try {
    let endpoint = '';
    let queryParams = {};
    
    // Build endpoint and query parameters based on active tab
    switch (activeTab.value) {
      case 'phone':
        endpoint = `${apiBaseUrl}/api/corebank/contact/search`;
        queryParams.phoneNumber = searchData.value.phoneNumber.trim();
        break;
      case 'idphone':
        endpoint = `${apiBaseUrl}/api/corebank/contact/search`;
        queryParams.globalId = searchData.value.globalId.trim();
        queryParams.phoneNumber = searchData.value.phoneNumberCombo.trim();
        break;
      case 'name':
        endpoint = `${apiBaseUrl}/api/corebank/contact/search`;
        queryParams.clientName = searchData.value.clientName.trim();
        break;
      case 'accounts':
        endpoint = `${apiBaseUrl}/api/corebank/accounts/${searchData.value.customerId.trim()}`;
        break;
      case 'comparison':
        endpoint = `${apiBaseUrl}/api/comparison/phone/${searchData.value.comparisonPhone.trim()}`;
        break;
    }

    let data;
    if (activeTab.value === 'accounts' || activeTab.value === 'comparison') {
      // For accounts and comparison endpoints, use direct path parameter
      data = await $fetch(endpoint, {
        method: 'GET',
        headers: {
          'header-x': 's384nf83rhw244',
          'Content-Type': 'application/json'
        }
      });
    } else {
      // For other endpoints, use query parameters
      data = await $fetch(endpoint, {
        method: 'GET',
        query: queryParams,
        headers: {
          'header-x': 's384nf83rhw244',
          'Content-Type': 'application/json'
        }
      });
    }

    if (data.success) {
      clientData.value = data.data;
      if (!data.data || (Array.isArray(data.data) && data.data.length === 0)) {
        searched.value = true;
      }
    } else {
      error.value = data.message || 'Failed to retrieve client information';
    }
  } catch (err) {
    console.error('API Error:', err);
    
    // Handle errors with user-friendly messages
    if (err.status === 404 || (err.message && err.message.includes('404'))) {
      error.value = activeTab.value === 'comparison'
        ? 'No comparison data found for this phone number'
        : (activeTab.value === 'accounts'
          ? 'Customer not found in LBB Core banking system'
          : 'Not Found Customer on LBB Core banking system');
    } else if (err.status === 500) {
      error.value = 'Internal server error. Please try again later.';
    } else if (err.status === 400) {
      error.value = 'Invalid search parameters. Please check your input.';
    } else {
      error.value = `Failed to fetch data: ${err.message || 'Network error'}`;
    }
  } finally {
    pending.value = false;
    searched.value = true;
  }
};

// Function to add account to mobile banking
const addAccountToMobile = async (account) => {
  // Clear any previous messages
  error.value = null;
  successMessage.value = null;
  addingAccount.value = account.account_no;
  
  try {
    // Extract account type code
    let accountType = account.account_type;
    if (accountType === 'C') accountType = 'CURRENT';
    else if (accountType === 'T') accountType = 'TD12';
    
    // Prepare the request payload
    const payload = {
      customerId: clientData.value.customer_info.mobile_banking.customer_id,
      accountNo: account.account_no,
      accountName: account.account_name,
      accountType: accountType
    };
    
    // Call the API
    const response = await $fetch(`${apiBaseUrl}/api/accounts`, {
      method: 'POST',
      headers: {
        'header-x': 's384nf83rhw244',
        'Content-Type': 'application/json'
      },
      body: payload
    });
    
    // Handle the response
    if (response.success) {
      // Update the account in the UI
      const index = clientData.value.AccountCoreBank.accounts.findIndex(a => a.account_no === account.account_no);
      if (index !== -1) {
        clientData.value.AccountCoreBank.accounts[index].exists_in_mobile = true;
      }
      
      // Update summary stats
      if (clientData.value.summary) {
        clientData.value.summary.matching_accounts += 1;
        clientData.value.summary.missing_in_mobile_banking -= 1;
        clientData.value.summary.total_accounts_in_mobile_banking += 1;
      }
      
      // Show success message
      successMessage.value = `Account ${account.account_no} successfully added to Mobile Banking`;
      
      // Add the account to the Mobile Banking accounts list if it doesn't exist
      const existsInMobile = clientData.value.AccountMobile.accounts.some(a => a.account_no === account.account_no);
      if (!existsInMobile) {
        clientData.value.AccountMobile.accounts.push({
          account_no: account.account_no,
          account_name: account.account_name,
          account_type: accountType,
          account_currency: account.account_currency,
          status: 'Active'
        });
      }
    } else {
      error.value = response.message || 'Failed to add account to Mobile Banking';
    }
  } catch (err) {
    console.error('API Error:', err);
    error.value = err.message || 'Error adding account to Mobile Banking';
  } finally {
    addingAccount.value = null;
  }
};

// Watchers
watch(activeTab, () => {
  clientData.value = null;
  error.value = null;
  successMessage.value = null;
  searched.value = false;
});

watch(searchData, () => {
  if (error.value || clientData.value) {
    clientData.value = null;
    error.value = null;
    successMessage.value = null;
    searched.value = false;
  }
}, { deep: true });

// Auto-hide success message after 5 seconds
watch(successMessage, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      successMessage.value = null;
    }, 5000);
  }
});

// SEO and meta tags
useHead({
  title: 'LBB Core Banking Check Customer Info',
  meta: [
    { name: 'description', content: 'Search customer information by phone number, ID card, client name, or customer ID' }
  ]
});
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>