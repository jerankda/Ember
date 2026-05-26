import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const hasKey = ref(false)
  const keyPreview = ref('')

  async function fetchStatus() {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      hasKey.value = data.hasKey
      keyPreview.value = data.keyPreview || ''
    } catch {
      hasKey.value = false
    }
  }

  async function setApiKey(key: string) {
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key }),
    })
    const data = await res.json()
    hasKey.value = true
    keyPreview.value = data.keyPreview || ''
  }

  async function clearApiKey() {
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: '' }),
    })
    hasKey.value = false
    keyPreview.value = ''
  }

  return { hasKey, keyPreview, fetchStatus, setApiKey, clearApiKey }
})