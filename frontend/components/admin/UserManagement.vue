<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAdminStore } from '~/store/admin';
import {
  UsersIcon,
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline';

const adminStore = useAdminStore();
const searchQuery = ref('');
const showAddModal = ref(false);
const showEditModal = ref(false);
const selectedUser = ref(null);
const showConfirmDelete = ref(false);

const toast = useToast();

// Form states
const userForm = ref({
  username: '',
  email: '',
  password: '',
  full_name: '',
  role: 'user',
  is_active: true,
  departments: []
});

// Fetch users
const fetchUsers = async () => {
  try {
    await adminStore.fetchUsers();
  } catch (error) {
    toast.error('Failed to load users');
  }
};

// Fetch departments
const fetchDepartments = async () => {
  try {
    await adminStore.fetchDepartments();
  } catch (error) {
    toast.error('Failed to load departments');
  }
};

// Initialize
onMounted(() => {
  fetchUsers();
  fetchDepartments();
});

// Computed properties
const filteredUsers = computed(() => {
  if (!searchQuery.value) return adminStore.users;
  
  const query = searchQuery.value.toLowerCase();
  return adminStore.users.filter(user => 
    user.username.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    (user.full_name && user.full_name.toLowerCase().includes(query))
  );
});

// Handle adding a new user
const handleAddUser = async () => {
  try {
    await adminStore.createUser(userForm.value);
    toast.success('User added successfully');
    showAddModal.value = false;
    resetForm();
  } catch (error) {
    toast.error(`Failed to add user: ${error.message}`);
  }
};

// Handle editing a user
const handleEditUser = async () => {
  try {
    await adminStore.updateUser(selectedUser.value.id, userForm.value);
    toast.success('User updated successfully');
    showEditModal.value = false;
    selectedUser.value = null;
  } catch (error) {
    toast.error(`Failed to update user: ${error.message}`);
  }
};

// Handle deleting a user
const handleDeleteUser = async () => {
  try {
    await adminStore.deleteUser(selectedUser.value.id);
    toast.success('User deleted successfully');
    showConfirmDelete.value = false;
    selectedUser.value = null;
  } catch (error) {
    toast.error(`Failed to delete user: ${error.message}`);
  }
};

// Reset form
const resetForm = () => {
  userForm.value = {
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'user',
    is_active: true,
    departments: []
  };
};

// Edit user
const editUser = (user) => {
  selectedUser.value = user;
  userForm.value = {
    username: user.username,
    email: user.email,
    password: '', // Don't set password for edits
    full_name: user.full_name || '',
    role: user.role,
    is_active: user.is_active,
    departments: user.departments?.map(d => d.id) || []
  };
  showEditModal.value = true;
};

// Confirm delete user
const confirmDelete = (user) => {
  selectedUser.value = user;
  showConfirmDelete.value = true;
};
</script>

<template>
  <div class="space-y-6">
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
        @click="showAddModal = true; resetForm()"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-sm transition-all duration-200"
      >
        <UserPlusIcon class="h-5 w-5" />
        Add User
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="adminStore.loading" class="flex justify-center py-10">
      <div class="flex flex-col items-center">
        <ArrowPathIcon class="w-10 h-10 animate-spin text-indigo-600" />
        <p class="mt-2 text-gray-600">Loading users...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="adminStore.error" class="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
      {{ adminStore.error }}
    </div>

    <!-- Users List -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div v-if="filteredUsers.length === 0" class="p-8 text-center text-gray-500">
        <UsersIcon class="h-12 w-12 mx-auto text-gray-400" />
        <p class="mt-2">No users found</p>
      </div>
      <div v-else class="overflow-x-auto">
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
                  <span class="text-sm text-gray-900">
                    {{ user.departments?.map(d => d.name).join(', ') || 'None' }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="user.is_active ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' : 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20'"
                >
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <button
                    @click="editUser(user)"
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
                  v-model="userForm.username"
                  type="text"
                  class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  v-model="userForm.email"
                  type="email"
                  class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Password</label>
                <input
                  v-model="userForm.password"
                  type="password"
                  class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  v-model="userForm.full_name"
                  type="text"
                  class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Role</label>
                <select
                  v-model="userForm.role"
                  class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="user">User</option>
                  <option value="agent">Agent</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Departments</label>
                <select
                  v-model="userForm.departments"
                  multiple
                  class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option v-for="department in adminStore.departments" :key="department.id" :value="department.id">
                    {{ department.name }}
                  </option>
                </select>
                <p class="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div class="flex items-center">
                <input
                  v-model="userForm.is_active"
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label class="ml-2 text-sm text-gray-700">Active</label>
              </div>

              <div class="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  @click="showAddModal = false"
                  class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Add User
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Edit User Modal -->
    <TransitionRoot appear :show="showEditModal" as="template">
      <Dialog as="div" @close="showEditModal = false" class="relative z-50">
        <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
            <DialogTitle class="text-lg font-medium text-gray-900 mb-4">
              Edit User
            </DialogTitle>

            <form @submit.prevent="handleEditUser" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Username</label>
                <input
                  v-model="userForm.username"
                  type="text"
                  class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  v-model="userForm.email"
                  type="email"
                  class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Password</label>
                <input
                  v-model="userForm.password"
                  type="password"
                  class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  v-model="userForm.full_name"
                  type="text"
                  class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Role</label>
                <select
                  v-model="userForm.role"
                  class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="user">User</option>
                  <option value="agent">Agent</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Departments</label>
                <select
                  v-model="userForm.departments"
                  multiple
                  class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option v-for="department in adminStore.departments" :key="department.id" :value="department.id">
                    {{ department.name }}
                  </option>
                </select>
                <p class="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div class="flex items-center">
                <input
                  v-model="userForm.is_active"
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label class="ml-2 text-sm text-gray-700">Active</label>
              </div>

              <div class="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  @click="showEditModal = false"
                  class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Update User
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Delete Confirmation Modal -->
    <TransitionRoot appear :show="showConfirmDelete" as="template">
      <Dialog as="div" @close="showConfirmDelete = false" class="relative z-50">
        <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel class="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
            <DialogTitle class="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </DialogTitle>

            <p class="text-gray-600">
              Are you sure you want to delete user <span class="font-semibold">{{ selectedUser?.username }}</span>?
              This action cannot be undone.
            </p>

            <div class="mt-6 flex justify-end gap-3">
              <button
                @click="showConfirmDelete = false"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                @click="handleDeleteUser"
                class="px-4 py-2 bg-red-600 rounded-md text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>