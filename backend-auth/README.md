# ECOA Backend Auth

Backend de autenticação em Node.js vanilla (sem frameworks) com PostgreSQL, JWT, Bcrypt e Swagger.

## Requisitos
- Node.js 18+
- PostgreSQL 13+

## Configuração
1. Copie as variáveis de ambiente (crie um arquivo `.env` na pasta `backend-auth`):
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

2. Instale dependências:
```
npm install
```

3. Crie a tabela ecoa no PostgreSQL:
```
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

4. Inicie o servidor:
```
npm run dev
```

- **Backend API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/docs
- **Frontend**: http://localhost:5173

## Endpoints
- POST `/auth/register` { email, password, tipo, dadosEspecificos? }
- POST `/auth/login` { email, password }
- GET  `/auth/me` (Authorization: Bearer <token>)
- POST `/auth/logout` (Authorization: Bearer <token>)

## Integração com o Frontend (Vite)
No frontend, use `http://localhost:3001` como base URL.

## 🧪 Teste da Aplicação
Para testar a integração completa frontend + backend, consulte o arquivo **`TESTE_INTEGRACAO.md`** na raiz do projeto. Este arquivo contém um passo a passo detalhado para:

- Configurar e rodar o backend
- Configurar e rodar o frontend  
- Testar todas as funcionalidades (cadastro, login, logout, proteção de rotas)
- Troubleshooting e verificações

## Observações
- Logout invalida o token em memória (blacklist temporária)
- JWT expira em 1h
- Sem refresh tokens (escopo do requisito)




