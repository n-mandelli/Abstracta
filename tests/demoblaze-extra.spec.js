// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.demoblaze.com/index.html';

test('Extra - Remove product from cart', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#tbodyid .card', { state: 'visible' });

  // Abre primeiro produto
  await page.locator('#tbodyid .card .card-title a').first().click();
  await page.waitForSelector('.name', { state: 'visible' });

  // Aceita alert
  page.once('dialog', async d => d.accept());
  await page.locator('a.btn.btn-success.btn-lg').click();

  // Vai ao carrinho
  await page.locator('#cartur').click();
  await page.waitForSelector('#tbodyid tr', { state: 'visible' });

  // Remove
  await page.locator('#tbodyid a:has-text("Delete")').first().click();

  // Aguarda atualização
  await page.waitForTimeout(1000);

  // Validar carrinho vazio (não ter linhas)
  const rows = await page.locator('#tbodyid tr').count();
  expect(rows).toBe(0);
});