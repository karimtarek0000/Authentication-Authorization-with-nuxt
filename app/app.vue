<script setup lang="ts">
const { data, execute } = await useGetProducts()

async function getData() {
  await execute()
  console.log(data.value)
}
</script>

<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <button @click="getData">click</button>
  </NuxtLayout>
</template>
