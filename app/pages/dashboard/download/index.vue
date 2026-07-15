<script setup lang="ts">
import type { PermissionRequirement } from '@/auth'

definePageMeta({
  middleware: 'permissions',
  permissions: {
    anyOf: ['edit_profile', 'edit_testing'],
  } as PermissionRequirement,
})
</script>

<template>
  <h1>Download Page</h1>
</template>

<style scoped></style>
