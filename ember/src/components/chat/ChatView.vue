<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import ChatMessage from './ChatMessage.vue'
import StreamingIndicator from './StreamingIndicator.vue'
import type { Message } from './ChatMessage.vue'

const props = defineProps<{
  messages: Message[]
  isStreaming: boolean
}>()

const containerRef = ref<HTMLElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight
    }
  })
}

watch(() => props.messages.length, scrollToBottom)
watch(() => props.isStreaming, scrollToBottom)
watch(
  () => props.messages[props.messages.length - 1]?.content,
  () => {
    if (props.isStreaming) scrollToBottom()
  },
)
</script>

<template>
  <div
    ref="containerRef"
    class="flex-1 overflow-y-auto"
  >
    <div class="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div
        v-if="messages.length === 0 && !isStreaming"
        class="flex-1 flex items-center justify-center py-32"
      >
        <div class="text-center">
          <h1 class="text-5xl italic text-text-muted mb-4">Ember</h1>
          <p class="text-text-muted text-sm">What would you like to create?</p>
        </div>
      </div>

      <template v-else>
        <ChatMessage
          v-for="msg in messages"
          :key="msg.id"
          :message="msg"
        />
        <StreamingIndicator :is-streaming="isStreaming" />
      </template>
    </div>
  </div>
</template>
