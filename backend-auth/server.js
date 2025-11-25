const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { handleRegister, handleLogin, handleMe, handleLogout, handleGoogleLogin } = require('./src/handlers/auth');
// IMPORTANTE: Adicione handleAddCollaborator aqui na importação
const {
  handleListPlans,
  handleGetPlan,
  handleCreatePlan,
  handleUpdatePlan,
  handleDeletePlan,
  handleAddCollaborator,
  handleRemoveCollaborator
} = require('./src/handlers/plans');

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

  // --- ROTAS DE DOCUMENTAÇÃO ---
  if (pathname === '/docs' && method === 'GET') {
    const htmlPath = path.join(__dirname, 'swagger', 'index.html');
    fs.readFile(htmlPath, (err, data) => {
      if (err) { res.statusCode = 500; res.end('Erro doc'); return; }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(data);
    });
    return;
  }
  if (pathname === '/docs/swagger.yaml' && method === 'GET') {
    const yamlPath = path.join(__dirname, 'swagger', 'swagger.yaml');
    fs.readFile(yamlPath, (err, data) => {
      if (err) { res.statusCode = 500; res.end('Erro yaml'); return; }
      res.setHeader('Content-Type', 'application/yaml; charset=utf-8');
      res.end(data);
    });
    return;
  }

  // --- ROTAS DE AUTH ---
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
    await authMiddleware(req, res, async () => { await handleMe(req, res); });
    return;
  }
  if (pathname === '/auth/logout' && method === 'POST') {
    await authMiddleware(req, res, async () => { await handleLogout(req, res); });
    return;
  }

  // --- ROTAS DE PLANOS (CRUD) ---

  // 1. Rota Genérica (/plans)
  if (pathname === '/plans') {
    await authMiddleware(req, res, async () => {
      if (method === 'GET') {
        await handleListPlans(req, res);
      } else if (method === 'POST') {
        await handleCreatePlan(req, res);
      } else {
        res.statusCode = 405; res.end(JSON.stringify({ message: 'Method Not Allowed' }));
      }
    });
    return;
  }

  // 2. Rota de Colaboradores (/plans/:id/collaborators)
  // IMPORTANTE: Esta verificação deve vir ANTES ou ser regex específica para não confundir com /plans/:id
  const collabMatch = pathname.match(/^\/plans\/(\d+)\/collaborators$/);
  if (collabMatch) {
    const planId = collabMatch[1];
    await authMiddleware(req, res, async () => {
      if (method === 'POST') {
        await handleAddCollaborator(req, res, planId);
      } else if (method === 'DELETE') {
        // O DELETE vai receber o email no body também, igual ao POST
        await handleRemoveCollaborator(req, res, planId);
      } else {
        res.statusCode = 405; res.end(JSON.stringify({ message: 'Method Not Allowed' }));
      }
    });
    return;
  }

  // 3. Rota Específica (/plans/:id)
  const idMatch = pathname.match(/^\/plans\/(\d+)$/);
  if (idMatch) {
    const planId = idMatch[1];
    await authMiddleware(req, res, async () => {
      if (method === 'GET') {
        await handleGetPlan(req, res, planId);
      } else if (method === 'PUT') {
        await handleUpdatePlan(req, res, planId);
      } else if (method === 'DELETE') {
        await handleDeletePlan(req, res, planId);
      } else {
        res.statusCode = 405; res.end(JSON.stringify({ message: 'Method Not Allowed' }));
      }
    });
    return;
  }

  // 404 Not Found
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Not Found' }));
});

server.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});