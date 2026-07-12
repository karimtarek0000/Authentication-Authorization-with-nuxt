export default defineNuxtRouteMiddleware(async to => {
  const isAuth = await $authService.restoreSession()

  if (to.meta.layout === 'dashboard' && !isAuth) {
    return navigateTo('/auth')
  }

  if (to.meta.layout === 'auth' && isAuth) {
    return navigateTo('/dashboard')
  }
})
