import { useThemeStore } from '~/stores/theme';

export default defineNuxtPlugin(() => {
  const themeStore = useThemeStore();

  // Initialize theme on app load
  if (process.client) {
    themeStore.initializeTheme();
  }
});
