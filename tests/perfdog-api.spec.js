// @ts-check
const { test, expect } = require('@playwright/test');

function uniqueId(seed = 0) {
  return Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`) + seed;
}

async function createPet(api, { id, name, status }) {
  const payload = {
    id,
    name,
    status,
    photoUrls: ['https://example.com/pet.jpg']
  };

  const res = await api.post('https://petstore.swagger.io/v2/pet', { data: payload });
  const text = await res.text();

  console.log('POST URL =>', res.url());
  expect(res.ok(), `Create pet failed: ${res.status()} ${text}`).toBeTruthy();

  const body = JSON.parse(text);
  expect(body.id).toBe(id);
  expect(body.status).toBe(status);
  return body;
}

async function getPetById(api, id) {
  const res = await api.get(`https://petstore.swagger.io/v2/pet/${id}`);
  expect(res.ok(), `Get pet failed: ${res.status()} ${await res.text()}`).toBeTruthy();
  return await res.json();
}

async function findPetsByStatus(api, status) {
  const res = await api.get('https://petstore.swagger.io/v2/pet/findByStatus', { params: { status } });
  expect(res.ok(), `Find by status failed: ${res.status()} ${await res.text()}`).toBeTruthy();

  const body = await res.json();
  expect(Array.isArray(body)).toBeTruthy();
  return body;
}

async function createOrder(api, { orderId, petId, quantity = 1 }) {
  const payload = {
    id: orderId,
    petId,
    quantity,
    shipDate: new Date().toISOString(),
    status: 'placed',
    complete: true
  };

  const res = await api.post('https://petstore.swagger.io/v2/store/order', { data: payload });
  expect(res.ok(), `Create order failed: ${res.status()} ${await res.text()}`).toBeTruthy();

  const body = await res.json();
  expect(body.id).toBe(orderId);
  expect(body.petId).toBe(petId);
  return body;
}

test.describe('PerfDog API scenarios (Swagger Petstore v2)', () => {
  test('Part 1 + Part 2', async ({ request }) => {
    const api = request; 

    // -------------------
    // Part 1
    // -------------------
    // Create 10 pets: 5 available, 4 pending, 1 sold
    const soldPetId = uniqueId(999);

    for (let i = 0; i < 5; i++) {
      await createPet(api, { id: uniqueId(i), name: `PerfDog-available-${i}`, status: 'available' });
    }

    for (let i = 0; i < 4; i++) {
      await createPet(api, { id: uniqueId(100 + i), name: `PerfDog-pending-${i}`, status: 'pending' });
    }

    await createPet(api, { id: soldPetId, name: 'PerfDog-sold-0', status: 'sold' });

    // Retrieve sold pet details
    const fetchedSold = await getPetById(api, soldPetId);
    expect(fetchedSold.id).toBe(soldPetId);
    expect(fetchedSold.status).toBe('sold');

    // -------------------
    // Part 2
    // -------------------
    // List available pets and store 5
    const availablePets = await findPetsByStatus(api, 'available');
    expect(availablePets.length, `Expected at least 5 available pets, got ${availablePets.length}`).toBeGreaterThanOrEqual(5);

    const selected = availablePets.slice(0, 5).map(p => ({ id: p.id, name: p.name }));

    // Create one order per pet
    const orders = [];
    for (let i = 0; i < selected.length; i++) {
      orders.push(await createOrder(api, { orderId: uniqueId(500 + i), petId: selected[i].id, quantity: 1 }));
    }

    expect(orders).toHaveLength(5);
    for (let i = 0; i < 5; i++) {
      expect(orders[i].petId).toBe(selected[i].id);
    }
  });
});