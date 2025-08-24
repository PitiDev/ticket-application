// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  if (process.client) {
    const token = localStorage.getItem('token')
    if (!token && to.path !== '/login' && to.path !== '/register' && to.path !== '/forgot-password' && to.path !== '/reset-password') {
      return navigateTo('/login')
    }
  }
})