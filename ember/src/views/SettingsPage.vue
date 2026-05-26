<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import AppShell from '@/components/layout/AppShell.vue'

const router = useRouter()
const settings = useSettingsStore()
const keyInput = ref(settings.apiKey)
const saved = ref(false)

function save() {
  settings.setApiKey(keyInput.value)
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}
</script>

<template>
  <AppShell>
    <div class="flex-1 p-8 max-w-2xl mx-auto w-full">
      <button
        @click="router.back()"
        class="text-sm text-text-muted hover:text-text transition-colors mb-8"
      >
        ← Back
      </button>
      <h1 class="text-2xl font-semibold text-text mb-8">Settings</h1>
      <div class="bg-surface border border-border rounded-xl p-6 space-y-4">
        <div>
          <label class="block text-sm text-text-muted mb-2">OpenRouter API Key</label>
          <input
            v-model="keyInput"
            type="password"
            class="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text text-sm focus:outline-none focus:border-accent transition-colors"
            placeholder="sk-or-..."
          />
          <p class="text-xs text-text-muted mt-1">
            Your key is stored locally and never sent anywhere except OpenRouter.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="save"
            class="px-4 py-2 bg-accent text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
          >
            Save
          </button>
          <span v-if="saved" class="text-sm text-text-muted">Saved</span>
        </div>
      </div>
    </div>
  </AppShell>
</template>