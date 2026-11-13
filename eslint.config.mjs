import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: ['public/**', 'content/feishu/**', 'packages/**', '.output/**', '.nuxt/**'],
  },
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      // Prettier closes void elements in SFC templates; accept either form.
      'vue/html-self-closing': ['error', { html: { void: 'any', normal: 'always', component: 'always' } }],
    },
  },
)
