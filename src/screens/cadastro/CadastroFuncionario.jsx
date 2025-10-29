import Botao from "../../componentes/botao/Botao";
import apiClient from '../../utils/api.js';
import { useState } from 'react';

export default function CadastroFuncionario(){
    const [formData, setFormData] = useState({
        email: "",
        matricula: "",
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
                tipo: "funcionario",
                dadosEspecificos: {
                    matricula: formData.matricula
                }
            };

            await apiClient.register(userData);
            alert("Funcionário cadastrado com sucesso! Faça login para continuar.");
            
            // Limpar formulário
            setFormData({
                email: "",
                matricula: "",
                password: "",
                confirmPassword: ""
            });
        } catch (error) {
            setError(error.message || "Erro ao cadastrar funcionário");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="form-cadastro" onSubmit={handleSubmit}>
          {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
          
          <div>
            <label htmlFor="email">E-mail Institucional</label>
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
            <label htmlFor="matricula">Matrícula</label>
            <input 
                type="text" 
                name="matricula" 
                id="matricula" 
                value={formData.matricula}
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