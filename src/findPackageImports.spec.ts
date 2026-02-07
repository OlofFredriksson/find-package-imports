import { describe, expect, it } from "vitest";

import { findPackageImports } from "./findPackageImports.js";

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

    it("filters imports with includeImportRegexp", () => {
        expect.assertions(1);
        const result = findPackageImports(esmSrc, {
            includeImportRegexp: /^(bar|@scope\/pkg)$/,
        });

        expect(result).toEqual(["bar", "@scope/pkg"]);
    });

    it("filters imports with excludeImportRegexp", () => {
        expect.assertions(1);
        const result = findPackageImports(esmSrc, {
            excludeImportRegexp: /^bar/,
        });

        expect(result).toEqual([
            "get-css-variables",
            "side-effect-pkg",
            "pkg3",
            "@scope/pkg",
            "@scope/pkg/subpath",
        ]);
    });
});
