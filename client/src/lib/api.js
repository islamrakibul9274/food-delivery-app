const base = import.meta.env.VITE_API_URL || "/api";
export async function api(path, options = {}) {
  const response = await fetch(base + path, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof Blob)
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
    body:
      options.body instanceof Blob
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
  });
  const data =
    response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/auth/"))
      window.dispatchEvent(new Event("food:session-expired"));
    const error = new Error(
      data.message || "The request failed. Please try again.",
    );
    error.status = response.status;
    throw error;
  }
  return data;
}
export const money = (cents, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    (cents || 0) / 100,
  );
export const orderTotal = (order) =>
  order.totalCents ?? Math.round(order.totalAmount * 100);
export const label = (value) =>
  (value || "").replaceAll("-", " ").replace(/^./, (c) => c.toUpperCase());
export const categories = [
  "All",
  "Burger",
  "Pizza",
  "Pasta",
  "Dessert",
  "Drink",
];
export const statusOptions = (order) =>
  ({
    pending: ["confirmed", "cancelled"],
    confirmed: ["preparing", "cancelled"],
    preparing: [order.fulfilment === "pickup" ? "ready" : "out-for-delivery"],
    ready: ["delivered"],
    "out-for-delivery": ["delivered"],
  })[order.status] || [];
export const date = (value) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const cartKey = (item) =>
  item._id + ":" + [...(item.selectedAddOns || [])].sort().join(",");
export const unitCents = (item, product = item) =>
  Math.round(product.price * 100) +
  (item.selectedAddOns || []).reduce(
    (sum, key) =>
      sum +
      ((product.addOns || []).find((o) => o.key === key)?.priceCents || 0),
    0,
  );
