const { faker } = require('@faker-js/faker');

/** Checkout form data. Call faker.seed(n) in a spec to reproduce a failing run exactly. */
function buildCheckoutInfo(overrides = {}) {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode(),
    ...overrides,
  };
}

/** Payload for Restful-Booker's POST /booking. */
function buildBooking(overrides = {}) {
  const checkin = faker.date.soon({ days: 30 });
  const checkout = new Date(checkin.getTime() + faker.number.int({ min: 1, max: 14 }) * 86_400_000);
  const toDate = (d) => d.toISOString().slice(0, 10);

  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 100, max: 1500 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: { checkin: toDate(checkin), checkout: toDate(checkout) },
    additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Late checkout', 'Parking', 'None']),
    ...overrides,
  };
}

module.exports = { buildCheckoutInfo, buildBooking };
