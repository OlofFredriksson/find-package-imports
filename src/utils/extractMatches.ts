export const commentRegex = /(\/\*[\s\S]*?\*\/)|(\/\/.*)/g;

export const importRegex =
    // eslint-disable-next-line regexp/no-super-linear-backtracking -- TODO: Replace with a parser or bounded pattern to avoid super-linear backtracking.
    /(?:import\s+(?:.*?from\s+)?["']|import\(["'])([^"']+)["']/g;

export const requireRegex = /require\(["']([^"']+)["']\)/g;

export function extractMatches(fileContent: string, regex: RegExp): string[] {
    const uniqueDependencies: string[] = [];
    let match: RegExpExecArray | null;
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

        uniqueDependencies.push(modulePath);
    }
    return uniqueDependencies;
}
