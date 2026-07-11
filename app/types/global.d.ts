import type { useHttp } from '@/auth'

export {}

declare global {
  var $http: ReturnType<typeof useHttp>
}
