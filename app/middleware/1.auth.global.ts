import { abortPendingRequests } from '@/auth'

export default defineNuxtRouteMiddleware(async to => {
  if (import.meta.client) {
    abortPendingRequests()
  }

  const isAuth = await $authService.restoreSession()

  if (to.meta.layout === 'dashboard' && !isAuth) {
    return navigateTo('/auth')
  }

  if (to.meta.layout === 'auth' && isAuth) {
    return navigateTo('/dashboard')
  }
})
