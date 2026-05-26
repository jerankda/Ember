<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useModelsStore } from '@/stores/models'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const modelsStore = useModelsStore()
const open = ref(false)
const search = ref('')

const filtered = ref(modelsStore.chatModels)

onMounted(() => {
  modelsStore.fetchModels()
})

function select(modelId: string) {
  emit('update:modelValue', modelId)
  open.value = false
  search.value = ''
}

function toggle() {
  open.value = !open.value
  if (open.value) {
    search.value = ''
    filtered.value = modelsStore.chatModels
  }
}

function filter() {
  const q = search.value.toLowerCase()
  filtered.value = modelsStore.chatModels.filter(
    (m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q),
  )
}
</script>

<template>
  <div class="relative">
    <button
      @click="toggle"
      class="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-text-muted bg-surface border border-border rounded-md hover:border-text-muted/30 transition-colors"
    >
      <span class="max-w-[140px] truncate">{{ modelValue }}</span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M2 3.5L5 6.5L8 3.5" />
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute bottom-full left-0 mb-2 w-[320px] bg-surface border border-border rounded-lg shadow-lg z-50 max-h-[320px] flex flex-col"
    >
      <div class="p-2 border-b border-border">
        <input
          v-model="search"
          type="text"
          placeholder="Search models..."
          class="w-full px-2 py-1 text-xs bg-bg border border-border rounded text-text placeholder:text-text-muted outline-none focus:border-accent/50"
          @input="filter"
        />
      </div>
      <div class="overflow-y-auto flex-1">
        <button
          v-for="model in filtered.slice(0, 50)"
          :key="model.id"
          @click="select(model.id)"
          class="w-full px-3 py-1.5 text-left text-xs text-text-muted hover:bg-accent-soft hover:text-text transition-colors truncate block"
        >
          <span class="font-mono text-[10px] text-text-muted/60 block">{{ model.id }}</span>
        </button>
        <div v-if="filtered.length === 0" class="px-3 py-2 text-xs text-text-muted">
          No models found
        </div>
      </div>
    </div>

    <div
      v-if="open"
      class="fixed inset-0 z-40"
      @click="open = false"
    />
  </div>
</template>