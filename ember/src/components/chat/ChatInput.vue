<script setup lang="ts">
import { ref, nextTick } from 'vue'

defineProps<{
  disabled: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
}>()

const input = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

function resizeTextarea() {
  nextTick(() => {
    const el = textareaRef.value
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  })
}

function handleSend() {
  const content = input.value.trim()
  if (!content) return
  emit('send', content)
  input.value = ''
  resizeTextarea()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="border-t border-border bg-bg">
    <div class="max-w-3xl mx-auto px-6 py-4">
      <div class="flex items-end gap-3">
        <textarea
          ref="textareaRef"
          v-model="input"
          :disabled="disabled"
          rows="1"
          placeholder="Tell Ember what to build..."
          class="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-muted resize-none outline-none focus:border-accent/50 transition-colors font-serif leading-relaxed max-h-[200px]"
          @input="resizeTextarea"
          @keydown="handleKeydown"
        />
        <button
          :disabled="disabled || !input.trim()"
          class="shrink-0 w-10 h-10 rounded-xl bg-accent text-bg font-bold flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          @click="handleSend"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 8l12-6-6 12-2-6-4-0z" />
          </svg>
        </button>
      </div>
      <p class="text-[10px] font-mono text-text-muted mt-2 text-right">
        Cmd+Enter to send
      </p>
    </div>
  </div>
</template>
