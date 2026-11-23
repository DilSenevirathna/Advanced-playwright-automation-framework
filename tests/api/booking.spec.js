const { test, expect } = require('../../src/fixtures');
const { buildBooking } = require('../../src/data/factories');
const { env } = require('../../src/utils/env');

test.describe('Booking API', () => {
  test(
    'creates a booking and echoes the payload',
    { tag: ['@api', '@smoke'] },
    async ({ bookings }) => {
      const { id, payload, body } = await bookings.create();

      expect(id).toBeGreaterThan(0);
      expect(body.booking).toMatchObject(payload);
    },
  );

  test(
    'reads back what was created',
    { tag: ['@api', '@regression'] },
    async ({ bookings, bookingApi }) => {
      const { id, payload } = await bookings.create();

      const response = await bookingApi.get(id);

      expect(response.status()).toBe(200);
      expect(await response.json()).toMatchObject(payload);
    },
  );

  test(
    'filters the list by last name',
    { tag: ['@api', '@regression'] },
    async ({ bookings, bookingApi }) => {
      const lastname = `Test${Date.now()}`;
      const { id } = await bookings.create({ lastname });

      const response = await bookingApi.list({ lastname });

      expect(response.status()).toBe(200);
      expect(await response.json()).toContainEqual({ bookingid: id });
    },
  );

  test(
    'replaces a booking with PUT',
    { tag: ['@api', '@regression'] },
    async ({ bookings, bookingApi }) => {
      const { id } = await bookings.create();
      const replacement = buildBooking();

      const response = await bookingApi.update(id, replacement);

      expect(response.status()).toBe(200);
      expect(await response.json()).toMatchObject(replacement);
    },
  );

  test(
    'changes only the supplied fields with PATCH',
    { tag: ['@api', '@regression'] },
    async ({ bookings, bookingApi }) => {
      const { id, payload } = await bookings.create();

      const response = await bookingApi.patch(id, { firstname: 'Dilmi' });
      const updated = await response.json();

      expect(response.status()).toBe(200);
      expect(updated.firstname).toBe('Dilmi');
      expect(updated.lastname).toBe(payload.lastname);
      expect(updated.totalprice).toBe(payload.totalprice);
    },
  );

  test('deletes a booking', { tag: ['@api', '@regression'] }, async ({ bookings, bookingApi }) => {
    const { id } = await bookings.create();

    const deleted = await bookingApi.remove(id);
    // Restful-Booker answers 201 to a successful DELETE. Unusual, but it is the contract.
    expect(deleted.status()).toBe(201);

    const lookup = await bookingApi.get(id);
    expect(lookup.status()).toBe(404);
  });

  test(
    'refuses writes without a token',
    { tag: ['@api', '@security'] },
    async ({ bookings, request }) => {
      const { id } = await bookings.create();

      const response = await request.put(`/booking/${id}`, { data: buildBooking() });

      expect(response.status()).toBe(403);
    },
  );

  test(
    'bad credentials do not yield a token',
    { tag: ['@api', '@security'] },
    async ({ request }) => {
      const response = await request.post('/auth', {
        data: { username: env.apiUsername, password: 'definitely-wrong' },
      });
      const body = await response.json();

      // The service replies 200 with a reason instead of 401. Asserting on the body makes
      // that quirk explicit rather than hiding it.
      expect(body.token).toBeUndefined();
      expect(body.reason).toMatch(/bad credentials/i);
    },
  );
});
