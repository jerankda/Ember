import { ref } from 'vue'

export function useStreaming() {
  const isStreaming = ref(false)
  let abortController: AbortController | null = null

  async function connect(
    url: string,
    body: unknown,
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (err: string) => void,
  ) {
    isStreaming.value = true
    abortController = new AbortController()

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: abortController.signal,
      })

      if (!response.ok) {
        const errText = await response.text()
        onError(`Request failed: ${response.status} - ${errText}`)
        return
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data: ')) continue
          const data = trimmed.slice(6)
          if (!data) continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.error) {
              onError(parsed.error)
              return
            }
            if (parsed.done) {
              onDone()
              return
            }
            if (parsed.content) {
              onToken(parsed.content)
            }
          } catch {
            // skip unparseable chunks
          }
        }
      }

      onDone()
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        onError(err.message)
      }
    } finally {
      isStreaming.value = false
    }
  }

  function stop() {
    abortController?.abort()
    isStreaming.value = false
  }

  return { isStreaming, connect, stop }
}
