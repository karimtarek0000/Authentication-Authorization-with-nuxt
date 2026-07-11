import { useAuthService, useHttp } from '@/auth'

export {}

declare global {
  var $http: ReturnType<typeof useHttp>
  var $authService: ReturnType<typeof useAuthService>
}
