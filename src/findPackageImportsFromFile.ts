import fs from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { findPackageImports } from "./findPackageImports.js";
import { getPackageName } from "./utils/getPackageName.js";
import { toPosix } from "./utils/toPosix.js";

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
        const fileContent = fs.readFileSync(file, "utf8");
        const imports = findPackageImports(fileContent, {
            includeImportRegexp: options.includeImportRegexp,
            excludeImportRegexp: options.excludeImportRegexp,
        });
        for (const imp of imports) {
            importSet.add(imp);
        }
    }

    const uniqueImports = Array.from(importSet).toSorted();

    return uniqueImports.map((imp) => {
        try {
            const resolvedUrl = import.meta.resolve(
                imp,
                pathToFileURL(dirPath),
            );
            const resolvedPath = fileURLToPath(resolvedUrl);

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
