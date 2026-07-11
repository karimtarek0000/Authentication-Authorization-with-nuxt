import { userAuth } from '@/auth'
import type { FetchOptions, FetchRequest } from 'ofetch'
import { ofetch } from 'ofetch'

const MAXIMUM_RETRY = 3

export const useHttp = () => {
  // -------------------------- BASE DATA --------------------------
  const config = useRuntimeConfig()
  const headers = useRequestHeaders(['cookie'])

  // -------------------------- CREATE FETCHER --------------------------
  const fetcher = ofetch.create({
    baseURL: config.public.BASE_URL as string,
    credentials: 'include',
    headers,
    retry: 2,

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
    let retryCount = 0

    try {
      const response = await fetcher.raw(request, options)
      return response._data
    } catch (error: any) {
      const status = error.response?.status
      const message = error.response?._data?.message

      if (status === 500 && message?.includes('TokenExpiredError')) {
        // return logout()
      }

      if (retryCount < MAXIMUM_RETRY) {
        retryCount += 1

        // Access token expired
        if (status === 402 || status === 403) {
          const newToken = await $authService.refreshToken()

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

        const retryResponse = await fetcher.raw(request, options)
        return retryResponse._data
      }

      return Promise.reject(error.response?._data || error)
    }
  }
}
