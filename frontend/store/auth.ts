// store/auth.ts
import { defineStore } from 'pinia';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'agent' | 'user';
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user && (state.user.role === 'admin' || state.user.role === 'super_admin'),
    isSuperAdmin: (state) => state.user && state.user.role === 'super_admin'
  },

  actions: {
    setToken(token: string): void {
      this.token = token;
      if (process.client) {
        localStorage.setItem('token', token);
      }
    },

    setUser(user: User): void {
      this.user = user;
    },

    getToken(): string | null {
      if (!this.token && process.client) {
        this.token = localStorage.getItem('token');
      }
      return this.token;
    },

    async login(credentials: { email: string; password: string }): Promise<{ token: string; user: User }> {
      this.loading = true;
      this.error = null;
      try {
        // ใช้ URL ตามที่ผู้ใช้กำหนด
        const response = await fetch('http://localhost:9000/api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }
        
        const data = await response.json();
        // เก็บ token และข้อมูล user จากการตอบกลับ
        this.setToken(data.token);
        this.setUser(data.user);
        return data;
      } catch (error) {
        const err = error as Error;
        this.error = err.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchProfile(): Promise<User> {
      this.loading = true;
      this.error = null;
      try {
        const token = this.getToken();
        
        if (!token) {
          throw new Error('No token found');
        }
        
        const response = await fetch('http://localhost:9000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            this.logout();
          }
          throw new Error('Failed to fetch profile');
        }
        
        const user = await response.json();
        this.setUser(user);
        return user;
      } catch (error) {
        const err = error as Error;
        this.error = err.message;
        if (err.message === 'No token found') {
          this.logout();
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout(): void {
      this.token = null;
      this.user = null;
      if (process.client) {
        localStorage.removeItem('token');
      }
    }
  }
});