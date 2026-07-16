import { $checkPermissions, type PermissionRequirement } from '@/auth'

export default defineNuxtRouteMiddleware(to => {
  const pagePermissions = to.meta.permissions as PermissionRequirement

  if (pagePermissions) {
    const hasPermissions = $checkPermissions(pagePermissions, $authService.userAuth.permissions)

    if (!hasPermissions) return navigateTo('/dashboard')
  }

  return true
})
