const API_URL = 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const plansService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/plans`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar planos');
    return await response.json();
  },

  create: async (planData) => {
    const response = await fetch(`${API_URL}/plans`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(planData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Erro ao criar plano');
    }
    return await response.json();
  },

  update: async (id, planData) => {
    const response = await fetch(`${API_URL}/plans/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(planData),
    });
    if (!response.ok) throw new Error('Erro ao atualizar plano');
    return await response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/plans/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao excluir plano');
    return true;
  },

  addCollaborator: async (planId, email) => {
    const response = await fetch(`${API_URL}/plans/${planId}/collaborators`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Erro ao adicionar membro');
    }
    return await response.json();
  },

  removeCollaborator: async (planId, email) => {
    const response = await fetch(`${API_URL}/plans/${planId}/collaborators`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Erro ao remover membro');
    }
    return await response.json();
  }
};