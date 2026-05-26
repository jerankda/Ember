import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Conversation {
  id: string
  title: string
  systemPromptId: string | null
  createdAt: number
  updatedAt: number
}

export const useConversationsStore = defineStore('conversations', () => {
  const conversations = ref<Conversation[]>([])
  const loading = ref(false)

  const sorted = computed(() =>
    [...conversations.value].sort((a, b) => b.updatedAt - a.updatedAt)
  )

  async function fetchAll() {
    loading.value = true
    try {
      const res = await fetch('/api/conversations')
      conversations.value = await res.json()
    } finally {
      loading.value = false
    }
  }

  async function create(title = 'New conversation') {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    const conv = await res.json()
    conversations.value.unshift(conv)
    return conv
  }

  async function remove(id: string) {
    await fetch(`/api/conversations/${id}`, { method: 'DELETE' })
    conversations.value = conversations.value.filter((c) => c.id !== id)
  }

  async function updateTitle(id: string, title: string) {
    await fetch(`/api/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    const conv = conversations.value.find((c) => c.id === id)
    if (conv) conv.title = title
  }

  return { conversations, loading, sorted, fetchAll, create, remove, updateTitle }
})