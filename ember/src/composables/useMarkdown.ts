import { createHighlighter } from 'shiki'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
})

type Highlighter = Awaited<ReturnType<typeof createHighlighter>>
let highlighter: Highlighter | null = null
let initPromise: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  if (highlighter) return Promise.resolve(highlighter)
  if (!initPromise) {
    initPromise = createHighlighter({
      themes: ['gruvbox-dark-soft'],
      langs: [
        'javascript', 'typescript', 'python', 'bash', 'json',
        'html', 'css', 'sql', 'yaml', 'markdown', 'tsx', 'vue',
        'shell', 'rust', 'go', 'java', 'c', 'cpp', 'ruby',
        'php', 'swift', 'kotlin', 'lua', 'text',
      ],
    }).then((h) => {
      highlighter = h
      return h
    })
  }
  return initPromise
}

function decodeHTML(str: string): string {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

export function useMarkdown() {
  async function renderMarkdown(content: string): Promise<string> {
    const html = md.render(content)

    if (!html.includes('<pre><code')) return html

    try {
      const h = await getHighlighter()

      return html.replace(
        /<pre><code class="language-(\w*)">([\s\S]*?)<\/code><\/pre>/g,
        (_full: string, lang: string, code: string) => {
          const decoded = decodeHTML(code)
          try {
            return h.codeToHtml(decoded, {
              lang: lang || 'text',
              theme: 'gruvbox-dark-soft',
            })
          } catch {
            return _full
          }
        },
      )
    } catch {
      return html
    }
  }

  return { renderMarkdown }
}
