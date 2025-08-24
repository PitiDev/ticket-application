<template>
    <div>
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-2xl font-bold text-gray-900">Your Profile</h1>
            <p class="mt-1 text-sm text-gray-500">
                Manage your account information and password
            </p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
            <div class="flex flex-col items-center">
                <svg class="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>
                <p class="mt-3 text-gray-600">Loading your profile...</p>
            </div>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Profile Information Section -->
            <div class="lg:col-span-2 space-y-6">
                <div class="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div class="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                        <h3 class="text-lg font-medium leading-6 text-gray-900">Profile Information</h3>
                        <p class="mt-1 max-w-2xl text-sm text-gray-500">Personal details and contact information</p>
                    </div>

                    <div class="px-4 py-5 sm:p-6">
                        <form @submit.prevent="updateProfile">
                            <div class="grid grid-cols-6 gap-6">
                                <!-- Profile Picture -->
                                <div class="col-span-6 sm:col-span-6">
                                    <div class="flex items-center">
                                        <div
                                            class="h-20 w-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-medium">
                                            {{ userInitials }}
                                        </div>
                                        <div class="ml-5">
                                            <button type="button"
                                                class="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                Change
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Username -->
                                <div class="col-span-6 sm:col-span-3">
                                    <label for="username"
                                        class="block text-sm font-medium text-gray-700">Username</label>
                                    <input type="text" name="username" id="username" v-model="profileForm.username"
                                        readonly
                                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-gray-50" />
                                    <p class="mt-1 text-xs text-gray-500">Username cannot be changed</p>
                                </div>

                                <!-- Email -->
                                <div class="col-span-6 sm:col-span-3">
                                    <label for="email" class="block text-sm font-medium text-gray-700">Email
                                        address</label>
                                    <input type="email" name="email" id="email" v-model="profileForm.email"
                                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                </div>

                                <!-- Full Name -->
                                <div class="col-span-6 sm:col-span-3">
                                    <label for="full_name" class="block text-sm font-medium text-gray-700">Full
                                        name</label>
                                    <input type="text" name="full_name" id="full_name" v-model="profileForm.full_name"
                                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                </div>

                                <!-- Job Title -->
                                <div class="col-span-6 sm:col-span-3">
                                    <label for="job_title" class="block text-sm font-medium text-gray-700">Job
                                        title</label>
                                    <input type="text" name="job_title" id="job_title" v-model="profileForm.job_title"
                                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                </div>

                                <!-- Department -->
                                <div class="col-span-6 sm:col-span-3">
                                    <label for="department"
                                        class="block text-sm font-medium text-gray-700">Department</label>
                                    <select id="department" name="department" v-model="profileForm.department_id"
                                        class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                        <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                                            {{ dept.name }}
                                        </option>
                                    </select>
                                </div>

                                <!-- Phone -->
                                <div class="col-span-6 sm:col-span-3">
                                    <label for="phone" class="block text-sm font-medium text-gray-700">Phone
                                        number</label>
                                    <input type="text" name="phone" id="phone" v-model="profileForm.phone"
                                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                </div>
                            </div>

                            <!-- Submit Button -->
                            <div class="mt-6 flex justify-end">
                                <button type="submit" :disabled="profileSubmitting"
                                    class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <template v-if="profileSubmitting">
                                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                            </path>
                                        </svg>
                                        Saving...
                                    </template>
                                    <template v-else>
                                        Save Changes
                                    </template>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Change Password Section -->
            <div class="space-y-6">
                <div class="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div class="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                        <h3 class="text-lg font-medium leading-6 text-gray-900">Change Password</h3>
                        <p class="mt-1 max-w-2xl text-sm text-gray-500">Update your password securely</p>
                    </div>

                    <div class="px-4 py-5 sm:p-6">
                        <form @submit.prevent="changePassword">
                            <div class="space-y-4">
                                <!-- Current Password -->
                                <div>
                                    <label for="current_password"
                                        class="block text-sm font-medium text-gray-700">Current
                                        password</label>
                                    <div class="mt-1 relative rounded-md shadow-sm">
                                        <input :type="showCurrentPassword ? 'text' : 'password'" name="current_password"
                                            id="current_password" v-model="passwordForm.current_password" required
                                            class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                                            placeholder="••••••••" />
                                        <button type="button" @click="showCurrentPassword = !showCurrentPassword"
                                            class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <EyeIcon v-if="showCurrentPassword" class="h-5 w-5 text-gray-400" />
                                            <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                                        </button>
                                    </div>
                                </div>

                                <!-- New Password -->
                                <div>
                                    <label for="new_password" class="block text-sm font-medium text-gray-700">New
                                        password</label>
                                    <div class="mt-1 relative rounded-md shadow-sm">
                                        <input :type="showNewPassword ? 'text' : 'password'" name="new_password"
                                            id="new_password" v-model="passwordForm.new_password" required
                                            class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                                            placeholder="••••••••" />
                                        <button type="button" @click="showNewPassword = !showNewPassword"
                                            class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <EyeIcon v-if="showNewPassword" class="h-5 w-5 text-gray-400" />
                                            <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                                        </button>
                                    </div>
                                    <p class="mt-1 text-xs text-gray-500">Password must be at least 8 characters</p>
                                </div>

                                <!-- Confirm New Password -->
                                <div>
                                    <label for="confirm_password"
                                        class="block text-sm font-medium text-gray-700">Confirm new
                                        password</label>
                                    <div class="mt-1 relative rounded-md shadow-sm">
                                        <input :type="showConfirmPassword ? 'text' : 'password'" name="confirm_password"
                                            id="confirm_password" v-model="passwordForm.confirm_password" required
                                            class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                                            placeholder="••••••••" />
                                        <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                                            class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <EyeIcon v-if="showConfirmPassword" class="h-5 w-5 text-gray-400" />
                                            <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                                        </button>
                                    </div>
                                </div>

                                <!-- Password Error Message -->
                                <div v-if="passwordError" class="rounded-md bg-red-50 p-4">
                                    <div class="flex">
                                        <div class="flex-shrink-0">
                                            <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
                                        </div>
                                        <div class="ml-3">
                                            <h3 class="text-sm font-medium text-red-800">{{ passwordError }}</h3>
                                        </div>
                                    </div>
                                </div>

                                <!-- Submit Button -->
                                <div class="mt-6">
                                    <button type="submit" :disabled="passwordSubmitting || !canSubmitPassword"
                                        class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <template v-if="passwordSubmitting">
                                            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    stroke-width="4"></circle>
                                                <path class="opacity-75" fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                                </path>
                                            </svg>
                                            Updating...
                                        </template>
                                        <template v-else>
                                            Change Password
                                        </template>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Account Info Card -->
                <div class="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div class="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                        <h3 class="text-lg font-medium leading-6 text-gray-900">Account Information</h3>
                    </div>

                    <div class="px-4 py-5 sm:p-6">
                        <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div class="sm:col-span-1">
                                <dt class="text-sm font-medium text-gray-500">User Role</dt>
                                <dd class="mt-1 text-sm text-gray-900">
                                    <span
                                        class="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                                        {{ userRole }}
                                    </span>
                                </dd>
                            </div>
                            <div class="sm:col-span-1">
                                <dt class="text-sm font-medium text-gray-500">Account Created</dt>
                                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(userInfo.created_at) }}</dd>
                            </div>
                            <div class="sm:col-span-1">
                                <dt class="text-sm font-medium text-gray-500">Last Login</dt>
                                <dd class="mt-1 text-sm text-gray-900">{{ userInfo.last_login ?
                                    formatDate(userInfo.last_login) :
                                    'N/A' }}</dd>
                            </div>
                            <div class="sm:col-span-1">
                                <dt class="text-sm font-medium text-gray-500">Status</dt>
                                <dd class="mt-1 text-sm text-gray-900">
                                    <span
                                        class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                        Active
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
    EyeIcon,
    EyeSlashIcon,
    ExclamationCircleIcon
} from '@heroicons/vue/24/outline';

