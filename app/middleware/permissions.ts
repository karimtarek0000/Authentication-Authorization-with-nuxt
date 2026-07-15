import { $checkPermissions, type PermissionRequirement } from '@/auth'

export default defineNuxtRouteMiddleware(to => {
  const hasPermissions = $checkPermissions(to.meta.permissions as PermissionRequirement)

  console.log(hasPermissions)
  if (!hasPermissions) {
    return navigateTo('/dashboard')
  }

  return true
})
