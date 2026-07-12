import { useAuthService } from '@/auth'

export default defineNuxtRouteMiddleware(async to => {
  const { restoreSession } = useAuthService()
  const isAuth = await restoreSession()

  if (to.meta.layout === 'dashboard' && !isAuth) {
    return navigateTo('/auth')
  }

  if (to.meta.layout === 'auth' && isAuth) {
    return navigateTo('/dashboard')
  }
})
