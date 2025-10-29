import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, ArrowLeft, AlertTriangle } from "lucide-react";
import apiClient from '../../utils/api.js';
import { useAuth } from '../../contexts/AuthContext';
import './sair.css';

function Sair() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    
    try {
      // Fazer logout no backend
      await apiClient.logout();
    } catch (error) {
      console.error("Erro no logout:", error);
      // Mesmo com erro, continuar com o logout local
    } finally {
      // Usar o contexto para fazer logout
      logout();
      
      // Redirecionar para a página de login
      navigate('/login');
    }
  };

  return (
    <div className="dashboard-background">
      <div className="sair-container">
        <div className="sair-header">
          <h1>Sair do Sistema</h1>
        </div>

        <div className="sair-content">
          <div className="sair-icon">
            <AlertTriangle size={80} color="#dc3545" />
          </div>
          
          <h2>Tem certeza que deseja sair?</h2>
          
          <p className="sair-message">
            Você será desconectado do sistema e precisará fazer login novamente para acessar o dashboard.
          </p>

          <div className="sair-buttons">
            <Link to="/dashboard">
              <button className="sair-button cancel-button">
                <ArrowLeft size={16} /> Cancelar
              </button>
            </Link>
            <button 
              className="sair-button confirm-button"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? "Saindo..." : (
                <>
                  <LogOut size={16} /> Confirmar Saída
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sair;
