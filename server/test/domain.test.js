const test = require("node:test");
const assert = require("node:assert/strict");
const { calculate, nextStates, email, password } = require("../lib/domain");
const product = { _id: "abc", name: "Burger", price: 8.35, available: true };
const settings = { minimumCents: 0, deliveryFeeCents: 200 };
test("totals use catalog prices and integer cents, ignoring forged client totals", () => {
  const order = calculate(
    [{ productId: "abc", quantity: 3, price: 0.01 }],
    [product],
    settings,
    "delivery",
  );
  assert.equal(order.subtotalCents, 2505);
  assert.equal(order.totalCents, 2705);
  assert.equal(
    calculate(
      [{ productId: "abc", quantity: 1 }],
      [product],
      settings,
      "pickup",
    ).deliveryCents,
    0,
  );
});
test("checkout rejects invalid quantity, duplicates and unavailable items", () => {
  for (const quantity of [0, -1, 21, 1.5, "2"])
    assert.throws(() =>
      calculate(
        [{ productId: "abc", quantity }],
        [product],
        settings,
        "delivery",
      ),
    );
  assert.throws(() =>
    calculate(
      [
        { productId: "abc", quantity: 1 },
        { productId: "abc", quantity: 1 },
      ],
      [product],
      settings,
      "delivery",
    ),
  );
  assert.throws(() =>
    calculate(
      [{ productId: "abc", quantity: 1 }],
      [{ ...product, available: false }],
      settings,
      "delivery",
    ),
  );
});
test("order state transitions cannot skip preparation or change completed orders", () => {
  assert.deepEqual(nextStates({ status: "pending" }), [
    "confirmed",
    "cancelled",
  ]);
  assert.deepEqual(nextStates({ status: "preparing", fulfilment: "pickup" }), [
    "ready",
  ]);
  assert.deepEqual(
    nextStates({ status: "preparing", fulfilment: "delivery" }),
    ["out-for-delivery"],
  );
  assert.deepEqual(nextStates({ status: "delivered" }), []);
});
test("account inputs normalize email and reject short or oversized passwords", () => {
  assert.equal(email("  ABC@example.com "), "abc@example.com");
  assert.throws(() => email("invalid"));
  assert.throws(() => password("short"));
  assert.throws(() => password("é".repeat(40)));
});
test("dish add-ons are catalog-priced and different options can form separate lines", () => {
  const configurable = {
    ...product,
    addOns: [{ key: "cheese", name: "Extra cheese", priceCents: 125 }],
  };
  const order = calculate(
    [
      { productId: "abc", quantity: 2, addOns: ["cheese"] },
      { productId: "abc", quantity: 1 },
    ],
    [configurable],
    settings,
    "pickup",
  );
  assert.equal(order.totalCents, 2755);
  assert.equal(order.items[0].addOns[0].name, "Extra cheese");
  assert.throws(() =>
    calculate(
      [{ productId: "abc", quantity: 1, addOns: ["forged"] }],
      [configurable],
      settings,
      "pickup",
    ),
  );
});
