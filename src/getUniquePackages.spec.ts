import { describe, expect, it } from "vitest";

import { getUniquePackages } from "./getUniquePackages.js";

describe("getUniquePackages", () => {
    it("returns unique packages with package and packagePath from import results", () => {
        expect.assertions(1);
        const imports = [
            {
                import: "package-a",
                package: "package-a",
                resolvesTo: "fixtures/node_modules/package-a/src/index.js",
                packagePath: "fixtures/node_modules/package-a",
            },
            {
                import: "package-b",
                package: "package-b",
                resolvesTo: "fixtures/node_modules/package-b/index.js",
                packagePath: "fixtures/node_modules/package-b",
            },
            {
                import: "package-a/sub",
                package: "package-a",
                resolvesTo: "fixtures/node_modules/package-a/sub.js",
                packagePath: "fixtures/node_modules/package-a",
            },
        ];

        const result = getUniquePackages(imports);

        expect(result).toEqual([
            {
                package: "package-a",
                packagePath: "fixtures/node_modules/package-a",
            },
            {
                package: "package-b",
                packagePath: "fixtures/node_modules/package-b",
            },
        ]);
    });

    it("handles packages with null packagePath", () => {
        expect.assertions(1);
        const imports = [
            {
                import: "unresolved-pkg",
                package: "unresolved-pkg",
                resolvesTo: null,
                packagePath: null,
            },
            {
                import: "package-a",
                package: "package-a",
                resolvesTo: "fixtures/node_modules/package-a/src/index.js",
                packagePath: "fixtures/node_modules/package-a",
            },
        ];

        const result = getUniquePackages(imports);

        expect(result).toEqual([
            {
                package: "unresolved-pkg",
                packagePath: null,
            },
            {
                package: "package-a",
                packagePath: "fixtures/node_modules/package-a",
            },
        ]);
    });

    it("returns empty list for empty imports", () => {
        expect.assertions(1);
        const result = getUniquePackages([]);
        expect(result).toEqual([]);
    });

    it("maintains order of first appearance for unique packages", () => {
        expect.assertions(1);
        const imports = [
            {
                import: "pkg3",
                package: "pkg3",
                resolvesTo: "node_modules/pkg3/index.js",
                packagePath: "node_modules/pkg3",
            },
            {
                import: "pkg1",
                package: "pkg1",
                resolvesTo: "node_modules/pkg1/index.js",
                packagePath: "node_modules/pkg1",
            },
            {
                import: "pkg3/subpath",
                package: "pkg3",
                resolvesTo: "node_modules/pkg3/subpath.js",
                packagePath: "node_modules/pkg3",
            },
            {
                import: "pkg2",
                package: "pkg2",
                resolvesTo: "node_modules/pkg2/index.js",
                packagePath: "node_modules/pkg2",
            },
        ];

        const result = getUniquePackages(imports);

        expect(result).toEqual([
            {
                package: "pkg3",
                packagePath: "node_modules/pkg3",
            },
            {
                package: "pkg1",
                packagePath: "node_modules/pkg1",
            },
            {
                package: "pkg2",
                packagePath: "node_modules/pkg2",
            },
        ]);
    });
});
