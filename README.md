# Find package imports

A dependency free utility to find all unique package imports from JavaScript and TypeScript files within a directory.

`npm i find-package-imports`

## Functions

### `findPackageImports(fileContent, [options])`

Extracts all package imports (`import` and `require`) from a string of file content.

#### Parameters

- `fileContent` (string): The source code to parse.
- `options` (object, optional): An object with the following properties:
    - `includeImportRegexp` (RegExp, optional): Only include imports that match this regular expression.
    - `excludeImportRegexp` (RegExp, optional): Exclude imports that match this regular expression.

#### Returns

`Array<string>`: An array of unique package names found in the content.

#### Example

```javascript
import { findPackageImports } from "find-package-imports";

const fileContent = `
    import foo from "bar";
    import { jsx } from "react/jsx-runtime";
    import { getVariables } from "get-css-variables";
`;

console.log(findPackageImports(fileContent)); // => ["bar", "react/jsx-runtime", "get-css-variables"]

console.log(
    findPackageImports(fileContent, {
        includeImportRegexp: /^react/,
        excludeImportRegexp: /jsx-runtime/,
    }),
); // => []
```

### `findPackageImportsFromFile(dirPath, [options])`

Scans a directory for various script files (`.js`, `.mjs`, `.ts`, etc.), extracts all package imports, and returns a sorted list of unique packages along with their resolved paths.

#### Parameters

- `dirPath` (string): The absolute or relative path to the directory to scan.
- `options` (object, optional): An object with the following properties:
    - `fileRegexp` (string, optional): A glob pattern (appended to `dirPath`) that selects which files to scan. Defaults to `"/**/*.{cjs,js,mjs,ts,svelte,vue}"` (recursive search). Files under `node_modules` are always excluded.

    - `includeImportRegexp` (RegExp, optional): Only include imports that match this regular expression.
    - `excludeImportRegexp` (RegExp, optional): Exclude imports that match this regular expression.

        Examples:
        - `"/**/*.mjs"` — scan only `.mjs` files recursively
        - `"/*.js"` — scan only files in the specified directory (non-recursive)

        The pattern uses standard glob syntax (wildcards, brace expansion, etc.) and is used verbatim when constructing the search path.

#### Returns

`Array<PackageImportResult>`: An array of objects, where each object represents a unique imported package and has the following properties:

- `import` (string): The name of the imported package (e.g., `'react'` or `'react/jsx-runtime'`).
- `package` (string): The name of the imported package (e.g., `'react'`).
- `resolvesTo` (string): The path to the package's entry point, relative to the current working directory.
- `packagePath` (string): The path to the package directory (typically the directory containing `package.json`), relative to the current working directory.

**Note:** Both `resolvesTo` and `packagePath` always use POSIX-style forward slashes (`/`) regardless of the operating system, ensuring consistent output across platforms.

#### Example

```javascript
import { findPackageImportsFromFile } from "find-package-imports";

const projectDir = "/path/to/your/project/src";
const imports = findPackageImportsFromFile(projectDir);

console.log(imports);
// Expected output:
// [
//   {
//     import: 'react',
//     package: 'react',
//     resolvesTo: 'node_modules/react/index.js',
//     packagePath: 'node_modules/react'
//   },
//   {
//     import: 'react/jsx-runtime',
//     package: 'react',
//     resolvesTo: 'node_modules/react/jsx-runtime/index.js',
//     packagePath: 'node_modules/react'
//   }
// ]

const filteredImports = findPackageImportsFromFile(projectDir, {
    includeImportRegexp: /^react/, // keep only react imports
    excludeImportRegexp: /jsx-runtime/, // drop react/jsx-runtime
});

console.log(filteredImports);
```

### `getUniquePackages(imports)`

Extracts a unique list of packages from the result of `findPackageImportsFromFile()`. This function deduplicates packages, so if multiple imports resolve to the same package (e.g., `'react'` and `'react/jsx-runtime'` both belong to `'react'`), only one entry is returned.

#### Parameters

- `imports` (Array<Object>): The result array from `findPackageImportsFromFile()`, containing package import results.

#### Returns

`Array<UniquePackage>`: An array of objects, where each object represents a unique package and has the following properties:

- `package` (string): The name of the package (e.g., `'react'`).
- `packagePath` (string | null): The path to the package directory (typically the directory containing `package.json`), relative to the current working directory. Will be `null` if the package could not be resolved.

#### Example

```javascript
import {
    findPackageImportsFromFile,
    getUniquePackages,
} from "find-package-imports";

const projectDir = "/path/to/your/project/src";
const imports = findPackageImportsFromFile(projectDir);
const uniquePackages = getUniquePackages(imports);

console.log(uniquePackages);
// Expected output:
// [
//   {
//     package: 'react',
//     packagePath: 'node_modules/react'
//   },
//   {
//     package: 'next',
//     packagePath: 'node_modules/next'
//   }
// ]
```
