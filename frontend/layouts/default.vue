<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top Navigation Bar -->
    <nav class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Left side - Logo and Brand -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex-shrink-0 flex items-center">
              <!-- ใช้โลโก้จาก API หากมี -->
              <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="h-9 w-auto mr-3" />
              <!-- โลโก้ fallback ถ้าไม่มี logoUrl -->
              <div v-else
                class="h-9 w-9 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center mr-3">
                <span class="text-white font-bold text-xl">TS</span>
              </div>
              <!-- เปลี่ยนสีเป็นทองคำ (Golden) -->
              <span
                class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-400 gold-shimmer">{{
                  appName }}</span>
            </NuxtLink>

            <!-- Main Navigation Menu -->
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <!-- Menus for all users -->
              <NuxtLink to="/"
                class="border-transparent text-gray-500 hover:border-amber-300 hover:text-amber-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200"
                :class="isActiveRoute('/') ? 'border-amber-500 text-amber-600 font-semibold' : ''">
                Dashboard
              </NuxtLink>
              <NuxtLink to="/tickets"
                class="border-transparent text-gray-500 hover:border-amber-300 hover:text-amber-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200"
                :class="isActiveRoute('/tickets') ? 'border-amber-500 text-amber-600 font-semibold' : ''">
                Tickets
              </NuxtLink>

              <NuxtLink to="/tickets/assigned"
                class="border-transparent text-gray-500 hover:border-amber-300 hover:text-amber-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200"
                :class="isActiveRoute('/tickets/assigned') ? 'border-amber-500 text-amber-600 font-semibold' : ''">
                Assigned
              </NuxtLink>

              <!-- Admin area menu - only visible to admins -->
              <template v-if="isAdmin || isSuperAdmin">
                <NuxtLink to="/admin"
                  class="border-transparent text-gray-500 hover:border-amber-300 hover:text-amber-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200"
                  :class="isActiveRoute('/admin') ? 'border-amber-500 text-amber-600 font-semibold' : ''">
                  Admin area
                </NuxtLink>
              </template>

              <template v-if="isAdmin || isSuperAdmin">
                <NuxtLink to="/admin/mobile-report"
                  class="border-transparent text-gray-500 hover:border-amber-300 hover:text-amber-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200"
                  :class="isActiveRoute('/admin/mobile-report') ? 'border-amber-500 text-amber-600 font-semibold' : ''">
                  LBB Plus Report
                </NuxtLink>
              </template>

            </div>
          </div>

          <!-- Right Side - User Menu -->
          <div class="flex items-center">
            <!-- Notification Bell -->
            <button class="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none">
              <span class="sr-only">View notifications</span>
              <BellIcon class="h-6 w-6" />
              <span v-if="notificationCount > 0"
                class="absolute top-3 right-48 bg-red-500 rounded-full h-5 w-5 flex items-center justify-center text-white text-xs font-medium">
                {{ notificationCount > 9 ? '9+' : notificationCount }}
              </span>
            </button>

            <!-- User Menu Dropdown -->
            <Menu as="div" class="ml-3 relative">
              <div>
                <MenuButton
                  class="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 items-center">
                  <span class="sr-only">Open user menu</span>
                  <div
                    class="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-medium mr-2">
                    {{ userInitials }}
                  </div>
                  <span class="hidden md:flex text-gray-700 text-sm font-medium">{{ userName }}</span>
                  <ChevronDownIcon class="ml-2 h-4 w-4 text-gray-500" />
                </MenuButton>
              </div>
              <transition enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95">
                <MenuItems
                  class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <MenuItem v-slot="{ active }">
                  <div class="px-4 py-2 border-b border-gray-100">
                    <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
                    <p class="text-xs text-gray-500">{{ userEmail }}</p>
                    <div class="mt-1">
                      <span
                        class="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                        {{ userRole }}
                      </span>
                    </div>
                  </div>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                  <NuxtLink to="/profile">
                    <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">
                      Your Profile
                    </a>
                  </NuxtLink>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                  <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">
                    Settings
                  </a>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                  <a @click="logout"
                    :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-red-600 cursor-pointer']">
                    Sign out
                  </a>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </div>
      </div>
    </nav>

    <!-- Mobile menu for small screens -->
    <div class="sm:hidden bg-white shadow-sm border-b border-gray-200 pb-2">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <NuxtLink to="/tickets" class="block px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
          :class="isActiveRoute('/tickets') ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-gray-500 hover:bg-amber-50 hover:text-amber-600'">
          Tickets
        </NuxtLink>

        <NuxtLink to="/tickets/assigned"
          class="block px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
          :class="isActiveRoute('/tickets/assigned') ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-gray-500 hover:bg-amber-50 hover:text-amber-600'">
          Assigned
        </NuxtLink>

        <!-- Admin area menu - only visible to admins -->
        <template v-if="isAdmin || isSuperAdmin">
          <NuxtLink to="/admin" class="block px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
            :class="isActiveRoute('/admin') ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-gray-500 hover:bg-amber-50 hover:text-amber-600'">
            Admin area
          </NuxtLink>
        </template>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
// ส่วน script คงเดิม
import { ref, computed, onMounted } from 'vue'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems
} from '@headlessui/vue'
import {
  BellIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

// App configuration
const appName = ref('Ticket Support System') // ค่าเริ่มต้น
const logoUrl = ref(null) // URL ของโลโก้
const notificationCount = ref(0) // จำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
const apiBaseUrl = 'http://172.16.4.62:9000/api' // Base URL ของ API

// Function to check if a route is active (exact or starts with)
const isActiveRoute = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path === path || route.path.startsWith(`${path}/`)
}

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

// User information (ดึงจาก localStorage)
const user = ref(null)
const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'super_admin')
const isSuperAdmin = computed(() => user.value?.role === 'super_admin')

// Computed properties สำหรับข้อมูลผู้ใช้
const userName = computed(() => user.value?.full_name || user.value?.username || 'Guest')
const userEmail = computed(() => user.value?.email || '')
const userRole = computed(() => {
  if (user.value?.role === 'super_admin') return 'Super Admin'
  if (user.value?.role === 'admin') return 'Admin'
  return 'User'
})
const userInitials = computed(() => {
  if (!user.value) return 'G'
  const name = user.value.full_name || user.value.username || ''
  return name.charAt(0).toUpperCase()
})

// ดึงข้อมูลผู้ใช้และการตั้งค่าเมื่อโหลดหน้า
onMounted(async () => {
  try {
    // ดึงข้อมูลผู้ใช้จาก localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      user.value = JSON.parse(userData)
    } else {
      // ถ้าไม่มีข้อมูลผู้ใช้ ให้ redirect ไปยังหน้า login
      // router.push('/login')
    }

    // ดึงการตั้งค่าระบบจาก API
    await fetchSystemSettings()
  } catch (error) {
    console.error('Error loading user data:', error)
    router.push('/login')
  }
})

// Logout function
const logout = () => {
  // ล้างข้อมูล auth
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  // Redirect ไปยังหน้า login
  router.push('/login')
}
</script>

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

/* Improved menu transitions */
.router-link-active {
  @apply border-amber-500 text-amber-600 font-semibold;
}

/* Menu item hover effects */
a.border-b-2:hover {
  transform: translateY(-1px);
}

/* Mobile menu active item effect */
.sm\:hidden a.router-link-active {
  @apply bg-amber-100 text-amber-700 shadow-sm;
}
</style>