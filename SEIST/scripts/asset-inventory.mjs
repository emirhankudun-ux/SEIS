import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const drawingDir = "apps/web/public/media/drawings";
const rows = readdirSync(drawingDir)
  .filter(name => name.endsWith(".jpg"))
  .sort()
  .map(name => {
    const size = statSync(join(drawingDir, name)).size;
    const group = name.startsWith("karakalem") ? "karakalem" : "renk";
    return { name, group, size };
  });

console.table(rows);
console.log(`Total assets: ${rows.length}`);

