import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Target, Calendar, ArrowLeft, Plus,
  Search, X, Edit2, Trash2, Save,
  Users, PlusCircle, XCircle, Crown,
  Menu, Play, Accessibility, Bell, Mail, BarChart2, 
  ChevronRight, CircleUserRound, GraduationCap, 
  FilePenLine, ClipboardList, Cog, LogOut
} from "lucide-react";
import { plansService } from "../../services/plansService";
import './plano_acao.css';

function PlanoAcao() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);
  const [isSidebarHidden, setSidebarHidden] = useState(false);

  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [collabEmail, setCollabEmail] = useState("");
  const [collaboratorsList, setCollaboratorsList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState({
    id: null,
    codigo: '',
    nome: '',
    descricao: '',
    status: 'Pendente',
    data_conclusao: ''
  });

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

  const fetchPlanos = async () => {
    try {
      setLoading(true);
      const data = await plansService.getAll();
      setPlanos(data);
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('http://localhost:3001/auth/me', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
    })
      .then(r => r.json())
      .then(data => setCurrentUser(data.user))
      .catch(console.error);

    fetchPlanos();
  }, []);

  const handleRemoveCollab = async (planId, email) => {
    if (!window.confirm(`Remover ${email} deste plano?`)) return;
    try {
      await plansService.removeCollaborator(planId, email);
      
      if (isModalOpen) {
        const updatedList = (currentPlan.collaborators_data || []).filter(c => c.email !== email);
        setCurrentPlan({ ...currentPlan, collaborators_data: updatedList });
      }
      fetchPlanos();
    } catch (e) {
      alert(e.message);
    }
  };

  const openModal = (plano = null) => {
    setCollabEmail("");
    setCollaboratorsList([]);

    if (plano) {
      setIsEditing(true);
      const dateValue = plano.data_conclusao ? plano.data_conclusao.split('T')[0] : '';
      setCurrentPlan({ ...plano, data_conclusao: dateValue });
    } else {
      setIsEditing(false);
      setCurrentPlan({
        id: null, codigo: '', nome: '', descricao: '', status: 'Pendente', data_conclusao: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este plano?")) {
      try {
        await plansService.delete(id);
        fetchPlanos();
      } catch (error) {
        alert("Erro ao excluir: " + error.message);
      }
    }
  };

  const getProgress = (status) => {
    if (status === 'Concluído') return 100;
    if (status === 'Em Andamento') return 50;
    return 0;
  };

  const getStatusClass = (status) => {
    if (status === 'Concluído') return 'status-concluido';
    if (status === 'Em Andamento') return 'status-em-andamento';
    if (status === 'Pendente') return 'status-pendente';
    return '';
  };

  const filteredPlanos = planos.filter(plano => {
    const matchesSearch = (plano.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plano.descricao || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && plano.status === statusFilter;
  });

  const handleAddEmail = async () => {
    if (!collabEmail || !collabEmail.includes('@')) {
      alert("Digite um e-mail válido.");
      return;
    }

    if (isEditing) {
      try {
        await plansService.addCollaborator(currentPlan.id, collabEmail);
        
        const newCollabObj = { email: collabEmail, id: Date.now() };
        const currentList = currentPlan.collaborators_data || [];
        
        setCurrentPlan({
          ...currentPlan,
          collaborators_data: [...currentList, newCollabObj]
        });
        
        setCollabEmail("");
        fetchPlanos();
      } catch (error) {
        alert(error.message);
      }
    } else {
      setCollaboratorsList([...collaboratorsList, collabEmail]);
      setCollabEmail("");
    }
  };

  const handleRemoveEmailTemp = (emailToRemove) => {
    setCollaboratorsList(collaboratorsList.filter(email => email !== emailToRemove));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await plansService.update(currentPlan.id, currentPlan);
      } else {
        const payload = {
          ...currentPlan,
          collaborators: collaboratorsList
        };
        await plansService.create(payload);
      }
      setIsModalOpen(false);
      fetchPlanos();
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    }
  };

  return (
    <div className="dashboard-background">
      <div className={`dashboard-container ${isSidebarHidden ? 'sidebar-hidden' : ''}`}>
        
        <header className="navbar w3-card">
          <div className="navbar-left">
            <div className="logo">
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

        <button
          className={`hamburger-btn ${isSidebarHidden ? "sidebar-hidden" : ""}`}
          onClick={toggleSidebar}
        >
          {isSidebarHidden ? <ChevronRight size={24} /> : <Menu size={24} />}
        </button>

        <aside
          className={`sidebar ${isMobileMenuOpen ? "mobile-open" : ""} ${isSidebarHidden ? "sidebar-hidden" : ""} ${isSidebarExpanded ? "sidebar-expanded" : "sidebar-collapsed"}`}
          onMouseEnter={expandSidebar}
          onMouseLeave={collapseSidebar}
        >
          <div className="sidebar-icons">
            <Link to="/minha-conta" className="sidebar-icon">
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
            <Link to="/plano-acao" className="sidebar-icon active">
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

        <main className="main-content">
          <div className="plano-acao-container">
            
            <div className="plano-acao-content">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '1rem'}}>
                 <h1 style={{margin:0}}>Planos de Ação</h1>
                 <button className="add-plano-button" onClick={() => openModal()} style={{margin:0}}>
                    <Plus size={16} /> Novo Plano
                 </button>
              </div>

              <div className="filters">
                <div className="search-bar">
                  <div className="search-icon-wrapper">
                    <Search size={18} color="#ccc" />
                  </div>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar por nome ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="filter-options">
                  <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Todos os status</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <p className="loading-text">Carregando planos...</p>
              ) : (
                <div className="planos-grid">
                  {filteredPlanos.length === 0 && (
                    <p style={{color:'#ccc'}}>Nenhum plano encontrado.</p>
                  )}
                  {filteredPlanos.map(plano => (
                    <div className="plano-card" key={plano.id}>
                      <div className="card-header-flex">
                        <span className="card-code">{plano.codigo}</span>
                        <div className="card-actions-top">
                          <button onClick={() => openModal(plano)} title="Editar"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(plano.id)} title="Excluir" className="btn-delete"><Trash2 size={16} /></button>
                        </div>
                      </div>

                      <h3 className="plano-title">
                        <Target size={20} />
                        {plano.nome}
                      </h3>

                      <p className="plano-description">
                        {plano.descricao || 'Sem descrição definida.'}
                      </p>

                      <div className="plano-meta">
                        <span className={`status-badge ${getStatusClass(plano.status)}`}>
                          {plano.status}
                        </span>
                        <span>
                          <Calendar size={14} className="icon-margin" />
                          {plano.data_conclusao ? new Date(plano.data_conclusao).toLocaleDateString() : 'Sem data'}
                        </span>
                      </div>

                      <div className="plano-progress">
                        <div className="progress-label">
                          <span>Progresso Estimado</span>
                          <span>{getProgress(plano.status)}%</span>
                        </div>
                        <div className="progress-bar-container">
                          <div
                            className="progress-bar"
                            style={{ width: `${getProgress(plano.status)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="card-team-footer">
                        <div className="card-owner-info">
                          <Crown size={14} fill="#ffd700" />
                          <span className="owner-label">Dono:</span>
                          <span className="owner-email">{plano.responsavel_email}</span>
                        </div>

                        <div className="collaborators-list">
                          {plano.collaborators_data && plano.collaborators_data.length > 0 ? (
                            plano.collaborators_data.map(collab => (
                              <div key={collab.id} className="collab-tag">
                                <Users size={12} color="#a0aec0" />
                                {collab.email}
                                {currentUser && currentUser.email === plano.responsavel_email && (
                                  <button
                                    className="btn-remove-collab"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveCollab(plano.id, collab.email)
                                    }}
                                    title="Remover colaborador"
                                  >
                                    <XCircle size={14} />
                                  </button>
                                )}
                              </div>
                            ))
                          ) : (
                            <span className="empty-team-msg">
                              Sem equipe extra.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content-glass">
              <div className="modal-header">
                <h2>{isEditing ? 'Editar Plano' : 'Novo Plano'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="close-modal-btn">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Código (ID Interno)</label>
                    <input
                      type="text"
                      required
                      value={currentPlan.codigo}
                      onChange={e => setCurrentPlan({ ...currentPlan, codigo: e.target.value })}
                      placeholder="Ex: ESG-01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Data de Conclusão</label>
                    <input
                      type="date"
                      value={currentPlan.data_conclusao}
                      onChange={e => setCurrentPlan({ ...currentPlan, data_conclusao: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Nome do Objetivo</label>
                  <input
                    type="text"
                    required
                    value={currentPlan.nome}
                    onChange={e => setCurrentPlan({ ...currentPlan, nome: e.target.value })}
                    placeholder="Ex: Redução de consumo de papel"
                  />
                </div>

                <div className="form-group">
                  <label>Descrição</label>
                  <textarea
                    rows="3"
                    value={currentPlan.descricao}
                    onChange={e => setCurrentPlan({ ...currentPlan, descricao: e.target.value })}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Status Atual</label>
                  <select
                    value={currentPlan.status}
                    onChange={e => setCurrentPlan({ ...currentPlan, status: e.target.value })}
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>

                <div className="form-group-collaborators">
                  <label className="label-with-icon">
                    <Users size={16} /> Cooperadores do Plano
                  </label>

                  <div className="input-group-row">
                    <input
                      type="email"
                      placeholder="E-mail do colega"
                      className="input-email-collab"
                      value={collabEmail}
                      onChange={(e) => setCollabEmail(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleAddEmail}
                      className="btn-add-collab"
                      title="Adicionar Colaborador"
                    >
                      <PlusCircle size={20} />
                    </button>
                  </div>

                  {!isEditing && collaboratorsList.length > 0 && (
                    <div className="collaborators-tags-container">
                      {collaboratorsList.map((email, idx) => (
                        <span key={idx} className="collaborator-tag-item">
                          {email}
                          <button
                            type="button"
                            onClick={() => handleRemoveEmailTemp(email)}
                            className="btn-remove-tag"
                          >
                            <XCircle size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {isEditing && currentPlan.collaborators_data && (
                     <div className="collaborators-tags-container" style={{marginTop: 10}}>
                        {currentPlan.collaborators_data.map((collab) => (
                          <span key={collab.id} className="collaborator-tag-item">
                             {collab.email}
                          </span>
                        ))}
                     </div>
                  )}

                  {isEditing && (
                    <p className="hint-text">
                      * Ao clicar no botão (+), o usuário é adicionado imediatamente ao plano.
                    </p>
                  )}
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-save">
                    <Save size={16} /> Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlanoAcao;