// Gera public/icons/icon-192.png e icon-512.png a partir de pinha-icone-app.svg.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(resolve(root, "public/icons/pinha-icone-app.svg"));
for (const size of [192, 512]) {
  await sharp(svg, { density: 300 }).resize(size, size).png().toFile(resolve(root, `public/icons/icon-${size}.png`));
  console.log(`icon-${size}.png gerado`);
}
