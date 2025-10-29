import apiClient from '../../utils/api.js';

export const authenticate = async (email, password) => {
  try {
    const response = await apiClient.login(email, password);
    
    // Salvar token no localStorage
    localStorage.setItem('authToken', response.token);
    
    return {
      success: true,
      user: response.user,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Erro de autenticação",
    };
  }
};