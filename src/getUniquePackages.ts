import type { PackageImportResult } from "./findPackageImportsFromFile";

export interface UniquePackage {
    package: string;
    packagePath: string | null;
}

export function getUniquePackages(
    imports: PackageImportResult[],
): UniquePackage[] {
    const packageMap = new Map<string, string | null>();

    for (const item of imports) {
        if (!packageMap.has(item.package)) {
            packageMap.set(item.package, item.packagePath);
        }
    }

    // eslint-disable-next-line unicorn/prefer-array-from-map -- TODO: Revisit this conversion when refactoring package collection.
    return Array.from(packageMap).map(([packageName, packagePath]) => ({
        package: packageName,
        packagePath,
    }));
}
