# Ember

> **IMPORTANT: Workflow Rules**
> - After completing each checkbox item, mark it `[x]` in this plan file
> - Commit and push to GitHub after every step — keep commits small and atomic
> - This plan is the source of truth; read it at the start of every session to pick up where you left off

A local, polished AI chat UI for OpenRouter — dark Claude-inspired design, built with Vue + Hono + SQLite.

---

## Design System — Dark Claude-Inspired

Dark, minimal, and quiet. Serif typography, low-contrast surfaces, amber accents.

### Fonts

| Font | Usage |
|---|---|
| Lora | Body, UI, headings |
| JetBrains Mono | Code blocks, message metadata |

### Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#141414` | Page background |
| `--surface` | `#1C1C1C` | Cards, modals, elevated surfaces |
| `--bg-muted` | `#101010` | Sidebar, deepest background |
| `--text` | `#E8E6E3` | Primary text (warm off-white) |
| `--text-muted` | `#7A7A7A` | Secondary text, timestamps, hints |
| `--accent` | `#D97706` | Amber — primary actions, links, focus states |
| `--accent-soft` | `#352208` | Dark amber — badges, subtle highlights |
| `--border` | `#2A2A2A` | Dividers, input borders |
| `--danger` | `#EF4444` | Error states, destructive actions |

### Details

- **Cinematic message entrance** — messages fade in with a slight upward drift (0.3s ease-out)
- **Dramatic empty states** — large italic serif typography with generous whitespace
- **Model badges** — subtle pill badges with `--accent-soft` background, mono font
- **No grain, no gradients** — clean and quiet, surfaces distinguished by subtle brightness shifts only

### Layout

- **Sidebar** (~260px, collapsible) — conversation list, system prompt selector, settings
- **Main area** — centered chat column (~720px max-width), generous vertical padding
- **Input area** — full-width textarea with attachment tray, model selector dropdown, send button
- **No chrome waste** — minimal borders, no shadows, depth through background color shifts only

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Vite + Vue 3 (Composition API, `<script setup>`) + TypeScript | Fast DX, lightweight SPA |
| State | Pinia | Official Vue state management |
| Routing | Vue Router 4 | SPA navigation |
| Styling | Tailwind CSS 4 + custom design tokens | Rapid styling, consistent design system |
| Backend | Hono.js (TypeScript) | Tiny, fast, excellent TS, runs on Node |
| Database | better-sqlite3 + Drizzle ORM | File-based, type-safe, zero config |
| Markdown | markdown-it + Shiki | Rich rendering + syntax highlighting |
| Fonts | Geist Sans + Geist Mono | Modern, warm, distinctive |
| Streaming | Server-Sent Events (SSE) | Native browser streaming, no WebSocket complexity |
| Dev | concurrently | Runs frontend + backend in one terminal |

---

## Project Structure

