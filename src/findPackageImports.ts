import {
    commentRegex,
    extractMatches,
    importRegex,
    requireRegex,
} from "./utils/extractMatches.js";
import { filterDependencies } from "./utils/filterDependencies.js";

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
    const dependencies = Array.from(uniqueDependencies);

    return filterDependencies(dependencies, {
        includeImportRegexp: userOptions.includeImportRegexp,
        excludeImportRegexp: userOptions.excludeImportRegexp,
    });
}
