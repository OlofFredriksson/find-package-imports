/* eslint-disable import/extensions -- Node ESM local imports include .js file extensions */
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const esmSrc = `
    import foo from "bar";
    import fooSubPath from "bar/subpath";
    import { getVariables } from "get-css-variables";
    import "side-effect-pkg";
    const b = import("pkg3");
    const e = import("@scope/pkg");
    const f = import("@scope/pkg/subpath");

    // commented import import('ignored')
    /* import('ignored') */
    import './local';
`;

const cjsSrc = `
    const a = require("pkg2");
    const c = require('../local2');
    const d = require("/abs/path");
    const f = require("bar");
    const g = require("bar");
    // require('ignored')
    /* require('ignored') */
`;

import { findPackageImports, findPackageImportsFromFile } from "./index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("findPackageImports", () => {
    it("esm: finds package specifiers from import forms", () => {
        expect.assertions(1);
        expect(findPackageImports(esmSrc)).toEqual([
            "bar",
            "bar/subpath",
            "get-css-variables",
            "side-effect-pkg",
            "pkg3",
            "@scope/pkg",
            "@scope/pkg/subpath",
        ]);
    });

    it("cjs: finds package specifiers from require forms", () => {
        expect.assertions(1);
        expect(findPackageImports(cjsSrc)).toEqual(["pkg2", "bar"]);
    });

    it("returns empty array for non-string", () => {
        expect.assertions(1);
        expect(findPackageImports(null)).toEqual([]);
    });

    it("vue: handles Single File Component with <template> and <script> imports", () => {
        expect.assertions(1);
        const src = `
                <template>
                    <div>
                        <MyComp />
                        <img src="http://example.com/logo.png" />
                    </div>
                </template>
                <script>
                import { createApp } from "vue";
                import MyComp from "my-vue-comp";
                import './local-component.vue';
                const lazy = import("lazy-vue");
                </script>
            `;

        expect(findPackageImports(src)).toEqual([
            "vue",
            "my-vue-comp",
            "lazy-vue",
        ]);
    });

    it("svelte: handles Svelte component <script> imports", () => {
        expect.assertions(1);
        const src = `
            <script>
                import { onMount } from "svelte";
                import Comp from "svelte-comp";
                import './local.svelte';
                const lazy = import("lazy-svelte");
            </script>
            <style></style>
            <main>
                <Comp />
            </main>
        `;

        expect(findPackageImports(src)).toEqual([
            "svelte",
            "svelte-comp",
            "lazy-svelte",
        ]);
    });
});

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
});
