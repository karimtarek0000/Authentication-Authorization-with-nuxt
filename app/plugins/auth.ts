import { useAuthService, useHttp } from '@/auth'

export default defineNuxtPlugin(() => {
  globalThis.$http = useHttp()
  globalThis.$authService = useAuthService()
})
