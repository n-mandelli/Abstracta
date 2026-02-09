// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.demoblaze.com/index.html';

test('Part 2 - Purchase a product successfully', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#tbodyid .card', { state: 'visible' });

  // Captura o primeiro produto da lista
  const firstProductLink = page.locator('#tbodyid .card .card-title a').first();
  const productName = await firstProductLink.textContent();
  await firstProductLink.click();

  // Página de detalhes do produto
  await page.waitForSelector('.name', { state: 'visible' });

  // Intercepta o alert "Product added"
  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });

  // Add to cart
  await page.locator('a.btn.btn-success.btn-lg').click();

  // Ir ao carrinho
  await page.locator('#cartur').click();
  await page.waitForSelector('#tbodyid tr', { state: 'visible' });

  // Validar item no carrinho
  const cartText = await page.locator('#tbodyid').innerText();
  expect(cartText.toLowerCase()).toContain((productName || '').trim().toLowerCase());

  // Place Order
  await page.locator('button:has-text("Place Order")').click();

  // Modal de compra
  await page.waitForSelector('#orderModal', { state: 'visible' });

  await page.fill('#name', 'QA Tester');
  await page.fill('#country', 'Brazil');
  await page.fill('#city', 'São Paulo');
  await page.fill('#card', '4111111111111111');
  await page.fill('#month', '12');
  await page.fill('#year', '2030');

  await page.locator('#orderModal button:has-text("Purchase")').click();

  // Confirmação
  await page.waitForSelector('.sweet-alert.showSweetAlert.visible', { state: 'visible' });

  const confirmationText = await page.locator('.sweet-alert.showSweetAlert.visible').innerText();
  expect(confirmationText).toContain('Thank you for your purchase!');

  // OK
  await page.locator('.sweet-alert.showSweetAlert.visible button:has-text("OK")').click();
});