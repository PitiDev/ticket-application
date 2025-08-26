<script setup>
const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()

const formData = ref({
  password: '',
  confirm_password: ''
})

const token = ref('')
const error = ref('')
const success = ref('')
const warning = ref('') // เพิ่มตัวแปร warning
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isPasswordReset = ref(false)

// สำหรับเก็บข้อมูลจาก API Settings
const appName = ref('Ticket Support System') // ค่าเริ่มต้น
const logoUrl = ref(null) // URL ของโลโก้
const apiBaseUrl = 'http://172.16.4.62:9000/api' // Base URL ของ API

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

// คำนวณความแข็งแรงของรหัสผ่าน
const passwordStrength = computed(() => {
  const password = formData.value.password
  if (!password) return { score: 0, text: '' }
  
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  
  const texts = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600']
  
  return {
    score,
    text: texts[score - 1] || '',
    color: colors[score - 1] || 'bg-gray-200',
    width: `${score * 20}%`
  }
})

// ตรวจสอบความถูกต้องของฟอร์ม
const isFormValid = computed(() => {
  return (
    formData.value.password.length >= 8 &&
    formData.value.password === formData.value.confirm_password
  )
})

// Toggle password visibility
const togglePasswordVisibility = (field) => {
  if (field === 'password') {
    showPassword.value = !showPassword.value
  } else {
    showConfirmPassword.value = !showConfirmPassword.value
  }
}

// สำหรับรีเซ็ตรหัสผ่าน
const handleResetPassword = async () => {
  try {
    // รีเซ็ตสถานะข้อผิดพลาดและความสำเร็จ
    error.value = ''
    success.value = ''
    
    // ตรวจสอบความถูกต้องของฟอร์ม
    if (!isFormValid.value) {
      if (formData.value.password !== formData.value.confirm_password) {
        error.value = 'Passwords do not match'
      } else if (formData.value.password.length < 8) {
        error.value = 'Password must be at least 8 characters long'
      } else {
        error.value = 'Please fill in all required fields'
      }
      return
    }
    
    loading.value = true
    
    console.log('Sending reset password request with token:', token.value);
    
    // ส่งคำขอรีเซ็ตรหัสผ่านไปยัง API
    const response = await fetch(`${apiBaseUrl}/users/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: token.value,
        password: formData.value.password
      })
    })
    
    const data = await response.json()
    
    console.log('Reset password response:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password')
    }
    
    // แสดงข้อความสำเร็จ
    success.value = 'Your password has been reset successfully'
    isPasswordReset.value = true
    
  } catch (err) {
    // กรณีที่เกิดข้อผิดพลาด
    error.value = err.message || 'An error occurred. Please try again'
    console.error('Reset password error:', err)
  } finally {
    loading.value = false
  }
}

// กลับไปยังหน้า login
const goToLogin = () => {
  router.push('/login')
}

// ตรวจสอบว่ามี token หรือไม่
onMounted(async () => {
  if (process.client) {
    console.log('Page mounted, checking query parameters');
    
    // ดึง token จาก query parameter
    token.value = route.query.token || '';
    console.log('Token from URL:', token.value);
    
    if (!token.value) {
      error.value = 'Invalid or missing reset token';
      console.log('No token found, will redirect to forgot-password');
      // หากไม่มี token ให้ redirect ไปหน้า forgot-password หลังจากรอสักครู่
      setTimeout(() => {
        router.push('/forgot-password');
      }, 3000);
      return;
    }
    
    // ไม่ต้อง redirect ถึงแม้จะมี token ใน localStorage
    const authToken = localStorage.getItem('token');
    if (authToken) {
      warning.value = 'You are currently logged in. Resetting your password will log you out from all devices.';
      console.log('User is logged in, showing warning');
    }
  }
  
  // ดึงการตั้งค่าระบบ
  await fetchSystemSettings();
});
</script>

<template>
  <div class="min-h-screen  flex  justify-center p-4">
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
        <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-400 gold-shimmer">Reset Password</h1>
        <p class="text-gray-500 mt-2">Create a new password for your account</p>
      </div>
      
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- Warning Alert -->
        <div v-if="warning" class="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-yellow-700">{{ warning }}</p>
            </div>
          </div>
        </div>
        
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
        
        <!-- Success Alert -->
        <div v-if="success" class="bg-green-50 border-l-4 border-green-500 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-700">{{ success }}</p>
            </div>
          </div>
        </div>
        
        <div class="p-8">
          <!-- Password Reset Success View -->
          <div v-if="isPasswordReset" class="text-center space-y-6">
            <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
              <svg class="h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p class="text-gray-700">Your password has been reset successfully. You can now log in with your new password.</p>
            <button
              @click="goToLogin"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200"
            >
              Go to Login
            </button>
          </div>
          
          <!-- Reset Password Form -->
          <form v-else-if="token" @submit.prevent="handleResetPassword" class="space-y-6">
            <!-- New Password -->
            <div class="space-y-2">
              <label for="password" class="block text-sm font-medium text-gray-700">New password</label>
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
                  class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  @click="togglePasswordVisibility('password')" 
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
              
              <!-- Password Strength -->
              <div class="mt-1">
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div :class="[passwordStrength.color, 'h-2.5 rounded-full transition-all duration-300']" :style="{ width: passwordStrength.width }"></div>
                </div>
                <p v-if="formData.password" class="text-xs mt-1 text-gray-500">
                  Password strength: <span :class="{ 'text-red-600': passwordStrength.score < 3, 'text-green-600': passwordStrength.score >= 3 }">{{ passwordStrength.text }}</span>
                </p>
                <p v-else class="text-xs mt-1 text-gray-500">Password must be at least 8 characters</p>
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="space-y-2">
              <label for="confirm_password" class="block text-sm font-medium text-gray-700">Confirm password</label>
              <div class="relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <input
                  id="confirm_password"
                  v-model="formData.confirm_password"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  @click="togglePasswordVisibility('confirm')" 
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg v-if="showConfirmPassword" class="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else class="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                </button>
              </div>
              <p v-if="formData.password && formData.confirm_password && formData.password !== formData.confirm_password" class="text-xs text-red-600 mt-1">
                Passwords do not match
              </p>
            </div>

            <!-- Submit Button -->
            <div>
              <button
                type="submit"
                :disabled="loading || !isFormValid"
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading ? 'Resetting...' : 'Reset Password' }}
              </button>
            </div>
          </form>

          <!-- Invalid Token View -->
          <div v-else class="text-center space-y-6">
            <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100">
              <svg class="h-10 w-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p class="text-gray-700">Invalid or missing reset token. Please request a new password reset link.</p>
            <button
              @click="router.push('/forgot-password')"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200"
            >
              Reset Password
            </button>
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
/* เพิ่ม effect ประกายทองคำ */
.gold-shimmer {
  background-size: 200% auto;
  animation: shimmer 2s linear infinite;
  background-image: linear-gradient(to right, #D4AF37 0%, #FFF176 25%, #FFD700 50%, #FFF176 75%, #D4AF37 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

@keyframes shimmer {
  0% {
    background-position: 0% center;
  }
  100% {
    background-position: 200% center;
  }
}

/* เพิ่ม shadow hover effect */
.shadow-xl:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}
</style>