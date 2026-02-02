/* eslint-disable sonarjs/slow-regex -- inactivate rule */
import fs from "fs";
import { dirname, join, relative, sep } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { extractMatches } from "./extractMatches";

const commentRegex = /(\/\*[\s\S]*?\*\/)|(\/\/.*)/g;
const importRegex =
    /(?:import\s+(?:.*?from\s+)?['"]|import\(['"])([^'"]+)['"]/g;

const requireRegex = /require\(['"]([^'"]+)['"]\)/g;

// eslint-disable-next-line no-unused-vars -- Keep userOptions for future use
export function findPackageImports(fileContent, userOptions = {}) {
    if (typeof fileContent !== "string") {
        return [];
    }
    const cleanContent = fileContent.replace(commentRegex, "");
    const uniqueDependencies = new Set([
        ...extractMatches(cleanContent, importRegex),
        ...extractMatches(cleanContent, requireRegex),
    ]);

    return Array.from(uniqueDependencies);
}

const findPackageImportsFromFileOptions = {
    fileRegexp: "/**/*.{cjs,js,mjs,ts,svelte,vue}",
};
export function findPackageImportsFromFile(dirPath, userOptions = {}) {
    const options = {
        ...findPackageImportsFromFileOptions,
        ...userOptions,
    };
    const files = fs.globSync(`${dirPath}${options.fileRegexp}`, {
        ignore: "**/node_modules/**",
    });
    const importSet = new Set();

    for (const file of files) {
        const fileContent = fs.readFileSync(file, "utf-8");
        const imports = findPackageImports(fileContent, {});
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

            const toPosix = (p) => (p ? p.split(sep).join("/") : p);

            let nearestPackageJson = null;
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

            const getPackageName = (importPath) => {
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
