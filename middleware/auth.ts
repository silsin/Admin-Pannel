export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const auth = useAuthStore()
  auth.restoreSession()

  const isLoginPage = to.path === '/login'

  // Not authenticated → go to login
  if (!auth.isAuthenticated && !isLoginPage) {
    return navigateTo('/login')
  }

  // Already authenticated → don't show login
  if (auth.isAuthenticated && isLoginPage) {
    if (auth.isAgent) return navigateTo('/agent')
    return navigateTo('/')
  }

  // Agent cannot access admin-only routes
  const adminOnlyPrefixes = [
    '/agents',
    '/servers',
    '/inbounds',
    '/traffic',
    '/logs',
    '/certificates',
    '/backup',
    '/settings',
  ]

  if (auth.isAgent) {
    const blocked = adminOnlyPrefixes.some(prefix => to.path.startsWith(prefix))
    if (blocked) return navigateTo('/agent')
  }
})
