import {
  authChannel,
  LOGIN,
  PAGES,
  PROFILE,
  REFRESH_TOKEN,
  useIdle,
  type IUserAuth,
  type Login,
} from '@/auth'

const initialData = {
  accessToken: '',
  userInfo: { id: '', name: '', email: '' },
  permissions: [],
  role: '',
}

let restorePromise: Promise<boolean | null | undefined> | null = null
let refreshPromise: Promise<undefined | string> | null = null

export const useAuthService = () => {
  const headers = useRequestHeaders(['cookie'])
  const hasAuth = useCookie('hasAuth')
  const _userAuth = useState<IUserAuth>('userAuth', () => initialData)
  const { setIdle } = useIdle()
  const isAuth = ref(false)

  const userAuth = _userAuth.value

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
      })

      isAuth.value = true

      hasAuth.value = JSON.stringify(true)

      navigateTo(PAGES.DASHBOARD)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    Object.assign(userAuth, initialData)
    hasAuth.value = ''
    location.reload()
    authChannel.broadcast('logout')
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
        logout()
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
      })

      isAuth.value = true
    } catch (error) {
      logout()
      throw error
    }
  }

  const restoreSession = async () => {
    if (!hasAuth.value) return false

    if (isAuth.value) return isAuth.value

    if (restorePromise) return restorePromise

    restorePromise = (async () => {
      try {
        const token = await refreshToken()

        if (!token) return null

        await restoreUserInfo()

        return true
      } catch (error) {
        throw error
      }
    })()

    return restorePromise
  }

  watch(
    () => isAuth.value,
    () => setIdle(),
  )

  return { login, refreshToken, restoreSession, userAuth, isAuth, logout }
}
