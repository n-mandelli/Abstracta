// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60_000,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'https://petstore.swagger.io/v2'
  }
});