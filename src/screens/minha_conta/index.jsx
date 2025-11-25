import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User, ArrowLeft,
  Menu, Play, Accessibility, Bell, Mail, BarChart2,
  ChevronRight, CircleUserRound, GraduationCap,
  FilePenLine, Target, ClipboardList, Cog, LogOut
} from "lucide-react";
import apiClient from '../../utils/api.js';
// Importando APENAS o CSS próprio, que agora contém tudo
import './minha_conta.css';

function MinhaConta() {
  // --- STATES DO LAYOUT ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);
  const [isSidebarHidden, setSidebarHidden] = useState(false);

  // --- STATES DOS DADOS ---
  const [userData, setUserData] = useState({
    nome: "",
    email: "",
    cargo: "",
    departamento: "",
    telefone: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- LÓGICA DO LAYOUT ---
  const toggleSidebar = () => {
    setSidebarHidden(!isSidebarHidden);
    setSidebarExpanded(false);
  };

  const expandSidebar = () => setSidebarExpanded(true);
  const collapseSidebar = () => setSidebarExpanded(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  // --- CARREGAR DADOS ---
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

  return (
    <div className="dashboard-background">
      <div className={`dashboard-container ${isSidebarHidden ? 'sidebar-hidden' : ''}`}>

        {/* NAVBAR */}
        <header className="navbar w3-card">
          <div className="navbar-left">
            <div className="logo">
              {/* Verifique se o caminho da imagem está correto */}
              <img src="/assets/logo.png" alt="Logo" />
              <div className="logo-underline"></div>
            </div>
          </div>
          <div className="navbar-right">
            <button className="nav-icon w3-button"><Play size={20} /></button>
            <button className="nav-icon w3-button"><Accessibility size={20} /></button>
            <button className="nav-icon w3-button"><Bell size={20} /></button>
            <button className="nav-icon w3-button"><Mail size={20} /></button>
          </div>
        </header>

        {/* BOTÃO MENU MOBILE */}
        <button
          className={`hamburger-btn ${isSidebarHidden ? "sidebar-hidden" : ""}`}
          onClick={toggleSidebar}
        >
          {isSidebarHidden ? <ChevronRight size={24} /> : <Menu size={24} />}
        </button>

        {/* SIDEBAR */}
        <aside
          className={`sidebar ${isMobileMenuOpen ? "mobile-open" : ""} ${isSidebarHidden ? "sidebar-hidden" : ""} ${isSidebarExpanded ? "sidebar-expanded" : "sidebar-collapsed"}`}
          onMouseEnter={expandSidebar}
          onMouseLeave={collapseSidebar}
        >
          <div className="sidebar-icons">
            <Link to="/minha-conta" className="sidebar-icon active">
              <CircleUserRound size={30} /><span className="sidebar-icon-text">Minha Conta</span>
            </Link>
            <Link to="/dashboard" className="sidebar-icon">
              <BarChart2 size={30} /><span className="sidebar-icon-text">Dashboard</span>
            </Link>
            <a href="https://intensegp.com.br/servicos/" target="_blank" rel="noreferrer" className="sidebar-icon">
              <GraduationCap size={30} /><span className="sidebar-icon-text">Academy</span>
            </a>
            <Link to="/questionario" className="sidebar-icon">
              <FilePenLine size={30} /><span className="sidebar-icon-text">Questionário</span>
            </Link>
            <Link to="/plano-acao" className="sidebar-icon">
              <Target size={30} /><span className="sidebar-icon-text">Plan. Ação</span>
            </Link>
            <Link to="/relatorio" className="sidebar-icon">
              <ClipboardList size={30} /><span className="sidebar-icon-text">Relatório</span>
            </Link>
            <Link to="/config" className="sidebar-icon">
              <Cog size={30} /><span className="sidebar-icon-text">Config</span>
            </Link>
            <Link to="/sair" className="sidebar-icon">
              <LogOut size={30} /><span className="sidebar-icon-text">Sair</span>
            </Link>
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="main-content">
          {loading ? (
            <div className="minha-conta-container">
              <div className="minha-conta-header"><h1>Carregando...</h1></div>
            </div>
          ) : error ? (
            <div className="minha-conta-container">
              <div className="minha-conta-header">
                <h1>Erro</h1>
                <p>{error}</p>
              </div>
            </div>
          ) : (
            <div className="minha-conta-container">
              <div className="minha-conta-header">
                <h1>Minha Conta</h1>
                <p>Gerencie suas informações pessoais</p>
              </div>

              <div className="minha-conta-content">
                <div className="profile-section">
                  <div className="profile-image">
                    <User size={60} />
                  </div>
                  <h2>{userData.nome}</h2>
                  <p>{userData.cargo} {userData.departamento !== "N/A" && ` - ${userData.departamento}`}</p>
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
                        disabled
                        style={{ opacity: 0.7, cursor: 'not-allowed' }}
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
          )}
        </main>
      </div>
    </div>
  );
}

export default MinhaConta;