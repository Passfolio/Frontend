import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import viteCompression from 'vite-plugin-compression';
import { fileURLToPath, URL } from 'node:url';

// 로컬에서 원격(prod) 백엔드로 붙어 테스트할 때만 사용하는 dev 프록시.
// VITE_DEV_API_PROXY_TARGET 이 설정된 경우에만 /api 를 해당 타깃으로 포워딩한다.
// changeOrigin → Origin 을 타깃으로 보내 CORS 통과, cookieDomainRewrite → 쿠키를 localhost 에 저장.
// 미설정 시 프록시 없음(기본 동작 무영향). 외부 URL 은 .env.local 에만 둔다(하드코딩 금지).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_DEV_API_PROXY_TARGET;

  return {
    plugins: [react(), tailwindcss(), viteCompression({ algorithm: 'gzip' })],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: proxyTarget
      ? {
          proxy: {
            '/api': {
              target: proxyTarget,
              changeOrigin: true,
              secure: true,
              cookieDomainRewrite: 'localhost',
            },
          },
        }
      : undefined,
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom/client'],
          },
        },
      },
    },
  };
});
