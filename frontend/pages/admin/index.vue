<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  UsersIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot
} from '@headlessui/vue'

const config = useRuntimeConfig()
const auth = useAuth()
const toast = useToast()

// Define types
interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role: 'super_admin' | 'admin' | 'manager' | 'agent' | 'user';
  is_active: boolean;
  department_ids?: number[];
  departments?: Department[];
  created_at?: string;
  updated_at?: string;
}

interface Department {
  id: number;
  name: string;
  description?: string;
  user_count?: number;
  created_at?: string;
  updated_at?: string;
}

interface SystemSetting {
  id?: number;
  setting_key: string;
  setting_value: string;
  description?: string;
}

// State management
const activeTab = ref<'users' | 'departments' | 'roles' | 'settings'>('users')
const loading = ref<boolean>(false)
const searchQuery = ref<string>('')
const showAddUserModal = ref<boolean>(false)
const showEditUserModal = ref<boolean>(false)
const showDeleteUserModal = ref<boolean>(false)
const showAddDeptModal = ref<boolean>(false)
const showEditDeptModal = ref<boolean>(false)
const showDeleteDeptModal = ref<boolean>(false)
const selectedUser = ref<User | null>(null)
const selectedDepartment = ref<Department | null>(null)

// Data states
const users = ref<User[]>([])
const departments = ref<Department[]>([])
const systemSettings = ref<Record<string, string>>({})

// Form states
const userForm = ref<{
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: string;
  is_active: boolean;
  department_ids: number[];
}>({
  username: '',
  email: '',
  password: '',
  full_name: '',
  role: 'user',
  is_active: true,
  department_ids: []
})

const departmentForm = ref<{
  name: string;
  description: string;
}>({
  name: '',
  description: ''
})

const settingsForm = ref<Record<string, string>>({
  site_name: '',
  logo_url: '',
  allow_registration: 'true',
  default_role: 'user',
  ticket_prefix: 'TKT-'
})

// Fetch users
const fetchUsers = async (): Promise<void> => {
  try {
    loading.value = true
    const response = await fetch(`${config.public.apiBase}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`
      }
    })

    if (!response.ok) throw new Error('Failed to fetch users')

    const data = await response.json()
    users.value = data
  } catch (error) {
    const err = error as Error
    toast.error(`Failed to load users: ${err.message}`)
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Fetch departments
const fetchDepartments = async (): Promise<void> => {
  try {
    loading.value = true
    const response = await fetch(`${config.public.apiBase}/admin/departments`, {
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`
      }
    })

    if (!response.ok) throw new Error('Failed to fetch departments')

    const data = await response.json()
    departments.value = data
  } catch (error) {
    const err = error as Error
    toast.error(`Failed to load departments: ${err.message}`)
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Fetch settings
const fetchSettings = async (): Promise<void> => {
  try {
    loading.value = true
    const response = await fetch(`${config.public.apiBase}/settings`, {
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`
      }
    })

    if (!response.ok) throw new Error('Failed to fetch settings')

    const data = await response.json()
    systemSettings.value = data

    // Populate settings form
    Object.keys(data).forEach(key => {
      if (settingsForm.value.hasOwnProperty(key)) {
        settingsForm.value[key] = data[key]
      }
    })
  } catch (error) {
    const err = error as Error
    toast.error(`Failed to load settings: ${err.message}`)
    console.error(error)
  } finally {
    loading.value = false
  }
}

