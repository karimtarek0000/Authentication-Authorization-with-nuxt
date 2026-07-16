<script setup lang="ts">
import type { PermissionRequirement } from '@/auth'

definePageMeta({
  middleware: 'permissions',
  permissions: {
    permission: 'manage_users',
  } as PermissionRequirement,
})

const { data, execute, error } = await useAsyncData(() => $http('/data'), { immediate: false })

const getSomeData = async () => await execute()
</script>

<template>
  <h1>Download Page</h1>
  <button @click="getSomeData">Get the data</button>
</template>

<style scoped></style>
