import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
    ...nextVitals,
    {
        // React Compiler rules introduced by eslint-plugin-react-hooks v7
        // (eslint-config-next 16). Existing code predates them; kept visible
        // as warnings until those components are refactored.
        rules: {
            "react-hooks/set-state-in-effect": "warn",
            "react-hooks/immutability": "warn",
            "react-hooks/purity": "warn",
        },
    },
    globalIgnores([
        ".next/**",
        "out/**",
        "build/**",
        "coverage/**",
        "public/**",
        "next-env.d.ts",
    ]),
]);
