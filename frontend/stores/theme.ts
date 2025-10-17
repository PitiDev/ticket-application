import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false as boolean,
  }),

  getters: {
    theme: (state) => (state.isDark ? 'dark' : 'light'),
  },

  actions: {
    initializeTheme() {
      // Check localStorage first
      if (process.client) {
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme) {
          this.isDark = savedTheme === 'dark';
        } else {
          // Check system preference
          this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        this.applyTheme();
      }
    },

    toggleTheme() {
      this.isDark = !this.isDark;
      this.applyTheme();
      this.saveTheme();
    },

    setTheme(theme: 'light' | 'dark') {
      this.isDark = theme === 'dark';
      this.applyTheme();
      this.saveTheme();
    },

    applyTheme() {
      if (process.client) {
        const html = document.documentElement;

        if (this.isDark) {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }
      }
    },

    saveTheme() {
      if (process.client) {
        localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
      }
    },
  },
});
