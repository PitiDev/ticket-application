<script setup>
const router = useRouter()
const config = useRuntimeConfig()

const formData = ref({
  email: '',
  password: ''
})

const error = ref('')
const loading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)

// สำหรับเก็บข้อมูลจาก API Settings
const appName = ref('Ticket Support System') // ค่าเริ่มต้น
const logoUrl = ref(null) // URL ของโลโก้
const apiBaseUrl = 'http://localhost:9000/api' // Base URL ของ API

// ดึงการตั้งค่าระบบจาก API
const fetchSystemSettings = async () => {
  try {
    const response = await $fetch(`${apiBaseUrl}/settings`);
    if (response) {
      // อัพเดทชื่อระบบ
      if (response.site_name) {
        appName.value = response.site_name;
      }
      
      // อัพเดท URL โลโก้
      if (response.logo_url) {
        // ถ้า logo_url เป็น relative URL ให้เติม base URL
        logoUrl.value = response.logo_url.startsWith('http') 
          ? response.logo_url 
          : `${apiBaseUrl}${response.logo_url}`;
      }
    }
  } catch (error) {
    console.error('Error fetching system settings:', error);
    // หาก API ไม่ตอบสนอง ยังคงใช้ค่าเริ่มต้น
  }
}

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
      
      // Store email if remember me is checked
      if (rememberMe.value) {
        localStorage.setItem('rememberedEmail', formData.value.email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }
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

// Toggle password visibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Check if user is already logged in
onMounted(async () => {
  // const token = auth.getToken()
  // if (token) {
  //   router.push('/')
  // }
  
  // Check for remembered email
  if (process.client) {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      formData.value.email = rememberedEmail
      rememberMe.value = true
    }
  }

  // ดึงการตั้งค่าระบบ
  await fetchSystemSettings()
})
</script>

<template>
  <div class="min-h-screenfrom-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="inline-block p-2 bg-white rounded-xl shadow-xl mb-4">
          <!-- แสดงโลโก้จาก API หากมี -->
          <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="h-16 w-auto" />
          <!-- โลโก้ fallback ถ้าไม่มี logoUrl -->
          <div v-else class="h-16 w-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-2xl">TS</span>
          </div>
        </div>
        <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-400 gold-shimmer">Welcome Back</h1>
        <p class="text-gray-500 mt-2">Sign in to your {{ appName }} account</p>
      </div>
      
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- Error Alert -->
        <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>
        
        <div class="p-8">
          <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- Email Input -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
              <div class="relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  required
                  class="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <!-- Password Input -->
            <div class="space-y-2">
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <div class="relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  @click="togglePasswordVisibility" 
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg v-if="showPassword" class="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else class="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                  id="remember-me"
                  v-model="rememberMe"
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all duration-200"
                />
                <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div class="text-sm">
                <NuxtLink to="/forgot-password" class="font-medium text-indigo-600 hover:text-indigo-500 transition-all duration-200">
                  Forgot your password?
                </NuxtLink>
              </div>
            </div>

            <!-- Submit Button -->
            <div>
              <button
                type="submit"
                :disabled="loading"
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white  bg-gradient-to-r from-amber-500 to-yellow-400 gold-shimmer hover:from-amber-500 hover:to-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading ? 'Signing in...' : 'Sign in' }}
              </button>
            </div>
          </form>

          <!-- Register Link -->
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              Don't have an account?
              <NuxtLink 
                to="/register"
                class="font-medium text-indigo-600 hover:text-indigo-500 transition-all duration-200"
              >
                Sign up now
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
      
      <div class="mt-8 text-center text-sm text-gray-500">
        <p>© {{ new Date().getFullYear() }} {{ appName }}. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* เพิ่ม shadow hover effect */
.shadow-xl:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}
</style>