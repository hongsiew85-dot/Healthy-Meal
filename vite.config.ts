import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function mcpApiPlugin(): Plugin {
  return {
    name: 'mcp-api-serverless-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && (req.url.startsWith('/api/mcp') || req.url === '/api/mcp')) {
          try {
            const { default: handler } = await import('./api/mcp.js');
            let body = {};
            if (req.method === 'POST') {
              const buffers: Buffer[] = [];
              for await (const chunk of req) {
                buffers.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
              }
              try {
                body = JSON.parse(Buffer.concat(buffers).toString('utf-8'));
              } catch (e) {}
            }
            (req as any).body = body;
            (res as any).status = function (code: number) {
              res.statusCode = code;
              return res;
            };
            (res as any).json = function (data: any) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };
            return handler(req, res);
          } catch (err) {
            console.error('Error in /api/mcp middleware:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: String(err) }));
            return;
          }
        }

        if (req.url && req.url.startsWith('/api/health')) {
          try {
            const { default: handler } = await import('./api/health.js');
            let body = {};
            if (req.method === 'POST') {
              const buffers: Buffer[] = [];
              for await (const chunk of req) {
                buffers.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
              }
              try {
                body = JSON.parse(Buffer.concat(buffers).toString('utf-8'));
              } catch (e) {}
            }
            (req as any).body = body;
            const parsedUrl = new URL(req.url, 'http://localhost:3000');
            (req as any).query = Object.fromEntries(parsedUrl.searchParams.entries());
            (res as any).status = function (code: number) {
              res.statusCode = code;
              return res;
            };
            (res as any).json = function (data: any) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };
            return handler(req, res);
          } catch (err) {
            console.error('Error in /api/health middleware:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: String(err) }));
            return;
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), mcpApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
