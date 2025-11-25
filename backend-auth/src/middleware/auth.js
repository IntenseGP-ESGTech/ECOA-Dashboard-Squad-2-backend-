// src/middleware/auth.js
const jwt = require('jsonwebtoken');

const tokenBlacklist = new Set();

function addToBlacklist(token) {
  tokenBlacklist.add(token);
}

function isBlacklisted(token) {
  return tokenBlacklist.has(token);
}

async function authMiddleware(req, res, next) {
  console.log('--- Auth Middleware Iniciado ---');
  
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  
  // 1. Verifica se o cabeçalho existe
  if (!authHeader) {
    console.log('ERRO: Cabeçalho Authorization não encontrado.');
    return sendAuthError(res, 'Missing Authorization header');
  }

  // 2. Verifica se começa com Bearer
  if (!authHeader.startsWith('Bearer ')) {
    console.log('ERRO: Formato do cabeçalho inválido. Recebido:', authHeader);
    return sendAuthError(res, 'Invalid Authorization format');
  }

  const token = authHeader.slice('Bearer '.length);
  console.log('Token extraído (primeiros 10 chars):', token.substring(0, 10) + '...');

  // 3. Verifica Blacklist
  if (isBlacklisted(token)) {
    console.log('ERRO: Token está na blacklist (logout feito).');
    return sendAuthError(res, 'Token invalidated');
  }

  // 4. Tenta Validar o Token
  try {
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const payload = jwt.verify(token, secret);
    console.log('SUCESSO: Token válido para usuário ID:', payload.id);
    req.user = payload;
    await next();
  } catch (err) {
    console.error('ERRO JWT VERIFY:', err.message);
    return sendAuthError(res, 'Invalid token: ' + err.message);
  }
}

function sendAuthError(res, message) {
  res.statusCode = 401;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message }));
}

module.exports = {
  authMiddleware,
  addToBlacklist,
};