const config = useRuntimeConfig();
const router = useRouter();
const toast = useToast();
const apiBaseUrl = 'http://localhost:9000/api';

// States
const loading = ref(true);
const profileSubmitting = ref(false);
const passwordSubmitting = ref(false);
const passwordError = ref('');
const userInfo = ref({});
const departments = ref([]);

// Password visibility states
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Form data
const profileForm = ref({
    username: '',
    email: '',
    full_name: '',
    job_title: '',
    phone: '',
    department_id: null
});

const passwordForm = ref({
    current_password: '',
    new_password: '',
    confirm_password: ''
});

// Computed properties
const userInitials = computed(() => {
    const name = userInfo.value.full_name || userInfo.value.username || '';
    return name.charAt(0).toUpperCase();
});

const userRole = computed(() => {
    if (userInfo.value.role === 'super_admin') return 'Super Admin';
    if (userInfo.value.role === 'admin') return 'Admin';
    return 'User';
});

const canSubmitPassword = computed(() => {
    return (
        passwordForm.value.current_password &&
        passwordForm.value.new_password &&
        passwordForm.value.confirm_password &&
        passwordForm.value.new_password === passwordForm.value.confirm_password &&
        passwordForm.value.new_password.length >= 8
    );
});

// Format date helper
function formatDate(dateString) {
    if (!dateString) return 'N/A';

    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// Fetch user profile
async function fetchUserProfile() {
    try {
        loading.value = true;

        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Get user from localStorage (for now, later we'll fetch from API)
        const userData = localStorage.getItem('user');
        if (userData) {
            userInfo.value = JSON.parse(userData);

            // Pre-fill the form with user data
            profileForm.value = {
                username: userInfo.value.username || '',
                email: userInfo.value.email || '',
                full_name: userInfo.value.full_name || '',
                job_title: userInfo.value.job_title || '',
                phone: userInfo.value.phone || '',
                department_id: userInfo.value.department_id || null
            };
        }

        // Fetch departments (for department selection)
        const deptResponse = await $fetch(`${apiBaseUrl}/departments`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (deptResponse) {
            departments.value = deptResponse;
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile information');
    } finally {
        loading.value = false;
    }
}

// Update profile information
async function updateProfile() {
    try {
        profileSubmitting.value = true;

        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Update profile via API
        const response = await $fetch(`${apiBaseUrl}/admin/users/${userInfo.value.id}`, {
            method: 'PUT',
            body: profileForm.value,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response) {
            // Update local storage with new user data
            const updatedUser = {
                ...userInfo.value,
                ...profileForm.value
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            userInfo.value = updatedUser;

            toast.success('Profile updated successfully');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
    } finally {
        profileSubmitting.value = false;
    }
}

// ฟังก์ชันเปลี่ยนรหัสผ่าน - ส่ง user_id ในกรณีที่ไม่มี token หรือ token ไม่ถูกต้อง
async function changePassword() {
    try {
        passwordError.value = '';

        // Validate passwords
        if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
            passwordError.value = 'New passwords do not match';
            return;
        }

        if (passwordForm.value.new_password.length < 8) {
            passwordError.value = 'Password must be at least 8 characters';
            return;
        }

        passwordSubmitting.value = true;

        // Get token and user from localStorage
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;

        if (!user) {
            passwordError.value = 'User information not available';
            return;
        }

        // เรียกใช้ API endpoint ที่สร้างใหม่
        const response = await $fetch(`${apiBaseUrl}/users/change-password`, {
            method: 'POST',
            body: {
                current_password: passwordForm.value.current_password,
                new_password: passwordForm.value.new_password,
                user_id: user.id // ส่ง user_id เพิ่มเติมเพื่อรองรับกรณีที่ req.user เป็น undefined
            },
            headers: token ? {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            } : {
                'Content-Type': 'application/json'
            }
        });

        if (response && response.success) {
            // Reset password form
            passwordForm.value = {
                current_password: '',
                new_password: '',
                confirm_password: ''
            };

            toast.success('Password changed successfully');
        }
    } catch (error) {
        console.error('Error changing password:', error);

        // Handle specific errors
        if (error.response) {
            if (error.response.status === 401) {
                passwordError.value = 'Current password is incorrect';
            } else if (error.response.status === 400) {
                passwordError.value = error.response.data?.message || 'Invalid password format';
            } else {
                passwordError.value = error.response.data?.message || 'Failed to change password';
            }
        } else {
            passwordError.value = 'Network error. Please try again later.';
        }

        toast.error('Failed to change password');
    } finally {
        passwordSubmitting.value = false;
    }
}

// Fetch data on component mount
onMounted(async () => {
    await fetchUserProfile();
});
</script>