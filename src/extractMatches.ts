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
