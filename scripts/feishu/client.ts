import { setTimeout as sleep } from 'node:timers/promises'

const DEFAULT_BASE_URL = 'https://open.feishu.cn'
const TOKEN_SAFETY_WINDOW_MS = 60_000

interface TokenResponse {
  code: number
  msg?: string
  tenant_access_token?: string
  expire?: number
}

interface ApiResponse<T> {
  code: number
  msg?: string
  data?: T
}

interface WikiNode {
  node_token: string
  obj_token: string
  obj_type: string
  title: string
  parent_node_token?: string
  obj_edit_time?: string
}

interface WikiNodeData {
  node: WikiNode
}

interface DocContentData {
  content: string
  title?: string
}

interface BlockListData {
  items: FeishuBlock[]
  has_more: boolean
  page_token?: string
}

export interface FeishuBlock {
  block_id: string
  block_type: number
  parent_id?: string
  children?: string[]
  page?: { elements?: FeishuElement[] }
  text?: { elements?: FeishuElement[]; style?: Record<string, unknown> }
  heading1?: { elements?: FeishuElement[] }
  heading2?: { elements?: FeishuElement[] }
  heading3?: { elements?: FeishuElement[] }
  heading4?: { elements?: FeishuElement[] }
  heading5?: { elements?: FeishuElement[] }
  heading6?: { elements?: FeishuElement[] }
  bullet?: { elements?: FeishuElement[] }
  ordered?: { elements?: FeishuElement[] }
  code?: { elements?: FeishuElement[]; style?: { language?: string } }
  quote?: { elements?: FeishuElement[] }
  todo?: { elements?: FeishuElement[]; style?: { done?: boolean } }
  callout?: { elements?: FeishuElement[]; background_color?: number; emoji_id?: string }
  divider?: Record<string, never>
  image?: { token?: string; width?: number; height?: number; caption?: { elements?: FeishuElement[] } }
  table?: { cells?: string[]; property?: { row_size?: number; column_size?: number } }
  table_cell?: Record<string, unknown>
  grid?: { column_size?: number }
  grid_column?: Record<string, unknown>
  quote_container?: Record<string, unknown>
  file?: { token?: string; name?: string }
  iframe?: { component?: { url?: string } }
  [key: string]: unknown
}

export interface FeishuElement {
  text_run?: {
    content: string
    text_element_style?: {
      bold?: boolean
      italic?: boolean
      strikethrough?: boolean
      underline?: boolean
      inline_code?: boolean
      link?: { url?: string }
    }
  }
  mention_doc?: { token?: string; obj_type?: number; title?: string; url?: string }
  mention_user?: { user_id?: string; name?: string }
  equation?: { content?: string }
  reminder?: { create_user_id?: string; is_notify?: boolean; is_whole_day?: boolean; expire_time?: string }
  file?: { token?: string; name?: string }
  image?: { token?: string }
}

export interface FeishuClientOptions {
  appId: string
  appSecret: string
  baseUrl?: string
  timeoutMs?: number
  retries?: number
  fetchImpl?: typeof fetch
}

export class FeishuError extends Error {
  readonly code: number
  readonly status?: number

  constructor(message: string, code = -1, status?: number) {
    super(message)
    this.name = 'FeishuError'
    this.code = code
    this.status = status
  }
}

export class FeishuClient {
  private readonly appId: string
  private readonly appSecret: string
  private readonly baseUrl: string
  private readonly timeoutMs: number
  private readonly retries: number
  private readonly fetchImpl: typeof fetch
  private token?: { value: string; expiresAt: number }

