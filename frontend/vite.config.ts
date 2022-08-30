import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import envCompatible from 'vite-plugin-env-compatible';

export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths(),
        svgr(),
        envCompatible({ prefix: 'REACT_APP' }),
    ],
    server: {
        port: 3000,
    },
    build: {
        outDir: 'build',
    },
});