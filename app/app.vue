<script setup lang="ts">
import { authChannel } from '@/auth'

onNuxtReady(() => {
  authChannel.subscribe(event => {
    if (event === 'logout') {
      location.reload()
    }
  })
})
</script>

<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </NuxtLayout>
</template>
