/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
    test: {
        watch: false,
        include: ["**/*.spec.{ts,tsx}"],
        exclude: ["node_modules", "build"],
    },
});
