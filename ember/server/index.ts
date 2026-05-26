import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { stream } from 'hono/streaming'
import { v4 as uuid } from 'uuid'
import { eq, desc } from 'drizzle-orm'
import { db } from './db'
import { conversations, messages, settings } from './db/schema'

const app = new Hono()
app.use('*', cors())

function getApiKey(): string | undefined {
  const row = db.select().from(settings).where(eq(settings.key, 'apiKey')).get()
  return row?.value || undefined
}

function maskKey(key: string): string {
  if (key.length <= 7) return key
  return key.slice(0, 7) + '...' + key.slice(-4)
}

app.get('/api/health', (c) => c.json({ status: 'ok' }))

app.get('/api/settings', (c) => {
  const key = getApiKey()
  return c.json(key ? { hasKey: true, keyPreview: maskKey(key) } : { hasKey: false })
})

app.patch('/api/settings', async (c) => {
  const { apiKey } = await c.req.json()
  if (apiKey) {
    db.insert(settings).values({ key: 'apiKey', value: apiKey })
      .onConflictDoUpdate({ target: settings.key, set: { value: apiKey } })
      .run()
    return c.json({ hasKey: true, keyPreview: maskKey(apiKey) })
  }
  db.delete(settings).where(eq(settings.key, 'apiKey')).run()
  return c.json({ hasKey: false })
})

app.get('/api/conversations', async (c) => {
  const result = db
    .select()
    .from(conversations)
    .orderBy(desc(conversations.updatedAt))
    .all()
  return c.json(result)
})

app.post('/api/conversations', async (c) => {
  const { title } = await c.req.json()
  const now = Date.now()
  const id = uuid()
  db.insert(conversations).values({
    id,
    title: title || 'New conversation',
    createdAt: now,
    updatedAt: now,
  }).run()
  const conv = db.select().from(conversations).where(eq(conversations.id, id)).get()
  return c.json(conv, 201)
})

app.get('/api/conversations/:id', async (c) => {
  const id = c.req.param('id')
  const conv = db.select().from(conversations).where(eq(conversations.id, id)).get()
  if (!conv) return c.json({ error: 'Not found' }, 404)
  const msgs = db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt)
    .all()
  return c.json({ ...conv, messages: msgs })
})

app.patch('/api/conversations/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const updates: Record<string, unknown> = { updatedAt: Date.now() }
  if (body.title !== undefined) updates.title = body.title
  if (body.systemPromptId !== undefined) updates.systemPromptId = body.systemPromptId
  db.update(conversations).set(updates).where(eq(conversations.id, id)).run()
  const conv = db.select().from(conversations).where(eq(conversations.id, id)).get()
  return c.json(conv)
})

app.delete('/api/conversations/:id', async (c) => {
  const id = c.req.param('id')
  db.delete(messages).where(eq(messages.conversationId, id)).run()
  db.delete(conversations).where(eq(conversations.id, id)).run()
  return c.json({ ok: true })
})

app.post('/api/chat', async (c) => {
  const { conversationId, messages: chatMessages, model } = await c.req.json()
  const apiKey = getApiKey()

  if (!apiKey) return c.json({ error: 'No API key configured. Set one in Settings.' }, 400)

  const userContent = chatMessages[chatMessages.length - 1]?.content || ''

  const userMsgId = uuid()
  db.insert(messages).values({
    id: userMsgId,
    conversationId,
    role: 'user',
    content: userContent,
    model,
    createdAt: Date.now(),
  }).run()

  const assistantId = uuid()
  db.insert(messages).values({
    id: assistantId,
    conversationId,
    role: 'assistant',
    content: '',
    model,
    createdAt: Date.now(),
  }).run()

  db.update(conversations)
    .set({ updatedAt: Date.now() })
    .where(eq(conversations.id, conversationId))
    .run()

  return stream(c, async (s) => {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'Ember',
        },
        body: JSON.stringify({
          model,
          messages: chatMessages,
          stream: true,
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        await s.write(`data: ${JSON.stringify({ error: errText })}\n\n`)
        return
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
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
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              fullContent += delta
              await s.write(`data: ${JSON.stringify({ content: delta, done: false })}\n\n`)
            }
          } catch {
            // skip unparseable chunks
          }
        }
      }

      db.update(messages).set({ content: fullContent }).where(eq(messages.id, assistantId)).run()

      await s.write(`data: ${JSON.stringify({ content: '', done: true })}\n\n`)
    } catch (err) {
      await s.write(
        `data: ${JSON.stringify({ error: err instanceof Error ? err.message : 'Stream failed' })}\n\n`,
      )
    }
  })
})

app.get('/api/models', async (c) => {
  const apiKey = getApiKey()

  if (!apiKey) return c.json({ error: 'No API key configured. Set one in Settings.' }, 400)

  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'Ember',
    },
  })

  const data = await response.json()
  return c.json(data)
})

const port = 3001
console.log(`Server running on port ${port}`)
serve({ fetch: app.fetch, port })
