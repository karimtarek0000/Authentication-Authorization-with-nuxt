import { useAuthService, userAuth } from '@/auth'

export default defineNuxtRouteMiddleware(async to => {
  const { restoreSession } = useAuthService()
  await restoreSession()

  const isAuth = userAuth.isAuth

  if (to.meta.layout === 'dashboard' && !isAuth) {
    return navigateTo('/auth')
  }

  if (to.meta.layout === 'auth' && isAuth) {
    return navigateTo('/dashboard')
  }
})
