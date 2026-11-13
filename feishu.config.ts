import type { FeishuConfig } from './shared/types/feishu'

/**
 * The docs knowledge base lives in Feishu. Add one entry per document: the
 * slug is the permanent site URL, and each node token points at the wiki page
 * for that locale. Leave a locale out until its translation exists.
 *
 * Copy a node token from the wiki URL: https://<tenant>.feishu.cn/wiki/<nodeToken>
 */
const config: FeishuConfig = {
  spaces: {
    'zh-CN': { spaceId: '' },
    'en-US': { spaceId: '' },
  },
  docs: [
    {
      slug: 'getting-started',
      group: { 'zh-CN': '开始使用', 'en-US': 'Getting started' },
      order: 1,
      descriptions: {
        'zh-CN': '从下载到进入第一个世界，了解 Axolotl 的完整上手流程。',
        'en-US': 'From download to your first world: the complete Axolotl onboarding path.',
      },
      nodes: {},
    },
    {
      slug: 'installation',
      group: { 'zh-CN': '开始使用', 'en-US': 'Getting started' },
      order: 2,
      descriptions: {
        'zh-CN': '在各平台上安装 Axolotl，并完成首次配置。',
        'en-US': 'Install Axolotl on each platform and finish the first-run setup.',
      },
      nodes: {},
    },
    {
      slug: 'first-launch',
      group: { 'zh-CN': '开始使用', 'en-US': 'Getting started' },
      order: 3,
      descriptions: {
        'zh-CN': '首次启动时选择 Java、分配内存并登录账户。',
        'en-US': 'Pick Java, allocate memory and sign in on your first launch.',
      },
      nodes: {},
    },
    {
      slug: 'interface',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 4,
      descriptions: {
        'zh-CN': '认识启动器的主界面、实例列表与资源管理。',
        'en-US': 'Tour the launcher: instances, resources and the main workspace.',
      },
      nodes: {},
    },
    {
      slug: 'versions',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 5,
      descriptions: {
        'zh-CN': '安装游戏版本、加载器与整合包，并管理多个实例。',
        'en-US': 'Install game versions, loaders and modpacks, and manage multiple instances.',
      },
      nodes: {},
    },
    {
      slug: 'java',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 6,
      descriptions: {
        'zh-CN': '选择合适的 Java 运行时，并调整内存与启动参数。',
        'en-US': 'Choose a Java runtime and tune memory and launch arguments.',
      },
      nodes: {},
    },
    {
      slug: 'accounts',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 7,
      descriptions: {
        'zh-CN': '管理微软账户、离线账户与多人联机设置。',
        'en-US': 'Manage Microsoft and offline accounts and multiplayer settings.',
      },
      nodes: {},
    },
    {
      slug: 'troubleshooting',
      group: { 'zh-CN': '帮助', 'en-US': 'Help' },
      order: 8,
      descriptions: {
        'zh-CN': '排查启动失败、崩溃与网络问题。',
        'en-US': 'Troubleshoot launch failures, crashes and network issues.',
      },
      nodes: {},
    },
  ],
  output: {
    docsDir: 'content/feishu/docs',
    assetsDir: 'public/feishu',
    manifestPath: 'content/feishu/manifest.json',
    reportPath: 'content/feishu/sync-report.json',
  },
  // Set FEISHU_WEB_BASE in .env.local instead of hard-coding a tenant here.
  requireEnglish: true,
}

export default config
