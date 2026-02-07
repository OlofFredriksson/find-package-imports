import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

import { findPackageImportsFromFile } from "./findPackageImportsFromFile.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("findPackageImportsFromFile", () => {
    it("scans fixtures directory and finds imports", () => {
        expect.assertions(1);
        const fixturesPath = path.join(__dirname, "..", "fixtures/src");
        const result = findPackageImportsFromFile(fixturesPath);

        expect(result).toMatchInlineSnapshot(`
            [
              {
                "import": "package-a",
                "package": "package-a",
                "packagePath": "fixtures/node_modules/package-a",
                "resolvesTo": "fixtures/node_modules/package-a/src/index.js",
              },
              {
                "import": "package-b",
                "package": "package-b",
                "packagePath": "fixtures/node_modules/package-b",
                "resolvesTo": "fixtures/node_modules/package-b/index.js",
              },
              {
                "import": "package-c",
                "package": "package-c",
                "packagePath": "fixtures/node_modules/package-c",
                "resolvesTo": "fixtures/node_modules/package-c/index.js",
              },
              {
                "import": "package-c/subExport",
                "package": "package-c",
                "packagePath": "fixtures/node_modules/package-c",
                "resolvesTo": "fixtures/node_modules/package-c/subExport.js",
              },
              {
                "import": "package-d",
                "package": "package-d",
                "packagePath": "fixtures/node_modules/package-d",
                "resolvesTo": "fixtures/node_modules/package-d/index.js",
              },
              {
                "import": "package-d/non-existing-subpath",
                "package": "package-d/non-existing-subpath",
                "packagePath": null,
                "resolvesTo": null,
              },
            ]
        `);
    });

    it("respects custom fileRegexp (single file)", () => {
        expect.assertions(1);
        const fixturesPath = path.join(__dirname, "..", "fixtures/src");
        const result = findPackageImportsFromFile(fixturesPath, {
            fileRegexp: "/index.mjs",
        });

        // Only index.mjs should be scanned (package-a and package-b)
        expect(result).toMatchInlineSnapshot(`
            [
              {
                "import": "package-a",
                "package": "package-a",
                "packagePath": "fixtures/node_modules/package-a",
                "resolvesTo": "fixtures/node_modules/package-a/src/index.js",
              },
              {
                "import": "package-b",
                "package": "package-b",
                "packagePath": "fixtures/node_modules/package-b",
                "resolvesTo": "fixtures/node_modules/package-b/index.js",
              },
            ]
        `);
    });

    it("returns empty when custom fileRegexp doesn't match files", () => {
        expect.assertions(1);
        const fixturesPath = path.join(__dirname, "..", "fixtures/src");
        const result = findPackageImportsFromFile(fixturesPath, {
            fileRegexp: "/**/*.js",
        });
        expect(result).toEqual([]);
    });

    it("scans for package-d and finds it", () => {
        expect.assertions(1);
        const fixturesPath = path.join(__dirname, "..", "fixtures/src");
        const result = findPackageImportsFromFile(fixturesPath, {
            fileRegexp: "/package-d.mjs",
        });
        expect(result).toEqual([
            {
                import: "package-d",
                package: "package-d",
                packagePath: "fixtures/node_modules/package-d",
                resolvesTo: "fixtures/node_modules/package-d/index.js",
            },
        ]);
    });

    it("filters imports with includeImportRegexp", () => {
        expect.assertions(1);
        const fixturesPath = path.join(__dirname, "..", "fixtures/src");
        const result = findPackageImportsFromFile(fixturesPath, {
            includeImportRegexp: /^package-c/,
        });

        expect(result).toEqual([
            {
                import: "package-c",
                package: "package-c",
                packagePath: "fixtures/node_modules/package-c",
                resolvesTo: "fixtures/node_modules/package-c/index.js",
            },
            {
                import: "package-c/subExport",
                package: "package-c",
                packagePath: "fixtures/node_modules/package-c",
                resolvesTo: "fixtures/node_modules/package-c/subExport.js",
            },
        ]);
    });

    it("filters imports with excludeImportRegexp", () => {
        expect.assertions(1);
        const fixturesPath = path.join(__dirname, "..", "fixtures/src");
        const result = findPackageImportsFromFile(fixturesPath, {
            fileRegexp: "/package-d.mjs",
            excludeImportRegexp: /^package-d/,
        });

        expect(result).toEqual([]);
    });
});
