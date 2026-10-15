const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const {
  User,
  Product,
  Order,
  Session,
  Settings,
  Message,
  Audit,
} = require("./lib/models");
const {
  fail,
  text,
  email,
  password,
  hash,
  defaults,
  calculate,
  nextStates,
} = require("./lib/domain");
const app = express();
const production = process.env.NODE_ENV === "production";
const origins = (
  process.env.ALLOWED_ORIGINS ||
  "http://localhost:5173,http://127.0.0.1:5173,https://food-delivery-app-smoky-sigma.vercel.app"
)
  .split(",")
  .map((s) => s.trim());
app.disable("x-powered-by");
if (production) app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: origins, credentials: true }));
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    if (req.headers.origin && !origins.includes(req.headers.origin))
      return res.status(403).json({ message: "This origin is not allowed." });
    if (req.headers["sec-fetch-site"] === "cross-site")
      return res
        .status(403)
        .json({ message: "Cross-site requests are not allowed." });
  }
  next();
});
app.use(
  "/api",
  rateLimit({
    windowMs: 60000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);
app.use(express.json({ limit: "32kb" }));
const limited = rateLimit({
  windowMs: 15 * 60000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
});
const safeUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  addresses: u.addresses || [],
  favorites: u.favorites || [],
});
const cookie = (res, value, maxAge = 7 * 86400000) =>
  res.cookie("food_session", value, {
    httpOnly: true,
    secure: production,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
const cookieValue = (req) =>
  /(?:^|;\s*)food_session=([^;]+)/.exec(req.headers.cookie || "")?.[1];
async function auth(req, res, next) {
  const token = cookieValue(req);
  const session =
    token &&
    (await Session.findOne({
      hash: hash(token),
      expires: { $gt: new Date() },
    }));
  const user = session && (await User.findById(session.userId));
  if (!user)
    return res.status(401).json({ message: "Please sign in to continue." });
  req.user = user;
  req.session = session;
  next();
}
const admin = (req, res, next) =>
  req.user.role === "admin"
    ? next()
    : res.status(403).json({ message: "Administrator access is required." });
const id = (value) => {
  if (!mongoose.isObjectIdOrHexString(value)) fail(400, "Invalid record ID.");
  return value;
};
const settings = async () => ({
  ...defaults,
  ...((await Settings.findById("restaurant").lean()) || {}),
});
const audit = (req, action, resource) =>
  Audit.create({ actor: req.user.email, action, resource: String(resource) });
async function startSession(res, user) {
  const token = crypto.randomBytes(32).toString("hex");
  await Session.create({
    hash: hash(token),
    userId: user._id,
    expires: new Date(Date.now() + 7 * 86400000),
  });
  cookie(res, token);
}
app.get("/", (req, res) => res.json({ status: "ok" }));
app.get("/api/health", (req, res) =>
  res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
    database:
      mongoose.connection.readyState === 1 ? "connected" : "unavailable",
  }),
);
app.get("/api/settings", async (req, res) =>
  res.json({ ...(await settings()), preview: !production }),
);
app.post("/api/auth/signup", limited, async (req, res) => {
  const address = email(req.body.email);
  const pass = password(req.body.password);
  if (await User.exists({ email: address }))
    fail(409, "An account already exists with this email. Please sign in.");
  const user = await User.create({
    name: text(req.body.name, "Name", 2, 80),
    email: address,
    password: await bcrypt.hash(pass, 12),
  });
  await startSession(res, user);
  res.status(201).json(safeUser(user));
});
app.post("/api/auth/login", limited, async (req, res) => {
  const user = await User.findOne({ email: email(req.body.email) }).select(
    "+password",
  );
  // Use the same response for unknown accounts and incorrect passwords.
  const valid = user
    ? await bcrypt.compare(String(req.body.password || ""), user.password)
    : await bcrypt.compare(
        "invalid",
        "$2b$12$zO09WdDiOOmAnDzMhgBRieCUARSKcEJ72ajDr87QwxqmQnBfrgRZ6",
      );
  if (!user || !valid) fail(401, "Email or password is incorrect.");
  await startSession(res, user);
  res.json(safeUser(user));
});
app.get("/api/auth/me", auth, (req, res) => res.json(safeUser(req.user)));
app.post("/api/auth/logout", async (req, res) => {
  const token = cookieValue(req);
  if (token) await Session.deleteOne({ hash: hash(token) });
  cookie(res, "", 0);
  res.status(204).end();
});
app.post("/api/auth/forgot-password", limited, async (req, res) => {
  const user = await User.findOne({ email: email(req.body.email) });
  if (production && (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM))
    fail(
      503,
      "Password recovery is not configured yet. Please contact the restaurant.",
    );
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    user.resetHash = hash(token);
    user.resetExpires = new Date(Date.now() + 30 * 60000);
    await user.save();
    const url = `${process.env.APP_URL || "http://localhost:5173"}/reset-password/${token}`;
    if (production) {
      const result = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.MAIL_FROM,
          to: user.email,
          subject: "Reset your FOOD password",
          text: `Reset your password within 30 minutes: ${url}\nIf you did not request this, ignore this message.`,
        }),
      });
      if (!result.ok)
        fail(502, "The email service is unavailable. Please try again later.");
    } else {
      const dir = path.join(__dirname, ".local-mail");
      await fs.mkdir(dir, { recursive: true, mode: 0o700 });
      await fs.writeFile(
        path.join(dir, `${hash(user.email)}.txt`),
        `Password reset for ${user.email}\n${url}\n`,
        { mode: 0o600 },
      );
    }
  }
  res.json({
    message: "If an account exists, a reset link has been sent.",
    localMail: !production,
  });
});
app.post("/api/auth/reset-password", limited, async (req, res) => {
  const pass = password(req.body.password);
  const token = text(req.body.token, "Reset token", 64, 64);
  const updated = await User.findOneAndUpdate(
    { resetHash: hash(token), resetExpires: { $gt: new Date() } },
    {
      $set: { password: await bcrypt.hash(pass, 12) },
      $unset: { resetHash: 1, resetExpires: 1 },
    },
  );
  if (!updated)
    fail(
      400,
      "This link has expired or has already been used. Request another one.",
    );
  await Session.deleteMany({ userId: updated._id });
  cookie(res, "", 0);
  res.json({ message: "Password updated. Please sign in." });
});
app.patch("/api/account", auth, async (req, res) => {
  req.user.name = text(req.body.name, "Name", 2, 80);
  await req.user.save();
  res.json(safeUser(req.user));
});
app.post("/api/account/password", auth, limited, async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  if (
    !(await bcrypt.compare(
      String(req.body.currentPassword || ""),
      user.password,
    ))
  )
    fail(400, "Current password is incorrect.");
  user.password = await bcrypt.hash(password(req.body.password), 12);
  user.resetHash = undefined;
  user.resetExpires = undefined;
  await user.save();
  await Session.deleteMany({ userId: user._id });
  await startSession(res, user);
  res.json({ message: "Password updated." });
});
app.put("/api/account/addresses", auth, async (req, res) => {
  if (!Array.isArray(req.body.addresses) || req.body.addresses.length > 5)
    fail(400, "Save up to five addresses.");
  req.user.addresses = req.body.addresses.map((a) => ({
    label: text(a.label, "Label", 1, 30),
    name: text(a.name, "Name", 2, 80),
    phone: text(a.phone, "Phone", 5, 30),
    line: text(a.line, "Address", 5, 250),
    area: text(a.area, "Area", 1, 100),
  }));
  await req.user.save();
  res.json(safeUser(req.user));
});
app.put("/api/account/favorites/:id", auth, async (req, res) => {
  const productId = id(req.params.id);
  if (!(await Product.exists({ _id: productId, archived: { $ne: true } })))
    fail(404, "Dish not found.");
  const exists = req.user.favorites.some((x) => String(x) === productId);
  req.user.favorites = exists
    ? req.user.favorites.filter((x) => String(x) !== productId)
    : [...req.user.favorites, productId];
  await req.user.save();
  res.json(safeUser(req.user));
});
app.get("/api/products", async (req, res) =>
  res.json(
    await Product.find({ archived: { $ne: true } })
      .sort({ featured: -1, createdAt: 1 })
      .lean(),
  ),
);
app.get("/api/products/:slug", async (req, res) => {
  const query = mongoose.isObjectIdOrHexString(req.params.slug)
    ? { _id: req.params.slug }
    : { slug: req.params.slug };
  const product = await Product.findOne({ ...query, archived: { $ne: true } });
  if (!product) fail(404, "This dish is no longer on the menu.");
  res.json(product);
});
function productInput(body) {
  const name = text(body.name, "Dish name", 2, 100);
  if (!["Burger", "Pizza", "Pasta", "Dessert", "Drink"].includes(body.category))
    fail(400, "Choose a valid category.");
  if (
    typeof body.price !== "number" ||
    !Number.isFinite(body.price) ||
    body.price < 0.01 ||
    body.price > 10000
  )
    fail(400, "Enter a valid price.");
  const image = text(body.image, "Image", 1, 2000);
  if (!/^https:\/\/[^\s]+$/.test(image) && !/^\/food\/[\w.-]+$/.test(image))
    fail(400, "Use an HTTPS image URL or a bundled food image.");
  const rawOptions = body.addOns || [];
  if (!Array.isArray(rawOptions) || rawOptions.length > 8)
    fail(400, "Choose up to eight add-ons.");
  const addOns = rawOptions.map((o) => {
    const key = text(o.key, "Option key", 1, 50);
    if (
      !/^[a-z0-9-]+$/.test(key) ||
      !Number.isInteger(o.priceCents) ||
      o.priceCents < 0 ||
      o.priceCents > 10000
    )
      fail(400, "Invalid add-on or price.");
    return {
      key,
      name: text(o.name, "Add-on name", 1, 80),
      priceCents: o.priceCents,
    };
  });
  if (new Set(addOns.map((o) => o.key)).size !== addOns.length)
    fail(400, "Add-on keys must be unique.");
  return {
    name,
    addOns,
    category: body.category,
    price: Math.round(body.price * 100) / 100,
    image,
    description: text(body.description || "", "Description", 0, 1000),
    weight: text(body.weight || "", "Portion", 0, 60),
    allergens: text(body.allergens || "", "Allergens", 0, 300),
    available: body.available !== false,
    featured: body.featured === true,
    vegetarian: body.vegetarian === true,
  };
}
app.post("/api/products", auth, admin, async (req, res) => {
  const data = productInput(req.body);
  const slug =
    data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    crypto.randomBytes(3).toString("hex");
  const product = await Product.create({ ...data, slug });
  await audit(req, "Created dish", product.name);
  res.status(201).json(product);
});
app.put("/api/products/:id", auth, admin, async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: id(req.params.id), archived: { $ne: true } },
    productInput(req.body),
    { returnDocument: "after", runValidators: true },
  );
  if (!product) fail(404, "Dish not found.");
  await audit(req, "Updated dish", product.name);
  res.json(product);
});
app.delete("/api/products/:id", auth, admin, async (req, res) => {
  const product = await Product.findByIdAndUpdate(id(req.params.id), {
    archived: true,
    available: false,
  });
  if (!product) fail(404, "Dish not found.");
  await audit(req, "Archived dish", product.name);
  res.status(204).end();
});
app.post(
  "/api/uploads",
  auth,
  admin,
  express.raw({
    type: ["image/jpeg", "image/png", "image/webp"],
    limit: "5mb",
  }),
  async (req, res) => {
    if (!process.env.IMGBB_API_KEY)
      fail(
        503,
        "Image upload is not configured. Use an HTTPS image URL instead.",
      );
    if (!Buffer.isBuffer(req.body) || req.body.length < 12)
      fail(400, "Choose a JPEG, PNG, or WebP image under 5 MB.");
    const b = req.body;
    const valid =
      b.subarray(0, 3).equals(Buffer.from([255, 216, 255])) ||
      b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
      (b.toString("ascii", 0, 4) === "RIFF" &&
        b.toString("ascii", 8, 12) === "WEBP");
    if (!valid) fail(400, "Unsupported image format.");
    const form = new URLSearchParams({ image: b.toString("base64") });
    let result;
    try {
      result = await fetch(
        `https://api.imgbb.com/1/upload?key=${encodeURIComponent(process.env.IMGBB_API_KEY)}`,
        {
          method: "POST",
          body: form,
          signal: AbortSignal.timeout(30000),
          headers: { "User-Agent": "FOOD-Image-Upload/1.0" },
        },
      );
    } catch (error) {
      console.error("Image host connection failed", { type: error.name });
      fail(
        502,
        "The image host is unavailable. Try an HTTPS image URL instead.",
      );
    }
    const data = await result.json().catch(() => null);
    if (
      !result.ok ||
      !data?.success ||
      !/^https:\/\//.test(data?.data?.url || "")
    ) {
      console.error("Image host rejected upload", {
        status: result.status,
        code: data?.error?.code,
      });
      fail(
        502,
        "The image host rejected this upload. Try an HTTPS image URL instead.",
      );
    }
    res.json({ url: data.data.url });
  },
);
const ownerQuery = (user) => ({
  $or: [
    { userId: user._id },
    { userId: { $exists: false }, email: user.email },
  ],
});
app.post("/api/orders", auth, async (req, res) => {
  const config = await settings();
  if (!config.orderingEnabled)
    fail(409, "The kitchen is not accepting orders right now.");
  const fulfilment = req.body.fulfilment;
  if (
    !["delivery", "pickup"].includes(fulfilment) ||
    (fulfilment === "pickup" && !config.pickupEnabled)
  )
    fail(400, "Choose an available fulfilment method.");
  const contact = req.body.contact || {};
  const details = {
    name: text(contact.name, "Name", 2, 80),
    phone: text(contact.phone, "Phone", 5, 30),
    instructions: text(contact.instructions || "", "Instructions", 0, 400),
    line: "",
    area: "",
  };
  if (fulfilment === "delivery") {
    details.line = text(contact.line, "Delivery address", 5, 250);
    details.area = text(contact.area, "Delivery area", 1, 100);
    if (!config.deliveryAreas.includes(details.area))
      fail(400, "Delivery is unavailable in this area.");
  }
  const key = text(req.body.requestKey, "Order reference", 16, 80);
  const requestKey = `${req.user._id}:${key}`;
  const existing = await Order.findOne({ requestKey });
  if (existing) return res.json(existing);
  if (!Array.isArray(req.body.items)) fail(400, "Choose menu items.");
  const productIds = req.body.items.map((x) => id(x.productId));
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const totals = calculate(req.body.items, products, config, fulfilment);
  if (req.body.expectedTotalCents !== totals.totalCents)
    return res.status(409).json({
      message:
        "Prices or delivery fees changed. Review the updated total before ordering.",
      totalCents: totals.totalCents,
    });
  try {
    const order = await Order.create({
      ...totals,
      userId: req.user._id,
      email: req.user.email,
      number: "FD-" + crypto.randomBytes(4).toString("hex").toUpperCase(),
      requestKey,
      currency: config.currency,
      demo: config.demoMode === true,
      fulfilment,
      contact: details,
      history: [{ status: "pending", at: new Date() }],
    });
    res.status(201).json(order);
  } catch (e) {
    if (e.code === 11000) return res.json(await Order.findOne({ requestKey }));
    throw e;
  }
});
app.get("/api/orders", auth, async (req, res) =>
  res.json(
    await Order.find(ownerQuery(req.user)).sort({ createdAt: -1 }).limit(100),
  ),
);
app.get("/api/orders/:id", auth, async (req, res) => {
  const order = await Order.findOne({
    _id: id(req.params.id),
    ...(req.user.role === "admin" ? {} : ownerQuery(req.user)),
  });
  if (!order) fail(404, "Order not found.");
  res.json(order);
});
app.post("/api/orders/:id/cancel", auth, async (req, res) => {
  const order = await Order.findOneAndUpdate(
    { _id: id(req.params.id), ...ownerQuery(req.user), status: "pending" },
    {
      $set: { status: "cancelled" },
      $push: { history: { status: "cancelled", at: new Date() } },
    },
    { returnDocument: "after" },
  );
  if (!order)
    fail(409, "Only an order awaiting confirmation can be cancelled.");
  res.json(order);
});
app.post("/api/messages", limited, async (req, res) => {
  await Message.create({
    name: text(req.body.name, "Name", 2, 80),
    email: email(req.body.email),
    message: text(req.body.message, "Message", 10, 2000),
  });
  res.status(201).json({
    message:
      "Your message is saved. The restaurant team can read it in their support inbox.",
  });
});
app.use("/api/admin", auth, admin);
app.get("/api/admin/orders", async (req, res) => {
  const page = Math.max(1, Math.min(10000, Number(req.query.page) || 1));
  const query = {};
  for (const bound of ["from", "to"])
    if (req.query[bound]) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(req.query[bound]))
        fail(400, "Use a valid date filter.");
      const value = new Date(
        req.query[bound] +
          (bound === "to" ? "T23:59:59.999Z" : "T00:00:00.000Z"),
      );
      if (!Number.isFinite(value.getTime()))
        fail(400, "Use a valid date filter.");
      query.createdAt = {
        ...query.createdAt,
        [bound === "from" ? "$gte" : "$lte"]: value,
      };
    }
  if (req.query.status && req.query.status !== "all")
    query.status = String(req.query.status);
  if (req.query.q) {
    const q = String(req.query.q)
      .slice(0, 100)
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { email: new RegExp(q, "i") },
      { number: new RegExp(q, "i") },
      { "contact.name": new RegExp(q, "i") },
    ];
  }
  res.json({
    items: await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * 20)
      .limit(20),
    total: await Order.countDocuments(query),
    page,
  });
});
app.patch("/api/admin/orders/:id", async (req, res) => {
  const order = await Order.findById(id(req.params.id));
  if (!order) fail(404, "Order not found.");
  const update = {};
  const push = {};
  if (req.body.status && req.body.status !== order.status) {
    if (!nextStates(order).includes(req.body.status))
      fail(409, "This order status transition is not allowed.");
    update.status = req.body.status;
    push.history = { status: req.body.status, at: new Date() };
  }
  if (req.body.paymentStatus) {
    if (!["paid", "unpaid"].includes(req.body.paymentStatus))
      fail(400, "Invalid payment status.");
    update.paymentStatus = req.body.paymentStatus;
  }
  const result = await Order.findOneAndUpdate(
    { _id: order._id, status: order.status },
    { $set: update, ...(push.history ? { $push: push } : {}) },
    { returnDocument: "after" },
  );
  if (!result) fail(409, "This order changed. Please refresh.");
  await audit(req, "Updated order", order.number || order._id);
  res.json(result);
});
app.get("/api/admin/customers", async (req, res) => {
  const users = await User.find()
    .select("name email role createdAt")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  const counts = await Order.aggregate([
    { $group: { _id: "$email", count: { $sum: 1 } } },
  ]);
  res.json(
    users.map((u) => ({
      ...u,
      orders: counts.find((c) => c._id === u.email)?.count || 0,
    })),
  );
});
app.get("/api/admin/stats", async (req, res) => {
  const days = [7, 30, 90].includes(Number(req.query.days))
    ? Number(req.query.days)
    : 30;
  const since = new Date(Date.now() - days * 86400000);
  const query = { createdAt: { $gte: since } };
  const [orders, products, customers, pending] = await Promise.all([
    Order.find(query).sort({ createdAt: 1 }).lean(),
    Product.countDocuments({ archived: { $ne: true } }),
    User.countDocuments(),
    Order.countDocuments({ status: { $nin: ["delivered", "cancelled"] } }),
  ]);
  const paid = orders.filter(
    (o) => o.paymentStatus === "paid" && o.status !== "cancelled",
  );
  const revenue = paid.reduce(
    (s, o) => s + (o.totalCents ?? Math.round(o.totalAmount * 100)),
    0,
  );
  const sales = new Map();
  for (const order of paid)
    for (const line of order.items)
      sales.set(line.name, (sales.get(line.name) || 0) + line.quantity);
  const bestSellers = [...sales.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }));
  res.json({
    bestSellers,
    days,
    revenue,
    paidOrders: paid.length,
    orders: orders.length,
    completed: orders.filter((o) => o.status === "delivered").length,
    pending,
    products,
    customers,
    average: paid.length ? Math.round(revenue / paid.length) : 0,
    recent: orders.slice(-5).reverse(),
  });
});
app.get("/api/admin/messages", async (req, res) =>
  res.json(await Message.find().sort({ createdAt: -1 }).limit(100)),
);
app.patch("/api/admin/messages/:id", async (req, res) => {
  const message = await Message.findByIdAndUpdate(
    id(req.params.id),
    { resolved: req.body.resolved === true },
    { returnDocument: "after" },
  );
  if (!message) fail(404, "Message not found.");
  res.json(message);
});
app.get("/api/admin/audit", async (req, res) =>
  res.json(await Audit.find().sort({ createdAt: -1 }).limit(50)),
);
app.put("/api/admin/settings", async (req, res) => {
  const b = req.body;
  const data = {
    name: text(b.name, "Restaurant name", 2, 80),
    tagline: text(b.tagline || "", "Tagline", 0, 150),
    email: b.email ? email(b.email) : "",
    phone: text(b.phone || "", "Phone", 0, 30),
    address: text(b.address || "", "Address", 0, 250),
    hours: text(b.hours || "", "Hours", 0, 250),
    timezone: text(b.timezone, "Timezone", 1, 60),
    currency: text(b.currency, "Currency", 3, 3).toUpperCase(),
    demoMode: b.demoMode === true,
    orderingEnabled: b.orderingEnabled === true,
    pickupEnabled: b.pickupEnabled === true,
  };
  try {
    new Intl.DateTimeFormat("en", { timeZone: data.timezone });
    const fmt = new Intl.NumberFormat("en", {
      style: "currency",
      currency: data.currency,
    });
    if (fmt.resolvedOptions().maximumFractionDigits !== 2)
      fail(400, "Choose a currency with two decimal places.");
  } catch {
    fail(400, "Enter a valid timezone and currency.");
  }
  for (const key of ["deliveryFeeCents", "minimumCents"]) {
    if (!Number.isInteger(b[key]) || b[key] < 0 || b[key] > 100000)
      fail(400, "Fees and minimum must be valid amounts.");
    data[key] = b[key];
  }
  if (!Array.isArray(b.deliveryAreas) || b.deliveryAreas.length > 50)
    fail(400, "Enter up to 50 delivery areas.");
  data.deliveryAreas = [
    ...new Set(b.deliveryAreas.map((a) => text(a, "Area", 1, 100))),
  ];
  const updated = await Settings.findByIdAndUpdate("restaurant", data, {
    upsert: true,
    returnDocument: "after",
  });
  await audit(req, "Updated restaurant settings", "restaurant");
  res.json(updated);
});
app.use((req, res) =>
  res.status(404).json({ message: "This API endpoint does not exist." }),
);
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status =
    err.status ||
    (err.code === 11000 ? 409 : err.name === "ValidationError" ? 400 : 500);
  if (status === 500)
    console.error("Request failed", {
      method: req.method,
      path: req.path,
      type: err.name,
    });
  res.status(status).json({
    message:
      status === 500
        ? "Something went wrong. Please try again."
        : err.code === 11000
          ? "This record already exists."
          : err.message,
  });
});
module.exports = app;
