import config from 'ultracite/prettier'

export default {
  ...config,
  // Preserve the project's established formatting while using Ultracite's
  // formatter preset as the base.
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './app/assets/css/main.css',
  semi: false,
  singleQuote: true,
  printWidth: 120,
  tabWidth: 2,
  trailingComma: 'all',
}
