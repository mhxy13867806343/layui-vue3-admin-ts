/* eslint-env node */
let autoImportConfig = {}
try {
  // 由 unplugin-auto-import 在 vite dev/build 时生成；首次启动前可能不存在，需容错
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  autoImportConfig = require('./.eslintrc-auto-import.json')
} catch (_e) {
  autoImportConfig = {}
}

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint'],
  globals: {
    ...(autoImportConfig.globals || {}),
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
}
