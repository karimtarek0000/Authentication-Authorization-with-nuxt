<script setup lang="ts">
import { $checkPermissions, CanView, type PermissionRequirement } from '@/auth'

definePageMeta({
  middleware: 'permissions',
  permissions: {
    permission: 'manage_users',
  } as PermissionRequirement,
})

const { data, execute, error } = await useAsyncData(() => $http('/data'), { immediate: false })

const getSomeData = async () => await execute()

const paragraphSection = $checkPermissions({ permission: 'edit_testing' })
const headingSection = $checkPermissions({
  allOf: ['edit_profile', 'manage_users'],
})
</script>

<template>
  <CanView :status="headingSection">
    <h2>Can view this heading</h2>
    <template #title> No 😀 </template>
  </CanView>

  <CanView :status="paragraphSection">
    <p>
      Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur fuga soluta ullam commodi
      quas, laboriosam nisi exercitationem veritatis nostrum velit laudantium possimus mollitia ut
      est quia alias? Culpa aut facere sint dignissimos dicta, facilis quas deleniti modi quae
      officia illo cumque expedita, tenetur laborum adipisci, rerum cum illum minima perferendis.
      Ut, debitis. Molestiae sunt quidem ducimus omnis sequi? Molestiae vero et culpa nostrum quo,
      rem odit temporibus laudantium ipsa optio. Quisquam ut odit enim deserunt, totam laborum
      sapiente consectetur temporibus perferendis assumenda accusantium? Laboriosam praesentium
      mollitia iste culpa laborum. Consectetur magnam enim quod dolore laudantium aut ipsam quam
      quis modi.
    </p>
  </CanView>

  <h1>Download Page</h1>
  <button @click="getSomeData">Get the data</button>
</template>

<style scoped></style>