```
ember/
├── server/                          # Hono backend (port 3001)
│   ├── index.ts                      # Entry point, CORS, routes
│   ├── routes/
│   │   ├── chat.ts                   # OpenRouter proxy + SSE streaming
│   │   ├── conversations.ts          # CRUD conversations + messages
│   │   ├── system-prompts.ts         # CRUD system prompt presets
│   │   ├── attachments.ts            # File upload + serve
│   │   └── models.ts                # Proxy OpenRouter model list
│   └── db/
│       ├── schema.ts                 # Drizzle table definitions
│       ├── index.ts                  # Connection, migrations
│       └── migrations/               # Drizzle-generated SQL migrations
│
├── src/                              # Vue frontend
│   ├── App.vue
│   ├── main.ts
│   ├── router/
│   │   └── index.ts                  # Routes: /, /settings, /c/:id
│   ├── stores/
│   │   ├── chat.ts                   # Active chat state, streaming
│   │   ├── conversations.ts          # Conversation list, CRUD
│   │   ├── models.ts                 # Available OpenRouter models
│   │   └── settings.ts              # API key, preferences
│   ├── composables/
│   │   ├── useStreaming.ts           # SSE connection management
│   │   ├── useChat.ts                # Send message, handle response
│   │   ├── useMarkdown.ts           # Render markdown with Shiki
│   │   └── useFileUpload.ts          # Attachment handling
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.vue          # Main layout wrapper
│   │   │   ├── Sidebar.vue           # Conversation list + nav
│   │   │   └── Header.vue            # Model selector + actions
│   │   ├── chat/
│   │   │   ├── ChatView.vue          # Message list container
│   │   │   ├── ChatMessage.vue       # Single message (markdown rendered)
│   │   │   ├── ChatInput.vue         # Textarea + controls
│   │   │   ├── ModelSelector.vue     # Dropdown model picker
│   │   │   └── StreamingIndicator.vue
│   │   ├── system-prompts/
│   │   │   ├── PromptSelector.vue    # Dropdown in sidebar
│   │   │   └── PromptEditor.vue      # Create/edit prompt modal
│   │   ├── attachments/
│   │   │   ├── FileUpload.vue        # Upload button + drag zone
│   │   │   ├── AttachmentPreview.vue # Thumbnail in input area
│   │   │   └── ImagePreview.vue      # Inline image in message
│   │   └── common/
│   │       ├── Button.vue
│   │       ├── Modal.vue
│   │       ├── Dropdown.vue
│   │       ├── Toast.vue
│   │       └── EmptyState.vue
│   ├── views/
│   │   ├── ChatPage.vue              # Main chat view
│   │   └── SettingsPage.vue          # API key, theme prefs
│   └── styles/
│       ├── main.css                  # Tailwind + tokens + grain
│       ├── fonts.css                 # Geist font-face declarations
│       └── animations.css           # Message entrance, ambient gradient
│
├── data/                             # SQLite file + uploads (gitignored)
│   ├── ember.db                      # SQLite database
│   └── uploads/                      # Uploaded files
│
├── index.html
├── vite.config.ts                    # Proxy /api to Hono
├── tsconfig.json
├── tailwind.config.ts
├── drizzle.config.ts
├── package.json
└── .gitignore
```

---

## Database Schema

### `conversations`

| Column | Type | Notes |
|---|---|---|
| id | TEXT (uuid) | Primary key |
| title | TEXT | Auto-generated from first message |
| system_prompt_id | TEXT | FK → system_prompts, nullable |
| created_at | INTEGER | Unix timestamp |
| updated_at | INTEGER | Unix timestamp |

### `messages`

| Column | Type | Notes |
|---|---|---|
| id | TEXT (uuid) | Primary key |
| conversation_id | TEXT | FK → conversations |
| role | TEXT | `user`, `assistant`, `system` |
| content | TEXT | Markdown content |
| model | TEXT | OpenRouter model ID (e.g. `anthropic/claude-sonnet-4`) |
| token_count | INTEGER | Nullable, estimated |
| created_at | INTEGER | Unix timestamp |

### `system_prompts`

| Column | Type | Notes |
|---|---|---|
| id | TEXT (uuid) | Primary key |
| name | TEXT | Display name |
| content | TEXT | Full system prompt text |
| is_default | INTEGER | 0 or 1 — auto-applied to new conversations |
| created_at | INTEGER | Unix timestamp |

### `attachments`

| Column | Type | Notes |
|---|---|---|
| id | TEXT (uuid) | Primary key |
| message_id | TEXT | FK → messages |
| filename | TEXT | Original filename |
| filepath | TEXT | Path in data/uploads/ |
| mime_type | TEXT | image/png, application/pdf, etc. |
| size | INTEGER | Bytes |

---

## API Routes

All routes prefixed with `/api/`. Vite dev server proxies `/api` → `localhost:3001`.

### Chat

| Method | Route | Description |
|---|---|---|
| POST | `/api/chat` | Send messages to OpenRouter, streams response via SSE |
| GET | `/api/models` | List available OpenRouter models (cached) |

### Conversations

| Method | Route | Description |
|---|---|---|
| GET | `/api/conversations` | List all (ordered by updated_at desc) |
| POST | `/api/conversations` | Create new conversation |
| GET | `/api/conversations/:id` | Get conversation with messages |
| PATCH | `/api/conversations/:id` | Update title or system prompt |
| DELETE | `/api/conversations/:id` | Delete conversation + messages |

### System Prompts

| Method | Route | Description |
|---|---|---|
| GET | `/api/system-prompts` | List all |
| POST | `/api/system-prompts` | Create |
| PATCH | `/api/system-prompts/:id` | Update |
| DELETE | `/api/system-prompts/:id` | Delete |

### Attachments

