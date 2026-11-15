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
    'zh-CN': { spaceId: '7673147277203999731' },
  },
  docs: [
    {
      slug: 'getting-started',
      group: { 'zh-CN': '开始使用', 'en-US': 'Getting started' },
      order: 1,
      nodes: { 'zh-CN': 'EnhBw3qUEi58AfkxVTUc9BL1nih' },
    },
    {
      slug: 'installation',
      group: { 'zh-CN': '开始使用', 'en-US': 'Getting started' },
      order: 2,
      nodes: { 'zh-CN': 'TXoowBAoQi3lHqkcgGpcE8NZnoc' },
    },
    {
      slug: 'first-launch',
      group: { 'zh-CN': '开始使用', 'en-US': 'Getting started' },
      order: 3,
      nodes: { 'zh-CN': 'V6NUwoWsUiHI2QkcMWOcpsOxncg' },
    },
    {
      slug: 'sign-in',
      group: { 'zh-CN': '开始使用', 'en-US': 'Getting started' },
      order: 4,
      nodes: { 'zh-CN': 'DzymwKtMNiGbzEk7lUDcoUvInFh' },
    },
    {
      slug: 'create-instance',
      group: { 'zh-CN': '开始使用', 'en-US': 'Getting started' },
      order: 5,
      nodes: { 'zh-CN': 'MLN3w2bjQirWqCkwCQHcYQJKnW2' },
    },
    {
      slug: 'install-content',
      group: { 'zh-CN': '开始使用', 'en-US': 'Getting started' },
      order: 6,
      nodes: { 'zh-CN': 'WJIBwMU5AiypvdkAShTcIiGTnKf' },
    },
    {
      slug: 'install-update',
      group: { 'zh-CN': '快速教程', 'en-US': 'Quick tutorials' },
      order: 7,
      nodes: { 'zh-CN': 'UlOYwgTsHi4RI1kbwl1cI0uBnnh' },
    },
    {
      slug: 'first-world',
      group: { 'zh-CN': '快速教程', 'en-US': 'Quick tutorials' },
      order: 8,
      nodes: { 'zh-CN': 'KM0awa9SfiSS4HkK0QdcvxfGnTd' },
    },
    {
      slug: 'manage-instances',
      group: { 'zh-CN': '快速教程', 'en-US': 'Quick tutorials' },
      order: 9,
      nodes: { 'zh-CN': 'UfIbwClLqiQfwhkHlcKcuEm4nnf' },
    },
    {
      slug: 'modpacks',
      group: { 'zh-CN': '快速教程', 'en-US': 'Quick tutorials' },
      order: 10,
      nodes: { 'zh-CN': 'XRmxw4KtmidHs0k4Ge2ct0Xjnsh' },
    },
    {
      slug: 'join-server',
      group: { 'zh-CN': '快速教程', 'en-US': 'Quick tutorials' },
      order: 11,
      nodes: { 'zh-CN': 'YbRQwafpNiz9yfkekeRcZJCynGd' },
    },
    {
      slug: 'change-skin',
      group: { 'zh-CN': '快速教程', 'en-US': 'Quick tutorials' },
      order: 12,
      nodes: { 'zh-CN': 'RDz4wLI0riH3ufknAgucz4nXn8e' },
    },
    {
      slug: 'lab-guide',
      group: { 'zh-CN': '快速教程', 'en-US': 'Quick tutorials' },
      order: 13,
      nodes: { 'zh-CN': 'Auqhw9uPfiTmKRkeqAXcuTuunoe' },
    },
    {
      slug: 'interface',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 14,
      nodes: { 'zh-CN': 'M22ywvbTjiRMFIk63XCcueEHnzd' },
    },
    {
      slug: 'what-is-instance',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 15,
      nodes: { 'zh-CN': 'BIppwTo6Sif1lZkD02JclpEGnyd' },
    },
    {
      slug: 'instance-transfer',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 16,
      nodes: { 'zh-CN': 'PQKawMbLrimzL5kj8ggcCIpKn9e' },
    },
    {
      slug: 'instance-details',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 17,
      nodes: { 'zh-CN': 'MZJMwP8DWiulgQkmvsscfyE5nFe' },
    },
    {
      slug: 'content-center',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 18,
      nodes: { 'zh-CN': 'Z659wDBuViIC4akQn9Jcpagtnte' },
    },
    {
      slug: 'browse-search',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 19,
      nodes: { 'zh-CN': 'Y33UwnsakiE3nskVSsZcIKEwnih' },
    },
    {
      slug: 'content-install',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 20,
      nodes: { 'zh-CN': 'Zp5Rww9M3inXjvk5nFXcgKBMnbh' },
    },
    {
      slug: 'project-details',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 21,
      nodes: { 'zh-CN': 'Y1aOwiDTtiY9YCkK0IVcYPghnrf' },
    },
    {
      slug: 'skins',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 22,
      nodes: { 'zh-CN': 'A0AEwmqpJiYYKlk6saOcNqJkn3c' },
    },
    {
      slug: 'multiplayer',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 23,
      nodes: { 'zh-CN': 'Bbc2wjdNXiMCb8kXJIGcdlFIn1b' },
    },
    {
      slug: 'lab',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 24,
      nodes: { 'zh-CN': 'DoJLwQaVciWsWLk89Q6coMqfnLe' },
    },
    {
      slug: 'seed-map',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 25,
      nodes: { 'zh-CN': 'XQhhwQcZ2inhK4kEUMXcuBw3ngd' },
    },
    {
      slug: 'projection-preview',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 26,
      nodes: { 'zh-CN': 'QF9IwXsqtiitwEkYaLHcsjEnn5d' },
    },
    {
      slug: 'recipe-generator',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 27,
      nodes: { 'zh-CN': 'N8i5wBz6GisrXfk1TqScyEtln1c' },
    },
    {
      slug: 'gradient-text',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 28,
      nodes: { 'zh-CN': 'QDjOwPVFMiO8TMkyx2HcGL2Enbg' },
    },
    {
      slug: 'mod-translation',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 29,
      nodes: { 'zh-CN': 'FZbSwDid9iFHjvkmFIlcNHrInyh' },
    },
    {
      slug: 'settings',
      group: { 'zh-CN': '使用指南', 'en-US': 'Guides' },
      order: 30,
      nodes: { 'zh-CN': 'DuOmwhs9jixD25kWNurcODiCn6b' },
    },
    {
      slug: 'faq',
      group: { 'zh-CN': '帮助', 'en-US': 'Help' },
      order: 31,
      nodes: { 'zh-CN': 'VtOWwGrsoiu4QHkLv2YcyzSznne' },
    },
    {
      slug: 'contributing',
      group: { 'zh-CN': '帮助', 'en-US': 'Help' },
      order: 32,
      nodes: { 'zh-CN': 'VENVwA0kJiGe7Dk3OijcdGXXn5b' },
    },
  ],
  output: {
    docsDir: 'content/feishu/docs',
    assetsDir: 'public/feishu',
    manifestPath: 'content/feishu/manifest.json',
    reportPath: 'content/feishu/sync-report.json',
  },
  webBase: 'https://gcnpznwdnhl4.feishu.cn',
  requireEnglish: false,
}

export default config
