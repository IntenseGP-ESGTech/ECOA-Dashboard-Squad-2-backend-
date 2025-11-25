const { query } = require('../db');
const { parseJsonBody } = require('../utils/body');

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

async function handleListPlans(req, res) {
  try {
    const userId = req.user.id;
    
    const text = `
      SELECT 
        p.*,
        u.email as responsavel_email,
        COALESCE(
          json_agg(json_build_object('id', uc.id, 'email', uc.email)) 
          FILTER (WHERE uc.id IS NOT NULL), 
          '[]'
        ) as collaborators_data
      FROM esg_plans p
      LEFT JOIN users u ON p.responsavel_id = u.id
      LEFT JOIN plan_collaborators pc ON p.id = pc.plan_id
      LEFT JOIN users uc ON pc.user_id = uc.id
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC
    `;
    
    const result = await query(text);
    return sendJson(res, 200, result.rows);
  } catch (err) {
    console.error(err);
    return sendJson(res, 500, { message: 'Erro ao listar planos' });
  }
}

async function handleGetPlan(req, res, id) {
  try {
    const text = `
      SELECT 
        p.*,
        u.email as responsavel_email,
        COALESCE(
          json_agg(json_build_object('id', uc.id, 'email', uc.email)) 
          FILTER (WHERE uc.id IS NOT NULL), 
          '[]'
        ) as collaborators_data
      FROM esg_plans p
      LEFT JOIN users u ON p.responsavel_id = u.id
      LEFT JOIN plan_collaborators pc ON p.id = pc.plan_id
      LEFT JOIN users uc ON pc.user_id = uc.id
      WHERE p.id = $1
      GROUP BY p.id, u.id
    `;
    const result = await query(text, [id]);
    
    if (result.rowCount === 0) {
      return sendJson(res, 404, { message: 'Plano não encontrado' });
    }
    return sendJson(res, 200, result.rows[0]);
  } catch (err) {
    return sendJson(res, 500, { message: 'Erro ao buscar plano' });
  }
}

async function handleCreatePlan(req, res) {
  try {
    const body = await parseJsonBody(req);
    const { codigo, nome, descricao, status, data_conclusao, collaborators } = body;
    const responsavel_id = req.user.id; 

    if (!codigo || !nome) return sendJson(res, 400, { message: 'Código e Nome obrigatórios.' });

    const text = `
      INSERT INTO esg_plans (codigo, nome, descricao, status, responsavel_id, data_conclusao)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, codigo, nome
    `;
    const values = [codigo, nome, descricao || '', status || 'Pendente', responsavel_id, data_conclusao || null];
    
    const result = await query(text, values);
    const newPlan = result.rows[0];

    if (collaborators && Array.isArray(collaborators) && collaborators.length > 0) {
      for (const email of collaborators) {
        const userRes = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (userRes.rowCount > 0) {
          try {
             await query('INSERT INTO plan_collaborators (plan_id, user_id) VALUES ($1, $2)', [newPlan.id, userRes.rows[0].id]);
          } catch (e) {}
        }
      }
    }
    return sendJson(res, 201, { ...newPlan, message: 'Plano criado!' });
  } catch (err) {
    if (err.code === '23505') return sendJson(res, 409, { message: 'Código já existe.' });
    console.error(err);
    return sendJson(res, 500, { message: 'Erro ao criar plano' });
  }
}

async function handleAddCollaborator(req, res, planId) {
  try {
    const userId = req.user.id;
    
    const planCheck = await query('SELECT responsavel_id FROM esg_plans WHERE id = $1', [planId]);
    if (planCheck.rowCount === 0) return sendJson(res, 404, { message: 'Plano não encontrado' });

    if (planCheck.rows[0].responsavel_id !== userId) {
      return sendJson(res, 403, { message: 'Apenas o dono pode adicionar membros.' });
    }

    const body = await parseJsonBody(req);
    const { email } = body; 
    if (!email) return sendJson(res, 400, { message: 'Email obrigatório' });

    const userToAdd = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (userToAdd.rowCount === 0) return sendJson(res, 404, { message: 'Usuário não encontrado.' });

    await query(
      'INSERT INTO plan_collaborators (plan_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [planId, userToAdd.rows[0].id]
    );

    return sendJson(res, 201, { message: 'Adicionado com sucesso!' });
  } catch (err) {
    console.error(err);
    return sendJson(res, 500, { message: 'Erro ao adicionar' });
  }
}

async function handleRemoveCollaborator(req, res, planId) {
  try {
    const requesterId = req.user.id;
    const body = await parseJsonBody(req);
    const { email } = body;

    const planCheck = await query('SELECT responsavel_id FROM esg_plans WHERE id = $1', [planId]);
    if (planCheck.rowCount === 0) return sendJson(res, 404, { message: 'Plano não encontrado' });

    const ownerId = planCheck.rows[0].responsavel_id;

    if (ownerId !== requesterId) {
      return sendJson(res, 403, { message: 'Apenas o criador do plano pode remover colaboradores.' });
    }

    const userRem = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRem.rowCount === 0) return sendJson(res, 404, { message: 'Usuário a remover não encontrado.' });

    await query('DELETE FROM plan_collaborators WHERE plan_id = $1 AND user_id = $2', [planId, userRem.rows[0].id]);

    return sendJson(res, 200, { message: 'Colaborador removido.' });
  } catch (err) {
    console.error(err);
    return sendJson(res, 500, { message: 'Erro ao remover colaborador' });
  }
}

async function checkPermission(planId, userId) {
  const planResult = await query('SELECT responsavel_id FROM esg_plans WHERE id = $1', [planId]);
  if (planResult.rowCount === 0) return false; 
  if (planResult.rows[0].responsavel_id === userId) return true; // É o dono

  const collabResult = await query('SELECT 1 FROM plan_collaborators WHERE plan_id = $1 AND user_id = $2', [planId, userId]);
  return collabResult.rowCount > 0;
}

async function handleUpdatePlan(req, res, id) {
  try {
    const canEdit = await checkPermission(id, req.user.id);
    if (!canEdit) return sendJson(res, 403, { message: 'Sem permissão.' });

    const body = await parseJsonBody(req);
    const { nome, descricao, status, data_conclusao } = body;
    const text = `UPDATE esg_plans SET nome=COALESCE($1,nome), descricao=COALESCE($2,descricao), status=COALESCE($3,status), data_conclusao=COALESCE($4,data_conclusao), updated_at=CURRENT_TIMESTAMP WHERE id=$5 RETURNING *`;
    const result = await query(text, [nome, descricao, status, data_conclusao, id]);
    return sendJson(res, 200, result.rows[0]);
  } catch (err) { return sendJson(res, 500, { message: 'Erro update' }); }
}

async function handleDeletePlan(req, res, id) {
  try {
    const canDelete = await checkPermission(id, req.user.id);
    if (!canDelete) return sendJson(res, 403, { message: 'Sem permissão.' });

    await query('DELETE FROM esg_plans WHERE id = $1', [id]);
    return sendJson(res, 200, { message: 'Removido' });
  } catch (err) { return sendJson(res, 500, { message: 'Erro delete' }); }
}

module.exports = {
  handleListPlans,
  handleGetPlan,
  handleCreatePlan,
  handleUpdatePlan,
  handleDeletePlan,
  handleAddCollaborator,
  handleRemoveCollaborator
};