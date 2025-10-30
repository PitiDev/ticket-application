<template>
  <div class="p-4">
    <div class="flex items-center mb-4">
      <button @click="$router.back()" class="mr-2 text-gray-500 hover:text-gray-700">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
      </button>
      <h1 class="text-2xl font-bold">Update Branch Checklist</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <div v-if="checklistDetails && !loading">
      <!-- Checklist Header -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h2 class="text-xl font-semibold">{{ checklistDetails.checklist.branch_name }}</h2>
            <p class="text-sm text-gray-500">{{ checklistDetails.checklist.branch_code }}</p>
            <p class="text-sm text-gray-500 mt-1">Session date: {{ formatDate(checklistDetails.checklist.session_date)
            }}</p>
          </div>

          <span :class="{
            'bg-green-100 text-green-800': checklistDetails.checklist.status === 'completed',
            'bg-blue-100 text-blue-800': checklistDetails.checklist.status === 'in_progress',
            'bg-yellow-100 text-yellow-800': checklistDetails.checklist.status === 'pending'
          }" class="px-3 py-1 rounded-full text-sm font-medium">
            {{ formatStatus(checklistDetails.checklist.status) }}
          </span>
        </div>

        <div class="mb-4">
          <div class="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div class="bg-green-500 h-2 rounded-full"
              :style="{ width: checklistDetails.checklist.completion_percentage + '%' }"></div>
          </div>
          <div class="flex justify-between text-xs text-gray-500">
            <span>{{ checklistDetails.checklist.completed_items }} of {{ checklistDetails.checklist.total_items }}
              completed</span>
            <span>{{ checklistDetails.checklist.completion_percentage }}%</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500">Assigned To</p>
            <p>{{ checklistDetails.checklist.assigned_to_name || 'Not assigned' }}</p>
          </div>

          <div>
            <label for="checklist_notes" class="block text-sm text-gray-500 mb-1">Checklist Notes</label>
            <textarea id="checklist_notes" v-model="checklistNotes" rows="2" class="border rounded p-2 w-full text-sm"
              placeholder="Add notes about this checklist completion"></textarea>
          </div>
        </div>
      </div>

      <!-- Checklist Items -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <h3 class="text-lg font-medium mb-4">Checklist Items</h3>

        <div v-for="item in checklistDetails.items" :key="item.id"
          class="border-b pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0">
          <div class="flex items-start">
            <div class="flex-shrink-0 mt-0.5">
              <input type="checkbox" :id="'item_' + item.id" v-model="completedItems[item.id]"
                class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                :disabled="!canCompleteItem(item)" />
            </div>
            <div class="ml-3 flex-1">
              <div class="flex justify-between">
                <label :for="'item_' + item.id" class="text-base font-medium">{{ item.item_name }}</label>
                <div v-if="item.required_role !== 'both'" class="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                  {{ formatRole(item.required_role) }}
                </div>
              </div>
              <p class="text-sm text-gray-600 mt-1">{{ item.description }}</p>

              <div v-if="completedItems[item.id]" class="mt-3">
                <div class="mb-2">
                  <label :for="'notes_' + item.id" class="block text-xs text-gray-500 mb-1">Notes (Optional)</label>
                  <textarea :id="'notes_' + item.id" v-model="itemNotes[item.id]" rows="2"
                    class="border rounded p-2 w-full text-sm" placeholder="Add any notes for this item"></textarea>
                </div>

                <div class="mb-2">
                  <label :for="'attachment_' + item.id" class="block text-xs text-gray-500 mb-1">Attachment
                    (Optional)</label>
                  <input type="file" :id="'attachment_' + item.id" class="text-sm"
                    @change="handleFileChange($event, item.id)" />
                </div>
              </div>

              <div v-if="item.is_completed" class="mt-3 text-xs text-gray-500">
                <span>Previously completed by {{ item.completed_by_name }}</span>
                <span class="mx-1">•</span>
                <span>{{ formatDateTime(item.completed_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <button @click="updateChecklist" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          :disabled="saving">
          <span v-if="saving">Saving...</span>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';

const route = useRoute();
const router = useRouter();
const { showToast } = useToast();

// State
const checklistId = computed(() => route.params.id);
const checklistDetails = ref(null);
const loading = ref(true);
const saving = ref(false);
const error = ref('');
const completedItems = ref({});
const itemNotes = ref({});
const itemAttachments = ref({});
const checklistNotes = ref('');
const currentUser = ref(null);


const canCompleteItem = (item) => {
  // Log everything for debugging
  console.log('Checking if item can be completed:', item.id, item.item_name);

  if (!currentUser.value) {
    console.log('⚠️ No current user found - allowing item to be completed for debugging');
    // Temporarily enable all items for testing
    return true;
  }

  if (item.is_completed) {
    console.log('Item already completed');
    return false;
  }

  const userRole = currentUser.value.role;
  console.log('User role:', userRole, 'Item required role:', item.required_role);

  // Make "both" explicit to avoid confusion
  if (item.required_role === 'both') {
    console.log('Item can be completed by both roles');
    return true;
  }

  // Check role matches
  const canComplete = userRole === item.required_role ||
    userRole === 'admin' ||
    userRole === 'super_admin';

  console.log('Can complete?', canComplete);
  return canComplete;
};


// Methods
const fetchChecklistDetails = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await fetch(`https://ticket.laobullionbank.com/api/eod/checklist/${checklistId.value}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch checklist details');
    }

    checklistDetails.value = data.data;
    checklistNotes.value = checklistDetails.value.checklist.notes || '';

    // Initialize completed items based on current status
    checklistDetails.value.items.forEach(item => {
      completedItems.value[item.id] = item.is_completed || false;
      itemNotes.value[item.id] = item.completion_notes || '';
    });

    await fetchCurrentUser();
  } catch (err) {
    error.value = err.message;
    showToast(err.message, 'error');
  } finally {
    loading.value = false;
  }
};

const fetchCurrentUser = async () => {
  try {
    // First try the /me endpoint which might be more reliable
    const response = await fetch('https://ticket.laobullionbank.com/api/users/me', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user details');
    }

    console.log('Current user data:', data); // Debug user data
    currentUser.value = data.data || data; // Some APIs return data in data property, others directly

    console.log('Set current user to:', currentUser.value); // Verify it's set
  } catch (err) {
    console.error('Error fetching user details:', err);

    // Fallback to decoding the JWT token
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Extract user info from token (JWT tokens have 3 parts separated by dots)
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('Token payload:', payload);

          // Create a minimal user object from token data
          currentUser.value = {
            id: payload.id,
            role: payload.role
          };
          console.log('Set current user from token:', currentUser.value);
        }
      }
    } catch (tokenErr) {
      console.error('Failed to extract user info from token:', tokenErr);
      showToast('Failed to fetch user details. Some checklist items may not be editable.', 'warning');
    }
  }
};

const handleFileChange = (event, itemId) => {
  const file = event.target.files[0];
  if (file) {
    itemAttachments.value[itemId] = file;
  } else {
    delete itemAttachments.value[itemId];
  }
};

const updateChecklist = async () => {
  saving.value = true;

  try {
    // First, handle any file uploads and get URLs
    const attachmentUrls = {};

    for (const [itemId, file] of Object.entries(itemAttachments.value)) {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('checklist_item_id', itemId);
        formData.append('checklist_id', checklistId.value);

        const uploadResponse = await fetch('https://ticket.laobullionbank.com/api/eod/attachments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.message || 'Failed to upload attachment');
        }

        attachmentUrls[itemId] = uploadData.data.file_url;
      }
    }

    // Then update the checklist
    const completionData = [];

    checklistDetails.value.items.forEach(item => {
      // Only include items that have changed or are newly completed
      if (completedItems.value[item.id] !== item.is_completed ||
        (completedItems.value[item.id] && !item.is_completed)) {
        completionData.push({
          item_id: item.id,
          is_completed: completedItems.value[item.id],
          notes: itemNotes.value[item.id] || null,
          attachment_url: attachmentUrls[item.id] || null // Fixed: use item.id instead of itemId
        });
      }
    });

    const response = await fetch(`https://ticket.laobullionbank.com/api/eod/checklist/${checklistId.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        notes: checklistNotes.value,
        completion_data: completionData
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update checklist');
    }

    showToast('Checklist updated successfully', 'success');
    router.push(`/check-eod?date=${checklistDetails.value.checklist.session_date}`);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    saving.value = false;
  }
};

// Helper functions
const formatStatus = (status) => {
  if (!status) return '';

  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateTimeString).toLocaleString(undefined, options);
};

const formatRole = (role) => {
  if (!role) return '';

  switch (role) {
    case 'teller':
      return 'Teller';
    case 'branch_manager':
      return 'Branch Manager';
    case 'both':
      return 'Both';
    case 'admin':
      return 'Admin';
    case 'super_admin':
      return 'Super Admin';
    case 'it_staff':
      return 'IT Staff';
    case 'user':
      return 'User';
    default:
      return role;
  }
};

// Initialize
onMounted(() => {
  if (checklistId.value) {
    fetchChecklistDetails();
  } else {
    error.value = 'Checklist ID is required';
  }
});
</script>