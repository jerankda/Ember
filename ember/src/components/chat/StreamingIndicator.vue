<script setup lang="ts">
defineProps<{
  isStreaming: boolean
}>()
</script>

<template>
  <div v-if="isStreaming" class="flex gap-3 message-enter">
    <div class="w-7 h-7 rounded-full bg-accent-soft flex items-center justify-center shrink-0 mt-0.5">
      <span class="text-accent text-xs font-bold">E</span>
    </div>
    <div class="flex items-center gap-1 py-2">
      <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
      <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style="animation-delay: 0.2s" />
      <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style="animation-delay: 0.4s" />
    </div>
  </div>
</template>
