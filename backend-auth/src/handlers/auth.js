const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
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

async function handleGoogleLogin(req, res) {
  try {
    const body = await parseJsonBody(req);
    const { token: accessToken } = body || {}; // O token que o frontend enviou
    if (!accessToken) {
      return sendJson(res, 400, { message: 'Token de acesso não fornecido' });
    }

    // 1. Trocar o Access Token por dados do usuário (Server-to-Server Call)
    const googleResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const googleUser = googleResponse.data;
    const email = googleUser.email;

    if (!email) {
      return sendJson(res, 401, { message: 'Não foi possível obter o e-mail do Google' });
    }

    // 2. Verificar/Criar Usuário no seu Banco de Dados (PostgreSQL)
    let result = await query('SELECT * FROM users WHERE email = $1', [email]);
    let user;

    if (result.rowCount === 0) {
      const defaultTipo = 'funcionario';
      const defaultPasswordHash = ''; // Não armazena senha para login social

      const dadosEspecificosJson = JSON.stringify({
        nome: googleUser.name,
        picture: googleUser.picture,
        completo: false
      });

      const insert = await query(
        `INSERT INTO users (email, password_hash, tipo, dados_especificos) VALUES ($1, $2, $3, $4) RETURNING id, email, tipo, dados_especificos, created_at, updated_at`,
        [email, defaultPasswordHash, defaultTipo, dadosEspecificosJson]
      );
      user = insert.rows[0];
    } else {
      // Usuário existe
      user = result.rows[0];
    }

    // 3. Gerar JWT de Sessão Interna
    const payload = { id: user.id, email: user.email, tipo: user.tipo };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '1h' });

    // 4. Retornar o token e os dados do usuário para o frontend
    return sendJson(res, 200, { token, user: sanitizeUser(user) });

  } catch (err) {
    // O log de erro agora é essencial para a depuração!
    console.error('Google Login Error DETALHADO:', err.message);
    return sendJson(res, 401, { message: 'Falha na autenticação via Google.' });
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
  handleGoogleLogin,
  handleMe,
  handleLogout,
};




