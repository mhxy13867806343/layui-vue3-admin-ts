import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            // 旁路 layui-vue 在 node ESM 严格 exports 下找不到的两个 css 引用
            '@layui/layer-vue/lib/index.css': path.resolve(__dirname, 'tests/stubs/empty.css'),
            '@layui/icons-vue/lib/index.css': path.resolve(__dirname, 'tests/stubs/empty.css'),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['tests/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
        },
        include: ['tests/**/*.{test,spec}.ts'],
    },
});
