import {
    commentRegex,
    extractMatches,
    importRegex,
    requireRegex,
} from "./utils/extractMatches.js";

export interface FindPackageImportsOptions {
    includeImportRegexp?: RegExp;
    excludeImportRegexp?: RegExp;
    [key: string]: unknown;
}

export function findPackageImports(
    fileContent: string,
    userOptions: FindPackageImportsOptions = {},
): string[] {
    if (typeof fileContent !== "string") {
        return [];
    }
    const cleanContent = fileContent.replace(commentRegex, "");
    const uniqueDependencies = new Set([
        ...extractMatches(cleanContent, importRegex),
        ...extractMatches(cleanContent, requireRegex),
    ]);
    let dependencies = Array.from(uniqueDependencies);
    if (userOptions.includeImportRegexp) {
        dependencies = dependencies.filter((dep) =>
            userOptions.includeImportRegexp?.test(dep),
        );
    }

    if (userOptions.excludeImportRegexp) {
        dependencies = dependencies.filter(
            (dep) => !userOptions.excludeImportRegexp?.test(dep),
        );
    }

    return dependencies;
}
