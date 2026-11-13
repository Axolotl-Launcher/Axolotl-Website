import type { FeishuBlock, FeishuElement } from './client'

export interface FeishuConvertContext {
  title: string
  slug: string
  route: string
  linkMap: Map<string, string>
  imageMap: Map<string, string>
  warnings: string[]
  errors: string[]
}

const FEISHU_URL_PATTERN = /https?:\/\/[^\s)<>"']+/g
const MARKDOWN_IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
const HTML_IMAGE_PATTERN = /<img\b[^>]*\bsrc=(["'])(.*?)\1[^>]*>/gi
const MEDIA_TOKEN_PATTERN = /\/medias\/([A-Za-z0-9_-]+)\/download/

const BLOCK_KEYS = [
  'page',
  'text',
  'heading1',
  'heading2',
  'heading3',
  'heading4',
  'heading5',
  'heading6',
  'bullet',
  'ordered',
  'code',
  'quote',
  'todo',
  'callout',
  'divider',
  'image',
  'table',
  'table_cell',
  'grid',
  'grid_column',
  'quote_container',
  'file',
  'iframe',
] as const

export function extractImageTokens(blocks: FeishuBlock[]): string[] {
  const tokens = new Set<string>()
  for (const block of blocks) {
    if (block.image?.token) tokens.add(block.image.token)
    for (const element of block.text?.elements ?? []) {
      if (element.image?.token) tokens.add(element.image.token)
    }
  }
  return [...tokens]
}

export function findImageToken(url: string, knownTokens: Iterable<string>): string | undefined {
  const mediaMatch = url.match(MEDIA_TOKEN_PATTERN)
  if (mediaMatch?.[1]) return mediaMatch[1]
  for (const token of knownTokens) {
    if (token && url.includes(token)) return token
  }
  return undefined
}

export function convertFeishuMarkdown(raw: string, context: FeishuConvertContext): string {
  let markdown = raw.replace(/\r\n?/g, '\n').trim()
  markdown = stripLeadingTitle(markdown, context.title)

  const knownImageTokens = [...context.imageMap.keys()]
  markdown = markdown.replace(MARKDOWN_IMAGE_PATTERN, (match, alt: string, url: string) => {
    const token = findImageToken(url, knownImageTokens)
    if (!token) {
      if (url.includes('feishu.cn') || url.includes('larksuite.com')) {
        context.warnings.push(`Image ${url} has no downloaded local copy`)
      }
      return match
    }
    const local = context.imageMap.get(token)
    if (!local) {
      context.warnings.push(`Image ${url} has no downloaded local copy`)
      return match
    }
    return `![${alt}](${local})`
  })

  markdown = markdown.replace(HTML_IMAGE_PATTERN, (match, quote: string, url: string) => {
    const token = findImageToken(url, knownImageTokens)
    const local = token ? context.imageMap.get(token) : undefined
    if (!local) return match
    return `<img src=${quote}${local}${quote} alt="" />`
  })

  markdown = markdown.replace(FEISHU_URL_PATTERN, (url) => {
    const token = findFeishuToken(url)
    if (!token) return url
    return context.linkMap.get(token) ?? url
  })

  return sanitizeMarkdown(markdown)
}

export function blocksToMarkdown(blocks: FeishuBlock[], context: FeishuConvertContext): string {
  const byId = new Map(blocks.map((block) => [block.block_id, block]))
  const childrenByParent = new Map<string, string[]>()
  for (const block of blocks) {
    if (!block.parent_id) continue
    const children = childrenByParent.get(block.parent_id) ?? []
    children.push(block.block_id)
    childrenByParent.set(block.parent_id, children)
  }

  const render = (ids: string[] | undefined, depth = 0): string => {
    if (!ids?.length) return ''
    return ids
      .map((id) => {
        const block = byId.get(id)
        if (!block) return ''
        return renderBlock(block, depth)
      })
      .filter(Boolean)
      .join('\n\n')
  }

  const renderChildren = (block: FeishuBlock, depth = 0): string => {
    const ids = block.children?.length ? block.children : childrenByParent.get(block.block_id)
    return render(ids, depth)
  }

  const renderBlock = (block: FeishuBlock, depth: number): string => {
    const key = BLOCK_KEYS.find((candidate) => block[candidate] !== undefined)
    const indent = '  '.repeat(depth)
    const inline = (container?: { elements?: FeishuElement[] }) => renderElements(container?.elements, context)

    switch (key) {
      case 'page':
        return renderChildren(block)
      case 'text':
        return `${inline(block.text)}\n\n${renderChildren(block, depth)}`
      case 'heading1':
      case 'heading2':
      case 'heading3':
      case 'heading4':
      case 'heading5':
      case 'heading6': {
        const level = Number(key.slice(-1))
        return `${'#'.repeat(level)} ${inline(block[key])}`
      }
      case 'bullet':
        return `${indent}- ${inline(block.bullet)}${renderNested(block, depth + 1)}`
      case 'ordered':
        return `${indent}1. ${inline(block.ordered)}${renderNested(block, depth + 1)}`
      case 'todo':
        return `${indent}- [${block.todo?.style?.done ? 'x' : ' '}] ${inline(block.todo)}${renderNested(block, depth + 1)}`
      case 'code': {
        const language = normalizeLanguage(block.code?.style?.language)
        const code = (block.code?.elements ?? []).map((element) => element.text_run?.content ?? '').join('')
        return `\`\`\`${language}\n${code.replace(/\n$/, '')}\n\`\`\``
      }
      case 'quote':
        return prefixLines(inline(block.quote), '> ')
      case 'quote_container':
        return prefixLines(renderChildren(block), '> ')
      case 'callout':
        return prefixLines(`${inline(block.callout)}\n\n${renderChildren(block, depth)}`.trim(), '> ')
      case 'divider':
        return '---'
      case 'image': {
        const token = block.image?.token
        const local = token ? context.imageMap.get(token) : undefined
        const caption = inline(block.image?.caption)
        if (!local) {
          context.warnings.push(`Image block ${block.block_id} was not downloaded`)
          return caption
        }
        return `![${caption || 'Axolotl docs image'}](${local})`
      }
      case 'table':
        return renderTable(block, depth)
      case 'grid':
      case 'grid_column':
        return renderChildren(block, depth)
      case 'file':
        return block.file?.name ? `**${block.file.name}**` : ''
      case 'iframe':
        return block.iframe?.component?.url ? `[${block.iframe.component.url}](${block.iframe.component.url})` : ''
      default: {
        const type = block.block_type
        context.warnings.push(`Unsupported Feishu block type ${type} in ${context.slug}`)
        return ''
      }
    }
  }

  const renderNested = (block: FeishuBlock, depth: number): string => {
    const children = renderChildren(block, depth)
    return children ? `\n${children}` : ''
  }

  const renderTable = (block: FeishuBlock, depth: number): string => {
    const cells = block.table?.cells ?? []
    const columns = block.table?.property?.column_size ?? 1
    const rows = block.table?.property?.row_size ?? Math.ceil(cells.length / columns)
    if (!cells.length || columns < 1) {
      context.warnings.push(`Table ${block.block_id} has no cells`)
      return ''
    }
    const rowsText: string[][] = []
    for (let row = 0; row < rows; row += 1) {
      const values: string[] = []
      for (let column = 0; column < columns; column += 1) {
        const cellId = cells[row * columns + column]
        const cell = cellId ? byId.get(cellId) : undefined
        const value = cell ? renderChildren(cell, depth) : ''
        values.push(value.replace(/\n+/g, '<br>').replace(/\|/g, '\\|'))
      }
      rowsText.push(values)
    }
    const header = rowsText[0] ?? []
    const separator = header.map(() => '---')
    return [header, separator, ...rowsText.slice(1)].map((row) => `| ${row.join(' | ')} |`).join('\n')
  }

  const page = blocks.find((block) => block.page)
  const roots = page?.children?.length
    ? page.children
    : blocks.filter((block) => !block.parent_id).map((block) => block.block_id)
  return sanitizeMarkdown(render(roots))
}

function renderElements(elements: FeishuElement[] | undefined, context: FeishuConvertContext): string {
  if (!elements?.length) return ''
  return elements
    .map((element) => {
      if (element.text_run) {
        let text = element.text_run.content ?? ''
        const style = element.text_run.text_element_style ?? {}
        if (style.inline_code) text = `\`${text}\``
        if (style.bold) text = `**${text}**`
        if (style.italic) text = `*${text}*`
        if (style.strikethrough) text = `~~${text}~~`
        if (style.underline) text = `<u>${text}</u>`
        if (style.link?.url) text = `[${text}](${style.link.url})`
        return text
      }
      if (element.mention_doc) {
        const token = element.mention_doc.token ?? ''
        const route = context.linkMap.get(token)
        const label = element.mention_doc.title ?? '文档'
        const href = route ?? element.mention_doc.url ?? ''
        return href ? `[${label}](${href})` : label
      }
      if (element.equation) return `$${element.equation.content ?? ''}$`
      if (element.mention_user) return `@${element.mention_user.name ?? element.mention_user.user_id ?? 'user'}`
      if (element.image?.token) {
        const local = context.imageMap.get(element.image.token)
        return local ? `![image](${local})` : ''
      }
      return ''
    })
    .join('')
}

function normalizeLanguage(language: string | number | undefined): string {
  if (!language) return ''
  if (typeof language === 'number') return ''
  const normalized = language.toLowerCase()
  const aliases: Record<string, string> = {
    plaintext: 'text',
    plain: 'text',
    shell: 'bash',
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    yml: 'yaml',
  }
  return aliases[normalized] ?? normalized
}

function prefixLines(text: string, prefix: string): string {
  return text
    .split('\n')
    .map((line) => `${prefix}${line}`)
    .join('\n')
}

function findFeishuToken(url: string): string | undefined {
  try {
    const parsed = new URL(url)
    const segments = parsed.pathname.split('/').filter(Boolean)
    const marker = segments.findIndex((segment) => segment === 'wiki' || segment === 'docx' || segment === 'docs')
    if (marker >= 0 && segments[marker + 1]) return segments[marker + 1]
  } catch {
    return undefined
  }
  return undefined
}

export function stripLeadingTitle(markdown: string, title: string): string {
  const normalizedTitle = title.trim().toLowerCase()
  return markdown
    .replace(/^\s*#\s+(.+?)\s*$/m, (match, heading: string) =>
      heading.trim().toLowerCase() === normalizedTitle ? '' : match,
    )
    .trim()
}

export function sanitizeMarkdown(markdown: string): string {
  return markdown
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<(object|embed|form|meta|link)\b[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1="#"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function descriptionFromMarkdown(markdown: string): string {
  const paragraph = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^\s{0,3}#{1,6}\s+.*$/gm, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|-]/g, ' ')
    .split(/\n\s*\n/)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .find((part) => part.length > 0)
  return (paragraph ?? '').slice(0, 160)
}
