import {
  $checkPermissions,
  checkPermissions,
  userAuth,
  type Permission,
  type PermissionRequirement,
} from '@/auth'
import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'

export default defineNuxtRouteMiddleware(to => {
  const hasPermissions = $checkPermissions(
    to.meta.permissions as PermissionRequirement,
    userAuth.permissions,
  )

  console.log(hasPermissions)

  if (!hasPermissions) {
    return navigateTo('/dashboard')
  }

  return true
})
