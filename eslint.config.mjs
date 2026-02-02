import defaultConfig from "@forsakringskassan/eslint-config";
import cliConfig from "@forsakringskassan/eslint-config-cli";
import vitestConfig from "@forsakringskassan/eslint-config-vitest";

export default [
    {
        name: "Ignored files",
        ignores: [
            "**/coverage/**",
            "**/dist/**",
            "**/node_modules/**",
            "**/public/**",
            "**/temp/**",
            "**/typedoc/**",
            "**/fixtures/**",
        ],
    },

    ...defaultConfig,
    cliConfig(),
    vitestConfig(),
];
