const { expect } = require('@playwright/test');

/**
 * Thin client around Restful-Booker. Keeps endpoints, headers and auth in one place so specs
 * read as behaviour, and so a contract change is a one-file fix.
 */
class BookingClient {
  /**
   * @param {import('@playwright/test').APIRequestContext} request
   * @param {{username: string, password: string}} credentials
   */
  constructor(request, credentials) {
    this.request = request;
    this.credentials = credentials;
    this.token = null;
  }

  async authenticate() {
    if (this.token) return this.token;
    const res = await this.request.post('/auth', { data: this.credentials });
    expect(res.ok(), `auth failed: ${res.status()}`).toBeTruthy();
    const body = await res.json();
    expect(body.token, 'auth response should contain a token').toBeTruthy();
    this.token = body.token;
    return this.token;
  }

  async #authHeaders() {
    return { Cookie: `token=${await this.authenticate()}` };
  }

  create(booking) {
    return this.request.post('/booking', { data: booking });
  }

  get(id) {
    return this.request.get(`/booking/${id}`);
  }

  list(query = {}) {
    return this.request.get('/booking', { params: query });
  }

  async update(id, booking) {
    return this.request.put(`/booking/${id}`, {
      data: booking,
      headers: await this.#authHeaders(),
    });
  }

  async patch(id, partial) {
    return this.request.patch(`/booking/${id}`, {
      data: partial,
      headers: await this.#authHeaders(),
    });
  }

  async remove(id) {
    return this.request.delete(`/booking/${id}`, { headers: await this.#authHeaders() });
  }
}

module.exports = { BookingClient };
