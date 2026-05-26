<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { v4 as uuid } from 'uuid'
import AppShell from '@/components/layout/AppShell.vue'
import ChatView from '@/components/chat/ChatView.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import { useStreaming } from '@/composables/useStreaming'
import { useConversationsStore } from '@/stores/conversations'
import type { Message } from '@/components/chat/ChatMessage.vue'

const route = useRoute()
const router = useRouter()
const conversationsStore = useConversationsStore()
const { isStreaming, connect } = useStreaming()

const messages = ref<Message[]>([])
const conversationId = ref<string | null>(null)
const model = ref('openai/gpt-4o')
const isCreating = ref(false)

async function loadConversation(id: string) {
  try {
    const res = await fetch(`/api/conversations/${id}`)
    if (!res.ok) {
      messages.value = []
      conversationId.value = null
      return
    }
    const data = await res.json()
    messages.value = data.messages || []
    conversationId.value = id
  } catch {
    messages.value = []
    conversationId.value = null
  }
}

watch(
  () => route.params.id,
  async (id) => {
    if (isCreating.value) {
      isCreating.value = false
      return
    }
    if (id && typeof id === 'string') {
      await loadConversation(id)
    } else {
      messages.value = []
      conversationId.value = null
    }
  },
  { immediate: true },
)

async function handleSend(content: string) {
  if (isStreaming.value || !content.trim()) return

  if (!conversationId.value) {
    isCreating.value = true

    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: content.slice(0, 50) }),
    })
    const conv = await res.json()
    conversationId.value = conv.id
    conversationsStore.conversations.unshift(conv)
    router.replace(`/c/${conv.id}`)
  }

  const userMsg: Message = {
    id: uuid(),
    role: 'user',
    content,
    model: model.value,
    createdAt: Date.now(),
  }
  messages.value = [...messages.value, userMsg]

  const assistantMsg: Message = {
    id: uuid(),
    role: 'assistant',
    content: '',
    model: model.value,
    createdAt: Date.now(),
  }
  messages.value = [...messages.value, assistantMsg]

  const assistantIndex = messages.value.length - 1
  let fullContent = ''

  const chatMessages = messages.value
    .filter((m) => m.role !== 'assistant' || m.content)
    .slice(0, -1)
    .map((m) => ({
      role: m.role,
      content: m.content,
    }))

  connect(
    '/api/chat',
    {
      conversationId: conversationId.value,
      messages: chatMessages,
      model: model.value,
    },
    (token) => {
      fullContent += token
      messages.value[assistantIndex] = {
        ...messages.value[assistantIndex],
        content: fullContent,
      }
    },
    () => {
      // stream complete — messages are already displayed locally
    },
    (err) => {
      messages.value[assistantIndex] = {
        ...messages.value[assistantIndex],
        content: `Error: ${err}`,
      }
    },
  )
}

function handleKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    router.push('/')
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
    e.preventDefault()
    router.push('/')
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <AppShell>
    <ChatView
      :messages="messages"
      :is-streaming="isStreaming"
    />
    <ChatInput
      :disabled="isStreaming"
      @send="handleSend"
    />
  </AppShell>
</template>