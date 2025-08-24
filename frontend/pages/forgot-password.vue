<script setup>
const router = useRouter()
const config = useRuntimeConfig()

const email = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)
const isEmailSent = ref(false)

definePageMeta({
  public: true
});

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

// สำหรับส่งคำขอรีเซ็ตรหัสผ่าน
const handleForgotPassword = async () => {
  try {
    // รีเซ็ตสถานะข้อผิดพลาดและความสำเร็จ
    error.value = ''
    success.value = ''
    
    // ตรวจสอบว่ามีการกรอกอีเมลหรือไม่
    if (!email.value.trim()) {
      error.value = 'Please enter your email address'
      return
    }
    
    loading.value = true
    
    // ส่งคำขอรีเซ็ตรหัสผ่านไปยัง API
    const response = await fetch(`${config.public.apiBase}/users/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value
      })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send password reset email')
    }
    
    // แสดงข้อความสำเร็จ
    success.value = 'Password reset instructions have been sent to your email'
    isEmailSent.value = true
    
  } catch (err) {
    // กรณีที่เกิดข้อผิดพลาด
    error.value = err.message || 'An error occurred. Please try again'
    console.error('Forgot password error:', err)
  } finally {
    loading.value = false
  }
}

// ตรวจสอบว่าผู้ใช้ล็อกอินอยู่หรือไม่
onMounted(async () => {
  if (process.client) {
    const token = localStorage.getItem('token')
    if (token) {
      router.push('/')
      return
    }
  }
  
  // ดึงการตั้งค่าระบบ
  await fetchSystemSettings()
})

// กลับไปยังหน้า login
const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen  to-pink-50 flex  justify-center p-4">
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
        <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-400 gold-shimmer">Forgot Password?</h1>
        <p class="text-gray-500 mt-2">Enter your email to reset your password</p>
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
          <!-- Email Sent View -->
          <div v-if="isEmailSent" class="text-center space-y-6">
            <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
              <svg class="h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="text-gray-700">We've sent password reset instructions to your email. Please check your inbox.</p>
            <button
              @click="goToLogin"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200"
            >
              Back to Login
            </button>
          </div>
          
          <!-- Forgot Password Form -->
          <form v-else @submit.prevent="handleForgotPassword" class="space-y-6">
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
                  v-model="email"
                  type="email"
                  required
                  class="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>
              <p class="mt-1 text-xs text-gray-500">We'll send you a link to reset your password</p>
            </div>

            <!-- Submit Button -->
            <div>
              <button
                type="submit"
                :disabled="loading"
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading ? 'Sending...' : 'Reset Password' }}
              </button>
            </div>
          </form>

          <!-- Back to Login Link -->
          <div v-if="!isEmailSent" class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              Remember your password?
              <NuxtLink 
                to="/login"
                class="font-medium text-amber-600 hover:text-amber-500 transition-all duration-200"
              >
                Back to login
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
/* เพิ่ม effect ประกายทองคำ */
.gold-shimmer {
  background-size: 200% auto;
  animation: shimmer 2s linear infinite;
  background-image: linear-gradient(to right, #D4AF37 0%, #FFF176 25%, #FFD700 50%, #FFF176 75%, #D4AF37 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

/* @keyframes shimmer {
  0% {
    background-position: 0% center;
  }
  100% {
    background-position: 200% center;
  }
} */

/* เพิ่ม shadow hover effect */
.shadow-xl:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}
</style>