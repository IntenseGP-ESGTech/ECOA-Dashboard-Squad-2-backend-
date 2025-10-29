const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { parseJsonBody } = require('../utils/body');
const { addToBlacklist } = require('../middleware/auth');

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function sanitizeUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    tipo: row.tipo,
    dados_especificos: row.dados_especificos,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function handleRegister(req, res) {
  try {
    const body = await parseJsonBody(req);
    const { email, password, tipo, dadosEspecificos } = body || {};

    if (!email || !password || !tipo) {
      return sendJson(res, 400, { message: 'email, password e tipo são obrigatórios' });
    }

    const allowedTipos = ['empresa', 'funcionario', 'representante', 'filial'];
    if (!allowedTipos.includes(tipo)) {
      return sendJson(res, 400, { message: 'tipo inválido' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return sendJson(res, 409, { message: 'Email já cadastrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const insert = await query(
      `INSERT INTO users (email, password_hash, tipo, dados_especificos)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, tipo, dados_especificos, created_at, updated_at`,
      [email, passwordHash, tipo, dadosEspecificos || {}]
    );

    return sendJson(res, 201, { user: sanitizeUser(insert.rows[0]) });
  } catch (err) {
    return sendJson(res, 400, { message: err.message || 'Erro ao registrar' });
  }
}

async function handleLogin(req, res) {
  try {
    const body = await parseJsonBody(req);
    const { email, password } = body || {};
    if (!email || !password) {
      return sendJson(res, 400, { message: 'email e password são obrigatórios' });
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      return sendJson(res, 401, { message: 'Credenciais inválidas' });
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return sendJson(res, 401, { message: 'Credenciais inválidas' });
    }

    const payload = { id: user.id, email: user.email, tipo: user.tipo };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '1h' });

    return sendJson(res, 200, { token, user: sanitizeUser(user) });
  } catch (err) {
    return sendJson(res, 400, { message: err.message || 'Erro ao autenticar' });
  }
}

async function handleMe(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendJson(res, 401, { message: 'Não autorizado' });
    }
    const result = await query(
      'SELECT id, email, tipo, dados_especificos, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );
    if (result.rowCount === 0) {
      return sendJson(res, 404, { message: 'Usuário não encontrado' });
    }
    return sendJson(res, 200, { user: sanitizeUser(result.rows[0]) });
  } catch (err) {
    return sendJson(res, 400, { message: err.message || 'Erro ao obter usuário' });
  }
}

async function handleLogout(req, res) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
    if (token) {
      addToBlacklist(token);
    }
    return sendJson(res, 200, { message: 'Logout efetuado' });
  } catch (err) {
    return sendJson(res, 400, { message: err.message || 'Erro ao sair' });
  }
}

module.exports = {
  handleRegister,
  handleLogin,
  handleMe,
  handleLogout,
};




