require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
async function start() {
  if (!process.env.MONGODB_URI)
    throw new Error("MONGODB_URI is required. See .env.example.");
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
  });
  const app = require("./app");
  await Promise.all(
    Object.values(require("./lib/models")).map((model) => model.init()),
  );
  const server = app.listen(process.env.PORT || 5000, () =>
    console.log("FOOD API ready on port", process.env.PORT || 5000),
  );
  for (const signal of ["SIGTERM", "SIGINT"])
    process.on(signal, () =>
      server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      }),
    );
}
start().catch((error) => {
  console.error("API startup failed:", error.name);
  process.exit(1);
});
