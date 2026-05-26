<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import AppShell from '@/components/layout/AppShell.vue'

const router = useRouter()
const settings = useSettingsStore()
const keyInput = ref('')
const saved = ref(false)
const loading = ref(true)

onMounted(async () => {
  await settings.fetchStatus()
  loading.value = false
})

async function save() {
  await settings.setApiKey(keyInput.value)
  keyInput.value = ''
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}

async function remove() {
  await settings.clearApiKey()
}
</script>

<template>
  <AppShell>
    <div class="flex-1 p-8 max-w-2xl mx-auto w-full">
      <button
        @click="router.back()"
        class="text-sm text-text-muted hover:text-text transition-colors mb-8"
      >
        &larr; Back
      </button>
      <h1 class="text-xl text-text mb-8">Settings</h1>

      <div class="bg-surface border border-border rounded-lg p-6 space-y-4">
        <div v-if="loading" class="text-sm text-text-muted">Loading...</div>

        <template v-else>
          <div v-if="settings.hasKey" class="text-sm text-text-muted bg-accent-soft rounded-md px-3 py-2">
            Key saved: {{ settings.keyPreview }}
          </div>

          <div>
            <label class="block text-sm text-text-muted mb-2">OpenRouter API Key</label>
            <input
              v-model="keyInput"
              type="password"
              class="w-full px-3 py-2 bg-bg border border-border rounded-md text-text text-sm focus:outline-none focus:border-accent transition-colors"
              placeholder="sk-or-..."
            />
            <p class="text-xs text-text-muted mt-2">
              Stored locally in SQLite. Never sent anywhere except OpenRouter.
            </p>
          </div>

          <div class="flex gap-3">
            <button
              @click="save"
              class="px-4 py-2 bg-accent text-white text-sm rounded-md hover:opacity-90 transition-opacity"
            >
              {{ saved ? 'Saved' : 'Save' }}
            </button>
            <button
              v-if="settings.hasKey"
              @click="remove"
              class="px-4 py-2 text-sm text-danger hover:underline transition-colors"
            >
              Remove key
            </button>
          </div>
        </template>
      </div>
    </div>
  </AppShell>
</template>