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
    const pkgSet = new Set();

    for (const file of files) {
        const fileContent = fs.readFileSync(file, "utf-8");
        const imports = findPackageImports(fileContent, {});
        for (const imp of imports) {
            pkgSet.add(imp);
        }
    }

    const packages = Array.from(pkgSet).sort();

    return packages.map((p) => {
        try {
            const resolvedUrl = import.meta.resolve(p, pathToFileURL(dirPath));
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
                import: p,
                package: getPackageName(p),
                resolvesTo: toPosix(relative(process.cwd(), resolvedPath)),
                packagePath: nearestPackageJson
                    ? toPosix(
                          relative(process.cwd(), dirname(nearestPackageJson)),
                      )
                    : null,
            };
        } catch {
            return {
                import: p,
                package: p,
                resolvesTo: null,
                packagePath: null,
            };
        }
    });
}
