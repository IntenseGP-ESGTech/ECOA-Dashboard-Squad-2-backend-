import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, ArrowLeft } from "lucide-react";
import apiClient from '../../utils/api.js';
import './minha_conta.css';

function MinhaConta() {
  const [userData, setUserData] = useState({
    nome: "",
    email: "",
    cargo: "",
    departamento: "",
    telefone: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMe();
      const user = response.user;
      
      let nome = "";
      let cargo = "";
      let departamento = "";
      let telefone = "";
      
      if (user.dados_especificos) {
        switch (user.tipo) {
          case 'empresa':
            nome = user.dados_especificos.nome_social || "";
            cargo = "Empresa";
            departamento = "Corporativo";
            break;
          case 'funcionario':
            nome = user.dados_especificos.nome || "";
            cargo = user.dados_especificos.cargo || "";
            departamento = user.dados_especificos.departamento || "";
            telefone = user.dados_especificos.telefone || "";
            break;
          case 'representante':
            nome = user.dados_especificos.nome_completo || "";
            cargo = "Representante";
            departamento = "Comercial";
            telefone = user.dados_especificos.telefone || "";
            break;
          default:
            nome = user.email;
            cargo = user.tipo;
        }
      }

      setUserData({
        nome: nome || user.email,
        email: user.email,
        cargo: cargo || user.tipo,
        departamento: departamento || "N/A",
        telefone: telefone || ""
      });
    } catch (error) {
      setError("Erro ao carregar dados do usuário");
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      alert("Erro ao atualizar perfil");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-background">
        <div className="minha-conta-container">
          <div className="minha-conta-header">
            <h1>Carregando...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-background">
        <div className="minha-conta-container">
          <div className="minha-conta-header">
            <h1>Erro</h1>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-background">
      <div className="minha-conta-container">
        <div className="minha-conta-header">
          <h1>Minha Conta</h1>
          <p>Gerencie suas informações pessoais</p>
        </div>

        <div className="minha-conta-content">
          <div className="profile-section">
            <div className="profile-image">
              <User size={80} />
            </div>
            <h2>{userData.nome}</h2>
            <p>
              {userData.cargo} - {userData.departamento}
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="profile-details">
              <div className="profile-field">
                <label htmlFor="nome">Nome Completo</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={userData.nome}
                  onChange={handleChange}
                />
              </div>

              <div className="profile-field">
                <label htmlFor="email">E-mail</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="profile-field">
                <label htmlFor="cargo">Cargo</label>
                <input
                  type="text"
                  id="cargo"
                  name="cargo"
                  value={userData.cargo}
                  onChange={handleChange}
                />
              </div>

              <div className="profile-field">
                <label htmlFor="departamento">Departamento</label>
                <input
                  type="text"
                  id="departamento"
                  name="departamento"
                  value={userData.departamento}
                  onChange={handleChange}
                />
              </div>

              <div className="profile-field">
                <label htmlFor="telefone">Telefone</label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={userData.telefone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="action-buttons">
              <Link to="/dashboard">
                <button type="button" className="action-button back-button">
                  <ArrowLeft size={16} /> Voltar
                </button>
              </Link>
              <button type="submit" className="action-button">
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MinhaConta;
