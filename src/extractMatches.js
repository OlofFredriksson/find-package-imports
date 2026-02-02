export function extractMatches(fileContent, regex) {
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

        uniqueDependencies.push(modulePath);
    }
    return uniqueDependencies;
}
