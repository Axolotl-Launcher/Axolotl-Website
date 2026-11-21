import { expect, test } from '@playwright/test'

const releaseFixture = {
  version: '1.11.0',
  release_tag: 'v1.11.0',
  downloads: [
    { filename: 'Axolotl_1.11.0_x64-setup.exe', relative_path: 'dist/1.11.0/Axolotl_1.11.0_x64-setup.exe' },
    {
      filename: 'Axolotl_Launcher_1.11.0_x64_portable.zip',
      relative_path: 'dist/1.11.0/Axolotl_Launcher_1.11.0_x64_portable.zip',
    },
    { filename: 'Axolotl_1.11.0_universal.dmg', relative_path: 'dist/1.11.0/Axolotl_1.11.0_universal.dmg' },
    { filename: 'Axolotl_1.11.0_amd64.AppImage', relative_path: 'dist/1.11.0/Axolotl_1.11.0_amd64.AppImage' },
    { filename: 'Axolotl_1.11.0_amd64.deb', relative_path: 'dist/1.11.0/Axolotl_1.11.0_amd64.deb' },
  ],
}

test.describe('site shell', () => {
  test('serves the landing page and primary routes', async ({ page }) => {
    const routes = [
      '/',
      '/en',
      '/download',
      '/docs',
      '/blog',
      '/changelog',
      '/demo',
      '/support',
      '/blog/privacy',
      '/blog/terms',
    ]
    for (const route of routes) {
      const response = await page.goto(route)
      expect(response?.status(), route).toBe(200)
      await expect(page.locator('main#main')).toBeVisible()
      await expect(page.locator('h1')).toHaveCount(1)
    }
  })

  test('serves no compat aliases', async ({ page }) => {
    for (const route of [
      '/articles',
      '/en/articles',
      '/blog/first-launch/versions',
      '/en/blog/first-launch/versions',
    ]) {
      const response = await page.goto(route)
      expect(response?.status(), route).toBe(404)
    }
  })

  test('applies the saved theme before hydration', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('axolotl-theme', 'dark'))
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(16, 18, 21)')

    await page.locator('button[aria-label^="主题"], button[aria-label^="Theme"]').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'oled')
  })

  test('switches locale without leaving the page family', async ({ page }) => {
    await page.goto('/en')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
    await expect(page.locator('h1')).toContainText('Minecraft')

    await page.locator('a[hreflang="zh-CN"]').first().click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  })

  test('opens the mobile navigation dialog', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.getByRole('button', { name: /菜单|menu/i }).click()
    const dialog = page.locator('dialog[open]')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('link', { name: '下载启动器' })).toBeVisible()
    await page.getByRole('button', { name: /关闭|close/i }).click()
    await expect(dialog).not.toBeVisible()
  })

  test('offers download once in the header, not also as a nav item', async ({ page }) => {
    // The header button and the nav would otherwise sit side by side pointing
    // at the same route.
    await page.goto('/')
    const header = page.locator('header').first()
    const nav = header.getByRole('navigation', { name: '主导航' })
    await expect(nav.getByRole('link', { name: '下载' })).toHaveCount(0)
    await expect(header.getByRole('link', { name: '下载启动器' })).toHaveCount(1)
  })

  test('links community channels from the footer instead of a dock', async ({ page }) => {
    await page.goto('/')
    const community = page.getByRole('navigation', { name: '社区' })
    await expect(community).toBeVisible()
    for (const name of ['QQ 群', 'QQ 频道', 'Discord', '爱发电']) {
      await expect(community.getByRole('link', { name })).toHaveAttribute('href', /^https:\/\//)
    }
    // The floating dock is gone; nothing should stick to the viewport edge.
    await expect(page.locator('.site-utility-dock')).toHaveCount(0)
  })

  test('renders a visible brand glyph and a hover QR for every community link', async ({ page }) => {
    // Brand marks are inline SVG. A mark that renders as a solid block (a broken
    // ring path) or disappears entirely leaves no distinguishable ink, and both
    // regressions look identical to "the icon is missing". Rasterise each mark
    // and measure how much of its box is actually painted.
    await page.goto('/')
    const links = page.getByRole('navigation', { name: '社区' }).getByRole('link')
    await expect(links).toHaveCount(4)

    const coverage = () =>
      links.evaluateAll(async (elements) =>
        Promise.all(
          elements.map(async (element) => {
            const svg = element.querySelector('.nuxt-icon svg')
            if (!svg) return null
            const clone = svg.cloneNode(true) as SVGElement
            clone.setAttribute('width', '64')
            clone.setAttribute('height', '64')
            clone.setAttribute('fill', '#000')
            for (const node of clone.querySelectorAll('[fill="currentColor"]')) node.setAttribute('fill', '#000')
            const source = new XMLSerializer().serializeToString(clone)
            const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`
            const image = new Image()
            await new Promise((resolve, reject) => {
              image.onload = resolve
              image.onerror = reject
              image.src = url
            })
            const canvas = document.createElement('canvas')
            canvas.width = 64
            canvas.height = 64
            const context = canvas.getContext('2d')
            if (!context) return null
            context.drawImage(image, 0, 0, 64, 64)
            const { data } = context.getImageData(0, 0, 64, 64)
            let painted = 0
            for (let index = 3; index < data.length; index += 4) if (data[index]! > 0) painted += 1
            return painted / (64 * 64)
          }),
        ),
      )

    for (const theme of ['light', 'dark', 'oled'] as const) {
      await page.evaluate((value) => localStorage.setItem('axolotl-theme', value), theme)
      await page.reload()
      for (const [index, ratio] of (await coverage()).entries()) {
        expect(ratio, `${theme} icon ${index} rendered`).not.toBeNull()
        // Below 5% the glyph is effectively invisible; above 85% it has lost its
        // interior and reads as a filled square.
        expect(ratio!, `${theme} icon ${index} coverage`).toBeGreaterThan(0.05)
        expect(ratio!, `${theme} icon ${index} coverage`).toBeLessThan(0.85)
      }
    }

    const first = links.first()
    await first.hover()
    const qr = first.locator('svg').nth(1)
    await expect(qr).toBeVisible()
    await expect(qr.locator('path').first()).toBeVisible()
  })
})

test.describe('content', () => {
  test('lists localized blog posts and renders a detail page', async ({ page }) => {
    await page.goto('/en/blog')
    await expect(page.getByRole('heading', { name: 'First launch: accounts, Java and memory' })).toBeVisible()

    await page.getByRole('heading', { name: 'First launch: accounts, Java and memory' }).getByRole('link').click()
    await expect(page).toHaveURL(/\/en\/blog\/first-launch$/)
    await expect(page.locator('article h1')).toContainText('First launch')
    await expect(page.locator('.prose h2')).toHaveCount(4)
  })

  test('lists synced knowledge-base documents and opens one', async ({ page }) => {
    await page.goto('/docs')
    await expect(page.getByRole('heading', { name: '欢迎使用 Axolotl Launcher' })).toBeVisible()

    await page.getByRole('link', { name: '欢迎使用 Axolotl Launcher' }).first().click()
    await expect(page).toHaveURL(/\/docs\/getting-started$/)
    await expect(page.locator('h1')).toContainText('欢迎使用 Axolotl Launcher')
  })

  test('lists the Chinese originals when English docs are missing', async ({ page }) => {
    await page.goto('/en/docs')
    await expect(page.getByRole('heading', { name: 'Documentation' })).toBeVisible()
    await expect(page.getByText('This page has no translation yet; the Chinese original is shown.')).toBeVisible()
    await expect(page.getByRole('heading', { name: '欢迎使用 Axolotl Launcher' })).toBeVisible()

    await page
      .getByRole('link', { name: /欢迎使用 Axolotl Launcher/ })
      .first()
      .click()
    await expect(page).toHaveURL(/\/en\/docs\/getting-started$/)
    await expect(page.locator('article h1')).toContainText('欢迎使用 Axolotl Launcher')
  })

  test('keeps the Studio edit affordance away from anonymous readers', async ({ page }) => {
    for (const route of ['/docs/getting-started', '/blog/first-launch']) {
      await page.goto(route)
      await expect(page.locator('a[href^="/_studio"]'), route).toHaveCount(0)
    }
  })
})

test.describe('support', () => {
  test('requests a checkout URL through the support API', async ({ page }) => {
    await page.route('**/api/support/checkout/coffee.json', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: '/support?checkout=coffee' }),
      }),
    )

    await page.goto('/support')
    await page.getByRole('button', { name: /请开发者喝杯咖啡/ }).click()
    await expect(page).toHaveURL(/checkout=coffee/)
  })
})

test.describe('downloads', () => {
  test('renders download links from the update-server catalogue', async ({ page }) => {
    let artifactHits = 0
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.route('**/api/downloads/latest?channel=*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(releaseFixture) }),
    )
    await page.route('**/dist/1.11.0/**', (route) => {
      artifactHits += 1
      return route.fulfill({ status: 200, contentType: 'application/octet-stream', body: 'stub' })
    })
    await page.goto('/download')
    await expect(page.getByText('最新版本 1.11.0')).toBeVisible()
    await page.getByRole('button', { name: '下载 Windows 版' }).click()
    await expect(page).toHaveURL(/\/download\/thanks/)

    const help = page.getByRole('dialog', { name: '下载已开始' })
    await expect(help).toBeVisible()
    await expect(help.getByRole('tab')).toHaveCount(1)
    await expect(help.getByRole('tab', { name: /VCRUNTIME140_1\.dll/ })).toBeVisible()
    const stage = help.locator('.windows-screen')
    const cursor = stage.locator('[data-walkthrough-cursor]')
    await help.getByRole('button', { name: '第 1 步' }).click()
    await expect(cursor).toBeVisible({ timeout: 2500 })
    const cursorStart = await cursor.evaluate((element) => getComputedStyle(element).transform)
    await expect(cursor).not.toHaveCSS('transform', cursorStart, { timeout: 2500 })
    const cameraStart = await stage.evaluate((element) => getComputedStyle(element).transform)
    await help.getByRole('button', { name: '第 2 步' }).click()
    await expect(stage).not.toHaveCSS('transform', cameraStart, { timeout: 5000 })
    // The thank-you page starts the download itself; no second confirmation.
    await expect.poll(() => artifactHits).toBe(1)
    await help.getByRole('button', { name: '暂停' }).click()
    await expect(help.getByRole('button', { name: '播放' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(help).toBeHidden()
    await expect(page.getByRole('heading', { name: '感谢下载 Axolotl' })).toBeVisible()
    await expect(page.getByRole('link', { name: '直接下载链接' })).toHaveAttribute(
      'href',
      'https://dist.axlmc.org/dist/1.11.0/Axolotl_1.11.0_x64-setup.exe',
    )
    await page.getByRole('button', { name: '下载帮助', exact: true }).click()
    await expect(help).toBeVisible()
    expect(artifactHits).toBe(1)
  })

  test.describe('Edge download help', () => {
    test.use({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0',
      reducedMotion: 'reduce',
    })

    test('offers both walkthroughs and lets visitors choose static steps', async ({ page }) => {
      await page.route('**/api/downloads/latest?channel=*', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(releaseFixture) }),
      )
      await page.route('**/dist/1.11.0/**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/octet-stream', body: 'stub' }),
      )
      await page.goto('/en/download/thanks?platform=windows&format=installer&channel=release&source=update-server')
      const help = page.getByRole('dialog', { name: 'Your download has started' })
      const edge = help.getByRole('tab', { name: /Edge says/ })
      await expect(edge).toHaveAttribute('aria-selected', 'true')
      await expect(help.getByRole('button', { name: /^(Play|Pause)$/ })).toHaveCount(0)
      await help.getByRole('button', { name: 'Step 3' }).click()
      await expect(help.getByRole('button', { name: 'Step 3' })).toHaveAttribute('aria-current', 'step')
      await edge.focus()
      await page.keyboard.press('ArrowRight')
      await expect(help.getByRole('tab', { name: /VCRUNTIME140_1\.dll/ })).toHaveAttribute('aria-selected', 'true')
      await expect(help.getByRole('link', { name: 'aka.ms/vc14/vc_redist.x64.exe' })).toHaveAttribute(
        'href',
        'https://aka.ms/vc14/vc_redist.x64.exe',
      )
    })
  })

  test('opens the step-by-step wizard from the quick card', async ({ page }) => {
    await page.route('**/api/downloads/latest?channel=*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(releaseFixture) }),
    )
    await page.goto('/download')
    await expect(page.getByRole('button', { name: '下载 Windows 版' })).toBeVisible()

    await page.getByRole('button', { name: '更改下载选项' }).click()
    await expect(page.getByRole('list', { name: '下载步骤' })).toBeVisible()
    await expect(page.getByRole('radio', { name: /Windows/ })).toHaveAttribute('aria-checked', 'true')

    await page.getByRole('button', { name: '继续' }).click()
    await expect(page.getByRole('radio', { name: '安装包', exact: true })).toHaveAttribute('aria-checked', 'true')
    await page.getByRole('button', { name: '继续' }).click()
    await expect(page.getByRole('heading', { name: '确认下载内容' })).toBeVisible()

    // Switching steps must not resize the wizard, or the actions move under the
    // pointer between the click and the next tap.
    const wizard = page.locator('[data-download-mode="wizard"]')
    const confirmation = await wizard.boundingBox()
    await page.getByRole('button', { name: '返回' }).click()
    const options = await wizard.boundingBox()
    expect(Math.round(options!.height)).toBe(Math.round(confirmation!.height))

    // Stepping back from the first step returns to the confirmation card, which
    // is its own container and reflows the page below it.
    await page.getByRole('button', { name: '返回' }).click()
    await page.getByRole('button', { name: '返回' }).click()
    await expect(page.locator('[data-download-mode="quick"]')).toBeVisible()
    await expect(wizard).toHaveCount(0)

    await page.getByRole('button', { name: '更改下载选项' }).click()
    await page.getByRole('button', { name: '继续' }).click()
    await page.getByRole('button', { name: '继续' }).click()
    await page.getByRole('button', { name: '开始下载' }).click()
    await expect(page).toHaveURL(/\/download\/thanks/)
  })

  test.describe('unsupported device', () => {
    test.use({
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    })

    test('falls back to the Windows download', async ({ page }) => {
      await page.route('**/api/downloads/latest?channel=*', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(releaseFixture) }),
      )
      await page.route('**/dist/1.11.0/**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/octet-stream', body: 'stub' }),
      )
      await page.goto('/download')
      await expect(page.getByText('最新版本 1.11.0')).toBeVisible()
      // The wizard keeps its own copy of this note mounted but inert, so scope
      // the assertion to the confirmation card.
      await expect(page.locator('[data-download-mode="quick"]').getByText(/未识别到受支持的桌面系统/)).toBeVisible()
      await page.getByRole('button', { name: '下载 Windows 版' }).click()
      await expect(page).toHaveURL(/\/download\/thanks/)
      await expect(page.getByRole('heading', { name: '感谢下载 Axolotl' })).toBeVisible()
      await expect(page.getByRole('dialog', { name: '下载已开始' })).toHaveCount(0)
    })
  })
})

test.describe('docs search', () => {
  test('opens the search modal', async ({ page }) => {
    await page.goto('/docs')
    await page.getByRole('button', { name: '搜索文档…' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('searchbox').fill('安装')
    await expect(dialog.getByRole('link', { name: '安装与更新' })).toBeVisible()
  })
})
