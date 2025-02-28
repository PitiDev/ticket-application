<script setup>
import { ref, onMounted } from 'vue'
import {
  UsersIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  KeyIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'

const config = useRuntimeConfig()
const auth = useAuth()
const toast = useToast()

// State management
const activeTab = ref('users')
const loading = ref(false)
const searchQuery = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedItem = ref(null)

// Data states
const users = ref([])
const departments = ref([])
const roles = ref([])

// Form states
const newUserForm = ref({
  username: '',
  email: '',
  role: '',
  department: '',
  isActive: true
})

// Fetch users
const fetchUsers = async () => {
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
    toast.error('Failed to load users')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Fetch departments
const fetchDepartments = async () => {
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
    toast.error('Failed to load departments')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Handle user actions
const handleAddUser = async () => {
  try {
    const response = await fetch(`${config.public.apiBase}/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUserForm.value)
    })
    if (!response.ok) throw new Error('Failed to add user')
    toast.success('User added successfully')
    showAddModal.value = false
    await fetchUsers()
  } catch (error) {
    toast.error('Failed to add user')
    console.error(error)
  }
}

// Initialize
onMounted(() => {
  fetchUsers()
  fetchDepartments()
})

// Computed properties
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.department?.toLowerCase().includes(query)
  )
})
</script>

<template>
  <div class="min-h-screen bg-gray-50/50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col gap-2">
          <h1 class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
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
      <div class="flex border-b border-gray-200 mb-8">
        <button
          v-for="tab in [
            { id: 'users', label: 'Users', icon: UsersIcon },
            { id: 'departments', label: 'Departments', icon: BuildingOfficeIcon },
            { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheckIcon },
            { id: 'settings', label: 'Settings', icon: Cog6ToothIcon }
          ]"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 -mb-px',
            activeTab === tab.id
              ? 'text-indigo-600 border-indigo-600'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <component :is="tab.icon" class="h-5 w-5" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="space-y-6">
        <!-- Actions Bar -->
        <div class="flex items-center justify-between gap-4">
          <div class="relative flex-1 max-w-md">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Search users..."
            />
          </div>
          <button
            @click="showAddModal = true"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-sm transition-all duration-200"
          >
            <UserPlusIcon class="h-5 w-5" />
            Add User
          </button>
        </div>

        <!-- Users List -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr class="bg-gray-50">
                  <th v-for="header in ['User', 'Role', 'Department', 'Status', 'Actions']"
                      :key="header"
                      class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="user in filteredUsers"
                    :key="user.id"
                    class="hover:bg-gray-50/50 transition-colors"
                >
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-medium">
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
                      <ShieldCheckIcon class="h-4 w-4 text-gray-400" />
                      <span class="text-sm text-gray-900">{{ user.role }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <BuildingOfficeIcon class="h-4 w-4 text-gray-400" />
                      <span class="text-sm text-gray-900">{{ user.department }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="user.isActive ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' : 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20'"
                    >
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <button
                        @click="selectedItem = user; showEditModal = true"
                        class="text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Edit user"
                      >
                        <PencilSquareIcon class="h-5 w-5" />
                      </button>
                      <button
                        @click="confirmDelete(user)"
                        class="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete user"
                      >
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
        <!-- Similar structure to Users tab, but for departments -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p class="text-gray-500">Departments management interface will be implemented here</p>
        </div>
      </div>

      <!-- Roles Tab -->
      <div v-else-if="activeTab === 'roles'" class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p class="text-gray-500">Roles and permissions management interface will be implemented here</p>
        </div>
      </div>

      <!-- Settings Tab -->
      <div v-else-if="activeTab === 'settings'" class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p class="text-gray-500">System settings interface will be implemented here</p>
        </div>
      </div>
    </div>

    <!-- Add User Modal -->
    <TransitionRoot appear :show="showAddModal" as="template">
      <Dialog as="div" @close="showAddModal = false" class="relative z-50">
        <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
            <DialogTitle class="text-lg font-medium text-gray-900 mb-4">
              Add New User
            </DialogTitle>

            <form @submit.prevent="handleAddUser" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Username</label>
                <input
                  v-model="newUserForm.username"
                  type="text"
                  class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  v-model="newUserForm.email"
                  type="email"
                  class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Role</label>
                <select
                  v-model="newUserForm.role"
                  class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="">Select role</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Department</label>
                <select
                  v-model="newUserForm.department"
                  class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="">Select department</option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
                </select>
              </div>

              <div class="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  @click="showAddModal = false"
                  class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Add User
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>