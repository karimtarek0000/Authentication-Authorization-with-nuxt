import { userAuth } from '@/auth'
import type { FetchOptions, FetchRequest } from 'ofetch'
import { ofetch } from 'ofetch'

// -------------------------- ABORT CONTROLLER --------------------------
let controller = new AbortController()

export const abortPendingRequests = () => {
  controller.abort()
  controller = new AbortController()
}

export const getAbortSignal = () => controller.signal

export const useHttp = () => {
  // -------------------------- BASE DATA --------------------------
  const config = useRuntimeConfig()
  const headers = useRequestHeaders(['cookie'])

  // -------------------------- CREATE FETCHER --------------------------
  const fetcher = ofetch.create({
    baseURL: config.public.BASE_URL as string,
    credentials: 'include',
    headers,
    retry: 2, // WORKING WITH THSES STATUS CODES: 408, 409, 425, 429, 500, 502, 503, 504

    // -------------------------- REQUEST --------------------------
    onRequest({ options }) {
      if (userAuth.accessToken) {
        options.headers.set('Authorization', `Bearer ${userAuth.accessToken}`)
      }
    },

    // -------------------------- RESPONSE --------------------------
    onResponse({ response }) {},
  })

  // -------------------------- FINAL WRAPPER --------------------------
  return async (request: FetchRequest, options?: FetchOptions) => {
    try {
      const response = await fetcher.raw(request, {
        ...options,
        signal: options?.signal ?? controller.signal,
      })
      return response._data
    } catch (error: any) {
      const status = error.response?.status

      // If access token expired will call refresh token for getting a new `accessToken`
      if (status === 401) {
        try {
          await $authService.refreshToken()

          const retryResponse = await fetcher.raw(request, {
            ...options,
            headers: {
              ...options?.headers,
            },
            signal: options?.signal ?? controller.signal,
          })
          return retryResponse._data
        } catch (error) {}
      }

      return Promise.reject(error.response?._data || error)
    }
  }
}
