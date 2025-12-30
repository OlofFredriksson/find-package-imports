/* eslint-disable jest/no-large-snapshots -- snapshot */
/* eslint-env jest */
/* eslint-disable import/extensions -- Node ESM local imports include .js file extensions */
import path from "path";
import { fileURLToPath } from "url";
import { findPackageImports, findPackageImportsFromFile } from "./index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

describe("findPackageImports", () => {
    it("esm: finds package specifiers from import forms", () => {
        expect(findPackageImports(esmSrc)).toEqual([
            "bar",
            "get-css-variables",
            "side-effect-pkg",
            "pkg3",
            "@scope/pkg",
        ]);
    });

    it("esm: finds package specifiers from import forms including sub exports", () => {
        expect(findPackageImports(esmSrc, { subExports: true })).toEqual([
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
        expect(findPackageImports(cjsSrc)).toEqual(["pkg2", "bar"]);
    });

    it("returns empty array for non-string", () => {
        expect(findPackageImports(null)).toEqual([]);
    });

    it("vue: handles Single File Component with <template> and <script> imports", () => {
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
});

describe("findPackageImportsFromFile", () => {
    it("scans fixtures directory and finds imports", () => {
        const fixturesPath = path.join(__dirname, "..", "fixtures/src");
        const result = findPackageImportsFromFile(fixturesPath);

        expect(result).toMatchInlineSnapshot(`
            [
              {
                "package": "package-a",
                "packagePath": "fixtures/node_modules/package-a",
                "resolvesTo": "fixtures/node_modules/package-a/src/index.js",
              },
              {
                "package": "package-b",
                "packagePath": "fixtures/node_modules/package-b",
                "resolvesTo": "fixtures/node_modules/package-b/index.js",
              },
              {
                "package": "package-c",
                "packagePath": "fixtures/node_modules/package-c",
                "resolvesTo": "fixtures/node_modules/package-c/index.js",
              },
              {
                "package": "package-c/subExport",
                "packagePath": "fixtures/node_modules/package-c",
                "resolvesTo": "fixtures/node_modules/package-c/subExport.js",
              },
            ]
        `);
    });

    it("respects custom fileRegexp (single file)", () => {
        const fixturesPath = path.join(__dirname, "..", "fixtures/src");
        const result = findPackageImportsFromFile(fixturesPath, {
            fileRegexp: "/index.mjs",
        });

        // Only index.mjs should be scanned (package-a and package-b)
        expect(result).toMatchInlineSnapshot(`
            [
              {
                "package": "package-a",
                "packagePath": "fixtures/node_modules/package-a",
                "resolvesTo": "fixtures/node_modules/package-a/src/index.js",
              },
              {
                "package": "package-b",
                "packagePath": "fixtures/node_modules/package-b",
                "resolvesTo": "fixtures/node_modules/package-b/index.js",
              },
            ]
        `);
    });

    it("returns empty when custom fileRegexp doesn't match files", () => {
        const fixturesPath = path.join(__dirname, "..", "fixtures/src");
        const result = findPackageImportsFromFile(fixturesPath, {
            fileRegexp: "/**/*.js",
        });
        expect(result).toEqual([]);
    });
});
