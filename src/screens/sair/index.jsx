import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, ArrowLeft, AlertTriangle } from "lucide-react";
// Remover importação de apiClient, pois a lógica de chamada ao backend será feita no contexto.
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
      await apiClient.logout();
      console.log("Logout iniciado via contexto.");
    } catch (error) {
      console.error("Erro ao completar o logout (pode ser problema de rede):", error);
    } finally {
      logout();
      navigate('/', { replace: true });
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