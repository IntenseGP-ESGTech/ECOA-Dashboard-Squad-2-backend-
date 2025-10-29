const jwt = require('jsonwebtoken');

// Lista simples de tokens inválidos em memória
const tokenBlacklist = new Set();

function addToBlacklist(token) {
  tokenBlacklist.add(token);
}

function isBlacklisted(token) {
  return tokenBlacklist.has(token);
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Missing or invalid Authorization header' }));
    return;
  }

  const token = authHeader.slice('Bearer '.length);
  if (isBlacklisted(token)) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Token invalidated' }));
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = payload;
    await next();
  } catch (err) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Invalid token' }));
  }
}

module.exports = {
  authMiddleware,
  addToBlacklist,
};




