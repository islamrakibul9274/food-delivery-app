const mongoose = require("mongoose");
const { Schema } = mongoose;
const address = new Schema(
  { label: String, name: String, phone: String, line: String, area: String },
  { _id: true },
);
const User = mongoose.model(
  "User",
  new Schema(
    {
      name: { type: String, required: true, maxlength: 80 },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      password: { type: String, required: true, select: false },
      role: { type: String, enum: ["user", "admin"], default: "user" },
      addresses: { type: [address], default: [] },
      favorites: [{ type: Schema.Types.ObjectId, ref: "Product" }],
      resetHash: { type: String, select: false },
      resetExpires: Date,
    },
    { timestamps: true },
  ),
);
const Product = mongoose.model(
  "Product",
  new Schema(
    {
      name: { type: String, required: true, maxlength: 100 },
      slug: { type: String, unique: true, sparse: true },
      description: { type: String, maxlength: 1000, default: "" },
      price: { type: Number, required: true, min: 0.01, max: 10000 },
      image: { type: String, required: true },
      category: {
        type: String,
        enum: ["Burger", "Pizza", "Pasta", "Dessert", "Drink"],
        required: true,
      },
      weight: { type: String, default: "" },
      allergens: { type: String, default: "" },
      addOns: [{ key: String, name: String, priceCents: Number }],
      vegetarian: { type: Boolean, default: false },
      available: { type: Boolean, default: true },
      archived: { type: Boolean, default: false },
      featured: { type: Boolean, default: false },
    },
    { timestamps: true },
  ),
);
const Order = mongoose.model(
  "Order",
  new Schema(
    {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      email: String,
      number: { type: String, unique: true, sparse: true },
      items: [
        {
          productId: Schema.Types.ObjectId,
          name: String,
          quantity: Number,
          price: Number,
          priceCents: Number,
          image: String,
          note: String,
          addOns: [{ key: String, name: String, priceCents: Number }],
        },
      ],
      subtotalCents: Number,
      deliveryCents: Number,
      totalCents: Number,
      totalAmount: Number,
      currency: { type: String, default: "USD" },
      fulfilment: {
        type: String,
        enum: ["delivery", "pickup"],
        default: "delivery",
      },
      contact: {
        name: String,
        phone: String,
        line: String,
        area: String,
        instructions: String,
      },
      demo: { type: Boolean, default: false },
      paymentMethod: { type: String, default: "cash" },
      paymentStatus: {
        type: String,
        enum: ["unpaid", "paid"],
        default: "unpaid",
      },
      status: {
        type: String,
        enum: [
          "pending",
          "confirmed",
          "preparing",
          "out-for-delivery",
          "ready",
          "delivered",
          "cancelled",
        ],
        default: "pending",
      },
      history: [{ status: String, at: Date }],
      requestKey: { type: String, unique: true, sparse: true },
    },
    { timestamps: true },
  ),
);
const Session = mongoose.model(
  "Session",
  new Schema({
    hash: { type: String, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    expires: { type: Date, expires: 0 },
  }),
);
const Settings = mongoose.model(
  "Settings",
  new Schema({
    _id: { type: String, default: "restaurant" },
    name: String,
    tagline: String,
    email: String,
    phone: String,
    address: String,
    hours: String,
    timezone: String,
    currency: String,
    deliveryFeeCents: Number,
    minimumCents: Number,
    deliveryAreas: [String],
    demoMode: Boolean,
    orderingEnabled: Boolean,
    pickupEnabled: Boolean,
  }),
);
const Message = mongoose.model(
  "Message",
  new Schema(
    {
      name: String,
      email: String,
      message: String,
      resolved: { type: Boolean, default: false },
    },
    { timestamps: true },
  ),
);
const Audit = mongoose.model(
  "Audit",
  new Schema(
    { actor: String, action: String, resource: String },
    { timestamps: true },
  ),
);
module.exports = { User, Product, Order, Session, Settings, Message, Audit };
