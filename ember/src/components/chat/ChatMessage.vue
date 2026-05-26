<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMarkdown } from '@/composables/useMarkdown'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  createdAt: number
}

const props = defineProps<{
  message: Message
}>()

const { renderMarkdown } = useMarkdown()
const htmlContent = ref('')

watch(
  () => props.message.content,
  async (content) => {
    htmlContent.value = await renderMarkdown(content)
  },
  { immediate: true },
)

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div
    class="message-enter group"
    :class="message.role === 'user' ? 'flex justify-end' : 'flex gap-3'"
  >
    <div
      v-if="message.role === 'assistant'"
      class="w-7 h-7 rounded-full bg-accent-soft flex items-center justify-center shrink-0 mt-0.5"
    >
      <span class="text-accent text-xs font-bold">E</span>
    </div>

    <div
      class="max-w-[85%]"
      :class="message.role === 'user' ? 'bg-surface rounded-2xl rounded-br-md px-4 py-2.5' : ''"
    >
      <div
        v-if="message.role === 'user'"
        class="text-sm leading-relaxed whitespace-pre-wrap"
      >
        {{ message.content }}
      </div>

      <div
        v-else
        class="prose prose-invert prose-sm max-w-none text-sm leading-relaxed"
        v-html="htmlContent"
      />

      <div
        v-if="message.model && message.role === 'assistant'"
        class="flex items-center gap-2 mt-2"
      >
        <span class="text-[10px] font-mono text-text-muted bg-accent-soft px-1.5 py-0.5 rounded">
          {{ message.model }}
        </span>
        <span class="text-[10px] font-mono text-text-muted">
          {{ formatTime(message.createdAt) }}
        </span>
      </div>

      <div
        v-if="message.role === 'user'"
        class="text-[10px] font-mono text-text-muted mt-1 text-right opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {{ formatTime(message.createdAt) }}
      </div>
    </div>
  </div>
</template>