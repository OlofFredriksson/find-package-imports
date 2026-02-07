import fs from "fs";
import { dirname, join, relative, sep } from "path";
import { fileURLToPath, pathToFileURL } from "url";

import { findPackageImports } from "./findPackageImports.js";

const findPackageImportsFromFileOptions: FindPackageImportsFromFileOptions = {
    fileRegexp: "/**/*.{cjs,js,mjs,ts,svelte,vue}",
};

export interface PackageImportResult {
    import: string;
    package: string;
    resolvesTo: string | null;
    packagePath: string | null;
}

export interface FindPackageImportsFromFileOptions {
    fileRegexp?: string;
    includeImportRegexp?: RegExp;
    excludeImportRegexp?: RegExp;
    [key: string]: unknown;
}

export function findPackageImportsFromFile(
    dirPath: string,
    userOptions: FindPackageImportsFromFileOptions = {},
): PackageImportResult[] {
    const options = {
        ...findPackageImportsFromFileOptions,
        ...userOptions,
    };
    const files = fs.globSync(`${dirPath}${options.fileRegexp}`, {
        exclude: ["**/node_modules/**"],
    });
    const importSet = new Set<string>();

    for (const file of files) {
        const fileContent = fs.readFileSync(file, "utf-8");
        const imports = findPackageImports(fileContent, {
            includeImportRegexp: options.includeImportRegexp,
            excludeImportRegexp: options.excludeImportRegexp,
        });
        for (const imp of imports) {
            importSet.add(imp);
        }
    }

    const uniqueImports = Array.from(importSet).sort();

    return uniqueImports.map((imp) => {
        try {
            const resolvedUrl = import.meta.resolve(
                imp,
                pathToFileURL(dirPath),
            );
            const resolvedPath = fileURLToPath(resolvedUrl);

            const toPosix = (p: string | null): string | null =>
                p ? p.split(sep).join("/") : p;

            let nearestPackageJson: string | null = null;
            let currentDir = dirname(resolvedPath);
            while (true) {
                const packageJsonPath = join(currentDir, "package.json");
                if (fs.existsSync(packageJsonPath)) {
                    nearestPackageJson = packageJsonPath;
                    break;
                }

                const parentDir = dirname(currentDir);
                if (!parentDir || parentDir === currentDir) {
                    break;
                }
                currentDir = parentDir;
            }

            const getPackageName = (importPath: string): string => {
                const parts = importPath.split("/");
                if (importPath.startsWith("@")) {
                    return `${parts[0]}/${parts[1]}`;
                }
                return parts[0];
            };

            return {
                import: imp,
                package: getPackageName(imp),
                resolvesTo: toPosix(relative(process.cwd(), resolvedPath)),
                packagePath: nearestPackageJson
                    ? toPosix(
                          relative(process.cwd(), dirname(nearestPackageJson)),
                      )
                    : null,
            };
        } catch {
            return {
                import: imp,
                package: imp,
                resolvesTo: null,
                packagePath: null,
            };
        }
    });
}
