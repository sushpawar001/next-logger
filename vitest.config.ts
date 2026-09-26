import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const alias = {
    // tsconfig.json declares `paths` but no `baseUrl`, so the alias is
    // mirrored explicitly rather than derived from tsconfig.
    "@": fileURLToPath(new URL("./src", import.meta.url)),
    // next/font is a Next compiler macro esbuild cannot transform.
    "next/font/google": fileURLToPath(
        new URL("./src/test/stubs/next-font.ts", import.meta.url)
    ),
    "next/font/local": fileURLToPath(
        new URL("./src/test/stubs/next-font.ts", import.meta.url)
    ),
};

const TEST_ENV = {
    // Pinned so dayjs.tz.guess() in src/helpers/formatDate.ts is deterministic.
    TZ: "UTC",
    ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef", // exactly 32 chars
    MONGO_URI: "mongodb://127.0.0.1:27017/fitdose-test-DO-NOT-CONNECT",
    NEXT_PUBLIC_BASE_URL: "http://localhost:4000",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_dummy",
    CLERK_SECRET_KEY: "sk_test_dummy",
    RESEND_API_KEY: "re_test_dummy",
    SEED_TOKEN: "test-seed-token",
    TOKEN_SECRET: "test-token-secret",
    DOMAIN: "http://localhost:4000",
};

export default defineConfig({
    resolve: { alias },
    test: {
        clearMocks: true,
        restoreMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,

        projects: [
            {
                resolve: { alias },
                // Two legacy user routes import .tsx Resend templates while
                // tsconfig says jsx:"preserve" -- without this esbuild emits
                // raw JSX into the node bundle and parsing fails.
                esbuild: { jsx: "automatic", jsxImportSource: "react" },
                test: {
                    name: "node",
                    environment: "node",
                    globals: false,
                    env: TEST_ENV,
                    setupFiles: ["./src/test/env.ts", "./src/test/setup.node.ts"],
                    exclude: ["**/*.dom.test.ts"],
                    include: [
                        "src/app/api/**/*.test.ts",
                        "src/app/api/**/__tests__/**/*.test.ts",
                        // *.dom.test.ts needs a DOM and runs in the jsdom project.
                        "src/lib/**/*.test.ts",
                        "src/helpers/**/*.test.ts",
                        "src/models/**/*.test.ts",
                        "src/dbConfig/**/*.test.ts",
                        "src/constants/**/*.test.ts",
                        "src/*.test.ts",
                    ],
                    clearMocks: true,
                    restoreMocks: true,
                    unstubEnvs: true,
                },
            },
            {
                plugins: [react()],
                resolve: { alias },
                test: {
                    name: "jsdom",
                    environment: "jsdom",
                    globals: false,
                    env: TEST_ENV,
                    setupFiles: ["./src/test/env.ts", "./src/test/setup.jsdom.tsx"],
                    include: [
                        "src/components/**/*.test.{ts,tsx}",
                        "src/hooks/**/*.test.{ts,tsx}",
                        "src/lib/**/*.dom.test.ts",
                        "src/app/**/*.test.tsx",
                    ],
                    clearMocks: true,
                    restoreMocks: true,
                },
            },
        ],

        // Coverage is only honoured at the root level when using `projects`.
        coverage: {
            provider: "v8",
            reporter: ["text-summary", "html", "lcov", "json"],
            reportsDirectory: "./coverage",
            include: ["src/**/*.{ts,tsx,js,jsx}"],
            exclude: [
                // test scaffolding
                "src/test/**",
                "**/*.test.{ts,tsx}",
                "**/__tests__/**",
                "**/*.d.ts",
                // presentational / vendored -- excluded by agreement
                "src/components/ui/**",
                "src/components/animate-ui/**",
                "**/*Skeleton*.tsx",
                "src/components/GPTSkeletonGen.tsx",
                "src/components/PageSkeletons/**",
                "src/components/HomePageComponents/**",
                "src/components/Resend/**",
                "src/app/**/layout.*",
                // superseded Chart.js originals (RechartComponents/** stays in)
                "src/components/Charts/*.tsx",
                // dead code
                "src/helpers/getToken.ts",
                "src/helpers/getUserFromToken.ts",
                "src/old_middleware.js",
                "src/models/insulinTypeModelOld.js",
                "src/components/UserDetails.tsx",
                "src/components/DashboardInputs/InputFormCard.tsx",
                "src/components/DashboardInputs/InsulinTypeAdd.tsx",
                "src/app/(Dashboard)/try/**",
                // legacy pre-Clerk JWT auth routes
                "src/app/api/users/login/**",
                "src/app/api/users/logout/**",
                "src/app/api/users/signup/**",
                "src/app/api/users/verify-email/**",
                "src/app/api/users/send-forget-email/**",
                "src/app/api/users/reset-password/**",
                // framework glue with no branching logic
                "src/app/sw.js",
                "src/types/**",
                "**/*.config.{js,ts}",
            ],
            thresholds: {
                lines: 90,
                functions: 90,
                statements: 90,
                branches: 85,
            },
        },
    },
});
