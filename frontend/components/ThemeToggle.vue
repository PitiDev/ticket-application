<template>
  <button
    @click="toggleTheme"
    class="relative p-2 rounded-full transition-all duration-300 hover:scale-110"
    :class="[
      themeStore.isDark
        ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
        : 'bg-amber-100 text-amber-600 hover:bg-amber-200',
    ]"
    :title="themeStore.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
  >
    <!-- Sun Icon (Light Mode) -->
    <transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 rotate-180 scale-0"
      enter-to-class="opacity-100 rotate-0 scale-100"
      leave-active-class="transition-all duration-300"
      leave-from-class="opacity-100 rotate-0 scale-100"
      leave-to-class="opacity-0 -rotate-180 scale-0"
    >
      <SunIcon v-if="!themeStore.isDark" class="h-6 w-6" />
    </transition>

    <!-- Moon Icon (Dark Mode) -->
    <transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 -rotate-180 scale-0"
      enter-to-class="opacity-100 rotate-0 scale-100"
      leave-active-class="transition-all duration-300"
      leave-from-class="opacity-100 rotate-0 scale-100"
      leave-to-class="opacity-0 rotate-180 scale-0"
    >
      <MoonIcon v-if="themeStore.isDark" class="h-6 w-6 absolute inset-0 m-auto" />
    </transition>
  </button>
</template>

<script setup>
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline';
import { useThemeStore } from '~/stores/theme';

const themeStore = useThemeStore();

const toggleTheme = () => {
  themeStore.toggleTheme();
};
</script>

<style scoped>
button {
  position: relative;
  overflow: hidden;
}
</style>
