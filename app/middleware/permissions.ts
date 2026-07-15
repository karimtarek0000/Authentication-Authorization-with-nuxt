import { $checkPermissions, type PermissionRequirement } from '@/auth'

export default defineNuxtRouteMiddleware(to => {
  const hasPermissions = $checkPermissions(to.meta.permissions as PermissionRequirement)

  if (!hasPermissions) {
    return navigateTo('/dashboard')
  }

  return true
})
