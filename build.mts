import fs from "node:fs/promises";
import { analyzeMetafile, build } from "esbuild";

const extension = {
    esm: ".mjs",
} as const;

const format = "esm" as const;

await fs.rm("dist", { recursive: true, force: true });

const result = await build({
    entryPoints: ["src/index.ts"],
    outdir: `dist/${format}`,
    bundle: true,
    format,
    platform: "node",
    target: "node22",
    logLevel: "info",
    metafile: true,
    outExtension: {
        ".js": extension[format],
    },
});
// eslint-disable-next-line no-console -- intended for CLI output
console.log(await analyzeMetafile(result.metafile));
