// Собирает статический сайт для Vercel в dist/: оборачивает web/index.html
// в полноценный HTML-документ и кладёт рядом poa.js и шрифт.
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, "fonts"), { recursive: true });

const page = readFileSync(join(root, "web", "index.html"), "utf8");
writeFileSync(
  join(dist, "index.html"),
  '<!doctype html><html lang="ru"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' +
    '<meta name="robots" content="noindex,nofollow">' +
    "<style>html{color-scheme:light}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>" +
    "</head><body>" + page + "</body></html>",
);
copyFileSync(join(root, "web", "poa.js"), join(dist, "poa.js"));
copyFileSync(join(root, "fonts", "OpenSans-Regular.ttf"), join(dist, "fonts", "OpenSans-Regular.ttf"));
console.log("dist/ ready");
