import React, { useState } from "react";
import "./styleflip.css";
import Botao from "../botao/Botao";
import LoginHome from "../../screens/login/LoginHome";
import Cadastro from "../../screens/cadastro/Cadastro";
// 1. Importar o hook useGoogleLogin
import { useGoogleLogin } from '@react-oauth/google';
// ⬅️ NOVO: Importar o useAuth e useNavigate
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";


function Flip() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);

  // 2. Funções de Callback
  const googleSuccess = (response) => {
    // O Access Token (não o ID token) é recebido aqui:
    const accessToken = response.access_token;

    console.log("Token de Acesso do Google recebido. Enviando para o backend...");

    // Chamar a função que envia o token para o backend
    handleBackendLogin(accessToken);
  };

  const handleBackendLogin = async (accessToken) => {
    const backendUrl = 'http://localhost:3001/auth/google';

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: accessToken }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login SUCESSO. Dados de Sessão obtidos do backend.");

        login();

        localStorage.setItem('authToken', data.token);

        navigate('/dashboard', { replace: true });

      } else {
        console.error("Falha na autenticação do backend:", data.message);
        alert("Erro ao criar a sessão. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro na comunicação com o backend:", error);
      alert("Erro ao criar a sessão. Tente novamente.");
    }
  };

  const googleError = () => {
    console.log("Login Google Falhou");
    alert("Erro ao criar a sessão. Tente novamente.");
  };

  // 3. Inicializa o hook de login
  const loginGoogle = useGoogleLogin({
    onSuccess: googleSuccess,
    onError: googleError,
    flow: 'implicit',
    scope: 'email profile',
  });

  return (
    <div
      className={`box ${isFlipped ? "flip" : ""}`}
      style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
    >
      <div className="front">
        <div className="text-boasvindas">
          <h1>Seja Bem Vindo ! </h1>
          <h3>Crie sua conta, leva menos de um minuto ! </h3>
        </div>

        <LoginHome />

        <div className="links">
          <div className="text-link" onClick={() => setIsFlipped(true)}>
            <Botao nome="Cadastrar-se" />
          </div>
        </div>

        {/* Aplicação do Login no Front */}
        <div className="links">
          <p> Faça login com </p>
          <img
            src="/assets/google.png"
            alt="Login com Google"
            onClick={loginGoogle}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>

      <div className="back">
        <Cadastro />

        {/* Aplicação do Login no Back */}
        <div className="links">
          <p> Faça login com </p>
          <img
            src="/assets/google.png"
            alt="Login com Google"
            onClick={loginGoogle}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <div className="text-link" onClick={() => setIsFlipped(false)}>
          <Botao
            bgColor="rgba(0, 0, 0, 0)"
            nome={<i className="fa-regular fa-circle-left"></i>}
          />
        </div>
      </div>
    </div>
  );
}

export default Flip;