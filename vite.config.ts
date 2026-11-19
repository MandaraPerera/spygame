import * as path from "path";
import babel from '@rolldown/plugin-babel'
import react, {reactCompilerPreset} from '@vitejs/plugin-react'
import {defineConfig} from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        babel({presets: [reactCompilerPreset({compilationMode: 'infer'})]})
    ],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "src"),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173
    },
    test: {
        projects: [
            {
                extends: true,
                test: {
                    name: 'unit',
                    environment: 'jsdom',
                    include: ['src/**/*.test.{ts,tsx}'],
                    setupFiles: ['src/test/setup.ts']
                }
            },
            {
                // Needs the Firestore emulator: run with `npm run test:rules`.
                test: {
                    name: 'rules',
                    environment: 'node',
                    include: ['tests/rules/**/*.test.ts'],
                    testTimeout: 20000
                }
            }
        ]
    }
})
