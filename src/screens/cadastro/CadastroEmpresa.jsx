import Botao from "../../componentes/botao/Botao";
import apiClient from '../../utils/api.js';
import { useState } from 'react';

export default function CadastroEmpresa(){
    const [formData, setFormData] = useState({
        cnpj: "",
        email: "",
        nome_social: "",
        password: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            setError("As senhas não coincidem");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const userData = {
                email: formData.email,
                password: formData.password,
                tipo: "empresa",
                dadosEspecificos: {
                    cnpj: formData.cnpj,
                    nome_social: formData.nome_social
                }
            };

            await apiClient.register(userData);
            alert("Empresa cadastrada com sucesso! Faça login para continuar.");
            
            // Limpar formulário
            setFormData({
                cnpj: "",
                email: "",
                nome_social: "",
                password: "",
                confirmPassword: ""
            });
        } catch (error) {
            setError(error.message || "Erro ao cadastrar empresa");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="form-cadastro" onSubmit={handleSubmit}>
          {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
          
          <div>
            <label htmlFor="cnpj">CNPJ</label>
            <input 
                type="text" 
                name="cnpj" 
                id="cnpj" 
                value={formData.cnpj}
                onChange={handleChange}
                required
            />
          </div>
          <div>
            <label htmlFor="email">E-mail Corporativo</label>
            <input 
                type="email" 
                name="email" 
                id="email" 
                value={formData.email}
                onChange={handleChange}
                required
            />
          </div>
          <div>
            <label htmlFor="nome_social">Nome Social</label>
            <input 
                type="text" 
                name="nome_social" 
                id="nome_social"
                value={formData.nome_social}
                onChange={handleChange}
                required
            />
          </div>
          <div>
            <label htmlFor="password">Defina sua Senha</label>
            <input 
                type="password" 
                name="password" 
                id="password" 
                value={formData.password}
                onChange={handleChange}
                required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword">Confirme sua Senha</label>
            <input 
                type="password" 
                name="confirmPassword" 
                id="confirmPassword" 
                value={formData.confirmPassword}
                onChange={handleChange}
                required
            />
          </div>
          <br />
          <Botao 
            nome={loading ? "CADASTRANDO..." : "Cadastrar"} 
            type="submit"
            disabled={loading}
          />
        </form>
    )
}