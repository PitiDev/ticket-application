<template>
  <div class="bg-white shadow rounded-lg p-4">
    <div class="flex justify-between items-start mb-4">
      <div>
        <h3 class="text-lg font-medium">{{ branch.branch_name }}</h3>
        <p class="text-sm text-gray-500">{{ branch.branch_code }}</p>
      </div>
      
      <span 
        :class="{
          'bg-green-100 text-green-800': checklist.status === 'completed',
          'bg-blue-100 text-blue-800': checklist.status === 'in_progress',
          'bg-yellow-100 text-yellow-800': checklist.status === 'pending'
        }"
        class="px-2 py-1 rounded text-sm font-medium"
      >
        {{ formatStatus(checklist.status) }}
      </span>
    </div>
    
    <div class="mb-4">
      <div class="w-full bg-gray-200 rounded-full h-2 mb-1">
        <div 
          class="bg-green-500 h-2 rounded-full" 
          :style="{ width: checklist.completion_percentage + '%' }"
        ></div>
      </div>
      <div class="flex justify-between text-xs text-gray-500">
        <span>{{ checklist.completed_items }} of {{ checklist.total_items }} completed</span>
        <span>{{ checklist.completion_percentage }}%</span>
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <p class="text-xs text-gray-500">Assigned To</p>
        <p class="text-sm">{{ checklist.assigned_to_name || 'Not assigned' }}</p>
      </div>
      <div>
        <p class="text-xs text-gray-500">Last Updated</p>
        <p class="text-sm">{{ formatDateTime(checklist.updated_at) }}</p>
      </div>
    </div>
    
    <div class="flex justify-end">
      <button 
        @click="$emit('view-details', checklist.id)" 
        class="text-blue-500 text-sm hover:text-blue-700 mr-4"
      >
        View Details
      </button>
      
      <button 
        v-if="checklist.status !== 'completed'"
        @click="$emit('update-checklist', checklist.id)" 
        class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
      >
        Update Status
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  checklist: {
    type: Object,
    required: true
  },
  branch: {
    type: Object,
    required: true
  }
});

defineEmits(['view-details', 'update-checklist']);

// Helper functions
const formatStatus = (status) => {
  if (!status) return '';
  
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateTimeString).toLocaleString(undefined, options);
};
</script>