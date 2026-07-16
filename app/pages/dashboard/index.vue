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

// const paragraphSection = $checkPermissions({ permission: 'edit_testing' })
// const headingSection = $checkPermissions({
//   allOf: ['edit_profile', 'manage_users'],
// })

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
      <!-- {{ userAuth.accessToken }}
      {{ userAuth.userInfo }}
      {{ userAuth.permissions }}
      {{ userAuth.role }}
      {{ userAuth.isAuth }} -->
    </pre>
  </ClientOnly>

  <!-- <h3>{{ error?.message }}</h3> -->

  <!-- <CanView :status="headingSection">
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
  </CanView> -->

  <RouterLink to="/dashboard/about">Go to test page</RouterLink>
  <br />
  <br />
  <br />
  <RouterLink to="/auth">Go to login</RouterLink>
  <button @click="getSomeData">Get the data</button>
  <button @click="logout">logout</button>
  <RouterLink to="/dashboard/download">Go to download page</RouterLink>
</template>
