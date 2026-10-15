require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const { Product, Settings } = require("../lib/models");
const { defaults } = require("../lib/domain");
async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  if (mongoose.connection.name !== "food_delivery_local_preview_20261015")
    throw new Error(
      "Preview seed is restricted to the isolated preview database.",
    );
  const dishes = [
    {
      name: "The house burger",
      slug: "house-burger",
      category: "Burger",
      price: 8.5,
      image: "/food/burger.jpg",
      weight: "Single patty",
      description:
        "A beef patty, melted cheese, crisp lettuce and our house sauce in a toasted bun.",
      allergens: "Wheat, milk, egg",
      featured: true,
    },
    {
      name: "Margherita pizza",
      slug: "margherita",
      category: "Pizza",
      price: 11,
      image: "/food/pizza.jpg",
      weight: "12 inch",
      description:
        "Tomato, mozzarella and fresh basil. A simple pizza with nothing to hide behind.",
      allergens: "Wheat, milk",
      vegetarian: true,
      featured: true,
    },
    {
      name: "Basil pesto pasta",
      slug: "basil-pesto-pasta",
      category: "Pasta",
      price: 9.5,
      image: "/food/pasta.jpg",
      weight: "One bowl",
      description:
        "Pasta tossed with basil pesto, cherry tomatoes and a little parmesan.",
      allergens: "Wheat, milk, tree nuts",
      vegetarian: true,
      featured: true,
    },
    {
      name: "Chocolate cake",
      slug: "chocolate-cake",
      category: "Dessert",
      price: 5,
      image: "/food/cake.jpg",
      weight: "One slice",
      description:
        "Chocolate sponge, a generous layer of frosting, and a good reason to save room.",
      allergens: "Wheat, milk, egg",
      vegetarian: true,
      featured: true,
    },
    {
      name: "Citrus cooler",
      slug: "citrus-cooler",
      category: "Drink",
      price: 3.5,
      image: "/food/drink.jpg",
      weight: "One glass",
      description:
        "A bright, chilled citrus drink with fresh lime. Served without alcohol.",
      allergens: "Ask the kitchen about specific dietary requirements.",
      vegetarian: true,
    },
  ];
  for (const dish of dishes)
    await Product.updateOne(
      { slug: dish.slug },
      { $setOnInsert: { ...dish, available: true, archived: false } },
      { upsert: true },
    );
  await Product.updateOne(
    { slug: "house-burger", "addOns.0": { $exists: false } },
    {
      $set: {
        addOns: [
          { key: "extra-cheese", name: "Extra cheese", priceCents: 100 },
          { key: "extra-patty", name: "Extra beef patty", priceCents: 250 },
        ],
      },
    },
  );
  // Keep the original preview record and its ID, but give it a local optimized image.
  await Product.updateOne(
    { name: "Cheese Pasta", slug: { $exists: false } },
    {
      $set: {
        slug: "cheese-pasta",
        image: "/food/pasta.jpg",
        description: "A comforting bowl of pasta with a creamy cheese sauce.",
        allergens: "Wheat, milk",
        weight: "175 g",
        available: true,
      },
    },
  );
  await Settings.updateOne(
    { _id: "restaurant" },
    {
      $setOnInsert: {
        ...defaults,
        deliveryAreas: ["Preview delivery area"],
        orderingEnabled: true,
        pickupEnabled: true,
      },
    },
    { upsert: true },
  );
  console.log("Preview catalog ready. Production data was not accessed.");
  await mongoose.disconnect();
}
seed().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
