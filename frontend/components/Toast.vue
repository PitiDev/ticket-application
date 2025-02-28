<!-- components/Toast.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'error', 'info', 'warning'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  }
});

const emit = defineEmits(['close']);
const show = ref(false);

onMounted(() => {
  show.value = true;
  if (props.duration > 0) {
    setTimeout(() => {
      close();
    }, props.duration);
  }
});

const close = () => {
  show.value = false;
  setTimeout(() => {
    emit('close');
  }, 300);
};

const getIcon = () => {
  switch (props.type) {
    case 'success':
      return CheckCircleIcon;
    case 'error':
      return ExclamationCircleIcon;
    case 'info':
      return InformationCircleIcon;
    case 'warning':
      return ExclamationCircleIcon;
    default:
      return CheckCircleIcon;
  }
};

const getClasses = () => {
  switch (props.type) {
    case 'success':
      return 'bg-green-50 text-green-800 border-green-200';
    case 'error':
      return 'bg-red-50 text-red-800 border-red-200';
    case 'info':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'warning':
      return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    default:
      return 'bg-green-50 text-green-800 border-green-200';
  }
};
</script>

<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="rounded-lg border-2 p-4 shadow-lg"
      :class="getClasses()"
    >
      <div class="flex items-center">
        <component
          :is="getIcon()"
          class="h-5 w-5 mr-3"
          :class="{
            'text-green-400': type === 'success',
            'text-red-400': type === 'error',
            'text-blue-400': type === 'info',
            'text-yellow-400': type === 'warning'
          }"
        />
        <p class="text-sm font-medium flex-1">{{ message }}</p>
        <button
          @click="close"
          class="ml-4 inline-flex rounded-md hover:bg-black/5 p-1.5"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  </Transition>
</template>