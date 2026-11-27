// Black Friday Radar — a tiny static server for the site.
//
// Serves app/ at http://localhost:8080 (or --port <n>). Standard
// library only; nothing is installed and nothing leaves the disk.
//
//   node serve.ts
//   node serve.ts --port 8081

import { createReadStream } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { stat } from "node:fs/promises";

const appDir = join(dirname(fileURLToPath(import.meta.url)), "app");

const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function portFromArgs(argv: string[]): number {
  const flag = argv.indexOf("--port");
  if (flag >= 0 && argv[flag + 1]) {
    const port = Number.parseInt(argv[flag + 1], 10);
    if (Number.isInteger(port) && port > 0 && port < 65536) return port;
  }
  return 8080;
}

const port = portFromArgs(process.argv.slice(2));

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    let path = decodeURIComponent(url.pathname);
    if (path === "/") path = "/index.html";
    const file = resolve(join(appDir, normalize(path)));
    // A request must stay inside app/: no climbing out with "..".
    if (!file.startsWith(appDir + "/") && file !== appDir) {
      res.writeHead(403, { "content-type": "text/plain" });
      res.end("Forbidden\n");
      return;
    }
    const info = await stat(file);
    if (!info.isFile()) throw new Error("not a file");
    res.writeHead(200, {
      "content-type": types[extname(file).toLowerCase()] || "application/octet-stream",
    });
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found\n");
  }
});

server.listen(port, () => {
  console.log("Black Friday Radar at http://localhost:" + port + "/");
});
