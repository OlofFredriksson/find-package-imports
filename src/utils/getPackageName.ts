export function getPackageName(importPath: string): string {
    const parts = importPath.split("/");
    if (importPath.startsWith("@")) {
        return `${parts[0]}/${parts[1]}`;
    }
    return parts[0];
}
