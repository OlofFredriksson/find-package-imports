/* eslint-disable sonarjs/slow-regex -- inactivate rule */
import fs from "fs";
import { dirname, relative } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const commentRegex = /(\/\*[\s\S]*?\*\/)|(\/\/.*)/g;
const importRegex =
    /(?:import\s+(?:.*?from\s+)?['"]|import\(['"])([^'"]+)['"]/g;

const requireRegex = /require\(['"]([^'"]+)['"]\)/g;

function extractMatches(fileContent, regex, subExports) {
    const uniqueDependencies = [];
    let match;
    while ((match = regex.exec(fileContent)) !== null) {
        const modulePath = match[1];

        if (
            !modulePath ||
            modulePath.startsWith("/") ||
            modulePath.startsWith("./") ||
            modulePath.startsWith("../")
        ) {
            continue;
        }

        if (!subExports) {
            // Handle scoped packages and sub-paths
            if (modulePath.startsWith("@")) {
                const parts = modulePath.split("/");
                uniqueDependencies.push(`${parts[0]}/${parts[1]}`);
            } else {
                uniqueDependencies.push(modulePath.split("/")[0]);
            }
        } else {
            uniqueDependencies.push(modulePath);
        }
    }
    return uniqueDependencies;
}

const findPackageImportsOptions = {
    subExports: false,
};
export function findPackageImports(fileContent, userOptions = {}) {
    const options = {
        ...findPackageImportsOptions,
        ...userOptions,
    };
    if (typeof fileContent !== "string") {
        return [];
    }
    const cleanContent = fileContent.replace(commentRegex, "");
    const uniqueDependencies = new Set([
        ...extractMatches(cleanContent, importRegex, options.subExports),
        ...extractMatches(cleanContent, requireRegex, options.subExports),
    ]);

    return Array.from(uniqueDependencies);
}

const findPackageImportsFromFileOptions = {
    subExports: true,
};
export function findPackageImportsFromFile(dirPath, userOptions = {}) {
    const options = {
        ...findPackageImportsFromFileOptions,
        ...userOptions,
    };
    const files = fs.globSync(`${dirPath}/**/*.{cjs,js,mjs,ts,svelte,vue}`, {
        ignore: "**/node_modules/**",
    });
    const pkgSet = new Set();

    for (const file of files) {
        const fileContent = fs.readFileSync(file, "utf-8");
        const imports = findPackageImports(fileContent, {
            subExports: options.subExports,
        });
        for (const imp of imports) {
            pkgSet.add(imp);
        }
    }

    const packages = Array.from(pkgSet).sort();

    return packages.map((p) => {
        const resolvedUrl = import.meta.resolve(p, pathToFileURL(dirPath));
        const resolvedPath = fileURLToPath(resolvedUrl);

        const relativePath = relative(process.cwd(), resolvedPath);

        // Find nearest package.json by walking up from resolvedPath
        let nearestPackageJson = null;
        let currentDir = resolvedPath;
        while (currentDir !== "/" && currentDir.length > 0) {
            const packageJsonPath = `${currentDir}/package.json`;
            if (fs.existsSync(packageJsonPath)) {
                nearestPackageJson = packageJsonPath;
                break;
            }
            // Walk up one directory
            currentDir = currentDir.substring(0, currentDir.lastIndexOf("/"));
        }

        return {
            package: p,
            resolvesTo: relativePath,
            packagePath: relative(process.cwd(), dirname(nearestPackageJson)),
        };
    });
}
