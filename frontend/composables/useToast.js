// composables/useToast.js
import { ref } from 'vue';

const toastContainer = ref(null);

export function useToast() {
  const setContainer = (container) => {
    toastContainer.value = container;
  };

  const show = (message, type = 'success', duration = 3000) => {
    if (toastContainer.value) {
      toastContainer.value.addToast(message, type, duration);
    }
  };

  return {
    setContainer,
    show,
    success: (message, duration) => show(message, 'success', duration),
    error: (message, duration) => show(message, 'error', duration),
    info: (message, duration) => show(message, 'info', duration),
    warning: (message, duration) => show(message, 'warning', duration),
  };
}