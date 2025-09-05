import { defineConfig } from 'vite';
import { resolve } from 'pathe';
import dts from 'vite-plugin-dts';

// https://vite.dev/config/
export default defineConfig({
    plugins: [dts({ insertTypesEntry: true })],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/logger/index.ts'),
            name: 'logger',
            fileName: '[name]',
            formats: ['es', 'cjs', 'umd'],
        },
    },
});
