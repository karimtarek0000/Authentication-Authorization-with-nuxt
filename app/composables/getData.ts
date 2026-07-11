import { useHttp } from '@/auth'

export const useGetProducts = async () => {
  const http = useHttp()

  return await useLazyAsyncData('products', () => http('/data'), {
    immediate: false,
  })
}
