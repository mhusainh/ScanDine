import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: "./resources/js/tests/setup.js",
        include: ["resources/js/**/*.{test,spec}.{js,jsx}"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "lcov"],
            reportsDirectory: "./coverage",
            include: ["resources/js/**/*.{js,jsx}"],
            exclude: [
                "resources/js/tests/**",
                "resources/js/app.jsx",
                "resources/js/bootstrap.js",
                "resources/js/lib/**", // exclude old lib if exists
                "resources/js/libs/**", // might mock this
            ],
        },
    },
});
