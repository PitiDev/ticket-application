// // frontend/store/admin.js
// import { defineStore } from 'pinia';

// export const useAdminStore = defineStore('admin', {
//   state: () => ({
//     users: [],
//     departments: [],
//     settings: {},
//     loading: false,
//     error: null
//   }),

//   actions: {
//     // User Management
//     async fetchUsers() {
//       this.loading = true;
//       this.error = null;
//       try {
//         const config = useRuntimeConfig();
//         const response = await fetch(`${config.public.apiBase}/admin/users`, {
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`
//           }
//         });
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch users');
//         }
        
//         this.users = await response.json();
//       } catch (error) {
//         this.error = error.message;
//         console.error('Error fetching users:', error);
//       } finally {
//         this.loading = false;
//       }
//     },

//     async createUser(userData) {
//       this.loading = true;
//       this.error = null;
//       try {
//         const config = useRuntimeConfig();
//         const response = await fetch(`${config.public.apiBase}/admin/users`, {
//           method: 'POST',
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`,
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(userData)
//         });
        
//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.message || 'Failed to create user');
//         }
        
//         const newUser = await response.json();
//         this.users.push(newUser);
//         return newUser;
//       } catch (error) {
//         this.error = error.message;
//         console.error('Error creating user:', error);
//         throw error;
//       } finally {
//         this.loading = false;
//       }
//     },

//     async updateUser(userId, userData) {
//       this.loading = true;
//       this.error = null;
//       try {
//         const config = useRuntimeConfig();
//         const response = await fetch(`${config.public.apiBase}/admin/users/${userId}`, {
//           method: 'PUT',
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`,
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(userData)
//         });
        
//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.message || 'Failed to update user');
//         }
        
//         const updatedUser = await response.json();
//         const index = this.users.findIndex(u => u.id === userId);
//         if (index !== -1) {
//           this.users[index] = updatedUser;
//         }
//         return updatedUser;
//       } catch (error) {
//         this.error = error.message;
//         console.error('Error updating user:', error);
//         throw error;
//       } finally {
//         this.loading = false;
//       }
//     },

//     async deleteUser(userId) {
//       this.loading = true;
//       this.error = null;
//       try {
//         const config = useRuntimeConfig();
//         const response = await fetch(`${config.public.apiBase}/admin/users/${userId}`, {
//           method: 'DELETE',
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`
//           }
//         });
        
//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.message || 'Failed to delete user');
//         }
        
//         this.users = this.users.filter(user => user.id !== userId);
//       } catch (error) {
//         this.error = error.message;
//         console.error('Error deleting user:', error);
//         throw error;
//       } finally {
//         this.loading = false;
//       }
//     },

//     // Department Management
//     async fetchDepartments() {
//       this.loading = true;
//       this.error = null;
//       try {
//         const config = useRuntimeConfig();
//         const response = await fetch(`${config.public.apiBase}/admin/departments`, {
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`
//           }
//         });
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch departments');
//         }
        
//         this.departments = await response.json();
//       } catch (error) {
//         this.error = error.message;
//         console.error('Error fetching departments:', error);
//       } finally {
//         this.loading = false;
//       }
//     },

//     async createDepartment(departmentData) {
//       this.loading = true;
//       this.error = null;
//       try {
//         const config = useRuntimeConfig();
//         const response = await fetch(`${config.public.apiBase}/admin/departments`, {
//           method: 'POST',
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`,
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(departmentData)
//         });
        
//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.message || 'Failed to create department');
//         }
        
//         const newDepartment = await response.json();
//         this.departments.push(newDepartment);
//         return newDepartment;
//       } catch (error) {
//         this.error = error.message;
//         console.error('Error creating department:', error);
//         throw error;
//       } finally {
//         this.loading = false;
//       }
//     },

//     async updateDepartment(departmentId, departmentData) {
//       this.loading = true;
//       this.error = null;
//       try {
//         const config = useRuntimeConfig();
//         const response = await fetch(`${config.public.apiBase}/admin/departments/${departmentId}`, {
//           method: 'PUT',
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`,
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(departmentData)
//         });
        
//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.message || 'Failed to update department');
//         }
        
//         const updatedDepartment = await response.json();
//         const index = this.departments.findIndex(d => d.id === departmentId);
//         if (index !== -1) {
//           this.departments[index] = updatedDepartment;
//         }
//         return updatedDepartment;
//       } catch (error) {
//         this.error = error.message;
//         console.error('Error updating department:', error);
//         throw error;
//       } finally {
//         this.loading = false;
//       }
//     },

//     async deleteDepartment(departmentId) {
//       this.loading = true;
//       this.error = null;
//       try {
//         const config = useRuntimeConfig();
//         const response = await fetch(`${config.public.apiBase}/admin/departments/${departmentId}`, {
//           method: 'DELETE',
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`
//           }
//         });
        
//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.message || 'Failed to delete department');
//         }
        
//         this.departments = this.departments.filter(department => department.id !== departmentId);
//       } catch (error) {
//         this.error = error.message;
//         console.error('Error deleting department:', error);
//         throw error;
//       } finally {
//         this.loading = false;
//       }
//     },

//     // Settings Management
//     async fetchSettings() {
//       this.loading = true;
//       this.error = null;
//       try {
//         const config = useRuntimeConfig();
//         const response = await fetch(`${config.public.apiBase}/admin/settings`, {
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`
//           }
//         });
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch settings');
//         }
        
//         this.settings = await response.json();
//       } catch (error) {
//         this.error = error.message;
//         console.error('Error fetching settings:', error);
//       } finally {
//         this.loading = false;
//       }
//     },

//     async updateSettings(settingsData) {
//       this.loading = true;
//       this.error = null;
//       try {
//         const config = useRuntimeConfig();
//         const response = await fetch(`${config.public.apiBase}/admin/settings`, {
//           method: 'PUT',
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`,
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(settingsData)
//         });
        
//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.message || 'Failed to update settings');
//         }
        
//         this.settings = { ...this.settings, ...settingsData };
//       } catch (error) {
//         this.error = error.message;
//         console.error('Error updating settings:', error);
//         throw error;
//       } finally {
//         this.loading = false;
//       }
//     }
//   }
// });