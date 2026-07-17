import { abortPendingRequests, LAYOUT, PAGES } from '@/auth'

export default defineNuxtRouteMiddleware(async to => {
  if (import.meta.client) {
    abortPendingRequests()
  }

  const isAuth = await $authService.restoreSession()

  if (to.meta.layout === LAYOUT.DASHBOARD && !isAuth) {
    return navigateTo(`${PAGES.AUTH}?page=${to.path}`)
  }

  if (to.meta.layout === LAYOUT.AUTH && isAuth) {
    return navigateTo(PAGES.DASHBOARD)
  }
})
