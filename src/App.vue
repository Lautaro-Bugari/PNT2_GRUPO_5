<script setup>
 import AppHeader from "./views/AppHeader.vue"
</script>

<template>
    <div>
      <AppHeader />
      <router-view />
    </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Roboto, sans-serif;
}
</style>

