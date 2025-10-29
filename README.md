# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


-___________________________________________________________________________________________________________________________________________-


# ECOA Dashboard - Squad 2

##  Visão Geral

O *ECOA Dashboard* desenvolvido pelo *Squad 2 da IntenseGP* 
é uma plataforma interativa e intuitiva voltada para a gestão 
e visualização de indicadores ESG (Ambientais, Sociais e de Governança).
 O objetivo principal é fornecer ferramentas eficazes para empresas que
 buscam monitorar, analisar e reportar seu desempenho em sustentabilidade,
 alinhando-se às melhores práticas de governança corporativa.

##  Tecnologias Utilizadas

*Frontend*: React.js
*Backend*: Node.js
*Estilização*: CSS

##  Como Executar o Projeto Localmente

### 1. Clonar o Repositório

```bash
git clone https://github.com/IntenseGP-ESGTech/ECOA-Dashboard---Squad-2.git
cd ECOA-Dashboard---Squad-2
```

-___________________________________________________________________________________________________________________________________________-


# ECOA Backend Auth - Squad 2

Backend de autenticação em Node.js vanilla (sem frameworks) com PostgreSQL, JWT, Bcrypt e Swagger.

## Requisitos
- Node.js 18+
- PostgreSQL 13+

## Configuração
1. Copie as variáveis de ambiente (crie um arquivo `.env` na pasta `backend-auth`):
```bash
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
```bash
npm install
```

3. Crie a tabela no PostgreSQL:
```bash
psql -h localhost -U postgres -d ecoa -f sql/schema.sql
```

4. Inicie o servidor:
```bash
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
