export function extractMatches(fileContent, regex, subExports) {
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
