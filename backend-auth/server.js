const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { handleRegister, handleLogin, handleMe, handleLogout, handleGoogleLogin } = require('./src/handlers/auth');
const { authMiddleware } = require('./src/middleware/auth');

const PORT = process.env.PORT || 3001;

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method || 'GET';
  const pathname = parsedUrl.pathname || '/';

  setCors(res);

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Roteamento manual de documentação Swagger
  if (pathname === '/docs' && method === 'GET') {
    const htmlPath = path.join(__dirname, 'swagger', 'index.html');
    fs.readFile(htmlPath, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('Erro ao carregar documentação');
        return;
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(data);
    });
    return;
  }
  if (pathname === '/docs/swagger.yaml' && method === 'GET') {
    const yamlPath = path.join(__dirname, 'swagger', 'swagger.yaml');
    fs.readFile(yamlPath, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('Erro ao carregar swagger.yaml');
        return;
      }
      res.setHeader('Content-Type', 'application/yaml; charset=utf-8');
      res.end(data);
    });
    return;
  }

  // Roteamento manual de auth
  if (pathname === '/auth/register' && method === 'POST') {
    await handleRegister(req, res);
    return;
  }
  if (pathname === '/auth/login' && method === 'POST') {
    await handleLogin(req, res);
    return;
  }

  if (pathname === '/auth/google' && method === 'POST') {
    await handleGoogleLogin(req, res);
    return;
}
  if (pathname === '/auth/me' && method === 'GET') {
    await authMiddleware(req, res, async () => {
      await handleMe(req, res);
    });
    return;
  }
  if (pathname === '/auth/logout' && method === 'POST') {
    await authMiddleware(req, res, async () => {
      await handleLogout(req, res);
    });
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Not Found' }));
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Auth server running on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});




