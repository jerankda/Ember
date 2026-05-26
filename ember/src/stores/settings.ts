import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const apiKey = ref(localStorage.getItem('ember-api-key') || '')

  function setApiKey(key: string) {
    apiKey.value = key
    localStorage.setItem('ember-api-key', key)
  }

  function clearApiKey() {
    apiKey.value = ''
    localStorage.removeItem('ember-api-key')
  }

  return { apiKey, setApiKey, clearApiKey }
})