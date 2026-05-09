export default defineNuxtRouteMiddleware((to) => {
  // Only run on client — avoids SSR hydration mismatches
  if (import.meta.server) return

  const auth = useAuthStore()
  auth.restoreSession()

  const isLoginPage = to.path === '/login'

  if (!auth.isAuthenticated && !isLoginPage) {
    return navigateTo('/login')
  }

  if (auth.isAuthenticated && isLoginPage) {
    return navigateTo('/')
  }
})
