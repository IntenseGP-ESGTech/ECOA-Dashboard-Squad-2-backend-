// Arquivo: src/screens/login/LoginHome.jsx (CORRIGIDO)

import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- NOVIDADE: Para forçar o redirecionamento
import "./Login.css";
import Botao from "../../componentes/botao/Botao";
import { FaUser, FaLock } from "react-icons/fa";
import { authenticate } from "./auth";
import { useAuth } from "../../contexts/AuthContext"; // <-- NOVIDADE: Para atualizar o estado global

const LoginHome = () => { // Não recebe mais 'setIsAuthenticated' como prop
  const { login } = useAuth(); // Obtém a função de login do contexto
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Inicializa o hook de navegação

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação básica
    if (!credentials.email || !credentials.password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const authResult = await authenticate(
        credentials.email,
        credentials.password
      );
      if (authResult.success) {
        login();// 1. Chama a função do AuthContext
        navigate("/dashboard", { replace: true });// 2. Redireciona para o Dashboard
      } else {
        setError(authResult.message || "Credenciais inválidas. Por favor, tente novamente.");
      }
    } catch (err) {
      setError(err.message || "Ocorreu um erro. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-container">
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="E-mail corporativo"
                className="login-input"
                required
                value={credentials.email}
                onChange={handleChange}
              />
            </div>

            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="Senha"
                className="login-input"
                required
                value={credentials.password}
                onChange={handleChange}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <Botao
              nome={loading ? "CARREGANDO..." : "ENTRAR"}
              type="submit"
              disabled={loading}
              className="login-button"
            />

            <div className="linkforgetpassword">
              <a href="#recover" className="link-forget-password">
                Esqueceu a senha?
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginHome;