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
    [User, Product, Order, Session, Settings, Message, Audit].map((m) =>
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
test("image uploads verify admin access, validate image bytes and handle provider failures", async () => {
  const nativeFetch = global.fetch;
  const previousKey = process.env.IMGBB_API_KEY;
  process.env.IMGBB_API_KEY = "test-only-image-key";
  let reject = false;
  global.fetch = (url, options) =>
    String(url).startsWith("https://api.imgbb.com/")
      ? Promise.resolve(
          new Response(
            JSON.stringify(
              reject
                ? { success: false, error: { code: 42 } }
                : {
                    success: true,
                    data: { url: "https://images.example.test/dish.png" },
                  },
            ),
            {
              status: reject ? 429 : 200,
              headers: { "Content-Type": "application/json" },
            },
          ),
        )
      : nativeFetch(url, options);
  try {
    const headers = { "Content-Type": "image/png", Cookie: admin };
    const image = await fs.readFile(
      path.join(__dirname, "../../client/public/icon-192.png"),
    );
    assert.equal(
      (
        await nativeFetch(base + "/uploads", {
          method: "POST",
          headers: { ...headers, Cookie: alice },
          body: image,
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await nativeFetch(base + "/uploads", {
          method: "POST",
          headers,
          body: Buffer.from("not an image file"),
        })
      ).status,
      400,
    );
    const success = await nativeFetch(base + "/uploads", {
      method: "POST",
      headers,
      body: image,
    });
    assert.equal(success.status, 200);
    assert.equal(
      (await success.json()).url,
      "https://images.example.test/dish.png",
    );
    reject = true;
    const failed = await nativeFetch(base + "/uploads", {
      method: "POST",
      headers,
      body: image,
    });
    assert.equal(failed.status, 502);
    assert.ok(!(await failed.text()).includes("test-only-image-key"));
  } finally {
    global.fetch = nativeFetch;
    if (previousKey === undefined) delete process.env.IMGBB_API_KEY;
    else process.env.IMGBB_API_KEY = previousKey;
  }
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
