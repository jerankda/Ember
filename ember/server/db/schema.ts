import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
})

export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  systemPromptId: text('system_prompt_id'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
})

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => conversations.id),
  role: text('role').notNull(),
  content: text('content').notNull(),
  model: text('model'),
  tokenCount: integer('token_count'),
  createdAt: integer('created_at').notNull(),
})

export const systemPrompts = sqliteTable('system_prompts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  content: text('content').notNull(),
  isDefault: integer('is_default').notNull().default(0),
  createdAt: integer('created_at').notNull(),
})

export const attachments = sqliteTable('attachments', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  filename: text('filename').notNull(),
  filepath: text('filepath').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
})