| Method | Route | Description |
|---|---|---|
| POST | `/api/attachments` | Upload file (multipart) |
| GET | `/api/attachments/:id` | Serve file |
| DELETE | `/api/attachments/:id` | Delete file |

### Settings

| Method | Route | Description |
|---|---|---|
| GET | `/api/settings` | Get stored preferences |
| PATCH | `/api/settings` | Update preferences |

---

## Streaming Flow

1. User sends message → `POST /api/chat` with `{ conversationId, messages, model, attachments }`
2. Server creates assistant message row (empty content)
3. Server opens SSE connection to OpenRouter with the full message array
4. Server streams tokens back to client via SSE as `data: { content, done }` events
5. Client composes tokens into message in real-time
6. On `done: true`, server updates message row with full content + token count
7. Client finalizes rendering

---

## V1 Features

### Multi-Model Conversations

- Model selector in the input area (not just in settings)
- Each message stores its `model` field
- Switch models freely between messages in the same conversation
- Model badge rendered on each assistant message
- Conversation context sent to whichever model is currently selected

### File Attachments

- Upload via button or drag-and-drop on the input area
- Supported: images (png, jpg, gif, webp), PDFs, text files
- Attachment preview thumbnails in the input tray before sending
- Images displayed inline in messages
- Non-image files shown as download links
- Images sent to OpenRouter as base64 in the messages array (vision model support)
- PDFs and text files converted to text and included in the prompt

### System Prompt Presets

- Create named system prompts in the sidebar
- One can be marked as default (auto-applied to new conversations)
- Change system prompt on a per-conversation basis
- Quick-select dropdown in the sidebar or input area
- Full editor with textarea and save/cancel

---

## Build Phases

### Phase 1 — Foundation

- [x] Scaffold Vite + Vue + TypeScript project
- [x] Set up Hono backend with basic route structure
- [x] Configure better-sqlite3 + Drizzle, run migrations
- [x] Implement design tokens in Tailwind config
- [x] Add Geist Sans + Geist Mono fonts
- [x] Build AppShell layout (sidebar + main area)
- [x] Set up Vite proxy to Hono
- [x] Settings page: store/retrieve OpenRouter API key

### Phase 2 — Core Chat

- [x] OpenRouter proxy route with SSE streaming
- [x] ChatInput component (textarea, send button)
- [x] ChatMessage component (markdown rendering via markdown-it)
- [x] Shiki syntax highlighting with custom warm theme
- [x] ChatView component (message list, auto-scroll)
- [x] Conversation CRUD routes + sidebar list
- [x] Auto-generate conversation title from first message
- [x] useStreaming composable (SSE parsing, token accumulation)
- [x] StreamingIndicator component

### Phase 3 — Features

- [ ] System prompt CRUD + PromptSelector dropdown + PromptEditor modal
- [ ] File upload route + FileUpload component (drag-and-drop)
- [ ] AttachmentPreview in input tray
- [ ] Image rendering inline in messages
- [ ] PDF/text file → text conversion for prompt inclusion
- [ ] Model selector dropdown (fetched from `/api/models`)
- [ ] Per-message model badge rendering
- [ ] Conversation search (client-side filter)

### Phase 4 — Polish

- [ ] Grain texture CSS overlay on backgrounds
- [ ] Ambient warm gradient animation in chat area
- [ ] Message entrance animation (fade + upward drift)
- [ ] Dramatic empty state components
- [ ] Keyboard shortcuts (Cmd+Enter send, Cmd+N new chat, Cmd+K search)
- [ ] Error states with graceful retry
- [ ] Loading skeletons for conversation list
- [ ] Responsive layout (sidebar collapses on mobile)
- [ ] Code block copy button
- [ ] Dark mode (optional, phase 4+)

---

## Dev Commands

```bash
# Install
npm install

# Run both frontend + backend
npm run dev

# Build for production
npm run build

# Database
npm run db:generate    # Generate Drizzle migrations
npm run db:migrate     # Run migrations
```

`package.json` scripts use `concurrently` to run Vite and Hono together in one terminal.

---

## Security Notes

- OpenRouter API key stored in SQLite (local only), never sent to the client in plaintext
- API key validated on save by making a test call to OpenRouter
- File uploads size-limited (50MB max)
- No external network access except to OpenRouter API
- All data stays on your machine
