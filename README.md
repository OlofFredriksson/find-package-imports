# Find package imports

A utility to find all unique package imports from JavaScript files within a directory.

## Functions

### `findPackageImports(fileContent, [options])`

Extracts all package imports (`import` and `require`) from a string of file content.

#### Parameters

- `fileContent` (string): The source code to parse.
- `options` (object, optional): An object with the following properties:
    - `subExports` (boolean): Whether to include sub-paths in the result (e.g., `'react/jsx-runtime'`). Defaults to `false`.

#### Returns

`Array<string>`: An array of unique package names found in the content.

#### Example

```Javascript
import { findPackageImports } from "find-package-imports";

const fileContent = `
    import foo from "bar";
    import { jsx } from "react/jsx-runtime";
    import { getVariables } from "get-css-variables";
`

console.log(findPackageImports(fileContent)); // => ["bar", "react", "get-css-variables"]
console.log(findPackageImports(fileContent, { subExports: true })); // => ["bar", "react/jsx-runtime", "get-css-variables"]
```

### `findPackageImportsFromFile(dirPath, [options])`

Scans a directory for various script files (`.js`, `.mjs`, `.ts`, etc.), extracts all package imports, and returns a sorted list of unique packages along with their resolved paths.

#### Parameters

- `dirPath` (string): The absolute or relative path to the directory to scan.
- `options` (object, optional): An object with the following properties:
    - `subExports` (boolean): Whether to include sub-paths in the result (e.g., `'react/jsx-runtime'`). Defaults to `true`.

#### Returns

`Array<Object>`: An array of objects, where each object represents a unique imported package and has the following properties:

- `package` (string): The name of the imported package (e.g., `'react'` or `'react/jsx-runtime'`).
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
//     package: 'react',
//     resolvesTo: 'node_modules/react/index.js',
//     packagePath: 'node_modules/react'
//   },
//   {
//     package: 'react/jsx-runtime',
//     resolvesTo: 'node_modules/react/jsx-runtime/index.js',
//     packagePath: 'node_modules/react'
//   }
// ]
```
