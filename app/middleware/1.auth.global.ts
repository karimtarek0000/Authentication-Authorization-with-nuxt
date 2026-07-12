import { userAuth } from '@/auth'

export default defineNuxtRouteMiddleware(to => {
  // const hasAuth = useCookie('hasAuth')
  // console.log(hasAuth.value)

  if (to.meta.layout === 'dashboard' && !userAuth.accessToken) {
    return navigateTo('/auth')
  }

  if (to.meta.layout === 'auth' && userAuth.accessToken) {
    return navigateTo('/dashboard')
  }
})
