// composables/useAuth.ts
export const useAuth = () => {
    const router = useRouter()
  
    const getToken = () => {
      if (process.client) {
        return localStorage.getItem('token')
      }
      return null
    }
  
    const setToken = (token: string) => {
      if (process.client) {
        localStorage.setItem('token', token)
      }
    }
  
    const getUser = () => {
      if (process.client) {
        const userStr = localStorage.getItem('user')
        return userStr ? JSON.parse(userStr) : null
      }
      return null
    }
  
    const setUser = (user: any) => {
      if (process.client) {
        localStorage.setItem('user', JSON.stringify(user))
      }
    }
  
    const logout = () => {
      if (process.client) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
      }
    }
  
    return {
      getToken,
      setToken,
      getUser,
      setUser,
      logout
    }
  }