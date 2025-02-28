<script setup>
const router = useRouter()
const config = useRuntimeConfig()

const formData = ref({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const error = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  try {
    // Reset error
    error.value = ''
    loading.value = true

    // Validate passwords match
    if (formData.value.password !== formData.value.confirmPassword) {
      error.value = 'Passwords do not match'
      return
    }

    // Make API call to register
    const response = await fetch(`${config.public.apiBase}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: formData.value.email, // Using email as username
        email: formData.value.email,
        password: formData.value.password,
        full_name: formData.value.fullName,
        phone: formData.value.phone
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed')
    }

    // Store token if returned from API
    if (data.token) {
      localStorage.setItem('token', data.token)
    }

    // Show success message and redirect
    alert('Registration successful!')
    router.push('/login')
  } catch (err) {
    error.value = err.message || 'An error occurred during registration'
    console.error('Registration error:', err)
  } finally {
    loading.value = false
  }
}
</script>


<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-lg shadow-md">
      <div class="p-6 space-y-4">
        <div class="space-y-2 text-center">
          <h1 class="text-2xl font-bold tracking-tight">Create an Account</h1>
          <p class="text-gray-500">Enter your details to register</p>
        </div>

        <!-- Show error message if exists -->
        <div v-if="error" class="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
          {{ error }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Your existing form fields here -->
      <div class="space-y-2">
            <div class="relative">
              <span class="absolute left-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                v-model="formData.fullName"
                type="text"
                required
                class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Full Name"
              />
            </div>
          </div>

          <div class="space-y-2">
            <div class="relative">
              <span class="absolute left-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input
                v-model="formData.email"
                type="email"
                required
                class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Email"
              />
            </div>
          </div>

          <div class="space-y-2">
            <div class="relative">
              <span class="absolute left-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </span>
              <input
                v-model="formData.phone"
                type="tel"
                required
                class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Phone Number"
              />
            </div>
          </div>

          <div class="space-y-2">
            <div class="relative">
              <span class="absolute left-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                v-model="formData.password"
                type="password"
                required
                class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Password"
              />
            </div>
          </div>

          <div class="space-y-2">
            <div class="relative">
              <span class="absolute left-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                v-model="formData.confirmPassword"
                type="password"
                required
                class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Confirm Password"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Registering...</span>
            <span v-else>Create Account</span>
          </button>
        </form>

        <div class="text-center">
          <NuxtLink 
            to="/login"
            class="text-sm text-blue-600 hover:underline"
          >
            Already have an account? Sign in
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>