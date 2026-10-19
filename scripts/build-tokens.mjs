// Gera styles/tokens.css a partir de design/tokens.json.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = JSON.parse(readFileSync(resolve(root, "design/tokens.json"), "utf8"));

const decl = (name, value) => `  --${name}: ${value};`;
const themed = (tokens, theme) =>
  tokens.map((t) => decl(t.name, typeof t.value === "string" ? t.value : t.value[theme]));

const themedTokens = [...src.color.tokens, ...src.shadow.tokens];
const light = themed(themedTokens, "light");
const dark = themed(themedTokens, "dark");
const plain = [
  ...src.spacing.tokens.map((t) => decl(t.name, t.value)),
  ...src.radius.tokens.map((t) => decl(t.name, t.value)),
  decl("font-display", src.type.families.display),
  decl("font-sans", src.type.families.sans),
];

const indent = (lines) => lines.map((l) => "  " + l).join("\n");

const css = `/* Gerado por scripts/build-tokens.mjs a partir de design/tokens.json. Não edite à mão. */
:root {
${[...light, ...plain].join("\n")}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${indent(dark)}
  }
}

:root[data-theme="dark"] {
${dark.join("\n")}
}
`;

mkdirSync(resolve(root, "styles"), { recursive: true });
writeFileSync(resolve(root, "styles/tokens.css"), css);
console.log("styles/tokens.css gerado");
