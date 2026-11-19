import * as path from "path";
import babel from '@rolldown/plugin-babel'
import react, {reactCompilerPreset} from '@vitejs/plugin-react'
import {defineConfig} from 'vite'

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
    }
})
