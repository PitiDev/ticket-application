<template>
    <div class="min-h-screen to-red-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
            <!-- Header -->
            <div class="mb-8 fade-in-up">
                <h1 class="text-3xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">Your Profile</h1>
                <p class="mt-2 text-base text-gray-600">
                    Manage your account information and password
                </p>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center py-16 fade-in">
                <div class="flex flex-col items-center">
                    <div class="relative">
                        <div class="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin">
                        </div>
                    </div>
                    <p class="mt-4 text-gray-700 font-medium">Loading your profile...</p>
                </div>
            </div>

            <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in-up">
                <!-- Profile Information Section -->
                <div class="lg:col-span-2 space-y-6">
                    <div class="bg-white rounded-xl shadow-lg overflow-hidden card-hover border border-amber-100">
                        <div class="px-6 py-5 bg-gradient-to-r from-amber-50 to-red-50 border-b border-amber-100 flex justify-between items-center">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900">Profile Information</h3>
                                <p class="mt-1 text-sm text-amber-700">Personal details and contact information</p>
                            </div>
                            <span class="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full">Last updated: {{ lastUpdated }}</span>
                        </div>

                        <div class="p-6">
                            <form @submit.prevent="updateProfile">
                                <div class="grid grid-cols-6 gap-6">
                                    <!-- Profile Picture -->
                                    <div class="col-span-6 sm:col-span-6">
                                        <div class="flex items-center">
                                            <div class="relative group">
                                                <div
                                                    class="h-24 w-24 rounded-xl bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center text-white text-3xl font-medium shadow-lg group-hover:shadow-amber-200 transition duration-300">
                                                    {{ userInitials }}
                                                </div>
                                                <div
                                                    class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <div
                                                        class="bg-black bg-opacity-40 rounded-xl w-full h-full flex items-center justify-center">
                                                        <span class="text-white text-sm font-medium">Change</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="ml-6">
                                                <h3 class="text-lg font-medium text-gray-900">{{ profileForm.full_name
                                                    }}</h3>
                                                <p class="text-sm text-amber-600">{{ profileForm.job_title }}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Username -->
                                    <div class="col-span-6 sm:col-span-3">
                                        <label for="username"
                                            class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                        <input type="text" name="username" id="username" v-model="profileForm.username"
                                            readonly
                                            class="w-full px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-gray-800 text-sm transition focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                                        <p class="mt-1 text-xs text-amber-600">Username cannot be changed</p>
                                    </div>

                                    <!-- Email -->
                                    <div class="col-span-6 sm:col-span-3">
                                        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email
                                            address</label>
                                        <input type="email" name="email" id="email" v-model="profileForm.email"
                                            class="w-full px-4 py-2.5 border border-amber-200 rounded-lg text-gray-800 text-sm transition focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300" />
                                    </div>

                                    <!-- Full Name -->
                                    <div class="col-span-6 sm:col-span-3">
                                        <label for="full_name"
                                            class="block text-sm font-medium text-gray-700 mb-1">Full
                                            name</label>
                                        <input type="text" name="full_name" id="full_name"
                                            v-model="profileForm.full_name"
                                            class="w-full px-4 py-2.5 border border-amber-200 rounded-lg text-gray-800 text-sm transition focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300" />
                                    </div>

                                    <!-- Job Title -->
                                    <div class="col-span-6 sm:col-span-3">
                                        <label for="job_title" class="block text-sm font-medium text-gray-700 mb-1">Job
                                            title</label>
                                        <input type="text" name="job_title" id="job_title"
                                            v-model="profileForm.job_title"
                                            class="w-full px-4 py-2.5 border border-amber-200 rounded-lg text-gray-800 text-sm transition focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300" />
                                    </div>

                                    <!-- Department -->
                                    <div class="col-span-6 sm:col-span-3">
                                        <label for="department"
                                            class="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                        <div class="relative">
                                            <select id="department" name="department"
                                                v-model="profileForm.department_id"
                                                class="appearance-none w-full px-4 py-2.5 border border-amber-200 rounded-lg text-gray-800 text-sm transition focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300">
                                                <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                                                    {{ dept.name }}
                                                </option>
                                            </select>
                                            <div
                                                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-amber-500">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Phone -->
                                    <div class="col-span-6 sm:col-span-3">
                                        <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone
                                            number</label>
                                        <input type="text" name="phone" id="phone" v-model="profileForm.phone"
                                            class="w-full px-4 py-2.5 border border-amber-200 rounded-lg text-gray-800 text-sm transition focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300" />
                                    </div>
                                </div>

                                <!-- Submit Button -->
                                <div class="mt-8 flex justify-end">
                                    <button type="submit" :disabled="profileSubmitting"
                                        class="inline-flex items-center justify-center py-2.5 px-6 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
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
                                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            Save Changes
                                        </template>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Right Side -->
                <div class="space-y-6">
                    <!-- Change Password Section -->
                    <div class="bg-white rounded-xl shadow-lg overflow-hidden card-hover border border-amber-100">
                        <div class="px-6 py-5 bg-gradient-to-r from-amber-50 to-red-50 border-b border-amber-100">
                            <h3 class="text-lg font-semibold text-gray-900">Change Password</h3>
                            <p class="mt-1 text-sm text-amber-700">Update your password securely</p>
                        </div>

                        <div class="p-6">
                            <form @submit.prevent="changePassword">
                                <div class="space-y-5">
                                    <!-- Current Password -->
                                    <div>
                                        <label for="current_password"
                                            class="block text-sm font-medium text-gray-700 mb-1">Current
                                            password</label>
                                        <div class="relative rounded-lg shadow-sm">
                                            <input :type="showCurrentPassword ? 'text' : 'password'"
                                                name="current_password" id="current_password"
                                                v-model="passwordForm.current_password" required
                                                class="w-full pl-4 pr-10 py-2.5 border border-amber-200 rounded-lg text-gray-800 text-sm transition focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300"
                                                placeholder="••••••••" />
                                            <button type="button" @click="showCurrentPassword = !showCurrentPassword"
                                                class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                <svg v-if="showCurrentPassword" class="h-5 w-5 text-amber-400"
                                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                <svg v-else class="h-5 w-5 text-amber-400" fill="none"
                                                    viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <!-- New Password -->
                                    <div>
                                        <label for="new_password"
                                            class="block text-sm font-medium text-gray-700 mb-1">New
                                            password</label>
                                        <div class="relative rounded-lg shadow-sm">
                                            <input :type="showNewPassword ? 'text' : 'password'" name="new_password"
                                                id="new_password" v-model="passwordForm.new_password" required
                                                class="w-full pl-4 pr-10 py-2.5 border border-amber-200 rounded-lg text-gray-800 text-sm transition focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300"
                                                placeholder="••••••••" />
                                            <button type="button" @click="showNewPassword = !showNewPassword"
                                                class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                <svg v-if="showNewPassword" class="h-5 w-5 text-amber-400" fill="none"
                                                    viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                <svg v-else class="h-5 w-5 text-amber-400" fill="none"
                                                    viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div class="mt-2">
                                            <div class="flex items-center">
                                                <div
                                                    :class="[passwordStrength >= 1 ? 'bg-amber-500' : 'bg-gray-200', 'h-1 w-1/4 rounded-full mr-1 transition-colors']">
                                                </div>
                                                <div
                                                    :class="[passwordStrength >= 2 ? 'bg-amber-500' : 'bg-gray-200', 'h-1 w-1/4 rounded-full mr-1 transition-colors']">
                                                </div>
                                                <div
                                                    :class="[passwordStrength >= 3 ? 'bg-amber-500' : 'bg-gray-200', 'h-1 w-1/4 rounded-full mr-1 transition-colors']">
                                                </div>
                                                <div
                                                    :class="[passwordStrength >= 4 ? 'bg-red-500' : 'bg-gray-200', 'h-1 w-1/4 rounded-full transition-colors']">
                                                </div>
                                            </div>
                                            <p class="mt-1 text-xs text-amber-600">Password must be at least 8
                                                characters</p>
                                        </div>
                                    </div>

                                    <!-- Confirm New Password -->
                                    <div>
                                        <label for="confirm_password"
                                            class="block text-sm font-medium text-gray-700 mb-1">Confirm
                                            new password</label>
                                        <div class="relative rounded-lg shadow-sm">
                                            <input :type="showConfirmPassword ? 'text' : 'password'"
                                                name="confirm_password" id="confirm_password"
                                                v-model="passwordForm.confirm_password" required
                                                class="w-full pl-4 pr-10 py-2.5 border border-amber-200 rounded-lg text-gray-800 text-sm transition focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300"
                                                placeholder="••••••••" />
                                            <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                                                class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                <svg v-if="showConfirmPassword" class="h-5 w-5 text-amber-400"
                                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                <svg v-else class="h-5 w-5 text-amber-400" fill="none"
                                                    viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Password Error Message -->
                                    <div v-if="passwordError" class="rounded-lg bg-red-50 p-4 mt-2 mb-2 border border-red-200">
                                        <div class="flex">
                                            <div class="flex-shrink-0">
                                                <svg class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24"
                                                    stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div class="ml-3">
                                                <h3 class="text-sm font-medium text-red-800">{{ passwordError }}</h3>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Submit Button -->
                                    <div class="mt-6">
                                        <button type="submit" :disabled="passwordSubmitting || !canSubmitPassword"
                                            class="w-full inline-flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                                            <template v-if="passwordSubmitting">
                                                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle class="opacity-25" cx="12" cy="12" r="10"
                                                        stroke="currentColor" stroke-width="4"></circle>
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
                    <div class="bg-white rounded-xl shadow-lg overflow-hidden card-hover border border-amber-100">
                        <div class="px-6 py-5 bg-gradient-to-r from-amber-50 to-red-50 border-b border-amber-100">
                            <h3 class="text-lg font-semibold text-gray-900">Account Information</h3>
                        </div>

                        <div class="p-6">
                            <dl class="space-y-4">
                                <div class="flex justify-between items-center">
                                    <dt class="text-sm font-medium text-gray-500">User Role</dt>
                                    <dd class="text-sm text-gray-900">
                                        <span
                                            class="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-700/20">
                                            {{ userRole }}
                                        </span>
                                    </dd>
                                </div>
                                <div class="flex justify-between items-center pt-2 border-t border-amber-100">
                                    <dt class="text-sm font-medium text-gray-500">Account Created</dt>
                                    <dd class="text-sm text-gray-900 font-medium">{{ formatDate(userInfo.created_at) }}</dd>
                                </div>
                                <div class="flex justify-between items-center pt-2 border-t border-amber-100">
                                    <dt class="text-sm font-medium text-gray-500">Last Login</dt>
                                    <dd class="text-sm text-gray-900 font-medium">{{ userInfo.last_login ?
                                        formatDate(userInfo.last_login) : 'N/A' }}</dd>
                                </div>
                                <div class="flex justify-between items-center pt-2 border-t border-amber-100">
                                    <dt class="text-sm font-medium text-gray-500">Status</dt>
                                    <dd class="text-sm text-gray-900">
                                        <span
                                            class="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                            <span class="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
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
    </div>
</template>

<style scoped>
/* Custom animations */
.fade-in {
    animation: fadeIn 0.5s ease-out;
}

.fade-in-up {
    animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Card hover effect */
.card-hover {
    transition: all 0.3s ease;
}

.card-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(245, 158, 11, 0.1);
}

/* Input focus styles */
input:focus,
select:focus {
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
}

/* Enhanced button hover effects */
button:hover:not(:disabled) {
    transform: translateY(-1px);
}

/* Password strength indicator */
.password-strength {
    transition: all 0.3s ease;
}
</style>

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

const passwordStrength = computed(() => {
    const password = passwordForm.value.new_password;
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
});

const lastUpdated = computed(() => {
    return formatDate(userInfo.value.updated_at) || 'Never';
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
                department_id: userInfo.value.department_id || null,
                avatar_url: userInfo.value.avatar_url
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