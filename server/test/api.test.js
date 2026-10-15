const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const fs = require("node:fs/promises");
const path = require("node:path");
const dotenv = require("dotenv");
const crypto = require("node:crypto");
const env = dotenv.parse(
  require("node:fs").readFileSync(path.join(__dirname, "../.env")),
);
const preview = new URL(env.MONGODB_URI).pathname.slice(1);
if (preview !== "food_delivery_local_preview_20261015")
  throw new Error(
    "Integration tests require the isolated preview configuration.",
  );
process.env.NODE_ENV = "test";
const app = require("../app");
const {
  User,
  Product,
  Order,
  Session,
  Settings,
  Message,
  Audit,
  Media,
} = require("../lib/models");
let server,
  base,
  admin,
  alice,
  bob,
  dish,
  created,
  secret = "Test-only-password-9274";
const dbName = "food_delivery_test_" + crypto.randomBytes(6).toString("hex");
async function request(method, route, body, cookie, headers = {}) {
  const response = await fetch(base + route, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json().catch(() => null);
  return {
    status: response.status,
    data: json,
    cookie: response.headers.get("set-cookie")?.split(";")[0],
    headers: response.headers,
  };
}
before(async () => {
  await mongoose.connect(env.MONGODB_URI, { dbName });
  await Promise.all(
    [User, Product, Order, Session, Settings, Message, Audit, Media].map((m) =>
      m.init(),
    ),
  );
  await Settings.create({
    _id: "restaurant",
    deliveryAreas: ["Preview delivery area"],
    deliveryFeeCents: 200,
    minimumCents: 0,
    orderingEnabled: true,
    pickupEnabled: true,
  });
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (
    mongoose.connection.name === dbName &&
    dbName.startsWith("food_delivery_test_")
  )
    await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
test("API rejects anonymous management and cross-origin writes", async () => {
  assert.equal((await request("GET", "/admin/orders")).status, 401);
  assert.equal(
    (
      await request(
        "POST",
        "/auth/login",
        { email: "a@b.com", password: secret },
        null,
        { Origin: "https://untrusted.example" },
      )
    ).status,
    403,
  );
});
test("signup creates an HttpOnly session and does not accept an admin role", async () => {
  const r = await request("POST", "/auth/signup", {
    name: "Alice",
    email: "ALICE@example.test",
    password: secret,
    role: "admin",
  });
  assert.equal(r.status, 201);
  alice = r.cookie;
  assert.equal(r.data.email, "alice@example.test");
  assert.equal(r.data.role, "user");
  assert.ok(r.headers.get("set-cookie").includes("HttpOnly"));
  assert.ok(!r.data.password);
  assert.equal(
    (await request("GET", "/admin/orders", null, alice)).status,
    403,
  );
  const b = await request("POST", "/auth/signup", {
    name: "Bob",
    email: "bob@example.test",
    password: secret,
  });
  bob = b.cookie;
  await User.updateOne(
    { email: "bob@example.test" },
    { $set: { role: "admin" } },
  );
  admin = (
    await request("POST", "/auth/login", {
      email: "bob@example.test",
      password: secret,
    })
  ).cookie;
});
test("admin creates dishes; customer cannot edit products or someone else’s profile", async () => {
  const r = await request(
    "POST",
    "/products",
    {
      name: "Test burger",
      price: 8.35,
      category: "Burger",
      image: "/food/burger.jpg",
      available: true,
    },
    admin,
  );
  assert.equal(r.status, 201);
  dish = r.data;
  assert.equal(
    (
      await request(
        "PUT",
        `/products/${dish._id}`,
        { ...dish, price: 0.01 },
        alice,
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await request(
        "PUT",
        "/users/update-profile/000000000000000000000000",
        { name: "forged" },
        alice,
      )
    ).status,
    404,
  );
  const settings = await request("GET", "/settings");
  assert.equal(
    (await request("PUT", "/admin/settings", settings.data, alice)).status,
    403,
  );
});
test("checkout verifies prices and user identity, and repeated submissions create one order", async () => {
  const body = {
    items: [{ productId: dish._id, quantity: 2, price: 0.01 }],
    fulfilment: "delivery",
    contact: {
      name: "Alice",
      phone: "123456789",
      line: "12 Test Street",
      area: "Preview delivery area",
    },
    requestKey: crypto.randomUUID(),
    expectedTotalCents: 1,
    email: "forged@example.test",
    totalAmount: 0.01,
  };
  assert.equal((await request("POST", "/orders", body, alice)).status, 409);
  body.expectedTotalCents = 1870;
  const result = await request("POST", "/orders", body, alice);
  assert.equal(result.status, 201);
  created = result.data;
  assert.equal(created.email, "alice@example.test");
  assert.equal(created.totalCents, 1870);
  const repeat = await request("POST", "/orders", body, alice);
  assert.equal(repeat.data._id, created._id);
  assert.equal(await Order.countDocuments(), 1);
  const carol = await request("POST", "/auth/signup", {
    name: "Carol",
    email: "carol@example.test",
    password: secret,
  });
  assert.equal(
    (await request("GET", `/orders/${created._id}`, null, carol.cookie)).status,
    404,
  );
});
test("state transitions, paid reporting and menu archives preserve order history", async () => {
  assert.equal(
    (
      await request(
        "PATCH",
        `/admin/orders/${created._id}`,
        { status: "delivered" },
        admin,
      )
    ).status,
    409,
  );
  for (const status of [
    "confirmed",
    "preparing",
    "out-for-delivery",
    "delivered",
  ])
    assert.equal(
      (
        await request(
          "PATCH",
          `/admin/orders/${created._id}`,
          { status },
          admin,
        )
      ).status,
      200,
    );
  assert.equal(
    (await request("GET", "/admin/stats", null, admin)).data.revenue,
    0,
  );
  assert.equal(
    (
      await request(
        "PATCH",
        `/admin/orders/${created._id}`,
        { paymentStatus: "paid" },
        admin,
      )
    ).status,
    200,
  );
  assert.equal(
    (await request("GET", "/admin/stats", null, admin)).data.revenue,
    1870,
  );
  assert.equal(
    (await request("DELETE", `/products/${dish._id}`, null, admin)).status,
    204,
  );
  assert.equal(
    (await request("GET", `/orders/${created._id}`, null, alice)).data.items[0]
      .name,
    "Test burger",
  );
});
test("support messages are private and customer responses exclude password hashes", async () => {
  assert.equal(
    (
      await request("POST", "/messages", {
        name: "Alice",
        email: "alice@example.test",
        message: "I have a question about my order.",
      })
    ).status,
    201,
  );
  assert.equal(
    (await request("GET", "/admin/messages", null, alice)).status,
    403,
  );
  const customers = await request("GET", "/admin/customers", null, admin);
  assert.equal(customers.status, 200);
  assert.ok(customers.data.every((u) => !u.password && !u.resetHash));
});
test("image uploads enforce admin access, validate bytes and persist deduplicated public images", async () => {
  const image = await fs.readFile(
    path.join(__dirname, "../../client/public/icon-192.png"),
  );
  const headers = { "Content-Type": "image/png", Cookie: admin };
  assert.equal(
    (
      await fetch(base + "/uploads", {
        method: "POST",
        headers: { ...headers, Cookie: alice },
        body: image,
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await fetch(base + "/uploads", {
        method: "POST",
        headers,
        body: Buffer.from("not an image file"),
      })
    ).status,
    400,
  );
  const upload = await fetch(base + "/uploads", {
    method: "POST",
    headers,
    body: image,
  });
  assert.equal(upload.status, 200);
  const { url } = await upload.json();
  assert.match(url, /^\/api\/media\/[a-f0-9]{24}$/);
  const publicImage = await fetch(base.replace(/\/api$/, "") + url);
  assert.equal(publicImage.status, 200);
  assert.equal(publicImage.headers.get("content-type"), "image/png");
  assert.ok(publicImage.headers.get("cache-control").includes("immutable"));
  assert.deepEqual(Buffer.from(await publicImage.arrayBuffer()), image);
  const again = await fetch(base + "/uploads", {
    method: "POST",
    headers,
    body: image,
  });
  assert.equal((await again.json()).url, url);
  assert.equal(await Media.countDocuments(), 1);
  const dishWithImage = await request(
    "POST",
    "/products",
    { name: "Uploaded image dish", price: 2, category: "Burger", image: url },
    admin,
  );
  assert.equal(dishWithImage.status, 201);
  await request("DELETE", `/products/${dishWithImage.data._id}`, null, admin);
});
test("reset links are one-use and invalidate old sessions; logout revokes sessions", async () => {
  await request("POST", "/auth/forgot-password", {
    email: "alice@example.test",
  });
  const file = path.join(
    __dirname,
    "../.local-mail",
    crypto.createHash("sha256").update("alice@example.test").digest("hex") +
      ".txt",
  );
  const mail = await fs.readFile(file, "utf8");
  const token = mail.match(/reset-password\/([a-f0-9]+)/)[1];
  assert.equal(
    (
      await request("POST", "/auth/reset-password", {
        token,
        password: "New-test-password-9274",
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request("POST", "/auth/reset-password", {
        token,
        password: "Another-test-password",
      })
    ).status,
    400,
  );
  assert.equal((await request("GET", "/auth/me", null, alice)).status, 401);
  assert.equal(
    (await request("POST", "/auth/logout", null, admin)).status,
    204,
  );
  assert.equal(
    (await request("GET", "/admin/orders", null, admin)).status,
    401,
  );
  await fs.unlink(file);
});
