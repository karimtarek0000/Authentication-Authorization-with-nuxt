<script setup lang="ts">
// const { data, execute, error } = await useAsyncData(
//   (_nuxtApp, { signal }) => $http('/data', { signal }),
//   { immediate: false },
// )
const { data, execute, error } = await useAsyncData(() => $http('/data'), { immediate: false })
const { data: products, execute: otherExcute } = await useAsyncData(() => $http('/new-data'), {
  immediate: false,
})

const getSomeData = async () => {
  await execute()
  await otherExcute()
}

const logout = () => {
  $authService.logout()
}

const userData = $authService.userAuth
</script>

<template>
  <ClientOnly>
    <template #fallback>
      <h1>Loading...</h1>
    </template>
    <pre>
      {{ userData.accessToken }}
      {{ userData.userInfo }}
      {{ userData.permissions }}
      {{ userData.role }}
    </pre>
  </ClientOnly>

  <RouterLink to="/dashboard/about">Go to test page</RouterLink>
  <br />
  <br />
  <br />
  <RouterLink to="/auth">Go to login</RouterLink>
  <button @click="getSomeData">Get the data</button>
  <button @click="logout">logout</button>
  <RouterLink to="/dashboard/download">Go to download page</RouterLink>
</template>
