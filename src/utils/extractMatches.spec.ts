import { describe, expect, it } from "vitest";

import { extractMatches, importRegex, requireRegex } from "./extractMatches.js";

describe("extractMatches", () => {
    it("extracts only package specifiers from imports", () => {
        expect.assertions(1);
        const src = `
            import foo from "bar";
            import "@scope/pkg";
            import "bar/subpath";
            import "./local";
            import "../up";
            import "/abs/path";
        `;

        const result = extractMatches(src, importRegex);

        expect(result).toEqual(["bar", "@scope/pkg", "bar/subpath"]);
    });

    it("ignores relative requires and keeps duplicates", () => {
        expect.assertions(1);
        const src = `
            const a = require("pkg");
            const b = require("pkg");
            const c = require("./local");
        `;

        const result = extractMatches(src, requireRegex);

        expect(result).toEqual(["pkg", "pkg"]);
    });

    it("returns empty array when no matches exist", () => {
        expect.assertions(1);
        const result = extractMatches("const a = 1;", importRegex);
        expect(result).toEqual([]);
    });
});
