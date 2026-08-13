<template>
  <h1 class="text-xl font-semibold text-foreground">Hello World</h1>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Dashboard",
  layout: "dashboard",
  middleware: "auth",
});
</script>
