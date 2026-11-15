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
      '/articles',
      '/changelog',
      '/demo',
      '/support',
      '/privacy',
      '/terms',
    ]
    for (const route of routes) {
      const response = await page.goto(route)
      expect(response?.status(), route).toBe(200)
      await expect(page.locator('main#main')).toBeVisible()
      await expect(page.locator('h1')).toHaveCount(1)
    }
  })

  test('applies the saved theme before hydration', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('axolotl-theme', 'dark'))
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(16, 18, 21)')

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
})

test.describe('content', () => {
  test('lists localized articles and renders a detail page', async ({ page }) => {
    await page.goto('/en/articles')
    await expect(page.getByRole('heading', { name: 'First launch: accounts, Java and memory' })).toBeVisible()

    await page.getByRole('heading', { name: 'First launch: accounts, Java and memory' }).getByRole('link').click()
    await expect(page).toHaveURL(/\/en\/articles\/first-launch$/)
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
    await page.route('**/api/downloads/latest?channel=*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(releaseFixture) }),
    )
    await page.route('**/dist/1.11.0/**', (route) => {
      artifactHits += 1
      return route.fulfill({ status: 200, contentType: 'application/octet-stream', body: 'stub' })
    })
    await page.goto('/download')
    await expect(page.getByText('1.11.0')).toBeVisible()
    await page.getByRole('button', { name: '继续' }).click()
    await page.getByRole('button', { name: '继续' }).click()
    await page.getByRole('button', { name: '下载', exact: true }).click()
    await expect(page).toHaveURL(/\/download\/thanks/)
    await expect(page.getByRole('heading', { name: '感谢下载 Axolotl' })).toBeVisible()
    await expect(page.getByRole('link', { name: '直接下载链接' })).toHaveAttribute(
      'href',
      'https://dist.axlmc.org/dist/1.11.0/Axolotl_1.11.0_x64-setup.exe',
    )
    await expect.poll(() => artifactHits).toBeGreaterThan(0)
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
      await expect(page.getByText('1.11.0')).toBeVisible()
      await expect(page.getByText(/未识别到受支持的桌面系统/)).toBeVisible()
      await page.getByRole('button', { name: '继续' }).click()
      await page.getByRole('button', { name: '继续' }).click()
      await page.getByRole('button', { name: '下载', exact: true }).click()
      await expect(page).toHaveURL(/\/download\/thanks/)
      await expect(page.getByRole('heading', { name: '感谢下载 Axolotl' })).toBeVisible()
    })
  })
})

test.describe('search', () => {
  test('returns local results', async ({ page }) => {
    await page.goto('/search')
    await page.getByRole('searchbox').fill('安装')
    await expect(page.getByText('安装与更新')).toBeVisible()
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
