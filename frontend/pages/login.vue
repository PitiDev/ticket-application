<script setup>
const router = useRouter()
const config = useRuntimeConfig()

const formData = ref({
  email: '',
  password: ''
})

const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  try {
    // Reset error state
    error.value = ''
    loading.value = true

    // Make API call to login
    const response = await fetch(`${config.public.apiBase}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: formData.value.email,
        password: formData.value.password
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Invalid credentials')
    }

    // Use process.client to check if we're on the client side
    if (process.client) {
      // Store token and user data
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }

    // Redirect to dashboard
    router.push('/')
  } catch (err) {
    error.value = err.message || 'An error occurred during login'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}

// Store composable for handling auth state
const useAuth = () => {
  const getToken = () => {
    if (process.client) {
      return localStorage.getItem('token')
    }
    return null
  }

  const getUser = () => {
    if (process.client) {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  }

  const logout = () => {
    if (process.client) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    router.push('/login')
  }

  return {
    getToken,
    getUser,
    logout
  }
}

// Create auth composable instance
const auth = useAuth()

// Check if user is already logged in
onMounted(() => {
  const token = auth.getToken()
  if (token) {
    router.push('/')
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-lg shadow-md">
      <div class="p-6 space-y-4">
        <div class="space-y-2 text-center">
          <h1 class="text-2xl font-bold tracking-tight">Welcome Back</h1>
          <p class="text-gray-500">Sign in to your account</p>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email Input -->
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
                placeholder="Email address"
              />
            </div>
          </div>

          <!-- Password Input -->
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

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label class="ml-2 block text-sm text-gray-900">Remember me</label>
            </div>
            <div class="text-sm">
              <NuxtLink to="/forgot-password" class="text-blue-600 hover:underline">
                Forgot password?
              </NuxtLink>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign in</span>
          </button>
        </form>

        <!-- Register Link -->
        <div class="text-center">
          <NuxtLink 
            to="/register"
            class="text-sm text-blue-600 hover:underline"
          >
            Don't have an account? Sign up
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