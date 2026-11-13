import { describe, expect, it } from 'vitest'

import type { FeishuBlock } from './client'
import {
  blocksToMarkdown,
  convertFeishuMarkdown,
  descriptionFromMarkdown,
  extractImageTokens,
  sanitizeMarkdown,
  stripLeadingTitle,
} from './convert'

function context(overrides: Partial<Parameters<typeof convertFeishuMarkdown>[1]> = {}) {
  return {
    title: 'Getting started',
    slug: 'getting-started',
    route: '/docs/getting-started',
    linkMap: new Map<string, string>(),
    imageMap: new Map<string, string>(),
    warnings: [],
    errors: [],
    ...overrides,
  }
}

describe('Feishu markdown conversion', () => {
  it('strips the duplicated document title', () => {
    expect(stripLeadingTitle('# Getting started\n\nBody', 'Getting started')).toBe('Body')
    expect(stripLeadingTitle('Body', 'Getting started')).toBe('Body')
  })

  it('rewrites wiki links and downloaded images', () => {
    const ctx = context({
      linkMap: new Map([['wikcnABC', '/docs/installation']]),
      imageMap: new Map([['img123', '/feishu/zh-cn/getting-started/img123.webp']]),
    })

    const result = convertFeishuMarkdown(
      [
        '# Getting started',
        '',
        'Read the [installation](https://axlmc.org/wiki/wikcnABC) guide.',
        '',
        '![shot](https://open.feishu.cn/open-apis/drive/v1/medias/img123/download)',
      ].join('\n'),
      ctx,
    )

    expect(result).toContain('[installation](/docs/installation)')
    expect(result).toContain('![shot](/feishu/zh-cn/getting-started/img123.webp)')
    expect(ctx.warnings).toEqual([])
  })

  it('warns about remote Feishu images without a local copy', () => {
    const ctx = context()
    convertFeishuMarkdown('![x](https://open.feishu.cn/open-apis/drive/v1/medias/missing/download)', ctx)
    expect(ctx.warnings[0]).toMatch(/no downloaded local copy/i)
  })

  it('removes executable HTML but keeps safe markup', () => {
    expect(sanitizeMarkdown('<script>alert(1)</script>\n\n**ok** <span>text</span>')).toBe('**ok** <span>text</span>')
    expect(sanitizeMarkdown('<a href="javascript:alert(1)">x</a>')).not.toContain('javascript:')
  })

  it('uses the first paragraph as a description', () => {
    expect(descriptionFromMarkdown('# Title\n\nFirst **paragraph** with [link](/docs).\n\nSecond.')).toBe(
      'First paragraph with link.',
    )
  })
})

describe('Feishu blocks fallback', () => {
  it('converts headings, lists, code and callouts', () => {
    const blocks: FeishuBlock[] = [
      { block_id: 'page', block_type: 1, page: { elements: [] }, children: ['h', 'p', 'ul', 'code'] },
      {
        block_id: 'h',
        parent_id: 'page',
        block_type: 4,
        heading2: { elements: [{ text_run: { content: 'Install' } }] },
      },
      {
        block_id: 'p',
        parent_id: 'page',
        block_type: 2,
        text: {
          elements: [
            { text_run: { content: 'Hello ' } },
            { text_run: { content: 'world', text_element_style: { bold: true } } },
          ],
        },
      },
      { block_id: 'ul', parent_id: 'page', block_type: 12, bullet: { elements: [{ text_run: { content: 'One' } }] } },
      {
        block_id: 'code',
        parent_id: 'page',
        block_type: 14,
        code: { style: { language: 22 }, elements: [{ text_run: { content: 'npm i' } }] },
      },
    ]

    const result = blocksToMarkdown(blocks, context())
    expect(result).toContain('## Install')
    expect(result).toContain('Hello **world**')
    expect(result).toContain('- One')
    expect(result).toContain('```')
    expect(result).toContain('npm i')
  })

  it('collects image tokens from image blocks and inline elements', () => {
    const blocks: FeishuBlock[] = [
      { block_id: 'a', block_type: 27, image: { token: 'imgA' } },
      { block_id: 'b', block_type: 2, text: { elements: [{ image: { token: 'imgB' } }] } },
    ]
    expect(extractImageTokens(blocks).sort()).toEqual(['imgA', 'imgB'])
  })
})