// CRUD operations for users
const handleAddUser = async (): Promise<void> => {
  try {
    loading.value = true;

    // ตรวจสอบข้อมูลที่ส่งไป
    console.log('Sending user data:', userForm.value);

    const response = await fetch(`http://localhost:9000/api/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: userForm.value.username,
        email: userForm.value.email,
        password: userForm.value.password,
        full_name: userForm.value.full_name,
        role: userForm.value.role,
        is_active: userForm.value.is_active,
        department_ids: userForm.value.department_ids // ตรวจสอบว่ามีการส่งค่านี้
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add user');
    }

    toast.success('User added successfully');
    showAddUserModal.value = false;
    resetUserForm();
    await fetchUsers();
  } catch (error) {
    const err = error as Error;
    toast.error(`Failed to add user: ${err.message}`);
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleEditUser = async (): Promise<void> => {
  if (!selectedUser.value) return;

  try {
    loading.value = true;

    // ตรวจสอบข้อมูลที่ส่งไป
    console.log('Sending updated user data:', userForm.value);

    const response = await fetch(`http://localhost:9000/api/admin/users/${selectedUser.value.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: userForm.value.username,
        email: userForm.value.email,
        password: userForm.value.password || undefined, // ไม่ส่งถ้าไม่มีค่า
        full_name: userForm.value.full_name,
        role: userForm.value.role,
        is_active: userForm.value.is_active,
        department_ids: userForm.value.department_ids // ตรวจสอบว่ามีการส่งค่านี้
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user');
    }

    toast.success('User updated successfully');
    showEditUserModal.value = false;
    await fetchUsers();
  } catch (error) {
    const err = error as Error;
    toast.error(`Failed to update user: ${err.message}`);
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleDeleteUser = async (): Promise<void> => {
  if (!selectedUser.value) return

  try {
    loading.value = true
    const response = await fetch(`${config.public.apiBase}/admin/users/${selectedUser.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to delete user')
    }

    toast.success('User deleted successfully')
    showDeleteUserModal.value = false
    await fetchUsers()
  } catch (error) {
    const err = error as Error
    toast.error(`Failed to delete user: ${err.message}`)
    console.error(error)
  } finally {
    loading.value = false
  }
}

// CRUD operations for departments
const handleAddDepartment = async (): Promise<void> => {
  try {
    loading.value = true
    const response = await fetch(`${config.public.apiBase}/admin/departments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(departmentForm.value)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to add department')
    }

    toast.success('Department added successfully')
    showAddDeptModal.value = false
    resetDepartmentForm()
    await fetchDepartments()
  } catch (error) {
    const err = error as Error
    toast.error(`Failed to add department: ${err.message}`)
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleEditDepartment = async (): Promise<void> => {
  if (!selectedDepartment.value) return

  try {
    loading.value = true
    const response = await fetch(`${config.public.apiBase}/admin/departments/${selectedDepartment.value.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(departmentForm.value)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to update department')
    }

    toast.success('Department updated successfully')
    showEditDeptModal.value = false
    await fetchDepartments()
  } catch (error) {
    const err = error as Error
    toast.error(`Failed to update department: ${err.message}`)
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleDeleteDepartment = async (): Promise<void> => {
  if (!selectedDepartment.value) return

  try {
    loading.value = true
    const response = await fetch(`${config.public.apiBase}/admin/departments/${selectedDepartment.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to delete department')
    }

    toast.success('Department deleted successfully')
    showDeleteDeptModal.value = false
    await fetchDepartments()
  } catch (error) {
    const err = error as Error
    toast.error(`Failed to delete department: ${err.message}`)
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Update system settings
const handleUpdateSettings = async (): Promise<void> => {
  try {
    loading.value = true
    const response = await fetch(`${config.public.apiBase}/admin/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settingsForm.value)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to update settings')
    }

    toast.success('Settings updated successfully')
    await fetchSettings()
  } catch (error) {
    const err = error as Error
    toast.error(`Failed to update settings: ${err.message}`)
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Helper functions
const resetUserForm = (): void => {
  userForm.value = {
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'user',
    is_active: true,
    department_ids: []
  }
}

const resetDepartmentForm = (): void => {
  departmentForm.value = {
    name: '',
    description: ''
  }
}

const editUser = (user: User): void => {
  selectedUser.value = user
  userForm.value = {
    username: user.username,
    email: user.email,
    password: '', // Don't set password for edits
    full_name: user.full_name || '',
    role: user.role,
    is_active: user.is_active,
    department_ids: user.department_ids || []
  }
  showEditUserModal.value = true
}

const confirmDeleteUser = (user: User): void => {
  selectedUser.value = user
  showDeleteUserModal.value = true
}

const editDepartment = (department: Department): void => {
  selectedDepartment.value = department
  departmentForm.value = {
    name: department.name,
    description: department.description || ''
  }
  showEditDeptModal.value = true
}

const confirmDeleteDepartment = (department: Department): void => {
  selectedDepartment.value = department
  showDeleteDeptModal.value = true
}

// Computed properties
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user =>
    user.username.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    (user.full_name && user.full_name.toLowerCase().includes(query))
  )
})

const filteredDepartments = computed(() => {
  if (!searchQuery.value) return departments.value
  const query = searchQuery.value.toLowerCase()
  return departments.value.filter(dept =>
    dept.name.toLowerCase().includes(query) ||
    (dept.description && dept.description.toLowerCase().includes(query))
  )
})

// Initialize
onMounted(() => {
  // Check admin permissions
  // if (!auth.isAdmin() && !auth.isSuperAdmin()) {
  //   navigateTo('/dashboard')
  //   return
  // }

  fetchUsers()
  fetchDepartments()
  fetchSettings()
})
</script>

<template>
  <div class="min-h-screen to-red-50">
    <!-- Header -->
    <div class="bg-white border-b border-amber-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col gap-2">
          <h1 class="text-3xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
            Admin Area
          </h1>
          <p class="text-gray-600">
            Manage users, departments, and system settings
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Navigation Tabs -->
      <div class="flex border-b border-amber-200 mb-8 bg-white rounded-t-xl shadow-sm">
        <button v-for="tab in [
          { id: 'users', label: 'Users', icon: UsersIcon },
          { id: 'departments', label: 'Departments', icon: BuildingOfficeIcon },
          { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheckIcon },
          { id: 'settings', label: 'Settings', icon: Cog6ToothIcon }
        ]" :key="tab.id" @click="activeTab = tab.id as 'users' | 'departments' | 'roles' | 'settings'" :class="[
          'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 -mb-px transition-all',
          activeTab === tab.id
            ? 'text-amber-700 border-amber-600 bg-amber-50'
            : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-amber-300 hover:bg-amber-25'
        ]">
          <component :is="tab.icon" class="h-5 w-5" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Loading State for All Tabs -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="flex flex-col items-center gap-3">
          <ArrowPathIcon class="h-12 w-12 animate-spin text-amber-600" />
          <p class="text-gray-600">Loading data...</p>
        </div>
      </div>

      <!-- Users Tab -->
      <div v-else-if="activeTab === 'users'" class="space-y-6">
        <!-- Actions Bar -->
        <div class="flex items-center justify-between gap-4">
          <div class="relative flex-1 max-w-md">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon class="h-5 w-5 text-amber-400" />
            </div>
            <input v-model="searchQuery" type="text"
              class="block w-full pl-10 pr-3 py-2 border border-amber-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="Search users..." />
          </div>
          <button @click="showAddUserModal = true; resetUserForm()"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 shadow-sm transition-all duration-200 transform hover:scale-105">
            <UserPlusIcon class="h-5 w-5" />
            Add User
          </button>
        </div>

        <!-- Users List -->
        <div class="bg-white rounded-xl shadow-lg border border-amber-100">
          <div v-if="filteredUsers.length === 0" class="p-8 text-center text-gray-500">
            <div class="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-amber-100 to-red-100 flex items-center justify-center mb-4">
              <UsersIcon class="h-8 w-8 text-amber-600" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p class="text-gray-500">Get started by adding your first user.</p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-amber-100">
              <thead>
                <tr class="bg-gradient-to-r from-amber-50 to-red-50">
                  <th v-for="header in ['User', 'Role', 'Department', 'Status', 'Actions']" :key="header"
                    class="px-6 py-4 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-amber-50">
                <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-red-50/50 transition-all">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div
                        class="h-10 w-10 rounded-full bg-gradient-to-br from-amber-600 to-red-600 flex items-center justify-center text-white font-medium shadow-sm">
                        {{ user.username.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <div class="font-medium text-gray-900">{{ user.username }}</div>
                        <div class="text-sm text-gray-500">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <ShieldCheckIcon class="h-4 w-4 text-amber-500" />
                      <span class="text-sm text-gray-900 font-medium">{{ user.role }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <BuildingOfficeIcon class="h-4 w-4 text-amber-500" />
                      <span class="text-sm text-gray-900 font-medium">
                        {{user.departments?.map(d => d.name).join(', ') || 'None'}}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="user.is_active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' : 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20'">
                      {{ user.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <button @click="editUser(user)" class="text-gray-400 hover:text-amber-600 transition-colors"
                        title="Edit user">
                        <PencilSquareIcon class="h-5 w-5" />
                      </button>
                      <button @click="confirmDeleteUser(user)"
                        class="text-gray-400 hover:text-red-600 transition-colors" title="Delete user">
                        <TrashIcon class="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Departments Tab -->
      <div v-else-if="activeTab === 'departments'" class="space-y-6">
        <!-- Actions Bar -->
        <div class="flex items-center justify-between gap-4">
          <div class="relative flex-1 max-w-md">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon class="h-5 w-5 text-amber-400" />
            </div>
            <input v-model="searchQuery" type="text"
              class="block w-full pl-10 pr-3 py-2 border border-amber-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="Search departments..." />
          </div>
          <button @click="showAddDeptModal = true; resetDepartmentForm()"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 shadow-sm transition-all duration-200 transform hover:scale-105">
            <PlusIcon class="h-5 w-5" />
            Add Department
          </button>
        </div>

        <!-- Departments List -->
        <div class="bg-white rounded-xl shadow-lg border border-amber-100">
          <div v-if="filteredDepartments.length === 0" class="p-8 text-center text-gray-500">
            <div class="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-amber-100 to-red-100 flex items-center justify-center mb-4">
              <BuildingOfficeIcon class="h-8 w-8 text-amber-600" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
            <p class="text-gray-500">Create departments to organize your team.</p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-amber-100">
              <thead>
                <tr class="bg-gradient-to-r from-amber-50 to-red-50">
                  <th v-for="header in ['Department', 'Description', 'Users', 'Actions']" :key="header"
                    class="px-6 py-4 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-amber-50">
                <tr v-for="dept in filteredDepartments" :key="dept.id" class="hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-red-50/50 transition-all">
                  <td class="px-6 py-4">
                    <div class="font-medium text-gray-900">{{ dept.name }}</div>
                  </td>
                  <td class="px-6 py-4 text-gray-500">
                    {{ dept.description || 'No description' }}
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <UsersIcon class="h-4 w-4 text-amber-500" />
                      <span class="text-sm text-gray-900 font-medium">{{ dept.user_count || 0 }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <button @click="editDepartment(dept)"
                        class="text-gray-400 hover:text-amber-600 transition-colors" title="Edit department">
                        <PencilSquareIcon class="h-5 w-5" />
                      </button>
                      <button @click="confirmDeleteDepartment(dept)"
                        class="text-gray-400 hover:text-red-600 transition-colors" title="Delete department">
                        <TrashIcon class="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Roles Tab -->
      <div v-else-if="activeTab === 'roles'" class="space-y-6">
        <div class="bg-white rounded-xl shadow-lg border border-amber-100 p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Role Permissions</h2>

          <div class="space-y-6">
            <div v-for="role in ['super_admin', 'admin', 'manager', 'agent', 'user']" :key="role"
              class="border border-amber-100 rounded-lg p-4 bg-gradient-to-r from-amber-50/25 to-red-50/25">
              <h3 class="text-md font-medium text-gray-800 mb-3 capitalize">{{ role.replace('_', ' ') }}</h3>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="(perm, idx) in [
                  { name: 'View tickets', enabled: true },
                  { name: 'Create tickets', enabled: true },
                  { name: 'Edit tickets', enabled: role !== 'user' },
                  { name: 'Delete tickets', enabled: ['super_admin', 'admin'].includes(role) },
                  { name: 'Manage users', enabled: ['super_admin', 'admin'].includes(role) },
                  { name: 'Manage departments', enabled: ['super_admin', 'admin'].includes(role) },
                  { name: 'System settings', enabled: role === 'super_admin' },
                ]" :key="idx" class="flex items-center justify-between p-3 bg-white border border-amber-100 rounded-md shadow-sm">
                  <span class="text-sm text-gray-700">{{ perm.name }}</span>
                  <span :class="perm.enabled ? 'text-emerald-600' : 'text-gray-400'">
                    <component :is="perm.enabled ? CheckCircleIcon : XCircleIcon" class="h-5 w-5" />
                  </span>
                </div>
              </div>
            </div>

            <!-- Note: This is just a placeholder. In a real app, you would have a dynamic permission system -->
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p class="text-sm text-amber-800">
                <strong>Note:</strong> This is a simplified view of role permissions. Only Super Admin can modify system-wide permissions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Tab -->
      <div v-else-if="activeTab === 'settings'" class="space-y-6">
        <div class="bg-white rounded-xl shadow-lg border border-amber-100 p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">System Settings</h2>

          <form @submit.prevent="handleUpdateSettings" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Site Name</label>
              <input v-model="settingsForm.site_name" type="text"
                class="mt-1 block w-full rounded-lg border border-amber-200 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Logo URL</label>
              <input v-model="settingsForm.logo_url" type="text"
                class="mt-1 block w-full rounded-lg border border-amber-200 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Default Role for New Users</label>
              <select v-model="settingsForm.default_role"
                class="mt-1 block w-full rounded-lg border border-amber-200 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all">
                <option value="user">User</option>
                <option value="agent">Agent</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Ticket Number Prefix</label>
              <input v-model="settingsForm.ticket_prefix" type="text"
                class="mt-1 block w-full rounded-lg border border-amber-200 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
            </div>

            <div class="flex items-center">
              <input v-model="settingsForm.allow_registration" type="checkbox"
                :checked="settingsForm.allow_registration === 'true'"
                @change="settingsForm.allow_registration = settingsForm.allow_registration === 'true' ? 'false' : 'true'"
                class="h-4 w-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500" />
              <label class="ml-2 text-sm text-gray-700">Allow public registration</label>
            </div>

            <div class="pt-4">
              <button type="submit"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 shadow-sm transition-all duration-200 transform hover:scale-105">
                <Cog6ToothIcon class="h-5 w-5" />
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Add User Modal -->
    <TransitionRoot appear :show="showAddUserModal" as="template">
      <Dialog as="div" @close="showAddUserModal = false" class="relative z-50">
        <div class="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-amber-100">
            <DialogTitle class="text-lg font-medium text-gray-900 mb-4">
              Add New User
            </DialogTitle>

            <form @submit.prevent="handleAddUser" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Username</label>
                <input v-model="userForm.username" type="text"
                  class="mt-1 block w-full rounded-lg border border-amber-200 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" required />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input v-model="userForm.email" type="email"
                  class="mt-1 block w-full rounded-lg border border-amber-200 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" required />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Password</label>
                <input v-model="userForm.password" type="password"
                  class="mt-1 block w-full rounded-lg border border-amber-200 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" required />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Full Name</label>
                <input v-model="userForm.full_name" type="text"
                  class="mt-1 block w-full rounded-lg border border-amber-200 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Role</label>
                <select v-model="userForm.role" class="mt-1 block w-full rounded-lg border border-amber-200 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required>
                  <option value="user">User</option>
                  <option value="agent">Agent</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Departments</label>
                <select v-model="userForm.department_ids" multiple
                  class="mt-1 block w-full rounded-lg border border-amber-200 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all">
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div class="flex items-center">
                <input v-model="userForm.is_active" type="checkbox"
                  class="h-4 w-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500" />
                <label class="ml-2 text-sm text-gray-700">Active</label>
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <button type="button" @click="showAddUserModal = false"
                  class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  class="px-4 py-2 bg-gradient-to-r from-amber-600 to-red-600 rounded-md text-sm font-medium text-white hover:from-amber-700 hover:to-red-700 transition-all">
                  Add User
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Edit User Modal -->
    <TransitionRoot appear :show="showEditUserModal" as="template">
      <Dialog as="div" @close="showEditUserModal = false" class="relative z-50">
        <div class="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-amber-100">
            <DialogTitle class="text-lg font-medium text-gray-900 mb-4">
              Edit User
            </DialogTitle>

            <form @submit.prevent="handleEditUser" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Username</label>
                <input v-model="userForm.username" type="text"
                  class="mt-1 block w-full rounded-lg border border-amber-200 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" required />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input v-model="userForm.email" type="email"
                  class="mt-1 block w-full rounded-lg border border-amber-200 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" required />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Password</label>
                <input v-model="userForm.password" type="password"
                  class="mt-1 block w-full rounded-lg border border-amber-200 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="Leave blank to keep current password" />
                <p class="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Full Name</label>
                <input v-model="userForm.full_name" type="text"
                  class="mt-1 block w-full rounded-lg border border-amber-200 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Role</label>
                <select v-model="userForm.role" class="mt-1 block w-full rounded-lg border border-amber-200 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required>
                  <option value="user">User</option>
                  <option value="agent">Agent</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Departments</label>
                <select v-model="userForm.department_ids" multiple
                  class="mt-1 block w-full rounded-lg border border-amber-200 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all">
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div class="flex items-center">
                <input v-model="userForm.is_active" type="checkbox"
                  class="h-4 w-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500" />
                <label class="ml-2 text-sm text-gray-700">Active</label>
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <button type="button" @click="showEditUserModal = false"
                  class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  class="px-4 py-2 bg-gradient-to-r from-amber-600 to-red-600 rounded-md text-sm font-medium text-white hover:from-amber-700 hover:to-red-700 transition-all">
                  Update User
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Delete User Confirmation -->
    <TransitionRoot appear :show="showDeleteUserModal" as="template">
      <Dialog as="div" @close="showDeleteUserModal = false" class="relative z-50">
        <div class="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-red-200">
            <DialogTitle class="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </DialogTitle>

            <p class="text-gray-600 mb-4">
              Are you sure you want to delete user <span class="font-semibold text-red-600">{{ selectedUser?.username }}</span>? This
              action cannot be undone.
            </p>

            <div class="flex justify-end gap-3">
              <button @click="showDeleteUserModal = false"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button @click="handleDeleteUser"
                class="px-4 py-2 bg-red-600 rounded-md text-sm font-medium text-white hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Department Modals (Add, Edit, Delete) -->
    <!-- Add Department Modal -->
    <TransitionRoot appear :show="showAddDeptModal" as="template">
      <Dialog as="div" @close="showAddDeptModal = false" class="relative z-50">
        <div class="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-amber-100">
            <DialogTitle class="text-lg font-medium text-gray-900 mb-4">
              Add New Department
            </DialogTitle>

            <form @submit.prevent="handleAddDepartment" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Department Name</label>
                <input v-model="departmentForm.name" type="text"
                  class="mt-1 block w-full rounded-lg border border-amber-200 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" required />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <textarea v-model="departmentForm.description" rows="3"
                  class="mt-1 block w-full rounded-lg border border-amber-200 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"></textarea>
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <button type="button" @click="showAddDeptModal = false"
                  class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  class="px-4 py-2 bg-gradient-to-r from-amber-600 to-red-600 rounded-md text-sm font-medium text-white hover:from-amber-700 hover:to-red-700 transition-all">
                  Add Department
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Edit Department Modal -->
    <TransitionRoot appear :show="showEditDeptModal" as="template">
      <Dialog as="div" @close="showEditDeptModal = false" class="relative z-50">
        <div class="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-amber-100">
            <DialogTitle class="text-lg font-medium text-gray-900 mb-4">
              Edit Department
            </DialogTitle>

            <form @submit.prevent="handleEditDepartment" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Department Name</label>
                <input v-model="departmentForm.name" type="text"
                  class="mt-1 block w-full rounded-lg border border-amber-200 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" required />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <textarea v-model="departmentForm.description" rows="3"
                  class="mt-1 block w-full rounded-lg border border-amber-200 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"></textarea>
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <button type="button" @click="showEditDeptModal = false"
                  class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  class="px-4 py-2 bg-gradient-to-r from-amber-600 to-red-600 rounded-md text-sm font-medium text-white hover:from-amber-700 hover:to-red-700 transition-all">
                  Update Department
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Delete Department Confirmation -->
    <TransitionRoot appear :show="showDeleteDeptModal" as="template">
      <Dialog as="div" @close="showDeleteDeptModal = false" class="relative z-50">
        <div class="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-red-200">
            <DialogTitle class="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </DialogTitle>

            <p class="text-gray-600 mb-4">
              Are you sure you want to delete department <span class="font-semibold text-red-600">{{ selectedDepartment?.name
                }}</span>? This action cannot be undone.
            </p>

            <div class="flex justify-end gap-3">
              <button @click="showDeleteDeptModal = false"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button @click="handleDeleteDepartment"
                class="px-4 py-2 bg-red-600 rounded-md text-sm font-medium text-white hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>