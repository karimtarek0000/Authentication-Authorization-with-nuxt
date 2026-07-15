import { $checkPermissions, userAuth, type PermissionRequirement } from '@/auth'

export default defineNuxtRouteMiddleware(to => {
  const hasPermissions = $checkPermissions(
    to.meta.permissions as PermissionRequirement,
    userAuth.permissions,
  )

  if (!hasPermissions) {
    return navigateTo('/dashboard')
  }

  return true
})
