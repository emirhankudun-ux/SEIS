import fs from "node:fs";
import path from "node:path";

const [sourceArg = ".", outputArg = "dist"] = process.argv.slice(2);
const sourceRoot = path.resolve(process.cwd(), sourceArg);
const outputRoot = path.resolve(sourceRoot, outputArg);
const ignored = new Set([".DS_Store", "dist", "node_modules", "package-lock.json"]);

function copyDirectory(source, target) {
  fs.mkdirSync(target, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;

    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
      continue;
    }

    if (entry.isFile()) fs.copyFileSync(sourcePath, targetPath);
  }
}

fs.rmSync(outputRoot, { force: true, recursive: true });
copyDirectory(sourceRoot, outputRoot);

console.log(`Static app build created at ${path.relative(process.cwd(), outputRoot)}.`);
