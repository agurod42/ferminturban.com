import { seedContentStore } from "../api/_lib/content-store.js";

const reset = process.argv.includes("--reset");

try {
  const result = await seedContentStore(reset);
  console.log(
    `${reset ? "Reset and seeded" : "Seeded"} ${result.data.length} projects into ${result.source} storage at ${result.syncedAt}.`,
  );
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Failed to seed admin content store.",
  );
  process.exit(1);
}
