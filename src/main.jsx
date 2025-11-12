import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// 1. Importar o Provedor
import { GoogleOAuthProvider } from '@react-oauth/google';

const CLIENT_ID = "COLOQUE_CLIENTE_ID_AQUI.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 3. Envolver o App com o Provedor */}
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)