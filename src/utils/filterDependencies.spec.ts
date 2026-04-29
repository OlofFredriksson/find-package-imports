import { describe, expect, it } from "vitest";

import { filterDependencies } from "./filterDependencies.js";

describe("filterDependencies", () => {
    it("returns input unchanged when no options are provided", () => {
        expect.assertions(1);
        const deps = ["foo", "bar", "@scope/pkg"];

        const result = filterDependencies(deps);

        expect(result).toEqual(["foo", "bar", "@scope/pkg"]);
    });

    it("keeps only dependencies matching includeImportRegexp", () => {
        expect.assertions(1);
        const deps = ["foo", "bar", "@scope/pkg"];

        const result = filterDependencies(deps, {
            includeImportRegexp: /^@/,
        });

        expect(result).toEqual(["@scope/pkg"]);
    });

    it("removes dependencies matching excludeImportRegexp", () => {
        expect.assertions(1);
        const deps = ["foo", "bar", "@scope/pkg"];

        const result = filterDependencies(deps, {
            excludeImportRegexp: /^@/,
        });

        expect(result).toEqual(["foo", "bar"]);
    });

    it("applies include before exclude", () => {
        expect.assertions(1);
        const deps = ["foo", "foo-bar", "baz"];

        const result = filterDependencies(deps, {
            includeImportRegexp: /^foo/,
            excludeImportRegexp: /-bar$/,
        });

        expect(result).toEqual(["foo"]);
    });

    it("returns an empty array when nothing matches the include pattern", () => {
        expect.assertions(1);
        const result = filterDependencies(["foo", "bar"], {
            includeImportRegexp: /^@/,
        });

        expect(result).toEqual([]);
    });
});
