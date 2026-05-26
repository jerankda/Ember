<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useConversationsStore } from '@/stores/conversations'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ toggle: [] }>()

const router = useRouter()
const conversations = useConversationsStore()

function newChat() {
  conversations.create().then((conv) => {
    router.push(`/c/${conv.id}`)
  })
}
</script>

<template>
  <Transition name="slide">
    <aside
      v-show="open"
      class="w-[280px] bg-bg-muted border-r border-border flex flex-col shrink-0"
    >
      <div class="p-4 flex items-center justify-between border-b border-border">
        <span class="font-semibold text-text tracking-wide text-sm">Ember</span>
        <button
          @click="emit('toggle')"
          class="text-text-muted hover:text-text transition-colors text-sm"
        >
          ◂
        </button>
      </div>
      <div class="p-3">
        <button
          @click="newChat"
          class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text hover:bg-accent-soft/30 transition-colors"
        >
          + New chat
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-3 space-y-1">
        <div
          v-for="conv in conversations.sorted"
          :key="conv.id"
          class="px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-surface cursor-pointer transition-colors truncate"
          @click="router.push(`/c/${conv.id}`)"
        >
          {{ conv.title }}
        </div>
      </div>
      <div class="p-3 border-t border-border">
        <button
          @click="router.push('/settings')"
          class="w-full px-3 py-2 text-sm text-text-muted hover:text-text transition-colors text-left"
        >
          Settings
        </button>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: width 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  width: 0;
}
</style>