  constructor(options: FeishuClientOptions) {
    this.appId = options.appId
    this.appSecret = options.appSecret
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '')
    this.timeoutMs = options.timeoutMs ?? 30_000
    this.retries = options.retries ?? 3
    this.fetchImpl = options.fetchImpl ?? fetch
  }

  async getTenantToken(): Promise<string> {
    if (this.token && this.token.expiresAt > Date.now()) return this.token.value

    const response = await this.fetchImpl(`${this.baseUrl}/open-apis/auth/v3/tenant_access_token/internal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ app_id: this.appId, app_secret: this.appSecret }),
      signal: AbortSignal.timeout(this.timeoutMs),
    })
    const payload = (await response.json()) as TokenResponse
    if (!response.ok || payload.code !== 0 || !payload.tenant_access_token) {
      throw new FeishuError(
        `Unable to obtain a tenant access token: ${payload.msg ?? response.statusText}`,
        payload.code,
        response.status,
      )
    }

    const ttl = Math.max(0, (payload.expire ?? 7200) * 1000 - TOKEN_SAFETY_WINDOW_MS)
    this.token = { value: payload.tenant_access_token, expiresAt: Date.now() + ttl }
    return this.token.value
  }

  async getWikiNode(nodeToken: string): Promise<WikiNode> {
    const data = await this.request<WikiNodeData>('/open-apis/wiki/v2/spaces/get_node', {
      token: nodeToken,
      obj_type: 'wiki',
    })
    if (!data.node) throw new FeishuError(`Wiki node ${nodeToken} returned no node`)
    return data.node
  }

  async getDocMarkdown(documentId: string): Promise<DocContentData> {
    return this.request<DocContentData>('/open-apis/docs/v1/content', {
      doc_token: documentId,
      doc_type: 'docx',
      content_type: 'markdown',
    })
  }

  async listBlocks(documentId: string): Promise<FeishuBlock[]> {
    const blocks: FeishuBlock[] = []
    let pageToken: string | undefined
    for (let page = 0; page < 40; page += 1) {
      const data = await this.request<BlockListData>(
        `/open-apis/docx/v1/documents/${encodeURIComponent(documentId)}/blocks`,
        {
          page_size: '500',
          ...(pageToken ? { page_token: pageToken } : {}),
        },
      )
      blocks.push(...(data.items ?? []))
      if (!data.has_more || !data.page_token) break
      pageToken = data.page_token
    }
    return blocks
  }

  async downloadMedia(fileToken: string): Promise<{ buffer: Buffer; contentType: string }> {
    const response = await this.authorizedFetch(`/open-apis/drive/v1/medias/${encodeURIComponent(fileToken)}/download`)
    const contentType = response.headers.get('content-type') ?? 'application/octet-stream'
    if (contentType.includes('application/json')) {
      const payload = (await response.json()) as ApiResponse<unknown>
      throw new FeishuError(
        `Unable to download media ${fileToken}: ${payload.msg ?? 'unknown error'}`,
        payload.code,
        response.status,
      )
    }
    return { buffer: Buffer.from(await response.arrayBuffer()), contentType }
  }

  private async request<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const response = await this.authorizedFetch(path, params)
    const payload = (await response.json()) as ApiResponse<T>
    if (payload.code !== 0) {
      throw new FeishuError(
        `Feishu API ${path} failed: ${payload.msg ?? 'unknown error'}`,
        payload.code,
        response.status,
      )
    }
    return payload.data as T
  }

  private async authorizedFetch(path: string, params: Record<string, string> = {}): Promise<Response> {
    const url = new URL(`${this.baseUrl}${path}`)
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)

    let lastError: unknown
    for (let attempt = 0; attempt <= this.retries; attempt += 1) {
      const token = await this.getTenantToken()
      try {
        const response = await this.fetchImpl(url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(this.timeoutMs),
        })
        if (response.status === 429 || response.status >= 500) {
          lastError = new FeishuError(`Feishu API ${path} responded ${response.status}`, -1, response.status)
          await this.backoff(attempt, response.headers.get('retry-after'))
          continue
        }
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as ApiResponse<unknown>
          throw new FeishuError(
            `Feishu API ${path} failed: ${payload.msg ?? response.statusText}`,
            payload.code ?? -1,
            response.status,
          )
        }
        return response
      } catch (error) {
        lastError = error
        if (error instanceof FeishuError && error.status && error.status < 500 && error.status !== 429) throw error
        if (attempt === this.retries) break
        await this.backoff(attempt)
      }
    }
    throw lastError instanceof Error ? lastError : new FeishuError(`Feishu API ${path} failed`)
  }

  private async backoff(attempt: number, retryAfter?: string | null) {
    const seconds = retryAfter ? Number(retryAfter) : 0
    const delay = Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : Math.min(8_000, 400 * 2 ** attempt)
    await sleep(delay + Math.random() * 150)
  }
}
