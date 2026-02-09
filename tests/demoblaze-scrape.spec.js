// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.demoblaze.com/index.html';

function normalizePrice(priceText) {
  // Ex: "$360" -> "360"
  return priceText.replace(/\$/g, '').trim();
}

async function readProductsFromCurrentPage(page) {
  // Os cards ficam no #tbodyid
  await page.waitForSelector('#tbodyid .card', { state: 'visible' });

  const products = await page.$$eval('#tbodyid .card', (cards) => {
    return cards.map((card) => {
      const nameEl = card.querySelector('.card-title a, .card-title .hrefch, a.hrefch');
      const priceEl = card.querySelector('.card-block h5, h5');
      const linkEl = nameEl;

      const name = nameEl?.textContent?.trim() || '';
      const price = priceEl?.textContent?.trim() || '';
      const href = linkEl?.getAttribute('href') || '';

      return { name, price, href };
    });
  });

  // Monta links absolutos
  return products.map(p => ({
    name: p.name,
    price: p.price,
    link: new URL(p.href, page.url()).href
  }));
}

test('Part 1 - Extract products from first two pages and export to TXT', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  const all = [];

  // Página 1
  const page1Products = await readProductsFromCurrentPage(page);
  expect(page1Products.length).toBeGreaterThan(0);
  all.push(...page1Products);

  // Ir para Página 2 (Next)
  // Em Demoblaze normalmente é o #next2
  await page.locator('#next2').click();
  await page.waitForTimeout(1000); // ajuda por conta do carregamento via JS

  const page2Products = await readProductsFromCurrentPage(page);
  expect(page2Products.length).toBeGreaterThan(0);
  all.push(...page2Products);

  // Exportar TXT (Name | Price | Link)
  const outDir = path.join(process.cwd(), 'output');
  const outFile = path.join(outDir, 'products.txt');
  fs.mkdirSync(outDir, { recursive: true });

  const lines = all.map(p => {
    const price = normalizePrice(p.price);
    return `${p.name} | ${price} | ${p.link}`;
  });

  fs.writeFileSync(outFile, lines.join('\n'), 'utf-8');

  console.log(`✅ Exported ${all.length} products to: ${outFile}`);
});