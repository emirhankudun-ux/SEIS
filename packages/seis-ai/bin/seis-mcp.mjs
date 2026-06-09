#!/usr/bin/env node
import { startServer } from "../src/mcp/server.mjs";

startServer().catch((error) => {
  console.error("seis-mcp failed to start:", error.message);
  process.exit(1);
});
