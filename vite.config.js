import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from '@layui/unplugin-vue-components/vite';
import { LayuiVueResolver } from '@layui/unplugin-vue-components/resolvers';
import { viteMockServe } from 'vite-plugin-mock';
export default defineConfig(function (_a) {
    var command = _a.command, mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), 'VITE_');
    var useMock = env.VITE_USE_MOCK === 'true';
    return {
        base: env.VITE_PUBLIC_PATH || '/',
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
        server: {
            host: '0.0.0.0',
            port: Number(env.VITE_PORT) || 5173,
            open: false,
            proxy: useMock
                ? undefined
                : {
                    '/api': {
                        target: env.VITE_API_BASE_URL,
                        changeOrigin: true,
                        rewrite: function (p) { return p.replace(/^\/api/, ''); },
                    },
                },
        },
        plugins: [
            vue(),
            AutoImport({
                imports: ['vue', 'vue-router', 'pinia'],
                resolvers: [LayuiVueResolver()],
                dts: 'src/types/auto-imports.d.ts',
                eslintrc: { enabled: true, filepath: './.eslintrc-auto-import.json' },
            }),
            Components({
                resolvers: [LayuiVueResolver({ importStyle: false })],
                dts: 'src/types/components.d.ts',
                dirs: ['src/components'],
            }),
            viteMockServe({
                mockPath: 'mock',
                enable: command === 'serve' && useMock,
                watchFiles: true,
                logger: true,
            }),
        ],
        build: {
            outDir: 'dist',
            sourcemap: false,
            target: 'es2020',
            chunkSizeWarningLimit: 1500,
        },
        optimizeDeps: {
            include: [
                'vue',
                'vue-router',
                'pinia',
                'axios',
                'dayjs',
                'lodash-es',
                '@wangeditor/editor',
                '@wangeditor/editor-for-vue',
            ],
        },
    };
});
