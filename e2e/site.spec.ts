import { expect, test } from '@playwright/test'

const releaseFixture = {
  version: '1.11.0',
  release_tag: 'v1.11.0',
  downloads: [
    { filename: 'Axolotl_1.11.0_x64-setup.exe', relative_path: 'dist/1.11.0/Axolotl_1.11.0_x64-setup.exe' },
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
      '/thanks',
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

  test('shows the knowledge-base sync state when Feishu has not been synced', async ({ page }) => {
    await page.goto('/docs')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByText(/飞书|Feishu/).first()).toBeVisible()
  })
})

test.describe('downloads', () => {
  test('renders download links from the update-server catalogue', async ({ page }) => {
    await page.route('**/api/downloads/latest?channel=*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(releaseFixture) }),
    )
    await page.goto('/download')
    await expect(page.getByText('1.11.0')).toBeVisible()
    await expect(page.getByRole('link', { name: /Windows/i })).toHaveAttribute(
      'href',
      'https://dist.axlmc.org/dist/1.11.0/Axolotl_1.11.0_x64-setup.exe',
    )
    await expect(page.getByRole('link', { name: /macOS/i })).toHaveAttribute(
      'href',
      'https://dist.axlmc.org/dist/1.11.0/Axolotl_1.11.0_universal.dmg',
    )
  })
})
