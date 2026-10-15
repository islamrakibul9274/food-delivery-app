const crypto = require("node:crypto");
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const fail = (status, message) => {
  throw new HttpError(status, message);
};
function text(value, name, min = 1, max = 200) {
  if (
    typeof value !== "string" ||
    value.trim().length < min ||
    value.trim().length > max
  )
    fail(400, `${name} must contain ${min}–${max} characters.`);
  return value.trim();
}
function email(value) {
  const v = text(value, "Email", 3, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
    fail(400, "Enter a valid email address.");
  return v;
}
function password(value) {
  if (
    typeof value !== "string" ||
    value.length < 8 ||
    Buffer.byteLength(value) > 72
  )
    fail(
      400,
      "Use a password with at least 8 characters and at most 72 bytes.",
    );
  return value;
}
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const defaults = {
  name: "FOOD",
  tagline: "Good food. No occasion needed.",
  email: "",
  phone: "",
  address: "",
  hours: "",
  timezone: "UTC",
  currency: "USD",
  deliveryFeeCents: 200,
  minimumCents: 0,
  deliveryAreas: [],
  demoMode: false,
  orderingEnabled: false,
  pickupEnabled: false,
};
function calculate(items, products, settings, fulfilment) {
  if (!Array.isArray(items) || !items.length || items.length > 40)
    fail(400, "Choose between 1 and 40 menu items.");
  const found = new Set();
  const lines = items.map((item) => {
    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 20
    )
      fail(400, "Quantity must be between 1 and 20.");
    const product = products.find((p) => String(p._id) === item.productId);
    if (!product || product.archived || product.available === false)
      fail(409, "An item is no longer available. Please review your cart.");
    const selected = item.addOns || [];
    if (
      !Array.isArray(selected) ||
      selected.length > 8 ||
      selected.some((key) => typeof key !== "string")
    )
      fail(400, "Choose valid dish add-ons.");
    if (new Set(selected).size !== selected.length)
      fail(400, "Duplicate add-ons are not allowed.");
    const addOns = selected.map((key) => {
      const option = (product.addOns || []).find((o) => o.key === key);
      if (!option) fail(409, "A dish option changed. Please review your cart.");
      return {
        key: option.key,
        name: option.name,
        priceCents: option.priceCents,
      };
    });
    const lineKey = item.productId + ":" + [...selected].sort().join(",");
    if (found.has(lineKey)) fail(400, "Combine duplicate items in your cart.");
    found.add(lineKey);
    const priceCents =
      Math.round(product.price * 100) +
      addOns.reduce((sum, o) => sum + o.priceCents, 0);
    return {
      productId: product._id,
      name: product.name,
      quantity: item.quantity,
      price: priceCents / 100,
      priceCents,
      addOns,
      image: product.image,
      note: item.note ? text(item.note, "Item note", 0, 200) : "",
    };
  });
  const subtotalCents = lines.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  );
  if (subtotalCents < settings.minimumCents)
    fail(400, "Your order is below the restaurant minimum.");
  const deliveryCents =
    fulfilment === "delivery" ? settings.deliveryFeeCents : 0;
  return {
    items: lines,
    subtotalCents,
    deliveryCents,
    totalCents: subtotalCents + deliveryCents,
    totalAmount: (subtotalCents + deliveryCents) / 100,
  };
}
function nextStates(order) {
  return (
    {
      pending: ["confirmed", "cancelled"],
      confirmed: ["preparing", "cancelled"],
      preparing: [order.fulfilment === "pickup" ? "ready" : "out-for-delivery"],
      ready: ["delivered"],
      "out-for-delivery": ["delivered"],
      delivered: [],
      cancelled: [],
    }[order.status] || []
  );
}
module.exports = {
  HttpError,
  fail,
  text,
  email,
  password,
  hash,
  defaults,
  calculate,
  nextStates,
};
