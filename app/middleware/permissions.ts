import { $checkPermissions, PAGES, type PermissionRequirement } from '@/auth'

export default defineNuxtRouteMiddleware(to => {
  const pagePermissions = to.meta.permissions as PermissionRequirement

  if (pagePermissions) {
    const hasPermissions = $checkPermissions(pagePermissions, $authService.userAuth.permissions)

    if (!hasPermissions) return navigateTo(PAGES.DASHBOARD)
  }

  return true
})
