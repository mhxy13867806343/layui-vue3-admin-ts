<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onBeforeMount(() => {
  const target = (route.params.path as string) || ''
  const fullTarget = target.startsWith('/') ? target : `/${target}`
  router.replace(fullTarget)
})
</script>
<template><div /></template>
