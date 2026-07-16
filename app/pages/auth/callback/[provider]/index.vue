<script setup lang="ts">
import { consumeOAuthState, type OAuthProvider } from '@/auth'

const route = useRoute()
const errorMessage = ref('')

onMounted(async () => {
  const provider = route.params.provider as OAuthProvider
  const code = route.query.code as string | undefined
  const state = route.query.state as string | undefined
  const providerError = route.query.error as string | undefined

  if (providerError) {
    errorMessage.value = 'The sign-in was cancelled or denied.'
    return
  }

  if (!code || !consumeOAuthState(provider, state ?? null)) {
    errorMessage.value = 'This sign-in link is invalid or has expired.'
    return
  }

  try {
    await $authService.loginWithOAuth(provider, code)
  } catch {
    errorMessage.value = 'We could not sign you in. Please try again.'
  }
})
</script>

<template>
  <main class="page">
    <p v-if="!errorMessage">Signing you in…</p>
    <template v-else>
      <p>{{ errorMessage }}</p>
      <NuxtLink to="/auth">Back to login</NuxtLink>
    </template>
  </main>
</template>

<style scoped></style>
