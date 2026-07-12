import { LOGIN, PROFILE, REFRESH_TOKEN, useHttp, type IUserAuth, type Login } from '@/auth'
import { handleError } from 'vue'

const initialData = {
  accessToken: '',
  userInfo: { id: '', name: '', email: '' },
  permissions: [],
  role: '',
  isAuth: false,
}

const resetUserAuth = () => {
  Object.assign(userAuth, initialData)
}

export const userAuth = reactive<IUserAuth>(initialData)

let restorePromise: Promise<null | undefined> | null = null
let refreshPromise: Promise<undefined | string> | null = null

export const useAuthService = () => {
  const headers = useRequestHeaders(['cookie'])
  const hasAuth = useCookie('hasAuth')

  const login = async ({ email, password }: Login) => {
    try {
      const data: any = await $http(LOGIN, {
        method: 'POST',
        body: { email, password },
      })

      const { id, name, ...info } = data

      Object.assign(userAuth, {
        accessToken: info.accessToken,
        role: info.role,
        userInfo: { id, name, email },
        permissions: info.permissions,
        isAuth: true,
      })

      hasAuth.value = JSON.stringify(true)

      navigateTo('/dashboard')
    } catch (error) {
      throw error
    }
  }

  //   const loginWithOAuth = async (provider: OAuthProvider, code: string) => {
  //     try {
  //       const endpoint = provider === 'google' ? OAUTH_GOOGLE : OAUTH_GITHUB

  //       const {
  //         data: { id, name, email, ...info },
  //       } = await api.post(endpoint, { code, redirectURL: getOAuthRedirectURL(provider) })

  //       Object.assign(userAuth, {
  //         accessToken: info.accessToken,
  //         role: info.role,
  //         userInfo: { id, name, email },
  //         permissions: info.permissions,
  //         isAuth: true,
  //       })

  //       router.replace('/')
  //     } catch (error) {
  //       throw handleError(error as AxiosError)
  //     }
  //   }

  const logout = () => {
    resetUserAuth()
    hasAuth.value = ''
    location.reload()
    // authChannel.broadcast('logout')
  }

  const refreshToken = async () => {
    if (refreshPromise) return refreshPromise

    refreshPromise = (async () => {
      try {
        const data: { accessToken: string } = await $fetch(REFRESH_TOKEN, {
          method: 'POST',
          credentials: 'include',
          headers: {
            ...headers,
          },
        })
        userAuth.accessToken = data.accessToken

        return data.accessToken
      } catch (error) {
        // logout()
        throw error
      } finally {
        refreshPromise = null
      }
    })()

    return refreshPromise
  }

  const restoreUserInfo = async () => {
    try {
      const data = await $http(PROFILE)

      Object.assign(userAuth, {
        role: data.role,
        userInfo: { id: data.id, name: data.name, email: data.email },
        permissions: data.permissions,
        isAuth: true,
      })
    } catch (error) {
      // logout()
      // throw error
    }
  }

  const restoreSession = async () => {
    if (userAuth.isAuth || !hasAuth.value) return

    if (restorePromise) return restorePromise

    restorePromise = (async () => {
      try {
        const token = await refreshToken()

        if (!token) return null

        await restoreUserInfo()

        return true
      } catch (error) {
        console.error('[auth] restoreSession failed', error)
      }
    })()

    return restorePromise
  }

  return { login, refreshToken, restoreSession, logout }
}
