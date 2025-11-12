// Arquivo: src/screens/login/auth.js (Código Completo)

import apiClient from '../../utils/api.js';

export const authenticate = async (email, password) => {
  try {
    // 1. Tenta fazer o login. Se falhar (400, 401), o apiClient vai lançar um erro.
    const response = await apiClient.login(email, password);

    // 2. Se a chamada for bem-sucedida, o response.token DEVE existir
    if (response && response.token) {
      // Salva o token no localStorage
      localStorage.setItem('authToken', response.token);

      return {
        success: true,
        user: response.user,
      };
    } else {
      // Caso improvável: Sucesso na requisição, mas sem token.
      return {
        success: false,
        message: "Resposta do servidor incompleta. Tente novamente.",
      };
    }

  } catch (error) {
    // 3. Se o apiClient lançar um erro (devido a 400, 401, ou rede), este bloco é executado.
    // Isso evita o erro `reading 'token'` na tela inicial.
    return {
      success: false,
      message: error.message || "Erro de autenticação desconhecido. Verifique o servidor.",
    };
  }
};