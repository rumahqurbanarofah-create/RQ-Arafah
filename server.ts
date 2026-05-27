import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Simple API Health Check
  app.get('/api/health', (req, res) => {
    return res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Serve static files / app logic based on environment
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting dev server with Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Production mode: Serving static files.');
    // In production, the compiled server.cjs lies in dist/ directory.
    // So both dist path can be resolved via __dirname or process.cwd()
    const distPath = path.resolve(__dirname);
    console.log(`__dirname is: ${__dirname}`);
    console.log(`process.cwd() is: ${process.cwd()}`);
    console.log(`Checking if index.html exists in ${distPath}...`);
    
    if (fs.existsSync(path.join(distPath, 'index.html'))) {
      console.log('Successfully located index.html inside', distPath);
    } else {
      console.warn('Could not locate index.html inside', distPath, '. Checking process.cwd() / dist');
    }

    // Serve static files
    app.use(express.static(distPath));

    // Wildcard route to serve SPA
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        const fallbackPath = path.join(process.cwd(), 'dist', 'index.html');
        if (fs.existsSync(fallbackPath)) {
          res.sendFile(fallbackPath);
        } else {
          res.status(404).send(`Error: index.html not found on server. Checked paths: ${indexPath} and ${fallbackPath}`);
        }
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running and bound on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal start error details:', err);
  process.exit(1);
});
