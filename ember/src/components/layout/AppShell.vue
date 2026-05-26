<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'

const sidebarOpen = ref(true)
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <Sidebar :open="sidebarOpen" @toggle="sidebarOpen = !sidebarOpen" />
    <main class="flex-1 flex flex-col overflow-hidden transition-all duration-300">
      <slot />
    </main>
  </div>
</template>