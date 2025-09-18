<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Create EOD Session</h1>
    
    <!-- Form -->
    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <form @submit.prevent="createSession">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label for="session_date" class="block text-sm font-medium text-gray-700 mb-1">Session Date</label>
            <input 
              type="date" 
              id="session_date" 
              v-model="formData.session_date" 
              class="border rounded p-2 w-full"
              :max="today"
              required
            />
          </div>
          
          <div>
            <label for="template_id" class="block text-sm font-medium text-gray-700 mb-1">Checklist Template</label>
            <select 
              id="template_id" 
              v-model="formData.template_id" 
              class="border rounded p-2 w-full"
              required
            >
              <option value="" disabled>Select a template</option>
              <option 
                v-for="template in templates" 
                :key="template.id" 
                :value="template.id"
              >
                {{ template.template_name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="mb-6">
          <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea 
            id="notes" 
            v-model="formData.notes" 
            rows="3" 
            class="border rounded p-2 w-full"
            placeholder="Enter any notes for this EOD session"
          ></textarea>
        </div>
        
        <!-- Branches Selection -->
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-3">Select Branches</h3>
          
          <div class="mb-2 flex items-center">
            <input 
              type="checkbox" 
              id="select_all" 
              v-model="selectAll" 
              class="mr-2"
              @change="toggleSelectAll"
            />
            <label for="select_all" class="text-sm font-medium">Select All Branches</label>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div 
              v-for="branch in branches" 
              :key="branch.id" 
              class="border rounded p-3 flex items-start"
              :class="{ 'border-blue-500 bg-blue-50': selectedBranches.includes(branch.id) }"
            >
              <input 
                type="checkbox" 
                :id="'branch_' + branch.id" 
                :value="branch.id" 
                v-model="selectedBranches"
                class="mt-1 mr-2"
              />
              <div>
                <label :for="'branch_' + branch.id" class="block font-medium">{{ branch.branch_name }}</label>
                <span class="text-xs text-gray-500">{{ branch.branch_code }}</span>
                <p class="text-xs text-gray-500 mt-1">{{ branch.address }}</p>
              </div>
            </div>
          </div>
          
          <p v-if="selectedBranches.length === 0" class="mt-2 text-red-500 text-sm">
            Please select at least one branch
          </p>
        </div>
        
        <div class="flex justify-end space-x-4">
          <button 
            type="button" 
            @click="$router.push('/check-eod')" 
            class="border border-gray-300 bg-white px-4 py-2 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            :disabled="loading || selectedBranches.length === 0"
          >
            <span v-if="loading">Creating...</span>
            <span v-else>Create EOD Session</span>
          </button>
        </div>
      </form>
    </div>
    
    <!-- Template Preview -->
    <div v-if="selectedTemplate" class="bg-white shadow rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">Template Preview: {{ selectedTemplate.template_name }}</h2>
      <p class="text-gray-600 mb-4">{{ selectedTemplate.description }}</p>
      
      <h3 class="text-lg font-medium mb-3">Checklist Items</h3>
      <ul class="space-y-3">
        <li 
          v-for="item in templateItems" 
          :key="item.id" 
          class="border rounded-lg p-3"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0 mt-0.5">
              <div class="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                {{ item.item_order }}
              </div>
            </div>
            <div class="ml-3">
              <h4 class="text-base font-medium">{{ item.item_name }}</h4>
              <p class="text-sm text-gray-600">{{ item.description }}</p>
              <div class="mt-1 flex items-center space-x-2 text-xs">
                <span 
                  class="px-2 py-0.5 rounded bg-gray-100 text-gray-700"
                  :class="{
                    'bg-red-100 text-red-700': item.is_mandatory
                  }"
                >
                  {{ item.is_mandatory ? 'Required' : 'Optional' }}
                </span>
                <span class="px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  {{ formatRole(item.required_role) }}
                </span>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'; // Import watch from Vue
import { useToast } from '@/composables/useToast';
import { useRouter } from 'vue-router';

const router = useRouter();
const { showToast } = useToast();

// State
const templates = ref([]);
const templateItems = ref([]);
const branches = ref([]);
const formData = ref({
  session_date: '',
  template_id: '',
  notes: ''
});
const selectedBranches = ref([]);
const selectAll = ref(false);
const loading = ref(false);
const error = ref('');

// Computed
const today = computed(() => {
  const date = new Date();
  return date.toISOString().split('T')[0];
});

const selectedTemplate = computed(() => {
  if (!formData.value.template_id || !templates.value.length) return null;
  return templates.value.find(t => t.id === parseInt(formData.value.template_id));
});

// Methods
const fetchTemplates = async () => {
  try {
    const response = await fetch('http://172.16.4.62:9000/api/eod/templates', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch templates');
    }
    
    templates.value = data.data;
  } catch (err) {
    showToast(err.message, 'error');
  }
};

const fetchBranches = async () => {
  try {
    const response = await fetch('http://172.16.4.62:9000/api/branches', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch branches');
    }
    
    branches.value = data.data;
  } catch (err) {
    showToast(err.message, 'error');
  }
};

const fetchTemplateItems = async () => {
  if (!formData.value.template_id) {
    templateItems.value = [];
    return;
  }
  
  try {
    const response = await fetch(`http://172.16.4.62:9000/api/eod/templates/${formData.value.template_id}/items`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch template items');
    }
    
    templateItems.value = data.data;
  } catch (err) {
    showToast(err.message, 'error');
  }
};

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedBranches.value = branches.value.map(branch => branch.id);
  } else {
    selectedBranches.value = [];
  }
};

const createSession = async () => {
  if (selectedBranches.value.length === 0) {
    showToast('Please select at least one branch', 'error');
    return;
  }
  
  loading.value = true;
  
  try {
    const response = await fetch('http://172.16.4.62:9000/api/eod/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        session_date: formData.value.session_date,
        template_id: formData.value.template_id,
        notes: formData.value.notes,
        branch_ids: selectedBranches.value
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create EOD session');
    }
    
    showToast('EOD session created successfully', 'success');
    router.push(`/check-eod?date=${formData.value.session_date}`);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    loading.value = false;
  }
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
    default:
      return role;
  }
};

// Initialize
onMounted(() => {
  // Set today's date as default
  formData.value.session_date = today.value;
  
  // Fetch templates and branches
  fetchTemplates();
  fetchBranches();
});

// Watch for template changes to fetch items
watch(() => formData.value.template_id, (newId) => {
  if (newId) {
    fetchTemplateItems();
  } else {
    templateItems.value = [];
  }
});
</script>