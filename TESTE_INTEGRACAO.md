# 🚀 COMO TESTAR A INTEGRAÇÃO FRONTEND + BACKEND

> **📋 GUIA DE TESTE COMPLETO**  
> Este arquivo contém um passo a passo detalhado para testar toda a integração entre o frontend React e o backend Node.js.

## 📋 Pré-requisitos
- Node.js 18+ instalado
- PostgreSQL 13+ instalado e rodando
- Banco de dados `ecoa` criado

## 🔧 Configuração do Backend

1. **Entre na pasta do backend:**
   ```bash
   cd backend-auth
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na pasta `backend-auth` com:
   ```
   PORT=3001
   CORS_ORIGIN=http://localhost:5173
   
   PGHOST=localhost
   PGPORT=5432
   PGUSER=postgres
   PGPASSWORD=postgres (ou a senha que você cadastrou ao instalar o Postgre)
   PGDATABASE=ecoa
   
   JWT_SECRET=dev_secret_change_me
   ```

4. **Crie a tabela users no banco de dados ecoa do PostgreSQL:**
   ```bash
   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       email VARCHAR(255) UNIQUE NOT NULL,
       password_hash VARCHAR(255) NOT NULL,
       tipo VARCHAR(50) NOT NULL,
       dados_especificos JSONB,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```

5. **Inicie o servidor backend:**
   ```bash
   npm run dev
   ```
   
   ✅ **Backend API**: http://localhost:3001
   ✅ **Swagger docs**: http://localhost:3001/docs

## 🎨 Configuração do Frontend

1. **Volte para a pasta raiz do projeto:**
   ```bash
   cd ..
   ```

2. **Instale as dependências do frontend:**
   ```bash
   npm install
   ```

3. **Configure a URL da API (opcional):**
   Crie um arquivo `.env` na pasta raiz com:
   ```
   VITE_API_URL=http://localhost:3001
   ```

4. **Inicie o frontend:**
   ```bash
   npm run dev
   ```
   
   ✅ **Frontend**: http://localhost:5173

## 🧪 Testes de Funcionalidade

### 1. **Teste de Cadastro**
- Acesse http://localhost:5173
- Clique em "Cadastrar-se"
- Escolha um tipo (Empresa, Funcionário, Representante)
- Preencha os dados e cadastre
- ✅ **Esperado:** Mensagem de sucesso

### 2. **Teste de Login**
- Use as credenciais do usuário cadastrado
- Faça login
- ✅ **Esperado:** Redirecionamento para o dashboard

### 3. **Teste de Autenticação**
- Acesse "Minha Conta" no menu lateral
- ✅ **Esperado:** Dados do usuário carregados do backend

### 4. **Teste de Logout**
- Clique em "Sair" no menu lateral
- ✅ **Esperado:** Redirecionamento para login e token removido

### 5. **Teste de Proteção de Rotas**
- Tente acessar `/dashboard` sem estar logado
- ✅ **Esperado:** Redirecionamento para login
