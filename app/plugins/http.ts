import { useHttp } from '@/auth'

export default defineNuxtPlugin(() => {
  globalThis.$http = useHttp()
})
