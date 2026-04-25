export interface FilterDependenciesOptions {
    includeImportRegexp?: RegExp;
    excludeImportRegexp?: RegExp;
}

export function filterDependencies(
    dependencies: string[],
    options: FilterDependenciesOptions = {},
): string[] {
    const { includeImportRegexp, excludeImportRegexp } = options;
    let filtered = dependencies;

    if (includeImportRegexp) {
        filtered = filtered.filter((dep) => includeImportRegexp.test(dep));
    }

    if (excludeImportRegexp) {
        filtered = filtered.filter((dep) => !excludeImportRegexp.test(dep));
    }

    return filtered;
}
