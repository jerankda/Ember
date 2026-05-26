import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ModelInfo {
  id: string
  name: string
  context_length?: number
}

export const useModelsStore = defineStore('models', () => {
  const models = ref<ModelInfo[]>([])
  const loading = ref(false)

  const chatModels = computed(() =>
    models.value.filter(
      (m) =>
        !m.id.includes(':beta') &&
        !m.id.includes('vision') &&
        !m.id.includes('draft') &&
        (m.id.startsWith('openai/') ||
          m.id.startsWith('anthropic/') ||
          m.id.startsWith('google/') ||
          m.id.startsWith('meta-llama/') ||
          m.id.startsWith('mistral/') ||
          m.id.startsWith('deepseek/') ||
          m.id.startsWith('qwen/') ||
          m.id.startsWith('cohere/') ||
          m.id.startsWith('x-ai/') ||
          m.id.startsWith('perplexity/')),
    ),
  )

  async function fetchModels() {
    if (models.value.length > 0) return
    loading.value = true
    try {
      const res = await fetch('/api/models')
      const data = await res.json()
      if (Array.isArray(data.data)) {
        models.value = data.data.map((m: any) => ({
          id: m.id,
          name: m.name || m.id,
          context_length: m.context_length,
        }))
      }
    } catch {
      // models fetch failed silently
    } finally {
      loading.value = false
    }
  }

  return { models, chatModels, loading, fetchModels }
})