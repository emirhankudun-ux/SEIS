import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const [sourceArg = ".", portArg = "4175"] = process.argv.slice(2);
const sourceRoot = path.resolve(process.cwd(), sourceArg);
const port = Number(portArg);

const mimeTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".xml": "application/xml"
};

function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const cleanPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(sourceRoot, `.${cleanPath}`);

  if (!filePath.startsWith(sourceRoot)) return null;
  return filePath;
}

const server = http.createServer((request, response) => {
  const filePath = resolveRequestPath(request.url ?? "/");

  if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] ?? "application/octet-stream" });
  fs.createReadStream(filePath).pipe(response);
});

server.listen(port, () => {
  console.log(`Static app available at http://localhost:${port}`);
});
