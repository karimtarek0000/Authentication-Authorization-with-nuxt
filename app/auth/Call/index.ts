import { useAuthService, userAuth } from '@/auth'
import type { FetchOptions, FetchRequest } from 'ofetch'
import { ofetch } from 'ofetch'

export const useHttp = () => {
  // -------------------------- BASE DATA --------------------------
  const config = useRuntimeConfig()
  const headers = useRequestHeaders(['cookie'])
  const { refreshToken } = useAuthService()

  // -------------------------- CREATE FETCHER --------------------------
  const fetcher = ofetch.create({
    baseURL: config.public.BASE_URL as string,
    credentials: 'include',
    headers,

    // -------------------------- REQUEST --------------------------
    onRequest({ options }) {
      if (userAuth.accessToken) {
        options.headers.set('Authorization', `Bearer ${userAuth.accessToken}`)
      }
    },

    // -------------------------- RESPONSE --------------------------
    onResponse({ response }) {
      // const res = response._data
    },
  })

  // -------------------------- FINAL WRAPPER --------------------------
  return async (request: FetchRequest, options?: FetchOptions) => {
    try {
      const response = await fetcher.raw(request, options)
      return response._data
    } catch (error: any) {
      const status = error.response?.status
      const message = error.response?._data?.message

      if (status === 500 && message?.includes('TokenExpiredError')) {
        // return logout()
      }

      // Access token expired
      if (status === 401 || status === 403) {
        const newToken = await refreshToken()

        if (newToken) {
          options = options || {}
          options.headers = {
            ...(options.headers || {}),
            Authorization: `Bearer ${newToken}`,
          }

          const retryResponse = await fetcher.raw(request, options)
          return retryResponse._data
        } else {
          // return logout()
        }
      }

      return Promise.reject(error.response?._data || error)
    }
  }
}
