<!-- components/ToastContainer.vue -->
<script setup>
import { ref } from 'vue';
import Toast from './Toast.vue';

const toasts = ref([]);

const addToast = (message, type = 'success', duration = 3000) => {
  const id = Date.now();
  toasts.value.push({ id, message, type, duration });
};

const removeToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

// Expose the addToast method to the template
defineExpose({ addToast });
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 space-y-4">
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :message="toast.message"
      :type="toast.type"
      :duration="toast.duration"
      @close="removeToast(toast.id)"
    />
  </div>
</template>